#!/bin/bash
# WAVE V2 API-Powered Analysis Script
# Usage: ./run-analysis.sh [qa|cto|prd|all] [options]

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_URL="https://api.anthropic.com/v1/messages"
MODEL="claude-sonnet-4-20250514"
MAX_TOKENS=4096
REPORTS_DIR=".claude/reports"

# Create reports directory if it doesn't exist
mkdir -p "$REPORTS_DIR"

# Function to call Claude API
call_claude() {
    local prompt_file="$1"
    local system_file="$2"

    local prompt=$(cat "$prompt_file")
    local system_prompt=$(cat "$system_file")

    # Create JSON payload
    local payload=$(jq -n \
        --arg model "$MODEL" \
        --argjson max_tokens "$MAX_TOKENS" \
        --arg system "$system_prompt" \
        --arg prompt "$prompt" \
        '{
            model: $model,
            max_tokens: $max_tokens,
            system: $system,
            messages: [{role: "user", content: $prompt}]
        }')

    local response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -d "$payload")

    echo "$response" | jq -r '.content[0].text' 2>/dev/null
}

# Function to gather project context
gather_context() {
    local context=""

    # Get git status
    context+="## Git Status\n"
    context+=$(git status --short 2>/dev/null | head -20)
    context+="\n\n"

    # Get recent commits
    context+="## Recent Commits\n"
    context+=$(git log --oneline -10 2>/dev/null)
    context+="\n\n"

    # Get file structure
    context+="## Project Files\n"
    context+=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) | grep -v node_modules | grep -v .next | wc -l)
    context+=" TypeScript files\n"
    context+="\n"

    # Get package.json info
    if [ -f "package.json" ]; then
        context+="## Package Info\n"
        context+=$(cat package.json | jq -r '.name // "unknown"')
        context+="\n"
    fi

    # Get story count
    context+="## Stories\n"
    local story_count=$(find stories -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    context+="$story_count story files\n"

    # Get test status
    if [ -f "package.json" ]; then
        context+="## Available Scripts\n"
        context+=$(cat package.json | jq -r '.scripts | keys | join(", ")' 2>/dev/null)
        context+="\n"
    fi

    echo -e "$context"
}

# QA Analysis
run_qa_analysis() {
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  QA ANALYSIS - API Powered                                   ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local timestamp=$(date +%Y-%m-%d_%H-%M-%S)
    local report_file="$REPORTS_DIR/qa-analysis-$timestamp.md"
    local temp_dir=$(mktemp -d)

    # Gather context
    echo -e "${CYAN}Gathering project context...${NC}"
    local context=$(gather_context)

    # Create prompt file
    cat > "$temp_dir/prompt.txt" << EOF
Analyze this software project for QA concerns.

Project Context:
$context

Please provide a comprehensive QA analysis including:

1. **Test Coverage Assessment**
   - Estimated coverage level
   - Areas lacking tests

2. **Code Quality Issues**
   - Potential code smells
   - Maintainability concerns

3. **Security Concerns**
   - Input validation
   - Authentication/Authorization
   - Data protection

4. **Accessibility Compliance**
   - WCAG compliance level estimate

5. **Recommendations**
   - Prioritized action items
   - Quick wins vs long-term improvements

Format the response with clear headers and bullet points.
EOF

    # Create system prompt file
    cat > "$temp_dir/system.txt" << EOF
You are an expert QA Engineer with 15+ years of experience. Analyze software projects thoroughly and provide actionable, specific recommendations. Be direct and prioritize issues by severity. Use markdown formatting.
EOF

    echo -e "${YELLOW}Running QA analysis...${NC}"
    local result=$(call_claude "$temp_dir/prompt.txt" "$temp_dir/system.txt")

    # Cleanup
    rm -rf "$temp_dir"

    # Save report
    cat > "$report_file" << EOF
# QA Analysis Report
**Generated:** $(date)
**Project:** $(basename $(pwd))

---

$result
EOF

    echo ""
    echo "$result"
    echo ""
    echo -e "${GREEN}✓ Report saved to: $report_file${NC}"
}

# CTO Analysis
run_cto_analysis() {
    local mode="${1:-full}"

    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  CTO ADVISOR - API Powered ($mode mode)                      ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local timestamp=$(date +%Y-%m-%d_%H-%M-%S)
    local report_file="$REPORTS_DIR/cto-analysis-$timestamp.md"
    local temp_dir=$(mktemp -d)

    # Gather context
    echo -e "${CYAN}Gathering project context...${NC}"
    local context=$(gather_context)

    # Create prompt file based on mode
    if [ "$mode" == "quick" ]; then
        cat > "$temp_dir/prompt.txt" << EOF
As CTO, provide a QUICK strategic assessment of this project.

Project Context:
$context

Provide a brief analysis (under 500 words):
1. **Health Score:** X/100
2. **Top 3 Risks**
3. **Immediate Actions** (what to do TODAY)
4. **Quick Command:** suggest one /command to run

Be concise and actionable.
EOF
    else
        cat > "$temp_dir/prompt.txt" << EOF
As CTO, provide a comprehensive strategic analysis of this project.

Project Context:
$context

Provide detailed analysis:

1. **Overall Project Health Score** (0-100)
   - Code Quality: X/100
   - Test Coverage: X/100
   - Security: X/100
   - Architecture: X/100

2. **Technical Debt Assessment**
   - Current debt level (Low/Medium/High/Critical)
   - Key debt items
   - Recommended payoff strategy

3. **Risk Analysis**
   - CRITICAL risks (immediate action)
   - HIGH risks (this week)
   - MEDIUM risks (this sprint)

4. **Architecture Review**
   - Current state assessment
   - Scalability concerns
   - Recommended improvements

5. **Strategic Recommendations**
   - Immediate actions (today)
   - This week priorities
   - This month initiatives

6. **Recommended Command Sequence**
   - List specific /commands to run in order

Format with clear headers, scores, and bullet points.
EOF
    fi

    # Create system prompt file
    cat > "$temp_dir/system.txt" << EOF
You are an experienced CTO and technical leader with expertise in software architecture, team management, and strategic planning. Provide actionable, data-driven recommendations. Be specific about priorities and tradeoffs. Use markdown formatting with clear structure.
EOF

    echo -e "${YELLOW}Running CTO analysis...${NC}"
    local result=$(call_claude "$temp_dir/prompt.txt" "$temp_dir/system.txt")

    # Cleanup
    rm -rf "$temp_dir"

    # Save report
    cat > "$report_file" << EOF
# CTO Analysis Report
**Generated:** $(date)
**Project:** $(basename $(pwd))
**Mode:** $mode

---

$result
EOF

    echo ""
    echo "$result"
    echo ""
    echo -e "${GREEN}✓ Report saved to: $report_file${NC}"
}

