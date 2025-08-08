# Platform-Specific User Acceptance Tests

## Overview
Platform-specific tests ensure MoodBooMs works correctly across macOS, Windows, and Linux with proper native integrations and OS-specific behaviors.

## macOS Testing

### System Requirements
- macOS 12.0 (Monterey) or later
- Apple Silicon (M1/M2) and Intel x86_64 support
- Minimum 4GB RAM, 100MB storage

### Tray Icon & Menu Bar
**Test Case: TRY-MAC-001 - Tray Icon Display**
1. Launch app
2. Verify icon appears in menu bar (top-right)
3. Check icon visibility in light/dark mode
4. Confirm 22x22px resolution (proper scaling)

**Expected Result**: Icon visible, properly sized, adapts to system theme

**Test Case: TRY-MAC-002 - Menu Bar Click Behavior**
1. Click tray icon
2. Verify window appears below icon
3. Click outside window
4. Confirm window hides automatically

**Expected Result**: Window shows/hides correctly, positioned under icon

**Test Case: TRY-MAC-003 - Menu Bar Right-Click**
1. Right-click tray icon
2. Verify context menu appears
3. Test "Quit" option
4. Test "Settings" option

**Expected Result**: Context menu works, options function correctly

### Native Notifications
**Test Case: NOT-MAC-001 - System Notifications**
1. Enable notifications in app settings
2. Set notification for ovulation day
3. Wait for/simulate notification time
4. Verify native macOS notification appears

**Expected Result**: macOS notification center shows app notification

**Test Case: NOT-MAC-002 - Notification Permissions**
1. Fresh install
2. First notification trigger
3. Verify permission request appears
4. Test both Allow/Deny scenarios

**Expected Result**: Permission dialog appears, settings respected

### Dark Mode Integration
**Test Case: THM-MAC-001 - System Theme Sync**
1. Set macOS to light mode
2. Launch app, verify light theme
3. Switch macOS to dark mode
4. Verify app theme updates automatically

**Expected Result**: App theme matches system preference

### Keyboard Shortcuts
**Test Case: KEY-MAC-001 - Cmd+Q Quit**
1. Focus app window
2. Press Cmd+Q
3. Verify app quits completely

**Expected Result**: App exits cleanly

**Test Case: KEY-MAC-002 - Cmd+H Hide**
1. Focus app window  
2. Press Cmd+H
3. Verify window hides to menu bar

**Expected Result**: Window hidden but app remains in menu bar

### File System & Permissions
**Test Case: FS-MAC-001 - Data Storage**
1. Create cycle data
2. Verify storage in ~/Library/Application Support/MoodBooMs
3. Check file permissions (user read/write only)

**Expected Result**: Data stored in correct location with proper permissions

### Code Signing & Notarization
**Test Case: SEC-MAC-001 - App Store Gatekeeper**
1. Fresh download of signed app
2. First launch attempt
3. Verify no Gatekeeper warnings
4. Confirm app opens without permission dialogs

**Expected Result**: App launches without security warnings

## Windows Testing

### System Requirements
- Windows 10 version 1903 or later
- Windows 11 supported
- x64 architecture
- Minimum 4GB RAM, 100MB storage

### System Tray Integration
**Test Case: TRY-WIN-001 - System Tray Icon**
1. Launch app
2. Verify icon appears in system tray (bottom-right)
3. Test with tray overflow (many icons)
4. Verify icon remains visible

**Expected Result**: Icon visible in system tray, handles overflow properly

**Test Case: TRY-WIN-002 - Tray Context Menu**
1. Right-click tray icon
2. Verify context menu appears
3. Test all menu options
4. Verify menu styling matches Windows theme

**Expected Result**: Context menu functions correctly, proper Windows styling

### Windows Notifications
**Test Case: NOT-WIN-001 - Toast Notifications**
1. Enable notifications in app
2. Trigger test notification
3. Verify Windows toast notification appears
4. Test notification actions (if any)

**Expected Result**: Toast notification displays with proper branding

### Start Menu Integration
**Test Case: STM-WIN-001 - Start Menu Tile**
1. Install app
2. Check Start Menu for app tile
3. Pin to Start Menu
4. Verify tile appearance and launch

**Expected Result**: App appears in Start Menu, tile works correctly

### Multi-Monitor Support
**Test Case: MON-WIN-001 - Multi-Monitor Display**
1. Use multi-monitor setup
2. Move tray to secondary monitor
3. Click tray icon
4. Verify window appears on correct monitor

**Expected Result**: Window appears on monitor with system tray

### Windows Defender Integration
**Test Case: SEC-WIN-001 - Defender Scanning**
1. Fresh app install
2. Run Windows Defender scan
3. Verify no false positives
4. Test app functionality after scan

**Expected Result**: No security warnings, app functions normally

### Windows Updates Compatibility
**Test Case: UPD-WIN-001 - OS Update Compatibility**
1. Install app on Windows 10
2. Upgrade to Windows 11
3. Verify app continues working
4. Test all core functionality

