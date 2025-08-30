[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / logger/types

# logger/types

## Interfaces

### ILogPoint

Defined in: [logger/types.ts:36](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L36)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="name"></a> `name` | `string` | [logger/types.ts:37](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L37) |
| <a id="starttime"></a> `startTime` | `number` | [logger/types.ts:38](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L38) |

***

### ITransport

Defined in: [logger/types.ts:31](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L31)

#### Methods

##### dispose()

> **dispose**(): `void`

Defined in: [logger/types.ts:33](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L33)

###### Returns

`void`

##### log()

> **log**(`entry`): `void`

Defined in: [logger/types.ts:32](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L32)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entry` | [`LogEntry`](#logentry) |

###### Returns

`void`

***

### LogEntry

Defined in: [logger/types.ts:15](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L15)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="context"></a> `context?` | `Record`\<`string`, `unknown`\> | [logger/types.ts:19](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L19) |
| <a id="level"></a> `level` | [`LogLevel`](#loglevel) | [logger/types.ts:17](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L17) |
| <a id="message"></a> `message` | `string` | [logger/types.ts:18](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L18) |
| <a id="metadata"></a> `metadata` | `object` | [logger/types.ts:20](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L20) |
| `metadata.extensionVersion` | `string` | [logger/types.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L22) |
| `metadata.fileName?` | `string` | [logger/types.ts:26](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L26) |
| `metadata.lineNumber?` | `number` | [logger/types.ts:27](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L27) |
| `metadata.nodeVersion` | `string` | [logger/types.ts:25](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L25) |
| `metadata.platform` | `string` | [logger/types.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L24) |
| `metadata.sessionId` | `string` | [logger/types.ts:21](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L21) |
| `metadata.vscodeVersion` | `string` | [logger/types.ts:23](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L23) |
| <a id="timestamp"></a> `timestamp` | `string` | [logger/types.ts:16](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L16) |

***

### LoggerConfig

Defined in: [logger/types.ts:5](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L5)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="enabled"></a> `enabled` | `boolean` | [logger/types.ts:6](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L6) |
| <a id="fileloggingenabled"></a> `fileLoggingEnabled` | `boolean` | [logger/types.ts:8](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L8) |
| <a id="level-1"></a> `level` | [`LogLevel`](#loglevel) | [logger/types.ts:7](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L7) |
| <a id="logdirectory"></a> `logDirectory` | `null` \| `string` | [logger/types.ts:9](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L9) |
| <a id="outputformat"></a> `outputFormat` | [`LogOutputFormat`](#logoutputformat) | [logger/types.ts:12](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L12) |
| <a id="rotationmaxfiles"></a> `rotationMaxFiles` | `number` | [logger/types.ts:11](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L11) |
| <a id="rotationmaxsize"></a> `rotationMaxSize` | `number` | [logger/types.ts:10](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L10) |

***

### PerformanceMetrics

Defined in: [logger/types.ts:41](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L41)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="cpuusage"></a> `cpuUsage` | `CpuUsage` | [logger/types.ts:43](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L43) |
| <a id="memoryusage"></a> `memoryUsage` | `MemoryUsage` | [logger/types.ts:42](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L42) |

## Type Aliases

### LogLevel

> **LogLevel** = `"DEBUG"` \| `"INFO"` \| `"WARN"` \| `"ERROR"` \| `"FATAL"`

Defined in: [logger/types.ts:1](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L1)

***

### LogOutputFormat

> **LogOutputFormat** = `"plain"` \| `"json"`

Defined in: [logger/types.ts:3](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/logger/types.ts#L3)
