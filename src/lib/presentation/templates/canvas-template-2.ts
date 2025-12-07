/**
 * Canvas 模板 2 - 竖版产品评价模板 (1080x1349)
 * 
 * 从 1 (2).pptx 提取并手动清理
 * 
 * 特点：
 * - 适合 Instagram/小红书 竖版帖子
 * - 产品展示区域
 * - 评价内容区
 */

import { type SlideTemplate, type TemplateElement } from "./testimonial-template";

export const canvasTemplate2: SlideTemplate = {
    id: 'canvas-template-2',
    name: '竖版产品评价模板',
    description: '1080x1349 竖版设计，适合社交媒体故事分享',
    category: 'testimonial',
    size: {
        width: 1080,
        height: 1349,
    },

    elements: [
        // 1. 背景图片
        {
            id: 'background',
            type: 'background',
            slot: 'background-image',
            position: { x: 0, y: 0 },
            size: { width: 1080, height: 1349 },
            style: {
                objectFit: 'cover',
                zIndex: 0,
            },
            imageQuery: 'product lifestyle elegant background',
            imageStyle: 'photo',
            optional: false,
            exampleContent: '产品场景背景图',
        },

        // 2. 内容卡片
        {
            id: 'content-card',
            type: 'background',
            slot: 'card-background',
            position: { x: 80, y: 600 },
            size: { width: 920, height: 600 },
            style: {
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: 20,
                zIndex: 1,
            },
            optional: false,
            exampleContent: '白色内容卡片',
        },

        // 3. 头像
        {
            id: 'avatar',
            type: 'image',
            slot: 'avatar-image',
            position: { x: 460, y: 520 },
            size: { width: 160, height: 160 },
            style: {
                objectFit: 'cover',
                borderRadius: 80,
                zIndex: 3,
            },
            imageQuery: 'happy customer portrait headshot',
            imageStyle: 'photo',
            optional: false,
            exampleContent: '客户头像',
        },

        // 4. 评分
        {
            id: 'star-rating',
            type: 'text',
            slot: 'rating',
            position: { x: 340, y: 700 },
            size: { width: 400, height: 50 },
            style: {
                fontSize: 36,
                color: '#FFD700',
                textAlign: 'center',
                zIndex: 2,
            },
            constraints: {
                maxChars: 5,
                overflowStrategy: 'strict',
            },
            optional: false,
            exampleContent: '⭐⭐⭐⭐⭐',
        },

        // 5. 评价内容
        {
            id: 'review-text',
            type: 'text',
            slot: 'review',
            position: { x: 120, y: 780 },
            size: { width: 840, height: 220 },
            style: {
                fontSize: 26,
                fontFamily: 'Georgia, serif',
                lineHeight: 1.5,
                color: '#333333',
                textAlign: 'center',
                zIndex: 2,
            },
            constraints: {
                maxChars: 300,
                maxLines: 6,
                overflowStrategy: 'auto-scale',
            },
            optional: false,
            exampleContent: '"这款产品太棒了！质量非常好，物超所值..."',
        },

        // 6. 标题
        {
            id: 'title',
            type: 'text',
            slot: 'title',
            position: { x: 140, y: 1050 },
            size: { width: 800, height: 80 },
            style: {
                fontSize: 48,
                fontWeight: 'bold',
                color: '#222222',
                textAlign: 'center',
                zIndex: 2,
            },
            constraints: {
                maxChars: 25,
                overflowStrategy: 'auto-scale',
            },
            optional: false,
            exampleContent: '强烈推荐！',
        },

        // 7. 链接
        {
            id: 'social-handle',
            type: 'text',
            slot: 'social',
            position: { x: 140, y: 1150 },
            size: { width: 800, height: 60 },
            style: {
                fontSize: 24,
                color: '#0066CC',
                textAlign: 'center',
                zIndex: 2,
            },
            constraints: {
                maxChars: 40,
                overflowStrategy: 'auto-scale',
            },
            optional: true,
            exampleContent: '点击链接购买 →',
        },
    ],

    aiPromptHints: [
        '使用 <TEMPLATE template="canvas-template-2"> 标签来生成幻灯片',
        '评价内容不超过300字符',
        '适合竖屏展示的内容',
    ],
};

export default canvasTemplate2;
