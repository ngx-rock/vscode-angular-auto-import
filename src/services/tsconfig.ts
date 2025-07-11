/**
 * TypeScript Configuration Helper Service
 * Responsible for handling tsconfig.json and resolving path aliases.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ProcessedTsConfig } from "../types";
import { getRelativeFilePath, normalizePath, switchFileType } from "../utils";

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
 */
class PathAliasTrie {
  private root: TrieNode = new TrieNode();

  constructor(tsconfig: ProcessedTsConfig) {
    this.buildTrie(tsconfig);
  }

  /**
   * Builds the Trie based on `paths` from `tsconfig.json`.
   * @param tsconfig The processed tsconfig.
   */
  private buildTrie(tsconfig: ProcessedTsConfig): void {
    const { absoluteBaseUrl, paths } = tsconfig;

    console.log("[PathAliasTrie] === BUILDING TRIE FOR PATH ALIASES ===");
    console.log(`[PathAliasTrie] Base URL: ${absoluteBaseUrl}`);
    console.log(`[PathAliasTrie] Found ${Object.keys(paths).length} path mappings in tsconfig`);

    // Find the project root by going up from baseUrl until we find a directory that contains src/ or similar
    let projectRoot = absoluteBaseUrl;
    while (projectRoot !== path.dirname(projectRoot)) {
      if (
        fs.existsSync(path.join(projectRoot, "src")) ||
        fs.existsSync(path.join(projectRoot, "package.json")) ||
        fs.existsSync(path.join(projectRoot, "tsconfig.json"))
      ) {
        break;
      }
      projectRoot = path.dirname(projectRoot);
    }

    console.log(`[PathAliasTrie] Detected project root: ${projectRoot}`);

    for (const [alias, pathArray] of Object.entries(paths)) {
      // Ensure pathArray is an array of strings
      const pathArraySafe = Array.isArray(pathArray) ? (pathArray as string[]) : [];
      console.log(`[PathAliasTrie] Processing alias: '${alias}' -> [${pathArraySafe.join(", ")}]`);

      if (pathArraySafe.length > 0) {
        const originalPath = pathArraySafe[0];
        const physicalPath = path.resolve(absoluteBaseUrl, originalPath);

        // A "barrel-style" alias is any non-wildcard alias.
        // It points to a specific file (often index.ts) or directory,
        // and the remainder of the path should not be appended.
        const isWildcard = alias.endsWith("/*") || alias.endsWith("*");

        const cleanAlias = alias.replace(/\/?\*?$/, "");
        let cleanPath = physicalPath;

        console.log(`[PathAliasTrie]   Original path: ${originalPath}`);
        console.log(`[PathAliasTrie]   Physical path: ${physicalPath}`);
        console.log(`[PathAliasTrie]   Is wildcard: ${isWildcard}`);
        console.log(`[PathAliasTrie]   Clean alias: ${cleanAlias}`);

        if (isWildcard) {
          // For wildcard paths, e.g., 'src/app/*' -> '/path/to/project/src/app'
          cleanPath = physicalPath.replace(/\/?\*?$/, "");
        } else if (path.basename(physicalPath) === "index.ts") {
          // For paths to index.ts, use the parent directory.
          cleanPath = path.dirname(physicalPath);
        } else {
          // For paths to specific files, use the path without the extension.
          cleanPath = switchFileType(physicalPath, "");
        }

        console.log(`[PathAliasTrie]   Final clean path: ${cleanPath}`);

        // Use relative path from project root instead of absolute path
        const relativePath = path.relative(projectRoot, cleanPath);
        const pathSegments = normalizePath(relativePath)
          .toLowerCase() // Use lowercase for case-insensitivity
          .split("/")
          .filter((p) => p.length > 0);

        console.log(`[PathAliasTrie]   Relative path from project root: ${relativePath}`);
        console.log(`[PathAliasTrie]   Path segments: [${pathSegments.join(", ")}]`);

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
        console.log(
          `[PathAliasTrie] ✅ MAPPED: '${cleanAlias}' (${!isWildcard ? "barrel" : "wildcard"}) -> ${relativePath}`
        );
      } else {
        console.log(`[PathAliasTrie] ⚠️ SKIPPED: Empty path array for alias '${alias}'`);
      }
    }
    console.log("[PathAliasTrie] === TRIE BUILDING COMPLETE ===");
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

    console.log(`[PathAliasTrie] Finding match for: ${targetPath}`);
    console.log(`[PathAliasTrie] Path segments (for matching):`, lowerPathSegments);
    console.log(`[PathAliasTrie] Path segments (original case):`, originalPathSegments);

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
      console.log(`[PathAliasTrie] Root alias found: ${this.root.alias}`);
    }

