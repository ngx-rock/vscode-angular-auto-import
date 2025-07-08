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
    const severity = this.getSeverityFromConfig(this.context.extensionConfig.diagnosticsSeverity);

    const tsDocument = await this.getTsDocument(document, componentPath);
    if (!tsDocument) {
      return;
    }

    // Parse the template to get all elements and their full context
    const parsedElements = await this.parseCompleteTemplate(templateText, document, offset);

    for (const element of parsedElements) {
      const elementDiagnostics = await this.checkElement(element, indexer, tsDocument, severity);
      if (elementDiagnostics.length > 0) {
        diagnostics.push(...elementDiagnostics);
      }
    }

    this.candidateDiagnostics.set(document.uri.toString(), diagnostics);
    this.publishFilteredDiagnostics(document.uri);
  }

  private async parseCompleteTemplate(
    text: string,
    document: vscode.TextDocument,
    offset: number
  ): Promise<ParsedHtmlFullElement[]> {
    const elements: ParsedHtmlFullElement[] = [];
    try {
      const compiler = await import("@angular/compiler");
      const { nodes } = compiler.parseTemplate(text, document.uri.fsPath);

      type CompilerModule = typeof compiler;
      type TemplateNode = (typeof nodes)[0];
      type AttributeLikeNode =
        | InstanceType<CompilerModule["TmplAstTextAttribute"]>
        | InstanceType<CompilerModule["TmplAstBoundAttribute"]>
        | InstanceType<CompilerModule["TmplAstBoundEvent"]>
        | InstanceType<CompilerModule["TmplAstReference"]>;

      const visit = (nodesList: TemplateNode[]) => {
        for (const node of nodesList) {
          if (node instanceof compiler.TmplAstElement || node instanceof compiler.TmplAstTemplate) {
            const isTemplate = node instanceof compiler.TmplAstTemplate;
            const allAttrsList: AttributeLikeNode[] = isTemplate
              ? [...node.templateAttrs, ...node.inputs, ...node.outputs, ...node.references]
              : [...node.attributes, ...node.inputs, ...node.outputs, ...node.references];

            const attributes = allAttrsList.map((attr) => ({
              name: attr.name,
              value: "value" in attr && attr.value ? String(attr.value) : "",
            }));

            // One entry for the element tag itself
            elements.push({
              name: isTemplate ? "ng-template" : node.name,
              type: "component",
              isAttribute: false,
              range: new vscode.Range(
                document.positionAt(offset + node.sourceSpan.start.offset),
                document.positionAt(offset + node.sourceSpan.end.offset)
              ),
              tagName: isTemplate ? "ng-template" : node.name,
              attributes,
            });

            // One entry for each attribute or reference
            for (const attr of allAttrsList) {
              const keySpan = attr.keySpan ?? attr.sourceSpan;
              if (keySpan) {
                let type: ParsedHtmlFullElement["type"] = "attribute";
                if (attr instanceof compiler.TmplAstReference) {
                  type = "template-reference";
                } else if (node instanceof compiler.TmplAstTemplate || attr.name.startsWith("*")) {
                  type = "structural-directive";
                } else if (attr instanceof compiler.TmplAstBoundAttribute) {
                  type = "property-binding";
                }

                elements.push({
                  name: attr.name,
                  type: type,
                  isAttribute: true,
                  range: new vscode.Range(
                    document.positionAt(offset + keySpan.start.offset),
                    document.positionAt(offset + keySpan.end.offset)
                  ),
                  tagName: isTemplate ? "ng-template" : node.name,
                  attributes,
                });
              }
            }
          }

          if (node instanceof compiler.TmplAstBoundText) {
            const pipes = this._findPipesInExpression(
              text.slice(node.sourceSpan.start.offset, node.sourceSpan.end.offset),
              document,
              offset,
              node.sourceSpan.start.offset
            );
            for (const pipe of pipes) {
              elements.push({ ...pipe, isAttribute: false, attributes: [] });
            }
          }

          if (node && typeof node === "object" && "children" in node && Array.isArray(node.children)) {
            visit(node.children as TemplateNode[]);
          }
        }
      };

      visit(nodes);
    } catch (e) {
      console.error(`[DiagnosticProvider] Failed to parse template: ${document.uri.fsPath}`, e);
    }
    return elements;
  }

  private async checkElement(
    element: ParsedHtmlFullElement,
    indexer: AngularIndexer,
    tsDocument: vscode.TextDocument,
    severity: vscode.DiagnosticSeverity
  ): Promise<vscode.Diagnostic[]> {
    const { CssSelector, SelectorMatcher } = await import("@angular/compiler");
    const possibleSelectors = this.generatePossibleSelectorsForElement(element);
    const diagnostics: vscode.Diagnostic[] = [];
    const processedCandidatesThisCall = new Set<string>();

    for (const selector of possibleSelectors) {
      const candidate = getAngularElement(selector, indexer);

      if (!candidate || processedCandidatesThisCall.has(candidate.name)) {
        continue;
      }

      processedCandidatesThisCall.add(candidate.name);

      if (
        (element.isAttribute && candidate.type !== "directive") ||
        (!element.isAttribute && candidate.type !== "component" && candidate.type !== "pipe")
      ) {
        continue;
      }

      // Skip selector matching for pipes
      if (candidate.type !== "pipe") {
        const matcher = new SelectorMatcher();
        matcher.addSelectables(CssSelector.parse(candidate.originalSelector));

        const templateCssSelector = new CssSelector();
        templateCssSelector.setElement(element.tagName);
        for (const attr of element.attributes) {
          templateCssSelector.addAttribute(attr.name, attr.value);
        }

        let isMatch = false;
        matcher.match(templateCssSelector, () => {
          isMatch = true;
        });

        if (!isMatch) {
          continue;
        }
      }

      if (!this.isElementImported(tsDocument, candidate)) {
        const message = `'${element.name}' is part of a known ${candidate.type}, but it is not imported.`;
        const diagnostic = new vscode.Diagnostic(element.range, message, severity);
        diagnostic.code = `missing-${candidate.type}-import:${candidate.name}`;
        diagnostic.source = "angular-auto-import";
        diagnostics.push(diagnostic);
      }
    }

    return diagnostics;
  }

  private generatePossibleSelectorsForElement(element: ParsedHtmlFullElement): string[] {
    const name = element.name;
    const selectors = new Set<string>([name]);

    if (element.isAttribute) {
      selectors.add(`[${name}]`);
      if (name.startsWith("*")) {
        selectors.add(name.substring(1));
      } else {
        selectors.add(`*${name}`);
      }
      const kebab = name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
      if (kebab !== name) {
        selectors.add(`[${kebab}]`);
      }

      const camel = name.replace(/-([a-z])/g, (_m, l) => l.toUpperCase());
      if (camel !== name) {
        selectors.add(`[${camel}]`);
      }
    }

    return [...selectors];
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
      console.error(`Could not open TS document for diagnostics: ${componentPath}`, error);
      return null;
    }
  }

  private isElementImported(document: vscode.TextDocument, element: AngularElementData): boolean {
    try {
      const sourceFile = this.getSourceFile(document);
      if (!sourceFile) {
        return false;
      }

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
      return false;
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
    const rawCandidateDiags = this.candidateDiagnostics.get(uri.toString()) || [];

    const candidateDiags: vscode.Diagnostic[] = [];
    for (const diag of rawCandidateDiags) {
      const alreadyExists = candidateDiags.some((d) => d.message === diag.message && d.range.isEqual(diag.range));
      if (!alreadyExists) {
        candidateDiags.push(diag);
      }
    }

    const allCurrentDiagnostics = vscode.languages.getDiagnostics(uri);
    const angularDiagnostics = allCurrentDiagnostics.filter(
      (d) =>
        d.source === "angular" ||
        d.source === "Angular Language Service" ||
        d.message.includes("is not a known element") ||
        d.message.includes("is not a known property")
    );

    const filteredDiags = candidateDiags.filter((myDiag) => {
      const isDuplicate = angularDiagnostics.some((angularDiag) => {
        const doRangesOverlap = !!angularDiag.range.intersection(myDiag.range);

        const myDiagMessage = myDiag.message;
        const elementMatch = myDiagMessage.match(/'([^']*)'/);
        if (!elementMatch) {
          return doRangesOverlap;
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

interface ParsedHtmlFullElement extends ParsedHtmlElement {
  type: "component" | "pipe" | "attribute" | "structural-directive" | "property-binding" | "template-reference";
  isAttribute: boolean;
  attributes: { name: string; value: string }[];
}
