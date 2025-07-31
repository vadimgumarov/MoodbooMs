#!/bin/bash

# start.sh - Start work on issue
# Streamlines starting work on a GitHub issue
# Usage: start [issue-number]

set -e

# Colors for output
RED='\033[0;31m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if issue number provided as argument
if [ $# -eq 1 ] && [[ "$1" =~ ^[0-9]+$ ]]; then
    ISSUE_NUM="$1"
    echo -e "${BLUE}🎯 Starting work on issue #$ISSUE_NUM...${NC}"
    echo ""
else
    echo -e "${BLUE}🎯 Starting work on issue...${NC}"
    echo ""
    
    # Get open issues assigned to @me or unassigned
    echo "Fetching issues..."
    ISSUES=$(gh issue list --assignee @me --state open --json number,title,labels,assignees --limit 50)
    UNASSIGNED=$(gh issue list --assignee "" --state open --json number,title,labels,assignees --limit 50)
    
    # Combine and deduplicate issues
    COMBINED=$(echo "$ISSUES" "$UNASSIGNED" | jq -s 'add | unique_by(.number) | sort_by(.number)')
    
    # Parse and display issues with priority indicators
    echo -e "Select an issue to work on:\n"

# Function to get priority indicator
get_priority_indicator() {
    local labels="$1"
    if echo "$labels" | grep -q "priority:critical"; then
        echo -e "${RED}🔴${NC}"
    elif echo "$labels" | grep -q "priority:high"; then
        echo -e "${ORANGE}🟠${NC}"
    elif echo "$labels" | grep -q "priority:medium"; then
        echo -e "${YELLOW}🟡${NC}"
    else
        echo "  "
    fi
}

    # Display issues
    i=1
    declare -a issue_numbers
    while IFS= read -r issue; do
        number=$(echo "$issue" | jq -r '.number')
        title=$(echo "$issue" | jq -r '.title')
        labels=$(echo "$issue" | jq -r '.labels[].name' | tr '\n' ' ')
        assignees=$(echo "$issue" | jq -r '.assignees[].login' | tr '\n' ' ')
        
        # Skip epics
        if echo "$labels" | grep -q "type:epic"; then
            continue
        fi
        
        priority=$(get_priority_indicator "$labels")
        assigned=""
        if [ -n "$assignees" ]; then
            assigned=" (assigned)"
        fi
    
        printf "%2d %s #%-4d: %s%s\n" "$i" "$priority" "$number" "$title" "$assigned"
        issue_numbers[$i]=$number
        ((i++))
    done < <(echo "$COMBINED" | jq -c '.[]')

    echo ""
    read -p "Issue # to work on (or issue number): " selection
    
    # Handle direct issue number or selection
    if [[ "$selection" =~ ^[0-9]+$ ]]; then
        if [ "$selection" -le "${#issue_numbers[@]}" ]; then
            ISSUE_NUM="${issue_numbers[$selection]}"
        else
            ISSUE_NUM="$selection"
        fi
    else
        echo -e "${RED}Invalid selection${NC}"
        exit 1
    fi
fi

# Get issue details
ISSUE_DETAILS=$(gh issue view "$ISSUE_NUM" --json number,title,assignees,labels,state)
if [ -z "$ISSUE_DETAILS" ]; then
    echo -e "${RED}Issue #$ISSUE_NUM not found${NC}"
    exit 1
fi

# Extract issue info
ISSUE_TITLE=$(echo "$ISSUE_DETAILS" | jq -r '.title')
ISSUE_STATE=$(echo "$ISSUE_DETAILS" | jq -r '.state')
ISSUE_ASSIGNEES=$(echo "$ISSUE_DETAILS" | jq -r '.assignees[].login' | tr '\n' ' ')

# Check if issue is open
if [ "$ISSUE_STATE" != "OPEN" ]; then
    echo -e "${RED}Issue #$ISSUE_NUM is not open (state: $ISSUE_STATE)${NC}"
    exit 1
fi

# Detect if this is an epic
IS_EPIC=false
if echo "$ISSUE_TITLE" | grep -q "\[EPIC\]"; then
    IS_EPIC=true
fi

# Get current branch to determine parent
CURRENT_BRANCH=$(git branch --show-current)
PARENT_BRANCH="main"

# Check if we're on an epic branch
if [[ "$CURRENT_BRANCH" =~ ^feat/epic-[0-9]+ ]]; then
    if [ "$IS_EPIC" = true ]; then
        echo -e "${YELLOW}⚠️  You're on an epic branch but selected another epic${NC}"
        echo -e "${YELLOW}   Epics should branch from main${NC}"
        read -p "Switch to main first? (Y/n): " SWITCH_MAIN
        if [[ "$SWITCH_MAIN" != "n" && "$SWITCH_MAIN" != "N" ]]; then
            git checkout main
            git pull origin main
            PARENT_BRANCH="main"
        else
            exit 1
        fi
    else
        # Working on issue within an epic
        PARENT_BRANCH="$CURRENT_BRANCH"
    fi
fi

# Generate branch name
# Remove special characters and convert to lowercase
BRANCH_TITLE=$(echo "$ISSUE_TITLE" | sed 's/\[EPIC\] //' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]/-/g' | sed 's/ /-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
# Limit length
BRANCH_TITLE=$(echo "$BRANCH_TITLE" | cut -c1-50 | sed 's/-$//')

# Create appropriate branch name based on type
if [ "$IS_EPIC" = true ]; then
    BRANCH_NAME="feat/epic-$ISSUE_NUM-$BRANCH_TITLE"
    echo -e "${BLUE}🚀 Creating epic branch: $BRANCH_NAME${NC}"
else
    # Check if we're on an epic branch to create hierarchical name
    if [[ "$PARENT_BRANCH" =~ ^feat/epic-([0-9]+) ]]; then
        EPIC_NUM="${BASH_REMATCH[1]}"
        BRANCH_NAME="feat/epic-$EPIC_NUM/issue-$ISSUE_NUM-$BRANCH_TITLE"
        echo -e "${BLUE}📌 Creating issue branch: $BRANCH_NAME${NC}"
        echo -e "${CYAN}   (from epic #$EPIC_NUM)${NC}"
    else
        BRANCH_NAME="feat/$ISSUE_NUM-$BRANCH_TITLE"
        echo -e "${BLUE}📌 Creating branch: $BRANCH_NAME${NC}"
    fi
fi

# Check if branch already exists
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo -e "${YELLOW}Branch already exists, checking out...${NC}"
    git checkout "$BRANCH_NAME"
else
    # Pull latest from parent if not main
    if [ "$PARENT_BRANCH" != "main" ] && [ "$PARENT_BRANCH" != "$(git branch --show-current)" ]; then
        echo -e "${CYAN}Updating from parent branch: $PARENT_BRANCH${NC}"
        git checkout "$PARENT_BRANCH"
        git pull origin "$PARENT_BRANCH" 2>/dev/null || true
    fi
    
    # Create and checkout new branch
    git checkout -b "$BRANCH_NAME"
fi

# Auto-assign issue if not assigned
if [ -z "$ISSUE_ASSIGNEES" ]; then
    echo -e "${GREEN}✅ Assigning issue to you...${NC}"
    gh issue edit "$ISSUE_NUM" --add-assignee @me
fi

# Update project status to "In Progress"
echo -e "${GREEN}📊 Updating project status to 'In Progress'...${NC}"
# First, we need to find the item ID in the project for this issue
ITEM_DATA=$(gh project item-list 6 --owner vadimgumarov --format json --limit 100 2>/dev/null | jq -r ".items[] | select(.content.number == $ISSUE_NUM) | {id: .id, fieldValues: .fieldValues}" 2>/dev/null)

if [ -n "$ITEM_DATA" ]; then
    ITEM_ID=$(echo "$ITEM_DATA" | jq -r '.id')
    if [ -n "$ITEM_ID" ]; then
        # Update the status field
        gh project item-edit --project-id PVT_kwHOAVLXms4A-2sf --id "$ITEM_ID" --field-id PVTSSF_lAHOAVLXms4A-2sfzgyIiHA --single-select-option-id 47fc9ee4 2>/dev/null && {
            echo -e "${GREEN}   ✓ Status updated to 'In Progress'${NC}"
        } || {
            echo -e "${YELLOW}   ⚠ Could not update status${NC}"
        }
    fi
else
    echo -e "${YELLOW}   Note: Issue not found in project board${NC}"
fi

# Add comment to issue with branch name
echo -e "${GREEN}💬 Adding comment to issue...${NC}"
gh issue comment "$ISSUE_NUM" --body "Started work on this issue in branch \`$BRANCH_NAME\`"

# Clear screen and show issue details
clear

echo -e "${GREEN}✨ Ready to work on Issue #$ISSUE_NUM${NC}"
echo ""
gh issue view "$ISSUE_NUM"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Write code and tests for this issue"
echo "2. Run tests with: test (or npm test)"
echo "3. When done, use: finish (finish work)"
echo ""
echo -e "${YELLOW}Current branch: $BRANCH_NAME${NC}"