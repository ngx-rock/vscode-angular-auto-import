[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/diagnostics

# providers/diagnostics

Angular Auto-Import Diagnostic Provider

## Classes

### DiagnosticProvider

Defined in: [providers/diagnostics.ts:101](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L101)

Provides diagnostics for Angular templates.

#### Constructors

##### Constructor

> **new DiagnosticProvider**(`context`): [`DiagnosticProvider`](#diagnosticprovider)

Defined in: [providers/diagnostics.ts:116](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L116)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`ProviderContext`](../providers.md#providercontext) |

###### Returns

[`DiagnosticProvider`](#diagnosticprovider)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="candidatediagnostics"></a> `candidateDiagnostics` | `private` | `Map`\<`string`, `Diagnostic`[]\> | `undefined` | - | [providers/diagnostics.ts:104](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L104) |
| <a id="compiler"></a> `compiler` | `private` | `any` | `null` | - | [providers/diagnostics.ts:107](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L107) |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | - | [providers/diagnostics.ts:116](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L116) |
| <a id="diagnosticcollection"></a> `diagnosticCollection` | `private` | `DiagnosticCollection` | `undefined` | - | [providers/diagnostics.ts:102](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L102) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | - | [providers/diagnostics.ts:103](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L103) |
| <a id="importedelementscache"></a> `importedElementsCache` | `private` | `Map`\<`string`, `Map`\<`string`, `boolean`\>\> | `undefined` | Cache for storing whether a specific Angular element (component, directive, pipe) is imported in a given TypeScript component file. Key: path to the TypeScript component file. Value: Map where key is the Angular element name (e.g., 'MyComponent') and value is a boolean indicating if it's imported. | [providers/diagnostics.ts:113](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L113) |
| <a id="ispublishing"></a> `isPublishing` | `private` | `boolean` | `false` | - | [providers/diagnostics.ts:114](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L114) |
| <a id="templatecache"></a> `templateCache` | `private` | `Map`\<`string`, \{ `nodes`: `unknown`[]; `version`: `number`; \}\> | `undefined` | - | [providers/diagnostics.ts:105](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L105) |

#### Methods

##### \_findPipesInExpression()

> `private` **\_findPipesInExpression**(`expressionText`, `document`, `baseOffset`, `valueOffset`): [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[]

Defined in: [providers/diagnostics.ts:956](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L956)

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

Defined in: [providers/diagnostics.ts:124](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L124)

Activates the diagnostic provider.

###### Returns

`void`

##### addAngularElementsToList()

> `private` **addAngularElementsToList**(`node`, `nodeName`, `foundElements`, `elements`, `document`, `offset`, `attributes`): `void`

Defined in: [providers/diagnostics.ts:1436](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1436)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TmplAstElement`](../types/template-ast.md#tmplastelement) \| [`TmplAstTemplate`](../types/template-ast.md#tmplasttemplate) |
| `nodeName` | `string` |
| `foundElements` | [`AngularElementData`](../types/angular.md#angularelementdata)[] |
| `elements` | [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[] |
| `document` | `TextDocument` |
| `offset` | `number` |
| `attributes` | `object`[] |

###### Returns

`void`

##### candidateNameMatchesSelector()

> `private` **candidateNameMatchesSelector**(`selectorName`, `candidateName`): `boolean`

Defined in: [providers/diagnostics.ts:782](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L782)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `selectorName` | `string` |
| `candidateName` | `string` |

###### Returns

`boolean`

##### checkClassImportsForElement()

> `private` **checkClassImportsForElement**(`classDeclaration`, `element`, `indexer`): `boolean`

Defined in: [providers/diagnostics.ts:1110](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1110)

Checks if a class declaration imports an element via its module imports.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |

###### Returns

`boolean`

##### checkDirectElementImport()

> `private` **checkDirectElementImport**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:1053](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1053)

Checks if element is directly imported in the Component imports array.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### checkElement()

> `private` **checkElement**(`element`, `indexer`, `severity`, `sourceFile`, `CssSelector`, `SelectorMatcher`): `Promise`\<`Diagnostic`[]\>

Defined in: [providers/diagnostics.ts:603](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L603)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |
| `severity` | `DiagnosticSeverity` |
| `sourceFile` | `SourceFile` |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`Promise`\<`Diagnostic`[]\>

##### checkExternalModuleImports()

> `private` **checkExternalModuleImports**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:1079](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1079)

Checks if element is imported via external modules.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### checkKnownHtmlTagWithAttributes()

> `private` **checkKnownHtmlTagWithAttributes**(`_node`, `nodeName`, `regularAttrs`, `attributes`, `processingCtx`, `docCtx`): `void`

Defined in: [providers/diagnostics.ts:1379](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1379)

Checks if a known HTML tag (like button, input, a) has Angular directives
by searching for compound selectors like "button[mat-button]", "input[matInput]".

Note: This method is specifically for directives that use compound selectors
(e.g., "button[mat-button]"). Regular attribute directives are handled by
processAttributes() which already creates diagnostics with correct attribute positions.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `_node` | [`TmplAstElement`](../types/template-ast.md#tmplastelement) \| [`TmplAstTemplate`](../types/template-ast.md#tmplasttemplate) |
| `nodeName` | `string` |
| `regularAttrs` | `unknown`[] |
| `attributes` | `object`[] |
| `processingCtx` | `ProcessingContext` |
| `docCtx` | `TemplateDocumentContext` |

###### Returns

`void`

##### checkModuleExportsForElement()

> `private` **checkModuleExportsForElement**(`moduleName`, `element`, `indexer`): `boolean`

Defined in: [providers/diagnostics.ts:1136](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1136)

Checks if a module exports a specific element.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `moduleName` | `string` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |

###### Returns

`boolean`

##### clearDiagnostics()

> `private` **clearDiagnostics**(`document`): `void`

Defined in: [providers/diagnostics.ts:339](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L339)

Clears diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`void`

##### clearDiagnosticsForNoTemplate()

> `private` **clearDiagnosticsForNoTemplate**(`document`): `void`

Defined in: [providers/diagnostics.ts:424](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L424)

Clears diagnostics when no template is found.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`void`

##### createMissingImportDiagnostic()

> `private` **createMissingImportDiagnostic**(`element`, `candidate`, `specificSelector`, `severity`): `Diagnostic`

Defined in: [providers/diagnostics.ts:833](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L833)

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

Defined in: [providers/diagnostics.ts:191](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L191)

Deactivates the diagnostic provider.

###### Returns

`void`

##### extractInlineTemplate()

> `private` **extractInlineTemplate**(`_document`, `sourceFile`): \{ `template`: `string`; `templateOffset`: `number`; \} \| `null`

Defined in: [providers/diagnostics.ts:874](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L874)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `_document` | `TextDocument` |
| `sourceFile` | `SourceFile` |

###### Returns

\{ `template`: `string`; `templateOffset`: `number`; \} \| `null`

##### extractTemplateFromClass()

> `private` **extractTemplateFromClass**(`classDeclaration`): \{ `template`: `string`; `templateOffset`: `number`; \} \| `null`

Defined in: [providers/diagnostics.ts:890](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L890)

Extracts template from a class declaration.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |

###### Returns

\{ `template`: `string`; `templateOffset`: `number`; \} \| `null`

##### extractTemplateFromObjectLiteral()

> `private` **extractTemplateFromObjectLiteral**(`objectLiteral`): \{ `template`: `string`; `templateOffset`: `number`; \} \| `null`

Defined in: [providers/diagnostics.ts:926](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L926)

Extracts template from an object literal expression.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `objectLiteral` | `ObjectLiteralExpression` |

###### Returns

\{ `template`: `string`; `templateOffset`: `number`; \} \| `null`

##### forceUpdateDiagnosticsForFile()

> **forceUpdateDiagnosticsForFile**(`filePath`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:277](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L277)

Public method to force-update diagnostics for a file.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### getComponentDecoratorObjectLiteral()

> `private` **getComponentDecoratorObjectLiteral**(`componentDecorator`): `ObjectLiteralExpression` \| `null`

Defined in: [providers/diagnostics.ts:909](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L909)

Gets the object literal from a Component decorator.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `componentDecorator` | `Decorator` |

###### Returns

`ObjectLiteralExpression` \| `null`

##### getComponentImportsArray()

> `private` **getComponentImportsArray**(`classDeclaration`): `ArrayLiteralExpression` \| `undefined`

Defined in: [providers/diagnostics.ts:1028](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1028)

Gets the imports array from a Component decorator.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |

###### Returns

`ArrayLiteralExpression` \| `undefined`

##### getDiagnosticsForDocument()

> **getDiagnosticsForDocument**(`uri`): `Diagnostic`[]

Defined in: [providers/diagnostics.ts:253](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L253)

Gets diagnostics for a document from internal storage.
This works in all modes including 'quickfix-only'.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `uri` | `Uri` | The document URI |

###### Returns

`Diagnostic`[]

Array of diagnostics for the document

##### getImportFromCache()

> `private` **getImportFromCache**(`cacheKey`, `elementName`): `boolean` \| `undefined`

Defined in: [providers/diagnostics.ts:1008](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1008)

Gets import status from cache.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cacheKey` | `string` |
| `elementName` | `string` |

###### Returns

`boolean` \| `undefined`

##### getIndexerForSourceFile()

> `private` **getIndexerForSourceFile**(`sourceFile`): [`AngularIndexer`](../services/indexer.md#angularindexer) \| `undefined`

Defined in: [providers/diagnostics.ts:1097](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1097)

Gets the indexer for a source file's workspace.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |

###### Returns

[`AngularIndexer`](../services/indexer.md#angularindexer) \| `undefined`

##### getMatchedSelectors()

> `private` **getMatchedSelectors**(`element`, `candidate`, `CssSelector`, `SelectorMatcher`): `string`[]

Defined in: [providers/diagnostics.ts:807](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L807)

Gets matched selectors for an element and candidate.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`string`[]

##### getProjectContextForDocument()

> `private` **getProjectContextForDocument**(`document`): [`ProjectContext`](../types/angular.md#projectcontext) \| `undefined`

Defined in: [providers/diagnostics.ts:976](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L976)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

[`ProjectContext`](../types/angular.md#projectcontext) \| `undefined`

##### getSeverityFromConfig()

> `private` **getSeverityFromConfig**(`severityLevel`): `DiagnosticSeverity`

Defined in: [providers/diagnostics.ts:1598](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1598)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `severityLevel` | `string` |

###### Returns

`DiagnosticSeverity`

##### getSourceFile()

> `private` **getSourceFile**(`document`): `SourceFile` \| `undefined`

Defined in: [providers/diagnostics.ts:847](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L847)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`SourceFile` \| `undefined`

##### getSourceFileWithLogging()

> `private` **getSourceFileWithLogging**(`document`): `SourceFile` \| `undefined`

Defined in: [providers/diagnostics.ts:347](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L347)

Gets source file and logs if not found.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`SourceFile` \| `undefined`

##### hasChildren()

> `private` **hasChildren**(`node`): `boolean`

Defined in: [providers/diagnostics.ts:1593](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1593)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | `unknown` |

###### Returns

`boolean`

##### hasImportedAlternativeMatch()

> `private` **hasImportedAlternativeMatch**(`element`, `candidate`, `indexer`, `sourceFile`, `CssSelector`, `SelectorMatcher`): `boolean`

Defined in: [providers/diagnostics.ts:748](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L748)

Suppresses false positives when one template token matches multiple Angular elements
but at least one of those matches is already imported.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |
| `sourceFile` | `SourceFile` |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`boolean`

##### isControlFlowNode()

> `private` **isControlFlowNode**(`node`): `boolean`

Defined in: [providers/diagnostics.ts:1204](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1204)

Detects control flow nodes using duck typing instead of constructor name matching.
This is more robust than `node.constructor.name` which can break when bundled with esbuild.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TemplateAstNode`](../types/template-ast.md#templateastnode) |

###### Returns

`boolean`

##### isElementImported()

> `private` **isElementImported**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:980](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L980)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### isValidTemplateInitializer()

> `private` **isValidTemplateInitializer**(`initializer`): initializer is StringLiteral \| NoSubstitutionTemplateLiteral

Defined in: [providers/diagnostics.ts:947](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L947)

Checks if an initializer is a valid template initializer.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `initializer` | `Node`\<`Node`\> \| `undefined` |

###### Returns

initializer is StringLiteral \| NoSubstitutionTemplateLiteral

##### loadCompiler()

> `private` **loadCompiler**(): `void`

Defined in: [providers/diagnostics.ts:1638](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1638)

###### Returns

`void`

##### logOperationDuration()

> `private` **logOperationDuration**(`operation`, `identifier`, `startTime`): `void`

Defined in: [providers/diagnostics.ts:436](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L436)

Logs the duration of an operation.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `operation` | `string` |
| `identifier` | `string` |
| `startTime` | `bigint` |

###### Returns

`void`

##### normalizeCandidateName()

> `private` **normalizeCandidateName**(`candidateName`): `string`

Defined in: [providers/diagnostics.ts:797](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L797)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `candidateName` | `string` |

###### Returns

`string`

##### normalizeSelectorForNameMatch()

> `private` **normalizeSelectorForNameMatch**(`selectorName`): `string`

Defined in: [providers/diagnostics.ts:793](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L793)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `selectorName` | `string` |

###### Returns

`string`

##### parseCompleteTemplate()

> `private` **parseCompleteTemplate**(`text`, `document`, `offset`, `indexer`): `ParsedHtmlFullElement`[]

Defined in: [providers/diagnostics.ts:486](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L486)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `text` | `string` |
| `document` | `TextDocument` |
| `offset` | `number` |
| `indexer` | [`AngularIndexer`](../services/indexer.md#angularindexer) |

###### Returns

`ParsedHtmlFullElement`[]

##### processAttributes()

> `private` **processAttributes**(`regularAttrs`, `templateAttrs`, `nodeName`, `attributes`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1477](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1477)

Processes attributes from element or template nodes

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `regularAttrs` | `unknown`[] | Regular attributes array |
| `templateAttrs` | `unknown`[] | Template attributes array |
| `nodeName` | `string` | Name of the node |
| `attributes` | `object`[] | Parsed attributes array |
| `processingCtx` | `ProcessingContext` | Processing context |
| `docCtx` | `TemplateDocumentContext` | Document context |
| `astCtors` | `AstConstructors` | AST constructors |

###### Returns

`void`

##### processBoundTextNode()

> `private` **processBoundTextNode**(`node`, `elements`, `document`, `offset`, `text`): `void`

Defined in: [providers/diagnostics.ts:1572](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1572)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`TmplAstBoundText`](../types/template-ast.md#tmplastboundtext) |
| `elements` | [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[] |
| `document` | `TextDocument` |
| `offset` | `number` |
| `text` | `string` |

###### Returns

`void`

##### processBranchesArray()

> `private` **processBranchesArray**(`branches`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1259](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1259)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `branches` | `unknown` |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processBranchOrCase()

> `private` **processBranchOrCase**(`item`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1287](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1287)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `item` | \{ `children?`: [`TemplateAstNode`](../types/template-ast.md#templateastnode)[]; `expression?`: `unknown`; \} |
| `item.children?` | [`TemplateAstNode`](../types/template-ast.md#templateastnode)[] |
| `item.expression?` | `unknown` |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processCandidateElement()

> `private` **processCandidateElement**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`, `CssSelector`, `SelectorMatcher`): `Promise`\<`Diagnostic` \| `null`\>

Defined in: [providers/diagnostics.ts:665](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L665)

Processes a single candidate element.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `severity` | `DiagnosticSeverity` |
| `sourceFile` | `SourceFile` |
| `processedCandidates` | `Set`\<`string`\> |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`Promise`\<`Diagnostic` \| `null`\>

##### processCasesArray()

> `private` **processCasesArray**(`cases`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1273](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1273)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cases` | `unknown` |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processControlFlowBranchesAndCases()

> `private` **processControlFlowBranchesAndCases**(`controlFlowNode`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1247](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1247)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlFlowNode` | [`ControlFlowNode`](../types/template-ast.md#controlflownode) |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processControlFlowNode()

> `private` **processControlFlowNode**(`controlFlowNode`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1225](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1225)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlFlowNode` | [`ControlFlowNode`](../types/template-ast.md#controlflownode) |
| `visit` | (`nodesList`) => `void` |
| `extractPipesFromExpression` | (`expression`, `nodeOffset?`) => `void` |

###### Returns

`void`

##### processControlFlowSpecialBlocks()

> `private` **processControlFlowSpecialBlocks**(`controlFlowNode`, `visit`): `void`

Defined in: [providers/diagnostics.ts:1300](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1300)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlFlowNode` | [`ControlFlowNode`](../types/template-ast.md#controlflownode) |
| `visit` | (`nodesList`) => `void` |

###### Returns

`void`

##### processElementOrTemplateNode()

> `private` **processElementOrTemplateNode**(`node`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1326](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1326)

Processes element or template nodes

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `node` | [`TmplAstElement`](../types/template-ast.md#tmplastelement) \| [`TmplAstTemplate`](../types/template-ast.md#tmplasttemplate) | The element or template node |
| `processingCtx` | `ProcessingContext` | Processing context |
| `docCtx` | `TemplateDocumentContext` | Document context |
| `astCtors` | `AstConstructors` | AST constructors |

###### Returns

`void`

##### processHtmlDocument()

> `private` **processHtmlDocument**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:358](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L358)

Processes HTML document diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### processNonPipeCandidate()

> `private` **processNonPipeCandidate**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`, `CssSelector`, `SelectorMatcher`): `Diagnostic` \| `null`

Defined in: [providers/diagnostics.ts:717](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L717)

Processes a non-pipe candidate (component/directive).

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `severity` | `DiagnosticSeverity` |
| `sourceFile` | `SourceFile` |
| `processedCandidates` | `Set`\<`string`\> |
| `CssSelector` | `any` |
| `SelectorMatcher` | `any` |

###### Returns

`Diagnostic` \| `null`

##### processPipeCandidate()

> `private` **processPipeCandidate**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`): `Diagnostic` \| `null`

Defined in: [providers/diagnostics.ts:700](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L700)

Processes a pipe candidate.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `element` | `ParsedHtmlFullElement` |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) |
| `severity` | `DiagnosticSeverity` |
| `sourceFile` | `SourceFile` |
| `processedCandidates` | `Set`\<`string`\> |

###### Returns

`Diagnostic` \| `null`

##### processSingleAttribute()

> `private` **processSingleAttribute**(`attr`, `isTemplateAttr`, `nodeName`, `attributes`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1508](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1508)

Processes a single attribute

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `attr` | `unknown` | The attribute to process |
| `isTemplateAttr` | `boolean` | Whether this is a template attribute |
| `nodeName` | `string` | Name of the node |
| `attributes` | `object`[] | Parsed attributes array |
| `processingCtx` | `ProcessingContext` | Processing context |
| `docCtx` | `TemplateDocumentContext` | Document context |
| `astCtors` | `AstConstructors` | AST constructors |

###### Returns

`void`

##### processTemplateNode()

> `private` **processTemplateNode**(`node`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1173](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1173)

Processes a template AST node

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `node` | [`TemplateAstNode`](../types/template-ast.md#templateastnode) | The template node to process |
| `processingCtx` | `ProcessingContext` | Processing context with callbacks and data structures |
| `docCtx` | `TemplateDocumentContext` | Document context for parsing |
| `astCtors` | `AstConstructors` | AST node constructors |

###### Returns

`void`

##### processTypescriptDocument()

> `private` **processTypescriptDocument**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:389](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L389)

Processes TypeScript document diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### publishFilteredDiagnostics()

> `private` **publishFilteredDiagnostics**(`uri`): `void`

Defined in: [providers/diagnostics.ts:1611](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1611)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `uri` | `Uri` |

###### Returns

`void`

##### refreshOpenDocuments()

> **refreshOpenDocuments**(): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:265](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L265)

Re-runs diagnostics for all open HTML/TypeScript documents.

Intended to be called after the external library index changes (e.g. when a
dependency is installed or upgraded). The cached import-resolution results
are dropped first so the refreshed index is taken into account, clearing any
stale "missing import" diagnostics without requiring the user to edit files.

###### Returns

`Promise`\<`void`\>

##### runDiagnostics()

> `private` **runDiagnostics**(`templateText`, `document`, `offset`, `sourceFile`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:442](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L442)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `templateText` | `string` |
| `document` | `TextDocument` |
| `offset` | `number` |
| `sourceFile` | `SourceFile` |

###### Returns

`Promise`\<`void`\>

##### shouldProcessCandidate()

> `private` **shouldProcessCandidate**(`candidate`, `processedCandidates`): `candidate is AngularElementData`

Defined in: [providers/diagnostics.ts:655](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L655)

Checks if a candidate should be processed.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `candidate` | [`AngularElementData`](../types/angular.md#angularelementdata) \| `null` |
| `processedCandidates` | `Set`\<`string`\> |

###### Returns

`candidate is AngularElementData`

##### shouldProcessDocument()

> `private` **shouldProcessDocument**(`sourceFile`, `document`): `boolean`

Defined in: [providers/diagnostics.ts:411](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L411)

Checks if document should be processed for diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `document` | `TextDocument` |

###### Returns

`boolean`

##### updateDiagnostics()

> `private` **updateDiagnostics**(`document`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:318](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L318)

Updates diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### updateImportCache()

> `private` **updateImportCache**(`cacheKey`, `elementName`, `isImported`): `void`

Defined in: [providers/diagnostics.ts:1016](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1016)

Updates import cache with result.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cacheKey` | `string` |
| `elementName` | `string` |
| `isImported` | `boolean` |

###### Returns

`void`

##### updateRelatedHtmlDiagnostics()

> `private` **updateRelatedHtmlDiagnostics**(`tsDocument`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:204](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L204)

Updates diagnostics for related HTML files when a TypeScript file changes.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tsDocument` | `TextDocument` |

###### Returns

`Promise`\<`void`\>
