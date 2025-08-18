/**
 * Defines types related to TypeScript configuration and path mappings.
 * @module
 */

/**
 * Represents a processed TypeScript configuration with resolved paths.
 */
export interface ProcessedTsConfig {
  /**
   * The absolute base URL for module resolution.
   */
  absoluteBaseUrl: string;
  /**
   * Path aliases from the tsconfig.json file.
   */
  paths: Record<string, string[]>;
  /**
   * The path to the source tsconfig.json file.
   */
  sourceFilePath: string;
}
