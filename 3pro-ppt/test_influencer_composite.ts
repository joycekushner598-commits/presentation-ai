/**
 * 测试：网红图 + 产品图 合成
 * 
 * 逻辑：
 * 1. 从 influencer 文件夹获取网红图作为底图
 * 2. 使用本地产品图
 * 3. 使用 Gemini nano-banana 让网红"带上"产品
 * 4. 生成一张测试图片
 */

import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// 环境设置
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
                console.log("✅ GEMINI_API_KEY loaded");
            }
        }
    });
}

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing!");
    process.exit(1);
}

// 路径
const INFLUENCER_DIR = path.join(process.cwd(), '3pro-ppt', 'influencer');
const OUTPUT_DIR = path.join(process.cwd(), '3pro-ppt', 'output', 'test-composite');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 加载本地图片为 base64
function loadImageAsBase64(filePath: string): string | null {
    try {
        if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            return buffer.toString('base64');
        }
    } catch (e) {
        console.error(`Failed to load: ${filePath}`);
    }
    return null;
}

// 使用 Gemini 合成图片
async function composeInfluencerWithProduct(
    influencerBase64: string,
    productBase64: string,
    productName: string
): Promise<Buffer | null> {
    console.log(`\n🎨 Composing image with Gemini nano-banana...`);
    console.log(`   📦 Product: ${productName}`);

    const prompt = `Edit this image of the model/influencer to naturally incorporate the product shown in the second image.

The product is: ${productName}

Instructions:
- Keep the influencer's pose, face, and overall appearance exactly the same
- Naturally add the product to the scene (the model wearing/holding/showcasing it)
- Make it look like a real product review photo for social media
- Maintain natural lighting and shadows
- The result should look like a genuine influencer product photo

IMPORTANT: Keep the influencer's face and body unchanged, only add the product naturally.`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    // 网红图（底图）
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: influencerBase64
                        }
                    },
                    // 产品图
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: productBase64
                        }
                    }
                ],
            },
        ],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
        },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`;

    try {
        console.log(`   ⏳ Calling Gemini API (this may take 30-60 seconds)...`);
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(120000), // 120秒超时
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error ${response.status}: ${errorText.substring(0, 500)}`);
            return null;
        }

        const data = await response.json();

        // 提取生成的图片
        if (data?.candidates?.[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                const inlineData = part.inline_data || part.inlineData;
                if (inlineData?.data) {
                    console.log(`   ✅ AI composite image generated!`);
                    return Buffer.from(inlineData.data, 'base64');
                }
            }
        }

        console.error(`❌ No image in response`);
        console.log(`   Response:`, JSON.stringify(data).substring(0, 500));
        return null;
    } catch (e: any) {
        console.error(`❌ Error: ${e.message}`);
        return null;
    }
}

// 主函数
async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║    Test: Influencer + Product Image Composition            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. 选择一张网红图
    const influencerImages = fs.readdirSync(INFLUENCER_DIR).filter(f => f.endsWith('.jpg'));
    console.log(`📁 Found ${influencerImages.length} influencer images`);

    const selectedInfluencer = influencerImages[0]; // 使用第一张
    const influencerPath = path.join(INFLUENCER_DIR, selectedInfluencer);
    console.log(`👤 Selected influencer: ${selectedInfluencer}`);

    const influencerBase64 = loadImageAsBase64(influencerPath);
    if (!influencerBase64) {
        console.error("Failed to load influencer image");
        return;
    }
    console.log(`✅ Influencer image loaded (${Math.round(influencerBase64.length / 1024)}KB base64)`);

    // 2. 加载本地产品图
    const productPath = path.join(process.cwd(), '3pro-ppt', 'ppt from canvas', '1 (1)_extracted', 'ppt', 'media', 'image4.jpeg');
    const productName = "Silver Necklace Pendant";

    console.log(`📦 Loading product image...`);
    const productBase64 = loadImageAsBase64(productPath);
    if (!productBase64) {
        console.error("Failed to load product image");
        return;
    }
    console.log(`✅ Product image loaded (${Math.round(productBase64.length / 1024)}KB base64)`);

    // 3. 使用 Gemini 合成
    const compositeBuffer = await composeInfluencerWithProduct(
        influencerBase64,
        productBase64,
        productName
    );

    if (compositeBuffer) {
        // 4. 保存结果
        const outputPath = path.join(OUTPUT_DIR, 'test_composite.png');
        fs.writeFileSync(outputPath, compositeBuffer);
        console.log(`\n✅ Saved composite image to: ${outputPath}`);
        console.log(`📂 Open this file to see the result!`);
    } else {
        console.log(`\n❌ Failed to generate composite image`);
    }
}

main().catch(console.error);
