#!/bin/bash

# log.sh - Smart Project Documentation Manager
# Reviews and updates CLAUDE.md, README.md, and PROJECT_LOG.txt
# Usage: log

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Project Documentation Manager${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Get current date and time in PST/PDT
current_date=$(date '+%Y-%m-%d %H:%M')

# Function to detect what type of changes were made
detect_changes() {
    local changed_files="$1"
    local commits="$2"
    local changes_detected=""
    
    # Check for script changes
    if echo "$changed_files" | grep -q "scripts/"; then
        changes_detected="${changes_detected}SCRIPTS "
    fi
    
    # Check for security changes
    if echo "$changed_files" | grep -q "security\|preload\|ipc\|csp"; then
        changes_detected="${changes_detected}SECURITY "
    fi
    
    # Check for architecture changes
    if echo "$changed_files" | grep -q "core/\|contexts/\|hooks/"; then
        changes_detected="${changes_detected}ARCHITECTURE "
    fi
    
    # Check for mode/feature changes
    if echo "$commits" | grep -qi "mode\|queen\|king\|badass"; then
        changes_detected="${changes_detected}MODES "
    fi
    
    # Check for bug fixes
    if echo "$commits" | grep -qi "fix\|crash\|error\|bug"; then
        changes_detected="${changes_detected}FIXES "
    fi
    
    # Check for new features
    if echo "$commits" | grep -qi "feat\|add\|implement"; then
        changes_detected="${changes_detected}FEATURES "
    fi
    
    echo "$changes_detected"
}

# Function to suggest CLAUDE.md updates
suggest_claude_updates() {
    local changes="$1"
    local suggestions=""
    
    if [[ "$changes" == *"SCRIPTS"* ]]; then
        suggestions="${suggestions}
- Update script documentation with new names and usage
- Document new workflow patterns"
    fi
    
    if [[ "$changes" == *"SECURITY"* ]]; then
        suggestions="${suggestions}
- Update security configuration section
- Document any new security patterns or requirements"
    fi
    
    if [[ "$changes" == *"ARCHITECTURE"* ]]; then
        suggestions="${suggestions}
- Update architecture documentation
- Document new module structure or patterns"
    fi
    
    if [[ "$changes" == *"MODES"* ]]; then
        suggestions="${suggestions}
- Update mode system documentation
- Document Queen/King mode implementation details"
    fi
    
    if [[ "$changes" == *"FIXES"* ]]; then
        suggestions="${suggestions}
- Add to 'App Crashes and Debugging' section
- Document workarounds or solutions"
    fi
    
    echo "$suggestions"
}

# Function to suggest README.md updates
suggest_readme_updates() {
    local changes="$1"
    local suggestions=""
    
    if [[ "$changes" == *"FEATURES"* ]]; then
        suggestions="${suggestions}
- Update features list
- Add new user-facing functionality"
    fi
    
    if [[ "$changes" == *"SCRIPTS"* ]]; then
        suggestions="${suggestions}
- Update development workflow section
- Document new script usage"
    fi
    
    if [[ "$changes" == *"MODES"* ]]; then
        suggestions="${suggestions}
- Update mode descriptions
- Add Queen/King mode documentation"
    fi
    
    echo "$suggestions"
}

# Step 1: Analyze recent changes
echo -e "${CYAN}Step 1: Analyzing recent changes...${NC}"

# Get commits since last log entry
last_entry=$(grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:" PROJECT_LOG.txt 2>/dev/null | head -1)
if [ ! -z "$last_entry" ]; then
    last_timestamp=$(echo "$last_entry" | cut -d: -f1-2)
    last_date_only=$(echo "$last_timestamp" | cut -d' ' -f1)
    last_time_only=$(echo "$last_timestamp" | cut -d' ' -f2)
    
    # Get commits since last entry
    echo "Changes since last log entry ($last_timestamp):"
    new_commits=$(git log --since="$last_date_only $last_time_only" --oneline --no-merges 2>/dev/null || echo "")
else
    echo "Recent commits:"
    new_commits=$(git log --oneline -10 --no-merges)
fi

# Show commits
if [ ! -z "$new_commits" ]; then
    echo "$new_commits" | head -10
else
    echo "No new commits since last log entry"
fi

# Get changed files
echo ""
echo -e "${CYAN}Modified files:${NC}"
if [ ! -z "$last_entry" ]; then
    changed_files=$(git diff --name-only @{1.hour.ago} 2>/dev/null || git diff --name-only HEAD~5 HEAD 2>/dev/null || echo "")
else
    changed_files=$(git diff --name-only HEAD~5 HEAD 2>/dev/null || echo "")
fi

if [ ! -z "$changed_files" ]; then
    echo "$changed_files" | head -10
else
    echo "No file changes detected"
fi

# Step 2: Review documentation needs
echo ""
echo -e "${CYAN}Step 2: Reviewing documentation needs...${NC}"

# Detect types of changes
change_types=$(detect_changes "$changed_files" "$new_commits")
echo "Change categories detected: $change_types"

# Suggest CLAUDE.md updates
claude_suggestions=$(suggest_claude_updates "$change_types")
if [ ! -z "$claude_suggestions" ]; then
    echo ""
    echo -e "${YELLOW}Suggested CLAUDE.md updates:${NC}"
    echo "$claude_suggestions"
fi

# Suggest README.md updates  
readme_suggestions=$(suggest_readme_updates "$change_types")
if [ ! -z "$readme_suggestions" ]; then
    echo ""
    echo -e "${YELLOW}Suggested README.md updates:${NC}"
    echo "$readme_suggestions"
fi

# Step 3: Interactive documentation updates
echo ""
echo -e "${CYAN}Step 3: Documentation Updates${NC}"
echo "────────────────────────────────────────────"

# CLAUDE.md update
echo ""
read -p "Any critical updates for CLAUDE.md? (development practices, solutions, warnings) [Enter to skip]: " claude_update
if [ ! -z "$claude_update" ]; then
    echo ""
    echo -e "${GREEN}✓ Note: Remember to manually update CLAUDE.md with:${NC}"
    echo "  $claude_update"
fi

# README.md update
echo ""
read -p "Any user-facing updates for README.md? (features, usage) [Enter to skip]: " readme_update
if [ ! -z "$readme_update" ]; then
    echo ""
    echo -e "${GREEN}✓ Note: Remember to manually update README.md with:${NC}"
    echo "  $readme_update"
fi

# Step 4: Generate PROJECT_LOG entry
echo ""
echo -e "${CYAN}Step 4: Creating PROJECT_LOG entry...${NC}"

# Extract issue numbers from commits
issue_nums=$(echo "$new_commits" | grep -oE "#[0-9]+" | sed 's/#//' | sort -u | tr '\n' ' ')

# Check which issues are closed
closed_issues=""
open_issues=""
for num in $issue_nums; do
    if [ ! -z "$num" ]; then
        if gh issue view $num --json state 2>/dev/null | grep -q "CLOSED"; then
            title=$(gh issue view $num --json title -q .title 2>/dev/null || echo "Unknown")
            closed_issues="${closed_issues}Issue #$num ($title), "
        else
            title=$(gh issue view $num --json title -q .title 2>/dev/null || echo "Unknown")
            open_issues="${open_issues}Issue #$num ($title), "
        fi
    fi
done

# Remove trailing commas
closed_issues=${closed_issues%, }
open_issues=${open_issues%, }

# Get a brief summary of work
echo ""
read -p "Brief summary of work completed (or press Enter for auto-generated): " work_summary

if [ -z "$work_summary" ]; then
    if [ ! -z "$closed_issues" ]; then
        work_summary="Completed: $closed_issues"
    elif [ ! -z "$open_issues" ]; then
        work_summary="Progress on: $open_issues"
    else
        commit_count=$(echo "$new_commits" | wc -l | tr -d ' ')
        work_summary="Development work - $commit_count commits"
    fi
fi

# Build the log entry
log_entry="$current_date: $work_summary
------------------------------------------------------------------------------"

# Add detailed work completed section
if [ ! -z "$new_commits" ] || [ ! -z "$closed_issues" ] || [ ! -z "$open_issues" ]; then
    log_entry="$log_entry
Work completed:
"
    if [ ! -z "$closed_issues" ]; then
        log_entry="$log_entry
✅ Closed Issues:
$(echo "$closed_issues" | tr ',' '\n' | sed 's/^ */- /')
"
    fi
    
    if [ ! -z "$open_issues" ]; then
        log_entry="$log_entry
🔄 Progress on Issues:
$(echo "$open_issues" | tr ',' '\n' | sed 's/^ */- /')
"
    fi
    
    if [ ! -z "$new_commits" ]; then
        log_entry="$log_entry
Commits:
$(echo "$new_commits" | head -5 | sed 's/^/- /')
"
    fi
fi

# Add key changes section if applicable
key_changes=""
if [[ "$change_types" == *"SCRIPTS"* ]]; then
    key_changes="${key_changes}- Updated development scripts with intuitive names\n"
fi
if [[ "$change_types" == *"ARCHITECTURE"* ]]; then
    key_changes="${key_changes}- Enhanced modular architecture\n"
fi
if [[ "$change_types" == *"MODES"* ]]; then
    key_changes="${key_changes}- Improved Queen/King mode system\n"
fi
if [[ "$change_types" == *"FIXES"* ]]; then
    key_changes="${key_changes}- Fixed bugs and stability issues\n"
fi

if [ ! -z "$key_changes" ]; then
    log_entry="$log_entry
Key Changes:
$(echo -e "$key_changes")"
fi

# Add documentation updates if any
if [ ! -z "$claude_update" ] || [ ! -z "$readme_update" ]; then
    log_entry="$log_entry
Documentation Updates:"
    if [ ! -z "$claude_update" ]; then
        log_entry="$log_entry
- CLAUDE.md: $claude_update"
    fi
    if [ ! -z "$readme_update" ]; then
        log_entry="$log_entry
- README.md: $readme_update"
    fi
fi

# Add next steps
echo ""
echo -e "${CYAN}Next priority tasks:${NC}"
echo "Select priority issues for next session (1-5, space-separated, or Enter for none):"
echo ""

# Get high priority issues
gh issue list --state open --limit 10 --json number,title,labels | \
    jq -r '.[] | 
    select(.labels | map(.name) | contains(["type:epic"]) | not) |
    (if (.labels | map(.name) | contains(["priority:critical"])) then "🔴 CRITICAL" 
     elif (.labels | map(.name) | contains(["priority:high"])) then "🟠 HIGH" 
     elif (.labels | map(.name) | contains(["priority:medium"])) then "🟡 MEDIUM" 
     else "⚪ LOW" end) + 
    " #\(.number): \(.title)"' | \
    cat -n

echo ""
read -p "Select issues: " selected_nums

if [ ! -z "$selected_nums" ]; then
    log_entry="$log_entry

Next Priority Tasks:"
    for num in $selected_nums; do
        issue_info=$(gh issue list --state open --limit 10 --json number,title | jq -r ".[$((num-1))] | \"- Issue #\\(.number): \\(.title)\"" 2>/dev/null)
        if [ ! -z "$issue_info" ]; then
            log_entry="$log_entry
$issue_info"
        fi
    done
fi

# Step 5: Save to PROJECT_LOG.txt (newest at top)
echo ""
echo -e "${CYAN}Step 5: Saving to PROJECT_LOG.txt...${NC}"

# Create temporary file
temp_file=$(mktemp)

# Copy header (first 2 lines)
head -2 PROJECT_LOG.txt > "$temp_file"

# Add new entry with proper spacing
echo "" >> "$temp_file"
echo "$log_entry" >> "$temp_file"
echo "" >> "$temp_file"

# Add the rest of the file (everything after line 2)
tail -n +3 PROJECT_LOG.txt >> "$temp_file"

# Replace the original file
mv "$temp_file" PROJECT_LOG.txt

echo -e "${GREEN}✅ PROJECT_LOG.txt updated (newest entry at top)${NC}"

# Step 6: Summary and reminders
echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Documentation review complete!${NC}"
echo ""

if [ ! -z "$claude_update" ]; then
    echo -e "${YELLOW}⚠️  Remember to update CLAUDE.md with your notes${NC}"
fi

if [ ! -z "$readme_update" ]; then
    echo -e "${YELLOW}⚠️  Remember to update README.md with your notes${NC}"
fi

if [ ! -z "$closed_issues" ]; then
    echo ""
    echo -e "${CYAN}📌 Close these issues on GitHub:${NC}"
    for num in $issue_nums; do
        if gh issue view $num --json state 2>/dev/null | grep -q "CLOSED"; then
            echo "gh issue close $num --comment \"✅ Completed\""
        fi
    done
fi

echo ""
echo -e "${BLUE}Next: Use 'status' to check project state or 'start' to begin work${NC}"