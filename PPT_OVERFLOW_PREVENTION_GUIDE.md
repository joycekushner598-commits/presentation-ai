# 📝 PPT内容溢出防止机制完整指南

> **用途**：本文档归纳了程序如何防止PPT生成时文字和图片溢出的机制，供新AI开发类似程序时参考。

---

## 🎯 核心问题：为什么PPT内容会溢出？

在生成PPT时，内容溢出的主要原因是：
1. **文字长度不可预测** - AI生成的文字长度不固定
2. **固定位置布局** - 精确定位的元素容易超出边界
3. **图片尺寸不匹配** - 原始图片尺寸与容器尺寸不一致

---

## ✅ 解决方案架构（三层防护）

```
┌─────────────────────────────────────────────────────────────┐
│                    第一层：AI生成约束                         │
│  (通过 constraints 配置限制AI生成的内容长度)                   │
├─────────────────────────────────────────────────────────────┤
│                    第二层：前端渲染保护                        │
│  (CSS overflow:hidden + 行数限制 + 自动缩放)                  │
├─────────────────────────────────────────────────────────────┤
│                    第三层：PPT导出兜底                        │
│  (fit:shrink + sizing:cover + wrap:true)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 第一层：AI生成内容约束

### 1.1 模板元素约束配置

在模板定义中，每个元素都可以设置 `constraints` 来约束内容：

```typescript
interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'background';
  slot: string;
  position: { x: number; y: number };
  size: { width: number | 'auto'; height: number | 'auto' };
  
  // ⭐ 关键：溢出约束配置
  constraints?: {
    maxChars?: number;           // 最大字符数
    maxLines?: number;           // 最大行数
    overflowStrategy?: 
      | 'auto-scale'   // 自动缩小字体
      | 'truncate'     // 截断并加省略号
      | 'strict';      // 严格限制，AI必须遵守
  };
  
  style: { /* ... */ };
}
```

### 1.2 约束策略说明

| 策略 | 描述 | 适用场景 |
|------|------|----------|
| `strict` | 严格限制，AI生成时必须遵守字符限制 | 星级评分、数字标签 |
| `auto-scale` | 内容过长时自动缩小字体 | 评价内容、标题 |
| `truncate` | 超出部分截断并添加省略号 | 描述文字、备注 |

### 1.3 实际模板示例

```typescript
// 星级评分 - 使用 strict 策略
{
  id: 'star-rating',
  type: 'text',
  slot: 'rating',
  position: { x: 531, y: 460 },
  size: { width: 300, height: 50 },
  constraints: {
    maxChars: 5,           // 最多5个字符（如 ⭐⭐⭐⭐⭐）
    overflowStrategy: 'strict',
  },
}

// 评价内容 - 使用 auto-scale 策略
{
  id: 'review-text',
  type: 'text',
  slot: 'review',
  position: { x: 445, y: 533 },
  size: { width: 499, height: 128 },
  constraints: {
    maxChars: 200,         // 最多200字符
    maxLines: 4,           // 最多4行
    overflowStrategy: 'auto-scale',
  },
}
```

### 1.4 AI提示词集成

在模板中添加 `aiPromptHints` 告诉AI如何生成内容：

```typescript
aiPromptHints: [
  '评价内容要简洁有力，不超过200字符',
  '星级评分用数字1-5表示',
  '客户姓名限制在20字符以内',
]
```

---

## 🎨 第二层：前端渲染保护

### 2.1 CSS 容器溢出控制

```tsx
// 固定容器 + 隐藏溢出
<div style={{
  position: "relative",
  width: template.size.width,
  height: template.size.height,
  overflow: "hidden",  // ⭐ 关键：隐藏所有溢出内容
}}>
```

### 2.2 文本行数限制（CSS Line Clamp）

```tsx
// 使用 WebkitLineClamp 限制显示行数
<span style={{
  display: "-webkit-box",
  WebkitLineClamp: constraints?.maxLines ?? 10,  // 限制最大行数
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",  // 超出显示省略号
}}>
  {textContent}
</span>
```

### 2.3 图片自适应（Object Fit）

```tsx
// 图片自动裁剪/适应容器
<Image
  src={imageUrl}
  alt={slot}
  fill  // 填满容器
  style={{
    objectFit: 'cover',  // 等比缩放裁剪
    // 其他选项：'contain'(等比缩放显示全部), 'fill'(拉伸填满)
  }}
