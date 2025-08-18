[**Angular Auto Import Extension API Documentation**](README.md)

***

[Angular Auto Import Extension](README.md) / commands

# commands

VSCode Commands Registration

## Interfaces

### CommandContext

Defined in: [commands/index.ts:30](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/commands/index.ts#L30)

Context object containing shared state and dependencies for extension commands.

 CommandContext

#### Example

```typescript
const commandContext: CommandContext = {
  projectIndexers: new Map(),
  projectTsConfigs: new Map(),
  extensionConfig: getConfiguration()
};
```

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="extensionconfig"></a> `extensionConfig` | [`ExtensionConfig`](config/settings.md#extensionconfig) | Current extension configuration settings | [commands/index.ts:36](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/commands/index.ts#L36) |
| <a id="projectindexers"></a> `projectIndexers` | `Map`\<`string`, [`AngularIndexer`](services/indexer.md#angularindexer)\> | Map of project root paths to their corresponding Angular indexers | [commands/index.ts:32](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/commands/index.ts#L32) |
| <a id="projecttsconfigs"></a> `projectTsConfigs` | `Map`\<`string`, `null` \| [`ProcessedTsConfig`](types/tsconfig.md#processedtsconfig)\> | Map of project root paths to their parsed TypeScript configurations | [commands/index.ts:34](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/commands/index.ts#L34) |

## Functions

### registerCommands()

> **registerCommands**(`context`, `commandContext`): `void`

Defined in: [commands/index.ts:58](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/commands/index.ts#L58)

Registers all extension commands with the VS Code command registry.

This function sets up the following commands:
- `angular-auto-import.reindex`: Re-indexes Angular elements for the current or all projects
- `angular-auto-import.importElement`: Imports a specific Angular element into the current file
- `angular-auto-import.clearCache`: Clears the cached index data for all projects

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The VS Code extension context for managing disposables |
| `commandContext` | [`CommandContext`](#commandcontext) | Shared state and dependencies for commands |

#### Returns

`void`

#### Example

```typescript
export function activate(context: vscode.ExtensionContext) {
  const commandContext = createCommandContext();
  registerCommands(context, commandContext);
}
```
