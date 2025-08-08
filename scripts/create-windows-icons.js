#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Windows icon requirements
console.log(`
Windows Icon Requirements:
--------------------------
1. .ico file format containing multiple resolutions
2. Recommended sizes: 16x16, 32x32, 48x48, 256x256
3. For installer graphics:
   - installer-header.bmp: 150x57 pixels
   - installer-sidebar.bmp: 164x314 pixels

Current status:
- We have PNG icons: 16x16, 32x32, 512x512
- Need to create: .ico file and installer BMPs

To create Windows icons:
1. Use an online converter like https://convertio.co/png-ico/
   - Upload icon-512.png or icon32.png
   - Convert to .ico format
   - Save as electron/assets/icons/icon.ico

2. For installer graphics (optional):
   - Create 150x57 header image (can be app logo)
   - Create 164x314 sidebar image (vertical banner)
   - Save as BMP format

3. Or use ImageMagick if available:
   convert icon-512.png -define icon:auto-resize=256,48,32,16 icon.ico

Note: For now, the build will work without these files,
      but Windows installer will use default graphics.
`);

// Check if required files exist
const iconPath = path.join(__dirname, '../electron/assets/icons');
const requiredFiles = ['icon16.png', 'icon32.png', 'icon-512.png'];

console.log('\nChecking existing icon files:');
requiredFiles.forEach(file => {
  const filePath = path.join(iconPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Create placeholder .ico file reference
const icoPath = path.join(iconPath, 'icon.ico');
if (!fs.existsSync(icoPath)) {
  console.log('\n⚠️  icon.ico does not exist yet');
  console.log('   For now, Windows build will use PNG fallback');
  
  // Update package.json to use PNG fallback for now
  console.log('\n📝 Updating package.json to use PNG fallback...');
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Update Windows icon path to use PNG
  if (packageJson.build?.win?.icon === 'electron/assets/icons/icon.ico') {
    packageJson.build.win.icon = 'electron/assets/icons/icon32.png';
    packageJson.build.nsis.installerIcon = 'electron/assets/icons/icon32.png';
    packageJson.build.nsis.uninstallerIcon = 'electron/assets/icons/icon32.png';
    packageJson.build.nsis.installerHeaderIcon = 'electron/assets/icons/icon32.png';
    
    // Remove BMP references for now
    delete packageJson.build.nsis.installerHeader;
    delete packageJson.build.nsis.installerSidebar;
    
    // Update file association icon
    if (packageJson.build.win.fileAssociations?.[0]) {
      packageJson.build.win.fileAssociations[0].icon = 'electron/assets/icons/icon32.png';
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ Updated package.json to use PNG icons');
  }
} else {
  console.log('\n✅ icon.ico exists');
}

console.log('\n✨ Windows icon setup complete!');
console.log('   You can now run: npm run build:win');