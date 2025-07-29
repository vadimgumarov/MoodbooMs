# Security Configuration Documentation

## Overview

This document outlines the security measures implemented in the MoodbooM Electron application to prevent unauthorized access to system resources and protect against common vulnerabilities.

## Core Security Principles

### 1. Context Isolation (Enabled)

Context Isolation ensures that preload scripts and Electron's internal logic run in separate contexts from the webpage. This prevents the webpage from accessing Node.js features or Electron internals.

```javascript
webPreferences: {
  contextIsolation: true  // ✅ REQUIRED
}
```

### 2. Node Integration (Disabled)

Node Integration allows renderer processes to access Node.js APIs. This is disabled to prevent malicious scripts from accessing the file system or executing system commands.

```javascript
webPreferences: {
  nodeIntegration: false  // ✅ REQUIRED
}
```

### 3. Web Security (Enabled)

Web Security enforces same-origin policy and prevents loading of insecure content.

```javascript
webPreferences: {
  webSecurity: true  // ✅ REQUIRED
}
```

## Complete Security Configuration

### BrowserWindow Settings

All BrowserWindow instances are created with these security settings:

```javascript
{
  webPreferences: {
    // Core security
    nodeIntegration: false,
    contextIsolation: true,
    webSecurity: true,
    
    // Additional restrictions
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
    enableBlinkFeatures: '',
    webviewTag: false,
    
    // Required preload script
    preload: path.join(__dirname, 'preload.js')
  }
}
```

### Security Headers

Additional HTTP security headers are applied:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Navigation Restrictions

The app prevents navigation to external URLs and new window creation:

```javascript
// Block navigation outside allowed origins
contents.on('will-navigate', (event, url) => {
  const allowed = ['http://localhost:3000', 'file://'];
  if (!allowed.some(origin => url.startsWith(origin))) {
    event.preventDefault();
  }
});

// Prevent new window creation
contents.on('new-window', (event) => {
  event.preventDefault();
});
```

## API Access

### What's Available in Renderer

Only the APIs exposed through `contextBridge` in preload.js:

```javascript
window.electronAPI = {
  tray: { /* tray methods */ },
  window: { /* window methods */ },
  store: { /* storage methods */ },
  system: { /* system info */ },
  // etc...
}
```

### What's NOT Available in Renderer

- ❌ `require()` function
- ❌ `process` object (Node.js version)
- ❌ `__dirname` and `__filename`
- ❌ `Buffer` class
- ❌ `global` object
- ❌ File system access (`fs`)
- ❌ Child process execution
- ❌ Native modules

## Security Verification

### Runtime Checks

The app performs security verification on startup:

1. Validates all window preferences
2. Checks for exposed Node.js APIs
3. Verifies contextBridge is working
4. Logs security status

### Testing Security

Run the security test suite:

```bash
npx electron tests/electron/security-test.js
```

This verifies:
- All security settings are applied
- No Node.js APIs are exposed
- Context isolation is working
- Navigation restrictions are in place

## Common Security Issues and Solutions

### Issue: "require is not defined" in Renderer

**This is expected behavior!** The renderer should not have access to `require()`. Use the preload script to expose needed functionality.

**Wrong:**
```javascript
// In renderer (React component)
const fs = require('fs');  // ❌ Will not work
```

**Correct:**
```javascript
// In preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path) => ipcRenderer.invoke('read-file', path)
});

// In renderer
const content = await window.electronAPI.readFile(path);
```

### Issue: Need to Access File System

All file system operations must go through the main process:

1. Create IPC handler in main process
2. Expose method in preload script
3. Call from renderer via electronAPI

### Issue: External Resources Blocked

External resources are blocked by CSP and navigation policies. To allow specific resources:

1. Update CSP policy in `csp-config.js`
2. Add domain to navigation whitelist
3. Document the security exception

## Security Checklist

Before each release, verify:

- [ ] `nodeIntegration` is `false` in all windows
- [ ] `contextIsolation` is `true` in all windows
- [ ] All functionality works through `contextBridge`
- [ ] No `require()` statements in renderer code
- [ ] CSP policy is properly configured
- [ ] Security tests pass
- [ ] No console errors about blocked resources

## Maintenance

### Regular Security Audits

1. **Monthly**: Run security test suite
2. **Quarterly**: Review and update security policies
3. **Yearly**: Full security assessment

### Updating Electron

When updating Electron:
1. Review security changelog
2. Test all security settings
3. Update security tests if needed
4. Verify no new APIs are exposed

### Adding New Features

When adding features that need system access:
1. Implement in main process only
2. Create minimal IPC interface
3. Validate all inputs
4. Document security implications
5. Add security tests

## Security Resources

- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security#checklist-security-recommendations)