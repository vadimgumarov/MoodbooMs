const { app, BrowserWindow, Tray } = require('electron');
const path = require('path');

let tray = null;
let window = null;

function createWindow() {
  // Create a window that will be shown when clicking the menu bar icon
  window = new BrowserWindow({
    width: 320,
    height: 450,
    show: false,  // Start hidden
    frame: false, // No window frame
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Give React time to start up
  setTimeout(() => {
    window.loadURL('http://localhost:3000');
    // Uncomment this line to see if window is loading correctly
    // window.webContents.openDevTools();
  }, 2000);

  // Hide window when clicking outside
  window.on('blur', () => {
    window.hide();
  });
}

app.whenReady().then(() => {
  createWindow();
  
  // Create the menu bar icon
  const iconPath = path.join(__dirname, 'icon.png');
  console.log('Loading icon from:', iconPath); // Add this to debug
  tray = new Tray(iconPath);
  tray.setToolTip('MoodBooMs');

  // Show window when clicking the icon
  tray.on('click', (event, bounds) => {
    if (window.isVisible()) {
      window.hide();
    } else {
      const { x, y } = bounds;
      window.setPosition(x - 160, y);
      window.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});