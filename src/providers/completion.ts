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
    const suggestions: vscode.CompletionItem[] = [];

    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    // More robust regex for tags, allowing for attributes before cursor
    const tagRegex = /<([a-zA-Z0-9-]*)$/; // Matches if cursor is right after '<' or part of tag name
    const attributeContextRegex = /<[a-zA-Z0-9-]+[^>]*\s([a-zA-Z0-9-]*)$/; // For directives as attributes
    const structuralDirectiveRegex = /\*([a-zA-Z0-9_-]*)$/; // For structural directives like *ngIf, *libUiDemoShowIf
    const pipeRegex = /\|\s*([a-zA-Z0-9_]*)$/; // Matches if cursor is right after '|' or part of pipe name

    const tagMatch = tagRegex.exec(linePrefix);
    const attributeMatch = attributeContextRegex.exec(linePrefix);
    const structuralMatch = structuralDirectiveRegex.exec(linePrefix);
    const pipeMatch = pipeRegex.exec(linePrefix);

    let filterText = "";
    let replacementRange: vscode.Range | undefined;

    // Determine the context and the text to filter/replace
    if (tagMatch) {
      filterText = tagMatch[1];
      const start = position.translate({ characterDelta: -filterText.length });
      replacementRange = new vscode.Range(start, position);
    } else if (structuralMatch) {
      filterText = structuralMatch[1];
      const start = position.translate({ characterDelta: -filterText.length });
      replacementRange = new vscode.Range(start, position);
    } else if (pipeMatch) {
      filterText = pipeMatch[1];
      const start = position.translate({ characterDelta: -filterText.length });
      replacementRange = new vscode.Range(start, position);
    } else if (attributeMatch) {
      filterText = attributeMatch[1];
      const start = position.translate({ characterDelta: -filterText.length });
      replacementRange = new vscode.Range(start, position);
    } else {
      replacementRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_-]+/);
      if (replacementRange) {
        filterText = document.getText(replacementRange);
      }
    }

    const seenElements = new Set<string>(); // To avoid duplicate elements

    // Use the new Trie-based search for indexed elements
    const searchResults = indexer.searchWithSelectors(filterText);
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

      // Check if any of the element's selectors match the current context
      let bestMatchingSelector: string | null = null;
      let bestRelevance = 0;
      let bestInsertText = "";
      let bestItemKind = vscode.CompletionItemKind.Class;

      for (const elementSelector of selectors) {
        let itemKind: vscode.CompletionItemKind = vscode.CompletionItemKind.Class;
        let insertText = elementSelector;
        let relevance = 0; // For sorting suggestions

        if (element.type === "component" && (tagMatch || (!pipeMatch && !attributeMatch))) {
          if (elementSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            itemKind = vscode.CompletionItemKind.Class; // Component as tag
            relevance = 2;
          }
        } else if (element.type === "directive" && (tagMatch || attributeMatch || structuralMatch || !pipeMatch)) {
          // Directives can be selectors (like components), attribute selectors, or structural directives
          if (elementSelector.startsWith("[") && elementSelector.endsWith("]")) {
            // Attribute selector
            const attrSelector = elementSelector.slice(1, -1);
            if (attrSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
              insertText = attrSelector;
              itemKind = vscode.CompletionItemKind.Property; // Directive as attribute
              relevance = 1;
            }
          } else if (structuralMatch) {
            // Structural directive context - match directive name directly
            if (elementSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
              insertText = elementSelector;
              itemKind = vscode.CompletionItemKind.Keyword; // Structural directive
              relevance = 2; // Higher relevance for structural directives in structural context
            }
          } else {
            // Tag-like selector for directive or general directive matching
            if (elementSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
              itemKind = vscode.CompletionItemKind.Class;
              relevance = 1;
            }
          }
        } else if (element.type === "pipe" && (pipeMatch || (!tagMatch && !attributeMatch))) {
          if (elementSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            itemKind = vscode.CompletionItemKind.Function; // Pipe
            relevance = 2;
          }
        }

        // Keep track of the best matching selector for this element
        if (relevance > bestRelevance) {
          bestRelevance = relevance;
          bestMatchingSelector = elementSelector;
          bestInsertText = insertText;
          bestItemKind = itemKind;
        }
      }

      // Add completion item if we found a relevant match
      if (bestRelevance > 0 && bestMatchingSelector) {
        seenElements.add(elementKey);

        const item = new vscode.CompletionItem(bestMatchingSelector, bestItemKind);
        item.insertText = bestInsertText;
        if (replacementRange) {
          item.range = replacementRange;
        }
        item.detail = `Angular Auto-Import: ${element.type} (${path.basename(projCtx.projectRootPath)})`;
        item.documentation = new vscode.MarkdownString(
          `Import \`${element.name}\` (${element.type}) from \`${
            element.path
          }\`.\n\nSelector/Pipe Name: \`${bestMatchingSelector}\`\n\nAll selectors: ${selectors.join(", ")}`
        );
        item.command = {
          title: `Import ${element.name}`,
          command: "angular-auto-import.importElement",
          arguments: [bestMatchingSelector], // Pass the best matching selector for lookup
        };
        // Adjust sortText based on relevance and match quality
        item.sortText = `${String.fromCharCode(97 - bestRelevance)}${bestMatchingSelector}`; // Higher relevance = earlier in alphabet
        suggestions.push(item);
      }
    }

    // Get elements from standard Angular elements - only include relevant ones
    for (const [stdSelector, stdElement] of Object.entries(STANDARD_ANGULAR_ELEMENTS)) {
      // Skip if filter text doesn't match at all
      if (filterText && !stdSelector.toLowerCase().includes(filterText.toLowerCase())) {
        continue;
      }

      // Check if this selector matches the current context
      let shouldInclude = false;
      let insertText = stdSelector;
      let itemKind = vscode.CompletionItemKind.Class;
      let relevance = 0;

      if (stdElement.type === "directive") {
        if (structuralMatch && stdSelector.startsWith("*")) {
          // Structural directive context
          if (stdSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            shouldInclude = true;
            insertText = stdSelector.substring(1); // Remove * for insertion
            itemKind = vscode.CompletionItemKind.Keyword;
            relevance = 3; // High relevance for structural directives
          }
        } else if (attributeMatch && (stdSelector.startsWith("[") || !stdSelector.startsWith("*"))) {
          // Attribute directive context
          const attrName = stdSelector.startsWith("[") ? stdSelector.slice(1, -1) : stdSelector;
          if (attrName.toLowerCase().startsWith(filterText.toLowerCase())) {
            shouldInclude = true;
            insertText = attrName;
            itemKind = vscode.CompletionItemKind.Property;
            relevance = 2;
          }
        } else if (tagMatch && !stdSelector.startsWith("*") && !stdSelector.startsWith("[")) {
          // Tag context for non-structural directives
          if (stdSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            shouldInclude = true;
            itemKind = vscode.CompletionItemKind.Property;
            relevance = 1;
          }
        }
      } else if (stdElement.type === "pipe" && (pipeMatch || (!tagMatch && !attributeMatch && !structuralMatch))) {
        // Pipe context - only suggest if we're in a pipe context or no specific context
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
          if (isModuleImport) {
            item.detail = `Angular Auto-Import: ${stdElement.type} (requires ${stdElement.name})`;
          } else {
            item.detail = `Angular Auto-Import: ${stdElement.type} (standalone)`;
          }

          let documentationText: string;
          if (isModuleImport) {
            documentationText = `Import \`${stdElement.name}\` module from \`${stdElement.importPath}\`.\n\n⚠️ **Module Required:** This ${stdElement.type} requires importing the \`${stdElement.name}\` module (e.g., FormsModule for ngModel).`;
          } else {
            documentationText = `Import \`${stdElement.name}\` (standalone ${stdElement.type}) from \`${stdElement.importPath}\`.\n\n✅ **Standalone:** This ${stdElement.type} can be imported directly into your component's imports array without any module dependencies.`;
          }

          item.documentation = new vscode.MarkdownString(documentationText);
          item.command = {
            title: `Import ${stdElement.name}`,
            command: "angular-auto-import.importElement",
            arguments: [stdSelector],
          };
          item.sortText = `${String.fromCharCode(96 - relevance)}${stdSelector}`; // Standard elements get higher priority
          suggestions.push(item);
        }
      }
    }

    // Deduplicate suggestions by command and arguments before returning
    const dedupedSuggestionsMap = new Map<string, vscode.CompletionItem>();
    for (const suggestion of suggestions) {
      const cmd = suggestion.command?.command || "";
      const args = JSON.stringify(suggestion.command?.arguments || []);
      const key = `${cmd}:${args}`;
      if (!dedupedSuggestionsMap.has(key)) {
        dedupedSuggestionsMap.set(key, suggestion);
      }
    }

    const uniqueSuggestions = Array.from(dedupedSuggestionsMap.values());

    // Sort suggestions by relevance and filter out low-quality matches
    const filteredSuggestions = uniqueSuggestions
      .filter((item) => {
        // Only include suggestions that actually match the filter text
        if (!filterText) {
          return true;
        }

        const insertText = item.insertText?.toString() || item.label.toString();
        const label = item.label.toString();

        return (
          insertText.toLowerCase().includes(filterText.toLowerCase()) ||
          label.toLowerCase().includes(filterText.toLowerCase())
        );
      })
      .sort((a, b) => {
        // Sort by sortText first (relevance), then by label
        const sortA = a.sortText || a.label.toString();
        const sortB = b.sortText || b.label.toString();
        return sortA.localeCompare(sortB);
      })
      .slice(0, 20); // Limit to top 20 suggestions to avoid overwhelming the user

    console.log(
      `CompletionItemProvider: Returning ${filteredSuggestions.length} filtered suggestions out of ${suggestions.length} total suggestions`
    );

    return filteredSuggestions;
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
      // Fallback for files not directly in a workspace folder but within a known project root
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
