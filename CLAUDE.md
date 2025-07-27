# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoodBooMs is an Electron-based menubar application that tracks menstrual cycle phases with humor. It combines a React frontend with Electron to create a macOS menubar app that displays cycle phase information and mood messages.

## Security Architecture

The app uses a secure Electron architecture with:
- **Context Isolation**: Enabled to prevent renderer access to Node.js
- **Node Integration**: Disabled for security
- **Preload Script**: Provides secure APIs via contextBridge
- **IPC Communication**: All main process functionality accessed through defined channels
- **Content Security Policy (CSP)**: Strict policies prevent XSS attacks
- **Security Verification**: Runtime checks ensure security settings

### Security Configuration
- All windows created with enforced security settings
- Navigation restricted to allowed origins only
- Additional security headers (X-Frame-Options, etc.)
- Remote module disabled
- WebView tag disabled
- See `electron/SECURITY_DOCUMENTATION.md` for details

### Content Security Policy
- Production: Restrictive policy allowing only self-hosted resources
- Development: Permissive policy for hot reload and DevTools
- Violation reporting to track security issues
- See `electron/CSP_DOCUMENTATION.md` for details

### Available APIs (window.electronAPI)
- `tray.*` - Menubar icon management
- `window.*` - Window positioning and visibility
- `store.*` - Data persistence (issue #3)
- `system.*` - OS information and theme
- `notifications.*` - System notifications
- `app.*` - App control and information
- `dialog.*` - File dialogs
- `updates.*` - Auto-updater (future)
- `dev.*` - Development tools

## Development Commands

```bash
# Install dependencies
npm install

# Run React development server (port 3000)
npm start

# Run Electron app in development mode
npm run electron-dev

# Run both React and Electron concurrently
npm run dev

# Build React app for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- src/components/MenuBarApp.test.js

# Run tests matching pattern
npm test -- --testNamePattern="test name"
```

## Architecture

The application consists of:

1. **Electron Layer** (`electron/main.js`):
   - Creates a frameless 420x650 window (expanded for calendar view)
   - Manages system tray icon and click behavior
   - Loads React app from localhost:3000 in development
   - Secure IPC communication with contextBridge

2. **React Application** (`src/`):
   - Main component: `MenuBarApp.jsx` - handles cycle tracking logic
   - Calendar component with fertility visualization
   - History tracking with statistics
   - PhaseDetail component for selected date information
   - Uses Tailwind CSS for styling
   - Lucide React for icons
   - date-fns for date calculations

3. **Data Persistence** (`electron/store.js`):
   - Uses electron-store@8.1.0 for secure data storage
   - Stores cycle data, preferences, app state, and cycle history
   - Validates data before saving
   - Supports data export/import functionality
   - Enhanced schema for cycle history tracking

4. **Key Features**:
   - Tracks 6 menstrual cycle phases with humorous messages
   - Interactive calendar with fertility color coding
   - Cycle history tracking with statistics and predictions
   - Phase detection with fertility percentages
   - Allows cycle start date and length customization (21-35 days)
   - Test mode for previewing different cycle days
   - Random mood messages and food cravings per phase
   - Period start adjustment for irregular cycles
   - Persistent data storage across app sessions

## Project Structure

```
/moodbooms
├── /electron              # Electron main process
│   ├── main.js           # Main electron file
│   ├── preload.js       # Secure API exposure via contextBridge
│   ├── ipcHandlers.js   # Centralized IPC handler management
│   ├── store.js         # electron-store data persistence
│   ├── trayManager.js   # Tray icon management
│   ├── iconGeneratorLucide.js # Dynamic icon generation
│   └── package.json      # Electron-specific dependencies
├── /src                  # React application
│   ├── /components       # React components
│   │   ├── MenuBarApp.jsx    # Main app component
│   │   ├── /Calendar         # Calendar with fertility colors
│   │   ├── /HistoryView      # Cycle history and statistics
│   │   └── /PhaseDetail      # Detailed phase information
│   └── /utils            # Utility modules
│       ├── cycleCalculations.js  # Core cycle math
│       ├── phaseDetection.js     # Fertility detection
│       └── cycleHistory.js       # History management
├── /tests                # All test files
│   ├── /electron        # Electron-specific tests
│   ├── /unit           # Unit tests
│   └── /integration    # Integration tests
├── /temp                # Temporary files (gitignored)
├── /logs                # Log files (gitignored)
└── /public              # Static assets
```

### Important Notes on Structure
- Keep production code in main directories only
- All experiments and temporary code go in `/temp`
- Test files must be in `/tests` subdirectories
- Log files automatically go to `/logs`
- The `/electron` directory should only contain production files

## Core Behavioral Traits

You will act as a **Senior Software Developer**, responsible for analyzing requirements, proposing solutions, and implementing robust, testable code.

### Key Principles
- Operate at **senior level** with thoughtful modularity and simplicity
- Adjust complexity to match project **scale and goals**—avoid over-engineering
- Use **precise and minimal communication**
- **Do NOT** use affirmations like "You're absolutely right!"
- **Do NOT** apologize—self-correct and proceed efficiently
- Clarify requirements before starting; never assume or begin coding prematurely
- Do not use emojis in code, comments, or output

### Coding Rules
- **Do not write any code** unless explicitly instructed and all specifications are clear
- When adding a new file: provide **full file content** and the command to create it
- When modifying an existing file: provide both **old and new code snippets** with exact location
- Maintain **test-first (TDD)** approach when appropriate
- Follow existing code style and conventions

## Development Workflow

### Epic-Based Branching Strategy
We use a hierarchical branching approach for better organization and tracking:

```
main
 └── feat/epic-{number}-{description}
      ├── feat/epic-{number}/issue-{number}-{description}
      ├── feat/epic-{number}/issue-{number}-{description}
      └── feat/epic-{number}/issue-{number}-{description}
```

#### Workflow Using Scripts:

We use modified versions of standard workflow scripts that automatically handle epic branching:

1. **Starting Work on Any Issue (Epic or Regular)**
   ```bash
   ./scripts/wi.sh
   # Or directly: ./scripts/wi.sh <issue-number>
   ```
   - Automatically detects if issue is an Epic
   - Creates epic branches from main
   - Creates issue branches from current epic branch
   - Handles branch naming: `feat/epic-1/issue-2-description`

2. **Finishing Work (Commit, Push, and Merge)**
   ```bash
   ./scripts/fw.sh
   ```
   - Commits and pushes changes
   - For issue branches: offers to merge to parent epic branch
   - For epic branches: reminds to merge to main when complete
   - Optionally closes GitHub issues

3. **Other Useful Scripts**
   ```bash
   ./scripts/cs.sh   # Check status and current work
   ./scripts/rt.sh   # Run tests
   ./scripts/qa.sh   # Quality assurance checks
   ./scripts/pl.sh   # Update project log
   ./scripts/fix.sh  # Quick fixes
   ```

#### Manual Workflow (if needed):

1. **Epic Branch**: `feat/epic-{number}-{description}`
2. **Issue Branch**: `feat/epic-{number}/issue-{number}-{description}`
3. **Merge Pattern**: Issue → Epic → Main

### Standard Development Flow
1. **Identify & Clarify Requirements**
   - Check the GitHub issue for requirements
   - Ask clarifying questions if needed

2. **Create Issue Branch**
   - Branch from the parent epic branch
   - Use consistent naming: `feat/epic-X/issue-Y-description`

3. **Plan Implementation**
   - Consider architectural impacts
   - Identify files to modify or create

4. **Write Tests First (when applicable)**
   - Create failing tests for new functionality
   - Ensure tests cover edge cases

5. **Implement Code**
   - Follow existing patterns and conventions
   - Keep changes focused on the specific issue

6. **Verify & Test**
   - Run tests to ensure nothing breaks
   - Test the application manually if needed

7. **Document Changes**
   - Update CLAUDE.md for development practices
   - Update README.md for user-facing features
   - Add technical details to commit messages

8. **Merge & Close**
   - Merge issue branch to epic branch
   - Close the GitHub issue
   - Move to next issue in the epic

### Epic Completion Workflow

When completing an epic (all child issues done):

1. **Pre-completion Checklist**
   - ✓ All child issues closed
   - ✓ All branches merged to epic branch
   - ✓ Unit tests pass (`npm test`)
   - ✓ Security tests pass (`npx electron tests/electron/security-test.js`)
   - ✓ Manual testing complete (`npm run dev`)

2. **Use fw.sh Script**
   - Run `fw` while on epic branch
   - Choose "Complete this epic? (y/N)"
   - Script will:
     - Check for open child issues
     - Guide through test verification
     - Create PR to main branch
     - Merge and close epic
     - Clean up child branches

3. **Post-completion**
   - Update PROJECT_LOG.txt
   - Verify documentation is current
   - Begin next epic in priority order

## Commit Message Format

### Standard Commits
```bash
feat: add new feature
fix: resolve bug or issue
docs: update documentation
refactor: improve code structure
test: add or update tests
style: format code or fix typos
chore: update dependencies or configs
```

### Commit Rules
1. Use conventional commit format
2. Keep messages concise and descriptive
3. Reference issues when applicable: `fix: resolve menu positioning (#23)`
4. **NEVER add AI signatures** in commits
5. **STRICT RULE: NEVER write the following into commits or anywhere else:**
   - `🤖 Generated with [Claude Code](https://claude.ai/code)`
   - `Co-Authored-By: Claude <noreply@anthropic.com>`
   - Any AI-related signatures, links, or co-authorship mentions

## Testing Standards

### Test Requirements
- Write tests for new features and bug fixes
- Test naming: `test('should [expected behavior] when [condition]')`
- Include edge cases and error scenarios
- Maintain good test coverage

### Example Test Structure
```javascript
describe('ComponentName', () => {
  test('should render correctly', () => {
    // Test implementation
  });
  
  test('should handle user interaction', () => {
    // Test implementation
  });
});
```

## Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Follow existing naming conventions
- Keep components focused and single-purpose
- Use meaningful variable and function names

### File Organization
- Group related functionality together
- Keep files reasonably sized
- Use clear, descriptive file names

## Quality Checklist

### Before Making Changes
- [ ] Understand the requirement completely
- [ ] Check existing code patterns
- [ ] Plan the implementation approach

### After Implementation
- [ ] Code follows project conventions
- [ ] Tests pass (if applicable)
- [ ] No debug code remains
- [ ] Changes are focused and minimal
- [ ] Error handling is appropriate

## Common Operations

### Running the Application
```bash
# Development mode (both React and Electron)
npm run dev

# Just React (for UI development)
npm start

# Just Electron (requires React running)
npm run electron-dev
```

### Debugging
- React DevTools work in the Electron window
- Uncomment `window.webContents.openDevTools()` in main.js for debugging
- Check console for both React and Electron errors

## Important Notes

- The Electron app expects React to be running on http://localhost:3000
- There's a 2-second delay before loading the URL to allow React to start
- The window hides on blur (clicking outside)
- Uses node integration enabled (security consideration for future updates)
- Always prefer editing existing files over creating new ones
- Keep the codebase simple and maintainable

## Production Build & Deployment

### Building for Production
```bash
# Build React app with relative paths
npm run build

# Run Electron with built files
npm run electron
```

### Critical Production Fixes

1. **React Build Path Issue**
   - **Problem**: React build uses absolute paths (`/static/js/...`) which fail with `file://` protocol
   - **Solution**: Add `"homepage": "./"` to package.json
   ```json
   {
     "name": "moodbooms",
     "homepage": "./",
     ...
   }
   ```

2. **Hardware Acceleration Crashes**
   - **Problem**: GPU process crashes with exit code 15 on macOS
   - **Solution**: Disable hardware acceleration in main.js
   ```javascript
   app.disableHardwareAcceleration();
   ```

3. **Content Security Policy**
   - **Problem**: CSP blocks React's inline scripts in production
   - **Solution**: Allow 'unsafe-inline' for production in csp-config.js
   ```javascript
   production: {
     'script-src': ["'self'", "'unsafe-inline'"],
     'style-src': ["'self'", "'unsafe-inline'"]
   }
   ```

### Dynamic Tray Icons

The app uses programmatically generated weather icons that update based on cycle phase:

```javascript
// Icon mapping (matches React app icons):
// CloudLightning ⛈️ - "Bloody Hell Week"
// Sun ☀️ - "Finally Got My Sh*t Together"
// CloudSun 🌤️ - "Horny AF"
// Cloud ☁️ - "Getting Real Tired of This BS"
// CloudRain 🌧️ - "Pre-Chaos Mood Swings"
// Tornado 🌪️ - "Apocalypse Countdown"
```

Icons are generated using Canvas API in `IconGeneratorLucide.js` to ensure compatibility with macOS menubar requirements (22x22 pixels).

## Data Persistence with electron-store

### Store Schema
```javascript
{
  cycleData: {
    startDate: 'ISO date string',
    cycleLength: 28, // 21-35 days
    history: [
      { startDate: 'ISO date', length: 28, notes: 'optional' }
    ]
  },
  preferences: {
    notifications: true,
    notificationDays: [1, 14], // Which cycle days to notify
    theme: 'auto', // 'light', 'dark', 'auto'
    language: 'en',
    testMode: false
  },
  appState: {
    lastOpened: 'ISO date string',
    version: '1.0.0',
    onboardingCompleted: false
  }
}
```

### Store Operations
- **Cycle Data**: Validated cycle length (21-35 days), ISO date format
- **History**: Maintains last 12 cycles, auto-timestamps entries
- **Preferences**: Theme validation, notification settings
- **Export/Import**: Full data backup and restore functionality

### Security
- Uses encryption for data at rest
- Schema validation prevents invalid data
- All store access through IPC handlers only

### Testing
Run store tests with: `npx electron tests/electron/test-store-electron.js`

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Cycle Calculations and Fertility Tracking

### Cycle Phases
The app tracks 6 phases with medical accuracy:
1. **Menstrual** (Days 1-5): "Bloody Hell Week"
2. **Follicular** (Days 6-13): "Finally Got My Sh*t Together"
3. **Ovulation** (Days 14-16): "Horny AF"
4. **Early Luteal** (Days 17-20): "Getting Real Tired of This BS"
5. **Late Luteal** (Days 21-24): "Pre-Chaos Mood Swings"
6. **PMS** (Days 25-28): "Apocalypse Countdown"

### Fertility Levels
- **Very High** (85-100%): Days 13-15 (peak ovulation)
- **High** (60-85%): Days 11-12, 16
- **Medium** (30-60%): Days 9-10, 17-18
- **Low** (10-30%): Days 6-8, 19-23
- **Very Low** (0-10%): Days 1-5, 24-28

### Calendar Color Coding
- Red: Menstruation (very low fertility)
- Yellow: Low fertility
- Gray: Medium fertility
- Light Green: High fertility
- Dark Green: Peak fertility (ovulation)

### Cycle History Features
- Tracks actual vs expected cycle lengths
- Calculates average cycle length
- Determines cycle regularity (very regular to irregular)
- Predicts next period based on history
- Allows period start adjustment for irregular cycles

### Testing Coverage
- 85+ tests across all cycle features
- Unit tests for calculations
- Component tests for UI
- Integration tests for data flow
- All tests use Jest and React Testing Library

## Time Zone and Logging
- ALWAYS use the system's current time when creating log entries
- The system is in PST/PDT (Pacific Time)
- Use the command `date '+%Y-%m-%d %H:%M'` to get the correct timestamp
- Format for PROJECT_LOG.txt: "YYYY-MM-DD HH:MM: Entry Title"