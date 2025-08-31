/**
 *
 * Angular Auto-Import Completion Provider
 *
 * @module
 */

import * as path from "node:path";
import type { SourceFile } from "ts-morph";
import * as vscode from "vscode";
import { STANDARD_ANGULAR_ELEMENTS } from "../config";
import { AngularElementData } from "../types";
import { isStandalone, switchFileType } from "../utils";
import { isInsideTemplateString } from "../utils/template-detection";
import type { ProviderContext } from "./index";

/**
 * Provides autocompletion for Angular elements.
 * This implementation relies solely on regular expressions for context detection to ensure
 * high performance and prevent crashes from invalid template syntax during typing.
 */
export class CompletionProvider implements vscode.CompletionItemProvider {
  constructor(private context: ProviderContext) {}

  /**
   * Provides completion items for the given document and position.
   * @param document The document to provide completions for.
   * @param position The position at which to provide completions.
   * @param _token A cancellation token.
   * @param _context The context of the completion request.
   * @returns A list of completion items.
   */
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): Promise<vscode.CompletionList> {
    const projCtx = this.getProjectContextForDocument(document);
    if (!projCtx) {
      return new vscode.CompletionList([], true);
    }

    // For TypeScript files, ensure we are inside a template string
    if (document.languageId === "typescript" && !isInsideTemplateString(document, position)) {
      return new vscode.CompletionList([], true);
    }

    const componentFile = await this.getComponentSourceFile(document);
    if (componentFile) {
      const classDeclaration = componentFile.getClasses()[0];
      if (classDeclaration && !isStandalone(classDeclaration)) {
        return new vscode.CompletionList([], true);
      }
    }

    const { indexer } = projCtx;
    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    // --- Unified Context Detection ---
    let filterText = "";
    let replacementRange: vscode.Range | undefined;
    let context: "tag" | "attribute" | "pipe" | "structural-directive" | "none" = "none";
    let triggerChar: "[" | "*" | undefined;

    const openTagIndex = linePrefix.lastIndexOf("<");
    const closeTagIndex = linePrefix.lastIndexOf(">");
    const pipeIndex = linePrefix.lastIndexOf("|");

    if (pipeIndex > openTagIndex && pipeIndex > closeTagIndex) {
      // We are in a pipe context
      context = "pipe";
      const textAfterPipe = linePrefix.substring(pipeIndex + 1);
      filterText = textAfterPipe.trim();
    } else if (openTagIndex > closeTagIndex) {
      // We are inside a tag definition
      const tagContent = linePrefix.substring(openTagIndex + 1);
      const firstWordMatch = tagContent.match(/^[a-zA-Z0-9-]+/);
      const tagName = firstWordMatch ? firstWordMatch[0] : "";
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
        const lastSpaceIndex = tagContent.lastIndexOf(" ");
        const partialWord = tagContent.substring(lastSpaceIndex + 1);

        if (partialWord.startsWith("[")) {
          context = "attribute";
          filterText = partialWord.substring(1);
          triggerChar = "[";
        } else if (partialWord.startsWith("*")) {
          context = "structural-directive";
          filterText = partialWord.substring(1);
          triggerChar = "*";
        } else if (partialWord.length > 0) {
          context = "attribute";
          filterText = partialWord;
        } else {
          // After a space, waiting for attribute name
          context = "attribute";
          filterText = "";
        }
      }
    }

    replacementRange = document.getWordRangeAtPosition(position, /[\w-]+/);
    if (replacementRange && filterText && !replacementRange.isEqual(new vscode.Range(position, position))) {
      const existingText = document.getText(replacementRange);
      if (filterText.startsWith(existingText)) {
        // Adjust the start of the replacement range to match the filter text's start.
        // This happens when getWordRangeAtPosition doesn't capture the full intended word.
      }
    }

    const suggestions: vscode.CompletionItem[] = [];
    const hasAttributeContext = context === "attribute" || context === "structural-directive";
    const hasTagContext = context === "tag";
    const hasPipeContext = context === "pipe";

    if (context === "none") {
      return new vscode.CompletionList([], true);
    }

    const seenElements = new Set<string>();

    // Use the Trie-based search for indexed elements
    let searchResults = indexer.searchWithSelectors(filterText);
    // Searching for completion results

    searchResults = searchResults.slice(0, 10);

    const elementsToProcess = new Map<string, { element: AngularElementData; selectors: string[] }>();

    // Group matching selectors by element to process each element only once
    for (const { selector, element } of searchResults) {
      const elementKey = `${element.path}:${element.name}`;
      if (!elementsToProcess.has(elementKey)) {
        elementsToProcess.set(elementKey, { element, selectors: [] });
      }
      elementsToProcess.get(elementKey)?.selectors.push(selector);
    }

    const elementEntries = Array.from(elementsToProcess.values());
    if (hasTagContext && filterText) {
      const expectedName = filterText
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      elementEntries.sort((a, b) => {
        if (a.element.name === expectedName && b.element.name !== expectedName) {
          return -1;
        }
        if (b.element.name === expectedName && a.element.name !== expectedName) {
          return 1;
        }
        return 0;
      });
    }

    // --- 1. Collect all potential suggestions from indexed elements ---
    interface PotentialSuggestion {
      insertText: string;
      element: AngularElementData;
      relevance: number;
      kind: vscode.CompletionItemKind;
      originalBestSelector: string;
    }
    const potentialSuggestions: PotentialSuggestion[] = [];

    for (const { element, selectors } of elementEntries) {
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
          const attrName = elementSelector.startsWith("[")
            ? elementSelector.slice(1, -1)
            : elementSelector.startsWith("*")
              ? elementSelector.slice(1)
              : elementSelector;

          if (element.type === "component" || context === "structural-directive") {
            // For structural directives or components acting as attributes, the name is simpler.
            // This part might need refinement based on indexer behavior.
          }

          if (attrName.toLowerCase().startsWith(filterText.toLowerCase())) {
            // The insert text should be the clean name, but wrapped correctly if needed.
            if (context === "structural-directive" && !triggerChar) {
              insertText = `*${attrName}`;
            } else if (context === "attribute" && !triggerChar) {
              insertText = attrName; // `[${attrName}]`;
            } else {
              insertText = attrName;
            }

            itemKind =
              context === "structural-directive"
                ? vscode.CompletionItemKind.Keyword
                : vscode.CompletionItemKind.Property;

            // --- Relevance Scoring ---
            // Base score for being a valid attribute/directive in this context.
            relevance = 2;

            // Higher score if the class name strongly matches the selector name.
            const expectedClassName = attrName
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join("");

            if (element.name.startsWith(expectedClassName)) {
              relevance += 2; // e.g., mat-button -> MatButton
            }

            // Highest score if the selector explicitly matches the tag we're inside.
            const openTag = linePrefix.substring(openTagIndex);
            const tagMatch = /<([a-zA-Z0-9-]+)/.exec(openTag);
            if (tagMatch) {
              const currentTag = tagMatch[1];
              // Selector like `button[mat-button]` on a `<button>` tag.
              if (elementSelector.startsWith(`${currentTag}[`)) {
                relevance += 5;
              }
            }
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
        potentialSuggestions.push({
          insertText: bestInsertText,
          element,
          relevance: bestRelevance,
          kind: bestItemKind,
          originalBestSelector: bestMatchingSelector,
        });
      }
    }

    // --- 2. Group suggestions by insert text to identify shared selectors ---
    const groupedByInsertText = new Map<string, PotentialSuggestion[]>();
    for (const suggestion of potentialSuggestions) {
      if (!suggestion.insertText) {
        continue;
      }
      const group = groupedByInsertText.get(suggestion.insertText);
      if (group) {
        group.push(suggestion);
      } else {
        groupedByInsertText.set(suggestion.insertText, [suggestion]);
      }
    }

    // --- 3. Create final CompletionItems from grouped suggestions ---
    for (const [insertText, group] of groupedByInsertText.entries()) {
      for (const sugg of group) {
        const { element, kind, relevance, originalBestSelector } = sugg;

        const elementKey = `${element.path}:${element.name}`;
        if (seenElements.has(elementKey)) {
          continue;
        }
        seenElements.add(elementKey);

        const isSharedSelector = group.length > 1;
        const label = isSharedSelector ? `${insertText}:${element.name}` : insertText;
        const item = new vscode.CompletionItem(label, kind);

        const attrName = originalBestSelector.startsWith("[")
          ? originalBestSelector.slice(1, -1)
          : originalBestSelector.startsWith("*")
            ? originalBestSelector.slice(1)
            : originalBestSelector;
        item.filterText = attrName;

        item.insertText = insertText;
        if (replacementRange) {
          item.range = replacementRange;
        }

        if (element.isStandalone) {
          item.detail = `Angular Auto-Import: standalone ${element.type}`;
          item.documentation = new vscode.MarkdownString(
            `✅ Import standalone \`${element.name}\` (${element.type}) from \`${element.path}\`.\n\nSelector: \`${originalBestSelector}\``
          );
        } else if (element.exportingModuleName) {
          item.detail = `Angular Auto-Import: from ${element.exportingModuleName}`;
          item.documentation = new vscode.MarkdownString(
            `⚠️ Import \`${element.name}\` via \`${element.exportingModuleName}\` module from \`${element.path}\`.\n\nSelector: \`${originalBestSelector}\``
          );
        } else {
          item.detail = `Angular Auto-Import: ${element.type}`;
          item.documentation = new vscode.MarkdownString(
            `Import \`${element.name}\` (${element.type}) from \`${element.path}\`.\n\nSelector: \`${originalBestSelector}\``
          );
        }

        item.command = {
          title: `Import ${element.name}`,
          command: "angular-auto-import.importElement",
          arguments: [element],
        };

        item.sortText = `${String.fromCharCode(97 - relevance)}${insertText}`;
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
          if (context === "structural-directive" && !triggerChar) {
            insertText = `*${attrName}`;
          } else if (context === "attribute" && !triggerChar) {
            insertText = attrName; // `[${attrName}]`;
          } else {
            insertText = attrName;
          }
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

          item.filterText = stdSelector.startsWith("[")
            ? stdSelector.slice(1, -1)
            : stdSelector.startsWith("*")
              ? stdSelector.slice(1)
              : stdSelector;

          if (replacementRange) {
            item.range = replacementRange;
          }
          // Standard Angular elements are always standalone and don't require module imports
          item.detail = `Angular Auto-Import: ${stdElement.type} (standalone)`; // todo
          item.documentation = new vscode.MarkdownString(`Import from \`${stdElement.importPath}\`.`);
          const elementDataForCommand = new AngularElementData(
            stdElement.importPath,
            stdElement.name,
            stdElement.type,
            stdSelector, // Use the matched selector as the original selector
            stdElement.selectors ?? [stdSelector], // Ensure selectors is an array
            true, // isStandalone - standard Angular elements are always standalone
            true, // isExternal - standard Angular elements are always external
            undefined // No exporting module needed for standard elements
          );
          item.command = {
            title: `Import ${stdElement.name}`,
            command: "angular-auto-import.importElement",
            arguments: [elementDataForCommand],
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

    const finalSuggestions = Array.from(dedupedSuggestionsMap.values()).sort((a, b) => {
      const sortA = a.sortText || a.label.toString();
      const sortB = b.sortText || b.label.toString();
      return sortA.localeCompare(sortB);
    });

    // Return a CompletionList and mark it as incomplete to force re-querying on every keystroke
    return new vscode.CompletionList(finalSuggestions, true);
  }

  private async getComponentSourceFile(document: vscode.TextDocument): Promise<SourceFile | undefined> {
    const projCtx = this.getProjectContextForDocument(document);
    if (!projCtx) {
      return undefined;
    }

    let componentPath = document.fileName;
    if (document.languageId === "html") {
      componentPath = switchFileType(document.fileName, ".ts");
    }

    const tsDocument = await this.getTsDocument(document, componentPath);
    if (!tsDocument) {
      return undefined;
    }

    return this.getSourceFile(tsDocument);
  }

  private getSourceFile(document: vscode.TextDocument): SourceFile | undefined {
    const projCtx = this.getProjectContextForDocument(document);
    if (!projCtx) {
      return undefined;
    }

    const { project } = projCtx.indexer;
    const activeDocument = vscode.workspace.textDocuments.find((doc) => doc.fileName === document.fileName);
    const currentContent = activeDocument ? activeDocument.getText() : document.getText();
    let sourceFile = project.getSourceFile(document.fileName);

    if (sourceFile) {
      if (sourceFile.getFullText() !== currentContent) {
        sourceFile.replaceWithText(currentContent);
      }
    } else {
      sourceFile = project.createSourceFile(document.fileName, currentContent, {
        overwrite: true,
      });
    }

    return sourceFile;
  }

  private async getTsDocument(
    document: vscode.TextDocument,
    componentPath: string
  ): Promise<vscode.TextDocument | null> {
    if (document.fileName === componentPath) {
      return document;
    }
    const tsDocUri = vscode.Uri.file(componentPath);
    try {
      return await vscode.workspace.openTextDocument(tsDocUri);
    } catch (error) {
      // logger is not available here, so we'll just log to the console
      console.error(`Could not open TS document for completion: ${componentPath}`, error);
      return null;
    }
  }

  /**
   * Gets the project context for a given document.
   * @param document The document to get the context for.
   * @returns The project context or `undefined` if not found.
   * @internal
   */
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
