/**
 * 使用已合成的网红+产品图生成一个 PPT
 */

import fs from 'fs';
import path from 'path';
import PptxGenJS from 'pptxgenjs';

// 路径
const BASE_PATH = path.join(process.cwd(), '3pro-ppt');
const OUTPUT_DIR = path.join(BASE_PATH, 'output', 'test-composite');
const TEMPLATE_BG = path.join(BASE_PATH, 'templates', 'bg-template-3.jpeg');
const COMPOSITE_IMAGE = path.join(OUTPUT_DIR, 'influencer_with_product.png');

function pixelToInch(px: number): number {
    return px / 96;
}

function loadImageAsDataUri(filePath: string): string | null {
    try {
        if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            const base64 = buffer.toString('base64');
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
            return `data:${mimeType};base64,${base64}`;
        }
    } catch (e) {
        console.error(`Failed to load: ${filePath}`);
    }
    return null;
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║    Generate PPT with Influencer + Product Composite        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // PPT 尺寸: 1080x1920 竖屏
    const width = 1080;
    const height = 1920;
    const widthInches = pixelToInch(width);
    const heightInches = pixelToInch(height);

    console.log(`📐 PPT Size: ${width}×${height} (vertical)`);

    const PptxGen = (PptxGenJS as any).default || PptxGenJS;
    const pptx = new PptxGen();

    // 设置自定义尺寸
    pptx.defineLayout({ name: 'VERTICAL', width: widthInches, height: heightInches });
    pptx.layout = 'VERTICAL';

    const slide = pptx.addSlide();

    // 1. 添加背景
    const bgData = loadImageAsDataUri(TEMPLATE_BG);
    if (bgData) {
        slide.addImage({
            data: bgData,
            x: 0, y: 0,
            w: widthInches, h: heightInches,
            sizing: { type: 'cover', w: widthInches, h: heightInches },
        });
        console.log('✅ Background added');
    }

    // 2. 添加合成图片（网红+产品）
    const compositeData = loadImageAsDataUri(COMPOSITE_IMAGE);
    if (compositeData) {
        // 图片放在中间区域
        const imgX = pixelToInch(86);
        const imgY = pixelToInch(500);
        const imgW = pixelToInch(908);
        const imgH = pixelToInch(600);

        slide.addImage({
            data: compositeData,
            x: imgX, y: imgY,
            w: imgW, h: imgH,
            sizing: { type: 'cover', w: imgW, h: imgH },
        });
        console.log('✅ Influencer + Product composite image added');
    } else {
        console.log('❌ Composite image not found');
    }

    // 3. 添加标题
    slide.addText('PRODUCT REVIEW', {
        x: pixelToInch(152),
        y: pixelToInch(261),
        w: pixelToInch(777),
        h: pixelToInch(200),
        fontSize: 68,
        fontFace: 'Georgia',
        bold: true,
        color: '000000',
        align: 'center',
        valign: 'middle',
    });
    console.log('✅ Title added');

    // 4. 添加评分
    slide.addText('⭐⭐⭐⭐⭐', {
        x: pixelToInch(340),
        y: pixelToInch(1180),
        w: pixelToInch(400),
        h: pixelToInch(60),
        fontSize: 30,
        color: 'FFD700',
        align: 'center',
        valign: 'middle',
    });
    console.log('✅ Rating added');

    // 5. 添加评价
    slide.addText('"This necklace is absolutely stunning! The quality exceeded my expectations."', {
        x: pixelToInch(180),
        y: pixelToInch(1280),
        w: pixelToInch(720),
        h: pixelToInch(200),
        fontSize: 24,
        fontFace: 'Georgia',
        italic: true,
        color: '000000',
        align: 'center',
        valign: 'middle',
        wrap: true,
    });
    console.log('✅ Review added');

    // 6. 添加 CTA（英文）
    slide.addText('Shop Now →', {
        x: pixelToInch(300),
        y: pixelToInch(1550),
        w: pixelToInch(480),
        h: pixelToInch(60),
        fontSize: 28,
        color: '0066CC',
        align: 'center',
        valign: 'middle',
    });
    console.log('✅ CTA added');

    // 保存
    const outputPath = path.join(OUTPUT_DIR, 'influencer_product_ppt.pptx');
    await pptx.writeFile({ fileName: outputPath });

    console.log(`\n✅ PPT saved to: ${outputPath}`);
    console.log('📂 Open this file to see the result!');
}

main().catch(console.error);
