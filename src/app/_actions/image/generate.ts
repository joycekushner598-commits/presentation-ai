"use server";

import { utapi } from "@/app/api/uploadthing/core";
import { env } from "@/env";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { UTFile } from "uploadthing/server";
import { writeFile } from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export type ImageModelList =
  | "nano-banana-pro-preview"
  | "black-forest-labs/FLUX1.1-pro"
  | "black-forest-labs/FLUX.1-schnell"
  | "black-forest-labs/FLUX.1-schnell-Free"
  | "black-forest-labs/FLUX.1-pro"
  | "black-forest-labs/FLUX.1-dev";

// 将用户友好的模型名称映射到 Google API 的实际模型名称
function getGeminiModelName(model: ImageModelList): string {
  if (model === "nano-banana-pro-preview") {
    // 根据 Python 示例，正确的模型名称是 gemini-2.5-flash-image-preview
    return "gemini-2.5-flash-image-preview";
  }
  return model;
}

export async function generateImageAction(
  prompt: string,
  model: ImageModelList = "nano-banana-pro-preview",
) {
  console.log(`🔥🔥🔥 [Image Generation] FUNCTION CALLED!`);
  console.log(`🔥 [Image Generation] Prompt: "${prompt}"`);
  console.log(`🔥 [Image Generation] Model: "${model}"`);
  
  // Get the current session
  const skipAuth = process.env.SKIP_AUTH === "true";
  console.log(`🔥 [Image Generation] Skip auth: ${skipAuth}`);
  
  if (!skipAuth) {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("You must be logged in to generate images");
    }
  }

  try {
    console.log(`🎨 [Image Generation] Starting with model: ${model}`);
    console.log(`🎨 [Image Generation] Prompt: ${prompt}`);

    // Generate the image using Google Generative AI (nano-banana)
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is not configured");
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // 将用户选择的模型名称映射到 API 实际的模型名称
    const actualModelName = getGeminiModelName(model);
    console.log(`🎨 [Image Generation] Using API model name: ${actualModelName}`);

    // Call Google Generative AI REST API
    // 使用正确的模型名称（gemini-2.5-flash-image-preview 也叫 nano-banana）
    const genAiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${actualModelName}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      // 关键配置：指定响应模态包含文本和图像
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    console.log(`🎨 [Image Generation] Sending request to Google API...`);
    console.log(`🎨 [Image Generation] Request body:`, JSON.stringify(requestBody, null, 2));

    // 声明变量
    let imageBuffer: ArrayBuffer | null = null;
    let mimeType = "image/png";
    
    // 增加超时时间和重试机制
    let genAiResponse;
    let lastError;
    const maxRetries = 3;
    
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        console.log(`🔄 [Image Generation] Attempt ${retry + 1}/${maxRetries}...`);
        
        genAiResponse = await fetch(genAiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          // 增加超时时间到 60 秒
          signal: AbortSignal.timeout(60000),
        });
        
        // 如果成功，跳出循环
        break;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ [Image Generation] Attempt ${retry + 1} failed:`, error instanceof Error ? error.message : String(error));
        
        if (retry < maxRetries - 1) {
          const waitTime = (retry + 1) * 2000; // 2秒, 4秒, 6秒
          console.log(`⏳ [Image Generation] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!genAiResponse) {
      console.error(`❌ [Image Generation] All ${maxRetries} attempts failed with fetch`);
      console.log(`🐍 [Image Generation] Trying Python bridge as fallback...`);
      
      try {
        // 使用 Python 脚本作为备选方案
        const scriptPath = path.join(process.cwd(), 'scripts', 'generate-image-bridge.py');
        const args = JSON.stringify({
          prompt: prompt,
          model: actualModelName,
          apiKey: apiKey
        });
        
        const { stdout, stderr } = await execAsync(`python "${scriptPath}" '${args.replace(/'/g, "\\'")}'`);
        
        if (stderr) {
          console.warn(`⚠️ [Image Generation] Python stderr:`, stderr);
        }
        
        const pythonResult = JSON.parse(stdout);
        console.log(`🐍 [Image Generation] Python result:`, pythonResult.success ? '✅ Success' : '❌ Failed');
        
        if (!pythonResult.success) {
          throw new Error(`Python bridge failed: ${pythonResult.error}`);
        }
        
        // 将 base64 转换为 buffer
        const base64Data = pythonResult.image_data;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        imageBuffer = bytes.buffer;
        mimeType = pythonResult.mime_type || "image/png";
        
        console.log(`✅ [Image Generation] Python bridge succeeded, image size: ${imageBuffer.byteLength} bytes`);
        
        // Python bridge成功，跳过后面的 fetch 处理
        // 直接跳转到文件保存部分
      } catch (pythonError) {
        console.error(`❌ [Image Generation] Python bridge also failed:`, pythonError);
        throw new Error(`All methods failed. Fetch error: ${lastError instanceof Error ? lastError.message : String(lastError)}. Python error: ${pythonError instanceof Error ? pythonError.message : String(pythonError)}`);
      }
    }

    // 只有在使用 fetch 成功时才处理响应
    if (genAiResponse) {
      console.log(`🎨 [Image Generation] Response status: ${genAiResponse.status}`);

      if (!genAiResponse.ok) {
        const errorText = await genAiResponse.text();
        console.error("❌ [Image Generation] Google Generative AI error:", errorText);
        throw new Error(`Failed to generate image: ${genAiResponse.status} ${errorText}`);
      }

      const genAiData = await genAiResponse.json();
      console.log("✅ [Image Generation] Response received");
      console.log("🎨 [Image Generation] Response preview:", JSON.stringify(genAiData).substring(0, 500));

      // Extract inline_data from response parts (注意：API 返回的是 inline_data，不是 inlineData)
      console.log(`🎨 [Image Generation] Parsing response...`);
      console.log(`🎨 [Image Generation] Has candidates:`, !!genAiData?.candidates?.[0]);
      console.log(`🎨 [Image Generation] Has content:`, !!genAiData?.candidates?.[0]?.content);
      console.log(`🎨 [Image Generation] Parts count:`, genAiData?.candidates?.[0]?.content?.parts?.length || 0);

      if (genAiData?.candidates?.[0]?.content?.parts) {
        for (let i = 0; i < genAiData.candidates[0].content.parts.length; i++) {
          const part = genAiData.candidates[0].content.parts[i];
          console.log(`🎨 [Image Generation] Part ${i}:`, Object.keys(part));
          
          // 检查 inline_data（下划线命名）
          const inlineData = part.inline_data || part.inlineData;
          if (inlineData?.data) {
            // Base64 decode the image data
            const base64Data = inlineData.data;
            mimeType = inlineData.mime_type || inlineData.mimeType || "image/png";
            
            console.log(`✅ [Image Generation] Found inline_data with mime_type: ${mimeType}, data length: ${base64Data.length}`);
            
            // Convert base64 to buffer
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            imageBuffer = bytes.buffer;
            break;
          }
        }
      }
    }

    if (!imageBuffer) {
      console.error("❌ [Image Generation] No inline image data found in response");
      throw new Error("No image data returned from API");
    }

    console.log(`✅ [Image Generation] Successfully generated image, size: ${imageBuffer.byteLength} bytes`);

    // Generate a filename based on the prompt
    const filename = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.png`;
    console.log(`🎨 [Image Generation] Filename: ${filename}`);

    let permanentUrl: string;

    // Check if UploadThing is configured
    const uploadThingToken = process.env.UPLOADTHING_TOKEN;
    if (!uploadThingToken || uploadThingToken === 'placeholder') {
      console.log(`💾 [Image Generation] Saving to local file system...`);
      
      // Save to public/generated-images folder
      const publicDir = path.join(process.cwd(), 'public', 'generated-images');
      const filePath = path.join(publicDir, filename);
      
      // Write file to disk
      await writeFile(filePath, Buffer.from(imageBuffer));
      console.log(`✅ [Image Generation] Saved to: ${filePath}`);
      
      // Return the public URL (accessible via /generated-images/filename.png)
      permanentUrl = `/generated-images/${filename}`;
      console.log(`✅ [Image Generation] Public URL: ${permanentUrl}`);
    } else {
      // Upload to UploadThing if configured
      console.log(`🎨 [Image Generation] Uploading to UploadThing...`);
      const utFile = new UTFile([new Uint8Array(imageBuffer)], filename);
      const uploadResult = await utapi.uploadFiles([utFile]);

      if (!uploadResult[0]?.data?.ufsUrl) {
        console.error("❌ [Image Generation] Upload error:", uploadResult[0]?.error);
        throw new Error("Failed to upload image to UploadThing");
      }

      permanentUrl = uploadResult[0].data.ufsUrl;
      console.log(`✅ [Image Generation] Uploaded to UploadThing URL: ${permanentUrl}`);
    }

    // Get user ID for database storage
    let userId = "development-user"; // Default for development mode
    if (!skipAuth) {
      const session = await auth();
      userId = session?.user?.id || "anonymous";
    }

    // Try to store in database (optional - if it fails, still return success)
    let generatedImage: any = null;
    try {
      console.log(`🎨 [Image Generation] Attempting to save to database...`);
      generatedImage = await db.generatedImage.create({
        data: {
          url: permanentUrl,
          prompt: prompt,
          userId: userId,
        },
      });
      console.log(`✅ [Image Generation] Saved to database with ID: ${generatedImage?.id}`);
    } catch (dbError) {
      console.warn(`⚠️ [Image Generation] Database save failed (non-critical):`, dbError instanceof Error ? dbError.message : String(dbError));
      console.log(`✅ [Image Generation] Image generated successfully, but not saved to database`);
    }

    console.log(`✅✅✅ [Image Generation] SUCCESS! Image URL: ${permanentUrl}`);
    return {
      success: true,
      image: generatedImage || {
        id: `temp-${Date.now()}`,
        url: permanentUrl,
        prompt: prompt,
        userId: userId,
        createdAt: new Date(),
      },
    };
  } catch (error) {
    console.error("❌❌❌ [Image Generation] Error generating image:", error);
    if (error instanceof Error) {
      console.error("❌ [Image Generation] Error message:", error.message);
      console.error("❌ [Image Generation] Error stack:", error.stack);
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate image",
    };
  }
}
