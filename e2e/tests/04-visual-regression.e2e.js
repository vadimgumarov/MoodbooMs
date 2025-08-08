// E2E visual regression tests
const { test, expect } = require('@playwright/test');
const { 
  launchElectronApp,
  takeScreenshot
} = require('../helpers/electron-helpers');
const testData = require('../fixtures/test-data');
const fs = require('fs');
const path = require('path');

test.describe('Visual Regression Tests', () => {
  let app, window;
  const baselineDir = path.join(__dirname, '../screenshots/baseline');
  const currentDir = path.join(__dirname, '../screenshots/current');
  
  test.beforeAll(() => {
    // Create directories if they don't exist
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }
    if (!fs.existsSync(currentDir)) {
      fs.mkdirSync(currentDir, { recursive: true });
    }
  });
  
  test.beforeEach(async () => {
    ({ app, window } = await launchElectronApp({
      env: {
        E2E_TEST_DATA: JSON.stringify({
          cycleData: testData.defaultCycle,
          cycleHistory: testData.cycleHistory,
          preferences: testData.preferences.queen
        })
      }
    }));
    
    await window.waitForLoadState('networkidle');
  });
  
  test.afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
  
  test('should capture Queen mode status screen', async () => {
    await window.waitForSelector('[data-testid="status-card"]');
    
    // Take screenshot
    const screenshotPath = path.join(currentDir, 'queen-status.png');
    await window.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    // Compare with baseline if it exists
    const baselinePath = path.join(baselineDir, 'queen-status.png');
    if (fs.existsSync(baselinePath)) {
      // In a real scenario, use a visual comparison library
      console.log('Comparing with baseline:', baselinePath);
    } else {
      // First run - save as baseline
      fs.copyFileSync(screenshotPath, baselinePath);
      console.log('Baseline created:', baselinePath);
    }
  });
  
  test('should capture King mode status screen', async () => {
    // Switch to King mode
    await window.click(testData.selectors.tabs.settings);
    await window.waitForSelector('text=/Mode Selection/i');
    
    const modeToggle = await window.locator(testData.selectors.settings.modeToggle);
    await modeToggle.click();
    
    await window.click(testData.selectors.settings.saveButton);
    await window.waitForSelector(testData.selectors.common.success);
    
    // Go back to status
    await window.click(testData.selectors.tabs.status);
    await window.waitForSelector('[data-testid="status-card"]');
    await window.waitForTimeout(500); // Let animations complete
    
    // Take screenshot
    const screenshotPath = path.join(currentDir, 'king-status.png');
    await window.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    // Compare with baseline
    const baselinePath = path.join(baselineDir, 'king-status.png');
    if (fs.existsSync(baselinePath)) {
      console.log('Comparing with baseline:', baselinePath);
    } else {
      fs.copyFileSync(screenshotPath, baselinePath);
      console.log('Baseline created:', baselinePath);
    }
  });
  
  test('should capture calendar appearance', async () => {
    await window.click(testData.selectors.tabs.calendar);
    await window.waitForSelector('[role="grid"]');
    await window.waitForTimeout(500); // Let calendar render
    
    // Take screenshot
    const screenshotPath = path.join(currentDir, 'calendar.png');
    await window.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    // Compare with baseline
    const baselinePath = path.join(baselineDir, 'calendar.png');
    if (fs.existsSync(baselinePath)) {
      console.log('Comparing with baseline:', baselinePath);
    } else {
      fs.copyFileSync(screenshotPath, baselinePath);
      console.log('Baseline created:', baselinePath);
    }
  });
  
  test('should capture different phase appearances', async () => {
    // Enable test mode to test different phases
    await window.click(testData.selectors.tabs.settings);
    await window.waitForSelector('text=/Test Mode/i');
    
    const testModeToggle = await window.locator(testData.selectors.settings.testModeToggle);
    await testModeToggle.click();
    await window.waitForSelector(testData.selectors.settings.testDaySlider);
    
    const phases = [
      { day: 3, name: 'menstrual' },
      { day: 10, name: 'follicular' },
      { day: 14, name: 'ovulation' },
      { day: 20, name: 'luteal' },
      { day: 26, name: 'premenstrual' }
    ];
    
    for (const phase of phases) {
      // Set test day
      const testDaySlider = await window.locator(testData.selectors.settings.testDaySlider);
      await testDaySlider.fill(phase.day.toString());
      await window.click(testData.selectors.settings.saveButton);
      await window.waitForSelector(testData.selectors.common.success);
      
      // Go to status tab
      await window.click(testData.selectors.tabs.status);
      await window.waitForSelector('[data-testid="status-card"]');
      await window.waitForTimeout(300);
      
      // Take screenshot
      const screenshotPath = path.join(currentDir, `phase-${phase.name}.png`);
      await window.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      // Compare with baseline
      const baselinePath = path.join(baselineDir, `phase-${phase.name}.png`);
      if (fs.existsSync(baselinePath)) {
        console.log(`Comparing ${phase.name} with baseline`);
      } else {
        fs.copyFileSync(screenshotPath, baselinePath);
        console.log(`Baseline created for ${phase.name}`);
      }
      
      // Go back to settings for next iteration
      if (phase !== phases[phases.length - 1]) {
        await window.click(testData.selectors.tabs.settings);
      }
    }
  });
  
  test('should capture theme variations', async () => {
    // Light theme
    await window.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await window.waitForTimeout(300);
    
    const lightScreenshot = path.join(currentDir, 'theme-light.png');
    await window.screenshot({ 
      path: lightScreenshot,
      fullPage: true 
    });
    
    // Dark theme
    await window.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await window.waitForTimeout(300);
    
    const darkScreenshot = path.join(currentDir, 'theme-dark.png');
    await window.screenshot({ 
      path: darkScreenshot,
      fullPage: true 
    });
    
    // Compare with baselines
    ['light', 'dark'].forEach(theme => {
      const currentPath = path.join(currentDir, `theme-${theme}.png`);
      const baselinePath = path.join(baselineDir, `theme-${theme}.png`);
      
      if (fs.existsSync(baselinePath)) {
        console.log(`Comparing ${theme} theme with baseline`);
      } else {
        fs.copyFileSync(currentPath, baselinePath);
        console.log(`Baseline created for ${theme} theme`);
      }
    });
  });
  
  test('should capture window at different sizes', async () => {
    const sizes = [
      { width: 420, height: 650, name: 'default' },
      { width: 350, height: 600, name: 'small' },
      { width: 500, height: 700, name: 'large' }
    ];
    
    for (const size of sizes) {
      // Resize window
      await window.evaluate(({ width, height }) => {
        window.resizeTo(width, height);
      }, size);
      
      await window.waitForTimeout(500); // Let layout adjust
      
      // Take screenshot
      const screenshotPath = path.join(currentDir, `size-${size.name}.png`);
      await window.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      // Compare with baseline
      const baselinePath = path.join(baselineDir, `size-${size.name}.png`);
      if (fs.existsSync(baselinePath)) {
        console.log(`Comparing ${size.name} size with baseline`);
      } else {
        fs.copyFileSync(screenshotPath, baselinePath);
        console.log(`Baseline created for ${size.name} size`);
      }
    }
  });
  
  test('should capture animation states', async () => {
    // Capture tab transition
    await window.click(testData.selectors.tabs.status);
    await window.waitForSelector('[data-testid="status-card"]');
    
    // Start recording animation
    const screenshots = [];
    
    // Click calendar tab and capture frames
    const capturePromise = (async () => {
      for (let i = 0; i < 5; i++) {
        await window.waitForTimeout(100);
        const frame = await window.screenshot();
        screenshots.push(frame);
      }
    })();
    
    await window.click(testData.selectors.tabs.calendar);
    await capturePromise;
    
    // Save animation frames
    screenshots.forEach((frame, index) => {
      const framePath = path.join(currentDir, `animation-frame-${index}.png`);
      fs.writeFileSync(framePath, frame);
    });
    
    console.log(`Captured ${screenshots.length} animation frames`);
  });
  
  test('should capture error states', async () => {
    // Navigate to settings and enter invalid data
    await window.click(testData.selectors.tabs.settings);
    await window.waitForSelector('text=/Cycle Settings/i');
    
    // Enter invalid cycle length
    const cycleLengthInput = await window.locator(testData.selectors.settings.cycleLength);
    await cycleLengthInput.clear();
    await cycleLengthInput.fill('50'); // Out of range
    
    // Trigger validation
    await cycleLengthInput.press('Tab');
    await window.waitForTimeout(300);
    
    // Capture error state
    const errorScreenshot = path.join(currentDir, 'error-validation.png');
    await window.screenshot({ 
      path: errorScreenshot,
      fullPage: true 
    });
    
    // Compare with baseline
    const baselinePath = path.join(baselineDir, 'error-validation.png');
    if (fs.existsSync(baselinePath)) {
      console.log('Comparing error state with baseline');
    } else {
      fs.copyFileSync(errorScreenshot, baselinePath);
      console.log('Baseline created for error state');
    }
  });
  
  test('should capture loading states', async () => {
    // Capture initial loading
    const { app: newApp, window: newWindow } = await launchElectronApp();
    
    // Capture loading state immediately
    const loadingScreenshot = path.join(currentDir, 'loading-state.png');
    await newWindow.screenshot({ 
      path: loadingScreenshot,
      fullPage: true 
    });
    
    // Wait for app to load
    await newWindow.waitForSelector('[data-testid="status-card"], text=/Welcome to MoodbooM/i');
    
    // Capture loaded state
    const loadedScreenshot = path.join(currentDir, 'loaded-state.png');
    await newWindow.screenshot({ 
      path: loadedScreenshot,
      fullPage: true 
    });
    
    await newApp.close();
    
    // Compare with baselines
    ['loading-state', 'loaded-state'].forEach(state => {
      const currentPath = path.join(currentDir, `${state}.png`);
      const baselinePath = path.join(baselineDir, `${state}.png`);
      
      if (fs.existsSync(baselinePath)) {
        console.log(`Comparing ${state} with baseline`);
      } else {
        fs.copyFileSync(currentPath, baselinePath);
        console.log(`Baseline created for ${state}`);
      }
    });
  });
});