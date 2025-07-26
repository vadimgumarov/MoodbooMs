const { nativeImage } = require('electron');

// Icon generator using Lucide-style SVG paths
class IconGeneratorLucide {
  constructor() {
    this.iconSize = 22; // Standard macOS menubar size
    this.iconCache = new Map();
  }

  // Generate icon based on phase name
  generateIcon(phase) {
    // Check cache first
    if (this.iconCache.has(phase)) {
      return this.iconCache.get(phase);
    }

    let icon;
    switch (phase) {
      case 'Finally Got My Sh*t Together':
        icon = this.createSunIcon();
        break;
      case 'Horny AF':
        icon = this.createCloudSunIcon();
        break;
      case 'Getting Real Tired of This BS':
        icon = this.createCloudIcon();
        break;
      case 'Pre-Chaos Mood Swings':
        icon = this.createCloudRainIcon();
        break;
      case 'Bloody Hell Week':
        icon = this.createCloudLightningIcon();
        break;
      case 'Apocalypse Countdown':
        icon = this.createTornadoIcon();
        break;
      default:
        icon = this.createDefaultIcon();
    }

    // Cache the generated icon
    this.iconCache.set(phase, icon);
    return icon;
  }

  // Create base canvas
  createCanvas() {
    const size = this.iconSize;
    const scale = 2; // 2x for retina
    const buffer = Buffer.alloc(size * scale * size * scale * 4, 0);
    return { buffer, size: size * scale, displaySize: size };
  }

  // Draw a path-like shape
  drawPath(buffer, size, pathCommands, fillColor = [0, 0, 0, 255]) {
    // This is simplified - in reality we'd need proper SVG path parsing
    // For now, we'll create recognizable shapes
  }

