// Test Content Security Policy implementation
const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const { applyCSPToSession, CSP_POLICIES, buildCSPHeader } = require('../../electron/csp-config');

let testWindow;
let violations = [];

// Capture CSP violations
function setupViolationCapture() {
  return `
    window.cspViolations = [];
    window.addEventListener('securitypolicyviolation', (e) => {
      window.cspViolations.push({
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        effectiveDirective: e.effectiveDirective,
        originalPolicy: e.originalPolicy
      });
    });
  `;
}

// Test cases
const CSP_TESTS = [
  {
    name: 'Should block inline script without nonce',
    test: async () => {
      const result = await testWindow.webContents.executeJavaScript(`
        ${setupViolationCapture()}
        try {
          const script = document.createElement('script');
          script.textContent = 'console.log("This should be blocked");';
          document.head.appendChild(script);
          false;
        } catch (e) {
          true;
        }
      `);
      
      const violations = await testWindow.webContents.executeJavaScript('window.cspViolations');
      
      if (violations.length === 0 && result === false) {
        throw new Error('Inline script was not blocked by CSP');
      }
      return 'Inline script blocked successfully';
    }
  },
  
  {
    name: 'Should allow self-hosted scripts',
    test: async () => {
      const result = await testWindow.webContents.executeJavaScript(`
        ${setupViolationCapture()}
        const script = document.createElement('script');
        script.src = '/test.js';
        document.head.appendChild(script);
        
        // Check if CSP violation occurred
        setTimeout(() => {
          window.testResult = window.cspViolations.length === 0;
        }, 100);
      `);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const testResult = await testWindow.webContents.executeJavaScript('window.testResult');
      if (!testResult) {
        throw new Error('Self-hosted script was blocked by CSP');
      }
      return 'Self-hosted scripts allowed';
    }
  },
  
  {
    name: 'Should block external scripts',
    test: async () => {
      const violations = await testWindow.webContents.executeJavaScript(`
        ${setupViolationCapture()}
        const script = document.createElement('script');
        script.src = 'https://external-site.com/script.js';
        document.head.appendChild(script);
        
        // Wait for violation
        new Promise(resolve => {
          setTimeout(() => {
            resolve(window.cspViolations);
          }, 100);
        });
      `);
      
      if (violations.length === 0) {
        throw new Error('External script was not blocked by CSP');
      }
      return 'External scripts blocked successfully';
    }
  },
  
  {
    name: 'Should allow inline styles (for Tailwind)',
    test: async () => {
      const result = await testWindow.webContents.executeJavaScript(`
        ${setupViolationCapture()}
        const style = document.createElement('style');
        style.textContent = 'body { color: red; }';
        document.head.appendChild(style);
        
        // Check if style was applied
        const testDiv = document.createElement('div');
        testDiv.style.color = 'blue';
        document.body.appendChild(testDiv);
        
        window.cspViolations.length === 0;
      `);
      
      if (!result) {
        throw new Error('Inline styles were blocked by CSP');
      }
      return 'Inline styles allowed (for Tailwind CSS)';
    }
  },
  
  {
    name: 'Should allow data: URIs for images',
    test: async () => {
      const result = await testWindow.webContents.executeJavaScript(`
        ${setupViolationCapture()}
        const img = document.createElement('img');
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        document.body.appendChild(img);
        
        // Wait and check for violations
        new Promise(resolve => {
          setTimeout(() => {
            resolve(window.cspViolations.length === 0);
          }, 100);
        });
      `);
      
      if (!result) {
        throw new Error('Data URI images were blocked by CSP');
      }
      return 'Data URI images allowed';
    }
  },
  
  {
    name: 'Should block object/embed elements',
    test: async () => {
      const violations = await testWindow.webContents.executeJavaScript(`
        ${setupViolationCapture()}
        const object = document.createElement('object');
        object.data = 'test.swf';
        document.body.appendChild(object);
        
        // Wait for violation
        new Promise(resolve => {
          setTimeout(() => {
            resolve(window.cspViolations);
          }, 100);
        });
      `);
      
      if (violations.length === 0) {
        throw new Error('Object element was not blocked by CSP');
      }
      return 'Object/embed elements blocked successfully';
    }
  },
  
  {
    name: 'CSP header should be properly formatted',
    test: async () => {
      const devCSP = buildCSPHeader('development');
      const prodCSP = buildCSPHeader('production');
      
      // Check for required directives
      const requiredDirectives = ['default-src', 'script-src', 'style-src'];
      
      for (const directive of requiredDirectives) {
        if (!devCSP.includes(directive)) {
          throw new Error(`Development CSP missing ${directive}`);
        }
        if (!prodCSP.includes(directive)) {
          throw new Error(`Production CSP missing ${directive}`);
        }
      }
      
      // Verify production is more restrictive
      if (prodCSP.includes('unsafe-eval')) {
        throw new Error('Production CSP should not include unsafe-eval');
      }
      
      return 'CSP headers properly formatted';
    }
  }
];

// Run tests
async function runCSPTests() {
  console.log('CSP Security Tests\n' + '='.repeat(50) + '\n');
  
  // Create test window
  testWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../electron/preload.js')
    }
  });
  
  // Apply CSP
  applyCSPToSession(session.defaultSession);
  
  // Load a blank page for testing
  await testWindow.loadURL('data:text/html,<html><head><title>CSP Test</title></head><body></body></html>');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Run each test
  for (const test of CSP_TESTS) {
    try {
      const result = await test.test();
      console.log(`✓ ${test.name}`);
      console.log(`  ${result}`);
      results.passed++;
      results.tests.push({ name: test.name, status: 'PASSED', result });
    } catch (error) {
      console.error(`✗ ${test.name}`);
      console.error(`  ${error.message}`);
      results.failed++;
      results.tests.push({ name: test.name, status: 'FAILED', error: error.message });
    }
    console.log('');
  }
  
  // Print summary
  console.log('='.repeat(50));
  console.log(`\nTest Summary:`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total: ${results.passed + results.failed}`);
  
  // Test CSP policies configuration
  console.log('\nCSP Policies Check:');
  console.log('Development allows localhost:', CSP_POLICIES.development['connect-src'].includes('http://localhost:3000'));
  console.log('Production restricts to self:', CSP_POLICIES.production['connect-src'].join('') === "'self'");
  console.log('Production blocks eval:', !CSP_POLICIES.production['script-src'].includes("'unsafe-eval'"));
  
  testWindow.close();
  app.quit();
}

// Run tests when ready
app.whenReady().then(() => {
  runCSPTests().catch(error => {
    console.error('Test runner error:', error);
    app.quit();
  });
});