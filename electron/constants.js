/**
 * Constants for Electron Main Process
 * 
 * This file centralizes all hardcoded values used in the Electron main process
 * to improve maintainability and make configuration changes easier.
 */

// Window Configuration
export const WINDOW_CONFIG = {
  WIDTH: 420,
  HEIGHT: 650,
  MIN_WIDTH: 320,
  MIN_HEIGHT: 480,
  TITLE_BAR_HEIGHT: 20,
  WINDOW_MARGIN: 10,
  RESIZE_DEBOUNCE_MS: 100
};

// Development Configuration
export const DEV_CONFIG = {
  REACT_START_DELAY: 2000, // ms to wait for React dev server
  REACT_DEV_URL: 'http://localhost:3000',
  DEV_TOOLS_MODE: 'detach'
};

// Paths and Files
export const PATHS = {
  ICONS_DIR: 'icons',
  PRELOAD_SCRIPT: 'preload.js',
  DEFAULT_ICON: 'icon.png'
};

// IPC Channels
export const IPC_CHANNELS = {
  // Tray channels
  TRAY_UPDATE_PHASE: 'tray:update-phase',
  TRAY_SET_TOOLTIP: 'tray:set-tooltip',
  
  // Window channels
  WINDOW_SHOW: 'window:show',
  WINDOW_HIDE: 'window:hide',
  WINDOW_TOGGLE: 'window:toggle',
  WINDOW_POSITION: 'window:get-position',
  
  // Store channels
  STORE_GET: 'store:get',
  STORE_SET: 'store:set',
  STORE_DELETE: 'store:delete',
  STORE_CLEAR: 'store:clear',
  STORE_HAS: 'store:has',
  STORE_GET_ALL: 'store:get-all',
  
  // System channels
  SYSTEM_INFO: 'system:info',
  SYSTEM_THEME: 'system:theme',
  
  // App channels
  APP_VERSION: 'app:version',
  APP_QUIT: 'app:quit',
  APP_LOG: 'app:log'
};

// Logging Configuration
export const LOGGING = {
  LOG_DIR: 'logs',
  LOG_FILE_PREFIX: 'electron',
  LOG_DATE_FORMAT: 'YYYY-MM-DD',
  MAX_LOG_FILES: 7,
  LOG_ROTATION_INTERVAL: 24 * 60 * 60 * 1000 // 24 hours in ms
};

// Tray Configuration
export const TRAY_CONFIG = {
  ICON_SIZE: 22, // macOS menubar standard
  TOOLTIP_PREFIX: 'MoodbooM',
  DEFAULT_PHASE: 'Bloody Hell Week'
};

// Security Configuration
export const SECURITY = {
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'file://'
  ],
  BLOCKED_PERMISSIONS: [
    'openExternal',
    'media',
    'geolocation'
  ]
};

// Timing Constants
export const TIMING = {
  WINDOW_SHOW_DELAY: 100, // ms delay before showing window
  BLUR_HIDE_DELAY: 100,   // ms delay before hiding on blur
  CRASH_CHECK_INTERVAL: 5000, // ms between crash checks
  HEARTBEAT_TIMEOUT: 5000 // ms before considering renderer dead
};

// Error Messages
export const ERROR_MESSAGES = {
  REACT_CONNECTION: 'Failed to connect to React dev server',
  IPC_HANDLER: 'IPC handler error',
  STORE_ACCESS: 'Failed to access store',
  WINDOW_CREATION: 'Failed to create window',
  TRAY_CREATION: 'Failed to create tray'
};

// Default Values
export const DEFAULTS = {
  CYCLE_LENGTH: 28,
  CYCLE_START_DATE: new Date().toISOString(),
  NOTIFICATIONS_ENABLED: true,
  THEME: 'auto',
  MODE: 'queen'
};