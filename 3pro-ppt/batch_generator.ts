/**
 * 批量 PPT 生成器
 * 
 * 功能：
 * 1. 从 HTML 文章中提取内容
 * 2. 随机选择模板
 * 3. 使用 AI 分析内容生成 PPT
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { PlateJSToPPTXConverter } from '../src/components/presentation/utils/exportToPPT';
import { slideTemplates, slideTemplateList, type SlideTemplate } from '../src/lib/presentation/templates';

// ==========================================
// Local Type Definitions for Script Safety
// ==========================================

interface ImageCropSettings {
    objectFit: "cover" | "contain" | "fill" | "none" | "scale-down";
    objectPosition: { x: number; y: number };
}

interface RootImage {
    url?: string;
    query: string;
    cropSettings?: ImageCropSettings;
}

interface TTemplateSlideElement {
    type: "template-slide";
    templateId: string;
    content: Record<string, string>;
    images: Record<string, string>;
    links?: Record<string, string>;  // slot -> URL for hyperlinks
    children: [{ text: "" }];
    [key: string]: unknown;
}

type PlateNode = TTemplateSlideElement | { type?: string; children?: any[] };

type PlateSlide = {
    id: string;
    content: PlateNode[];
    rootImage?: RootImage;
    layoutType?: any;
    alignment?: "start" | "center" | "end";
    bgColor?: string;
    width?: "S" | "M" | "L";
};

interface TemplateInfo {
    id: string;
    name: string;
    size: { width: number; height: number };
    slots: string[];
    imageSlots: string[];
}

// ==========================================
// Image Download Utility
// ==========================================

/**
 * 下载在线图片并转换为 Base64 Data URI
 * @param url 图片 URL
 * @returns Base64 Data URI 或 null（如果下载失败）
 */
async function downloadImageAsDataUri(url: string): Promise<string | null> {
    if (!url || !url.startsWith('http')) {
        console.log(`  ⏭️ Skipping non-http URL: ${url?.substring(0, 50)}...`);
        return null;
    }

    try {
        console.log(`  ⬇️ Downloading: ${url.substring(0, 60)}...`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            console.warn(`  ⚠️ Failed to download (${response.status}): ${url}`);
            return null;
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUri = `data:${contentType};base64,${base64}`;

        console.log(`  ✅ Downloaded (${Math.round(arrayBuffer.byteLength / 1024)}KB)`);
        return dataUri;
    } catch (e) {
        console.warn(`  ⚠️ Download error:`, e);
        return null;
    }
}

/**
 * 将数字评分转换为星星符号
 * @param rating 数字评分 (1-5)
 * @returns 星星符号字符串
 */
function ratingToStars(rating: number | string): string {
    const num = typeof rating === 'string' ? parseInt(rating) : rating;
    if (isNaN(num) || num < 1) return '⭐';
    if (num > 5) return '⭐⭐⭐⭐⭐';
    return '⭐'.repeat(num);
}

// 默认头像占位图 (简单的灰色圆形 SVG 转 Base64)
const DEFAULT_AVATAR_DATA_URI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDgiIGhlaWdodD0iMTQ4IiB2aWV3Qm94PSIwIDAgMTQ4IDE0OCI+PGNpcmNsZSBjeD0iNzQiIGN5PSI3NCIgcj0iNzQiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI3NCIgY3k9IjU1IiByPSIyNSIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0yNSAxMzBjMC0yNyAyMi00OSA0OS00OXM0OSAyMiA0OSA0OSIgZmlsbD0iI2JkYmRiZCIvPjwvc3ZnPg==';

// ==========================================
// Environment & Setup
// ==========================================

const envPath = path.join(process.cwd(), '.env');
function cleanEnvValue(val: string) {
    return val.trim().replace(/^["']|["']$/g, '');
}

if (fs.existsSync(envPath)) {
    try {
        const envFile = fs.readFileSync(envPath, 'utf-8');
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=');
                if (key === 'GEMINI_API_KEY') {
                    process.env[key] = cleanEnvValue(value);
                    console.log("✅ GEMINI_API_KEY loaded manually");
                }
            }
        });
    } catch (e) {
        console.warn("⚠️ Could not read .env file", e);
    }
}

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing!");
    process.exit(1);
}

const HTML_DIR = path.join(process.cwd(), '3pro-ppt', 'html articles');
const OUTPUT_DIR = path.join(process.cwd(), '3pro-ppt', 'output');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// ==========================================
// 获取可用模板列表
// ==========================================

function getAvailableTemplates(): TemplateInfo[] {
    return slideTemplateList.map(t => ({
        id: t.id,
        name: t.name,
        size: t.size,
        slots: t.elements.filter(e => e.type === 'text').map(e => e.slot),
        imageSlots: t.elements.filter(e => e.type === 'image' || e.type === 'background').map(e => e.slot),
    }));
}

function getRandomTemplateInfo(): TemplateInfo {
    const templates = getAvailableTemplates();
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
}

