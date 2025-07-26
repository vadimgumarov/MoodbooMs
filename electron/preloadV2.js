const { contextBridge, ipcRenderer } = require('electron');
const { IPC_CHANNELS } = require('./ipc-channels');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Cycle Data Management
  cycle: {
    getData: () => ipcRenderer.invoke(IPC_CHANNELS.CYCLE.GET_DATA),
    saveData: (data) => ipcRenderer.invoke(IPC_CHANNELS.CYCLE.SAVE_DATA, data),
    getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CYCLE.GET_HISTORY),
    addHistory: (entry) => ipcRenderer.invoke(IPC_CHANNELS.CYCLE.ADD_HISTORY, entry),
    updatePhase: (phase) => ipcRenderer.send(IPC_CHANNELS.CYCLE.UPDATE_PHASE, phase)
  },

  // Settings Management
  settings: {
    get: (key) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.GET, key),
    set: (settings) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.SET, settings),
    reset: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.RESET),
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.GET_ALL)
  },

  // Window Management
  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW.MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW.MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW.CLOSE),
    hide: () => ipcRenderer.send(IPC_CHANNELS.WINDOW.HIDE),
    show: () => ipcRenderer.send(IPC_CHANNELS.WINDOW.SHOW),
    setPosition: (x, y) => ipcRenderer.send(IPC_CHANNELS.WINDOW.SET_POSITION, { x, y }),
    getPosition: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.GET_POSITION),
    isVisible: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.IS_VISIBLE)
  },

  // Tray Management
  tray: {
    updateIcon: (phase) => ipcRenderer.send(IPC_CHANNELS.TRAY.UPDATE_ICON, phase),
    updateTooltip: (text) => ipcRenderer.send(IPC_CHANNELS.TRAY.UPDATE_TOOLTIP, text),
    showMenu: () => ipcRenderer.send(IPC_CHANNELS.TRAY.SHOW_MENU),
    
    // Backward compatibility
    updatePhase: (phase) => ipcRenderer.send(IPC_CHANNELS.CYCLE.UPDATE_PHASE, phase)
  },

  // System Information
  system: {
    getPlatform: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.GET_PLATFORM),
    getLocale: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.GET_LOCALE),
    getTheme: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.GET_THEME),
    onThemeChange: (callback) => {
      ipcRenderer.on(IPC_CHANNELS.SYSTEM.THEME_CHANGED, (event, theme) => callback(theme));
      return () => ipcRenderer.removeAllListeners(IPC_CHANNELS.SYSTEM.THEME_CHANGED);
    }
  },

  // App Control
  app: {
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP.GET_VERSION),
    checkUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.APP.CHECK_UPDATES),
    downloadUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.APP.DOWNLOAD_UPDATE),
    installUpdate: () => ipcRenderer.send(IPC_CHANNELS.APP.INSTALL_UPDATE),
    quit: () => ipcRenderer.send(IPC_CHANNELS.APP.QUIT),
    restart: () => ipcRenderer.send(IPC_CHANNELS.APP.RESTART),
    getPath: (name) => ipcRenderer.invoke(IPC_CHANNELS.APP.GET_PATH, name)
  },

  // Notifications
  notifications: {
    show: (title, body, options = {}) => 
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION.SHOW, { title, body, options }),
    requestPermission: () => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION.REQUEST_PERMISSION),
    isEnabled: () => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION.IS_ENABLED)
  },

  // Dialog Operations
  dialog: {
    showSave: (options) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG.SHOW_SAVE, options),
    showOpen: (options) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG.SHOW_OPEN, options),
    showMessage: (options) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG.SHOW_MESSAGE, options),
    showError: (title, content) => ipcRenderer.invoke(IPC_CHANNELS.DIALOG.SHOW_ERROR, { title, content })
  },

  // Data Persistence (backward compatibility)
  store: {
    get: (key) => ipcRenderer.invoke(IPC_CHANNELS.STORE.GET, key),
    set: (key, value) => ipcRenderer.invoke(IPC_CHANNELS.STORE.SET, { key, value }),
    delete: (key) => ipcRenderer.invoke(IPC_CHANNELS.STORE.DELETE, key),
    clear: () => ipcRenderer.invoke(IPC_CHANNELS.STORE.CLEAR),
    has: (key) => ipcRenderer.invoke(IPC_CHANNELS.STORE.HAS, key),
    export: () => ipcRenderer.invoke(IPC_CHANNELS.STORE.EXPORT),
    import: (data) => ipcRenderer.invoke(IPC_CHANNELS.STORE.IMPORT, data)
  },

  // Development/Debug (only in dev mode)
  ...(process.env.NODE_ENV !== 'production' && {
    dev: {
      openDevTools: () => ipcRenderer.send(IPC_CHANNELS.DEV.OPEN_DEVTOOLS),
      reload: () => ipcRenderer.send(IPC_CHANNELS.DEV.RELOAD),
      log: (level, message, data) => ipcRenderer.send(IPC_CHANNELS.DEV.LOG, { level, message, data })
    }
  })
});