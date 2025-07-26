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
    this.window = window;
    
    // Create initial tray with default icon
    const defaultIcon = this.iconGenerator.generateIcon('default');
    this.tray = new Tray(defaultIcon);
    
    // Set tooltip
    this.tray.setToolTip('MoodBooMs');
    
    // Set up click handler
    this.tray.on('click', () => {
      if (this.window) {
        if (this.window.isVisible()) {
          this.window.hide();
        } else {
          const bounds = this.tray.getBounds();
          this.window.setPosition(bounds.x - 190, bounds.y + bounds.height);
          this.window.show();
        }
      }
    });
    
    return this.tray;
  }

  // Update tray icon based on phase
  updateIcon(phase) {
    if (!this.tray || phase === this.currentPhase) {
      return;
    }

    try {
      console.log(`Updating tray icon for phase: ${phase}`);
      const newIcon = this.iconGenerator.generateIcon(phase);
      
      if (newIcon && !newIcon.isEmpty()) {
        this.tray.setImage(newIcon);
        this.currentPhase = phase;
        console.log('Tray icon updated successfully');
      } else {
        console.error('Generated icon is empty');
      }
    } catch (error) {
      console.error('Failed to update tray icon:', error);
      // Fallback to default icon
      try {
        const defaultIcon = this.iconGenerator.generateIcon('default');
        this.tray.setImage(defaultIcon);
      } catch (fallbackError) {
        console.error('Failed to set fallback icon:', fallbackError);
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