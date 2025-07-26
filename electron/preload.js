const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Tray/Icon Management
  tray: {
    updatePhase: (phase) => ipcRenderer.send('phase-update', phase),
    updateTooltip: (text) => ipcRenderer.send('tray-update-tooltip', text)
  },

  // Window Management
  window: {
    hide: () => ipcRenderer.send('window-hide'),
    show: () => ipcRenderer.send('window-show'),
    setPosition: (x, y) => ipcRenderer.send('window-set-position', { x, y }),
    getPosition: () => ipcRenderer.invoke('window-get-position'),
    isVisible: () => ipcRenderer.invoke('window-is-visible')
  },

  // Data Persistence (will be implemented in issue #3)
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', { key, value }),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
    clear: () => ipcRenderer.invoke('store-clear'),
    has: (key) => ipcRenderer.invoke('store-has', key)
  },

  // System Information
  system: {
    getPlatform: () => ipcRenderer.invoke('system-get-platform'),
    getLocale: () => ipcRenderer.invoke('system-get-locale'),
    getTheme: () => ipcRenderer.invoke('system-get-theme'),
    onThemeChange: (callback) => {
      ipcRenderer.on('theme-changed', (event, theme) => callback(theme));
      return () => ipcRenderer.removeAllListeners('theme-changed');
    }
  },

  // Notifications (future enhancement)
  notifications: {
    show: (title, body, options = {}) => 
      ipcRenderer.invoke('notification-show', { title, body, options }),
    requestPermission: () => ipcRenderer.invoke('notification-request-permission'),
    isEnabled: () => ipcRenderer.invoke('notification-is-enabled')
  },

  // App Control
  app: {
    getVersion: () => ipcRenderer.invoke('app-get-version'),
    quit: () => ipcRenderer.send('app-quit'),
    restart: () => ipcRenderer.send('app-restart'),
    getPath: (name) => ipcRenderer.invoke('app-get-path', name)
  },

  // Dialog Operations (for data export/import)
  dialog: {
    showSaveDialog: (options) => ipcRenderer.invoke('dialog-show-save', options),
    showOpenDialog: (options) => ipcRenderer.invoke('dialog-show-open', options),
    showMessageBox: (options) => ipcRenderer.invoke('dialog-show-message', options)
  },

  // Updates (future enhancement)
  updates: {
    checkForUpdates: () => ipcRenderer.invoke('update-check'),
    downloadUpdate: () => ipcRenderer.invoke('update-download'),
    installUpdate: () => ipcRenderer.send('update-install'),
    onUpdateAvailable: (callback) => {
      ipcRenderer.on('update-available', (event, info) => callback(info));
      return () => ipcRenderer.removeAllListeners('update-available');
    }
  },

  // Development/Debug (only in dev mode)
  dev: {
    openDevTools: () => ipcRenderer.send('dev-open-devtools'),
    reload: () => ipcRenderer.send('dev-reload')
  }
});