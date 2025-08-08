// Helper functions for Electron E2E testing
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Launch Electron app for testing
 * @param {Object} options - Launch options
 * @returns {Promise<Object>} - Electron app instance
 */
async function launchElectronApp(options = {}) {
  // Determine the main file path
  const mainPath = path.join(__dirname, '../../electron/main.js');
  
  // Set environment variables for testing
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    ELECTRON_DEV: 'true',
    E2E_TESTING: 'true',
    ...options.env
  };

  // Launch the Electron app
  const app = await electron.launch({
    args: [mainPath],
    env,
    timeout: 30000,
    ...options
  });

  // Get the first window
  const window = await app.firstWindow();
  
  // Wait for the window to be ready
  await window.waitForLoadState('domcontentloaded');
  
  return { app, window };
}

/**
 * Clean up test data before/after tests
 * @param {string} storePath - Path to electron-store data
 */
async function cleanTestData(storePath) {
  const testDataPath = storePath || path.join(
    process.env.HOME || process.env.USERPROFILE,
    'Library/Application Support/moodbooms/config.json'
  );
  
  if (fs.existsSync(testDataPath)) {
    // Backup existing data
    const backupPath = `${testDataPath}.backup`;
    fs.copyFileSync(testDataPath, backupPath);
    
    // Clear test data
    fs.writeFileSync(testDataPath, JSON.stringify({}));
  }
}

/**
 * Restore original data after tests
 * @param {string} storePath - Path to electron-store data
 */
async function restoreTestData(storePath) {
  const testDataPath = storePath || path.join(
    process.env.HOME || process.env.USERPROFILE,
    'Library/Application Support/moodbooms/config.json'
  );
  
  const backupPath = `${testDataPath}.backup`;
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, testDataPath);
    fs.unlinkSync(backupPath);
  }
}

/**
 * Wait for tray icon to be ready
 * @param {Object} app - Electron app instance
 * @returns {Promise<boolean>} - True when tray is ready
 */
async function waitForTrayIcon(app) {
  return await app.evaluate(async () => {
    // Check if tray exists in main process
    const { Tray } = require('electron');
    return new Promise((resolve) => {
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        // This is a simplified check - actual implementation may vary
        if (global.tray || checkCount > 20) {
          clearInterval(checkInterval);
          resolve(!!global.tray);
        }
      }, 500);
    });
  });
}

/**
 * Get app metrics for performance testing
 * @param {Object} window - Electron window instance
 * @returns {Promise<Object>} - Performance metrics
 */
async function getPerformanceMetrics(window) {
  return await window.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    const memory = performance.memory || {};
    
    return {
      loadTime: perfData ? perfData.loadEventEnd - perfData.fetchStart : 0,
      domReady: perfData ? perfData.domContentLoadedEventEnd - perfData.fetchStart : 0,
      memoryUsed: memory.usedJSHeapSize,
      memoryTotal: memory.totalJSHeapSize,
      timestamp: Date.now()
    };
  });
}

/**
 * Simulate menubar click (macOS specific)
 * @param {Object} app - Electron app instance
 */
async function clickTrayIcon(app) {
  return await app.evaluate(async () => {
    if (global.tray) {
      // Emit click event on tray
      global.tray.emit('click');
      return true;
    }
    return false;
  });
}

/**
 * Take a screenshot with custom name
 * @param {Object} window - Electron window instance
 * @param {string} name - Screenshot name
 */
async function takeScreenshot(window, name) {
  const screenshotDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);
  
  await window.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

/**
 * Check if window is visible
 * @param {Object} window - Electron window instance
 */
async function isWindowVisible(window) {
  return await window.evaluate(() => {
    const remote = require('@electron/remote');
    const win = remote.getCurrentWindow();
    return win && win.isVisible();
  }).catch(() => false);
}

module.exports = {
  launchElectronApp,
  cleanTestData,
  restoreTestData,
  waitForTrayIcon,
  getPerformanceMetrics,
  clickTrayIcon,
  takeScreenshot,
  isWindowVisible
};