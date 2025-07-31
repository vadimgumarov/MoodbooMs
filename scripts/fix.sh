#!/bin/bash

# fix.sh - Structured Issue Resolution Framework
# Provides templated workflows for different issue types

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Default values
ISSUE_TYPE=""
ISSUE_NUM=""
BRANCH_NAME=""
EPIC_NUM=""
PRIORITY=""
SKIP_STEPS=""
TEMPLATE=""

# Function to show usage
show_usage() {
    echo -e "${BLUE}📘 /fix - Structured Issue Resolution Framework${NC}"
    echo ""
    echo "Usage: fix <type> [options]"
    echo ""
    echo "Types:"
    echo "  ci-cd       - CI/CD pipeline failures"
    echo "  bug         - Code defects and test failures"
    echo "  feature     - New functionality implementation"
    echo "  security    - Security vulnerabilities"
    echo "  performance - Performance optimization"
    echo "  docs        - Documentation updates"
    echo "  refactor    - Code improvements"
    echo ""
    echo "Options:"
    echo "  --issue <number>    GitHub issue number (required)"
    echo "  --branch <name>     Custom branch name (auto-generated if not)"
    echo "  --epic <number>     Parent epic for tracking"
    echo "  --priority <level>  critical|high|medium|low"
    echo "  --skip <steps>      Skip certain workflow steps"
    echo "  --template <name>   Use custom template"
    echo ""
    echo "Example:"
    echo "  fix ci-cd --issue 53"
    echo "  fix bug --issue 45 --priority high"
    echo "  fix feature --issue 46 --epic 11"
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

ISSUE_TYPE=$1
shift

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        --issue)
            ISSUE_NUM="$2"
            shift 2
            ;;
        --branch)
            BRANCH_NAME="$2"
            shift 2
            ;;
        --epic)
            EPIC_NUM="$2"
            shift 2
            ;;
        --priority)
            PRIORITY="$2"
            shift 2
            ;;
        --skip)
            SKIP_STEPS="$2"
            shift 2
            ;;
        --template)
            TEMPLATE="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$ISSUE_NUM" ]; then
    echo -e "${RED}Error: --issue is required${NC}"
    show_usage
    exit 1
fi

# Generate branch name if not provided
if [ -z "$BRANCH_NAME" ]; then
    case $ISSUE_TYPE in
        ci-cd)
            BRANCH_NAME="fix/$ISSUE_NUM-cicd-pipeline"
            ;;
        bug)
            BRANCH_NAME="fix/$ISSUE_NUM-bug"
            ;;
        feature)
            BRANCH_NAME="feat/$ISSUE_NUM-feature"
            ;;
        security)
            BRANCH_NAME="fix/$ISSUE_NUM-security"
            ;;
        performance)
            BRANCH_NAME="perf/$ISSUE_NUM-optimization"
            ;;
        docs)
            BRANCH_NAME="docs/$ISSUE_NUM-documentation"
            ;;
        refactor)
            BRANCH_NAME="refactor/$ISSUE_NUM-improvements"
            ;;
        *)
            echo -e "${RED}Unknown issue type: $ISSUE_TYPE${NC}"
            show_usage
            exit 1
            ;;
    esac
fi

# Step 1: Initialize
initialize_workflow() {
    echo -e "${BLUE}🚀 Step 1: Initialize${NC}"
    echo "Creating branch: $BRANCH_NAME"
    
    # Check if branch exists
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        echo "Branch already exists, checking out..."
        git checkout "$BRANCH_NAME"
    else
        git checkout -b "$BRANCH_NAME"
    fi
    
    # Assign issue if not already assigned
    assignees=$(gh issue view "$ISSUE_NUM" --json assignees -q '.assignees[].login')
    if [ -z "$assignees" ]; then
        echo "Assigning issue to you..."
        gh issue edit "$ISSUE_NUM" --add-assignee @me
    fi
    
    # Add initial comment
    gh issue comment "$ISSUE_NUM" --body "Started work on this issue in branch \`$BRANCH_NAME\` using /fix $ISSUE_TYPE workflow"
}

