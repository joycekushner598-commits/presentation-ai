/**
 * 幻灯片模板注册系统
 * 
 * 所有可用的幻灯片模板都在这里注册
 */

import { testimonialTemplate, type SlideTemplate, type TemplateElement } from './testimonial-template';
import { productReviewTemplate } from './product-review-template';

// 所有可用的幻灯片模板
export const slideTemplates: Record<string, SlideTemplate> = {
    'testimonial-with-photo': testimonialTemplate,
    'product-review-square': productReviewTemplate,
    // 未来可以在这里添加更多模板
};

// 模板列表（用于 UI 展示）
export const slideTemplateList: SlideTemplate[] = Object.values(slideTemplates);

// 模板 ID 类型
export type SlideTemplateId = keyof typeof slideTemplates;

// 根据 ID 获取模板
export function getTemplateById(id: SlideTemplateId | string): SlideTemplate | undefined {
    return slideTemplates[id];
}

// 根据分类获取模板
export function getTemplatesByCategory(category: SlideTemplate['category']): SlideTemplate[] {
    return slideTemplateList.filter(template => template.category === category);
}

// 重新导出类型
export type { SlideTemplate, TemplateElement };
export { testimonialTemplate };
