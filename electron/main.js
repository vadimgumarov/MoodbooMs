const { app, BrowserWindow, ipcMain } = require('electron');
const TrayManager = require('./trayManager');

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
  
  // Set up IPC handlers for phase updates
  ipcMain.on('phase-update', (event, phase) => {
    console.log('Received phase update:', phase);
    if (trayManager) {
      trayManager.updateIcon(phase);
      trayManager.updateTooltip(`MoodBooMs - ${phase}`);
    }
  });
});

// Keep the app running
setInterval(() => {}, 1000);