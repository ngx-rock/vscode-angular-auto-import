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

  // Добавляем базовый тег только если нет обязательных атрибутов
  // Это предотвращает индексацию input[tuiInputPin] под ключом "input"
  if (cssSelector.element) {
    const hasRequiredAttributes = cssSelector.attrs.length > 0;
    if (!hasRequiredAttributes) {
      collection.push(cssSelector.element);
    }
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
  if (fullSelector && fullSelector.includes(":not")) {
    const simplified = fullSelector.replace(/:not\([^)]+\)/g, "").trim();
    if (simplified && simplified !== fullSelector) {
      collection.push(simplified);
    }
  }
}

/**
 * Получает Angular элементы по селектору
 */
export function getAngularElements(selector: string, indexer: AngularIndexer): AngularElementData[] {
  if (!selector || typeof selector !== "string") {
    return [];
  }

  if (!indexer) {
    return [];
  }

  const originalSelector = selector.trim();
  if (!originalSelector) {
    return [];
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
  const foundElements: AngularElementData[] = [];
  const seenElements = new Set<string>(); // path:name to avoid duplicates

  for (const sel of uniqueSelectors) {
    // 1. Standard Angular elements first
    const std = STANDARD_ANGULAR_ELEMENTS[sel];
    if (std) {
      const key = `${std.importPath}:${std.name}`;
      if (!seenElements.has(key)) {
        const element = new AngularElementData(
          std.importPath,
          std.name,
          std.type,
          std.originalSelector,
          std.selectors,
          !std.name.endsWith("Module") // Heuristic for standard elements
        );
        foundElements.push(element);
        seenElements.add(key);
      }
      // Skip indexed elements for this selector since standard takes precedence
      continue;
    }

    // 2. Then try project index
    try {
      const foundInIndex = indexer.getElements(sel);
      for (const element of foundInIndex) {
        const key = `${element.path}:${element.name}`;
        if (!seenElements.has(key)) {
          foundElements.push(element);
          seenElements.add(key);
        }
      }
    } catch (error) {
      console.warn(`Error getting element from indexer for selector '${sel}':`, error);
      continue;
    }
  }

  return foundElements;
}

/**
 * Получает Angular элемент по селектору (совместимость с существующим кодом)
 * Использует Angular SelectorMatcher для точного сопоставления селекторов
 */
// export function getAngularElement(selector: string, indexer: AngularIndexer): AngularElementData | undefined {
//   const elements = getAngularElements(selector, indexer);

//   if (elements.length === 0) {
//     return undefined;
//   }

//   if (elements.length === 1) {
//     return elements[0];
//   }

//   // Возвращаем первый элемент для синхронной совместимости
//   return elements[0];
// }

/**
 * Асинхронная версия для получения лучшего совпадения с использованием Angular SelectorMatcher
 */
export async function getAngularElementAsync(
  selector: string,
  indexer: AngularIndexer
): Promise<AngularElementData | undefined> {
  const elements = getAngularElements(selector, indexer);

  if (elements.length === 0) {
    return undefined;
  }

  if (elements.length === 1) {
    return elements[0];
  }

  // Используем Angular SelectorMatcher для точного сопоставления
  return await getBestMatchUsingAngularMatcher(selector, elements);
}

/**
 * Использует Angular SelectorMatcher для выбора наиболее подходящего элемента
 */
async function getBestMatchUsingAngularMatcher(
  selector: string,
  candidates: AngularElementData[]
): Promise<AngularElementData | undefined> {
  try {
    const { CssSelector, SelectorMatcher } = await import("@angular/compiler");

    // Создаем CSS селектор для поиска
    const templateCssSelector = new CssSelector();

    // Обрабатываем различные форматы селекторов
    if (selector.startsWith("[") && selector.endsWith("]")) {
      // Атрибутный селектор: [ngIf]
      const attrName = selector.slice(1, -1);
      templateCssSelector.addAttribute(attrName, "");
    } else if (selector.startsWith("*")) {
      // Структурная директива: *ngIf
      const attrName = selector.slice(1);
      templateCssSelector.addAttribute(attrName, "");
    } else {
      // Элемент или простой селектор
      templateCssSelector.setElement(selector);
    }

    const bestMatches: AngularElementData[] = [];

    for (const candidate of candidates) {
      // Пропускаем пайпы, для них используем простое сопоставление
      if (candidate.type === "pipe") {
        if (candidate.name.toLowerCase() === selector.toLowerCase()) {
          bestMatches.push(candidate);
        }
        continue;
      }

      const matcher = new SelectorMatcher();
      const individualSelectors = CssSelector.parse(candidate.originalSelector);
      matcher.addSelectables(individualSelectors);

      const matchedSelectors: string[] = [];
      matcher.match(templateCssSelector, (matchedSelector) => {
        matchedSelectors.push(matchedSelector.toString());
      });

      if (matchedSelectors.length > 0) {
        bestMatches.push(candidate);
      }
    }

    if (bestMatches.length === 0) {
      return undefined;
    }

    if (bestMatches.length === 1) {
      return bestMatches[0];
    }

    // Сортируем по типу, длине селектора и имени
    bestMatches.sort((a, b) => {
      const scoreType = (el: AngularElementData): number => {
        switch (el.type) {
          case "component":
            return 0;
          case "directive":
            return 1;
          case "pipe":
            return 2;
          default:
            return 3;
        }
      };

      const typeDiff = scoreType(a) - scoreType(b);
      if (typeDiff !== 0) {
        return typeDiff;
      }

      const lenDiff = a.originalSelector.length - b.originalSelector.length;
      if (lenDiff !== 0) {
        return lenDiff;
      }

      return a.name.localeCompare(b.name);
    });

    return bestMatches[0];
  } catch (error) {
    console.error("Error using Angular SelectorMatcher:", error);
    return undefined;
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
