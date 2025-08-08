# Edge Cases and Error Scenarios - User Acceptance Tests

## Overview
Comprehensive testing of edge cases, error conditions, and recovery scenarios to ensure MoodBooMs handles unusual situations gracefully.

## Data Input Edge Cases

### Extreme Date Values

**Test Case: EDGE-DAT-001 - Future Start Dates**
**Setup**: New user setup
**Steps**:
1. Attempt to set period start date far in future (2030-12-31)
2. Try to set start date 1 year ahead
3. Test with tomorrow's date as start
4. Verify app behavior and error handling

**Expected Results**:
- Future dates beyond reasonable range rejected
- Clear error message: "Period start date cannot be in the future"
- Date picker limits selections to today or earlier
- App suggests current/recent date

**Test Case: EDGE-DAT-002 - Historical Date Limits**
**Setup**: New user setup
**Steps**:
1. Set period start date 10 years ago
2. Try date from 1900
3. Test very old dates (pre-1970)
4. Check data storage and calculations

**Expected Results**:
- Very old dates handled gracefully (warn but accept)
- Calculations work with historical dates
- Performance remains acceptable
- User warned about data accuracy for old dates

**Test Case: EDGE-DAT-003 - Invalid Date Formats**
**Setup**: Manual date entry (if available)
**Steps**:
1. Enter "32/13/2024" (invalid day/month)
2. Try "2024-13-40" (invalid month/day)
3. Enter "February 30, 2024" (non-existent date)
4. Test empty date fields

**Expected Results**:
- Invalid dates rejected with helpful error messages
- Date picker prevents invalid selections
- Form validation catches edge cases
- Clear guidance for correct format

### Extreme Cycle Parameters

**Test Case: EDGE-CYC-001 - Cycle Length Boundaries**
**Setup**: Settings configuration
**Steps**:
1. Set cycle length to 20 days (below minimum)
2. Try 36 days (above maximum)
3. Test exact boundaries: 21 and 35 days
4. Attempt non-integer values (28.5 days)

**Expected Results**:
- Values outside 21-35 range rejected
- Clear error: "Cycle length must be between 21 and 35 days"
- Boundary values (21, 35) accepted
- Non-integers rounded to nearest integer

**Test Case: EDGE-CYC-002 - Period Length Edge Cases**
**Setup**: User with established cycle
**Steps**:
1. Set period length to 1 day
2. Try 10+ days (longer than typical)
3. Test period longer than follicular phase
4. Set period length equal to cycle length

**Expected Results**:
- Very short periods (1 day) accepted but noted
- Long periods (8+ days) trigger health advisory
- Period cannot exceed reasonable proportion of cycle
- Impossible combinations prevented

### Data Corruption Scenarios

**Test Case: EDGE-COR-001 - Corrupted Preferences File**
**Setup**: Manually corrupt stored data
**Steps**:
1. Stop app completely
2. Edit stored preferences with invalid JSON
3. Remove required fields from preferences
4. Launch app and observe recovery

**Expected Results**:
- App detects corrupted data gracefully
- Falls back to default settings
- Offers data recovery options if possible
- Logs corruption for debugging

**Test Case: EDGE-COR-002 - Missing Data Files**
**Setup**: Delete stored data files
**Steps**:
1. Completely remove app data directory
2. Delete specific data files (preferences, history)
3. Launch app
4. Verify first-time setup triggers

**Expected Results**:
- App initializes with default settings
- First-time setup appears automatically
- No crashes or errors
- Clear indication of fresh start

## System Resource Edge Cases

### Memory Stress Testing

**Test Case: EDGE-MEM-001 - Long-Running Instance**
**Setup**: Leave app running for extended period
**Steps**:
1. Launch app and leave running for 24 hours
2. Perform periodic interactions (every hour)
3. Monitor memory usage over time
4. Check for memory leaks or crashes

**Expected Results**:
- Memory usage remains stable (<200MB peak)
- No gradual memory increase (memory leaks)
- App remains responsive after long runtime
- Performance doesn't degrade over time

