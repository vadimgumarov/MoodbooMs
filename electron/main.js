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
  // NOTE: Icons don't work on macOS 15.5 (Sequoia) due to OS bug
  // When fixed, use: const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/icon.png'));
  const image = nativeImage.createEmpty();
  tray = new Tray(image);
  tray.setTitle('MB'); // Text-based menubar workaround
  
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