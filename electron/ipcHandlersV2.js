const { app, dialog, nativeTheme, Notification } = require('electron');
const os = require('os');
const { storeOperations } = require('./store');
const { IPC_CHANNELS, IPC_ERRORS, IPCError } = require('./ipc-channels');

// Validation middleware
const validateParams = (params, schema) => {
  // Simple validation - can be enhanced with a library like joi
  for (const [key, type] of Object.entries(schema)) {
    if (params[key] === undefined && type.required) {
      throw new IPCError(
        IPC_ERRORS.INVALID_PARAMS,
        `Missing required parameter: ${key}`
      );
    }
    if (params[key] !== undefined && typeof params[key] !== type.type) {
      throw new IPCError(
        IPC_ERRORS.INVALID_PARAMS,
        `Invalid type for parameter ${key}: expected ${type.type}, got ${typeof params[key]}`
      );
    }
  }
};

// Error handler wrapper
const handleIPCError = (handler) => {
  return async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      console.error('IPC Handler Error:', error);
      
      if (error instanceof IPCError) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new IPCError(
        IPC_ERRORS.HANDLER_ERROR,
        error.message || 'An unknown error occurred',
        { originalError: error.toString() }
      );
    }
  };
};

// Initialize IPC handlers with new structure
function initializeIpcHandlers(ipcMain, mainWindow, trayManager) {
  
  // ============ CYCLE DATA OPERATIONS ============
  
  // Get cycle data
  ipcMain.handle(IPC_CHANNELS.CYCLE.GET_DATA, handleIPCError(async () => {
    return storeOperations.getCycleData();
  }));

  // Save cycle data
  ipcMain.handle(IPC_CHANNELS.CYCLE.SAVE_DATA, handleIPCError(async (event, data) => {
    validateParams({ data }, {
      data: { type: 'object', required: true }
    });
    return storeOperations.setCycleData(data);
  }));

  // Get cycle history
  ipcMain.handle(IPC_CHANNELS.CYCLE.GET_HISTORY, handleIPCError(async () => {
    const cycleData = storeOperations.getCycleData();
    return cycleData.history || [];
  }));

  // Add history entry
  ipcMain.handle(IPC_CHANNELS.CYCLE.ADD_HISTORY, handleIPCError(async (event, entry) => {
    validateParams({ entry }, {
      entry: { type: 'object', required: true }
    });
    return storeOperations.addCycleHistory(entry);
  }));

  // Update phase (for tray icon)
  ipcMain.on(IPC_CHANNELS.CYCLE.UPDATE_PHASE, (event, phase) => {
    console.log('Received phase update:', phase);
    if (trayManager) {
      trayManager.updateIcon(phase);
      trayManager.updateTooltip(`MoodBooMs - ${phase}`);
    }
  });

  // ============ SETTINGS OPERATIONS ============
  
  // Get specific setting
  ipcMain.handle(IPC_CHANNELS.SETTINGS.GET, handleIPCError(async (event, key) => {
    const preferences = storeOperations.getPreferences();
    return key ? preferences[key] : preferences;
  }));

  // Set settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS.SET, handleIPCError(async (event, settings) => {
    validateParams({ settings }, {
      settings: { type: 'object', required: true }
    });
    return storeOperations.setPreferences(settings);
  }));

  // Reset settings to defaults
  ipcMain.handle(IPC_CHANNELS.SETTINGS.RESET, handleIPCError(async () => {
    return storeOperations.reset();
  }));

  // Get all settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS.GET_ALL, handleIPCError(async () => {
    return storeOperations.getPreferences();
  }));

  // ============ WINDOW OPERATIONS ============
  
  // Minimize window
  ipcMain.on(IPC_CHANNELS.WINDOW.MINIMIZE, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  // Maximize window
  ipcMain.on(IPC_CHANNELS.WINDOW.MAXIMIZE, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  // Close window
  ipcMain.on(IPC_CHANNELS.WINDOW.CLOSE, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  // Hide window
  ipcMain.on(IPC_CHANNELS.WINDOW.HIDE, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });

  // Show window
  ipcMain.on(IPC_CHANNELS.WINDOW.SHOW, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  });

  // Set window position
  ipcMain.on(IPC_CHANNELS.WINDOW.SET_POSITION, (event, { x, y }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setPosition(x, y);
    }
  });

  // Get window position
  ipcMain.handle(IPC_CHANNELS.WINDOW.GET_POSITION, handleIPCError(async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return mainWindow.getPosition();
    }
    return [0, 0];
  }));

  // Check if window is visible
  ipcMain.handle(IPC_CHANNELS.WINDOW.IS_VISIBLE, handleIPCError(async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return mainWindow.isVisible();
    }
    return false;
  }));

  // ============ TRAY OPERATIONS ============
  
  // Update tray icon
  ipcMain.on(IPC_CHANNELS.TRAY.UPDATE_ICON, (event, phase) => {
    if (trayManager) {
      trayManager.updateIcon(phase);
    }
  });

  // Update tray tooltip
  ipcMain.on(IPC_CHANNELS.TRAY.UPDATE_TOOLTIP, (event, text) => {
    if (trayManager) {
      trayManager.updateTooltip(text);
    }
  });

  // ============ SYSTEM OPERATIONS ============
  
  // Get platform
  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_PLATFORM, handleIPCError(async () => {
    return process.platform;
  }));

  // Get locale
  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_LOCALE, handleIPCError(async () => {
    return app.getLocale();
  }));

  // Get theme
  ipcMain.handle(IPC_CHANNELS.SYSTEM.GET_THEME, handleIPCError(async () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }));

  // Watch for theme changes
  nativeTheme.on('updated', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        IPC_CHANNELS.SYSTEM.THEME_CHANGED,
        nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
      );
    }
  });

  // ============ APP OPERATIONS ============
  
  // Get app version
  ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, handleIPCError(async () => {
    return app.getVersion();
  }));

  // Check for updates
  ipcMain.handle(IPC_CHANNELS.APP.CHECK_UPDATES, handleIPCError(async () => {
    // TODO: Implement auto-updater
    console.log('Update check called');
    return { updateAvailable: false };
  }));

  // Download update
  ipcMain.handle(IPC_CHANNELS.APP.DOWNLOAD_UPDATE, handleIPCError(async () => {
    // TODO: Implement auto-updater
    console.log('Update download called');
    return false;
  }));

  // Install update
  ipcMain.on(IPC_CHANNELS.APP.INSTALL_UPDATE, () => {
    // TODO: Implement auto-updater
    console.log('Update install called');
  });

  // Quit app
  ipcMain.on(IPC_CHANNELS.APP.QUIT, () => {
    app.quit();
  });

  // Restart app
  ipcMain.on(IPC_CHANNELS.APP.RESTART, () => {
    app.relaunch();
    app.quit();
  });

  // Get app path
  ipcMain.handle(IPC_CHANNELS.APP.GET_PATH, handleIPCError(async (event, name) => {
    validateParams({ name }, {
      name: { type: 'string', required: true }
    });
    return app.getPath(name);
  }));

  // ============ NOTIFICATION OPERATIONS ============
  
  // Show notification
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.SHOW, handleIPCError(async (event, { title, body, options }) => {
    validateParams({ title, body }, {
      title: { type: 'string', required: true },
      body: { type: 'string', required: true }
    });
    
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body,
        ...options
      });
      notification.show();
      return true;
    }
    return false;
  }));

  // Request notification permission
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.REQUEST_PERMISSION, handleIPCError(async () => {
    return true; // On macOS, permission is handled by the system
  }));

  // Check if notifications are enabled
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION.IS_ENABLED, handleIPCError(async () => {
    return Notification.isSupported();
  }));

  // ============ DIALOG OPERATIONS ============
  
  // Show save dialog
  ipcMain.handle(IPC_CHANNELS.DIALOG.SHOW_SAVE, handleIPCError(async (event, options) => {
    return await dialog.showSaveDialog(mainWindow, options);
  }));

  // Show open dialog
  ipcMain.handle(IPC_CHANNELS.DIALOG.SHOW_OPEN, handleIPCError(async (event, options) => {
    return await dialog.showOpenDialog(mainWindow, options);
  }));

  // Show message box
  ipcMain.handle(IPC_CHANNELS.DIALOG.SHOW_MESSAGE, handleIPCError(async (event, options) => {
    return await dialog.showMessageBox(mainWindow, options);
  }));

  // Show error dialog
  ipcMain.handle(IPC_CHANNELS.DIALOG.SHOW_ERROR, handleIPCError(async (event, { title, content }) => {
    dialog.showErrorBox(title, content);
    return true;
  }));

  // ============ STORE OPERATIONS (backward compatibility) ============
  
  // Get from store
  ipcMain.handle(IPC_CHANNELS.STORE.GET, handleIPCError(async (event, key) => {
    if (!key) {
      return storeOperations.getAll();
    }
    
    switch (key) {
      case 'cycleData':
        return storeOperations.getCycleData();
      case 'preferences':
        return storeOperations.getPreferences();
      case 'appState':
        return storeOperations.getAppState();
      default:
        return storeOperations.get(key);
    }
  }));

  // Set in store
  ipcMain.handle(IPC_CHANNELS.STORE.SET, handleIPCError(async (event, { key, value }) => {
    validateParams({ key }, {
      key: { type: 'string', required: true }
    });
    
    switch (key) {
      case 'cycleData':
        return storeOperations.setCycleData(value);
      case 'preferences':
        return storeOperations.setPreferences(value);
      case 'cycleData.history':
        return storeOperations.addCycleHistory(value);
      default:
        return storeOperations.set(key, value);
    }
  }));

  // Delete from store
  ipcMain.handle(IPC_CHANNELS.STORE.DELETE, handleIPCError(async (event, key) => {
    return storeOperations.delete(key);
  }));

  // Clear store
  ipcMain.handle(IPC_CHANNELS.STORE.CLEAR, handleIPCError(async () => {
    return storeOperations.clear();
  }));

  // Check if key exists
  ipcMain.handle(IPC_CHANNELS.STORE.HAS, handleIPCError(async (event, key) => {
    return storeOperations.has(key);
  }));

  // Export data
  ipcMain.handle(IPC_CHANNELS.STORE.EXPORT, handleIPCError(async () => {
    return storeOperations.exportData();
  }));

  // Import data
  ipcMain.handle(IPC_CHANNELS.STORE.IMPORT, handleIPCError(async (event, data) => {
    validateParams({ data }, {
      data: { type: 'object', required: true }
    });
    return storeOperations.importData(data);
  }));

  // ============ DEVELOPMENT OPERATIONS ============
  
  if (process.env.NODE_ENV !== 'production') {
    // Open DevTools
    ipcMain.on(IPC_CHANNELS.DEV.OPEN_DEVTOOLS, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.openDevTools();
      }
    });

    // Reload window
    ipcMain.on(IPC_CHANNELS.DEV.RELOAD, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
      }
    });

    // Log message
    ipcMain.on(IPC_CHANNELS.DEV.LOG, (event, { level, message, data }) => {
      console[level || 'log']('[Renderer]', message, data || '');
    });
  }
}

