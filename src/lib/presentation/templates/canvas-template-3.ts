/**
 * Canvas 模板 3 - 全屏竖版产品评价模板 (1080x1920)
 * 
 * 从 1 (3).pptx 提取并手动清理
 * 
 * 特点：
 * - 全屏竖版设计（9:16 比例）
 * - 适合 Instagram Stories / Reels / 小红书
 * - 大标题区域
 * - 产品图片区域
 * - 评价内容区
 * - 评价者姓名
 */

import { type SlideTemplate, type TemplateElement } from "./testimonial-template";

export const canvasTemplate3: SlideTemplate = {
    id: 'canvas-template-3',
    name: '全屏竖版评价模板',
    description: '1080x1920 全屏竖版，适合 Stories 和短视频封面',
    category: 'testimonial',
    size: {
        width: 1080,
        height: 1920,
    },

    elements: [
        // 1. 全屏背景图片
        {
            id: 'background',
            type: 'background',
            slot: 'background-image',
            position: { x: 0, y: 0 },
            size: { width: 1080, height: 1920 },
            style: {
                objectFit: 'cover',
                zIndex: 0,
            },
            imageQuery: 'elegant product photography lifestyle vertical',
            imageStyle: 'photo',
            optional: false,
            exampleContent: '全屏背景图',
        },

        // 2. 产品主图
        {
            id: 'product-image',
            type: 'image',
            slot: 'main-image',
            position: { x: 86, y: 580 },
            size: { width: 908, height: 715 },
            style: {
                objectFit: 'cover',
                zIndex: 2,
            },
            imageQuery: 'product showcase elegant',
            imageStyle: 'photo',
            optional: false,
            exampleContent: '产品展示图',
        },

        // 3. 大标题 "PRODUCT REVIEW"
        {
            id: 'main-title',
            type: 'text',
            slot: 'title',
            position: { x: 152, y: 261 },
            size: { width: 777, height: 248 },
            style: {
                fontSize: 91,
                fontFamily: 'Georgia, serif',
                fontWeight: 'bold',
                color: '#000000',
                textAlign: 'center',
                zIndex: 3,
            },
            constraints: {
                maxChars: 25,
                maxLines: 2,
                overflowStrategy: 'auto-scale',
            },
            optional: false,
            exampleContent: 'PRODUCT REVIEW',
        },

        // 4. 评价者姓名
        {
            id: 'reviewer-name',
            type: 'text',
            slot: 'meta',
            position: { x: 218, y: 1161 },
            size: { width: 640, height: 59 },
            style: {
                fontSize: 31,
                fontFamily: 'Georgia, serif',
                color: '#000000',
                textAlign: 'center',
                zIndex: 3,
            },
            constraints: {
                maxChars: 30,
                overflowStrategy: 'auto-scale',
            },
            optional: true,
            exampleContent: 'Olivia Wilson',
        },

        // 5. 评价内容
        {
            id: 'review-text',
            type: 'text',
            slot: 'review',
            position: { x: 218, y: 1341 },
            size: { width: 640, height: 239 },
            style: {
                fontSize: 31,
                fontFamily: 'Georgia, serif',
                lineHeight: 1.5,
                color: '#000000',
                textAlign: 'center',
                zIndex: 3,
            },
            constraints: {
                maxChars: 200,
                maxLines: 5,
                overflowStrategy: 'auto-scale',
            },
            optional: false,
            exampleContent: '"Thank you for the amazing product! It helped me improve so much..."',
        },

        // 6. 星级评分区
        {
            id: 'star-rating',
            type: 'text',
            slot: 'rating',
            position: { x: 340, y: 1240 },
            size: { width: 400, height: 60 },
            style: {
                fontSize: 40,
                color: '#FFD700',
                textAlign: 'center',
                letterSpacing: '10px',
                zIndex: 3,
            },
            constraints: {
                maxChars: 5,
                overflowStrategy: 'strict',
            },
            optional: false,
            exampleContent: '⭐⭐⭐⭐⭐',
        },

        // 7. 购买链接/社交
        {
            id: 'social-link',
            type: 'text',
            slot: 'social',
            position: { x: 218, y: 1620 },
            size: { width: 640, height: 60 },
            style: {
                fontSize: 26,
                color: '#0066CC',
                textAlign: 'center',
                zIndex: 3,
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
        '使用 <TEMPLATE template="canvas-template-3"> 标签来生成幻灯片',
        '标题简短有力，不超过25字符',
        '评价内容真实感人，不超过200字符',
        '适合竖屏全屏展示',
    ],
};

export default canvasTemplate3;
