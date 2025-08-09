# MoodBooMs Windows Uninstallation Script
# This script cleanly removes MoodBooMs and associated files

# Require Administrator privileges
#Requires -RunAsAdministrator

# Set error action preference
$ErrorActionPreference = "Stop"

# Application details
$AppName = "MoodBooMs"
$AppPath = "$env:ProgramFiles\$AppName"
$AppExecutable = "$AppPath\$AppName.exe"
$AppDataPath = "$env:APPDATA\$AppName"
$UninstallerPath = "$AppPath\Uninstall $AppName.exe"

Write-Host "=====================================" -ForegroundColor Red
Write-Host "  MoodBooMs Uninstallation Script   " -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red
Write-Host ""

# Function to check if running on Windows
function Test-Windows {
    if ($env:OS -ne "Windows_NT") {
        Write-Host "Error: This script is for Windows only" -ForegroundColor Red
        exit 1
    }
}

# Function to stop the application
function Stop-App {
    Write-Host "Checking if MoodBooMs is running..." -ForegroundColor Yellow
    
    $process = Get-Process -Name $AppName -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "MoodBooMs is running, stopping..." -ForegroundColor Yellow
        Stop-Process -Name $AppName -Force
        Start-Sleep -Seconds 2
        Write-Host "✓ MoodBooMs stopped" -ForegroundColor Green
    } else {
        Write-Host "✓ MoodBooMs is not running" -ForegroundColor Green
    }
}

# Function to remove from startup
function Remove-FromStartup {
    Write-Host "Removing from Windows startup..." -ForegroundColor Yellow
    
    $StartupPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
    $ShortcutPath = "$StartupPath\$AppName.lnk"
    
    if (Test-Path $ShortcutPath) {
        Remove-Item -Path $ShortcutPath -Force
        Write-Host "✓ Removed from startup" -ForegroundColor Green
    } else {
        Write-Host "✓ Not in startup" -ForegroundColor Green
    }
}

# Function to backup user data
function Backup-UserData {
    Write-Host ""
    $response = Read-Host "Would you like to backup your data before uninstalling? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        $BackupDir = "$env:USERPROFILE\Desktop\MoodBooMs_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        
        # Backup AppData
        if (Test-Path $AppDataPath) {
            Copy-Item -Path $AppDataPath -Destination $BackupDir -Recurse
            Write-Host "✓ Data backed up to: $BackupDir" -ForegroundColor Green
        }
        
        return $true
    }
    return $false
}

# Function to remove firewall exception
function Remove-FirewallException {
    Write-Host "Removing Windows Firewall exception..." -ForegroundColor Yellow
    
    try {
        Remove-NetFirewallRule -DisplayName "$AppName" -ErrorAction SilentlyContinue
        Write-Host "✓ Removed firewall exception" -ForegroundColor Green
    } catch {
        Write-Host "  No firewall exception found" -ForegroundColor Yellow
    }
}

# Function to remove shortcuts
function Remove-Shortcuts {
    Write-Host "Removing shortcuts..." -ForegroundColor Yellow
    
    # Remove desktop shortcut
    $DesktopPath = [Environment]::GetFolderPath("Desktop")
    $DesktopShortcut = "$DesktopPath\$AppName.lnk"
    
    if (Test-Path $DesktopShortcut) {
        Remove-Item -Path $DesktopShortcut -Force
        Write-Host "✓ Removed desktop shortcut" -ForegroundColor Green
    }
    
    # Remove Start Menu shortcuts
    $StartMenuPaths = @(
        "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\$AppName",
        "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\$AppName"
    )
    
    foreach ($path in $StartMenuPaths) {
        if (Test-Path $path) {
            Remove-Item -Path $path -Recurse -Force
            Write-Host "✓ Removed Start Menu shortcuts" -ForegroundColor Green
        }
    }
}

# Function to remove registry entries
function Remove-RegistryEntries {
    Write-Host "Removing registry entries..." -ForegroundColor Yellow
    
    try {
        # Remove file association
        Remove-Item -Path "HKCU:\Software\Classes\$AppName.DataFile" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "HKCU:\Software\Classes\.mbm" -Force -ErrorAction SilentlyContinue
        
        # Remove uninstall entry
        $UninstallPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\$AppName"
        if (Test-Path $UninstallPath) {
            Remove-Item -Path $UninstallPath -Recurse -Force
        }
        
        # Remove from 64-bit registry if exists
        $UninstallPath64 = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\$AppName"
        if (Test-Path $UninstallPath64) {
            Remove-Item -Path $UninstallPath64 -Recurse -Force
        }
        
        Write-Host "✓ Removed registry entries" -ForegroundColor Green
    } catch {
        Write-Host "  Some registry entries could not be removed" -ForegroundColor Yellow
    }
}

