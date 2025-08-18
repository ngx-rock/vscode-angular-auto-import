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
| <a id="diagnosticsenabled"></a> `diagnosticsEnabled` | `boolean` | Whether to enable diagnostic messages for missing imports. **Default** `true` | [config/settings.ts:45](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L45) |
| <a id="diagnosticsseverity"></a> `diagnosticsSeverity` | `string` | Severity level for diagnostic messages. Valid values: 'error', 'warning', 'information', 'hint' **Default** `'warning'` | [config/settings.ts:51](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L51) |
| <a id="indexrefreshinterval"></a> `indexRefreshInterval` | `number` | Interval in seconds for automatic index refresh. Set to 0 to disable automatic refresh. **Default** `60` | [config/settings.ts:40](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L40) |
| <a id="projectpath"></a> `projectPath` | `null` \| `string` | Optional path to a specific Angular project. When null, the extension will auto-detect projects in the workspace. | [config/settings.ts:34](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L34) |

## Functions

### getConfiguration()

> **getConfiguration**(): [`ExtensionConfig`](#extensionconfig)

Defined in: [config/settings.ts:70](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L70)

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

Defined in: [config/settings.ts:101](https://github.com/ngx-rock/vscode-angular-auto-import/blob/main/src/config/settings.ts#L101)

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
