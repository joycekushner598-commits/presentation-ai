/**
 * Canvas 模板索引
 * 
 * 导出所有可用的 Canvas 模板
 */

import { canvasTemplate1 } from './canvas-template-1';
import { canvasTemplate2 } from './canvas-template-2';
import { type SlideTemplate } from '../../../src/lib/presentation/templates/testimonial-template';

// 所有 Canvas 模板
export const canvasTemplates: Record<string, SlideTemplate> = {
    'canvas-template-1': canvasTemplate1,
    'canvas-template-2': canvasTemplate2,
};

// 模板列表（用于随机选择）
export const canvasTemplateList: SlideTemplate[] = Object.values(canvasTemplates);

// 随机获取一个模板
export function getRandomTemplate(): SlideTemplate {
    const randomIndex = Math.floor(Math.random() * canvasTemplateList.length);
    return canvasTemplateList[randomIndex];
}

// 根据 ID 获取模板
export function getTemplateById(id: string): SlideTemplate | undefined {
    return canvasTemplates[id];
}

export { canvasTemplate1, canvasTemplate2 };
