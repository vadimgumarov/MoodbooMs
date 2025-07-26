#!/bin/bash

# cs - Claude Start shortcut
cs() {
    # Auto-clear for fresh view
    clear
    
    echo "🚀 Claude Start"
    echo "Branch: $(git branch --show-current)"
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "PROJECT_LOG.txt" ]; then
        echo "⚠️  Not in MoodBooMs directory!"
        return 1
    fi
    
    # Node.js environment check
    if [ -f "package.json" ]; then
        if [ -d "node_modules" ]; then
            echo "✓ Node modules installed"
        else
            echo "⚠️  Node modules not found! Run: npm install"
        fi
        
        # Check Node version
        NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")
        echo "✓ Node.js version: $NODE_VERSION"
    else
        echo "⚠️  package.json not found!"
    fi
    echo ""
    
    # Parse PROJECT_LOG.txt for completed tasks only (more focused)
    echo "📋 Recent Progress (Today):"
    echo "────────────────────────────────────────────"
    
    # Get today's and yesterday's dates
    today=$(date +"%Y-%m-%d")
    yesterday=$(date -v-1d +"%Y-%m-%d" 2>/dev/null || date -d "yesterday" +"%Y-%m-%d")
    
    # Extract completed tasks from today/yesterday
    echo "✅ Completed:"
    completed=$(awk -v today="$today" -v yesterday="$yesterday" '
        BEGIN { in_date = 0; found = 0 }
        /^[0-9]{4}-[0-9]{2}-[0-9]{2}/ {
            date = substr($0, 1, 10)
            in_date = (date == today || date == yesterday) ? 1 : 0
        }
        in_date && /COMPLETE|CLOSED|FIXED|ACCOMPLISHED|✅/ { found = 1 }
        in_date && found && /Issue #[0-9]+/ {
            match($0, /Issue #[0-9]+[^)]*/);
            if (RSTART > 0) print "   " substr($0, RSTART, RLENGTH)
        }
    ' PROJECT_LOG.txt | head -3)
    
    if [ -z "$completed" ]; then
        echo "   No completed issues today"
    else
        echo "$completed"
    fi
    echo ""
    
    # Get issue summary
    total_issues=$(gh issue list --state open --json id --jq 'length')
    critical=$(gh issue list --state open --label "priority:critical" --json id --jq 'length')
    high=$(gh issue list --state open --label "priority:high" --json id --jq 'length')
    echo "📊 Summary: $total_issues open issues | Critical: $critical | High: $high"
    echo ""
    
    # Show prioritized actionable issues only
    echo "🎯 Actionable Issues (by priority):"
    echo "────────────────────────────────────────────"
    
    # Critical issues
    if [ "$critical" -gt 0 ]; then
        echo "🔴 CRITICAL:"
        gh issue list --state open --label "priority:critical" --limit 5 --json number,title,labels --jq '.[] | "   \(.number): \(.title)"'
    fi
    
    # High priority non-epic issues
    high_features=$(gh issue list --state open --label "priority:high" --json number,title,labels --jq '.[] | select(.labels | map(.name) | contains(["type:epic"]) | not) | "\(.number): \(.title)"')
    if [ ! -z "$high_features" ]; then
        echo ""
        echo "🟠 HIGH PRIORITY:"
        echo "$high_features" | head -5 | sed 's/^/   /'
    fi
    
    # Current branch context
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" == *"feat"* ]] || [[ "$current_branch" == *"fix"* ]]; then
        # Extract issue number from branch
        if [[ "$current_branch" =~ ^[^/]+/([0-9]+)- ]]; then
            branch_issue="${BASH_REMATCH[1]}"
            related_tasks=$(gh issue list --state open --json number,title,labels --jq ".[] | select(.number == $branch_issue) | \"\\(.number): \\(.title)\"")
            if [ ! -z "$related_tasks" ]; then
                echo ""
                echo "🎯 Branch Context:"
                echo "   $related_tasks"
            fi
        fi
    fi
    echo ""
    
    # Check if on an issue branch to show current focus
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" =~ ^[^/]+/([0-9]+)- ]]; then
        issue_num="${BASH_REMATCH[1]}"
        issue_title=$(gh issue view "$issue_num" --json title -q .title 2>/dev/null || echo "")
        if [ -n "$issue_title" ]; then
            echo "🎯 Current Focus"
            echo "   Issue #$issue_num: $issue_title (in progress on current branch)"
            echo ""
        fi
    fi
    
    # Interactive menu - enhanced with new scripts
    echo "Quick Actions:"
    echo "  [Enter] Continue with current work"
    echo "  [1] Start new issue (wi)"
    echo "  [2] Finish current work (fw)"
    echo "  [3] Run tests (rt)"
    echo "  [4] Show all epics"
    echo "  [issue#] View specific issue"
    echo ""
    echo -n "Choice: "
    read choice
    
    case "$choice" in
        1)
            # Use the new wi script
            if [ -x "./scripts/wi.sh" ]; then
                ./scripts/wi.sh
            else
                echo -n "Issue # to start work on: "
                read issue_num
                if [ ! -z "$issue_num" ]; then
                    gh issue develop "$issue_num" --checkout
                fi
            fi
            ;;
        2)
            # Use the new fw script
            if [ -x "./scripts/fw.sh" ]; then
                ./scripts/fw.sh
            else
                echo "fw.sh script not found"
            fi
            ;;
        3)
            # Use the new rt script
            if [ -x "./scripts/rt.sh" ]; then
                ./scripts/rt.sh
            else
                echo ""
                echo "Running tests..."
                npm test
            fi
            ;;
        4)
            echo ""
            echo "📊 All EPICs:"
            gh issue list --state open --label "type:epic" --limit 15 --json number,title,labels --jq '.[] | "\(.number): \(.title)"'
            ;;
        [0-9]*)
            gh issue view "$choice"
            ;;
        *)
            # Just continue
            ;;
    esac
}

# Auto-run when script is executed directly OR when sourced with 'cs' command
# This ensures 'cs' command works without confirmation
cs