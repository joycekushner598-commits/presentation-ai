"""
测试 Gemini API 图片生成功能
"""
import os
import json
import requests
from PIL import Image
from io import BytesIO
import base64

# 你的 Gemini API Key
API_KEY = "AIzaSyDYCkNnbKjBptfYLuUMZDCha452v_oyvXo"

# 模型名称
MODEL_NAME = "gemini-2.5-flash-image-preview"

# 测试提示词
PROMPT = "A beautiful sunset over mountains, photorealistic, 8k"

print("=" * 60)
print("🧪 Gemini 图片生成 API 测试")
print("=" * 60)
print(f"📝 模型: {MODEL_NAME}")
print(f"📝 提示词: {PROMPT}")
print("=" * 60)

# 构建 API URL
api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"

# 构建请求体
request_body = {
    "contents": [
        {
            "parts": [
                {
                    "text": PROMPT,
                }
            ]
        }
    ],
    "generationConfig": {
        "responseModalities": ["TEXT", "IMAGE"]
    }
}

print("\n📤 发送请求到 Google API...")
print(f"🔗 URL: {api_url[:80]}...")
print(f"📦 请求体:")
print(json.dumps(request_body, indent=2, ensure_ascii=False))
print()

try:
    # 发送 POST 请求
    response = requests.post(
        api_url,
        headers={"Content-Type": "application/json"},
        json=request_body,
        timeout=60
    )
    
    print(f"📥 响应状态码: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ 错误: HTTP {response.status_code}")
        print(f"❌ 响应内容: {response.text[:500]}")
        exit(1)
    
    # 解析响应
    response_data = response.json()
    print(f"✅ 成功接收响应")
    
    # 打印响应结构
    print(f"\n📊 响应结构:")
    print(f"   - 有 candidates: {bool(response_data.get('candidates'))}")
    if response_data.get('candidates'):
        print(f"   - candidates 数量: {len(response_data['candidates'])}")
        first_candidate = response_data['candidates'][0]
        print(f"   - 有 content: {bool(first_candidate.get('content'))}")
        if first_candidate.get('content'):
            parts = first_candidate['content'].get('parts', [])
            print(f"   - parts 数量: {len(parts)}")
            
            # 检查每个 part
            for i, part in enumerate(parts):
                print(f"\n   📦 Part {i}:")
                print(f"      - Keys: {list(part.keys())}")
                
                # 检查 inline_data
                if 'inline_data' in part:
                    inline_data = part['inline_data']
                    print(f"      - 有 inline_data ✅")
                    print(f"      - mime_type: {inline_data.get('mime_type')}")
                    if 'data' in inline_data:
                        data_len = len(inline_data['data'])
                        print(f"      - data 长度: {data_len} 字符 (base64)")
                        
                        # 尝试解码并保存图片
                        try:
                            print(f"\n🎨 解码并保存图片...")
                            image_data = base64.b64decode(inline_data['data'])
                            image = Image.open(BytesIO(image_data))
                            
                            output_filename = "gemini_test_output.png"
                            image.save(output_filename)
                            
                            print(f"✅✅✅ 成功！图片已保存为: {output_filename}")
                            print(f"📐 图片尺寸: {image.size}")
                            print(f"📊 图片格式: {image.format}")
                            print(f"💾 文件大小: {len(image_data)} 字节")
                            
                        except Exception as e:
                            print(f"❌ 解码图片失败: {e}")
                
                elif 'inlineData' in part:
                    inline_data = part['inlineData']
                    print(f"      - 有 inlineData (驼峰命名) ✅")
                    print(f"      - mimeType: {inline_data.get('mimeType')}")
                    if 'data' in inline_data:
                        data_len = len(inline_data['data'])
                        print(f"      - data 长度: {data_len} 字符 (base64)")
                        
                        # 尝试解码并保存图片
                        try:
                            print(f"\n🎨 解码并保存图片...")
                            image_data = base64.b64decode(inline_data['data'])
                            image = Image.open(BytesIO(image_data))
                            
                            output_filename = "gemini_test_output.png"
                            image.save(output_filename)
                            
                            print(f"✅✅✅ 成功！图片已保存为: {output_filename}")
                            print(f"📐 图片尺寸: {image.size}")
                            print(f"📊 图片格式: {image.format}")
                            print(f"💾 文件大小: {len(image_data)} 字节")
                            
                        except Exception as e:
                            print(f"❌ 解码图片失败: {e}")
                
                if 'text' in part:
                    text = part['text'][:100]
                    print(f"      - 有 text: {text}...")
    
    print("\n" + "=" * 60)
    print("🎉 测试完成！")
    print("=" * 60)
    
    # 保存完整响应到 JSON 文件
    with open("gemini_response.json", "w", encoding="utf-8") as f:
        json.dump(response_data, f, indent=2, ensure_ascii=False)
    print("📄 完整响应已保存到: gemini_response.json")
    
except requests.exceptions.Timeout:
    print("❌ 请求超时！API 响应时间过长")
except requests.exceptions.RequestException as e:
    print(f"❌ 请求错误: {e}")
except Exception as e:
    print(f"❌ 发生错误: {e}")
    import traceback
    traceback.print_exc()
