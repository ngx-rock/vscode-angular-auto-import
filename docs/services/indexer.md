[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / services/indexer

# services/indexer

Angular Indexer Service
Responsible for indexing Angular components, directives, and pipes.

## Classes

### AngularIndexer

Defined in: [services/indexer.ts:324](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L324)

The main class responsible for indexing Angular elements in a project.

#### Constructors

##### Constructor

> **new AngularIndexer**(): [`AngularIndexer`](#angularindexer)

Defined in: [services/indexer.ts:363](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L363)

###### Returns

[`AngularIndexer`](#angularindexer)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="externalmoduleexportsindex"></a> `externalModuleExportsIndex` | `private` | `Map`\<`string`, `Set`\<`string`\>\> | `undefined` | Index of external modules and their exported entities. Key: module name (e.g., "MatTableModule") Value: Set of exported entity names (e.g., Set(["MatTable", "MatHeaderCell", ...])) | [services/indexer.ts:338](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L338) |
| <a id="filecache"></a> `fileCache` | `private` | `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> | `undefined` | - | [services/indexer.ts:329](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L329) |
| <a id="filewatcher"></a> `fileWatcher` | `public` | `null` \| `FileSystemWatcher` | `null` | The file watcher for the project. | [services/indexer.ts:342](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L342) |
| <a id="isindexing"></a> `isIndexing` | `private` | `boolean` | `false` | - | [services/indexer.ts:344](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L344) |
| <a id="project"></a> `project` | `public` | `Project` | `undefined` | The ts-morph project instance. | [services/indexer.ts:328](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L328) |
| <a id="projectmodulemap"></a> `projectModuleMap` | `private` | `ComponentToModuleMap` | `undefined` | - | [services/indexer.ts:332](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L332) |
| <a id="projectrootpath"></a> `projectRootPath` | `private` | `string` | `""` | - | [services/indexer.ts:343](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L343) |
| <a id="selectortrie"></a> `selectorTrie` | `private` | `SelectorTrie` | `undefined` | - | [services/indexer.ts:330](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L330) |
| <a id="workspaceexternalmodulesexportscachekey"></a> `workspaceExternalModulesExportsCacheKey` | `public` | `string` | `""` | The cache key for the external modules exports index in the workspace state. | [services/indexer.ts:361](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L361) |
| <a id="workspacefilecachekey"></a> `workspaceFileCacheKey` | `public` | `string` | `""` | The cache key for the file cache in the workspace state. | [services/indexer.ts:349](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L349) |
| <a id="workspaceindexcachekey"></a> `workspaceIndexCacheKey` | `public` | `string` | `""` | The cache key for the selector index in the workspace state. | [services/indexer.ts:353](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L353) |
| <a id="workspacemodulescachekey"></a> `workspaceModulesCacheKey` | `public` | `string` | `""` | The cache key for the module map in the workspace state. | [services/indexer.ts:357](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L357) |

#### Methods

##### \_analyzeAngularElement()

> `private` **\_analyzeAngularElement**(`classDecl`): `null` \| \{ `elementType`: `"component"` \| `"directive"` \| `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \}

Defined in: [services/indexer.ts:2360](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2360)

**`Internal`**

Analyzes a class declaration to extract Angular element information.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDecl` | `ClassDeclaration` | The class declaration to analyze. |

###### Returns

`null` \| \{ `elementType`: `"component"` \| `"directive"` \| `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \}

The element information or null if not an Angular element.

##### \_analyzeElementType()

> `private` **\_analyzeElementType**(`classDecl`, `propertyName`, `elementType`): `null` \| \{ `elementType`: `"component"` \| `"directive"`; `isStandalone`: `boolean`; `selector`: `string`; \}

Defined in: [services/indexer.ts:2384](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2384)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDecl` | `ClassDeclaration` |
| `propertyName` | `"ɵcmp"` \| `"ɵdir"` |
| `elementType` | `"component"` \| `"directive"` |

###### Returns

`null` \| \{ `elementType`: `"component"` \| `"directive"`; `isStandalone`: `boolean`; `selector`: `string`; \}

##### \_analyzePipeElement()

> `private` **\_analyzePipeElement**(`classDecl`): `null` \| \{ `elementType`: `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \}

