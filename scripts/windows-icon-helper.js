#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log(`
Windows Tray Icon Best Practices
=================================

1. Icon Sizes:
   - System Tray: 16x16 or 32x32 pixels (PNG or ICO)
   - High DPI: Provide 32x32 for better scaling
   - Notification Area: 16x16 is standard

2. Current Implementation:
   - Using PNG files that work on both Windows and macOS
   - Icons automatically resize to 32x32 if larger
   - Context menu added for Windows right-click

3. Windows-Specific Features Added:
   ✅ Context menu with Show/Hide/Quit options
   ✅ Window positioning above taskbar
   ✅ Automatic icon resizing for tray
   ✅ Support for both Queen and King mode icons

4. Testing on Windows:
   - Build: npm run build:win
   - Test installer: dist/MoodBooMs-Setup-1.0.0.exe
   - Test portable: dist/MoodBooMs-Portable-1.0.0.exe

5. Icon Files Currently Used:
`);

// List current icon files
const iconsDir = path.join(__dirname, '../electron/assets/icons');
const iconFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));

iconFiles.forEach(file => {
  const filePath = path.join(iconsDir, file);
  const stats = fs.statSync(filePath);
  console.log(`   - ${file} (${stats.size} bytes)`);
});

console.log(`
6. To Create Windows ICO (Optional):
   - Use online converter: https://convertio.co/png-ico/
   - Or ImageMagick: convert icon32.png icon.ico
   - Place in electron/assets/icons/icon.ico

Note: The app works fine with PNG icons on Windows.
      ICO format is optional for native Windows feel.
`);