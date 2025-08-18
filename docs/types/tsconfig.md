[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / types/tsconfig

# types/tsconfig

Defines types related to TypeScript configuration and path mappings.

## Interfaces

### ProcessedTsConfig

Defined in: [types/tsconfig.ts:9](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/tsconfig.ts#L9)

Represents a processed TypeScript configuration with resolved paths.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="absolutebaseurl"></a> `absoluteBaseUrl` | `string` | The absolute base URL for module resolution. | [types/tsconfig.ts:13](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/tsconfig.ts#L13) |
| <a id="paths"></a> `paths` | `Record`\<`string`, `string`[]\> | Path aliases from the tsconfig.json file. | [types/tsconfig.ts:17](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/tsconfig.ts#L17) |
| <a id="sourcefilepath"></a> `sourceFilePath` | `string` | The path to the source tsconfig.json file. | [types/tsconfig.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/types/tsconfig.ts#L21) |
