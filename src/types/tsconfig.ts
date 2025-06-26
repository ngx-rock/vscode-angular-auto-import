/**
 * TypeScript конфигурация и типы путей
 */

/**
 * Типы для работы с TypeScript конфигурацией
 */

/**
 * Обработанная конфигурация TypeScript с разрешенными путями
 */
export interface ProcessedTsConfig {
  /** Абсолютный базовый URL для разрешения модулей */
  absoluteBaseUrl: string;
  /** Алиасы путей из tsconfig.json */
  paths: Record<string, string[]>;
  /** Путь к исходному файлу tsconfig.json */
  sourceFilePath: string;
}
