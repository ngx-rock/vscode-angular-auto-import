/**
 * Утилиты для работы с Angular элементами и селекторами
 */

import { STANDARD_ANGULAR_ELEMENTS } from "../config";
import type { AngularIndexer } from "../services";
import { AngularElementData } from "../types";

/**
 * Парсит сложный селектор Angular и возвращает массив индивидуальных селекторов.
 * Использует CssSelector.parse из @angular/compiler для надежного парсинга.
 */
export async function parseAngularSelector(selectorString: string): Promise<string[]> {
  if (!selectorString) {
    return [];
  }

  console.log(`[parseAngularSelector] Parsing selector: "${selectorString}"`);

  // We are now confident in the primary async parser.
  return parseAngularSelectorSync(selectorString);
}

async function parseAngularSelectorSync(selectorString: string): Promise<string[]> {
  // Используем динамический import(), который лучше работает с ES-модулями
  const compiler = await import("@angular/compiler");
  const { CssSelector } = compiler;

  // Используем CssSelector.parse для надежного парсинга селекторов
  const cssSelectors = CssSelector.parse(selectorString);
  const parsedSelectors: string[] = [];

  for (const cssSelector of cssSelectors) {
    processCssSelector(cssSelector as unknown as CssSelectorForParsing, parsedSelectors);
  }

  const uniqueSelectors = [...new Set(parsedSelectors.filter((s) => s && s.length > 0))];
  console.log(`[parseAngularSelector] Final unique selectors: [${uniqueSelectors.join(", ")}]`);

  return uniqueSelectors;
}

/**
 * Определяет интерфейс для объекта CssSelector для типобезопасности.
 */
interface CssSelectorForParsing {
    element: string | null;
    classNames: string[];
    attrs: string[];
    notSelectors: CssSelectorForParsing[];
    toString(): string;
}

/**
 * Рекурсивно обрабатывает CssSelector и его notSelectors.
 */
function processCssSelector(cssSelector: CssSelectorForParsing, collection: string[]): void {
  // Добавляем полный оригинальный селектор
  const fullSelector = cssSelector.toString();
  if (fullSelector) {
    collection.push(fullSelector);
  }
  
  // Добавляем базовый тег, если он есть
  if (cssSelector.element) {
    collection.push(cssSelector.element);
  }
  
  // Добавляем селекторы-атрибуты в квадратных скобках и без
  for (let i = 0; i < cssSelector.attrs.length; i += 2) {
    const attrName = cssSelector.attrs[i];
    if (attrName) {
      collection.push(attrName); // e.g., 'tuiTabs'
      collection.push(`[${attrName}]`); // e.g., '[tuiTabs]'
    }
  }

  // Для селекторов с :not() дополнительно добавляем версию без :not()
  if (fullSelector && fullSelector.includes(':not')) {
    const simplified = fullSelector.replace(/:not\([^)]+\)/g, '').trim();
    if (simplified && simplified !== fullSelector) {
      collection.push(simplified);
    }
  }
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
      return new AngularElementData(
        std.importPath,
        std.name,
        std.type,
        std.originalSelector,
        std.selectors,
        !std.name.endsWith("Module") // Heuristic for standard elements
      );
    }
  }

  return undefined;
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
