const { app, BrowserWindow, Tray, nativeImage, Menu } = require('electron');

let window = null;
let tray = null;

// Hide dock icon
app.dock.hide();

app.whenReady().then(() => {
  // Create window
  window = new BrowserWindow({
    width: 380,
    height: 520,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  window.loadURL('http://localhost:3000');
  
  window.on('blur', () => {
    window.hide();
  });

  // Create tray
  const image = nativeImage.createEmpty();
  tray = new Tray(image);
  tray.setTitle('MB');
  
  tray.on('click', () => {
    if (window.isVisible()) {
      window.hide();
    } else {
      const bounds = tray.getBounds();
      window.setPosition(bounds.x - 190, bounds.y + bounds.height);
      window.show();
    }
  });
});

// Keep the app running
setInterval(() => {}, 1000);