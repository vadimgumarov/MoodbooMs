# Accessibility User Acceptance Tests

## Overview
Comprehensive accessibility testing ensures MoodBooMs is usable by people with disabilities, following WCAG 2.1 AA standards.

## Screen Reader Testing

### macOS VoiceOver Tests

**Test Case: SR-MAC-001 - VoiceOver Navigation**
**Setup**: Enable VoiceOver (Cmd+F5), use Sarah Regular test data
**Steps**:
1. Launch app with VoiceOver enabled
2. Navigate through all UI elements using VO+Right Arrow
3. Listen to announcements for each element
4. Verify logical reading order

**Expected Results**:
- All elements have meaningful labels
- Navigation follows logical order: tabs → content → controls
- Current phase announced as "Current Phase: Ovulation, High Energy Warning"
- Tab roles announced as "Tab, selected" or "Tab"

**Test Case: SR-MAC-002 - Mode Switch Announcement**
**Setup**: VoiceOver enabled, start in Queen mode
**Steps**:
1. Navigate to mode toggle switch
2. Activate switch (VO+Space)
3. Listen for announcement
4. Verify phase name changes are announced

**Expected Results**:
- Switch announces "King Mode, toggle button, on/off"
- Mode change announced: "Mode switched to King Mode"
- New phase names announced correctly

**Test Case: SR-MAC-003 - Calendar Navigation**
**Setup**: VoiceOver enabled, calendar view active
**Steps**:
1. Navigate to calendar grid
2. Use arrow keys to move between dates
3. Listen to date announcements
4. Focus on period/ovulation dates

**Expected Results**:
- Dates announced as "January 15, 2024, Period Day 1, Very Low Fertility"
- Current day marked: "Today, January 28, Ovulation Day"
- Navigation instructions provided

### Windows NVDA Tests

**Test Case: SR-WIN-001 - NVDA Basic Navigation**
**Setup**: NVDA enabled, regular user test data
**Steps**:
1. Launch app with NVDA running
2. Use Tab key to navigate through interface
3. Use NVDA+Down Arrow to read content
4. Test all interactive elements

**Expected Results**:
- All elements properly identified by role
- Content read in logical order
- Form controls properly labeled
- Table navigation works for calendar

**Test Case: SR-WIN-002 - NVDA Calendar Reading**
**Setup**: NVDA enabled, calendar view
**Steps**:
1. Navigate to calendar with Tab
2. Use arrow keys within calendar
3. Use NVDA table navigation commands
4. Read cell contents with NVDA+T

**Expected Results**:
- Calendar identified as table
- Row/column headers read correctly
- Cell contents include fertility info
- Navigation between weeks/months announced

### Linux Orca Tests

**Test Case: SR-LIN-001 - Orca Compatibility**
**Setup**: Orca screen reader, Ubuntu 22.04
**Steps**:
1. Launch app with Orca enabled
2. Navigate using standard shortcuts
3. Test form controls and buttons
4. Verify text content reading

**Expected Results**:
- All UI elements accessible via Orca
- Proper role and state information
- Text content read accurately
- No silent or unlabeled elements

## Keyboard Navigation Testing

### Tab Navigation

**Test Case: KB-NAV-001 - Sequential Focus Order**
**Setup**: Any test user, keyboard-only navigation
**Steps**:
1. Start at top of interface
2. Press Tab repeatedly to move forward
3. Use Shift+Tab to move backward
4. Map complete focus order

**Expected Focus Order**:
1. Skip link (hidden until focused)
2. Tab navigation (Queen/History/Settings)
3. Mode toggle switch  
4. Main content area controls
5. Calendar (if visible)
6. Form inputs (if any)

**Test Case: KB-NAV-002 - Tab Control Navigation**
**Setup**: Focus on tab navigation
**Steps**:
1. Tab to tab list
2. Use Left/Right arrows to switch tabs
3. Press Enter to activate tab
4. Use Home/End to jump to first/last tab

**Expected Results**:
- Arrow keys move between tabs
- Enter activates selected tab
- Home/End keys work
- Active tab receives focus when tabbing back

**Test Case: KB-NAV-003 - Calendar Keyboard Control**
**Setup**: Focus on calendar component
**Steps**:
1. Tab to calendar
2. Use arrow keys to navigate dates
3. Test Home/End for week/month boundaries
4. Use Page Up/Down for month navigation

**Expected Results**:
- Arrow keys move between dates
- Home/End jump to week boundaries  
- Page Up/Down change months
- Current selection clearly visible

### Focus Indicators

