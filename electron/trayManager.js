const { Tray, nativeImage } = require('electron');
const IconGeneratorLucide = require('./iconGeneratorLucide');

class TrayManager {
  constructor() {
    this.tray = null;
    this.window = null;
    this.iconGenerator = new IconGeneratorLucide();
    this.currentPhase = null;
  }

  // Initialize tray with window reference
  init(window) {
    console.log('TrayManager.init() called');
    this.window = window;
    
    try {
      // Create initial tray with default icon
      console.log('Generating default icon...');
      const defaultIcon = this.iconGenerator.generateIcon('default');
      console.log('Default icon generated, creating Tray...');
      this.tray = new Tray(defaultIcon);
      console.log('Tray created successfully');
      
      // Set tooltip
      this.tray.setToolTip('MoodBooMs');
      console.log('Tooltip set');
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
            const bounds = this.tray.getBounds();
            console.log('Tray bounds:', bounds);
            
            // Ensure window positioning is within screen bounds
            const x = Math.max(0, bounds.x - 190);
            const y = bounds.y + bounds.height;
            
            console.log(`Setting window position to x:${x}, y:${y}`);
            this.window.setPosition(x, y);
            
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
      console.log(`Generating new icon for phase: ${phase}`);
      const newIcon = this.iconGenerator.generateIcon(phase);
      
      if (newIcon && !newIcon.isEmpty()) {
        console.log(`Icon generated successfully, size: ${newIcon.getSize().width}x${newIcon.getSize().height}`);
        console.log('Setting new tray image...');
        this.tray.setImage(newIcon);
        this.currentPhase = phase;
        console.log('Tray icon updated successfully');
      } else {
        console.error('ERROR: Generated icon is empty');
      }
    } catch (error) {
      console.error('ERROR in updateIcon:', error.message);
      console.error('Stack:', error.stack);
      // Fallback to default icon
      try {
        console.log('Attempting fallback to default icon...');
        const defaultIcon = this.iconGenerator.generateIcon('default');
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

  // Destroy tray
  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  // Clear icon cache
  clearIconCache() {
    this.iconGenerator.clearCache();
  }
}

module.exports = TrayManager;