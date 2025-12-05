"use client";

import { generateImageAction } from "@/app/_actions/image/generate";
import { useState } from "react";

export default function TestImagePage() {
  const [prompt, setPrompt] = useState("A beautiful sunset over mountains");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    
    console.log("🧪 测试：开始生成图片");
    console.log("🧪 测试：Prompt =", prompt);
    
    try {
      const res = await generateImageAction(prompt, "nano-banana-pro-preview");
      console.log("🧪 测试：返回结果 =", res);
      setResult(res);
    } catch (error) {
      console.error("🧪 测试：错误 =", error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "monospace" }}>
      <h1 style={{ marginBottom: "20px" }}>🧪 Gemini 图片生成测试</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px" }}>
          <strong>输入提示词：</strong>
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "2px solid #ccc",
            borderRadius: "4px"
          }}
          placeholder="输入图片描述..."
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "⏳ 生成中..." : "🚀 生成图片"}
      </button>

      {loading && (
        <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#fff3cd", borderRadius: "4px" }}>
          ⏳ 正在生成图片，请稍候...（可能需要 10-30 秒）
        </div>
      )}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ marginBottom: "16px" }}>📥 返回结果：</h2>
          
          <div style={{ marginBottom: "20px" }}>
            <strong>success:</strong> {result.success ? "✅ true" : "❌ false"}
          </div>

          {result.success && result.image?.url && (
            <div style={{ marginBottom: "20px" }}>
              <strong>图片 URL:</strong>
              <div style={{ 
                padding: "12px", 
                backgroundColor: "#e7f3ff", 
                borderRadius: "4px",
                marginTop: "8px",
                wordBreak: "break-all"
              }}>
                {result.image.url}
              </div>
              
              <div style={{ marginTop: "16px" }}>
                <strong>预览：</strong>
                <div style={{ marginTop: "8px" }}>
                  <img 
                    src={result.image.url} 
                    alt="Generated" 
                    style={{ 
                      maxWidth: "100%", 
                      border: "2px solid #ddd",
                      borderRadius: "8px"
                    }} 
                  />
                </div>
              </div>
            </div>
          )}

          {result.error && (
            <div style={{ 
              padding: "16px", 
              backgroundColor: "#ffebee", 
              borderRadius: "4px",
              marginBottom: "20px"
            }}>
              <strong>❌ 错误信息:</strong>
              <pre style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>
                {result.error}
              </pre>
            </div>
          )}

          <details style={{ marginTop: "20px" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold", padding: "8px" }}>
              📋 查看完整 JSON 响应
            </summary>
            <pre style={{ 
              padding: "16px", 
              backgroundColor: "#f5f5f5", 
              borderRadius: "4px",
              overflow: "auto",
              marginTop: "12px"
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ 
        marginTop: "40px", 
        padding: "16px", 
        backgroundColor: "#f0f0f0", 
        borderRadius: "4px",
        fontSize: "14px"
      }}>
        <strong>💡 提示：</strong>
        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
          <li>打开浏览器开发者工具（F12）→ Console 标签，可以看到详细日志</li>
          <li>VS Code 终端也会显示服务器端的日志</li>
          <li>生成一张图片大约需要 10-30 秒</li>
        </ul>
      </div>
    </div>
  );
}
