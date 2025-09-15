/**
 * TypeScript Configuration Helper Service
 * Responsible for handling tsconfig.json and resolving path aliases.
 * @module
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { type getTsconfig, parseTsconfig } from "get-tsconfig";
import { logger } from "../logger";
import type { ProcessedTsConfig } from "../types";
import { getRelativeFilePath, normalizePath, switchFileType } from "../utils";

/**
 * Represents a node in a Trie data structure for storing path aliases.
 * @internal
 */
class TrieNode {
  public children: Map<string, TrieNode> = new Map();
  /** The alias corresponding to the path to this node (e.g., '@app'). */
  public alias?: string;
  /** True if the alias is "barrel-style" (non-wildcard) and should not have the rest of the path appended. */
  public isBarrel?: boolean;
}

/**
 * A prefix tree for efficiently finding the longest path prefix,
 * which allows finding the most specific (and shortest) alias.
 * @internal
 */
class PathAliasTrie {
  private readonly root: TrieNode = new TrieNode();

  constructor(tsconfig: ProcessedTsConfig) {
    this.buildTrie(tsconfig);
  }

  /**
   * Builds the Trie based on `paths` from `tsconfig.json`.
   * @param tsconfig The processed tsconfig.
   */
  private buildTrie(tsconfig: ProcessedTsConfig): void {
    const { absoluteBaseUrl, paths } = tsconfig;
    const projectRoot = this.findProjectRoot(absoluteBaseUrl);

    for (const [alias, pathArray] of Object.entries(paths)) {
      this.processAliasEntry(alias, pathArray, absoluteBaseUrl, projectRoot);
    }
  }

  /**
   * Finds the project root by going up from baseUrl.
   */
  private findProjectRoot(absoluteBaseUrl: string): string {
    let projectRoot = absoluteBaseUrl;
    while (projectRoot !== path.dirname(projectRoot)) {
      if (this.isProjectRootDirectory(projectRoot)) {
        break;
      }
      projectRoot = path.dirname(projectRoot);
    }
    return projectRoot;
  }

  /**
   * Checks if a directory is likely to be a project root.
   */
  private isProjectRootDirectory(dirPath: string): boolean {
    return (
      fs.existsSync(path.join(dirPath, "src")) ||
      fs.existsSync(path.join(dirPath, "package.json")) ||
      fs.existsSync(path.join(dirPath, "tsconfig.json"))
    );
  }

  /**
   * Processes a single alias entry and adds it to the trie.
   */
  private processAliasEntry(alias: string, pathArray: unknown, absoluteBaseUrl: string, projectRoot: string): void {
    const pathArraySafe = Array.isArray(pathArray) ? (pathArray as string[]) : [];

    if (pathArraySafe.length === 0) {
      logger.warn(`[PathAliasTrie] Skipped alias '${alias}': empty path array`);
      return;
    }

    const originalPath = pathArraySafe[0];
    const physicalPath = path.resolve(absoluteBaseUrl, originalPath);
    const isWildcard = alias.endsWith("/*") || alias.endsWith("*");

    const cleanAlias = alias.replace(/\/?\*?$/, "");
    const cleanPath = this.getCleanPath(physicalPath, isWildcard);

    this.addPathToTrie(cleanPath, projectRoot, cleanAlias, isWildcard);
  }

  /**
   * Gets the clean path based on wildcard status and path type.
   */
  private getCleanPath(physicalPath: string, isWildcard: boolean): string {
    if (isWildcard) {
      return physicalPath.replace(/\/?\*?$/, "");
    }

    if (path.basename(physicalPath) === "index.ts") {
      return path.dirname(physicalPath);
    }

    return switchFileType(physicalPath, "");
  }

  /**
   * Adds a path to the trie structure.
   */
  private addPathToTrie(cleanPath: string, projectRoot: string, cleanAlias: string, isWildcard: boolean): void {
    const relativePath = path.relative(projectRoot, cleanPath);
    const pathSegments = normalizePath(relativePath)
      .toLowerCase()
      .split("/")
      .filter((p) => p.length > 0);

    let currentNode = this.root;
    for (const segment of pathSegments) {
      if (!currentNode.children.has(segment)) {
        currentNode.children.set(segment, new TrieNode());
      }
      const nextNode = currentNode.children.get(segment);
      if (!nextNode) {
        throw new Error("Unexpected missing node in alias trie insertion");
      }
      currentNode = nextNode;
    }
    currentNode.alias = cleanAlias;
    currentNode.isBarrel = !isWildcard;
  }

