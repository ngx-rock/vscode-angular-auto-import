import { SelectorMatcher, CssSelector, parseTemplate, TmplAstNode, TmplAstElement } from '@angular/compiler';
import type { AngularElementData } from '../types/angular';

/**
 * Service for matching Angular selectors against HTML template AST nodes.
 * Uses @angular/compiler's SelectorMatcher and CssSelector.
 */
export class SelectorMatchingService {
  // Кэш сопоставителей для строк селекторов
  private matcherCache: Map<string, SelectorMatcher> = new Map();

  constructor() {}

  /**
   * Возвращает или создаёт и кэширует SelectorMatcher для одного селектора
   */
  private getMatcherFor(selector: string): SelectorMatcher {
    let matcher = this.matcherCache.get(selector);
    if (!matcher) {
      matcher = new SelectorMatcher();
      // Разбираем селектор-строку в CssSelector[] и регистрируем их
      const cssSelectors = CssSelector.parse(selector);
      matcher.addSelectables(cssSelectors, selector);
      this.matcherCache.set(selector, matcher);
    }
    return matcher;
  }

  /**
   * Строит CssSelector из одного узла шаблона (тег + атрибуты)
   */
  private buildCssSelector(node: TmplAstElement): CssSelector {
    const cssSel = new CssSelector();
    // Имя тега
    cssSel.setElement(node.name);
    // Статические атрибуты
    for (const attr of node.attributes) {
      cssSel.addAttribute(attr.name, attr.value ?? '');
    }
    // Привязки свойств
    for (const input of node.inputs) {
      cssSel.addAttribute(`[${input.name}]`, '');
    }
    return cssSel;
  }

  /**
   * Сопоставляет один узел с элементами из индекса
   */
  public matchElement(
    node: TmplAstElement,
    index: AngularElementData[]
  ): AngularElementData[] {
    const result: AngularElementData[] = [];
    const contextSel = this.buildCssSelector(node);
    for (const elData of index) {
      // Проверяем каждый возможный селектор элемента
      const isMatched = elData.selectors.some(selector => {
        let matched = false;
        const matcher = this.getMatcherFor(selector);
        matcher.match(contextSel, () => {
          matched = true;
        });
        return matched;
      });
      if (isMatched) {
        result.push(elData);
      }
    }
    return result;
  }

  /**
   * Разбирает шаблон и возвращает все совпадения по элементам
   */
  public matchTemplate(
    template: string,
    index: AngularElementData[]
  ): Array<{ node: TmplAstElement; matches: AngularElementData[] }> {
    const parsed = parseTemplate(template, 'ng-template.html');
    const results: Array<{ node: TmplAstElement; matches: AngularElementData[] }> = [];
    if (parsed.errors && parsed.errors.length) {
      // При необходимости можно логировать ошибки парсинга
    }
    // Рекурсивный обход AST
    const visit = (nodes: TmplAstNode[]) => {
      for (const node of nodes) {
        if (node instanceof TmplAstElement) {
          const matches = this.matchElement(node, index);
          if (matches.length > 0) {
            results.push({ node, matches });
          }
          visit(node.children);
        }
      }
    };
    visit(parsed.nodes);
    return results;
  }
}