Defined in: [services/indexer.ts:2412](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2412)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDecl` | `ClassDeclaration` |

###### Returns

`null` \| \{ `elementType`: `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \}

##### \_buildComponentToModuleMap()

> `private` **\_buildComponentToModuleMap**(`sourceFile`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:1933](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1933)

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

Defined in: [services/indexer.ts:2213](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2213)

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

Defined in: [services/indexer.ts:2282](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2282)

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

Defined in: [services/indexer.ts:2463](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2463)

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

> `private` **\_extractPipeSelectorFromTypeReference**(`typeRef`): `null` \| `string`

Defined in: [services/indexer.ts:2438](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2438)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `typeRef` | `TypeReferenceNode` |

###### Returns

`null` \| `string`

##### \_extractSelectorFromTypeReference()

> `private` **\_extractSelectorFromTypeReference**(`typeRef`): `undefined` \| `string`

Defined in: [services/indexer.ts:2337](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2337)

**`Internal`**

Extracts selector from a type reference node.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `typeRef` | `TypeReferenceNode` | The type reference node. |

###### Returns

`undefined` \| `string`

The selector string or undefined.

##### \_filterRelevantFiles()

> `private` **\_filterRelevantFiles**(`uris`): `Promise`\<`Uri`[]\>

Defined in: [services/indexer.ts:1140](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1140)

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

Defined in: [services/indexer.ts:2316](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2316)

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
| `owner` | `ClassDeclaration` | [services/indexer.ts:2319](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2319) |
| `prop` | `undefined` \| `PropertyDeclaration` | [services/indexer.ts:2319](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2319) |

##### \_getIdentifierNamesFromArrayProp()

> `private` **\_getIdentifierNamesFromArrayProp**(`prop`): `string`[]

Defined in: [services/indexer.ts:1893](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1893)

**`Internal`**

Gets the names of identifiers in an array property.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `undefined` \| `PropertyAssignment` | The property assignment to get the identifiers from. |

###### Returns

`string`[]

An array of identifier names.

##### \_getNpmPackageName()

> `private` **\_getNpmPackageName**(`filePath`): `undefined` \| \[`string`, `boolean`\]

Defined in: [services/indexer.ts:1164](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1164)

**`Internal`**

Finds the package name from a file path.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The full path to the file. |

###### Returns

`undefined` \| \[`string`, `boolean`\]

A tuple of [packageName, isDevDependency] or undefined if not a node_modules file.

##### \_handleStandaloneExternalComponent()

> `private` **\_handleStandaloneExternalComponent**(`className`, `elementType`, `currentImportPath`, `selectors`): `null` \| `string`

Defined in: [services/indexer.ts:2528](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2528)

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

`null` \| `string`

The determined final import path if processing should continue, or null if the candidate should be skipped.

##### \_indexDeclarationsInFile()

> `private` **\_indexDeclarationsInFile**(`sourceFile`, `importPath`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:2574](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2574)

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

Defined in: [services/indexer.ts:1613](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1613)

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

Defined in: [services/indexer.ts:1096](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1096)

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

Defined in: [services/indexer.ts:2116](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2116)

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

Defined in: [services/indexer.ts:2250](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2250)

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

Defined in: [services/indexer.ts:2163](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2163)

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

Defined in: [services/indexer.ts:2041](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2041)

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

Defined in: [services/indexer.ts:1997](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1997)

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

Defined in: [services/indexer.ts:1961](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1961)

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

Defined in: [services/indexer.ts:1767](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1767)

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

Defined in: [services/indexer.ts:2131](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2131)

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

> `private` **\_resolveExportedClassName**(`element`, `typeChecker`): `undefined` \| `string`

Defined in: [services/indexer.ts:2091](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2091)

**`Internal`**

Resolves the exported class name from a tuple element using TypeChecker.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `element` | `TypeNode`\<`TypeNode`\> | The tuple element to resolve. |
| `typeChecker` | `TypeChecker` | The type checker to use. |

###### Returns

`undefined` \| `string`

The exported class name or undefined.

