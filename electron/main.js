const { app, BrowserWindow, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let window = null;
let tray = null;

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
      contextIsolation: true
    }
  });

  window.loadURL('http://localhost:3000');
  
  window.on('blur', () => {
    window.hide();
  });

  // Create tray with multiple fallback strategies
  let trayCreated = false;
  
  // Strategy 1: Try small icon first (less likely to crash)
  console.log('Current directory:', __dirname);
  
  const iconPaths = [
    path.join(__dirname, 'electron/assets/icons/icon16.png'),
    path.join(__dirname, 'assets/icons/icon16.png'),
    path.join(process.cwd(), 'electron/assets/icons/icon16.png'),
    path.join(__dirname, 'electron/assets/icons/iconTemplate.png'),
    path.join(__dirname, 'assets/icons/iconTemplate.png'),
    path.join(process.cwd(), 'electron/assets/icons/iconTemplate.png')
  ];
  
  for (const iconPath of iconPaths) {
    if (!trayCreated && fs.existsSync(iconPath)) {
      try {
        console.log(`Attempting to load icon: ${iconPath}`);
        const icon = nativeImage.createFromPath(iconPath);
        
        // Verify icon loaded successfully
        if (!icon.isEmpty()) {
          const size = icon.getSize();
          console.log(`Icon loaded successfully: ${size.width}x${size.height}`);
          
          // Try to create tray with icon
          tray = new Tray(icon);
          trayCreated = true;
          console.log('Tray created with icon');
          
          // For template images on macOS
          if (iconPath.includes('Template')) {
            try {
              icon.setTemplateImage(true);
              console.log('Set as template image');
            } catch (e) {
              console.log('Could not set template image:', e.message);
            }
          }
          break;
        } else {
          console.log(`Icon is empty: ${iconPath}`);
        }
      } catch (error) {
        console.error(`Failed to load icon ${iconPath}:`, error.message);
      }
    }
  }
  
  // Strategy 2: If icon loading failed, try creating a simple colored icon
  if (!trayCreated) {
    try {
      console.log('Attempting to create colored icon programmatically');
      // Create a 16x16 icon with a simple colored circle
      const size = 16;
      const channels = 4; // RGBA
      const buffer = Buffer.alloc(size * size * channels);
      
      // Fill with transparent background and draw a circle
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * channels;
          const centerX = size / 2;
          const centerY = size / 2;
          const radius = size / 2 - 2;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          
          if (distance < radius) {
            // Inside circle - make it purple/pink
            buffer[idx] = 200;     // R
            buffer[idx + 1] = 100; // G
            buffer[idx + 2] = 200; // B
            buffer[idx + 3] = 255; // A (opaque)
          } else {
            // Outside circle - transparent
            buffer[idx] = 0;
            buffer[idx + 1] = 0;
            buffer[idx + 2] = 0;
            buffer[idx + 3] = 0;
          }
        }
      }
      
      const coloredIcon = nativeImage.createFromBuffer(buffer, {
        width: size,
        height: size
      });
      
      if (!coloredIcon.isEmpty()) {
        tray = new Tray(coloredIcon);
        trayCreated = true;
        console.log('Tray created with colored programmatic icon');
      }
    } catch (error) {
      console.error('Failed to create colored icon:', error.message);
    }
  }
  
  // Strategy 3: Final fallback - text only
  if (!trayCreated) {
    console.log('Using text-only fallback');
    const emptyImage = nativeImage.createEmpty();
    tray = new Tray(emptyImage);
    tray.setTitle('MB');
    trayCreated = true;
  }
  
  // Add tooltip
  try {
    tray.setToolTip('MoodBooMs');
  } catch (e) {
    console.log('Could not set tooltip:', e.message);
  }
  
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