const { Tray, nativeImage, Menu, app } = require('electron');
const { getIconForPhase } = require('./iconFromPNG');

class TrayManager {
  constructor() {
    this.tray = null;
    this.window = null;
    this.currentPhase = null;
  }

  // Initialize tray with window reference
  init(window) {
    console.log('TrayManager.init() called');
    this.window = window;
    
    try {
      // Create initial tray with default icon
      console.log('Loading default PNG icon...');
      const defaultIcon = getIconForPhase('default');
      console.log('Default icon loaded, creating Tray...');
      this.tray = new Tray(defaultIcon);
      console.log('Tray created successfully');
      
      // Set tooltip
      this.tray.setToolTip('MoodbooM');
      console.log('Tooltip set');
      
      // Create context menu for Windows (and optionally for macOS)
      this.createContextMenu();
    } catch (error) {
      console.error('ERROR in TrayManager.init():', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
    
    // Set up click handler
    this.tray.on('click', () => {
      console.log('Tray clicked');
      try {
        if (this.window) {
          if (this.window.isDestroyed()) {
            console.error('ERROR: Window has been destroyed');
            return;
          }
          
          if (this.window.isVisible()) {
            console.log('Window is visible, hiding...');
            this.window.hide();
          } else {
            console.log('Window is hidden, showing...');
            this.positionWindow();
            console.log('Showing window...');
            this.window.show();
            console.log('Window shown');
          }
        } else {
          console.error('ERROR: this.window is null in click handler');
        }
      } catch (error) {
        console.error('ERROR in tray click handler:', error.message);
        console.error('Stack:', error.stack);
      }
    });
    
    return this.tray;
  }

  // Update tray icon based on phase
  updateIcon(phase) {
    console.log(`updateIcon called with phase: "${phase}", currentPhase: "${this.currentPhase}"`);
    
    if (!this.tray) {
      console.error('ERROR: tray is null in updateIcon');
      return;
    }
    
    if (phase === this.currentPhase) {
      console.log('Phase unchanged, skipping icon update');
      return;
    }

    try {
      console.log(`Loading PNG icon for phase: ${phase}`);
      const newIcon = getIconForPhase(phase);
      
      if (newIcon && !newIcon.isEmpty()) {
        console.log(`Icon loaded successfully, size: ${newIcon.getSize().width}x${newIcon.getSize().height}`);
        console.log('Setting new tray image...');
        this.tray.setImage(newIcon);
        this.currentPhase = phase;
        console.log('Tray icon updated successfully');
      } else {
        console.error('ERROR: Icon is empty');
      }
    } catch (error) {
      console.error('ERROR in updateIcon:', error.message);
      console.error('Stack:', error.stack);
      // Fallback to default icon
      try {
        console.log('Attempting fallback to default icon...');
        const defaultIcon = getIconForPhase('default');
        this.tray.setImage(defaultIcon);
        console.log('Fallback icon set');
      } catch (fallbackError) {
        console.error('ERROR setting fallback icon:', fallbackError.message);
      }
    }
  }

  // Update tooltip text
  updateTooltip(text) {
    if (this.tray) {
      this.tray.setToolTip(text);
    }
  }

  // Get current phase
  getCurrentPhase() {
    return this.currentPhase;
  }

  // Create context menu (especially important for Windows)
  createContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show MoodbooM',
        click: () => {
          if (this.window && !this.window.isDestroyed()) {
            this.positionWindow();
            this.window.show();
          }
        }
      },
      {
        label: 'Hide MoodbooM',
        click: () => {
          if (this.window && !this.window.isDestroyed()) {
            this.window.hide();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'About',
        click: () => {
          // Could show about dialog or version info
          console.log('MoodbooM v1.0.0');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    // On Windows, right-click shows context menu
    // On macOS, both right-click and Control+Click show context menu
    this.tray.setContextMenu(contextMenu);
  }

  // Position window relative to tray icon (platform-specific)
  positionWindow() {
    if (!this.window || !this.tray) return;
    
    const bounds = this.tray.getBounds();
    console.log('Tray bounds:', bounds);
    
    if (process.platform === 'win32') {
      // Windows: Position above the system tray
      const { screen } = require('electron');
      const display = screen.getPrimaryDisplay();
      const { width, height } = display.workAreaSize;
      
      // Get window size
      const windowBounds = this.window.getBounds();
      
      // Position window above system tray (usually bottom-right)
      const x = Math.min(bounds.x, width - windowBounds.width);
      const y = height - windowBounds.height - 40; // 40px above taskbar
      
      console.log(`Setting window position to x:${x}, y:${y} (Windows)`);
      this.window.setPosition(x, y);
    } else {
      // macOS: Position below the menubar icon
      const x = Math.max(0, bounds.x - 190);
      const y = bounds.y + bounds.height;
      
      console.log(`Setting window position to x:${x}, y:${y} (macOS)`);
      this.window.setPosition(x, y);
    }
  }

  // Destroy tray
  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  // Clear icon cache (not needed for PNG files)
  clearIconCache() {
    // No cache needed with PNG files
  }
}

module.exports = TrayManager;