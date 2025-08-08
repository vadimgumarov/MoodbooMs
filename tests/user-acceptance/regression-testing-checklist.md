# Regression Testing Checklist

## Overview
Comprehensive checklist to ensure that previously fixed bugs don't return and existing functionality continues working after changes.

## Critical Bug Prevention

### Historical Bug Registry

**BUG-001: Exit Code 15 (SIGTERM) Crashes**
- **Original Issue**: App crashed shortly after startup with Exit Code 15
- **Root Cause**: Rapid state updates causing re-render loops  
- **Fix**: 300ms debouncing in MenuBarApp.jsx phase updates
- **Regression Test**:
  - [ ] Launch app and switch modes rapidly (10+ times in 5 seconds)
  - [ ] Leave app running for 5+ minutes without crashes
  - [ ] Check logs for "Exit Code: 15" entries
  - [ ] Monitor for repeated "Updating phase" entries in rapid succession

**BUG-002: Renderer Process Dead**
- **Original Issue**: Heartbeat shows "Renderer dead for Xms"
- **Root Cause**: Missing crashLogger import in App.js
- **Fix**: Ensure `import './utils/crashLogger'` at top of App.js
- **Regression Test**:
  - [ ] Check App.js contains crashLogger import
  - [ ] Verify heartbeat file shows "ALIVE: Main + Renderer"
  - [ ] Monitor heartbeat for at least 2 minutes
  - [ ] No "Renderer dead" messages in logs

**BUG-003: app.dock.hide() Crash (macOS)**
- **Original Issue**: Electron crashed on startup calling dock method
- **Root Cause**: Calling app.dock.hide() before app.ready
- **Fix**: Move dock.hide() inside app.whenReady() callback
- **Regression Test**:
  - [ ] Launch app on macOS
  - [ ] Verify no immediate crash after "App is ready" message
  - [ ] Check dock doesn't show app icon
  - [ ] No crashes in first 10 seconds of launch

**BUG-004: Icon Not Updating**
- **Original Issue**: Tray icon doesn't change when switching modes
- **Root Cause**: Phase name mismatch in iconFromPNG.js
- **Fix**: Update phaseIconMap to include all current phase names
- **Regression Test**:
  - [ ] Switch from Queen to King mode
  - [ ] Verify tray icon changes (may require Electron restart)
  - [ ] Check all 6 phase icons load correctly
  - [ ] Confirm icon mapping matches current phase names

**BUG-005: Theme Provider Crash**
- **Original Issue**: App crashed when ThemeProvider enabled
- **Root Cause**: Theme applied before DOM ready
- **Fix**: Wrap theme application in try-catch, check documentElement
- **Regression Test**:
  - [ ] Enable theme switching functionality
  - [ ] Switch between light/dark themes
  - [ ] No "Cannot read property 'style' of null" errors
  - [ ] Theme changes apply smoothly

**BUG-006: Renderer Process Dies Every 5 Seconds**
- **Original Issue**: Heartbeat showed renderer dying every 5 seconds
- **Root Cause**: React hot reload conflicts, infinite loops
- **Fix**: Proper useEffect dependencies, disable Fast Refresh if needed
- **Regression Test**:
  - [ ] Run `npm run dev` and monitor heartbeat
  - [ ] Heartbeat should show consistent "ALIVE: Main + Renderer"
  - [ ] No death/revival cycles in heartbeat logs
  - [ ] Check for infinite useEffect loops

**BUG-007: CSS Variables Not Applying**
- **Original Issue**: User reports old colors despite theme changes
- **Root Cause**: Tailwind JIT compiler uses static colors, overrides CSS variables
- **Fix**: CSS overrides with !important to force variable usage
- **Regression Test**:
  - [ ] Switch between Queen/King modes
  - [ ] Verify phase colors change immediately
  - [ ] Use DevTools to confirm CSS variables in computed styles
  - [ ] Check for hardcoded hex colors in computed styles

**BUG-008: Memory Leaks from Event Listeners**
- **Original Issue**: Memory usage grows over time
- **Root Cause**: Event listeners not cleaned up in useEffect
- **Fix**: Proper cleanup functions in all useEffect hooks
- **Regression Test**:
  - [ ] Run app for 30+ minutes with periodic interactions
  - [ ] Monitor memory usage - should remain stable
  - [ ] Check for gradual memory increase
  - [ ] Performance should not degrade over time

### Pre-Release Regression Testing

**Core Functionality Verification**
- [ ] **App Launch**: Starts within 3 seconds, no crashes
- [ ] **Tray Icon**: Appears in system tray, responds to clicks
- [ ] **Window Management**: Shows/hides correctly, positions properly
- [ ] **Mode Switching**: Queen/King toggle works, content updates
- [ ] **Calendar Navigation**: Month switching, date selection works
- [ ] **Tab Navigation**: All tabs accessible and functional
- [ ] **Data Persistence**: Settings and data saved between sessions
- [ ] **Phase Calculations**: Accurate phase detection and fertility levels

