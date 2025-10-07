/**
 * Configuration for standard Angular directives and pipes.
 * @module
 */

/**
 * A map of standard Angular directives and pipes, keyed by their selectors.
 * This is used to provide auto-import suggestions for built-in Angular elements.
 */
export const STANDARD_ANGULAR_ELEMENTS: {
  [selector: string]: {
    name: string;
    importPath: string;
    type: "directive" | "pipe";
    selectors: string[];
    originalSelector: string;
  };
} = {
  // ========== STRUCTURAL DIRECTIVES ==========
  // NgIf - conditional rendering
  ngIf: {
    name: "NgIf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngIf", "*ngIf", "[ngIf]"],
    originalSelector: "[ngIf]",
  },
  "*ngIf": {
    name: "NgIf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngIf", "*ngIf", "[ngIf]"],
    originalSelector: "[ngIf]",
  },
  "[ngIf]": {
    name: "NgIf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngIf", "*ngIf", "[ngIf]"],
    originalSelector: "[ngIf]",
  },

  // NgForOf - list iteration
  ngForOf: {
    name: "NgForOf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngForOf", "*ngFor", "ngFor", "[ngForOf]"],
    originalSelector: "[ngForOf]",
  },
  "*ngFor": {
    name: "NgForOf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngForOf", "*ngFor", "ngFor", "[ngForOf]"],
    originalSelector: "[ngForOf]",
  },
  ngFor: {
    name: "NgForOf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngForOf", "*ngFor", "ngFor", "[ngForOf]"],
    originalSelector: "[ngForOf]",
  },
  "[ngForOf]": {
    name: "NgForOf",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngForOf", "*ngFor", "ngFor", "[ngForOf]"],
    originalSelector: "[ngForOf]",
  },

  // NgSwitch - switch-case conditional rendering
  ngSwitch: {
    name: "NgSwitch",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitch", "[ngSwitch]"],
    originalSelector: "[ngSwitch]",
  },
  "[ngSwitch]": {
    name: "NgSwitch",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitch", "[ngSwitch]"],
    originalSelector: "[ngSwitch]",
  },

  // NgSwitchCase - case branches for NgSwitch
  ngSwitchCase: {
    name: "NgSwitchCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchCase", "*ngSwitchCase", "[ngSwitchCase]"],
    originalSelector: "[ngSwitchCase]",
  },
  "*ngSwitchCase": {
    name: "NgSwitchCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchCase", "*ngSwitchCase", "[ngSwitchCase]"],
    originalSelector: "[ngSwitchCase]",
  },
  "[ngSwitchCase]": {
    name: "NgSwitchCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchCase", "*ngSwitchCase", "[ngSwitchCase]"],
    originalSelector: "[ngSwitchCase]",
  },

  // NgSwitchDefault - default case for NgSwitch
  ngSwitchDefault: {
    name: "NgSwitchDefault",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchDefault", "*ngSwitchDefault", "[ngSwitchDefault]"],
    originalSelector: "[ngSwitchDefault]",
  },
  "*ngSwitchDefault": {
    name: "NgSwitchDefault",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchDefault", "*ngSwitchDefault", "[ngSwitchDefault]"],
    originalSelector: "[ngSwitchDefault]",
  },
  "[ngSwitchDefault]": {
    name: "NgSwitchDefault",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngSwitchDefault", "*ngSwitchDefault", "[ngSwitchDefault]"],
    originalSelector: "[ngSwitchDefault]",
  },

  // ========== ATTRIBUTE DIRECTIVES ==========
  // NgClass - dynamic CSS classes
  ngClass: {
    name: "NgClass",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngClass", "[ngClass]"],
    originalSelector: "[ngClass]",
  },
  "[ngClass]": {
    name: "NgClass",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngClass", "[ngClass]"],
    originalSelector: "[ngClass]",
  },

  // NgStyle - dynamic inline styles
  ngStyle: {
    name: "NgStyle",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngStyle", "[ngStyle]"],
    originalSelector: "[ngStyle]",
  },
  "[ngStyle]": {
    name: "NgStyle",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngStyle", "[ngStyle]"],
    originalSelector: "[ngStyle]",
  },

  // NgTemplateOutlet - render template fragments
  ngTemplateOutlet: {
    name: "NgTemplateOutlet",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngTemplateOutlet", "[ngTemplateOutlet]"],
    originalSelector: "[ngTemplateOutlet]",
  },
  "[ngTemplateOutlet]": {
    name: "NgTemplateOutlet",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngTemplateOutlet", "[ngTemplateOutlet]"],
    originalSelector: "[ngTemplateOutlet]",
  },

  // NgComponentOutlet - dynamic component rendering
  ngComponentOutlet: {
    name: "NgComponentOutlet",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngComponentOutlet", "[ngComponentOutlet]"],
    originalSelector: "[ngComponentOutlet]",
  },
  "[ngComponentOutlet]": {
    name: "NgComponentOutlet",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngComponentOutlet", "[ngComponentOutlet]"],
    originalSelector: "[ngComponentOutlet]",
  },

  // ========== FORMS DIRECTIVES ==========
  // NgModel - two-way data binding (requires FormsModule)
  ngModel: {
    name: "FormsModule",
    importPath: "@angular/forms",
    type: "directive",
    selectors: ["ngModel", "[ngModel]"],
    originalSelector: "[ngModel]",
  },
  "[ngModel]": {
    name: "FormsModule",
    importPath: "@angular/forms",
    type: "directive",
    selectors: ["ngModel", "[ngModel]"],
    originalSelector: "[ngModel]",
  },

  // NgForm (template-driven forms) - requires FormsModule
  ngForm: {
    name: "FormsModule",
    importPath: "@angular/forms",
    type: "directive",
    selectors: ["ngForm", "[ngForm]"],
    originalSelector: "[ngForm]",
  },
  "[ngForm]": {
    name: "FormsModule",
    importPath: "@angular/forms",
    type: "directive",
    selectors: ["ngForm", "[ngForm]"],
    originalSelector: "[ngForm]",
  },

  // NgModelGroup (template-driven nested forms) - requires FormsModule
  ngModelGroup: {
    name: "FormsModule",
    importPath: "@angular/forms",
    type: "directive",
    selectors: ["ngModelGroup", "[ngModelGroup]"],
    originalSelector: "[ngModelGroup]",
  },
  "[ngModelGroup]": {
    name: "FormsModule",
    importPath: "@angular/forms",
    type: "directive",
    selectors: ["ngModelGroup", "[ngModelGroup]"],
    originalSelector: "[ngModelGroup]",
  },

  // FormGroup (reactive forms) - requires ReactiveFormsModule
  formGroup: {
    name: "ReactiveFormsModule",
    importPath: "@angular/forms",
    type: "directive",
    selectors: ["formGroup", "[formGroup]"],
    originalSelector: "[formGroup]",
  },
  "[formGroup]": {
    name: "ReactiveFormsModule",
    importPath: "@angular/forms",
    type: "directive",
    selectors: ["formGroup", "[formGroup]"],
    originalSelector: "[formGroup]",
  },

  // NgPluralCase - individual plural cases
  ngPluralCase: {
    name: "NgPluralCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngPluralCase", "[ngPluralCase]"],
    originalSelector: "[ngPluralCase]",
  },

  "[ngPluralCase]": {
    name: "NgPluralCase",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["ngPluralCase", "[ngPluralCase]"],
    originalSelector: "[ngPluralCase]",
  },

  "[ngPlural]": {
    name: "NgPlural",
    importPath: "@angular/common",
    type: "directive",
    selectors: ["[ngPlural]"],
    originalSelector: "[ngPlural]",
  },

  // ========== BUILT-IN PIPES ==========
  // Text transformation pipes
  uppercase: {
    name: "UpperCasePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["uppercase"],
    originalSelector: "uppercase",
  },
  lowercase: {
    name: "LowerCasePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["lowercase"],
    originalSelector: "lowercase",
  },
  titlecase: {
    name: "TitleCasePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["titlecase"],
    originalSelector: "titlecase",
  },

  // Number formatting pipes
  decimal: {
    name: "DecimalPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["decimal", "number"],
    originalSelector: "decimal",
  },
  number: {
    name: "DecimalPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["decimal", "number"],
    originalSelector: "number",
  },
  percent: {
    name: "PercentPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["percent"],
    originalSelector: "percent",
  },
  currency: {
    name: "CurrencyPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["currency"],
    originalSelector: "currency",
  },

  // Date formatting pipes
  date: {
    name: "DatePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["date"],
    originalSelector: "date",
  },

  // Data manipulation pipes
  slice: {
    name: "SlicePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["slice"],
    originalSelector: "slice",
  },
  json: {
    name: "JsonPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["json"],
    originalSelector: "json",
  },
  keyvalue: {
    name: "KeyValuePipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["keyvalue"],
    originalSelector: "keyvalue",
  },

  // Async pipes
  async: {
    name: "AsyncPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["async"],
    originalSelector: "async",
  },

  // Internationalization pipes
  i18nSelect: {
    name: "I18nSelectPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["i18nSelect"],
    originalSelector: "i18nSelect",
  },
  i18nPlural: {
    name: "I18nPluralPipe",
    importPath: "@angular/common",
    type: "pipe",
    selectors: ["i18nPlural"],
    originalSelector: "i18nPlural",
  },
};
