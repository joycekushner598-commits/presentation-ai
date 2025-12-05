# 📸 从截图生成 HTML 模板的 AI 提示指南

## 🎯 目标

把 PPT 设计截图给 AI，让 AI 生成带有占位符标记的 HTML 代码，用于我们的演示文稿生成系统。

---

## 📋 给 AI 的完整提示模板

### 基础版提示（复制下面内容给 AI）

```
我需要你根据这个 PPT 设计截图，生成一个 HTML 模板代码。

【要求】
1. 使用绝对定位（position: absolute）精确还原所有元素的位置
2. 幻灯片尺寸固定为 1280px × 720px（16:9）
3. 为所有可变内容添加 data-ai-slot 属性标记
4. 为所有文字框添加 data-max-chars 约束
5. 为所有图片框添加 data-image-query 搜索关键词
6. 保留示例内容（不要留空）
7. 使用内联样式（style=""）定义所有样式

【元素类型标记】
文字元素使用：
- data-ai-slot="title" - 主标题
- data-ai-slot="subtitle" - 副标题
- data-ai-slot="slide-title" - 幻灯片标题
- data-ai-slot="content" - 正文段落
- data-ai-slot="bullet-points" - 要点列表
- data-ai-slot="quote" - 引用
- data-ai-slot="caption" - 图片说明
- data-ai-slot="statistic" - 数字/统计
- data-ai-slot="meta" - 元信息（日期、作者）

图片元素使用：
- data-ai-slot="main-image" - 主图片
- data-ai-slot="background-image" - 背景图
- data-ai-slot="decorative-image" - 装饰图
- data-ai-slot="icon" - 图标

【输出格式】
生成完整的 HTML 代码，包含：
1. 完整的 HTML 结构
2. 所有元素的精确位置（x, y）
3. 所有元素的尺寸（width, height）
4. 字体大小、颜色、粗细
5. data 属性标记
6. 示例内容

【示例输出结构】
<div style="width: 1280px; height: 720px; position: relative; background: #FFFFFF;">
  <div 
    data-ai-slot="title"
    data-max-chars="30"
    style="position: absolute; top: 100px; left: 100px; width: 600px; font-size: 36px; font-weight: bold; color: #1F2937;"
  >
    示例标题文字
  </div>
  <!-- 更多元素... -->
</div>

现在请分析这个截图并生成 HTML 代码。
```

---

### 高级版提示（更详细的要求）

