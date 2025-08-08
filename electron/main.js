const { app, BrowserWindow, ipcMain, session } = require('electron');
const TrayManager = require('./trayManager');
const { initializeIpcHandlers, setAutoUpdaterManager } = require('./ipcHandlers');
const { applyCSPToSession } = require('./csp-config');
const { applySecuritySettings, setupAppSecurity, applySecurityHeaders, verifyWindowSecurity } = require('./security-config');
const { startHeartbeat } = require('./crash-monitor');
const { WINDOW_CONFIG, DEV_CONFIG, PATHS, LOGGING, ERROR_MESSAGES } = require('./constants');
const AutoUpdaterManager = require('./autoUpdater');

let window = null;
let trayManager = null;
let autoUpdaterManager = null;

// Set up app-wide security policies
setupAppSecurity();

// Disable hardware acceleration to prevent GPU crashes
app.disableHardwareAcceleration();

// Hide dock icon - moved to app.ready to prevent crashes

// Enable better error logging
const fs = require('fs');
const path = require('path');

// Use proper logs directory - in development use relative path, in production use userData
const logsDir = app.isPackaged 
  ? path.join(app.getPath('userData'), LOGGING.LOG_DIR)
  : path.join(__dirname, '..', LOGGING.LOG_DIR);

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `${LOGGING.LOG_FILE_PREFIX}-${new Date().toISOString().split('T')[0]}.log`);

