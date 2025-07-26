// Test security configuration and enforcement
const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const { auditSecurity, REQUIRED_WEB_PREFERENCES } = require('../../electron/security-config');

let testWindow;

// Test cases
const SECURITY_TESTS = [
  {
    name: 'Window has nodeIntegration disabled',
    test: async (window) => {
      const prefs = window.webContents.getWebPreferences();
      if (prefs.nodeIntegration !== false) {
        throw new Error(`nodeIntegration is ${prefs.nodeIntegration}, should be false`);
      }
      return 'nodeIntegration is properly disabled';
    }
  },
  
  {
    name: 'Window has contextIsolation enabled',
    test: async (window) => {
      const prefs = window.webContents.getWebPreferences();
      if (prefs.contextIsolation !== true) {
        throw new Error(`contextIsolation is ${prefs.contextIsolation}, should be true`);
      }
      return 'contextIsolation is properly enabled';
    }
  },
  
  {
    name: 'Window has webSecurity enabled',
    test: async (window) => {
      const prefs = window.webContents.getWebPreferences();
      if (prefs.webSecurity !== true) {
        throw new Error(`webSecurity is ${prefs.webSecurity}, should be true`);
      }
      return 'webSecurity is properly enabled';
    }
  },
  
  {
    name: 'Window has webviewTag disabled',
    test: async (window) => {
      const prefs = window.webContents.getWebPreferences();
      if (prefs.webviewTag !== false) {
        throw new Error(`webviewTag is ${prefs.webviewTag}, should be false`);
      }
      return 'webviewTag is properly disabled';
    }
  },
  
  {
    name: 'Renderer cannot access require()',
    test: async (window) => {
      const hasRequire = await window.webContents.executeJavaScript(
        'typeof require !== "undefined"'
      );
      if (hasRequire) {
        throw new Error('require() is accessible in renderer');
      }
      return 'require() is not accessible';
    }
  },
  
  {
    name: 'Renderer cannot access Node process object',
    test: async (window) => {
      const hasNodeProcess = await window.webContents.executeJavaScript(`
        typeof process !== 'undefined' && 
        process.versions && 
        process.versions.node !== undefined
      `);
      if (hasNodeProcess) {
        throw new Error('Node process object is accessible in renderer');
      }
      return 'Node process object is not accessible';
    }
  },
  
  {
    name: 'Renderer cannot access __dirname or __filename',
    test: async (window) => {
      const hasDirname = await window.webContents.executeJavaScript(
        'typeof __dirname !== "undefined"'
      );
      const hasFilename = await window.webContents.executeJavaScript(
        'typeof __filename !== "undefined"'
      );
      if (hasDirname || hasFilename) {
        throw new Error('__dirname or __filename is accessible in renderer');
      }
      return '__dirname and __filename are not accessible';
    }
  },
  
  {
    name: 'Renderer cannot access Buffer',
    test: async (window) => {
      const hasBuffer = await window.webContents.executeJavaScript(
        'typeof Buffer !== "undefined"'
      );
      if (hasBuffer) {
        throw new Error('Buffer is accessible in renderer');
      }
      return 'Buffer is not accessible';
    }
  },
  
  {
    name: 'Renderer cannot access global object',
    test: async (window) => {
      const hasGlobal = await window.webContents.executeJavaScript(
        'typeof global !== "undefined" && global !== window'
      );
      if (hasGlobal) {
        throw new Error('Node global object is accessible in renderer');
      }
      return 'Node global object is not accessible';
    }
  },
  
  {
    name: 'electronAPI is exposed through contextBridge',
    test: async (window) => {
      const hasAPI = await window.webContents.executeJavaScript(
        'typeof window.electronAPI !== "undefined"'
      );
      if (!hasAPI) {
        throw new Error('electronAPI is not exposed');
      }
      
      // Check if major API categories exist
      const apiStructure = await window.webContents.executeJavaScript(`
        ({
          hasTray: typeof window.electronAPI.tray !== 'undefined',
          hasWindow: typeof window.electronAPI.window !== 'undefined',
          hasStore: typeof window.electronAPI.store !== 'undefined',
          hasSystem: typeof window.electronAPI.system !== 'undefined'
        })
      `);
      
      const missing = Object.entries(apiStructure)
        .filter(([key, value]) => !value)
        .map(([key]) => key.replace('has', ''));
      
      if (missing.length > 0) {
        throw new Error(`Missing API categories: ${missing.join(', ')}`);
      }
      
      return 'electronAPI is properly exposed with all categories';
    }
  },
  
  {
    name: 'Remote module is disabled',
    test: async (window) => {
      const hasRemote = await window.webContents.executeJavaScript(`
        typeof require !== 'undefined' && 
        typeof require('@electron/remote') !== 'undefined'
      `).catch(() => false);
      
      if (hasRemote) {
        throw new Error('Remote module is accessible');
      }
      return 'Remote module is not accessible';
    }
  },
  
  {
    name: 'Navigation is restricted to allowed origins',
    test: async (window) => {
      // This test verifies the navigation restrictions are in place
      // Actual navigation blocking is tested separately
      const listeners = window.webContents.listenerCount('will-navigate');
      if (listeners === 0) {
        throw new Error('No navigation restrictions in place');
      }
      return 'Navigation restrictions are configured';
    }
  },
  
  {
    name: 'All required security preferences are set',
    test: async (window) => {
      const prefs = window.webContents.getWebPreferences();
      const violations = [];
      
      for (const [key, expectedValue] of Object.entries(REQUIRED_WEB_PREFERENCES)) {
        if (prefs[key] !== expectedValue) {
          violations.push(`${key}: expected ${expectedValue}, got ${prefs[key]}`);
        }
      }
      
      if (violations.length > 0) {
        throw new Error(`Security violations: ${violations.join(', ')}`);
      }
      
      return 'All security preferences correctly set';
    }
  },
  
  {
    name: 'Security audit passes',
    test: async (window) => {
      const audit = await auditSecurity(window);
      
      if (!audit.passed) {
        const violations = [
          ...(audit.windowSecurity.violations || []),
          ...(audit.violations || [])
        ];
        throw new Error(`Security audit failed: ${violations.join(', ')}`);
      }
      
      return 'Security audit passed all checks';
    }
  }
];

