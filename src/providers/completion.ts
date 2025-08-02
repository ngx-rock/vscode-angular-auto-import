/**
 * =================================================================================================
 * Angular Auto-Import Completion Provider
 * =================================================================================================
 */

import * as path from "node:path";
import * as vscode from "vscode";
import { STANDARD_ANGULAR_ELEMENTS } from "../config";
import type { AngularElementData } from "../types";
import { isInsideTemplateString } from "../utils/template-detection";
import type { ProviderContext } from "./index";

/**
 * Provides autocompletion for Angular elements.
 * This implementation relies solely on regular expressions for context detection to ensure
 * high performance and prevent crashes from invalid template syntax during typing.
 */
export class CompletionProvider implements vscode.CompletionItemProvider {
  constructor(private context: ProviderContext) {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[]> {
    const projCtx = this.getProjectContextForDocument(document);
    if (!projCtx) {
      return [];
    }

    // For TypeScript files, ensure we are inside a template string
    if (document.languageId === "typescript" && !isInsideTemplateString(document, position)) {
      return [];
    }

    const { indexer } = projCtx;
    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    // --- Regex-based Context Detection ---
    let filterText = "";
    let replacementRange: vscode.Range | undefined;
    let context: "tag" | "attribute" | "pipe" | "structural-directive" | "none" = "none";

    const pipeMatch = /\|\s*([a-zA-Z0-9_-]*)$/.exec(linePrefix);
    const structuralMatch = /\*([a-zA-Z0-9_-]*)$/.exec(linePrefix);
    const openTagIndex = linePrefix.lastIndexOf("<");
    const closeTagIndex = linePrefix.lastIndexOf(">");

    if (pipeMatch) {
      context = "pipe";
      filterText = pipeMatch[1];
    } else if (structuralMatch) {
      context = "structural-directive";
      filterText = structuralMatch[1];
    } else if (openTagIndex > closeTagIndex) {
      // We are inside a tag definition
      const tagContent = linePrefix.substring(openTagIndex + 1);
      const tagNameMatch = tagContent.match(/^([a-zA-Z0-9-]+)/);
      const tagName = tagNameMatch ? tagNameMatch[0] : "";
      const contentAfterTag = tagContent.substring(tagName.length);

      // If there's content right after the tag name without a space, we're not in a valid attribute context yet.
      // e.g. <my-tag[
      if (contentAfterTag.length > 0 && !/^\s/.test(contentAfterTag)) {
        context = "none"; // Neither tag nor attribute, do not show suggestions
      } else if (!/\s/.test(tagContent)) {
        // We are typing the tag name, no spaces yet
        context = "tag";
        filterText = tagContent;
      } else {
        // We are in an attribute context (space exists)
        context = "attribute";
        const lastWordMatch = /\s([a-zA-Z0-9-]*)$/.exec(tagContent);
        filterText = lastWordMatch ? lastWordMatch[1] : "";
      }
    }

    replacementRange = document.getWordRangeAtPosition(position, /[\w-]+/);
    if (replacementRange && context === "structural-directive") {
      const charBefore = linePrefix[replacementRange.start.character - 1];
      if (charBefore === "*") {
        replacementRange = new vscode.Range(replacementRange.start.translate(0, -1), replacementRange.end);
      }
    }

    const suggestions: vscode.CompletionItem[] = [];
    const hasAttributeContext = context === "attribute" || context === "structural-directive";
    const hasTagContext = context === "tag";
    const hasPipeContext = context === "pipe";

    if (context === "none") {
      return [];
    }

    const seenElements = new Set<string>();

    // Use the Trie-based search for indexed elements
    const searchResults = indexer.searchWithSelectors(filterText);
    console.log(`[CompletionProvider] Searching for "${filterText}", found ${searchResults.length} results.`);
    if (searchResults.length > 0) {
      console.log("[CompletionProvider] Search results:", JSON.stringify(searchResults.slice(0, 10), null, 2)); // Log first 10 results
    }
    const elementsToProcess = new Map<string, { element: AngularElementData; selectors: string[] }>();

    // Group matching selectors by element to process each element only once
    for (const { selector, element } of searchResults) {
      const elementKey = `${element.path}:${element.name}`;
      if (!elementsToProcess.has(elementKey)) {
        elementsToProcess.set(elementKey, { element, selectors: [] });
      }
      elementsToProcess.get(elementKey)?.selectors.push(selector);
    }

    for (const { element, selectors } of elementsToProcess.values()) {
      const elementKey = `${element.path}:${element.name}`;
      if (seenElements.has(elementKey)) {
        continue;
      }

      let bestMatchingSelector: string | null = null;
      let bestRelevance = 0;
      let bestInsertText = "";
      let bestItemKind = vscode.CompletionItemKind.Class;

      for (const elementSelector of selectors) {
        let itemKind: vscode.CompletionItemKind = vscode.CompletionItemKind.Class;
        let insertText = elementSelector;
        let relevance = 0;

        if (element.type === "component" && hasTagContext) {
          if (elementSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            itemKind = vscode.CompletionItemKind.Class;
            relevance = 2;
          }
        } else if (
          (element.type === "directive" || (element.type === "component" && element.originalSelector.includes("["))) &&
          hasAttributeContext
        ) {
          let attrName = elementSelector;
          if (element.type === "component" || context === "structural-directive") {
            attrName = elementSelector.startsWith("[")
              ? elementSelector.slice(1, -1)
              : elementSelector.startsWith("*")
                ? elementSelector.slice(1)
                : elementSelector;
          }

          if (attrName.toLowerCase().startsWith(filterText.toLowerCase())) {
            // The insert text should be the clean name.
            insertText = attrName;

            // The label will still be the full selector (e.g., `[mat-menu-item]`), which is handled by `bestMatchingSelector`.
            itemKind =
              context === "structural-directive"
                ? vscode.CompletionItemKind.Keyword
                : vscode.CompletionItemKind.Property;
            relevance = 2;
          }
        } else if (element.type === "pipe" && hasPipeContext) {
          if (elementSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            itemKind = vscode.CompletionItemKind.Function;
            relevance = 2;
          }
        }

        if (relevance > bestRelevance) {
          bestRelevance = relevance;
          bestMatchingSelector = elementSelector;
          bestInsertText = insertText;
          bestItemKind = itemKind;
        }
      }

      if (bestRelevance > 0 && bestMatchingSelector) {
        seenElements.add(elementKey);

        const item = new vscode.CompletionItem(bestMatchingSelector, bestItemKind);
        item.insertText = bestInsertText;
        if (replacementRange) {
          item.range = replacementRange;
        }

        if (element.isStandalone) {
          item.detail = `Angular Auto-Import: standalone ${element.type}`;
          item.documentation = new vscode.MarkdownString(
            `✅ Import standalone \`${element.name}\` (${element.type}) from \`${element.path}\`.\n\nSelector: \`${bestMatchingSelector}\``
          );
        } else if (element.exportingModuleName) {
          item.detail = `Angular Auto-Import: from ${element.exportingModuleName}`;
          item.documentation = new vscode.MarkdownString(
            `⚠️ Import \`${element.name}\` via \`${element.exportingModuleName}\` module from \`${element.path}\`.\n\nSelector: \`${bestMatchingSelector}\``
          );
        } else {
          item.detail = `Angular Auto-Import: ${element.type}`;
          item.documentation = new vscode.MarkdownString(
            `Import \`${element.name}\` (${element.type}) from \`${element.path}\`.\n\nSelector: \`${bestMatchingSelector}\``
          );
        }

        item.command = {
          title: `Import ${element.name}`,
          command: "angular-auto-import.importElement",
          arguments: [bestMatchingSelector],
        };
        item.sortText = `${String.fromCharCode(97 - bestRelevance)}${bestMatchingSelector}`;
        suggestions.push(item);
      }
    }

    // Suggestions from standard Angular elements
    for (const [stdSelector, stdElement] of Object.entries(STANDARD_ANGULAR_ELEMENTS)) {
      if (filterText && !stdSelector.toLowerCase().includes(filterText.toLowerCase())) {
        continue;
      }

      let shouldInclude = false;
      let insertText = stdSelector;
      let itemKind = vscode.CompletionItemKind.Class;
      let relevance = 0;

      if (stdElement.type === "directive" && hasAttributeContext) {
        const attrName = stdSelector.startsWith("[")
          ? stdSelector.slice(1, -1)
          : stdSelector.startsWith("*")
            ? stdSelector.slice(1)
            : stdSelector;
        if (attrName.toLowerCase().startsWith(filterText.toLowerCase())) {
          shouldInclude = true;
          insertText = attrName;
          itemKind =
            context === "structural-directive" ? vscode.CompletionItemKind.Keyword : vscode.CompletionItemKind.Property;
          relevance = 3;
        }
      } else if (stdElement.type === "pipe" && hasPipeContext) {
        if (stdSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
          shouldInclude = true;
          itemKind = vscode.CompletionItemKind.Function;
          relevance = 2;
        }
      }

      if (shouldInclude) {
        const elementKey = `${stdElement.importPath}:${stdElement.name}`;
        if (!seenElements.has(elementKey)) {
          seenElements.add(elementKey);
          const item = new vscode.CompletionItem(stdSelector, itemKind);
          item.insertText = insertText;
          if (replacementRange) {
            item.range = replacementRange;
          }
          const isModuleImport = stdElement.name.endsWith("Module");
          item.detail = `Angular Auto-Import: ${stdElement.type}${isModuleImport ? ` (requires ${stdElement.name})` : " (standalone)"}`;
          item.documentation = new vscode.MarkdownString(`Import from \`${stdElement.importPath}\`.`);
          item.command = {
            title: `Import ${stdElement.name}`,
            command: "angular-auto-import.importElement",
            arguments: [stdSelector],
          };
          item.sortText = `${String.fromCharCode(96 - relevance)}${stdSelector}`;
          suggestions.push(item);
        }
      }
    }

    // Deduplicate and sort suggestions
    const dedupedSuggestionsMap = new Map<string, vscode.CompletionItem>();
    for (const suggestion of suggestions) {
      const cmd = suggestion.command?.command || "";
      const args = JSON.stringify(suggestion.command?.arguments || []);
      const key = `${cmd}:${args}`;
      if (!dedupedSuggestionsMap.has(key)) {
        dedupedSuggestionsMap.set(key, suggestion);
      }
    }

    return Array.from(dedupedSuggestionsMap.values()).sort((a, b) => {
      const sortA = a.sortText || a.label.toString();
      const sortB = b.sortText || b.label.toString();
      return sortA.localeCompare(sortB);
    });
  }

  private getProjectContextForDocument(document: vscode.TextDocument) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspaceFolder) {
      const projectRootPath = workspaceFolder.uri.fsPath;
      const indexer = this.context.projectIndexers.get(projectRootPath);
      const tsConfig = this.context.projectTsConfigs.get(projectRootPath) ?? null;
      if (indexer) {
        return { projectRootPath, indexer, tsConfig };
      }
    } else {
      for (const rootPath of this.context.projectIndexers.keys()) {
        if (document.uri.fsPath.startsWith(rootPath + path.sep)) {
          const indexer = this.context.projectIndexers.get(rootPath);
          const tsConfig = this.context.projectTsConfigs.get(rootPath) ?? null;
          if (indexer) {
            return { projectRootPath: rootPath, indexer, tsConfig };
          }
        }
      }
    }
    return undefined;
  }
}
