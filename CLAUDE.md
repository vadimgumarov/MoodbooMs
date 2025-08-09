# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL RULES - READ FIRST

### 0. THINK BEFORE CHANGING WORKING CODE
- **ALWAYS analyze what your changes might break before implementing**
- When modifying existing code, consider:
  - What other components depend on this code?
  - What side effects could this change have?
  - Are there any imports, exports, or function signatures that will change?
  - Will this affect the user interface or user experience?
- **Test thoroughly** after making changes to working functionality
- **Prefer additive changes** over modifications when possible
- If you must change working code, explain WHY and document what could be affected
- **Make incremental changes** - don't change multiple working systems at once

### 1. NO CONFIDENT STATEMENTS UNLESS CERTAIN
- NEVER state "the app is working" or "everything is fine" based on partial log output
- VERIFY processes are actually running: `ps aux | grep -E "electron|npm"`
- CHECK crash logs and heartbeat files
- Only state facts you have verified

### 2. NO APOLOGIES
- Don't apologize for errors or misunderstandings
- Focus on identifying and fixing issues
- Be direct and factual

### 3. ISSUE IDENTIFICATION IS PRIMARY GOAL
- THINK before responding
- Don't jump to the first assumption
- Identify the exact:
  - Error location
  - Module causing the issue
  - Line of code
  - Stack trace
- Test fixes before claiming they work
- Use proper debugging tools and logs

### 4. VERIFICATION BEFORE STATEMENTS
- If logs show "React app loaded: true" - verify the app is STILL running
- Check multiple sources:
  - Process list
  - Heartbeat files
  - Crash logs
  - Console output
- State only what you can prove

## Common Crashes and Fixes

### Exit Code 15 (SIGTERM)
**Symptoms**: App starts but crashes shortly after with "Exit Code: 15"
**Cause**: Rapid state updates causing re-render loops
**Fix**: Ensure 300ms debouncing in MenuBarApp.jsx phase updates
**Verify**: Check logs for repeated "Updating phase" entries within milliseconds

### Renderer Process Dead
**Symptoms**: Heartbeat shows "Renderer dead for Xms"
**Cause**: Missing crashLogger import in App.js
**Fix**: Ensure `import './utils/crashLogger'` is at top of App.js
**Verify**: Heartbeat file should show "ALIVE: Main + Renderer"

### app.dock.hide() Crash
**Symptoms**: Electron crashes on startup (macOS)
**Cause**: Calling app.dock.hide() before app is ready
**Fix**: Move app.dock.hide() inside app.whenReady() callback
**Verify**: No crash logs immediately after "App is ready" message

### Icon Not Updating
**Symptoms**: Tray icon doesn't change when switching modes
**Cause**: Phase name mismatch in iconFromPNG.js
**Fix**: Update phaseIconMap to include all current phase names
**Note**: Requires full Electron restart to take effect

### Theme Provider Crash
**Symptoms**: App crashes when ThemeProvider is enabled
**Cause**: Theme being applied before DOM is ready
**Fix**: Wrap theme application in try-catch and check document.documentElement exists
**Verify**: No "Cannot read property 'style' of null" errors

### Renderer Process Dies Every 5 Seconds
**Symptoms**: 
- Heartbeat shows "RENDERER PROCESS ALIVE" followed by "RENDERER PROCESS DIED - No heartbeat for 5 seconds"
- Pattern repeats every minute (alive at :15, dead at :20)
- App appears to work but renderer keeps restarting
**Cause**: 
- React hot reload conflicts with Electron's renderer process
- Webpack recompilation triggers causing renderer restarts
- Memory leaks in development mode
**Fix**:
1. Ensure React app is stable before starting Electron:
   ```bash
   # Start React first and wait for it to stabilize
   npm start
   # In another terminal, after React is ready:
   npm run electron-dev
   ```