```
我需要你根据这个 PPT 设计截图，生成一个精确的 HTML 模板代码，用于我们的 AI 演示文稿生成系统。

=== 核心要求 ===

1. 【尺寸和定位】
   - 容器尺寸：1280px × 720px（16:9 比例）
   - 所有元素使用绝对定位（position: absolute）
   - 精确测量并标注每个元素的 top, left, width, height
   - 单位使用 px

2. 【AI 占位符标记】
   每个可变内容元素必须添加 data-ai-slot 属性：
   
   文字类型：
   - title: 主标题（演示文稿总标题）
   - subtitle: 副标题
   - slide-title: 单页标题
   - content: 正文段落
   - bullet-points: 要点列表（用 <ul> 或 <ol>）
   - quote: 引用文字
   - caption: 图片/图表说明
   - statistic: 数字统计
   - meta: 元信息（作者、日期、页码等）
   
   图片类型：
   - main-image: 主要配图
   - background-image: 背景图片
   - decorative-image: 装饰性图片
   - icon: 图标
   - logo: 品牌标志

3. 【约束属性】
   文字元素必须添加：
   - data-max-chars="数字" - 最大字符数
   - data-max-lines="数字" - 最大行数（可选）
   - data-max-items="数字" - 列表最大项目数（仅列表）
   - data-max-chars-per-item="数字" - 每项最大字符（仅列表）
   
   图片元素必须添加：
   - data-image-query="描述" - 图片搜索关键词（英文）
   - data-image-style="photo/illustration/icon/abstract" - 图片风格
   - data-optional="true/false" - 是否可选
   
   示例：
   <div 
     data-ai-slot="bullet-points"
     data-max-items="4"
     data-max-chars-per-item="80"
   >

4. 【样式要求】
   - 使用内联样式（style="" 属性）
   - 包含完整的样式定义：
     * font-size: 字体大小
     * font-weight: 字体粗细（normal/bold/数字）
     * font-family: 字体（推荐：Arial, "Microsoft YaHei", sans-serif）
     * color: 文字颜色（十六进制）
     * line-height: 行高（建议 1.5-1.8）
     * text-align: 对齐方式
     * background: 背景色
     * border-radius: 圆角
     * padding, margin: 内外边距

5. 【示例内容】
   - 所有文字框必须包含示例文字（不要留空）
   - 示例文字长度要接近 data-max-chars 的限制
   - 图片框使用灰色背景 (#E5E7EB) + 居中的图标/文字说明
   - 列表要展示完整的项目数（如 data-max-items="4" 则展示4个 li）

6. 【特殊元素处理】
   列表：
   <ul data-ai-slot="bullet-points" data-max-items="4" style="...">
     <li style="...">示例要点 1</li>
     <li style="...">示例要点 2</li>
     <li style="...">示例要点 3</li>
     <li style="...">示例要点 4</li>
   </ul>
   
   图片占位符：
   <div 
     data-ai-slot="main-image"
     data-image-query="professional technology illustration"
     data-image-style="illustration"
     style="position: absolute; top: 80px; right: 80px; width: 500px; height: 560px; 
            background: #E5E7EB; border-radius: 8px; display: flex; 
            align-items: center; justify-content: center; flex-direction: column;"
   >
     <svg width="80" height="80" viewBox="0 0 24 24" fill="#9CA3AF">
       <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
     </svg>
     <p style="margin-top: 10px; color: #6B7280; font-size: 14px;">图片占位符 500×560px</p>
   </div>

=== 输出格式 ===

请按以下格式输出：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>PPT Template</title>
</head>
<body style="margin: 0; padding: 20px; background: #F3F4F6; display: flex; justify-content: center; align-items: center;">

  <!-- 幻灯片容器 -->
  <div style="width: 1280px; height: 720px; position: relative; background: #FFFFFF; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- 在这里添加所有元素 -->
    
  </div>

</body>
</html>
```

=== 分析步骤 ===

请按照以下步骤分析截图：

1. 识别幻灯片布局类型（标题页/内容页/图文混排等）
2. 测量并标注每个元素的位置（从左上角 0,0 开始）
3. 识别元素类型（标题/正文/图片/列表等）
4. 估算文字内容的最大长度（字符数）
5. 为图片描述搜索关键词（英文）
6. 生成完整的 HTML 代码

=== 额外要求 ===

- 颜色使用十六进制格式（如 #1F2937）
- 中文文字使用中文示例内容
- 图片搜索关键词使用英文
- 保持视觉上与截图一致
- 注释标注每个主要区域