async function processHtmlFile(filePath: string) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Processing: ${fileName}...`);

    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    // 随机选择模板
    const selectedTemplate = getRandomTemplateInfo();

    console.log(`  🎲 Random template: ${selectedTemplate.name} (${selectedTemplate.id})`);
    console.log(`  📐 Template size: ${selectedTemplate.size.width}×${selectedTemplate.size.height}`);
    console.log(`  🧠 Analyzing content with Gemini...`);

    const systemPrompt = `
  You are an expert content analyzer for presentation slides.
  Your goal is to extract key information from the user's HTML article to fill a PPT template.
  
  The selected template is: "${selectedTemplate.name}" (${selectedTemplate.id})
  Template size: ${selectedTemplate.size.width}×${selectedTemplate.size.height}
  
  The template requires these text slots: ${selectedTemplate.slots.join(', ')}
  The template requires these image slots: ${selectedTemplate.imageSlots.join(', ')}
  
  Please extract:
  - TITLE: A short, punchy title (max 5 words).
  - RATING: A numeric rating (1-5) based on the sentiment (5 = excellent).
  - REVIEW: A powerful, short quote or summary sentence from the article (max 150 chars).
  - PRODUCT_URL: Extract the main product or category URL from the <a> tag in the HTML. Must start with http. This is the link to buy or view the product.
  - BACKGROUND_IMAGE_URL: Extract the FULL main product/lifestyle image URL from the <img> tag in the HTML. Must start with http.
  - AVATAR_IMAGE_URL: Extract the customer/reviewer avatar/profile image URL if available. Must start with http. If no avatar found, return null.
  
  Return ONLY a valid JSON object with these keys: title, rating, review, product_url, background_image_url, avatar_image_url.
  `;

    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            system: systemPrompt,
            prompt: `Analyze this HTML content:\n\n${htmlContent}`,
        });

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);
        console.log(`  ✅ Analysis complete:`, analysis.title);
        console.log(`  🔗 Product URL:`, analysis.product_url);
        console.log(`  🖼️ Background URL:`, analysis.background_image_url);
        console.log(`  👤 Avatar URL:`, analysis.avatar_image_url);

        // ========== 下载图片并转换为 Base64 ==========
        let backgroundDataUri: string | null = null;
        let avatarDataUri: string | null = null;

        if (analysis.background_image_url) {
            backgroundDataUri = await downloadImageAsDataUri(analysis.background_image_url);
        }

        if (analysis.avatar_image_url) {
            avatarDataUri = await downloadImageAsDataUri(analysis.avatar_image_url);
        }

        // 构建 Slide 数据
        const socialValue = analysis.product_url || '@Reviewer';
        console.log(`  📝 Social content:`, socialValue);

        const templateNode: TTemplateSlideElement = {
            type: "template-slide",
            templateId: selectedTemplate.id,
            content: {
                'title': analysis.title,
                'rating': ratingToStars(analysis.rating),
                'review': analysis.review,
                'social': '点击购买',  // Display text for the link
            },
            images: {
                'background-image': backgroundDataUri || '',
                'avatar-image': avatarDataUri || DEFAULT_AVATAR_DATA_URI
            },
            links: {
                'social': analysis.product_url || '',  // URL for the social slot hyperlink
            },
            children: [{ text: "" }]
        };

        const slide: PlateSlide = {
            id: `slide-${Date.now()}`,
            layoutType: 'blank',
            content: [templateNode],
        };

        console.log(`  🔨 Generating PPT with template: ${selectedTemplate.id}...`);
        const converter = new PlateJSToPPTXConverter();

        const presentationData: any = {
            id: 'batch-gen',
            title: analysis.title,
            slides: [slide]
        };

        const pptx = await converter.convertToPPTX(presentationData);

        // 输出文件名包含模板信息
        const templateSuffix = selectedTemplate.id.replace('canvas-template-', 'tpl').replace('product-review-', 'pr-').replace('testimonial-', 'ts-');
        const outputName = fileName.replace('.html', `_${templateSuffix}.pptx`);
        const outputPath = path.join(OUTPUT_DIR, outputName);

        await pptx.writeFile({ fileName: outputPath });

        console.log(`  ✨ Saved to: ${outputPath}`);

    } catch (e) {
        console.error(`  ❌ Failed to process file:`, e);
    }
}

async function main() {
    console.log('🚀 PPT Batch Generator with Random Template Selection');
    console.log('='.repeat(60));

    // 显示可用模板
    const templates = getAvailableTemplates();
    console.log(`\n📋 Available templates (${templates.length}):`);
    templates.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name} (${t.id}) - ${t.size.width}×${t.size.height}`);
    });

    const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

    if (files.length === 0) {
        console.log("No HTML files found in", HTML_DIR);
        return;
    }

    console.log(`\n📁 Found ${files.length} HTML files to process.`);
    console.log('='.repeat(60));

    for (const file of files) {
        await processHtmlFile(path.join(HTML_DIR, file));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Batch processing complete!');
}

main().catch(console.error);
