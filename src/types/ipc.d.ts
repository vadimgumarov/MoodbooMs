// IPC TypeScript Definitions

// Cycle data types
interface CycleData {
  startDate: string;
  cycleLength: number;
  history?: CycleHistoryEntry[];
}

interface CycleHistoryEntry {
  startDate: string;
  length: number;
  notes?: string;
  addedAt?: string;
}

// Preferences types
interface Preferences {
  notifications: boolean;
  notificationDays: number[];
  theme: 'light' | 'dark' | 'auto';
  language: string;
  testMode: boolean;
}

// App state types
interface AppState {
  lastOpened: string;
  version: string;
  onboardingCompleted: boolean;
}

// Dialog types
interface SaveDialogResult {
  canceled: boolean;
  filePath?: string;
}

interface OpenDialogResult {
  canceled: boolean;
  filePaths?: string[];
}

interface MessageBoxResult {
  response: number;
  checkboxChecked?: boolean;
}

// Update types
interface UpdateCheckResult {
  updateAvailable: boolean;
  version?: string;
  releaseNotes?: string;
}

// Export/Import types
interface ExportData {
  data: {
    cycleData?: CycleData;
    preferences?: Preferences;
    appState?: AppState;
  };
  exportedAt: string;
  version: string;
}

// IPC Error types
interface IPCError {
  name: 'IPCError';
  code: string;
  message: string;
  details?: any;
}

// Channel type constants
type IPCChannelType = 'invoke' | 'send' | 'on';

// IPC API exposed to renderer via preload
interface ElectronAPI {
  // Cycle operations
  cycle: {
    getData: () => Promise<CycleData>;
    saveData: (data: Partial<CycleData>) => Promise<boolean>;
    getHistory: () => Promise<CycleHistoryEntry[]>;
    addHistory: (entry: Omit<CycleHistoryEntry, 'addedAt'>) => Promise<boolean>;
    updatePhase: (phase: string) => void;
  };

  // Settings operations
  settings: {
    get: (key?: keyof Preferences) => Promise<any>;
    set: (settings: Partial<Preferences>) => Promise<boolean>;
    reset: () => Promise<boolean>;
    getAll: () => Promise<Preferences>;
  };

  // Window operations
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    hide: () => void;
    show: () => void;
    setPosition: (x: number, y: number) => void;
    getPosition: () => Promise<[number, number]>;
    isVisible: () => Promise<boolean>;
  };

  // Tray operations
  tray: {
    updateIcon: (phase: string) => void;
    updateTooltip: (text: string) => void;
    showMenu: () => void;
  };

  // System operations
  system: {
    getPlatform: () => Promise<NodeJS.Platform>;
    getLocale: () => Promise<string>;
    getTheme: () => Promise<'light' | 'dark'>;
    onThemeChange: (callback: (theme: 'light' | 'dark') => void) => () => void;
  };

  // App operations
  app: {
    getVersion: () => Promise<string>;
    checkUpdates: () => Promise<UpdateCheckResult>;
    downloadUpdate: () => Promise<boolean>;
    installUpdate: () => void;
    quit: () => void;
    restart: () => void;
    getPath: (name: string) => Promise<string>;
  };

  // Notification operations
  notifications: {
    show: (title: string, body: string, options?: NotificationOptions) => Promise<boolean>;
    requestPermission: () => Promise<boolean>;
    isEnabled: () => Promise<boolean>;
  };

  // Dialog operations
  dialog: {
    showSave: (options?: Electron.SaveDialogOptions) => Promise<SaveDialogResult>;
    showOpen: (options?: Electron.OpenDialogOptions) => Promise<OpenDialogResult>;
    showMessage: (options?: Electron.MessageBoxOptions) => Promise<MessageBoxResult>;
    showError: (title: string, content: string) => Promise<boolean>;
  };

  // Store operations (backward compatibility)
  store: {
    get: (key?: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    clear: () => Promise<boolean>;
    has: (key: string) => Promise<boolean>;
    export: () => Promise<ExportData>;
    import: (data: ExportData) => Promise<boolean>;
  };

  // Development operations
  dev?: {
    openDevTools: () => void;
    reload: () => void;
    log: (level: 'log' | 'warn' | 'error' | 'info', message: string, data?: any) => void;
  };
}

// Extend Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// IPC Channel definitions for use in main process
interface IPCChannels {
  CYCLE: {
    GET_DATA: 'cycle:get-data';
    SAVE_DATA: 'cycle:save-data';
    GET_HISTORY: 'cycle:get-history';
    ADD_HISTORY: 'cycle:add-history';
    UPDATE_PHASE: 'cycle:update-phase';
  };
  SETTINGS: {
    GET: 'settings:get';
    SET: 'settings:set';
    RESET: 'settings:reset';
    GET_ALL: 'settings:get-all';
  };
  WINDOW: {
    MINIMIZE: 'window:minimize';
    MAXIMIZE: 'window:maximize';
    CLOSE: 'window:close';
    HIDE: 'window:hide';
    SHOW: 'window:show';
    SET_POSITION: 'window:set-position';
    GET_POSITION: 'window:get-position';
    IS_VISIBLE: 'window:is-visible';
  };
  TRAY: {
    UPDATE_ICON: 'tray:update-icon';
    UPDATE_TOOLTIP: 'tray:update-tooltip';
    SHOW_MENU: 'tray:show-menu';
  };
  SYSTEM: {
    GET_PLATFORM: 'system:get-platform';
    GET_LOCALE: 'system:get-locale';
    GET_THEME: 'system:get-theme';
    THEME_CHANGED: 'system:theme-changed';
  };
  APP: {
    GET_VERSION: 'app:get-version';
    CHECK_UPDATES: 'app:check-updates';
    DOWNLOAD_UPDATE: 'app:download-update';
    INSTALL_UPDATE: 'app:install-update';
    QUIT: 'app:quit';
    RESTART: 'app:restart';
    GET_PATH: 'app:get-path';
  };
  NOTIFICATION: {
    SHOW: 'notification:show';
    REQUEST_PERMISSION: 'notification:request-permission';
    IS_ENABLED: 'notification:is-enabled';
  };
  DIALOG: {
    SHOW_SAVE: 'dialog:show-save';
    SHOW_OPEN: 'dialog:show-open';
    SHOW_MESSAGE: 'dialog:show-message';
    SHOW_ERROR: 'dialog:show-error';
  };
  STORE: {
    GET: 'store:get';
    SET: 'store:set';
    DELETE: 'store:delete';
    CLEAR: 'store:clear';
    HAS: 'store:has';
    EXPORT: 'store:export';
    IMPORT: 'store:import';
  };
  DEV: {
    OPEN_DEVTOOLS: 'dev:open-devtools';
    RELOAD: 'dev:reload';
    LOG: 'dev:log';
  };
}

export {
  CycleData,
  CycleHistoryEntry,
  Preferences,
  AppState,
  SaveDialogResult,
  OpenDialogResult,
  MessageBoxResult,
  UpdateCheckResult,
  ExportData,
  IPCError,
  IPCChannelType,
  ElectronAPI,
  IPCChannels
};