现在请仔细分析这个截图并生成完整的 HTML 模板代码。
```

---

## 📸 截图准备清单

在给 AI 截图之前，确保：

### ✅ 必需准备

1. **清晰的截图**
   - 分辨率至少 1920×1080
   - 没有模糊或压缩失真
   - 完整显示整个幻灯片

2. **标注信息**（可选但推荐）
   - 用箭头标注关键元素
   - 用文字标注元素类型（"这是标题"、"这是配图"）
   - 标注最大字符限制（"最多30字"）

3. **参考信息**
   - 说明幻灯片用途（标题页/内容页/总结页）
   - 说明目标风格（简约/商务/创意）
   - 说明特殊要求（必须有图/纯文字等）

---

## 🎬 使用流程

### 步骤 1：准备截图

```
在 Canvas/Figma/PPT 中设计好模板
↓
截图（Ctrl + Shift + S）
↓
可选：在图片上添加标注
```

### 步骤 2：复制提示词

```
复制上面的"基础版提示"或"高级版提示"
↓
粘贴到 ChatGPT/Claude 等 AI 对话框
↓
上传截图
```

### 步骤 3：发送并获取代码

```
AI 分析截图
↓
生成 HTML 代码
↓
复制代码
```

### 步骤 4：验证代码

```
创建 .html 文件
↓
粘贴代码并保存
↓
在浏览器打开检查效果
↓
对比原截图，调整细节
```

---

## 🔍 AI 输出质量检查清单

收到 AI 生成的代码后，检查：

### 必需项（缺少则要求 AI 重新生成）

- [ ] 容器尺寸是 1280×720px
- [ ] 所有可变元素都有 `data-ai-slot` 属性
- [ ] 所有文字元素都有 `data-max-chars` 属性
- [ ] 所有图片元素都有 `data-image-query` 属性
- [ ] 文字框不是空的（有示例内容）
- [ ] 图片框有占位符（灰色背景或图标）
- [ ] 使用了 `position: absolute` 定位

### 质量项（需要手动调整）

- [ ] 位置和尺寸准确（与截图对比）
- [ ] 字体大小合适
- [ ] 颜色与原设计一致
- [ ] 行高和间距合理
- [ ] 示例文字长度合理

---

## 📝 常见问题和修正提示

### 问题 1：AI 没有添加 data 属性

**补充提示**：
```
请为所有可变内容添加 data-ai-slot 属性。
例如：
<div data-ai-slot="title" data-max-chars="30">标题</div>
<div data-ai-slot="main-image" data-image-query="technology">图片</div>
```

### 问题 2：AI 使用了 CSS 类而不是内联样式

**补充提示**：
```
请不要使用 CSS 类，所有样式都用内联 style="" 属性定义。
例如：
<div style="font-size: 24px; color: #333; font-weight: bold;">
```

### 问题 3：AI 没有使用绝对定位

**补充提示**：
```
请为每个元素使用 position: absolute 定位，并指定 top, left, width, height。
例如：
<div style="position: absolute; top: 100px; left: 80px; width: 600px; height: 80px;">
```

### 问题 4：文字框是空的

**补充提示**：
```
请为所有文字框填充示例内容，长度接近 data-max-chars 的限制。
例如：
data-max-chars="30" 应该填充 25-30 个字符的示例文字。
```

### 问题 5：图片框没有占位符

**补充提示**：
```
请为图片框添加灰色背景和图标，示例：
<div 
  data-ai-slot="main-image"
  data-image-query="technology"
  style="position: absolute; width: 500px; height: 400px; 
         background: #E5E7EB; display: flex; align-items: center; 
         justify-content: center;"
>
  <span style="font-size: 48px;">📷</span>
</div>
```

---

## 🎯 AI 提示优化技巧

### 技巧 1：分步骤要求

```
第一步：请列出截图中所有元素的清单（位置、类型、尺寸）
第二步：根据清单生成 HTML 代码
```

### 技巧 2：提供示例代码

```
参考以下格式生成代码：

<div style="width: 1280px; height: 720px; position: relative; background: white;">
  <div 
    data-ai-slot="title"
    data-max-chars="30"
    style="position: absolute; top: 100px; left: 100px; width: 600px; 
           font-size: 36px; font-weight: bold; color: #1F2937;"
  >
    这是一个标题示例文字内容
  </div>
</div>
```

### 技巧 3：强调关键要求

```
【重要】以下要求必须遵守：
1. 必须使用 data-ai-slot 标记
2. 必须使用 data-max-chars 约束
3. 必须使用内联样式
4. 必须包含示例内容
```

---

## 📦 完整示例对话

### 你发给 AI：

```
我需要你根据这个 PPT 设计截图，生成一个 HTML 模板代码。

【要求】
1. 容器尺寸：1280px × 720px
2. 使用 position: absolute 定位所有元素
3. 为可变内容添加 data-ai-slot 属性
4. 为文字添加 data-max-chars 约束
5. 为图片添加 data-image-query 关键词
6. 使用内联样式（style=""）
7. 包含示例内容

【data-ai-slot 类型】
- title: 主标题
- slide-title: 页面标题  
- content: 正文
- bullet-points: 列表
- main-image: 主图片

【输出格式】
完整的 HTML 代码，包含所有位置、尺寸、样式。

