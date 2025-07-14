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

    // --- Context detection ---
    let filterText = "";
    let replacementRange: vscode.Range | undefined;
    let context: "tag" | "attribute" | "pipe" | "structural-directive" | "reference-value" | "none" = "none";

    // 1. Pipe context (simple regex is sufficient and fast)
    const pipeRegex = /\|\s*([a-zA-Z0-9_]*)$/;
    const pipeMatch = pipeRegex.exec(linePrefix);
    // Matches template reference variable value context, e.g., #myCtrl="ngForm" | supports both ' and " quotes
    const referenceValueRegex = /#[a-zA-Z0-9_-]*\s*=\s*["']([a-zA-Z0-9_-]*)["']?$/;
    const referenceValueMatch = referenceValueRegex.exec(linePrefix);

    if (pipeMatch) {
      context = "pipe";
      filterText = pipeMatch[1];
      const start = position.translate({ characterDelta: -filterText.length });
      replacementRange = new vscode.Range(start, position);
    } else if (referenceValueMatch) {
      context = "reference-value";
      filterText = referenceValueMatch[1];
      const start = position.translate({ characterDelta: -filterText.length });
      replacementRange = new vscode.Range(start, position);
    } else {
      // 2. AST-based context detection for tags and attributes
      try {
        const {
          parseTemplate,
          TmplAstTextAttribute,
          TmplAstBoundAttribute,
          TmplAstElement,
          TmplAstTemplate,
        } = await import("@angular/compiler");

        // Infer the type of TmplAstNode from the return type of the parseTemplate function
        type TmplAstNode = ReturnType<typeof parseTemplate>["nodes"][number];

        /**
         * Traverses the Angular Template AST to find the most specific node at a given position.
         */
        const findNodeAtPosition = (nodes: TmplAstNode[], pos: number): TmplAstNode | undefined => {
          for (const node of nodes) {
            if (!node.sourceSpan || pos < node.sourceSpan.start.offset || pos > node.sourceSpan.end.offset) {
              continue;
            }

            let potentialChildren: TmplAstNode[] = [];
            if (node instanceof TmplAstElement || node instanceof TmplAstTemplate) {
              potentialChildren = [
                ...node.attributes,
                ...node.inputs,
                ...node.outputs,
                ...("templateAttrs" in node ? node.templateAttrs : []),
                ...node.children,
              ];
            } else if ("children" in node && Array.isArray(node.children)) {
              potentialChildren = (node as { children: TmplAstNode[] }).children;
            }

            const childNode = findNodeAtPosition(potentialChildren, pos);
            return childNode || node;
          }
          return undefined;
        };

        const documentText = document.getText();
        const offset = document.offsetAt(position);
        // Use offset - 1 to get the node we are "inside" of
        const nodeAtCursor = findNodeAtPosition(parseTemplate(documentText, document.uri.fsPath).nodes, offset - 1);

        const wordRange = document.getWordRangeAtPosition(position, /[\w-]+/);
        const currentWord = wordRange ? document.getText(wordRange) : "";

        if (nodeAtCursor) {
          if (
            (nodeAtCursor instanceof TmplAstTextAttribute || nodeAtCursor instanceof TmplAstBoundAttribute) &&
            linePrefix.trim().endsWith(nodeAtCursor.name) // Ensure we're completing the attribute name itself
          ) {
            context = nodeAtCursor.name.startsWith("*") ? "structural-directive" : "attribute";
            filterText = nodeAtCursor.name.startsWith("*") ? nodeAtCursor.name.slice(1) : nodeAtCursor.name;
          } else if (nodeAtCursor instanceof TmplAstElement) {
            // Check if cursor is at the element tag name
            const el = nodeAtCursor;
            const openTagEnd = el.sourceSpan.start.offset + el.name.length + 1; // After `<tag`
            if (offset <= openTagEnd) {
              context = "tag";
              filterText = el.name;
            } else {
              context = "attribute"; // Inside the element, suggesting an attribute
              filterText = currentWord;
            }
          } else if (nodeAtCursor instanceof TmplAstTemplate) {
            context = "structural-directive";
            filterText = currentWord.startsWith("*") ? currentWord.slice(1) : currentWord;
          }
        }

        // Fallback for when we're typing a new tag/attribute from scratch
        if (context === "none") {
          const structuralMatch = /\*([a-zA-Z0-9_-]*)$/.exec(linePrefix);
          const tagMatch = /<([a-zA-Z0-9-]*)$/.exec(linePrefix);
          const attributeMatch = /<[a-zA-Z0-9-]+[^>]*\s([a-zA-Z0-9-]*)$/.exec(linePrefix);

          if (structuralMatch) {
            context = "structural-directive";
            filterText = structuralMatch[1];
          } else if (tagMatch) {
            context = "tag";
            filterText = tagMatch[1];
          } else if (attributeMatch) {
            context = "attribute";
            filterText = attributeMatch[1];
          }
        }

        replacementRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_-]+/);
        if (replacementRange) {
          filterText = document.getText(replacementRange);
          // Adjust for structural directives where `*` is not part of the word
          const charBefore = replacementRange.start.character > 0 ? linePrefix[replacementRange.start.character - 1] : "";
          if (charBefore === "*") {
            replacementRange = new vscode.Range(replacementRange.start.translate(0, -1), replacementRange.end);
          }
        }
      } catch (e) {
        // Suppress parser errors during active typing
        console.error("Angular Template Parser error:", e);
        return [];
      }
    }

    const hasAttributeContext = context === "attribute" || context === "reference-value" || context === "structural-directive";
    const hasTagContext = context === "tag";
    const hasPipeContext = context === "pipe";
    const hasStructuralDirectiveContext = context === "structural-directive";

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

        if (element.type === "component" && (hasTagContext || (!hasPipeContext && !hasAttributeContext))) {
          if (elementSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            itemKind = vscode.CompletionItemKind.Class; // Component as tag
            relevance = 2;
          }
        } else if (element.type === "directive" && (hasTagContext || hasAttributeContext || !hasPipeContext)) {
          // Directives can be selectors (like components), attribute selectors, or structural directives
          if (elementSelector.startsWith("[") && elementSelector.endsWith("]")) {
            // Attribute selector
            const attrSelector = elementSelector.slice(1, -1);
            if (attrSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
              insertText = attrSelector;
              itemKind = vscode.CompletionItemKind.Property; // Directive as attribute
              relevance = 1;
            }
          } else if (hasStructuralDirectiveContext) {
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
        } else if (element.type === "pipe" && (hasPipeContext || (!hasTagContext && !hasAttributeContext))) {
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
        if (hasStructuralDirectiveContext && stdSelector.startsWith("*")) {
          // Structural directive context
          if (stdSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            shouldInclude = true;
            insertText = stdSelector.substring(1); // Remove * for insertion
            itemKind = vscode.CompletionItemKind.Keyword;
            relevance = 3; // High relevance for structural directives
          }
        } else if (hasAttributeContext && (stdSelector.startsWith("[") || !stdSelector.startsWith("*"))) {
          // Attribute directive context
          const attrName = stdSelector.startsWith("[") ? stdSelector.slice(1, -1) : stdSelector;
          if (attrName.toLowerCase().startsWith(filterText.toLowerCase())) {
            shouldInclude = true;
            insertText = attrName;
            itemKind = vscode.CompletionItemKind.Property;
            relevance = 2;
          }
        } else if (hasTagContext && !stdSelector.startsWith("*") && !stdSelector.startsWith("[")) {
          // Tag context for non-structural directives
          if (stdSelector.toLowerCase().startsWith(filterText.toLowerCase())) {
            shouldInclude = true;
            itemKind = vscode.CompletionItemKind.Property;
            relevance = 1;
          }
        }
      } else if (stdElement.type === "pipe" && (hasPipeContext || (!hasTagContext && !hasAttributeContext))) {
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
 