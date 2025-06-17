/**
 * =================================================================================================
 * Angular Auto-Import Diagnostic Provider
 * =================================================================================================
 */

import * as fs from "fs";
import * as path from "path";
import {
  ArrayLiteralExpression,
  Expression,
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import * as vscode from "vscode";
import { AngularElementData, ParsedHtmlElement } from "../types";
import { getAngularElement, switchFileType } from "../utils";
import { ProviderContext } from "./index";

/**
 * Provides diagnostics for Angular elements.
 */
export class DiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];

  constructor(private context: ProviderContext) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection(
      "angular-auto-import"
    );
  }

  /**
   * Activates the diagnostic provider.
   */
  activate(): void {
    // Update diagnostics when HTML documents change
    const htmlUpdateHandler = vscode.workspace.onDidChangeTextDocument(
      async (event) => {
        if (event.document.languageId === "html") {
          this.updateDiagnostics(event.document);
        }
      }
    );
    this.disposables.push(htmlUpdateHandler);

    // Update diagnostics when TypeScript documents change
    const tsUpdateHandler = vscode.workspace.onDidChangeTextDocument(
      async (event) => {
        if (event.document.languageId === "typescript") {
          this.updateDiagnostics(event.document);
          await this.updateRelatedHtmlDiagnostics(event.document);
        }
      }
    );
    this.disposables.push(tsUpdateHandler);

    // Update diagnostics when TypeScript documents are saved
    const tsSaveHandler = vscode.workspace.onDidSaveTextDocument(
      async (document) => {
        if (document.languageId === "typescript") {
          this.updateDiagnostics(document);
          await this.updateRelatedHtmlDiagnostics(document);
        }
      }
    );
    this.disposables.push(tsSaveHandler);

    // Update diagnostics when a document is opened
    const diagnosticOpenHandler = vscode.workspace.onDidOpenTextDocument(
      async (document) => {
        if (document.languageId === "html") {
          this.updateDiagnostics(document);
        } else if (document.languageId === "typescript") {
          this.updateDiagnostics(document);
        }
      }
    );
    this.disposables.push(diagnosticOpenHandler);

    // Update diagnostics when HTML documents are saved
    const htmlSaveHandler = vscode.workspace.onDidSaveTextDocument(
      async (document) => {
        if (document.languageId === "html") {
          this.updateDiagnostics(document);
        }
      }
    );
    this.disposables.push(htmlSaveHandler);

    // Initialize diagnostics for all open HTML documents
    for (const document of vscode.workspace.textDocuments) {
      if (
        document.languageId === "html" ||
        document.languageId === "typescript"
      ) {
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
    this.diagnosticCollection.dispose();
  }

  /**
   * Updates diagnostics for related HTML files when a TypeScript file changes.
   */
  private async updateRelatedHtmlDiagnostics(
    tsDocument: vscode.TextDocument
  ): Promise<void> {
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
      console.error(
        "[DiagnosticProvider] Error updating related HTML diagnostics:",
        error
      );
    }
  }

  /**
   * Public method to force-update diagnostics for a file.
   */
  public async forceUpdateDiagnosticsForFile(filePath: string): Promise<void> {
    try {
      // First try to find the document in active documents
      const activeDocument = vscode.workspace.textDocuments.find(
        (doc) => doc.fileName === filePath
      );

      if (activeDocument) {
        // Force refresh ts-morph project with current document content
        const projCtx = this.getProjectContextForDocument(activeDocument);
        if (projCtx) {
          const { project } = projCtx.indexer;
          const currentContent = activeDocument.getText();

          // Force update ts-morph SourceFile with current content
          let sourceFile = project.getSourceFile(filePath);
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
        console.log(
          `Force updated diagnostics for active document: ${path.basename(
            filePath
          )}`
        );
      } else {
        // Fallback to opening the document
        const uri = vscode.Uri.file(filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        this.updateDiagnostics(document);
        console.log(
          `Force updated diagnostics for document: ${path.basename(filePath)}`
        );
      }
    } catch (error) {
      console.error(`Error force updating diagnostics for ${filePath}:`, error);
    }
  }

  /**
   * Updates diagnostics for a document.
   */
  private async updateDiagnostics(
    document: vscode.TextDocument
  ): Promise<void> {
    if (!this.context.extensionConfig.diagnosticsEnabled) {
      this.diagnosticCollection.clear();
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
        await this.runDiagnostics(
          componentInfo.template,
          document,
          componentInfo.templateOffset,
          document.fileName
        );
      } else {
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
      const severity = this.getSeverityFromConfig(
        this.context.extensionConfig.diagnosticsSeverity
      );

      // Parse HTML with improved regex parsing
      const htmlElements = this.parseHtmlWithRegex(
        templateText,
        document,
        offset
      );

      // Check each found element
      for (const element of htmlElements) {
        const diagnostic = await this.checkElementForMissingImport(
          element,
          indexer,
          document,
          componentPath,
          severity
        );

        if (diagnostic) {
          diagnostics.push(diagnostic);
        }
      }
    } catch (error) {
      console.error("[DiagnosticProvider] Error providing diagnostics:", error);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  /**
   * Gets the project context for a document.
   */
  private getProjectContextForDocument(document: vscode.TextDocument) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspaceFolder) {
      const projectRootPath = workspaceFolder.uri.fsPath;
      const indexer = this.context.projectIndexers.get(projectRootPath);
      const tsConfig =
        this.context.projectTsConfigs.get(projectRootPath) ?? null;
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
    const activeDocument = vscode.workspace.textDocuments.find(
      (doc) => doc.fileName === document.fileName
    );

    const currentContent = activeDocument
      ? activeDocument.getText()
      : document.getText();

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

  private extractInlineTemplate(
    document: vscode.TextDocument
  ): { template: string; templateOffset: number } | null {
    const sourceFile = this.getSourceFile(document);
    if (!sourceFile) {
      return null;
    }

    for (const classDeclaration of sourceFile.getClasses()) {
      const componentDecorator = classDeclaration.getDecorator("Component");
      if (componentDecorator) {
        const decoratorArgs = componentDecorator.getArguments();
        if (
          decoratorArgs.length > 0 &&
          decoratorArgs[0].isKind(SyntaxKind.ObjectLiteralExpression)
        ) {
          const objectLiteral = decoratorArgs[0] as ObjectLiteralExpression;
          const templateProperty = objectLiteral.getProperty("template");

          if (
            templateProperty &&
            templateProperty.isKind(SyntaxKind.PropertyAssignment)
          ) {
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

  private parseHtmlWithRegex(
    text: string,
    document: vscode.TextDocument,
    offset: number = 0
  ): ParsedHtmlElement[] {
    const elements: ParsedHtmlElement[] = [];

    // A list of standard HTML attributes to exclude
    const standardHtmlAttributes = new Set([
      "id",
      "class",
      "style",
      "title",
      "lang",
      "dir",
      "hidden",
      "tabindex",
      "accesskey",
      "contenteditable",
      "draggable",
      "spellcheck",
      "translate",
      "role",
      "aria-label",
      "aria-describedby",
      "aria-labelledby",
      "aria-hidden",
      "aria-expanded",
      "aria-controls",
      "aria-current",
      "aria-selected",
      "data-toggle",
      "data-target",
      "data-dismiss",
      "data-backdrop",
      "href",
      "target",
      "rel",
      "download",
      "hreflang",
      "type",
      "media",
      "src",
      "alt",
      "width",
      "height",
      "loading",
      "crossorigin",
      "usemap",
      "value",
      "name",
      "disabled",
      "readonly",
      "required",
      "placeholder",
      "autocomplete",
      "autofocus",
      "multiple",
      "size",
      "min",
      "max",
      "step",
      "pattern",
      "form",
      "formaction",
      "formenctype",
      "formmethod",
      "formnovalidate",
      "formtarget",
      "checked",
      "selected",
      "defer",
      "async",
      "charset",
      "content",
      "http-equiv",
      "property",
      "itemscope",
      "itemtype",
      "itemprop",
      "itemid",
      "itemref",
      "coords",
      "shape",
      "ping",
      "referrerpolicy",
      "sandbox",
      "allow",
      "allowfullscreen",
      "allowpaymentrequest",
      "controls",
      "autoplay",
      "loop",
      "muted",
      "preload",
      "poster",
      "span",
      "rowspan",
      "colspan",
      "headers",
      "scope",
      "abbr",
      "axis",
      "datetime",
      "open",
      "wrap",
      "cols",
      "rows",
      "dirname",
      "for",
      "list",
      "accept",
      "capture",
      "challenge",
      "keytype",
      "method",
      "action",
      "enctype",
      "novalidate",
      "autocapitalize",
      "inputmode",
      "is",
    ]);

    // 1. Find all tags and their content
    const tagRegex = /<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g;
    let tagMatch;

    while ((tagMatch = tagRegex.exec(text)) !== null) {
      const fullTagMatch = tagMatch[0];
      const tagName = tagMatch[1];
      const tagStartIndex = tagMatch.index;

      // Check if the tag is an Angular component (contains a hyphen)
      if (tagName.includes("-")) {
        const startPos = document.positionAt(offset + tagStartIndex + 1); // +1 to skip <
        const endPos = document.positionAt(
          offset + tagStartIndex + 1 + tagName.length
        );
        const range = new vscode.Range(startPos, endPos);

        elements.push({
          type: "component",
          name: tagName,
          range: range,
          tagName: tagName,
        });
      }

      // 2. Find all attributes in this tag
      const attrRegex =
        /\s([a-zA-Z][a-zA-Z0-9._-]*(?:\.[a-zA-Z][a-zA-Z0-9-]*)*)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g;
      let attrMatch;

      while ((attrMatch = attrRegex.exec(fullTagMatch)) !== null) {
        const attributeName = attrMatch[1];

        // Skip standard HTML attributes, built-in Angular attributes, and event bindings
        if (
          standardHtmlAttributes.has(attributeName.toLowerCase()) ||
          attributeName.startsWith("ng-") ||
          attributeName.startsWith("(") ||
          attributeName.startsWith("[") ||
          attributeName.includes("*ng") ||
          attributeName.startsWith("*")
        ) {
          continue;
        }

        // Calculate the attribute's position in the document
        const attrStart = tagStartIndex + (attrMatch.index || 0) + 1; // +1 to skip the space
        const startPos = document.positionAt(offset + attrStart);
        const endPos = document.positionAt(
          offset + attrStart + attributeName.length
        );
        const range = new vscode.Range(startPos, endPos);

        elements.push({
          type: "attribute",
          name: attributeName,
          range: range,
          tagName: tagName,
        });
      }

      // 3. Find structural directives in this tag
      const structuralDirectiveRegex = /\*([a-zA-Z][a-zA-Z0-9-]*)/g;
      let structMatch;

      while (
        (structMatch = structuralDirectiveRegex.exec(fullTagMatch)) !== null
      ) {
        const directiveName = structMatch[1];

        const structStart = tagStartIndex + (structMatch.index || 0);
        const startPos = document.positionAt(offset + structStart);
        const endPos = document.positionAt(
          offset + structStart + structMatch[0].length
        );
        const range = new vscode.Range(startPos, endPos);

        elements.push({
          type: "structural-directive",
          name: directiveName,
          range: range,
          tagName: tagName,
        });
      }

      // 4. Find property bindings like [ngClass], [ngStyle], etc.
      const propertyBindingRegex = /\[([a-zA-Z][a-zA-Z0-9-]*)]/g;
      let propMatch;

      while ((propMatch = propertyBindingRegex.exec(fullTagMatch)) !== null) {
        const propertyName = propMatch[1];

        // Skip standard HTML properties
        if (standardHtmlAttributes.has(propertyName.toLowerCase())) {
          continue;
        }

        const propStart = tagStartIndex + (propMatch.index || 0);
        const startPos = document.positionAt(offset + propStart);
        const endPos = document.positionAt(
          offset + propStart + propMatch[0].length
        );
        const range = new vscode.Range(startPos, endPos);

        elements.push({
          type: "property-binding",
          name: propertyName,
          range: range,
          tagName: tagName,
        });
      }
    }

    // 5. Find pipes throughout the text (independent of tags)
    const pipeRegex = /\|\s*([a-zA-Z][a-zA-Z0-9_-]*)/g;
    let pipeMatch;

    while ((pipeMatch = pipeRegex.exec(text)) !== null) {
      const pipeName = pipeMatch[1];

      const pipeStart = pipeMatch.index + pipeMatch[0].indexOf(pipeName);
      const startPos = document.positionAt(offset + pipeStart);
      const endPos = document.positionAt(offset + pipeStart + pipeName.length);
      const range = new vscode.Range(startPos, endPos);

      elements.push({
        type: "pipe",
        name: pipeName,
        range: range,
        tagName: "pipe",
      });
    }

    return elements;
  }

  private async checkElementForMissingImport(
    element: ParsedHtmlElement,
    indexer: any,
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
        vscode.workspace.textDocuments.find(
          (doc) => doc.uri.fsPath === tsDocUri.fsPath
        ) || (await vscode.workspace.openTextDocument(tsDocUri));
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
      case "property-binding":
        // For attributes, add the version with square brackets
        selectors.push(`[${name}]`);

        // Convert camelCase to kebab-case
        const kebabCase = name.replace(/([A-Z])/g, "-$1").toLowerCase();
        if (kebabCase !== name) {
          selectors.push(kebabCase);
          selectors.push(`[${kebabCase}]`);
        }

        // Convert kebab-case to camelCase
        const camelCase = name.replace(
          /-([a-z])/g,
          (_: string, letter: string) => letter.toUpperCase()
        );
        if (camelCase !== name) {
          selectors.push(camelCase);
          selectors.push(`[${camelCase}]`);
        }
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

  private isElementImported(
    document: vscode.TextDocument,
    element: AngularElementData
  ): boolean {
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
          if (
            decoratorArgs.length > 0 &&
            decoratorArgs[0].isKind(SyntaxKind.ObjectLiteralExpression)
          ) {
            const objectLiteral = decoratorArgs[0] as ObjectLiteralExpression;
            const importsProperty = objectLiteral.getProperty("imports");

            if (
              importsProperty &&
              importsProperty.isKind(SyntaxKind.PropertyAssignment)
            ) {
              const initializer = importsProperty.getInitializer();
              if (
                initializer &&
                initializer.isKind(SyntaxKind.ArrayLiteralExpression)
              ) {
                const importsArray = initializer as ArrayLiteralExpression;
                const isInImportsArray = importsArray
                  .getElements()
                  .some(
                    (el: Expression) => el.getText().trim() === element.name
                  );
                if (isInImportsArray) {
                  // Now, let's be sure it's also imported at the top of the file
                  const hasTopLevelImport = sourceFile
                    .getImportDeclarations()
                    .some((imp) => {
                      return imp
                        .getNamedImports()
                        .some((named) => named.getName() === element.name);
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
      console.error(
        "[DiagnosticProvider] Error checking element import with ts-morph:",
        error
      );
      return false; // On error, assume not imported
    }
  }

  private getSeverityFromConfig(
    severityLevel: string
  ): vscode.DiagnosticSeverity {
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
}
