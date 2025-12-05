"""
桥接脚本：接收参数，调用 Gemini API 生成图片，返回结果
用于解决 Node.js 网络连接问题
"""
import sys
import json
import base64
import requests
from io import BytesIO

def generate_image(prompt, model_name, api_key):
    """生成图片并返回 base64 数据"""
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    
    request_body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
    }
    
    try:
        response = requests.post(
            api_url,
            headers={"Content-Type": "application/json"},
            json=request_body,
            timeout=60
        )
        
        if response.status_code != 200:
            return {
                "success": False,
                "error": f"API error {response.status_code}: {response.text[:200]}"
            }
        
        data = response.json()
        
        # 查找图片数据
        if data.get('candidates'):
            for part in data['candidates'][0].get('content', {}).get('parts', []):
                inline_data = part.get('inlineData') or part.get('inline_data')
                if inline_data and inline_data.get('data'):
                    return {
                        "success": True,
                        "image_data": inline_data['data'],  # 已经是 base64
                        "mime_type": inline_data.get('mimeType') or inline_data.get('mime_type', 'image/png')
                    }
        
        return {
            "success": False,
            "error": "No image data found in response"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    # 从命令行参数读取 JSON
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No arguments provided"}))
        sys.exit(1)
    
    try:
        args = json.loads(sys.argv[1])
        result = generate_image(
            args['prompt'],
            args['model'],
            args['apiKey']
        )
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
