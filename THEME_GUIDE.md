# 演示文稿主题创建指南

本指南将教你如何创建和定义自己的演示文稿主题。

## 目录
1. [主题系统概述](#主题系统概述)
2. [方法一：在代码中添加新主题](#方法一在代码中添加新主题)
3. [方法二：通过 UI 创建自定义主题](#方法二通过-ui-创建自定义主题)
4. [主题结构详解](#主题结构详解)
5. [示例：创建新主题](#示例创建新主题)

---

## 主题系统概述

这个项目有两种方式创建主题：

1. **内置主题（Built-in Themes）**：在代码中定义的预设主题
2. **自定义主题（Custom Themes）**：通过 UI 创建并保存到数据库的主题

### 当前内置主题

- **daktilo** - 现代简洁
- **cornflower** - 专业大胆
- **orbit** - 科技未来感
- **piano** - 高雅经典
- **mystique** - 神秘梦幻
- **gammaDark** - 深色酷炫
- **crimson** - 热情活力
- **sunset** - 温暖渐变
- **forest** - 自然宁静

---

## 方法一：在代码中添加新主题

### 步骤 1：打开主题配置文件

编辑文件：`src/lib/presentation/themes.ts`

### 步骤 2：添加主题名称到类型定义

在文件顶部的 `ThemeName` 类型中添加你的主题名称：

```typescript
export type ThemeName =
  | "daktilo"
  | "cornflower"
  | "orbit"
  | "piano"
  | "mystique"
  | "gammaDark"
  | "crimson"
  | "sunset"
  | "forest"
  | "ocean"      // 👈 添加你的新主题名称
  | "sakura";    // 👈 可以添加多个
```

### 步骤 3：在 themes 对象中定义主题

在 `themes` 对象中添加完整的主题配置：

```typescript
export const themes: Record<ThemeName, ThemeProperties> = {
  // ... 现有主题 ...
  
  ocean: {
    name: "Ocean",
    description: "清新海洋风格",
    colors: {
      light: {
        primary: "#0EA5E9",      // 主色调 - 天蓝色
        secondary: "#06B6D4",    // 次要色 - 青色
        accent: "#22D3EE",       // 强调色 - 亮青色
        background: "#F0F9FF",   // 背景色 - 浅蓝白
        text: "#0C4A6E",         // 文本色 - 深蓝
        heading: "#075985",      // 标题色 - 更深的蓝
        muted: "#64748B",        // 弱化文字 - 灰蓝
      },
      dark: {
        primary: "#38BDF8",      // 主色调 - 亮天蓝
        secondary: "#22D3EE",    // 次要色 - 亮青色
        accent: "#67E8F9",       // 强调色 - 更亮的青
        background: "#0C4A6E",   // 背景色 - 深蓝
        text: "#E0F2FE",         // 文本色 - 浅蓝白
        heading: "#F0F9FF",      // 标题色 - 接近白色
        muted: "#94A3B8",        // 弱化文字 - 浅灰蓝
      },
    },
    fonts: {
      heading: "Montserrat",     // 标题字体
      body: "Open Sans",         // 正文字体
    },
    borderRadius: "0.5rem",      // 圆角大小
    transitions: {
      default: "all 0.3s ease",  // 动画过渡效果
    },
    shadows: {
      light: {
        card: "0 4px 12px rgba(14,165,233,0.1)",      // 卡片阴影
        button: "0 2px 8px rgba(14,165,233,0.15)",    // 按钮阴影
      },
      dark: {
        card: "0 4px 12px rgba(56,189,248,0.2)",
        button: "0 2px 8px rgba(56,189,248,0.25)",
      },
    },
  },
};
```

### 步骤 4：保存并测试

保存文件后，新主题会自动出现在主题选择器中！

---

## 方法二：通过 UI 创建自定义主题

这是**推荐的方法**，适合非技术用户或需要快速测试的场景。

### 步骤 1：打开主题创建器

1. 进入演示文稿编辑页面
2. 点击右侧工具栏的 **"Theme"** 或 **"主题"** 按钮
3. 点击 **"More Themes"** （更多主题）
4. 点击 **"Create New Theme"** （创建新主题）按钮

### 步骤 2：选择基础主题

你有两个选项：

1. **Start from scratch（从零开始）**：创建一个空白主题
2. **选择现有主题作为基础**：在现有主题基础上修改

### 步骤 3：自定义颜色

在 **Colors（颜色）** 标签中，你可以分别为 **Light Mode（浅色模式）** 和 **Dark Mode（深色模式）** 设置：

- **Primary（主色调）**：品牌主色，用于重要元素
- **Secondary（次要色）**：辅助颜色
- **Accent（强调色）**：突出显示和交互元素
- **Background（背景色）**：页面背景
- **Text（文本色）**：正文文字
- **Heading（标题色）**：标题文字
- **Muted（弱化色）**：次要信息文字

**提示**：点击颜色方块可以打开颜色选择器

### 步骤 4：设置字体

在 **Typography（排版）** 标签中设置：

- **Heading Font（标题字体）**：如 "Montserrat", "Playfair Display"
- **Body Font（正文字体）**：如 "Open Sans", "Roboto"

**常用字体组合**：
- 现代简洁：Inter + Inter
- 专业商务：Montserrat + Open Sans
- 优雅经典：Playfair Display + Source Sans Pro
- 科技感：Space Grotesk + IBM Plex Sans

### 步骤 5：上传 Logo（可选）

在 **Logo** 标签中上传你的 Logo 图片，支持格式：PNG, JPG, SVG

### 步骤 6：预览和保存

1. 右侧实时预览区域会显示你的主题效果
2. 填写主题名称和描述
3. 选择是否设为公开（公开后其他用户可以使用）
4. 点击 **"Create Theme"** 保存

---

## 主题结构详解

### 颜色系统

每个主题都有 **light（浅色）** 和 **dark（深色）** 两套配色：

```typescript
colors: {
  light: { /* 浅色模式配色 */ },
  dark: { /* 深色模式配色 */ }
}
```

#### 颜色使用指南

| 颜色属性 | 用途 | 推荐色值范围 |
|---------|------|-------------|
| `primary` | 主按钮、链接、重要图标 | 品牌主色，对比度要高 |
| `secondary` | 次要按钮、边框 | 主色的补充色 |
| `accent` | 悬停效果、高亮 | 主色的变体，更亮或更鲜艳 |
| `background` | 页面/幻灯片背景 | 浅色模式：接近白色；深色模式：深色 |
| `text` | 正文文字 | 与背景对比度 ≥ 4.5:1 |
| `heading` | 标题文字 | 与背景对比度 ≥ 7:1，比正文更深 |
| `muted` | 次要信息、占位文字 | 对比度稍低，传递层级感 |

### 字体系统

```typescript
fonts: {
  heading: "字体名称",  // 用于标题、重要文字
  body: "字体名称"      // 用于正文、普通文字
}
```

**Web 安全字体**（无需额外加载）：
- Arial, Helvetica, sans-serif
- Georgia, serif
- "Times New Roman", Times, serif
- "Courier New", Courier, monospace

**Google 字体**（已集成，可直接使用）：
- Inter, Roboto, Open Sans, Montserrat
- Playfair Display, Merriweather, Lora
- Source Sans Pro, Raleway, Poppins

### 其他属性

```typescript
borderRadius: "0.5rem"     // 圆角大小：0.25rem/0.5rem/0.75rem/1rem
transitions: {
  default: "all 0.3s ease" // CSS 过渡动画
}
shadows: {                 // 阴影效果
  light: {
    card: "0 4px 12px rgba(...)",
    button: "0 2px 8px rgba(...)"
  },
  dark: { /* ... */ }
}
```

---

## 示例：创建新主题

### 示例 1：樱花主题（Sakura）

浪漫优雅的日式风格，适合文化、艺术类演示。

```typescript
sakura: {
  name: "Sakura",
  description: "浪漫樱花，日式优雅",
  colors: {
    light: {
      primary: "#EC4899",      // 粉红色
      secondary: "#DB2777",    // 深粉色
      accent: "#F9A8D4",       // 浅粉色
      background: "#FFF7ED",   // 米白色
      text: "#78350F",         // 棕色文字
      heading: "#5B21B6",      // 紫色标题
      muted: "#A8A29E",        // 灰褐色
    },
    dark: {
      primary: "#F9A8D4",
      secondary: "#FBCFE8",
      accent: "#FCE7F3",
      background: "#450A0A",   // 深酒红背景
      text: "#FFF7ED",
      heading: "#FDF2F8",
      muted: "#D6D3D1",
    },
  },
  fonts: {
    heading: "Playfair Display",
    body: "Noto Sans JP",
  },
  borderRadius: "0.75rem",
  transitions: {
    default: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  shadows: {
    light: {
      card: "0 4px 16px rgba(236,72,153,0.08)",
      button: "0 2px 8px rgba(236,72,153,0.12)",
    },
    dark: {
      card: "0 4px 16px rgba(249,168,212,0.15)",
      button: "0 2px 8px rgba(249,168,212,0.2)",
    },
  },
},
```

### 示例 2：极简黑白主题（Monochrome）

专业、简约，适合严肃商务场景。

```typescript
monochrome: {
  name: "Monochrome",
  description: "极简黑白，专业简约",
  colors: {
    light: {
      primary: "#000000",
      secondary: "#404040",
      accent: "#666666",
      background: "#FFFFFF",
      text: "#1A1A1A",
      heading: "#000000",
      muted: "#808080",
    },
    dark: {
      primary: "#FFFFFF",
      secondary: "#E5E5E5",
      accent: "#CCCCCC",
      background: "#0A0A0A",
      text: "#E5E5E5",
      heading: "#FFFFFF",
      muted: "#999999",
    },
  },
  fonts: {
    heading: "Helvetica Neue",
    body: "Helvetica Neue",
  },
  borderRadius: "0rem",  // 无圆角，硬朗风格
  transitions: {
    default: "all 0.2s linear",
  },
  shadows: {
    light: {
      card: "0 2px 8px rgba(0,0,0,0.06)",
      button: "0 1px 4px rgba(0,0,0,0.1)",
    },
    dark: {
      card: "0 2px 8px rgba(255,255,255,0.06)",
      button: "0 1px 4px rgba(255,255,255,0.1)",
    },
  },
},
```

### 示例 3：科技感主题（Cyber）

霓虹色彩，科幻未来风格。

```typescript
cyber: {
  name: "Cyber",
  description: "霓虹科技，未来赛博",
  colors: {
    light: {
      primary: "#8B5CF6",      // 紫色
      secondary: "#06B6D4",    // 青色
      accent: "#F59E0B",       // 橙色
      background: "#F8FAFC",
      text: "#1E293B",
      heading: "#0F172A",
      muted: "#64748B",
    },
    dark: {
      primary: "#A78BFA",      // 亮紫
      secondary: "#22D3EE",    // 亮青
      accent: "#FCD34D",       // 亮黄
      background: "#0F172A",   // 深蓝黑
      text: "#E2E8F0",
      heading: "#F1F5F9",
      muted: "#94A3B8",
    },
  },
  fonts: {
    heading: "Orbitron",       // 未来感字体
    body: "Rajdhani",
  },
  borderRadius: "0.25rem",
  transitions: {
    default: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
  shadows: {
    light: {
      card: "0 4px 16px rgba(139,92,246,0.12)",
      button: "0 0 20px rgba(139,92,246,0.4)",  // 发光效果
    },
    dark: {
      card: "0 4px 24px rgba(167,139,250,0.25)",
      button: "0 0 30px rgba(167,139,250,0.6)",  // 更强的发光
    },
  },
},
```

---

## 配色灵感来源

### 在线工具

1. **Coolors.co** - https://coolors.co/
   - 快速生成配色方案
   
2. **Adobe Color** - https://color.adobe.com/
   - 基于色轮创建配色
   
3. **Happy Hues** - https://www.happyhues.co/
   - 预览完整的调色板在实际设计中的效果

4. **Tailwind Colors** - https://tailwindcss.com/docs/customizing-colors
   - 本项目使用的颜色系统

### 配色原则

1. **对比度**：文字与背景对比度要足够（WCAG 标准）
2. **一致性**：同一主题的深浅模式要保持风格统一
3. **层级感**：通过颜色深浅区分信息重要性
4. **品牌感**：主色调应该传达品牌特性
5. **可读性**：优先考虑内容的可读性

---

## 常见问题

### Q: 添加新主题后为什么没有显示？

A: 检查以下几点：
1. 是否在 `ThemeName` 类型中添加了主题名称
2. 是否保存了文件
3. 刷新浏览器（热重载可能有延迟）

### Q: 如何测试主题的深浅模式？

A: 点击页面右上角的 🌙/☀️ 图标切换深浅模式

### Q: 自定义字体怎么加载？

A: 
1. 使用 Google 字体：在 `src/app/layout.tsx` 中引入
2. 使用自定义字体：放入 `public/fonts/` 并在 CSS 中声明

### Q: 可以修改现有主题吗？

A: 
- 内置主题：直接修改 `themes.ts` 中的配置
- 自定义主题：通过数据库或 UI 重新创建

### Q: 主题保存在哪里？

A: 
- 内置主题：`src/lib/presentation/themes.ts` 文件
- 自定义主题：PostgreSQL 数据库中的 `CustomTheme` 表

---

## 高级技巧

### 1. 使用 CSS 变量

主题会自动转换为 CSS 变量，你可以在自定义样式中使用：

```css
.my-element {
  color: var(--presentation-primary);
  background: var(--presentation-background);
  font-family: var(--presentation-heading-font);
}
```

### 2. 条件渲染主题元素

在组件中根据主题调整样式：

```typescript
const { theme } = usePresentationState();
const isDarkMode = useTheme().resolvedTheme === 'dark';
```

### 3. 批量创建主题

如果需要创建多个相似主题，可以使用模板：

```typescript
const createVariant = (name: string, primaryColor: string): ThemeProperties => ({
  name,
  description: `${name} variant`,
  colors: {
    light: {
      primary: primaryColor,
      // ... 其他使用相同模板
    },
    dark: { /* ... */ }
  },
  // ... 其他共享配置
});

// 使用模板
const themes = {
  blue: createVariant("Blue", "#3B82F6"),
  red: createVariant("Red", "#EF4444"),
  green: createVariant("Green", "#10B981"),
};
```

---

## 下一步

现在你已经掌握了主题创建的所有知识！试着：

1. ✨ 创建一个反映你品牌风格的主题
2. 🎨 尝试不同的配色组合
3. 🚀 分享你的主题给其他用户

如有问题，请查看代码或提交 Issue。

Happy theming! 🎉
