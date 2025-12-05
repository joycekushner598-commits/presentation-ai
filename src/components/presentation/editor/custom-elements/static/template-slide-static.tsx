"use client";

import { slideTemplates } from "@/lib/presentation/templates";
import { cn } from "@/lib/utils";
import { SlateElement, type SlateElementProps } from "platejs";
import { useRef, useEffect, useState } from "react";
import { type TTemplateSlideElement } from "../../plugins/template-slide-plugin";

/**
 * 静态模板幻灯片渲染组件
 * 使用响应式缩放来适应任何容器
 */
export function TemplateSlideElementStatic({
    element,
    children,
    className,
    ...props
}: SlateElementProps) {
    const templateElement = element as unknown as TTemplateSlideElement;
    const { templateId, content, images } = templateElement;
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // 获取模板配置
    const template = slideTemplates[templateId];

    // 计算缩放比例
    useEffect(() => {
        if (!containerRef.current || !template) return;

        const updateScale = () => {
            const containerWidth = containerRef.current?.offsetWidth || 800;
            const newScale = containerWidth / template.size.width;
            setScale(newScale);
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, [template]);

    if (!template) {
        return (
            <SlateElement element={element} className={className} {...props}>
                <div className="p-4 text-red-500">模板未找到: {templateId}</div>
                {children}
            </SlateElement>
        );
    }

    const aspectRatio = template.size.height / template.size.width;

    return (
        <SlateElement
            element={element}
            className={cn("w-full block", className)}
            {...props}
        >
            <div
                ref={containerRef}
                className="template-slide-wrapper"
                style={{
                    width: "100%",
                    paddingBottom: `${aspectRatio * 100}%`,
                    position: "relative",
                    backgroundColor: "#f0f0f0",
                    borderRadius: 8,
                    overflow: "hidden",
                }}
            >
                <div
                    className="template-slide-inner"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: template.size.width,
                        height: template.size.height,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                >
                    {/* 渲染模板元素 */}
                    {[...template.elements]
                        .sort((a, b) => (a.style.zIndex ?? 1) - (b.style.zIndex ?? 1))
                        .map((el) => {
                            const { id, type, position, size, style, slot, exampleContent } = el;
                            const textContent = content?.[slot] ?? content?.[id] ?? exampleContent ?? "";
                            const imageUrl = images?.[slot] ?? images?.[id];

                            const baseStyle: React.CSSProperties = {
                                position: "absolute",
                                left: position.x,
                                top: position.y,
                                width: size.width === "auto" ? "auto" : size.width,
                                height: size.height === "auto" ? "auto" : size.height,
                                zIndex: style.zIndex ?? 1,
                            };

                            switch (type) {
                                case "background":
                                    if (el.imageQuery || imageUrl) {
                                        return (
                                            <div key={id} style={{ ...baseStyle, overflow: "hidden" }}>
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        backgroundColor: style.backgroundColor ?? "#d0d0d0",
                                                        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                                                        backgroundSize: "cover",
                                                        backgroundPosition: "center",
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div
                                            key={id}
                                            style={{
                                                ...baseStyle,
                                                backgroundColor: style.backgroundColor,
                                                borderRadius: style.borderRadius,
                                                boxShadow: style.boxShadow,
                                            }}
                                        />
                                    );

                                case "image":
                                    return (
                                        <div
                                            key={id}
                                            style={{
                                                ...baseStyle,
                                                overflow: "hidden",
                                                borderRadius: style.borderRadius,
                                                backgroundColor: "#ccc",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={slot}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: style.objectFit ?? "cover",
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ color: "#888", fontSize: 14 }}>📷</span>
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
                                                color: style.color ?? "#333",
                                                lineHeight: style.lineHeight,
                                                textAlign: style.textAlign,
                                                letterSpacing: style.letterSpacing,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            {textContent}
                                        </div>
                                    );

                                default:
                                    return null;
                            }
                        })}
                </div>
            </div>
            {children}
        </SlateElement>
    );
}