function logToFile(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

console.log('=== MOODBOOMS ELECTRON STARTING ===');
logToFile('=== MOODBOOMS ELECTRON STARTING ===');

// Start heartbeat monitoring
startHeartbeat();

process.on('uncaughtException', (error) => {
  const errorMsg = `=== UNCAUGHT EXCEPTION ===\nError: ${error.message}\nStack: ${error.stack}\n========================`;
  console.error(errorMsg);
  logToFile(errorMsg);
  // Don't exit, try to recover
});

process.on('unhandledRejection', (reason, promise) => {
  const errorMsg = `=== UNHANDLED REJECTION ===\nPromise: ${promise}\nReason: ${reason}\n==========================`;
  console.error(errorMsg);
  logToFile(errorMsg);
});

app.whenReady().then(() => {
  console.log('App is ready, creating window and tray...');
  
  // Platform-specific app behavior
  if (process.platform === 'darwin') {
    // Hide dock icon on macOS (must be done after app is ready)
    if (app.dock) {
      app.dock.hide();
    }
  } else if (process.platform === 'win32') {
    // Windows-specific settings
    // Windows apps typically minimize to tray rather than hide dock
    app.setAppUserModelId('com.moodbooms.app');
  }
  
  // Run store migrations
  try {
    const { storeOperations } = require('./store');
    storeOperations.migrate();
    console.log('Store migrations completed');
  } catch (error) {
    console.error('Store migration error:', error);
  }
  
  // Apply Content Security Policy to the default session
  applyCSPToSession(session.defaultSession);
  
  // Apply additional security headers
  applySecurityHeaders(session.defaultSession);
  
  // Create window with security settings
  const windowOptions = applySecuritySettings({
    width: WINDOW_CONFIG.WIDTH,
    height: WINDOW_CONFIG.HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, PATHS.PRELOAD_SCRIPT)
    }
  });
  
  window = new BrowserWindow(windowOptions);
  
  // Verify window security
  const securityCheck = verifyWindowSecurity(window);
  if (!securityCheck.secure) {
    console.error('Window security violations:', securityCheck.violations);
  }

  // Load the app - in dev mode from localhost, in production from built files
  const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true';
  
  if (isDev && process.env.REACT_DEV_URL) {
    // Development mode with React dev server
    setTimeout(() => {
      console.log(`Loading URL ${DEV_CONFIG.REACT_DEV_URL}`);
      logToFile(`Loading URL ${DEV_CONFIG.REACT_DEV_URL}`);
      window.loadURL(DEV_CONFIG.REACT_DEV_URL);
    }, DEV_CONFIG.REACT_START_DELAY);
  } else {
    // Production mode - load from built files
    // In packaged app, __dirname is build/electron, so we need to go up one level to get to build/
    const appPath = path.join(__dirname, '..', 'index.html');
    console.log('Loading built app from:', appPath);
    logToFile('Loading built app from: ' + appPath);
    window.loadFile(appPath).catch(err => {
      console.error('Failed to load app:', err);
      logToFile('Failed to load app: ' + err.message);
    });
  }
  
  window.on('blur', () => {
    console.log('Window blur event');
    logToFile('Window blur event');
    window.hide();
  });
  
  window.on('closed', () => {
    console.log('Window closed event');
    logToFile('Window closed event');
  });
  
  window.on('unresponsive', () => {
    const msg = '=== WINDOW UNRESPONSIVE ===';
    console.error(msg);
    logToFile(msg);
  });
  
  window.on('responsive', () => {
    const msg = '=== WINDOW RESPONSIVE AGAIN ===';
    console.log(msg);
    logToFile(msg);
  });
  
  window.on('show', () => {
    console.log('Window show event');
    logToFile('Window show event');
  });
  
  window.on('hide', () => {
    console.log('Window hide event');
    logToFile('Window hide event');
  });
  
  window.webContents.on('crashed', (event, killed) => {
    const crashMsg = `=== RENDERER PROCESS CRASHED ===\nKilled: ${killed}`;
    console.error(crashMsg);
    logToFile(crashMsg);
  });
  
  window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    const loadError = `=== WINDOW FAILED TO LOAD ===\nError code: ${errorCode}\nError description: ${errorDescription}`;
    console.error(loadError);
    logToFile(loadError);
  });
  
  window.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (level >= 2) { // Error level
      const consoleError = `=== CONSOLE ERROR ===\nMessage: ${message}\nSource: ${sourceId}:${line}`;
      console.error(consoleError);
      logToFile(consoleError);
    }
  });
  
  window.webContents.on('did-finish-load', () => {
    console.log('=== WINDOW LOADED SUCCESSFULLY ===');
    logToFile('=== WINDOW LOADED SUCCESSFULLY ===');
    
    // Check if React app loaded
    window.webContents.executeJavaScript(`
      const root = document.getElementById('root');
      const hasContent = root && root.innerHTML.trim().length > 0;
      console.log('React root element:', root);
      console.log('Has content:', hasContent);
      console.log('Content length:', root ? root.innerHTML.length : 0);
      hasContent;
    `).then(hasContent => {
      console.log('React app loaded:', hasContent);
      logToFile(`React app loaded: ${hasContent}`);
    }).catch(err => {
      console.error('Error checking React app:', err);
      logToFile(`Error checking React app: ${err.message}`);
    });
  });
  
  window.webContents.on('dom-ready', () => {
    console.log('=== DOM READY ===');
    logToFile('=== DOM READY ===');
    
    // Check if preload worked
    window.webContents.executeJavaScript(`
      console.log('Checking electronAPI availability...');
      console.log('window.electronAPI exists:', !!window.electronAPI);
      !!window.electronAPI
    `).then(hasAPI => {
      console.log('Preload script loaded correctly:', hasAPI);
      logToFile(`Preload script loaded correctly: ${hasAPI}`);
    });
    
    // Open DevTools in development for debugging
    if (isDev) {
      // window.webContents.openDevTools({ mode: 'detach' });
    }
    // TEMPORARILY ENABLE DEVTOOLS TO DEBUG CRASH
    window.webContents.openDevTools({ mode: 'detach' });
  });
  
  window.webContents.on('render-process-gone', (event, details) => {
    const goneMsg = `=== RENDER PROCESS GONE ===\nReason: ${details.reason}\nExit Code: ${details.exitCode}`;
    console.error(goneMsg);
    logToFile(goneMsg);
  });

  // Initialize tray manager
  try {
    console.log('Initializing TrayManager...');
    logToFile('Initializing TrayManager...');
    trayManager = new TrayManager();
    trayManager.init(window);
    console.log('TrayManager initialized successfully');
    logToFile('TrayManager initialized successfully');
  } catch (error) {
    const trayError = `ERROR initializing TrayManager: ${error.message}\nStack: ${error.stack}`;
    console.error(trayError);
    logToFile(trayError);
  }
  
  // Initialize all IPC handlers
  try {
    console.log('Initializing IPC handlers...');
    logToFile('Initializing IPC handlers...');
    
    // Log all IPC messages
    ipcMain.on('*', (event, ...args) => {
      console.log(`IPC Message received on channel: ${event}`, args);
      logToFile(`IPC Message: ${event}`);
    });
    
    initializeIpcHandlers(ipcMain, window, trayManager);
    console.log('IPC handlers initialized successfully');
    logToFile('IPC handlers initialized successfully');
    
    // Initialize auto-updater
    autoUpdaterManager = new AutoUpdaterManager();
    autoUpdaterManager.setWindow(window);
    setAutoUpdaterManager(autoUpdaterManager);
    
    // Check for updates 5 seconds after app starts
    setTimeout(() => {
      autoUpdaterManager.checkForUpdates(false);
    }, 5000);
  } catch (error) {
    const ipcError = `ERROR initializing IPC handlers: ${error.message}\nStack: ${error.stack}`;
    console.error(ipcError);
    logToFile(ipcError);
  }
});

// Keep the app running
setInterval(() => {}, 1000);

// Log when app is about to quit
app.on('will-quit', () => {
  logToFile('=== APP WILL QUIT ===');
});

app.on('window-all-closed', () => {
  logToFile('=== ALL WINDOWS CLOSED ===');
  // On Windows and Linux, keep app running in tray even when all windows are closed
  // On macOS, apps typically quit when all windows are closed (but we're a tray app)
  // Since we're a tray app on all platforms, don't quit
});