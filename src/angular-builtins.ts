// Defines a list of common built-in Angular directives and pipes
// that are often used as standalone imports in components.

interface BuiltInAngularElement {
  className: string;
  sourcePackage: string;
  type: 'directive' | 'pipe';
  templateMatcher?: RegExp; // To match how it's used in templates for QuickFix
}

export const BUILTIN_ANGULAR_ELEMENTS_MAP: Record<string, BuiltInAngularElement> = {
  // Common Directives from @angular/common
  'NgIf': { className: 'NgIf', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /\*ngIf|ngIf/i },
  'NgForOf': { className: 'NgForOf', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /\*ngFor|ngFor|ngForOf/i }, // ngForOf for property binding
  'NgClass': { className: 'NgClass', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /ngClass/i },
  'NgStyle': { className: 'NgStyle', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /ngStyle/i },
  'NgSwitch': { className: 'NgSwitch', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /ngSwitch/i },
  'NgSwitchCase': { className: 'NgSwitchCase', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /ngSwitchCase/i },
  'NgSwitchDefault': { className: 'NgSwitchDefault', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /ngSwitchDefault/i },
  'NgTemplateOutlet': { className: 'NgTemplateOutlet', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /ngTemplateOutlet/i },
  'NgComponentOutlet': { className: 'NgComponentOutlet', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /ngComponentOutlet/i },
  'NgOptimizedImage': { className: 'NgOptimizedImage', sourcePackage: '@angular/common', type: 'directive', templateMatcher: /NgOptimizedImage|ngSrc/i }, // ngSrc is an attribute

  // Common Pipes from @angular/common
  'AsyncPipe': { className: 'AsyncPipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /async/i },
  'CurrencyPipe': { className: 'CurrencyPipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /currency/i },
  'DatePipe': { className: 'DatePipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /date/i },
  'DecimalPipe': { className: 'DecimalPipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /number/i }, // 'number' is the pipe alias
  'I18nPluralPipe': { className: 'I18nPluralPipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /i18nPlural/i },
  'I18nSelectPipe': { className: 'I18nSelectPipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /i18nSelect/i },
  'JsonPipe': { className: 'JsonPipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /json/i },
  'KeyValuePipe': { className: 'KeyValuePipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /keyvalue/i },
  'LowerCasePipe': { className: 'LowerCasePipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /lowercase/i },
  'PercentPipe': { className: 'PercentPipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /percent/i },
  'SlicePipe': { className: 'SlicePipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /slice/i },
  'UpperCasePipe': { className: 'UpperCasePipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /uppercase/i },
  'TitleCasePipe': { className: 'TitleCasePipe', sourcePackage: '@angular/common', type: 'pipe', templateMatcher: /titlecase/i },
} as const;


// This can be used by providers to iterate and match
export const BUILTIN_ANGULAR_ELEMENT_LIST: readonly BuiltInAngularElement[] = Object.values(BUILTIN_ANGULAR_ELEMENTS_MAP);

// Example usage for QuickFix:
// User writes `*ngIf="condition"`, diagnostic identifies `*ngIf`.
// Search `BUILTIN_ANGULAR_ELEMENT_LIST` where `templateMatcher` matches `*ngIf`.
// Found: `NgIf` element.
// Check if component is standalone. If yes, offer to import `NgIf` from `@angular/common`.

// Example usage for Completion:
// User types `*ngI` in a standalone component template.
// Filter `BUILTIN_ANGULAR_ELEMENT_LIST` for directives. `NgIf` matches.
// Offer completion for `*ngIf`. On accept, import `NgIf` from `@angular/common`.
// User types `value | asy`
// Filter `BUILTIN_ANGULAR_ELEMENT_LIST` for pipes. `AsyncPipe` matches.
// Offer completion for `async`. On accept, import `AsyncPipe` from `@angular/common`.

// Renamed from BUILTIN_ANGULAR_STANDALONE_ELEMENTS to BUILTIN_ANGULAR_ELEMENTS_MAP for clarity
// and added BUILTIN_ANGULAR_ELEMENT_LIST for easier iteration.
