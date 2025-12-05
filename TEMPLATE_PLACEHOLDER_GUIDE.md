# 🎨 模板占位符设计指南

## 📌 问题：设计模板时，文字框和图片框里应该放什么？

在设计 PPT 模板时，你需要用**占位符（Placeholder）**来标记哪些内容会被 AI 替换。

---

## 🎯 核心概念：占位符（Placeholder）

### 什么是占位符？

**占位符 = 标记 + 示例内容**

- 📝 **标记**：告诉系统这是什么类型的内容
- 👁️ **示例内容**：让你在设计时看到布局效果

```
┌─────────────────────────────────┐
│  {{TITLE}}                      │ ← 标记
│  这里是标题示例文字               │ ← 示例内容（设计时看）
└─────────────────────────────────┘
           ↓ AI 生成时替换为
┌─────────────────────────────────┐
│  人工智能的未来发展趋势           │ ← AI 生成的真实内容
└─────────────────────────────────┘
```

---

## 📝 文字框占位符设计

### 1. **标题文字框**

#### 方案 A：使用标记语法
```
{{TITLE}}
人工智能的未来发展
```

#### 方案 B：使用 HTML 注释
```html
<!-- TITLE -->
人工智能的未来发展
```

#### 方案 C：使用特殊前缀
```
[TITLE] 人工智能的未来发展
```

#### 推荐方案 D：使用 data 属性（最优）
```html
<div data-ai-slot="title" data-max-chars="30">
  人工智能的未来发展
</div>
```

---

### 2. **正文文字框**

```html
<div 
  data-ai-slot="content" 
  data-max-chars="200"
  data-max-lines="5"
>
  这里是正文示例内容。人工智能技术正在快速发展，
  深度学习、自然语言处理等领域取得了突破性进展。
  这段文字展示了段落的行数和长度。
</div>
```

**属性说明**：
- `data-ai-slot="content"` - 标记为正文内容
- `data-max-chars="200"` - 最多200个字符
- `data-max-lines="5"` - 最多5行

---

### 3. **列表文字框**

```html
<ul data-ai-slot="bullet-list" data-max-items="4">
  <li>第一个要点示例文字</li>
  <li>第二个要点示例文字</li>
  <li>第三个要点示例文字</li>
  <li>第四个要点示例文字</li>
</ul>
```

---

### 4. **数字/统计框**

```html
<div 
  data-ai-slot="statistic" 
  data-format="number"
>
  85%
</div>

<div 
  data-ai-slot="statistic-label"
>
  用户满意度
</div>
```

---

## 🖼️ 图片框占位符设计

### 1. **主图片区域**

#### 方案 A：使用占位图片
```html
<img 
  data-ai-slot="main-image"
  data-image-query="technology, artificial intelligence"
  src="https://via.placeholder.com/800x600?text=AI+Technology"
  alt="AI technology illustration"
/>
```

#### 方案 B：使用颜色块 + 图标
```html
<div 
  data-ai-slot="main-image"
  data-image-query="business meeting"
  style="
    width: 800px; 
    height: 600px; 
    background: #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: center;
  "
>
  <svg width="100" height="100" viewBox="0 0 24 24">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
  <p>主图片区域</p>
</div>
```

---

### 2. **背景图片**

```html
<div 
  data-ai-slot="background-image"
  data-image-query="abstract gradient background"
  data-image-opacity="0.3"
  style="
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.3;
  "
>
</div>
```

---

### 3. **装饰性图片/图标**

```html
<div 
  data-ai-slot="decorative-image"
  data-image-query="lightbulb icon"
  data-optional="true"
  style="width: 64px; height: 64px;"
>
  💡
</div>
```

**属性说明**：
- `data-optional="true"` - 可选，AI 可能不生成图片

---

## 🎨 完整模板示例

### 标题页模板（Title Slide）