# Function to remove application files
function Remove-AppFiles {
    Write-Host "Removing application files..." -ForegroundColor Yellow
    
    # Check if uninstaller exists and run it
    if (Test-Path $UninstallerPath) {
        Write-Host "Running built-in uninstaller..." -ForegroundColor Yellow
        Start-Process -FilePath $UninstallerPath -ArgumentList "/S" -Wait
        Write-Host "✓ Built-in uninstaller completed" -ForegroundColor Green
    } elseif (Test-Path $AppPath) {
        # Manual removal if no uninstaller
        Remove-Item -Path $AppPath -Recurse -Force
        Write-Host "✓ Removed application files" -ForegroundColor Green
    } else {
        Write-Host "  Application files not found" -ForegroundColor Yellow
    }
}

# Function to remove user data
function Remove-UserData {
    param([bool]$KeepData)
    
    if (!$KeepData) {
        Write-Host "Removing user data..." -ForegroundColor Yellow
        
        # Remove AppData
        if (Test-Path $AppDataPath) {
            Remove-Item -Path $AppDataPath -Recurse -Force
            Write-Host "✓ Removed user data" -ForegroundColor Green
        }
        
        # Remove old location if exists
        $OldDataPath = "$env:APPDATA\moodbooms"
        if (Test-Path $OldDataPath) {
            Remove-Item -Path $OldDataPath -Recurse -Force
            Write-Host "✓ Removed old data location" -ForegroundColor Green
        }
        
        # Remove Local AppData
        $LocalAppData = "$env:LOCALAPPDATA\$AppName"
        if (Test-Path $LocalAppData) {
            Remove-Item -Path $LocalAppData -Recurse -Force
            Write-Host "✓ Removed local data" -ForegroundColor Green
        }
    } else {
        Write-Host "Keeping user data (as requested)" -ForegroundColor Yellow
    }
}

# Function to verify uninstallation
function Test-Uninstallation {
    Write-Host "Verifying uninstallation..." -ForegroundColor Yellow
    
    $Failed = $false
    
    # Check if app directory exists
    if (Test-Path $AppPath) {
        Write-Host "✗ Application directory still exists" -ForegroundColor Red
        $Failed = $true
    }
    
    # Check if process is running
    $process = Get-Process -Name $AppName -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "✗ MoodBooMs is still running" -ForegroundColor Red
        $Failed = $true
    }
    
    if (!$Failed) {
        Write-Host "✓ Uninstallation verified" -ForegroundColor Green
        return $true
    } else {
        return $false
    }
}

# Main uninstallation flow
function Main {
    Test-Windows
    
    Write-Host "This will uninstall MoodBooMs from your system." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Are you sure you want to continue? (y/n)"
    
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Uninstallation cancelled" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "Starting uninstallation process..." -ForegroundColor Yellow
    Write-Host ""
    
    # Stop application
    Stop-App
    
    # Remove from startup
    Remove-FromStartup
    
    # Backup data (optional)
    $BackedUp = Backup-UserData
    
    Write-Host ""
    
    # Ask about keeping data
    $KeepData = $false
    if (!$BackedUp) {
        $response = Read-Host "Would you like to keep your settings and data? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            $KeepData = $true
        }
    }
    
    Write-Host ""
    
    # Remove components
    Remove-FirewallException
    Remove-Shortcuts
    Remove-RegistryEntries
    Remove-AppFiles
    Remove-UserData -KeepData $KeepData
    
    Write-Host ""
    
    # Verify uninstallation
    if (Test-Uninstallation) {
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host "  Uninstallation Complete!          " -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "MoodBooMs has been removed from your system."
        
        if ($BackedUp) {
            Write-Host "Your data has been backed up to your Desktop."
        }
        if ($KeepData) {
            Write-Host "Your settings and data have been preserved."
            Write-Host "They will be restored if you reinstall MoodBooMs."
        }
    } else {
        Write-Host ""
        Write-Host "Uninstallation may be incomplete." -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Yellow
        exit 1
    }
}

# Run main function
Main