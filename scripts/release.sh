#!/bin/bash

# Release management script for MoodbooMs
# Usage: ./scripts/release.sh [patch|minor|major|prerelease]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to patch release
RELEASE_TYPE=${1:-patch}

echo -e "${BLUE}🚀 MoodbooMs Release Script${NC}"
echo -e "${BLUE}=========================${NC}"
echo ""

# Check if on main branch or epic branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && ! "$CURRENT_BRANCH" =~ ^feat/epic- ]]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on main or an epic branch${NC}"
    echo -e "Current branch: $CURRENT_BRANCH"
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Release cancelled${NC}"
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
    echo "Please commit or stash your changes before releasing"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${YELLOW}v$CURRENT_VERSION${NC}"

# Validate release type
case $RELEASE_TYPE in
    patch|minor|major|prerelease)
        ;;
    *)
        echo -e "${RED}❌ Invalid release type: $RELEASE_TYPE${NC}"
        echo "Usage: $0 [patch|minor|major|prerelease]"
        exit 1
        ;;
esac

# Show what will happen
echo ""
echo -e "${BLUE}📋 Release Plan:${NC}"
echo "1. Run tests"
echo "2. Build the application"
echo "3. Bump version ($RELEASE_TYPE)"
echo "4. Create git tag"
echo "5. Push to GitHub"
echo "6. GitHub Actions will build and release"
echo ""

read -p "Do you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Release cancelled${NC}"
    exit 1
fi

# Run tests
echo ""
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test -- --watchAll=false --passWithNoTests || {
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Tests passed${NC}"

# Build application
echo ""
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build successful${NC}"

# Bump version
echo ""
echo -e "${BLUE}📝 Bumping version...${NC}"
if [ "$RELEASE_TYPE" == "prerelease" ]; then
    npm version prerelease --preid=beta --no-git-tag-version
else
    npm version $RELEASE_TYPE --no-git-tag-version
fi

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "New version: ${GREEN}v$NEW_VERSION${NC}"

# Create release notes template
echo ""
echo -e "${BLUE}📄 Creating release notes...${NC}"
cat > RELEASE_NOTES_TEMP.md << EOF
# Release v$NEW_VERSION

## What's Changed
- [Add your changes here]

## Bug Fixes
- [Add bug fixes here]

## New Features
- [Add new features here]

## Breaking Changes
- [None or list them here]

## Contributors
- @$(git config user.name)

---
**Full Changelog**: https://github.com/vadimgumarov/MoodbooMs/compare/v$CURRENT_VERSION...v$NEW_VERSION
EOF

echo -e "${YELLOW}Please edit RELEASE_NOTES_TEMP.md with actual release notes${NC}"
echo "Opening in default editor..."

# Open in default editor
if command -v code &> /dev/null; then
    code RELEASE_NOTES_TEMP.md
elif command -v nano &> /dev/null; then
    nano RELEASE_NOTES_TEMP.md
else
    vi RELEASE_NOTES_TEMP.md
fi

echo ""
read -p "Have you updated the release notes? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Reverting version change...${NC}"
    git checkout -- package.json package-lock.json
    rm -f RELEASE_NOTES_TEMP.md
    echo -e "${RED}Release cancelled${NC}"
    exit 1
fi

# Commit version bump
echo ""
echo -e "${BLUE}💾 Committing version bump...${NC}"
git add package.json package-lock.json
git commit -m "chore: bump version to v$NEW_VERSION

Release type: $RELEASE_TYPE
Previous version: v$CURRENT_VERSION"

# Create and push tag
echo ""
echo -e "${BLUE}🏷️  Creating tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -F RELEASE_NOTES_TEMP.md

# Clean up temp file
rm -f RELEASE_NOTES_TEMP.md

# Push changes
echo ""
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin $CURRENT_BRANCH
git push origin "v$NEW_VERSION"

echo ""
echo -e "${GREEN}🎉 Release v$NEW_VERSION initiated successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. GitHub Actions will build and sign the release"
echo "2. Check the Actions tab for build progress"
echo "3. Once complete, the release will be available at:"
echo -e "   ${BLUE}https://github.com/vadimgumarov/MoodbooMs/releases/tag/v$NEW_VERSION${NC}"
echo ""
echo -e "${YELLOW}📝 Remember to:${NC}"
echo "- Update the website with new version info"
echo "- Announce the release on social media"
echo "- Update documentation if needed"