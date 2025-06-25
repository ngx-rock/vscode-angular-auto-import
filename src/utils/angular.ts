/**
 * Утилиты для работы с Angular элементами и селекторами
 */
import { STANDARD_ANGULAR_ELEMENTS } from "../config";
import type { AngularIndexer } from "../services";
import { AngularElementData } from "../types";

/**
 * Парсит сложный селектор Angular и возвращает массив индивидуальных селекторов.
 */
export function parseAngularSelector(selectorString: string): string[] {
  if (!selectorString) {
    return [];
  }

  console.log(`[parseAngularSelector] Parsing selector: "${selectorString}"`);

  // Разделяем по запятым и очищаем от пробелов
  const rawSelectors = selectorString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const parsedSelectors: string[] = [];

  for (const rawSelector of rawSelectors) {
    console.log(`[parseAngularSelector] Processing raw selector: "${rawSelector}"`);

    // Нормализуем селектор и извлекаем все возможные варианты
    const normalized = normalizeSelector(rawSelector);
    if (normalized.length > 0) {
      parsedSelectors.push(...normalized);
      console.log(`[parseAngularSelector] Added normalized selectors: [${normalized.join(", ")}]`);
    }
  }

  const uniqueSelectors = [...new Set(parsedSelectors)];
  console.log(`[parseAngularSelector] Final unique selectors: [${uniqueSelectors.join(", ")}]`);

  return uniqueSelectors;
}

/**
 * Нормализует индивидуальный селектор и возвращает все возможные варианты его использования.
 */
export function normalizeSelector(selector: string): string[] {
  if (!selector) {
    return [];
  }

  const trimmed = selector.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const variants: string[] = [];

  // Обрабатываем различные типы селекторов
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    // Атрибутный селектор: [fontColor], [green-font-color]
    const attrName = trimmed.slice(1, -1).trim();
    if (attrName.length > 0) {
      variants.push(trimmed); // [fontColor]
      variants.push(attrName); // fontColor
    }
  } else if (trimmed.startsWith(".")) {
    // Селектор класса: .my-class
    const className = trimmed.slice(1).trim();
    if (className.length > 0) {
      variants.push(trimmed); // .my-class
      variants.push(className); // my-class
    }
  } else if (trimmed.includes("[") && trimmed.includes("]")) {
    // Комбинированный селектор: button[type="reset"], img[ngSrc]
    variants.push(trimmed); // button[type="reset"]

    // Извлекаем элементную часть
    const elementMatch = trimmed.match(/^([a-zA-Z0-9-]+)\[/);
    if (elementMatch?.[1]) {
      variants.push(elementMatch[1]); // button
    }

    // Извлекаем атрибутную часть
    const attrMatch = trimmed.match(/\[([^\]]+)\]/g);
    if (attrMatch) {
      for (const attr of attrMatch) {
        const attrName = attr.slice(1, -1).trim();
        if (attrName.length > 0) {
          variants.push(attr); // [type="reset"]
          // Для простых атрибутов без значения добавляем имя
          if (!attrName.includes("=")) {
            variants.push(attrName); // ngSrc
          }
        }
      }
    }
  } else {
    // Простой элементный селектор: green-font-color, my-component
    variants.push(trimmed);
  }

  // Убираем дубликаты и пустые строки
  return [...new Set(variants.filter((v) => v.length > 0))];
}

/**
 * Получает Angular элемент по селектору
 */
export function getAngularElement(selector: string, indexer: AngularIndexer): AngularElementData | undefined {
  if (!selector || typeof selector !== "string") {
    return undefined;
  }

  if (!indexer) {
    return undefined;
  }

  const originalSelector = selector.trim();
  if (!originalSelector) {
    return undefined;
  }

  const selectorsToTry: string[] = [originalSelector];

  // Generate variants from a base form (e.g., 'ngIf' from '*ngIf' or '[ngIf]')
  let base = originalSelector;
  if (base.startsWith("*")) {
    base = base.slice(1);
  } else if (base.startsWith("[") && base.endsWith("]")) {
    base = base.slice(1, -1);
  }

  // Add variants for the base
  selectorsToTry.push(base, `*${base}`, `[${base}]`);

  // Special handling for ngFor <-> ngForOf mapping
  if (base === "ngFor" || base === "ngForOf") {
    selectorsToTry.push("ngForOf", "[ngForOf]");
  }

  const uniqueSelectors = [...new Set(selectorsToTry)];

  for (const sel of uniqueSelectors) {
    // 1. Try project index first
    try {
      const foundInIndex = indexer.getElement(sel);
      if (foundInIndex) {
        return foundInIndex;
      }
    } catch (error) {
      console.warn(`Error getting element from indexer for selector '${sel}':`, error);
      continue;
    }

    // 2. Then try standard Angular elements
    const std = STANDARD_ANGULAR_ELEMENTS[sel];
    if (std) {
      return new AngularElementData(std.importPath, std.name, std.type, std.originalSelector, std.selectors);
    }
  }

  return undefined;
}

/**
 * Генерирует хеш строки
 */
export function generateHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

/**
 * Извлекает информацию об Angular элементе из кода
 */
