#!/bin/bash

# status - Project Status shortcut
status() {
    # Auto-clear for fresh view
    clear
    
    echo "🚀 Claude Start"
    echo "Branch: $(git branch --show-current)"
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "PROJECT_LOG.txt" ]; then
        echo "⚠️  Not in TradingStrategy directory!"
        return 1
    fi
    
    # Virtual environment check - fixed to work properly
    if [ -z "$VIRTUAL_ENV" ]; then
        if [ -d "venv" ]; then
            # Use . instead of source for better compatibility
            . ./venv/bin/activate
            if [ ! -z "$VIRTUAL_ENV" ]; then
                echo "✓ Virtual env activated: venv"
            else
                echo "⚠️  Failed to activate virtual environment"
            fi
        else
            echo "⚠️  Virtual environment not found! Run: python -m venv venv"
        fi
    else
        echo "✓ Virtual env active: $(basename $VIRTUAL_ENV)"
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
    if [[ "$current_branch" == *"orchestrator"* ]]; then
        orchestrator_tasks=$(gh issue list --state open --label "component:orchestration" --json number,title,labels --jq '.[] | select(.labels | map(.name) | contains(["type:epic"]) | not) | "\(.number): \(.title)"')
        if [ ! -z "$orchestrator_tasks" ]; then
            echo ""
            echo "🎯 Branch Context (orchestrator):"
            echo "$orchestrator_tasks" | head -3 | sed 's/^/   /'
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
    echo "  [1] Start new issue (start)"
    echo "  [2] Finish current work (finish)"
    echo "  [3] Run tests (test)"
    echo "  [4] Show all epics"
    echo "  [issue#] View specific issue"
    echo ""
    echo -n "Choice: "
    read choice
    
    case "$choice" in
        1)
            # Use the new wi script
            if [ -x "./scripts/start.sh" ]; then
                ./scripts/start.sh
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
            if [ -x "./scripts/finish.sh" ]; then
                ./scripts/finish.sh
            else
                echo "finish.sh script not found"
            fi
            ;;
        3)
            # Use the new rt script
            if [ -x "./scripts/test.sh" ]; then
                ./scripts/test.sh
            else
                echo ""
                echo "Running tests..."
                pytest tests/ --cov=modules --cov=strategies --cov=utils -v
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

# Auto-run when script is executed directly OR when sourced with 'status' command
# This ensures 'status' command works without confirmation
status