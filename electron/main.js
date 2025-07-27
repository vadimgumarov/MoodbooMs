const { app, BrowserWindow, ipcMain, session } = require('electron');
const TrayManager = require('./trayManager');
const { initializeIpcHandlers } = require('./ipcHandlers');
const { applyCSPToSession } = require('./csp-config');
const { applySecuritySettings, setupAppSecurity, applySecurityHeaders, verifyWindowSecurity } = require('./security-config');

let window = null;
let trayManager = null;

// Set up app-wide security policies
setupAppSecurity();

// Hide dock icon
app.dock.hide();

// Enable better error logging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.whenReady().then(() => {
  console.log('App is ready, creating window and tray...');
  
  // Apply Content Security Policy to the default session
  applyCSPToSession(session.defaultSession);
  
  // Apply additional security headers
  applySecurityHeaders(session.defaultSession);
  
  // Create window with security settings
  const windowOptions = applySecuritySettings({
    width: 420,
    height: 650,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: __dirname + '/preload.js'
    }
  });
  
  window = new BrowserWindow(windowOptions);
  
  // Verify window security
  const securityCheck = verifyWindowSecurity(window);
  if (!securityCheck.secure) {
    console.error('Window security violations:', securityCheck.violations);
  }

  window.loadURL('http://localhost:3000');
  
  window.on('blur', () => {
    window.hide();
  });

  // Initialize tray manager
  trayManager = new TrayManager();
  trayManager.init(window);
  
  // Initialize all IPC handlers
  initializeIpcHandlers(ipcMain, window, trayManager);
});

// Keep the app running
setInterval(() => {}, 1000);