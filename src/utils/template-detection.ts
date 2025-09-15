/**
 *
 * Optimized Template String Detection Utility
 *
 * This module provides fast, regex-based detection of whether a cursor position
 * is inside an Angular component's template string, replacing the expensive
 * ts-morph AST parsing approach with efficient string operations.
 *
 * @module
 */

import type * as vscode from "vscode";

/**
 * Represents a range of a template string.
 * @internal
 */
interface TemplateStringRange {
  /** The start offset of the template string. */
  start: number;
  /** The end offset of the template string. */
  end: number;
  /** The quote character used: ', ", or ` */
  quote: string;
}

/**
 * Represents a cache entry for template string ranges.
 * @internal
 */
interface CacheEntry {
  /** The version of the document. */
  version: number;
  /** The cached template string ranges. */
  templateRanges: TemplateStringRange[];
}

// Cache to avoid re-parsing the same document version
const templateCache = new Map<string, CacheEntry>();

/**
 * Optimized function to check if a position is inside an Angular template string.
 * Uses regex-based parsing instead of ts-morph for significant performance improvement.
 *
 * @param document The VS Code text document.
 * @param position The position to check.
 * @returns `true` if the position is inside a template string, `false` otherwise.
 */
export function isInsideTemplateString(document: vscode.TextDocument, position: vscode.Position): boolean {
  const offset = document.offsetAt(position);
  const templateRanges = getTemplateStringRanges(document);

  return templateRanges.some((range) => offset >= range.start && offset <= range.end);
}

/**
 * Extract all template string ranges from an Angular component file.
 * Uses caching to avoid re-parsing the same document version.
 *
 * @param document The VS Code text document.
 * @returns An array of template string ranges.
 * @internal
 */
function getTemplateStringRanges(document: vscode.TextDocument): TemplateStringRange[] {
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
 *
 * @param text The source code to parse.
 * @returns An array of template string ranges.
 * @internal
 */
function parseTemplateStringRanges(text: string): TemplateStringRange[] {
  const ranges: TemplateStringRange[] = [];

  // Find all @Component decorators
  const componentRegex = /@Component\s*\(\s*\{/g;
  let componentMatch: RegExpExecArray | null;

  while ((componentMatch = componentRegex.exec(text)) !== null) {
    const componentStart = componentMatch.index;

    // Find the matching closing brace for this @Component
    const decoratorEnd = findMatchingBrace(text, componentMatch.index + componentMatch[0].length - 1);
    if (decoratorEnd === -1) {
      continue;
    }

    const decoratorContent = text.slice(componentStart, decoratorEnd + 1);

    // Find template property within this decorator
    const templateRanges = findTemplatePropertyRanges(decoratorContent, componentStart);
    ranges.push(...templateRanges);
  }

  return ranges;
}

/**
 * Find template property ranges within a @Component decorator.
 *
 * @param decoratorContent The content of the decorator.
 * @param offset The offset of the decorator content in the original text.
 * @returns An array of template string ranges.
 * @internal
 */
function findTemplatePropertyRanges(decoratorContent: string, offset: number): TemplateStringRange[] {
  const ranges: TemplateStringRange[] = [];

  // Look for template: followed by a string
  const templateRegex = /template\s*:\s*(['"`])/g;
  let templateMatch: RegExpExecArray | null;

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
 *
 * @param text The text to search in.
 * @param openBracePos The position of the opening brace.
 * @returns The position of the matching closing brace, or -1 if not found.
 * @internal
 */
function findMatchingBrace(text: string, openBracePos: number): number {
  let braceCount = 1;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = openBracePos + 1; i < text.length; i++) {
    const char = text[i];

    // Handle escape sequences
    if (handleEscapeSequence(char, escaped)) {
      escaped = !escaped;
      continue;
    }
    escaped = false;

    // Process character based on string context
    if (inString) {
      const stringState = handleStringChar(char, stringChar);
      if (stringState.endString) {
        inString = false;
        stringChar = "";
      }
    } else {
      const result = handleNonStringChar(char, braceCount);
      if (result.startString) {
        inString = true;
        stringChar = char;
      } else if (result.braceChange !== 0) {
        braceCount += result.braceChange;
        if (braceCount === 0) {
          return i;
        }
      }
    }
  }

  return -1; // No matching brace found
}

function handleEscapeSequence(char: string, currentlyEscaped: boolean): boolean {
  if (currentlyEscaped) {
    return false; // Reset escape state
  }
  return char === "\\";
}

function handleStringChar(char: string, stringChar: string): { endString: boolean } {
  return { endString: char === stringChar };
}

function handleNonStringChar(char: string, _braceCount: number): { startString: boolean; braceChange: number } {
  if (char === '"' || char === "'" || char === "`") {
    return { startString: true, braceChange: 0 };
  }

  if (char === "{") {
    return { startString: false, braceChange: 1 };
  }

  if (char === "}") {
    return { startString: false, braceChange: -1 };
  }

  return { startString: false, braceChange: 0 };
}

/**
 * Find the matching closing quote for an opening quote.
 *
 * @param text The text to search in.
 * @param openQuotePos The position of the opening quote.
 * @param quoteChar The character of the quote to match.
 * @returns The position of the matching closing quote, or -1 if not found.
 * @internal
 */
function findMatchingQuote(text: string, openQuotePos: number, quoteChar: string): number {
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
 *
 * @param documentUri The URI of the document to clear from the cache.
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
