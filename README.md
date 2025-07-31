# MoodbooM - Fertility Tracking Menu Bar App

<p align="center">
  <img src="docs/screenshots/hero-image.png" alt="MoodbooM App Screenshot" width="600">
  <br>
  <em>Your cycle, your rules, your sense of humor</em>
</p>

<p align="center">
  <img src="docs/screenshots/queen-mode.gif" alt="Queen Mode Demo" width="300">
  <img src="docs/screenshots/king-mode.gif" alt="King Mode Demo" width="300">
</p>

## Overview
MoodbooM is a discreet, humorous fertility tracking application that lives in your menu bar. It provides at-a-glance cycle information with a calendar view, mood messages, and personalized insights. Features two distinct modes: Queen (female perspective) and King (partner warning system).

## For End Users

### Download & Install
Currently in development. Distribution packages coming soon via Epic #43.

### How to Use MoodbooM
1. **First Launch**: Enter your last period start date and average cycle length
2. **Daily Use**: Click the menubar icon to see your current phase and mood
3. **Switch Modes**: Toggle between Queen/King modes using the switch in the app
4. **Track History**: View your cycle patterns in the History tab
5. **Adjust Period**: If your period arrives early/late, use "My period started today" button

### What You'll See
- **Menubar Icon**: Changes based on your cycle phase (sun, cloud, storm, etc.)
- **Main Window**: Shows current day, phase, mood message, and food cravings
- **Calendar Tab**: Visual overview of your cycle with fertility indicators
- **History Tab**: Past cycles, statistics, and predictions

### Privacy & Data
- All data stored locally on your computer
- No internet connection required
- Data location: `~/Library/Application Support/moodbooms/`
- Export/import functionality planned (Issue #57)

## Features
- 🎯 **Dynamic Menu Bar Icon** - Weather-themed icons that change based on cycle phase (✅ Implemented)
- 📅 **Interactive Calendar View** - Month view with color-coded fertility days (✅ Implemented)
- 📊 **Cycle History & Statistics** - Track patterns, averages, and predictions (✅ Implemented)
- 🌡️ **Fertility Tracking** - Accurate phase detection with percentage calculations (✅ Implemented)
- 💬 **Smart Status Messages** - Humorous phrases for your current phase (✅ Implemented)
- 💾 **Data Persistence** - Your data saves automatically between sessions (✅ Implemented)
- 🔄 **Period Adjustment** - Mark new period start for irregular cycles (✅ Implemented)
- ♿ **Accessibility** - Full keyboard navigation, screen reader support, high contrast mode (✅ Implemented)
- 🔔 **Optional Notifications** - Customizable reminders and alerts (Planned)

### Queen/King Mode System
MoodbooM features two distinct experience modes:

**Queen Mode** (Female First-Person):
- "I'm dealing with this sh*t" perspective
- Direct, personal mood messages
- Self-focused cravings and needs

**King Mode** (Partner Warning System):
- "She's in this state" perspective  
- Warning messages for partners
- Guidance on how to support

### Dynamic Weather Icons
The menubar icon changes to reflect your cycle phase:
- ☀️ **Sun** - "Finally Got My Sh*t Together" / "Safe Zone Active"
- 🌤️ **Partly Cloudy** - "Horny AF" / "High Energy Warning"
- ☁️ **Cloudy** - "Getting Real Tired of This BS" / "Patience Level: Low"
- 🌧️ **Rainy** - "Pre-Chaos Mood Swings" / "Volatility Alert"
- ⛈️ **Thunderstorm** - "Bloody Hell Week" / "Code Red Alert"
- 🌪️ **Tornado** - "Apocalypse Countdown" / "DEFCON 1"


## Current Status

✅ **Completed Features:**
- Secure architecture with data persistence
- Interactive calendar with fertility tracking
- Dynamic menubar icons that change with cycle phase
- Queen/King mode system with 360+ unique messages per mode
- Cycle history and statistics with predictions
- Period adjustment for irregular cycles
- Theme system with mode-specific styling

🚧 **Active Development:**
- **Epic #79**: Modern UI Design & Visual Polish (HIGH PRIORITY)
- **Epic #53**: Application Modularity & User Customization (MEDIUM)
- **Epic #52**: Enhanced Navigation & Date Selection (LOW)
- **Epic #43**: Cross-Platform Packaging & Distribution (INFRASTRUCTURE)

📋 **Notable Issues:**
- #67 Add Quit/Turn Off functionality to the app
- #57 Add data export/import functionality
- #48 Add crash reporting and telemetry
- #47 Create installation/uninstallation scripts
- #46 Implement license verification system


## System Requirements

### For End Users
- **macOS**: 10.15 (Catalina) or higher
- **Processor**: Intel or Apple Silicon (M1/M2)
- **Memory**: 512MB RAM
- **Storage**: 100MB free space
- **Display**: Any resolution (app adapts to screen size)

### For Developers
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **OS**: macOS, Windows 10+, or Linux
- **Memory**: 2GB RAM (for development)
- **IDE**: VS Code recommended

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- macOS, Windows, or Linux

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/moodbooms.git

# Install dependencies
cd moodbooms
npm install

# Run in development mode
npm run dev
```

### Development Commands
```bash
# Run React development server
npm start

# Run Electron in development
npm run electron-dev

# Run both concurrently
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run Electron with production build
npm run electron

# Clean launch menu app (kills existing instances)
./scripts/launch-menu.sh

# Check if menu is running
npm run check
```

## Troubleshooting

### Production Build Issues

1. **Empty window in production**
   - Ensure `"homepage": "./"` is in package.json
   - Run `npm run build` before `npm run electron`

2. **GPU Process Crashes (macOS)**
   - Hardware acceleration is automatically disabled
   - If crashes persist, check logs in `logs/` directory

3. **Icons not updating**
   - Check `logs/phase-updates-*.log` for phase changes
   - Verify IPC communication in `logs/electron-*.log`

### Log Files
All logs are stored in the `logs/` directory:
- `electron-*.log` - Main process logs
- `app-*.log` - React app logs  
- `phase-updates-*.log` - Icon update logs
- `menu-*.log` - Full menu app output

## Contributing
Please read our contributing guidelines before submitting PRs.

## License
MIT License - see LICENSE file for details
