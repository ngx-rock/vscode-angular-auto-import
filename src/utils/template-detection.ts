/**
 * =================================================================================================
 * Optimized Template String Detection Utility
 * =================================================================================================
 *
 * This module provides fast, regex-based detection of whether a cursor position
 * is inside an Angular component's template string, replacing the expensive
 * ts-morph AST parsing approach with efficient string operations.
 */

import * as vscode from "vscode";

interface TemplateStringRange {
  start: number;
  end: number;
  quote: string; // The quote character used: ', ", or `
}

interface CacheEntry {
  version: number;
  templateRanges: TemplateStringRange[];
}

// Cache to avoid re-parsing the same document version
const templateCache = new Map<string, CacheEntry>();

/**
 * Optimized function to check if a position is inside an Angular template string.
 * Uses regex-based parsing instead of ts-morph for significant performance improvement.
 */
export function isInsideTemplateString(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  const offset = document.offsetAt(position);
  const templateRanges = getTemplateStringRanges(document);

  return templateRanges.some(
    (range) => offset >= range.start && offset <= range.end
  );
}

/**
 * Extract all template string ranges from an Angular component file.
 * Uses caching to avoid re-parsing the same document version.
 */
function getTemplateStringRanges(
  document: vscode.TextDocument
): TemplateStringRange[] {
  const cacheKey = document.uri.toString();
  const currentVersion = document.version;

  // Check cache first
  const cached = templateCache.get(cacheKey);
  if (cached && cached.version === currentVersion) {
    return cached.templateRanges;
  }

  // Parse template ranges
  const templateRanges = parseTemplateStringRanges(document.getText());

  // Update cache
  templateCache.set(cacheKey, {
    version: currentVersion,
    templateRanges,
  });

  return templateRanges;
}

/**
 * Parse template string ranges from TypeScript source code.
 * Handles @Component decorators with template properties.
 */
function parseTemplateStringRanges(text: string): TemplateStringRange[] {
  const ranges: TemplateStringRange[] = [];

  // Find all @Component decorators
  const componentRegex = /@Component\s*\(\s*\{/g;
  let componentMatch;

  while ((componentMatch = componentRegex.exec(text)) !== null) {
    const componentStart = componentMatch.index;

    // Find the matching closing brace for this @Component
    const decoratorEnd = findMatchingBrace(
      text,
      componentMatch.index + componentMatch[0].length - 1
    );
    if (decoratorEnd === -1) {
      continue;
    }

    const decoratorContent = text.slice(componentStart, decoratorEnd + 1);

    // Find template property within this decorator
    const templateRanges = findTemplatePropertyRanges(
      decoratorContent,
      componentStart
    );
    ranges.push(...templateRanges);
  }

  return ranges;
}

/**
 * Find template property ranges within a @Component decorator.
 */
function findTemplatePropertyRanges(
  decoratorContent: string,
  offset: number
): TemplateStringRange[] {
  const ranges: TemplateStringRange[] = [];

  // Look for template: followed by a string
  const templateRegex = /template\s*:\s*(['"`])/g;
  let templateMatch;

  while ((templateMatch = templateRegex.exec(decoratorContent)) !== null) {
    const quote = templateMatch[1];
    const stringStart = templateMatch.index + templateMatch[0].length - 1; // Position of opening quote

    // Find the matching closing quote
    const stringEnd = findMatchingQuote(decoratorContent, stringStart, quote);
    if (stringEnd === -1) {
      continue;
    }

    // Add the range (excluding the quotes themselves)
    ranges.push({
      start: offset + stringStart + 1, // +1 to exclude opening quote
      end: offset + stringEnd - 1, // -1 to exclude closing quote
      quote,
    });
  }

  return ranges;
}

/**
 * Find the matching closing brace for an opening brace.
 */
function findMatchingBrace(text: string, openBracePos: number): number {
  let braceCount = 1;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = openBracePos + 1; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (inString) {
      if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
    } else {
      if (char === '"' || char === "'" || char === "`") {
        inString = true;
        stringChar = char;
      } else if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          return i;
        }
      }
    }
  }

  return -1; // No matching brace found
}

/**
 * Find the matching closing quote for an opening quote.
 */
function findMatchingQuote(
  text: string,
  openQuotePos: number,
  quoteChar: string
): number {
  let escaped = false;

  for (let i = openQuotePos + 1; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === quoteChar) {
      return i;
    }
  }

  return -1; // No matching quote found
}

/**
 * Clear cache for a specific document (useful when document is closed).
 */
export function clearTemplateCache(documentUri: string): void {
  templateCache.delete(documentUri);
}

/**
 * Clear all template cache (useful for cleanup).
 */
export function clearAllTemplateCache(): void {
  templateCache.clear();
}
