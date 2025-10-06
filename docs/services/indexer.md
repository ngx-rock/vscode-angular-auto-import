[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / services/indexer

# services/indexer

Angular Indexer Service
Responsible for indexing Angular components, directives, and pipes.

## Classes

### AngularIndexer

Defined in: [services/indexer.ts:323](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L323)

The main class responsible for indexing Angular elements in a project.

#### Constructors

##### Constructor

> **new AngularIndexer**(): [`AngularIndexer`](#angularindexer)

Defined in: [services/indexer.ts:362](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L362)

###### Returns

[`AngularIndexer`](#angularindexer)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="externalmoduleexportsindex"></a> `externalModuleExportsIndex` | `private` | `Map`\<`string`, `Set`\<`string`\>\> | `undefined` | Index of external modules and their exported entities. Key: module name (e.g., "MatTableModule") Value: Set of exported entity names (e.g., Set(["MatTable", "MatHeaderCell", ...])) | [services/indexer.ts:337](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L337) |
| <a id="filecache"></a> `fileCache` | `private` | `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> | `undefined` | - | [services/indexer.ts:328](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L328) |
| <a id="filewatcher"></a> `fileWatcher` | `public` | `null` \| `FileSystemWatcher` | `null` | The file watcher for the project. | [services/indexer.ts:341](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L341) |
| <a id="isindexing"></a> `isIndexing` | `private` | `boolean` | `false` | - | [services/indexer.ts:343](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L343) |
| <a id="project"></a> `project` | `public` | `Project` | `undefined` | The ts-morph project instance. | [services/indexer.ts:327](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L327) |
| <a id="projectmodulemap"></a> `projectModuleMap` | `private` | `ComponentToModuleMap` | `undefined` | - | [services/indexer.ts:331](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L331) |
| <a id="projectrootpath"></a> `projectRootPath` | `private` | `string` | `""` | - | [services/indexer.ts:342](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L342) |
| <a id="selectortrie"></a> `selectorTrie` | `private` | `SelectorTrie` | `undefined` | - | [services/indexer.ts:329](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L329) |
| <a id="workspaceexternalmodulesexportscachekey"></a> `workspaceExternalModulesExportsCacheKey` | `public` | `string` | `""` | The cache key for the external modules exports index in the workspace state. | [services/indexer.ts:360](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L360) |
| <a id="workspacefilecachekey"></a> `workspaceFileCacheKey` | `public` | `string` | `""` | The cache key for the file cache in the workspace state. | [services/indexer.ts:348](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L348) |
| <a id="workspaceindexcachekey"></a> `workspaceIndexCacheKey` | `public` | `string` | `""` | The cache key for the selector index in the workspace state. | [services/indexer.ts:352](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L352) |
| <a id="workspacemodulescachekey"></a> `workspaceModulesCacheKey` | `public` | `string` | `""` | The cache key for the module map in the workspace state. | [services/indexer.ts:356](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L356) |

#### Methods

##### \_analyzeAngularElement()

> `private` **\_analyzeAngularElement**(`classDecl`): `null` \| \{ `elementType`: `"directive"` \| `"pipe"` \| `"component"`; `isStandalone`: `boolean`; `selector`: `string`; \}

Defined in: [services/indexer.ts:2351](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2351)

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

Defined in: [services/indexer.ts:2375](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2375)

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

Defined in: [services/indexer.ts:2403](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2403)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `classDecl` | `ClassDeclaration` |

###### Returns

`null` \| \{ `elementType`: `"pipe"`; `isStandalone`: `boolean`; `selector`: `string`; \}

##### \_buildComponentToModuleMap()

> `private` **\_buildComponentToModuleMap**(`sourceFile`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:1924](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1924)

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

Defined in: [services/indexer.ts:2204](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2204)

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

Defined in: [services/indexer.ts:2273](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2273)

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

Defined in: [services/indexer.ts:2453](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2453)

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
| `componentToModuleMap` | `Map`\<`string`, \{ `exportCount`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> | Map of components to modules. |

###### Returns

`Promise`\<`void`\>

##### \_extractPipeSelectorFromTypeReference()

> `private` **\_extractPipeSelectorFromTypeReference**(`typeRef`): `null` \| `string`

Defined in: [services/indexer.ts:2429](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2429)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `typeRef` | `TypeReferenceNode` |

###### Returns

`null` \| `string`

##### \_extractSelectorFromTypeReference()

> `private` **\_extractSelectorFromTypeReference**(`typeRef`): `undefined` \| `string`

Defined in: [services/indexer.ts:2328](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2328)

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

Defined in: [services/indexer.ts:1138](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1138)

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

Defined in: [services/indexer.ts:2307](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2307)

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
| `owner` | `ClassDeclaration` | [services/indexer.ts:2310](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2310) |
| `prop` | `undefined` \| `PropertyDeclaration` | [services/indexer.ts:2310](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2310) |

##### \_getIdentifierNamesFromArrayProp()

> `private` **\_getIdentifierNamesFromArrayProp**(`prop`): `string`[]

Defined in: [services/indexer.ts:1884](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1884)

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

Defined in: [services/indexer.ts:1162](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1162)

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

Defined in: [services/indexer.ts:2516](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2516)

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

Defined in: [services/indexer.ts:2562](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2562)

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

Defined in: [services/indexer.ts:1610](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1610)

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

Defined in: [services/indexer.ts:1094](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1094)

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

Defined in: [services/indexer.ts:2107](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2107)

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

Defined in: [services/indexer.ts:2241](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2241)

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

Defined in: [services/indexer.ts:2154](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2154)

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

Defined in: [services/indexer.ts:2032](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2032)

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

Defined in: [services/indexer.ts:1988](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1988)

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

Defined in: [services/indexer.ts:1952](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1952)

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

Defined in: [services/indexer.ts:1758](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1758)

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

Defined in: [services/indexer.ts:2122](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2122)

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

Defined in: [services/indexer.ts:2082](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2082)

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

Defined in: [services/indexer.ts:564](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L564)

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

Defined in: [services/indexer.ts:1685](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1685)

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

Defined in: [services/indexer.ts:1374](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1374)

Clears the index from memory and the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### clearInMemoryState()

> `private` **clearInMemoryState**(): `void`

Defined in: [services/indexer.ts:375](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L375)

**`Internal`**

Clears all in-memory state (file cache, selector trie, module maps)

###### Returns

`void`

##### collectAllLibraryClasses()

> `private` **collectAllLibraryClasses**(`libraryFiles`): `Map`\<`string`, `ClassDeclaration`\>

Defined in: [services/indexer.ts:1648](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1648)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |

###### Returns

`Map`\<`string`, `ClassDeclaration`\>

##### collectClassesFromSourceFile()

> `private` **collectClassesFromSourceFile**(`sourceFile`, `allLibraryClasses`): `void`

Defined in: [services/indexer.ts:1664](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1664)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |
| `allLibraryClasses` | `Map`\<`string`, `ClassDeclaration`\> |

###### Returns

`void`

##### convertCacheFormat()

> `private` **convertCacheFormat**(`storedCache`): `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>

Defined in: [services/indexer.ts:1261](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1261)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `storedCache` | `Record`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo) \| [`ComponentInfo`](../types/angular.md#componentinfo)\> |

###### Returns

`Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>

##### dispose()

> **dispose**(): `void`

Defined in: [services/indexer.ts:2619](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2619)

Disposes the file watcher and clears the caches.

###### Returns

`void`

##### ensureCacheKeys()

> **ensureCacheKeys**(`projectRootPath`): `void`

Defined in: [services/indexer.ts:412](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L412)

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

Defined in: [services/indexer.ts:1496](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1496)

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

Defined in: [services/indexer.ts:1447](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1447)

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

Defined in: [services/indexer.ts:582](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L582)

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

Defined in: [services/indexer.ts:672](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L672)

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
| `selector?` | `string` | [services/indexer.ts:672](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L672) |

##### extractDirectiveDecoratorData()

> `private` **extractDirectiveDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:682](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L682)

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
| `selector?` | `string` | [services/indexer.ts:682](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L682) |

##### extractElementsFromSourceFile()

> `private` **extractElementsFromSourceFile**(`sourceFile`, `filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:543](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L543)

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

Defined in: [services/indexer.ts:692](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L692)

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
| `name?` | `string` | [services/indexer.ts:692](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L692) |

##### extractSelectorFromDecorator()

> `private` **extractSelectorFromDecorator**(`decorator`, `errorContext`): `undefined` \| `string`

Defined in: [services/indexer.ts:646](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L646)

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

Defined in: [services/indexer.ts:986](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L986)

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

Defined in: [services/indexer.ts:465](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L465)

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

Defined in: [services/indexer.ts:2603](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2603)

Gets all indexed selectors.

###### Returns

`string`[]

An array of selectors.

##### getElements()

> **getElements**(`selector`): [`AngularElementData`](../types/angular.md#angularelementdata)[]

Defined in: [services/indexer.ts:1407](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1407)

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

Defined in: [services/indexer.ts:1419](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1419)

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

Defined in: [services/indexer.ts:501](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L501)

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

Defined in: [services/indexer.ts:1812](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1812)

Gets the NgModule decorator's object literal.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `ngModuleDecorator` | `Decorator` |

###### Returns

`null` \| `ObjectLiteralExpression`

##### getOrCreateSourceFile()

> `private` **getOrCreateSourceFile**(`filePath`, `content`): `SourceFile`

Defined in: [services/indexer.ts:509](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L509)

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

Defined in: [services/indexer.ts:947](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L947)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`Promise`\<`void`\>

##### indexLibraryDeclarations()

> `private` **indexLibraryDeclarations**(`libraryFiles`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1704](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1704)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `libraryFiles` | `object`[] |
| `componentToModuleMap` | `ComponentToModuleMap` |

###### Returns

`Promise`\<`void`\>

##### indexNodeModules()

> **indexNodeModules**(`context`, `progress?`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1537](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1537)

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

Defined in: [services/indexer.ts:1722](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1722)

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

Defined in: [services/indexer.ts:888](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L888)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parsed` | [`ComponentInfo`](../types/angular.md#componentinfo) |
| `isExternal` | `boolean` |

###### Returns

`Promise`\<`void`\>

##### initializeWatcher()

> **initializeWatcher**(`context`): `void`

Defined in: [services/indexer.ts:423](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L423)

Initializes the file watcher for the project to keep the index up-to-date.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`void`

##### isFileUpToDate()

> `private` **isFileUpToDate**(`cachedFile`, `lastModified`, `hash`): `boolean`

Defined in: [services/indexer.ts:841](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L841)

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

Defined in: [services/indexer.ts:1433](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1433)

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

Defined in: [services/indexer.ts:1772](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1772)

Checks if a source file is valid.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `sourceFile` | `SourceFile` |

###### Returns

`boolean`

##### loadCacheData()

> `private` **loadCacheData**(`workspaceData`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1239](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1239)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedCache`: `undefined` \| `Record`\<`string`, [`ComponentInfo`](../types/angular.md#componentinfo) \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\>; `storedExternalModulesExports?`: `Record`\<`string`, `string`[]\>; `storedIndex`: `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>; `storedModules?`: `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\>; \} |
| `workspaceData.storedCache` | `undefined` \| `Record`\<`string`, [`ComponentInfo`](../types/angular.md#componentinfo) \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> |
| `workspaceData.storedExternalModulesExports?` | `Record`\<`string`, `string`[]\> |
| `workspaceData.storedIndex` | `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> |
| `workspaceData.storedModules?` | `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`Promise`\<`void`\>

##### loadExternalModuleExports()

> `private` **loadExternalModuleExports**(`workspaceData`): `void`

Defined in: [services/indexer.ts:1322](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1322)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedExternalModulesExports?`: `Record`\<`string`, `string`[]\>; \} |
| `workspaceData.storedExternalModulesExports?` | `Record`\<`string`, `string`[]\> |

###### Returns

`void`

##### loadFromWorkspace()

> **loadFromWorkspace**(`context`): `Promise`\<`boolean`\>

Defined in: [services/indexer.ts:1187](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1187)

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

Defined in: [services/indexer.ts:1286](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1286)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `string` |
| `value` | [`AngularElementData`](../types/angular.md#angularelementdata) |

###### Returns

`Promise`\<`void`\>

##### loadLibrarySourceFiles()

> `private` **loadLibrarySourceFiles**(`entryPoints`): `object`[]

Defined in: [services/indexer.ts:1624](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1624)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entryPoints` | `Map`\<`string`, `string`\> |

###### Returns

`object`[]

##### loadModuleData()

> `private` **loadModuleData**(`workspaceData`): `void`

Defined in: [services/indexer.ts:1304](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1304)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `workspaceData` | \{ `storedModules?`: `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\>; \} |
| `workspaceData.storedModules?` | `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> |

###### Returns

`void`

##### parseAngularElementsWithTsMorph()

> `private` **parseAngularElementsWithTsMorph**(`filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:482](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L482)

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

Defined in: [services/indexer.ts:722](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L722)

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

Defined in: [services/indexer.ts:868](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L868)

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

Defined in: [services/indexer.ts:1823](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1823)

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

Defined in: [services/indexer.ts:1785](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1785)

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

Defined in: [services/indexer.ts:826](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L826)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) | [services/indexer.ts:830](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L830) |
| `content` | `string` | [services/indexer.ts:827](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L827) |
| `hash` | `string` | [services/indexer.ts:828](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L828) |
| `lastModified` | `number` | [services/indexer.ts:829](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L829) |

##### removeFromIndex()

> `private` **removeFromIndex**(`filePath`, `context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:959](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L959)

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

Defined in: [services/indexer.ts:855](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L855)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `cachedFile` | `undefined` \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo) |

###### Returns

`Promise`\<`void`\>

##### removeSourceFileFromProject()

> `private` **removeSourceFileFromProject**(`filePath`): `void`

Defined in: [services/indexer.ts:935](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L935)

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

Defined in: [services/indexer.ts:909](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L909)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `parsed` | [`ComponentInfo`](../types/angular.md#componentinfo) |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `importName` | `string` | [services/indexer.ts:911](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L911) |
| `importPath` | `string` | [services/indexer.ts:910](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L910) |
| `moduleToImport` | `undefined` \| `string` | [services/indexer.ts:912](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L912) |

##### retrieveWorkspaceData()

> `private` **retrieveWorkspaceData**(`context`): `object`

Defined in: [services/indexer.ts:1224](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1224)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | `ExtensionContext` |

###### Returns

`object`

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `storedCache` | `undefined` \| `Record`\<`string`, [`ComponentInfo`](../types/angular.md#componentinfo) \| [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> | [services/indexer.ts:1226](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1226) |
| `storedExternalModulesExports` | `undefined` \| `Record`\<`string`, `string`[]\> | [services/indexer.ts:1233](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1233) |
| `storedIndex` | `undefined` \| `Record`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\> | [services/indexer.ts:1229](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1229) |
| `storedModules` | `undefined` \| `Record`\<`string`, \{ `exportCount?`: `number`; `importPath`: `string`; `moduleName`: `string`; \}\> | [services/indexer.ts:1230](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1230) |

##### saveIndexToWorkspace()

> `private` **saveIndexToWorkspace**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1339](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1339)

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

Defined in: [services/indexer.ts:2612](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L2612)

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

Defined in: [services/indexer.ts:386](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L386)

Sets the root path of the project to be indexed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectPath` | `string` | The absolute path to the project root. |

###### Returns

`void`

##### storeModuleExports()

> `private` **storeModuleExports**(`moduleName`, `exportedIdentifiers`): `void`

Defined in: [services/indexer.ts:1837](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1837)

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

Defined in: [services/indexer.ts:845](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L845)

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

Defined in: [services/indexer.ts:526](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L526)

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

Defined in: [services/indexer.ts:776](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L776)

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

Defined in: [services/indexer.ts:1847](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1847)

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

Defined in: [services/indexer.ts:808](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L808)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |

###### Returns

`boolean`