export function extractAngularElementInfo(code: string, filePath: string): AngularElementData | null {
  if (!code || !filePath) {
    return null;
  }

  try {
    // Extract class name
    const classMatch = code.match(/export\s+class\s+(\w+)/);
    if (!classMatch) {
      return null;
    }
    const className = classMatch[1];

    // Determine type based on file name
    let type: "component" | "directive" | "pipe";
    if (filePath.includes(".component.")) {
      type = "component";
    } else if (filePath.includes(".directive.")) {
      type = "directive";
    } else if (filePath.includes(".pipe.")) {
      type = "pipe";
    } else {
      return null;
    }

    // Extract selector/name
    let selector: string;
    if (type === "pipe") {
      const nameMatch = code.match(/name:\s*['"]([^'"]*)['"]/);
      if (!nameMatch) {
        return null;
      }
      selector = nameMatch[1];
    } else {
      const selectorMatch = code.match(/selector:\s*['"]([^'"]*)['"]/);
      if (!selectorMatch) {
        return null;
      }
      selector = selectorMatch[1];
    }

    const selectors = parseAngularSelector(selector);

    return new AngularElementData(
      filePath,
      className,
      type,
      selector, // originalSelector
      selectors
    );
  } catch (_error) {
    return null;
  }
}

/**
 * Проверяет, является ли файл Angular файлом
 */
export function isAngularFile(filePath: string): boolean {
  if (!filePath || typeof filePath !== "string") {
    return false;
  }

  return /\.(component|directive|pipe)\.ts$/.test(filePath);
}

/**
 * Генерирует import statement
 */
export function generateImportStatement(name: string, path: string): string {
  return `import { ${name} } from '${path}';`;
}

/**
 * Разрешает относительный путь между файлами
 */
export function resolveRelativePath(from: string, to: string): string {
  if (!from || !to) {
    return "";
  }

  try {
    const path = require("node:path");
    const fromDir = path.dirname(from);
    let relativePath = path.relative(fromDir, to);

    // Remove extension
    relativePath = relativePath.replace(/\.ts$/, "");

    // Ensure relative path starts with ./ or ../
    if (!relativePath.startsWith(".")) {
      relativePath = `./${relativePath}`;
    }

    return relativePath;
  } catch (_error) {
    return "";
  }
}

/**
 * Complex selector parsing interfaces and functions
 */
export interface ComplexSelectorSegment {
  element?: string;
  attributes: string[];
}

export interface HtmlContext {
  tagName: string;
  attributes: string[];
  classes: string[];
}

/**
 * Parses a complex Angular selector and returns segments
 */
export function parseComplexSelector(selector: string): ComplexSelectorSegment[] {
  if (!selector) {
    return [];
  }

  // Split by comma to handle multiple segments
  const segments = selector.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const result: ComplexSelectorSegment[] = [];

  for (const segment of segments) {
    const parsed = parseSegment(segment);
    if (parsed) {
      result.push(parsed);
    }
  }

  return result;
}

/**
 * Parses a single selector segment
 */
function parseSegment(segment: string): ComplexSelectorSegment | null {
  if (!segment) {
    return null;
  }

  const result: ComplexSelectorSegment = {
    attributes: []
  };

  // Extract attributes [attr1][attr2]
  const attributeRegex = /\[([^\]]+)\]/g;
  let match;
  let segmentWithoutAttrs = segment;

  while ((match = attributeRegex.exec(segment)) !== null) {
    result.attributes.push(match[1]);
    segmentWithoutAttrs = segmentWithoutAttrs.replace(match[0], '');
  }

  // The remaining part is the element name
  const elementName = segmentWithoutAttrs.trim();
  if (elementName) {
    result.element = elementName;
  }

  return result;
}

/**
 * Extracts HTML context from text at a given position
 */
export function extractHtmlContext(html: string, position: number): HtmlContext | null {
  if (!html || position < 0 || position >= html.length) {
    return null;
  }

  // Find the opening tag that contains this position
  let tagStart = -1;
  let tagEnd = -1;

  // Search backwards for '<' and forwards for '>'
  for (let i = position; i >= 0; i--) {
    if (html[i] === '<') {
      tagStart = i;
      break;
    }
  }

  for (let i = position; i < html.length; i++) {
    if (html[i] === '>') {
      tagEnd = i;
      break;
    }
  }

  if (tagStart === -1 || tagEnd === -1) {
    return null;
  }

  // Extract tag content
  const tagContent = html.substring(tagStart + 1, tagEnd);
  if (!tagContent) {
    return null;
  }

  // Parse tag name and attributes
  const parts = tagContent.trim().split(/\s+/);
  if (parts.length === 0) {
    return null;
  }

  const tagName = parts[0];
  const attributes: string[] = [];
  const classes: string[] = [];

  // Parse attributes
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    // Handle class="value" format
    if (part.startsWith('class=')) {
      const classValue = part.substring(6).replace(/["']/g, '');
      classes.push(...classValue.split(/\s+/).filter(c => c.length > 0));
      // Also add "class" to attributes as expected by tests
      attributes.push('class');
    }
    // Handle simple attributes
    else if (!part.includes('=')) {
      attributes.push(part.toLowerCase());
    }
    // Handle other attributes
    else {
      const [attrName] = part.split('=');
      attributes.push(attrName.toLowerCase());
    }
  }

  return {
    tagName,
    attributes,
    classes
  };
}

/**
 * Validates if HTML context matches a complex selector
 */
export function validateHtmlContextForComplexSelector(context: HtmlContext, selector: string): boolean {
  if (!context || !selector) {
    return false;
  }

  const segments = parseComplexSelector(selector);
  if (segments.length === 0) {
    return false;
  }

  // Check if any segment matches
  return segments.some(segment => matchesSegment(context, segment));
}

/**
 * Checks if context matches a specific segment
 */
function matchesSegment(context: HtmlContext, segment: ComplexSelectorSegment): boolean {
  // Check element name if specified
  if (segment.element && segment.element !== context.tagName) {
    return false;
  }

  // Check all required attributes are present
  for (const requiredAttr of segment.attributes) {
    const normalizedAttr = requiredAttr.toLowerCase();
    if (!context.attributes.includes(normalizedAttr)) {
      return false;
    }
  }

  return true;
}
