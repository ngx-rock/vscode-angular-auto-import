/**
 * Standard Angular module exports mapping.
 * Maps standard Angular modules (like CommonModule, FormsModule) to the elements they export.
 * @module
 */

/**
 * Maps standard Angular module names to the elements they export.
 * This is used by the diagnostic provider to check if an element is available
 * when a standard module is imported.
 */
const STANDARD_MODULE_EXPORTS: Record<string, Set<string>> = {
  // CommonModule exports all common directives and pipes
  CommonModule: new Set([
    // Directives
    "NgIf",
    "NgForOf",
    "NgSwitch",
    "NgSwitchCase",
    "NgSwitchDefault",
    "NgClass",
    "NgStyle",
    "NgTemplateOutlet",
    "NgComponentOutlet",
    "NgPlural",
    "NgPluralCase",
    // Pipes
    "DatePipe",
    "UpperCasePipe",
    "LowerCasePipe",
    "TitleCasePipe",
    "DecimalPipe",
    "PercentPipe",
    "CurrencyPipe",
    "SlicePipe",
    "JsonPipe",
    "KeyValuePipe",
    "AsyncPipe",
    "I18nSelectPipe",
    "I18nPluralPipe",
  ]),

  // FormsModule exports template-driven forms directives
  FormsModule: new Set([
    "NgModel",
    "NgModelGroup",
    "NgForm",
    "NgSelectOption",
    "NgControlStatus",
    "NgControlStatusGroup",
  ]),

  // ReactiveFormsModule exports reactive forms directives
  ReactiveFormsModule: new Set([
    "FormControlDirective",
    "FormControlName",
    "FormGroupDirective",
    "FormGroupName",
    "FormArrayName",
    "NgSelectOption",
    "NgControlStatus",
    "NgControlStatusGroup",
  ]),
};

/**
 * Gets the exports of a standard Angular module.
 * @param moduleName The name of the module.
 * @returns A Set of exported element names, or undefined if not a standard module.
 */
export function getStandardModuleExports(moduleName: string): Set<string> | undefined {
  return STANDARD_MODULE_EXPORTS[moduleName];
}
