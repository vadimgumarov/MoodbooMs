# IPC Migration Guide

This guide helps migrate from the old IPC implementation to the new structured IPC communication layer.

## Overview of Changes

1. **Structured channel naming**: All channels now follow `domain:action-target` pattern
2. **Centralized channel constants**: Use `IPC_CHANNELS` object instead of string literals
3. **Enhanced error handling**: All handlers wrapped with error middleware
4. **TypeScript support**: Full type definitions available
5. **Better organization**: Channels grouped by domain

## Migration Steps

### 1. Update Main Process

Replace `electron/ipcHandlers.js` with `electron/ipcHandlersV2.js` in main.js:

```javascript
// Old
const { initializeIpcHandlers } = require('./ipcHandlers');

// New
const { initializeIpcHandlers } = require('./ipcHandlersV2');
```

### 2. Update Preload Script

Replace `electron/preload.js` with `electron/preloadV2.js` in main.js:

```javascript
// Old
preload: __dirname + '/preload.js'

// New
preload: __dirname + '/preloadV2.js'
```

### 3. Update React Components

#### MenuBarApp.jsx

Update the phase update call:

```javascript
// Old
if (window.electronAPI && window.electronAPI.tray) {
  window.electronAPI.tray.updatePhase(phase.phase);
}

// New
if (window.electronAPI && window.electronAPI.cycle) {
  window.electronAPI.cycle.updatePhase(phase.phase);
}
```

Update store operations to use new API:

```javascript
// Old
await window.electronAPI.store.set('cycleData', {
  startDate: newDate.toISOString(),
  cycleLength: cycleData.cycleLength
});

// New - Option 1: Keep using store API (backward compatible)
await window.electronAPI.store.set('cycleData', {
  startDate: newDate.toISOString(),
  cycleLength: cycleData.cycleLength
});

// New - Option 2: Use new cycle API
await window.electronAPI.cycle.saveData({
  startDate: newDate.toISOString(),
  cycleLength: cycleData.cycleLength
});
```

### 4. Add TypeScript Support (Optional)

Add type checking to your React components:

```typescript
// Import types
import type { CycleData, Preferences } from '../types/ipc';

// Use types
const [cycleData, setCycleData] = useState<CycleData>({
  startDate: new Date().toISOString(),
  cycleLength: 28,
  history: []
});
```

## Channel Mapping Reference

| Old Channel | New Channel | API Path |
|-------------|-------------|----------|
| `phase-update` | `cycle:update-phase` | `electronAPI.cycle.updatePhase()` |
| `store-get` | `store:get` | `electronAPI.store.get()` |
| `store-set` | `store:set` | `electronAPI.store.set()` |
| `window-hide` | `window:hide` | `electronAPI.window.hide()` |
| `window-show` | `window:show` | `electronAPI.window.show()` |
| `tray-update-tooltip` | `tray:update-tooltip` | `electronAPI.tray.updateTooltip()` |

## New Features Available

### 1. Cycle-Specific Operations

```javascript
// Get only cycle history
const history = await window.electronAPI.cycle.getHistory();

// Add history entry
await window.electronAPI.cycle.addHistory({
  startDate: '2024-01-01',
  length: 28,
  notes: 'Regular cycle'
});
```

### 2. Settings Management

```javascript
// Get all settings
const prefs = await window.electronAPI.settings.getAll();

// Reset to defaults
await window.electronAPI.settings.reset();
```

### 3. Enhanced Error Information

```javascript
try {
  await window.electronAPI.cycle.saveData(invalidData);
} catch (error) {
  if (error.code === 'IPC_INVALID_PARAMS') {
    console.error('Invalid parameters:', error.message);
  }
}
```

### 4. Development Tools

```javascript
// Only available in development
if (window.electronAPI.dev) {
  window.electronAPI.dev.log('error', 'Something went wrong', { details });
  window.electronAPI.dev.openDevTools();
}
```

## Testing

Run the IPC tests to verify migration:

```bash
npx electron tests/electron/ipc-tests.js
```

## Rollback Plan

If issues arise, you can temporarily revert by:

1. Change back to old handlers in main.js
2. Change back to old preload in main.js
3. The old API calls will continue to work

## Benefits of Migration

1. **Better organization**: Channels grouped by feature
2. **Type safety**: Full TypeScript support
3. **Error handling**: Consistent error responses
4. **Documentation**: Auto-generated from types
5. **Future-proof**: Easier to add new features

## Support

For questions or issues during migration:
1. Check the IPC_DOCUMENTATION.md file
2. Review the TypeScript definitions in src/types/ipc.d.ts
3. Run the test suite to verify functionality