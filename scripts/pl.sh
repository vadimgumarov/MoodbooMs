#!/bin/bash

# pl - Simple Project Log Generator
pl() {
    echo "📝 Project Log"
    echo "────────────────────────────────────────────"
    
    # Get current date and time
    current_date=$(date +"%Y-%m-%d")
    current_time=$(date +"%H:%M")
    
    # Find the last log entry timestamp
    last_entry=$(grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:" PROJECT_LOG.txt 2>/dev/null | tail -1)
    if [ ! -z "$last_entry" ]; then
        last_timestamp=$(echo "$last_entry" | cut -d: -f1-2)
        # Convert to seconds since epoch for comparison
        last_date=$(echo "$last_timestamp" | cut -d' ' -f1)
        last_time=$(echo "$last_timestamp" | cut -d' ' -f2)
        last_epoch=$(date -j -f "%Y-%m-%d %H:%M" "$last_date $last_time" +%s 2>/dev/null || date -d "$last_date $last_time" +%s 2>/dev/null)
        
        # Get commits since last entry
        echo "Commits since last log entry ($last_timestamp):"
        new_commits=$(git log --since="$last_epoch" --oneline --no-merges 2>/dev/null)
    else
        echo "Recent commits:"
        new_commits=$(git log --oneline -10 --no-merges)
    fi
    
    # 1. Show new commits only
    echo ""
    if [ ! -z "$new_commits" ]; then
        echo "$new_commits" | head -5
    else
        echo "No new commits since last log entry"
    fi
    
    # Extract issue numbers from new commits only
    issue_nums=$(echo "$new_commits" | grep -oE "#[0-9]+" | sed 's/#//' | sort -u | tr '\n' ' ')
    
    # 2. Check which issues are closed
    echo ""
    echo "Issues worked on:"
    closed_issues=""
    open_issues=""
    
    for num in $issue_nums; do
        if gh issue view $num --json state,title 2>/dev/null | grep -q "CLOSED"; then
            title=$(gh issue view $num --json title -q .title 2>/dev/null)
            echo "  ✅ Closed #$num: $title"
            closed_issues="$closed_issues $num"
        else
            title=$(gh issue view $num --json title -q .title 2>/dev/null)
            echo "  🔄 Open #$num: $title" 
            open_issues="$open_issues $num"
        fi
    done
    
    # 3. Get all open issues and let user select next tasks
    echo ""
    echo "Open issues (select next priority tasks):"
    
    # Get all open issues sorted by priority
    all_issues=$(gh issue list --state open --limit 20 --json number,title,labels | \
        jq -r '.[] | 
        (if (.labels | map(.name) | contains(["priority:critical"])) then "1" 
         elif (.labels | map(.name) | contains(["priority:high"])) then "2"
         elif (.labels | map(.name) | contains(["priority:medium"])) then "3"
         else "4" end) + 
        ":#\(.number): \(.title)"' | \
        sort -t: -k1,1n | \
        head -10)
    
    # Display issues with numbers
    idx=1
    echo "$all_issues" | while IFS=: read -r priority num title; do
        case $priority in
            1) prio_label="[CRITICAL]" ;;
            2) prio_label="[HIGH]" ;;
            3) prio_label="[MEDIUM]" ;;
            *) prio_label="" ;;
        esac
        echo "  $idx. $num: $title $prio_label"
        ((idx++))
    done
    
    # Get user selection
    echo ""
    echo "Select next priority tasks (enter numbers 1-10 separated by spaces, or press Enter for none):"
    echo -n "> "
    read selected_tasks
    
    # Convert selections to issue numbers
    selected_issues=""
    if [ ! -z "$selected_tasks" ]; then
        for sel in $selected_tasks; do
            issue_line=$(echo "$all_issues" | sed -n "${sel}p")
            if [ ! -z "$issue_line" ]; then
                issue_num=$(echo "$issue_line" | cut -d# -f2 | cut -d: -f1)
                selected_issues="$selected_issues $issue_num"
            fi
        done
    fi
    
    # 4. Build simple log entry with strict format
    if [ ! -z "$closed_issues" ]; then
        description="Closed #$(echo $closed_issues | sed 's/ /, #/g')"
    elif [ ! -z "$open_issues" ]; then
        description="Progress on #$(echo $open_issues | sed 's/ /, #/g')"
    else
        # Count only new commits since last log entry
        if [ ! -z "$new_commits" ]; then
            new_commit_count=$(echo "$new_commits" | wc -l | tr -d ' ')
        else
            new_commit_count=0
        fi
        if [ "$new_commit_count" -gt 0 ]; then
            description="Development work - $new_commit_count new commits"
        else
            description="Session work (no new commits)"
        fi
    fi
    
    # Get list of modified files since last log entry
    if [ ! -z "$last_epoch" ]; then
        # Get the commit hash at the time of last log entry
        last_commit=$(git rev-list -n 1 --before="$last_epoch" HEAD 2>/dev/null)
        if [ ! -z "$last_commit" ]; then
            modified_files=$(git diff --name-only $last_commit HEAD 2>/dev/null | grep -E "\.(py|sh|yaml|json)$" | head -5 | sed 's/^/  - /')
        else
            modified_files=$(git diff --name-only HEAD~5 HEAD 2>/dev/null | grep -E "\.(py|sh|yaml|json)$" | head -5 | sed 's/^/  - /')
        fi
    else
        modified_files=$(git diff --name-only HEAD~5 HEAD 2>/dev/null | grep -E "\.(py|sh|yaml|json)$" | head -5 | sed 's/^/  - /')
    fi
    
    # Build entry with strict format
    log_entry="$current_date $current_time: $description
------------------------------------------------------------
Work completed:
$(if [ ! -z "$new_commits" ]; then
    echo "Commits:"
    echo "$new_commits" | head -5 | sed 's/^/  - /'
fi)

$(# Add session work based on unstaged changes
modified_count=$(git status --porcelain 2>/dev/null | grep "^ M" | wc -l | tr -d ' ')
if [ "$modified_count" -gt 0 ]; then
    echo ""
    echo "Session work (uncommitted):"
    git status --porcelain | grep "^ M" | awk '{print $2}' | while read file; do
        if echo "$file" | grep -q "pl.sh"; then
            echo "  - Enhanced project logging script with new features"
        elif echo "$file" | grep -q "cs.sh"; then
            echo "  - Improved session start script functionality"
        elif echo "$file" | grep -q "CLAUDE.md"; then
            echo "  - Updated project documentation and guidelines"
        elif echo "$file" | grep -q "PROJECT_LOG.txt"; then
            continue  # Skip the log file itself
        else
            echo "  - Modified: $file"
        fi
    done
fi)

Files modified:
$modified_files

Next priority tasks:
$(# Show actual top priority issues, not just recent ones
echo "GitHub Issues (Priority):"
# Get all open issues and sort by priority
gh issue list --state open --limit 30 --json number,title,labels | \
    jq -r '.[] | 
    (if (.labels | map(.name) | contains(["priority:critical"])) then "1[CRITICAL] " 
     elif (.labels | map(.name) | contains(["priority:high"])) then "2[HIGH] " 
     elif (.labels | map(.name) | contains(["priority:medium"])) then "3[MEDIUM] " 
     else "4" end) + 
    "  - #\(.number): \(.title)"' | \
    sort | \
    sed 's/^[1-4]//' | \
    head -5

echo ""
echo "Suggested Improvements (not yet in GitHub):"
# Dynamic suggestions based on recent work
if echo "$new_commits" | grep -q "test"; then
    echo "  - Add integration tests for the complete trading pipeline flow"
fi
if echo "$modified_files" | grep -q "risk_manager"; then
    echo "  - Implement dynamic risk adjustment based on market volatility (VIX)"
fi
if echo "$modified_files" | grep -q "orchestrator\|cli"; then
    echo "  - Add real-time dashboard for monitoring trading performance metrics"
fi
# Default suggestions if no specific patterns
if [ $(echo "$new_commits" | wc -l) -lt 3 ]; then
    echo "  - Implement portfolio rebalancing strategy to maintain optimal allocation"
    echo "  - Add machine learning model versioning and A/B testing framework"
    echo "  - Create automated performance reports with email notifications"
fi

)
"
    
    # 5. Save to log automatically
    echo ""
    echo "────────────────────────────────────────────"
    echo "$log_entry"
    echo "────────────────────────────────────────────"
    
    # Auto-save to PROJECT_LOG.txt - Insert after header
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Copy header (first 2 lines)
    head -2 PROJECT_LOG.txt > "$temp_file"
    
    # Add new entry with proper spacing
    echo "" >> "$temp_file"
    echo "$log_entry" >> "$temp_file"
    
    # Add the rest of the file (everything after line 2)
    tail -n +3 PROJECT_LOG.txt >> "$temp_file"
    
    # Replace the original file
    mv "$temp_file" PROJECT_LOG.txt
    
    echo ""
    echo "✅ Saved to PROJECT_LOG.txt (newest entry at top)"
    
    # Remind about GitHub updates
    if [ ! -z "$closed_issues" ]; then
        echo ""
        echo "📌 Remember to close issues on GitHub:"
        echo "gh issue close$closed_issues"
    fi
    if [ ! -z "$open_issues" ] && [ ! -z "$selected_issues" ]; then
        echo ""
        echo "📌 Update progress on GitHub:"
        for issue in $selected_issues; do
            echo "gh issue comment $issue --body \"Progress: [describe what was done]\""
        done
    fi
}

# Auto-run
pl