**Test Case: KB-FOC-001 - Visible Focus Indicators**
**Setup**: Any test user, high contrast disabled
**Steps**:
1. Navigate through all interactive elements
2. Verify focus ring visibility
3. Check contrast ratios of focus indicators
4. Test in both light and dark themes

**Expected Results**:
- All focusable elements show clear focus ring
- Focus contrast ratio ≥ 3:1 against background
- Focus indicators consistent across themes
- No invisible or hard-to-see focus states

**Test Case: KB-FOC-002 - High Contrast Focus**
**Setup**: High contrast mode enabled
**Steps**:
1. Enable high contrast in app settings
2. Navigate through interface with keyboard
3. Verify enhanced focus indicators
4. Check visibility against high contrast backgrounds

**Expected Results**:
- Focus indicators more prominent in high contrast
- Colors follow high contrast theme (blue/cyan)
- All focus states remain visible
- No focus indicators lost due to color similarity

## High Contrast Mode Testing

### Visual Contrast Tests

**Test Case: HC-VIS-001 - Text Contrast Ratios**
**Setup**: High contrast mode enabled
**Steps**:
1. Enable high contrast mode
2. Test with contrast analyzer tool
3. Check all text elements
4. Verify minimum 7:1 ratio (AAA standard)

**Expected Results**:
- Normal text: ≥7:1 contrast ratio
- Large text (18pt+): ≥4.5:1 contrast ratio
- UI controls: ≥3:1 contrast ratio
- Focus indicators: ≥3:1 contrast ratio

**Test Case: HC-VIS-002 - Color Independence**
**Setup**: High contrast mode, colorblind testing
**Steps**:
1. Enable high contrast
2. Test with color blindness simulator
3. Verify information not lost
4. Check fertility indicators work without color

**Expected Results**:
- All information available without color
- Fertility levels indicated by patterns/text
- Icons supplement color coding
- No critical info conveyed by color alone

### Mode Switching Tests

**Test Case: HC-MOD-001 - Contrast Toggle**
**Setup**: Standard mode active
**Steps**:
1. Navigate to high contrast toggle in settings
2. Activate toggle with Enter/Space
3. Verify immediate visual changes
4. Toggle back to standard mode

**Expected Results**:
- Immediate contrast changes applied
- All colors update to high contrast palette
- Toggle state properly announced
- Settings persist across app restarts

**Test Case: HC-MOD-002 - System Integration**
**Setup**: OS high contrast enabled
**Steps**:
1. Enable system high contrast mode
2. Launch app
3. Verify app respects system setting
4. Test app override functionality

**Expected Results**:
- App detects system high contrast
- App high contrast mode activates automatically
- Manual override still available
- Proper precedence handling

## Motor Disability Support

### Large Click Targets

**Test Case: MOT-TAR-001 - Touch Target Sizes**
**Setup**: Measure all interactive elements
**Steps**:
1. Inspect all buttons, links, controls
2. Measure clickable areas
3. Verify minimum 44px × 44px targets
4. Check spacing between targets

**Expected Results**:
- All targets ≥44px in both dimensions
- Adequate spacing between adjacent targets
- Calendar dates large enough for selection
- Mode toggle switch properly sized

### Pointer Alternatives

**Test Case: MOT-ALT-001 - Keyboard Alternatives**
**Setup**: Disable mouse/trackpad, keyboard only
**Steps**:
1. Complete full user workflow using only keyboard
2. Add new period start date
3. Switch between tabs
4. Toggle high contrast mode

**Expected Results**:
- All functionality available via keyboard
- No mouse-only interactions
- Hover states have keyboard equivalents
- Context menus accessible via keyboard

## Cognitive Accessibility

### Clear Language and Instructions

**Test Case: COG-LAN-001 - Language Complexity**
**Setup**: Review all UI text content
**Steps**:
1. Analyze text complexity using readability tools
2. Check medical terminology usage
3. Verify clear instructions provided
4. Test with non-expert users

**Expected Results**:
- Text at appropriate reading level
- Medical terms explained when necessary
- Instructions clear and concise
- Error messages helpful and specific

### Consistent Interaction Patterns

**Test Case: COG-CON-001 - Interface Consistency**
**Setup**: Navigate through all app sections
**Steps**:
1. Document interaction patterns across app
2. Verify consistent button placement
3. Check similar functions work similarly
4. Test navigation consistency

**Expected Results**:
- Consistent navigation patterns throughout
- Similar functions in similar locations
- Predictable interaction behaviors
- Minimal cognitive load for learning interface

## Assistive Technology Compatibility

