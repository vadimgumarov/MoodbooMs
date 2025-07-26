# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoodBooMs is an Electron-based menubar application that tracks menstrual cycle phases with humor. It combines a React frontend with Electron to create a macOS menubar app that displays cycle phase information and mood messages.

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
   - Creates a frameless 320x450 window
   - Manages system tray icon and click behavior
   - Loads React app from localhost:3000 in development

2. **React Application** (`src/`):
   - Main component: `MenuBarApp.jsx` - handles cycle tracking logic
   - Uses Tailwind CSS for styling
   - Lucide React for icons

3. **Key Features**:
   - Tracks 6 menstrual cycle phases with humorous messages
   - Allows cycle start date and length customization (21-35 days)
   - Test mode for previewing different cycle days
   - Random mood messages and food cravings per phase

## Project Structure

```
/moodbooms
├── /electron              # Electron main process
│   ├── main.js           # Main electron file
│   ├── package.json      # Electron-specific dependencies
│   └── /assets
│       └── /icons        # App icons (menubar, dock, etc.)
├── /src                  # React application
│   └── /components       # React components
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

### Standard Development Flow
1. **Identify & Clarify Requirements**
   - Understand the task completely
   - Ask clarifying questions if needed

2. **Plan Implementation**
   - Consider architectural impacts
   - Identify files to modify or create

3. **Write Tests First (when applicable)**
   - Create failing tests for new functionality
   - Ensure tests cover edge cases

4. **Implement Code**
   - Follow existing patterns and conventions
   - Keep changes focused and minimal

5. **Verify & Test**
   - Run tests to ensure nothing breaks
   - Test the application manually if needed

6. **Document Changes**
   - Update relevant documentation
   - Add comments only when necessary for complex logic

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

## Debugging Electron Menubar on macOS 15.5 (Sequoia)

### CRITICAL ISSUES AND SOLUTIONS:

1. **Tray Icon Loading Failures**
   - **Problem**: Standard icon loading crashes with "invalid icon" errors
   - **Solution**: Use empty image with text instead
   ```javascript
   const image = nativeImage.createEmpty();
   tray = new Tray(image);
   tray.setTitle('MB'); // Use text instead of icon
   ```

2. **Electron Version Crashes**
   - **Problem**: Electron 37.x crashes after ~10 seconds
   - **Solution**: Use Electron 28.3.3 for stability
   ```bash
   npm install electron@28.3.3 --save-dev
   ```

3. **Window Resize Crashes**
   - **Problem**: Any resize operation causes immediate crash
   - **Solution**: Disable ALL resize options
   ```javascript
   window = new BrowserWindow({
     resizable: false,
     minimizable: false,
     maximizable: false,
     fullscreenable: false
   });
   ```

4. **App Timeout Issues**
   - **Problem**: App quits after command timeout
   - **Solution**: Add keep-alive interval
   ```javascript
   setInterval(() => {}, 1000);
   ```

### Working Menubar Configuration:
```javascript
// Minimal working setup for macOS 15.5
app.dock.hide(); // Hide dock icon

const window = new BrowserWindow({
  width: 380,
  height: 520,
  show: false,
  frame: false,
  resizable: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true
  }
});

const image = nativeImage.createEmpty();
const tray = new Tray(image);
tray.setTitle('MB');
```

### Failed Approaches (Don't Use):
- Tauri framework - icon loading issues
- menubar npm package - incompatible versions
- PNG/template icons - cause crashes
- Electron 37.x - timeout crashes

### WORKING ICON SOLUTION (Implemented):
Instead of loading PNG files (which crash on macOS 15.5), we create a programmatic icon:
```javascript
// Create a colored circle icon in memory
const size = 16;
const buffer = Buffer.alloc(size * size * 4);
// Draw purple/pink circle...
const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
tray = new Tray(icon);
```
This approach:
- Avoids PNG loading crashes
- Creates a stable purple/pink circle icon
- Falls back to text "MB" if needed
- Works reliably on macOS 15.5 Sequoia

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Time Zone and Logging
- ALWAYS use the system's current time when creating log entries
- The system is in PST/PDT (Pacific Time)
- Use the command `date '+%Y-%m-%d %H:%M'` to get the correct timestamp
- Format for PROJECT_LOG.txt: "YYYY-MM-DD HH:MM: Entry Title"