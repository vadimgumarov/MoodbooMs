const { app, BrowserWindow, Tray, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let window = null;

app.whenReady().then(() => {
  window = new BrowserWindow({
    width: 320,
    height: 450,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  window.loadURL('http://localhost:3000');

  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  tray = new Tray(icon);
  tray.setToolTip('CycleAware');

  tray.on('click', (event, bounds) => {
    const { x, y } = bounds;
    const { height, width } = window.getBounds();
    
    window.setBounds({
      x: x - width/2,
      y: y - height,
      width,
      height
    });

    window.isVisible() ? window.hide() : window.show();
  });

  window.on('blur', () => {
    window.hide();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});