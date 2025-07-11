# Diagnostic Provider (`DiagnosticProvider`)

## Overview

The `DiagnosticProvider` generates custom error and warning diagnostics displayed as wavy underlines in VS Code. Its main purpose is identifying missing Angular element imports that the standard Angular Language Service cannot detect.

## Core Workflow

1. **Template Parsing**: Uses `@angular/compiler` to parse HTML templates and extract all elements, attributes, and pipes
2. **Element Classification**: Categorizes findings as components, directives, pipes, structural directives, etc.
3. **Selector Matching**: Uses Angular's `SelectorMatcher` and `CssSelector` to precisely match template elements against indexed Angular elements
4. **Import Verification**: Analyzes TypeScript component files with `ts-morph` to check if elements are imported in `@Component({ imports: [...] })`
5. **Diagnostic Generation**: Creates `vscode.Diagnostic` objects with specific error codes for unimported but available elements

## Key Architecture

### Selector Matching System

```typescript
const { CssSelector, SelectorMatcher } = await import("@angular/compiler");
const matcher = new SelectorMatcher();
const individualSelectors = CssSelector.parse(candidate.originalSelector);
matcher.addSelectables(individualSelectors);

const templateCssSelector = new CssSelector();
templateCssSelector.setElement(element.tagName);
for (const attr of element.attributes) {
  templateCssSelector.addAttribute(attr.name, attr.value ?? "");
}

matcher.match(templateCssSelector, () => { isMatch = true; });
```

This system handles complex selectors like `ng-template[myDirective]` by checking both tag names and attributes.

### Element Types

- **`component`**: Custom Angular components (`<my-component>`)
- **`pipe`**: Angular pipes (`{{ value | myPipe }}`)
- **`structural-directive`**: Structural directives (`*ngIf`, `*myDirective`)
- **`property-binding`**: Property bindings (`[myProperty]`)
- **`template-reference`**: Template variables (`#myRef`)

### Diagnostic Structure

```typescript
const diagnostic = new vscode.Diagnostic(element.range, message, severity);
diagnostic.code = `missing-${candidate.type}-import:${candidate.name}`;
diagnostic.source = "angular-auto-import";
```

## Integration Points

- **QuickFix Provider**: Diagnostic codes trigger auto-import suggestions
- **Angular Indexer**: Provides project-wide element discovery
- **Deduplication**: Filters out diagnostics that overlap with Angular Language Service errors

## Key Innovation

Unlike syntax-based linters, this provider has complete project awareness through the `AngularIndexer`, enabling detection of import-related issues for components that exist elsewhere in the project. 