```html
<div style="width: 1280px; height: 720px; position: relative; background: #FFFFFF;">
  
  <!-- 背景图片占位符 -->
  <div 
    data-ai-slot="background-image"
    data-image-query="professional business background"
    data-image-opacity="0.2"
    style="position: absolute; inset: 0; background: #F3F4F6;"
  ></div>
  
  <!-- 主标题 -->
  <div 
    data-ai-slot="title"
    data-max-chars="40"
    data-font-size="48px"
    style="
      position: absolute;
      top: 250px;
      left: 100px;
      width: 1080px;
      font-size: 48px;
      font-weight: bold;
      color: #1F2937;
    "
  >
    这是演示文稿的主标题示例
  </div>
  
  <!-- 副标题 -->
  <div 
    data-ai-slot="subtitle"
    data-max-chars="60"
    data-font-size="24px"
    style="
      position: absolute;
      top: 350px;
      left: 100px;
      width: 1080px;
      font-size: 24px;
      color: #6B7280;
    "
  >
    这是副标题，提供更多的上下文信息
  </div>
  
  <!-- 日期/作者 -->
  <div 
    data-ai-slot="meta"
    data-optional="true"
    style="
      position: absolute;
      bottom: 50px;
      right: 100px;
      font-size: 16px;
      color: #9CA3AF;
    "
  >
    2025年12月 | AI团队
  </div>
  
</div>
```

---

### 内容页模板（Content Slide with Image）

```html
<div style="width: 1280px; height: 720px; position: relative; background: #FFFFFF;">
  
  <!-- 左侧：文字内容区 -->
  <div style="
    position: absolute;
    top: 80px;
    left: 80px;
    width: 550px;
    height: 560px;
  ">
    
    <!-- 标题 -->
    <div 
      data-ai-slot="slide-title"
      data-max-chars="30"
      style="
        font-size: 36px;
        font-weight: bold;
        color: #1F2937;
        margin-bottom: 30px;
      "
    >
      这是幻灯片标题
    </div>
    
    <!-- 内容要点 -->
    <ul 
      data-ai-slot="bullet-points"
      data-max-items="4"
      data-max-chars-per-item="80"
      style="
        list-style-type: disc;
        padding-left: 20px;
        line-height: 1.8;
      "
    >
      <li style="font-size: 20px; margin-bottom: 15px; color: #374151;">
        第一个要点：这是示例文字用于展示布局效果
      </li>
      <li style="font-size: 20px; margin-bottom: 15px; color: #374151;">
        第二个要点：可以包含更多详细信息
      </li>
      <li style="font-size: 20px; margin-bottom: 15px; color: #374151;">
        第三个要点：保持内容简洁清晰
      </li>
      <li style="font-size: 20px; margin-bottom: 15px; color: #374151;">
        第四个要点：让读者容易理解
      </li>
    </ul>
    
  </div>
  
  <!-- 右侧：图片区 -->
  <div 
    data-ai-slot="main-image"
    data-image-query="professional illustration related to content"
    style="
      position: absolute;
      top: 80px;
      right: 80px;
      width: 500px;
      height: 560px;
      background: #E5E7EB;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    "
  >
    <div style="text-align: center; color: #6B7280;">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
      <p style="margin-top: 10px;">图片占位符</p>
    </div>
  </div>
  
</div>
```

---

## 🔧 占位符属性参考

### 文字框属性

