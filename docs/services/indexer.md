[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / services/indexer

# services/indexer

Angular Indexer Service
Responsible for indexing Angular components, directives, and pipes.

## Classes

### AngularIndexer

Defined in: [services/indexer.ts:342](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L342)

The main class responsible for indexing Angular elements in a project.

#### Constructors

##### Constructor

> **new AngularIndexer**(): [`AngularIndexer`](#angularindexer)

Defined in: [services/indexer.ts:394](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L394)

###### Returns

[`AngularIndexer`](#angularindexer)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="_ondidindexnodemodules"></a> `_onDidIndexNodeModules` | `private` | `EventEmitter`\<`void`\> | `undefined` | - | [services/indexer.ts:367](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L367) |
| <a id="dependencywatcher"></a> `dependencyWatcher` | `private` | `FileSystemWatcher` \| `null` | `null` | Watches dependency manifests / lock files to refresh the external library index when packages are installed, removed or upgraded. | [services/indexer.ts:365](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L365) |
| <a id="externalmoduleexportsindex"></a> `externalModuleExportsIndex` | `private` | `Map`\<`string`, `Set`\<`string`\>\> | `undefined` | Index of external modules and their exported entities. Key: module name (e.g., "MatTableModule") Value: Set of exported entity names (e.g., Set(["MatTable", "MatHeaderCell", ...])) | [services/indexer.ts:356](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L356) |
| <a id="filecache"></a> `fileCache` | `private` | `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> | `undefined` | - | [services/indexer.ts:347](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L347) |
| <a id="filewatcher"></a> `fileWatcher` | `public` | `FileSystemWatcher` \| `null` | `null` | The file watcher for the project. | [services/indexer.ts:360](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L360) |
| <a id="isindexing"></a> `isIndexing` | `private` | `boolean` | `false` | - | [services/indexer.ts:375](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L375) |
| <a id="isreindexingdependencies"></a> `isReindexingDependencies` | `private` | `boolean` | `false` | - | [services/indexer.ts:366](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L366) |
| <a id="ondidindexnodemodules"></a> `onDidIndexNodeModules` | `readonly` | `Event`\<`void`\> | `undefined` | Fires after `node_modules` are re-indexed because a dependency manifest changed. Consumers (e.g. the diagnostic provider) can use this to refresh results that depend on the external library index. | [services/indexer.ts:373](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L373) |
| <a id="project"></a> `project` | `public` | `Project` | `undefined` | The ts-morph project instance. | [services/indexer.ts:346](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L346) |
| <a id="projectmodulemap"></a> `projectModuleMap` | `private` | `ComponentToModuleMap` | `undefined` | - | [services/indexer.ts:350](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L350) |
| <a id="projectrootpath"></a> `projectRootPath` | `private` | `string` | `""` | - | [services/indexer.ts:374](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L374) |
| <a id="selectortrie"></a> `selectorTrie` | `private` | `SelectorTrie` | `undefined` | - | [services/indexer.ts:348](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L348) |
| <a id="workspaceexternalmodulesexportscachekey"></a> `workspaceExternalModulesExportsCacheKey` | `public` | `string` | `""` | The cache key for the external modules exports index in the workspace state. | [services/indexer.ts:392](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L392) |
| <a id="workspacefilecachekey"></a> `workspaceFileCacheKey` | `public` | `string` | `""` | The cache key for the file cache in the workspace state. | [services/indexer.ts:380](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L380) |
| <a id="workspaceindexcachekey"></a> `workspaceIndexCacheKey` | `public` | `string` | `""` | The cache key for the selector index in the workspace state. | [services/indexer.ts:384](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L384) |
| <a id="workspacemodulescachekey"></a> `workspaceModulesCacheKey` | `public` | `string` | `""` | The cache key for the module map in the workspace state. | [services/indexer.ts:388](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L388) |

#### Methods

##### \_analyzeAngularElement()

> `private` **\_analyzeAngularElement**(`classDecl`): \{ `elementType`: `"component"` \| `"directive"` \| `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \} \| `null`

Defined in: [services/indexer.ts:2449](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2449)

**`Internal`**

Analyzes a class declaration to extract Angular element information.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDecl` | `ClassDeclaration` | The class declaration to analyze. |

###### Returns

\{ `elementType`: `"component"` \| `"directive"` \| `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \} \| `null`

The element information or null if not an Angular element.

##### \_analyzeElementType()

> `private` **\_analyzeElementType**(`classDecl`, `propertyName`, `elementType`): \{ `elementType`: `"component"` \| `"directive"`; `isStandalone`: `boolean`; `selector`: `string`; \} \| `null`

Defined in: [services/indexer.ts:2473](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2473)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDecl` | `ClassDeclaration` |
| `propertyName` | `"ɵcmp"` \| `"ɵdir"` |
| `elementType` | `"component"` \| `"directive"` |

###### Returns

\{ `elementType`: `"component"` \| `"directive"`; `isStandalone`: `boolean`; `selector`: `string`; \} \| `null`

##### \_analyzePipeElement()

> `private` **\_analyzePipeElement**(`classDecl`): \{ `elementType`: `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \} \| `null`

