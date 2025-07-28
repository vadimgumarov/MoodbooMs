#!/bin/bash

# qa.sh - Quick Actions unified menu
# Central hub for all automation commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to create PR
create_pr() {
    echo -e "${BLUE}📤 Creating Pull Request...${NC}"
    
    # Get current branch
    BRANCH_NAME=$(git branch --show-current)
    if [ "$BRANCH_NAME" == "main" ]; then
        echo -e "${RED}Cannot create PR from main branch${NC}"
        return 1
    fi
    
    # Extract issue number from branch
    ISSUE_NUM=""
    if [[ "$BRANCH_NAME" =~ ^[^/]+/([0-9]+)- ]]; then
        ISSUE_NUM="${BASH_REMATCH[1]}"
    fi
    
    # Push current branch if needed
    echo -e "${CYAN}Pushing branch to remote...${NC}"
    git push -u origin "$BRANCH_NAME"
    
    if [ -n "$ISSUE_NUM" ]; then
        # Get issue details
        ISSUE_DETAILS=$(gh issue view "$ISSUE_NUM" --json title,body)
        ISSUE_TITLE=$(echo "$ISSUE_DETAILS" | jq -r .title)
        ISSUE_BODY=$(echo "$ISSUE_DETAILS" | jq -r .body | head -20)
        
        PR_TITLE="[#$ISSUE_NUM] $ISSUE_TITLE"
        PR_BODY="Closes #$ISSUE_NUM

## Summary
$ISSUE_BODY

## Changes
- See commits for detailed changes
"
        
        # Create PR
        gh pr create --title "$PR_TITLE" --body "$PR_BODY"
    else
        # No issue number, interactive PR creation
        gh pr create
    fi
}

# Function to sync with main
sync_main() {
    echo -e "${BLUE}🔄 Syncing with main branch...${NC}"
    
    current_branch=$(git branch --show-current)
    
    # Stash any uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}Stashing uncommitted changes...${NC}"
        git stash push -m "qa sync: temporary stash"
        stashed=true
    fi
    
    # Fetch latest
    echo "Fetching latest changes..."
    git fetch origin main
    
    # Merge or rebase
    echo -e "${CYAN}Merge or rebase? (m/r):${NC}"
    read -n 1 merge_type
    echo
    
    if [[ "$merge_type" == "r" || "$merge_type" == "R" ]]; then
        echo "Rebasing onto origin/main..."
        git rebase origin/main
    else
        echo "Merging origin/main..."
        git merge origin/main
    fi
    
    # Pop stash if we stashed
    if [ "$stashed" = true ]; then
        echo -e "${YELLOW}Restoring stashed changes...${NC}"
        git stash pop
    fi
    
    echo -e "${GREEN}✅ Sync complete!${NC}"
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Status Report${NC}"
    echo "────────────────────────────────────────────"
    
    # Git status
    echo -e "${CYAN}Git Status:${NC}"
    git status --short
    echo ""
    
    # Current branch and issue
    BRANCH_NAME=$(git branch --show-current)
    echo -e "${CYAN}Current Branch:${NC} $BRANCH_NAME"
    
    if [[ "$BRANCH_NAME" =~ ^[^/]+/([0-9]+)- ]]; then
        ISSUE_NUM="${BASH_REMATCH[1]}"
        echo -e "${CYAN}Working on Issue:${NC} #$ISSUE_NUM"
        echo ""
        # Show issue status
        gh issue view "$ISSUE_NUM" --json state,title,assignees -t "State: {{.state}}
Title: {{.title}}
Assignees: {{range .assignees}}{{.login}} {{end}}"
    fi
    echo ""
    
    # Recent commits
    echo -e "${CYAN}Recent Commits:${NC}"
    git log --oneline -5
}

# Function to show help
show_help() {
    echo -e "${BLUE}📚 Command Help${NC}"
    echo "────────────────────────────────────────────"
    echo ""
    echo -e "${GREEN}status${NC}  - Status Check"
    echo "      Shows project status, recent progress, and issue overview"
    echo ""
    echo -e "${GREEN}start${NC}  - Start Work on Issue"
    echo "      Select an issue, create branch, and start working"
    echo ""
    echo -e "${GREEN}finish${NC}  - Finish Work"
    echo "      Commit changes, push to remote, update issue, and log progress"
    echo ""
    echo -e "${GREEN}test${NC}  - Run Tests"
    echo "      Smart test runner that detects changes and runs relevant tests"
    echo ""
    echo -e "${GREEN}log${NC}  - Project Log"
    echo "      Update PROJECT_LOG.txt with daily progress"
    echo ""
    echo -e "${GREEN}pr${NC}  - Create PR"
    echo "      Create pull request for current branch with issue details"
    echo ""
    echo -e "${GREEN}sync${NC} - Sync with Main"
    echo "      Fetch and merge/rebase latest changes from main branch"
    echo ""
    echo -e "${GREEN}status${NC} - Show Status"
    echo "      Display git status, current issue, and recent commits"
}

# Main menu
clear
echo -e "${MAGENTA}⚡ Quick Actions${NC}"
echo "────────────────────────────────────────────"
echo ""
echo -e "  ${GREEN}start${NC}  - Start work on issue"
echo -e "  ${GREEN}finish${NC} - Finish work (commit, push, update)"
echo -e "  ${GREEN}test${NC}   - Run tests (smart test runner)"
echo -e "  ${GREEN}status${NC} - Status check (session overview)"
echo -e "  ${GREEN}log${NC}    - Project log (update log)"
echo ""
echo -e "  ${CYAN}pr${NC}     - Create PR for current branch"
echo -e "  ${CYAN}sync${NC}   - Sync with main branch"
echo -e "  ${CYAN}status${NC} - Quick git/issue status"
echo ""
echo -e "  ${YELLOW}help${NC}   - Show detailed help"
echo -e "  ${YELLOW}q${NC}      - Quit"
echo ""
echo -n "Action: "
read action

case "$action" in
    start)
        ./scripts/start.sh
        ;;
    finish)
        ./scripts/finish.sh
        ;;
    test)
        ./scripts/test.sh
        ;;
    status)
        bash scripts/status.sh
        ;;
    log)
        bash scripts/log.sh
        ;;
    pr)
        create_pr
        ;;
    sync)
        sync_main
        ;;
    status)
        show_status
        ;;
    help)
        show_help
        ;;
    q|quit|exit)
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid action: $action${NC}"
        echo "Use 'help' to see available commands"
        exit 1
        ;;
esac