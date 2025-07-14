/**
 * Основные типы данных для Angular элементов
 */

import type { ProcessedTsConfig } from "./tsconfig";

export interface ComponentInfo {
  path: string;
  name: string;
  selector: string;
  type: "component" | "directive" | "pipe";
  lastModified: number;
  hash: string;
  isStandalone: boolean;
}

/**
 * Представляет данные об элементе Angular для индексации
 */
export class AngularElementData {
  constructor(
    public readonly path: string,
    public readonly name: string,
    public readonly type: "component" | "directive" | "pipe",
    public readonly originalSelector: string,
    public readonly selectors: string[],
    public readonly isStandalone: boolean,
    public readonly exportingModuleName?: string
  ) {}
}

/**
 * Информация об элементах, найденных в одном файле
 */
export interface FileElementsInfo {
  filePath: string;
  lastModified: number;
  hash: string;
  elements: ComponentInfo[];
}

/**
 * Контекст проекта для передачи провайдерам
 */
export interface ProjectContext {
  projectRootPath: string;
  indexer: import("../services").AngularIndexer;
  tsConfig: ProcessedTsConfig | null;
}