**Test Case: EDGE-MEM-002 - Low Memory Conditions**
**Setup**: Simulate low system memory
**Steps**:
1. Fill system RAM with other applications
2. Launch MoodBooMs in low-memory condition
3. Attempt normal operations
4. Monitor app behavior under memory pressure

**Expected Results**:
- App launches successfully even with low memory
- Graceful degradation if memory critically low
- No crashes due to memory allocation failures
- Performance acceptable within constraints

### Disk Space Limitations

**Test Case: EDGE-DSK-001 - Full Disk Scenarios**
**Setup**: Fill disk to near capacity
**Steps**:
1. Reduce available disk space to <10MB
2. Attempt to save cycle data
3. Try to export data
4. Monitor error handling

**Expected Results**:
- Clear error messages about disk space
- Operations fail gracefully without data corruption
- User guided to free space or choose different location
- App doesn't crash due to write failures

### Network Edge Cases (Future Features)

**Test Case: EDGE-NET-001 - No Internet Connection**
**Setup**: Disable network connectivity
**Steps**:
1. Launch app without internet
2. Attempt any network-dependent features
3. Try sync/backup operations (when implemented)
4. Verify offline functionality

**Expected Results**:
- App functions completely offline
- Network features fail gracefully
- Clear indication of offline status
- No hangs waiting for network timeouts

## User Interface Edge Cases

### Window Management Extremes

**Test Case: EDGE-UI-001 - Multiple Rapid Clicks**
**Setup**: App running normally
**Steps**:
1. Rapidly click tray icon multiple times
2. Quickly switch between tabs repeatedly
3. Spam click mode toggle switch
4. Test rapid calendar navigation

**Expected Results**:
- No crashes from rapid interactions
- UI remains responsive and stable
- Animations don't break or stack
- No duplicate windows/dialogs open

**Test Case: EDGE-UI-002 - System UI Scaling**
**Setup**: Extreme display scaling settings
**Steps**:
1. Set system scaling to 200% (high DPI)
2. Test app layout and readability
3. Try 50% scaling (if possible)
4. Verify UI elements remain usable

**Expected Results**:
- App scales appropriately with system settings
- Text remains readable at all scaling levels
- Buttons and click targets properly sized
- Layout doesn't break at extreme scales

### Keyboard Input Extremes

**Test Case: EDGE-KEY-001 - Rapid Key Presses**
**Setup**: Keyboard navigation active
**Steps**:
1. Hold down arrow key in calendar
2. Rapidly press Tab key multiple times
3. Spam Enter/Space on buttons
4. Test key repeat rates

**Expected Results**:
- No crashes from rapid key input
- Navigation remains controlled and predictable
- Key repeat handled appropriately
- UI doesn't become unresponsive

**Test Case: EDGE-KEY-002 - Special Characters**
**Setup**: Text input fields (if any)
**Steps**:
1. Enter emoji characters
2. Try Unicode symbols
3. Test very long text inputs
4. Use copy/paste with special content

**Expected Results**:
- Special characters handled gracefully
- Text rendering doesn't break
- Input validation prevents issues
- No crashes from unusual characters

## Error Recovery Scenarios

### App Crash Recovery

**Test Case: ERR-REC-001 - Unexpected Shutdown**
**Setup**: App running with unsaved changes
**Steps**:
1. Force quit app during operation
2. Simulate system crash/power loss
3. Restart app immediately
4. Verify data integrity

**Expected Results**:
- App restarts cleanly after forced termination
- Data saved up to last successful save
- No corruption of existing data
- Recovery process if needed

**Test Case: ERR-REC-002 - Renderer Process Crash**
**Setup**: Trigger renderer process failure
**Steps**:
1. Cause renderer crash (if possible)
2. Check if main process survives
3. Verify app recovery behavior
4. Test functionality after recovery

**Expected Results**:
- Main process detects renderer crash
- App attempts automatic recovery
- User notified of issue if recovery fails
- Option to restart cleanly provided

