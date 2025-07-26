#!/bin/bash

# rt.sh - Run Tests
# Smart test runner that auto-detects changed files and runs relevant tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running tests...${NC}"
echo ""

# Function to find test file for a given source file
find_test_file() {
    local source_file="$1"
    local base_name=$(basename "$source_file" .py)
    local test_file=""
    
    # Look for corresponding test file
    if [[ "$source_file" =~ ^modules/ ]]; then
        test_file="tests/test_${base_name}.py"
    elif [[ "$source_file" =~ ^strategies/ ]]; then
        test_file="tests/strategies/test_${base_name}.py"
    elif [[ "$source_file" =~ ^utils/ ]]; then
        test_file="tests/utils/test_${base_name}.py"
    elif [[ "$source_file" =~ ^cli/ ]]; then
        test_file="tests/cli/test_${base_name}.py"
    fi
    
    # Check if test file exists
    if [ -n "$test_file" ] && [ -f "$test_file" ]; then
        echo "$test_file"
    fi
}

# Check if specific test requested
if [ $# -gt 0 ]; then
    TEST_ARG="$1"
    
    # Try to find matching test file
    if [ -f "$TEST_ARG" ]; then
        # Full path provided
        SPECIFIC_TEST="$TEST_ARG"
    elif [ -f "tests/$TEST_ARG" ]; then
        # Relative to tests directory
        SPECIFIC_TEST="tests/$TEST_ARG"
    elif [ -f "tests/test_$TEST_ARG.py" ]; then
        # Just module name provided
        SPECIFIC_TEST="tests/test_$TEST_ARG.py"
    elif [ -f "tests/test_${TEST_ARG}_test.py" ]; then
        # Alternative naming
        SPECIFIC_TEST="tests/test_${TEST_ARG}_test.py"
    else
        # Try pattern matching
        MATCHES=$(find tests -name "*${TEST_ARG}*.py" -type f 2>/dev/null | grep -v __pycache__ || true)
        if [ -n "$MATCHES" ]; then
            # If single match, use it
            if [ $(echo "$MATCHES" | wc -l) -eq 1 ]; then
                SPECIFIC_TEST="$MATCHES"
            else
                echo -e "${YELLOW}Multiple test files match '$TEST_ARG':${NC}"
                echo "$MATCHES"
                exit 1
            fi
        fi
    fi
    
    if [ -n "$SPECIFIC_TEST" ]; then
        echo -e "${CYAN}🎯 Running specific test: $SPECIFIC_TEST${NC}"
        echo ""
        echo -e "${MAGENTA}===== $(basename "$SPECIFIC_TEST") =====${NC}"
        pytest "$SPECIFIC_TEST" -v --tb=short
        exit 0
    else
        echo -e "${RED}Error: Could not find test file matching '$TEST_ARG'${NC}"
        exit 1
    fi
fi

# Auto-detect changed files
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || git diff --name-only --cached || true)
CHANGED_PY_FILES=$(echo "$CHANGED_FILES" | grep "\.py$" | grep -v test_ | grep -v __pycache__ || true)

# Find related test files
RELATED_TESTS=""
if [ -n "$CHANGED_PY_FILES" ]; then
    echo -e "${CYAN}📝 Detected changes in:${NC}"
    while IFS= read -r file; do
        echo "  - $file"
        test_file=$(find_test_file "$file")
        if [ -n "$test_file" ]; then
            RELATED_TESTS="$RELATED_TESTS $test_file"
        fi
    done <<< "$CHANGED_PY_FILES"
    echo ""
fi

# Run related tests first if any
if [ -n "$RELATED_TESTS" ]; then
    echo -e "${CYAN}🎯 Running related tests first...${NC}"
    for test in $RELATED_TESTS; do
        if [ -f "$test" ]; then
            echo ""
            echo -e "${MAGENTA}===== $(basename "$test") =====${NC}"
            pytest "$test" -v --tb=short || true
        fi
    done
    echo ""
fi

# Run full test suite with coverage
echo -e "${CYAN}📊 Running full test suite with coverage...${NC}"
echo ""
echo -e "${MAGENTA}===== Full Test Suite =====${NC}"

# Run Jest with coverage
npm test -- --coverage --watchAll=false

# Extract coverage percentage from Jest output
COVERAGE_OUTPUT=$(npm test -- --coverage --watchAll=false --silent 2>&1 | tail -20)
COVERAGE=$(echo "$COVERAGE_OUTPUT" | grep "All files" | awk '{print $10}' | sed 's/%//')

if [ -n "$COVERAGE" ]; then
    if (( $(echo "$COVERAGE >= 80" | bc -l 2>/dev/null || echo "0") )); then
        echo ""
        echo -e "${GREEN}✅ Coverage: ${COVERAGE}% (meets 80% requirement)${NC}"
    else
        echo ""
        echo -e "${YELLOW}⚠️  Coverage: ${COVERAGE}% (below 80% requirement)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✨ Test run complete!${NC}"