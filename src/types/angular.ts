/**
 * Defines the core data types for Angular elements.
 * @module
 */

import type * as vscode from "vscode";
import type { ProcessedTsConfig } from "./tsconfig";

/**
 * Represents information about an Angular component, directive, or pipe.
 */
export interface ComponentInfo {
  /**
   * The file path where the component is defined.
   */
  path: string;
  /**
   * The name of the component class.
   */
  name: string;
  /**
   * The CSS selector for the component.
   */
  selector: string;
  /**
   * The type of the element.
   */
  type: "component" | "directive" | "pipe";
  /**
   * The timestamp of the last modification of the file.
   */
  lastModified: number;
  /**
   * A hash of the file content to detect changes.
   */
  hash: string;
  /**
   * Indicates if the component is standalone.
   */
  isStandalone: boolean;
}

/**
 * Represents data for an Angular element to be indexed.
 */
export class AngularElementData {
  /**
   * @param path The file path where the element is defined.
   * @param name The name of the element's class.
   * @param type The type of the element.
   * @param originalSelector The original selector of the element.
   * @param selectors An array of possible selectors for the element.
   * @param isStandalone Indicates if the element is standalone.
   * @param exportingModuleName The name of the module that exports this element, if applicable.
   */
  constructor(
    public readonly path: string,
    public readonly name: string,
    public readonly type: "component" | "directive" | "pipe",
    public readonly originalSelector: string,
    public readonly selectors: string[],
    public readonly isStandalone: boolean,
    public readonly exportingModuleName?: string
  ) {}
}

/**
 * Information about Angular elements found in a single file.
 */
export interface FileElementsInfo {
  /**
   * The path to the file.
   */
  filePath: string;
  /**
   * The timestamp of the last modification of the file.
   */
  lastModified: number;
  /**
   * A hash of the file content.
   */
  hash: string;
  /**
   * An array of component information found in the file.
   */
  elements: ComponentInfo[];
}

/**
 * The project context to be passed to providers.
 */
export interface ProjectContext {
  /**
   * The root path of the Angular project.
   */
  projectRootPath: string;
  /**
   * An instance of the Angular indexer.
   */
  indexer: import("../services").AngularIndexer;
  /**
   * The processed tsconfig for the project.
   */
  tsConfig: ProcessedTsConfig | null;
}

/**
 * A base interface for HTML elements found in a template.
 */
export interface ParsedHtmlElement {
  /**
   * The type of the parsed HTML element.
   */
  type: "component" | "pipe" | "attribute" | "structural-directive" | "property-binding" | "template-reference";
  /**
   * The name of the element.
   */
  name: string;
  /**
   * The range of the element in the document.
   */
  range: vscode.Range;
  /**
   * The tag name of the HTML element.
   */
  tagName: string;
}
