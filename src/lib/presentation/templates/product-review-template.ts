/**
 * 产品评价模板 (Product Review Template)
 * 
 * 基于 1(1).pptx 解析生成
 * 
 * 适用场景：
 * - 产品评价展示
 * - 社交媒体推广
 * - 用户反馈展示
 */

import { type SlideTemplate, type TemplateElement } from "./testimonial-template";

// EMU to pixels conversion (1 inch = 914400 EMUs, 96 DPI)
// Original size: 10287000 EMUs ≈ 1080 pixels at 96 DPI
// We'll use 1080x1080 as our canvas

export const productReviewTemplate: SlideTemplate = {
    id: 'product-review-square',
    name: '产品评价方形模板',
    description: '正方形设计，适合社交媒体分享、产品评价展示、Instagram帖子',
    category: 'testimonial',
    size: {
        width: 1080,
        height: 1080,
    },

    elements: [
        // 1. 背景图片 (全屏)
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
            imageQuery: 'woman using phone lifestyle modern',
            imageStyle: 'photo',
            optional: false,
            exampleContent: '生活场景背景图',
        },

        // 2. 白色圆角卡片 (半透明)
        {
            id: 'content-card',
            type: 'background',
            slot: 'card-background',
            position: { x: 418, y: 409 },  // Converted from EMU
            size: { width: 594, height: 298 },
            style: {
                backgroundColor: 'rgba(255, 255, 255, 0.86)',
                borderRadius: 13,
                zIndex: 1,
            },
            optional: false,
            exampleContent: '白色半透明卡片',
        },

        // 3. 头像 (圆形)
        {
            id: 'avatar',
            type: 'image',
            slot: 'avatar-image',
            position: { x: 621, y: 295 },
            size: { width: 148, height: 148 },
            style: {
                objectFit: 'cover',
                borderRadius: 74,  // 圆形
                zIndex: 3,
            },
            imageQuery: 'professional woman portrait headshot smiling',
            imageStyle: 'photo',
            optional: false,
            exampleContent: '用户头像',
        },

        // 4. 星级评分 (5颗星)
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
                fontSize: 24,
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
            exampleContent: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec magna leo."',
        },

        // 6. 标题 "Review Product" (艺术字体)
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

        // 7. 社交账号
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
            exampleContent: '@reallygreatsite',
        },
    ],

    // AI 生成提示建议
    aiPromptHints: [
        '【重要】使用 <PRODUCT-REVIEW> 标签来生成幻灯片',
        '结构：<PRODUCT-REVIEW template="product-review-square"><RATING>5</RATING><REVIEW>评价内容</REVIEW><TITLE>标题</TITLE><SOCIAL>@账号</SOCIAL><IMG query="..." slot="avatar-image" /><IMG query="..." slot="background-image" /></PRODUCT-REVIEW>',
        '评价内容要简洁有力，不超过200字符',
        '星级评分用数字1-5表示',
        '头像图片应该是专业人像',
        '背景图片应该是生活场景',
    ],
};

export default productReviewTemplate;
