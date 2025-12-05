// 主题模板 - 复制此模板创建新主题
// 文件位置：src/lib/presentation/themes.ts

// ============================================
// 第 1 步：在 ThemeName 类型中添加主题名
// ============================================
export type ThemeName =
  | "daktilo"
  | "cornflower"
  // ... 其他主题
  | "yourThemeName";  // 👈 改成你的主题名（小写，无空格）


// ============================================
// 第 2 步：在 themes 对象中添加完整配置
// ============================================
export const themes: Record<ThemeName, ThemeProperties> = {
  // ... 现有主题 ...
  
  yourThemeName: {  // 👈 与上面的名称一致
    name: "Your Theme Display Name",  // 显示名称（可以有空格、大写）
    description: "简短的主题描述",      // 会显示在主题选择器中
    
    colors: {
      // ===== 浅色模式配色 =====
      light: {
        primary: "#3B82F6",      // 主色调 - 品牌主色
        secondary: "#1F2937",    // 次要色 - 辅助颜色
        accent: "#60A5FA",       // 强调色 - 高亮/悬停效果
        background: "#FFFFFF",   // 背景色 - 页面背景
        text: "#1F2937",         // 文本色 - 正文文字
        heading: "#111827",      // 标题色 - 标题文字
        muted: "#6B7280",        // 弱化色 - 次要信息
      },
      
      // ===== 深色模式配色 =====
      dark: {
        primary: "#60A5FA",      // 深色模式主色（通常更亮）
        secondary: "#E5E7EB",    // 深色模式次要色
        accent: "#93C5FD",       // 深色模式强调色
        background: "#111827",   // 深色背景
        text: "#E5E7EB",         // 浅色文字
        heading: "#F9FAFB",      // 更亮的标题
        muted: "#9CA3AF",        // 深色模式弱化文字
      },
    },
    
    fonts: {
      heading: "Inter",          // 标题字体
      body: "Inter",             // 正文字体
    },
    
    borderRadius: "0.5rem",      // 圆角大小（0.25/0.5/0.75/1rem）
    
    transitions: {
      default: "all 0.3s ease",  // 动画过渡效果
    },
    
    shadows: {
      light: {
        card: "0 1px 3px rgba(0,0,0,0.12)",     // 卡片阴影
        button: "0 2px 4px rgba(0,0,0,0.1)",    // 按钮阴影
      },
      dark: {
        card: "0 1px 3px rgba(0,0,0,0.3)",      // 深色模式卡片阴影
        button: "0 2px 4px rgba(0,0,0,0.2)",    // 深色模式按钮阴影
      },
    },
  },
};


// ============================================
// 实用配色示例
// ============================================

// 1. 蓝色系（专业、科技）
light: {
  primary: "#0EA5E9",
  secondary: "#0284C7",
  accent: "#38BDF8",
  background: "#F0F9FF",
  text: "#0C4A6E",
  heading: "#075985",
  muted: "#64748B",
}

// 2. 绿色系（自然、环保）
light: {
  primary: "#059669",
  secondary: "#047857",
  accent: "#34D399",
  background: "#F0FDF4",
  text: "#1F2937",
  heading: "#064E3B",
  muted: "#6B7280",
}

// 3. 紫色系（创意、优雅）
light: {
  primary: "#8B5CF6",
  secondary: "#7C3AED",
  accent: "#A78BFA",
  background: "#FAF5FF",
  text: "#1F2937",
  heading: "#5B21B6",
  muted: "#6B7280",
}

// 4. 红色系（热情、活力）
light: {
  primary: "#DC2626",
  secondary: "#B91C1C",
  accent: "#F87171",
  background: "#FEF2F2",
  text: "#1F2937",
  heading: "#7F1D1D",
  muted: "#6B7280",
}

// 5. 粉色系（浪漫、柔和）
light: {
  primary: "#EC4899",
  secondary: "#DB2777",
  accent: "#F9A8D4",
  background: "#FDF2F8",
  text: "#78350F",
  heading: "#831843",
  muted: "#A8A29E",
}


// ============================================
// 常用字体组合
// ============================================

// 现代简洁
fonts: {
  heading: "Inter",
  body: "Inter",
}

// 专业商务
fonts: {
  heading: "Montserrat",
  body: "Open Sans",
}

// 优雅经典
fonts: {
  heading: "Playfair Display",
  body: "Source Sans Pro",
}

// 科技未来
fonts: {
  heading: "Space Grotesk",
  body: "IBM Plex Sans",
}

// 友好可爱
fonts: {
  heading: "Poppins",
  body: "Nunito",
}


// ============================================
// 阴影效果参考
// ============================================

// 轻微阴影（扁平设计）
shadows: {
  light: {
    card: "0 1px 3px rgba(0,0,0,0.06)",
    button: "0 1px 2px rgba(0,0,0,0.05)",
  },
}

// 中等阴影（现代设计）
shadows: {
  light: {
    card: "0 4px 12px rgba(0,0,0,0.1)",
    button: "0 2px 8px rgba(0,0,0,0.12)",
  },
}

// 明显阴影（立体设计）
shadows: {
  light: {
    card: "0 8px 24px rgba(0,0,0,0.15)",
    button: "0 4px 12px rgba(0,0,0,0.2)",
  },
}

// 带颜色的阴影（品牌设计）
shadows: {
  light: {
    card: "0 4px 12px rgba(59,130,246,0.1)",     // 使用主色
    button: "0 2px 8px rgba(59,130,246,0.15)",
  },
}


// ============================================
// 圆角大小参考
// ============================================

borderRadius: "0rem"        // 无圆角（硬朗、现代）
borderRadius: "0.25rem"     // 小圆角（4px）
borderRadius: "0.5rem"      // 中等圆角（8px，推荐）
borderRadius: "0.75rem"     // 大圆角（12px）
borderRadius: "1rem"        // 很大圆角（16px，柔和）


// ============================================
// 过渡动画参考
// ============================================

transitions: {
  default: "all 0.2s linear"                              // 线性、快速
  default: "all 0.3s ease"                                // 标准、平滑
  default: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"       // 自然、优雅
  default: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)" // 弹性、活泼
}


// ============================================
// 完整示例：创建"薄荷"主题
// ============================================

// 1. 添加到 ThemeName
export type ThemeName =
  | "daktilo"
  // ... 其他
  | "mint";

// 2. 添加完整配置
export const themes: Record<ThemeName, ThemeProperties> = {
  // ... 其他主题
  
  mint: {
    name: "Mint",
    description: "清新薄荷，活力四射",
    colors: {
      light: {
        primary: "#10B981",      // 薄荷绿
        secondary: "#059669",    // 深绿
        accent: "#34D399",       // 浅绿
        background: "#F0FDF4",   // 浅绿背景
        text: "#1F2937",
        heading: "#064E3B",
        muted: "#6B7280",
      },
      dark: {
        primary: "#34D399",
        secondary: "#6EE7B7",
        accent: "#A7F3D0",
        background: "#064E3B",   // 深绿背景
        text: "#ECFDF5",
        heading: "#F0FDF4",
        muted: "#9CA3AF",
      },
    },
    fonts: {
      heading: "Quicksand",
      body: "Nunito",
    },
    borderRadius: "1rem",        // 圆润风格
    transitions: {
      default: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    shadows: {
      light: {
        card: "0 4px 12px rgba(16,185,129,0.08)",
        button: "0 2px 8px rgba(16,185,129,0.12)",
      },
      dark: {
        card: "0 4px 12px rgba(52,211,153,0.15)",
        button: "0 2px 8px rgba(52,211,153,0.2)",
      },
    },
  },
};
