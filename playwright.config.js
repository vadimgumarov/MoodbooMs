// Playwright configuration for Electron E2E tests
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false, // Electron app should run tests sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for Electron app
  reporter: [
    ['html', { outputFolder: 'e2e/test-results/html' }],
    ['json', { outputFile: 'e2e/test-results/results.json' }],
    ['list']
  ],
  
  use: {
    // Base test configuration
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'electron',
      testMatch: /.*\.e2e\.js$/,
      use: {
        // Electron-specific settings will be configured in test files
        launchOptions: {
          executablePath: process.platform === 'darwin' 
            ? 'node_modules/.bin/electron'
            : process.platform === 'win32'
            ? 'node_modules/.bin/electron.cmd'
            : 'node_modules/.bin/electron',
          args: ['.']
        }
      }
    }
  ],

  // Global setup and teardown
  globalSetup: './e2e/helpers/global-setup.js',
  globalTeardown: './e2e/helpers/global-teardown.js',

  // Output folder for test artifacts
  outputDir: './e2e/test-results',

  // Timeout configuration
  timeout: 30000,
  expect: {
    timeout: 5000
  },
});