  /**
   * Finds the longest prefix match for a given path in the Trie.
   * @param absoluteTargetPath The absolute path to the module (without extension).
   * @param projectRoot The project root directory for calculating the relative path.
   * @returns An object with the final import path or null.
   */
  public findLongestPrefixMatch(
    absoluteTargetPath: string,
    projectRoot?: string
  ): { importPath: string; isBarrel?: boolean } | null {
    let targetPath = normalizePath(absoluteTargetPath);

    // If project root is provided, convert to relative path
    if (projectRoot && absoluteTargetPath.startsWith(projectRoot)) {
      targetPath = normalizePath(path.relative(projectRoot, absoluteTargetPath));
    }

    const originalPathSegments = targetPath.split("/").filter((p) => p.length > 0);
    const lowerPathSegments = targetPath
      .toLowerCase()
      .split("/")
      .filter((p) => p.length > 0);

    let currentNode = this.root;
    let longestMatch: {
      alias: string;
      depth: number;
      isBarrel?: boolean;
    } | null = null;

    if (this.root.alias) {
      longestMatch = {
        alias: this.root.alias,
        depth: 0,
        isBarrel: this.root.isBarrel,
      };
    }

    for (let i = 0; i < lowerPathSegments.length; i++) {
      const segment = lowerPathSegments[i];

      if (currentNode.children.has(segment)) {
        const nextNode = currentNode.children.get(segment);
        if (!nextNode) {
          break;
        }
        currentNode = nextNode;

        if (currentNode.alias) {
          longestMatch = {
            alias: currentNode.alias,
            depth: i + 1,
            isBarrel: currentNode.isBarrel,
          };
        }
      } else {
        break;
      }
    }

    if (longestMatch) {
      let importPath: string;
      if (longestMatch.isBarrel) {
        importPath = longestMatch.alias;
      } else {
        // Use original cased segments for the remainder
        const remainingSegments = originalPathSegments.slice(longestMatch.depth);
        const remainingPath = remainingSegments.join("/");
        importPath = normalizePath(path.posix.join(longestMatch.alias, remainingPath));
      }
      return { importPath, isBarrel: longestMatch.isBarrel };
    }

    return null;
  }
}

// Helper functions for tsconfig processing

const tsConfigCache: Map<string, ProcessedTsConfig | null> = new Map();
const trieCache: Map<string, PathAliasTrie | null> = new Map();

/**
 * Parses a tsconfig file and handles potential errors.
 * @param filePath The full path to the tsconfig file.
 * @returns The parsed tsconfig object or null if an error occurs.
 * @private
 */
function _parseConfigFile(filePath: string): ReturnType<typeof getTsconfig> {
  try {
    const parseResult = parseTsconfig(filePath);
    return parseResult ? { path: filePath, config: parseResult } : null;
  } catch (parseError) {
    logger.warn(`[TsConfigHelper] Failed to parse ${filePath}: ${(parseError as Error).message}`);
    return null;
  }
}

/**
 * Clears the tsconfig and trie caches.
 * @param projectRoot If provided, only clears the cache for that project.
 */
export function clearCache(projectRoot?: string) {
  if (projectRoot) {
    tsConfigCache.delete(projectRoot);
    trieCache.delete(projectRoot);
    logger.info(`TsConfigHelper cache cleared for ${projectRoot}.`);
  } else {
    tsConfigCache.clear();
    trieCache.clear();
    logger.info("TsConfigHelper cache fully cleared.");
  }
}

/**
 * Finds and parses the `tsconfig.json` or `tsconfig.base.json` file for a given project.
 * @param projectRoot The root directory of the project.
 * @returns A processed tsconfig object or `null` if not found.
 */