/>
```

### 2.4 弹性布局（Flex Layout）

```tsx
// 使用 Flex 布局自动调整内容分布
<div className={cn(
  "flex min-h-[500px]",  // 固定最小高度
  "flex-col",            // 垂直布局
  "justify-center",      // 内容垂直居中
  "overflow-hidden",     // 隐藏溢出
)}>
```

---

## 📤 第三层：PPT导出兜底

### 3.1 PptxGenJS 文本适应参数

```typescript
// 添加文本时使用 fit 和 wrap 参数
this.currentSlide.addText(textContent, {
  x: pptX,
  y: pptY,
  w: pptW,
  h: pptH,
  
  // ⭐ 防止溢出的关键参数
  wrap: true,           // 启用自动换行
  fit: "shrink",        // 文字过长时自动缩小字体
  
  // 或使用 "resize" 调整框大小适应文字
  // fit: "resize",
  
  valign: "top",        // 垂直对齐
  align: "left",        // 水平对齐
  margin: 0,
});
```

### 3.2 fit 参数说明

| 值 | 行为 | 适用场景 |
|----|----|---------|
| `"shrink"` | 自动缩小字体以适应容器 | 推荐大多数场景 |
| `"resize"` | 调整容器大小以适应文字 | 高度可变的元素 |
| `"none"` | 不做任何调整 | 已确保内容不会溢出时 |

### 3.3 图片尺寸控制

```typescript
// 添加图片时使用 sizing 参数
this.currentSlide.addImage({
  data: resolvedPath,
  x: pptX,
  y: pptY,
  w: pptW,
  h: pptH,
  
  // ⭐ 图片适应策略
  sizing: {
    type: "cover",    // 填满容器并裁剪
    w: pptW,
    h: pptH,
  },
});
```

### 3.4 sizing.type 选项

| 类型 | 描述 | 效果 |
|------|------|------|
| `"cover"` | 等比缩放填满容器，裁剪超出部分 | 无空白、可能裁剪 |
| `"contain"` | 等比缩放完全显示在容器内 | 完整显示、可能有空白 |
| `"crop"` | 从指定位置裁剪 | 精确控制显示区域 |

### 3.5 字体大小缩放逻辑

```typescript
// 计算字体大小时进行范围限制
const baseFontSize = style.fontSize || 14;
const scale = Math.min(
  this.SLIDE_WIDTH / template.size.width,
  this.SLIDE_HEIGHT / template.size.height
);

// 计算实际字体大小 (px -> pt 转换)
const fontSize = Math.round(baseFontSize * scale * 72);

