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
import { isStandalone, LruCache, switchFileType } from "../utils";
import { isInsideTemplateString } from "../utils/template-detection";
import type { ProviderContext } from "./index";

interface CompletionContextData {
  context: "tag" | "attribute" | "pipe" | "structural-directive" | "none";
  filterText: string;
  replacementRange: vscode.Range | undefined;
  triggerChar: "[" | "*" | undefined;
  linePrefix: string;
  hasAttributeContext: boolean;
  hasTagContext: boolean;
  hasPipeContext: boolean;
}

interface PotentialSuggestion {
  insertText: string;
  element: AngularElementData;
  relevance: number;
  kind: vscode.CompletionItemKind;
  originalBestSelector: string;
}

/**
 * Provides autocompletion for Angular elements.
 * This implementation relies solely on regular expressions for context detection to ensure
 * high performance and prevent crashes from invalid template syntax during typing.
 */
export class CompletionProvider implements vscode.CompletionItemProvider, vscode.Disposable {
  private standaloneCache = new LruCache<string, boolean>(50);
  private disposables: vscode.Disposable[] = [];

  constructor(private context: ProviderContext) {
    this.disposables.push(
      vscode.workspace.onDidSaveTextDocument((document) => {
        this.standaloneCache.delete(document.fileName);
      })
    );
  }

  dispose() {
    for (const d of this.disposables) {
      d.dispose();
    }
  }

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

    const isStandaloneComponent = await this.isStandaloneComponent(document);
    if (!isStandaloneComponent) {
      return new vscode.CompletionList([], true);
    }

    const contextData = this.detectCompletionContext(document, position);
    if (contextData.context === "none") {
      return new vscode.CompletionList([], true);
    }

    const suggestions = await this.generateCompletionSuggestions(projCtx, contextData);
    const finalSuggestions = this.deduplicateAndSortSuggestions(suggestions);