# PRD Compliance Analysis
run_prd_analysis() {
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  PRD COMPLIANCE - API Powered                                ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local timestamp=$(date +%Y-%m-%d_%H-%M-%S)
    local report_file="$REPORTS_DIR/prd-analysis-$timestamp.md"
    local temp_dir=$(mktemp -d)

    # Gather context
    echo -e "${CYAN}Gathering project context...${NC}"
    local context=$(gather_context)

    # Get PRD content if exists
    local prd_content="No PRD document found"
    if [ -f "docs/PRD.md" ]; then
        prd_content=$(head -200 docs/PRD.md)
    elif [ -f "planning/PRD.md" ]; then
        prd_content=$(head -200 planning/PRD.md)
    elif [ -f "README.md" ]; then
        prd_content="README.md content:\n$(head -100 README.md)"
    fi

    # Get stories summary
    local stories_summary=""
    local story_files=$(find stories -name "*.json" 2>/dev/null | head -10)
    for file in $story_files; do
        stories_summary+="- $(basename $file): "
        stories_summary+=$(cat "$file" | jq -r '.title // .id // "unknown"' 2>/dev/null)
        stories_summary+="\n"
    done

    # Create prompt file
    cat > "$temp_dir/prompt.txt" << EOF
Analyze PRD compliance for this project.

Project Context:
$context

PRD/Documentation:
$prd_content

Stories Found:
$stories_summary

Provide:

1. **Compliance Score:** X/100

2. **PRD Coverage Analysis**
   - What requirements are covered
   - What requirements are missing

3. **Story Implementation Status**
   - Completed stories
   - In progress
   - Not started

4. **Gap Analysis**
   - Missing features from PRD
   - Missing stories to create
   - Implementation drift detected

5. **Missing Stories to Create**
   - List specific story IDs and titles
   - Priority for each

6. **Recommendations**
   - Immediate actions
   - Next wave priorities

Format with clear sections and actionable items.
EOF

    # Create system prompt file
    cat > "$temp_dir/system.txt" << EOF
You are a Product Manager with expertise in requirements analysis and compliance. Analyze the gap between product requirements and implementation. Be specific about missing items and prioritize them clearly. Use markdown formatting.
EOF

    echo -e "${YELLOW}Running PRD compliance analysis...${NC}"
    local result=$(call_claude "$temp_dir/prompt.txt" "$temp_dir/system.txt")

    # Cleanup
    rm -rf "$temp_dir"

    # Save report
    cat > "$report_file" << EOF
# PRD Compliance Report
**Generated:** $(date)
**Project:** $(basename $(pwd))

---

$result
EOF

    echo ""
    echo "$result"
    echo ""
    echo -e "${GREEN}✓ Report saved to: $report_file${NC}"
}

# Help
show_help() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  WAVE V2 API-Powered Analysis                                ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Usage: ./run-analysis.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  qa              Run QA analysis"
    echo "  cto [mode]      Run CTO analysis"
    echo "                  Modes: full (default), quick, health, debt, risks"
    echo "  prd             Run PRD compliance analysis"
    echo "  all             Run all analyses"
    echo "  help            Show this help"
    echo ""
    echo "Examples:"
    echo "  ./run-analysis.sh qa"
    echo "  ./run-analysis.sh cto quick"
    echo "  ./run-analysis.sh cto full"
    echo "  ./run-analysis.sh prd"
    echo "  ./run-analysis.sh all"
    echo ""
    echo "Reports saved to: .claude/reports/"
}

# Main execution
main() {
    local command="${1:-help}"
    local option="${2:-full}"

    # Check for API key
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo -e "${RED}Error: ANTHROPIC_API_KEY not set${NC}"
        echo "Please set your API key in .env file:"
        echo "  ANTHROPIC_API_KEY=sk-ant-..."
        exit 1
    fi

    # Check for jq
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is required but not installed${NC}"
        echo "Install with: brew install jq"
        exit 1
    fi

    case "$command" in
        qa)
            run_qa_analysis
            ;;
        cto)
            run_cto_analysis "$option"
            ;;
        prd)
            run_prd_analysis
            ;;
        all)
            run_qa_analysis
            echo ""
            echo "─────────────────────────────────────────────────────────"
            echo ""
            run_cto_analysis "$option"
            echo ""
            echo "─────────────────────────────────────────────────────────"
            echo ""
            run_prd_analysis
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Run main function
cd "$(dirname "$0")/../.." || exit 1
main "$@"
