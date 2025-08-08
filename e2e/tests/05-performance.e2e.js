// E2E performance monitoring tests
const { test, expect } = require('@playwright/test');
const { 
  launchElectronApp,
  getPerformanceMetrics,
  takeScreenshot
} = require('../helpers/electron-helpers');
const testData = require('../fixtures/test-data');
const fs = require('fs');
const path = require('path');

test.describe('Performance Monitoring', () => {
  let performanceResults = [];
  
  test.afterAll(() => {
    // Save performance results to file
    const resultsPath = path.join(__dirname, '../test-results/performance-metrics.json');
    fs.writeFileSync(resultsPath, JSON.stringify(performanceResults, null, 2));
    
    // Generate performance report
    console.log('\n📊 Performance Report:');
    console.log('=' .repeat(50));
    performanceResults.forEach(result => {
      console.log(`\n${result.test}:`);
      Object.entries(result.metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          console.log(`  ${key}: ${value}ms`);
        }
      });
    });
  });
  
  test('should measure app launch time', async () => {
    const startTime = Date.now();
    
    const { app, window } = await launchElectronApp();
    
    // Wait for app to be fully loaded
    await window.waitForSelector('[data-testid="status-card"], text=/Welcome to MoodbooM/i');
    
    const launchTime = Date.now() - startTime;
    const metrics = await getPerformanceMetrics(window);
    
    performanceResults.push({
      test: 'App Launch',
      metrics: {
        totalLaunchTime: launchTime,
        domReady: metrics.domReady,
        loadComplete: metrics.loadTime,
        memoryUsed: Math.round(metrics.memoryUsed / 1024 / 1024) + 'MB'
      }
    });
    
    // Verify launch time is within threshold
    expect(launchTime).toBeLessThan(testData.performance.appLaunch);
    
    await app.close();
  });
  
  test('should measure window open/close performance', async () => {
    const { app, window } = await launchElectronApp();
    await window.waitForLoadState('networkidle');
    
    const measurements = [];
    
    // Measure multiple open/close cycles
    for (let i = 0; i < 5; i++) {
      // Hide window
      const hideStart = Date.now();
      await window.evaluate(() => {
        window.electronAPI.window.hide();
      });
      await window.waitForTimeout(100);
      const hideTime = Date.now() - hideStart;
      
      // Show window
      const showStart = Date.now();
      await window.evaluate(() => {
        window.electronAPI.window.show();
      });
      await window.waitForTimeout(100);
      const showTime = Date.now() - showStart;
      
      measurements.push({ hide: hideTime, show: showTime });
    }
    
    // Calculate averages
    const avgHide = Math.round(measurements.reduce((a, b) => a + b.hide, 0) / measurements.length);
    const avgShow = Math.round(measurements.reduce((a, b) => a + b.show, 0) / measurements.length);
    
    performanceResults.push({
      test: 'Window Toggle',
      metrics: {
        averageHideTime: avgHide,
        averageShowTime: avgShow,
        samples: measurements.length
      }
    });
    
    // Verify window operations are fast
    expect(avgShow).toBeLessThan(testData.performance.windowOpen);
    
    await app.close();
  });
  
  test('should measure tab switching performance', async () => {
    const { app, window } = await launchElectronApp({
      env: {
        E2E_TEST_DATA: JSON.stringify({
          cycleData: testData.defaultCycle,
          cycleHistory: testData.cycleHistory
        })
      }
    });
    
    await window.waitForLoadState('networkidle');
    
    const tabSwitchTimes = {};
    const tabs = ['status', 'calendar', 'history', 'settings'];
    
    // Measure switching to each tab
    for (const tab of tabs) {
      const startTime = Date.now();
      await window.click(testData.selectors.tabs[tab]);
      
      // Wait for tab content to load
      if (tab === 'calendar') {
        await window.waitForSelector('[role="grid"]');
      } else if (tab === 'history') {
        await window.waitForSelector('text=/Cycle History/i');
      } else if (tab === 'settings') {
        await window.waitForSelector('text=/Mode Selection/i');
      } else {
        await window.waitForSelector('[data-testid="status-card"]');
      }
      
      tabSwitchTimes[tab] = Date.now() - startTime;
      
      // Get memory after switching
      const metrics = await getPerformanceMetrics(window);
      tabSwitchTimes[`${tab}Memory`] = Math.round(metrics.memoryUsed / 1024 / 1024) + 'MB';
    }
    
    performanceResults.push({
      test: 'Tab Switching',
      metrics: tabSwitchTimes
    });
    
    // Verify all tabs switch quickly
    Object.entries(tabSwitchTimes).forEach(([tab, time]) => {
      if (typeof time === 'number') {
        expect(time).toBeLessThan(testData.performance.tabSwitch);
      }
    });
    
    await app.close();
  });
  
  test('should measure calendar rendering performance', async () => {
    const { app, window } = await launchElectronApp({
      env: {
        E2E_TEST_DATA: JSON.stringify({
          cycleData: testData.defaultCycle,
          cycleHistory: testData.cycleHistory
        })
      }
    });
    
    await window.waitForLoadState('networkidle');
    
    // Navigate to calendar
    await window.click(testData.selectors.tabs.calendar);
    
    const renderTimes = [];
    
    // Measure month navigation performance
    for (let i = 0; i < 12; i++) {
      const startTime = Date.now();
      await window.click(testData.selectors.calendar.nextMonth);
      await window.waitForSelector('[role="grid"]');
      await window.waitForTimeout(100); // Wait for animation
      renderTimes.push(Date.now() - startTime);
    }
    
    const avgRenderTime = Math.round(renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length);
    
    performanceResults.push({
      test: 'Calendar Navigation',
      metrics: {
        averageMonthSwitch: avgRenderTime,
        samples: renderTimes.length,
        min: Math.min(...renderTimes),
        max: Math.max(...renderTimes)
      }
    });
    
    // Verify calendar renders quickly
    expect(avgRenderTime).toBeLessThan(testData.performance.calendarRender);
    
    await app.close();
  });
  
  test('should measure data operations performance', async () => {
    const { app, window } = await launchElectronApp({
      env: {
        E2E_TEST_DATA: JSON.stringify({
          cycleData: testData.defaultCycle,
          cycleHistory: testData.cycleHistory
        })
      }
    });
    
    await window.waitForLoadState('networkidle');
    
    // Navigate to settings
    await window.click(testData.selectors.tabs.settings);
    await window.waitForSelector('text=/Cycle Settings/i');
    
    // Measure save operation
    const saveStart = Date.now();
    const cycleLengthInput = await window.locator(testData.selectors.settings.cycleLength);
    await cycleLengthInput.clear();
    await cycleLengthInput.fill('30');
    await window.click(testData.selectors.settings.saveButton);
    await window.waitForSelector(testData.selectors.common.success);
    const saveTime = Date.now() - saveStart;
    
    // Measure export operation (simulated)
    const exportStart = Date.now();
    await window.evaluate(() => {
      // Simulate export
      const data = window.electronAPI.store.get('all');
      return JSON.stringify(data);
    });
    const exportTime = Date.now() - exportStart;
    
    // Measure import operation (simulated)
    const importStart = Date.now();
    await window.evaluate((data) => {
      // Simulate import
      return window.electronAPI.store.set({ key: 'all', value: data });
    }, testData.defaultCycle);
    const importTime = Date.now() - importStart;
    
    performanceResults.push({
      test: 'Data Operations',
      metrics: {
        saveSettings: saveTime,
        exportData: exportTime,
        importData: importTime
      }
    });
    
    // Verify operations complete within thresholds
    expect(saveTime).toBeLessThan(testData.performance.settingsSave);
    expect(exportTime).toBeLessThan(testData.performance.dataExport);
    expect(importTime).toBeLessThan(testData.performance.dataImport);
    
    await app.close();
  });
  
  test('should measure memory usage over time', async () => {
    const { app, window } = await launchElectronApp({
      env: {
        E2E_TEST_DATA: JSON.stringify({
          cycleData: testData.defaultCycle,
          cycleHistory: testData.cycleHistory
        })
      }
    });
    
    await window.waitForLoadState('networkidle');
    
    const memorySnapshots = [];
    const duration = 30000; // 30 seconds
    const interval = 5000; // Every 5 seconds
    
    const startTime = Date.now();
    
    // Take memory snapshots over time
    while (Date.now() - startTime < duration) {
      // Perform some actions
      const tabs = ['calendar', 'history', 'settings', 'status'];
      const randomTab = tabs[Math.floor(Math.random() * tabs.length)];
      await window.click(testData.selectors.tabs[randomTab]);
      
      // Get memory metrics
      const metrics = await getPerformanceMetrics(window);
      memorySnapshots.push({
        timestamp: Date.now() - startTime,
        memoryUsed: metrics.memoryUsed,
        memoryTotal: metrics.memoryTotal
      });
      
      await window.waitForTimeout(interval);
    }
    
    // Analyze memory usage
    const memoryUsedValues = memorySnapshots.map(s => s.memoryUsed);
    const avgMemory = Math.round(memoryUsedValues.reduce((a, b) => a + b, 0) / memoryUsedValues.length / 1024 / 1024);
    const maxMemory = Math.round(Math.max(...memoryUsedValues) / 1024 / 1024);
    const minMemory = Math.round(Math.min(...memoryUsedValues) / 1024 / 1024);
    
    // Check for memory leaks (memory shouldn't continuously increase)
    const firstHalf = memoryUsedValues.slice(0, Math.floor(memoryUsedValues.length / 2));
    const secondHalf = memoryUsedValues.slice(Math.floor(memoryUsedValues.length / 2));
    const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const memoryGrowth = ((avgSecondHalf - avgFirstHalf) / avgFirstHalf) * 100;
    
    performanceResults.push({
      test: 'Memory Usage',
      metrics: {
        averageMemory: avgMemory + 'MB',
        maxMemory: maxMemory + 'MB',
        minMemory: minMemory + 'MB',
        memoryGrowthPercent: Math.round(memoryGrowth) + '%',
        testDuration: duration + 'ms',
        samples: memorySnapshots.length
      }
    });
    
    // Memory growth should be minimal (less than 20%)
    expect(Math.abs(memoryGrowth)).toBeLessThan(20);
    
    await app.close();
  });
  
  test('should measure rendering performance with large dataset', async () => {
    // Create large history dataset
    const largeHistory = Array.from({ length: 100 }, (_, i) => ({
      id: `cycle-${i}`,
      startDate: new Date(2020, i % 12, 1).toISOString(),
      cycleLength: 26 + (i % 5),
      actualLength: 26 + (i % 5)
    }));
    
    const { app, window } = await launchElectronApp({
      env: {
        E2E_TEST_DATA: JSON.stringify({
          cycleData: testData.defaultCycle,
          cycleHistory: largeHistory
        })
      }
    });
    
    await window.waitForLoadState('networkidle');
    
    // Measure history tab with large dataset
    const historyStart = Date.now();
    await window.click(testData.selectors.tabs.history);
    await window.waitForSelector('text=/Cycle History/i');
    await window.waitForSelector('[data-testid="history-entry"]');
    const historyLoadTime = Date.now() - historyStart;
    
    // Count rendered entries
    const entries = await window.locator('[data-testid="history-entry"]').all();
    
    // Measure scroll performance
    const scrollStart = Date.now();
    await window.evaluate(() => {
      const container = document.querySelector('[data-testid="history-container"]');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
    await window.waitForTimeout(100);
    const scrollTime = Date.now() - scrollStart;
    
    performanceResults.push({
      test: 'Large Dataset Rendering',
      metrics: {
        historyLoadTime: historyLoadTime,
        entriesRendered: entries.length,
        scrollTime: scrollTime,
        dataSize: largeHistory.length
      }
    });
    
    // Even with large dataset, should load reasonably fast
    expect(historyLoadTime).toBeLessThan(3000);
    
    await app.close();
  });
  
  test('should measure CPU usage during intensive operations', async () => {
    const { app, window } = await launchElectronApp({
      env: {
        E2E_TEST_DATA: JSON.stringify({
          cycleData: testData.defaultCycle,
          cycleHistory: testData.cycleHistory
        })
      }
    });
    
    await window.waitForLoadState('networkidle');
    
    // Get CPU metrics (if available through Electron)
    const cpuMetrics = await app.evaluate(() => {
      const { app } = require('electron');
      return app.getAppMetrics();
    });
    
    // Perform intensive operations
    const operations = [];
    
    // Rapid tab switching
    const tabSwitchStart = Date.now();
    for (let i = 0; i < 20; i++) {
      const tabs = ['status', 'calendar', 'history', 'settings'];
      await window.click(testData.selectors.tabs[tabs[i % 4]]);
      await window.waitForTimeout(50);
    }
    operations.push({
      name: 'Rapid Tab Switching',
      duration: Date.now() - tabSwitchStart
    });
    
    // Calendar month navigation
    await window.click(testData.selectors.tabs.calendar);
    const calendarNavStart = Date.now();
    for (let i = 0; i < 24; i++) {
      await window.click(testData.selectors.calendar.nextMonth);
      await window.waitForTimeout(50);
    }
    operations.push({
      name: 'Calendar Navigation',
      duration: Date.now() - calendarNavStart
    });
    
    // Get CPU metrics after operations
    const cpuMetricsAfter = await app.evaluate(() => {
      const { app } = require('electron');
      return app.getAppMetrics();
    });
    
    performanceResults.push({
      test: 'CPU Usage',
      metrics: {
        initialProcesses: cpuMetrics.length,
        finalProcesses: cpuMetricsAfter.length,
        operations: operations
      }
    });
    
    await app.close();
  });
});