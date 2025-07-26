const { app, BrowserWindow, ipcMain } = require('electron');
const TrayManager = require('./trayManager');
const { initializeIpcHandlers } = require('./ipcHandlers');

let window = null;
let trayManager = null;

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
  // Create window
  window = new BrowserWindow({
    width: 380,
    height: 520,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js'
    }
  });

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