2. Check for infinite loops in useEffect hooks
3. Disable React Fast Refresh if persistent:
   ```
   FAST_REFRESH=false npm start
   ```
**Verify**: Heartbeat should show consistent "ALIVE: Main + Renderer" without death cycles

### Webpack Dynamic Import Warning
**Symptoms**: 
- Repeated "Critical dependency: the request of a dependency is an expression" warnings
- React dev server shows "Compiling..." messages every few seconds
- Warning specifically in ./src/core/services/phrases/PhraseConfigLoader.js line 54
**Cause**: 
- Dynamic import with variable path: `await import(configPath)`
- Webpack cannot statically analyze dynamic imports
- Triggers frequent recompilations
**Impact**: May contribute to renderer process instability
**Fix**:
1. Replace dynamic import with static imports for known paths
2. Use require() instead of import() for CommonJS compatibility
3. Create a map of known imports instead of dynamic loading
**Verify**: Check /tmp/react-dev.log - should not show repeated "Compiling..." messages

## CSS and Theme Issues (July 2025)

### CSS Variables Not Applying / Old Colors Showing
**Symptoms**: 
- User reports "old colors", "same colors" despite theme changes
- CSS variables defined but not being used
- Tailwind classes showing static colors instead of CSS variables
**Root Cause**: 
- Tailwind JIT compiler uses static color values at build time
- Hardcoded Tailwind classes like `bg-pink-400` override CSS variables
**Fix**:
1. Add CSS overrides in `index.css` to force Tailwind classes to use CSS variables:
   ```css
   @layer utilities {
     .bg-primary {
       background-color: var(--color-primary) !important;
     }
     .text-primary {
       color: var(--color-primary) !important;
     }
     /* ... etc for all color utilities ... */
   }
   ```
2. Replace ALL hardcoded color classes with CSS variable classes
3. Search for hardcoded colors: `grep -r "bg-\(red\|green\|pink\|blue\)-[0-9]" src/`
**Verify**: Check computed styles in DevTools - should show CSS variables not hex values

### Multiple Theme File Confusion
**Symptoms**: 
- Theme changes in design-system files don't apply
- Colors coming from unexpected sources
**Cause**: 
- Two separate theme systems: `design-system/tokens/themes/` and `modes/*/theme.js`
- ThemeContext loading from `modes/*/theme.js` instead of design tokens
**Fix**: 
- Update the actual theme files being loaded: `src/modes/queen/theme.js` and `src/modes/king/theme.js`
- Keep design-system files for future migration
**Verify**: Check console logs for "ThemeContext: Applying theme" messages

