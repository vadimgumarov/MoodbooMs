const { app, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

app.dock.hide();

app.whenReady().then(() => {
  console.log('Testing with base64 encoded icon...');
  
  // Create a tiny 16x16 black square PNG from base64
  const blackSquare16 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVQ4T2NkYGD4z0ABYBw1gGE0DBhGw4BhWIQBABXAABFKJ/WXAAAAAElFTkSuQmCC';
  
  try {
    // Test with base64 image
    const icon = nativeImage.createFromDataURL(`data:image/png;base64,${blackSquare16}`);
    console.log('Created icon from base64');
    console.log('Icon size:', icon.getSize());
    console.log('Icon empty?', icon.isEmpty());
    
    const tray = new Tray(icon);
    console.log('Tray created with base64 icon');
    
    // Try setting it as template
    icon.setTemplateImage(true);
    tray.setImage(icon);
    console.log('Set as template image');
    
    // Also try setting a title
    tray.setTitle('MB');
    console.log('Added title as fallback');
    
  } catch (error) {
    console.error('Failed:', error.message);
    
    // Fallback to text only
    const tray = new Tray(nativeImage.createEmpty());
    tray.setTitle('MB');
    console.log('Fallback to text-only tray');
  }
});

// Keep app running
setInterval(() => {}, 1000);