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
  type ClassDeclaration,
  type Decorator,
  type Expression,
  type Node,
  type NoSubstitutionTemplateLiteral,
  type ObjectLiteralExpression,
  type SourceFile,
  type StringLiteral,
  SyntaxKind,
} from "ts-morph";
import * as vscode from "vscode";
import { knownTags } from "../consts";
import { logger } from "../logger";
import type { AngularIndexer } from "../services";
import type {
  AngularElementData,
  ControlFlowNode,
  ParsedHtmlElement,
  TemplateAstNode,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstElement,
  TmplAstReference,
  TmplAstTemplate,
} from "../types";
import { getAngularElements, isStandalone, switchFileType } from "../utils";
import { debounce } from "../utils/debounce";
import type { ProviderContext } from "./index";

/**
 * Provides diagnostics for Angular templates.
 */
export class DiagnosticProvider {
  private readonly diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];
  private readonly candidateDiagnostics: Map<string, vscode.Diagnostic[]> = new Map();
  private readonly templateCache = new Map<string, { version: number; nodes: unknown[] }>();
  // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
  // biome-ignore lint/style/useReadonlyClassProperties: This property is assigned in loadCompiler()
  private compiler: any | null = null;
  /**
   * Cache for storing whether a specific Angular element (component, directive, pipe) is imported in a given TypeScript component file.
   * Key: path to the TypeScript component file.
   * Value: Map where key is the Angular element name (e.g., 'MyComponent') and value is a boolean indicating if it's imported.
   */
  private readonly importedElementsCache = new Map<string, Map<string, boolean>>();

  constructor(private readonly context: ProviderContext) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection("angular-auto-import");
    this.loadCompiler();
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

      // Clear cache for the related TS file as its changes might affect diagnostics
      this.importedElementsCache.delete(tsDocument.fileName);

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
      this.clearDiagnostics(document);
      return;
    }

    if (document.languageId === "html") {
      await this.processHtmlDocument(document);
    } else if (document.languageId === "typescript") {
      await this.processTypescriptDocument(document);
    }

    this.logDiagnosticsDuration(document.fileName, startTime);
  }

  /**
   * Clears diagnostics for a document.
   */
  private clearDiagnostics(document: vscode.TextDocument): void {
    this.diagnosticCollection.clear();
    this.candidateDiagnostics.delete(document.uri.toString());
  }

  /**
   * Processes HTML document diagnostics.
   */
  private async processHtmlDocument(document: vscode.TextDocument): Promise<void> {
    const componentPath = switchFileType(document.fileName, ".ts");
    if (!fs.existsSync(componentPath)) {
      logger.debug(
        `[DiagnosticProvider] Skipping diagnostics for HTML file without a corresponding TS component: ${document.fileName}`
      );
      return;
    }

    const tsDocument = await this.getTsDocument(document, componentPath);
    if (!tsDocument) {
      return;
    }

    const sourceFile = this.getSourceFile(tsDocument);
    if (!sourceFile) {
      logger.debug(`[DiagnosticProvider] Could not get source file for ${tsDocument.fileName}`);
      return;
    }

    if (!this.shouldProcessDocument(sourceFile, document)) {
      return;
    }

    await this.runDiagnostics(document.getText(), document, 0, componentPath, tsDocument, sourceFile);
  }

  /**
   * Processes TypeScript document diagnostics.
   */
  private async processTypescriptDocument(document: vscode.TextDocument): Promise<void> {
    const sourceFile = this.getSourceFile(document);
    if (!sourceFile) {
      logger.debug(`[DiagnosticProvider] Could not get source file for ${document.fileName}`);
      return;
    }

    if (!this.shouldProcessDocument(sourceFile, document)) {
      return;
    }

    const componentInfo = this.extractInlineTemplate(document, sourceFile);
    if (componentInfo) {
      this.importedElementsCache.delete(document.fileName);
      await this.runDiagnostics(
        componentInfo.template,
        document,
        componentInfo.templateOffset,
        document.fileName,
        document,
        sourceFile
      );
    } else {
      this.clearDiagnosticsForNoTemplate(document);
    }
  }

  /**
   * Checks if document should be processed for diagnostics.
   */
  private shouldProcessDocument(sourceFile: SourceFile, document: vscode.TextDocument): boolean {
    const classDeclaration = sourceFile.getClasses()[0];
    if (classDeclaration && !isStandalone(classDeclaration)) {
      this.candidateDiagnostics.delete(document.uri.toString());
      this.diagnosticCollection.delete(document.uri);
      return false;
    }
    return true;
  }

  /**
   * Clears diagnostics when no template is found.
   */
  private clearDiagnosticsForNoTemplate(document: vscode.TextDocument): void {
    this.candidateDiagnostics.delete(document.uri.toString());
    this.diagnosticCollection.delete(document.uri);
    this.importedElementsCache.delete(document.fileName);
    logger.debug(
      `[DiagnosticProvider] No inline template found for TS file, clearing diagnostics: ${document.fileName}`
    );
  }

  /**
   * Logs the duration of diagnostics operation.
   */
  private logDiagnosticsDuration(fileName: string, startTime: bigint): void {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000;
    logger.debug(`[DiagnosticProvider] updateDiagnostics for ${fileName} took ${duration.toFixed(2)} ms`);
  }

  private async runDiagnostics(
    templateText: string,
    document: vscode.TextDocument,
    offset: number,
    _componentPath: string,
    _tsDocument: vscode.TextDocument,
    sourceFile: SourceFile
  ): Promise<void> {
    const projCtx = this.getProjectContextForDocument(document);
    if (!projCtx) {
      logger.debug(`[DiagnosticProvider] No project context for document: ${document.fileName}`);
      return;
    }

    if (!this.compiler) {
      logger.warn("[DiagnosticProvider] @angular/compiler not loaded yet, skipping diagnostics.");
      return;
    }

    const { CssSelector, SelectorMatcher } = this.compiler;

    const { indexer } = projCtx;
    const diagnostics: vscode.Diagnostic[] = [];
    const severity = this.getSeverityFromConfig(this.context.extensionConfig.diagnosticsSeverity);

    // Parse the template to get all elements and their full context
    const parsedElements = this.parseCompleteTemplate(templateText, document, offset, indexer);

    for (const element of parsedElements) {
      const elementDiagnostics = await this.checkElement(
        element,
        indexer,
        severity,
        sourceFile,
        CssSelector,
        SelectorMatcher
      );
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
      const {
        parseTemplate,
        TmplAstBoundAttribute,
        TmplAstBoundEvent,
        TmplAstElement,
        TmplAstReference,
        TmplAstTemplate,
        TmplAstBoundText,
      } = this.compiler;
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

      const extractPipesFromExpression = (expression: unknown, nodeOffset: number = 0) => {
        if (!expression || typeof expression !== "object" || !("sourceSpan" in expression) || !expression.sourceSpan) {
          return;
        }

        try {
          const expr = expression as { sourceSpan: { start: number; end: number } };
          const expressionText = text.slice(expr.sourceSpan.start, expr.sourceSpan.end);
          const pipes = this._findPipesInExpression(
            expressionText,
            document,
            offset + nodeOffset,
            expr.sourceSpan.start
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
          this.processTemplateNode(
            node,
            visit,
            extractPipesFromExpression,
            elements,
            document,
            offset,
            text,
            indexer,
            TmplAstElement,
            TmplAstTemplate,
            TmplAstBoundEvent,
            TmplAstReference,
            TmplAstBoundAttribute,
            TmplAstBoundText
          );
        }
      };

      visit(nodes);
      // Log duration for parsing template
      const parseTemplateEndTime = process.hrtime.bigint();
      const parseTemplateDuration = Number(parseTemplateEndTime - parseTemplateStartTime) / 1_000_000;
      logger.debug(
        `[DiagnosticProvider] parseCompleteTemplate for ${document.fileName} took ${parseTemplateDuration.toFixed(2)} ms`
      );
    } catch (e) {
      logger.error(`[DiagnosticProvider] Failed to parse template: ${document.uri.fsPath}`, e as Error);
    }
    return elements;
  }

  private async checkElement(
    element: ParsedHtmlFullElement,
    indexer: AngularIndexer,
    severity: vscode.DiagnosticSeverity,
    sourceFile: SourceFile,
    // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
    CssSelector: any,
    // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
    SelectorMatcher: any
  ): Promise<vscode.Diagnostic[]> {
    const checkElementStartTime = process.hrtime.bigint();
    const diagnostics: vscode.Diagnostic[] = [];
    const processedCandidatesThisCall = new Set<string>();

    const candidates = getAngularElements(element.name, indexer);

    for (const candidate of candidates) {
      if (!this.shouldProcessCandidate(candidate, processedCandidatesThisCall)) {
        continue;
      }

      const diagnostic = await this.processCandidateElement(
        element,
        candidate,
        severity,
        sourceFile,
        processedCandidatesThisCall,
        CssSelector,
        SelectorMatcher
      );

      if (diagnostic) {
        diagnostics.push(diagnostic);
      }
    }

    this.logCheckElementDuration(element.name, checkElementStartTime);
    return diagnostics;
  }

  /**
   * Checks if a candidate should be processed.
   */
  private shouldProcessCandidate(
    candidate: AngularElementData | null,
    processedCandidates: Set<string>
  ): candidate is AngularElementData {
    return Boolean(candidate && !processedCandidates.has(candidate.name));
  }

  /**
   * Processes a single candidate element.
   */
  private async processCandidateElement(
    element: ParsedHtmlFullElement,
    candidate: AngularElementData,
    severity: vscode.DiagnosticSeverity,
    sourceFile: SourceFile,
    processedCandidates: Set<string>,
    // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
    CssSelector: any,
    // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
    SelectorMatcher: any
  ): Promise<vscode.Diagnostic | null> {
    if (candidate.type === "pipe") {
      return this.processPipeCandidate(element, candidate, severity, sourceFile, processedCandidates);
    }

    return this.processNonPipeCandidate(
      element,
      candidate,
      severity,
      sourceFile,
      processedCandidates,
      CssSelector,
      SelectorMatcher
    );
  }

  /**
   * Processes a pipe candidate.
   */
  private processPipeCandidate(
    element: ParsedHtmlFullElement,
    candidate: AngularElementData,
    severity: vscode.DiagnosticSeverity,
    sourceFile: SourceFile,
    processedCandidates: Set<string>
  ): vscode.Diagnostic | null {
    processedCandidates.add(candidate.name);
    if (!this.isElementImported(sourceFile, candidate)) {
      return this.createMissingImportDiagnostic(element, candidate, element.name, severity);
    }
    return null;
  }

  /**
   * Processes a non-pipe candidate (component/directive).
   */
  private processNonPipeCandidate(
    element: ParsedHtmlFullElement,
    candidate: AngularElementData,
    severity: vscode.DiagnosticSeverity,
    sourceFile: SourceFile,
    processedCandidates: Set<string>,
    // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
    CssSelector: any,
    // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
    SelectorMatcher: any
  ): vscode.Diagnostic | null {
    const matchedSelectors = this.getMatchedSelectors(element, candidate, CssSelector, SelectorMatcher);

    if (matchedSelectors.length === 0) {
      return null;
    }

    // The last matched selector is considered the most specific one by Angular's engine.
    const specificSelector = matchedSelectors[matchedSelectors.length - 1];
    processedCandidates.add(candidate.name);

    if (!this.isElementImported(sourceFile, candidate)) {
      return this.createMissingImportDiagnostic(element, candidate, specificSelector, severity);
    }
    return null;
  }

  /**
   * Gets matched selectors for an element and candidate.
   */
  private getMatchedSelectors(
    element: ParsedHtmlFullElement,
    candidate: AngularElementData,
    // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
    CssSelector: any,
    // biome-ignore lint/suspicious/noExplicitAny: The Angular compiler is dynamically imported and has a complex, undocumented type surface.
    SelectorMatcher: any
  ): string[] {
    const matcher = new SelectorMatcher();
    const individualSelectors = CssSelector.parse(candidate.originalSelector);
    matcher.addSelectables(individualSelectors);

    const templateCssSelector = new CssSelector();
    templateCssSelector.setElement(element.tagName);
    for (const attr of element.attributes) {
      templateCssSelector.addAttribute(attr.name, attr.value ?? "");
    }

    const matchedSelectors: string[] = [];
    matcher.match(templateCssSelector, (selector: string) => {
      matchedSelectors.push(selector.toString());
    });

    return matchedSelectors;
  }

  /**
   * Logs the duration of checkElement operation.
   */
  private logCheckElementDuration(elementName: string, startTime: bigint): void {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000;
    logger.debug(`[DiagnosticProvider] checkElement for ${elementName} took ${duration.toFixed(2)} ms`);
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

  private extractInlineTemplate(
    _document: vscode.TextDocument,
    sourceFile: SourceFile
  ): { template: string; templateOffset: number } | null {
    for (const classDeclaration of sourceFile.getClasses()) {
      const result = this.extractTemplateFromClass(classDeclaration);
      if (result) {
        return result;
      }
    }
    return null;
  }

  /**
   * Extracts template from a class declaration.
   */
  private extractTemplateFromClass(
    classDeclaration: ClassDeclaration
  ): { template: string; templateOffset: number } | null {
    const componentDecorator = classDeclaration.getDecorator("Component");
    if (!componentDecorator) {
      return null;
    }

    const objectLiteral = this.getComponentDecoratorObjectLiteral(componentDecorator);
    if (!objectLiteral) {
      return null;
    }

    return this.extractTemplateFromObjectLiteral(objectLiteral);
  }

  /**
   * Gets the object literal from a Component decorator.
   */
  private getComponentDecoratorObjectLiteral(componentDecorator: Decorator): ObjectLiteralExpression | null {
    const decoratorArgs = componentDecorator.getArguments();
    if (decoratorArgs.length === 0) {
      return null;
    }

    const firstArg = decoratorArgs[0];
    if (!firstArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
      return null;
    }

    return firstArg as ObjectLiteralExpression;
  }

  /**
   * Extracts template from an object literal expression.
   */
  private extractTemplateFromObjectLiteral(
    objectLiteral: ObjectLiteralExpression
  ): { template: string; templateOffset: number } | null {
    const templateProperty = objectLiteral.getProperty("template");
    if (!templateProperty?.isKind(SyntaxKind.PropertyAssignment)) {
      return null;
    }

    const initializer = templateProperty.getInitializer();
    if (!this.isValidTemplateInitializer(initializer)) {
      return null;
    }

    const templateString = initializer.getLiteralText();
    const templateOffset = initializer.getStart() + 1;
    return { template: templateString, templateOffset };
  }

  /**
   * Checks if an initializer is a valid template initializer.
   */
  private isValidTemplateInitializer(
    initializer: Node | undefined
  ): initializer is StringLiteral | NoSubstitutionTemplateLiteral {
    return Boolean(
      initializer &&
        (initializer.isKind(SyntaxKind.StringLiteral) || initializer.isKind(SyntaxKind.NoSubstitutionTemplateLiteral))
    );
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

      const cacheKey = sourceFile.getFilePath();
      const cached = this.getImportFromCache(cacheKey, element.name);
      if (cached !== undefined) {
        return cached;
      }

      let isImported = this.checkDirectElementImport(sourceFile, element);
      if (!isImported) {
        isImported = this.checkExternalModuleImports(sourceFile, element);
      }

      this.updateImportCache(cacheKey, element.name, isImported);
      return isImported;
    } catch (error) {
      logger.error("[DiagnosticProvider] Error checking element import with ts-morph:", error as Error);
      return false;
    }
  }

  /**
   * Gets import status from cache.
   */
  private getImportFromCache(cacheKey: string, elementName: string): boolean | undefined {
    const fileCache = this.importedElementsCache.get(cacheKey);
    return fileCache?.get(elementName);
  }

  /**
   * Updates import cache with result.
   */
  private updateImportCache(cacheKey: string, elementName: string, isImported: boolean): void {
    let fileCache = this.importedElementsCache.get(cacheKey);
    if (!fileCache) {
      fileCache = new Map();
      this.importedElementsCache.set(cacheKey, fileCache);
    }
    fileCache.set(elementName, isImported);
  }

  /**
   * Gets the imports array from a Component decorator.
   */
  private getComponentImportsArray(classDeclaration: ClassDeclaration): ArrayLiteralExpression | undefined {
    const componentDecorator = classDeclaration.getDecorator("Component");
    if (!componentDecorator) {
      return undefined;
    }

    const decoratorArgs = componentDecorator.getArguments();
    if (decoratorArgs.length === 0 || !decoratorArgs[0].isKind(SyntaxKind.ObjectLiteralExpression)) {
      return undefined;
    }

    const objectLiteral = decoratorArgs[0] as ObjectLiteralExpression;
    const importsProperty = objectLiteral.getProperty("imports");

    if (!importsProperty?.isKind(SyntaxKind.PropertyAssignment)) {
      return undefined;
    }

    const initializer = importsProperty.getInitializer();
    return initializer?.isKind(SyntaxKind.ArrayLiteralExpression) ? (initializer as ArrayLiteralExpression) : undefined;
  }

  /**
   * Checks if element is directly imported in the Component imports array.
   */
  private checkDirectElementImport(sourceFile: SourceFile, element: AngularElementData): boolean {
    for (const classDeclaration of sourceFile.getClasses()) {
      const importsArray = this.getComponentImportsArray(classDeclaration);
      if (!importsArray) {
        continue;
      }

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
    return false;
  }

  /**
   * Checks if element is imported via external modules.
   */
  private checkExternalModuleImports(sourceFile: SourceFile, element: AngularElementData): boolean {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(sourceFile.getFilePath()));
    if (!workspaceFolder) {
      return false;
    }

    const projectRootPath = workspaceFolder.uri.fsPath;
    const indexer = this.context.projectIndexers.get(projectRootPath);
    if (!indexer) {
      return false;
    }

    for (const classDeclaration of sourceFile.getClasses()) {
      const importsArray = this.getComponentImportsArray(classDeclaration);
      if (!importsArray) {
        continue;
      }

      const importedModules = importsArray.getElements().map((el: Expression) => el.getText().trim());

      for (const moduleName of importedModules) {
        const moduleExports = indexer.getExternalModuleExports(moduleName);
        if (moduleExports?.has(element.name)) {
          logger.debug(
            `[DiagnosticProvider] Element '${element.name}' found in external module '${moduleName}' exports`
          );
          return true;
        }
      }
    }
    return false;
  }

  private processTemplateNode(
    node: TemplateAstNode,
    visit: (nodesList: TemplateAstNode[]) => void,
    extractPipesFromExpression: (expression: unknown, nodeOffset?: number) => void,
    elements: ParsedHtmlElement[],
    document: vscode.TextDocument,
    offset: number,
    text: string,
    indexer: AngularIndexer,
    TmplAstElement: new (...args: unknown[]) => TmplAstElement,
    TmplAstTemplate: new (...args: unknown[]) => TmplAstTemplate,
    TmplAstBoundEvent: new (...args: unknown[]) => TmplAstBoundEvent,
    TmplAstReference: new (...args: unknown[]) => TmplAstReference,
    TmplAstBoundAttribute: new (...args: unknown[]) => TmplAstBoundAttribute,
    TmplAstBoundText: new (...args: unknown[]) => TmplAstBoundText
  ): void {
    const nodeName = node.constructor.name;

    // Handle all types of control flow expressions
    if (this.isControlFlowNode(nodeName)) {
      this.processControlFlowNode(node, visit, extractPipesFromExpression);
      return;
    }

    if (node instanceof TmplAstElement || node instanceof TmplAstTemplate) {
      this.processElementOrTemplateNode(
        node,
        elements,
        document,
        offset,
        text,
        indexer,
        TmplAstTemplate,
        TmplAstBoundEvent,
        TmplAstReference,
        TmplAstBoundAttribute
      );
    }

    if (node instanceof TmplAstBoundText) {
      this.processBoundTextNode(node, elements, document, offset, text);
    }

    // Handle regular children for non-control-flow nodes
    if (this.hasChildren(node) && !this.isControlFlowNode(nodeName)) {
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
      visit(node.children);
    }
  }

  private isControlFlowNode(nodeName: string): boolean {
    return (
      nodeName.includes("Block") || nodeName.includes("Loop") || nodeName.includes("If") || nodeName.includes("Switch")
    );
  }

  private processControlFlowNode(
    controlFlowNode: ControlFlowNode,
    visit: (nodesList: TemplateAstNode[]) => void,
    extractPipesFromExpression: (expression: unknown, nodeOffset?: number) => void
  ): void {
    // Check for pipes in main expression (condition/iterator)
    if (controlFlowNode.expression) {
      extractPipesFromExpression(controlFlowNode.expression);
    }

    // Handle branches and cases
    this.processControlFlowBranchesAndCases(controlFlowNode, visit, extractPipesFromExpression);

    // Handle main children
    if (controlFlowNode.children && Array.isArray(controlFlowNode.children)) {
      visit(controlFlowNode.children);
    }

    // Handle special blocks
    this.processControlFlowSpecialBlocks(controlFlowNode, visit);
  }

  private processControlFlowBranchesAndCases(
    controlFlowNode: ControlFlowNode,
    visit: (nodesList: TemplateAstNode[]) => void,
    extractPipesFromExpression: (expression: unknown, nodeOffset?: number) => void
  ): void {
    // Handle branches (@if/@else/@else if)
    this.processBranchesArray(controlFlowNode.branches, visit, extractPipesFromExpression);

    // Handle cases (@switch)
    this.processCasesArray(controlFlowNode.cases, visit, extractPipesFromExpression);
  }

  private processBranchesArray(
    branches: unknown,
    visit: (nodesList: TemplateAstNode[]) => void,
    extractPipesFromExpression: (expression: unknown, nodeOffset?: number) => void
  ): void {
    if (!branches || !Array.isArray(branches)) {
      return;
    }

    for (const branch of branches) {
      this.processBranchOrCase(branch, visit, extractPipesFromExpression);
    }
  }

  private processCasesArray(
    cases: unknown,
    visit: (nodesList: TemplateAstNode[]) => void,
    extractPipesFromExpression: (expression: unknown, nodeOffset?: number) => void
  ): void {
    if (!cases || !Array.isArray(cases)) {
      return;
    }

    for (const caseBlock of cases) {
      this.processBranchOrCase(caseBlock, visit, extractPipesFromExpression);
    }
  }

  private processBranchOrCase(
    item: { expression?: unknown; children?: TemplateAstNode[] },
    visit: (nodesList: TemplateAstNode[]) => void,
    extractPipesFromExpression: (expression: unknown, nodeOffset?: number) => void
  ): void {
    if (item.expression) {
      extractPipesFromExpression(item.expression);
    }
    if (item.children && Array.isArray(item.children)) {
      visit(item.children);
    }
  }

  private processControlFlowSpecialBlocks(
    controlFlowNode: ControlFlowNode,
    visit: (nodesList: TemplateAstNode[]) => void
  ): void {
    // Handle @for empty block
    const emptyBlock = controlFlowNode.empty as { children?: TemplateAstNode[] };
    if (emptyBlock?.children && Array.isArray(emptyBlock.children)) {
      visit(emptyBlock.children);
    }

    // Handle @defer sub-blocks (placeholder, loading, error)
    ["placeholder", "loading", "error"].forEach((blockType) => {
      const block = (controlFlowNode as Record<string, unknown>)[blockType] as { children?: TemplateAstNode[] };
      if (block?.children) {
        visit(block.children);
      }
    });
  }

  private processElementOrTemplateNode(
    node: TmplAstElement | TmplAstTemplate,
    elements: ParsedHtmlElement[],
    document: vscode.TextDocument,
    offset: number,
    text: string,
    indexer: AngularIndexer,
    TmplAstTemplate: new (...args: unknown[]) => TmplAstTemplate,
    TmplAstBoundEvent: new (...args: unknown[]) => TmplAstBoundEvent,
    TmplAstReference: new (...args: unknown[]) => TmplAstReference,
    TmplAstBoundAttribute: new (...args: unknown[]) => TmplAstBoundAttribute
  ): void {
    const isTemplate = node instanceof TmplAstTemplate;

    // @ts-expect-error: Complex Angular template AST node types from ts-morph
    const regularAttrs = [...node.attributes, ...node.inputs, ...node.outputs, ...node.references];

    // @ts-expect-error: Complex Angular template AST node types from ts-morph
    const templateAttrs = isTemplate ? [...node.templateAttrs] : [];
    const allAttrsList = [...regularAttrs, ...templateAttrs];

    const attributes = allAttrsList.map((attr: unknown) => ({
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
      name: attr.name,
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
      value: "value" in attr && attr.value ? String(attr.value) : "",
    }));

    const nodeName = isTemplate ? "ng-template" : node.name;
    const foundElements = indexer.getElements(nodeName);

    if (!isKnownHtmlTag(nodeName)) {
      this.addAngularElementsToList(node, nodeName, foundElements, elements, document, offset, attributes);
    }

    // Process attributes
    this.processAttributes(
      regularAttrs,
      templateAttrs,
      nodeName,
      attributes,
      elements,
      document,
      offset,
      text,
      TmplAstBoundEvent,
      TmplAstReference,
      TmplAstBoundAttribute
    );
  }

  private addAngularElementsToList(
    node: TmplAstElement | TmplAstTemplate,
    nodeName: string,
    foundElements: AngularElementData[],
    elements: ParsedHtmlElement[],
    document: vscode.TextDocument,
    offset: number,
    attributes: Array<{ name: string; value: string }>
  ): void {
    for (const candidate of foundElements) {
      const isKnownAngularElement = candidate.type === "component" || candidate.type === "directive";

      if (isKnownAngularElement) {
        elements.push({
          name: nodeName,
          // @ts-expect-error: Complex Angular template AST node types from ts-morph
          type: candidate.type,
          isAttribute: false,
          range: new vscode.Range(
            // @ts-expect-error: Complex Angular template AST node types from ts-morph
            document.positionAt(offset + node.startSourceSpan.start.offset),
            // @ts-expect-error: Complex Angular template AST node types from ts-morph
            document.positionAt(offset + node.startSourceSpan.end.offset)
          ),
          tagName: nodeName,
          attributes,
        });
      }
    }
  }

  private processAttributes(
    regularAttrs: unknown[],
    templateAttrs: unknown[],
    nodeName: string,
    attributes: Array<{ name: string; value: string }>,
    elements: ParsedHtmlElement[],
    document: vscode.TextDocument,
    offset: number,
    text: string,
    TmplAstBoundEvent: new (...args: unknown[]) => TmplAstBoundEvent,
    TmplAstReference: new (...args: unknown[]) => TmplAstReference,
    TmplAstBoundAttribute: new (...args: unknown[]) => TmplAstBoundAttribute
  ): void {
    const processAttribute = (attr: unknown, isTemplateAttr: boolean) => {
      this.processSingleAttribute(
        attr,
        isTemplateAttr,
        nodeName,
        attributes,
        elements,
        document,
        offset,
        text,
        TmplAstBoundEvent,
        TmplAstReference,
        TmplAstBoundAttribute
      );
    };

    for (const attr of regularAttrs) {
      processAttribute(attr, false);
    }
    for (const attr of templateAttrs) {
      processAttribute(attr, true);
    }
  }

  private processSingleAttribute(
    attr: unknown,
    isTemplateAttr: boolean,
    nodeName: string,
    attributes: Array<{ name: string; value: string }>,
    elements: ParsedHtmlElement[],
    document: vscode.TextDocument,
    offset: number,
    text: string,
    TmplAstBoundEvent: new (...args: unknown[]) => TmplAstBoundEvent,
    TmplAstReference: new (...args: unknown[]) => TmplAstReference,
    TmplAstBoundAttribute: new (...args: unknown[]) => TmplAstBoundAttribute
  ): void {
    // @ts-expect-error: Complex Angular template AST node types from ts-morph
    const keySpan = attr.keySpan ?? attr.sourceSpan;
    if (!keySpan) {
      return;
    }

    // Skip event bindings, as they are not importable directives.
    if (attr instanceof TmplAstBoundEvent) {
      return;
    }

    let type = "attribute";
    if (attr instanceof TmplAstReference) {
      type = "template-reference";
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
    } else if (isTemplateAttr || attr.name.startsWith("*")) {
      type = "structural-directive";
    } else if (attr instanceof TmplAstBoundAttribute) {
      type = "property-binding";
    }

    elements.push({
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
      name: attr.name,
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
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
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
      const valueSpan = attr.valueSpan || attr.sourceSpan;
      if (valueSpan) {
        const expressionText = text.slice(valueSpan.start.offset, valueSpan.end.offset);
        const pipes = this._findPipesInExpression(expressionText, document, offset, valueSpan.start.offset);
        for (const pipe of pipes) {
          // @ts-expect-error: Complex Angular template AST node types from ts-morph
          elements.push({ ...pipe, isAttribute: false, attributes: [] });
        }
      }
    }
  }

  private processBoundTextNode(
    node: TmplAstBoundText,
    elements: ParsedHtmlElement[],
    document: vscode.TextDocument,
    offset: number,
    text: string
  ): void {
    const pipes = this._findPipesInExpression(
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
      text.slice(node.sourceSpan.start.offset, node.sourceSpan.end.offset),
      document,
      offset,
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
      node.sourceSpan.start.offset
    );
    for (const pipe of pipes) {
      // @ts-expect-error: Complex Angular template AST node types from ts-morph
      elements.push({ ...pipe, isAttribute: false, attributes: [] });
    }
  }

  private hasChildren(node: unknown): boolean {
    // @ts-expect-error: Complex Angular template AST node types from ts-morph
    return node && typeof node === "object" && "children" in node && Array.isArray(node.children);
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

  private loadCompiler(): void {
    void import("@angular/compiler")
      .then((compiler) => {
        this.compiler = compiler;
        logger.info("[DiagnosticProvider] @angular/compiler pre-loaded.");
      })
      .catch((error) => {
        logger.error("[DiagnosticProvider] Failed to pre-load @angular/compiler:", error as Error);
      });
  }
}

function isKnownHtmlTag(tag: string): boolean {
  return knownTags.has(tag.toLowerCase());
}

interface ParsedHtmlFullElement extends ParsedHtmlElement {
  type: "component" | "pipe" | "attribute" | "structural-directive" | "property-binding" | "template-reference";
  isAttribute: boolean;
  attributes: { name: string; value: string }[];
}
