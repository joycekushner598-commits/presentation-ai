/**
 * 正确尺寸的 PPT 生成器
 * 
 * 特点：
 * 1. 使用模板的原始尺寸（竖屏=竖屏，方形=方形）
 * 2. 保留原始 PPT 的背景图
 * 3. 不强制转换为横屏
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import PptxGenJS from 'pptxgenjs';

// ==========================================
// 模板定义 - 使用正确的尺寸和原始背景
// ==========================================

interface TemplateConfig {
    id: string;
    name: string;
    width: number;  // 像素
    height: number; // 像素
    backgroundPath: string; // 原始背景图路径
    slots: {
        title: { x: number; y: number; w: number; h: number; fontSize: number; color: string; align: 'left' | 'center' | 'right' };
        review: { x: number; y: number; w: number; h: number; fontSize: number; color: string; align: 'left' | 'center' | 'right' };
        rating: { x: number; y: number; w: number; h: number; fontSize: number; color: string; align: 'left' | 'center' | 'right' };
        social?: { x: number; y: number; w: number; h: number; fontSize: number; color: string; align: 'left' | 'center' | 'right' };
    };
}

// 模板 3：竖屏 1080x1920
const TEMPLATE_3: TemplateConfig = {
    id: 'template-3-vertical',
    name: '竖屏产品评价模板 (1080x1920)',
    width: 1080,
    height: 1920,
    backgroundPath: path.join(process.cwd(), '3pro-ppt', 'templates', 'bg-template-3.jpeg'),
    slots: {
        title: { x: 152, y: 261, w: 777, h: 248, fontSize: 91, color: '#000000', align: 'center' },
        rating: { x: 340, y: 1240, w: 400, h: 60, fontSize: 40, color: '#FFD700', align: 'center' },
        review: { x: 218, y: 1341, w: 640, h: 239, fontSize: 31, color: '#000000', align: 'center' },
        social: { x: 218, y: 1620, w: 640, h: 60, fontSize: 26, color: '#0066CC', align: 'center' },
    },
};

// 模板 1：方形 1080x1080  
const TEMPLATE_1: TemplateConfig = {
    id: 'template-1-square',
    name: '方形产品评价模板 (1080x1080)',
    width: 1080,
    height: 1080,
    backgroundPath: path.join(process.cwd(), '3pro-ppt', 'templates', 'bg-template-1.jpeg'),
    slots: {
        title: { x: 177, y: 829, w: 482, h: 68, fontSize: 39, color: '#FFFFFF', align: 'center' },
        rating: { x: 531, y: 460, w: 300, h: 50, fontSize: 32, color: '#FFD700', align: 'center' },
        review: { x: 445, y: 533, w: 499, h: 128, fontSize: 23, color: '#000000', align: 'center' },
        social: { x: 199, y: 901, w: 493, h: 72, fontSize: 28, color: '#333333', align: 'center' },
    },
};

// 模板 2：竖版 1080x1349
const TEMPLATE_2: TemplateConfig = {
    id: 'template-2-portrait',
    name: '竖版产品评价模板 (1080x1349)',
    width: 1080,
    height: 1349,
    backgroundPath: path.join(process.cwd(), '3pro-ppt', 'templates', 'bg-template-2.jpeg'),
    slots: {
        title: { x: 140, y: 1050, w: 800, h: 80, fontSize: 48, color: '#222222', align: 'center' },
        rating: { x: 340, y: 700, w: 400, h: 50, fontSize: 36, color: '#FFD700', align: 'center' },
        review: { x: 120, y: 780, w: 840, h: 220, fontSize: 26, color: '#333333', align: 'center' },
        social: { x: 140, y: 1150, w: 800, h: 60, fontSize: 24, color: '#0066CC', align: 'center' },
    },
};

// 当前使用的模板
const CURRENT_TEMPLATE = TEMPLATE_3;

// ==========================================
// 辅助函数
// ==========================================

function ratingToStars(rating: number | string): string {
    const num = typeof rating === 'string' ? parseInt(rating) : rating;
    if (isNaN(num) || num < 1) return '⭐';
    if (num > 5) return '⭐⭐⭐⭐⭐';
    return '⭐'.repeat(num);
}

function pixelToInch(px: number): number {
    return px / 96; // 96 DPI
}

async function downloadImageAsDataUri(url: string): Promise<string | null> {
    if (!url || !url.startsWith('http')) return null;
    try {
        console.log(`  ⬇️ Downloading: ${url.substring(0, 60)}...`);
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (!response.ok) return null;
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log(`  ✅ Downloaded (${Math.round(arrayBuffer.byteLength / 1024)}KB)`);
        return `data:${contentType};base64,${base64}`;
    } catch (e) {
        console.warn(`  ⚠️ Download error:`, e);
        return null;
    }
}

function loadBackgroundAsBase64(filePath: string): string | null {
    try {
        if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const base64 = fileBuffer.toString('base64');
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
            return `data:${mimeType};base64,${base64}`;
        }
    } catch (e) {
        console.warn(`  ⚠️ Failed to load background: ${filePath}`);
    }
    return null;
}

// ==========================================
// 环境设置
// ==========================================

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            if (key === 'GEMINI_API_KEY') {
                process.env[key] = value;
                console.log("✅ GEMINI_API_KEY loaded");
            }
        }
    });
}

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing!");
    process.exit(1);
}

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const HTML_DIR = path.join(process.cwd(), '3pro-ppt', 'html articles');
const OUTPUT_DIR = path.join(process.cwd(), '3pro-ppt', 'output', 'correct-size');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ==========================================
// 生成 PPT
// ==========================================

async function generatePPT(
    template: TemplateConfig,
    content: { title: string; rating: string; review: string; social?: string },
    productImageUrl: string | null,
    outputPath: string
) {
    console.log(`  🔨 Generating PPT with correct size: ${template.width}×${template.height}...`);

    const PptxGen = (PptxGenJS as any).default || PptxGenJS;
    const pptx = new PptxGen();

    // ⭐ 关键：设置自定义幻灯片尺寸（使用模板的正确尺寸）
    const widthInches = pixelToInch(template.width);
    const heightInches = pixelToInch(template.height);

    pptx.defineLayout({
        name: 'CUSTOM',
        width: widthInches,
        height: heightInches
    });
    pptx.layout = 'CUSTOM';

    const slide = pptx.addSlide();

    // 1. 添加原始背景图（保留原 PPT 的背景）
    const bgData = loadBackgroundAsBase64(template.backgroundPath);
    if (bgData) {
        slide.addImage({
            data: bgData,
            x: 0,
            y: 0,
            w: widthInches,
            h: heightInches,
            sizing: { type: 'cover', w: widthInches, h: heightInches },
        });
        console.log(`  🖼️ Added original background`);
    }

    // 2. 添加产品图片（如果有）
    if (productImageUrl) {
        const productData = await downloadImageAsDataUri(productImageUrl);
        if (productData) {
            // 产品图放在中间区域
            const imgX = pixelToInch(86);
            const imgY = pixelToInch(580);
            const imgW = pixelToInch(908);
            const imgH = pixelToInch(500);

            slide.addImage({
                data: productData,
                x: imgX,
                y: imgY,
                w: imgW,
                h: imgH,
                sizing: { type: 'cover', w: imgW, h: imgH },
            });
            console.log(`  🖼️ Added product image`);
        }
    }

    // 3. 添加文本内容
    const addText = (
        text: string,
        slot: { x: number; y: number; w: number; h: number; fontSize: number; color: string; align: 'left' | 'center' | 'right' }
    ) => {
        const x = pixelToInch(slot.x);
        const y = pixelToInch(slot.y);
        const w = pixelToInch(slot.w);
        const h = pixelToInch(slot.h);
        const fontSize = Math.round(slot.fontSize * 0.6); // 调整字号

        slide.addText(text, {
            x, y, w, h,
            fontSize: Math.max(8, Math.min(fontSize, 72)),
            color: slot.color.replace('#', ''),
            align: slot.align,
            valign: 'middle',
            wrap: true,
        });
    };

    // 标题
    addText(content.title, template.slots.title);
    console.log(`  📝 Title: ${content.title}`);

    // 评分
    addText(content.rating, template.slots.rating);
    console.log(`  ⭐ Rating: ${content.rating}`);

    // 评价
    addText(content.review, template.slots.review);
    console.log(`  💬 Review: ${content.review.substring(0, 30)}...`);

    // 社交/链接
    if (template.slots.social && content.social) {
        addText(content.social, template.slots.social);
        console.log(`  🔗 Social: ${content.social}`);
    }

    // 保存
    await pptx.writeFile({ fileName: outputPath });
    console.log(`  ✅ Saved: ${outputPath}`);
}

// ==========================================
// 处理 HTML 文件
// ==========================================

async function processHtmlFile(filePath: string): Promise<boolean> {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Processing: ${fileName}...`);

    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    console.log(`  📐 Template: ${CURRENT_TEMPLATE.name}`);
    console.log(`  📏 Size: ${CURRENT_TEMPLATE.width}×${CURRENT_TEMPLATE.height} (原始尺寸，非横屏！)`);
    console.log(`  🧠 Analyzing with Gemini...`);

    const systemPrompt = `
You are an expert content analyzer for presentation slides.
Extract key information from HTML to fill a PPT template.

Template: ${CURRENT_TEMPLATE.name}
Size: ${CURRENT_TEMPLATE.width}×${CURRENT_TEMPLATE.height}

Extract:
- TITLE: Short punchy title (max 25 chars)
- RATING: Numeric rating 1-5
- REVIEW: Powerful quote (max 150 chars)
- PRODUCT_URL: Main product URL
- PRODUCT_IMAGE_URL: Main product image URL

Return ONLY valid JSON: { title, rating, review, product_url, product_image_url }
`;

    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            system: systemPrompt,
            prompt: `Analyze this HTML:\n\n${htmlContent}`,
        });

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        console.log(`  ✅ Analysis: ${analysis.title}`);

        await generatePPT(
            CURRENT_TEMPLATE,
            {
                title: analysis.title || 'PRODUCT REVIEW',
                rating: ratingToStars(analysis.rating),
                review: analysis.review || '',
                social: '点击购买',
            },
            analysis.product_image_url,
            path.join(OUTPUT_DIR, fileName.replace('.html', '_vertical.pptx'))
        );

        return true;
    } catch (e) {
        console.error(`  ❌ Failed:`, e);
        return false;
    }
}

// ==========================================
// 主函数
// ==========================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     正确尺寸 PPT 生成器 - 竖屏就是竖屏！                   ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  模板: ${CURRENT_TEMPLATE.name.padEnd(48)}║`);
    console.log(`║  尺寸: ${CURRENT_TEMPLATE.width}×${CURRENT_TEMPLATE.height} (保持原始比例)`.padEnd(61) + '║');
    console.log(`║  背景: 使用原始 PPT 背景图`.padEnd(61) + '║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

    if (files.length === 0) {
        console.log("\n❌ No HTML files found");
        return;
    }

    console.log(`\n📁 Found ${files.length} HTML files`);
    console.log('━'.repeat(60));

    let success = 0, fail = 0;
    for (const file of files) {
        const result = await processHtmlFile(path.join(HTML_DIR, file));
        if (result) success++; else fail++;
    }

    console.log('\n' + '━'.repeat(60));
    console.log(`✅ Complete! Success: ${success}, Failed: ${fail}`);
    console.log(`📂 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