##### applyFallbackIfNeeded()

> `private` **applyFallbackIfNeeded**(`elements`, `filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:565](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L565)

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

Defined in: [services/indexer.ts:1694](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1694)

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

Defined in: [services/indexer.ts:1377](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1377)

Clears the index from memory and the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### clearInMemoryState()

> `private` **clearInMemoryState**(): `void`

Defined in: [services/indexer.ts:376](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L376)

**`Internal`**

Clears all in-memory state (file cache, selector trie, module maps)

###### Returns

`void`

##### collectAllLibraryClasses()

> `private` **collectAllLibraryClasses**(`libraryFiles`): `Map`\<`string`, `ClassDeclaration`\>

Defined in: [services/indexer.ts:1657](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1657)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |

###### Returns

`Map`\<`string`, `ClassDeclaration`\>

##### collectClassesFromSourceFile()

> `private` **collectClassesFromSourceFile**(`sourceFile`, `allLibraryClasses`): `void`

Defined in: [services/indexer.ts:1673](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1673)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> |

###### Returns

`void`

##### convertCacheFormat()

> `private` **convertCacheFormat**(`storedCache`): `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>

Defined in: [services/indexer.ts:1263](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1263)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `storedCache` | `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> |

###### Returns

`Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>

##### dispose()

> **dispose**(): `void`

Defined in: [services/indexer.ts:2637](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2637)

Disposes the file watcher and clears the caches.

###### Returns

`void`

##### ensureCacheKeys()

> **ensureCacheKeys**(`projectRootPath`): `void`

Defined in: [services/indexer.ts:413](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L413)

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

Defined in: [services/indexer.ts:1499](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1499)

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

Defined in: [services/indexer.ts:1450](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1450)

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

> `private` **extractAngularElementInfo**(`classDeclaration`, `filePath`, `fileContent`): `null` \| [`ComponentInfo`](../types/angular.md#componentinfo)

Defined in: [services/indexer.ts:583](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L583)

**`Internal`**

Extracts information about an Angular element from a class declaration.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDeclaration` | `ClassDeclaration` | The class declaration to extract information from. |
| `filePath` | `string` | The path to the file. |
| `fileContent` | `string` | The content of the file. |

###### Returns

`null` \| [`ComponentInfo`](../types/angular.md#componentinfo)

A `ComponentInfo` object or `null` if the class is not an Angular element.

##### extractComponentDecoratorData()

> `private` **extractComponentDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:673](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L673)

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
| `selector?` | `string` | [services/indexer.ts:673](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L673) |

##### extractDirectiveDecoratorData()

> `private` **extractDirectiveDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:683](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L683)

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
| `selector?` | `string` | [services/indexer.ts:683](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L683) |

##### extractElementsFromSourceFile()

> `private` **extractElementsFromSourceFile**(`sourceFile`, `filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:544](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L544)

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

Defined in: [services/indexer.ts:693](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L693)

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
| `name?` | `string` | [services/indexer.ts:693](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L693) |

##### extractSelectorFromDecorator()

> `private` **extractSelectorFromDecorator**(`decorator`, `errorContext`): `undefined` \| `string`

Defined in: [services/indexer.ts:647](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L647)

**`Internal`**

Extracts the selector property from a decorator's argument object.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `decorator` | `Decorator` | The decorator to extract the selector from. |
| `errorContext` | `string` | Context string for error logging (e.g., "component", "directive"). |

###### Returns

`undefined` \| `string`

The selector string or undefined.

##### generateFullIndex()

> **generateFullIndex**(`context`, `progress?`): `Promise`\<`Map`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>\>

Defined in: [services/indexer.ts:988](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L988)

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

Defined in: [services/indexer.ts:466](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L466)

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

Defined in: [services/indexer.ts:2621](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2621)

Gets all indexed selectors.

###### Returns

`string`[]

An array of selectors.

##### getElements()

> **getElements**(`selector`): [`AngularElementData`](../types/angular.md#angularelementdata)[]

Defined in: [services/indexer.ts:1410](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1410)

Gets all elements for a given selector.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selector` | `string` | The selector to search for. |

###### Returns

[`AngularElementData`](../types/angular.md#angularelementdata)[]

An array of `AngularElementData` objects.

##### getExternalModuleExports()

> **getExternalModuleExports**(`moduleName`): `undefined` \| `Set`\<`string`\>

Defined in: [services/indexer.ts:1422](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1422)

Gets all exported entities from an external module.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleName` | `string` | The name of the external module (e.g., "MatTableModule"). |

###### Returns

`undefined` \| `Set`\<`string`\>

A Set of exported entity names or undefined if module not found.

##### getFallbackResult()

> `private` **getFallbackResult**(`filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:502](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L502)

Gets fallback result using regex parsing.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |
| `content` | `string` |

###### Returns

[`ComponentInfo`](../types/angular.md#componentinfo)[]

##### getNgModuleObjectLiteral()

> `private` **getNgModuleObjectLiteral**(`ngModuleDecorator`): `null` \| `ObjectLiteralExpression`

Defined in: [services/indexer.ts:1821](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1821)

Gets the NgModule decorator's object literal.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `ngModuleDecorator` | `Decorator` |

###### Returns

`null` \| `ObjectLiteralExpression`

##### getOrCreateSourceFile()

> `private` **getOrCreateSourceFile**(`filePath`, `content`): `SourceFile`

Defined in: [services/indexer.ts:510](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L510)

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

Defined in: [services/indexer.ts:949](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L949)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### indexLibraryDeclarations()

> `private` **indexLibraryDeclarations**(`libraryFiles`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1713](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1713)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |
| `componentToModuleMap` | `ComponentToModuleMap` |

###### Returns

`Promise`\<`void`\>

##### indexNodeModules()

> **indexNodeModules**(`context`, `progress?`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1540](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1540)

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

Defined in: [services/indexer.ts:1731](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1731)

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

Defined in: [services/indexer.ts:889](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L889)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parsed` | [`ComponentInfo`](../types/angular.md#componentinfo) |
| `isExternal` | `boolean` |
| `absolutePath?` | `string` |

###### Returns

`Promise`\<`void`\>

##### initializeWatcher()

> **initializeWatcher**(`context`): `void`

Defined in: [services/indexer.ts:424](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L424)

Initializes the file watcher for the project to keep the index up-to-date.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`void`

##### isFileUpToDate()

> `private` **isFileUpToDate**(`cachedFile`, `lastModified`, `hash`): `boolean`

Defined in: [services/indexer.ts:842](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L842)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) |
| `lastModified` | `number` |
| `hash` | `string` |

###### Returns

`boolean`

##### isModule()

> `private` **isModule**(`name`): `boolean`

Defined in: [services/indexer.ts:1436](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1436)

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

Defined in: [services/indexer.ts:1781](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1781)

Checks if a source file is valid.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |

###### Returns

`boolean`

##### loadCacheData()

> `private` **loadCacheData**(`workspaceData`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1241](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1241)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedCache`: `undefined` \| `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\>; `storedExternalModulesExports?`: `Record`\<`string`, `string`[]\>; `storedIndex`: `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>; `storedModules?`: `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\>; \} |
| `workspaceData.storedCache` | `undefined` \| `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> |
| `workspaceData.storedExternalModulesExports?` | `Record`\<`string`, `string`[]\> |
| `workspaceData.storedIndex` | `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> |
| `workspaceData.storedModules?` | `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`Promise`\<`void`\>

##### loadExternalModuleExports()

> `private` **loadExternalModuleExports**(`workspaceData`): `void`

Defined in: [services/indexer.ts:1325](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1325)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedExternalModulesExports?`: `Record`\<`string`, `string`[]\>; \} |
| `workspaceData.storedExternalModulesExports?` | `Record`\<`string`, `string`[]\> |

###### Returns

`void`

##### loadFromWorkspace()

> **loadFromWorkspace**(`context`): `Promise`\<`boolean`\>

Defined in: [services/indexer.ts:1189](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1189)

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

Defined in: [services/indexer.ts:1288](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1288)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `value` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`Promise`\<`void`\>

##### loadLibrarySourceFiles()

> `private` **loadLibrarySourceFiles**(`entryPoints`): `object`[]

Defined in: [services/indexer.ts:1627](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1627)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entryPoints` | `Map`\<`string`, `string`\> |

###### Returns

`object`[]

##### loadModuleData()

> `private` **loadModuleData**(`workspaceData`): `void`

Defined in: [services/indexer.ts:1307](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1307)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedModules?`: `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\>; \} |
| `workspaceData.storedModules?` | `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`void`

##### parseAngularElementsWithTsMorph()

> `private` **parseAngularElementsWithTsMorph**(`filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:483](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L483)

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

> `private` **parseAngularElementWithRegex**(`filePath`, `content`): `null` \| [`ComponentInfo`](../types/angular.md#componentinfo)

Defined in: [services/indexer.ts:723](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L723)

**`Internal`**

Parses a TypeScript file using regex to find Angular elements. This is a fallback for when ts-morph fails.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path to the file. |
| `content` | `string` | The content of the file. |

###### Returns

`null` \| [`ComponentInfo`](../types/angular.md#componentinfo)

A `ComponentInfo` object or `null` if no element is found.

##### processAndIndexElements()

> `private` **processAndIndexElements**(`filePath`, `parsedElements`, `lastModified`, `hash`, `isExternal`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:869](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L869)

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

Defined in: [services/indexer.ts:1832](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1832)

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

Defined in: [services/indexer.ts:1794](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1794)

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

Defined in: [services/indexer.ts:827](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L827)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) | [services/indexer.ts:831](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L831) |
| `content` | `string` | [services/indexer.ts:828](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L828) |
| `hash` | `string` | [services/indexer.ts:829](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L829) |
| `lastModified` | `number` | [services/indexer.ts:830](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L830) |

##### removeFromIndex()

> `private` **removeFromIndex**(`filePath`, `context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:961](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L961)

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

Defined in: [services/indexer.ts:856](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L856)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) |

