# IPC Communication Layer Documentation

## Overview

The IPC (Inter-Process Communication) layer enables secure communication between the Electron main process and renderer process. All channels follow a consistent naming convention and include proper error handling.

## Naming Convention

All IPC channels follow the pattern: `domain:action-target`

- **domain**: The feature area (e.g., `cycle`, `settings`, `window`)
- **action**: The operation being performed (e.g., `get`, `set`, `update`)
- **target**: The specific resource (e.g., `data`, `history`, `position`)

## Available IPC Channels

### Cycle Data Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `cycle:get-data` | invoke | Get current cycle data | None | `{startDate, cycleLength, history}` |
| `cycle:save-data` | invoke | Save cycle data | `data: Object` | `Boolean` |
| `cycle:get-history` | invoke | Get cycle history | None | `Array<HistoryEntry>` |
| `cycle:add-history` | invoke | Add history entry | `entry: Object` | `Boolean` |
| `cycle:update-phase` | send | Update tray icon phase | `phase: String` | None |

### Settings Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `settings:get` | invoke | Get specific setting | `key?: String` | `Any` |
| `settings:set` | invoke | Update settings | `settings: Object` | `Boolean` |
| `settings:reset` | invoke | Reset to defaults | None | `Boolean` |
| `settings:get-all` | invoke | Get all settings | None | `Object` |

### Window Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `window:minimize` | send | Minimize window | None | None |
| `window:maximize` | send | Toggle maximize | None | None |
| `window:close` | send | Close window | None | None |
| `window:hide` | send | Hide window | None | None |
| `window:show` | send | Show window | None | None |
| `window:set-position` | send | Set window position | `{x, y}` | None |
| `window:get-position` | invoke | Get window position | None | `[x, y]` |
| `window:is-visible` | invoke | Check visibility | None | `Boolean` |

### Tray Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `tray:update-icon` | send | Update tray icon | `phase: String` | None |
| `tray:update-tooltip` | send | Update tooltip text | `text: String` | None |
| `tray:show-menu` | send | Show context menu | None | None |

### System Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `system:get-platform` | invoke | Get OS platform | None | `String` |
| `system:get-locale` | invoke | Get system locale | None | `String` |
| `system:get-theme` | invoke | Get current theme | None | `'light' \| 'dark'` |
| `system:theme-changed` | on | Theme change event | None | `'light' \| 'dark'` |

### App Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `app:get-version` | invoke | Get app version | None | `String` |
| `app:check-updates` | invoke | Check for updates | None | `{updateAvailable}` |
| `app:download-update` | invoke | Download update | None | `Boolean` |
| `app:install-update` | send | Install update | None | None |
| `app:quit` | send | Quit application | None | None |
| `app:restart` | send | Restart application | None | None |
| `app:get-path` | invoke | Get app path | `name: String` | `String` |

### Notification Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `notification:show` | invoke | Show notification | `{title, body, options?}` | `Boolean` |
| `notification:request-permission` | invoke | Request permission | None | `Boolean` |
| `notification:is-enabled` | invoke | Check if enabled | None | `Boolean` |

### Dialog Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `dialog:show-save` | invoke | Show save dialog | `options: Object` | `{filePath, canceled}` |
| `dialog:show-open` | invoke | Show open dialog | `options: Object` | `{filePaths, canceled}` |
| `dialog:show-message` | invoke | Show message box | `options: Object` | `{response}` |
| `dialog:show-error` | invoke | Show error box | `{title, content}` | `Boolean` |

### Store Operations (Backward Compatibility)

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `store:get` | invoke | Get from store | `key?: String` | `Any` |
| `store:set` | invoke | Set in store | `{key, value}` | `Boolean` |
| `store:delete` | invoke | Delete from store | `key: String` | `Boolean` |
| `store:clear` | invoke | Clear store | None | `Boolean` |
| `store:has` | invoke | Check key exists | `key: String` | `Boolean` |
| `store:export` | invoke | Export all data | None | `Object` |
| `store:import` | invoke | Import data | `data: Object` | `Boolean` |

### Development Operations

| Channel | Type | Description | Parameters | Returns |
|---------|------|-------------|------------|---------|
| `dev:open-devtools` | send | Open DevTools | None | None |
| `dev:reload` | send | Reload window | None | None |
| `dev:log` | send | Log to console | `{level, message, data?}` | None |

## Usage Examples

### Renderer Process (via preload)

```javascript
// Get cycle data
const cycleData = await window.electronAPI.invoke('cycle:get-data');

// Save settings
await window.electronAPI.invoke('settings:set', {
  theme: 'dark',
  notifications: true
});

// Show notification
await window.electronAPI.invoke('notification:show', {
  title: 'Cycle Update',
  body: 'Your cycle has been updated'
});

// Send one-way message
window.electronAPI.send('window:minimize');
```

### Main Process

```javascript
const { IPC_CHANNELS } = require('./ipc-channels');

// Handle two-way communication
ipcMain.handle(IPC_CHANNELS.CYCLE.GET_DATA, async () => {
  return storeOperations.getCycleData();
});

// Handle one-way communication
ipcMain.on(IPC_CHANNELS.WINDOW.MINIMIZE, () => {
  mainWindow.minimize();
});
```

## Error Handling

All `invoke` operations include automatic error handling. Errors are wrapped in `IPCError` with the following codes:

- `IPC_INVALID_CHANNEL`: Channel doesn't exist
- `IPC_INVALID_PARAMS`: Invalid parameters provided
- `IPC_HANDLER_ERROR`: Error in handler execution
- `IPC_PERMISSION_DENIED`: Operation not permitted
- `IPC_NOT_FOUND`: Resource not found
- `IPC_TIMEOUT`: Operation timed out

### Error Response Format

```javascript
{
  name: 'IPCError',
  code: 'IPC_INVALID_PARAMS',
  message: 'Missing required parameter: data',
  details: {} // Additional error details
}
```

## Migration Guide

For backward compatibility, old channel names are mapped to new ones:

| Old Channel | New Channel |
|-------------|-------------|
| `phase-update` | `cycle:update-phase` |
| `store-get` | `store:get` |
| `window-hide` | `window:hide` |
| etc... |

## Security Notes

1. All IPC communication goes through the preload script
2. No direct Node.js access from renderer
3. Input validation on all parameters
4. Error messages don't expose sensitive information
5. Development-only channels disabled in production

## Testing

Test files are located in `tests/electron/ipc-tests.js`. Run with:

```bash
npm test -- tests/electron/ipc-tests.js
```