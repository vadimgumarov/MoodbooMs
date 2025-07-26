const { nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('Testing icon files...\n');

const iconPaths = [
  'assets/icons/icon16.png',
  'assets/icons/icon32.png',
  'assets/icons/iconTemplate.png',
  'assets/icons/icon.png'
];

iconPaths.forEach(iconPath => {
  const fullPath = path.join(__dirname, iconPath);
  console.log(`\nTesting: ${iconPath}`);
  
  if (fs.existsSync(fullPath)) {
    console.log('  ✓ File exists');
    
    const stats = fs.statSync(fullPath);
    console.log(`  Size: ${stats.size} bytes`);
    
    try {
      const icon = nativeImage.createFromPath(fullPath);
      
      if (!icon.isEmpty()) {
        const size = icon.getSize();
        console.log(`  ✓ Loaded successfully: ${size.width}x${size.height}`);
        
        // Test if we can convert to different formats
        try {
          const pngBuffer = icon.toPNG();
          console.log(`  ✓ Can convert to PNG: ${pngBuffer.length} bytes`);
        } catch (e) {
          console.log(`  ✗ Cannot convert to PNG: ${e.message}`);
        }
      } else {
        console.log('  ✗ Icon is empty after loading');
      }
    } catch (error) {
      console.log(`  ✗ Failed to load: ${error.message}`);
    }
  } else {
    console.log('  ✗ File does not exist');
  }
});