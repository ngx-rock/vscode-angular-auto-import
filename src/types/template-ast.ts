/**
 * Basic type definitions for Angular template AST nodes.
 * These are simplified interfaces for the Angular template parser AST.
 * @module
 */

/**
 * Base interface for Angular template AST nodes.
 */
export interface TemplateAstNode {
  constructor: { name: string };
  children?: TemplateAstNode[];
  sourceSpan?: {
    start: { offset: number };
    end: { offset: number };
  };
}

/**
 * Angular template element node.
 */
export interface TmplAstElement extends TemplateAstNode {
  name: string;
  attributes?: unknown[];
  inputs?: unknown[];
  outputs?: unknown[];
  references?: unknown[];
}

/**
 * Angular template template node (ng-template).
 */
export interface TmplAstTemplate extends TemplateAstNode {
  tagName: string;
  attributes?: unknown[];
  inputs?: unknown[];
  outputs?: unknown[];
  references?: unknown[];
  variables?: unknown[];
}

/**
 * Angular template bound event node.
 */
export interface TmplAstBoundEvent extends TemplateAstNode {
  name: string;
  target?: string;
  phase?: string;
  handler?: unknown;
}

/**
 * Angular template reference node.
 */
export interface TmplAstReference extends TemplateAstNode {
  name: string;
  value?: string;
}

/**
 * Angular template bound attribute node.
 */
export interface TmplAstBoundAttribute extends TemplateAstNode {
  name: string;
  value?: unknown;
}

/**
 * Angular template bound text node.
 */
export interface TmplAstBoundText extends TemplateAstNode {
  value?: unknown;
}

/**
 * Angular template control flow node (for @if, @for, @switch).
 */
export interface ControlFlowNode extends TemplateAstNode {
  expression?: unknown;
  children?: TemplateAstNode[];
  branches?: ControlFlowBranch[];
  cases?: ControlFlowCase[];
  empty?: { children?: TemplateAstNode[] };
}

/**
 * Angular template control flow branch.
 */
interface ControlFlowBranch extends TemplateAstNode {
  expression?: unknown;
  children?: TemplateAstNode[];
}

/**
 * Angular template control flow case.
 */
interface ControlFlowCase extends TemplateAstNode {
  expression?: unknown;
  children?: TemplateAstNode[];
}
