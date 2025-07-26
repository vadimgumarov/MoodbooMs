// IPC Channel definitions and constants
// Following naming convention: domain:action-target

const IPC_CHANNELS = {
  // Cycle Data Operations
  CYCLE: {
    GET_DATA: 'cycle:get-data',
    SAVE_DATA: 'cycle:save-data',
    GET_HISTORY: 'cycle:get-history',
    ADD_HISTORY: 'cycle:add-history',
    UPDATE_PHASE: 'cycle:update-phase',
  },

  // Settings/Preferences Operations
  SETTINGS: {
    GET: 'settings:get',
    SET: 'settings:set',
    RESET: 'settings:reset',
    GET_ALL: 'settings:get-all',
  },

  // Window Operations
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close',
    HIDE: 'window:hide',
    SHOW: 'window:show',
    SET_POSITION: 'window:set-position',
    GET_POSITION: 'window:get-position',
    IS_VISIBLE: 'window:is-visible',
  },

  // Tray Operations
  TRAY: {
    UPDATE_ICON: 'tray:update-icon',
    UPDATE_TOOLTIP: 'tray:update-tooltip',
    SHOW_MENU: 'tray:show-menu',
  },

  // System Operations
  SYSTEM: {
    GET_PLATFORM: 'system:get-platform',
    GET_LOCALE: 'system:get-locale',
    GET_THEME: 'system:get-theme',
    THEME_CHANGED: 'system:theme-changed',
  },

  // App Operations
  APP: {
    GET_VERSION: 'app:get-version',
    CHECK_UPDATES: 'app:check-updates',
    DOWNLOAD_UPDATE: 'app:download-update',
    INSTALL_UPDATE: 'app:install-update',
    QUIT: 'app:quit',
    RESTART: 'app:restart',
    GET_PATH: 'app:get-path',
  },

  // Notification Operations
  NOTIFICATION: {
    SHOW: 'notification:show',
    REQUEST_PERMISSION: 'notification:request-permission',
    IS_ENABLED: 'notification:is-enabled',
  },

  // Dialog Operations
  DIALOG: {
    SHOW_SAVE: 'dialog:show-save',
    SHOW_OPEN: 'dialog:show-open',
    SHOW_MESSAGE: 'dialog:show-message',
    SHOW_ERROR: 'dialog:show-error',
  },

  // Store Operations (keeping backward compatibility)
  STORE: {
    GET: 'store:get',
    SET: 'store:set',
    DELETE: 'store:delete',
    CLEAR: 'store:clear',
    HAS: 'store:has',
    EXPORT: 'store:export',
    IMPORT: 'store:import',
  },

  // Development Operations
  DEV: {
    OPEN_DEVTOOLS: 'dev:open-devtools',
    RELOAD: 'dev:reload',
    LOG: 'dev:log',
  },
};

// Error codes for consistent error handling
const IPC_ERRORS = {
  INVALID_CHANNEL: 'IPC_INVALID_CHANNEL',
  INVALID_PARAMS: 'IPC_INVALID_PARAMS',
  HANDLER_ERROR: 'IPC_HANDLER_ERROR',
  PERMISSION_DENIED: 'IPC_PERMISSION_DENIED',
  NOT_FOUND: 'IPC_NOT_FOUND',
  TIMEOUT: 'IPC_TIMEOUT',
};

// Error class for IPC errors
class IPCError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = 'IPCError';
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  IPC_CHANNELS,
  IPC_ERRORS,
  IPCError,
};