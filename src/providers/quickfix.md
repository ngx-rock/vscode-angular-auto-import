# QuickFix Import Provider (`QuickfixImportProvider`)

The `QuickfixImportProvider` class implements VS Code's `CodeActionProvider` interface to provide "light bulb" quick fix actions for importing missing Angular components, directives, and pipes when diagnostics are detected in HTML templates.

## Overview

This provider integrates with VS Code's diagnostic system to offer automatic import suggestions for unresolved Angular elements. It works in conjunction with the extension's diagnostic provider to create a seamless import experience.

## Architecture

### Core Components

- **Provider Class**: `QuickfixImportProvider` implements `vscode.CodeActionProvider`
- **Dependencies**: 
  - `AngularIndexer` service for element lookup
  - `getAngularElementAsync` utility for element resolution
  - `ProviderContext` for multi-project support

### Integration Points

```typescript
// Registration in extension.ts
const quickfixProvider = vscode.languages.registerCodeActionsProvider(
  { scheme: 'file', language: 'html' },
  new QuickfixImportProvider(context),
  { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
);
```

## Workflow

### 1. Activation Trigger
VS Code invokes `provideCodeActions()` when:
- User cursor is positioned on a line with diagnostics
- User explicitly requests code actions (Ctrl+. / Cmd+.)
- Quick fix menu is opened

### 2. Diagnostic Processing
```typescript
// Filter diagnostics that intersect with the current range
const diagnosticsToFix = context.diagnostics.filter(
  diagnostic => diagnostic.range.intersection(range)
);
```

### 3. Diagnostic Validation
The provider only processes diagnostics from its own source:
```typescript
private isFixableDiagnostic(diagnostic: vscode.Diagnostic): boolean {
  return diagnostic.source === "angular-auto-import";
}
```

### 4. Element Resolution
For each valid diagnostic:
1. Extract selector from diagnostic code (format: `"type:selector"`)
2. Query `AngularIndexer` using `getAngularElementAsync()`
3. Return matching `AngularElementData` if found

### 5. Code Action Creation
Generate `vscode.CodeAction` with:
- **Title**: Descriptive text with appropriate icons
- **Command**: `angular-auto-import.importElement`
- **Arguments**: The resolved `AngularElementData`
- **Diagnostics**: Associated diagnostic for fixing

## Implementation Details

### Diagnostic Code Format
```typescript
// Diagnostic code structure
const diagnosticCode = `${type}:${selector}:${base64EncodedData}`;

// Example
"component:my-component:eyJ0eXBlIjoiY29tcG9uZW50In0="
```

### Action Title Generation
```typescript
private createCodeAction(element: AngularElementData): vscode.CodeAction {
  const isModule = element.name.endsWith("Module");
  
  let title: string;
  if (isModule) {
    title = `⟐ Import ${element.name}`;
  } else if (element.isStandalone) {
    title = `⟐ Import ${element.name} (standalone)`;
  } else if (element.exportingModuleName) {
    title = `⟐ Import ${element.name} (via ${element.exportingModuleName})`;
  } else {
    title = `⟐ Import ${element.name}`;
  }
  
  return action;
}
```

### Deduplication Strategy
Actions are deduplicated based on command and arguments:
```typescript
const key = `${cmd}:${JSON.stringify(args)}`;
```

Preferred actions take priority during deduplication.

## Multi-Project Support

The provider supports multiple Angular projects in a workspace:

```typescript
private getProjectContextForDocument(document: vscode.TextDocument) {
  for (const [projectPath, indexer] of this.context.projectIndexers) {
    if (document.uri.fsPath.startsWith(projectPath)) {
      return { indexer, projectRootPath: projectPath, tsConfig };
    }
  }
  return null;
}
```

## Error Handling

### Graceful Degradation
- Returns empty array on any critical error
- Logs errors for debugging without breaking functionality
- Handles cancellation tokens appropriately

### Error Scenarios
- Invalid diagnostic format
- Missing project context
- Indexer lookup failures
- Malformed element data

## Performance Considerations

### Optimization Strategies
1. **Early Returns**: Quick validation checks before expensive operations
2. **Cancellation Support**: Respects `CancellationToken` for long-running operations
3. **Efficient Filtering**: Only processes relevant diagnostics
4. **Deduplication**: Prevents duplicate actions in the UI

### Async Operations
All indexer queries use `async/await` to prevent blocking the UI thread:
```typescript
elementData = (await getAngularElementAsync(selectorToSearch, indexer)) ?? null;
```

## Integration with Command System

The provider creates actions that trigger the import command:
```typescript
action.command = {
  title: `Import ${element.name}`,
  command: "angular-auto-import.importElement",
  arguments: [element],
};
```

This command is handled by the extension's command system to perform the actual import operation.

## Limitations and Dependencies

### Current Limitations
- Only processes diagnostics from the extension's own diagnostic provider
- Relies on accurate diagnostic code format
- Requires successful element indexing for functionality

### Dependencies on Other Components
- **Diagnostic Provider**: Must generate properly formatted diagnostics
- **AngularIndexer**: Must successfully index and store element data
- **Command Handler**: Must properly handle import operations
- **Utility Functions**: Relies on `getAngularElementAsync` for element resolution

## Future Enhancements

### Potential Improvements
1. **Smart Sorting**: Prioritize actions based on usage frequency or proximity
2. **Batch Operations**: Support importing multiple elements simultaneously
3. **Context Awareness**: Consider template context for better suggestions
4. **Performance Metrics**: Add telemetry for optimization insights 