```typescript
interface TextPlaceholder {
  // 必需属性
  'data-ai-slot': 
    | 'title'           // 主标题
    | 'subtitle'        // 副标题
    | 'slide-title'     // 幻灯片标题
    | 'content'         // 正文内容
    | 'bullet-points'   // 要点列表
    | 'quote'           // 引用
    | 'caption'         // 图片说明
    | 'statistic'       // 数字/统计
    | 'meta';           // 元信息（日期、作者等）
  
  // 约束属性
  'data-max-chars'?: number;      // 最多字符数
  'data-max-lines'?: number;      // 最多行数
  'data-max-items'?: number;      // 列表最多项目数（用于列表）
  'data-max-chars-per-item'?: number;  // 每项最多字符数
  
  // 样式属性
  'data-font-size'?: string;      // 字体大小（如 "24px"）
  'data-font-weight'?: string;    // 字体粗细
  'data-text-align'?: 'left' | 'center' | 'right';
  
  // 行为属性
  'data-optional'?: boolean;      // 是否可选
  'data-overflow-strategy'?: 
    | 'auto-scale'   // 自动缩小字体
    | 'truncate'     // 截断
    | 'strict';      // 严格限制
}
```

---

### 图片框属性

```typescript
interface ImagePlaceholder {
  // 必需属性
  'data-ai-slot': 
    | 'main-image'         // 主图片
    | 'background-image'   // 背景图片
    | 'decorative-image'   // 装饰图片
    | 'icon'               // 图标
    | 'chart'              // 图表
    | 'logo';              // Logo
  
  // 搜索属性
  'data-image-query': string;     // 图片搜索关键词
  'data-image-style'?: 
    | 'photo'           // 照片
    | 'illustration'    // 插图
    | 'icon'            // 图标
    | 'abstract';       // 抽象图
  
  // 样式属性
  'data-image-opacity'?: number;  // 透明度（0-1）
  'data-object-fit'?: 
    | 'cover'      // 覆盖（可能裁剪）
    | 'contain'    // 包含（保持完整）
    | 'fill';      // 填充（可能变形）
  
  // 行为属性
  'data-optional'?: boolean;      // 是否可选
  'data-generate'?: boolean;      // 是否使用 AI 生成图片
}
```

---

## 📋 实际工作流程

### 第1步：在 Canvas/Figma 设计

```
1. 创建 1280x720 的画布（16:9）
2. 放置文字框，输入示例内容
3. 放置图片占位符（用颜色块或占位图）
4. 标注每个元素的尺寸和位置
```

---

### 第2步：导出为 HTML + 标注

**选项 A：截图 + Excel 表格**

| 元素类型 | 位置 (x, y) | 尺寸 (w, h) | 内容类型 | 示例内容 | 最大字符 |
|---------|------------|------------|---------|---------|---------|
| 文字框 | (100, 80) | (600, 100) | title | "人工智能的未来" | 30 |
| 文字框 | (100, 200) | (600, 400) | content | "正文内容..." | 200 |
| 图片框 | (750, 80) | (450, 560) | main-image | "科技插图" | - |

**选项 B：HTML 代码 + data 属性**（推荐）

直接导出为 HTML，添加 `data-ai-slot` 属性。

---

### 第3步：转换为模板配置

```typescript
// 系统自动解析为配置
const template: SlideTemplate = {
  id: 'content-with-image',
  name: '内容+图片布局',
  size: { width: 1280, height: 720 },
  
  elements: [
    {
      type: 'text',
      slot: 'slide-title',
      position: { x: 100, y: 80 },
      size: { width: 600, height: 100 },
      style: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1F2937',
      },
      constraints: {
        maxChars: 30,
        overflowStrategy: 'auto-scale',
      },
      exampleContent: '这是幻灯片标题',
    },
    {
      type: 'text',
      slot: 'bullet-points',
      position: { x: 100, y: 200 },
      size: { width: 600, height: 400 },
      style: {
        fontSize: 20,
        lineHeight: 1.8,
      },
      constraints: {
        maxItems: 4,
        maxCharsPerItem: 80,
      },
      exampleContent: [
        '第一个要点示例',
        '第二个要点示例',
        '第三个要点示例',
        '第四个要点示例',
      ],
    },
    {
      type: 'image',
      slot: 'main-image',
      position: { x: 750, y: 80 },
      size: { width: 450, height: 560 },
      imageQuery: 'professional illustration',
      style: {
        borderRadius: 8,
        objectFit: 'cover',
      },
    },
  ],
};
```