    for (let i = 0; i < lowerPathSegments.length; i++) {
      const segment = lowerPathSegments[i];
      console.log(`[PathAliasTrie] Checking segment ${i}: '${segment}'`);

      if (currentNode.children.has(segment)) {
        const nextNode = currentNode.children.get(segment);
        if (!nextNode) {
          break;
        }
        currentNode = nextNode;
        console.log(`[PathAliasTrie] Found node for segment '${segment}'`);

        if (currentNode.alias) {
          longestMatch = {
            alias: currentNode.alias,
            depth: i + 1,
            isBarrel: currentNode.isBarrel,
          };
          console.log(
            `[PathAliasTrie] Updated longest match: alias='${
              currentNode.alias
            }', depth=${i + 1}, isBarrel=${currentNode.isBarrel}`
          );
        }
      } else {
        console.log(`[PathAliasTrie] No node found for segment '${segment}', stopping traversal`);
        break;
      }
    }

    if (longestMatch) {
      let importPath: string;
      if (longestMatch.isBarrel) {
        importPath = longestMatch.alias;
        console.log(`[PathAliasTrie] Using barrel import: ${importPath}`);
      } else {
        // Use original cased segments for the remainder
        const remainingSegments = originalPathSegments.slice(longestMatch.depth);
        const remainingPath = remainingSegments.join("/");
        importPath = normalizePath(path.posix.join(longestMatch.alias, remainingPath));
        console.log(`[PathAliasTrie] Using wildcard import: ${longestMatch.alias} + ${remainingPath} = ${importPath}`);
      }
      console.log(
        `[PathAliasTrie] SUCCESS: Matched '${absoluteTargetPath}' to alias '${longestMatch.alias}'. Resulting import: '${importPath}'.`
      );
      return { importPath, isBarrel: longestMatch.isBarrel };
    }

    console.log(`[PathAliasTrie] FALLBACK: No match found for '${absoluteTargetPath}'.`);
    return null;
  }
}

// Helper functions for tsconfig processing

const tsConfigCache: Map<string, ProcessedTsConfig | null> = new Map();
const trieCache: Map<string, PathAliasTrie | null> = new Map();

export function clearCache(projectRoot?: string) {
  if (projectRoot) {
    tsConfigCache.delete(projectRoot);
    trieCache.delete(projectRoot);
    console.log(`TsConfigHelper cache cleared for ${projectRoot}.`);
  } else {
    tsConfigCache.clear();
    trieCache.clear();
    console.log("TsConfigHelper cache fully cleared.");
  }
}

