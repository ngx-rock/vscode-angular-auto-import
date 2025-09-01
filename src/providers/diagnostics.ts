/**
 *
 * Angular Auto-Import Diagnostic Provider
 *
 * @module
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
import { logger } from "../logger";
import type { AngularIndexer } from "../services";
import type { AngularElementData, ParsedHtmlElement } from "../types";
import { getAngularElements, isStandalone, switchFileType } from "../utils";
import { debounce } from "../utils/debounce";
import type { ProviderContext } from "./index";

/**
 * Provides diagnostics for Angular elements.
 */
export class DiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];
  private candidateDiagnostics: Map<string, vscode.Diagnostic[]> = new Map();
  private templateCache = new Map<string, { version: number; nodes: unknown[] }>();
  private compiler: any | null = null;

  constructor(private context: ProviderContext) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection("angular-auto-import");
    // Pre-load Angular compiler in the background
    void import("@angular/compiler")
      .then((compiler) => {
        this.compiler = compiler;
        logger.info("[DiagnosticProvider] @angular/compiler pre-loaded.");
      })
      .catch((error) => {
        logger.error("[DiagnosticProvider] Failed to pre-load @angular/compiler:", error as Error);
      });
  }

  /**
   * Activates the diagnostic provider.
   */
  activate(): void {
    // Update diagnostics when HTML documents change
    const htmlUpdateHandler = vscode.workspace.onDidChangeTextDocument(
      debounce(async (event: vscode.TextDocumentChangeEvent) => {
        if (event.document.languageId === "html") {
          await this.updateDiagnostics(event.document);
        }
      }, 300)
    );
    this.disposables.push(htmlUpdateHandler);

    // Update diagnostics when TypeScript documents change
    const tsUpdateHandler = vscode.workspace.onDidChangeTextDocument(
      debounce(async (event: vscode.TextDocumentChangeEvent) => {
        if (event.document.languageId === "typescript") {
          await this.updateDiagnostics(event.document);
          await this.updateRelatedHtmlDiagnostics(event.document);
        }
      }, 300)
    );
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
      e.uris.forEach((uri) => {
        this.publishFilteredDiagnostics(uri);
      });
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
    this.disposables.forEach((disposable) => {
      disposable.dispose();
    });
    this.disposables = [];
    this.candidateDiagnostics.clear();
    this.templateCache.clear();
    this.diagnosticCollection.dispose();
  }

  /**
   * Updates diagnostics for related HTML files when a TypeScript file changes.
   */
  private async updateRelatedHtmlDiagnostics(tsDocument: vscode.TextDocument): Promise<void> {
    try {
      const projCtx = this.getProjectContextForDocument(tsDocument);
      if (!projCtx) {
        return;
      }

      const sourceFile = projCtx.indexer.project.getSourceFile(tsDocument.fileName);
      if (!sourceFile) {
        return;
      }

      const isComponent = sourceFile.getClasses().some((c) => c.getDecorator("Component"));
      if (!isComponent) {
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
        // Updated diagnostics for related HTML file
      } catch (error) {
        logger.error(`Error opening HTML document ${htmlFilePath}:`, error as Error);
      }
    } catch (error) {
      logger.error("[DiagnosticProvider] Error updating related HTML diagnostics:", error as Error);
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
        // Force updated diagnostics for active document
      } else {
        // Fallback to opening the document
        const uri = vscode.Uri.file(filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        this.updateDiagnostics(document);
        // Force updated diagnostics for document
      }
    } catch (error) {
      logger.error(`Error force updating diagnostics for ${filePath}:`, error as Error);
    }
  }

  /**
   * Updates diagnostics for a document.
   */
  private async updateDiagnostics(document: vscode.TextDocument): Promise<void> {
    const startTime = process.hrtime.bigint();

    if (!this.context.extensionConfig.diagnosticsEnabled) {
      this.diagnosticCollection.clear();
      this.candidateDiagnostics.delete(document.uri.toString());
      return;
    }

    if (document.languageId === "html") {
      const componentPath = switchFileType(document.fileName, ".ts");
      if (!fs.existsSync(componentPath)) {
        logger.debug(
          `[DiagnosticProvider] Skipping diagnostics for HTML file without a corresponding TS component: ${document.fileName}`
        );
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
        logger.debug(
          `[DiagnosticProvider] No inline template found for TS file, clearing diagnostics: ${document.fileName}`
        );
      }
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
    logger.debug(`[DiagnosticProvider] updateDiagnostics for ${document.fileName} took ${duration.toFixed(2)} ms`);
  }

  private async runDiagnostics(
    templateText: string,
    document: vscode.TextDocument,
    offset: number,
    componentPath: string
  ): Promise<void> {
    const projCtx = this.getProjectContextForDocument(document);
    if (!projCtx) {
      logger.debug(`[DiagnosticProvider] No project context for document: ${document.fileName}`);
      return;
    }

    const { indexer } = projCtx;
    const diagnostics: vscode.Diagnostic[] = [];
    const severity = this.getSeverityFromConfig(this.context.extensionConfig.diagnosticsSeverity);

    const tsDocument = await this.getTsDocument(document, componentPath);
    if (!tsDocument) {
      return;
    }

    const sourceFile = this.getSourceFile(tsDocument);
    if (!sourceFile) {
      logger.debug(`[DiagnosticProvider] Could not get source file for ${tsDocument.fileName}`);
      return;
    }

    const classDeclaration = sourceFile.getClasses()[0];
    if (classDeclaration && !isStandalone(classDeclaration)) {
      this.candidateDiagnostics.delete(document.uri.toString());
      this.diagnosticCollection.delete(document.uri);
      return;
    }

    // Parse the template to get all elements and their full context
    const parsedElements = this.parseCompleteTemplate(templateText, document, offset, indexer);

    for (const element of parsedElements) {
      const elementDiagnostics = await this.checkElement(element, indexer, severity, sourceFile);
      if (elementDiagnostics.length > 0) {
        diagnostics.push(...elementDiagnostics);
      }
    }

    this.candidateDiagnostics.set(document.uri.toString(), diagnostics);
    this.publishFilteredDiagnostics(document.uri);
  }

  private parseCompleteTemplate(
    text: string,
    document: vscode.TextDocument,
    offset: number,
    indexer: AngularIndexer
  ): ParsedHtmlFullElement[] {
    const parseTemplateStartTime = process.hrtime.bigint();
    const elements: ParsedHtmlFullElement[] = [];
    try {
      if (!this.compiler) {
        logger.warn("[DiagnosticProvider] @angular/compiler not loaded yet, skipping template parsing.");
        return elements;
      }
      const { parseTemplate, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstElement, TmplAstReference, TmplAstTemplate, TmplAstTextAttribute, TmplAstBoundText } = this.compiler;
      type ParseResult = ReturnType<typeof parseTemplate>;
      type TemplateNode = ParseResult["nodes"][0];

      const currentVersion = document.version;
      const cacheKey = document.uri.toString();
      const cached = this.templateCache.get(cacheKey);
      let nodes: TemplateNode[];

      if (cached && cached.version === currentVersion) {
        logger.debug(`[DiagnosticProvider] Template cache HIT for ${document.fileName}`);
        nodes = cached.nodes as TemplateNode[];
      } else {
        logger.debug(`[DiagnosticProvider] Template cache MISS for ${document.fileName}`);
        const parsed = parseTemplate(text, document.uri.fsPath);
        nodes = parsed.nodes;
        this.templateCache.set(cacheKey, { version: currentVersion, nodes });
      }

      type CompilerModule = typeof this.compiler;
      type AttributeLikeNode =
        | InstanceType<CompilerModule["TmplAstTextAttribute"]>
        | InstanceType<CompilerModule["TmplAstBoundAttribute"]>
        | InstanceType<CompilerModule["TmplAstBoundEvent"]>
        | InstanceType<CompilerModule["TmplAstReference"]>;

      const extractPipesFromExpression = (
        expression: { sourceSpan?: { start: number; end: number } },
        nodeOffset: number = 0
      ) => {
        if (!expression || !expression.sourceSpan) {
          return;
        }

        try {
          const expressionText = text.slice(expression.sourceSpan.start, expression.sourceSpan.end);
          const pipes = this._findPipesInExpression(
            expressionText,
            document,
            offset + nodeOffset,
            expression.sourceSpan.start
          );
          for (const pipe of pipes) {
            elements.push({ ...pipe, isAttribute: false, attributes: [] });
          }
        } catch (e) {
          logger.error("[DiagnosticProvider] Error extracting pipes from expression:", e as Error);
        }
      };

      const visit = (nodesList: TemplateNode[]) => {
        for (const node of nodesList) {
          // Debug logging can be enabled for development
          // console.log('[DEBUG] Node type:', node.constructor.name);

          // Universal handler for control flow blocks
          const nodeName = node.constructor.name;

          // Handle all types of control flow expressions
          if (
            nodeName.includes("Block") ||
            nodeName.includes("Loop") ||
            nodeName.includes("If") ||
            nodeName.includes("Switch")
          ) {
            const controlFlowNode = node as TemplateNode & Record<string, unknown>;

            // Check for pipes in main expression (condition/iterator)
            if (controlFlowNode.expression) {
              extractPipesFromExpression(controlFlowNode.expression);
            }

            // Handle branches (@if/@else/@else if)
            if (controlFlowNode.branches && Array.isArray(controlFlowNode.branches)) {
              for (const branch of controlFlowNode.branches) {
                if (branch.expression) {
                  extractPipesFromExpression(branch.expression);
                }
                if (branch.children && Array.isArray(branch.children)) {
                  visit(branch.children);
                }
              }
            }

            // Handle cases (@switch)
            if (controlFlowNode.cases && Array.isArray(controlFlowNode.cases)) {
              for (const caseBlock of controlFlowNode.cases) {
                if (caseBlock.expression) {
                  extractPipesFromExpression(caseBlock.expression);
                }
                if (caseBlock.children && Array.isArray(caseBlock.children)) {
                  visit(caseBlock.children);
                }
              }
            }

            // Handle main children
            if (controlFlowNode.children && Array.isArray(controlFlowNode.children)) {
              visit(controlFlowNode.children);
            }

            // Handle @for empty block
            const emptyBlock = controlFlowNode.empty as { children?: TemplateNode[] };
            if (emptyBlock?.children && Array.isArray(emptyBlock.children)) {
              visit(emptyBlock.children);
            }

            // Handle @defer sub-blocks (placeholder, loading, error)
            ["placeholder", "loading", "error"].forEach((blockType) => {
              const block = controlFlowNode[blockType] as { children?: TemplateNode[] };
              if (block?.children) {
                visit(block.children);
              }
            });
          }

          if (node instanceof TmplAstElement || node instanceof TmplAstTemplate) {
            const isTemplate = node instanceof TmplAstTemplate;

            const regularAttrs: AttributeLikeNode[] = [
              ...node.attributes,
              ...node.inputs,
              ...node.outputs,
              ...node.references,
            ];

            const templateAttrs = node instanceof TmplAstTemplate ? [...node.templateAttrs] : [];

            const allAttrsList: AttributeLikeNode[] = [...regularAttrs, ...templateAttrs];

            const attributes = allAttrsList.map((attr) => ({
              name: attr.name,
              value: "value" in attr && attr.value ? String(attr.value) : "",
            }));

            const nodeName = isTemplate ? "ng-template" : node.name;
            const foundElements = indexer.getElements(nodeName);

            if (!isKnownHtmlTag(nodeName)) {
              for (const candidate of foundElements) {
                const isKnownAngularElement = candidate.type === "component" || candidate.type === "directive";

                // One entry for the element tag itself, only if it could be a component
                if (isKnownAngularElement) {
                  elements.push({
                    name: nodeName,
                    type: candidate.type as ParsedHtmlFullElement["type"],
                    isAttribute: false,
                    range: new vscode.Range(
                      document.positionAt(offset + node.startSourceSpan.start.offset),
                      document.positionAt(offset + node.startSourceSpan.end.offset)
                    ),
                    tagName: nodeName,
                    attributes,
                  });
                }
              }
            }

            // One entry for each attribute or reference
            const processAttribute = (attr: AttributeLikeNode, isTemplateAttr: boolean) => {
              const keySpan = attr.keySpan ?? attr.sourceSpan;
              if (!keySpan) {
                return;
              }

              // Skip event bindings, as they are not importable directives.
              if (attr instanceof TmplAstBoundEvent) {
                return;
              }

              let type: ParsedHtmlFullElement["type"] = "attribute";
              if (attr instanceof TmplAstReference) {
                type = "template-reference";
              } else if (isTemplateAttr || attr.name.startsWith("*")) {
                type = "structural-directive";
              } else if (attr instanceof TmplAstBoundAttribute) {
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
                tagName: nodeName,
                attributes,
              });

              // Check for pipes in bound attribute values (like *ngIf="expression | pipe")
              if (attr instanceof TmplAstBoundAttribute && attr.value) {
                const valueSpan = attr.valueSpan || attr.sourceSpan;
                if (valueSpan) {
                  const expressionText = text.slice(valueSpan.start.offset, valueSpan.end.offset);
                  const pipes = this._findPipesInExpression(expressionText, document, offset, valueSpan.start.offset);
                  for (const pipe of pipes) {
                    elements.push({ ...pipe, isAttribute: false, attributes: [] });
                  }
                }
              }
            };

            for (const attr of regularAttrs) {
              processAttribute(attr, false);
            }
            for (const attr of templateAttrs) {
              processAttribute(attr, true);
            }
          }

          if (node instanceof TmplAstBoundText) {
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

          // Handle regular children for non-control-flow nodes
          if (node && typeof node === "object" && "children" in node && Array.isArray(node.children)) {
            // Only visit children if this is not a control flow node (already handled above)
            const nodeName = node.constructor.name;
            if (
              !(
                nodeName.includes("Block") ||
                nodeName.includes("Loop") ||
                nodeName.includes("If") ||
                nodeName.includes("Switch")
              )
            ) {
              visit(node.children as TemplateNode[]);
            }
          }
        }
      };

      visit(nodes);
      // Log duration for parsing template
      const parseTemplateEndTime = process.hrtime.bigint();
      const parseTemplateDuration = Number(parseTemplateEndTime - parseTemplateStartTime) / 1_000_000;
      logger.debug(`[DiagnosticProvider] parseCompleteTemplate for ${document.fileName} took ${parseTemplateDuration.toFixed(2)} ms`);

    } catch (e) {
      logger.error(`[DiagnosticProvider] Failed to parse template: ${document.uri.fsPath}`, e as Error);
    }
    return elements;
  }

  private async checkElement(
    element: ParsedHtmlFullElement,
    indexer: AngularIndexer,
    severity: vscode.DiagnosticSeverity,
    sourceFile: SourceFile
  ): Promise<vscode.Diagnostic[]> {
    const checkElementStartTime = process.hrtime.bigint();
    const { CssSelector, SelectorMatcher } = await import("@angular/compiler");
    const diagnostics: vscode.Diagnostic[] = [];
    const processedCandidatesThisCall = new Set<string>();

    const candidates = getAngularElements(element.name, indexer);

    for (const candidate of candidates) {
      if (!candidate || processedCandidatesThisCall.has(candidate.name)) {
        continue;
      }

      // Skip selector matching for pipes
      if (candidate.type !== "pipe") {
        const matcher = new SelectorMatcher();
        const individualSelectors = CssSelector.parse(candidate.originalSelector);

        // We add each individual selector to the matcher.
        // This is crucial for complex selectors like `ng-template[myDirective]`.
        matcher.addSelectables(individualSelectors);

        const templateCssSelector = new CssSelector();
        templateCssSelector.setElement(element.tagName);
        for (const attr of element.attributes) {
          templateCssSelector.addAttribute(attr.name, attr.value ?? "");
        }

        const matchedSelectors: string[] = [];
        // The callback will be invoked for each selector that matches.
        // We capture them all and will use the most specific one.
        matcher.match(templateCssSelector, (selector) => {
          matchedSelectors.push(selector.toString());
        });

        if (matchedSelectors.length === 0) {
          continue;
        }

        // The last matched selector is considered the most specific one by Angular's engine.
        const specificSelector = matchedSelectors[matchedSelectors.length - 1];

        // Only add to processed after a successful match.
        processedCandidatesThisCall.add(candidate.name);

        if (!this.isElementImported(sourceFile, candidate)) {
          diagnostics.push(this.createMissingImportDiagnostic(element, candidate, specificSelector, severity));
        }
      } else {
        // For pipes, the candidate name is the selector
        processedCandidatesThisCall.add(candidate.name);
        if (!this.isElementImported(sourceFile, candidate)) {
          diagnostics.push(this.createMissingImportDiagnostic(element, candidate, element.name, severity));
        }
      }
    }

    const checkElementEndTime = process.hrtime.bigint();
    const checkElementDuration = Number(checkElementEndTime - checkElementStartTime) / 1_000_000;
    logger.debug(`[DiagnosticProvider] checkElement for ${element.name} took ${checkElementDuration.toFixed(2)} ms`);

    return diagnostics;
  }

  private createMissingImportDiagnostic(
    element: ParsedHtmlFullElement,
    candidate: AngularElementData,
    specificSelector: string,
    severity: vscode.DiagnosticSeverity
  ): vscode.Diagnostic {
    const message = `'${element.name}' is part of a known ${candidate.type}, but it is not imported.`;
    const diagnostic = new vscode.Diagnostic(element.range, message, severity);

    diagnostic.code = `missing-${candidate.type}-import:${specificSelector}`;
    diagnostic.source = "angular-auto-import";
    return diagnostic;
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
      logger.error(`Could not open TS document for diagnostics: ${componentPath}`, error as Error);
      return null;
    }
  }

  private isElementImported(sourceFile: SourceFile, element: AngularElementData): boolean {
    try {
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
      logger.error("[DiagnosticProvider] Error checking element import with ts-morph:", error as Error);
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
    this.diagnosticCollection.set(uri, candidateDiags);
  }
}

function isKnownHtmlTag(tag: string): boolean {
  const knownTags = new Set([
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "meta",
    "meter",
    "nav",
    "ng-template",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
  ]);
  return knownTags.has(tag.toLowerCase());
}

interface ParsedHtmlFullElement extends ParsedHtmlElement {
  type: "component" | "pipe" | "attribute" | "structural-directive" | "property-binding" | "template-reference";
  isAttribute: boolean;
  attributes: { name: string; value: string }[];
}
