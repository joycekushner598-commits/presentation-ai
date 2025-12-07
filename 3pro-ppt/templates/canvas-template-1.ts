/**
 * Canvas 模板 1 - 产品评价模板（方形 1080x1080）
 * 
 * 从 1 (1).pptx 提取并手动清理
 * 
 * 特点：
 * - 全屏背景图
 * - 圆形头像
 * - 五星评分
 * - 评价文字
 * - 产品标题
 * - 社交账号链接
 */

import { type SlideTemplate, type TemplateElement } from "../../../src/lib/presentation/templates/testimonial-template";

export const canvasTemplate1: SlideTemplate = {
    id: 'canvas-template-1',
    name: '产品评价方形模板',
    description: '1080x1080 方形设计，适合社交媒体分享',
    category: 'testimonial',
    size: {
        width: 1080,
        height: 1080,
    },

    elements: [
        // 1. 背景图片
        {
            id: 'background',
            type: 'background',
            slot: 'background-image',
            position: { x: 0, y: 0 },
            size: { width: 1080, height: 1080 },
            style: {
                objectFit: 'cover',
                zIndex: 0,
            },
            imageQuery: 'lifestyle product photography modern',
            imageStyle: 'photo',
            optional: false,
            exampleContent: '生活场景背景图',
        },

        // 2. 白色半透明卡片
        {
            id: 'content-card',
            type: 'background',
            slot: 'card-background',
            position: { x: 418, y: 409 },
            size: { width: 594, height: 298 },
            style: {
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 13,
                zIndex: 1,
            },
            optional: false,
            exampleContent: '白色半透明卡片',
        },

        // 3. 圆形头像
        {
            id: 'avatar',
            type: 'image',
            slot: 'avatar-image',
            position: { x: 621, y: 295 },
            size: { width: 148, height: 148 },
            style: {
                objectFit: 'cover',
                borderRadius: 74,
                zIndex: 3,
            },
            imageQuery: 'professional woman portrait headshot smiling',
            imageStyle: 'photo',
            optional: false,
            exampleContent: '用户头像',
        },

        // 4. 星级评分
        {
            id: 'star-rating',
            type: 'text',
            slot: 'rating',
            position: { x: 531, y: 460 },
            size: { width: 300, height: 50 },
            style: {
                fontSize: 32,
                color: '#FFD700',
                textAlign: 'center',
                letterSpacing: '8px',
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
            position: { x: 445, y: 533 },
            size: { width: 499, height: 128 },
            style: {
                fontSize: 23,
                fontFamily: 'Georgia, serif',
                lineHeight: 1.4,
                color: '#000000',
                textAlign: 'center',
                zIndex: 2,
            },
            constraints: {
                maxChars: 200,
                maxLines: 4,
                overflowStrategy: 'auto-scale',
            },
            optional: false,
            exampleContent: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit."',
        },

        // 6. 标题
        {
            id: 'title',
            type: 'text',
            slot: 'title',
            position: { x: 177, y: 829 },
            size: { width: 482, height: 68 },
            style: {
                fontSize: 41,
                fontFamily: 'Brush Script MT, cursive',
                color: '#FFFFFF',
                textAlign: 'center',
                zIndex: 2,
            },
            constraints: {
                maxChars: 30,
                overflowStrategy: 'auto-scale',
            },
            optional: false,
            exampleContent: 'Review Product',
        },

        // 7. 社交账号/链接
        {
            id: 'social-handle',
            type: 'text',
            slot: 'social',
            position: { x: 199, y: 902 },
            size: { width: 493, height: 72 },
            style: {
                fontSize: 28,
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '2px',
                color: '#333333',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                zIndex: 2,
            },
            constraints: {
                maxChars: 30,
                overflowStrategy: 'auto-scale',
            },
            optional: true,
            exampleContent: '点击购买',
        },
    ],

    aiPromptHints: [
        '使用 <TEMPLATE template="canvas-template-1"> 标签来生成幻灯片',
        '评价内容要简洁有力，不超过200字符',
        '星级评分用数字1-5表示',
    ],
};

export default canvasTemplate1;