Defined in: [services/indexer.ts:2501](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2501)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDecl` | `ClassDeclaration` |

###### Returns

\{ `elementType`: `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \} \| `null`

##### \_buildComponentToModuleMap()

> `private` **\_buildComponentToModuleMap**(`sourceFile`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:2023](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2023)

**`Internal`**

Builds a map of components to the modules that export them.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceFile` | `SourceFile` | The source file to process. |
| `importPath` | `string` | The import path of the source file. |
| `componentToModuleMap` | `ComponentToModuleMap` | The map to store the component-to-module mappings. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | A map of all classes in the library. |
| `typeChecker` | `TypeChecker` | The type checker to use. |

###### Returns

`void`

##### \_calculateModuleFitScore()

> `private` **\_calculateModuleFitScore**(`componentName`, `moduleName`, `exportCount`, `importPath`): `number`

Defined in: [services/indexer.ts:2303](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2303)

**`Internal`**

Calculates a "fit score" for a module-component pair.
Higher score is better.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `componentName` | `string` |
| `moduleName` | `string` |
| `exportCount` | `number` |
| `importPath` | `string` |

###### Returns

`number`

##### \_collectClassDeclarations()

> `private` **\_collectClassDeclarations**(`sourceFile`): `Map`\<`string`, `ClassDeclaration`\>

Defined in: [services/indexer.ts:2372](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2372)

**`Internal`**

Collects all class declarations from a source file.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceFile` | `SourceFile` | The source file to collect classes from. |

###### Returns

`Map`\<`string`, `ClassDeclaration`\>

A map of class names to their declarations.

##### \_createAndIndexElementData()

> `private` **\_createAndIndexElementData**(`className`, `elementType`, `selector`, `isStandalone`, `importPath`, `componentToModuleMap`, `absoluteFilePath`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:2552](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2552)

**`Internal`**

