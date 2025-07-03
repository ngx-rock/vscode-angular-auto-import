/**
 * =================================================================================================
 * Angular Auto-Import Diagnostic Provider
 * =================================================================================================
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  type ArrayLiteralExpression,
  type Expression,
  type ObjectLiteralExpression,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";
import * as vscode from "vscode";
import type { AngularIndexer } from "../services";
import type { AngularElementData, ParsedHtmlElement } from "../types";
import { getAngularElement, switchFileType } from "../utils";
import type { ProviderContext } from "./index";

/**
 * Provides diagnostics for Angular elements.
 */
export class DiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];
  private candidateDiagnostics: Map<string, vscode.Diagnostic[]> = new Map();

  constructor(private context: ProviderContext) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection("angular-auto-import");
  }

  /**
   * Activates the diagnostic provider.
   */
  activate(): void {
    // Update diagnostics when HTML documents change
    const htmlUpdateHandler = vscode.workspace.onDidChangeTextDocument(async (event) => {
      if (event.document.languageId === "html") {
        await this.updateDiagnostics(event.document);
      }
    });
    this.disposables.push(htmlUpdateHandler);

    // Update diagnostics when TypeScript documents change
    const tsUpdateHandler = vscode.workspace.onDidChangeTextDocument(async (event) => {
      if (event.document.languageId === "typescript") {
        await this.updateDiagnostics(event.document);
        await this.updateRelatedHtmlDiagnostics(event.document);
      }
    });
    this.disposables.push(tsUpdateHandler);

    // Update diagnostics when TypeScript documents are saved
    const tsSaveHandler = vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (document.languageId === "typescript") {
        await this.updateDiagnostics(document);
        await this.updateRelatedHtmlDiagnostics(document);
      }
    });
    this.disposables.push(tsSaveHandler);

    // Update diagnostics when a document is opened
    const diagnosticOpenHandler = vscode.workspace.onDidOpenTextDocument(async (document) => {
      if (document.languageId === "html") {
        await this.updateDiagnostics(document);
      } else if (document.languageId === "typescript") {
        await this.updateDiagnostics(document);
      }
    });
    this.disposables.push(diagnosticOpenHandler);

    // Update diagnostics when HTML documents are saved
    const htmlSaveHandler = vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (document.languageId === "html") {
        await this.updateDiagnostics(document);
      }
    });
    this.disposables.push(htmlSaveHandler);

    // Listen for changes in any diagnostic collection to handle deduplication
    const onDidChangeDiagnosticsHandler = vscode.languages.onDidChangeDiagnostics((e) => {
      e.uris.forEach((uri) => this.publishFilteredDiagnostics(uri));
    });
    this.disposables.push(onDidChangeDiagnosticsHandler);

    // Initialize diagnostics for all open HTML documents
    for (const document of vscode.workspace.textDocuments) {
      if (document.languageId === "html" || document.languageId === "typescript") {
        this.updateDiagnostics(document);
      }
    }
  }

  /**
   * Deactivates the diagnostic provider.
   */
  deactivate(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.disposables = [];
    this.candidateDiagnostics.clear();
    this.diagnosticCollection.dispose();
  }

  /**
   * Updates diagnostics for related HTML files when a TypeScript file changes.
   */
  private async updateRelatedHtmlDiagnostics(tsDocument: vscode.TextDocument): Promise<void> {
    try {
      // Check if the file is an Angular component
      if (!tsDocument.fileName.includes(".component.ts")) {
        return;
      }

      // Find the related HTML file
      const htmlFilePath = switchFileType(tsDocument.fileName, ".html");
      if (!fs.existsSync(htmlFilePath)) {
        return;
      }

      // Open the HTML document and update diagnostics
      const htmlUri = vscode.Uri.file(htmlFilePath);
      try {
        const htmlDocument = await vscode.workspace.openTextDocument(htmlUri);
        this.updateDiagnostics(htmlDocument);
        console.log(
          `Updated diagnostics for ${path.basename(
            htmlFilePath
          )} due to changes in ${path.basename(tsDocument.fileName)}`
        );
      } catch (error) {
        console.error(`Error opening HTML document ${htmlFilePath}:`, error);
      }
    } catch (error) {
      console.error("[DiagnosticProvider] Error updating related HTML diagnostics:", error);
    }
  }

  /**
   * Public method to force-update diagnostics for a file.
   */
  public async forceUpdateDiagnosticsForFile(filePath: string): Promise<void> {
    try {
      // First try to find the document in active documents
      const activeDocument = vscode.workspace.textDocuments.find((doc) => doc.fileName === filePath);

      if (activeDocument) {
        // Force refresh ts-morph project with current document content
        const projCtx = this.getProjectContextForDocument(activeDocument);
        if (projCtx) {
          const { project } = projCtx.indexer;
          const currentContent = activeDocument.getText();

          // Force update ts-morph SourceFile with current content
          const sourceFile = project.getSourceFile(filePath);
          if (sourceFile) {
            sourceFile.replaceWithText(currentContent);
          } else {
            project.createSourceFile(filePath, currentContent, {
              overwrite: true,
            });
          }
        }

        // Use the active document directly
        this.updateDiagnostics(activeDocument);
        console.log(`Force updated diagnostics for active document: ${path.basename(filePath)}`);
      } else {
        // Fallback to opening the document
        const uri = vscode.Uri.file(filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        this.updateDiagnostics(document);
        console.log(`Force updated diagnostics for document: ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error(`Error force updating diagnostics for ${filePath}:`, error);
    }
  }

  /**
   * Updates diagnostics for a document.
   */
  private async updateDiagnostics(document: vscode.TextDocument): Promise<void> {
    if (!this.context.extensionConfig.diagnosticsEnabled) {
      this.diagnosticCollection.clear();
      this.candidateDiagnostics.delete(document.uri.toString());
      return;
    }

    if (document.languageId === "html") {
      const componentPath = switchFileType(document.fileName, ".ts");
      if (!fs.existsSync(componentPath)) {
        return; // Not an Angular component's template
      }
      await this.runDiagnostics(document.getText(), document, 0, componentPath);
    } else if (document.languageId === "typescript") {
      const componentInfo = this.extractInlineTemplate(document);
      if (componentInfo) {
        await this.runDiagnostics(componentInfo.template, document, componentInfo.templateOffset, document.fileName);
      } else {
        // Clear both collections when there's no inline template
        this.candidateDiagnostics.delete(document.uri.toString());
        this.diagnosticCollection.delete(document.uri);
      }
    }
  }

  /**
   * Runs diagnostics for a template.
   */
  private async runDiagnostics(
    templateText: string,
    document: vscode.TextDocument,
    offset: number,
    componentPath: string
  ): Promise<void> {
    const projCtx = this.getProjectContextForDocument(document);
    if (!projCtx) {
      return;
    }

    const { indexer } = projCtx;
    const diagnostics: vscode.Diagnostic[] = [];
    try {
      const severity = this.getSeverityFromConfig(this.context.extensionConfig.diagnosticsSeverity);

      // Parse HTML with improved regex parsing
      const htmlElements = await this.parseTemplateAst(templateText, document, offset);
      // console.warn("parseTemplateAst", htmlElements);
      // Check each found element
      for (const element of htmlElements) {
        const diagnostic = await this.checkElementForMissingImport(element, indexer, document, componentPath, severity);

        if (diagnostic) {
          diagnostics.push(diagnostic);
        }
      }
    } catch (error) {
      console.error("[DiagnosticProvider] Error providing diagnostics:", error);
    }

    // Store candidate diagnostics and attempt to publish filtered results
    this.candidateDiagnostics.set(document.uri.toString(), diagnostics);
    this.publishFilteredDiagnostics(document.uri);
  }

  /**
   * Gets the project context for a document.
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

  private getSourceFile(document: vscode.TextDocument): SourceFile | undefined {
    const projCtx = this.getProjectContextForDocument(document);
    if (!projCtx) {
      return undefined;
    }

    const { project } = projCtx.indexer;

    // Get the active document content (similar to importElementToFile)
    const activeDocument = vscode.workspace.textDocuments.find((doc) => doc.fileName === document.fileName);

    const currentContent = activeDocument ? activeDocument.getText() : document.getText();

    let sourceFile = project.getSourceFile(document.fileName);

    if (sourceFile) {
      // Always sync with the current content (active document or provided document)
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

  private extractInlineTemplate(document: vscode.TextDocument): { template: string; templateOffset: number } | null {
    const sourceFile = this.getSourceFile(document);
    if (!sourceFile) {
      return null;
    }

    for (const classDeclaration of sourceFile.getClasses()) {
      const componentDecorator = classDeclaration.getDecorator("Component");
      if (componentDecorator) {
        const decoratorArgs = componentDecorator.getArguments();
        if (decoratorArgs.length > 0 && decoratorArgs[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
          const objectLiteral = decoratorArgs[0] as ObjectLiteralExpression;
          const templateProperty = objectLiteral.getProperty("template");

          if (templateProperty?.isKind(SyntaxKind.PropertyAssignment)) {
            const initializer = templateProperty.getInitializer();
            if (
              initializer &&
              (initializer.isKind(SyntaxKind.StringLiteral) ||
                initializer.isKind(SyntaxKind.NoSubstitutionTemplateLiteral))
            ) {
              const templateString = initializer.getLiteralText();
              const templateOffset = initializer.getStart() + 1;
              return { template: templateString, templateOffset };
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Extracts pipes from a given expression string (e.g., from property bindings or interpolations).
   * @param expressionText The raw text of the expression.
   * @param document The document where the expression resides.
   * @param baseOffset The base offset for calculating pipe positions.
   * @param valueOffset The offset of the expression value itself.
   * @returns An array of ParsedHtmlElement for each found pipe.
   */
  private _findPipesInExpression(
    expressionText: string,
    document: vscode.TextDocument,
    baseOffset: number,
    valueOffset: number
  ): ParsedHtmlElement[] {
    const pipeElements: ParsedHtmlElement[] = [];
    const pipeRegex = /\|\s*([a-zA-Z][a-zA-Z0-9_-]*)/g;
    let match: RegExpExecArray | null;

    while ((match = pipeRegex.exec(expressionText))) {
      const pipeName = match[1];
      const pipeOffsetInExpression = match.index + match[0].indexOf(pipeName);
      const start = document.positionAt(baseOffset + valueOffset + pipeOffsetInExpression);
      const end = document.positionAt(baseOffset + valueOffset + pipeOffsetInExpression + pipeName.length);
      pipeElements.push({ type: "pipe", name: pipeName, range: new vscode.Range(start, end), tagName: "pipe" });
    }
    return pipeElements;
  }

  /**
   * Parses a given Angular template string using the Angular compiler to generate a detailed Abstract Syntax Tree (AST).
   * It then traverses this AST to identify various Angular-specific elements such as components, directives (in all forms),
   * and pipes within expressions. This method is crucial for providing accurate diagnostics by pinpointing elements
   * that are used in the template but might be missing from the component's module imports.
   *
   * The function is robust enough to handle both external HTML templates and inline templates defined within
   * TypeScript files. It carefully calculates the precise location of each element in the original document,
   * accounting for any offsets (e.g., when parsing an inline template).
   *
   * @param text The template content to parse.
   * @param document The VS Code TextDocument from which the template originates. This is used for accurate position mapping.
   * @param offset The starting offset of the template text within the document. Defaults to 0 for external HTML files.
   * @returns A promise that resolves to an array of `ParsedHtmlElement` objects, each representing a found element. Returns an empty array on parsing failure.
   */
  private async parseTemplateAst(
    text: string,
    document: vscode.TextDocument,
    offset: number = 0
  ): Promise<ParsedHtmlElement[]> {
    try {
      // Dynamically import the Angular compiler. This is essential for performance,
      // ensuring the heavy compiler library is loaded only when needed.
      const { parseTemplate, TmplAstElement, TmplAstTemplate, TmplAstBoundText } = await import("@angular/compiler");

      // The second argument to parseTemplate is the file URL, used for more precise error reporting from the compiler.
      const { nodes } = parseTemplate(text, document.uri.fsPath);
      const elements: ParsedHtmlElement[] = [];

      /**
       * Recursively visits each node in the AST to find Angular elements.
       * @param nodesList The list of nodes to visit.
       */
      const visit = (nodesList: unknown[]) => {
        for (const node of nodesList) {
          // --- 1. Handle Element Nodes (<app-component>, <div>, etc.) ---
          if (node instanceof TmplAstElement) {
            const startPos = document.positionAt(offset + node.sourceSpan.start.offset);
            const endPos = document.positionAt(offset + node.sourceSpan.end.offset);
            elements.push({
              type: "component",
              name: node.name,
              range: new vscode.Range(startPos, endPos),
              tagName: node.name,
            });

            // Handle attributes (potential directives)
            for (const attr of node.attributes) {
              // `keySpan` is an internal, undocumented property of the Angular compiler AST.
              // It provides a more accurate source span for the attribute/directive name itself,
              // whereas `sourceSpan` covers the whole attribute including its value.
              // We fall back to `sourceSpan` if `keySpan` is not available for safety.
              // biome-ignore lint/suspicious/noExplicitAny: `keySpan` is internal and not in official typings.
              const keySpan = (attr as any).keySpan ?? attr.sourceSpan;

              // Ensure the text from the span actually matches the attribute name.
              // This avoids mismatches where `keySpan` might point to something else (e.g., in 'ngForOf', name is 'ngForOf' but key might just be 'of').
              const keyText = text.slice(keySpan.start.offset, keySpan.end.offset).trim();
              if (keyText !== attr.name) {
                continue;
              }

              const s = document.positionAt(offset + keySpan.start.offset);
              const e = document.positionAt(offset + keySpan.end.offset);
              elements.push({ type: "attribute", name: attr.name, range: new vscode.Range(s, e), tagName: node.name });
            }

            // Handle property bindings `[input]="..."`
            for (const input of node.inputs) {
              const s = document.positionAt(offset + input.sourceSpan.start.offset);
              const e = document.positionAt(offset + input.sourceSpan.end.offset);
              elements.push({
                type: "property-binding",
                name: input.name,
                range: new vscode.Range(s, e),
                tagName: node.name,
              });

              // Detect pipes within the binding's expression.
              // `valueSpan` is another internal property that gives the span of the expression part.
              // We must check for its existence to avoid runtime errors with future Angular versions.
              // biome-ignore lint/suspicious/noExplicitAny: `valueSpan` is internal and not in official typings.
              const valueSpan = (input as any)?.valueSpan;
              if (valueSpan) {
                const bindingText = text.slice(valueSpan.start.offset, valueSpan.end.offset);
                elements.push(
                  ...this._findPipesInExpression(bindingText, document, offset, valueSpan.start.offset)
                );
              }
            }

            // Handle template references `#ref`
            for (const ref of node.references) {
              const s = document.positionAt(offset + ref.sourceSpan.start.offset);
              const e = document.positionAt(offset + ref.sourceSpan.end.offset);
              elements.push({
                type: "template-reference",
                name: ref.name,
                range: new vscode.Range(s, e),
                tagName: node.name,
              });
            }

            // Recursively visit children of this element
            visit(node.children);
          }
          // --- 2. Handle Template Nodes (<ng-template>, *ngFor, etc.) ---
          else if (node instanceof TmplAstTemplate) {
            // Handle structural directives on the template (`*ngFor`, `*ngIf`)
            for (const attr of node.templateAttrs) {
              // Same as above, we use the internal `keySpan` for better accuracy.
              // biome-ignore lint/suspicious/noExplicitAny: `keySpan` is internal and not in official typings.
              const keySpan = (attr as any).keySpan ?? attr.sourceSpan;
              const keyText = text.slice(keySpan.start.offset, keySpan.end.offset).trim();

              if (keyText === attr.name) {
                const s = document.positionAt(offset + keySpan.start.offset);
                const e = document.positionAt(offset + keySpan.end.offset);
                elements.push({
                  type: "structural-directive",
                  name: attr.name,
                  range: new vscode.Range(s, e),
                  tagName: "ng-template",
                });
              }

              // Detect pipes within the directive's expression.
              // biome-ignore lint/suspicious/noExplicitAny: `valueSpan` is internal and not in official typings.
              const valueSpan = (attr as any)?.valueSpan;
              if (valueSpan) {
                const attrText = text.slice(valueSpan.start.offset, valueSpan.end.offset);
                elements.push(...this._findPipesInExpression(attrText, document, offset, valueSpan.start.offset));
              }
            }

            // ***** NEW: Handle property bindings (e.g., [libUiDisplay]="true") applied directly to <ng-template> *****
            // Similar to the handling for `TmplAstElement` above.
            // biome-ignore lint/suspicious/noExplicitAny: accessing internal compiler properties that may change between Angular versions.
            const templateInputs: any[] = (node as any).inputs ?? [];
            for (const input of templateInputs) {
              const s = document.positionAt(offset + input.sourceSpan.start.offset);
              const e = document.positionAt(offset + input.sourceSpan.end.offset);
              elements.push({
                type: "property-binding",
                name: input.name,
                range: new vscode.Range(s, e),
                tagName: "ng-template",
              });

              // Detect pipes within the binding's expression (if any)
              // biome-ignore lint/suspicious/noExplicitAny: `valueSpan` is internal and not in official typings.
              const valueSpan = (input as any)?.valueSpan;
              if (valueSpan) {
                const bindingText = text.slice(valueSpan.start.offset, valueSpan.end.offset);
                elements.push(...this._findPipesInExpression(bindingText, document, offset, valueSpan.start.offset));
              }
            }

            // Handle plain attribute directives applied directly to <ng-template>
            // (for example: <ng-template myDirective>)
            // biome-ignore lint/suspicious/noExplicitAny: accessing internal compiler properties.
            const plainAttributes = (node as any).attributes ?? [];
            for (const attr of plainAttributes) {
              // Use `keySpan` when present for precise highlighting
              // biome-ignore lint/suspicious/noExplicitAny: `keySpan` is internal and not in official typings.
              const keySpan = (attr as any).keySpan ?? attr.sourceSpan;
              const keyText = text.slice(keySpan.start.offset, keySpan.end.offset).trim();
              if (keyText !== attr.name) {
                continue;
              }

              const s = document.positionAt(offset + keySpan.start.offset);
              const e = document.positionAt(offset + keySpan.end.offset);
              elements.push({
                type: "attribute",
                name: attr.name,
                range: new vscode.Range(s, e),
                tagName: "ng-template",
              });
            }
            // Recursively visit children of this template
            visit(node.children);
          }
          // --- 3. Handle Bound Text Nodes (Interpolations: {{ ... }}) ---
          else if (node instanceof TmplAstBoundText) {
            // Extract the template substring to find pipes within interpolations.
            const textValue = text.slice(node.sourceSpan.start.offset, node.sourceSpan.end.offset);
            elements.push(
              ...this._findPipesInExpression(textValue, document, offset, node.sourceSpan.start.offset)
            );
          }
        }
      };

      visit(nodes);
      return elements;
    } catch (error) {
      console.error(
        `[DiagnosticProvider] Failed to import or use Angular compiler for parsing ${document.uri.fsPath}. This can happen if '@angular/compiler' is not installed in the workspace.`,
        error
      );
      // On failure, return an empty array to prevent crashes downstream.
      return [];
    }
  }

  private async checkElementForMissingImport(
    element: ParsedHtmlElement,
    indexer: AngularIndexer,
    document: vscode.TextDocument,
    componentPath: string,
    severity: vscode.DiagnosticSeverity
  ): Promise<vscode.Diagnostic | null> {
    const possibleSelectors = this.generatePossibleSelectors(element);

    let foundElement: AngularElementData | undefined;
    let matchingSelector: string | undefined;

    for (const selector of possibleSelectors) {
      const elementData = getAngularElement(selector, indexer);
      if (elementData) {
        let typeMatch = false;
        switch (element.type) {
          case "component":
            typeMatch = elementData.type === "component";
            break;
          case "attribute":
          case "property-binding":
          case "template-reference":
            typeMatch = elementData.type === "directive";
            break;
          case "structural-directive":
            typeMatch = elementData.type === "directive";
            break;
          case "pipe":
            typeMatch = elementData.type === "pipe";
            break;
        }

        if (typeMatch) {
          foundElement = elementData;
          matchingSelector = selector;
          break;
        }
      }
    }

    if (!foundElement || !matchingSelector) {
      return null; // Element not found in index, or type mismatch.
    }

    // Now check if the found element is already imported in the component.
    // We need the TextDocument for the component's TS file.
    let tsDocument: vscode.TextDocument;
    if (document.fileName === componentPath) {
      tsDocument = document; // We are in an inline template, document is already the TS file
    } else {
      // We are in an external HTML file. We need to get the corresponding TS document.
      const tsDocUri = vscode.Uri.file(componentPath);
      tsDocument =
        vscode.workspace.textDocuments.find((doc) => doc.uri.fsPath === tsDocUri.fsPath) ||
        (await vscode.workspace.openTextDocument(tsDocUri));
    }

    if (this.isElementImported(tsDocument, foundElement)) {
      return null; // Already imported.
    }

    // It's not imported, create a diagnostic.
    const message = `'${element.name}' is a known ${foundElement.type}, but it is not imported.`;
    const diagnostic = new vscode.Diagnostic(element.range, message, severity);
    diagnostic.code = `missing-${foundElement.type}-import`; // Custom code for quick fix
    diagnostic.source = "angular-auto-import";

    return diagnostic;
  }

  private generatePossibleSelectors(element: ParsedHtmlElement): string[] {
    const selectors: string[] = [];
    const name = element.name;

    // Add the base name
    selectors.push(name);

    switch (element.type) {
      case "component":
        // For components, only add the base name (tag selector)
        break;

      case "attribute":
      case "property-binding": {
        // For attributes, add the version with square brackets
        selectors.push(`[${name}]`);

        // Convert camelCase to kebab-case
        const kebabCase = name.replace(/([A-Z])/g, "-$1").toLowerCase();
        if (kebabCase !== name) {
          selectors.push(kebabCase);
          selectors.push(`[${kebabCase}]`);
        }

        // Convert kebab-case to camelCase
        const camelCase = name.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
        if (camelCase !== name) {
          selectors.push(camelCase);
          selectors.push(`[${camelCase}]`);
        }
        break;
      }

      case "template-reference":
        // For template reference variables, add the version with square brackets
        selectors.push(`[${name}]`);
        break;

      case "structural-directive":
        // For structural directives, add variants with and without *
        if (name.startsWith("*")) {
          const withoutStar = name.substring(1);
          selectors.push(withoutStar);
          selectors.push(`[${withoutStar}]`);
        } else {
          selectors.push(`*${name}`);
          selectors.push(`[${name}]`);
        }
        break;

      case "pipe":
        // For pipes, use only the base name
        break;
    }

    return [...new Set(selectors)]; // Remove duplicates
  }

  private isElementImported(document: vscode.TextDocument, element: AngularElementData): boolean {
    try {
      const sourceFile = this.getSourceFile(document);
      if (!sourceFile) {
        // Cannot verify, assume not imported to allow quick fix
        return false;
      }

      // Find the component class and check its `imports` array
      for (const classDeclaration of sourceFile.getClasses()) {
        const componentDecorator = classDeclaration.getDecorator("Component");
        if (componentDecorator) {
          const decoratorArgs = componentDecorator.getArguments();
          if (decoratorArgs.length > 0 && decoratorArgs[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
            const objectLiteral = decoratorArgs[0] as ObjectLiteralExpression;
            const importsProperty = objectLiteral.getProperty("imports");

            if (importsProperty?.isKind(SyntaxKind.PropertyAssignment)) {
              const initializer = importsProperty.getInitializer();
              if (initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
                const importsArray = initializer as ArrayLiteralExpression;
                const isInImportsArray = importsArray
                  .getElements()
                  .some((el: Expression) => el.getText().trim() === element.name);
                if (isInImportsArray) {
                  // Now, let's be sure it's also imported at the top of the file
                  const hasTopLevelImport = sourceFile.getImportDeclarations().some((imp) => {
                    return imp.getNamedImports().some((named) => named.getName() === element.name);
                  });
                  if (hasTopLevelImport) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error("[DiagnosticProvider] Error checking element import with ts-morph:", error);
      return false; // On error, assume not imported
    }
  }

  private getSeverityFromConfig(severityLevel: string): vscode.DiagnosticSeverity {
    switch (severityLevel.toLowerCase()) {
      case "error":
        return vscode.DiagnosticSeverity.Error;
      case "warning":
        return vscode.DiagnosticSeverity.Warning;
      case "info":
        return vscode.DiagnosticSeverity.Information;
      default:
        return vscode.DiagnosticSeverity.Warning;
    }
  }

  private publishFilteredDiagnostics(uri: vscode.Uri): void {
    const candidateDiags = this.candidateDiagnostics.get(uri.toString()) || [];

    // Get all current diagnostics for this file
    const allCurrentDiagnostics = vscode.languages.getDiagnostics(uri);
    const angularDiagnostics = allCurrentDiagnostics.filter(
      (d) =>
        d.source === "angular" ||
        d.source === "Angular Language Service" ||
        d.message.includes("is not a known element") ||
        d.message.includes("is not a known property")
    );

    // Filter out our candidates that are duplicates of what Angular LS provides
    const filteredDiags = candidateDiags.filter((myDiag) => {
      const isDuplicate = angularDiagnostics.some((angularDiag) => {
        // Check for overlapping ranges
        const doRangesOverlap = !!angularDiag.range.intersection(myDiag.range);

        // Extract element name from our diagnostic message
        const myDiagMessage = myDiag.message;
        const elementMatch = myDiagMessage.match(/'([^']*)'/);
        if (!elementMatch) {
          return doRangesOverlap; // Fallback to just range check
        }

        const elementName = elementMatch[1];
        const angularDiagMessage = angularDiag.message;
        const messageIncludesElementName =
          angularDiagMessage.includes(`'${elementName}'`) || angularDiagMessage.includes(`"${elementName}"`);

        return doRangesOverlap && messageIncludesElementName;
      });
      return !isDuplicate;
    });

    this.diagnosticCollection.set(uri, filteredDiags);
  }
}