# Step 2: Analyze
analyze_issue() {
    echo -e "${BLUE}🔍 Step 2: Analyze${NC}"
    
    case $ISSUE_TYPE in
        ci-cd)
            echo "Analyzing CI/CD logs..."
            echo "- Check GitHub Actions tab for failure details"
            echo "- Review error messages in failed jobs"
            echo "- Identify dependency or configuration issues"
            ;;
        bug)
            echo "Analyzing bug..."
            echo "- Reproduce the issue locally"
            echo "- Check related test failures"
            echo "- Review error logs and stack traces"
            ;;
        feature)
            echo "Analyzing feature requirements..."
            echo "- Review issue description and acceptance criteria"
            echo "- Check related epics and dependencies"
            echo "- Identify affected components"
            ;;
        security)
            echo "Analyzing security issue..."
            echo "- Review vulnerability details"
            echo "- Check severity and impact"
            echo "- Identify affected components"
            ;;
        performance)
            echo "Analyzing performance issue..."
            echo "- Profile the code"
            echo "- Identify bottlenecks"
            echo "- Review metrics and benchmarks"
            ;;
        docs)
            echo "Analyzing documentation needs..."
            echo "- Review what needs documenting"
            echo "- Check existing documentation"
            echo "- Identify target audience"
            ;;
        refactor)
            echo "Analyzing refactoring needs..."
            echo "- Review code quality issues"
            echo "- Check test coverage"
            echo "- Identify improvement areas"
            ;;
    esac
    
    echo ""
    read -p "Press Enter when analysis is complete..."
}

# Step 3: Plan
plan_implementation() {
    echo -e "${BLUE}📋 Step 3: Plan${NC}"
    
    case $ISSUE_TYPE in
        ci-cd)
            echo "Planning CI/CD fixes:"
            echo "- [ ] Update dependencies in requirements files"
            echo "- [ ] Fix code formatting issues"
            echo "- [ ] Update GitHub Actions workflow if needed"
            echo "- [ ] Add missing test fixtures/mocks"
            ;;
        bug)
            echo "Planning bug fix:"
            echo "- [ ] Write failing test to reproduce bug"
            echo "- [ ] Implement fix"
            echo "- [ ] Verify all tests pass"
            echo "- [ ] Add regression test"
            ;;
        feature)
            echo "Planning feature implementation:"
            echo "- [ ] Design solution architecture"
            echo "- [ ] Write tests first (TDD)"
            echo "- [ ] Implement feature incrementally"
            echo "- [ ] Update documentation"
            ;;
        security)
            echo "Planning security fix:"
            echo "- [ ] Patch vulnerability"
            echo "- [ ] Add security tests"
            echo "- [ ] Review for similar issues"
            echo "- [ ] Update security documentation"
            ;;
        performance)
            echo "Planning optimization:"
            echo "- [ ] Implement optimization"
            echo "- [ ] Add performance tests"
            echo "- [ ] Benchmark improvements"
            echo "- [ ] Document changes"
            ;;
        docs)
            echo "Planning documentation:"
            echo "- [ ] Create/update documentation files"
            echo "- [ ] Add code examples"
            echo "- [ ] Update README if needed"
            echo "- [ ] Check formatting"
            ;;
        refactor)
            echo "Planning refactoring:"
            echo "- [ ] Refactor code incrementally"
            echo "- [ ] Maintain test coverage"
            echo "- [ ] Update affected documentation"
            echo "- [ ] Verify no behavior changes"
            ;;
    esac
    
    echo ""
    read -p "Add any additional tasks (or press Enter to continue): " additional_tasks
    if [ -n "$additional_tasks" ]; then
        echo "- [ ] $additional_tasks"
    fi
}

# Step 4: Implement
implement_fixes() {
    echo -e "${BLUE}🛠️  Step 4: Implement${NC}"
    
    case $ISSUE_TYPE in
        ci-cd)
            echo "Common CI/CD fixes:"
            echo "1. Update requirements: pip install -r requirements.txt"
            echo "2. Format code: black . && isort ."
            echo "3. Run tests locally: pytest tests/"
            echo "4. Check for security issues: safety check"
            ;;
        bug|feature|security|performance|refactor)
            echo "Implementation guidelines:"
            echo "1. Follow TDD approach"
            echo "2. Make incremental commits"
            echo "3. Keep changes focused"
            echo "4. Maintain code quality"
            ;;
        docs)
            echo "Documentation guidelines:"
            echo "1. Use clear, concise language"
            echo "2. Include code examples"
            echo "3. Follow markdown standards"
            echo "4. Check for broken links"
            ;;
    esac
    
    echo ""
    echo "Implement your changes now. Use 'finish' when ready to commit."
    read -p "Press Enter when implementation is complete..."
}

