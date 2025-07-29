#!/bin/bash

# review.sh - Smart Documentation Review and Optimization Tool
# Analyzes CLAUDE.md and README.md for duplicates, outdated content, and optimization opportunities
# Usage: review

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📚 Documentation Review & Optimization Tool${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if files exist
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}Error: CLAUDE.md not found${NC}"
    exit 1
fi

if [ ! -f "README.md" ]; then
    echo -e "${RED}Error: README.md not found${NC}"
    exit 1
fi

# Read files
claude_content=$(cat CLAUDE.md)
readme_content=$(cat README.md)

# Function to extract sections from markdown
extract_sections() {
    local file="$1"
    grep "^##\+ " "$file" | sed 's/^#\+ //'
}

# Function to find similar content
find_similar_content() {
    local file1="$1"
    local file2="$2"
    local duplicates=""
    
    # Check for common code blocks
    local code_blocks1=$(grep -A 5 '```' "$file1" 2>/dev/null | grep -v '```' | sort | uniq)
    local code_blocks2=$(grep -A 5 '```' "$file2" 2>/dev/null | grep -v '```' | sort | uniq)
    
    # Find duplicate code examples
    while IFS= read -r line; do
        if [ ! -z "$line" ] && echo "$code_blocks2" | grep -F "$line" >/dev/null 2>&1; then
            duplicates="${duplicates}\n- Code block: ${line:0:50}..."
        fi
    done <<< "$code_blocks1"
    
    echo "$duplicates"
}

# Function to detect outdated content
detect_outdated() {
    local content="$1"
    local filename="$2"
    local outdated=""
    
    # Check for old script names
    if echo "$content" | grep -E "wi\.sh|fw\.sh|cs\.sh|rt\.sh|qa\.sh|pl\.sh|fix\.sh" >/dev/null 2>&1; then
        outdated="${outdated}\n- Old script names found (should be: start.sh, finish.sh, status.sh, test.sh, check.sh, log.sh, hotfix.sh)"
    fi
    
    # Check for deprecated patterns
    if echo "$content" | grep -i "badassMode" >/dev/null 2>&1; then
        outdated="${outdated}\n- References to 'badassMode' (now using mode: 'queen'/'king')"
    fi
    
    # Check for old NodeJS patterns
    if echo "$content" | grep -i "nodeIntegration.*true" >/dev/null 2>&1; then
        outdated="${outdated}\n- nodeIntegration: true (should be false with contextBridge)"
    fi
    
    # Check for old Epic workflow
    if echo "$content" | grep -i "feat/issue-" >/dev/null 2>&1; then
        outdated="${outdated}\n- Old branch naming (should include epic: feat/epic-X/issue-Y)"
    fi
    
    # Check for missing modern features
    if ! echo "$content" | grep -i "SimpleModeContext" >/dev/null 2>&1 && [ "$filename" = "CLAUDE.md" ]; then
        outdated="${outdated}\n- Missing SimpleModeContext documentation"
    fi
    
    echo "$outdated"
}

# Function to detect irrelevant content
detect_irrelevant() {
    local content="$1"
    local filename="$2"
    local irrelevant=""
    
    # Check for todo/fixme comments
    if echo "$content" | grep -i "TODO\|FIXME\|HACK" >/dev/null 2>&1; then
        irrelevant="${irrelevant}\n- Contains TODO/FIXME comments that should be in issues"
    fi
    
    # Check for personal notes
    if echo "$content" | grep -E "vadim|claude\.ai|anthropic" >/dev/null 2>&1; then
        if [ "$filename" = "README.md" ]; then
            irrelevant="${irrelevant}\n- Contains personal/development references in user-facing doc"
        fi
    fi
    
    # Check for debugging code
    if echo "$content" | grep -i "console\.log\|debugger\|print(" >/dev/null 2>&1; then
        irrelevant="${irrelevant}\n- Contains debug code examples"
    fi
    
    echo "$irrelevant"
}