### Voice Control Testing (macOS)

**Test Case: AT-VOI-001 - Voice Control Navigation**
**Setup**: Enable macOS Voice Control
**Steps**:
1. Enable Voice Control (System Preferences)
2. Use voice commands to navigate app
3. Say "Click [button name]" for buttons
4. Use "Show numbers" for grid navigation

**Expected Results**:
- All clickable elements voice-controllable
- Element names match visual labels
- Voice Control grid overlay works
- Complex interactions possible via voice

### Switch Control Testing

**Test Case: AT-SWI-001 - Switch Navigation**
**Setup**: Enable Switch Control, single switch
**Steps**:
1. Configure Switch Control with space bar
2. Navigate through interface using scanning
3. Select elements during scanning pauses
4. Complete common tasks

**Expected Results**:
- All interface elements reachable via scanning
- Scanning order logical and efficient
- Selection timing appropriate
- No unreachable interactive elements

## Testing Automation Integration

### Automated Accessibility Tests

**Test Case: AUTO-A11Y-001 - jest-axe Integration**
**Setup**: Run accessibility unit tests
**Steps**:
1. Execute `npm test -- --testNamePattern="accessibility"`
2. Review axe-core rule violations
3. Check for new accessibility issues
4. Verify test coverage

**Expected Results**:
- All automated accessibility tests pass
- No critical axe-core violations
- New features include accessibility tests
- Regular regression testing in place

### Manual Testing Checklist

**Pre-Release Accessibility Checklist**:
- [ ] Screen reader testing on all platforms
- [ ] Keyboard navigation complete workflow
- [ ] High contrast mode functional
- [ ] Focus indicators visible throughout
- [ ] Color contrast ratios verified
- [ ] Text alternatives for non-text content
- [ ] No keyboard traps or dead ends
- [ ] Meaningful focus order maintained
- [ ] Error messages clear and helpful
- [ ] Consistent interaction patterns

## Accessibility Test Data

### User Personas for Accessibility Testing

**Persona: Vision Impaired - Sarah**
- Uses VoiceOver on macOS
- Needs high contrast for low vision
- Relies on keyboard navigation
- Requires clear text alternatives

**Persona: Motor Disability - Mark**
- Uses switch control device
- Needs large click targets
- Sequential navigation preferred
- Voice control backup

**Persona: Cognitive Disability - Lisa**
- Benefits from consistent patterns
- Needs clear, simple language
- Requires error prevention/correction
- Prefers familiar interaction models

## Compliance Verification

### WCAG 2.1 AA Compliance Checklist

**Level A Requirements**:
- [x] Non-text content has alternatives
- [x] Audio/video content has alternatives (N/A)
- [x] Content can be presented without losing meaning
- [x] All functionality available via keyboard
- [x] Users can control time limits (N/A)
- [x] Content doesn't cause seizures (N/A)
- [x] Users can navigate and find content
- [x] Content is readable and understandable

**Level AA Requirements**:
- [x] Color contrast ratios meet minimums
- [x] Text can be resized 200% without assistive technology
- [x] Images of text avoided where possible
- [x] All functionality available via keyboard
- [x] Keyboard focus is visible
- [x] Page language identified
- [x] Content appears in meaningful sequence
- [x] Instructions don't rely solely on sensory characteristics

### Accessibility Statement Template

```markdown
# Accessibility Statement for MoodBooMs

## Commitment to Accessibility
We are committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

## Conformance Status
This application aims to conform to WCAG 2.1 AA standards.

## Feedback
We welcome your feedback on accessibility. If you encounter accessibility barriers:
- Email: accessibility@moodbooms.app
- Describe the problem and include your contact information

## Compatibility
This application has been tested with:
- macOS VoiceOver
- Windows NVDA
- High contrast modes
- Keyboard-only navigation

## Technical Specifications
- Markup languages: HTML5, React
- Assistive technologies: Screen readers, keyboard navigation
- Browsers: Chrome, Safari, Firefox, Edge (latest versions)

Last updated: [Date]
```

## Testing Timeline

### Development Phase
- **Feature Development**: Accessibility considerations included from start
- **Code Review**: Accessibility checks part of PR review
- **Unit Tests**: Automated accessibility tests run with each build

### Pre-Release Phase  
- **Alpha Testing**: Internal accessibility review
- **Beta Testing**: External accessibility user testing
- **Release Candidate**: Full accessibility audit

### Post-Release
- **Ongoing Monitoring**: User feedback collection
- **Regular Audits**: Quarterly accessibility reviews
- **Updates**: Accessibility improvements in point releases