###### Returns

`Promise`\<`void`\>

##### removeSourceFileFromProject()

> `private` **removeSourceFileFromProject**(`filePath`): `void`

Defined in: [services/indexer.ts:937](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L937)

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

Defined in: [services/indexer.ts:911](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L911)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parsed` | [`ComponentInfo`](../types/angular.md#componentinfo) |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `importName` | `string` | [services/indexer.ts:913](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L913) |
| `importPath` | `string` | [services/indexer.ts:912](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L912) |
| `moduleToImport` | `undefined` \| `string` | [services/indexer.ts:914](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L914) |

##### retrieveWorkspaceData()

> `private` **retrieveWorkspaceData**(`context`): `object`

Defined in: [services/indexer.ts:1226](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1226)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `ExtensionContext` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `storedCache` | `undefined` \| `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> | [services/indexer.ts:1228](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1228) |
| `storedExternalModulesExports` | `undefined` \| `Record`\<`string`, `string`[]\> | [services/indexer.ts:1235](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1235) |
| `storedIndex` | `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> | [services/indexer.ts:1231](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1231) |
| `storedModules` | `undefined` \| `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> | [services/indexer.ts:1232](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1232) |

##### saveIndexToWorkspace()

> `private` **saveIndexToWorkspace**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1342](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1342)

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

Defined in: [services/indexer.ts:2630](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2630)

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

Defined in: [services/indexer.ts:387](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L387)

Sets the root path of the project to be indexed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectPath` | `string` | The absolute path to the project root. |

###### Returns

`void`

##### storeModuleExports()

> `private` **storeModuleExports**(`moduleName`, `exportedIdentifiers`): `void`

Defined in: [services/indexer.ts:1846](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1846)

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

Defined in: [services/indexer.ts:846](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L846)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) |
| `lastModified` | `number` |

###### Returns

`void`

##### updateExistingSourceFile()

> `private` **updateExistingSourceFile**(`sourceFile`, `filePath`, `content`): `SourceFile`

Defined in: [services/indexer.ts:527](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L527)

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

> `private` **updateFileIndex**(`filePath`, `context`, `isExternal`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:777](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L777)

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

Defined in: [services/indexer.ts:1856](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1856)

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

Defined in: [services/indexer.ts:809](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L809)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`boolean`
