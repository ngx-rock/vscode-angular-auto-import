[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / services/indexer

# services/indexer

Angular Indexer Service
Responsible for indexing Angular components, directives, and pipes.

## Classes

### AngularIndexer

Defined in: [services/indexer.ts:234](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L234)

The main class responsible for indexing Angular elements in a project.

#### Constructors

##### Constructor

> **new AngularIndexer**(): [`AngularIndexer`](#angularindexer)

Defined in: [services/indexer.ts:262](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L262)

###### Returns

[`AngularIndexer`](#angularindexer)

#### Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="filecache"></a> `fileCache` | `private` | `Map`\<`string`, [`FileElementsInfo`](../types/angular.md#fileelementsinfo)\> | `undefined` | - | [services/indexer.ts:239](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L239) |
| <a id="filewatcher"></a> `fileWatcher` | `public` | `null` \| `FileSystemWatcher` | `null` | The file watcher for the project. | [services/indexer.ts:245](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L245) |
| <a id="isindexing"></a> `isIndexing` | `private` | `boolean` | `false` | - | [services/indexer.ts:247](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L247) |
| <a id="project"></a> `project` | `public` | `Project` | `undefined` | The ts-morph project instance. | [services/indexer.ts:238](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L238) |
| <a id="projectmodulemap"></a> `projectModuleMap` | `private` | `Map`\<`string`, \{ `importPath`: `string`; `moduleName`: `string`; \}\> | `undefined` | - | [services/indexer.ts:241](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L241) |
| <a id="projectrootpath"></a> `projectRootPath` | `private` | `string` | `""` | - | [services/indexer.ts:246](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L246) |
| <a id="selectortrie"></a> `selectorTrie` | `private` | `SelectorTrie` | `undefined` | - | [services/indexer.ts:240](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L240) |
| <a id="workspacefilecachekey"></a> `workspaceFileCacheKey` | `public` | `string` | `""` | The cache key for the file cache in the workspace state. | [services/indexer.ts:252](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L252) |
| <a id="workspaceindexcachekey"></a> `workspaceIndexCacheKey` | `public` | `string` | `""` | The cache key for the selector index in the workspace state. | [services/indexer.ts:256](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L256) |
| <a id="workspacemodulescachekey"></a> `workspaceModulesCacheKey` | `public` | `string` | `""` | The cache key for the module map in the workspace state. | [services/indexer.ts:260](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L260) |

#### Methods

##### \_buildComponentToModuleMap()

> `private` **\_buildComponentToModuleMap**(`sourceFile`, `importPath`, `componentToModuleMap`, `allLibraryClasses`, `typeChecker`): `void`

Defined in: [services/indexer.ts:1211](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1211)

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

Defined in: [services/indexer.ts:1189](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1189)

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

Defined in: [services/indexer.ts:1352](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1352)

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

Defined in: [services/indexer.ts:1047](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1047)

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

Defined in: [services/indexer.ts:1280](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1280)

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

Defined in: [services/indexer.ts:1143](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1143)

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

Defined in: [services/indexer.ts:954](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L954)

Clears the index from memory and the workspace state.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### dispose()

> **dispose**(): `void`

Defined in: [services/indexer.ts:1608](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1608)

Disposes the file watcher and clears the caches.

###### Returns

`void`

##### extractAngularElementInfo()

> `private` **extractAngularElementInfo**(`classDeclaration`, `filePath`, `fileContent`): `null` \| [`ComponentInfo`](../types/angular.md#componentinfo)

Defined in: [services/indexer.ts:408](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L408)

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

Defined in: [services/indexer.ts:474](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L474)

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
| `selector?` | `string` | [services/indexer.ts:474](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L474) |
| `standalone` | `boolean` | [services/indexer.ts:474](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L474) |

##### extractDirectiveDecoratorData()

> `private` **extractDirectiveDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:514](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L514)

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
| `selector?` | `string` | [services/indexer.ts:514](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L514) |
| `standalone` | `boolean` | [services/indexer.ts:514](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L514) |

##### extractPipeDecoratorData()

> `private` **extractPipeDecoratorData**(`decorator`): `object`

Defined in: [services/indexer.ts:550](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L550)

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
| `name?` | `string` | [services/indexer.ts:550](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L550) |
| `standalone` | `boolean` | [services/indexer.ts:550](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L550) |

##### generateFullIndex()

> **generateFullIndex**(`context`): `Promise`\<`Map`\<`string`, [`AngularElementData`](../types/angular.md#angularelementdata)\>\>

Defined in: [services/indexer.ts:791](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L791)

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

Defined in: [services/indexer.ts:340](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L340)

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

Defined in: [services/indexer.ts:1523](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1523)

Gets all indexed selectors.

###### Returns

`string`[]

An array of selectors.

##### getAngularFilesFallback()

> `private` **getAngularFilesFallback**(`basePath`): `string`[]

Defined in: [services/indexer.ts:1567](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1567)

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

Defined in: [services/indexer.ts:1541](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1541)

**`Internal`**

Gets all Angular files in the project using the VS Code API.

###### Returns

`Promise`\<`string`[]\>

An array of file paths.

##### getElements()

> **getElements**(`selector`): [`AngularElementData`](../types/angular.md#angularelementdata)[]

Defined in: [services/indexer.ts:987](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L987)

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

Defined in: [services/indexer.ts:998](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L998)

Indexes all Angular libraries in `node_modules`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>

##### indexProjectModules()

> `private` **indexProjectModules**(): `Promise`\<`void`\>

Defined in: [services/indexer.ts:1105](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1105)

**`Internal`**

Indexes all NgModules in the project.

###### Returns

`Promise`\<`void`\>

##### initializeWatcher()

> **initializeWatcher**(`context`): `void`

Defined in: [services/indexer.ts:298](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L298)

Initializes the file watcher for the project to keep the index up-to-date.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`void`

##### loadFromWorkspace()

> **loadFromWorkspace**(`context`): `Promise`\<`boolean`\>

Defined in: [services/indexer.ts:851](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L851)

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

Defined in: [services/indexer.ts:357](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L357)

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

Defined in: [services/indexer.ts:587](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L587)

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

Defined in: [services/indexer.ts:761](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L761)

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

Defined in: [services/indexer.ts:931](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L931)

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

Defined in: [services/indexer.ts:1532](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L1532)

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

Defined in: [services/indexer.ts:275](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L275)

Sets the root path of the project to be indexed.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `projectPath` | `string` | The absolute path to the project root. |

###### Returns

`void`

##### updateFileIndex()

> `private` **updateFileIndex**(`filePath`, `context`): `Promise`\<`void`\>

Defined in: [services/indexer.ts:641](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/indexer.ts#L641)

**`Internal`**

Updates the index for a single file.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | The path to the file. |
| `context` | `ExtensionContext` | The extension context. |

###### Returns

`Promise`\<`void`\>