### Data Validation Errors

**Test Case: ERR-VAL-001 - Invalid Data Migration**
**Setup**: Simulate old data format
**Steps**:
1. Create data in old format
2. Launch newer app version
3. Trigger migration process
4. Test with partially migrated data

**Expected Results**:
- Migration process handles errors gracefully
- Invalid data skipped with warnings
- User informed of migration status
- App remains functional with valid data

**Test Case: ERR-VAL-002 - Inconsistent State**
**Setup**: Manually create inconsistent data
**Steps**:
1. Create cycle data with conflicting dates
2. Set up impossible phase calculations
3. Launch app with inconsistent state
4. Monitor error handling

**Expected Results**:
- App detects and reports inconsistencies
- Offers correction options when possible
- Falls back to safe defaults
- User can resolve conflicts through UI

## Performance Edge Cases

### Large Dataset Handling

**Test Case: EDGE-PERF-001 - Extensive History**
**Setup**: Generate large cycle history
**Steps**:
1. Create 10+ years of cycle history
2. Navigate through historical data
3. Test search/filter operations
4. Monitor performance impact

**Expected Results**:
- App handles large datasets without slowdown
- UI remains responsive with extensive history
- Memory usage reasonable regardless of data size
- Operations complete within acceptable time

**Test Case: EDGE-PERF-002 - Rapid State Changes**
**Setup**: Automated rapid interactions
**Steps**:
1. Script rapid mode switching
2. Automate fast calendar navigation
3. Trigger frequent data updates
4. Monitor performance metrics

**Expected Results**:
- App maintains stable performance
- No memory leaks from rapid changes
- UI updates smoothly without lag
- System resources used efficiently

## Security Edge Cases

### Data Privacy Scenarios

**Test Case: EDGE-SEC-001 - Sensitive Data Exposure**
**Setup**: Review all data storage and logs
**Steps**:
1. Check stored data for plaintext secrets
2. Review log files for sensitive information
3. Test data in memory during debugging
4. Verify encryption where implemented

**Expected Results**:
- No sensitive data stored in plaintext
- Logs don't contain personal information
- Memory dumps don't expose private data
- Encryption properly implemented

**Test Case: EDGE-SEC-002 - File Permission Issues**
**Setup**: Test file system permissions
**Steps**:
1. Check stored data file permissions
2. Test access with different user accounts
3. Verify app directory security
4. Test backup/export file permissions

**Expected Results**:
- Data files accessible only to app user
- No world-readable personal data
- Directory permissions properly restricted
- Export files created with safe permissions

## Accessibility Edge Cases

### Assistive Technology Stress Tests

**Test Case: EDGE-A11Y-001 - Screen Reader Overload**
**Setup**: Complex screen reader scenarios
**Steps**:
1. Navigate rapidly with screen reader
2. Switch between virtual/browse modes quickly
3. Test with multiple AT tools running
4. Verify performance with heavy AT usage

**Expected Results**:
- App remains responsive with screen readers
- No conflicts between multiple AT tools
- Screen reader announcements don't overwhelm
- Performance acceptable with AT active

### High Contrast Extreme Conditions

**Test Case: EDGE-A11Y-002 - High Contrast + Large Text**
**Setup**: Maximum accessibility settings
**Steps**:
1. Enable high contrast mode
2. Set system text size to maximum
3. Use screen magnification
4. Test app usability in extreme conditions

**Expected Results**:
- App remains functional with all settings
- Text doesn't overflow or become unreadable
- Layout adapts to extreme text scaling
- All functionality accessible

## Test Data for Edge Cases

### Extreme User Profiles