**UI/UX Regression Tests**
- [ ] **Layout Stability**: No UI shifts or jumps during mode switching
- [ ] **Visual Consistency**: Colors, fonts, spacing match design
- [ ] **Responsive Design**: UI adapts to different window sizes
- [ ] **Accessibility**: Focus indicators, screen reader support
- [ ] **Performance**: Smooth animations, responsive interactions
- [ ] **Error States**: Helpful error messages, graceful degradation

## Version-Specific Regression Tests

### v1.0.0 → v1.1.0 Regression Checklist

**New Feature Impact Testing**
- [ ] **New Features**: [List new features and test each]
- [ ] **Modified Features**: [List changed features and verify no breaks]
- [ ] **Data Migration**: Existing user data migrates correctly
- [ ] **Settings Migration**: User preferences preserved
- [ ] **Backward Compatibility**: Can open data from previous version

**Integration Testing**
- [ ] **Existing Workflows**: Complete user journeys still work
- [ ] **Third-party Integrations**: OS notifications, tray behavior
- [ ] **Performance**: No regression in startup time or memory usage
- [ ] **Security**: No new security vulnerabilities introduced

### Platform-Specific Regressions

**macOS Regression Tests**
- [ ] **Tray Icon**: Appears in menu bar, scales properly
- [ ] **Dark Mode**: Follows system dark/light mode
- [ ] **Notifications**: macOS notification center integration
- [ ] **Keyboard Shortcuts**: Cmd+Q, Cmd+H work correctly
- [ ] **App Store Compatibility**: Passes Gatekeeper, no warnings
- [ ] **Code Signing**: Valid signature, notarized properly

**Windows Regression Tests**
- [ ] **System Tray**: Icon appears, context menu works
- [ ] **Start Menu**: App listed, tile works
- [ ] **Notifications**: Windows toast notifications
- [ ] **Multi-Monitor**: Window positioning on correct monitor
- [ ] **Windows Defender**: No false positives
- [ ] **Auto-start**: Startup configuration works

**Linux Regression Tests**
- [ ] **Desktop Environment**: Works on GNOME, KDE, XFCE
- [ ] **System Tray**: Compatible with various panel systems
- [ ] **Package Formats**: AppImage, Snap packages install correctly
- [ ] **Notifications**: libnotify integration functional
- [ ] **Wayland/X11**: Works on both display servers

## Performance Regression Testing

### Performance Benchmarks
Run these tests and compare against baseline metrics:

**Startup Performance**
- [ ] **Cold Start**: < 2000ms from launch to ready
- [ ] **Warm Start**: < 1500ms for subsequent launches
- [ ] **Memory at Startup**: < 80MB baseline memory usage
- [ ] **CPU During Startup**: Reasonable CPU usage during launch

**Runtime Performance**
- [ ] **Tab Switching**: < 300ms response time
- [ ] **Calendar Navigation**: < 200ms month switching
- [ ] **Mode Toggle**: < 500ms to switch modes
- [ ] **Data Operations**: < 1000ms for save/load operations

**Memory Performance**
- [ ] **Baseline Memory**: < 100MB typical usage
- [ ] **Peak Memory**: < 200MB during heavy operations
- [ ] **Memory Leaks**: Stable memory over 30+ minutes
- [ ] **Memory Growth**: < 1MB/hour growth rate

### Performance Test Execution
```bash
# Run performance test suite
npm run test:performance

# Monitor memory usage
npm run perf:monitor

# Generate performance report  
npm run perf:analyze
```

## Security Regression Testing

### Security Checklist
- [ ] **Data Encryption**: Stored data properly encrypted
- [ ] **File Permissions**: Data files accessible only to user
- [ ] **Log Security**: No sensitive data in logs
- [ ] **Network Security**: HTTPS only for external connections
- [ ] **Code Signing**: Valid signatures maintained
- [ ] **Dependency Security**: No vulnerable dependencies

### Security Test Commands
```bash
# Check for security vulnerabilities
npm audit

# Verify code signing (macOS)
codesign -v --deep --strict MoodBooMs.app

# Check file permissions
ls -la ~/Library/Application\ Support/MoodBooMs/
```

## Automated Regression Testing

### Automated Test Execution

**Unit Test Regression**
```bash
# Run all unit tests
npm test

# Run specific test suites
npm test -- --testNamePattern="cycle calculations"
npm test -- --testNamePattern="component tests" 
npm test -- --testNamePattern="performance tests"
```

**E2E Test Regression**
```bash
# Run all E2E tests
npm run e2e

# Critical path tests only
npm run e2e:daily

# Performance E2E tests
npm run e2e:perf
```

