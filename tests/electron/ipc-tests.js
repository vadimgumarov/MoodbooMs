// Test IPC functionality in Electron environment
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initializeIpcHandlers } = require('../../electron/ipcHandlersV2');
const { IPC_CHANNELS, IPC_ERRORS } = require('../../electron/ipc-channels');
const { storeOperations } = require('../../electron/store');

// Test window
let testWindow;

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test helper
function test(name, fn) {
  try {
    fn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASSED' });
    console.log(`✓ ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAILED', error: error.message });
    console.error(`✗ ${name}: ${error.message}`);
  }
}

// Async test helper
async function testAsync(name, fn) {
  try {
    await fn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASSED' });
    console.log(`✓ ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAILED', error: error.message });
    console.error(`✗ ${name}: ${error.message}`);
  }
}

// Initialize test environment
async function setupTests() {
  // Clear store
  storeOperations.clear();
  
  // Create test window
  testWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../electron/preloadV2.js')
    }
  });

  // Initialize IPC handlers
  initializeIpcHandlers(ipcMain, testWindow, null);
  
  console.log('IPC Channel Tests\n' + '='.repeat(50) + '\n');
}

// Run tests
async function runTests() {
  await setupTests();

  // Test Cycle Operations
  console.log('\n--- Cycle Operations ---');
  
  await testAsync('cycle:get-data should return cycle data', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.cycle.getData()
    `);
    if (!result || typeof result !== 'object') {
      throw new Error('Expected object result');
    }
  });

  await testAsync('cycle:save-data should save cycle data', async () => {
    const testData = {
      startDate: new Date().toISOString(),
      cycleLength: 28
    };
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.cycle.saveData(${JSON.stringify(testData)})
    `);
    if (result !== true) {
      throw new Error('Expected true result');
    }
  });

  await testAsync('cycle:get-history should return array', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.cycle.getHistory()
    `);
    if (!Array.isArray(result)) {
      throw new Error('Expected array result');
    }
  });

  await testAsync('cycle:add-history should add entry', async () => {
    const entry = {
      startDate: '2024-01-01T00:00:00.000Z',
      length: 28
    };
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.cycle.addHistory(${JSON.stringify(entry)})
    `);
    if (result !== true) {
      throw new Error('Expected true result');
    }
  });

  // Test Settings Operations
  console.log('\n--- Settings Operations ---');
  
  await testAsync('settings:get should return settings', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.settings.get()
    `);
    if (!result || typeof result !== 'object') {
      throw new Error('Expected object result');
    }
  });

  await testAsync('settings:set should update settings', async () => {
    const settings = { theme: 'dark', notifications: false };
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.settings.set(${JSON.stringify(settings)})
    `);
    if (result !== true) {
      throw new Error('Expected true result');
    }
  });

  await testAsync('settings:reset should reset to defaults', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.settings.reset()
    `);
    if (result !== true) {
      throw new Error('Expected true result');
    }
  });

  // Test System Operations
  console.log('\n--- System Operations ---');
  
  await testAsync('system:get-platform should return platform', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.system.getPlatform()
    `);
    if (typeof result !== 'string') {
      throw new Error('Expected string result');
    }
  });

  await testAsync('system:get-locale should return locale', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.system.getLocale()
    `);
    if (typeof result !== 'string') {
      throw new Error('Expected string result');
    }
  });

  await testAsync('system:get-theme should return theme', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.system.getTheme()
    `);
    if (result !== 'light' && result !== 'dark') {
      throw new Error('Expected light or dark theme');
    }
  });

  // Test App Operations
  console.log('\n--- App Operations ---');
  
  await testAsync('app:get-version should return version', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.app.getVersion()
    `);
    if (typeof result !== 'string') {
      throw new Error('Expected string result');
    }
  });

  await testAsync('app:get-path should return path', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.app.getPath('userData')
    `);
    if (typeof result !== 'string') {
      throw new Error('Expected string result');
    }
  });

  // Test Store Operations
  console.log('\n--- Store Operations ---');
  
  await testAsync('store:set and store:get should work', async () => {
    await testWindow.webContents.executeJavaScript(`
      window.electronAPI.store.set('testKey', 'testValue')
    `);
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.store.get('testKey')
    `);
    if (result !== 'testValue') {
      throw new Error('Expected testValue');
    }
  });

  await testAsync('store:has should check existence', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.store.has('testKey')
    `);
    if (result !== true) {
      throw new Error('Expected true for existing key');
    }
  });

  await testAsync('store:delete should remove key', async () => {
    await testWindow.webContents.executeJavaScript(`
      window.electronAPI.store.delete('testKey')
    `);
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.store.has('testKey')
    `);
    if (result !== false) {
      throw new Error('Expected false after deletion');
    }
  });

  // Test Error Handling
  console.log('\n--- Error Handling ---');
  
  await testAsync('Invalid parameters should throw IPCError', async () => {
    try {
      await testWindow.webContents.executeJavaScript(`
        window.electronAPI.cycle.saveData()
      `);
      throw new Error('Should have thrown error');
    } catch (error) {
      // Expected error
      if (!error.message.includes('IPC_INVALID_PARAMS')) {
        throw new Error('Expected IPC_INVALID_PARAMS error');
      }
    }
  });

  await testAsync('Invalid cycle length should throw error', async () => {
    try {
      await testWindow.webContents.executeJavaScript(`
        window.electronAPI.cycle.saveData({ cycleLength: 10 })
      `);
      throw new Error('Should have thrown error');
    } catch (error) {
      // Expected error
      if (!error.message.includes('21 and 35')) {
        throw new Error('Expected cycle length validation error');
      }
    }
  });

  // Test Window Operations
  console.log('\n--- Window Operations ---');
  
  await testAsync('window:get-position should return position', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.window.getPosition()
    `);
    if (!Array.isArray(result) || result.length !== 2) {
      throw new Error('Expected [x, y] array');
    }
  });

  await testAsync('window:is-visible should return boolean', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.window.isVisible()
    `);
    if (typeof result !== 'boolean') {
      throw new Error('Expected boolean result');
    }
  });

  // Test Dialog Operations
  console.log('\n--- Dialog Operations ---');
  
  test('dialog channels should be defined', () => {
    if (!IPC_CHANNELS.DIALOG.SHOW_SAVE) {
      throw new Error('Dialog channels not properly defined');
    }
  });

  // Test Notification Operations
  console.log('\n--- Notification Operations ---');
  
  await testAsync('notification:is-enabled should return boolean', async () => {
    const result = await testWindow.webContents.executeJavaScript(`
      window.electronAPI.notifications.isEnabled()
    `);
    if (typeof result !== 'boolean') {
      throw new Error('Expected boolean result');
    }
  });

  // Print results
  console.log('\n' + '='.repeat(50));
  console.log(`\nTest Results:`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Total: ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\nFailed Tests:');
    testResults.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
  }

  // Cleanup
  testWindow.close();
  app.quit();
}

// Run tests when app is ready
app.whenReady().then(() => {
  runTests().catch(error => {
    console.error('Test runner error:', error);
    app.quit();
  });
});