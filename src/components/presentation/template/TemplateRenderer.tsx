"use client";

import { usePresentationState } from "@/states/presentation-state";
import { useTheme } from "next-themes";
import Image from "next/image";
import { type SlideTemplate, type TemplateElement } from "@/lib/presentation/templates";

interface TemplateRendererProps {
    template: SlideTemplate;
    content: {
        [slotId: string]: string | undefined;
    };
    images: {
        [slotId: string]: string | undefined;
    };
    onImageClick?: (slotId: string, currentQuery?: string) => void;
}

/**
 * 模板渲染引擎
 * 
 * 根据模板配置渲染幻灯片，支持：
 * - 精确像素定位
 * - 多种元素类型（文本、图片、背景）
 * - 自动文字缩放
 */
export function TemplateRenderer({ template, content, images, onImageClick }: TemplateRendererProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    console.log("[TemplateRenderer] Rendering with:", { templateId: template.id, contentKeys: Object.keys(content), imageKeys: Object.keys(images) });

    // 渲染单个元素
    const renderElement = (element: TemplateElement) => {
        const { id, type, position, size, style, slot, constraints, exampleContent } = element;

        // 获取内容（用户提供的或示例内容）
        const textContent = content[slot] ?? content[id] ?? exampleContent ?? "";
        const imageUrl = images[slot] ?? images[id] ?? element.imageQuery;

        // 计算样式
        const baseStyle: React.CSSProperties = {
            position: "absolute",
            left: position.x,
            top: position.y,
            width: size.width === "auto" ? "auto" : size.width,
            height: size.height === "auto" ? "auto" : size.height,
            zIndex: style.zIndex ?? 1,
        };

        // 根据类型渲染不同元素
        switch (type) {
            case "background":
                if (element.imageQuery || imageUrl) {
                    // 背景图片
                    return (
                        <div
                            key={id}
                            style={{
                                ...baseStyle,
                                overflow: "hidden",
                                cursor: onImageClick ? "pointer" : "default",
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onImageClick) {
                                    const query = (typeof imageUrl === "string" ? imageUrl : undefined) || element.imageQuery || "background";
                                    // 背景通常使用 element.imageQuery 或默认的 slot 名称
                                    onImageClick(slot || id, query);
                                }
                            }}
                            title="Click to regenerate background"
                        >
                            {typeof imageUrl === "string" && imageUrl.startsWith("/") ? (
                                <Image
                                    src={imageUrl}
                                    alt={slot}
                                    fill
                                    style={{
                                        objectFit: style.objectFit ?? "cover",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: style.backgroundColor ?? "#f0f0f0",
                                        backgroundImage: typeof imageUrl === "string" ? `url(${imageUrl})` : undefined,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                />
                            )}
                        </div>
                    );
                } else {
                    // 纯色背景或装饰框
                    return (
                        <div
                            key={id}
                            style={{
                                ...baseStyle,
                                backgroundColor: style.backgroundColor ?? "transparent",
                                borderRadius: style.borderRadius,
                                boxShadow: style.boxShadow,
                            }}
                        />
                    );
                }

            case "image":
                // Check if imageUrl looks like a valid URL or path
                const isValidUrl = imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/") || imageUrl.startsWith("data:"));

                return (
                    <div
                        key={id}
                        style={{
                            ...baseStyle,
                            overflow: "hidden",
                            borderRadius: style.borderRadius,
                            boxShadow: style.boxShadow,
                            backgroundColor: isValidUrl ? undefined : (style.backgroundColor ?? "#f0f0f0"),
                            display: isValidUrl ? "block" : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: onImageClick ? "pointer" : "default",
                            border: isValidUrl ? "none" : "1px dashed #ccc",
                        }}
                        title={imageUrl || "Click to add image"}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onImageClick) {
                                const query = imageUrl || element.imageQuery || "image";
                                onImageClick(slot || id, query);
                            }
                        }}
                    >
                        {isValidUrl ? (
                            <Image
                                src={imageUrl}
                                alt={slot}
                                fill
                                style={{
                                    objectFit: style.objectFit ?? "cover",
                                    borderRadius: style.borderRadius,
                                }}
                            />
                        ) : (
                            <div className="text-center p-2">
                                <span style={{ color: "#999", fontSize: 24, display: "block", marginBottom: 4 }}>📷</span>
                                <span style={{ color: "#666", fontSize: 12 }}>
                                    {imageUrl || element.imageQuery || "Select Image"}
                                </span>
                            </div>
                        )}
                    </div>
                );

            case "text":
                return (
                    <div
                        key={id}
                        style={{
                            ...baseStyle,
                            fontSize: style.fontSize,
                            fontFamily: style.fontFamily,
                            fontWeight: style.fontWeight,
                            color: style.color,
                            lineHeight: style.lineHeight,
                            textAlign: style.textAlign,
                            letterSpacing: style.letterSpacing,
                            display: "flex",
                            alignItems: "center",
                            overflow: "hidden",
                        }}
                    >
                        <span
                            style={{
                                display: "-webkit-box",
                                WebkitLineClamp: constraints?.maxLines ?? 10,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {textContent}
                        </span>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className="template-slide"
            style={{
                position: "relative",
                width: template.size.width,
                height: template.size.height,
                overflow: "hidden",
                backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
            }}
        >
            {/* 按 zIndex 排序渲染元素 */}
            {[...template.elements]
                .sort((a, b) => (a.style.zIndex ?? 1) - (b.style.zIndex ?? 1))
                .map(renderElement)}
        </div>
    );
}

/**
 * 缩放包装器 - 让模板适应容器大小
 */
export function ScaledTemplateRenderer({
    template,
    content,
    images,
    containerWidth,
    containerHeight,
    onImageClick,
}: TemplateRendererProps & {
    containerWidth?: number;
    containerHeight?: number;
}) {
    const scale = containerWidth
        ? Math.min(
            containerWidth / template.size.width,
            (containerHeight ?? containerWidth * 0.5625) / template.size.height
        )
        : 1;

    return (
        <div
            style={{
                width: template.size.width * scale,
                height: template.size.height * scale,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                <TemplateRenderer
                    template={template}
                    content={content}
                    images={images}
                    onImageClick={onImageClick}
                />
            </div>
        </div>
    );
}
