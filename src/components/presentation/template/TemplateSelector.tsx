"use client";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { slideTemplateList, type SlideTemplateId } from "@/lib/presentation/templates";
import { usePresentationState } from "@/states/presentation-state";
import { FileText, Layout } from "lucide-react";

/**
 * 幻灯片模板选择器组件
 * 
 * 允许用户选择预定义的幻灯片模板，
 * AI 会根据选中的模板生成相应风格的幻灯片
 */
export function TemplateSelector() {
    const { selectedSlideTemplate, setSelectedSlideTemplate } = usePresentationState();

    const handleTemplateChange = (value: string) => {
        const newValue = value === "default" ? null : value as SlideTemplateId;
        console.log("[TemplateSelector] Changing template to:", newValue);
        setSelectedSlideTemplate(newValue);
    };

    console.log("[TemplateSelector] Current selectedSlideTemplate:", selectedSlideTemplate);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">幻灯片模板</Label>
            </div>
            <Select
                value={selectedSlideTemplate ?? "default"}
                onValueChange={handleTemplateChange}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择模板风格" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div>
                                <span className="font-medium">默认布局</span>
                                <p className="text-xs text-muted-foreground">自动选择最佳布局</p>
                            </div>
                        </div>
                    </SelectItem>
                    {slideTemplateList.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                                <Layout className="h-4 w-4" />
                                <div>
                                    <span className="font-medium">{template.name}</span>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* 显示当前选中模板的提示 */}
            {selectedSlideTemplate && (
                <p className="text-xs text-muted-foreground">
                    AI 将使用此模板风格生成幻灯片
                </p>
            )}
        </div>
    );
}
