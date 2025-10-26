[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / providers/diagnostics

# providers/diagnostics

Angular Auto-Import Diagnostic Provider

## Classes

### DiagnosticProvider

Defined in: [providers/diagnostics.ts:102](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L102)

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
| <a id="candidatediagnostics"></a> `candidateDiagnostics` | `private` | `Map`\<`string`, `Diagnostic`[]\> | `undefined` | - | [providers/diagnostics.ts:105](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L105) |
| <a id="compiler"></a> `compiler` | `private` | `any` | `null` | - | [providers/diagnostics.ts:108](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L108) |
| <a id="context"></a> `context` | `private` | [`ProviderContext`](../providers.md#providercontext) | `undefined` | - | [providers/diagnostics.ts:116](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L116) |
| <a id="diagnosticcollection"></a> `diagnosticCollection` | `private` | `DiagnosticCollection` | `undefined` | - | [providers/diagnostics.ts:103](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L103) |
| <a id="disposables"></a> `disposables` | `private` | `Disposable`[] | `[]` | - | [providers/diagnostics.ts:104](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L104) |
| <a id="importedelementscache"></a> `importedElementsCache` | `private` | `Map`\<`string`, `Map`\<`string`, `boolean`\>\> | `undefined` | Cache for storing whether a specific Angular element (component, directive, pipe) is imported in a given TypeScript component file. Key: path to the TypeScript component file. Value: Map where key is the Angular element name (e.g., 'MyComponent') and value is a boolean indicating if it's imported. | [providers/diagnostics.ts:114](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L114) |
| <a id="templatecache"></a> `templateCache` | `private` | `Map`\<`string`, \{ `nodes`: `unknown`[]; `version`: `number`; \}\> | `undefined` | - | [providers/diagnostics.ts:106](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L106) |

#### Methods

##### \_findPipesInExpression()

> `private` **\_findPipesInExpression**(`expressionText`, `document`, `baseOffset`, `valueOffset`): [`ParsedHtmlElement`](../types/angular.md#parsedhtmlelement)[]

Defined in: [providers/diagnostics.ts:876](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L876)

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

Defined in: [providers/diagnostics.ts:1295](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1295)

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

##### checkDirectElementImport()

> `private` **checkDirectElementImport**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:973](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L973)

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

Defined in: [providers/diagnostics.ts:592](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L592)

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

Defined in: [providers/diagnostics.ts:999](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L999)

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

Defined in: [providers/diagnostics.ts:1238](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1238)

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

##### clearDiagnostics()

> `private` **clearDiagnostics**(`document`): `void`

Defined in: [providers/diagnostics.ts:321](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L321)

Clears diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`void`

##### clearDiagnosticsForNoTemplate()

> `private` **clearDiagnosticsForNoTemplate**(`document`): `void`

Defined in: [providers/diagnostics.ts:411](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L411)

Clears diagnostics when no template is found.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`void`

##### createMissingImportDiagnostic()

> `private` **createMissingImportDiagnostic**(`element`, `candidate`, `specificSelector`, `severity`): `Diagnostic`

Defined in: [providers/diagnostics.ts:753](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L753)

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

Defined in: [providers/diagnostics.ts:192](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L192)

Deactivates the diagnostic provider.

###### Returns

`void`

##### extractInlineTemplate()

> `private` **extractInlineTemplate**(`_document`, `sourceFile`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:794](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L794)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `_document` | `TextDocument` |
| `sourceFile` | `SourceFile` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### extractTemplateFromClass()

> `private` **extractTemplateFromClass**(`classDeclaration`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:810](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L810)

Extracts template from a class declaration.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### extractTemplateFromObjectLiteral()

> `private` **extractTemplateFromObjectLiteral**(`objectLiteral`): `null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

Defined in: [providers/diagnostics.ts:846](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L846)

Extracts template from an object literal expression.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `objectLiteral` | `ObjectLiteralExpression` |

###### Returns

`null` \| \{ `template`: `string`; `templateOffset`: `number`; \}

##### forceUpdateDiagnosticsForFile()

> **forceUpdateDiagnosticsForFile**(`filePath`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:259](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L259)

Public method to force-update diagnostics for a file.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### getComponentDecoratorObjectLiteral()

> `private` **getComponentDecoratorObjectLiteral**(`componentDecorator`): `null` \| `ObjectLiteralExpression`

Defined in: [providers/diagnostics.ts:829](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L829)

Gets the object literal from a Component decorator.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `componentDecorator` | `Decorator` |

###### Returns

`null` \| `ObjectLiteralExpression`

##### getComponentImportsArray()

> `private` **getComponentImportsArray**(`classDeclaration`): `undefined` \| `ArrayLiteralExpression`

Defined in: [providers/diagnostics.ts:948](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L948)

Gets the imports array from a Component decorator.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDeclaration` | `ClassDeclaration` |

###### Returns

`undefined` \| `ArrayLiteralExpression`

##### getDiagnosticsForDocument()

> **getDiagnosticsForDocument**(`uri`): `Diagnostic`[]

Defined in: [providers/diagnostics.ts:252](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L252)

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

> `private` **getImportFromCache**(`cacheKey`, `elementName`): `undefined` \| `boolean`

Defined in: [providers/diagnostics.ts:928](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L928)

Gets import status from cache.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cacheKey` | `string` |
| `elementName` | `string` |

###### Returns

`undefined` \| `boolean`

##### getMatchedSelectors()

> `private` **getMatchedSelectors**(`element`, `candidate`, `CssSelector`, `SelectorMatcher`): `string`[]

Defined in: [providers/diagnostics.ts:727](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L727)

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

> `private` **getProjectContextForDocument**(`document`): `undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

Defined in: [providers/diagnostics.ts:896](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L896)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| [`ProjectContext`](../types/angular.md#projectcontext)

##### getSeverityFromConfig()

> `private` **getSeverityFromConfig**(`severityLevel`): `DiagnosticSeverity`

Defined in: [providers/diagnostics.ts:1457](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1457)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `severityLevel` | `string` |

###### Returns

`DiagnosticSeverity`

##### getSourceFile()

> `private` **getSourceFile**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/diagnostics.ts:767](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L767)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### getSourceFileWithLogging()

> `private` **getSourceFileWithLogging**(`document`): `undefined` \| `SourceFile`

Defined in: [providers/diagnostics.ts:329](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L329)

Gets source file and logs if not found.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`undefined` \| `SourceFile`

##### hasChildren()

> `private` **hasChildren**(`node`): `boolean`

Defined in: [providers/diagnostics.ts:1452](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1452)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | `unknown` |

###### Returns

`boolean`

##### isControlFlowNode()

> `private` **isControlFlowNode**(`nodeName`): `boolean`

Defined in: [providers/diagnostics.ts:1078](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1078)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `nodeName` | `string` |

###### Returns

`boolean`

##### isElementImported()

> `private` **isElementImported**(`sourceFile`, `element`): `boolean`

Defined in: [providers/diagnostics.ts:900](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L900)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `element` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`boolean`

##### isValidTemplateInitializer()

> `private` **isValidTemplateInitializer**(`initializer`): initializer is StringLiteral \| NoSubstitutionTemplateLiteral

Defined in: [providers/diagnostics.ts:867](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L867)

Checks if an initializer is a valid template initializer.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `initializer` | `undefined` \| `Node`\<`Node`\> |

###### Returns

initializer is StringLiteral \| NoSubstitutionTemplateLiteral

##### loadCompiler()

> `private` **loadCompiler**(): `void`

Defined in: [providers/diagnostics.ts:1492](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1492)

###### Returns

`void`

##### logOperationDuration()

> `private` **logOperationDuration**(`operation`, `identifier`, `startTime`): `void`

Defined in: [providers/diagnostics.ts:423](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L423)

Logs the duration of an operation.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `operation` | `string` |
| `identifier` | `string` |
| `startTime` | `bigint` |

###### Returns

`void`

##### parseCompleteTemplate()

> `private` **parseCompleteTemplate**(`text`, `document`, `offset`, `indexer`): `ParsedHtmlFullElement`[]

Defined in: [providers/diagnostics.ts:475](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L475)

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

Defined in: [providers/diagnostics.ts:1336](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1336)

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

Defined in: [providers/diagnostics.ts:1431](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1431)

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

Defined in: [providers/diagnostics.ts:1118](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1118)

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

Defined in: [providers/diagnostics.ts:1146](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1146)

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

> `private` **processCandidateElement**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`, `CssSelector`, `SelectorMatcher`): `Promise`\<`null` \| `Diagnostic`\>

Defined in: [providers/diagnostics.ts:645](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L645)

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

`Promise`\<`null` \| `Diagnostic`\>

##### processCasesArray()

> `private` **processCasesArray**(`cases`, `visit`, `extractPipesFromExpression`): `void`

Defined in: [providers/diagnostics.ts:1132](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1132)

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

Defined in: [providers/diagnostics.ts:1106](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1106)

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

Defined in: [providers/diagnostics.ts:1084](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1084)

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

Defined in: [providers/diagnostics.ts:1159](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1159)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `controlFlowNode` | [`ControlFlowNode`](../types/template-ast.md#controlflownode) |
| `visit` | (`nodesList`) => `void` |

###### Returns

`void`

##### processElementOrTemplateNode()

> `private` **processElementOrTemplateNode**(`node`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1185](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1185)

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

Defined in: [providers/diagnostics.ts:340](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L340)

Processes HTML document diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### processNonPipeCandidate()

> `private` **processNonPipeCandidate**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`, `CssSelector`, `SelectorMatcher`): `null` \| `Diagnostic`

Defined in: [providers/diagnostics.ts:697](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L697)

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

`null` \| `Diagnostic`

##### processPipeCandidate()

> `private` **processPipeCandidate**(`element`, `candidate`, `severity`, `sourceFile`, `processedCandidates`): `null` \| `Diagnostic`

Defined in: [providers/diagnostics.ts:680](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L680)

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

`null` \| `Diagnostic`

##### processSingleAttribute()

> `private` **processSingleAttribute**(`attr`, `isTemplateAttr`, `nodeName`, `attributes`, `processingCtx`, `docCtx`, `astCtors`): `void`

Defined in: [providers/diagnostics.ts:1367](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1367)

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

Defined in: [providers/diagnostics.ts:1049](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1049)

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

Defined in: [providers/diagnostics.ts:369](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L369)

Processes TypeScript document diagnostics.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### publishFilteredDiagnostics()

> `private` **publishFilteredDiagnostics**(`uri`): `void`

Defined in: [providers/diagnostics.ts:1470](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L1470)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `uri` | `Uri` |

###### Returns

`void`

##### runDiagnostics()

> `private` **runDiagnostics**(`templateText`, `document`, `offset`, `_componentPath`, `_tsDocument`, `sourceFile`): `Promise`\<`void`\>

Defined in: [providers/diagnostics.ts:429](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L429)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `templateText` | `string` |
| `document` | `TextDocument` |
| `offset` | `number` |
| `_componentPath` | `string` |
| `_tsDocument` | `TextDocument` |
| `sourceFile` | `SourceFile` |

###### Returns

`Promise`\<`void`\>

##### shouldProcessCandidate()

> `private` **shouldProcessCandidate**(`candidate`, `processedCandidates`): `candidate is AngularElementData`

Defined in: [providers/diagnostics.ts:635](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L635)

Checks if a candidate should be processed.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `candidate` | `null` \| [`AngularElementData`](../types/angular.md#angularelementdata) |
| `processedCandidates` | `Set`\<`string`\> |

###### Returns

`candidate is AngularElementData`

##### shouldProcessDocument()

> `private` **shouldProcessDocument**(`sourceFile`, `document`): `boolean`

Defined in: [providers/diagnostics.ts:398](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L398)

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

Defined in: [providers/diagnostics.ts:300](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L300)

Updates diagnostics for a document.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | `TextDocument` |

###### Returns

`Promise`\<`void`\>

##### updateImportCache()

> `private` **updateImportCache**(`cacheKey`, `elementName`, `isImported`): `void`

Defined in: [providers/diagnostics.ts:936](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L936)

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

Defined in: [providers/diagnostics.ts:205](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/providers/diagnostics.ts#L205)

Updates diagnostics for related HTML files when a TypeScript file changes.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `tsDocument` | `TextDocument` |

###### Returns

`Promise`\<`void`\>