**Edge Case Profile: Irregular Extreme**
```yaml
irregular_extreme_user:
  name: "Casey Chaos"
  description: "Extremely irregular cycles, 15-45 day variation"
  cycle_data:
    start_date: "2024-01-01"
    cycle_length: 30  # Average of extreme variation
    period_length: 3
  history:
    - { start: "2023-08-15", length: 30, actual: 45 }
    - { start: "2023-09-29", length: 30, actual: 15 }
    - { start: "2023-10-14", length: 30, actual: 38 }
    - { start: "2023-11-21", length: 30, actual: 22 }
    - { start: "2023-12-13", length: 30, actual: 19 }
    - { start: "2024-01-01", length: 30, actual: 41 }
```

**Edge Case Profile: Data Corruption**
```yaml
corrupted_data_user:
  name: "Corrupted State"
  description: "Simulated data corruption scenarios"
  corrupt_scenarios:
    - missing_start_date: { start_date: null }
    - invalid_cycle_length: { cycle_length: "not-a-number" }
    - future_history: { history: [{ start: "2025-12-31" }] }
    - negative_values: { cycle_length: -5, period_length: -2 }
```

## Error Message Testing

### User-Friendly Error Messages

**Test Case: ERR-MSG-001 - Error Message Quality**
**Setup**: Trigger various error conditions
**Steps**:
1. Cause each known error condition
2. Review error message content
3. Verify suggested solutions provided
4. Test message accessibility

**Expected Error Message Qualities**:
- Clear, non-technical language
- Specific description of the problem
- Actionable steps to resolve
- No system internals exposed
- Accessible to screen readers

**Example Expected Messages**:
```
❌ Bad: "Invalid input: cycle_length validation failed"
✅ Good: "Cycle length must be between 21 and 35 days. You entered 18 days."

❌ Bad: "Error: null reference exception in date calculator"
✅ Good: "We couldn't calculate your cycle because the start date is missing. Please set your last period start date."
```

## Recovery Testing Procedures

### Systematic Recovery Testing

**Recovery Test Protocol**:
1. **Setup Phase**: Establish known good state
2. **Break Phase**: Introduce specific failure
3. **Recovery Phase**: Test recovery mechanisms
4. **Verification Phase**: Confirm full functionality restored

**Recovery Success Criteria**:
- No data loss beyond point of failure
- App returns to stable, usable state
- User can continue normal operations
- Recovery process is understandable

## Edge Case Test Automation

### Automated Edge Case Testing

While many edge cases require manual testing, some can be automated:

```javascript
// Example automated edge case tests
describe('Edge Case Tests', () => {
  test('should handle extremely long cycle history', () => {
    const massiveHistory = generateCycleHistory(1000); // 1000 cycles
    const result = calculateAverageLength(massiveHistory);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(50);
  });

  test('should recover from corrupted preferences', () => {
    const corruptPrefs = '{ "cycleData": { invalid json';
    const result = parsePreferences(corruptPrefs);
    expect(result).toEqual(DEFAULT_PREFERENCES);
  });

  test('should handle rapid mode switching', async () => {
    const switchPromises = Array(100).fill().map(() => toggleMode());
    await Promise.all(switchPromises);
    // App should remain stable
    expect(getCurrentMode()).toBeDefined();
  });
});
```

## Documentation for Edge Cases

### User Documentation Updates

Edge case testing often reveals need for user documentation:

**FAQ Entries from Edge Cases**:
- "What if I have very irregular periods?"
- "Can I track periods longer than 10 days?"
- "What happens if I lose my data?"
- "Why can't I set future dates?"

**Troubleshooting Guide**:
- Steps to recover from common issues
- How to report unusual behaviors
- Data backup and recovery procedures
- Performance troubleshooting

## Long-term Edge Case Monitoring

### Ongoing Edge Case Discovery

**User Feedback Integration**:
- Monitor support requests for edge cases
- Track unusual usage patterns
- Collect crash reports and error logs
- Update test cases based on real-world usage

**Proactive Edge Case Testing**:
- Regular stress testing sessions
- Boundary value analysis updates
- New platform/OS version compatibility
- Performance regression monitoring

This comprehensive edge case and error testing ensures MoodBooMs handles unusual situations gracefully and provides a reliable experience for all users.