**Test Coverage Verification**
- [ ] **Unit Test Coverage**: > 90% statement coverage
- [ ] **Component Test Coverage**: All major components tested
- [ ] **E2E Test Coverage**: Critical user flows covered
- [ ] **Performance Test Coverage**: Key metrics monitored

## Manual Testing Protocols

### Quick Smoke Test (15 minutes)
For minor releases and hotfixes:

1. **Launch Test** (2 min)
   - [ ] App launches without errors
   - [ ] Tray icon appears
   - [ ] Window shows correctly

2. **Core Function Test** (5 min)
   - [ ] Mode switching works
   - [ ] Calendar navigation works
   - [ ] Phase detection accurate

3. **Data Test** (3 min)
   - [ ] Settings persist
   - [ ] Data saves correctly
   - [ ] No data loss

4. **Exit Test** (2 min)
   - [ ] App closes cleanly
   - [ ] No crash reports
   - [ ] Memory released

5. **Restart Test** (3 min)
   - [ ] Restart after close
   - [ ] Data intact
   - [ ] Settings preserved

### Full Regression Test (2-3 hours)
For major releases:

**Phase 1: Setup & Launch** (30 min)
- [ ] Fresh installation test
- [ ] Upgrade from previous version test
- [ ] Launch on multiple platforms
- [ ] Initial setup flow

**Phase 2: Core Functionality** (60 min)
- [ ] Complete user workflow testing
- [ ] All features and tabs
- [ ] Data input and validation
- [ ] Error handling scenarios

**Phase 3: Integration Testing** (45 min)
- [ ] OS integration (tray, notifications)
- [ ] Accessibility testing
- [ ] Performance under load
- [ ] Multi-user scenarios (if applicable)

**Phase 4: Edge Cases** (30 min)
- [ ] Boundary value testing
- [ ] Error recovery scenarios
- [ ] Performance stress testing
- [ ] Security verification

**Phase 5: Cleanup & Reporting** (15 min)
- [ ] Document any issues found
- [ ] Clean up test data
- [ ] Generate test report
- [ ] Update regression checklist if needed

## Regression Test Data

### Standard Regression Test Dataset
Use these consistent datasets for all regression testing:

```yaml
regression_test_users:
  stable_user:
    name: "Regression Baseline"
    description: "Consistent data for comparing across versions"
    cycle_data:
      start_date: "2024-01-15"
      cycle_length: 28
      period_length: 5
    history:
      - { start: "2023-12-18", length: 28, actual: 28 }
      - { start: "2024-01-15", length: 28, actual: 29 }
    preferences:
      mode: "queen"
      notifications: true
      test_mode: false
```

### Test Environment Setup

**Development Environment**
```bash
# Clean environment setup
rm -rf ~/Library/Application\ Support/MoodBooMs/
npm run dev
# Run regression tests
```

**Production-like Environment**
```bash
# Build and test production version
npm run build
npm run electron
# Run regression tests
```

## Regression Test Reporting

### Test Results Template
```markdown
# Regression Test Report - v1.2.0

## Test Summary
- **Date**: 2024-01-28
- **Version**: v1.2.0
- **Platform**: macOS 14.1
- **Tester**: [Name]
- **Duration**: 2.5 hours

## Results Overview
- **Total Tests**: 45
- **Passed**: 43 
- **Failed**: 2
- **Skipped**: 0

## Critical Bugs Status
- [x] BUG-001: Exit Code 15 - PASSED
- [x] BUG-002: Renderer Process Dead - PASSED  
- [ ] BUG-003: app.dock.hide() Crash - FAILED (see details)

## New Issues Found
1. **Issue**: Calendar month navigation slow
   - **Severity**: Medium
   - **Reproducer**: Click next month 10+ times rapidly
   - **Impact**: UI becomes temporarily unresponsive

## Performance Regression
- **Startup Time**: 1.8s (baseline: 1.5s) - +300ms regression
- **Memory Usage**: 85MB (baseline: 78MB) - +7MB regression

## Recommendation
- **Release Status**: Hold pending BUG-003 fix
- **Priority Fixes**: Address calendar performance issue
- **Next Steps**: Investigate startup time regression
```

## Continuous Regression Monitoring

### Automated Checks
Set up automated regression monitoring:

```yaml
# GitHub Actions regression check
name: Regression Tests
on: [push, pull_request]
jobs:
  regression:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Unit Tests
        run: npm test
      - name: Run E2E Tests  
        run: npm run e2e
      - name: Performance Check
        run: npm run test:performance
```

### Release Gate Criteria
Don't release if:
- [ ] Any critical bug regression detected
- [ ] Performance regression > 20%
- [ ] Security vulnerability introduced
- [ ] Accessibility regression found
- [ ] Core functionality broken

This regression testing checklist ensures that MoodBooMs maintains quality and reliability across all releases while preventing the return of previously fixed issues.