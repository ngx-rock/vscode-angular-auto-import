[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / services/indexer

# services/indexer

Angular Indexer Service
Responsible for indexing Angular components, directives, and pipes.

## Classes

### AngularIndexer

Defined in: [services/indexer.ts:235](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L235)

The main class responsible for indexing Angular elements in a project.

#### Constructors

##### Constructor

> **new AngularIndexer**(): [`AngularIndexer`](#angularindexer)

Defined in: [services/indexer.ts:263](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L263)

###### Returns

[`AngularIndexer`](#angularindexer)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="filecache"></a> `fileCache` | `private` | `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> | `undefined` | - | [services/indexer.ts:240](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L240) |
| <a id="filewatcher"></a> `fileWatcher` | `public` | `null` \| `FileSystemWatcher` | `null` | The file watcher for the project. | [services/indexer.ts:246](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L246) |
| <a id="isindexing"></a> `isIndexing` | `private` | `boolean` | `false` | - | [services/indexer.ts:248](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L248) |
| <a id="project"></a> `project` | `public` | `Project` | `undefined` | The ts-morph project instance. | [services/indexer.ts:239](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L239) |
| <a id="projectmodulemap"></a> `projectModuleMap` | `private` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | `undefined` | - | [services/indexer.ts:242](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L242) |
| <a id="projectrootpath"></a> `projectRootPath` | `private` | `string` | `""` | - | [services/indexer.ts:247](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L247) |
| <a id="selectortrie"></a> `selectorTrie` | `private` | `SelectorTrie` | `undefined` | - | [services/indexer.ts:241](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L241) |
| <a id="workspacefilecachekey"></a> `workspaceFileCacheKey` | `public` | `string` | `""` | The cache key for the file cache in the workspace state. | [services/indexer.ts:253](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L253) |
| <a id="workspaceindexcachekey"></a> `workspaceIndexCacheKey` | `public` | `string` | `""` | The cache key for the selector index in the workspace state. | [services/indexer.ts:257](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L257) |
| <a id="workspacemodulescachekey"></a> `workspaceModulesCacheKey` | `public` | `string` | `""` | The cache key for the module map in the workspace state. | [services/indexer.ts:261](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L261) |

#### Methods

##### \_buildComponentToModuleMap()

> `private` **\_buildComponentToModuleMap**(`sourceFile`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:1217](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1217)

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

##### \_getIdentifierNamesFromArrayProp()

> `private` **\_getIdentifierNamesFromArrayProp**(`prop`): `string`[]

Defined in: [services/indexer.ts:1195](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1195)

**`Internal`**

Gets the names of identifiers in an array property.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `undefined` \| `PropertyAssignment` | The property assignment to get the identifiers from. |

###### Returns

`string`[]

An array of identifier names.

##### \_indexDeclarationsInFile()

> `private` **\_indexDeclarationsInFile**(`sourceFile`, `importPath`, `componentToModuleMap`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1358](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1358)

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

Defined in: [services/indexer.ts:1053](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1053)

**`Internal`**

Indexes a library from its entry points.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `entryPoints` | `Map`\<`string`, `string`\> | A map of import paths to file paths. |

###### Returns

`Promise`\<`void`\>

##### \_processModuleExports()

> `private` **\_processModuleExports**(`exportsTuple`, `moduleName`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:1286](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1286)

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

###### Returns

`void`

##### \_processProjectModuleFile()

> `private` **\_processProjectModuleFile**(`sourceFile`): `void`

Defined in: [services/indexer.ts:1149](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1149)

**`Internal`**

Processes a single project module file.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceFile` | `SourceFile` | The source file to process. |

###### Returns

`void`

##### clearCache()

> **clearCache**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:960](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L960)

Clears the index from memory and the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### dispose()

> **dispose**(): `void`

Defined in: [services/indexer.ts:1615](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1615)

Disposes the file watcher and clears the caches.

###### Returns

`void`

##### extractAngularElementInfo()

> `private` **extractAngularElementInfo**(`classDeclaration`, `filePath`, `fileContent`): `null` \| [`ComponentInfo`](../types/angular.md#componentinfo)

Defined in: [services/indexer.ts:409](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L409)

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

Defined in: [services/indexer.ts:475](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L475)

**`Internal`**

Extracts the selector and standalone flag from a `@Component` decorator.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `decorator` | `Decorator` | The decorator to extract information from. |

###### Returns

`object`

An object containing the selector and standalone flag.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `selector?` | `string` | [services/indexer.ts:475](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L475) |
| `standalone` | `boolean` | [services/indexer.ts:475](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L475) |

##### extractDirectiveDecoratorData()

> `private` **extractDirectiveDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:515](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L515)

**`Internal`**

Extracts the selector and standalone flag from a `@Directive` decorator.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `decorator` | `Decorator` | The decorator to extract information from. |

###### Returns

`object`

An object containing the selector and standalone flag.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `selector?` | `string` | [services/indexer.ts:515](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L515) |
| `standalone` | `boolean` | [services/indexer.ts:515](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L515) |

##### extractPipeDecoratorData()

> `private` **extractPipeDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:551](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L551)

**`Internal`**

Extracts the name and standalone flag from a `@Pipe` decorator.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `decorator` | `Decorator` | The decorator to extract information from. |

###### Returns

`object`

An object containing the name and standalone flag.

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `name?` | `string` | [services/indexer.ts:551](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L551) |
| `standalone` | `boolean` | [services/indexer.ts:551](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L551) |

##### generateFullIndex()

> **generateFullIndex**(`context`): `Promise`\<`Map`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>\>

Defined in: [services/indexer.ts:793](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L793)

Generates a full index of the project.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`Map`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>\>

A map of selectors to `AngularElementData` objects.

##### generateHash()

> `private` **generateHash**(`content`): `string`

Defined in: [services/indexer.ts:341](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L341)

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

Defined in: [services/indexer.ts:1530](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1530)

Gets all indexed selectors.

###### Returns

`string`[]

An array of selectors.

##### getAngularFilesFallback()

> `private` **getAngularFilesFallback**(`basePath`): `string`[]

Defined in: [services/indexer.ts:1574](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1574)

**`Internal`**

Gets all Angular files in the project using a fallback method.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `basePath` | `string` | The base path of the project. |

###### Returns

`string`[]

An array of file paths.

##### getAngularFilesUsingVsCode()

> `private` **getAngularFilesUsingVsCode**(): `Promise`\<`string`[]\>

Defined in: [services/indexer.ts:1548](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1548)

**`Internal`**

Gets all Angular files in the project using the VS Code API.

###### Returns

`Promise`\<`string`[]\>

An array of file paths.

##### getElements()

> **getElements**(`selector`): [`AngularElementData`](../types/angular.md#angularelementdata)[]

Defined in: [services/indexer.ts:993](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L993)

Gets all elements for a given selector.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selector` | `string` | The selector to search for. |

###### Returns

[`AngularElementData`](../types/angular.md#angularelementdata)[]

An array of `AngularElementData` objects.

##### indexNodeModules()

> **indexNodeModules**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1004](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1004)

Indexes all Angular libraries in `node_modules`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### indexProjectModules()

> `private` **indexProjectModules**(): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1111](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1111)

**`Internal`**

Indexes all NgModules in the project.

###### Returns

`Promise`\<`void`\>

##### initializeWatcher()

> **initializeWatcher**(`context`): `void`

Defined in: [services/indexer.ts:299](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L299)

Initializes the file watcher for the project to keep the index up-to-date.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`void`

##### loadFromWorkspace()

> **loadFromWorkspace**(`context`): `Promise`\<`boolean`\>

Defined in: [services/indexer.ts:853](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L853)

Loads the index from the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`boolean`\>

`true` if the index was loaded successfully, `false` otherwise.

##### parseAngularElementsWithTsMorph()

> `private` **parseAngularElementsWithTsMorph**(`filePath`, `content`): [`ComponentInfo`](../types/angular.md#componentinfo)[]

Defined in: [services/indexer.ts:358](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L358)

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

Defined in: [services/indexer.ts:588](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L588)

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

##### removeFromIndex()

> `private` **removeFromIndex**(`filePath`, `context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:763](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L763)

**`Internal`**

Removes a file from the index.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path to the file. |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### saveIndexToWorkspace()

> `private` **saveIndexToWorkspace**(`context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:934](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L934)

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

Defined in: [services/indexer.ts:1539](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1539)

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

Defined in: [services/indexer.ts:276](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L276)

Sets the root path of the project to be indexed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectPath` | `string` | The absolute path to the project root. |

###### Returns

`void`

##### updateFileIndex()

> `private` **updateFileIndex**(`filePath`, `context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:642](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L642)

**`Internal`**

Updates the index for a single file.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path to the file. |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>
