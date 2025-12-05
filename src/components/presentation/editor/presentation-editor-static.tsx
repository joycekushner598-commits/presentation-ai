"use client";
import { createSlateEditor, type Value } from "platejs";
import React, { useEffect, useMemo } from "react";

import { cn } from "@/lib/utils";
import { usePresentationState } from "@/states/presentation-state";
import { type PlateSlide } from "../utils/parser";
import { EditorStatic } from "./custom-elements/static/editor-static";
import RootImageStatic from "./custom-elements/static/root-image-static";
import { PresentationEditorBaseKit } from "./plugins/presentation-editor-base-kit";
import { PresentationStaticCustomKit } from "./plugins/static-custom-kit";
import { PresentationStaticComponents } from "./plugins/static-kit";
import { TEMPLATE_SLIDE_ELEMENT } from "./plugins/template-slide-plugin";
import { slideTemplates } from "@/lib/presentation/templates";

interface PresentationEditorStaticViewProps {
  initialContent?: PlateSlide;
  className?: string;
  id?: string;
}

function slideSignature(slide?: PlateSlide): string {
  try {
    return JSON.stringify({
      id: slide?.id,
      content: slide?.content,
      alignment: slide?.alignment,
      layoutType: slide?.layoutType,
      width: slide?.width,
      rootImage: slide?.rootImage,
      bgColor: slide?.bgColor,
    });
  } catch {
    return String(slide?.id ?? "");
  }
}

// 检查幻灯片是否是模板幻灯片
function isTemplateSlide(slide?: PlateSlide): boolean {
  if (!slide?.content || slide.content.length === 0) return false;
  const firstElement = slide.content[0] as { type?: string };
  return firstElement?.type === TEMPLATE_SLIDE_ELEMENT;
}

// 模板幻灯片渲染器
function TemplateSlideRenderer({ slide }: { slide: PlateSlide }) {
  const templateElement = slide.content[0] as {
    type: string;
    templateId: string;
    content: Record<string, string>;
    images: Record<string, string>;
  };

  const template = slideTemplates[templateElement.templateId];

  if (!template) {
    return <div className="p-4 text-red-500">模板未找到: {templateElement.templateId}</div>;
  }

  const { content, images } = templateElement;

  return (
    <div
      className="template-slide-full"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 500, // 确保有最小高度
        overflow: "hidden",
      }}
    >
      {/* 渲染模板元素 */}
      {[...template.elements]
        .sort((a, b) => (a.style.zIndex ?? 1) - (b.style.zIndex ?? 1))
        .map((el) => {
          const { id, type, position, size, style, slot, exampleContent } = el;
          const textContent = content?.[slot] ?? content?.[id] ?? exampleContent ?? "";
          const imageUrl = images?.[slot] ?? images?.[id];

          // 计算百分比位置
          const leftPercent = (position.x / template.size.width) * 100;
          const topPercent = (position.y / template.size.height) * 100;
          const widthPercent = size.width === "auto" ? "auto" : `${(Number(size.width) / template.size.width) * 100}%`;
          const heightPercent = size.height === "auto" ? "auto" : `${(Number(size.height) / template.size.height) * 100}%`;

          const baseStyle: React.CSSProperties = {
            position: "absolute",
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            width: widthPercent,
            height: heightPercent,
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
                        backgroundColor: style.backgroundColor ?? "#e8e8e8",
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
                    backgroundColor: "#ddd",
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
                    <span style={{ color: "#999", fontSize: 24 }}>📷</span>
                  )}
                </div>
              );

            case "text":
              // 计算缩放后的字体大小
              const fontSizeScale = style.fontSize ? style.fontSize * 0.8 : 16;
              return (
                <div
                  key={id}
                  style={{
                    ...baseStyle,
                    fontSize: fontSizeScale,
                    fontFamily: style.fontFamily,
                    fontWeight: style.fontWeight,
                    color: style.color ?? "#000",
                    lineHeight: style.lineHeight,
                    textAlign: style.textAlign,
                    letterSpacing: style.letterSpacing,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
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
  );
}

const PresentationEditorStaticView = React.memo(
  ({ initialContent, className, id }: PresentationEditorStaticViewProps) => {
    const { isPresenting } = usePresentationState();

    // 检查是否是模板幻灯片
    const isTemplate = isTemplateSlide(initialContent);

    // console.log("[EditorStatic] Rendering slide:", id, "Is Template:", isTemplate);

    const editor = useMemo(
      () =>
        createSlateEditor({
          plugins: [
            ...PresentationEditorBaseKit,
            ...PresentationStaticCustomKit,
          ],
          components: PresentationStaticComponents,
          value: initialContent?.content ?? ([] as Value),
        }),
      [],
    );

    // Keep value in sync without recreating editor
    useEffect(() => {
      if (!initialContent?.content) return;
      editor.tf.setValue(initialContent.content);
    }, [editor, initialContent?.content]);

    // 1. 如果是模板幻灯片，直接使用自定义渲染器，跳过 Plate 编辑器
    if (isTemplate && initialContent) {
      return (
        <div
          className={cn(
            "w-full overflow-hidden relative",
            "presentation-slide template-slide",
            className,
          )}
          style={{
            borderRadius: "var(--presentation-border-radius, 0.5rem)",
            aspectRatio: "16/9",
            backgroundColor: "#fff",
          }}
          data-is-presenting={isPresenting ? "true" : "false"}
          data-slide-content="true"
        >
          <TemplateSlideRenderer slide={initialContent} />
        </div>
      );
    }

    // 2. 普通幻灯片，使用 Plate 编辑器渲染
    return (
      <div
        className={cn(
          "flex min-h-[500px] w-full",
          "scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30 overflow-hidden p-0 scrollbar-thin scrollbar-track-transparent",
          "relative text-foreground",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50",
          className,
          initialContent?.layoutType === "right" && "flex-row",
          initialContent?.layoutType === "vertical" && "flex-col-reverse",
          initialContent?.layoutType === "left" && "flex-row-reverse",
          initialContent?.layoutType === "background" && "flex-col",
          "presentation-slide",
        )}
        style={{
          borderRadius: "var(--presentation-border-radius, 0.5rem)",
          backgroundColor: initialContent?.bgColor || undefined,
          backgroundImage:
            initialContent?.layoutType === "background" &&
              initialContent?.rootImage?.url
              ? `url(${initialContent.rootImage.url})`
              : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        data-is-presenting={isPresenting ? "true" : "false"}
        data-slide-content="true"
      >
        <EditorStatic
          className={cn(
            className,
            "flex flex-col border-none !bg-transparent p-12 outline-none h-full",
            initialContent?.alignment === "start" && "justify-start",
            initialContent?.alignment === "center" && "justify-center",
            initialContent?.alignment === "end" && "justify-end",
          )}
          id={id}
          editor={editor}
        />

        {initialContent?.rootImage &&
          initialContent.layoutType !== undefined &&
          initialContent.layoutType !== "background" && (
            <RootImageStatic
              image={initialContent.rootImage}
              layoutType={initialContent.layoutType}
              slideId={initialContent.id}
            />
          )}
      </div>
    );
  },
  (prev, next) => {
    if (prev.id !== next.id) return false;
    if (
      slideSignature(prev.initialContent) !==
      slideSignature(next.initialContent)
    )
      return false;
    if (prev.className !== next.className) return false;
    return true;
  },
);

export default PresentationEditorStaticView;
