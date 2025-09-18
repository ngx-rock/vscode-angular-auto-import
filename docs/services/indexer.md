[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / services/indexer

# services/indexer

Angular Indexer Service
Responsible for indexing Angular components, directives, and pipes.

## Classes

### AngularIndexer

Defined in: [services/indexer.ts:252](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L252)

The main class responsible for indexing Angular elements in a project.

#### Constructors

##### Constructor

> **new AngularIndexer**(): [`AngularIndexer`](#angularindexer)

Defined in: [services/indexer.ts:291](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L291)

###### Returns

[`AngularIndexer`](#angularindexer)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="externalmoduleexportsindex"></a> `externalModuleExportsIndex` | `private` | `Map`\<`string`, `Set`\<`string`\>\> | `undefined` | Index of external modules and their exported entities. Key: module name (e.g., "MatTableModule") Value: Set of exported entity names (e.g., Set(["MatTable", "MatHeaderCell", ...])) | [services/indexer.ts:266](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L266) |
| <a id="filecache"></a> `fileCache` | `private` | `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> | `undefined` | - | [services/indexer.ts:257](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L257) |
| <a id="filewatcher"></a> `fileWatcher` | `public` | `null` \| `FileSystemWatcher` | `null` | The file watcher for the project. | [services/indexer.ts:270](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L270) |
| <a id="isindexing"></a> `isIndexing` | `private` | `boolean` | `false` | - | [services/indexer.ts:272](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L272) |
| <a id="project"></a> `project` | `public` | `Project` | `undefined` | The ts-morph project instance. | [services/indexer.ts:256](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L256) |
| <a id="projectmodulemap"></a> `projectModuleMap` | `private` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | `undefined` | - | [services/indexer.ts:260](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L260) |
| <a id="projectrootpath"></a> `projectRootPath` | `private` | `string` | `""` | - | [services/indexer.ts:271](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L271) |
| <a id="selectortrie"></a> `selectorTrie` | `private` | `SelectorTrie` | `undefined` | - | [services/indexer.ts:258](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L258) |
| <a id="workspaceexternalmodulesexportscachekey"></a> `workspaceExternalModulesExportsCacheKey` | `public` | `string` | `""` | The cache key for the external modules exports index in the workspace state. | [services/indexer.ts:289](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L289) |
| <a id="workspacefilecachekey"></a> `workspaceFileCacheKey` | `public` | `string` | `""` | The cache key for the file cache in the workspace state. | [services/indexer.ts:277](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L277) |
| <a id="workspaceindexcachekey"></a> `workspaceIndexCacheKey` | `public` | `string` | `""` | The cache key for the selector index in the workspace state. | [services/indexer.ts:281](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L281) |
| <a id="workspacemodulescachekey"></a> `workspaceModulesCacheKey` | `public` | `string` | `""` | The cache key for the module map in the workspace state. | [services/indexer.ts:285](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L285) |

#### Methods

##### \_analyzeAngularElement()

> `private` **\_analyzeAngularElement**(`classDecl`): `null` \| \{ `elementType`: `"directive"` \| `"pipe"` \| `"component"`; `isStandalone`: `boolean`; `selector`: `string`; \}

Defined in: [services/indexer.ts:2129](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2129)

**`Internal`**

Analyzes a class declaration to extract Angular element information.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDecl` | `ClassDeclaration` | The class declaration to analyze. |

###### Returns

`null` \| \{ `elementType`: `"directive"` \| `"pipe"` \| `"component"`; `isStandalone`: `boolean`; `selector`: `string`; \}

The element information or null if not an Angular element.

##### \_analyzeElementType()

> `private` **\_analyzeElementType**(`classDecl`, `propertyName`, `elementType`): `null` \| \{ `elementType`: `"directive"` \| `"component"`; `isStandalone`: `boolean`; `selector`: `string`; \}

Defined in: [services/indexer.ts:2153](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2153)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDecl` | `ClassDeclaration` |
| `propertyName` | `"ɵcmp"` \| `"ɵdir"` |
| `elementType` | `"directive"` \| `"component"` |

###### Returns

`null` \| \{ `elementType`: `"directive"` \| `"component"`; `isStandalone`: `boolean`; `selector`: `string`; \}

##### \_analyzePipeElement()

> `private` **\_analyzePipeElement**(`classDecl`): `null` \| \{ `elementType`: `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \}

Defined in: [services/indexer.ts:2181](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2181)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDecl` | `ClassDeclaration` |

###### Returns

`null` \| \{ `elementType`: `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \}

##### \_buildComponentToModuleMap()

> `private` **\_buildComponentToModuleMap**(`sourceFile`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:1740](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1740)

**`Internal`**

Builds a map of components to the modules that export them.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceFile` | `SourceFile` | The source file to process. |
| `importPath` | `string` | The import path of the source file. |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | The map to store the component-to-module mappings. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | A map of all classes in the library. |
| `typeChecker` | `TypeChecker` | The type checker to use. |

###### Returns

`void`

##### \_collectClassDeclarations()

> `private` **\_collectClassDeclarations**(`sourceFile`): `Map`\<`string`, `ClassDeclaration`\>

Defined in: [services/indexer.ts:2051](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2051)

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

> `private` **\_createAndIndexElementData**(`className`, `elementType`, `selector`, `isStandalone`, `importPath`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:2231](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2231)

**`Internal`**

Creates and indexes Angular element data.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `className` | `string` | The class name. |
| `elementType` | `"directive"` \| `"pipe"` \| `"component"` | The element type. |
| `selector` | `string` | The selector string. |
| `isStandalone` | `boolean` | Whether the element is standalone. |
| `importPath` | `string` | The original import path. |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | Map of components to modules. |

###### Returns

`Promise`\<`void`\>

##### \_extractPipeSelectorFromTypeReference()

> `private` **\_extractPipeSelectorFromTypeReference**(`typeRef`): `null` \| `string`

Defined in: [services/indexer.ts:2207](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2207)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `typeRef` | `TypeReferenceNode` |

###### Returns

`null` \| `string`

##### \_extractSelectorFromTypeReference()

> `private` **\_extractSelectorFromTypeReference**(`typeRef`): `undefined` \| `string`

Defined in: [services/indexer.ts:2106](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2106)

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

Defined in: [services/indexer.ts:1067](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1067)

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

Defined in: [services/indexer.ts:2085](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2085)

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
| `owner` | `ClassDeclaration` | [services/indexer.ts:2088](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2088) |
| `prop` | `undefined` \| `PropertyDeclaration` | [services/indexer.ts:2088](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2088) |

##### \_getIdentifierNamesFromArrayProp()

> `private` **\_getIdentifierNamesFromArrayProp**(`prop`): `string`[]

Defined in: [services/indexer.ts:1700](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1700)

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

Defined in: [services/indexer.ts:1091](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1091)

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

Defined in: [services/indexer.ts:2294](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2294)

**`Internal`**

Handles the special indexing logic for standalone components from external libraries.
It ensures that only one candidate with the shortest (most public) import path is stored.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `className` | `string` |
| `elementType` | `"directive"` \| `"pipe"` \| `"component"` |
| `currentImportPath` | `string` |
| `selectors` | `string`[] |

###### Returns

`null` \| `string`

The determined final import path if processing should continue, or null if the candidate should be skipped.

##### \_indexDeclarationsInFile()

> `private` **\_indexDeclarationsInFile**(`sourceFile`, `importPath`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:2340](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2340)

**`Internal`**

Indexes the declarations in a file.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceFile` | `SourceFile` | The source file to process. |
| `importPath` | `string` | The import path of the source file. |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | A map of components to the modules that export them. |

###### Returns

`Promise`\<`void`\>

##### \_indexLibrary()

> `private` **\_indexLibrary**(`entryPoints`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1437](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1437)

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

Defined in: [services/indexer.ts:1023](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1023)

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

Defined in: [services/indexer.ts:1930](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1930)

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

Defined in: [services/indexer.ts:2019](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2019)

**`Internal`**

Determines if an element is standalone from its compiled type reference.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `typeRef` | `TypeReferenceNode` | The type reference node from a static property (e.g., `ɵcmp`). |
| `elementType` | `"directive"` \| `"pipe"` \| `"component"` | The type of the Angular element. |

###### Returns

`boolean`

`true` if the element is standalone, `false` otherwise.

##### \_mapComponentToModule()

> `private` **\_mapComponentToModule**(`exportedClassName`, `moduleName`, `importPath`, `componentToModuleMap`, `moduleExports?`): `void`

Defined in: [services/indexer.ts:1990](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1990)

**`Internal`**

Maps a component/directive/pipe to its module.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `exportedClassName` | `string` | The name of the exported class. |
| `moduleName` | `string` | The module name. |
| `importPath` | `string` | The import path. |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | The mapping to update. |
| `moduleExports?` | `Set`\<`string`\> | Optional set to add exports to. |

###### Returns

`void`

##### \_processModuleExports()

> `private` **\_processModuleExports**(`exportsTuple`, `moduleName`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`, `moduleExports?`): `void`

Defined in: [services/indexer.ts:1862](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1862)

**`Internal`**

Processes the exports of a module.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `exportsTuple` | `TupleTypeNode` | The tuple of exported elements. |
| `moduleName` | `string` | The name of the module. |
| `importPath` | `string` | The import path of the module. |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | The map to store the component-to-module mappings. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | A map of all classes in the library. |
| `typeChecker` | `TypeChecker` | The type checker to use. |
| `moduleExports?` | `Set`\<`string`\> | Optional Set to accumulate all exports for the module. |

###### Returns

`void`

##### \_processNgModuleClass()

> `private` **\_processNgModuleClass**(`classDecl`, `className`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:1804](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1804)

**`Internal`**

Processes a single NgModule class and maps its exports.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDecl` | `ClassDeclaration` | The class declaration to process. |
| `className` | `string` | The name of the class. |
| `importPath` | `string` | The import path of the source file. |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | The map to store the component-to-module mappings. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | A map of all classes in the library. |
| `typeChecker` | `TypeChecker` | The type checker to use. |

###### Returns

`void`

##### \_processNgModuleClasses()

> `private` **\_processNgModuleClasses**(`classDeclarations`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:1768](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1768)

**`Internal`**

Processes all NgModule classes and maps their exports.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `classDeclarations` | `Map`\<`string`, `ClassDeclaration`\> | Map of class declarations to process. |
| `importPath` | `string` | The import path of the source file. |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | The map to store the component-to-module mappings. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | A map of all classes in the library. |
| `typeChecker` | `TypeChecker` | The type checker to use. |

###### Returns

`void`

##### \_processProjectModuleFile()

> `private` **\_processProjectModuleFile**(`sourceFile`): `void`

Defined in: [services/indexer.ts:1590](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1590)

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

Defined in: [services/indexer.ts:1945](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1945)

**`Internal`**

Processes a re-exported module by recursively processing its exports.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `exportedClassDecl` | `ClassDeclaration` | The re-exported module class declaration. |
| `moduleName` | `string` | The current module name. |
| `importPath` | `string` | The import path. |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | The component-to-module mapping. |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> | Map of all class declarations. |
| `typeChecker` | `TypeChecker` | The type checker. |
| `moduleExports?` | `Set`\<`string`\> | Optional set to accumulate exports. |

###### Returns

`void`

##### \_resolveExportedClassName()

> `private` **\_resolveExportedClassName**(`element`, `typeChecker`): `undefined` \| `string`

Defined in: [services/indexer.ts:1905](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1905)

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

Defined in: [services/indexer.ts:469](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L469)

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

> `private` **buildLibraryComponentToModuleMap**(`libraryFiles`, `allLibraryClasses`, `typeChecker`): `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\>

Defined in: [services/indexer.ts:1514](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1514)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> |
| `typeChecker` | `TypeChecker` |

###### Returns

`Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\>

##### clearCache()

> **clearCache**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1289](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1289)

Clears the index from memory and the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### collectAllLibraryClasses()

> `private` **collectAllLibraryClasses**(`libraryFiles`): `Map`\<`string`, `ClassDeclaration`\>

Defined in: [services/indexer.ts:1475](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1475)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |

###### Returns

`Map`\<`string`, `ClassDeclaration`\>

##### collectClassesFromSourceFile()

> `private` **collectClassesFromSourceFile**(`sourceFile`, `allLibraryClasses`): `void`

Defined in: [services/indexer.ts:1492](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1492)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> |

###### Returns

`void`

##### convertCacheFormat()

> `private` **convertCacheFormat**(`storedCache`): `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>

Defined in: [services/indexer.ts:1186](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1186)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `storedCache` | `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> |

###### Returns

`Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>

##### dispose()

> **dispose**(): `void`

Defined in: [services/indexer.ts:2397](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2397)

Disposes the file watcher and clears the caches.

###### Returns

`void`

##### extractAngularElementInfo()

> `private` **extractAngularElementInfo**(`classDeclaration`, `filePath`, `fileContent`): `null` \| [`ComponentInfo`](../types/angular.md#componentinfo)

Defined in: [services/indexer.ts:487](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L487)

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

Defined in: [services/indexer.ts:550](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L550)

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
| `selector?` | `string` | [services/indexer.ts:550](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L550) |

##### extractDirectiveDecoratorData()

> `private` **extractDirectiveDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:580](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L580)

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
| `selector?` | `string` | [services/indexer.ts:580](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L580) |

##### extractElementsFromSourceFile()

> `private` **extractElementsFromSourceFile**(`sourceFile`, `filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:448](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L448)

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

