/**
 * Configuration for standard Angular forms directives.
 *
 * Note: As of Angular 2024, form directives are NOT standalone.
 * They must be imported via FormsModule (template-driven) or
 * ReactiveFormsModule (reactive forms).
 *
 * Important: The `selectors` array must include both bracketed and
 * non-bracketed variants for proper Trie-based prefix matching.
 *
 * @module
 */
import type { Element } from "../types/angular";

/**
 * Template-driven forms directives from FormsModule.
 * These directives are used for two-way data binding with [(ngModel)].
 */
export const FORMS_DIRECTIVES: Element[] = [
  {
    name: "FormsModule",
    standalone: false,
    type: "directive",
    originalSelector: "[ngModel]:not([formControlName]):not([formControl])",
    selectors: ["ngModel", "[ngModel]"],
    importPath: "@angular/forms",
  },
  {
    name: "FormsModule",
    standalone: false,
    type: "directive",
    originalSelector: "[ngModelGroup]",
    selectors: ["ngModelGroup", "[ngModelGroup]"],
    importPath: "@angular/forms",
  },
  {
    name: "FormsModule",
    standalone: false,
    type: "directive",
    originalSelector: "form:not([ngNoForm]):not([formGroup]),ngForm,[ngForm]",
    selectors: ["ngForm", "[ngForm]"],
    importPath: "@angular/forms",
  },
];

/**
 * Reactive forms directives from ReactiveFormsModule.
 * These directives are used for model-driven forms with FormGroup and FormControl.
 */
export const REACTIVE_FORMS_DIRECTIVES: Element[] = [
  {
    name: "ReactiveFormsModule",
    standalone: false,
    type: "directive",
    originalSelector: "[formControl]",
    selectors: ["formControl", "[formControl]"],
    importPath: "@angular/forms",
  },
  {
    name: "ReactiveFormsModule",
    standalone: false,
    type: "directive",
    originalSelector: "[formControlName]",
    selectors: ["formControlName", "[formControlName]"],
    importPath: "@angular/forms",
  },
  {
    name: "ReactiveFormsModule",
    standalone: false,
    type: "directive",
    originalSelector: "[formGroup]",
    selectors: ["formGroup", "[formGroup]"],
    importPath: "@angular/forms",
  },
  {
    name: "ReactiveFormsModule",
    standalone: false,
    type: "directive",
    originalSelector: "[formGroupName]",
    selectors: ["formGroupName", "[formGroupName]"],
    importPath: "@angular/forms",
  },
  {
    name: "ReactiveFormsModule",
    standalone: false,
    type: "directive",
    originalSelector: "[formArrayName]",
    selectors: ["formArrayName", "[formArrayName]"],
    importPath: "@angular/forms",
  },
];
