# Content Security Policy (CSP) Documentation

## Overview

Content Security Policy (CSP) is implemented to prevent XSS attacks and ensure the app only loads trusted resources. The implementation provides different policies for development and production environments.

## Policy Configuration

### Production Policy (Most Restrictive)

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
media-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
block-all-mixed-content;
```

**Key Restrictions:**
- Scripts: Only from app origin
- Styles: Only from app origin + inline styles (for Tailwind CSS)
- Images: Only from app origin + data URIs
- Objects/Embeds: Completely blocked
- External Resources: Not allowed

### Development Policy (More Permissive)

```
default-src 'self';
script-src 'self' 'unsafe-eval' http://localhost:3000 ws://localhost:3000;
style-src 'self' 'unsafe-inline' http://localhost:3000;
img-src 'self' data: http://localhost:3000;
font-src 'self' http://localhost:3000;
connect-src 'self' http://localhost:3000 ws://localhost:3000 http://localhost:3001;
```

**Development Allowances:**
- `unsafe-eval`: For React DevTools
- `localhost:3000`: For development server
- WebSocket: For hot module replacement
- `localhost:3001`: For React DevTools connection

## Implementation Details

### 1. CSP Header Application

CSP is applied via Electron's `webRequest` API in `main.js`:

```javascript
const { applyCSPToSession } = require('./csp-config');

app.whenReady().then(() => {
  applyCSPToSession(session.defaultSession);
  // ... rest of app initialization
});
```

### 2. Violation Reporting

CSP violations are captured and reported through:

1. **Renderer Process**: Captures `securitypolicyviolation` events
2. **IPC Channel**: Sends violations to main process
3. **Main Process**: Logs violations and can send to monitoring service

```javascript
// In preload.js
window.addEventListener('securitypolicyviolation', (e) => {
  ipcRenderer.send('csp-violation', violationDetails);
});
```

### 3. Environment Detection

The CSP configuration automatically detects the environment:
- Uses `NODE_ENV` environment variable
- Defaults to production policy if not specified
- Can be overridden by passing environment parameter

## Security Considerations

### Why These Choices?

1. **`'unsafe-inline'` for styles**: Required for Tailwind CSS to function
   - Tailwind generates inline styles dynamically
   - Alternative would be to extract all styles at build time

2. **`data:` URIs for images**: Allows inline images and icons
   - Used by the icon generator for tray icons
   - Small images can be embedded as base64

3. **No `'unsafe-eval'` in production**: Prevents code injection
   - Only allowed in development for React DevTools
   - Removed in production builds

4. **Strict `connect-src`**: Prevents data exfiltration
   - Only allows connections to app origin
   - External API calls must be proxied through main process

## Testing CSP

### Automated Tests

Run CSP security tests:
```bash
npx electron tests/electron/csp-test.js
```

Tests verify:
- Inline scripts are blocked
- External scripts are blocked
- Self-hosted scripts are allowed
- Inline styles work (for Tailwind)
- Data URIs work for images
- Object/embed elements are blocked

### Manual Testing

1. **Check Browser Console**: Look for CSP violation messages
2. **Verify Features**: Ensure all app features work with CSP enabled
3. **DevTools Security Tab**: Check CSP headers are applied

### CSP Validator Tools

Use online tools to validate CSP:
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

## Common Issues and Solutions

### Issue: React DevTools Not Working

**Solution**: DevTools require `'unsafe-eval'` which is only enabled in development mode.

### Issue: External Fonts Not Loading

**Solution**: Add font CDN to `font-src` directive or host fonts locally.

### Issue: Images Not Displaying

**Solution**: Ensure images are either:
- Hosted within the app
- Converted to data URIs
- Loaded through proper channels

## Monitoring Violations

In production, CSP violations should be monitored:

1. **Local Logging**: All violations are logged to console
2. **Remote Reporting**: Set `CSP_REPORT_URI` environment variable
3. **Metrics**: Track violation types and frequencies

Example monitoring setup:
```javascript
// In production environment
process.env.CSP_REPORT_URI = 'https://your-monitoring-service.com/csp-report';
```

## Future Enhancements

### 1. Nonce-Based Scripts
For any required inline scripts, implement nonce generation:
```javascript
const nonce = generateNonce();
// Add to CSP: script-src 'self' 'nonce-${nonce}';
// Add to script tags: <script nonce="${nonce}">
```

### 2. Strict Dynamic CSP
Consider implementing strict-dynamic for better security:
```
script-src 'self' 'strict-dynamic' 'nonce-xyz';
```

### 3. Report-Only Mode
For testing new policies:
```javascript
'Content-Security-Policy-Report-Only': cspHeader
```

## Exceptions and Workarounds

### Current Exceptions:

1. **Tailwind CSS**: Requires `'unsafe-inline'` for styles
   - **Risk**: Low - styles cannot execute code
   - **Mitigation**: Could pre-compile all styles in production

2. **Development Mode**: Allows `'unsafe-eval'`
   - **Risk**: Acceptable in development only
   - **Mitigation**: Strictly removed in production

### Adding New Exceptions:

1. Document the security risk
2. Implement only in appropriate environment
3. Add monitoring for violations
4. Review regularly for removal

## Maintenance

### Regular Reviews

1. **Monthly**: Review violation reports
2. **Quarterly**: Audit CSP directives
3. **Annually**: Full security assessment

### Updating Policies

When adding new features:
1. Test with current CSP
2. Add minimal necessary exceptions
3. Document changes in this file
4. Update tests to cover new cases