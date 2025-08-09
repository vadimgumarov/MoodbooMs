# MoodBooMs Windows Installation Script
# This script handles post-installation tasks for Windows

# Require Administrator privileges
#Requires -RunAsAdministrator

# Set error action preference
$ErrorActionPreference = "Stop"

# Application details
$AppName = "MoodBooMs"
$AppPath = "$env:ProgramFiles\$AppName"
$AppExecutable = "$AppPath\$AppName.exe"
$AppDataPath = "$env:APPDATA\$AppName"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host "===================================" -ForegroundColor Green
Write-Host "  MoodBooMs Installation Script    " -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Function to check if running on Windows
function Test-Windows {
    if ($env:OS -ne "Windows_NT") {
        Write-Host "Error: This script is for Windows only" -ForegroundColor Red
        exit 1
    }
}

# Function to check if app is installed
function Test-Installation {
    Write-Host "Verifying installation..." -ForegroundColor Yellow
    
    if (Test-Path $AppExecutable) {
        Write-Host "✓ MoodBooMs found at: $AppPath" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ MoodBooMs not found at expected location" -ForegroundColor Red
        Write-Host "  Expected: $AppExecutable" -ForegroundColor Yellow
        return $false
    }
}

# Function to create application directories
function New-AppDirectories {
    Write-Host "Creating application directories..." -ForegroundColor Yellow
    
    # Create AppData directory
    if (!(Test-Path $AppDataPath)) {
        New-Item -ItemType Directory -Path $AppDataPath -Force | Out-Null
        Write-Host "✓ Created AppData directory" -ForegroundColor Green
    }
    
    # Create logs directory
    $LogsPath = "$AppDataPath\logs"
    if (!(Test-Path $LogsPath)) {
        New-Item -ItemType Directory -Path $LogsPath -Force | Out-Null
        Write-Host "✓ Created logs directory" -ForegroundColor Green
    }
}

# Function to add to Windows startup
function Add-ToStartup {
    $response = Read-Host "Would you like MoodBooMs to start automatically with Windows? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        $StartupPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
        $ShortcutPath = "$StartupPath\$AppName.lnk"
        
        # Create shortcut
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
        $Shortcut.TargetPath = $AppExecutable
        $Shortcut.WorkingDirectory = $AppPath
        $Shortcut.IconLocation = "$AppExecutable,0"
        $Shortcut.Description = "MoodBooMs - Fertility Tracking Menu Bar App"
        $Shortcut.Save()
        
        Write-Host "✓ Added to Windows startup" -ForegroundColor Green
    }
}

# Function to add firewall exception
function Add-FirewallException {
    Write-Host "Adding Windows Firewall exception..." -ForegroundColor Yellow
    
    try {
        # Check if rule already exists
        $existingRule = Get-NetFirewallRule -DisplayName "$AppName" -ErrorAction SilentlyContinue
        
        if ($existingRule) {
            Write-Host "✓ Firewall rule already exists" -ForegroundColor Green
        } else {
            # Add firewall rule
            New-NetFirewallRule -DisplayName "$AppName" `
                -Direction Inbound `
                -Program $AppExecutable `
                -Action Allow `
                -Profile Domain, Private, Public | Out-Null
            
            Write-Host "✓ Added firewall exception" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Could not add firewall exception (may require manual configuration)" -ForegroundColor Yellow
    }
}

# Function to create desktop shortcut
function New-DesktopShortcut {
    $response = Read-Host "Would you like to create a desktop shortcut? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        $DesktopPath = [Environment]::GetFolderPath("Desktop")
        $ShortcutPath = "$DesktopPath\$AppName.lnk"
        
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
        $Shortcut.TargetPath = $AppExecutable
        $Shortcut.WorkingDirectory = $AppPath
        $Shortcut.IconLocation = "$AppExecutable,0"
        $Shortcut.Description = "MoodBooMs - Fertility Tracking Menu Bar App"
        $Shortcut.Save()
        
        Write-Host "✓ Created desktop shortcut" -ForegroundColor Green
    }
}

# Function to migrate old data
function Move-OldData {
    Write-Host "Checking for existing data..." -ForegroundColor Yellow
    
    # Check for old electron-store location
    $OldConfigPath = "$env:APPDATA\moodbooms\config.json"
    $NewConfigPath = "$AppDataPath\config.json"
    
    if ((Test-Path $OldConfigPath) -and !(Test-Path $NewConfigPath)) {
        Write-Host "Found old configuration, migrating..." -ForegroundColor Yellow
        Copy-Item -Path $OldConfigPath -Destination $NewConfigPath
        Write-Host "✓ Data migrated successfully" -ForegroundColor Green
    }
}

# Function to set file associations
function Set-FileAssociations {
    Write-Host "Setting file associations..." -ForegroundColor Yellow
    
    try {
        # Associate .mbm files with MoodBooMs
        $ProgId = "$AppName.DataFile"
        
        # Create ProgId in registry
        New-Item -Path "HKCU:\Software\Classes\$ProgId" -Force | Out-Null
        Set-ItemProperty -Path "HKCU:\Software\Classes\$ProgId" -Name "(Default)" -Value "MoodBooMs Data File"
        
        New-Item -Path "HKCU:\Software\Classes\$ProgId\DefaultIcon" -Force | Out-Null
        Set-ItemProperty -Path "HKCU:\Software\Classes\$ProgId\DefaultIcon" -Name "(Default)" -Value "$AppExecutable,0"
        
        New-Item -Path "HKCU:\Software\Classes\$ProgId\shell\open\command" -Force | Out-Null
        Set-ItemProperty -Path "HKCU:\Software\Classes\$ProgId\shell\open\command" -Name "(Default)" -Value "`"$AppExecutable`" `"%1`""
        
        # Associate .mbm extension
        New-Item -Path "HKCU:\Software\Classes\.mbm" -Force | Out-Null
        Set-ItemProperty -Path "HKCU:\Software\Classes\.mbm" -Name "(Default)" -Value $ProgId
        
        Write-Host "✓ File associations configured" -ForegroundColor Green
    } catch {
        Write-Host "  Could not set file associations" -ForegroundColor Yellow
    }
}

# Function to launch the application
function Start-App {
    $response = Read-Host "Would you like to launch MoodBooMs now? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Start-Process $AppExecutable
        Write-Host "✓ MoodBooMs launched" -ForegroundColor Green
    }
}

# Main installation flow
function Main {
    Test-Windows
    
    Write-Host "Starting installation process..." -ForegroundColor Yellow
    Write-Host ""
    
    # Verify installation
    if (!(Test-Installation)) {
        Write-Host ""
        Write-Host "Installation Instructions:" -ForegroundColor Yellow
        Write-Host "1. Run the MoodBooMs installer"
        Write-Host "2. Follow the installation wizard"
        Write-Host "3. Run this script again after installation"
        exit 1
    }
    
    Write-Host ""
    
    # Perform installation tasks
    New-AppDirectories
    Move-OldData
    Add-FirewallException
    Set-FileAssociations
    
    Write-Host ""
    
    # Optional tasks
    New-DesktopShortcut
    Add-ToStartup
    
    Write-Host ""
    
    # Success message
    Write-Host "===================================" -ForegroundColor Green
    Write-Host "  Installation Complete! 🎉       " -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "MoodBooMs is ready to use!"
    Write-Host "You can find it in your Start Menu"
    Write-Host ""
    
    # Launch app
    Start-App
}

# Run main function
Main