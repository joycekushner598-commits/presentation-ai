/**
 * 修复版多模板生成器
 * 
 * 修复：
 * 1. 正确的文字格式（字体、颜色、对齐）
 * 2. 产品图片下载并加载
 * 3. 原始PPT背景保留
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import PptxGenJS from 'pptxgenjs';

// ==========================================
// 模板定义
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
    productImage?: ImageSlotConfig; // 产品图片位置
}

const BASE_PATH = path.join(process.cwd(), '3pro-ppt', 'templates');

// 模板 3: 全屏竖屏 1080x1920 (修复版)
const TEMPLATE_3: TemplateConfig = {
    id: 'template-3-vertical',
    name: '全屏竖屏模板 (1080x1920)',
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
    // 产品图片区域
    productImage: {
        x: 86, y: 580, w: 908, h: 550,
    },
};

// 模板 1: 方形 1080x1080
const TEMPLATE_1: TemplateConfig = {
    id: 'template-1-square',
    name: '方形评价模板 (1080x1080)',
    width: 1080, height: 1080,
    backgroundPath: path.join(BASE_PATH, 'bg-template-1.jpeg'),
    slots: {
        title: {
            x: 177, y: 829, w: 728, h: 68,
            fontSize: 39,
            color: '#FFFFFF',
            align: 'center',
            fontFace: 'Brush Script MT',
        },
        rating: {
            x: 390, y: 460, w: 300, h: 50,
            fontSize: 32,
            color: '#FFD700',
            align: 'center',
        },
        review: {
            x: 300, y: 533, w: 600, h: 150,
            fontSize: 23,
            color: '#000000',
            align: 'center',
            fontFace: 'Georgia',
        },
        social: {
            x: 199, y: 920, w: 680, h: 72,
            fontSize: 28,
            color: '#FFFFFF',
            align: 'center',
        },
    },
    productImage: {
        x: 50, y: 50, w: 400, h: 400,
    },
};

// 模板 4: 竖屏B 1080x1920
const TEMPLATE_4: TemplateConfig = {
    id: 'template-4-vertical',
    name: '竖屏评价模板B (1080x1920)',
    width: 1080, height: 1920,
    backgroundPath: path.join(BASE_PATH, 'bg-template-4.jpeg'),
    slots: {
        title: {
            x: 79, y: 50, w: 900, h: 100,
            fontSize: 40,
            color: '#000000',
            align: 'center',
            fontFace: 'Arial',
            bold: true,
        },
        rating: {
            x: 290, y: 380, w: 500, h: 60,
            fontSize: 40,
            color: '#FFD700',
            align: 'center',
        },
        review: {
            x: 180, y: 500, w: 720, h: 280,
            fontSize: 28,
            color: '#000000',
            align: 'center',
            fontFace: 'Georgia',
            italic: true,
        },
        social: {
            x: 200, y: 1750, w: 680, h: 70,
            fontSize: 30,
            color: '#FFFFFF',
            align: 'center',
        },
    },
    productImage: {
        x: 3, y: 831, w: 1074, h: 900,
    },
};

// 模板 5: 简约竖屏 1080x1920
const TEMPLATE_5: TemplateConfig = {
    id: 'template-5-minimal',
    name: '简约竖屏模板 (1080x1920)',
    width: 1080, height: 1920,
    backgroundPath: path.join(BASE_PATH, 'bg-template-5.jpeg'),
    slots: {
        title: {
            x: 249, y: 700, w: 600, h: 80,
            fontSize: 36,
            color: '#000000',
            align: 'left',
            fontFace: 'Open Sans',
            bold: true,
        },
        rating: {
            x: 249, y: 800, w: 412, h: 50,
            fontSize: 30,
            color: '#FFD700',
            align: 'left',
        },
        review: {
            x: 249, y: 880, w: 650, h: 200,
            fontSize: 22,
            color: '#000000',
            align: 'left',
            fontFace: 'Open Sans',
        },
    },
};

const ALL_TEMPLATES = [TEMPLATE_3, TEMPLATE_1, TEMPLATE_4, TEMPLATE_5];

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
        console.warn(`  ⚠️ 背景加载失败: ${filePath}`);
    }
    return null;
}

async function downloadImageAsDataUri(url: string): Promise<string | null> {
    if (!url || !url.startsWith('http')) return null;
    try {
        console.log(`      ⬇️ 下载图片: ${url.substring(0, 50)}...`);
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(15000), // 15秒超时
        });
        if (!response.ok) {
            console.log(`      ⚠️ 下载失败 (${response.status})`);
            return null;
        }
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log(`      ✅ 下载成功 (${Math.round(arrayBuffer.byteLength / 1024)}KB)`);
        return `data:${contentType};base64,${base64}`;
    } catch (e: any) {
        console.log(`      ⚠️ 下载错误: ${e.message || e}`);
        return null;
    }
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
                console.log("✅ GEMINI_API_KEY 已加载");
            }
        }
    });
}

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY 缺失!");
    process.exit(1);
}

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const HTML_DIR = path.join(process.cwd(), '3pro-ppt', 'html articles');
const OUTPUT_DIR = path.join(process.cwd(), '3pro-ppt', 'output', 'fixed');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ==========================================
// 生成 PPT (修复版)
// ==========================================

async function generatePPT(
    template: TemplateConfig,
    content: { title: string; rating: string; review: string; social?: string },
    productImageData: string | null,
    outputPath: string
) {
    console.log(`   🔨 生成 PPT: ${template.width}×${template.height}...`);

    const PptxGen = (PptxGenJS as any).default || PptxGenJS;
    const pptx = new PptxGen();

    const widthInches = pixelToInch(template.width);
    const heightInches = pixelToInch(template.height);

    // 设置正确的幻灯片尺寸
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
        console.log(`   🖼️ 背景已添加`);
    } else {
        console.log(`   ⚠️ 背景未找到`);
    }

    // 2. 添加产品图片
    if (productImageData && template.productImage) {
        const imgSlot = template.productImage;
        slide.addImage({
            data: productImageData,
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
        console.log(`   🖼️ 产品图片已添加`);
    }

    // 3. 添加文本（正确格式）
    const addText = (text: string, slot: SlotConfig) => {
        const x = pixelToInch(slot.x);
        const y = pixelToInch(slot.y);
        const w = pixelToInch(slot.w);
        const h = pixelToInch(slot.h);

        // 计算正确的字号（像素转点数，考虑缩放）
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
            shrinkText: true, // 自动缩小以适应
        });
    };

    // 标题
    addText(content.title, template.slots.title);
    console.log(`   📝 标题: ${content.title}`);

    // 评分
    addText(content.rating, template.slots.rating);
    console.log(`   ⭐ 评分: ${content.rating}`);

    // 评价
    addText(content.review, template.slots.review);
    console.log(`   💬 评价: ${content.review.substring(0, 30)}...`);

    // 社交/链接
    if (template.slots.social && content.social) {
        addText(content.social, template.slots.social);
    }

    await pptx.writeFile({ fileName: outputPath });
    console.log(`   ✅ 已保存: ${path.basename(outputPath)}`);
}

// ==========================================
// 处理 HTML 文件
// ==========================================

async function processHtmlFile(filePath: string, template: TemplateConfig): Promise<boolean> {
    const fileName = path.basename(filePath);
    console.log(`\n📄 处理: ${fileName}`);
    console.log(`   📐 模板: ${template.name}`);

    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    const systemPrompt = `
You are an expert content analyzer. Extract from the HTML:
- title: Short punchy title (max 25 chars)
- rating: Numeric rating 1-5
- review: Powerful quote (max 150 chars)
- product_image_url: Main product image URL from <img> tag, must start with http

Return ONLY valid JSON: { title, rating, review, product_image_url }
`;

    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            system: systemPrompt,
            prompt: `Analyze:\n${htmlContent.substring(0, 4000)}`,
        });

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        console.log(`   ✅ 分析完成: ${analysis.title}`);
        console.log(`   🖼️ 图片URL: ${analysis.product_image_url?.substring(0, 50) || '无'}...`);

        // 下载产品图片
        let productImageData: string | null = null;
        if (analysis.product_image_url) {
            productImageData = await downloadImageAsDataUri(analysis.product_image_url);
        }

        const outputName = `${fileName.replace('.html', '')}_${template.id}.pptx`;
        const outputPath = path.join(OUTPUT_DIR, outputName);

        await generatePPT(
            template,
            {
                title: analysis.title || 'PRODUCT REVIEW',
                rating: ratingToStars(analysis.rating),
                review: analysis.review || '',
                social: '点击购买',
            },
            productImageData,
            outputPath
        );

        return true;
    } catch (e: any) {
        console.log(`   ❌ 失败: ${e.message || e}`);
        return false;
    }
}

// ==========================================
// 主函数
// ==========================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║      修复版 PPT 生成器 - 正确的文字格式 + 产品图片         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 使用模板3测试
    const template = TEMPLATE_3;
    console.log(`📋 当前模板: ${template.name}`);
    console.log(`   尺寸: ${template.width}×${template.height}`);
    console.log(`   背景: ${fs.existsSync(template.backgroundPath) ? '✅ 存在' : '❌ 不存在'}`);
    console.log('');

    const htmlFiles = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

    if (htmlFiles.length === 0) {
        console.log("❌ 没有找到 HTML 文件");
        return;
    }

    console.log(`📁 找到 ${htmlFiles.length} 个 HTML 文件\n`);
    console.log('━'.repeat(60));

    let success = 0, fail = 0;
    for (const htmlFile of htmlFiles) {
        const result = await processHtmlFile(path.join(HTML_DIR, htmlFile), template);
        if (result) success++; else fail++;
    }

    console.log('\n' + '━'.repeat(60));
    console.log(`✅ 完成! 成功: ${success}, 失败: ${fail}`);
    console.log(`📂 输出目录: ${OUTPUT_DIR}`);
}

main().catch(console.error);
