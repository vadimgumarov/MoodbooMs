const { app, Tray, nativeImage } = require('electron');
const path = require('path');

app.dock.hide();

let tray = null;

app.whenReady().then(() => {
  console.log('Testing icon with different timing approaches...');
  
  // Test 1: Create tray with icon path directly
  console.log('Test 1: Direct path with delay');
  
  setTimeout(() => {
    try {
      // This might show the question mark briefly
      tray = new Tray(path.join(__dirname, 'icon.png'));
      console.log('Tray created with direct path');
      
      // Don't destroy it immediately - let it sit
      setTimeout(() => {
        console.log('Tray should be visible now');
        
        // Try updating the image
        const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
        if (!icon.isEmpty()) {
          tray.setImage(icon);
          console.log('Updated tray image');
        } else {
          console.log('Icon is still empty, trying fallback...');
          
          // Try creating a simple colored icon programmatically
          const size = 16;
          const buffer = Buffer.alloc(size * size * 4);
          
          // Fill with red color
          for (let i = 0; i < size * size * 4; i += 4) {
            buffer[i] = 255;     // R
            buffer[i + 1] = 0;   // G
            buffer[i + 2] = 0;   // B
            buffer[i + 3] = 255; // A
          }
          
          const redIcon = nativeImage.createFromBuffer(buffer, {
            width: size,
            height: size
          });
          
          tray.setImage(redIcon);
          console.log('Set red square icon');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Test 1 failed:', error.message);
    }
  }, 1000);
  
  // After 5 seconds, try the working text approach
  setTimeout(() => {
    console.log('Switching to text display...');
    if (tray) {
      tray.setTitle('MB');
      console.log('Added text title');
    }
  }, 5000);
});

// Keep app running
setInterval(() => {}, 1000);