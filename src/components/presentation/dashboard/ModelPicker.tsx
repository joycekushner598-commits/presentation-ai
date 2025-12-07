"use client";

import { Sparkles } from "lucide-react";

/**
 * 简化版模型选择器
 * 仅使用 Google Gemini，不暴露模型选择给用户
 */
export function ModelPicker({
  shouldShowLabel = true,
}: {
  shouldShowLabel?: boolean;
}) {
  return (
    <div>
      {shouldShowLabel && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          AI 模型
        </label>
      )}
      <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background text-sm">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span className="text-muted-foreground">Gemini 2.0 Flash</span>
      </div>
    </div>
  );
}
