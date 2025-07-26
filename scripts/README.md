# MoodBooMs Development Scripts

These scripts provide a streamlined development workflow for the MoodBooMs project. They've been adapted from a Python project to work with our JavaScript/React/Electron stack.

## Quick Start

1. Make scripts executable:
```bash
chmod +x scripts/*.sh
```

2. Add to PATH (optional):
```bash
export PATH="$PATH:$(pwd)/scripts"
```

Or create aliases in your shell config:
```bash
alias cs='bash scripts/cs.sh'
alias wi='scripts/wi.sh'
alias fw='scripts/fw.sh'
alias rt='scripts/rt.sh'
alias pl='bash scripts/pl.sh'
alias qa='scripts/qa.sh'
alias fix='scripts/fix.sh'
```

## Available Scripts

### cs - Claude Start
Shows project status, recent progress, and available issues.
- Checks Node.js environment
- Shows recent commits and completed tasks
- Lists prioritized issues
- Interactive menu for quick actions

### wi - Work on Issue
Start working on a GitHub issue.
- Lists available issues with priority indicators
- Creates feature branch automatically
- Assigns issue to you
- Adds comment with branch name

### fw - Finish Work
Commit, push, and update issues.
- Smart commit message generation
- Pushes to remote
- Updates GitHub issue
- Option to close issue
- Automatically runs project log

### rt - Run Tests
Smart test runner for JavaScript projects.
- Run specific test files
- Auto-detect changed files
- Run full test suite with coverage
- Coverage threshold checking (80%)

### pl - Project Log
Update PROJECT_LOG.txt with progress.
- Auto-generates log entries
- Tracks commits and issues
- Suggests next tasks
- Saves to PROJECT_LOG.txt

### qa - Quick Actions
Central menu for all commands.
- Access all other scripts
- Create pull requests
- Sync with main branch
- Show quick status

### fix - Structured Issue Resolution
Templated workflows for different issue types.
- Step-by-step guidance
- Issue type specific workflows
- Automated branch creation
- PR template generation

## Workflow Example

1. Start your day:
```bash
cs  # Check status and see available work
```

2. Pick an issue:
```bash
wi  # Select and start working on an issue
```

3. Write code and test:
```bash
rt  # Run tests to verify your changes
```

4. Finish and commit:
```bash
fw  # Commit, push, and update issue
```

5. Log your progress:
```bash
pl  # Update project log (automatic with fw)
```

## Script Adaptations for MoodBooMs

- Replaced Python/pytest references with npm/Jest
- Updated file patterns for JavaScript/TypeScript
- Removed virtual environment checks
- Added Node.js environment validation
- Updated coverage thresholds (80% for JavaScript)
- Modified suggestions for Electron/React development

## Troubleshooting

- If scripts aren't found, check execute permissions
- For "command not found", add scripts to PATH or use full path
- GitHub CLI (`gh`) must be installed and authenticated
- Node.js and npm must be installed