### Aggressive/Unprofessional Colors
**Symptoms**: 
- "Screaming" colors, aggressive reds on dark backgrounds
- User wants "modern yet soft" palette
**Solution**: 
- Queen Mode: Simple light theme with neutral indigo (#6366F1) as primary
- King Mode: Dark gray theme (#1F2937 background) with muted gray accents
- Remove all bright pinks, aggressive reds, and vibrant colors
- Use standard semantic colors (error, warning, success) sparingly

### Finding Hardcoded Colors
**Command**: 
```bash
# Find all hardcoded Tailwind color classes
grep -r "bg-\|text-\|border-" src/ | grep -E "(red|green|yellow|pink|blue|indigo|gray)-[0-9]"
```
**Common locations**:
- StatusCard.jsx
- SafetyScale.jsx  
- Calendar.jsx
- PhaseDetail.jsx
- HistoryView.jsx

### UI Stability When Mode Switching
**Improvement**: After implementing CSS variable-based theming and accessibility improvements, the UI no longer shifts or jumps when switching between Queen and King modes
**Cause**: Consistent styling with CSS variables, proper ARIA attributes, and stable component structure
**Benefit**: Smoother user experience and better visual continuity

## Recent Improvements (Epic #79 - July 2025)

### Design System Implementation
- **Token-based architecture**: CSS variables for colors, spacing, typography
- **Mode-aware theming**: Separate Queen/King palettes with smooth transitions
- **Component consistency**: All UI elements use design tokens
- **Typography scale**: Proper hierarchy with responsive sizing

### Accessibility Features
- **WCAG 2.1 AA Compliance**: Full keyboard navigation, proper contrast ratios
- **Screen Reader Support**: ARIA labels, live regions, semantic HTML
- **Focus Management**: Visible focus indicators, logical tab order
- **High Contrast Mode**: Toggle in settings for improved visibility
- **Keyboard Shortcuts**: Arrow keys for tab navigation, Escape to close

### Feedback System
- **Loading States**: Spinners with size variants, skeleton loaders
- **Error Handling**: Mode-aware error messages with retry actions
- **Success Feedback**: Temporary success messages with auto-dismiss
- **Tooltips**: Contextual help throughout the interface
- **Global Notifications**: FeedbackContext for app-wide alerts

### Constants System
- **Eliminated Magic Numbers**: All values extracted to constants
- **Centralized Configuration**: Single source of truth for limits/defaults
- **Type Safety**: Proper constant exports with documentation
- **Maintainability**: Easy to adjust values without searching codebase

## Debugging Methodology: 5 Whys

When facing persistent issues (like CSS not updating), use the 5 Whys approach:

**Example: "Why are old colors still showing?"**
1. Why? → Because the app is using hardcoded colors
2. Why? → Because Tailwind classes like `bg-pink-400` are compiled to static hex values
3. Why? → Because Tailwind JIT compiler resolves colors at build time, not runtime
4. Why? → Because that's how Tailwind optimizes for production - it doesn't know about CSS variables
5. Why? → Because CSS variables are runtime values and Tailwind needs build-time values

**Solution**: Override Tailwind classes with CSS that uses variables, or use utility classes that map to CSS variables.

## Verification Checklist Before Claiming Success

Before stating "the app is working", verify ALL of the following:

1. **Process Check**:
   ```bash
   ps aux | grep -E "electron|npm" | grep -v grep
   # Should show both npm and electron processes
   ```

2. **Heartbeat Check**:
   ```bash
   cat logs/menu-heartbeat.txt
   # Must show "ALIVE: Main + Renderer" with recent timestamp
   ```

3. **Functional Tests**:
   - [ ] Click tray icon - window should appear
   - [ ] Click outside window - it should hide
   - [ ] Toggle Queen/King mode - icon should change
   - [ ] Switch between tabs - no crashes
   - [ ] Check calendar view - should render without errors

4. **Log Verification**:
   ```bash
   # Check for recent crashes
   tail -20 logs/electron-*.log | grep -i "error\|crash\|exit"
   # Should be empty or show only old entries
   ```

5. **Time-Based Verification**:
   - App must run for at least 30 seconds without crashing
   - Mode switching must work at least 3 times
   - No "Renderer dead" messages in last 60 seconds

## Project Overview

MoodbooM is an Electron-based menubar application that tracks menstrual cycle phases with humor. It combines a React frontend with Electron to create a macOS menubar app that displays cycle phase information and mood messages.

### Current Development Status (July 2025)
- **Active Branch**: `main` (Epic #68 completed and merged)
- **Mode System**: Queen (female first-person) / King (partner warning system) modes
- **Content**: 360+ unique mood messages and cravings per mode
- **Architecture**: Modular Queen/King architecture with theme system

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

## Accessibility Architecture

The app implements comprehensive accessibility features following WCAG 2.1 AA standards:

### Keyboard Navigation
- **Tab Navigation**: Arrow keys, Home, and End keys navigate between tabs
- **Focus Management**: Proper tabindex management (0 for active, -1 for inactive)
- **Keyboard Hook**: `useKeyboardNavigation` hook handles all keyboard interactions
- **Skip Navigation**: Skip link allows quick access to main content

### Screen Reader Support
- **ARIA Labels**: All interactive elements have descriptive labels
- **ARIA Roles**: Proper semantic roles (tablist, tab, tabpanel, switch)
- **Live Regions**: Mode changes announced via `aria-live` regions
- **Announcements**: `announceToScreenReader` utility for dynamic updates

### Visual Accessibility
- **Focus Indicators**: High contrast focus outlines for all interactive elements
- **High Contrast Mode**: Manual toggle in settings with persistent storage
  - Light mode: Blue primary (#0000FF) on white background
  - Dark mode: Cyan primary (#00FFFF) on black background
  - Strong borders and enhanced contrast ratios
- **Reduced Motion**: Respects `prefers-reduced-motion` system preference

### Implementation Details
- **Accessibility Utils**: `src/utils/accessibility.js` provides helper functions
- **Styles**: `src/styles/accessibility.css` contains all accessibility styles
- **Testing**: `src/tests/accessibility.test.js` uses jest-axe for compliance
- **Components**: `HighContrastToggle` component for mode switching

### Key Files
- `/src/hooks/useKeyboardNavigation.js` - Keyboard navigation logic
- `/src/utils/accessibility.js` - Screen reader announcements, contrast checking
- `/src/styles/accessibility.css` - Focus indicators, high contrast styles
- `/src/components/HighContrastToggle.jsx` - High contrast mode toggle

### Testing Accessibility
```bash
# Run accessibility tests
npm test -- --testNamePattern="accessibility"

# Manual testing checklist:
- [ ] Tab through all controls
- [ ] Use arrow keys in tab navigation
- [ ] Test with screen reader (VoiceOver on macOS)
- [ ] Enable high contrast mode
- [ ] Check focus indicators
```

## Architecture Decisions & Rationale

### Why 300ms Debouncing?
Phase updates in MenuBarApp.jsx use 300ms debouncing to prevent Exit Code 15 crashes. Without this delay, rapid mode switches or state updates can trigger re-render loops that overwhelm the Electron process, causing SIGTERM.

### Why app.dock.hide() After app.ready?
On macOS, calling dock methods before the app is ready causes immediate crashes. The dock API is only available after Electron's app module is fully initialized. This is a macOS-specific requirement.

### Why crashLogger Import in App.js?
The crashLogger establishes a heartbeat between main and renderer processes. Without it, the renderer appears dead to the crash monitor. It must be imported at the top level to start monitoring before any components mount.

### Why Separate iconFromPNG.js?
Lucide React icons can't be used directly in the main process. The PNG-based approach ensures compatibility with macOS menubar requirements (22x22 pixels) and allows for future customization.

### Why SimpleModeContext?
Centralizing mode state prevents prop drilling and ensures consistency across all components. The context also handles persistence and migration from legacy badassMode.

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
   - Queen/King mode toggle for different perspectives

## Queen/King Mode System

### Overview
The app features two distinct modes with different perspectives:
- **Queen Mode** (toggle OFF): Female first-person experience ("I'm dealing with this")
- **King Mode** (toggle ON): Partner warning system ("She's in this state")

### Content Architecture
```javascript
// Current Implementation (transitioning to modular)
modeContent.js: 900+ lines with all mood messages and cravings
MenuBarApp.jsx: Phase names and descriptions

// Mode Selection
const mode = preferences.mode || 'queen'; // 'queen' or 'king'
```

### Phase Names by Mode
| Medical Phase | Queen Mode | King Mode |
|--------------|------------|-----------|
| Menstrual | Bloody Hell Week | Code Red Alert |
| Follicular | Finally Got My Sh*t Together | Safe Zone Active |
| Ovulation | Horny AF | High Energy Warning |
| Luteal | Getting Real Tired of This BS | Patience Level: Low |
| Late Luteal | Pre-Chaos Mood Swings | Volatility Alert |
| Pre-Menstrual | Apocalypse Countdown | DEFCON 1 |

### Content Details
- 360+ unique mood messages per mode (30+ per phase)
- 360+ unique food cravings per mode
- Phrase tracking system prevents repetition for 6 months
- Different UI text for tabs, buttons, and labels

### SimpleModeContext Implementation
The mode system uses React Context for centralized state management:

```javascript
// src/core/contexts/SimpleModeContext.js
import { ModeProvider, useMode, MODES } from './core/contexts';

// Available modes
MODES = {
  QUEEN: 'queen',
  KING: 'king'
}

// Using in components
const { currentMode, isQueenMode, isKingMode, toggleMode, isSwitching } = useMode();

// Mode persistence
- Stored in electron-store as preferences.mode
- Automatic migration from legacy badassMode
- Debounced switching to prevent rapid toggles
```

Key features:
- Centralized mode state across entire app
- Persistence through electron-store
- Loading state management (isReady)
- Switch animation support (isSwitching)
- Backward compatibility with legacy data

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
   ./scripts/start.sh
   # Or directly: ./scripts/start.sh <issue-number>
   ```
   - Automatically detects if issue is an Epic
   - Creates epic branches from main
   - Creates issue branches from current epic branch
   - Handles branch naming: `feat/epic-1/issue-2-description`

2. **Finishing Work (Commit, Push, and Merge)**
   ```bash
   ./scripts/finish.sh
   ```
   - Commits and pushes changes
   - For issue branches: offers to merge to parent epic branch
   - For epic branches: reminds to merge to main when complete
   - Optionally closes GitHub issues

3. **Other Useful Scripts**
   ```bash
   ./scripts/status.sh  # Check status and current work
   ./scripts/test.sh    # Run tests
   ./scripts/check.sh   # Quality assurance checks
   ./scripts/log.sh     # Update project log
   ./scripts/hotfix.sh  # Quick fixes
   ```

#### Manual Workflow (if needed):

1. **Epic Branch**: `feat/epic-{number}-{description}`
2. **Issue Branch**: `feat/epic-{number}/issue-{number}-{description}`
3. **Merge Pattern**: Issue → Epic → Main

### Current Development Focus (Epic #117)

**Public Release Preparation** - Preparing MoodBooMs for public release:
1. **Issue #118**: Create User Guide and App Presentation
2. **Issue #119**: Cross-Platform Testing on Windows and macOS
3. **Issue #120**: UI Improvements and Polish

**Status**: All 9 previous epics completed ✅ (82+ issues resolved with `status: done` labels)

**Branch Status**:
- Active: `main` branch (all core development completed)
- All previous epic branches merged

**Current Workflow**: Open → In Progress (`status: in-progress` label) → Done (`status: done` label) → Closed

**Key Accomplishments**:
- All core functionality completed and production-ready
- Cross-platform builds available (macOS + Windows)
- Professional distribution pipeline established
- Comprehensive accessibility and security implementation

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
   - **IMPORTANT**: Show the working app to the user (`npm run dev`)
   - Write unit tests for new functionality
   - Run all tests and show results (`npm test`)
   - Take screenshots or describe what's working

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
   - ✓ All child issues closed with proper comments
   - ✓ All branches merged to epic branch
   - ✓ Unit tests pass (`npm test`)
   - ✓ Security tests pass (`npx electron tests/electron/security-test.js`)
   - ✓ Manual testing complete (`npm run dev`)
   - ✓ Build succeeds (`npm run build`)

2. **Close Child Issues Properly**
   ```bash
   # Close each issue with completion comment
   gh issue close <issue-number> --comment "✅ Completed: <what was done>"
   
   # For skipped issues
   gh issue close <issue-number> --comment "⏭️ Skipped: <reason>"
   ```

3. **Update Documentation**
   - Update PROJECT_LOG.txt with epic completion (newest entries at TOP)
   - Update README.md if new features added
   - Commit documentation changes

4. **Complete Epic Using finish.sh or Manually**
   
   **Option A: Using finish.sh Script**
   - Run `./scripts/finish.sh` while on epic branch
   - Choose "Complete this epic? (y/N)"
   - Script handles PR creation and merging
   
   **Option B: Manual Process**
   ```bash
   # Create PR
   gh pr create --title "feat: Complete Epic #X - <Epic Title>" \
     --body "## Summary\n<what was completed>\n\nCloses #X" \
     --base main
   
   # Merge PR
   gh pr merge <pr-number> --merge --delete-branch
   ```

5. **Post-completion**
   - Verify epic issue is closed (should auto-close with "Closes #X" in PR)
   - Switch back to main: `git checkout main && git pull`
   - Choose next epic based on priority

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
   - NEVER use any Claude signatures or AI-related text in commit messages

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

## App Crashes and Debugging

### Common Crash Scenarios

1. **Exit Code 15 (SIGTERM)**
   - **Symptom**: App starts but crashes shortly after with "Exit Code: 15"
   - **Cause**: Process is being terminated, often due to:
     - Memory issues
     - Infinite loops in React components
     - Rapid state updates causing re-render loops
     - IPC communication errors
   - **Solution**: Add debouncing to phase updates (300ms delay)
   - **Debugging Steps**:
     - Check electron logs: `logs/electron-YYYY-MM-DD.log`
     - Check app logs: `logs/app-YYYY-MM-DD.log`
     - Look for rapid repeated log entries indicating loops
     - Enable DevTools: Uncomment `window.webContents.openDevTools()` in main.js

2. **ERR_CONNECTION_REFUSED**
   - **Symptom**: Electron can't connect to React dev server
   - **Cause**: React dev server not running or not ready
   - **Solution**: Ensure `npm start` is running before `npm run electron-dev`

3. **Renderer Process Crashes**
   - **Symptom**: Window becomes unresponsive or disappears
   - **Common Causes**:
     - React errors (check console)
     - Memory leaks from event listeners
     - Uncaught promises
   - **Debug**: Check both Electron and browser console logs

4. **Icon Update Issues**
   - **Symptom**: Tray icon doesn't update when switching modes
   - **Cause**: Icon mapping not updated for new phase names
   - **Solution**: Update `iconFromPNG.js` phaseIconMap with all phase names
   - **Note**: Must restart Electron for icon changes to take effect

5. **Mode Toggle Re-render Loop**
   - **Symptom**: Rapid switching between modes causes performance issues
   - **Cause**: useEffect dependencies triggering cascading updates
   - **Solution**: Debounce phase updates, optimize useEffect dependencies

### Debugging Tools

1. **Enable DevTools in Development**
   ```javascript
   // In main.js, uncomment:
   window.webContents.openDevTools();
   ```

2. **Check All Log Files**
   - `logs/electron-YYYY-MM-DD.log` - Main process logs
   - `logs/app-YYYY-MM-DD.log` - Renderer process logs
   - `/tmp/app-dev.log` - Real-time development logs

3. **Process Monitoring**
   ```bash
   # Check if processes are running
   ps aux | grep -E "electron|npm|node" | grep -v grep
   
   # Kill all app processes
   pkill -f "npm run dev" || pkill -f "electron" || true
   ```

### Preventing Crashes

1. **Avoid Rapid State Updates**
   - Use debouncing for frequent updates
   - Check useEffect dependencies to prevent loops
   - Use React.memo for expensive components

2. **Handle Errors Properly**
   - Add error boundaries in React
   - Handle Promise rejections
   - Validate IPC messages

3. **Monitor Performance**
   - Use React DevTools Profiler
   - Check for memory leaks
   - Limit concurrent operations

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

# Important Assistant Behavior Guidelines

## Context-Aware Suggestions
When providing "What's next?" suggestions, ALWAYS:
1. **Prioritize immediate findings** - If a tool/command revealed issues, suggest fixing those FIRST
2. **Group by urgency**:
   - 🔴 Immediate Actions (findings from current task)
   - 🟡 Standard Workflow (logical next steps)
   - 🟢 Optional/Future (nice-to-have)
3. **Logical ordering within groups**:
   - Fix critical issues → Update docs → Commit → Test → Next task
4. **Be specific** - Don't just say "update docs", say what needs updating

Example after running `review`:
```
## What's next?
### 🔴 Immediate Actions (from Review findings):
1. Update CLAUDE.md - Fix old script names
2. Remove duplicate sections between docs
3. Add missing screenshots to README

### 🟡 Standard Workflow:
4. finish - Commit changes
5. log - Update documentation
6. start #X - Next development task
```

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Cycle Calculations and Fertility Tracking

### Cycle Phases
The app tracks 6 phases with medical accuracy and mode-specific names:

#### Phase Name Mapping
| Medical Phase | Queen Mode | King Mode | Days |
|--------------|------------|-----------|------|
| Menstrual | Bloody Hell Week | Code Red Alert | 1-5 |
| Follicular | Finally Got My Sh*t Together | Safe Zone Active | 6-13 |
| Ovulation | Horny AF | High Energy Warning | 14-16 |
| Early Luteal | Getting Real Tired of This BS | Patience Level: Low | 17-20 |
| Late Luteal | Pre-Chaos Mood Swings | Volatility Alert | 21-24 |
| PMS | Apocalypse Countdown | DEFCON 1 | 25-28 |

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
- **IMPORTANT**: New entries in PROJECT_LOG.txt must be added at the TOP of the file
- The log follows reverse chronological order (newest entries first)

## Critical Notes for Context Recovery

### If Starting Fresh (Lost Context)
1. **Check Current Branch**: `git branch --show-current`
   - Should typically be on `main` for new work
   - For epic work: `feat/epic-XX-description`

2. **Current Mode System**:
   - Queen Mode = Female perspective (toggle OFF)
   - King Mode = Partner warning system (toggle ON)
   - NOT Professional/BadAss anymore - now using Queen/King modes

3. **Common Issues & Quick Fixes**:
   - **App crashes**: Kill all processes: `pkill -f "npm run dev" || pkill -f "electron" || true`
   - **Icon not updating**: Restart Electron (icon changes require full restart)
   - **Re-render loops**: Check for missing debouncing in useEffect

4. **Running the App**:
   ```bash
   # Kill any existing processes first
   pkill -f "npm run dev" || pkill -f "electron" || true
   # Then start
   npm run dev
   ```

5. **Key Implementation Details**:
   - `preferences.mode` stores the current mode ('queen' or 'king')
   - Legacy `preferences.badassMode` automatically migrated (true = 'king', false = 'queen')
   - Phase names differ between modes (see Phase Name Mapping table in Cycle Calculations section)
   - Content is in `modeContent.js`, phase logic in `MenuBarApp.jsx`

6. **Current Epic Priority**:
   - **High**: Epic #79 - Modern UI Design & Visual Polish
   - **Medium**: Epic #53 - Application Modularity
   - **Low**: Epic #52 - Enhanced Navigation

### UI Epic #79 Workflow
Before starting any UI changes:
1. **Review the epic description** with the user
2. **Discuss and refine** the proposed UI improvements
3. **Get approval** on the design direction
4. **Create child issues** based on approved scope
5. Only then start implementation

DO NOT jump directly into UI changes without discussion!

### Emergency Recovery Commands
```bash
# Check status
git status
gh issue list --assignee @me

# View current epic (Public Release Preparation)
gh issue view 117

# Check logs for errors
tail -50 logs/electron-*.log | grep -i error

# Check project status
gh project view 6 --owner vadimgumarov

# Reset if needed (should stay on main branch)
git stash
git checkout main
```