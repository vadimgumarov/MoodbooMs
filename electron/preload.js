const { contextBridge, ipcRenderer } = require('electron');

// Set up CSP violation reporting
if (typeof window !== 'undefined') {
  window.addEventListener('securitypolicyviolation', (e) => {
    const violation = {
      blockedURI: e.blockedURI,
      columnNumber: e.columnNumber,
      disposition: e.disposition,
      documentURI: e.documentURI,
      effectiveDirective: e.effectiveDirective,
      lineNumber: e.lineNumber,
      originalPolicy: e.originalPolicy,
      referrer: e.referrer,
      sourceFile: e.sourceFile,
      statusCode: e.statusCode,
      violatedDirective: e.violatedDirective,
      timestamp: new Date().toISOString()
    };
    
    // Send to main process for logging/reporting
    ipcRenderer.send('csp-violation', violation);
    
    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('CSP Violation:', violation);
    }
  });
}

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
    has: (key) => ipcRenderer.invoke('store-has', key),
    exportToFile: (filePath, data) => ipcRenderer.invoke('store-export-to-file', { filePath, data }),
    importFromFile: (filePath) => ipcRenderer.invoke('store-import-from-file', filePath)
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
    getPath: (name) => ipcRenderer.invoke('app-get-path', name),
    log: (message) => ipcRenderer.send('app-log', message)
  },

  // Dialog Operations (for data export/import)
  dialog: {
    showSaveDialog: (options) => ipcRenderer.invoke('dialog-show-save', options),
    showOpenDialog: (options) => ipcRenderer.invoke('dialog-show-open', options),
    showMessageBox: (options) => ipcRenderer.invoke('dialog-show-message', options)
  },

  // Updates (auto-updater)
  updates: {
    checkForUpdates: () => ipcRenderer.invoke('updater-check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('updater-download-update'),
    getSettings: () => ipcRenderer.invoke('updater-get-settings'),
    setAutoDownload: (enabled) => ipcRenderer.invoke('updater-set-auto-download', enabled),
    setAutoInstall: (enabled) => ipcRenderer.invoke('updater-set-auto-install', enabled),
    onUpdateStatus: (callback) => {
      ipcRenderer.on('update-status', (event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('update-status');
    }
  },

  // Development/Debug (only in dev mode)
  dev: {
    openDevTools: () => ipcRenderer.send('dev-open-devtools'),
    reload: () => ipcRenderer.send('dev-reload'),
    log: (data) => ipcRenderer.send('dev-log', data)
  }
});