# Build Resources

This directory contains resources needed for building distributable packages.

## Files

### `entitlements.mac.plist`
macOS entitlements file required for code signing and notarization. Defines security permissions needed by the app.

### `dmg-background.png` (optional)
Background image for the DMG installer. Should be 540x380 pixels for optimal display.

## Notes

- The entitlements file allows necessary permissions for a menubar app
- App sandbox is disabled as required for system tray functionality  
- Network client access is enabled for potential future features
- File system access is limited to user-selected and downloads directories