// Mapping of old channels to new ones for migration
const CHANNEL_MIGRATION_MAP = {
  'phase-update': IPC_CHANNELS.CYCLE.UPDATE_PHASE,
  'tray-update-tooltip': IPC_CHANNELS.TRAY.UPDATE_TOOLTIP,
  'window-hide': IPC_CHANNELS.WINDOW.HIDE,
  'window-show': IPC_CHANNELS.WINDOW.SHOW,
  'window-set-position': IPC_CHANNELS.WINDOW.SET_POSITION,
  'window-get-position': IPC_CHANNELS.WINDOW.GET_POSITION,
  'window-is-visible': IPC_CHANNELS.WINDOW.IS_VISIBLE,
  'store-get': IPC_CHANNELS.STORE.GET,
  'store-set': IPC_CHANNELS.STORE.SET,
  'store-delete': IPC_CHANNELS.STORE.DELETE,
  'store-clear': IPC_CHANNELS.STORE.CLEAR,
  'store-has': IPC_CHANNELS.STORE.HAS,
  'system-get-platform': IPC_CHANNELS.SYSTEM.GET_PLATFORM,
  'system-get-locale': IPC_CHANNELS.SYSTEM.GET_LOCALE,
  'system-get-theme': IPC_CHANNELS.SYSTEM.GET_THEME,
  'theme-changed': IPC_CHANNELS.SYSTEM.THEME_CHANGED,
  'notification-show': IPC_CHANNELS.NOTIFICATION.SHOW,
  'notification-request-permission': IPC_CHANNELS.NOTIFICATION.REQUEST_PERMISSION,
  'notification-is-enabled': IPC_CHANNELS.NOTIFICATION.IS_ENABLED,
  'app-get-version': IPC_CHANNELS.APP.GET_VERSION,
  'app-quit': IPC_CHANNELS.APP.QUIT,
  'app-restart': IPC_CHANNELS.APP.RESTART,
  'app-get-path': IPC_CHANNELS.APP.GET_PATH,
  'dialog-show-save': IPC_CHANNELS.DIALOG.SHOW_SAVE,
  'dialog-show-open': IPC_CHANNELS.DIALOG.SHOW_OPEN,
  'dialog-show-message': IPC_CHANNELS.DIALOG.SHOW_MESSAGE,
  'update-check': IPC_CHANNELS.APP.CHECK_UPDATES,
  'update-download': IPC_CHANNELS.APP.DOWNLOAD_UPDATE,
  'update-install': IPC_CHANNELS.APP.INSTALL_UPDATE,
  'dev-open-devtools': IPC_CHANNELS.DEV.OPEN_DEVTOOLS,
  'dev-reload': IPC_CHANNELS.DEV.RELOAD,
};

module.exports = {
  initializeIpcHandlers,
  CHANNEL_MIGRATION_MAP,
};