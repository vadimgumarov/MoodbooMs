#!/bin/bash

# finish.sh - Finish Work
# Handles complete workflow: commit, push, update issues, log progress
# Usage: finish [issue-number]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if issue number provided as argument
if [ $# -eq 1 ] && [[ "$1" =~ ^[0-9]+$ ]]; then
    PROVIDED_ISSUE_NUM="$1"
    echo -e "${BLUE}🏁 Finishing work on issue #$PROVIDED_ISSUE_NUM...${NC}"
else
    echo -e "${BLUE}🏁 Finishing work session...${NC}"
fi
echo ""

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}No changes to commit${NC}"
    echo ""
    read -p "Run project log anyway? (Y/n): " run_pl
    if [[ "$run_pl" != "n" && "$run_pl" != "N" ]]; then
        bash scripts/log.sh
    fi
    exit 0
fi

# Show changes
echo -e "${CYAN}📝 Changes to commit:${NC}"
git status --short
echo ""

# Extract issue number from branch name or use provided one
BRANCH_NAME=$(git branch --show-current)
ISSUE_NUM=""
if [ -n "${PROVIDED_ISSUE_NUM:-}" ]; then
    ISSUE_NUM="$PROVIDED_ISSUE_NUM"
    echo -e "${GREEN}Working on issue #$ISSUE_NUM${NC}"
elif [[ "$BRANCH_NAME" =~ ^[^/]+/([0-9]+)- ]]; then
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
if [ -n "$AUTO_MESSAGE" ]; then
    echo -e "${CYAN}Using auto-generated commit message:${NC}"
    echo -e "${YELLOW}$AUTO_MESSAGE${NC}"
    USER_MESSAGE=""
else
    echo -e "${CYAN}Commit message:${NC}"
    read -r USER_MESSAGE
fi

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

# Check if we should merge to parent branch
if [[ "$BRANCH_NAME" =~ ^feat/epic-[0-9]+/issue- ]]; then
    # Extract epic branch name
    EPIC_BRANCH=$(echo "$BRANCH_NAME" | sed 's/\/issue-.*//')
    echo ""
    echo -e "${CYAN}This is an issue branch within an epic${NC}"
    read -p "Merge to epic branch $EPIC_BRANCH? (Y/n): " MERGE_TO_EPIC
    
    if [[ "$MERGE_TO_EPIC" != "n" && "$MERGE_TO_EPIC" != "N" ]]; then
        echo -e "${BLUE}🔀 Merging to epic branch...${NC}"
        git checkout "$EPIC_BRANCH"
        git pull origin "$EPIC_BRANCH" 2>/dev/null || true
        git merge --no-ff "$BRANCH_NAME" -m "Merge issue branch '$BRANCH_NAME' into $EPIC_BRANCH"
        git push origin "$EPIC_BRANCH"
        
        # Optionally delete the issue branch
        echo ""
        read -p "Delete issue branch $BRANCH_NAME? (y/N): " DELETE_BRANCH
        if [[ "$DELETE_BRANCH" == "y" || "$DELETE_BRANCH" == "Y" ]]; then
            git branch -d "$BRANCH_NAME"
            git push origin --delete "$BRANCH_NAME" 2>/dev/null || true
            echo -e "${GREEN}✅ Issue branch deleted${NC}"
        fi
        
        echo -e "${GREEN}✅ Merged to epic branch${NC}"
    fi
