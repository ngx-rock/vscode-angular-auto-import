[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/definition

# providers/definition

Angular Auto-Import Definition Provider

Provides "Go to Definition" (Ctrl+Click) functionality for Angular elements
highlighted by diagnostics but not yet imported.

## Classes

### DefinitionProvider

Defined in: [providers/definition.ts:28](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L28)

Provides definition links for unimported Angular elements.

This provider only responds when:
1. The position has a diagnostic from angular-auto-import
2. The element is not yet imported (identified by diagnostic presence)

This strategy prevents conflicts with Angular Language Service,
which handles already-imported elements.

#### Implements

- `DefinitionProvider`

#### Constructors

##### Constructor

> **new DefinitionProvider**(`context`): [`DefinitionProvider`](#definitionprovider)

Defined in: [providers/definition.ts:29](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L29)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`DefinitionProvider`](#definitionprovider)

#### Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | [providers/definition.ts:29](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L29) |

#### Methods

##### buildLocationLinks()

> `private` **buildLocationLinks**(`matches`, `originRange`, `document`): `LocationLink`[]

Defined in: [providers/definition.ts:157](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L157)

Builds LocationLink objects for all matching elements.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `matches` | [`AngularElementData`](../types/angular.md#angularelementdata)[] | Array of matching Angular elements |
| `originRange` | `Range` | The range in the source document |
| `document` | `TextDocument` | The source document |

###### Returns

`LocationLink`[]

Array of LocationLink objects

##### extractSelectorFromDiagnostic()

> `private` **extractSelectorFromDiagnostic**(`diagnostic`): `undefined` \| `string`

Defined in: [providers/definition.ts:124](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L124)

Extracts the selector from a diagnostic code.

Diagnostic code format: "missing-{type}-import:{selector}"

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `diagnostic` | `Diagnostic` | The diagnostic to extract from |

###### Returns

`undefined` \| `string`

The selector string or undefined

##### findMatchingElements()

> `private` **findMatchingElements**(`document`, `selector`): [`AngularElementData`](../types/angular.md#angularelementdata)[]

Defined in: [providers/definition.ts:140](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L140)

Finds all Angular elements matching the given selector.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document context |
| `selector` | `string` | The selector to search for |

###### Returns

[`AngularElementData`](../types/angular.md#angularelementdata)[]

Array of matching Angular elements

##### getDiagnosticAtPosition()

> `private` **getDiagnosticAtPosition**(`document`, `position`): `undefined` \| `Diagnostic`

Defined in: [providers/definition.ts:93](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L93)

Gets the angular-auto-import diagnostic at the given position.

Checks both VS Code's diagnostic collection and internal diagnostics
(for quickfix-only mode).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document to check |
| `position` | `Position` | The position to check |

###### Returns

`undefined` \| `Diagnostic`

The diagnostic if found, undefined otherwise

##### getElementLocation()

> `private` **getElementLocation**(`element`, `projectRootPath`): `undefined` \| `Location`

Defined in: [providers/definition.ts:194](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L194)

Gets the location of an Angular element in its source file.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) | The Angular element to locate |
| `projectRootPath` | `string` | The project root path |

###### Returns

`undefined` \| `Location`

Location object or undefined if not found

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `null` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `undefined` \| `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Defined in: [providers/definition.ts:335](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L335)

Gets the project context for a document.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document to get context for |

###### Returns

`null` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `undefined` \| `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Project context or null

##### provideDefinition()

> **provideDefinition**(`document`, `position`, `token`): `ProviderResult`\<`Definition` \| `LocationLink`[]\>

Defined in: [providers/definition.ts:39](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L39)

Provides definition information for the given position.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document in which the command was invoked |
| `position` | `Position` | The position at which the command was invoked |
| `token` | `CancellationToken` | A cancellation token |

###### Returns

`ProviderResult`\<`Definition` \| `LocationLink`[]\>

Definition locations or undefined if not applicable

###### Implementation of

`vscode.DefinitionProvider.provideDefinition`

##### resolveExternalPath()

> `private` **resolveExternalPath**(`importPath`, `projectRootPath`): `undefined` \| `string`

Defined in: [providers/definition.ts:292](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/definition.ts#L292)

Resolves the path for an external library element.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `importPath` | `string` | The import path (e.g., "@angular/material/button") |
| `projectRootPath` | `string` | The project root path |

###### Returns

`undefined` \| `string`

Absolute file path or undefined
