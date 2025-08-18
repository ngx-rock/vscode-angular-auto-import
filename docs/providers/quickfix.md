[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/quickfix

# providers/quickfix

Angular Auto-Import QuickFix Provider

## Classes

### QuickfixImportProvider

Defined in: [providers/quickfix.ts:19](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L19)

Provides QuickFix actions for Angular elements.

#### Implements

- `CodeActionProvider`

#### Constructors

##### Constructor

> **new QuickfixImportProvider**(`context`): [`QuickfixImportProvider`](#quickfiximportprovider)

Defined in: [providers/quickfix.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L22)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`QuickfixImportProvider`](#quickfiximportprovider)

#### Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | [providers/quickfix.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L22) |
| <a id="providedcodeactionkinds"></a> `providedCodeActionKinds` | `readonly` | `CodeActionKind`[] | [providers/quickfix.ts:20](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L20) |

#### Methods

##### createCodeAction()

> `private` **createCodeAction**(`element`, `diagnostic`): `null` \| `CodeAction`

Defined in: [providers/quickfix.ts:156](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L156)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `diagnostic` | `Diagnostic` |

###### Returns

`null` \| `CodeAction`

##### createQuickFixesForDiagnostic()

> `private` **createQuickFixesForDiagnostic**(`diagnostic`, `indexer`): `Promise`\<`CodeAction`[]\>

Defined in: [providers/quickfix.ts:121](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L121)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `diagnostic` | `Diagnostic` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |

###### Returns

`Promise`\<`CodeAction`[]\>

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): `null` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `undefined` \| `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

Defined in: [providers/quickfix.ts:189](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L189)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`null` \| \{ `indexer`: [`AngularIndexer`](../services/indexer.md#angularindexer); `projectRootPath`: `string`; `tsConfig`: `undefined` \| `null` \| [`ProcessedTsConfig`](../types/tsconfig.md#processedtsconfig); \}

##### isFixableDiagnostic()

> `private` **isFixableDiagnostic**(`diagnostic`): `boolean`

Defined in: [providers/quickfix.ts:116](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L116)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `diagnostic` | `Diagnostic` |

###### Returns

`boolean`

##### provideCodeActions()

> **provideCodeActions**(`document`, `range`, `context`, `token`): `Promise`\<(`Command` \| `CodeAction`)[]\>

Defined in: [providers/quickfix.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/quickfix.ts#L24)

Get code actions for a given range in a document.

Only return code actions that are relevant to user for the requested range. Also keep in mind how the
returned code actions will appear in the UI. The lightbulb widget and `Refactor` commands for instance show
returned code actions as a list, so do not return a large number of code actions that will overwhelm the user.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `document` | `TextDocument` | The document in which the command was invoked. |
| `range` | `Range` \| `Selection` | The selector or range for which the command was invoked. This will always be a Selection selection if the actions are being requested in the currently active editor. |
| `context` | `CodeActionContext` | Provides additional information about what code actions are being requested. You can use this to see what specific type of code actions are being requested by the editor in order to return more relevant actions and avoid returning irrelevant code actions that the editor will discard. |
| `token` | `CancellationToken` | A cancellation token. |

###### Returns

`Promise`\<(`Command` \| `CodeAction`)[]\>

An array of code actions, such as quick fixes or refactorings. The lack of a result can be signaled
by returning `undefined`, `null`, or an empty array.

We also support returning `Command` for legacy reasons, however all new extensions should return
`CodeAction` object instead.

###### Implementation of

`vscode.CodeActionProvider.provideCodeActions`
