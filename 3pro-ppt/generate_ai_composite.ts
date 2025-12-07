/**
 * AI 图片合成 PPT 生成器
 * 
 * 使用 Gemini nano-banana 将产品图和网红图合成
 * 生成"网红带产品"的图片放入 PPT
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import PptxGenJS from 'pptxgenjs';

// ==========================================
// 配置
// ==========================================

interface SlotConfig {
    x: number; y: number; w: number; h: number;
    fontSize: number;
    color: string;
    align: 'left' | 'center' | 'right';
    fontFace?: string;
    bold?: boolean;
    italic?: boolean;
}

interface ImageSlotConfig {
    x: number; y: number; w: number; h: number;
}

interface TemplateConfig {
    id: string;
    name: string;
    width: number;
    height: number;
    backgroundPath: string;
    slots: {
        title: SlotConfig;
        review: SlotConfig;
        rating: SlotConfig;
        social?: SlotConfig;
    };
    productImage?: ImageSlotConfig;
}

const BASE_PATH = path.join(process.cwd(), '3pro-ppt', 'templates');

// 模板 3: 全屏竖屏 1080x1920
const TEMPLATE_3: TemplateConfig = {
    id: 'template-3-vertical',
    name: 'Full Screen Vertical (1080x1920)',
    width: 1080,
    height: 1920,
    backgroundPath: path.join(BASE_PATH, 'bg-template-3.jpeg'),
    slots: {
        title: {
            x: 152, y: 261, w: 777, h: 248,
            fontSize: 91,
            color: '#000000',
            align: 'center',
            fontFace: 'Georgia',
            bold: true,
        },
        rating: {
            x: 340, y: 1240, w: 400, h: 60,
            fontSize: 40,
            color: '#FFD700',
            align: 'center',
        },
        review: {
            x: 218, y: 1341, w: 640, h: 239,
            fontSize: 31,
            color: '#000000',
            align: 'center',
            fontFace: 'Georgia',
            italic: true,
        },
        social: {
            x: 218, y: 1620, w: 640, h: 60,
            fontSize: 26,
            color: '#0066CC',
            align: 'center',
        },
    },
    productImage: {
        x: 86, y: 580, w: 908, h: 550,
    },
};

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
    return px / 96;
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

async function downloadImageAsBase64(url: string): Promise<string | null> {
    if (!url || !url.startsWith('http')) return null;
    try {
        console.log(`      ⬇️ Downloading: ${url.substring(0, 50)}...`);
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) {
            console.log(`      ⚠️ Download failed (${response.status})`);
            return null;
        }
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log(`      ✅ Downloaded (${Math.round(arrayBuffer.byteLength / 1024)}KB)`);
        return base64;
    } catch (e: any) {
        console.log(`      ⚠️ Download error: ${e.message || e}`);
        return null;
    }
}

// ==========================================
// Gemini Nano-Banana 图片合成
// ==========================================

async function generateCompositeImage(
    productImageBase64: string,
    productName: string,
    apiKey: string
): Promise<string | null> {
    console.log(`      🎨 Using Gemini nano-banana to compose image...`);

    const prompt = `Generate a high-quality lifestyle product photography image. 
Show a beautiful fashion influencer or model naturally using/wearing/showcasing the product.
The model should look authentic and natural, like a real Instagram influencer.
The product is: ${productName}
Make it look like a professional product review photo for social media.
Style: Modern, elegant, Instagram-worthy, natural lighting.`;

    const genAiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: prompt,
                    },
                    // 包含产品图片作为参考
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: productImageBase64
                        }
                    }
                ],
            },
        ],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
        },
    };

    try {
        const response = await fetch(genAiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`      ⚠️ Gemini API error: ${response.status}`);
            console.log(`      ⚠️ ${errorText.substring(0, 200)}`);
            return null;
        }

        const data = await response.json();

        // 提取生成的图片
        if (data?.candidates?.[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                const inlineData = part.inline_data || part.inlineData;
                if (inlineData?.data) {
                    console.log(`      ✅ AI composite image generated!`);
                    const mimeType = inlineData.mime_type || inlineData.mimeType || "image/png";
                    return `data:${mimeType};base64,${inlineData.data}`;
                }
            }
        }

        console.log(`      ⚠️ No image in response`);
        return null;
    } catch (e: any) {
        console.log(`      ⚠️ Gemini error: ${e.message || e}`);
        return null;
    }
}

// ==========================================
// 环境设置
// ==========================================

const envPath = path.join(process.cwd(), '.env');
let GEMINI_API_KEY = '';

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            if (key === 'GEMINI_API_KEY') {
                GEMINI_API_KEY = value;
                process.env[key] = value;
                console.log("✅ GEMINI_API_KEY loaded");
            }
        }
    });
}

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing!");
    process.exit(1);
}

const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });

const HTML_DIR = path.join(process.cwd(), '3pro-ppt', 'html articles');
const OUTPUT_DIR = path.join(process.cwd(), '3pro-ppt', 'output', 'ai-composite');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ==========================================
// 生成 PPT
// ==========================================

async function generatePPT(
    template: TemplateConfig,
    content: { title: string; rating: string; review: string; social?: string },
    compositeImageData: string | null,
    outputPath: string
) {
    console.log(`   🔨 Generating PPT: ${template.width}×${template.height}...`);

    const PptxGen = (PptxGenJS as any).default || PptxGenJS;
    const pptx = new PptxGen();

    const widthInches = pixelToInch(template.width);
    const heightInches = pixelToInch(template.height);

    pptx.defineLayout({ name: 'CUSTOM', width: widthInches, height: heightInches });
    pptx.layout = 'CUSTOM';

    const slide = pptx.addSlide();

    // 1. 添加背景图
    const bgData = loadBackgroundAsBase64(template.backgroundPath);
    if (bgData) {
        slide.addImage({
            data: bgData,
            x: 0, y: 0,
            w: widthInches, h: heightInches,
            sizing: { type: 'cover', w: widthInches, h: heightInches },
        });
        console.log(`   🖼️ Background added`);
    }

    // 2. 添加合成图片
    if (compositeImageData && template.productImage) {
        const imgSlot = template.productImage;
        slide.addImage({
            data: compositeImageData,
            x: pixelToInch(imgSlot.x),
            y: pixelToInch(imgSlot.y),
            w: pixelToInch(imgSlot.w),
            h: pixelToInch(imgSlot.h),
            sizing: {
                type: 'cover',
                w: pixelToInch(imgSlot.w),
                h: pixelToInch(imgSlot.h)
            },
        });
        console.log(`   🖼️ AI composite image added`);
    }

    // 3. 添加文本
    const addText = (text: string, slot: SlotConfig) => {
        const x = pixelToInch(slot.x);
        const y = pixelToInch(slot.y);
        const w = pixelToInch(slot.w);
        const h = pixelToInch(slot.h);
        const fontSize = Math.round(slot.fontSize * 0.75);

        slide.addText(text, {
            x, y, w, h,
            fontSize: Math.max(10, Math.min(fontSize, 96)),
            color: slot.color.replace('#', ''),
            fontFace: slot.fontFace || 'Arial',
            bold: slot.bold || false,
            italic: slot.italic || false,
            align: slot.align,
            valign: 'middle',
            wrap: true,
            shrinkText: true,
        });
    };

    addText(content.title, template.slots.title);
    console.log(`   📝 Title: ${content.title}`);

    addText(content.rating, template.slots.rating);
    console.log(`   ⭐ Rating: ${content.rating}`);

    addText(content.review, template.slots.review);
    console.log(`   💬 Review: ${content.review.substring(0, 30)}...`);

    if (template.slots.social && content.social) {
        addText(content.social, template.slots.social);
    }

    await pptx.writeFile({ fileName: outputPath });
    console.log(`   ✅ Saved: ${path.basename(outputPath)}`);
}

// ==========================================
// 处理 HTML 文件
// ==========================================

async function processHtmlFile(filePath: string, template: TemplateConfig): Promise<boolean> {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Processing: ${fileName}`);
    console.log(`   📐 Template: ${template.name}`);

    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    const systemPrompt = `
You are an expert content analyzer. Extract from the HTML:
- title: Short punchy title in English (max 25 chars)
- rating: Numeric rating 1-5
- review: Powerful quote in English (max 150 chars)
- product_name: Name of the product being reviewed
- product_image_url: Main product image URL from <img> tag, must start with http

Return ONLY valid JSON: { title, rating, review, product_name, product_image_url }
`;

    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            system: systemPrompt,
            prompt: `Analyze:\n${htmlContent.substring(0, 4000)}`,
        });

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        console.log(`   ✅ Analysis complete: ${analysis.title}`);
        console.log(`   📦 Product: ${analysis.product_name || 'Unknown'}`);
        console.log(`   🖼️ Image URL: ${analysis.product_image_url?.substring(0, 50) || 'None'}...`);

        // 下载产品图片
        let compositeImageData: string | null = null;

        if (analysis.product_image_url) {
            const productImageBase64 = await downloadImageAsBase64(analysis.product_image_url);

            if (productImageBase64) {
                // 使用 Gemini nano-banana 生成合成图片
                compositeImageData = await generateCompositeImage(
                    productImageBase64,
                    analysis.product_name || analysis.title,
                    GEMINI_API_KEY
                );

                // 如果 AI 合成失败，使用原始产品图
                if (!compositeImageData) {
                    console.log(`      ℹ️ Using original product image`);
                    compositeImageData = `data:image/jpeg;base64,${productImageBase64}`;
                }
            }
        }

        const outputName = `${fileName.replace('.html', '')}_${template.id}.pptx`;
        const outputPath = path.join(OUTPUT_DIR, outputName);

        await generatePPT(
            template,
            {
                title: analysis.title || 'PRODUCT REVIEW',
                rating: ratingToStars(analysis.rating),
                review: analysis.review || '',
                social: 'Shop Now →',  // 英文
            },
            compositeImageData,
            outputPath
        );

        return true;
    } catch (e: any) {
        console.log(`   ❌ Failed: ${e.message || e}`);
        return false;
    }
}

// ==========================================
// 主函数
// ==========================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║    AI Composite Image PPT Generator                        ║');
    console.log('║    Using Gemini nano-banana for product + influencer       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const template = TEMPLATE_3;
    console.log(`📋 Template: ${template.name}`);
    console.log(`   Size: ${template.width}×${template.height}`);
    console.log(`   Background: ${fs.existsSync(template.backgroundPath) ? '✅ Found' : '❌ Missing'}`);
    console.log('');

    const htmlFiles = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

    if (htmlFiles.length === 0) {
        console.log("❌ No HTML files found");
        return;
    }

    console.log(`📁 Found ${htmlFiles.length} HTML files\n`);
    console.log('━'.repeat(60));

    let success = 0, fail = 0;
    for (const htmlFile of htmlFiles) {
        const result = await processHtmlFile(path.join(HTML_DIR, htmlFile), template);
        if (result) success++; else fail++;

        // 避免 API rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '━'.repeat(60));
    console.log(`✅ Complete! Success: ${success}, Failed: ${fail}`);
    console.log(`📂 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