elif [[ "$BRANCH_NAME" =~ ^feat/epic-[0-9]+- ]]; then
    echo ""
    echo -e "${YELLOW}This is an epic branch${NC}"
    
    # Extract epic number from branch name
    EPIC_NUM=$(echo "$BRANCH_NAME" | sed 's/^feat\/epic-\([0-9]\+\).*/\1/')
    
    echo -e "${CYAN}Epic completion checklist:${NC}"
    echo "1. Verify all child issues are closed"
    echo "2. Run comprehensive tests"
    echo "3. Test the application manually"
    echo "4. Create PR and merge to main"
    echo ""
    
    read -p "Complete this epic? (y/N): " COMPLETE_EPIC
    if [[ "$COMPLETE_EPIC" == "y" || "$COMPLETE_EPIC" == "Y" ]]; then
        echo ""
        echo -e "${BLUE}🔍 Checking child issues...${NC}"
        
        # Get all open issues for this epic
        OPEN_ISSUES=$(gh issue list --label "epic-$EPIC_NUM" --state open --json number,title | jq -r '.[] | "#\(.number) \(.title)"' 2>/dev/null || echo "")
        
        if [ -n "$OPEN_ISSUES" ]; then
            echo -e "${RED}⚠️  Open issues found for this epic:${NC}"
            echo "$OPEN_ISSUES"
            echo ""
            read -p "Continue anyway? (y/N): " FORCE_CONTINUE
            if [[ "$FORCE_CONTINUE" != "y" && "$FORCE_CONTINUE" != "Y" ]]; then
                echo -e "${YELLOW}Epic completion cancelled${NC}"
                exit 0
            fi
        else
            echo -e "${GREEN}✅ All child issues are closed${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}🧪 Running tests...${NC}"
        echo "1. Run unit tests (npm test)"
        echo "2. Run security tests (npx electron tests/electron/security-test.js)"
        echo "3. Test application manually (npm run dev)"
        echo ""
        read -p "Have you run all tests and they pass? (y/N): " TESTS_PASS
        
        if [[ "$TESTS_PASS" != "y" && "$TESTS_PASS" != "Y" ]]; then
            echo -e "${YELLOW}Please run tests before completing the epic${NC}"
            exit 0
        fi
        
        echo ""
        echo -e "${BLUE}📝 Creating PR for epic...${NC}"
        
        # Create PR to main
        PR_TITLE="Epic #$EPIC_NUM: $(gh issue view $EPIC_NUM --json title -q .title 2>/dev/null || echo 'Epic completion')"
        PR_BODY="## Epic #$EPIC_NUM Completion

This PR completes Epic #$EPIC_NUM with all child issues resolved.

### Completed Issues:
$(gh issue list --label "epic-$EPIC_NUM" --state closed --json number,title | jq -r '.[] | "- [x] #\(.number) \(.title)"' 2>/dev/null || echo "- See epic for details")

### Testing:
- [ ] All unit tests pass
- [ ] Security tests pass
- [ ] Manual testing completed
- [ ] No regressions found

### Documentation:
- [ ] CLAUDE.md updated if needed
- [ ] PROJECT_LOG.txt updated
- [ ] README.md updated if needed"

        echo "$PR_BODY" > /tmp/pr_body.md
        
        PR_URL=$(gh pr create --title "$PR_TITLE" --body-file /tmp/pr_body.md --base main --head "$BRANCH_NAME" 2>/dev/null || echo "")
        
        if [ -n "$PR_URL" ]; then
            echo -e "${GREEN}✅ PR created: $PR_URL${NC}"
            
            echo ""
            read -p "Merge PR to main now? (y/N): " MERGE_PR
            if [[ "$MERGE_PR" == "y" || "$MERGE_PR" == "Y" ]]; then
                gh pr merge --merge --delete-branch
                echo -e "${GREEN}✅ Epic branch merged to main${NC}"
                
                # Close the epic issue
                echo ""
                echo -e "${BLUE}Closing epic issue #$EPIC_NUM...${NC}"
                gh issue close $EPIC_NUM --comment "✅ Epic completed and merged to main!"
                echo -e "${GREEN}✅ Epic #$EPIC_NUM closed${NC}"
                
                # Clean up child issue branches
                echo ""
                echo -e "${BLUE}🧹 Cleaning up branches...${NC}"
                CHILD_BRANCHES=$(git branch -r | grep "origin/feat/epic-$EPIC_NUM/issue-" | sed 's/origin\///')
                if [ -n "$CHILD_BRANCHES" ]; then
                    echo "Found child branches to clean up:"
                    echo "$CHILD_BRANCHES"
                    read -p "Delete all child branches? (y/N): " DELETE_CHILDREN
                    if [[ "$DELETE_CHILDREN" == "y" || "$DELETE_CHILDREN" == "Y" ]]; then
                        echo "$CHILD_BRANCHES" | while read branch; do
                            git push origin --delete "$branch" 2>/dev/null && echo "Deleted $branch" || echo "Failed to delete $branch"
                        done
                    fi
                fi
                
                # Switch back to main
                git checkout main
                git pull origin main
                echo -e "${GREEN}✅ Switched to main branch${NC}"
            fi
        else
            echo -e "${YELLOW}PR may already exist or creation failed${NC}"
        fi
    fi
fi

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
bash scripts/log.sh

echo ""
echo -e "${GREEN}✨ Work session completed!${NC}"
echo -e "${CYAN}Next: Use 'status' to see status or 'start' to work on next issue${NC}"