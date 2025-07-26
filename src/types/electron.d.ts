// Type definitions for the Electron API exposed to the renderer process

interface ElectronAPI {
  // Tray/Icon Management
  tray: {
    updatePhase: (phase: string) => void;
    updateTooltip: (text: string) => void;
  };

  // Window Management
  window: {
    hide: () => void;
    show: () => void;
    setPosition: (x: number, y: number) => void;
    getPosition: () => Promise<[number, number]>;
    isVisible: () => Promise<boolean>;
  };

  // Data Persistence
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    clear: () => Promise<boolean>;
    has: (key: string) => Promise<boolean>;
  };

  // System Information
  system: {
    getPlatform: () => Promise<'darwin' | 'win32' | 'linux'>;
    getLocale: () => Promise<string>;
    getTheme: () => Promise<'dark' | 'light'>;
    onThemeChange: (callback: (theme: 'dark' | 'light') => void) => () => void;
  };

  // Notifications
  notifications: {
    show: (title: string, body: string, options?: NotificationOptions) => Promise<boolean>;
    requestPermission: () => Promise<boolean>;
    isEnabled: () => Promise<boolean>;
  };

  // App Control
  app: {
    getVersion: () => Promise<string>;
    quit: () => void;
    restart: () => void;
    getPath: (name: string) => Promise<string | null>;
  };

  // Dialog Operations
  dialog: {
    showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath?: string }>;
    showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
    showMessageBox: (options: any) => Promise<{ response: number; checkboxChecked: boolean }>;
  };

  // Updates
  updates: {
    checkForUpdates: () => Promise<{ updateAvailable: boolean }>;
    downloadUpdate: () => Promise<boolean>;
    installUpdate: () => void;
    onUpdateAvailable: (callback: (info: any) => void) => () => void;
  };

  // Development/Debug
  dev: {
    openDevTools: () => void;
    reload: () => void;
  };
}

interface Window {
  electronAPI: ElectronAPI;
}