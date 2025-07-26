const { app, Tray, nativeImage } = require('electron');
const path = require('path');

app.dock.hide();

app.whenReady().then(() => {
  console.log('Intentionally triggering question mark icon...');
  
  try {
    // Create tray with non-existent file to get question mark
    const tray = new Tray('/does/not/exist/icon.png');
    console.log('Created tray with missing icon - should show question mark');
    
    // After 3 seconds, try to set a real icon
    setTimeout(() => {
      console.log('Now trying to set a real icon...');
      
      // Try multiple approaches
      
      // 1. Try with absolute path to our icon
      try {
        tray.setImage(path.join(__dirname, 'icon.png'));
        console.log('Attempt 1: Set image with path');
      } catch (e) {
        console.log('Attempt 1 failed:', e.message);
      }
      
      // 2. Try with nativeImage
      setTimeout(() => {
        try {
          const img = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
          console.log('Image loaded? Size:', img.getSize());
          tray.setImage(img);
          console.log('Attempt 2: Set image with nativeImage');
        } catch (e) {
          console.log('Attempt 2 failed:', e.message);
        }
      }, 1000);
      
      // 3. Try removing image and adding title
      setTimeout(() => {
        try {
          tray.setImage(nativeImage.createEmpty());
          tray.setTitle('MB');
          console.log('Attempt 3: Switched to text mode');
        } catch (e) {
          console.log('Attempt 3 failed:', e.message);
        }
      }, 2000);
      
    }, 3000);
    
  } catch (error) {
    console.error('Failed to create tray:', error.message);
  }
});

// Keep app running
setInterval(() => {}, 1000);