  // Sun icon - based on Lucide sun
  createSunIcon() {
    const { buffer, size, displaySize } = this.createCanvas();
    const center = size / 2;
    const radius = size / 4;
    
    // Draw sun circle
    this.drawFilledCircle(buffer, size, center, center, radius, [255, 200, 0, 255]);
    
    // Draw 8 rays
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x1 = center + (radius + 3) * Math.cos(angle);
      const y1 = center + (radius + 3) * Math.sin(angle);
      const x2 = center + (radius + 8) * Math.cos(angle);
      const y2 = center + (radius + 8) * Math.sin(angle);
      
      this.drawLine(buffer, size, x1, y1, x2, y2, 2, [255, 200, 0, 255]);
    }
    
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    return icon.resize({ width: displaySize, height: displaySize });
  }

  // Cloud with sun icon
  createCloudSunIcon() {
    const { buffer, size, displaySize } = this.createCanvas();
    
    // Draw sun in top right
    this.drawFilledCircle(buffer, size, size * 0.7, size * 0.3, size / 6, [255, 200, 0, 255]);
    
    // Small sun rays
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const cx = size * 0.7;
      const cy = size * 0.3;
      const x1 = cx + (size/6 + 2) * Math.cos(angle);
      const y1 = cy + (size/6 + 2) * Math.sin(angle);
      const x2 = cx + (size/6 + 5) * Math.cos(angle);
      const y2 = cy + (size/6 + 5) * Math.sin(angle);
      
      this.drawLine(buffer, size, x1, y1, x2, y2, 1.5, [255, 200, 0, 255]);
    }
    
    // Draw cloud
    this.drawCloud(buffer, size, size * 0.45, size * 0.65, [200, 200, 200, 255]);
    
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    return icon.resize({ width: displaySize, height: displaySize });
  }

  // Cloud icon
  createCloudIcon() {
    const { buffer, size, displaySize } = this.createCanvas();
    
    // Draw cloud centered
    this.drawCloud(buffer, size, size * 0.5, size * 0.5, [150, 150, 150, 255]);
    
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    return icon.resize({ width: displaySize, height: displaySize });
  }

  // Cloud with rain icon
  createCloudRainIcon() {
    const { buffer, size, displaySize } = this.createCanvas();
    
    // Draw cloud
    this.drawCloud(buffer, size, size * 0.5, size * 0.35, [120, 120, 120, 255]);
    
    // Draw rain drops
    const dropX = [size * 0.35, size * 0.5, size * 0.65];
    for (let x of dropX) {
      this.drawLine(buffer, size, x, size * 0.6, x - 2, size * 0.75, 2, [100, 150, 255, 255]);
      this.drawLine(buffer, size, x, size * 0.7, x - 2, size * 0.85, 2, [100, 150, 255, 255]);
    }
    
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    return icon.resize({ width: displaySize, height: displaySize });
  }

  // Cloud with lightning icon
  createCloudLightningIcon() {
    const { buffer, size, displaySize } = this.createCanvas();
    
    // Draw dark cloud
    this.drawCloud(buffer, size, size * 0.5, size * 0.35, [80, 80, 80, 255]);
    
    // Draw lightning bolt
    const boltPath = [
      [size * 0.55, size * 0.5],
      [size * 0.45, size * 0.65],
      [size * 0.5, size * 0.65],
      [size * 0.4, size * 0.85],
      [size * 0.6, size * 0.6],
      [size * 0.55, size * 0.6],
      [size * 0.55, size * 0.5]
    ];
    
    this.drawPolygon(buffer, size, boltPath, [255, 255, 0, 255]);
    
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    return icon.resize({ width: displaySize, height: displaySize });
  }

  // Tornado icon
  createTornadoIcon() {
    const { buffer, size, displaySize } = this.createCanvas();
    
    // Draw tornado spiral
    const centerX = size * 0.5;
    let y = size * 0.2;
    let radius = size * 0.4;
    
    while (y < size * 0.9 && radius > 2) {
      this.drawFilledCircle(buffer, size, centerX, y, radius, [100, 100, 100, 255]);
      y += radius * 0.5;
      radius *= 0.8;
    }
    
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    return icon.resize({ width: displaySize, height: displaySize });
  }

  // Default icon
  createDefaultIcon() {
    const { buffer, size, displaySize } = this.createCanvas();
    
    this.drawFilledCircle(buffer, size, size/2, size/2, size/3, [200, 100, 200, 255]);
    
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    return icon.resize({ width: displaySize, height: displaySize });
  }

  // Helper: Draw filled circle
  drawFilledCircle(buffer, size, cx, cy, radius, color) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
        if (distance <= radius) {
          const idx = (y * size + x) * 4;
          buffer[idx] = color[0];
          buffer[idx + 1] = color[1];
          buffer[idx + 2] = color[2];
          buffer[idx + 3] = color[3];
        }
      }
    }
  }

  // Helper: Draw cloud shape
  drawCloud(buffer, size, cx, cy, color) {
    // Cloud made of overlapping circles
    const circles = [
      { x: cx - size * 0.15, y: cy, r: size * 0.15 },
      { x: cx + size * 0.15, y: cy, r: size * 0.15 },
      { x: cx, y: cy - size * 0.1, r: size * 0.18 },
      { x: cx - size * 0.08, y: cy + size * 0.05, r: size * 0.12 },
      { x: cx + size * 0.08, y: cy + size * 0.05, r: size * 0.12 }
    ];
    
    for (const circle of circles) {
      this.drawFilledCircle(buffer, size, circle.x, circle.y, circle.r, color);
    }
  }

  // Helper: Draw line
  drawLine(buffer, size, x1, y1, x2, y2, width, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance * 2);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t;
      const y = y1 + dy * t;
      
      // Draw a small circle at each point for line width
      for (let dy = -width; dy <= width; dy++) {
        for (let dx = -width; dx <= width; dx++) {
          if (dx * dx + dy * dy <= width * width) {
            const px = Math.round(x + dx);
            const py = Math.round(y + dy);
            if (px >= 0 && px < size && py >= 0 && py < size) {
              const idx = (py * size + px) * 4;
              buffer[idx] = color[0];
              buffer[idx + 1] = color[1];
              buffer[idx + 2] = color[2];
              buffer[idx + 3] = color[3];
            }
          }
        }
      }
    }
  }

  // Helper: Draw polygon
  drawPolygon(buffer, size, points, color) {
    // Simple polygon fill using scanline
    for (let y = 0; y < size; y++) {
      const intersections = [];
      
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const [x1, y1] = points[i];
        const [x2, y2] = points[j];
        
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          const x = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
          intersections.push(x);
        }
      }
      
      intersections.sort((a, b) => a - b);
      
      for (let i = 0; i < intersections.length; i += 2) {
        if (i + 1 < intersections.length) {
          for (let x = Math.floor(intersections[i]); x <= Math.ceil(intersections[i + 1]); x++) {
            if (x >= 0 && x < size) {
              const idx = (y * size + x) * 4;
              buffer[idx] = color[0];
              buffer[idx + 1] = color[1];
              buffer[idx + 2] = color[2];
              buffer[idx + 3] = color[3];
            }
          }
        }
      }
    }
  }

  // Clear icon cache
  clearCache() {
    this.iconCache.clear();
  }
}

module.exports = IconGeneratorLucide;