// ⭐ 限制字体大小范围，防止过大或过小
const safeFontSize = Math.max(8, Math.min(fontSize, 72));
```

---

## 🔧 完整实现示例

### 模板定义

```typescript
export const myTemplate: SlideTemplate = {
  id: 'my-template',
  name: '我的模板',
  size: { width: 1080, height: 1080 },
  
  elements: [
    // 背景图片 - 使用 cover 填满
    {
      id: 'background',
      type: 'background',
      slot: 'bg-image',
      position: { x: 0, y: 0 },
      size: { width: 1080, height: 1080 },
      style: {
        objectFit: 'cover',
        zIndex: 0,
      },
    },
    
    // 标题文字 - 使用 auto-scale 防止溢出
    {
      id: 'title',
      type: 'text',
      slot: 'title',
      position: { x: 100, y: 100 },
      size: { width: 880, height: 80 },
      style: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        zIndex: 2,
      },
      constraints: {
        maxChars: 30,
        maxLines: 2,
        overflowStrategy: 'auto-scale',
      },
    },
    
    // 正文内容 - 严格限制字符数
    {
      id: 'content',
      type: 'text',
      slot: 'body',
      position: { x: 100, y: 200 },
      size: { width: 880, height: 300 },
      style: {
        fontSize: 24,
        lineHeight: 1.5,
        color: '#333333',
        zIndex: 2,
      },
      constraints: {
        maxChars: 200,
        maxLines: 6,
        overflowStrategy: 'auto-scale',
      },
    },
  ],
  
  aiPromptHints: [
    '标题不超过30字符',
    '正文内容不超过200字符',
  ],
};
```

### 前端渲染器

```tsx
function TemplateRenderer({ template, content, images }) {
  return (
    <div style={{
      position: 'relative',
      width: template.size.width,
      height: template.size.height,
      overflow: 'hidden',  // ⭐ 容器级溢出保护
    }}>
      {template.elements.map(element => {
        if (element.type === 'text') {
          const { constraints } = element;
          return (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                fontSize: element.style.fontSize,
                overflow: 'hidden',  // ⭐ 元素级溢出保护
              }}
            >
              <span style={{
                display: '-webkit-box',
                WebkitLineClamp: constraints?.maxLines ?? 10,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {content[element.slot]}
              </span>
            </div>
          );
        }
        
        if (element.type === 'image') {
          return (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                overflow: 'hidden',  // ⭐ 图片容器溢出保护
              }}
            >
              <img
                src={images[element.slot]}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: element.style.objectFit || 'cover',
                }}
              />
            </div>
          );
        }
      })}
    </div>
  );
}
```

### PPT导出器

```typescript
function exportToPPT(template, content, images) {
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();
  
  for (const element of template.elements) {
    const pptX = element.position.x / template.size.width * 10;  // 转换为inches
    const pptY = element.position.y / template.size.height * 5.625;
    const pptW = element.size.width / template.size.width * 10;
    const pptH = element.size.height / template.size.height * 5.625;
    
    if (element.type === 'text') {
      slide.addText(content[element.slot], {
        x: pptX,
        y: pptY,
        w: pptW,
        h: pptH,
        fontSize: calculateFontSize(element.style.fontSize),
        wrap: true,        // ⭐ 自动换行
        fit: 'shrink',     // ⭐ 自动缩小
        valign: 'top',
      });
    }
    
    if (element.type === 'image') {
      slide.addImage({
        path: images[element.slot],
        x: pptX,
        y: pptY,
        w: pptW,
        h: pptH,
        sizing: { type: 'cover', w: pptW, h: pptH },  // ⭐ 图片填满
      });
    }
  }
  
  return pptx;
}
```

---

## 📊 总结：防溢出检查清单

### AI开发新程序时，确保实现以下功能：

- [ ] **模板层**：每个元素定义 `constraints`（maxChars, maxLines, overflowStrategy）
- [ ] **AI提示层**：在 prompt 中告知AI内容长度限制
- [ ] **前端渲染层**：
  - [ ] 容器设置 `overflow: hidden`
  - [ ] 文本使用 `WebkitLineClamp` 限制行数
  - [ ] 文本使用 `textOverflow: ellipsis` 显示省略号
  - [ ] 图片使用 `objectFit: cover/contain` 适应容器
- [ ] **PPT导出层**：
  - [ ] 文本使用 `wrap: true` 自动换行
  - [ ] 文本使用 `fit: shrink` 自动缩小
  - [ ] 图片使用 `sizing: { type: 'cover' }` 填满容器
  - [ ] 字体大小限制在合理范围内 `Math.max(8, Math.min(fontSize, 72))`

---

## 🔗 相关文件参考

- 模板定义：`src/lib/presentation/templates/*.ts`
- 前端渲染：`src/components/presentation/template/TemplateRenderer.tsx`
- PPT导出：`src/components/presentation/utils/exportToPPT.ts`

---

> **注意**：本文档基于现有系统的实际实现编写，包含完整的代码示例和配置说明。新AI可以直接参考这些模式来实现类似功能。

---

## 🎨 第四部分：PPT模板制作流程

### 从PPT设计到TypeScript模板的完整转换流程

```
┌─────────────────────────────────────────────────────────────┐
│  步骤1：设计稿准备                                           │
│  (Canvas/Figma/PPT 中设计好模板)                             │
├─────────────────────────────────────────────────────────────┤
│  步骤2：提取设计信息                                          │
│  (导出截图/HTML 或手动标注位置尺寸)                           │
├─────────────────────────────────────────────────────────────┤
│  步骤3：AI生成HTML模板                                       │
│  (使用提示词让AI分析截图生成HTML代码)                         │
├─────────────────────────────────────────────────────────────┤
│  步骤4：转换为TypeScript配置                                 │
│  (将HTML结构转换为TemplateElement数组)                       │
├─────────────────────────────────────────────────────────────┤
│  步骤5：添加约束和AI提示                                     │
│  (配置maxChars, overflowStrategy, aiPromptHints)            │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.1 步骤1：设计稿准备

#### 在设计工具中创建模板

```
推荐画布尺寸：
- 16:9 横版：1280 × 720 px 或 1920 × 1080 px
- 1:1 方形：1080 × 1080 px (适合社交媒体)
```

#### 设计时标注关键信息

设计完成后，记录以下信息：

```json
{
  "模板名称": "产品评价模板",
  "画布尺寸": "1080 × 1080",
  "元素列表": [
    {
      "名称": "背景图片",
      "位置": "(0, 0)",
      "尺寸": "1080 × 1080",
      "类型": "image"
    },
    {
      "名称": "标题",
      "位置": "水平居中，距顶部 100px",
      "尺寸": "800 × 80",
      "字体": "48px 粗体",
      "颜色": "#FFFFFF"
    },
    {
      "名称": "评价内容",
      "位置": "(100, 300)",
      "尺寸": "880 × 200",
      "字体": "24px",
      "最大字符数": 200
    }
  ]
}
```

---

### 4.2 步骤2：AI生成HTML模板

#### 给AI的提示词模板

将以下提示词复制给AI（如Claude/ChatGPT），附带设计稿截图：

```
我需要你根据这个 PPT 设计截图，生成一个 HTML 模板代码。

【要求】
1. 容器尺寸：1280px × 720px（或根据实际尺寸调整）
2. 使用绝对定位（position: absolute）精确还原所有元素的位置
3. 为所有可变内容添加 data-ai-slot 属性标记
4. 为所有文字框添加 data-max-chars 约束
5. 为所有图片框添加 data-image-query 搜索关键词
6. 使用内联样式（style=""）定义所有样式
7. 包含示例内容（不要留空）

【元素类型标记】
文字元素使用：
- data-ai-slot="title" - 主标题
- data-ai-slot="content" - 正文段落
- data-ai-slot="meta" - 元信息（作者、日期）
- data-ai-slot="statistic" - 数字/评分
- data-ai-slot="quote" - 引用内容

图片元素使用：
- data-ai-slot="main-image" - 主图片
- data-ai-slot="background-image" - 背景图
- data-ai-slot="avatar-image" - 头像

【输出格式】
<div style="width: 1280px; height: 720px; position: relative; background: #FFFFFF;">
  <div 
    data-ai-slot="title"
    data-max-chars="30"
    style="position: absolute; top: 100px; left: 100px; width: 600px; 
           font-size: 36px; font-weight: bold; color: #1F2937;"
  >
    示例标题文字
  </div>
  <!-- 更多元素... -->
</div>

现在请分析这个截图并生成 HTML 代码。
```

---

### 4.3 步骤3：从HTML转换为TypeScript配置

#### AI生成的HTML示例

```html
<div style="width: 1080px; height: 1080px; position: relative;">
  <!-- 背景图片 -->
  <div 
    data-ai-slot="background-image"
    data-image-query="woman using phone lifestyle"
    style="position: absolute; top: 0; left: 0; width: 1080px; height: 1080px;"
  ></div>
  
  <!-- 白色卡片 -->
  <div style="position: absolute; top: 409px; left: 418px; width: 594px; height: 298px; 
              background: rgba(255,255,255,0.86); border-radius: 13px;"></div>
  
  <!-- 头像 -->
  <div 
    data-ai-slot="avatar-image"
    data-image-query="professional woman portrait"
    style="position: absolute; top: 295px; left: 621px; width: 148px; height: 148px;
           border-radius: 50%; overflow: hidden;"
  ></div>
  
  <!-- 评价内容 -->
  <div 
    data-ai-slot="content"
    data-max-chars="200"
    style="position: absolute; top: 533px; left: 445px; width: 499px; height: 128px;
           font-size: 24px; font-family: Georgia, serif; color: #000000; text-align: center;"
  >
    Lorem ipsum dolor sit amet...
  </div>
</div>
```

#### 转换为TypeScript模板配置

```typescript
import { type SlideTemplate, type TemplateElement } from "./testimonial-template";

// 单位转换说明：
// 如果PPT使用EMU单位，需要转换为像素：
// 1 inch = 914400 EMUs
// 1 inch = 96 pixels (at 96 DPI)
// 公式：pixels = EMU / 914400 * 96

export const productReviewTemplate: SlideTemplate = {
  id: 'product-review-square',
  name: '产品评价方形模板',
  description: '正方形设计，适合社交媒体分享',
  category: 'testimonial',
  
  // 画布尺寸（像素）
  size: {
    width: 1080,
    height: 1080,
  },

  elements: [
    // 1. 背景图片 - 从 HTML 的 data-ai-slot="background-image" 提取
    {
      id: 'background',
      type: 'background',
      slot: 'background-image',        // 对应 AI 生成时的 slot 名称
      position: { x: 0, y: 0 },         // 从 style 中的 top/left 提取
      size: { width: 1080, height: 1080 },  // 从 style 中的 width/height 提取
      style: {
        objectFit: 'cover',
        zIndex: 0,
      },
      imageQuery: 'woman using phone lifestyle modern',  // 从 data-image-query 提取
      imageStyle: 'photo',
      optional: false,
    },

    // 2. 白色卡片背景 - 纯装饰元素
    {
      id: 'content-card',
      type: 'background',
      slot: 'card-background',
      position: { x: 418, y: 409 },     // 从 top: 409px; left: 418px 提取
      size: { width: 594, height: 298 },
      style: {
        backgroundColor: 'rgba(255, 255, 255, 0.86)',  // 从 background 提取
        borderRadius: 13,                               // 从 border-radius 提取
        zIndex: 1,
      },
      optional: false,
    },

    // 3. 头像 - 从 data-ai-slot="avatar-image" 提取
    {
      id: 'avatar',
      type: 'image',
      slot: 'avatar-image',
      position: { x: 621, y: 295 },
      size: { width: 148, height: 148 },
      style: {
        objectFit: 'cover',
        borderRadius: 74,               // 圆形：borderRadius = width/2
        zIndex: 3,
      },
      imageQuery: 'professional woman portrait headshot',
      imageStyle: 'photo',
      optional: false,
    },

    // 4. 评价内容 - 从 data-ai-slot="content" 提取
    {
      id: 'review-text',
      type: 'text',
      slot: 'review',                   // 可以重命名为更语义化的名称
      position: { x: 445, y: 533 },
      size: { width: 499, height: 128 },
      style: {
        fontSize: 24,                   // 从 font-size 提取
        fontFamily: 'Georgia, serif',   // 从 font-family 提取
        lineHeight: 1.4,
        color: '#000000',               // 从 color 提取
        textAlign: 'center',            // 从 text-align 提取
        zIndex: 2,
      },
      // ⭐ 关键：添加约束配置
      constraints: {
        maxChars: 200,                  // 从 data-max-chars 提取
        maxLines: 4,                    // 根据 height/fontSize 估算
        overflowStrategy: 'auto-scale', // 选择溢出策略
      },
      optional: false,
      exampleContent: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit."',
    },
  ],

  // AI 生成提示
  aiPromptHints: [
    '【重要】使用 <PRODUCT-REVIEW> 标签来生成幻灯片',
    '评价内容要简洁有力，不超过200字符',
    '头像图片应该是专业人像',
    '背景图片应该是生活场景',
  ],
};

export default productReviewTemplate;
```

---

### 4.4 字段映射对照表

| HTML属性/样式 | TypeScript字段 | 说明 |
|--------------|----------------|------|
| `data-ai-slot` | `slot` | AI填充内容的标识 |
| `data-max-chars` | `constraints.maxChars` | 最大字符数 |
| `data-image-query` | `imageQuery` | 图片搜索关键词 |
| `style="top: Xpx; left: Ypx"` | `position: { x, y }` | 元素位置 |
| `style="width: Wpx; height: Hpx"` | `size: { width, height }` | 元素尺寸 |
| `style="font-size: Npx"` | `style.fontSize` | 字体大小 |
| `style="color: #XXX"` | `style.color` | 文字颜色 |
| `style="background: #XXX"` | `style.backgroundColor` | 背景色 |
| `style="border-radius: Npx"` | `style.borderRadius` | 圆角 |
| `style="text-align: X"` | `style.textAlign` | 文本对齐 |

---

### 4.5 PPT单位转换（EMU到像素）

如果直接解析PPT文件（.pptx），需要进行单位转换：

```typescript
// PPT 使用 EMU (English Metric Units) 单位
// 1 inch = 914400 EMUs
// 1 inch = 96 pixels (at 96 DPI)

function emuToPixels(emu: number): number {
  return Math.round(emu / 914400 * 96);
}

// 示例：
// PPT中的位置：x="3988800" y="3765600"
// 转换后像素：x = 3988800 / 914400 * 96 ≈ 418
//            y = 3765600 / 914400 * 96 ≈ 395

// product-review-template.ts 中的注释
// EMU to pixels conversion (1 inch = 914400 EMUs, 96 DPI)
// Original size: 10287000 EMUs ≈ 1080 pixels at 96 DPI
```

---

### 4.6 完整转换流程示例

#### 输入：PPT截图

假设有一个产品评价PPT设计，包含：
- 全屏背景图
- 居中的白色卡片
- 圆形头像
- 星级评分
- 评价文字
- 社交账号

#### 步骤A：给AI分析截图

发送截图 + 提示词给AI

#### 步骤B：获取HTML代码

AI返回带有 `data-ai-slot` 标记的HTML

#### 步骤C：提取关键信息

```
元素清单：
1. background-image: (0, 0) 1080×1080
2. card-background: (418, 409) 594×298, rgba(255,255,255,0.86)
3. avatar-image: (621, 295) 148×148, border-radius: 50%
4. rating: (531, 460) 300×50, font-size: 32px, maxChars: 5
5. review: (445, 533) 499×128, font-size: 24px, maxChars: 200
6. title: (177, 829) 482×68, font-size: 41px, maxChars: 30
7. social: (199, 902) 493×72, font-size: 28px, maxChars: 30
```

#### 步骤D：生成TypeScript配置

将上述信息转换为 `TemplateElement[]` 数组

#### 步骤E：添加到模板注册

```typescript
// src/lib/presentation/templates/index.ts
import { testimonialTemplate } from './testimonial-template';
import { productReviewTemplate } from './product-review-template';

export const slideTemplates: Record<string, SlideTemplate> = {
  'testimonial-with-photo': testimonialTemplate,
  'product-review-square': productReviewTemplate,
};

export type SlideTemplateId = keyof typeof slideTemplates;
```

---

### 4.7 模板开发检查清单

开发新模板时，确保完成以下检查：

- [ ] **基础配置**
  - [ ] 设置唯一的 `id`
  - [ ] 设置 `name` 和 `description`
  - [ ] 设置正确的 `category`
  - [ ] 设置正确的 `size`（width × height）

- [ ] **元素定义**
  - [ ] 所有元素都有唯一的 `id`
  - [ ] 所有元素都有正确的 `type`（text/image/background）
  - [ ] 所有元素都有语义化的 `slot` 名称
  - [ ] 所有元素都有精确的 `position` 和 `size`
  - [ ] 所有元素都设置了 `zIndex`

- [ ] **文字元素约束**
  - [ ] 设置了 `constraints.maxChars`
  - [ ] 设置了 `constraints.maxLines`（可选）
  - [ ] 设置了 `constraints.overflowStrategy`
  - [ ] 提供了 `exampleContent`

- [ ] **图片元素配置**
  - [ ] 设置了 `imageQuery`（英文关键词）
  - [ ] 设置了 `imageStyle`（photo/illustration/icon）
  - [ ] 设置了 `style.objectFit`（cover/contain）

- [ ] **AI提示**
  - [ ] 添加了 `aiPromptHints` 数组
  - [ ] 说明了标签使用方式
  - [ ] 说明了内容长度限制

- [ ] **注册模板**
  - [ ] 在 `index.ts` 中导入并注册
  - [ ] 在前端选择器中添加选项（可选）

---

### 4.8 常见问题

#### Q1：如何处理不规则形状的元素？

使用 `borderRadius` 实现圆角，圆形元素设置 `borderRadius = width / 2`

#### Q2：文字溢出了怎么办？

1. 检查 `constraints.maxChars` 是否设置
2. 设置 `overflowStrategy: 'auto-scale'` 自动缩小字体
3. 在 AI 提示中强调字符限制

#### Q3：图片显示不完整怎么办？

确保设置了 `style.objectFit: 'cover'`，这样图片会填满容器并裁剪超出部分

#### Q4：PPT导出后位置不对怎么办？

检查 `exportToPPT.ts` 中的缩放逻辑：
- 模板尺寸到 PPT 尺寸的缩放比例
- 居中偏移量计算