**Expected Result**: App survives OS upgrade without issues

## Linux Testing

### Distribution Support
- Ubuntu 20.04 LTS, 22.04 LTS
- Fedora 36, 37, 38
- Debian 11, 12
- Pop!_OS, Mint (Ubuntu-based)

### System Tray Compatibility
**Test Case: TRY-LIN-001 - DE Tray Support**
Test on each desktop environment:
- GNOME (with TopIcons extension)
- KDE Plasma
- XFCE
- Cinnamon
- MATE

**Steps**:
1. Install app on each DE
2. Launch and verify tray icon
3. Test click/right-click behavior
4. Verify icon theme integration

**Expected Result**: Tray icon works on all supported DEs

### Package Manager Integration
**Test Case: PKG-LIN-001 - AppImage Execution**
1. Download AppImage
2. Make executable: `chmod +x`
3. Launch via file manager
4. Launch via terminal

**Expected Result**: Both methods launch app successfully

**Test Case: PKG-LIN-002 - Snap Package**
1. Install via `snap install moodbooms`
2. Launch via `moodbooms` command
3. Test permissions and file access
4. Verify updates work

**Expected Result**: Snap package installs and runs correctly

### Freedesktop Notifications
**Test Case: NOT-LIN-001 - libnotify Integration**
1. Enable notifications in app
2. Trigger test notification
3. Verify notification appears via system daemon
4. Test on different notification daemons

**Expected Result**: Notifications work across different Linux setups

### Wayland vs X11 Support
**Test Case: DIS-LIN-001 - Display Server Compatibility**
1. Test app on X11 session
2. Test app on Wayland session
3. Verify tray behavior on both
4. Check for display scaling issues

**Expected Result**: App works on both display servers

## Cross-Platform Feature Parity

### Core Functionality Matrix
| Feature | macOS | Windows | Linux | Notes |
|---------|--------|---------|--------|-------|
| Tray Icon | ✅ | ✅ | ✅* | *Depends on DE |
| Notifications | ✅ | ✅ | ✅ | Native integration |
| Dark Mode | ✅ | ✅ | ✅ | System theme sync |
| Auto-Start | ✅ | ✅ | ✅ | OS-specific methods |
| File Storage | ✅ | ✅ | ✅ | Platform directories |
| Keyboard Shortcuts | ✅ | ✅ | ✅ | Platform conventions |

### Data Portability Tests
**Test Case: DAT-XPL-001 - Cross-Platform Data**
1. Create data on Platform A
2. Export cycle data
3. Import on Platform B
4. Verify all data intact

**Expected Result**: Data transfers perfectly between platforms

### UI Consistency Tests
**Test Case: UI-XPL-001 - Visual Consistency**
1. Take screenshots of main UI on all platforms
2. Compare layout, fonts, colors
3. Verify responsive behavior
4. Check for platform-specific adaptations

**Expected Result**: Consistent appearance with appropriate native elements

## Performance Benchmarks by Platform

### Startup Time Expectations
- **macOS**: < 2.0s (M1), < 2.5s (Intel)
- **Windows**: < 2.5s (SSD), < 3.5s (HDD)
- **Linux**: < 2.0s (varies by DE)

### Memory Usage Baselines
- **macOS**: 60-80MB baseline
- **Windows**: 70-90MB baseline  
- **Linux**: 50-70MB baseline (varies by DE)

## Testing Tools & Environment

### macOS Testing Tools
- **System Information**: Check hardware compatibility
- **Console.app**: Monitor system logs
- **Activity Monitor**: Check memory/CPU usage
- **Accessibility Inspector**: Test VoiceOver compatibility

### Windows Testing Tools
- **Task Manager**: Monitor performance
- **Event Viewer**: Check system logs
- **Reliability Monitor**: Track crashes
- **Narrator**: Test screen reader support

### Linux Testing Tools
- **htop/top**: Monitor system resources
- **journalctl**: Check system logs
- **Orca**: Test screen reader support
- **dconf-editor**: Verify settings storage

## Test Execution Schedule

### Pre-Release Testing
1. **Alpha**: Core functionality on primary platform (macOS)
2. **Beta**: All platforms, basic functionality
3. **Release Candidate**: Full platform test suite
4. **Production**: Spot checks and regression tests

### Platform Priority
1. **macOS** (Primary platform - most users)
2. **Windows** (Secondary - growing user base)
3. **Linux** (Community-driven, best-effort support)

## Bug Reporting Template

```
Platform Bug Report
===================
Platform: [macOS 14.1 / Windows 11 / Ubuntu 22.04]
Hardware: [M2 MacBook Pro / Dell XPS / etc.]
App Version: [1.2.3]
DE/WM: [N/A / N/A / GNOME 42] (Linux only)

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Screenshots:
[Attach relevant screenshots]

System Logs:
[Paste relevant log entries]

Additional Context:
[Any other relevant information]
```