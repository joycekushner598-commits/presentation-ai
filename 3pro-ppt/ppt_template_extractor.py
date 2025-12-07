"""
PPT 模板提取器

从 .pptx 文件中提取模板元素信息，并生成 TypeScript 模板配置。
支持 Canvas/Canva 导出的 PPT 文件。

使用方法：
    python ppt_template_extractor.py
"""

import os
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import json
import re


# EMU 到像素的转换
# 1 inch = 914400 EMUs
# 1 inch = 96 pixels (at 96 DPI)
def emu_to_pixels(emu: int) -> int:
    return round(emu / 914400 * 96)


def pt_to_pixels(pt: float) -> float:
    """Convert points to pixels (1 pt = 1.333... px at 96 DPI)"""
    return round(pt * 96 / 72)


def parse_srgb_color(color_str: str) -> str:
    """Parse sRGB color value"""
    return f"#{color_str}"


class PPTXTemplateExtractor:
    """从 PPTX 文件中提取模板信息"""
    
    NAMESPACES = {
        'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
        'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
        'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    }
    
    def __init__(self, pptx_path: str):
        self.pptx_path = pptx_path
        self.temp_dir = None
        self.elements = []
        self.slide_size = {'width': 0, 'height': 0}
        
    def extract(self) -> dict:
        """提取 PPT 模板信息"""
        # 创建临时解压目录
        extract_dir = Path(self.pptx_path).parent / f"{Path(self.pptx_path).stem}_extracted"
        
        # 解压 PPTX 文件
        with zipfile.ZipFile(self.pptx_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        self.temp_dir = extract_dir
        
        # 获取幻灯片尺寸
        self._parse_presentation_size()
        
        # 解析第一张幻灯片
        slide_path = extract_dir / 'ppt' / 'slides' / 'slide1.xml'
        if slide_path.exists():
            self._parse_slide(slide_path)
        
        # 获取媒体文件信息
        self._parse_media_relations(extract_dir / 'ppt' / 'slides' / '_rels' / 'slide1.xml.rels')
        
        return {
            'size': self.slide_size,
            'elements': self.elements,
        }
    
    def _parse_presentation_size(self):
        """解析演示文稿尺寸"""
        presentation_path = self.temp_dir / 'ppt' / 'presentation.xml'
        if not presentation_path.exists():
            # 默认使用 16:9 尺寸
            self.slide_size = {'width': 1920, 'height': 1080}
            return
            
        tree = ET.parse(presentation_path)
        root = tree.getroot()
        
        # 查找 sldSz (幻灯片尺寸)
        sld_sz = root.find('.//p:sldSz', self.NAMESPACES)
        if sld_sz is not None:
            cx = int(sld_sz.get('cx', 0))
            cy = int(sld_sz.get('cy', 0))
            self.slide_size = {
                'width': emu_to_pixels(cx),
                'height': emu_to_pixels(cy),
            }
        else:
            # 默认 1:1 方形
            self.slide_size = {'width': 1080, 'height': 1080}
    
    def _parse_slide(self, slide_path: Path):
        """解析幻灯片 XML"""
        tree = ET.parse(slide_path)
        root = tree.getroot()
        
        # 注册命名空间
        for prefix, uri in self.NAMESPACES.items():
            ET.register_namespace(prefix, uri)
        
        element_id = 1
        
        # 查找所有形状（sp）
        for sp in root.iter(f'{{{self.NAMESPACES["p"]}}}sp'):
            element = self._parse_shape(sp, element_id)
            if element:
                self.elements.append(element)
                element_id += 1
        
        # 查找所有图片（pic）
        for pic in root.iter(f'{{{self.NAMESPACES["p"]}}}pic'):
            element = self._parse_picture(pic, element_id)
            if element:
                self.elements.append(element)
                element_id += 1
        
        # 查找所有组（grpSp）中的形状
        for grp_sp in root.iter(f'{{{self.NAMESPACES["p"]}}}grpSp'):
            grp_elements = self._parse_group(grp_sp, element_id)
            for elem in grp_elements:
                self.elements.append(elem)
                element_id += 1
    
    def _parse_shape(self, sp, element_id: int) -> dict | None:
        """解析单个形状"""
        # 获取形状名称
        nvSpPr = sp.find(f'.//{{{self.NAMESPACES["p"]}}}nvSpPr', self.NAMESPACES)
        name = ""
        if nvSpPr is not None:
            cNvPr = nvSpPr.find(f'.//{{{self.NAMESPACES["p"]}}}cNvPr', self.NAMESPACES)
            if cNvPr is not None:
                name = cNvPr.get('name', '')
        
        # 获取变换信息（位置和大小）
        xfrm = sp.find(f'.//{{{self.NAMESPACES["a"]}}}xfrm')
        if xfrm is None:
            return None
            
        off = xfrm.find(f'{{{self.NAMESPACES["a"]}}}off')
        ext = xfrm.find(f'{{{self.NAMESPACES["a"]}}}ext')
        
        if off is None or ext is None:
            return None
        
        x = emu_to_pixels(int(off.get('x', 0)))
        y = emu_to_pixels(int(off.get('y', 0)))
        width = emu_to_pixels(int(ext.get('cx', 0)))
        height = emu_to_pixels(int(ext.get('cy', 0)))
        
        # 检查是否为文本框
        txBody = sp.find(f'.//{{{self.NAMESPACES["p"]}}}txBody')
        if txBody is not None:
            return self._parse_text_box(sp, txBody, element_id, name, x, y, width, height)
        
        # 检查填充类型
        spPr = sp.find(f'.//{{{self.NAMESPACES["p"]}}}spPr')
        if spPr is not None:
            # 检查是否有图片填充
            blipFill = spPr.find(f'.//{{{self.NAMESPACES["a"]}}}blipFill')
            if blipFill is not None:
                return self._create_image_element(element_id, name, x, y, width, height, blipFill)
            
            # 检查是否有纯色填充
            solidFill = spPr.find(f'.//{{{self.NAMESPACES["a"]}}}solidFill')
            if solidFill is not None:
                return self._create_background_element(element_id, name, x, y, width, height, solidFill)
        
        return None
    
    def _parse_text_box(self, sp, txBody, element_id: int, name: str,
                        x: int, y: int, width: int, height: int) -> dict:
        """解析文本框"""
        text_content = ""
        font_size = 18
        color = "#000000"
        font_family = "Arial"
        text_align = "left"
        
        # 获取文本内容
        for r in txBody.iter(f'{{{self.NAMESPACES["a"]}}}r'):
            t = r.find(f'{{{self.NAMESPACES["a"]}}}t')
            if t is not None and t.text:
                text_content += t.text
            
            # 获取文本属性
            rPr = r.find(f'{{{self.NAMESPACES["a"]}}}rPr')
            if rPr is not None:
                sz = rPr.get('sz')
                if sz:
                    font_size = int(sz) // 100  # PowerPoint 使用百分之一点
                
                # 获取颜色
                solid_fill = rPr.find(f'.//{{{self.NAMESPACES["a"]}}}srgbClr')
                if solid_fill is not None:
                    color = f"#{solid_fill.get('val', '000000')}"
                
                # 获取字体
                latin = rPr.find(f'{{{self.NAMESPACES["a"]}}}latin')
                if latin is not None:
                    font_family = latin.get('typeface', 'Arial')
        
        # 获取段落对齐
        for p in txBody.iter(f'{{{self.NAMESPACES["a"]}}}p'):
            pPr = p.find(f'{{{self.NAMESPACES["a"]}}}pPr')
            if pPr is not None:
                algn = pPr.get('algn')
                if algn:
                    text_align = {'ctr': 'center', 'r': 'right', 'l': 'left'}.get(algn, 'left')
        
        # 推断 slot 名称
        slot = self._infer_slot_name(name, text_content)
        
        return {
            'id': f'text-{element_id}',
            'type': 'text',
            'slot': slot,
            'position': {'x': x, 'y': y},
            'size': {'width': width, 'height': height},
            'style': {
                'fontSize': font_size,
                'fontFamily': font_family,
                'color': color,
                'textAlign': text_align,
                'zIndex': element_id,
            },
            'constraints': {
                'maxChars': max(len(text_content) * 2, 50),
                'overflowStrategy': 'auto-scale',
            },
            'exampleContent': text_content[:100] if text_content else 'Example text',
        }
    
    def _create_image_element(self, element_id: int, name: str,
                              x: int, y: int, width: int, height: int,
                              blipFill) -> dict:
        """创建图片元素"""
        # 检查是否为圆形（通过检查边界是否为正方形）
        is_circular = abs(width - height) < 10
        
        slot = self._infer_image_slot(name, x, y, width, height)
        
        element = {
            'id': f'image-{element_id}',
            'type': 'image' if width < self.slide_size['width'] * 0.9 else 'background',
            'slot': slot,
            'position': {'x': x, 'y': y},
            'size': {'width': width, 'height': height},
            'style': {
                'objectFit': 'cover',
                'zIndex': element_id,
            },
            'optional': False,
        }
        
        if is_circular:
            element['style']['borderRadius'] = width // 2
        
        return element
    
    def _create_background_element(self, element_id: int, name: str,
                                   x: int, y: int, width: int, height: int,
                                   solidFill) -> dict:
        """创建背景/装饰元素"""
        color = "#FFFFFF"
        alpha = 100
        
        srgbClr = solidFill.find(f'{{{self.NAMESPACES["a"]}}}srgbClr')
        if srgbClr is not None:
            color = f"#{srgbClr.get('val', 'FFFFFF')}"
            alpha_elem = srgbClr.find(f'{{{self.NAMESPACES["a"]}}}alpha')
            if alpha_elem is not None:
                alpha = int(int(alpha_elem.get('val', '100000')) / 1000)
        
        # 转换为 rgba
        if alpha < 100:
            r = int(color[1:3], 16)
            g = int(color[3:5], 16)
            b = int(color[5:7], 16)
            color = f"rgba({r}, {g}, {b}, {alpha / 100:.2f})"
        
        return {
            'id': f'bg-{element_id}',
            'type': 'background',
            'slot': f'decoration-{element_id}',
            'position': {'x': x, 'y': y},
            'size': {'width': width, 'height': height},
            'style': {
                'backgroundColor': color,
                'zIndex': element_id,
            },
            'optional': False,
        }
    
    def _parse_picture(self, pic, element_id: int) -> dict | None:
        """解析图片元素"""
        xfrm = pic.find(f'.//{{{self.NAMESPACES["a"]}}}xfrm')
        if xfrm is None:
            return None
            
        off = xfrm.find(f'{{{self.NAMESPACES["a"]}}}off')
        ext = xfrm.find(f'{{{self.NAMESPACES["a"]}}}ext')
        
        if off is None or ext is None:
            return None
        
        x = emu_to_pixels(int(off.get('x', 0)))
        y = emu_to_pixels(int(off.get('y', 0)))
        width = emu_to_pixels(int(ext.get('cx', 0)))
        height = emu_to_pixels(int(ext.get('cy', 0)))
        
        slot = self._infer_image_slot('picture', x, y, width, height)
        
        return {
            'id': f'pic-{element_id}',
            'type': 'image',
            'slot': slot,
            'position': {'x': x, 'y': y},
            'size': {'width': width, 'height': height},
            'style': {
                'objectFit': 'cover',
                'zIndex': element_id,
            },
            'optional': False,
        }
    
    def _parse_group(self, grp_sp, start_id: int) -> list:
        """解析组内的形状"""
        elements = []
        
        # 获取组的变换
        grp_xfrm = grp_sp.find(f'.//{{{self.NAMESPACES["a"]}}}xfrm')
        grp_offset_x = 0
        grp_offset_y = 0
        
        if grp_xfrm is not None:
            off = grp_xfrm.find(f'{{{self.NAMESPACES["a"]}}}off')
            if off is not None:
                grp_offset_x = emu_to_pixels(int(off.get('x', 0)))
                grp_offset_y = emu_to_pixels(int(off.get('y', 0)))
        
        element_id = start_id
        
        # 解析组内的形状
        for sp in grp_sp.findall(f'{{{self.NAMESPACES["p"]}}}sp'):
            element = self._parse_shape(sp, element_id)
            if element:
                elements.append(element)
                element_id += 1
        
        return elements
    
    def _parse_media_relations(self, rels_path: Path):
        """解析媒体关系文件"""
        if not rels_path.exists():
            return
            
        tree = ET.parse(rels_path)
        root = tree.getroot()
        
        # 可以用于获取图片文件名等信息
        pass
    
    def _infer_slot_name(self, name: str, content: str) -> str:
        """推断文本框的 slot 名称"""
        name_lower = name.lower()
        content_lower = content.lower()
        
        # 根据常见模式推断
        if 'title' in name_lower or len(content) < 30:
            if 'review' in content_lower:
                return 'title'
        
        if '@' in content or 'site' in content_lower:
            return 'social'
        
        if '⭐' in content or 'star' in name_lower:
            return 'rating'
        
        if '"' in content or len(content) > 50:
            return 'review'
        
        return f'text-{name.replace(" ", "-").lower()}'
    
    def _infer_image_slot(self, name: str, x: int, y: int, 
                          width: int, height: int) -> str:
        """推断图片的 slot 名称"""
        # 全屏图片 -> 背景
        if width >= self.slide_size['width'] * 0.9 and height >= self.slide_size['height'] * 0.9:
            return 'background-image'
        
        # 小的正方形/圆形图片 -> 头像
        if abs(width - height) < 20 and width < 200:
            return 'avatar-image'
        
        # 其他
        return 'main-image'
    
    def generate_typescript(self, template_id: str, template_name: str) -> str:
        """生成 TypeScript 模板代码"""
        data = self.extract()
        
        elements_code = []
        for elem in data['elements']:
            elem_code = self._element_to_typescript(elem)
            elements_code.append(elem_code)
        
        code = f'''/**
 * {template_name}
 * 
 * 自动从 {Path(self.pptx_path).name} 提取生成
 * 
 * 画布尺寸: {data['size']['width']} × {data['size']['height']} px
 */

import {{ type SlideTemplate, type TemplateElement }} from "./testimonial-template";

export const {template_id.replace('-', '_')}Template: SlideTemplate = {{
    id: '{template_id}',
    name: '{template_name}',
    description: '从 Canvas 设计自动提取的模板',
    category: 'testimonial',
    size: {{
        width: {data['size']['width']},
        height: {data['size']['height']},
    }},

    elements: [
{chr(10).join(elements_code)}
    ],

    // AI 生成提示
    aiPromptHints: [
        '使用 <TEMPLATE template="{template_id}"> 标签来生成幻灯片',
        '填充所有 slot 对应的内容',
    ],
}};

export default {template_id.replace('-', '_')}Template;
'''
        return code
    
    def _element_to_typescript(self, elem: dict) -> str:
        """将元素转换为 TypeScript 代码"""
        indent = "        "
        
        style_items = []
        for key, value in elem.get('style', {}).items():
            if isinstance(value, str):
                style_items.append(f"{key}: '{value}'")
            else:
                style_items.append(f"{key}: {value}")
        
        constraints_code = ""
        if 'constraints' in elem:
            cons = elem['constraints']
            cons_items = []
            for key, value in cons.items():
                if isinstance(value, str):
                    cons_items.append(f"{key}: '{value}'")
                else:
                    cons_items.append(f"{key}: {value}")
            constraints_code = f"\n{indent}    constraints: {{ {', '.join(cons_items)} }},"
        
        example_code = ""
        if 'exampleContent' in elem:
            example_code = f"\n{indent}    exampleContent: '{elem['exampleContent']}',"
        
        return f'''{indent}{{
{indent}    id: '{elem['id']}',
{indent}    type: '{elem['type']}',
{indent}    slot: '{elem['slot']}',
{indent}    position: {{ x: {elem['position']['x']}, y: {elem['position']['y']} }},
{indent}    size: {{ width: {elem['size']['width']}, height: {elem['size']['height']} }},
{indent}    style: {{ {', '.join(style_items)} }},{constraints_code}{example_code}
{indent}    optional: {str(elem.get('optional', False)).lower()},
{indent}}},'''


def main():
    """主函数：提取所有 PPT 模板"""
    ppt_dir = Path(__file__).parent / 'ppt from canvas'
    output_dir = Path(__file__).parent / 'extracted_templates'
    output_dir.mkdir(exist_ok=True)
    
    ppt_files = list(ppt_dir.glob('*.pptx'))
    
    print(f"找到 {len(ppt_files)} 个 PPT 文件")
    print("=" * 50)
    
    all_templates = []
    
    for i, ppt_file in enumerate(ppt_files, 1):
        print(f"\n处理 [{i}/{len(ppt_files)}]: {ppt_file.name}")
        
        try:
            extractor = PPTXTemplateExtractor(str(ppt_file))
            data = extractor.extract()
            
            print(f"  画布尺寸: {data['size']['width']} × {data['size']['height']}")
            print(f"  发现元素: {len(data['elements'])} 个")
            
            # 生成模板 ID
            template_id = f"canvas-template-{i}"
            template_name = f"Canvas 模板 {i}"
            
            # 生成 TypeScript 代码
            ts_code = extractor.generate_typescript(template_id, template_name)
            
            # 保存 TypeScript 文件
            ts_output = output_dir / f"canvas-template-{i}.ts"
            with open(ts_output, 'w', encoding='utf-8') as f:
                f.write(ts_code)
            
            print(f"  ✅ 已保存: {ts_output.name}")
            
            # 保存 JSON 数据（用于调试）
            json_output = output_dir / f"canvas-template-{i}.json"
            with open(json_output, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            all_templates.append({
                'id': template_id,
                'file': ts_output.name,
                'source': ppt_file.name,
            })
            
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            import traceback
            traceback.print_exc()
    
    # 生成索引文件
    print("\n" + "=" * 50)
    print("生成模板索引...")
    
    index_code = '''/**
 * Canvas 模板索引
 * 自动生成
 */

'''
    
    for tmpl in all_templates:
        var_name = tmpl['id'].replace('-', '_')
        index_code += f"import {{ {var_name}Template }} from './{tmpl['file'].replace('.ts', '')}';\n"
    
    index_code += "\n\nexport const canvasTemplates = {\n"
    for tmpl in all_templates:
        var_name = tmpl['id'].replace('-', '_')
        index_code += f"    '{tmpl['id']}': {var_name}Template,\n"
    index_code += "};\n\n"
    
    index_code += "export const canvasTemplateList = Object.values(canvasTemplates);\n"
    
    index_output = output_dir / 'index.ts'
    with open(index_output, 'w', encoding='utf-8') as f:
        f.write(index_code)
    
    print(f"✅ 已生成索引: {index_output}")
    print(f"\n完成！共提取 {len(all_templates)} 个模板")


if __name__ == '__main__':
    main()