// Run security tests
async function runSecurityTests() {
  console.log('Electron Security Tests\n' + '='.repeat(50) + '\n');
  
  // Create test window
  testWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../electron/preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      webviewTag: false
    }
  });
  
  // Load a test page
  await testWindow.loadURL('data:text/html,<html><head><title>Security Test</title></head><body><h1>Security Test Page</h1></body></html>');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Run each test
  for (const test of SECURITY_TESTS) {
    try {
      const result = await test.test(testWindow);
      console.log(`✅ ${test.name}`);
      console.log(`   ${result}`);
      results.passed++;
      results.tests.push({ name: test.name, status: 'PASSED', result });
    } catch (error) {
      console.error(`❌ ${test.name}`);
      console.error(`   ${error.message}`);
      results.failed++;
      results.tests.push({ name: test.name, status: 'FAILED', error: error.message });
    }
    console.log('');
  }
  
  // Additional manual checks
  console.log('Manual Security Verification:');
  console.log('============================');
  
  try {
    // Try to access file system from renderer (should fail)
    await testWindow.webContents.executeJavaScript(`
      const fs = require('fs');
      fs.readFileSync('/etc/passwd');
    `);
    console.error('❌ File system is accessible from renderer!');
    results.failed++;
  } catch (error) {
    console.log('✅ File system is not accessible from renderer');
    results.passed++;
  }
  
  try {
    // Try to create child process (should fail)
    await testWindow.webContents.executeJavaScript(`
      const { exec } = require('child_process');
      exec('ls');
    `);
    console.error('❌ Child process is accessible from renderer!');
    results.failed++;
  } catch (error) {
    console.log('✅ Child process is not accessible from renderer');
    results.passed++;
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`\nTest Summary:`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All security tests passed! The application is properly secured.');
  } else {
    console.log('\n⚠️  Some security tests failed. Please review and fix the issues.');
  }
  
  testWindow.close();
  app.quit();
}

// Run tests when ready
app.whenReady().then(() => {
  runSecurityTests().catch(error => {
    console.error('Test runner error:', error);
    app.quit();
  });
});