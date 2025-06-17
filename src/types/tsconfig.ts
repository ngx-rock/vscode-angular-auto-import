/**
 * TypeScript конфигурация и типы путей
 */

export interface PathMapping {
  [alias: string]: string[];
}

export interface ProcessedTsConfig {
  absoluteBaseUrl: string;
  paths: PathMapping;
  sourceFilePath: string;
}
