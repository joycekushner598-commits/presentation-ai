# 快速添加新主题 - 3分钟教程

## 最简单的方法：通过 UI 创建 ✨

**不需要写代码！**

1. 进入演示文稿编辑页面
2. 点击右侧 **"Theme"** 按钮
3. 点击 **"More Themes"**
4. 点击 **"Create New Theme"** （绿色按钮）
5. 选择一个基础主题或从空白开始
6. 自定义颜色、字体
7. 预览效果
8. 保存！

---

## 代码方式：添加内置主题

### 第 1 步：编辑 `src/lib/presentation/themes.ts`

在文件开头添加主题名称：

```typescript
export type ThemeName =
  | "daktilo"
  | "cornflower"
  // ... 其他主题
  | "ocean"      // 👈 你的新主题名
  | "sakura";
```

### 第 2 步：在 `themes` 对象末尾添加配置

```typescript
export const themes: Record<ThemeName, ThemeProperties> = {
  // ... 现有主题 ...
  
  ocean: {
    name: "Ocean",
    description: "清新海洋风格",
    colors: {
      light: {
        primary: "#0EA5E9",      // 主色 - 天蓝
        secondary: "#06B6D4",    // 次要色 - 青色
        accent: "#22D3EE",       // 强调色
        background: "#F0F9FF",   // 背景 - 浅蓝白
        text: "#0C4A6E",         // 文字 - 深蓝
        heading: "#075985",      // 标题 - 更深的蓝
        muted: "#64748B",        // 次要文字
      },
      dark: {
        primary: "#38BDF8",
        secondary: "#22D3EE",
        accent: "#67E8F9",
        background: "#0C4A6E",   // 深蓝背景
        text: "#E0F2FE",
        heading: "#F0F9FF",
        muted: "#94A3B8",
      },
    },
    fonts: {
      heading: "Montserrat",     // 标题字体
      body: "Open Sans",         // 正文字体
    },
    borderRadius: "0.5rem",
    transitions: {
      default: "all 0.3s ease",
    },
    shadows: {
      light: {
        card: "0 4px 12px rgba(14,165,233,0.1)",
        button: "0 2px 8px rgba(14,165,233,0.15)",
      },
      dark: {
        card: "0 4px 12px rgba(56,189,248,0.2)",
        button: "0 2px 8px rgba(56,189,248,0.25)",
      },
    },
  },
};
```

### 第 3 步：保存并刷新

保存文件，刷新浏览器，新主题就出现了！

---

## 配色技巧

### 获取颜色代码

**方法 1：使用在线工具**
- https://coolors.co/ - 随机生成配色
- https://color.adobe.com/ - Adobe 配色工具
- https://tailwindcss.com/docs/customizing-colors - Tailwind 颜色表

**方法 2：从图片提取**
- https://imagecolorpicker.com/ - 上传图片提取颜色

**方法 3：使用现有品牌色**
- 从你的 Logo 或品牌指南中获取十六进制色值

### 配色原则

1. **主色（primary）**：你的品牌色，用于按钮、链接
2. **次要色（secondary）**：主色的补充，用于边框、图标
3. **强调色（accent）**：更亮的变体，用于悬停、高亮
4. **背景色（background）**：
   - 浅色模式：#FFFFFF 或浅色
   - 深色模式：#000000 - #1F1F1F 之间
5. **文字色（text/heading）**：
   - 与背景对比要明显
   - 标题比正文更深/更亮

---

## 常用配色方案

### 1. 专业商务
```
primary: #2563EB (蓝色)
secondary: #64748B (灰色)
accent: #3B82F6 (亮蓝)
```

### 2. 创意设计
```
primary: #8B5CF6 (紫色)
secondary: #EC4899 (粉色)
accent: #F59E0B (橙色)
```

### 3. 自然环保
```
primary: #059669 (绿色)
secondary: #047857 (深绿)
accent: #34D399 (浅绿)
```

### 4. 温暖热情
```
primary: #DC2626 (红色)
secondary: #EA580C (橙红)
accent: #F97316 (橙色)
```

---

## 已添加的示例主题

### 🌊 Ocean（海洋）
- 清新、专业
- 适合：科技、商务、教育

### 🌸 Sakura（樱花）
- 浪漫、优雅
- 适合：文化、艺术、时尚

---

## 测试你的主题

1. 创建一个新演示文稿
2. 在主题选择器中选择你的新主题
3. 添加标题、文字、列表等元素
4. 切换浅色/深色模式（点击右上角 🌙/☀️）
5. 检查所有颜色是否协调、文字是否清晰

---

## 需要帮助？

查看完整指南：`THEME_GUIDE.md`

包含：
- 详细属性说明
- 更多示例主题
- 高级技巧
- 常见问题解答
