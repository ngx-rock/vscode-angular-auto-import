[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / services/diagnostics-reporter

# services/diagnostics-reporter

Diagnostics Report Generator

A debugging/development tool that scans all Angular templates (both external .html and inline)
and collects all diagnostic issues into a comprehensive report.

## Interfaces

### DiagnosticsReport

Defined in: [services/diagnostics-reporter.ts:32](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L32)

Complete diagnostics report for all templates

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="filereports"></a> `fileReports` | [`FileReport`](#filereport)[] | Reports grouped by file | [services/diagnostics-reporter.ts:36](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L36) |
| <a id="timestamp"></a> `timestamp` | `Date` | Timestamp when the report was generated | [services/diagnostics-reporter.ts:38](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L38) |
| <a id="totalissues"></a> `totalIssues` | `number` | Total number of issues found | [services/diagnostics-reporter.ts:34](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L34) |
| <a id="truncated"></a> `truncated?` | `boolean` | Whether the report was truncated due to limits | [services/diagnostics-reporter.ts:40](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L40) |
| <a id="truncationreason"></a> `truncationReason?` | `string` | Truncation details if applicable | [services/diagnostics-reporter.ts:42](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L42) |

***

### FileReport

Defined in: [services/diagnostics-reporter.ts:20](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L20)

Report for a single file's diagnostics
 Used as part of DiagnosticsReport

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="diagnostics"></a> `diagnostics` | `Diagnostic`[] | Diagnostics found in this file | [services/diagnostics-reporter.ts:26](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L26) |
| <a id="filepath"></a> `filePath` | `string` | Absolute path to the file | [services/diagnostics-reporter.ts:22](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L22) |
| <a id="templatetype"></a> `templateType` | `"inline"` \| `"external"` | Type of template | [services/diagnostics-reporter.ts:24](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L24) |

## Functions

### generateFullDiagnosticsReport()

> **generateFullDiagnosticsReport**(`diagnosticProvider`, `progress?`, `token?`): `Promise`\<[`DiagnosticsReport`](#diagnosticsreport)\>

Defined in: [services/diagnostics-reporter.ts:64](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/services/diagnostics-reporter.ts#L64)

Generates a comprehensive diagnostics report for all templates in the workspace.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `diagnosticProvider` | [`DiagnosticProvider`](../providers/diagnostics.md#diagnosticprovider) | The diagnostic provider instance |
| `progress?` | `Progress`\<\{ `increment?`: `number`; `message?`: `string`; \}\> | Optional progress reporter |
| `token?` | `CancellationToken` | Optional cancellation token |

#### Returns

`Promise`\<[`DiagnosticsReport`](#diagnosticsreport)\>

A structured report containing all diagnostic issues grouped by file
