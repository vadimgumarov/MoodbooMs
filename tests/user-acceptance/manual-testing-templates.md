# Manual Testing Templates

## Overview
Standardized templates for consistent manual testing across different scenarios, platforms, and team members.

## Test Case Template

### Standard Test Case Format

```markdown
# Test Case: [ID] - [Title]

## Test Information
- **Test ID**: TC-[CATEGORY]-[NUMBER]
- **Category**: [New User Journey/Daily Usage/Data Management/etc.]
- **Priority**: [High/Medium/Low]
- **Platform**: [macOS/Windows/Linux/All]
- **Prerequisites**: [Required setup or conditions]
- **Test Data**: [Reference to test data file]

## Test Objective
[Clear description of what this test validates]

## Test Steps
1. [Step 1 - be specific and actionable]
2. [Step 2 - include expected UI changes]
3. [Step 3 - specify user actions precisely]
4. [Continue with all steps...]

## Expected Results
- [Expected outcome 1]
- [Expected outcome 2]  
- [Expected outcome 3]

## Acceptance Criteria
- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________

## Failure Information (if applicable)
- **Issue Description**: ___________
- **Steps to Reproduce**: ___________
- **Screenshot/Video**: ___________
- **Workaround Available**: Yes / No
- **Severity**: Critical / High / Medium / Low
```

## New User Journey Templates

### Template: First Time Setup

```markdown
# Test Case: TC-NUJ-001 - First Time App Setup

## Test Information
- **Test ID**: TC-NUJ-001
- **Category**: New User Journey
- **Priority**: High
- **Platform**: All
- **Prerequisites**: Fresh app installation, no existing data
- **Test Data**: None (clean slate)

## Test Objective
Verify new users can successfully complete initial app setup and begin tracking their cycle.

## Test Steps
1. Launch MoodBooMs for the first time
2. Observe welcome/onboarding screen (if present)
3. Navigate through initial setup process
4. Set period start date: [Use current date - 10 days]
5. Set cycle length: 28 days
6. Set period length: 5 days
7. Choose initial mode: Queen
8. Complete setup and enter main app

## Expected Results
- Setup process is clear and intuitive
- All required information collected
- App transitions to main interface
- Initial phase calculated correctly based on entered data

## Acceptance Criteria
- [ ] Setup completes without errors
- [ ] All user inputs validated appropriately
- [ ] Phase detection works immediately after setup
- [ ] User can access all main features
- [ ] Data persists after app restart

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

### Template: Feature Discovery

```markdown
# Test Case: TC-NUJ-002 - New User Feature Discovery

## Test Information
- **Test ID**: TC-NUJ-002
- **Category**: New User Journey
- **Priority**: Medium
- **Platform**: All
- **Prerequisites**: Completed first-time setup
- **Test Data**: new_user test profile

## Test Objective
Verify new users can discover and understand core app features without documentation.

## Test Steps
1. Start with completed first-time setup
2. Explore main interface for 5 minutes without guidance
3. Click on each tab to understand purpose
4. Try mode switching toggle
5. Navigate calendar view
6. Look for help or information indicators

## Expected Results
- Interface is intuitive and self-explanatory
- Tab purposes are clear from visual design
- Mode switching is discoverable and understandable
- Calendar navigation feels natural

## Acceptance Criteria
- [ ] User can identify main features within 2 minutes
- [ ] Mode toggle purpose is clear from UI
- [ ] Calendar navigation is intuitive
- [ ] No critical features are hidden or hard to find

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

## Daily Usage Templates

### Template: Routine Check-in

```markdown
# Test Case: TC-DU-001 - Daily Cycle Check

## Test Information
- **Test ID**: TC-DU-001
- **Category**: Daily Usage
- **Priority**: High
- **Platform**: All
- **Prerequisites**: Established user with cycle history
- **Test Data**: regular_user test profile

## Test Steps
1. Click tray icon to open app
2. View current phase information
3. Read today's mood message
4. Check fertility level indicator
5. Note any food cravings displayed
6. Close app by clicking outside window

## Expected Results
- App opens quickly from tray
- Current phase clearly displayed
- Mood message is relevant and humorous
- Fertility information is accurate for cycle day
- Window hides cleanly when focus lost

## Acceptance Criteria
- [ ] Tray interaction works smoothly
- [ ] Phase information is accurate
- [ ] Mood content is appropriate for current phase
- [ ] App performance is responsive
- [ ] Window management works correctly

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

### Template: Mode Switching Workflow

```markdown
# Test Case: TC-DU-002 - Queen/King Mode Switch

