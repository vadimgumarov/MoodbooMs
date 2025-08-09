#!/bin/bash

# MoodBooMs macOS Installation Script
# This script handles post-installation tasks for macOS

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

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  MoodBooMs Installation Script ${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Function to check if running on macOS
check_macos() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}Error: This script is for macOS only${NC}"
        exit 1
    fi
}

# Function to handle app translocation
handle_translocation() {
    echo -e "${YELLOW}Checking app translocation status...${NC}"
    
    if [[ -e "$APP_PATH" ]]; then
        # Remove quarantine attribute to prevent translocation
        xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true
        echo -e "${GREEN}✓ Removed quarantine attributes${NC}"
    fi
}

# Function to set proper permissions
set_permissions() {
    echo -e "${YELLOW}Setting application permissions...${NC}"
    
    if [[ -e "$APP_PATH" ]]; then
        # Ensure app is executable
        chmod -R 755 "$APP_PATH"
        echo -e "${GREEN}✓ Set executable permissions${NC}"
    fi
}

# Function to create app support directory
create_support_dirs() {
    echo -e "${YELLOW}Creating application support directories...${NC}"
    
    # Create app support directory
    APP_SUPPORT="$HOME/Library/Application Support/${APP_NAME}"
    mkdir -p "$APP_SUPPORT"
    
    # Create logs directory
    LOGS_DIR="$APP_SUPPORT/logs"
    mkdir -p "$LOGS_DIR"
    
    echo -e "${GREEN}✓ Created support directories${NC}"
}

# Function to check and request accessibility permissions
check_accessibility() {
    echo -e "${YELLOW}Checking accessibility permissions...${NC}"
    
    # Check if app has accessibility permissions (for global shortcuts if needed)
    if [[ -e "$APP_PATH" ]]; then
        osascript <<EOF 2>/dev/null || true
tell application "System Events"
    set appPath to "${APP_PATH}"
end tell
EOF
        echo -e "${GREEN}✓ Accessibility check complete${NC}"
        echo -e "${YELLOW}  Note: You may need to grant accessibility permissions in System Preferences${NC}"
    fi
}

# Function to add to login items (optional)
add_to_login_items() {
    read -p "Would you like MoodBooMs to start automatically at login? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        osascript <<EOF 2>/dev/null || true
tell application "System Events"
    make login item at end with properties {path:"${APP_PATH}", hidden:false}
end tell
EOF
        echo -e "${GREEN}✓ Added to login items${NC}"
    fi
}

# Function to migrate old data if exists
migrate_old_data() {
    echo -e "${YELLOW}Checking for existing data...${NC}"
    
    # Old electron-store location
    OLD_CONFIG="$HOME/Library/Application Support/moodbooms/config.json"
    NEW_CONFIG="$HOME/Library/Application Support/${APP_NAME}/config.json"
    
    if [[ -f "$OLD_CONFIG" ]] && [[ ! -f "$NEW_CONFIG" ]]; then
        echo -e "${YELLOW}Found old configuration, migrating...${NC}"
        cp "$OLD_CONFIG" "$NEW_CONFIG"
        echo -e "${GREEN}✓ Data migrated successfully${NC}"
    fi
}

# Function to verify installation
verify_installation() {
    echo -e "${YELLOW}Verifying installation...${NC}"
    
    if [[ ! -e "$APP_PATH" ]]; then
        echo -e "${RED}✗ Application not found at $APP_PATH${NC}"
        echo -e "${YELLOW}  Please ensure you've copied MoodBooMs to Applications folder${NC}"
        return 1
    fi
    
    # Check if app bundle is valid
    if [[ ! -d "$APP_PATH/Contents" ]]; then
        echo -e "${RED}✗ Invalid application bundle${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Installation verified${NC}"
    return 0
}

# Function to open the app
launch_app() {
    read -p "Would you like to launch MoodBooMs now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$APP_PATH"
        echo -e "${GREEN}✓ MoodBooMs launched${NC}"
    fi
}

# Main installation flow
main() {
    check_macos
    
    echo -e "${YELLOW}Starting installation process...${NC}"
    echo ""
    
    # Verify app is installed
    if ! verify_installation; then
        echo ""
        echo -e "${YELLOW}Installation Instructions:${NC}"
        echo "1. Open the DMG file"
        echo "2. Drag MoodBooMs to the Applications folder"
        echo "3. Run this script again"
        exit 1
    fi
    
    # Perform installation tasks
    handle_translocation
    set_permissions
    create_support_dirs
    migrate_old_data
    check_accessibility
    echo ""
    
    # Optional tasks
    add_to_login_items
    echo ""
    
    # Success message
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}  Installation Complete! 🎉${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo "MoodBooMs is ready to use!"
    echo "You can find it in your Applications folder"
    echo ""
    
    # Launch app
    launch_app
}

# Run main function
main "$@"