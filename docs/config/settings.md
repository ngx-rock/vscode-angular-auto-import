[**Angular Auto Import Extension API Documentation**](../README.md)

***

[Angular Auto Import Extension](../README.md) / config/settings

# config/settings

Manages extension settings and configuration.

This module provides utilities for reading and monitoring VS Code extension settings,
specifically for the Angular Auto-Import extension configuration.

## Interfaces

### ExtensionConfig

Defined in: [config/settings.ts:29](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L29)

Configuration interface for the Angular Auto-Import extension.

Contains all user-configurable settings that control the behavior
of the Angular Auto-Import extension.

 ExtensionConfig

#### Example

```typescript
const config: ExtensionConfig = {
  projectPath: '/path/to/project',
  indexRefreshInterval: 60,
  diagnosticsEnabled: true,
  diagnosticsSeverity: 'warning'
};
```

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="completionenabled"></a> `completionEnabled` | `boolean` | Whether to enable auto-completion suggestions for Angular elements. **Default** `true` | [config/settings.ts:45](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L45) |
| <a id="diagnosticsmode"></a> `diagnosticsMode` | `string` | Diagnostic mode for missing imports. - 'full': Show diagnostic underlines and provide quick fixes - 'quickfix-only': Provide quick fixes without showing diagnostic underlines - 'disabled': Turn off all diagnostics **Default** `'full'` | [config/settings.ts:53](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L53) |
| <a id="diagnosticsseverity"></a> `diagnosticsSeverity` | `string` | Severity level for diagnostic messages. Valid values: 'error', 'warning', 'information', 'hint' **Default** `'warning'` | [config/settings.ts:59](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L59) |
| <a id="indexrefreshinterval"></a> `indexRefreshInterval` | `number` | Interval in seconds for automatic index refresh. Set to 0 to disable automatic refresh. **Default** `60` | [config/settings.ts:40](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L40) |
| <a id="logging"></a> `logging` | `object` | Logging configuration settings. | [config/settings.ts:63](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L63) |
| `logging.enabled` | `boolean` | Whether logging is enabled. **Default** `true` | [config/settings.ts:68](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L68) |
| `logging.fileLoggingEnabled` | `boolean` | Whether file logging is enabled. **Default** `false` | [config/settings.ts:78](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L78) |
| `logging.level` | `string` | Logging level threshold. **Default** `'INFO'` | [config/settings.ts:73](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L73) |
| `logging.logDirectory` | `null` \| `string` | Directory for log files. **Default** `null` | [config/settings.ts:83](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L83) |
| `logging.outputFormat` | `string` | Log output format. **Default** `'plain'` | [config/settings.ts:98](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L98) |
| `logging.rotationMaxFiles` | `number` | Maximum number of log files to keep. **Default** `5` | [config/settings.ts:93](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L93) |
| `logging.rotationMaxSize` | `number` | Maximum log file size in MB before rotation. **Default** `5` | [config/settings.ts:88](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L88) |
| <a id="projectpath"></a> `projectPath` | `null` \| `string` | Optional path to a specific Angular project. When null, the extension will auto-detect projects in the workspace. | [config/settings.ts:34](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L34) |

## Functions

### getConfiguration()

> **getConfiguration**(): [`ExtensionConfig`](#extensionconfig)

Defined in: [config/settings.ts:118](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L118)

Retrieves the current extension configuration from VS Code settings.

Reads all Angular Auto-Import related settings from the VS Code configuration
and returns them as a structured configuration object with appropriate defaults.

#### Returns

[`ExtensionConfig`](#extensionconfig)

The current extension configuration with all settings

#### Example

```typescript
const config = getConfiguration();
if (config.diagnosticsEnabled) {
  // Enable diagnostics features
}
```

***

### onConfigurationChanged()

> **onConfigurationChanged**(`callback`): `Disposable`

Defined in: [config/settings.ts:159](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L159)

Registers a callback to be invoked when Angular Auto-Import configuration changes.

This function sets up a configuration change listener that will call the provided
callback whenever any Angular Auto-Import settings are modified by the user.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | (`config`) => `void` | Function to call when configuration changes, receives the new configuration |

#### Returns

`Disposable`

A disposable that can be used to unregister the listener

#### Example

```typescript
const disposable = onConfigurationChanged((newConfig) => {
  console.log('Configuration updated:', newConfig);
  // Update extension behavior based on new config
});

// Later, to stop listening:
disposable.dispose();
```