# Step 5: Test
test_changes() {
    echo -e "${BLUE}🧪 Step 5: Test${NC}"
    
    echo "Running tests..."
    
    # Use rt.sh if available
    if [ -x "./scripts/test.sh" ]; then
        ./scripts/test.sh
    else
        pytest tests/ --cov=modules --cov=strategies --cov=utils --cov=cli -v
    fi
    
    echo ""
    read -p "Are all tests passing? (y/n): " tests_pass
    if [[ "$tests_pass" != "y" && "$tests_pass" != "Y" ]]; then
        echo -e "${YELLOW}Please fix failing tests before continuing${NC}"
        exit 1
    fi
}

# Step 6: Document
document_changes() {
    echo -e "${BLUE}📝 Step 6: Document${NC}"
    
    case $ISSUE_TYPE in
        ci-cd)
            echo "Consider creating/updating:"
            echo "- docs/CI_CD_PIPELINE.md for troubleshooting"
            echo "- .github/workflows documentation"
            echo "- README.md setup instructions"
            ;;
        feature)
            echo "Document:"
            echo "- API changes in relevant docs"
            echo "- Usage examples"
            echo "- Configuration options"
            ;;
        security)
            echo "Document:"
            echo "- Security considerations"
            echo "- Best practices"
            echo "- Mitigation strategies"
            ;;
        *)
            echo "Update relevant documentation for your changes"
            ;;
    esac
    
    echo ""
    read -p "Documentation complete? (y/n): " docs_done
}

# Step 7: Submit
submit_changes() {
    echo -e "${BLUE}📤 Step 7: Submit${NC}"
    
    # Use fw.sh if available
    if [ -x "./scripts/finish.sh" ]; then
        echo "Using finish to commit and push..."
        ./scripts/finish.sh
    else
        echo "Committing changes..."
        git add -A
        git commit -m "fix: resolve issue #$ISSUE_NUM"
        git push -u origin "$BRANCH_NAME"
    fi
    
    # Create PR
    echo ""
    echo "Creating pull request..."
    
    PR_TITLE="[$ISSUE_TYPE] Fix #$ISSUE_NUM"
    PR_BODY="Fixes #$ISSUE_NUM

## Type of Change
- [$ISSUE_TYPE fix]

## Summary
Resolved using /fix $ISSUE_TYPE workflow

## Testing
- [ ] All tests pass
- [ ] Coverage maintained/improved
- [ ] Manually tested

## Checklist
- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No debug code remains"

    if [ -n "$EPIC_NUM" ]; then
        PR_BODY="$PR_BODY

Related to Epic #$EPIC_NUM"
    fi
    
    gh pr create --title "$PR_TITLE" --body "$PR_BODY"
}

# Step 8: Complete
complete_workflow() {
    echo -e "${BLUE}✅ Step 8: Complete${NC}"
    
    echo "Final steps:"
    echo "1. Wait for PR approval and CI checks"
    echo "2. Merge PR when approved"
    echo "3. Delete local and remote branch"
    echo "4. Update PROJECT_LOG with 'log'"
    echo ""
    echo -e "${GREEN}🎉 Workflow complete for Issue #$ISSUE_NUM!${NC}"
}

# Main workflow execution
echo -e "${MAGENTA}🔧 /fix $ISSUE_TYPE Workflow${NC}"
echo "Issue: #$ISSUE_NUM"
echo "Branch: $BRANCH_NAME"
if [ -n "$EPIC_NUM" ]; then
    echo "Epic: #$EPIC_NUM"
fi
if [ -n "$PRIORITY" ]; then
    echo "Priority: $PRIORITY"
fi
echo "────────────────────────────────────────────"
echo ""

# Execute workflow steps
if [[ ! "$SKIP_STEPS" =~ "init" ]]; then
    initialize_workflow
    echo ""
fi

if [[ ! "$SKIP_STEPS" =~ "analyze" ]]; then
    analyze_issue
    echo ""
fi

if [[ ! "$SKIP_STEPS" =~ "plan" ]]; then
    plan_implementation
    echo ""
fi

if [[ ! "$SKIP_STEPS" =~ "implement" ]]; then
    implement_fixes
    echo ""
fi

if [[ ! "$SKIP_STEPS" =~ "test" ]]; then
    test_changes
    echo ""
fi

if [[ ! "$SKIP_STEPS" =~ "document" ]]; then
    document_changes
    echo ""
fi

if [[ ! "$SKIP_STEPS" =~ "submit" ]]; then
    submit_changes
    echo ""
fi

if [[ ! "$SKIP_STEPS" =~ "complete" ]]; then
    complete_workflow
fi