export async function findAndParseTsConfig(projectRoot: string): Promise<ProcessedTsConfig | null> {
  const cacheKey = projectRoot;
  console.log(`[TsConfigHelper] Looking for tsconfig in project: ${projectRoot}`);

  if (tsConfigCache.has(cacheKey)) {
    console.log(`[TsConfigHelper] Using cached tsconfig for ${projectRoot}`);
    const cached = tsConfigCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
  }
  try {
    let tsconfigResult: { path: string; config: unknown } | null = null;

    // Сначала ищем tsconfig.json в указанной директории
    const tsconfigPath = path.join(projectRoot, "tsconfig.json");
    if (fs.existsSync(tsconfigPath)) {
      try {
        const tsconfigContent = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
        tsconfigResult = {
          path: tsconfigPath,
          config: tsconfigContent,
        };
        console.log(`[TsConfigHelper] Found tsconfig.json at: ${tsconfigPath}`);
      } catch (error) {
        console.error(`[TsConfigHelper] Error parsing tsconfig.json:`, error);
      }
    }

    // Если стандартный tsconfig не найден, попробуем tsconfig.base.json (часто используется в Nx)
    if (!tsconfigResult) {
      console.log(`[TsConfigHelper] Standard tsconfig not found, trying tsconfig.base.json...`);
      const baseTsconfigPath = path.join(projectRoot, "tsconfig.base.json");
      if (fs.existsSync(baseTsconfigPath)) {
        try {
          const baseTsconfigContent = JSON.parse(fs.readFileSync(baseTsconfigPath, "utf-8"));
          tsconfigResult = {
            path: baseTsconfigPath,
            config: baseTsconfigContent,
          };
          console.log(`[TsConfigHelper] Found tsconfig.base.json at: ${baseTsconfigPath}`);
        } catch (error) {
          console.error(`[TsConfigHelper] Error parsing tsconfig.base.json:`, error);
        }
      }
    }

    if (!tsconfigResult) {
      console.log(`[TsConfigHelper] No tsconfig or tsconfig.base.json found for ${projectRoot}`);
      tsConfigCache.set(cacheKey, null);
      trieCache.set(cacheKey, null);
      return null;
    }

    console.log(`[TsConfigHelper] Found tsconfig at: ${tsconfigResult.path}`);

    const config = tsconfigResult.config as {
      compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
      };
    };
    const absoluteBaseUrl = path.resolve(path.dirname(tsconfigResult.path), config.compilerOptions?.baseUrl || ".");

    const paths = config.compilerOptions?.paths || {};
    console.log(`[TsConfigHelper] Found ${Object.keys(paths).length} path aliases in tsconfig`);
    console.log(`[TsConfigHelper] Base URL: ${absoluteBaseUrl}`);
    console.log(`[TsConfigHelper] Paths:`, paths);

    const processedConfig: ProcessedTsConfig = {
      absoluteBaseUrl,
      paths,
      sourceFilePath: tsconfigResult.path,
    };
    tsConfigCache.set(cacheKey, processedConfig);

    // Создаём и кэшируем Trie для резолвинга алиасов
    console.log(`[TsConfigHelper] Creating PathAliasTrie for ${projectRoot}`);
    const trie = new PathAliasTrie(processedConfig);
    trieCache.set(cacheKey, trie);
    console.log(`[TsConfigHelper] ✅ PathAliasTrie created and cached for ${projectRoot}`);

    return processedConfig;
  } catch (e) {
    console.error(`[TsConfigHelper] Error parsing tsconfig for ${projectRoot}:`, e);
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
  console.log(`[TsConfigHelper] === RESOLVING IMPORT PATH ===`);
  console.log(`[TsConfigHelper] Target: ${absoluteTargetModulePathNoExt}`);
  console.log(`[TsConfigHelper] Current file: ${absoluteCurrentFilePath}`);
  console.log(`[TsConfigHelper] Project root: ${projectRoot}`);

  // Handle empty target path
  if (!absoluteTargetModulePathNoExt || absoluteTargetModulePathNoExt.trim() === "") {
    console.log(`[TsConfigHelper] Empty target path, returning "."`);
    return ".";
  }

  // Check that files are within the project boundaries
  if (!absoluteTargetModulePathNoExt.startsWith(projectRoot)) {
    console.warn(`[TsConfigHelper] Target file is outside project root, using absolute path`);
    return absoluteTargetModulePathNoExt;
  }

  if (!absoluteCurrentFilePath.startsWith(projectRoot)) {
    console.warn(`[TsConfigHelper] Current file is outside project root, using relative path fallback`);
    const relativePath = getRelativeFilePath(absoluteCurrentFilePath, absoluteTargetModulePathNoExt);
    console.log(`[TsConfigHelper] Relative path (outside project): ${relativePath}`);
    return relativePath;
  }

  // Show what's in the cache
  console.log(`[TsConfigHelper] Available cached projects:`, Array.from(trieCache.keys()));

  let trie = trieCache.get(projectRoot);
  if (!trie) {
    console.log(`[TsConfigHelper] ❌ NO TRIE: No trie found for project ${projectRoot}`);
    console.log(`[TsConfigHelper] Available cached trie keys:`, Array.from(trieCache.keys()));

    // Attempt to load tsconfig and create the trie
    console.log(`[TsConfigHelper] Attempting to load tsconfig for project ${projectRoot}...`);
    let tsconfig = tsConfigCache.get(projectRoot);
    if (!tsconfig) {
      console.log(`[TsConfigHelper] No cached tsconfig found, loading from disk...`);
      try {
        tsconfig = await findAndParseTsConfig(projectRoot);
      } catch (error) {
        console.error(`[TsConfigHelper] Error loading tsconfig from disk:`, error);
      }
    }

    if (tsconfig) {
      console.log(`[TsConfigHelper] Found tsconfig, creating new trie...`);
      try {
        const newTrie = new PathAliasTrie(tsconfig);
        trieCache.set(projectRoot, newTrie);
        trie = newTrie;
        console.log(`[TsConfigHelper] New trie created and cached`);
      } catch (error) {
        console.error(`[TsConfigHelper] Error creating new trie:`, error);
      }
    } else {
      console.log(`[TsConfigHelper] No tsconfig found for project`);
    }
  }

  // Calculate relative path first to compare with alias
  const relativePath = getRelativeFilePath(absoluteCurrentFilePath, absoluteTargetModulePathNoExt);

  if (trie) {
    console.log(`[TsConfigHelper] Trie found for project, searching for match...`);
    const match = trie.findLongestPrefixMatch(absoluteTargetModulePathNoExt, projectRoot);
    if (match) {
      console.log(`[TsConfigHelper] ✅ ALIAS MATCH: ${match.importPath}`);
      console.log(`[TsConfigHelper] Relative path alternative: ${relativePath}`);

      // Always prefer barrel imports over relative paths
      if (match.isBarrel) {
        console.log(`[TsConfigHelper] 🎯 USING BARREL IMPORT: ${match.importPath}`);
        return match.importPath;
      }

      // For non-barrel (wildcard) aliases, always prefer aliases over relative paths
      // according to the configured priority which expects clean imports
      console.log(`[TsConfigHelper] 🎯 USING ALIAS for cleaner import: ${match.importPath}`);
      return match.importPath;
    } else {
      console.log(`[TsConfigHelper] ❌ NO ALIAS MATCH: Trie search failed`);
    }
  }

  // Fallback: calculate relative path
  console.log(`[TsConfigHelper] 🔄 FALLBACK: Using relative path: ${relativePath}`);
  return relativePath;
}
