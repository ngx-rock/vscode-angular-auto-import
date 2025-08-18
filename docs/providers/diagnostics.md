[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/diagnostics

# providers/diagnostics

## Classes

### DiagnosticProvider

Defined in: [providers/diagnostics.ts:25](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L25)

Provides diagnostics for Angular elements.

#### Constructors

##### Constructor

> **new DiagnosticProvider**(`context`): [`DiagnosticProvider`](#diagnosticprovider)

Defined in: [providers/diagnostics.ts:30](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L30)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`DiagnosticProvider`](#diagnosticprovider)

#### Properties

| Property | Modifier | Type | Default value | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="candidatediagnostics"></a> `candidateDiagnostics` | `private` | `Map`\<`string`, `Diagnostic`[]\> | `undefined` | [providers/diagnostics.ts:28](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L28) |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | [providers/diagnostics.ts:30](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L30) |
| <a id="diagnosticcollection"></a> `diagnosticCollection` | `private` | `DiagnosticCollection` | `undefined` | [providers/diagnostics.ts:26](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L26) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | [providers/diagnostics.ts:27](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L27) |

#### Methods

##### \_findPipesInExpression()

> `private` **\_findPipesInExpression**(`expressionText`, `document`, `baseOffset`, `valueOffset`): [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[]

Defined in: [providers/diagnostics.ts:630](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L630)

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

Defined in: [providers/diagnostics.ts:37](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L37)

Activates the diagnostic provider.

###### Returns

`void`

##### checkElement()

> `private` **checkElement**(`element`, `indexer`, `tsDocument`, `severity`): `Promise`\<`Diagnostic`[]\>

Defined in: [providers/diagnostics.ts:493](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L493)

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

Defined in: [providers/diagnostics.ts:557](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L557)

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

Defined in: [providers/diagnostics.ts:99](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L99)

Deactivates the diagnostic provider.

###### Returns

`void`

##### extractInlineTemplate()

> `private` **extractInlineTemplate**(`document`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:598](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L598)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### forceUpdateDiagnosticsForFile()

> **forceUpdateDiagnosticsForFile**(`filePath`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:153](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L153)

Public method to force-update diagnostics for a file.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Defined in: [providers/diagnostics.ts:650](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L650)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

##### getSeverityFromConfig()

> `private` **getSeverityFromConfig**(`severityLevel`): `DiagnosticSeverity`

Defined in: [providers/diagnostics.ts:731](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L731)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `severityLevel` | `string` |

###### Returns

`DiagnosticSeverity`

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/diagnostics.ts:571](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L571)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### getTsDocument()

> `private` **getTsDocument**(`document`, `componentPath`): `Promise`\<`null` \| `TextDocument`\>

Defined in: [providers/diagnostics.ts:673](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L673)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `componentPath` | `string` |

###### Returns

`Promise`\<`null` \| `TextDocument`\>

##### isElementImported()

> `private` **isElementImported**(`document`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:689](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L689)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### parseCompleteTemplate()

> `private` **parseCompleteTemplate**(`text`, `document`, `offset`, `indexer`): `Promise`\<`ParsedHtmlFullElement`[]\>

Defined in: [providers/diagnostics.ts:253](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L253)

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

Defined in: [providers/diagnostics.ts:744](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L744)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `uri` | `Uri` |

###### Returns

`void`

##### runDiagnostics()

> `private` **runDiagnostics**(`templateText`, `document`, `offset`, `componentPath`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:219](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L219)

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

Defined in: [providers/diagnostics.ts:194](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L194)

Updates diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### updateRelatedHtmlDiagnostics()

> `private` **updateRelatedHtmlDiagnostics**(`tsDocument`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:109](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L109)

Updates diagnostics for related HTML files when a TypeScript file changes.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tsDocument` | `TextDocument` |

###### Returns

`Promise`\<`void`\>