Creates and indexes Angular element data.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `className` | `string` | The class name. |
| `elementType` | `"component"` \| `"directive"` \| `"pipe"` | The element type. |
| `selector` | `string` | The selector string. |
| `isStandalone` | `boolean` | Whether the element is standalone. |
| `importPath` | `string` | The original import path. |
| `componentToModuleMap` | `Map`\<`string`, \{ `exportCount`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> | Map of components to modules. |
| `absoluteFilePath` | `string` | The absolute file path of the element. |

###### Returns

`Promise`\<`void`\>

##### \_extractPipeSelectorFromTypeReference()

> `private` **\_extractPipeSelectorFromTypeReference**(`typeRef`): `string` \| `null`

Defined in: [services/indexer.ts:2527](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2527)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `typeRef` | `TypeReferenceNode` |

###### Returns

`string` \| `null`

##### \_extractSelectorFromTypeReference()

> `private` **\_extractSelectorFromTypeReference**(`typeRef`): `string` \| `undefined`

Defined in: [services/indexer.ts:2426](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2426)

**`Internal`**

Extracts selector from a type reference node.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `typeRef` | `TypeReferenceNode` | The type reference node. |

###### Returns

`string` \| `undefined`

The selector string or undefined.

##### \_filterRelevantFiles()

> `private` **\_filterRelevantFiles**(`uris`): `Promise`\<`Uri`[]\>

Defined in: [services/indexer.ts:1230](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1230)

**`Internal`**

Quickly filters a list of files to find ones that likely contain Angular declarations.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `uris` | `Uri`[] | An array of file URIs to filter. |

###### Returns

`Promise`\<`Uri`[]\>

A promise that resolves to a filtered array of file URIs.

##### \_findInheritedStaticProperty()

> `private` **\_findInheritedStaticProperty**(`cls`, `propName`): `object`

Defined in: [services/indexer.ts:2405](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2405)

**`Internal`**

Recursively searches for a static property (e.g., ɵcmp) in the inheritance chain.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `cls` | `ClassDeclaration` | The class to search in. |
| `propName` | `"ɵcmp"` \| `"ɵdir"` \| `"ɵpipe"` | The property name to search for. |

###### Returns

`object`

An object containing the owner class and the property declaration.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `owner` | `ClassDeclaration` | [services/indexer.ts:2408](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2408) |
| `prop` | `PropertyDeclaration` \| `undefined` | [services/indexer.ts:2408](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2408) |

##### \_getIdentifierNamesFromArrayProp()

> `private` **\_getIdentifierNamesFromArrayProp**(`prop`): `string`[]

Defined in: [services/indexer.ts:1983](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1983)

**`Internal`**

Gets the names of identifiers in an array property.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `PropertyAssignment` \| `undefined` | The property assignment to get the identifiers from. |

###### Returns

`string`[]

An array of identifier names.

##### \_getNpmPackageName()

> `private` **\_getNpmPackageName**(`filePath`): \[`string`, `boolean`\] \| `undefined`

Defined in: [services/indexer.ts:1254](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1254)

**`Internal`**

Finds the package name from a file path.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The full path to the file. |

###### Returns

\[`string`, `boolean`\] \| `undefined`

A tuple of [packageName, isDevDependency] or undefined if not a node_modules file.

##### \_handleStandaloneExternalComponent()

> `private` **\_handleStandaloneExternalComponent**(`className`, `elementType`, `currentImportPath`, `selectors`): `string` \| `null`

Defined in: [services/indexer.ts:2617](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2617)

**`Internal`**

Handles the special indexing logic for standalone components from external libraries.
It ensures that only one candidate with the shortest (most public) import path is stored.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `className` | `string` |
| `elementType` | `"component"` \| `"directive"` \| `"pipe"` |
| `currentImportPath` | `string` |
| `selectors` | `string`[] |

###### Returns

`string` \| `null`

The determined final import path if processing should continue, or null if the candidate should be skipped.

##### \_indexDeclarationsInFile()

> `private` **\_indexDeclarationsInFile**(`sourceFile`, `importPath`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:2663](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2663)

**`Internal`**

Indexes the declarations in a file.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceFile` | `SourceFile` | The source file to process. |
| `importPath` | `string` | The import path of the source file. |
| `componentToModuleMap` | `Map`\<`string`, \{ `exportCount`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> | A map of components to the modules that export them. |

###### Returns

`Promise`\<`void`\>

##### \_indexLibrary()

> `private` **\_indexLibrary**(`entryPoints`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1703](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1703)

**`Internal`**

Indexes a library from its entry points.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `entryPoints` | `Map`\<`string`, `string`\> | A map of import paths to file paths. |

###### Returns

`Promise`\<`void`\>

##### \_indexNodeModulesFromUris()

> `private` **\_indexNodeModulesFromUris**(`uris`, `dependencies`, `context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1186](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1186)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `uris` | `Uri`[] |
| `dependencies` | [`AngularDependency`](../utils/package-json.md#angulardependency)[] |
| `context` | `ExtensionContext` |

###### Returns

`Promise`\<`void`\>

##### \_isReexportedModule()

> `private` **\_isReexportedModule**(`exportedClassDecl`): `boolean`

Defined in: [services/indexer.ts:2206](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2206)

**`Internal`**

Checks if the exported class declaration is a re-exported NgModule.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `exportedClassDecl` | `ClassDeclaration` | The class declaration to check. |

###### Returns

`boolean`

True if it's a re-exported module.

##### \_isStandaloneFromTypeReference()

> `private` **\_isStandaloneFromTypeReference**(`typeRef`, `elementType`): `boolean`

Defined in: [services/indexer.ts:2340](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2340)

**`Internal`**

Determines if an element is standalone from its compiled type reference.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `typeRef` | `TypeReferenceNode` | The type reference node from a static property (e.g., `ɵcmp`). |
| `elementType` | `"component"` \| `"directive"` \| `"pipe"` | The type of the Angular element. |

###### Returns

`boolean`

`true` if the element is standalone, `false` otherwise.

##### \_mapComponentToModule()

> `private` **\_mapComponentToModule**(`exportedClassName`, `moduleName`, `importPath`, `componentToModuleMap`, `moduleExports?`): `void`

Defined in: [services/indexer.ts:2253](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2253)

**`Internal`**

Maps a component/directive/pipe to its module.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `exportedClassName` | `string` | The name of the exported class. |
| `moduleName` | `string` | The module name. |
| `importPath` | `string` | The import path. |
| `componentToModuleMap` | `ComponentToModuleMap` | The mapping to update. |
| `moduleExports?` | `Set`\<`string`\> | Optional set to add exports to. |

###### Returns

`void`

##### \_processModuleExports()

> `private` **\_processModuleExports**(`exportsTuple`, `moduleName`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`, `moduleExports?`): `void`

Defined in: [services/indexer.ts:2131](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2131)

**`Internal`**

Processes the exports of a module.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `exportsTuple` | `TupleTypeNode` | The tuple of exported elements. |
| `moduleName` | `string` | The name of the module. |
| `importPath` | `string` | The import path of the module. |
| `componentToModuleMap` | `ComponentToModuleMap` | The map to store the component-to-module mappings. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | A map of all classes in the library. |
| `typeChecker` | `TypeChecker` | The type checker to use. |
| `moduleExports?` | `Set`\<`string`\> | Optional Set to accumulate all exports for the module. |

###### Returns

`void`

##### \_processNgModuleClass()

> `private` **\_processNgModuleClass**(`classDecl`, `className`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:2087](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2087)

**`Internal`**

Processes a single NgModule class and maps its exports.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDecl` | `ClassDeclaration` | The class declaration to process. |
| `className` | `string` | The name of the class. |
| `importPath` | `string` | The import path of the source file. |
| `componentToModuleMap` | `ComponentToModuleMap` | The map to store the component-to-module mappings. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | A map of all classes in the library. |
| `typeChecker` | `TypeChecker` | The type checker to use. |

###### Returns

`void`

##### \_processNgModuleClasses()

> `private` **\_processNgModuleClasses**(`classDeclarations`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:2051](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2051)

**`Internal`**

Processes all NgModule classes and maps their exports.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDeclarations` | `Map`\<`string`, `ClassDeclaration`\> | Map of class declarations to process. |
| `importPath` | `string` | The import path of the source file. |
| `componentToModuleMap` | `ComponentToModuleMap` | The map to store the component-to-module mappings. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | A map of all classes in the library. |
| `typeChecker` | `TypeChecker` | The type checker to use. |

###### Returns

`void`

##### \_processProjectModuleFile()

> `private` **\_processProjectModuleFile**(`sourceFile`): `void`

Defined in: [services/indexer.ts:1857](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1857)

**`Internal`**

Processes a single project module file.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceFile` | `SourceFile` | The source file to process. |

###### Returns

`void`

##### \_processReexportedModule()

> `private` **\_processReexportedModule**(`exportedClassDecl`, `moduleName`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`, `moduleExports?`): `void`

Defined in: [services/indexer.ts:2221](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2221)

**`Internal`**

Processes a re-exported module by recursively processing its exports.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `exportedClassDecl` | `ClassDeclaration` | The re-exported module class declaration. |
| `moduleName` | `string` | The current module name. |
| `importPath` | `string` | The import path. |
| `componentToModuleMap` | `ComponentToModuleMap` | The component-to-module mapping. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | Map of all class declarations. |
| `typeChecker` | `TypeChecker` | The type checker. |
| `moduleExports?` | `Set`\<`string`\> | Optional set to accumulate exports. |

###### Returns

`void`

##### \_resolveExportedClassName()

> `private` **\_resolveExportedClassName**(`element`, `typeChecker`): `string` \| `undefined`

Defined in: [services/indexer.ts:2181](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2181)

**`Internal`**

Resolves the exported class name from a tuple element using TypeChecker.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `element` | `TypeNode`\<`TypeNode`\> | The tuple element to resolve. |
| `typeChecker` | `TypeChecker` | The type checker to use. |

###### Returns

`string` \| `undefined`

The exported class name or undefined.

##### applyFallbackIfNeeded()

> `private` **applyFallbackIfNeeded**(`elements`, `filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:655](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L655)

Applies fallback parsing if no elements were found.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `elements` | [`ComponentInfo`](../types/angular.md#componentinfo)[] |
| `filePath` | `string` |
| `content` | `string` |

###### Returns

[`ComponentInfo`](../types/angular.md#componentinfo)[]

##### buildLibraryComponentToModuleMap()

> `private` **buildLibraryComponentToModuleMap**(`libraryFiles`, `allLibraryClasses`, `typeChecker`): `ComponentToModuleMap`

Defined in: [services/indexer.ts:1784](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1784)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> |
| `typeChecker` | `TypeChecker` |

###### Returns

`ComponentToModuleMap`

##### clearCache()

> **clearCache**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1467](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1467)

Clears the index from memory and the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### clearInMemoryState()

> `private` **clearInMemoryState**(): `void`

Defined in: [services/indexer.ts:407](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L407)

**`Internal`**

Clears all in-memory state (file cache, selector trie, module maps)

###### Returns

`void`

##### collectAllLibraryClasses()

> `private` **collectAllLibraryClasses**(`libraryFiles`): `Map`\<`string`, `ClassDeclaration`\>

Defined in: [services/indexer.ts:1747](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1747)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |

###### Returns

`Map`\<`string`, `ClassDeclaration`\>

##### collectClassesFromSourceFile()

> `private` **collectClassesFromSourceFile**(`sourceFile`, `allLibraryClasses`): `void`

Defined in: [services/indexer.ts:1763](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1763)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> |

###### Returns

`void`

##### convertCacheFormat()

> `private` **convertCacheFormat**(`storedCache`): `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>

Defined in: [services/indexer.ts:1353](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1353)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `storedCache` | `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> |

###### Returns

`Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>

##### dispose()

> **dispose**(): `void`

Defined in: [services/indexer.ts:2726](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2726)

Disposes the file watcher and clears the caches.

###### Returns

`void`

##### ensureCacheKeys()

> **ensureCacheKeys**(`projectRootPath`): `void`

Defined in: [services/indexer.ts:444](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L444)

Ensures cache keys are set for the given project root path.
If cache keys are not set, attempts to set them now.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectRootPath` | `string` | The project root path to ensure cache keys for |

###### Returns

`void`

##### expandAllModuleExports()

> `private` **expandAllModuleExports**(): `void`

Defined in: [services/indexer.ts:1589](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1589)

**`Internal`**

Expands all module exports to include transitive exports.
This post-processing step ensures that when a module re-exports another module,
all the re-exported module's exports are also available.

Example:
Before: ChipsModule -> Set(["InputTextModule", "ChipsComponent"])
After:  ChipsModule -> Set(["InputTextModule", "InputText", "ChipsComponent"])

Should be called after all modules are indexed (both project and node_modules).

###### Returns

`void`

##### expandModuleExportsRecursive()

> `private` **expandModuleExportsRecursive**(`moduleName`, `directExports`, `visited`): `Set`\<`string`\>

Defined in: [services/indexer.ts:1540](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1540)

**`Internal`**

Recursively expands module exports to include transitive exports.
For example, if ChipsModule exports InputTextModule, and InputTextModule exports InputText,
this method will ensure ChipsModule's exports include both InputTextModule and InputText.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | The name of the module being processed. |
| `directExports` | `Set`\<`string`\> | The direct exports of the module. |
| `visited` | `Set`\<`string`\> | Set of already visited modules to prevent infinite recursion. |

###### Returns

`Set`\<`string`\>

A Set containing all direct and transitive exports.

##### extractAngularElementInfo()

> `private` **extractAngularElementInfo**(`classDeclaration`, `filePath`, `fileContent`): [`ComponentInfo`](../types/angular.md#componentinfo) \| `null`

Defined in: [services/indexer.ts:673](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L673)

**`Internal`**

Extracts information about an Angular element from a class declaration.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDeclaration` | `ClassDeclaration` | The class declaration to extract information from. |
| `filePath` | `string` | The path to the file. |
| `fileContent` | `string` | The content of the file. |

###### Returns

[`ComponentInfo`](../types/angular.md#componentinfo) \| `null`

A `ComponentInfo` object or `null` if the class is not an Angular element.

##### extractComponentDecoratorData()

> `private` **extractComponentDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:763](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L763)

**`Internal`**

Extracts the selector from a `@Component` decorator.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `decorator` | `Decorator` | The decorator to extract information from. |

###### Returns

`object`

An object containing the selector.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `selector?` | `string` | [services/indexer.ts:763](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L763) |

##### extractDirectiveDecoratorData()

> `private` **extractDirectiveDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:773](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L773)

**`Internal`**

Extracts the selector from a `@Directive` decorator.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `decorator` | `Decorator` | The decorator to extract information from. |

###### Returns

`object`

An object containing the selector.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `selector?` | `string` | [services/indexer.ts:773](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L773) |

##### extractElementsFromSourceFile()

> `private` **extractElementsFromSourceFile**(`sourceFile`, `filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:634](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L634)

Extracts Angular elements from a source file.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `filePath` | `string` |
| `content` | `string` |

###### Returns

[`ComponentInfo`](../types/angular.md#componentinfo)[]

##### extractPipeDecoratorData()

> `private` **extractPipeDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:783](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L783)

**`Internal`**

Extracts the name from a `@Pipe` decorator.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `decorator` | `Decorator` | The decorator to extract information from. |

###### Returns

`object`

An object containing the name.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `name?` | `string` | [services/indexer.ts:783](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L783) |

##### extractSelectorFromDecorator()

> `private` **extractSelectorFromDecorator**(`decorator`, `errorContext`): `string` \| `undefined`

Defined in: [services/indexer.ts:737](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L737)

**`Internal`**

Extracts the selector property from a decorator's argument object.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `decorator` | `Decorator` | The decorator to extract the selector from. |
| `errorContext` | `string` | Context string for error logging (e.g., "component", "directive"). |

###### Returns

`string` \| `undefined`

The selector string or undefined.

##### generateFullIndex()

> **generateFullIndex**(`context`, `progress?`): `Promise`\<`Map`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>\>

Defined in: [services/indexer.ts:1078](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1078)

Generates a full index of the project.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |
| `progress?` | `Progress`\<\{ `increment?`: `number`; `message?`: `string`; \}\> | - |

###### Returns

`Promise`\<`Map`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>\>

A map of selectors to `AngularElementData` objects.

##### generateHash()

> `private` **generateHash**(`content`): `string`

Defined in: [services/indexer.ts:556](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L556)

**`Internal`**

Generates a hash for a given string.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `content` | `string` | The string to hash. |

###### Returns

`string`

The hash of the string.

##### getAllSelectors()

> **getAllSelectors**(): `string`[]

Defined in: [services/indexer.ts:2710](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2710)

Gets all indexed selectors.

###### Returns

`string`[]

An array of selectors.

##### getElements()

> **getElements**(`selector`): [`AngularElementData`](../types/angular.md#angularelementdata)[]

Defined in: [services/indexer.ts:1500](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1500)

Gets all elements for a given selector.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selector` | `string` | The selector to search for. |

###### Returns

[`AngularElementData`](../types/angular.md#angularelementdata)[]

An array of `AngularElementData` objects.

##### getExternalModuleExports()

> **getExternalModuleExports**(`moduleName`): `Set`\<`string`\> \| `undefined`

Defined in: [services/indexer.ts:1512](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1512)

Gets all exported entities from an external module.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | The name of the external module (e.g., "MatTableModule"). |

###### Returns

`Set`\<`string`\> \| `undefined`

A Set of exported entity names or undefined if module not found.

##### getFallbackResult()

> `private` **getFallbackResult**(`filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:592](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L592)

Gets fallback result using regex parsing.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |
| `content` | `string` |

###### Returns

[`ComponentInfo`](../types/angular.md#componentinfo)[]

##### getNgModuleObjectLiteral()

> `private` **getNgModuleObjectLiteral**(`ngModuleDecorator`): `ObjectLiteralExpression` \| `null`

Defined in: [services/indexer.ts:1911](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1911)

Gets the NgModule decorator's object literal.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `ngModuleDecorator` | `Decorator` |

###### Returns

`ObjectLiteralExpression` \| `null`

##### getOrCreateSourceFile()

> `private` **getOrCreateSourceFile**(`filePath`, `content`): `SourceFile`

Defined in: [services/indexer.ts:600](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L600)

Gets or creates a source file for the given path and content.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |
| `content` | `string` |

###### Returns

`SourceFile`

##### handleNoElementsFound()

> `private` **handleNoElementsFound**(`filePath`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1039](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1039)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### indexLibraryDeclarations()

> `private` **indexLibraryDeclarations**(`libraryFiles`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1803](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1803)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |
| `componentToModuleMap` | `ComponentToModuleMap` |

###### Returns

`Promise`\<`void`\>

##### indexNodeModules()

> **indexNodeModules**(`context`, `progress?`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1630](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1630)

Indexes all Angular libraries in `node_modules`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |
| `progress?` | `Progress`\<\{ `increment?`: `number`; `message?`: `string`; \}\> | Optional progress reporter to use instead of creating a new one. |

###### Returns

`Promise`\<`void`\>

##### indexProjectModules()

> `private` **indexProjectModules**(`moduleFileUris`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1821](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1821)

**`Internal`**

Indexes all NgModules in the project.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleFileUris` | `Uri`[] | An array of module file URIs to index. |

###### Returns

`Promise`\<`void`\>

##### indexSingleElement()

> `private` **indexSingleElement**(`parsed`, `isExternal`, `absolutePath?`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:979](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L979)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parsed` | [`ComponentInfo`](../types/angular.md#componentinfo) |
| `isExternal` | `boolean` |
| `absolutePath?` | `string` |

###### Returns

`Promise`\<`void`\>

##### initializeDependencyWatcher()

> `private` **initializeDependencyWatcher**(`context`): `void`

Defined in: [services/indexer.ts:501](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L501)

**`Internal`**

Initializes a watcher for dependency manifests / lock files so the external
library index is refreshed automatically when packages change. This guards
against a stale index where a freshly installed library's elements are not
yet known (the cause of false "missing import" diagnostics).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`void`

##### initializeWatcher()

> **initializeWatcher**(`context`): `void`

Defined in: [services/indexer.ts:455](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L455)

Initializes the file watcher for the project to keep the index up-to-date.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`void`

##### isFileUpToDate()

> `private` **isFileUpToDate**(`cachedFile`, `lastModified`, `hash`): `boolean`

Defined in: [services/indexer.ts:932](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L932)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cachedFile` | [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| `undefined` |
| `lastModified` | `number` |
| `hash` | `string` |

###### Returns

`boolean`

##### isModule()

> `private` **isModule**(`name`): `boolean`

Defined in: [services/indexer.ts:1526](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1526)

**`Internal`**

Checks if an exported element is a module.
An element is considered a module if it exists as a key in the externalModuleExportsIndex.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the element to check. |

###### Returns

`boolean`

True if the element is a module, false otherwise.

##### isSourceFileValid()

> `private` **isSourceFileValid**(`sourceFile`): `boolean`

Defined in: [services/indexer.ts:1871](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1871)

Checks if a source file is valid.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |

###### Returns

`boolean`

##### loadCacheData()

> `private` **loadCacheData**(`workspaceData`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1331](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1331)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedCache`: `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> \| `undefined`; `storedExternalModulesExports?`: `Record`\<`string`, `string`[]\>; `storedIndex`: `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> \| `undefined`; `storedModules?`: `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\>; \} |
| `workspaceData.storedCache` | `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> \| `undefined` |
| `workspaceData.storedExternalModulesExports?` | `Record`\<`string`, `string`[]\> |
| `workspaceData.storedIndex` | `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> \| `undefined` |
| `workspaceData.storedModules?` | `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`Promise`\<`void`\>

##### loadExternalModuleExports()

> `private` **loadExternalModuleExports**(`workspaceData`): `void`

Defined in: [services/indexer.ts:1415](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1415)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedExternalModulesExports?`: `Record`\<`string`, `string`[]\>; \} |
| `workspaceData.storedExternalModulesExports?` | `Record`\<`string`, `string`[]\> |

###### Returns

`void`

##### loadFromWorkspace()

> **loadFromWorkspace**(`context`): `Promise`\<`boolean`\>

Defined in: [services/indexer.ts:1279](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1279)

Loads the index from the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`boolean`\>

`true` if the index was loaded successfully, `false` otherwise.

##### loadIndexElement()

> `private` **loadIndexElement**(`key`, `value`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1378](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1378)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `value` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`Promise`\<`void`\>

##### loadLibrarySourceFiles()

> `private` **loadLibrarySourceFiles**(`entryPoints`): `object`[]

Defined in: [services/indexer.ts:1717](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1717)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entryPoints` | `Map`\<`string`, `string`\> |

###### Returns

`object`[]

##### loadModuleData()

> `private` **loadModuleData**(`workspaceData`): `void`

Defined in: [services/indexer.ts:1397](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1397)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedModules?`: `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\>; \} |
| `workspaceData.storedModules?` | `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`void`

##### parseAngularElementsWithTsMorph()

> `private` **parseAngularElementsWithTsMorph**(`filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:573](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L573)

**`Internal`**

Parses a TypeScript file to find Angular elements.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path to the file. |
| `content` | `string` | The content of the file. |

###### Returns

[`ComponentInfo`](../types/angular.md#componentinfo)[]

An array of `ComponentInfo` objects.

##### parseAngularElementWithRegex()

> `private` **parseAngularElementWithRegex**(`filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo) \| `null`

Defined in: [services/indexer.ts:813](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L813)

**`Internal`**

Parses a TypeScript file using regex to find Angular elements. This is a fallback for when ts-morph fails.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path to the file. |
| `content` | `string` | The content of the file. |

###### Returns

[`ComponentInfo`](../types/angular.md#componentinfo) \| `null`

A `ComponentInfo` object or `null` if no element is found.

##### processAndIndexElements()

> `private` **processAndIndexElements**(`filePath`, `parsedElements`, `lastModified`, `hash`, `isExternal`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:959](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L959)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |
| `parsedElements` | [`ComponentInfo`](../types/angular.md#componentinfo)[] |
| `lastModified` | `number` |
| `hash` | `string` |
| `isExternal` | `boolean` |

###### Returns

`Promise`\<`void`\>

##### processModuleExports()

> `private` **processModuleExports**(`exportsProp`, `moduleName`, `sourceFile`): `void`

Defined in: [services/indexer.ts:1922](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1922)

Processes module exports.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `exportsProp` | `PropertyAssignment` |
| `moduleName` | `string` |
| `sourceFile` | `SourceFile` |

###### Returns

`void`

##### processNgModuleClass()

> `private` **processNgModuleClass**(`classDecl`, `sourceFile`): `void`

Defined in: [services/indexer.ts:1884](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1884)

Processes a single NgModule class.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDecl` | `ClassDeclaration` |
| `sourceFile` | `SourceFile` |

###### Returns

`void`

##### readFileAndGetMetadata()

> `private` **readFileAndGetMetadata**(`filePath`): `object`

Defined in: [services/indexer.ts:917](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L917)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `cachedFile` | [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| `undefined` | [services/indexer.ts:921](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L921) |
| `content` | `string` | [services/indexer.ts:918](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L918) |
| `hash` | `string` | [services/indexer.ts:919](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L919) |
| `lastModified` | `number` | [services/indexer.ts:920](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L920) |

##### reindexNodeModulesAfterDependencyChange()

> `private` **reindexNodeModulesAfterDependencyChange**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:530](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L530)

**`Internal`**

Re-indexes `node_modules` after a dependency manifest change and notifies
listeners via [onDidIndexNodeModules](#ondidindexnodemodules). Skips work while a full index
or another dependency reindex is already running.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### removeFromIndex()

> `private` **removeFromIndex**(`filePath`, `context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1051](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1051)

**`Internal`**

Removes a file from the index.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path to the file. |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### removeOldSelectorsFromIndex()

> `private` **removeOldSelectorsFromIndex**(`cachedFile`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:946](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L946)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cachedFile` | [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| `undefined` |

###### Returns

`Promise`\<`void`\>

##### removeSourceFileFromProject()

> `private` **removeSourceFileFromProject**(`filePath`): `void`

Defined in: [services/indexer.ts:1027](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1027)

**`Internal`**

Safely removes a source file from the ts-morph project.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path to the file to remove. |

###### Returns

`void`

##### resolveElementImportInfo()

> `private` **resolveElementImportInfo**(`parsed`): `object`

Defined in: [services/indexer.ts:1001](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1001)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parsed` | [`ComponentInfo`](../types/angular.md#componentinfo) |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `importName` | `string` | [services/indexer.ts:1003](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1003) |
| `importPath` | `string` | [services/indexer.ts:1002](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1002) |
| `moduleToImport` | `string` \| `undefined` | [services/indexer.ts:1004](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1004) |

##### retrieveWorkspaceData()

> `private` **retrieveWorkspaceData**(`context`): `object`

Defined in: [services/indexer.ts:1316](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1316)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `ExtensionContext` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `storedCache` | `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> \| `undefined` | [services/indexer.ts:1318](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1318) |
| `storedExternalModulesExports` | `Record`\<`string`, `string`[]\> \| `undefined` | [services/indexer.ts:1325](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1325) |
| `storedIndex` | `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> \| `undefined` | [services/indexer.ts:1321](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1321) |
| `storedModules` | `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> \| `undefined` | [services/indexer.ts:1322](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1322) |

##### saveIndexToWorkspace()

> `private` **saveIndexToWorkspace**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1432](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1432)

**`Internal`**

Saves the index to the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### searchWithSelectors()

> **searchWithSelectors**(`prefix`): `object`[]

Defined in: [services/indexer.ts:2719](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2719)

Searches for selectors with a given prefix.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prefix` | `string` | The prefix to search for. |

###### Returns

`object`[]

An array of objects containing the selector and the corresponding `AngularElementData`.

##### setProjectRoot()

> **setProjectRoot**(`projectPath`): `void`

Defined in: [services/indexer.ts:418](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L418)

Sets the root path of the project to be indexed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectPath` | `string` | The absolute path to the project root. |

###### Returns

`void`

##### storeModuleExports()

> `private` **storeModuleExports**(`moduleName`, `exportedIdentifiers`): `void`

Defined in: [services/indexer.ts:1936](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1936)

Stores module exports in the index.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `moduleName` | `string` |
| `exportedIdentifiers` | `string`[] |

###### Returns

`void`

##### updateCacheTimestamp()

> `private` **updateCacheTimestamp**(`filePath`, `cachedFile`, `lastModified`): `void`

Defined in: [services/indexer.ts:936](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L936)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |
| `cachedFile` | [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| `undefined` |
| `lastModified` | `number` |

###### Returns

`void`

##### updateExistingSourceFile()

> `private` **updateExistingSourceFile**(`sourceFile`, `filePath`, `content`): `SourceFile`

Defined in: [services/indexer.ts:617](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L617)

Updates an existing source file or recreates it if forgotten.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `filePath` | `string` |
| `content` | `string` |

###### Returns

`SourceFile`

##### updateFileIndex()

> `private` **updateFileIndex**(`filePath`, `context`, `isExternal?`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:867](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L867)

**`Internal`**

Updates the index for a single file.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `filePath` | `string` | `undefined` | The path to the file. |
| `context` | `ExtensionContext` | `undefined` | The extension context. |
| `isExternal` | `boolean` | `false` | - |

###### Returns

`Promise`\<`void`\>

##### updateProjectModuleMap()

> `private` **updateProjectModuleMap**(`exportedIdentifiers`, `moduleName`, `sourceFile`): `void`

Defined in: [services/indexer.ts:1946](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1946)

Updates the project module map with exported identifiers.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `exportedIdentifiers` | `string`[] |
| `moduleName` | `string` |
| `sourceFile` | `SourceFile` |

###### Returns

`void`

##### validateFileForIndexing()

> `private` **validateFileForIndexing**(`filePath`): `boolean`

Defined in: [services/indexer.ts:899](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L899)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`boolean`
