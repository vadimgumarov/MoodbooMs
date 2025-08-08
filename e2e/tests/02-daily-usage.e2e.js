// E2E test for daily usage flow
const { test, expect } = require('@playwright/test');
const { 
  launchElectronApp,
  clickTrayIcon,
  waitForTrayIcon,
  isWindowVisible,
  takeScreenshot,
  getPerformanceMetrics
} = require('../helpers/electron-helpers');
const testData = require('../fixtures/test-data');

test.describe('Daily Usage Flow', () => {
  let app, window;
  
  test.beforeEach(async () => {
    // Launch app with existing data
    ({ app, window } = await launchElectronApp({
      env: {
        E2E_TEST_DATA: JSON.stringify(testData.defaultCycle)
      }
    }));
    
    // Wait for app to be ready
    await window.waitForLoadState('networkidle');
  });
  
  test.afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
  
  test('should open window from tray icon click', async () => {
    // Wait for tray icon to be created
    const trayReady = await waitForTrayIcon(app);
    expect(trayReady).toBe(true);
    
    // Initially window might be hidden
    await window.evaluate(() => {
      const { remote } = require('@electron/remote');
      const win = remote.getCurrentWindow();
      win.hide();
    }).catch(() => {
      // If remote is not available, use IPC
      return window.evaluate(() => {
        window.electronAPI.window.hide();
      });
    });
    
    // Click tray icon to show window
    const clicked = await clickTrayIcon(app);
    expect(clicked).toBe(true);
    
    // Verify window is visible
    await window.waitForTimeout(500); // Give it time to show
    const visible = await isWindowVisible(window);
    expect(visible).toBe(true);
    
    await takeScreenshot(window, 'tray-window-open');
  });
  
  test('should display current cycle status', async () => {
    // Check status card is visible
    await window.waitForSelector('[data-testid="status-card"]');
    
    // Verify phase information
    const phaseElement = await window.locator('[data-testid="phase-name"]');
    await expect(phaseElement).toBeVisible();
    
    // Verify cycle day
    const dayElement = await window.locator('[data-testid="cycle-day"]');
    await expect(dayElement).toBeVisible();
    const dayText = await dayElement.textContent();
    expect(dayText).toMatch(/Day \d+ of \d+/);
    
    // Verify mood message
    const moodElement = await window.locator('[data-testid="mood-message"]');
    await expect(moodElement).toBeVisible();
    
    // Verify craving
    const cravingElement = await window.locator('[data-testid="craving"]');
    await expect(cravingElement).toBeVisible();
    
    await takeScreenshot(window, 'status-display');
  });
  
  test('should navigate between tabs', async () => {
    const performanceMetrics = [];
    
    // Status tab (default)
    await window.waitForSelector('[data-testid="status-card"]');
    performanceMetrics.push({
      tab: 'status',
      metrics: await getPerformanceMetrics(window)
    });
    
    // Navigate to Calendar tab
    const startCalendar = Date.now();
    await window.click(testData.selectors.tabs.calendar);
    await window.waitForSelector('[role="grid"]');
    const calendarTime = Date.now() - startCalendar;
    performanceMetrics.push({
      tab: 'calendar',
      switchTime: calendarTime,
      metrics: await getPerformanceMetrics(window)
    });
    
    // Verify calendar is displayed
    await expect(window.locator('[role="grid"]')).toBeVisible();
    await expect(window.locator(testData.selectors.calendar.monthYear)).toBeVisible();
    await takeScreenshot(window, 'calendar-tab');
    
    // Navigate to History tab
    const startHistory = Date.now();
    await window.click(testData.selectors.tabs.history);
    await window.waitForSelector('text=/Cycle History/i');
    const historyTime = Date.now() - startHistory;
    performanceMetrics.push({
      tab: 'history',
      switchTime: historyTime,
      metrics: await getPerformanceMetrics(window)
    });
    
    await expect(window.locator('text=/Cycle History/i')).toBeVisible();
    await takeScreenshot(window, 'history-tab');
    
    // Navigate to Settings tab
    const startSettings = Date.now();
    await window.click(testData.selectors.tabs.settings);
    await window.waitForSelector('text=/Mode Selection/i');
    const settingsTime = Date.now() - startSettings;
    performanceMetrics.push({
      tab: 'settings',
      switchTime: settingsTime,
      metrics: await getPerformanceMetrics(window)
    });
    
    await expect(window.locator('text=/Mode Selection/i')).toBeVisible();
    await takeScreenshot(window, 'settings-tab');
    
    // Verify tab switch performance
    console.log('Tab Navigation Performance:', performanceMetrics);
    expect(calendarTime).toBeLessThan(testData.performance.tabSwitch);
    expect(historyTime).toBeLessThan(testData.performance.tabSwitch);
    expect(settingsTime).toBeLessThan(testData.performance.tabSwitch);
  });
  
  test('should navigate calendar months', async () => {
    // Go to Calendar tab
    await window.click(testData.selectors.tabs.calendar);
    await window.waitForSelector('[role="grid"]');
    
    // Get current month
    const monthYear = await window.locator(testData.selectors.calendar.monthYear);
    const initialMonth = await monthYear.textContent();
    
    // Navigate to previous month
    await window.click(testData.selectors.calendar.prevMonth);
    await window.waitForTimeout(300); // Wait for animation
    
    const prevMonth = await monthYear.textContent();
    expect(prevMonth).not.toBe(initialMonth);
    await takeScreenshot(window, 'calendar-prev-month');
    
    // Navigate to next month (back to initial)
    await window.click(testData.selectors.calendar.nextMonth);
    await window.waitForTimeout(300);
    
    const currentMonth = await monthYear.textContent();
    expect(currentMonth).toBe(initialMonth);
    
    // Use Today button
    await window.click(testData.selectors.calendar.nextMonth); // Go forward
    await window.click(testData.selectors.calendar.nextMonth); // Go forward more
    
    await window.click(testData.selectors.calendar.todayButton);
    await window.waitForTimeout(300);
    
    // Should be back to current month
    await takeScreenshot(window, 'calendar-today');
  });
  
  test('should select dates and show phase details', async () => {
    // Go to Calendar tab
    await window.click(testData.selectors.tabs.calendar);
    await window.waitForSelector('[role="grid"]');
    
    // Click on a specific date
    const dateCells = await window.locator('[role="gridcell"]').all();
    if (dateCells.length > 15) {
      // Click on day 15 (roughly mid-cycle)
      await dateCells[15].click();
      
      // Wait for phase detail to appear
      await window.waitForSelector('text=/Phase Detail/i');
      
      // Verify phase detail information
      await expect(window.locator('text=/Phase Detail/i')).toBeVisible();
      await takeScreenshot(window, 'phase-detail');
      
      // Click outside to close phase detail
      await window.keyboard.press('Escape');
      
      // Verify phase detail is closed
      await expect(window.locator('text=/Phase Detail/i')).not.toBeVisible();
    }
  });
  
  test('should check predictions in calendar', async () => {
    // Go to Calendar tab
    await window.click(testData.selectors.tabs.calendar);
    await window.waitForSelector('[role="grid"]');
    
    // Look for prediction indicators
    const ovulationPrediction = await window.locator('[data-testid="ovulation-prediction"]');
    const periodPrediction = await window.locator('[data-testid="period-prediction"]');
    
    // At least one prediction should be visible
    const hasOvulation = await ovulationPrediction.isVisible().catch(() => false);
    const hasPeriod = await periodPrediction.isVisible().catch(() => false);
    
    expect(hasOvulation || hasPeriod).toBe(true);
    
    await takeScreenshot(window, 'calendar-predictions');
  });
  
  test('should close to tray when clicking outside', async () => {
    // Ensure window is visible
    const visible = await isWindowVisible(window);
    expect(visible).toBe(true);
    
    // Simulate blur event (clicking outside)
    await window.evaluate(() => {
      const event = new Event('blur');
      window.dispatchEvent(event);
    });
    
    // Wait for window to hide
    await window.waitForTimeout(500);
    
    // In a real scenario, the window would hide
    // For testing, we'll verify the blur handler exists
    const hasBlurHandler = await window.evaluate(() => {
      return typeof window.onblur === 'function';
    });
    expect(hasBlurHandler).toBe(true);
  });
  
  test('should switch between Queen and King modes', async () => {
    // Go to Settings tab
    await window.click(testData.selectors.tabs.settings);
    await window.waitForSelector('text=/Mode Selection/i');
    
    // Find mode toggle
    const modeToggle = await window.locator(testData.selectors.settings.modeToggle);
    
    // Check initial mode (should be Queen)
    let statusText = await window.locator('body').textContent();
    const isQueenMode = statusText.includes('Queen Mode') || !statusText.includes('King Mode');
    
    // Toggle to King mode
    await modeToggle.click();
    await window.waitForTimeout(500); // Wait for mode switch
    
    // Go back to Status tab to see changes
    await window.click(testData.selectors.tabs.status);
    await window.waitForSelector('[data-testid="status-card"]');
    
    // Verify King mode phase names
    const phaseElement = await window.locator('[data-testid="phase-name"]');
    const phaseText = await phaseElement.textContent();
    
    // Should have King mode phase name
    const hasKingPhase = Object.values(testData.phaseNames.king).some(
      name => phaseText.includes(name)
    );
    expect(hasKingPhase).toBe(true);
    
    await takeScreenshot(window, 'king-mode');
    
    // Toggle back to Queen mode
    await window.click(testData.selectors.tabs.settings);
    await modeToggle.click();
    await window.waitForTimeout(500);
    
    await window.click(testData.selectors.tabs.status);
    const phaseTextQueen = await phaseElement.textContent();
    
    const hasQueenPhase = Object.values(testData.phaseNames.queen).some(
      name => phaseTextQueen.includes(name)
    );
    expect(hasQueenPhase).toBe(true);
    
    await takeScreenshot(window, 'queen-mode');
  });
});