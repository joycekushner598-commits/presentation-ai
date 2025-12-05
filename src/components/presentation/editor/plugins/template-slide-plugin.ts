import { createPlatePlugin } from "platejs/react";
import { type TElement } from "platejs";

// 模板幻灯片元素类型
export interface TTemplateSlideElement extends TElement {
    type: "template-slide";
    templateId: string;
    content: Record<string, string>;
    images: Record<string, string>;
    children: [{ text: "" }];
    [key: string]: unknown;
}

import { TemplateSlideElement } from "../custom-elements/template-slide-element";

// 模板幻灯片插件
export const TemplateSlidePlugin = createPlatePlugin({
    key: "template-slide",
    node: {
        isElement: true,
        isVoid: true,
        component: TemplateSlideElement,
    },
});

export const TEMPLATE_SLIDE_ELEMENT = "template-slide";