## Test Information  
- **Test ID**: TC-DU-002
- **Category**: Daily Usage
- **Priority**: High
- **Platform**: All
- **Prerequisites**: App running in either mode
- **Test Data**: Any established user

## Test Objective
Verify users can seamlessly switch between Queen and King modes for different perspectives.

## Test Steps
1. Note current mode and phase name
2. Click mode toggle switch
3. Observe visual changes during switch
4. Verify phase name updates to new mode
5. Check mood message changes
6. Switch back to original mode
7. Confirm everything returns to original state

## Expected Results
- Mode switch is immediate and smooth
- Phase names update correctly for each mode
- Mood messages change to match perspective
- No data loss or corruption during switch
- Visual feedback confirms mode change

## Acceptance Criteria
- [ ] Toggle switch provides clear visual feedback
- [ ] Phase names change appropriately (Queen ↔ King)
- [ ] Content updates match selected mode
- [ ] Switch completes within 1 second
- [ ] No interface glitches or flashing

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

## Data Management Templates

### Template: Data Export/Import

```markdown
# Test Case: TC-DM-001 - Cycle Data Backup

## Test Information
- **Test ID**: TC-DM-001
- **Category**: Data Management
- **Priority**: High
- **Platform**: All
- **Prerequisites**: User with cycle history
- **Test Data**: power_user test profile

## Test Objective
Verify users can successfully backup and restore their cycle data.

## Test Steps
1. Go to Settings/Data Management section
2. Click "Export Data" or equivalent option
3. Choose export location and file format
4. Save export file to known location
5. Clear all app data (or use fresh installation)
6. Import the exported data file
7. Verify all data restored correctly

## Expected Results
- Export process is straightforward
- All user data included in export file
- Import process restores data completely
- No data corruption or loss occurs

## Acceptance Criteria
- [ ] Export contains all cycle history
- [ ] Settings and preferences included
- [ ] Import restores complete state
- [ ] Process works on all platforms
- [ ] Export file format is documented

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

## Accessibility Testing Templates

### Template: Screen Reader Navigation

```markdown
# Test Case: TC-A11Y-001 - Screen Reader Complete Workflow

## Test Information
- **Test ID**: TC-A11Y-001
- **Category**: Accessibility
- **Priority**: High
- **Platform**: [Specify: macOS+VoiceOver, Windows+NVDA, Linux+Orca]
- **Prerequisites**: Screen reader enabled, test user data
- **Test Data**: regular_user test profile

## Test Objective
Verify complete app functionality is accessible via screen reader.

## Test Steps
1. Launch app with screen reader active
2. Navigate through all UI elements using screen reader commands
3. Listen to announcements for each element
4. Switch between tabs using keyboard navigation
5. Toggle Queen/King mode and verify announcements
6. Navigate calendar and verify date information read correctly
7. Access all interactive elements

## Expected Results
- All elements have meaningful labels
- Navigation order is logical
- Mode changes are announced clearly
- Calendar dates include cycle information
- No silent or unlabeled interactive elements

## Acceptance Criteria
- [ ] All UI elements accessible via screen reader
- [ ] Labels are descriptive and helpful
- [ ] Reading order follows visual layout
- [ ] Interactive elements clearly identified
- [ ] Status changes are announced

## Execution Notes
**Screen Reader**: ___________
**Version**: ___________
**Commands Used**: ___________

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

### Template: Keyboard Navigation

