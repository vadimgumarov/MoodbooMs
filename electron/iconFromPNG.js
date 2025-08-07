const { nativeImage, app } = require('electron');
const path = require('path');
const fs = require('fs');

// Load PNG file for menubar icon
function loadPNGIcon(filename) {
  try {
    // In development: use direct path
    // In production: use extraResources path
    let iconPath;
    if (app.isPackaged) {
      // Production: extraResources are in Contents/Resources/
      iconPath = path.join(process.resourcesPath, 'assets', 'icons', filename);
    } else {
      // Development: use direct path
      iconPath = path.join(__dirname, 'assets', 'icons', filename);
    }
    
    console.log(`Loading PNG from: ${iconPath}`);
    
    if (!fs.existsSync(iconPath)) {
      console.error(`PNG file not found: ${iconPath}`);
      return nativeImage.createEmpty();
    }
    
    // For macOS, use createFromPath which handles PNG files properly
    const icon = nativeImage.createFromPath(iconPath);
    
    // Mark as template for macOS (adapts to dark/light mode)
    if (process.platform === 'darwin') {
      icon.setTemplateImage(true);
    }
    
    console.log(`PNG icon loaded: size=${JSON.stringify(icon.getSize())}, empty=${icon.isEmpty()}`);
    return icon;
  } catch (error) {
    console.error(`Error loading PNG icon ${filename}:`, error);
    return nativeImage.createEmpty();
  }
}

// Get icon for phase using PNG files
function getIconForPhase(phase) {
  const phaseIconMap = {
    // BadAss mode phases
    'Bloody Hell Week': 'cloud-lightning.png',
    'Finally Got My Sh*t Together': 'sun.png',
    'Horny AF': 'cloud-sun.png',
    'Getting Real Tired of This BS': 'cloud.png',
    'Pre-Chaos Mood Swings': 'cloud-rain-wind.png',  // Using rain-wind for mood swings
    'Apocalypse Countdown': 'tornado.png',
    
    // Professional mode phases (same icons as BadAss for consistency)
    'Menstruation': 'cloud-lightning.png',
    'Follicular Phase': 'sun.png',
    'Ovulation': 'cloud-sun.png',
    'Luteal Phase': 'cloud.png',
    'Late Luteal Phase': 'cloud-rain-wind.png',
    'Pre-Menstrual': 'tornado.png'
  };
  
  const iconFile = phaseIconMap[phase] || 'cloud.png';
  return loadPNGIcon(iconFile);
}

module.exports = { getIconForPhase };