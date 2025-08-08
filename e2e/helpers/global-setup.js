// Global setup for E2E tests
const { cleanTestData } = require('./electron-helpers');
const fs = require('fs');
const path = require('path');

module.exports = async config => {
  console.log('🚀 Starting E2E test setup...');
  
  // Create test results directory
  const resultsDir = path.join(__dirname, '../test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Clean screenshots directory
  const screenshotsDir = path.join(__dirname, '../screenshots');
  if (fs.existsSync(screenshotsDir)) {
    const files = fs.readdirSync(screenshotsDir);
    files.forEach(file => {
      if (file.endsWith('.png')) {
        fs.unlinkSync(path.join(screenshotsDir, file));
      }
    });
  }
  
  // Back up existing user data
  await cleanTestData();
  
  console.log('✅ E2E test setup complete');
};