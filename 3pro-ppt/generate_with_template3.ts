/**
 * 使用模板 3 批量生成 PPT
 * 
 * 使用 canvas-template-3 (全屏竖版 1080x1920) 转换所有 HTML 文章
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { PlateJSToPPTXConverter } from '../src/components/presentation/utils/exportToPPT';

// ==========================================
// 固定使用模板 3
// ==========================================

const TEMPLATE_ID = 'canvas-template-3';
const TEMPLATE_NAME = '全屏竖版评价模板';
const TEMPLATE_SIZE = { width: 1080, height: 1920 };
const TEMPLATE_SLOTS = ['title', 'rating', 'review', 'social', 'meta'];
const TEMPLATE_IMAGE_SLOTS = ['background-image', 'main-image'];

// ==========================================
// Type Definitions
// ==========================================

interface TTemplateSlideElement {
    type: "template-slide";
    templateId: string;
    content: Record<string, string>;
    images: Record<string, string>;
    links?: Record<string, string>;
    children: [{ text: "" }];
    [key: string]: unknown;
}

type PlateSlide = {
    id: string;
    content: TTemplateSlideElement[];
    layoutType?: any;
};

// ==========================================
// Image Download Utility
// ==========================================

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

function ratingToStars(rating: number | string): string {
    const num = typeof rating === 'string' ? parseInt(rating) : rating;
    if (isNaN(num) || num < 1) return '⭐';
    if (num > 5) return '⭐⭐⭐⭐⭐';
    return '⭐'.repeat(num);
}

const DEFAULT_AVATAR_DATA_URI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDgiIGhlaWdodD0iMTQ4IiB2aWV3Qm94PSIwIDAgMTQ4IDE0OCI+PGNpcmNsZSBjeD0iNzQiIGN5PSI3NCIgcj0iNzQiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI3NCIgY3k9IjU1IiByPSIyNSIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0yNSAxMzBjMC0yNyAyMi00OSA0OS00OXM0OSAyMiA0OSA0OSIgZmlsbD0iI2JkYmRiZCIvPjwvc3ZnPg==';

// ==========================================
// Environment Setup
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
                    console.log("✅ GEMINI_API_KEY loaded");
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
const OUTPUT_DIR = path.join(process.cwd(), '3pro-ppt', 'output', 'template3');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// ==========================================
// Process HTML File
// ==========================================

async function processHtmlFile(filePath: string) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Processing: ${fileName}...`);

    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    console.log(`  📐 Using template: ${TEMPLATE_NAME} (${TEMPLATE_ID})`);
    console.log(`  📏 Size: ${TEMPLATE_SIZE.width}×${TEMPLATE_SIZE.height}`);
    console.log(`  🧠 Analyzing content with Gemini...`);

    const systemPrompt = `
  You are an expert content analyzer for presentation slides.
  Your goal is to extract key information from the user's HTML article to fill a PPT template.
  
  The template is: "${TEMPLATE_NAME}" (${TEMPLATE_ID})
  Template size: ${TEMPLATE_SIZE.width}×${TEMPLATE_SIZE.height} (Full screen vertical)
  
  The template requires these text slots: ${TEMPLATE_SLOTS.join(', ')}
  The template requires these image slots: ${TEMPLATE_IMAGE_SLOTS.join(', ')}
  
  Please extract:
  - TITLE: A short, punchy title (max 25 chars, 2 lines max). Example: "PRODUCT REVIEW"
  - RATING: A numeric rating (1-5) based on the sentiment (5 = excellent).
  - REVIEW: A powerful testimonial quote from the article (max 150 chars).
  - META: Reviewer name or source (max 30 chars). Example: "Olivia Wilson"
  - PRODUCT_URL: Extract the main product URL from <a> tags. Must start with http.
  - BACKGROUND_IMAGE_URL: Main product/lifestyle image URL from <img> tags. Must start with http.
  - PRODUCT_IMAGE_URL: Secondary product image if available. Must start with http.
  
  Return ONLY a valid JSON object with these keys: 
  title, rating, review, meta, product_url, background_image_url, product_image_url
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
        console.log(`  👤 Reviewer:`, analysis.meta || 'N/A');
        console.log(`  ⭐ Rating:`, analysis.rating);
        console.log(`  🔗 Product URL:`, analysis.product_url);

        // Download images
        let backgroundDataUri: string | null = null;
        let productDataUri: string | null = null;

        if (analysis.background_image_url) {
            backgroundDataUri = await downloadImageAsDataUri(analysis.background_image_url);
        }

        if (analysis.product_image_url) {
            productDataUri = await downloadImageAsDataUri(analysis.product_image_url);
        }

        // Build slide data
        const templateNode: TTemplateSlideElement = {
            type: "template-slide",
            templateId: TEMPLATE_ID,
            content: {
                'title': analysis.title || 'PRODUCT REVIEW',
                'rating': ratingToStars(analysis.rating),
                'review': analysis.review || '',
                'meta': analysis.meta || 'Happy Customer',
                'social': '点击购买',
            },
            images: {
                'background-image': backgroundDataUri || '',
                'main-image': productDataUri || backgroundDataUri || '',
            },
            links: {
                'social': analysis.product_url || '',
            },
            children: [{ text: "" }]
        };

        const slide: PlateSlide = {
            id: `slide-${Date.now()}`,
            layoutType: 'blank',
            content: [templateNode],
        };

        console.log(`  🔨 Generating PPT...`);
        const converter = new PlateJSToPPTXConverter();

        const presentationData: any = {
            id: 'batch-gen-template3',
            title: analysis.title,
            slides: [slide]
        };

        const pptx = await converter.convertToPPTX(presentationData);

        const outputName = fileName.replace('.html', '_tpl3_vertical.pptx');
        const outputPath = path.join(OUTPUT_DIR, outputName);

        await pptx.writeFile({ fileName: outputPath });

        console.log(`  ✨ Saved to: ${outputPath}`);
        return true;

    } catch (e) {
        console.error(`  ❌ Failed to process file:`, e);
        return false;
    }
}

// ==========================================
// Main
// ==========================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  PPT Generator with Template 3 (Full Screen Vertical)     ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Template: ${TEMPLATE_NAME.padEnd(46)}║`);
    console.log(`║  Size: ${TEMPLATE_SIZE.width}×${TEMPLATE_SIZE.height} (9:16 vertical format)`.padEnd(61) + '║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

    if (files.length === 0) {
        console.log("\n❌ No HTML files found in", HTML_DIR);
        return;
    }

    console.log(`\n📁 Found ${files.length} HTML files to process.`);
    console.log('━'.repeat(60));

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const success = await processHtmlFile(path.join(HTML_DIR, file));
        if (success) successCount++;
        else failCount++;
    }

    console.log('\n' + '━'.repeat(60));
    console.log(`✅ Complete! Success: ${successCount}, Failed: ${failCount}`);
    console.log(`📂 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
