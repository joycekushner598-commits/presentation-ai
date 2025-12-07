/**
 * 多模板测试脚本
 * 测试所有 6 个模板，每个模板生成几个文件
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import PptxGenJS from 'pptxgenjs';

// ==========================================
// 所有模板定义
// ==========================================

interface SlotConfig {
    x: number; y: number; w: number; h: number;
    fontSize: number; color: string; align: 'left' | 'center' | 'right';
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
}

const BASE_PATH = path.join(process.cwd(), '3pro-ppt', 'templates');

// 模板 1: 方形 1080x1080
const TEMPLATE_1: TemplateConfig = {
    id: 'template-1-square',
    name: '方形评价模板 (1080x1080)',
    width: 1080, height: 1080,
    backgroundPath: path.join(BASE_PATH, 'bg-template-1.jpeg'),
    slots: {
        title: { x: 177, y: 829, w: 482, h: 68, fontSize: 39, color: '#FFFFFF', align: 'center' },
        rating: { x: 531, y: 460, w: 300, h: 50, fontSize: 32, color: '#FFD700', align: 'center' },
        review: { x: 445, y: 533, w: 499, h: 128, fontSize: 23, color: '#000000', align: 'center' },
        social: { x: 199, y: 901, w: 493, h: 72, fontSize: 28, color: '#333333', align: 'center' },
    },
};

// 模板 2: 竖版 1080x1349
const TEMPLATE_2: TemplateConfig = {
    id: 'template-2-portrait',
    name: '竖版评价模板 (1080x1349)',
    width: 1080, height: 1349,
    backgroundPath: path.join(BASE_PATH, 'bg-template-2.jpeg'),
    slots: {
        title: { x: 140, y: 1050, w: 800, h: 80, fontSize: 48, color: '#222222', align: 'center' },
        rating: { x: 340, y: 700, w: 400, h: 50, fontSize: 36, color: '#FFD700', align: 'center' },
        review: { x: 120, y: 780, w: 840, h: 220, fontSize: 26, color: '#333333', align: 'center' },
        social: { x: 140, y: 1150, w: 800, h: 60, fontSize: 24, color: '#0066CC', align: 'center' },
    },
};

// 模板 3: 全屏竖屏 1080x1920
const TEMPLATE_3: TemplateConfig = {
    id: 'template-3-vertical',
    name: '全屏竖屏模板 (1080x1920)',
    width: 1080, height: 1920,
    backgroundPath: path.join(BASE_PATH, 'bg-template-3.jpeg'),
    slots: {
        title: { x: 152, y: 261, w: 777, h: 248, fontSize: 91, color: '#000000', align: 'center' },
        rating: { x: 340, y: 1240, w: 400, h: 60, fontSize: 40, color: '#FFD700', align: 'center' },
        review: { x: 218, y: 1341, w: 640, h: 239, fontSize: 31, color: '#000000', align: 'center' },
        social: { x: 218, y: 1620, w: 640, h: 60, fontSize: 26, color: '#0066CC', align: 'center' },
    },
};

// 模板 4: 另一种竖屏 1080x1920
const TEMPLATE_4: TemplateConfig = {
    id: 'template-4-vertical',
    name: '竖屏评价模板B (1080x1920)',
    width: 1080, height: 1920,
    backgroundPath: path.join(BASE_PATH, 'bg-template-4.jpeg'),
    slots: {
        title: { x: 79, y: 0, w: 456, h: 79, fontSize: 33, color: '#000000', align: 'center' },
        rating: { x: 294, y: 415, w: 500, h: 60, fontSize: 40, color: '#FFD700', align: 'center' },
        review: { x: 276, y: 644, w: 527, h: 400, fontSize: 32, color: '#000000', align: 'center' },
        social: { x: 311, y: 1751, w: 457, h: 61, fontSize: 33, color: '#FFFFFF', align: 'center' },
    },
};

// 模板 5: 竖屏简约 1080x1920
const TEMPLATE_5: TemplateConfig = {
    id: 'template-5-minimal',
    name: '简约竖屏模板 (1080x1920)',
    width: 1080, height: 1920,
    backgroundPath: path.join(BASE_PATH, 'bg-template-5.jpeg'),
    slots: {
        title: { x: 249, y: 761, w: 600, h: 70, fontSize: 40, color: '#000000', align: 'left' },
        rating: { x: 249, y: 839, w: 412, h: 50, fontSize: 30, color: '#FFD700', align: 'left' },
        review: { x: 249, y: 917, w: 611, h: 150, fontSize: 20, color: '#000000', align: 'left' },
    },
};

// 模板 6: 方形复杂 1080x1080
const TEMPLATE_6: TemplateConfig = {
    id: 'template-6-complex',
    name: '复杂方形模板 (1080x1080)',
    width: 1080, height: 1080,
    backgroundPath: path.join(BASE_PATH, 'bg-template-6.jpeg'),
    slots: {
        title: { x: 115, y: 191, w: 378, h: 231, fontSize: 50, color: '#000000', align: 'left' },
        rating: { x: 157, y: 500, w: 200, h: 40, fontSize: 24, color: '#FFD700', align: 'left' },
        review: { x: 156, y: 573, w: 461, h: 155, fontSize: 21, color: '#000000', align: 'left' },
    },
};

const ALL_TEMPLATES = [TEMPLATE_1, TEMPLATE_2, TEMPLATE_3, TEMPLATE_4, TEMPLATE_5, TEMPLATE_6];

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
        console.warn(`  ⚠️ Failed to load: ${filePath}`);
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
const OUTPUT_DIR = path.join(process.cwd(), '3pro-ppt', 'output', 'multi-template-test');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ==========================================
// 生成 PPT
// ==========================================

async function generatePPT(
    template: TemplateConfig,
    content: { title: string; rating: string; review: string; social?: string },
    outputPath: string
) {
    const PptxGen = (PptxGenJS as any).default || PptxGenJS;
    const pptx = new PptxGen();

    const widthInches = pixelToInch(template.width);
    const heightInches = pixelToInch(template.height);

    pptx.defineLayout({ name: 'CUSTOM', width: widthInches, height: heightInches });
    pptx.layout = 'CUSTOM';

    const slide = pptx.addSlide();

    // 背景
    const bgData = loadBackgroundAsBase64(template.backgroundPath);
    if (bgData) {
        slide.addImage({
            data: bgData,
            x: 0, y: 0,
            w: widthInches, h: heightInches,
            sizing: { type: 'cover', w: widthInches, h: heightInches },
        });
    }

    // 文本
    const addText = (text: string, slot: SlotConfig) => {
        const x = pixelToInch(slot.x);
        const y = pixelToInch(slot.y);
        const w = pixelToInch(slot.w);
        const h = pixelToInch(slot.h);
        const fontSize = Math.round(slot.fontSize * 0.6);

        slide.addText(text, {
            x, y, w, h,
            fontSize: Math.max(8, Math.min(fontSize, 72)),
            color: slot.color.replace('#', ''),
            align: slot.align,
            valign: 'middle',
            wrap: true,
        });
    };

    addText(content.title, template.slots.title);
    addText(content.rating, template.slots.rating);
    addText(content.review, template.slots.review);
    if (template.slots.social && content.social) {
        addText(content.social, template.slots.social);
    }

    await pptx.writeFile({ fileName: outputPath });
}

// ==========================================
// 主函数
// ==========================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           多模板测试 - 测试所有 6 个模板                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 显示所有模板
    console.log('📋 可用模板:');
    ALL_TEMPLATES.forEach((t, i) => {
        const bgExists = fs.existsSync(t.backgroundPath) ? '✅' : '❌';
        console.log(`   ${i + 1}. ${t.name} [背景:${bgExists}]`);
    });
    console.log('');

    const htmlFiles = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html')).slice(0, 2);

    if (htmlFiles.length === 0) {
        console.log("❌ No HTML files");
        return;
    }

    console.log(`📁 使用前 ${htmlFiles.length} 个 HTML 文件测试每个模板\n`);
    console.log('━'.repeat(60));

    for (const template of ALL_TEMPLATES) {
        console.log(`\n🎨 测试模板: ${template.name}`);
        console.log(`   尺寸: ${template.width}×${template.height}`);

        if (!fs.existsSync(template.backgroundPath)) {
            console.log(`   ❌ 背景图不存在，跳过`);
            continue;
        }

        for (const htmlFile of htmlFiles) {
            const filePath = path.join(HTML_DIR, htmlFile);
            const htmlContent = fs.readFileSync(filePath, 'utf-8');

            console.log(`   📄 处理: ${htmlFile}`);

            try {
                const { text } = await generateText({
                    model: google('gemini-2.0-flash-exp'),
                    system: `Extract: title (max 25 chars), rating (1-5), review (max 150 chars). Return JSON only.`,
                    prompt: htmlContent.substring(0, 3000),
                });

                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const analysis = JSON.parse(cleanText);

                const outputName = `${htmlFile.replace('.html', '')}_${template.id}.pptx`;
                const outputPath = path.join(OUTPUT_DIR, outputName);

                await generatePPT(
                    template,
                    {
                        title: analysis.title || 'Product Review',
                        rating: ratingToStars(analysis.rating),
                        review: analysis.review || '',
                        social: '点击购买',
                    },
                    outputPath
                );

                console.log(`      ✅ 已保存: ${outputName}`);
            } catch (e) {
                console.log(`      ❌ 失败: ${e}`);
            }
        }
    }

    console.log('\n' + '━'.repeat(60));
    console.log(`✅ 测试完成！输出目录: ${OUTPUT_DIR}`);
}

main().catch(console.error);