Defined in: [services/indexer.ts:609](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L609)

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
| `name?` | `string` | [services/indexer.ts:609](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L609) |

##### generateFullIndex()

> **generateFullIndex**(`context`, `progress?`): `Promise`\<`Map`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>\>

Defined in: [services/indexer.ts:904](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L904)

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

Defined in: [services/indexer.ts:370](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L370)

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

Defined in: [services/indexer.ts:2381](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2381)

Gets all indexed selectors.

###### Returns

`string`[]

An array of selectors.

##### getElements()

> **getElements**(`selector`): [`AngularElementData`](../types/angular.md#angularelementdata)[]

Defined in: [services/indexer.ts:1334](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1334)

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

Defined in: [services/indexer.ts:1346](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1346)

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

Defined in: [services/indexer.ts:406](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L406)

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

Defined in: [services/indexer.ts:1644](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1644)

Gets the NgModule decorator's object literal.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `ngModuleDecorator` | `Decorator` |

###### Returns

`null` \| `ObjectLiteralExpression`

##### getOrCreateSourceFile()

> `private` **getOrCreateSourceFile**(`filePath`, `content`): `SourceFile`

Defined in: [services/indexer.ts:414](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L414)

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

Defined in: [services/indexer.ts:847](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L847)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### indexLibraryDeclarations()

> `private` **indexLibraryDeclarations**(`libraryFiles`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1533](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1533)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |
| `componentToModuleMap` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`Promise`\<`void`\>

##### indexNodeModules()

> **indexNodeModules**(`context`, `progress?`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1358](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1358)

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

Defined in: [services/indexer.ts:1552](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1552)

**`Internal`**

Indexes all NgModules in the project.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `moduleFileUris` | `Uri`[] | An array of module file URIs to index. |

###### Returns

`Promise`\<`void`\>

##### indexSingleElement()

> `private` **indexSingleElement**(`parsed`, `isExternal`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:805](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L805)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parsed` | [`ComponentInfo`](../types/angular.md#componentinfo) |
| `isExternal` | `boolean` |

###### Returns

`Promise`\<`void`\>

##### initializeWatcher()

> **initializeWatcher**(`context`): `void`

Defined in: [services/indexer.ts:328](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L328)

Initializes the file watcher for the project to keep the index up-to-date.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`void`

##### isFileUpToDate()

> `private` **isFileUpToDate**(`cachedFile`, `lastModified`, `hash`): `boolean`

Defined in: [services/indexer.ts:758](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L758)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) |
| `lastModified` | `number` |
| `hash` | `string` |

###### Returns

`boolean`

##### isSourceFileValid()

> `private` **isSourceFileValid**(`sourceFile`): `boolean`

Defined in: [services/indexer.ts:1604](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1604)

Checks if a source file is valid.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |

###### Returns

`boolean`

##### loadCacheData()

> `private` **loadCacheData**(`workspaceData`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1164](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1164)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedCache`: `undefined` \| `Record`\<`string`, [`ComponentInfo`](../types/angular.md#componentinfo) \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>; `storedExternalModulesExports?`: `Record`\<`string`, `string`[]\>; `storedIndex`: `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>; `storedModules?`: `Record`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\>; \} |
| `workspaceData.storedCache` | `undefined` \| `Record`\<`string`, [`ComponentInfo`](../types/angular.md#componentinfo) \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> |
| `workspaceData.storedExternalModulesExports?` | `Record`\<`string`, `string`[]\> |
| `workspaceData.storedIndex` | `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> |
| `workspaceData.storedModules?` | `Record`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`Promise`\<`void`\>

##### loadExternalModuleExports()

> `private` **loadExternalModuleExports**(`workspaceData`): `void`

Defined in: [services/indexer.ts:1237](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1237)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedExternalModulesExports?`: `Record`\<`string`, `string`[]\>; \} |
| `workspaceData.storedExternalModulesExports?` | `Record`\<`string`, `string`[]\> |

###### Returns

`void`

##### loadFromWorkspace()

> **loadFromWorkspace**(`context`): `Promise`\<`boolean`\>

Defined in: [services/indexer.ts:1116](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1116)

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

Defined in: [services/indexer.ts:1211](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1211)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `value` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`Promise`\<`void`\>

##### loadLibrarySourceFiles()

> `private` **loadLibrarySourceFiles**(`entryPoints`): `object`[]

Defined in: [services/indexer.ts:1451](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1451)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entryPoints` | `Map`\<`string`, `string`\> |

###### Returns

`object`[]

##### loadModuleData()

> `private` **loadModuleData**(`workspaceData`): `void`

Defined in: [services/indexer.ts:1229](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1229)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedModules?`: `Record`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\>; \} |
| `workspaceData.storedModules?` | `Record`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`void`

##### parseAngularElementsWithTsMorph()

> `private` **parseAngularElementsWithTsMorph**(`filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:387](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L387)

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

Defined in: [services/indexer.ts:639](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L639)

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

Defined in: [services/indexer.ts:785](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L785)

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

Defined in: [services/indexer.ts:1655](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1655)

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

Defined in: [services/indexer.ts:1617](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1617)

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

Defined in: [services/indexer.ts:743](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L743)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) | [services/indexer.ts:747](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L747) |
| `content` | `string` | [services/indexer.ts:744](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L744) |
| `hash` | `string` | [services/indexer.ts:745](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L745) |
| `lastModified` | `number` | [services/indexer.ts:746](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L746) |

##### removeFromIndex()

> `private` **removeFromIndex**(`filePath`, `context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:867](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L867)

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

Defined in: [services/indexer.ts:772](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L772)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) |

