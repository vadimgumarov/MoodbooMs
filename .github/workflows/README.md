# GitHub Actions CI/CD Pipeline

## Overview
This directory contains GitHub Actions workflows for automated building, testing, and releasing of MoodBooMs.

## Workflows

### 1. Build and Release (`build.yml`)
- **Triggers**: Push to main, tags starting with 'v*', PRs, manual dispatch
- **Platforms**: macOS and Windows (parallel builds)
- **Artifacts**: DMG, ZIP (macOS), Installer, Portable (Windows)
- **Release**: Automatically creates draft release when tag is pushed

### 2. Test (`test.yml`)
- **Triggers**: PRs, push to main
- **Actions**: Runs linter, tests with coverage, build verification
- **Coverage**: Uploads to Codecov for tracking

### 3. Version and Tag (`version.yml`)
- **Triggers**: Manual dispatch only
- **Options**: Patch, minor, or major version bump
- **Actions**: Updates version, creates tag, generates changelog

## Usage

### Creating a New Release

1. **Manual Version Bump**:
   ```bash
   # Go to Actions tab in GitHub
   # Select "Version and Tag" workflow
   # Choose version type (patch/minor/major)
   # Run workflow
   ```

2. **Automatic Build**:
   - After tagging, the build workflow automatically triggers
   - Builds are created for both macOS and Windows
   - Draft release is created with all artifacts

3. **Manual Tag Push**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

### Testing PRs
- All PRs automatically run tests
- Build verification ensures code compiles
- Test coverage is reported

## Secrets Required
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- Future: Code signing certificates for production releases

## Build Matrix
| OS | Platform | Artifacts |
|---|---|---|
| macOS-latest | mac | DMG, ZIP |
| windows-latest | win | Installer, Portable |

## Artifact Naming
- macOS: `MoodBooMs-macOS-{dmg,zip}`
- Windows: `MoodBooMs-Windows-{installer,portable}`

## Notes
- Builds use `npm ci` for faster, reproducible installs
- Node.js 18 is used for all workflows
- Tests run with `--passWithNoTests` to allow workflow to proceed
- Draft releases allow manual review before publishing