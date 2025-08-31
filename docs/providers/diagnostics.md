[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/diagnostics

# providers/diagnostics

Angular Auto-Import Diagnostic Provider

## Classes

### DiagnosticProvider

Defined in: [providers/diagnostics.ts:27](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L27)

Provides diagnostics for Angular elements.

#### Constructors

##### Constructor

> **new DiagnosticProvider**(`context`): [`DiagnosticProvider`](#diagnosticprovider)

Defined in: [providers/diagnostics.ts:32](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L32)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`DiagnosticProvider`](#diagnosticprovider)

#### Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="candidatediagnostics"></a> `candidateDiagnostics` | `private` | `Map`\<`string`, `Diagnostic`[]\> | `undefined` | [providers/diagnostics.ts:30](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L30) |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | [providers/diagnostics.ts:32](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L32) |
| <a id="diagnosticcollection"></a> `diagnosticCollection` | `private` | `DiagnosticCollection` | `undefined` | [providers/diagnostics.ts:28](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L28) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | [providers/diagnostics.ts:29](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L29) |

#### Methods

##### \_findPipesInExpression()

> `private` **\_findPipesInExpression**(`expressionText`, `document`, `baseOffset`, `valueOffset`): [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[]

Defined in: [providers/diagnostics.ts:645](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L645)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `expressionText` | `string` |
| `document` | `TextDocument` |
| `baseOffset` | `number` |
| `valueOffset` | `number` |

###### Returns

[`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[]

##### activate()

> **activate**(): `void`

Defined in: [providers/diagnostics.ts:39](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L39)

Activates the diagnostic provider.

###### Returns

`void`

##### checkElement()

> `private` **checkElement**(`element`, `indexer`, `tsDocument`, `severity`): `Promise`\<`Diagnostic`[]\>

Defined in: [providers/diagnostics.ts:508](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L508)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |
| `tsDocument` | `TextDocument` |
| `severity` | `DiagnosticSeverity` |

###### Returns

`Promise`\<`Diagnostic`[]\>

##### createMissingImportDiagnostic()

> `private` **createMissingImportDiagnostic**(`element`, `candidate`, `specificSelector`, `severity`): `Diagnostic`

Defined in: [providers/diagnostics.ts:572](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L572)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `specificSelector` | `string` |
| `severity` | `DiagnosticSeverity` |

###### Returns

`Diagnostic`

##### deactivate()

> **deactivate**(): `void`

Defined in: [providers/diagnostics.ts:103](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L103)

Deactivates the diagnostic provider.

###### Returns

`void`

##### extractInlineTemplate()

> `private` **extractInlineTemplate**(`document`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:613](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L613)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### forceUpdateDiagnosticsForFile()

> **forceUpdateDiagnosticsForFile**(`filePath`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:155](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L155)

Public method to force-update diagnostics for a file.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Defined in: [providers/diagnostics.ts:665](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L665)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

##### getSeverityFromConfig()

> `private` **getSeverityFromConfig**(`severityLevel`): `DiagnosticSeverity`

Defined in: [providers/diagnostics.ts:746](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L746)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `severityLevel` | `string` |

###### Returns

`DiagnosticSeverity`

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/diagnostics.ts:586](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L586)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### getTsDocument()

> `private` **getTsDocument**(`document`, `componentPath`): `Promise`\<`null` \| `TextDocument`\>

Defined in: [providers/diagnostics.ts:688](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L688)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `componentPath` | `string` |

###### Returns

`Promise`\<`null` \| `TextDocument`\>

##### isElementImported()

> `private` **isElementImported**(`document`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:704](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L704)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### parseCompleteTemplate()

> `private` **parseCompleteTemplate**(`text`, `document`, `offset`, `indexer`): `Promise`\<`ParsedHtmlFullElement`[]\>

Defined in: [providers/diagnostics.ts:265](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L265)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |
| `document` | `TextDocument` |
| `offset` | `number` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |

###### Returns

`Promise`\<`ParsedHtmlFullElement`[]\>

##### publishFilteredDiagnostics()

> `private` **publishFilteredDiagnostics**(`uri`): `void`

Defined in: [providers/diagnostics.ts:759](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L759)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `uri` | `Uri` |

###### Returns

`void`

##### runDiagnostics()

> `private` **runDiagnostics**(`templateText`, `document`, `offset`, `componentPath`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:221](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L221)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `templateText` | `string` |
| `document` | `TextDocument` |
| `offset` | `number` |
| `componentPath` | `string` |

###### Returns

`Promise`\<`void`\>

##### updateDiagnostics()

> `private` **updateDiagnostics**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:196](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L196)

Updates diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### updateRelatedHtmlDiagnostics()

> `private` **updateRelatedHtmlDiagnostics**(`tsDocument`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:115](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L115)

Updates diagnostics for related HTML files when a TypeScript file changes.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tsDocument` | `TextDocument` |

###### Returns

`Promise`\<`void`\>
