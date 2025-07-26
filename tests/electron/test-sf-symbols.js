const { app, Tray, nativeImage, systemPreferences } = require('electron');

app.dock.hide();

app.whenReady().then(() => {
  console.log('Testing SF Symbols approach...');
  
  try {
    // Create empty tray first
    const tray = new Tray(nativeImage.createEmpty());
    
    // Try to use SF Symbols or system features
    // Note: This is experimental
    
    // Option 1: Use attributed title with system font
    tray.setTitle('􀉾'); // SF Symbol for calendar
    console.log('Set SF Symbol as title');
    
    setTimeout(() => {
      // Try different symbols
      tray.setTitle('🌙'); // Moon emoji
      console.log('Changed to moon emoji');
    }, 3000);
    
    setTimeout(() => {
      // Try text with special formatting
      tray.setTitle('⚫ MB'); // Black circle + text
      console.log('Changed to circle + text');
    }, 6000);
    
  } catch (error) {
    console.error('Failed:', error.message);
  }
});

// Keep app running
setInterval(() => {}, 1000);