    return new vscode.CompletionList(finalSuggestions, true);
  }

  private async isStandaloneComponent(document: vscode.TextDocument): Promise<boolean> {
    const componentPath = document.languageId === "html" ? switchFileType(document.fileName, ".ts") : document.fileName;

    // For open, unsaved files, we are optimistic and allow completions.
    // We don't cache this result because the 'dirty' state is temporary.
    const activeDocument = vscode.workspace.textDocuments.find((doc) => doc.fileName === componentPath);
    if (activeDocument?.isDirty) {
      return true;
    }

    const cachedStatus = this.standaloneCache.get(componentPath);
    if (cachedStatus !== undefined) {
      return cachedStatus;
    }

    const componentFile = await this.getComponentSourceFile(document);
    if (componentFile) {
      const classDeclaration = componentFile.getClasses()[0];
      if (classDeclaration) {
        const isStandaloneComponent = isStandalone(classDeclaration);
        this.standaloneCache.set(componentPath, isStandaloneComponent);
        return isStandaloneComponent;
      }
    }
    // Default to true if we can't determine, to avoid blocking completions.
    this.standaloneCache.set(componentPath, true);
    return true;
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
    let sourceFile = project.getSourceFile(document.fileName);

    // For completions, we work with the last saved version of the file
    // that ts-morph knows about. We avoid updating it with unsaved content
    // because that's a very slow operation (re-parsing).
    // The cache is invalidated on save, which will trigger a re-read.
    if (!sourceFile) {
      sourceFile = project.createSourceFile(document.fileName, document.getText(), {
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
  /**
   * Detects the completion context based on cursor position.
   */
  private detectCompletionContext(document: vscode.TextDocument, position: vscode.Position): CompletionContextData {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    let filterText = "";
    let context: "tag" | "attribute" | "pipe" | "structural-directive" | "none" = "none";
    let triggerChar: "[" | "*" | undefined;

    const openTagIndex = linePrefix.lastIndexOf("<");
    const closeTagIndex = linePrefix.lastIndexOf(">");
    const pipeIndex = linePrefix.lastIndexOf("|");

    if (pipeIndex > openTagIndex && pipeIndex > closeTagIndex) {
      context = "pipe";
      const textAfterPipe = linePrefix.substring(pipeIndex + 1);
      filterText = textAfterPipe.trim();
    } else if (openTagIndex > closeTagIndex) {
      const tagContent = linePrefix.substring(openTagIndex + 1);
      const firstWordMatch = tagContent.match(/^[a-zA-Z0-9-]+/);
      const tagName = firstWordMatch ? firstWordMatch[0] : "";
      const contentAfterTag = tagContent.substring(tagName.length);

      if (contentAfterTag.length > 0 && !/^\s/.test(contentAfterTag)) {
        context = "none";
      } else if (!/\s/.test(tagContent)) {
        context = "tag";
        filterText = tagContent;
      } else {
        const {
          context: attributeContext,
          filterText: attrFilterText,
          triggerChar: attrTriggerChar,
        } = this.parseAttributeContext(tagContent);
        context = attributeContext;
        filterText = attrFilterText;
        triggerChar = attrTriggerChar;
      }
    }

    const replacementRange = document.getWordRangeAtPosition(position, /[\w-]+/);
    return {
      context,
      filterText,
      replacementRange,
      triggerChar,
      linePrefix,
      hasAttributeContext: context === "attribute" || context === "structural-directive",
      hasTagContext: context === "tag",
      hasPipeContext: context === "pipe",
    };
  }

  /**
   * Parses attribute context from tag content.
   */
  private parseAttributeContext(tagContent: string): {
    context: "attribute" | "structural-directive";
    filterText: string;
    triggerChar: "[" | "*" | undefined;
  } {
    const lastSpaceIndex = tagContent.lastIndexOf(" ");
    const partialWord = tagContent.substring(lastSpaceIndex + 1);

    if (partialWord.startsWith("[")) {
      return {
        context: "attribute",
        filterText: partialWord.substring(1),
        triggerChar: "[",
      };
    } else if (partialWord.startsWith("*")) {
      return {
        context: "structural-directive",
        filterText: partialWord.substring(1),
        triggerChar: "*",
      };
    } else {
      return {
        context: "attribute",
        filterText: partialWord.length > 0 ? partialWord : "",
        triggerChar: undefined,
      };
    }
  }

  /**
   * Generates all completion suggestions.
   */
  private async generateCompletionSuggestions(
    projCtx: { indexer: any; projectRootPath: string; tsConfig: any },
    contextData: CompletionContextData
  ): Promise<vscode.CompletionItem[]> {
    const suggestions: vscode.CompletionItem[] = [];
    const seenElements = new Set<string>();

    // Generate suggestions from indexed elements
    const indexedSuggestions = await this.generateIndexedElementSuggestions(projCtx.indexer, contextData, seenElements);
    suggestions.push(...indexedSuggestions);

    // Generate suggestions from standard Angular elements
    const standardSuggestions = this.generateStandardElementSuggestions(contextData, seenElements);
    suggestions.push(...standardSuggestions);

    return suggestions;
  }

  /**
   * Generates suggestions from indexed elements.
   */
  private async generateIndexedElementSuggestions(
    indexer: any,
    contextData: CompletionContextData,
    seenElements: Set<string>
  ): Promise<vscode.CompletionItem[]> {
    const searchResults = indexer.searchWithSelectors(contextData.filterText).slice(0, 10);
    const elementsToProcess = this.groupSearchResultsByElement(searchResults);
    const elementEntries = this.sortElementEntriesIfNeeded(elementsToProcess, contextData);
    const potentialSuggestions = this.createPotentialSuggestions(elementEntries, contextData);
    return this.convertPotentialSuggestionsToCompletionItems(potentialSuggestions, contextData, seenElements);
  }

  /**
   * Groups search results by element to avoid duplicates.
   */
  private groupSearchResultsByElement(
    searchResults: Array<{ selector: string; element: AngularElementData }>
  ): Array<{ element: AngularElementData; selectors: string[] }> {
    const elementsToProcess = new Map<string, { element: AngularElementData; selectors: string[] }>();

    for (const { selector, element } of searchResults) {
      const elementKey = `${element.path}:${element.name}`;
      if (!elementsToProcess.has(elementKey)) {
        elementsToProcess.set(elementKey, { element, selectors: [] });
      }
      elementsToProcess.get(elementKey)?.selectors.push(selector);
    }

    return Array.from(elementsToProcess.values());
  }

  /**
   * Sorts element entries based on context if needed.
   */
  private sortElementEntriesIfNeeded(
    elementEntries: Array<{ element: AngularElementData; selectors: string[] }>,
    contextData: CompletionContextData
  ): Array<{ element: AngularElementData; selectors: string[] }> {
    if (contextData.hasTagContext && contextData.filterText) {
      const expectedName = contextData.filterText
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      return elementEntries.sort((a, b) => {
        if (a.element.name === expectedName && b.element.name !== expectedName) {
          return -1;
        }
        if (b.element.name === expectedName && a.element.name !== expectedName) {
          return 1;
        }
        return 0;
      });
    }
    return elementEntries;
  }

  /**
   * Creates potential suggestions from element entries.
   */
  private createPotentialSuggestions(
    elementEntries: Array<{ element: AngularElementData; selectors: string[] }>,
    contextData: CompletionContextData
  ): PotentialSuggestion[] {
    const potentialSuggestions: PotentialSuggestion[] = [];

    for (const { element, selectors } of elementEntries) {
      const bestMatch = this.findBestSelectorMatch(element, selectors, contextData);
      if (bestMatch.relevance > 0) {
        potentialSuggestions.push({
          insertText: bestMatch.insertText,
          element,
          relevance: bestMatch.relevance,
          kind: bestMatch.itemKind,
          originalBestSelector: bestMatch.selector,
        });
      }
    }

    return potentialSuggestions;
  }

  /**
   * Finds the best selector match for an element.
   */
  private findBestSelectorMatch(
    element: AngularElementData,
    selectors: string[],
    contextData: CompletionContextData
  ): { relevance: number; selector: string; insertText: string; itemKind: vscode.CompletionItemKind } {
    let bestRelevance = 0;
    let bestSelector = "";
    let bestInsertText = "";
    let bestItemKind = vscode.CompletionItemKind.Class;

    for (const elementSelector of selectors) {
      const match = this.evaluateSelectorMatch(element, elementSelector, contextData);
      if (match.relevance > bestRelevance) {
        bestRelevance = match.relevance;
        bestSelector = elementSelector;
        bestInsertText = match.insertText;
        bestItemKind = match.itemKind;
      }
    }

    return {
      relevance: bestRelevance,
      selector: bestSelector,
      insertText: bestInsertText,
      itemKind: bestItemKind,
    };
  }

  /**
   * Evaluates a single selector match.
   */
  private evaluateSelectorMatch(
    element: AngularElementData,
    elementSelector: string,
    contextData: CompletionContextData
  ): { relevance: number; insertText: string; itemKind: vscode.CompletionItemKind } {
    let itemKind: vscode.CompletionItemKind = vscode.CompletionItemKind.Class;
    let insertText = elementSelector;
    let relevance = 0;

    if (element.type === "component" && contextData.hasTagContext) {
      if (elementSelector.toLowerCase().startsWith(contextData.filterText.toLowerCase())) {
        itemKind = vscode.CompletionItemKind.Class;
        relevance = 2;
      }
    } else if (
      (element.type === "directive" || (element.type === "component" && element.originalSelector.includes("["))) &&
      contextData.hasAttributeContext
    ) {
      const match = this.evaluateAttributeMatch(element, elementSelector, contextData);
      relevance = match.relevance;
      insertText = match.insertText;
      itemKind = match.itemKind;
    } else if (element.type === "pipe" && contextData.hasPipeContext) {
      if (elementSelector.toLowerCase().startsWith(contextData.filterText.toLowerCase())) {
        itemKind = vscode.CompletionItemKind.Function;
        relevance = 2;
      }
    }

    return { relevance, insertText, itemKind };
  }

  /**
   * Evaluates attribute-specific matches.
   */
  private evaluateAttributeMatch(
    element: AngularElementData,
    elementSelector: string,
    contextData: CompletionContextData
  ): { relevance: number; insertText: string; itemKind: vscode.CompletionItemKind } {
    const attrName = this.extractAttributeName(elementSelector);

    if (!attrName.toLowerCase().startsWith(contextData.filterText.toLowerCase())) {
      return { relevance: 0, insertText: elementSelector, itemKind: vscode.CompletionItemKind.Class };
    }

    const insertText = this.formatAttributeInsertText(attrName, contextData);
    const itemKind =
      contextData.context === "structural-directive"
        ? vscode.CompletionItemKind.Keyword
        : vscode.CompletionItemKind.Property;

    let relevance = 2;
    relevance += this.calculateClassNameRelevance(element.name, attrName);
    relevance += this.calculateTagMatchRelevance(elementSelector, contextData.linePrefix);

    return { relevance, insertText, itemKind };
  }

  /**
   * Extracts clean attribute name from selector.
   */
  private extractAttributeName(elementSelector: string): string {
    if (elementSelector.startsWith("[")) {
      return elementSelector.slice(1, -1);
    }
    if (elementSelector.startsWith("*")) {
      return elementSelector.slice(1);
    }
    return elementSelector;
  }

  /**
   * Formats insert text for attributes.
   */
  private formatAttributeInsertText(attrName: string, contextData: CompletionContextData): string {
    if (contextData.context === "structural-directive" && !contextData.triggerChar) {
      return `*${attrName}`;
    }
    if (contextData.context === "attribute" && !contextData.triggerChar) {
      return attrName;
    }
    return attrName;
  }

  /**
   * Calculates relevance based on class name match.
   */
  private calculateClassNameRelevance(className: string, attrName: string): number {
    const expectedClassName = attrName
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

    return className.startsWith(expectedClassName) ? 2 : 0;
  }

  /**
   * Calculates relevance based on tag match.
   */
  private calculateTagMatchRelevance(elementSelector: string, linePrefix: string): number {
    const openTagIndex = linePrefix.lastIndexOf("<");
    const openTag = linePrefix.substring(openTagIndex);
    const tagMatch = /<([a-zA-Z0-9-]+)/.exec(openTag);

    if (tagMatch) {
      const currentTag = tagMatch[1];
      if (elementSelector.startsWith(`${currentTag}[`)) {
        return 5;
      }
    }
    return 0;
  }

  /**
   * Converts potential suggestions to completion items.
   */
  private convertPotentialSuggestionsToCompletionItems(
    potentialSuggestions: PotentialSuggestion[],
    contextData: CompletionContextData,
    seenElements: Set<string>
  ): vscode.CompletionItem[] {
    const groupedByInsertText = this.groupSuggestionsByInsertText(potentialSuggestions);
    const suggestions: vscode.CompletionItem[] = [];

    for (const [insertText, group] of groupedByInsertText.entries()) {
      for (const sugg of group) {
        const elementKey = `${sugg.element.path}:${sugg.element.name}`;
        if (seenElements.has(elementKey)) continue;
        seenElements.add(elementKey);

        const item = this.createCompletionItem(sugg, group.length > 1, contextData);
        suggestions.push(item);
      }
    }

    return suggestions;
  }

  /**
   * Groups suggestions by insert text.
   */
  private groupSuggestionsByInsertText(
    potentialSuggestions: PotentialSuggestion[]
  ): Map<string, PotentialSuggestion[]> {
    const grouped = new Map<string, PotentialSuggestion[]>();

    for (const suggestion of potentialSuggestions) {
      if (!suggestion.insertText) continue;

      const existing = grouped.get(suggestion.insertText);
      if (existing) {
        existing.push(suggestion);
      } else {
        grouped.set(suggestion.insertText, [suggestion]);
      }
    }

    return grouped;
  }

  /**
   * Creates a single completion item.
   */
  private createCompletionItem(
    suggestion: PotentialSuggestion,
    isSharedSelector: boolean,
    contextData: CompletionContextData
  ): vscode.CompletionItem {
    const { element, kind, relevance, originalBestSelector, insertText } = suggestion;

    const label = isSharedSelector ? `${insertText}:${element.name}` : insertText;
    const item = new vscode.CompletionItem(label, kind);

    const attrName = this.extractAttributeName(originalBestSelector);
    item.filterText = attrName;
    item.insertText = insertText;

    if (contextData.replacementRange) {
      item.range = contextData.replacementRange;
    }

    this.setCompletionItemDetails(item, element, originalBestSelector);

    item.command = {
      title: `Import ${element.name}`,
      command: "angular-auto-import.importElement",
      arguments: [element],
    };

    item.sortText = `${String.fromCharCode(97 - relevance)}${insertText}`;
    return item;
  }

  /**
   * Sets completion item details and documentation.
   */
  private setCompletionItemDetails(
    item: vscode.CompletionItem,
    element: AngularElementData,
    originalBestSelector: string
  ): void {
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
  }

  /**
   * Generates suggestions from standard Angular elements.
   */
  private generateStandardElementSuggestions(
    contextData: CompletionContextData,
    seenElements: Set<string>
  ): vscode.CompletionItem[] {
    const suggestions: vscode.CompletionItem[] = [];

    for (const [stdSelector, stdElement] of Object.entries(STANDARD_ANGULAR_ELEMENTS)) {
      if (contextData.filterText && !stdSelector.toLowerCase().includes(contextData.filterText.toLowerCase())) {
        continue;
      }

      const match = this.evaluateStandardElementMatch(stdSelector, stdElement, contextData);
      if (match.shouldInclude) {
        const elementKey = `${stdElement.importPath}:${stdElement.name}`;
        if (!seenElements.has(elementKey)) {
          seenElements.add(elementKey);
          const item = this.createStandardElementCompletionItem(stdSelector, stdElement, match, contextData);
          suggestions.push(item);
        }
      }
    }

    return suggestions;
  }

  /**
   * Evaluates if a standard element should be included.
   */
  private evaluateStandardElementMatch(
    stdSelector: string,
    stdElement: any,
    contextData: CompletionContextData
  ): {
    shouldInclude: boolean;
    insertText: string;
    itemKind: vscode.CompletionItemKind;
    relevance: number;
  } {
    let shouldInclude = false;
    let insertText = stdSelector;
    let itemKind = vscode.CompletionItemKind.Class;
    let relevance = 0;

    if (stdElement.type === "directive" && contextData.hasAttributeContext) {
      const attrName = this.extractAttributeName(stdSelector);
      if (attrName.toLowerCase().startsWith(contextData.filterText.toLowerCase())) {
        shouldInclude = true;
        insertText = this.formatAttributeInsertText(attrName, contextData);
        itemKind =
          contextData.context === "structural-directive"
            ? vscode.CompletionItemKind.Keyword
            : vscode.CompletionItemKind.Property;
        relevance = 3;
      }
    } else if (stdElement.type === "pipe" && contextData.hasPipeContext) {
      if (stdSelector.toLowerCase().startsWith(contextData.filterText.toLowerCase())) {
        shouldInclude = true;
        itemKind = vscode.CompletionItemKind.Function;
        relevance = 2;
      }
    }

    return { shouldInclude, insertText, itemKind, relevance };
  }

  /**
   * Creates completion item for standard Angular elements.
   */
  private createStandardElementCompletionItem(
    stdSelector: string,
    stdElement: any,
    match: { insertText: string; itemKind: vscode.CompletionItemKind; relevance: number },
    contextData: CompletionContextData
  ): vscode.CompletionItem {
    const item = new vscode.CompletionItem(stdSelector, match.itemKind);
    item.insertText = match.insertText;
    item.filterText = this.extractAttributeName(stdSelector);

    if (contextData.replacementRange) {
      item.range = contextData.replacementRange;
    }

    item.detail = `Angular Auto-Import: ${stdElement.type} (standalone)`;
    item.documentation = new vscode.MarkdownString(`Import from \`${stdElement.importPath}\`.`);

    const elementDataForCommand = new AngularElementData(
      stdElement.importPath,
      stdElement.name,
      stdElement.type,
      stdSelector,
      stdElement.selectors ?? [stdSelector],
      true,
      true,
      undefined
    );

    item.command = {
      title: `Import ${stdElement.name}`,
      command: "angular-auto-import.importElement",
      arguments: [elementDataForCommand],
    };

    item.sortText = `${String.fromCharCode(96 - match.relevance)}${stdSelector}`;
    return item;
  }

  /**
   * Deduplicates and sorts suggestions.
   */
  private deduplicateAndSortSuggestions(suggestions: vscode.CompletionItem[]): vscode.CompletionItem[] {
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
