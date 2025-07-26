const { app, dialog, nativeTheme, Notification } = require('electron');
const os = require('os');

// This module sets up all IPC handlers for the main process
// Store reference will be added in issue #3
let store = null;

// Initialize IPC handlers
function initializeIpcHandlers(ipcMain, mainWindow, trayManager) {
  // Tray/Icon Management
  ipcMain.on('phase-update', (event, phase) => {
    console.log('Received phase update:', phase);
    if (trayManager) {
      trayManager.updateIcon(phase);
      trayManager.updateTooltip(`MoodBooMs - ${phase}`);
    }
  });

  ipcMain.on('tray-update-tooltip', (event, text) => {
    if (trayManager) {
      trayManager.updateTooltip(text);
    }
  });

  // Window Management
  ipcMain.on('window-hide', () => {
    if (mainWindow) mainWindow.hide();
  });

  ipcMain.on('window-show', () => {
    if (mainWindow) mainWindow.show();
  });

  ipcMain.on('window-set-position', (event, { x, y }) => {
    if (mainWindow) mainWindow.setPosition(x, y);
  });

  ipcMain.handle('window-get-position', () => {
    if (mainWindow) return mainWindow.getPosition();
    return [0, 0];
  });

  ipcMain.handle('window-is-visible', () => {
    if (mainWindow) return mainWindow.isVisible();
    return false;
  });

  // Data Persistence (placeholder - will be implemented in issue #3)
  ipcMain.handle('store-get', async (event, key) => {
    // TODO: Implement in issue #3
    console.log('Store get called for:', key);
    return null;
  });

  ipcMain.handle('store-set', async (event, { key, value }) => {
    // TODO: Implement in issue #3
    console.log('Store set called:', key, value);
    return true;
  });

  ipcMain.handle('store-delete', async (event, key) => {
    // TODO: Implement in issue #3
    console.log('Store delete called for:', key);
    return true;
  });

  ipcMain.handle('store-clear', async () => {
    // TODO: Implement in issue #3
    console.log('Store clear called');
    return true;
  });

  ipcMain.handle('store-has', async (event, key) => {
    // TODO: Implement in issue #3
    console.log('Store has called for:', key);
    return false;
  });

  // System Information
  ipcMain.handle('system-get-platform', () => {
    return process.platform; // 'darwin', 'win32', 'linux'
  });

  ipcMain.handle('system-get-locale', () => {
    return app.getLocale();
  });

  ipcMain.handle('system-get-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });

  // Watch for theme changes
  nativeTheme.on('updated', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('theme-changed', 
        nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
      );
    }
  });

  // Notifications
  ipcMain.handle('notification-show', async (event, { title, body, options }) => {
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
  });

  ipcMain.handle('notification-request-permission', async () => {
    // On macOS, permission is handled by the system
    return true;
  });

  ipcMain.handle('notification-is-enabled', async () => {
    return Notification.isSupported();
  });

  // App Control
  ipcMain.handle('app-get-version', () => {
    return app.getVersion();
  });

  ipcMain.on('app-quit', () => {
    app.quit();
  });

  ipcMain.on('app-restart', () => {
    app.relaunch();
    app.quit();
  });

  ipcMain.handle('app-get-path', (event, name) => {
    try {
      return app.getPath(name);
    } catch (error) {
      console.error('Error getting path:', error);
      return null;
    }
  });

  // Dialog Operations
  ipcMain.handle('dialog-show-save', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  });

  ipcMain.handle('dialog-show-open', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  });

  ipcMain.handle('dialog-show-message', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
  });

  // Updates (placeholder - will be implemented later)
  ipcMain.handle('update-check', async () => {
    // TODO: Implement auto-updater
    console.log('Update check called');
    return { updateAvailable: false };
  });

  ipcMain.handle('update-download', async () => {
    // TODO: Implement auto-updater
    console.log('Update download called');
    return false;
  });

  ipcMain.on('update-install', () => {
    // TODO: Implement auto-updater
    console.log('Update install called');
  });

  // Development/Debug
  if (process.env.NODE_ENV !== 'production') {
    ipcMain.on('dev-open-devtools', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.openDevTools();
      }
    });

    ipcMain.on('dev-reload', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
      }
    });
  }
}

// Function to set store instance (will be called from main.js in issue #3)
function setStore(storeInstance) {
  store = storeInstance;
}

module.exports = {
  initializeIpcHandlers,
  setStore
};