```markdown
# Test Case: TC-A11Y-002 - Keyboard-Only Navigation

## Test Information
- **Test ID**: TC-A11Y-002
- **Category**: Accessibility
- **Priority**: High
- **Platform**: All
- **Prerequisites**: Keyboard only (no mouse/trackpad)
- **Test Data**: Any user profile

## Test Objective
Verify all app functionality is accessible using only keyboard input.

## Test Steps
1. Start app and disconnect/disable pointing device
2. Use Tab key to navigate through interface
3. Use arrow keys for tab switching and calendar navigation
4. Use Enter/Space to activate buttons and toggles
5. Complete a full user workflow (check phase, switch modes, navigate calendar)
6. Verify focus indicators are visible throughout
7. Test escape key behavior for closing/canceling

## Expected Results
- All functionality accessible via keyboard
- Focus indicators clearly visible
- Navigation is efficient and logical
- No keyboard traps or dead ends

## Acceptance Criteria
- [ ] Tab order follows logical sequence
- [ ] All interactive elements reachable
- [ ] Focus indicators visible and high contrast
- [ ] Keyboard shortcuts work as expected
- [ ] No functionality requires mouse/pointer

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

## Performance Testing Templates

### Template: Startup Performance

```markdown
# Test Case: TC-PERF-001 - App Launch Performance

## Test Information
- **Test ID**: TC-PERF-001
- **Category**: Performance
- **Priority**: Medium
- **Platform**: [Specify exact platform and hardware]
- **Prerequisites**: App not running, system resources available
- **Test Data**: regular_user test profile

## Test Objective
Verify app starts within acceptable time limits and uses reasonable system resources.

## Test Steps
1. Ensure app is completely closed
2. Start timer and launch app
3. Stop timer when app is fully interactive
4. Monitor memory usage after launch
5. Check CPU usage during startup
6. Verify tray icon appears promptly
7. Test immediate responsiveness after launch

## Expected Results
- App launches within 3 seconds
- Memory usage < 100MB after startup
- CPU usage returns to normal after launch
- Interface is immediately responsive

## Acceptance Criteria
- [ ] Launch time ≤ 3 seconds (≤ 2 seconds preferred)
- [ ] Memory usage ≤ 100MB
- [ ] No extended high CPU usage
- [ ] UI responsive immediately after launch
- [ ] All features available after startup

## Performance Measurements
- **Launch Time**: _____ ms
- **Initial Memory**: _____ MB
- **Peak CPU%**: _____ %
- **Time to Interactive**: _____ ms

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Hardware**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

## Platform-Specific Templates

### Template: macOS Integration

```markdown
# Test Case: TC-MAC-001 - macOS Native Features

## Test Information
- **Test ID**: TC-MAC-001
- **Category**: Platform Integration
- **Priority**: High
- **Platform**: macOS [specify version]
- **Prerequisites**: macOS system with standard configuration
- **Test Data**: regular_user test profile

## Test Objective
Verify proper integration with macOS-specific features and behaviors.

## Test Steps
1. Launch app and verify menu bar icon placement
2. Test icon appearance in light and dark mode
3. Click icon and verify window positioning below icon
4. Right-click icon to test context menu
5. Test Cmd+Q keyboard shortcut
6. Test Cmd+H hide functionality
7. Switch system between light/dark mode
8. Enable/disable notifications in System Preferences

## Expected Results
- Icon appears correctly in menu bar
- Icon adapts to system theme
- Window positions appropriately under icon
- Context menu provides expected options
- Keyboard shortcuts work as expected
- Notifications integrate with Notification Center

## Acceptance Criteria
- [ ] Menu bar icon visible and properly sized
- [ ] Click behavior matches macOS standards
- [ ] Keyboard shortcuts follow macOS conventions
- [ ] Notifications work with system settings
- [ ] App follows macOS UI guidelines
- [ ] No Gatekeeper or security warnings

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

## Error Handling Templates

### Template: Data Corruption Recovery

```markdown
# Test Case: TC-ERR-001 - Data Recovery Scenarios

## Test Information
- **Test ID**: TC-ERR-001
- **Category**: Error Handling
- **Priority**: Medium
- **Platform**: All
- **Prerequisites**: Backup of working app data
- **Test Data**: corrupted_data test scenarios

## Test Objective
Verify app handles data corruption gracefully and recovers when possible.

## Test Steps
1. Stop app completely
2. Corrupt data file using predetermined scenario
3. Launch app and observe behavior
4. Check error messages presented to user
5. Test recovery options offered
6. Verify app remains functional with default data
7. Restore from backup and verify full recovery

## Expected Results
- App detects corruption and handles gracefully
- Clear, helpful error messages shown
- Recovery options offered when possible
- App remains stable despite corrupted data

