#!/bin/bash

# wi.sh - Work on Issue
# Streamlines starting work on a GitHub issue

set -e

# Colors for output
RED='\033[0;31m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Generate branch name
# Remove special characters and convert to lowercase
BRANCH_TITLE=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]/-/g' | sed 's/ /-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
# Limit length
BRANCH_TITLE=$(echo "$BRANCH_TITLE" | cut -c1-50 | sed 's/-$//')
BRANCH_NAME="feat/$ISSUE_NUM-$BRANCH_TITLE"

echo -e "${BLUE}📌 Creating branch: $BRANCH_NAME${NC}"

# Check if branch already exists
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo -e "${YELLOW}Branch already exists, checking out...${NC}"
    git checkout "$BRANCH_NAME"
else
    # Create and checkout new branch
    git checkout -b "$BRANCH_NAME"
fi

# Auto-assign issue if not assigned
if [ -z "$ISSUE_ASSIGNEES" ]; then
    echo -e "${GREEN}✅ Assigning issue to you...${NC}"
    gh issue edit "$ISSUE_NUM" --add-assignee @me
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
echo "2. Run tests with: rt (or pytest tests/)"
echo "3. When done, use: fw (finish work)"
echo ""
echo -e "${YELLOW}Current branch: $BRANCH_NAME${NC}"