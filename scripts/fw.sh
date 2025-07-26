#!/bin/bash

# fw.sh - Finish Work
# Handles complete workflow: commit, push, update issues, log progress

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏁 Finishing work session...${NC}"
echo ""

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}No changes to commit${NC}"
    echo ""
    read -p "Run project log anyway? (Y/n): " run_pl
    if [[ "$run_pl" != "n" && "$run_pl" != "N" ]]; then
        bash scripts/pl.sh
    fi
    exit 0
fi

# Show changes
echo -e "${CYAN}📝 Changes to commit:${NC}"
git status --short
echo ""

# Extract issue number from branch name
BRANCH_NAME=$(git branch --show-current)
ISSUE_NUM=""
if [[ "$BRANCH_NAME" =~ ^[^/]+/([0-9]+)- ]]; then
    ISSUE_NUM="${BASH_REMATCH[1]}"
    echo -e "${GREEN}Working on issue #$ISSUE_NUM${NC}"
else
    echo -e "${YELLOW}No issue number found in branch name${NC}"
fi

# Generate smart commit message
AUTO_MESSAGE=""
if [ -n "$ISSUE_NUM" ]; then
    # Analyze changed files to determine commit type
    CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || git diff --name-only --cached)
    
    # Default prefix
    PREFIX="feat"
    
    # Check if only test files changed
    if [ -n "$CHANGED_FILES" ]; then
        TEST_FILES=$(echo "$CHANGED_FILES" | grep -E "(test_|_test\.py|\.test\.|/tests/)" || true)
        NON_TEST_FILES=$(echo "$CHANGED_FILES" | grep -vE "(test_|_test\.py|\.test\.|/tests/)" || true)
        
        if [ -n "$TEST_FILES" ] && [ -z "$NON_TEST_FILES" ]; then
            PREFIX="test"
        elif echo "$CHANGED_FILES" | grep -qE "(fix|bug|error|issue)" || git diff HEAD | grep -qE "(fix|bug|error)" 2>/dev/null; then
            PREFIX="fix"
        elif echo "$CHANGED_FILES" | grep -qE "(doc|readme|md$)" || [ -n "$TEST_FILES" ]; then
            if [ -n "$NON_TEST_FILES" ]; then
                PREFIX="feat"
            else
                PREFIX="docs"
            fi
        fi
    fi
    
    # Get issue title for context
    ISSUE_TITLE=$(gh issue view "$ISSUE_NUM" --json title -q .title 2>/dev/null || echo "")
    if [ -n "$ISSUE_TITLE" ]; then
        # Create a brief description from issue title
        BRIEF=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]/ /g' | awk '{for(i=1;i<=3&&i<=NF;i++) printf "%s ", $i}' | sed 's/ $//')
        AUTO_MESSAGE="$PREFIX: $BRIEF (#$ISSUE_NUM)"
    else
        AUTO_MESSAGE="$PREFIX: update implementation (#$ISSUE_NUM)"
    fi
fi

# Get commit message
echo -e "${CYAN}Commit message (press Enter for auto-generated):${NC}"
if [ -n "$AUTO_MESSAGE" ]; then
    echo -e "${YELLOW}[Auto: $AUTO_MESSAGE]${NC}"
fi
read -r USER_MESSAGE

# Use auto-generated if user didn't provide one
if [ -z "$USER_MESSAGE" ]; then
    if [ -z "$AUTO_MESSAGE" ]; then
        echo -e "${RED}Error: No commit message provided and couldn't auto-generate${NC}"
        exit 1
    fi
    COMMIT_MESSAGE="$AUTO_MESSAGE"
else
    # Ensure issue reference if we have issue number
    if [ -n "$ISSUE_NUM" ] && ! echo "$USER_MESSAGE" | grep -q "#$ISSUE_NUM"; then
        COMMIT_MESSAGE="$USER_MESSAGE (#$ISSUE_NUM)"
    else
        COMMIT_MESSAGE="$USER_MESSAGE"
    fi
fi

# Stage all changes
echo -e "${BLUE}📦 Staging changes...${NC}"
git add -A

# Commit with message
echo -e "${BLUE}💾 Committing...${NC}"
git commit -m "$COMMIT_MESSAGE"

# Push to remote
echo -e "${BLUE}📤 Pushing to remote...${NC}"
git push -u origin "$BRANCH_NAME"

# Update GitHub issue if we have issue number
if [ -n "$ISSUE_NUM" ]; then
    echo ""
    echo -e "${CYAN}📝 Update for issue #$ISSUE_NUM (press Enter to skip):${NC}"
    read -r ISSUE_UPDATE
    
    if [ -n "$ISSUE_UPDATE" ]; then
        gh issue comment "$ISSUE_NUM" --body "$ISSUE_UPDATE"
        echo -e "${GREEN}✅ Issue updated${NC}"
    fi
    
    # Ask about closing issue
    read -p "Close issue #$ISSUE_NUM? (y/N): " CLOSE_ISSUE
    if [[ "$CLOSE_ISSUE" == "y" || "$CLOSE_ISSUE" == "Y" ]]; then
        gh issue close "$ISSUE_NUM"
        echo -e "${GREEN}✅ Issue #$ISSUE_NUM closed${NC}"
    fi
fi

# Run project log
echo ""
echo -e "${BLUE}📋 Updating project log...${NC}"
bash scripts/pl.sh

echo ""
echo -e "${GREEN}✨ Work session completed!${NC}"
echo -e "${CYAN}Next: Use 'cs' to see status or 'wi' to work on next issue${NC}"