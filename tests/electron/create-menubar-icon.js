const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

// Create a 16x16 template icon for macOS menubar
// Template images should be black with alpha channel

function createMenubarIcon() {
  const size = 16;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas (transparent background)
  ctx.clearRect(0, 0, size, size);
  
  // Draw a simple "MB" text icon
  ctx.fillStyle = 'black';
  ctx.font = 'bold 8px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MB', size/2, size/2);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'mbTemplate.png'), buffer);
  console.log('Created mbTemplate.png');
  
  // Also create @2x version
  const canvas2x = createCanvas(size * 2, size * 2);
  const ctx2x = canvas2x.getContext('2d');
  ctx2x.clearRect(0, 0, size * 2, size * 2);
  ctx2x.fillStyle = 'black';
  ctx2x.font = 'bold 16px Arial';
  ctx2x.textAlign = 'center';
  ctx2x.textBaseline = 'middle';
  ctx2x.fillText('MB', size, size);
  
  const buffer2x = canvas2x.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'mbTemplate@2x.png'), buffer2x);
  console.log('Created mbTemplate@2x.png');
}

createMenubarIcon();