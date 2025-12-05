/**
 * 客户评价模板 (Testimonial Template)
 * 
 * 适用场景：
 * - 客户推荐
 * - 用户评价
 * - 案例展示
 * - 产品评论
 */

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'background';
  slot: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number | 'auto';
    height: number | 'auto';
  };
  style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
    lineHeight?: number;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    borderRadius?: number;
    objectFit?: 'cover' | 'contain' | 'fill';
    boxShadow?: string;
    letterSpacing?: string;
    zIndex?: number;
  };
  constraints?: {
    maxChars?: number;
    maxLines?: number;
    overflowStrategy?: 'auto-scale' | 'truncate' | 'strict';
  };
  imageQuery?: string;
  imageStyle?: 'photo' | 'illustration' | 'icon' | 'abstract';
  optional?: boolean;
  exampleContent?: string;
}

export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  category: 'title' | 'content' | 'testimonial' | 'summary';
  size: {
    width: number;
    height: number;
  };
  elements: TemplateElement[];
  aiPromptHints?: string[];
}

export const testimonialTemplate: SlideTemplate = {
  id: 'testimonial-with-photo',
  name: '客户评价模板',
  description: '带照片的客户评价页，适合展示用户反馈、产品评论、案例推荐',
  category: 'testimonial',
  size: {
    width: 1280,
    height: 720,
  },
  
  elements: [
    // 1. 背景图片
    {
      id: 'background',
      type: 'background',
      slot: 'background-image',
      position: { x: 0, y: 0 },
      size: { width: 1280, height: 720 },
      style: {
        objectFit: 'cover',
        zIndex: 0,
      },
      imageQuery: 'woman working laptop professional',
      imageStyle: 'photo',
      optional: false,
      exampleContent: '专业工作场景背景图',
    },

    // 2. 白色内容框
    {
      id: 'content-box',
      type: 'background',
      slot: 'decorative-box',
      position: { x: 280, y: 130 },
      size: { width: 700, height: 460 },
      style: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
        zIndex: 1,
      },
      optional: false,
      exampleContent: '白色内容背景框',
    },

    // 3. 主图片（人物照片）
    {
      id: 'person-photo',
      type: 'image',
      slot: 'main-image',
      position: { x: 150, y: 160 },
      size: { width: 280, height: 400 },
      style: {
        objectFit: 'cover',
        borderRadius: 10,
        zIndex: 2,
      },
      imageQuery: 'woman with headphones smiling professional portrait',
      imageStyle: 'photo',
      optional: false,
      exampleContent: '客户照片',
    },

    // 4. 左上引号装饰
    {
      id: 'quote-left',
      type: 'text',
      slot: 'decorative-quote-left',
      position: { x: 200, y: 100 },
      size: { width: 'auto', height: 'auto' },
      style: {
        fontSize: 100,
        fontFamily: "'Times New Roman', serif",
        fontWeight: 'bold',
        color: '#ffffff',
        lineHeight: 1,
        zIndex: 10,
      },
      constraints: {
        maxChars: 2,
        overflowStrategy: 'strict',
      },
      optional: true,
      exampleContent: '"',
    },

    // 5. 右下引号装饰
    {
      id: 'quote-right',
      type: 'text',
      slot: 'decorative-quote-right',
      position: { x: 880, y: 500 },
      size: { width: 'auto', height: 'auto' },
      style: {
        fontSize: 100,
        fontFamily: "'Times New Roman', serif",
        fontWeight: 'bold',
        color: '#ffffff',
        lineHeight: 1,
        zIndex: 10,
      },
      constraints: {
        maxChars: 2,
        overflowStrategy: 'strict',
      },
      optional: true,
      exampleContent: '"',
    },

    // 6. 客户姓名
    {
      id: 'customer-name',
      type: 'text',
      slot: 'meta',
      position: { x: 450, y: 170 },
      size: { width: 480, height: 'auto' },
      style: {
        fontSize: 40,
        fontFamily: "'Brush Script MT', cursive",
        color: '#8B4513',
        zIndex: 3,
      },
      constraints: {
        maxChars: 20,
        overflowStrategy: 'auto-scale',
      },
      optional: false,
      exampleContent: 'Claudia Alves',
    },

    // 7. 星级评分
    {
      id: 'star-rating',
      type: 'text',
      slot: 'statistic',
      position: { x: 450, y: 225 },
      size: { width: 'auto', height: 'auto' },
      style: {
        fontSize: 30,
        color: '#FFD700',
        letterSpacing: '5px',
        zIndex: 3,
      },
      constraints: {
        maxChars: 5,
        overflowStrategy: 'strict',
      },
      optional: false,
      exampleContent: '⭐⭐⭐⭐⭐',
    },

    // 8. 评价内容
    {
      id: 'review-text',
      type: 'text',
      slot: 'content',
      position: { x: 450, y: 280 },
      size: { width: 480, height: 'auto' },
      style: {
        fontSize: 22,
        fontFamily: "'Georgia', serif",
        lineHeight: 1.5,
        color: '#333333',
        zIndex: 3,
      },
      constraints: {
        maxChars: 300,
        maxLines: 8,
        overflowStrategy: 'auto-scale',
      },
      optional: false,
      exampleContent: 'Are you searching for the epitome of simplicity in fashion? Take a look at this elegant collection! I have explored its offerings three times, and each visit has revealed a delightful selection of stylish discoveries.',
    },
  ],

  // AI 生成提示建议
  aiPromptHints: [
    '生成客户评价，包含客户姓名、5星评分和详细评论',
    '评论内容要真实、具体、有细节',
    '姓名不超过20字符',
    '评价内容不超过300字符',
    '图片：客户专业照片和相关背景图',
  ],
};

// 导出模板配置
export default testimonialTemplate;