# Function to suggest missing content
suggest_missing() {
    local claude="$1"
    local readme="$2"
    local missing=""
    
    # Check CLAUDE.md for missing dev info
    if ! echo "$claude" | grep -i "test.*coverage" >/dev/null 2>&1; then
        missing="${missing}\n[CLAUDE.md] - Add test coverage requirements and goals"
    fi
    
    if ! echo "$claude" | grep -i "performance.*optimization" >/dev/null 2>&1; then
        missing="${missing}\n[CLAUDE.md] - Add performance optimization guidelines"
    fi
    
    if ! echo "$claude" | grep -i "error.*handling" >/dev/null 2>&1; then
        missing="${missing}\n[CLAUDE.md] - Add error handling patterns and best practices"
    fi
    
    if ! echo "$claude" | grep -i "git.*hooks" >/dev/null 2>&1; then
        missing="${missing}\n[CLAUDE.md] - Add git hooks setup for code quality"
    fi
    
    # Check README.md for missing user info
    if ! echo "$readme" | grep -i "screenshot\|demo\|gif" >/dev/null 2>&1; then
        missing="${missing}\n[README.md] - Add screenshots or demo GIFs"
    fi
    
    if ! echo "$readme" | grep -i "troubleshooting" >/dev/null 2>&1; then
        missing="${missing}\n[README.md] - Add troubleshooting section"
    fi
    
    if ! echo "$readme" | grep -i "contributing" >/dev/null 2>&1; then
        missing="${missing}\n[README.md] - Add contributing guidelines"
    fi
    
    if ! echo "$readme" | grep -i "license" >/dev/null 2>&1; then
        missing="${missing}\n[README.md] - Add license information"
    fi
    
    echo "$missing"
}

# Function to analyze document structure
analyze_structure() {
    local file="$1"
    local name="$2"
    
    echo -e "\n${CYAN}Structure of $name:${NC}"
    
    # Count sections
    local h1_count=$(grep -c "^# " "$file" || echo 0)
    local h2_count=$(grep -c "^## " "$file" || echo 0)
    local h3_count=$(grep -c "^### " "$file" || echo 0)
    local code_count=$(grep -c "^$backtick$backtick$backtick" "$file" || echo 0)
    local line_count=$(wc -l < "$file")
    
    echo "- Total lines: $line_count"
    echo "- H1 sections: $h1_count"
    echo "- H2 sections: $h2_count"
    echo "- H3 sections: $h3_count"
    echo "- Code blocks: $code_count"
}

# Start analysis
echo -e "${CYAN}Step 1: Analyzing Document Structure${NC}"
echo "────────────────────────────────────────────"

analyze_structure "CLAUDE.md" "CLAUDE.md"
analyze_structure "README.md" "README.md"

# Check for duplicates
echo ""
echo -e "${CYAN}Step 2: Detecting Duplicate Content${NC}"
echo "────────────────────────────────────────────"

# Extract common sections
claude_sections=$(extract_sections CLAUDE.md)
readme_sections=$(extract_sections README.md)

echo -e "${YELLOW}Similar section names:${NC}"
duplicate_sections=""
while IFS= read -r section; do
    if echo "$readme_sections" | grep -F "$section" >/dev/null 2>&1; then
        duplicate_sections="${duplicate_sections}\n- $section"
    fi
done <<< "$claude_sections"

if [ ! -z "$duplicate_sections" ]; then
    echo -e "$duplicate_sections"
else
    echo "- No duplicate section names found"
fi

# Check for duplicate content
echo -e "\n${YELLOW}Duplicate content blocks:${NC}"
similar_content=$(find_similar_content "CLAUDE.md" "README.md")
if [ ! -z "$similar_content" ]; then
    echo -e "$similar_content"
else
    echo "- No significant duplicate content found"
fi

# Check for outdated content
echo ""
echo -e "${CYAN}Step 3: Detecting Outdated Content${NC}"
echo "────────────────────────────────────────────"

echo -e "${YELLOW}In CLAUDE.md:${NC}"
claude_outdated=$(detect_outdated "$claude_content" "CLAUDE.md")
if [ ! -z "$claude_outdated" ]; then
    echo -e "$claude_outdated"
else
    echo "- No outdated content detected"
fi

echo -e "\n${YELLOW}In README.md:${NC}"
readme_outdated=$(detect_outdated "$readme_content" "README.md")
if [ ! -z "$readme_outdated" ]; then
    echo -e "$readme_outdated"
else
    echo "- No outdated content detected"
fi

# Check for irrelevant content
echo ""
echo -e "${CYAN}Step 4: Detecting Irrelevant/Obsolete Content${NC}"
echo "────────────────────────────────────────────"

echo -e "${YELLOW}In CLAUDE.md:${NC}"
claude_irrelevant=$(detect_irrelevant "$claude_content" "CLAUDE.md")
if [ ! -z "$claude_irrelevant" ]; then
    echo -e "$claude_irrelevant"
