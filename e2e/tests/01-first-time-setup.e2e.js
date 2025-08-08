// E2E test for first-time setup flow
const { test, expect } = require('@playwright/test');
const { 
  launchElectronApp, 
  cleanTestData, 
  takeScreenshot,
  getPerformanceMetrics
} = require('../helpers/electron-helpers');
const testData = require('../fixtures/test-data');

test.describe('First-Time Setup Flow', () => {
  let app, window;
  
  test.beforeAll(async () => {
    // Clean any existing data to simulate first-time user
    await cleanTestData();
  });
  
  test.beforeEach(async () => {
    // Launch the app
    ({ app, window } = await launchElectronApp());
  });
  
  test.afterEach(async () => {
    // Close the app
    if (app) {
      await app.close();
    }
  });
  
  test('should show welcome screen for new users', async () => {
    // Wait for the welcome screen
    await window.waitForSelector('text=/Welcome to MoodbooM/i', { timeout: 5000 });
    
    // Take screenshot of welcome screen
    await takeScreenshot(window, 'welcome-screen');
    
    // Verify welcome elements
    await expect(window.locator('h1')).toContainText('Welcome to MoodbooM');
    await expect(window.locator('text=/Track your cycle/i')).toBeVisible();
    
    // Check for initial setup prompt
    await expect(window.locator('text=/Set Your Cycle Start Date/i')).toBeVisible();
  });
  
  test('should complete initial cycle setup', async () => {
    // Wait for welcome screen
    await window.waitForSelector('text=/Welcome to MoodbooM/i');
    
    // Enter cycle start date
    const dateInput = await window.locator('input[type="date"]').first();
    await dateInput.fill('2024-01-01');
    
    // Enter cycle length
    const lengthInput = await window.locator('input[type="number"][min="21"][max="35"]');
    await lengthInput.fill('28');
    
    // Save settings
    const saveButton = await window.locator('button:has-text("Save")');
    await saveButton.click();
    
    // Verify we're now on the main app screen
    await window.waitForSelector('[data-testid="status-card"]', { timeout: 5000 });
    
    // Take screenshot of configured app
    await takeScreenshot(window, 'setup-complete');
    
    // Verify the app shows the correct cycle day
    const cycleDay = await window.locator('[data-testid="cycle-day"]');
    await expect(cycleDay).toBeVisible();
  });
  
  test('should validate cycle length input', async () => {
    await window.waitForSelector('text=/Welcome to MoodbooM/i');
    
    const lengthInput = await window.locator('input[type="number"][min="21"][max="35"]');
    
    // Try invalid short cycle
    await lengthInput.fill('20');
    await expect(window.locator('text=/must be between 21 and 35/i')).toBeVisible();
    
    // Try invalid long cycle
    await lengthInput.fill('36');
    await expect(window.locator('text=/must be between 21 and 35/i')).toBeVisible();
    
    // Valid cycle length
    await lengthInput.fill('28');
    await expect(window.locator('text=/must be between 21 and 35/i')).not.toBeVisible();
  });
  
  test('should persist setup data', async () => {
    // Complete setup
    await window.waitForSelector('text=/Welcome to MoodbooM/i');
    
    const dateInput = await window.locator('input[type="date"]').first();
    await dateInput.fill('2024-01-01');
    
    const lengthInput = await window.locator('input[type="number"][min="21"][max="35"]');
    await lengthInput.fill('28');
    
    const saveButton = await window.locator('button:has-text("Save")');
    await saveButton.click();
    
    await window.waitForSelector('[data-testid="status-card"]');
    
    // Close and reopen app
    await app.close();
    ({ app, window } = await launchElectronApp());
    
    // Should not show welcome screen
    await expect(window.locator('text=/Welcome to MoodbooM/i')).not.toBeVisible();
    
    // Should show main app with saved data
    await window.waitForSelector('[data-testid="status-card"]');
    const cycleDay = await window.locator('[data-testid="cycle-day"]');
    await expect(cycleDay).toBeVisible();
  });
  
  test('should measure setup performance', async () => {
    const startTime = Date.now();
    
    // Complete setup flow
    await window.waitForSelector('text=/Welcome to MoodbooM/i');
    
    const dateInput = await window.locator('input[type="date"]').first();
    await dateInput.fill('2024-01-01');
    
    const lengthInput = await window.locator('input[type="number"][min="21"][max="35"]');
    await lengthInput.fill('28');
    
    const saveButton = await window.locator('button:has-text("Save")');
    await saveButton.click();
    
    await window.waitForSelector('[data-testid="status-card"]');
    
    const setupTime = Date.now() - startTime;
    
    // Get performance metrics
    const metrics = await getPerformanceMetrics(window);
    
    console.log('Setup Performance:', {
      totalSetupTime: setupTime,
      domReady: metrics.domReady,
      memoryUsed: metrics.memoryUsed
    });
    
    // Verify setup completes within reasonable time
    expect(setupTime).toBeLessThan(testData.performance.settingsSave);
  });
});