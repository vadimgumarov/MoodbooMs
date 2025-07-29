# Tests Directory

This directory contains all test files for the MoodbooM project.

## Structure

- `/electron` - Electron-specific tests (tray, window management, etc.)
- `/unit` - Unit tests for individual components and functions
- `/integration` - Integration tests for full workflows

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/electron/test-icon.js
```

## Note

Test files should not be included in production builds.