## Acceptance Criteria
- [ ] No crashes from corrupted data
- [ ] User-friendly error messages
- [ ] Recovery process is clear
- [ ] Data loss minimized
- [ ] App functionality maintained

## Corruption Scenarios Tested
- [ ] Invalid JSON in preferences
- [ ] Missing required data fields
- [ ] Impossible date values
- [ ] File permission issues

## Test Execution
- **Date Executed**: ___________
- **Executed By**: ___________
- **Platform/Version**: ___________
- **Result**: PASS / FAIL / BLOCKED
- **Notes**: ___________
```

## Test Session Templates

### Template: Full Feature Test Session

```markdown
# Test Session: Full Application Testing

## Session Information
- **Session ID**: TS-[DATE]-[TESTER]
- **Date**: ___________
- **Tester**: ___________
- **Platform**: ___________
- **App Version**: ___________
- **Duration**: _____ hours

## Test Scope
- [ ] New User Journey
- [ ] Daily Usage Scenarios  
- [ ] Data Management
- [ ] Accessibility
- [ ] Performance
- [ ] Platform Integration
- [ ] Error Handling

## Test Environment Setup
- **OS Version**: ___________
- **Hardware**: ___________
- **Screen Resolution**: ___________
- **Accessibility Tools**: ___________
- **Test Data Used**: ___________

## Test Results Summary
- **Total Test Cases**: ___________
- **Passed**: ___________
- **Failed**: ___________
- **Blocked**: ___________
- **Skipped**: ___________

## Critical Issues Found
1. **Issue**: ___________
   - **Severity**: ___________
   - **Test Case**: ___________
   - **Screenshot**: ___________

## Session Notes
[General observations, patterns noticed, areas of concern]

## Recommendations
- [ ] Ready for release
- [ ] Minor fixes needed
- [ ] Major issues require resolution
- [ ] Additional testing needed

## Follow-up Actions
1. ___________
2. ___________
3. ___________
```

### Template: Quick Smoke Test Session

```markdown
# Smoke Test Session

## Session Information
- **Date**: ___________
- **Tester**: ___________
- **Platform**: ___________
- **Version**: ___________
- **Duration**: 15-30 minutes

## Quick Test Checklist
- [ ] App launches successfully
- [ ] Tray icon appears and responds
- [ ] Main window shows correctly
- [ ] Mode switching works
- [ ] Calendar navigation functional
- [ ] Settings accessible
- [ ] App closes cleanly
- [ ] No obvious crashes or errors

## Issues Found
[List any issues discovered during smoke test]

## Overall Assessment
- [ ] PASS - Ready for further testing
- [ ] FAIL - Critical issues prevent testing
- [ ] CONDITIONAL - Minor issues noted

## Notes
[Any observations or concerns]
```

## Test Result Templates

### Template: Bug Report

```markdown
# Bug Report: [Title]

## Bug Information
- **Bug ID**: BUG-[YYYY]-[NNN]
- **Reporter**: ___________
- **Date**: ___________
- **Platform**: ___________
- **App Version**: ___________
- **Severity**: Critical / High / Medium / Low
- **Priority**: High / Medium / Low

## Summary
[Brief description of the issue]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Attachments
- [ ] Screenshot
- [ ] Video recording
- [ ] Log files
- [ ] Test data used

## Environment Details
- **OS**: ___________
- **Hardware**: ___________
- **Screen Resolution**: ___________
- **Accessibility Tools**: ___________

## Workaround Available
- [ ] Yes: [Describe workaround]
- [ ] No

## Additional Notes
[Any other relevant information]
```

## Testing Best Practices Reminder

### Before Each Test
- [ ] Review test objective and acceptance criteria
- [ ] Set up test environment as specified
- [ ] Use designated test data
- [ ] Clear any previous test artifacts

### During Testing
- [ ] Follow steps exactly as written
- [ ] Document unexpected behaviors
- [ ] Take screenshots for visual issues
- [ ] Note performance observations
- [ ] Record exact error messages

### After Testing
- [ ] Clean up test environment
- [ ] Update test case if steps were unclear
- [ ] Report bugs immediately
- [ ] Update test results in tracking system
- [ ] Prepare artifacts for review

This comprehensive collection of manual testing templates ensures consistent, thorough testing across all aspects of MoodBooMs functionality.