export async function findAndParseTsConfig(projectRoot: string): Promise<ProcessedTsConfig | null> {
  const cacheKey = projectRoot;

  if (tsConfigCache.has(cacheKey)) {
    const cached = tsConfigCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
  }

  try {
    // Look for tsconfig.json or tsconfig.base.json in the project root
    const tsconfigPath = path.join(projectRoot, "tsconfig.json");
    const tsconfigBasePath = path.join(projectRoot, "tsconfig.base.json");

    let tsconfigResult: ReturnType<typeof getTsconfig> = null;
    let actualTsconfigPath: string | null = null;

    // Check for existing files and try to parse them
    if (fs.existsSync(tsconfigPath)) {
      tsconfigResult = _parseConfigFile(tsconfigPath);
      actualTsconfigPath = tsconfigPath;
    } else if (fs.existsSync(tsconfigBasePath)) {
      tsconfigResult = _parseConfigFile(tsconfigBasePath);
      actualTsconfigPath = tsconfigBasePath;
    }

    // Validate that the found tsconfig is actually within our project directory
    if (tsconfigResult && !tsconfigResult.path.startsWith(projectRoot)) {
      logger.warn(`[TsConfigHelper] Found tsconfig outside project root: ${tsconfigResult.path}`);
      tsconfigResult = null;
    }

    // Ensure the found tsconfig is the expected one
    if (tsconfigResult && actualTsconfigPath && tsconfigResult.path !== actualTsconfigPath) {
      logger.warn(
        `[TsConfigHelper] get-tsconfig returned different path than expected: ${tsconfigResult.path} vs ${actualTsconfigPath}`
      );
      // Only allow if it's still within our project directory
      if (!tsconfigResult.path.startsWith(projectRoot)) {
        tsconfigResult = null;
      }
    }

    if (!tsconfigResult) {
      logger.warn(`[TsConfigHelper] No valid tsconfig found for ${projectRoot}`);
      tsConfigCache.set(cacheKey, null);
      trieCache.set(cacheKey, null);
      return null;
    }

    const config = tsconfigResult.config;
    const absoluteBaseUrl = path.resolve(path.dirname(tsconfigResult.path), config.compilerOptions?.baseUrl || ".");
    const paths = config.compilerOptions?.paths || {};

    const processedConfig: ProcessedTsConfig = {
      absoluteBaseUrl,
      paths,
      sourceFilePath: tsconfigResult.path,
    };
    tsConfigCache.set(cacheKey, processedConfig);

    // Create and cache a Trie for resolving aliases
    const trie = new PathAliasTrie(processedConfig);
    trieCache.set(cacheKey, trie);

    return processedConfig;
  } catch (e) {
    logger.error(`[TsConfigHelper] Error parsing tsconfig for ${projectRoot}:`, e as Error);
    tsConfigCache.set(cacheKey, null);
    trieCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Resolves an absolute module path to an import path, using a
 * tsconfig alias (via the Trie) or falling back to a relative path.
 * @param absoluteTargetModulePathNoExt Absolute path to the file to be imported, without extension.
 * @param absoluteCurrentFilePath Absolute path to the file where the import will be added.
 * @param projectRoot The root directory of the current project.
 * @returns A string for the import statement (e.g., '@app/components/my-comp' or '../../my-comp').
 */
export async function resolveImportPath(
  absoluteTargetModulePathNoExt: string,
  absoluteCurrentFilePath: string,
  projectRoot: string
): Promise<string> {
  // Handle empty target path
  if (!absoluteTargetModulePathNoExt || absoluteTargetModulePathNoExt.trim() === "") {
    return ".";
  }

  // Validate paths are within project boundaries
  const pathValidation = validateProjectPaths(absoluteTargetModulePathNoExt, absoluteCurrentFilePath, projectRoot);
  if (pathValidation.shouldReturn) {
    return pathValidation.path;
  }

  // Get or create path alias trie
  const trie = await getOrCreateTrie(projectRoot);

  // Calculate relative path
  const relativePath = getRelativeFilePath(absoluteCurrentFilePath, absoluteTargetModulePathNoExt);

  // Try to find alias match
  const aliasMatch = findAliasMatch(trie, absoluteTargetModulePathNoExt, projectRoot);
  if (aliasMatch) {
    return aliasMatch;
  }

  // Fallback: calculate relative path
  return relativePath;
}

function validateProjectPaths(
  absoluteTargetModulePathNoExt: string,
  absoluteCurrentFilePath: string,
  projectRoot: string
): { shouldReturn: boolean; path: string } {
  // Check that target file is within the project boundaries
  if (!absoluteTargetModulePathNoExt.startsWith(projectRoot)) {
    logger.warn(`[TsConfigHelper] Target file is outside project root, using absolute path`);
    return { shouldReturn: true, path: absoluteTargetModulePathNoExt };
  }

  // Check that current file is within the project boundaries
  if (!absoluteCurrentFilePath.startsWith(projectRoot)) {
    logger.warn(`[TsConfigHelper] Current file is outside project root, using relative path fallback`);
    const relativePath = getRelativeFilePath(absoluteCurrentFilePath, absoluteTargetModulePathNoExt);
    return { shouldReturn: true, path: relativePath };
  }

  return { shouldReturn: false, path: "" };
}

async function getOrCreateTrie(projectRoot: string): Promise<PathAliasTrie | null> {
  const trie = trieCache.get(projectRoot);

  if (trie) {
    return trie;
  }

  // Attempt to load tsconfig and create the trie
  const tsconfig = await loadTsConfig(projectRoot);
  if (!tsconfig) {
    return null;
  }

  try {
    const newTrie = new PathAliasTrie(tsconfig);
    trieCache.set(projectRoot, newTrie);
    return newTrie;
  } catch (error) {
    logger.error(`[TsConfigHelper] Error creating new trie:`, error as Error);
    return null;
  }
}

async function loadTsConfig(projectRoot: string): Promise<ProcessedTsConfig | null> {
  let tsconfig = tsConfigCache.get(projectRoot);

  if (tsconfig) {
    return tsconfig;
  }

  try {
    tsconfig = await findAndParseTsConfig(projectRoot);
    return tsconfig;
  } catch (error) {
    logger.error(`[TsConfigHelper] Error loading tsconfig from disk:`, error as Error);
    return null;
  }
}

function findAliasMatch(
  trie: PathAliasTrie | null,
  absoluteTargetModulePathNoExt: string,
  projectRoot: string
): string | null {
  if (!trie) {
    return null;
  }

  const match = trie.findLongestPrefixMatch(absoluteTargetModulePathNoExt, projectRoot);
  if (!match) {
    return null;
  }

  // Always prefer barrel imports over relative paths
  if (match.isBarrel) {
    return match.importPath;
  }

  // For non-barrel (wildcard) aliases, always prefer aliases over relative paths
  // according to the configured priority which expects clean imports
  return match.importPath;
}
