#!/bin/bash

# MoodBooMs macOS Uninstallation Script
# This script cleanly removes MoodBooMs and associated files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Application details
APP_NAME="MoodBooMs"
BUNDLE_ID="com.moodbooms.app"
APP_PATH="/Applications/${APP_NAME}.app"

echo -e "${RED}===================================${NC}"
echo -e "${RED}  MoodBooMs Uninstallation Script ${NC}"
echo -e "${RED}===================================${NC}"
echo ""

# Function to check if running on macOS
check_macos() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}Error: This script is for macOS only${NC}"
        exit 1
    fi
}

# Function to quit the app if running
quit_app() {
    echo -e "${YELLOW}Checking if MoodBooMs is running...${NC}"
    
    if pgrep -x "MoodBooMs" > /dev/null; then
        echo -e "${YELLOW}MoodBooMs is running, quitting...${NC}"
        osascript -e 'quit app "MoodBooMs"' 2>/dev/null || killall "MoodBooMs" 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}✓ MoodBooMs quit${NC}"
    else
        echo -e "${GREEN}✓ MoodBooMs is not running${NC}"
    fi
}

# Function to remove from login items
remove_from_login_items() {
    echo -e "${YELLOW}Removing from login items...${NC}"
    
    osascript <<EOF 2>/dev/null || true
tell application "System Events"
    delete login item "${APP_NAME}"
end tell
EOF
    echo -e "${GREEN}✓ Removed from login items${NC}"
}

# Function to backup user data
backup_user_data() {
    echo ""
    read -p "Would you like to backup your data before uninstalling? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BACKUP_DIR="$HOME/Desktop/MoodBooMs_Backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup electron-store data
        CONFIG_DIR="$HOME/Library/Application Support/${APP_NAME}"
        if [[ -d "$CONFIG_DIR" ]]; then
            cp -R "$CONFIG_DIR" "$BACKUP_DIR/"
            echo -e "${GREEN}✓ Data backed up to: $BACKUP_DIR${NC}"
        fi
        
        # Backup old location data if exists
        OLD_CONFIG_DIR="$HOME/Library/Application Support/moodbooms"
        if [[ -d "$OLD_CONFIG_DIR" ]]; then
            cp -R "$OLD_CONFIG_DIR" "$BACKUP_DIR/"
        fi
        
        return 0
    fi
    return 1
}

# Function to remove application files
remove_app_files() {
    echo -e "${YELLOW}Removing application files...${NC}"
    
    # Remove main application
    if [[ -e "$APP_PATH" ]]; then
        rm -rf "$APP_PATH"
        echo -e "${GREEN}✓ Removed application bundle${NC}"
    else
        echo -e "${YELLOW}  Application not found at $APP_PATH${NC}"
    fi
}

# Function to remove support files
remove_support_files() {
    local KEEP_DATA=$1
    
    if [[ "$KEEP_DATA" == "false" ]]; then
        echo -e "${YELLOW}Removing application support files...${NC}"
        
        # Remove Application Support directory
        APP_SUPPORT="$HOME/Library/Application Support/${APP_NAME}"
        if [[ -d "$APP_SUPPORT" ]]; then
            rm -rf "$APP_SUPPORT"
            echo -e "${GREEN}✓ Removed application support files${NC}"
        fi
        
        # Remove old location if exists
        OLD_APP_SUPPORT="$HOME/Library/Application Support/moodbooms"
        if [[ -d "$OLD_APP_SUPPORT" ]]; then
            rm -rf "$OLD_APP_SUPPORT"
            echo -e "${GREEN}✓ Removed old application support files${NC}"
        fi
        
        # Remove preferences
        PREFS="$HOME/Library/Preferences/${BUNDLE_ID}.plist"
        if [[ -f "$PREFS" ]]; then
            rm -f "$PREFS"
            echo -e "${GREEN}✓ Removed preferences${NC}"
        fi
        
        # Remove cache
        CACHE_DIR="$HOME/Library/Caches/${BUNDLE_ID}"
        if [[ -d "$CACHE_DIR" ]]; then
            rm -rf "$CACHE_DIR"
            echo -e "${GREEN}✓ Removed cache files${NC}"
        fi
        
        # Remove logs
        LOG_DIR="$HOME/Library/Logs/${APP_NAME}"
        if [[ -d "$LOG_DIR" ]]; then
            rm -rf "$LOG_DIR"
            echo -e "${GREEN}✓ Removed log files${NC}"
        fi
    else
        echo -e "${YELLOW}Keeping user data (as requested)${NC}"
    fi
}

