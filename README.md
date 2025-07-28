# MoodBooMs - Fertility Tracking Menu Bar App

<p align="center">
  <img src="docs/screenshots/hero-image.png" alt="MoodBooMs App Screenshot" width="600">
  <br>
  <em>Your cycle, your rules, your sense of humor</em>
</p>

<p align="center">
  <img src="docs/screenshots/queen-mode.gif" alt="Queen Mode Demo" width="300">
  <img src="docs/screenshots/king-mode.gif" alt="King Mode Demo" width="300">
</p>

## Overview
MoodBooMs is a discreet, humorous fertility tracking application that lives in your menu bar. It provides at-a-glance cycle information with a calendar view, mood messages, and personalized insights. Features two distinct modes: Queen (female perspective) and King (partner warning system).

## Features
- 🎯 **Dynamic Menu Bar Icon** - Weather-themed icons that change based on cycle phase (✅ Implemented)
- 📅 **Interactive Calendar View** - Month view with color-coded fertility days (✅ Implemented)
- 📊 **Cycle History & Statistics** - Track patterns, averages, and predictions (✅ Implemented)
- 🌡️ **Fertility Tracking** - Accurate phase detection with percentage calculations (✅ Implemented)
- 💬 **Smart Status Messages** - Humorous phrases for your current phase (✅ Implemented)
- 💾 **Data Persistence** - Your data saves automatically between sessions (✅ Implemented)
- 🔄 **Period Adjustment** - Mark new period start for irregular cycles (✅ Implemented)
- 🔔 **Optional Notifications** - Customizable reminders and alerts (Planned)

### Queen/King Mode System
MoodBooMs features two distinct experience modes:

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
- Queen/King mode system
- Cycle history and statistics
- Period adjustment for irregular cycles

🚧 **In Development:**
- Enhanced Queen/King mode architecture
- Additional customization options
- Cross-platform support

**Issues:**
- #16 Create settings panel UI
- #17 Add cycle length customization
- #18 Implement notification preferences
- #19 Add data export/import functionality
- #20 Create onboarding flow for new users

### Epic 5: Production Build & Distribution
Package app for distribution with auto-updates

**Issues:**
- #21 Configure electron-builder for all platforms
- #22 Implement auto-updater functionality
- #23 Create code signing setup
- #24 Add error tracking and analytics
- #25 Create distribution pipeline

### Epic 6: Testing & Quality Assurance
Comprehensive testing coverage

**Issues:**
- #26 Write unit tests for cycle calculations
- #27 Create component tests for UI elements
- #28 Add E2E tests for critical flows
- #29 Implement performance monitoring
- #30 Create user acceptance test scenarios

### Epic 7: Cross-Platform Packaging & Distribution
Make the application packable and transferable to any Mac, with eventual Windows support

**Issues:**
- #38 Configure electron-builder for macOS DMG/ZIP distribution
- #39 Implement universal binary support (Intel + Apple Silicon)
- #40 Create auto-update mechanism for macOS
- #41 Add Windows build configuration and testing
- #42 Implement Windows-specific tray icon handling
- #44 Create portable versions (no install required)
- #45 Set up CI/CD for multi-platform builds
- #46 Implement license verification system
- #47 Create installation/uninstallation scripts
- #48 Add crash reporting and telemetry

**Key Requirements:**
- Application must be fully self-contained
- No dependencies on local development environment
- Support for macOS 10.15+ and Windows 10+
- Code signing for both platforms
- Auto-update capability
- Proper icon support for both platforms


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
