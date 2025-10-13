import type { Element } from "../types/angular";
import { FORMS_DIRECTIVES, REACTIVE_FORMS_DIRECTIVES } from "./forms";

/**
 * Configuration for standard Angular directives and pipes.
 * @module
 */

/**
 * A map of standard Angular directives and pipes, keyed by their selectors.
 * This is used to provide auto-import suggestions for built-in Angular elements.
 */
export const STANDARD_ANGULAR_ELEMENTS: Record<string, Element> = {
  // ========== STRUCTURAL DIRECTIVES ==========
  // NgIf - conditional rendering
  ngIf: {
    name: "NgIf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngIf", "*ngIf", "[ngIf]"],
    originalSelector: "[ngIf]",
    standalone: true,
  },
  "*ngIf": {
    name: "NgIf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngIf", "*ngIf", "[ngIf]"],
    originalSelector: "[ngIf]",
    standalone: true,
  },
  "[ngIf]": {
    name: "NgIf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngIf", "*ngIf", "[ngIf]"],
    originalSelector: "[ngIf]",
    standalone: true,
  },

  // NgForOf - list iteration
  ngForOf: {
    name: "NgForOf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngForOf", "*ngFor", "ngFor", "[ngForOf]"],
    originalSelector: "[ngForOf]",
    standalone: true,
  },
  "*ngFor": {
    name: "NgForOf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngForOf", "*ngFor", "ngFor", "[ngForOf]"],
    originalSelector: "[ngForOf]",
    standalone: true,
  },
  ngFor: {
    name: "NgForOf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngForOf", "*ngFor", "ngFor", "[ngForOf]"],
    originalSelector: "[ngForOf]",
    standalone: true,
  },
  "[ngForOf]": {
    name: "NgForOf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngForOf", "*ngFor", "ngFor", "[ngForOf]"],
    originalSelector: "[ngForOf]",
    standalone: true,
  },

  // NgSwitch - switch-case conditional rendering
  ngSwitch: {
    name: "NgSwitch",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitch", "[ngSwitch]"],
    originalSelector: "[ngSwitch]",
    standalone: true,
  },
  "[ngSwitch]": {
    name: "NgSwitch",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitch", "[ngSwitch]"],
    originalSelector: "[ngSwitch]",
    standalone: true,
  },

  // NgSwitchCase - case branches for NgSwitch
  ngSwitchCase: {
    name: "NgSwitchCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchCase", "*ngSwitchCase", "[ngSwitchCase]"],
    originalSelector: "[ngSwitchCase]",
    standalone: true,
  },
  "*ngSwitchCase": {
    name: "NgSwitchCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchCase", "*ngSwitchCase", "[ngSwitchCase]"],
    originalSelector: "[ngSwitchCase]",
    standalone: true,
  },
  "[ngSwitchCase]": {
    name: "NgSwitchCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchCase", "*ngSwitchCase", "[ngSwitchCase]"],
    originalSelector: "[ngSwitchCase]",
    standalone: true,
  },

  // NgSwitchDefault - default case for NgSwitch
  ngSwitchDefault: {
    name: "NgSwitchDefault",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchDefault", "*ngSwitchDefault", "[ngSwitchDefault]"],
    originalSelector: "[ngSwitchDefault]",
    standalone: true,
  },
  "*ngSwitchDefault": {
    name: "NgSwitchDefault",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchDefault", "*ngSwitchDefault", "[ngSwitchDefault]"],
    originalSelector: "[ngSwitchDefault]",
    standalone: true,
  },
  "[ngSwitchDefault]": {
    name: "NgSwitchDefault",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchDefault", "*ngSwitchDefault", "[ngSwitchDefault]"],
    originalSelector: "[ngSwitchDefault]",
    standalone: true,
  },

  // ========== ATTRIBUTE DIRECTIVES ==========
  // NgClass - dynamic CSS classes
  ngClass: {
    name: "NgClass",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngClass", "[ngClass]"],
    originalSelector: "[ngClass]",
    standalone: true,
  },
  "[ngClass]": {
    name: "NgClass",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngClass", "[ngClass]"],
    originalSelector: "[ngClass]",
    standalone: true,
  },

  // NgStyle - dynamic inline styles
  ngStyle: {
    name: "NgStyle",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngStyle", "[ngStyle]"],
    originalSelector: "[ngStyle]",
    standalone: true,
  },
  "[ngStyle]": {
    name: "NgStyle",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngStyle", "[ngStyle]"],
    originalSelector: "[ngStyle]",
    standalone: true,
  },

  // NgTemplateOutlet - render template fragments
  ngTemplateOutlet: {
    name: "NgTemplateOutlet",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngTemplateOutlet", "[ngTemplateOutlet]"],
    originalSelector: "[ngTemplateOutlet]",
    standalone: true,
  },
  "[ngTemplateOutlet]": {
    name: "NgTemplateOutlet",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngTemplateOutlet", "[ngTemplateOutlet]"],
    originalSelector: "[ngTemplateOutlet]",
    standalone: true,
  },

  // NgComponentOutlet - dynamic component rendering
  ngComponentOutlet: {
    name: "NgComponentOutlet",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngComponentOutlet", "[ngComponentOutlet]"],
    originalSelector: "[ngComponentOutlet]",
    standalone: true,
  },
  "[ngComponentOutlet]": {
    name: "NgComponentOutlet",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngComponentOutlet", "[ngComponentOutlet]"],
    originalSelector: "[ngComponentOutlet]",
    standalone: true,
  },

  // ========== FORMS DIRECTIVES ==========
  // Note: We use the `selectors` field (not `originalSelector`) for indexing.
  // The `originalSelector` contains complex CSS selectors with :not() and other
  // pseudo-selectors that are used for Angular's selector matching, but we index
  // by the simple selector variants in the `selectors` array.
  ...Object.fromEntries(
    [...FORMS_DIRECTIVES, ...REACTIVE_FORMS_DIRECTIVES].flatMap((d) => {
      // Use the selectors array from the directive, not originalSelector
      const selectorsArray = d.selectors || [];
      return selectorsArray.map((selector: string) => [
        selector,
        {
          ...d,
          selectors: selectorsArray,
          originalSelector: d.originalSelector ?? "",
        },
      ]);
    })
  ),

  // NgPluralCase - individual plural cases
  ngPluralCase: {
    name: "NgPluralCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngPluralCase", "[ngPluralCase]"],
    originalSelector: "[ngPluralCase]",
    standalone: true,
  },

  "[ngPluralCase]": {
    name: "NgPluralCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngPluralCase", "[ngPluralCase]"],
    originalSelector: "[ngPluralCase]",
    standalone: true,
  },

  "[ngPlural]": {
    name: "NgPlural",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["[ngPlural]"],
    originalSelector: "[ngPlural]",
    standalone: true,
  },

  // ========== BUILT-IN PIPES ==========
  // Text transformation pipes
  uppercase: {
    name: "UpperCasePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["uppercase"],
    originalSelector: "uppercase",
    standalone: true,
  },
  lowercase: {
    name: "LowerCasePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["lowercase"],
    originalSelector: "lowercase",
    standalone: true,
  },
  titlecase: {
    name: "TitleCasePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["titlecase"],
    originalSelector: "titlecase",
    standalone: true,
  },

  // Number formatting pipes
  decimal: {
    name: "DecimalPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["decimal", "number"],
    originalSelector: "decimal",
    standalone: true,
  },
  number: {
    name: "DecimalPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["decimal", "number"],
    originalSelector: "number",
    standalone: true,
  },
  percent: {
    name: "PercentPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["percent"],
    originalSelector: "percent",
    standalone: true,
  },
  currency: {
    name: "CurrencyPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["currency"],
    originalSelector: "currency",
    standalone: true,
  },

  // Date formatting pipes
  date: {
    name: "DatePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["date"],
    originalSelector: "date",
    standalone: true,
  },

  // Data manipulation pipes
  slice: {
    name: "SlicePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["slice"],
    originalSelector: "slice",
    standalone: true,
  },
  json: {
    name: "JsonPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["json"],
    originalSelector: "json",
    standalone: true,
  },
  keyvalue: {
    name: "KeyValuePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["keyvalue"],
    originalSelector: "keyvalue",
    standalone: true,
  },

  // Async pipes
  async: {
    name: "AsyncPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["async"],
    originalSelector: "async",
    standalone: true,
  },

  // Internationalization pipes
  i18nSelect: {
    name: "I18nSelectPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["i18nSelect"],
    originalSelector: "i18nSelect",
    standalone: true,
  },
  i18nPlural: {
    name: "I18nPluralPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["i18nPlural"],
    originalSelector: "i18nPlural",
    standalone: true,
  },
};
