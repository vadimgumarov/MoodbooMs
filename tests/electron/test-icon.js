const { app, Tray, nativeImage } = require('electron');
const path = require('path');

app.dock.hide();

app.whenReady().then(() => {
  console.log('Testing different icon approaches...');
  
  // Test 1: Try with path directly
  try {
    console.log('Test 1: Direct path');
    const tray1 = new Tray(path.join(__dirname, 'icon.png'));
    console.log('Test 1 success - icon with direct path');
    setTimeout(() => {
      tray1.destroy();
      test2();
    }, 2000);
  } catch (error) {
    console.error('Test 1 failed:', error.message);
    test2();
  }
  
  function test2() {
    // Test 2: Try with nativeImage
    try {
      console.log('Test 2: nativeImage.createFromPath');
      const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
      console.log('Icon empty?', icon.isEmpty());
      console.log('Icon size:', icon.getSize());
      const tray2 = new Tray(icon);
      console.log('Test 2 success - icon with nativeImage');
      setTimeout(() => {
        tray2.destroy();
        test3();
      }, 2000);
    } catch (error) {
      console.error('Test 2 failed:', error.message);
      test3();
    }
  }
  
  function test3() {
    // Test 3: Try with template image
    try {
      console.log('Test 3: Template image');
      const icon = nativeImage.createFromPath(path.join(__dirname, 'iconTemplate.png'));
      icon.setTemplateImage(true);
      const tray3 = new Tray(icon);
      console.log('Test 3 success - template icon');
      setTimeout(() => {
        tray3.destroy();
        test4();
      }, 2000);
    } catch (error) {
      console.error('Test 3 failed:', error.message);
      test4();
    }
  }
  
  function test4() {
    // Test 4: Try with system icon
    try {
      console.log('Test 4: System icon path');
      const tray4 = new Tray('/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns');
      console.log('Test 4 success - system icon');
      setTimeout(() => {
        tray4.destroy();
        test5();
      }, 2000);
    } catch (error) {
      console.error('Test 4 failed:', error.message);
      test5();
    }
  }
  
  function test5() {
    // Test 5: Empty image with title (known working)
    try {
      console.log('Test 5: Empty image with title');
      const tray5 = new Tray(nativeImage.createEmpty());
      tray5.setTitle('MB');
      console.log('Test 5 success - text only');
      
      // Keep this one running
      setTimeout(() => {
        console.log('All tests complete. Text-only tray remains visible.');
      }, 2000);
    } catch (error) {
      console.error('Test 5 failed:', error.message);
    }
  }
});

// Keep app running
setInterval(() => {}, 1000);