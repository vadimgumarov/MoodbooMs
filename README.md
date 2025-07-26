# MoodBooMs - Fertility Tracking Menu Bar App

## Overview
MoodBooMs is a discreet, professional fertility tracking application that lives in your menu bar. It provides at-a-glance cycle information with a calendar view, safety indicators, and personalized insights.

## Features
- 🎯 **Dynamic Menu Bar Icon** - Changes color based on your current cycle phase
- 📅 **Calendar View** - Month view with color-coded fertility days
- 🌡️ **Safety Scale** - Visual indicator showing current fertility level
- 💬 **Smart Status Messages** - Contextual phrases for your current phase
- 💾 **Data Persistence** - Your data saves automatically between sessions
- 🔔 **Optional Notifications** - Customizable reminders and alerts

## Project Redesign Plan

### Overview
Transform MoodBooMs into a professional fertility tracking menubar app with dynamic icons, calendar view, and safety indicators.

### Architecture Decision
**Approach**: Refactor existing codebase with significant enhancements
- Keep: Electron + React foundation, Tailwind CSS
- Add: Calendar component, data persistence, security improvements
- Replace: Static icon with dynamic icons, basic UI with rich calendar interface

### Visual Design Specifications

#### Menu Bar Icon States
- **Safe Days** (Green): Simple circle or leaf icon
- **Caution Days** (Yellow/Orange): Circle with dot or warning symbol  
- **Danger Days** (Red): Circle with X or alert symbol
- **Period Days** (Dark Red): Drop or filled circle

#### Window Layout (320x500px)
1. **Header** (50px) - App name and settings icon
2. **Calendar Section** (250px) - Month view with color-coded days
3. **Status Section** (100px) - Safety scale bar with current position
4. **Info Section** (100px) - Status message and predictions

### Technical Stack
- **Electron** 28.x with security best practices
- **React** 18.x with hooks
- **Tailwind CSS** for styling
- **date-fns** for date calculations
- **electron-store** for data persistence
- **react-calendar** or custom calendar component

## Development Roadmap

### Epic 1: Core Infrastructure & Security
Establish secure Electron architecture and data persistence

**Issues:**
- #1 Implement secure Electron preload script with contextBridge
- #2 Set up electron-store for data persistence
- #3 Create IPC communication layer for main/renderer
- #4 Add Content Security Policy (CSP)
- #5 Remove nodeIntegration and enable contextIsolation

### Epic 2: Calendar & Date Calculations  
Implement calendar view with fertility tracking logic

**Issues:**
- #6 Create cycle calculation utility module
- #7 Implement calendar component with color coding
- #8 Add date selection and navigation
- #9 Create fertility phase detection logic
- #10 Add cycle history tracking

### Epic 3: Dynamic UI & Tray Icons
Create responsive UI with dynamic menubar icons

**Issues:**
- #11 Design and create tray icon set for all phases
- #12 Implement dynamic tray icon switching
- #13 Create safety scale component
- #14 Add status card with phase information
- #15 Implement smooth transitions and animations

### Epic 4: User Settings & Preferences
Add customization options and data management

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

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up secure Electron architecture
- Implement data persistence
- Create basic calendar component

### Phase 2: Core Features (Week 2)
- Implement cycle calculations
- Add safety scale visualization
- Create dynamic tray icons

### Phase 3: Polish & UX (Week 3)
- Enhance UI/UX
- Add animations and transitions
- Implement notifications

### Phase 4: Production (Week 4)
- Create build pipeline
- Add auto-updater
- Test on multiple platforms

## Success Criteria
- [ ] Secure Electron implementation (no nodeIntegration)
- [ ] Calendar shows color-coded fertility days
- [ ] Tray icon changes based on cycle phase
- [ ] Data persists between app restarts
- [ ] Smooth animations and professional UI
- [ ] Cross-platform compatibility (macOS, Windows, Linux)
- [ ] Test coverage > 80%
- [ ] Production-ready build with auto-updates

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
npm run electron-pack
```

## Contributing
Please read our contributing guidelines before submitting PRs.

## License
MIT License - see LICENSE file for details