# Function to remove Electron-specific files
remove_electron_files() {
    echo -e "${YELLOW}Removing Electron cache files...${NC}"
    
    # Remove Electron cache
    ELECTRON_CACHE="$HOME/Library/Caches/electron"
    if [[ -d "$ELECTRON_CACHE" ]]; then
        # Only remove if no other Electron apps are installed
        if ! ls /Applications/*.app/Contents/Frameworks/Electron\ Framework.framework 2>/dev/null | grep -v "$APP_NAME" > /dev/null; then
            rm -rf "$ELECTRON_CACHE"
            echo -e "${GREEN}✓ Removed Electron cache${NC}"
        fi
    fi
}

# Function to verify uninstallation
verify_uninstallation() {
    echo -e "${YELLOW}Verifying uninstallation...${NC}"
    
    local FAILED=0
    
    # Check if app is removed
    if [[ -e "$APP_PATH" ]]; then
        echo -e "${RED}✗ Application still exists${NC}"
        FAILED=1
    fi
    
    # Check if process is running
    if pgrep -x "MoodBooMs" > /dev/null; then
        echo -e "${RED}✗ MoodBooMs is still running${NC}"
        FAILED=1
    fi
    
    if [[ $FAILED -eq 0 ]]; then
        echo -e "${GREEN}✓ Uninstallation verified${NC}"
        return 0
    else
        return 1
    fi
}

# Main uninstallation flow
main() {
    check_macos
    
    echo -e "${YELLOW}This will uninstall MoodBooMs from your system.${NC}"
    echo ""
    read -p "Are you sure you want to continue? (y/n) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Uninstallation cancelled${NC}"
        exit 0
    fi
    
    echo ""
    echo -e "${YELLOW}Starting uninstallation process...${NC}"
    echo ""
    
    # Quit app if running
    quit_app
    
    # Remove from login items
    remove_from_login_items
    
    # Backup data (optional)
    BACKED_UP=false
    if backup_user_data; then
        BACKED_UP=true
    fi
    
    echo ""
    
    # Ask about keeping data
    KEEP_DATA=false
    if [[ "$BACKED_UP" == "false" ]]; then
        read -p "Would you like to keep your settings and data? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            KEEP_DATA=true
        fi
    fi
    
    echo ""
    
    # Remove files
    remove_app_files
    remove_support_files "$KEEP_DATA"
    remove_electron_files
    
    echo ""
    
    # Verify uninstallation
    if verify_uninstallation; then
        echo ""
        echo -e "${GREEN}====================================${NC}"
        echo -e "${GREEN}  Uninstallation Complete! ${NC}"
        echo -e "${GREEN}====================================${NC}"
        echo ""
        echo "MoodBooMs has been removed from your system."
        if [[ "$BACKED_UP" == "true" ]]; then
            echo "Your data has been backed up to your Desktop."
        fi
        if [[ "$KEEP_DATA" == "true" ]]; then
            echo "Your settings and data have been preserved."
            echo "They will be restored if you reinstall MoodBooMs."
        fi
    else
        echo ""
        echo -e "${RED}Uninstallation may be incomplete.${NC}"
        echo -e "${YELLOW}Please check the error messages above.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"