---

## 💡 设计技巧

### ✅ DO（推荐做法）

1. **使用真实长度的示例文字**
   ```
   ✅ "人工智能技术正在改变世界，深度学习、自然语言处理..."
   ❌ "示例文字"
   ```

2. **为每种内容类型准备多个长度版本**
   ```
   短标题: "AI的未来" (10字)
   中标题: "人工智能技术发展趋势" (20字)
   长标题: "人工智能在各行业的应用与未来发展" (30字)
   ```

3. **使用占位图服务**
   ```html
   <img src="https://via.placeholder.com/800x600?text=Technology+Image">
   ```

4. **标注每个框的约束**
   ```
   标题框: 最多30字，2行
   正文框: 最多200字，10行
   ```

---

### ❌ DON'T（避免的做法）

1. ❌ 文字框留空
   ```html
   <div data-ai-slot="title"></div>  <!-- 看不出布局效果 -->
   ```

2. ❌ 使用过短的示例文字
   ```html
   <div data-ai-slot="content">示例</div>  <!-- 无法测试换行 -->
   ```

3. ❌ 图片框没有背景
   ```html
   <div data-ai-slot="image" style="width:500px;height:400px;"></div>
   <!-- 看不出图片区域在哪 -->
   ```

4. ❌ 没有标注约束条件
   ```
   "这个文字框应该放多少字？" → 无法确定
   ```

---

## 🎯 快速检查清单

设计完模板后，检查：

- [ ] 每个文字框都有示例内容（真实长度）
- [ ] 每个文字框都有 `data-ai-slot` 属性
- [ ] 每个文字框都标注了 `data-max-chars`
- [ ] 每个图片框都有占位符（颜色块或占位图）
- [ ] 每个图片框都有 `data-image-query`
- [ ] 所有元素的位置和尺寸都记录清楚
- [ ] 测试了长内容和短内容的布局效果
- [ ] 标注了字体大小、颜色、行高等样式

---

## 📦 模板设计包内容

提交给开发团队时，应包含：

```
my-template/
├── preview.png               # 模板预览图
├── design.html              # 带 data 属性的 HTML
├── specs.xlsx               # 元素规格表
├── assets/
│   ├── placeholder-1.png    # 占位图
│   └── placeholder-2.png
└── README.md                # 设计说明
```

**README.md 示例**：
```markdown
# 内容+图片模板

## 适用场景
- 产品介绍
- 功能说明
- 案例展示

## 元素清单
1. 幻灯片标题 (30字)
2. 要点列表 (4项，每项80字)
3. 配图 (16:9 横图)

## AI 提示建议
"生成产品介绍幻灯片，包含标题、4个功能要点、配图"
```

---

## 🚀 总结

### 文字框里放什么？

| 框类型 | 放什么 | 示例 |
|--------|--------|------|
| 标题框 | `{{TITLE}}` + 示例标题 | "人工智能的未来发展趋势研究" |
| 正文框 | `{{CONTENT}}` + 示例段落 | "AI技术正在改变..." (完整段落) |
| 列表框 | `{{BULLETS}}` + 示例列表项 | "• 第一点...\n• 第二点..." |

### 图片框里放什么？

| 框类型 | 放什么 | 示例 |
|--------|--------|------|
| 主图片 | 占位图 + 搜索关键词 | 灰色框 + "technology illustration" |
| 背景图 | 颜色渐变 + 搜索关键词 | 渐变色 + "abstract background" |
| 装饰图 | 图标/emoji | 💡 或 SVG 图标 |

### 关键点

1. **示例内容要真实** - 用真实长度的文字测试布局
2. **标记要清晰** - 使用 `data-ai-slot` 标记每个框
3. **约束要明确** - 标注最大字符数、行数
4. **占位要可见** - 图片框用颜色块或占位图

这样 AI 就知道往哪填充内容了！🎨
