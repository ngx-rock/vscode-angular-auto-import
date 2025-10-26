[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / config/excluded-libraries

# config/excluded-libraries

Configuration for libraries that should be excluded from indexing.

## Functions

### isLibraryExcluded()

> **isLibraryExcluded**(`importPath`): `boolean`

Defined in: [config/excluded-libraries.ts:55](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/excluded-libraries.ts#L55)

Checks if a library should be excluded from indexing based on its import path.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `importPath` | `string` | The import path to check (e.g., "@angular/forms", "@angular/core") |

#### Returns

`boolean`

`true` if the library should be excluded, `false` otherwise

#### Example

```typescript
isLibraryExcluded("@angular/forms") // true
isLibraryExcluded("@angular/material") // false
isLibraryExcluded("@taiga-ui/core") // false
```