else
    echo "- No irrelevant content detected"
fi

echo -e "\n${YELLOW}In README.md:${NC}"
readme_irrelevant=$(detect_irrelevant "$readme_content" "README.md")
if [ ! -z "$readme_irrelevant" ]; then
    echo -e "$readme_irrelevant"
else
    echo "- No irrelevant content detected"
fi

# Suggest missing content
echo ""
echo -e "${CYAN}Step 5: Suggesting Missing Content${NC}"
echo "────────────────────────────────────────────"

missing_content=$(suggest_missing "$claude_content" "$readme_content")
if [ ! -z "$missing_content" ]; then
    echo -e "${YELLOW}Recommended additions:${NC}"
    echo -e "$missing_content"
else
    echo "- Documents appear complete"
fi

# Optimization suggestions
echo ""
echo -e "${CYAN}Step 6: Smart Optimization Suggestions${NC}"
echo "════════════════════════════════════════════════════════════════"

echo -e "\n${GREEN}For CLAUDE.md (Developer Documentation):${NC}"
echo "1. **Keep Focused**: This should be purely technical implementation details"
echo "2. **Organize by Workflow**: Group content by development workflow stages"
echo "3. **Add Quick Reference**: Create a cheat sheet section for common tasks"
echo "4. **Update Examples**: Ensure all code examples use current patterns"

echo -e "\n${GREEN}For README.md (User Documentation):${NC}"
echo "1. **User-First**: Remove all developer-specific details"
echo "2. **Visual Priority**: Add screenshots at the top"
echo "3. **Quick Start**: Make installation/usage the first main section"
echo "4. **Simplify**: Move technical details to CLAUDE.md"

echo -e "\n${GREEN}Content Migration Suggestions:${NC}"
# Analyze what should move between files
if echo "$readme_content" | grep -i "architecture\|implementation\|technical" >/dev/null 2>&1; then
    echo "- Move technical architecture details from README.md → CLAUDE.md"
fi

if echo "$claude_content" | grep -i "installation\|download\|quick start" >/dev/null 2>&1; then
    echo "- Move user installation guides from CLAUDE.md → README.md"
fi

echo -e "\n${GREEN}Structural Improvements:${NC}"
echo "1. **CLAUDE.md Structure**:"
echo "   - Quick Reference (scripts, commands)"
echo "   - Architecture Overview"
echo "   - Development Workflow"
echo "   - Testing & Debugging"
echo "   - Common Issues & Solutions"
echo "   - Code Style & Patterns"

echo -e "\n2. **README.md Structure**:"
echo "   - Hero Image/Demo GIF"
echo "   - What is MoodbooM?"
echo "   - Quick Start"
echo "   - Features"
echo "   - Usage"
echo "   - Troubleshooting"
echo "   - Contributing"

# Summary report
echo ""
echo -e "${CYAN}Step 7: Action Items Summary${NC}"
echo "════════════════════════════════════════════════════════════════"

action_count=0

if [ ! -z "$duplicate_sections" ] || [ ! -z "$similar_content" ]; then
    ((action_count++))
    echo -e "\n${ORANGE}$action_count. Remove Duplicates:${NC}"
    echo "   - Consolidate duplicate sections"
    echo "   - Keep user content in README, dev content in CLAUDE"
fi

if [ ! -z "$claude_outdated" ] || [ ! -z "$readme_outdated" ]; then
    ((action_count++))
    echo -e "\n${ORANGE}$action_count. Update Outdated Content:${NC}"
    echo "   - Update old script names to new ones"
    echo "   - Update deprecated patterns"
    echo "   - Refresh examples with current code"
fi

if [ ! -z "$missing_content" ]; then
    ((action_count++))
    echo -e "\n${ORANGE}$action_count. Add Missing Sections:${NC}"
    echo "   - Add suggested missing content"
    echo "   - Ensure both docs are comprehensive"
fi

((action_count++))
echo -e "\n${ORANGE}$action_count. Optimize Structure:${NC}"
echo "   - Reorganize sections for better flow"
echo "   - Separate user and developer content clearly"
echo "   - Add visual elements to README"

echo ""
echo -e "${GREEN}✅ Documentation review complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review the suggestions above"
echo "2. Create a documentation update plan"
echo "3. Update both files systematically"
echo "4. Run review again to verify improvements"
echo ""
echo -e "${YELLOW}Tip: Save this output for reference: ./scripts/review.sh > review_report.txt${NC}"