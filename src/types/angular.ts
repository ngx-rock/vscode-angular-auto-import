/**
 * Angular-специфичные типы и интерфейсы
 */

export interface ComponentInfo {
  path: string; // Relative to project root
  name: string;
  selector: string;
  lastModified: number;
  hash: string;
  type: "component" | "directive" | "pipe";
}

export interface FileElementsInfo {
  filePath: string;
  lastModified: number;
  hash: string;
  elements: ComponentInfo[];
}

export class AngularElementData {
  path: string; // Relative to project root
  name: string;
  type: "component" | "directive" | "pipe";
  /** Все селекторы, под которыми данный элемент может быть найден */
  selectors: string[];
  /** Оригинальный селектор из кода */
  originalSelector: string;

  constructor(
    path: string,
    name: string,
    type: "component" | "directive" | "pipe",
    originalSelector: string,
    selectors: string[]
  ) {
    this.path = path;
    this.name = name;
    this.type = type;
    this.originalSelector = originalSelector;
    this.selectors = selectors;
  }
}

export interface ParsedHtmlElement {
  type:
    | "attribute"
    | "structural-directive"
    | "component"
    | "property-binding"
    | "pipe"
    | "template-reference";
  name: string;
  range: import("vscode").Range;
  tagName: string;
}

export interface ProjectContext {
  projectRootPath: string;
  indexer: import("../services").AngularIndexer;
  tsConfig: import("../types").ProcessedTsConfig | null;
}