[上传截图]
```

### AI 应该输出：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>PPT Template</title>
</head>
<body style="margin: 0; padding: 20px; background: #F3F4F6;">

<div style="width: 1280px; height: 720px; position: relative; background: #FFFFFF;">
  
  <!-- 标题 -->
  <div 
    data-ai-slot="slide-title"
    data-max-chars="30"
    style="position: absolute; top: 80px; left: 80px; width: 600px; 
           font-size: 36px; font-weight: bold; color: #1F2937; 
           font-family: Arial, 'Microsoft YaHei', sans-serif;"
  >
    人工智能技术发展趋势分析
  </div>
  
  <!-- 内容列表 -->
  <ul 
    data-ai-slot="bullet-points"
    data-max-items="4"
    data-max-chars-per-item="80"
    style="position: absolute; top: 180px; left: 80px; width: 600px; 
           list-style-type: disc; padding-left: 20px; line-height: 1.8;"
  >
    <li style="font-size: 20px; color: #374151; margin-bottom: 15px;">
      深度学习技术在图像识别领域取得突破性进展
    </li>
    <li style="font-size: 20px; color: #374151; margin-bottom: 15px;">
      自然语言处理模型能力持续提升
    </li>
    <li style="font-size: 20px; color: #374151; margin-bottom: 15px;">
      AI芯片性能不断优化，能耗比显著改善
    </li>
    <li style="font-size: 20px; color: #374151; margin-bottom: 15px;">
      人工智能应用场景日益丰富多样
    </li>
  </ul>
  
  <!-- 图片占位符 -->
  <div 
    data-ai-slot="main-image"
    data-image-query="artificial intelligence technology illustration"
    data-image-style="illustration"
    style="position: absolute; top: 80px; right: 80px; width: 500px; height: 560px; 
           background: #E5E7EB; border-radius: 8px; 
           display: flex; flex-direction: column; align-items: center; justify-content: center;"
  >
    <svg width="80" height="80" viewBox="0 0 24 24" fill="#9CA3AF">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>
    <p style="margin-top: 10px; color: #6B7280; font-size: 14px;">图片占位符 500×560px</p>
  </div>
  
</div>

</body>
</html>
```

---

## 🚀 快速开始

### 1 分钟版本：

```
复制这段话给 AI + 上传截图：

"请根据这个截图生成 HTML 模板代码。
要求：1280×720px，绝对定位，
为可变内容添加 data-ai-slot 和 data-max-chars 属性，
使用内联样式，包含示例内容。"
```

### 3 分钟版本：

```
使用上面的"基础版提示" + 截图
```

### 5 分钟版本：

```
使用"高级版提示" + 标注过的截图
```

---

## 📊 成功标准

生成的代码应该满足：

| 检查项 | 标准 |
|--------|------|
| 尺寸 | ✅ 1280×720px |
| 定位 | ✅ 所有元素用 absolute |
| 标记 | ✅ 所有可变内容有 data-ai-slot |
| 约束 | ✅ 文字有 max-chars，图片有 query |
| 样式 | ✅ 使用内联 style="" |
| 内容 | ✅ 有真实长度的示例内容 |
| 占位符 | ✅ 图片有灰色背景和图标 |
| 可读性 | ✅ 代码格式清晰，有注释 |

---

## 💡 高级技巧

### 批量生成多个模板

```
我有 5 个幻灯片截图，请为每个生成独立的 HTML 文件。
每个文件命名为：template-1.html, template-2.html ...
要求相同，使用 data-ai-slot 标记。
```

### 生成模板配置 JSON

```
除了 HTML 代码，请额外生成一个 JSON 配置文件，
包含所有元素的元数据：

{
  "id": "content-with-image",
  "name": "内容+图片布局",
  "elements": [
    {
      "type": "text",
      "slot": "slide-title",
      "position": { "x": 80, "y": 80 },
      "size": { "width": 600, "height": 100 },
      "constraints": { "maxChars": 30 }
    }
  ]
}
```

---

## ✅ 总结

1. **复制提示词模板**（基础版或高级版）
2. **准备清晰的截图**（1920×1080 以上）
3. **发给 AI**（ChatGPT、Claude 等）
4. **检查输出代码**（对照检查清单）
5. **在浏览器测试**（对比原截图）
6. **手动调整细节**（位置、颜色等）

关键点：
- ✅ 使用 `data-ai-slot` 标记可变内容
- ✅ 使用 `data-max-chars` 约束文字长度
- ✅ 使用 `data-image-query` 描述图片
- ✅ 包含真实长度的示例内容
- ✅ 使用绝对定位 + 内联样式

这样你就能快速把设计转换为可用的模板代码！🎉
