# MoodBooMs Installation Scripts

This directory contains installation and uninstallation scripts for both macOS and Windows platforms.

## Overview

These scripts handle post-installation tasks that aren't covered by the standard installers:
- Setting up application directories
- Configuring file associations
- Managing startup preferences
- Data migration from older versions
- Clean uninstallation with optional data preservation

## macOS Scripts

### Installation (`macos-install.sh`)
```bash
chmod +x scripts/install/macos-install.sh
./scripts/install/macos-install.sh
```

**Features:**
- ✅ Removes quarantine attributes to prevent app translocation
- ✅ Sets proper executable permissions
- ✅ Creates application support directories
- ✅ Checks accessibility permissions (for future features)
- ✅ Optional addition to login items
- ✅ Migrates data from old installations
- ✅ Launches app after setup

**Requirements:**
- macOS 10.15 or higher
- MoodBooMs.app must be in Applications folder

### Uninstallation (`macos-uninstall.sh`)
```bash
chmod +x scripts/install/macos-uninstall.sh
./scripts/install/macos-uninstall.sh
```

**Features:**
- ✅ Gracefully quits running application
- ✅ Removes from login items
- ✅ Optional data backup before removal
- ✅ Option to preserve settings
- ✅ Removes application bundle and support files
- ✅ Cleans cache and preferences
- ✅ Verification of complete removal

## Windows Scripts

### Installation (`windows-install.ps1`)
```powershell
# Run as Administrator
.\scripts\install\windows-install.ps1
```

**Features:**
- ✅ Creates application data directories
- ✅ Migrates data from old installations
- ✅ Adds Windows Firewall exception
- ✅ Sets up file associations (.mbm files)
- ✅ Optional desktop shortcut creation
- ✅ Optional Windows startup configuration
- ✅ Launches app after setup

**Requirements:**
- Windows 10 or higher
- Administrator privileges
- PowerShell execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Uninstallation (`windows-uninstall.ps1`)
```powershell
# Run as Administrator
.\scripts\install\windows-uninstall.ps1
```

**Features:**
- ✅ Stops running application processes
- ✅ Removes from Windows startup
- ✅ Optional data backup before removal
- ✅ Option to preserve settings
- ✅ Removes firewall exceptions
- ✅ Cleans shortcuts and Start Menu entries
- ✅ Removes registry entries and file associations
- ✅ Runs built-in uninstaller if available
- ✅ Verification of complete removal

## Usage Instructions

### For End Users

**macOS Installation:**
1. Download and mount the DMG file
2. Drag MoodBooMs to Applications folder
3. Open Terminal and run: `curl -s https://raw.githubusercontent.com/vadimgumarov/MoodbooMs/main/scripts/install/macos-install.sh | bash`

**Windows Installation:**
1. Download and run the installer
2. Open PowerShell as Administrator
3. Navigate to installation directory
4. Run: `.\scripts\install\windows-install.ps1`

**Alternative Download:**
Scripts can be downloaded individually from the GitHub repository.

### For Developers

**Testing Installation Scripts:**
```bash
# macOS
npm run build:mac
# Test with built DMG

# Windows (from macOS/Linux)
npm run build:win
# Test with built installer in Windows VM
```

**Integration with electron-builder:**
These scripts can be integrated into the build process using electron-builder's `afterPack` hooks.

## Data Management

### Backup Locations
- **macOS**: `~/Desktop/MoodBooMs_Backup_YYYYMMDD_HHMMSS/`
- **Windows**: `%USERPROFILE%\Desktop\MoodBooMs_Backup_YYYYMMDD_HHMMSS\`

### Data Preservation
Both platforms support keeping user data during uninstallation:
- Settings and preferences
- Cycle history and tracking data
- Custom configurations

### Migration Support
Scripts automatically detect and migrate data from:
- Previous installation locations
- Old application names (`moodbooms` → `MoodBooMs`)
- Legacy configuration formats

## File Associations

### Supported File Types
- `.mbm` - MoodBooMs data/backup files

### Registry Entries (Windows)
- `HKCU:\Software\Classes\.mbm`
- `HKCU:\Software\Classes\MoodBooMs.DataFile`

## Security Considerations

### macOS
- Scripts remove quarantine attributes safely
- No elevated privileges required for most tasks
- Accessibility permissions requested only when needed

### Windows
- Requires Administrator privileges for system-wide changes
- Firewall exceptions are application-specific
- Registry changes are user-scoped where possible

## Troubleshooting

### Common Issues

**macOS: "Permission Denied"**
```bash
chmod +x scripts/install/macos-install.sh
```

**Windows: "Execution Policy Restricted"**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**macOS: App Translocation Issues**
- Scripts automatically handle this
- Manual fix: Move app to Applications, then move to another location and back

**Windows: Installer Not Found**
- Ensure installer completed successfully
- Check if MoodBooMs.exe exists in Program Files

### Log Files
Scripts create detailed logs during execution:
- **macOS**: Console output only
- **Windows**: Event Viewer entries for system changes

## Development Notes

### Testing Checklist
- [ ] Fresh installation on clean system
- [ ] Upgrade from previous version
- [ ] Data migration scenarios
- [ ] Complete uninstallation
- [ ] File association functionality
- [ ] Startup/login item behavior

### Future Enhancements
- Silent installation options
- Group Policy support (Windows)
- macOS Installer package integration
- Automated update migration
- Enterprise deployment scripts

## Support

For issues with installation scripts:
1. Check the troubleshooting section above
2. Review console/PowerShell output for errors
3. Create an issue on the GitHub repository
4. Include platform version and error details