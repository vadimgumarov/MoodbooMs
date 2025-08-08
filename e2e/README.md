# E2E Testing Documentation

## Overview
End-to-end tests for MoodBooMs using Playwright to verify critical user journeys across the entire Electron application stack.

## Setup

### Prerequisites
- Node.js 14+ installed
- MoodBooMs development environment set up
- Playwright installed (`npm install`)

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers (if needed)
npx playwright install
```

## Running Tests

### All Tests
```bash
npm run e2e              # Run all E2E tests
npm run e2e:headed       # Run with browser visible
npm run e2e:debug        # Run in debug mode
npm run e2e:ui           # Open Playwright UI
```

### Individual Test Suites
```bash
npm run e2e:setup        # First-time setup flow
npm run e2e:daily        # Daily usage scenarios
npm run e2e:data         # Data management operations
npm run e2e:visual       # Visual regression tests
npm run e2e:perf         # Performance monitoring
```

### View Test Results
```bash
npm run e2e:report       # Open HTML test report
```

## Test Structure

```
e2e/
├── tests/                    # Test files
│   ├── 01-first-time-setup.e2e.js
│   ├── 02-daily-usage.e2e.js
│   ├── 03-data-management.e2e.js
│   ├── 04-visual-regression.e2e.js
│   └── 05-performance.e2e.js
├── helpers/                  # Test utilities
│   ├── electron-helpers.js   # Electron-specific helpers
│   ├── global-setup.js      # Test setup
│   └── global-teardown.js   # Test cleanup
├── fixtures/                 # Test data
│   └── test-data.js         # Reusable test data
├── screenshots/              # Visual test artifacts
│   ├── baseline/            # Reference screenshots
│   └── current/             # Current test run
└── test-results/            # Test outputs
    ├── html/                # HTML reports
    └── performance-metrics.json
```

## Test Coverage

### 1. First-Time Setup Flow
- Welcome screen display
- Cycle data input validation
- Initial configuration save
- Data persistence verification

### 2. Daily Usage Flow
- Tray icon interaction
- Window show/hide behavior
- Tab navigation
- Calendar navigation
- Mode switching (Queen/King)
- Date selection and phase details

### 3. Data Management Flow
- Settings modification
- Data export functionality
- Data import with validation
- Cycle history management
- Test mode operations
- Cross-session persistence

### 4. Visual Regression
- Queen/King mode appearances
- Different phase displays
- Theme variations (light/dark)
- Window size responsiveness
- Error state displays
- Loading states
- Animation captures

### 5. Performance Monitoring
- App launch time (<3s)
- Window operations (<1s)
- Tab switching (<500ms)
- Calendar rendering (<1s)
- Data operations (<2s)
- Memory usage tracking
- CPU usage monitoring
- Large dataset handling

## Performance Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| App Launch | <3000ms | - |
| Window Open | <1000ms | - |
| Tab Switch | <500ms | - |
| Calendar Render | <1000ms | - |
| Settings Save | <2000ms | - |
| Data Export | <3000ms | - |
| Data Import | <3000ms | - |

## Writing New Tests

### Test Template
```javascript
const { test, expect } = require('@playwright/test');
const { launchElectronApp } = require('../helpers/electron-helpers');
const testData = require('../fixtures/test-data');

test.describe('Feature Name', () => {
  let app, window;
  
  test.beforeEach(async () => {
    ({ app, window } = await launchElectronApp());
  });
  
  test.afterEach(async () => {
    if (app) await app.close();
  });
  
  test('should do something', async () => {
    // Test implementation
    await window.click('button');
    await expect(window.locator('div')).toBeVisible();
  });
});
```

### Best Practices
1. **Use data-testid attributes** for reliable element selection
2. **Wait for elements** before interacting: `waitForSelector()`
3. **Take screenshots** at key points for debugging
4. **Measure performance** for critical operations
5. **Clean up** test data after each test
6. **Use fixtures** for consistent test data
7. **Group related tests** in describe blocks

## CI/CD Integration

### GitHub Actions
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run e2e
      - uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: test-results
          path: e2e/test-results/
```

## Debugging Failed Tests

### View Screenshots
Failed tests automatically capture screenshots in `e2e/screenshots/`

### Debug Mode
```bash
npm run e2e:debug
```
- Sets breakpoints
- Steps through test execution
- Inspects element state

### Headed Mode
```bash
npm run e2e:headed
```
- Shows browser window
- Watches test execution
- Useful for visual debugging

### Trace Viewer
```bash
npx playwright show-trace e2e/test-results/trace.zip
```
- Timeline of actions
- Network requests
- Console logs
- Screenshots at each step

## Troubleshooting

### Common Issues

#### Test Timeouts
- Increase timeout in playwright.config.js
- Check for missing `await` statements
- Verify selectors are correct

#### Element Not Found
- Check data-testid attributes exist
- Wait for element: `waitForSelector()`
- Verify app is in expected state

#### Visual Regression Failures
- Update baseline: Copy from current/ to baseline/
- Check for legitimate UI changes
- Consider environment differences

#### Performance Test Failures
- Run tests in isolation
- Check system resources
- Adjust performance thresholds

### Environment Variables
```bash
# Skip visual tests
SKIP_VISUAL=true npm run e2e

# Use custom test data
E2E_TEST_DATA='{"cycleLength":30}' npm run e2e

# Debug specific test
DEBUG=pw:api npm run e2e:setup
```

## Contributing

### Adding New Tests
1. Create test file in `e2e/tests/`
2. Follow naming convention: `XX-feature-name.e2e.js`
3. Add test data to fixtures if needed
4. Update this README with coverage
5. Add npm script if appropriate

### Updating Helpers
- Keep helpers focused and reusable
- Document function parameters
- Handle errors gracefully
- Add TypeScript types if possible

### Maintaining Test Data
- Keep fixtures minimal but realistic
- Use consistent data across tests
- Document data structure
- Version control baseline screenshots

## Resources
- [Playwright Documentation](https://playwright.dev)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/tutorial/testing)
- [Visual Regression Testing](https://playwright.dev/docs/test-snapshots)
- [Performance Testing](https://playwright.dev/docs/api/class-page#page-metrics)