###### Returns

`Promise`\<`void`\>

##### resolveElementImportInfo()

> `private` **resolveElementImportInfo**(`parsed`): `object`

Defined in: [services/indexer.ts:826](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L826)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parsed` | [`ComponentInfo`](../types/angular.md#componentinfo) |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `importName` | `string` | [services/indexer.ts:828](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L828) |
| `importPath` | `string` | [services/indexer.ts:827](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L827) |
| `moduleToImport` | `undefined` \| `string` | [services/indexer.ts:829](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L829) |

##### retrieveWorkspaceData()

> `private` **retrieveWorkspaceData**(`context`): `object`

Defined in: [services/indexer.ts:1149](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1149)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `ExtensionContext` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `storedCache` | `undefined` \| `Record`\<`string`, [`ComponentInfo`](../types/angular.md#componentinfo) \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> | [services/indexer.ts:1151](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1151) |
| `storedExternalModulesExports` | `undefined` \| `Record`\<`string`, `string`[]\> | [services/indexer.ts:1158](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1158) |
| `storedIndex` | `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> | [services/indexer.ts:1154](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1154) |
| `storedModules` | `undefined` \| `Record`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | [services/indexer.ts:1155](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1155) |

##### saveIndexToWorkspace()

> `private` **saveIndexToWorkspace**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1254](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1254)

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

Defined in: [services/indexer.ts:2390](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2390)

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

Defined in: [services/indexer.ts:304](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L304)

Sets the root path of the project to be indexed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectPath` | `string` | The absolute path to the project root. |

###### Returns

`void`

##### storeModuleExports()

> `private` **storeModuleExports**(`moduleName`, `exportedIdentifiers`): `void`

Defined in: [services/indexer.ts:1669](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1669)

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

Defined in: [services/indexer.ts:762](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L762)

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

Defined in: [services/indexer.ts:431](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L431)

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

Defined in: [services/indexer.ts:693](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L693)

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

Defined in: [services/indexer.ts:1679](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1679)

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

Defined in: [services/indexer.ts:725](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L725)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`boolean`
