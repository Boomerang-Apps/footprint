#!/bin/bash

# =============================================================================
# CTO CODEBASE & DOCUMENTATION ANALYZER V2.0
# =============================================================================
# 
# Usage: ./cto-analyzer.sh <codebase_path> <docs_path> [output_path]
#
# Example:
#   ./cto-analyzer.sh /path/to/my-project /path/to/docs ./analysis-report
#
# This script analyzes both codebase and documentation, then generates
# a comprehensive report with gap analysis and recommendations.
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# =============================================================================
# CONFIGURATION
# =============================================================================

VERSION="2.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_header() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# =============================================================================
# USAGE
# =============================================================================

usage() {
    echo "CTO Codebase & Documentation Analyzer V${VERSION}"
    echo ""
    echo "Usage: $0 <codebase_path> <docs_path> [output_path]"
    echo ""
    echo "Arguments:"
    echo "  codebase_path   Path to the project codebase folder"
    echo "  docs_path       Path to the documentation folder"
    echo "  output_path     (Optional) Output folder for reports (default: ./cto-analysis)"
    echo ""
    echo "Example:"
    echo "  $0 ./my-project ./my-project/docs ./analysis-output"
    echo ""
    exit 1
}

# =============================================================================
# VALIDATION
# =============================================================================

validate_inputs() {
    if [ -z "$CODEBASE_PATH" ]; then
        print_error "Codebase path is required"
        usage
    fi

    if [ -z "$DOCS_PATH" ]; then
        print_error "Documentation path is required"
        usage
    fi

    if [ ! -d "$CODEBASE_PATH" ]; then
        print_error "Codebase path does not exist: $CODEBASE_PATH"
        exit 1
    fi

    if [ ! -d "$DOCS_PATH" ]; then
        print_error "Documentation path does not exist: $DOCS_PATH"
        exit 1
    fi

    print_success "Codebase path validated: $CODEBASE_PATH"
    print_success "Documentation path validated: $DOCS_PATH"
}

# =============================================================================
# MAIN ANALYSIS FUNCTIONS
# =============================================================================

analyze_codebase_structure() {
    print_section "Analyzing Codebase Structure"
    
    local output_file="$OUTPUT_PATH/01-codebase-structure.md"
    
    {
        echo "# Codebase Structure Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo "**Path:** $CODEBASE_PATH"
        echo ""
        echo "## Directory Tree"
        echo ""
        echo '```'
        if command -v tree &> /dev/null; then
            tree -L 3 -I 'node_modules|.git|dist|.next|coverage|__pycache__|.venv|venv' "$CODEBASE_PATH" 2>/dev/null || find "$CODEBASE_PATH" -type d -maxdepth 3 | grep -v node_modules | grep -v .git | head -50
        else
            find "$CODEBASE_PATH" -type d -maxdepth 3 | grep -v node_modules | grep -v .git | head -50
        fi
        echo '```'
        echo ""
        echo "## File Statistics"
        echo ""
        echo "| File Type | Count |"
        echo "|-----------|-------|"
        echo "| TypeScript (.ts) | $(find "$CODEBASE_PATH" -name "*.ts" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| TypeScript React (.tsx) | $(find "$CODEBASE_PATH" -name "*.tsx" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| JavaScript (.js) | $(find "$CODEBASE_PATH" -name "*.js" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| JavaScript React (.jsx) | $(find "$CODEBASE_PATH" -name "*.jsx" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| CSS/SCSS | $(find "$CODEBASE_PATH" \( -name "*.css" -o -name "*.scss" \) -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| JSON | $(find "$CODEBASE_PATH" -name "*.json" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| Markdown (.md) | $(find "$CODEBASE_PATH" -name "*.md" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| Test Files | $(find "$CODEBASE_PATH" \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" \) -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| SQL Files | $(find "$CODEBASE_PATH" -name "*.sql" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo ""
        echo "## Key Directories"
        echo ""
        
        # Check for common directories
        for dir in "src" "app" "pages" "components" "lib" "utils" "hooks" "types" "api" "supabase" "prisma" "contracts" "stories" "tests" "__tests__"; do
            if [ -d "$CODEBASE_PATH/$dir" ]; then
                echo "- ✅ \`/$dir\` exists ($(find "$CODEBASE_PATH/$dir" -type f 2>/dev/null | wc -l | tr -d ' ') files)"
            elif [ -d "$CODEBASE_PATH/src/$dir" ]; then
                echo "- ✅ \`/src/$dir\` exists ($(find "$CODEBASE_PATH/src/$dir" -type f 2>/dev/null | wc -l | tr -d ' ') files)"
            fi
        done
        
    } > "$output_file"
    
    print_success "Structure analysis saved to $output_file"
}

analyze_package_json() {
    print_section "Analyzing Dependencies (package.json)"
    
    local output_file="$OUTPUT_PATH/02-dependencies.md"
    local package_file="$CODEBASE_PATH/package.json"
    
    {
        echo "# Dependencies Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo ""
        
        if [ -f "$package_file" ]; then
            echo "## Package.json Found"
            echo ""
            
            # Extract name and version
            echo "### Project Info"
            echo ""
            echo "| Property | Value |"
            echo "|----------|-------|"
            if command -v jq &> /dev/null; then
                echo "| Name | $(jq -r '.name // "N/A"' "$package_file") |"
                echo "| Version | $(jq -r '.version // "N/A"' "$package_file") |"
            else
                echo "| Name | $(grep -o '"name":\s*"[^"]*"' "$package_file" | cut -d'"' -f4) |"
                echo "| Version | $(grep -o '"version":\s*"[^"]*"' "$package_file" | cut -d'"' -f4) |"
            fi
            echo ""
            
            echo "### Scripts"
            echo ""
            echo '```json'
            if command -v jq &> /dev/null; then
                jq '.scripts // {}' "$package_file"
            else
                grep -A 20 '"scripts"' "$package_file" | head -20
            fi
            echo '```'
            echo ""
            
            echo "### Dependencies"
            echo ""
            echo '```json'
            if command -v jq &> /dev/null; then
                jq '.dependencies // {}' "$package_file"
            else
                grep -A 50 '"dependencies"' "$package_file" | grep -B 50 '"devDependencies"' | head -50
            fi
            echo '```'
            echo ""
            
            echo "### Dev Dependencies"
            echo ""
            echo '```json'
            if command -v jq &> /dev/null; then
                jq '.devDependencies // {}' "$package_file"
            else
                grep -A 50 '"devDependencies"' "$package_file" | head -50
            fi
            echo '```'
            echo ""
            
            echo "### Key Framework Detection"
            echo ""
            echo "| Framework/Library | Detected | Version |"
            echo "|-------------------|----------|---------|"
            
            for pkg in "next" "react" "vue" "angular" "express" "fastify" "typescript" "@supabase/supabase-js" "prisma" "tailwindcss" "jest" "vitest"; do
                if grep -q "\"$pkg\"" "$package_file" 2>/dev/null; then
                    if command -v jq &> /dev/null; then
                        ver=$(jq -r ".dependencies[\"$pkg\"] // .devDependencies[\"$pkg\"] // \"N/A\"" "$package_file")
                    else
                        ver=$(grep -o "\"$pkg\":\s*\"[^\"]*\"" "$package_file" | cut -d'"' -f4)
                    fi
                    echo "| $pkg | ✅ Yes | $ver |"
                else
                    echo "| $pkg | ❌ No | - |"
                fi
            done
            
        else
            echo "## ⚠️ No package.json Found"
            echo ""
            echo "The codebase does not contain a package.json file at the root."
            echo "This might indicate:"
            echo "- Not a Node.js/JavaScript project"
            echo "- package.json is in a subdirectory"
            echo "- Project uses a different package manager"
        fi
        
    } > "$output_file"
    
    print_success "Dependencies analysis saved to $output_file"
}

analyze_typescript_config() {
    print_section "Analyzing TypeScript Configuration"
    
    local output_file="$OUTPUT_PATH/03-typescript-config.md"
    local tsconfig_file="$CODEBASE_PATH/tsconfig.json"
    
    {
        echo "# TypeScript Configuration Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo ""
        
        if [ -f "$tsconfig_file" ]; then
            echo "## tsconfig.json Found"
            echo ""
            echo '```json'
            cat "$tsconfig_file"
            echo '```'
            echo ""
            
            echo "## Key Settings Check"
            echo ""
            echo "| Setting | Status |"
            echo "|---------|--------|"
            
            if grep -q '"strict":\s*true' "$tsconfig_file" 2>/dev/null; then
                echo "| Strict Mode | ✅ Enabled |"
            else
                echo "| Strict Mode | ⚠️ Not enabled |"
            fi
            
            if grep -q '"paths"' "$tsconfig_file" 2>/dev/null; then
                echo "| Path Aliases | ✅ Configured |"
            else
                echo "| Path Aliases | ⚠️ Not configured |"
            fi
            
            if grep -q '"esModuleInterop":\s*true' "$tsconfig_file" 2>/dev/null; then
                echo "| ES Module Interop | ✅ Enabled |"
            else
                echo "| ES Module Interop | ⚠️ Not enabled |"
            fi
            
        else
            echo "## ⚠️ No tsconfig.json Found"
            echo ""
            echo "The project may not be using TypeScript or the config is in a subdirectory."
        fi
        
    } > "$output_file"
    
    print_success "TypeScript config analysis saved to $output_file"
}

analyze_database() {
    print_section "Analyzing Database Schema"
    
    local output_file="$OUTPUT_PATH/04-database-schema.md"
    
    {
        echo "# Database Schema Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo ""
        
        # Check for Supabase migrations
        if [ -d "$CODEBASE_PATH/supabase/migrations" ]; then
            echo "## Supabase Migrations Found"
            echo ""
            echo "### Migration Files"
            echo ""
            ls -la "$CODEBASE_PATH/supabase/migrations/" 2>/dev/null | tail -n +2
            echo ""
            
            echo "### Tables Detected"
            echo ""
            echo '```sql'
            grep -rh "CREATE TABLE" "$CODEBASE_PATH/supabase/migrations/" 2>/dev/null | head -30
            echo '```'
            echo ""
            
            echo "### Indexes Detected"
            echo ""
            echo '```sql'
            grep -rh "CREATE INDEX\|CREATE UNIQUE INDEX" "$CODEBASE_PATH/supabase/migrations/" 2>/dev/null | head -20
            echo '```'
            echo ""
            
            echo "### RLS Policies"
            echo ""
            echo '```sql'
            grep -rh "CREATE POLICY\|ALTER TABLE.*ENABLE ROW LEVEL SECURITY" "$CODEBASE_PATH/supabase/migrations/" 2>/dev/null | head -20
            echo '```'
            
        elif [ -f "$CODEBASE_PATH/prisma/schema.prisma" ]; then
            echo "## Prisma Schema Found"
            echo ""
            echo '```prisma'
            cat "$CODEBASE_PATH/prisma/schema.prisma"
            echo '```'
            
        elif [ -d "$CODEBASE_PATH/drizzle" ]; then
            echo "## Drizzle Schema Found"
            echo ""
            find "$CODEBASE_PATH/drizzle" -name "*.ts" -exec cat {} \; 2>/dev/null | head -100
            
        else
            echo "## ⚠️ No Database Schema Found"
            echo ""
            echo "Could not find:"
            echo "- supabase/migrations/"
            echo "- prisma/schema.prisma"
            echo "- drizzle/"
        fi
        
    } > "$output_file"
    
    print_success "Database schema analysis saved to $output_file"
}

analyze_api_routes() {
    print_section "Analyzing API Routes"
    
    local output_file="$OUTPUT_PATH/05-api-routes.md"
    
    {
        echo "# API Routes Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo ""
        
        # Next.js App Router
        if [ -d "$CODEBASE_PATH/src/app/api" ] || [ -d "$CODEBASE_PATH/app/api" ]; then
            echo "## Next.js App Router API Routes"
            echo ""
            
            local api_path
            if [ -d "$CODEBASE_PATH/src/app/api" ]; then
                api_path="$CODEBASE_PATH/src/app/api"
            else
                api_path="$CODEBASE_PATH/app/api"
            fi
            
            echo "### Route Files"
            echo ""
            find "$api_path" -name "route.ts" -o -name "route.js" 2>/dev/null | while read -r file; do
                route=$(echo "$file" | sed "s|$api_path||" | sed 's|/route\.[tj]s||')
                echo "- \`/api$route\`"
            done
            echo ""
            
            echo "### HTTP Methods Used"
            echo ""
            echo "| Method | Count |"
            echo "|--------|-------|"
            echo "| GET | $(grep -rh "export.*function GET\|export const GET" "$api_path" 2>/dev/null | wc -l | tr -d ' ') |"
            echo "| POST | $(grep -rh "export.*function POST\|export const POST" "$api_path" 2>/dev/null | wc -l | tr -d ' ') |"
            echo "| PUT | $(grep -rh "export.*function PUT\|export const PUT" "$api_path" 2>/dev/null | wc -l | tr -d ' ') |"
            echo "| PATCH | $(grep -rh "export.*function PATCH\|export const PATCH" "$api_path" 2>/dev/null | wc -l | tr -d ' ') |"
            echo "| DELETE | $(grep -rh "export.*function DELETE\|export const DELETE" "$api_path" 2>/dev/null | wc -l | tr -d ' ') |"
            
        # Next.js Pages Router
        elif [ -d "$CODEBASE_PATH/pages/api" ]; then
            echo "## Next.js Pages Router API Routes"
            echo ""
            find "$CODEBASE_PATH/pages/api" -name "*.ts" -o -name "*.js" 2>/dev/null | while read -r file; do
                route=$(echo "$file" | sed "s|$CODEBASE_PATH/pages||" | sed 's|\.[tj]s||')
                echo "- \`$route\`"
            done
            
        # Express/Fastify
        elif find "$CODEBASE_PATH" -name "*.ts" -exec grep -l "express\|fastify" {} \; 2>/dev/null | head -1 | grep -q .; then
            echo "## Express/Fastify Routes Detected"
            echo ""
            echo "Route definitions found in:"
            echo ""
            grep -rl "app\.\(get\|post\|put\|delete\|patch\)\|router\.\(get\|post\|put\|delete\|patch\)" "$CODEBASE_PATH" --include="*.ts" --include="*.js" 2>/dev/null | grep -v node_modules | head -20
            
        else
            echo "## ⚠️ No API Routes Found"
            echo ""
            echo "Could not find:"
            echo "- src/app/api/ (Next.js App Router)"
            echo "- pages/api/ (Next.js Pages Router)"
            echo "- Express/Fastify route definitions"
        fi
        
    } > "$output_file"
    
    print_success "API routes analysis saved to $output_file"
}

analyze_components() {
    print_section "Analyzing Components"
    
    local output_file="$OUTPUT_PATH/06-components.md"
    
    {
        echo "# Components Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo ""
        
        local comp_path=""
        for dir in "src/components" "components" "src/app/components"; do
            if [ -d "$CODEBASE_PATH/$dir" ]; then
                comp_path="$CODEBASE_PATH/$dir"
                break
            fi
        done
        
        if [ -n "$comp_path" ]; then
            echo "## Components Directory: \`$comp_path\`"
            echo ""
            
            echo "### Component Count by Directory"
            echo ""
            echo "| Directory | .tsx Files | .ts Files |"
            echo "|-----------|------------|-----------|"
            find "$comp_path" -type d 2>/dev/null | while read -r dir; do
                rel_dir=$(echo "$dir" | sed "s|$comp_path||")
                tsx_count=$(find "$dir" -maxdepth 1 -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
                ts_count=$(find "$dir" -maxdepth 1 -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
                if [ "$tsx_count" -gt 0 ] || [ "$ts_count" -gt 0 ]; then
                    echo "| ${rel_dir:-/} | $tsx_count | $ts_count |"
                fi
            done
            echo ""
            
            echo "### All Components"
            echo ""
            find "$comp_path" -name "*.tsx" 2>/dev/null | while read -r file; do
                rel_file=$(echo "$file" | sed "s|$comp_path/||")
                echo "- \`$rel_file\`"
            done
            
        else
            echo "## ⚠️ No Components Directory Found"
        fi
        
    } > "$output_file"
    
    print_success "Components analysis saved to $output_file"
}

analyze_tests() {
    print_section "Analyzing Test Coverage"
    
    local output_file="$OUTPUT_PATH/07-tests.md"
    
    {
        echo "# Test Coverage Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo ""
        
        echo "## Test Files Found"
        echo ""
        
        local test_count=$(find "$CODEBASE_PATH" \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
        
        echo "**Total Test Files:** $test_count"
        echo ""
        
        if [ "$test_count" -gt 0 ]; then
            echo "### Test Files List"
            echo ""
            find "$CODEBASE_PATH" \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
                rel_file=$(echo "$file" | sed "s|$CODEBASE_PATH/||")
                echo "- \`$rel_file\`"
            done
            echo ""
            
            echo "### Test Framework Detection"
            echo ""
            if grep -rq "vitest\|vi\." "$CODEBASE_PATH" --include="*.ts" --include="*.tsx" 2>/dev/null | head -1 | grep -q .; then
                echo "- ✅ Vitest detected"
            fi
            if grep -rq "jest\|describe\|it\|expect" "$CODEBASE_PATH" --include="*.test.ts" --include="*.test.tsx" 2>/dev/null | head -1 | grep -q .; then
                echo "- ✅ Jest/Testing patterns detected"
            fi
            if grep -rq "@testing-library" "$CODEBASE_PATH/package.json" 2>/dev/null; then
                echo "- ✅ Testing Library detected"
            fi
            if grep -rq "playwright\|@playwright" "$CODEBASE_PATH/package.json" 2>/dev/null; then
                echo "- ✅ Playwright detected"
            fi
            if grep -rq "cypress" "$CODEBASE_PATH/package.json" 2>/dev/null; then
                echo "- ✅ Cypress detected"
            fi
        else
            echo "⚠️ No test files found"
            echo ""
            echo "Consider adding tests for:"
            echo "- Unit tests for utilities and hooks"
            echo "- Component tests"
            echo "- Integration tests for API routes"
            echo "- E2E tests for critical flows"
        fi
        
    } > "$output_file"
    
    print_success "Tests analysis saved to $output_file"
}

analyze_security() {
    print_section "Analyzing Security"
    
    local output_file="$OUTPUT_PATH/08-security.md"
    
    {
        echo "# Security Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo ""
        
        echo "## Environment Files"
        echo ""
        echo "### .env Files Present"
        echo ""
        find "$CODEBASE_PATH" -name ".env*" -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
            rel_file=$(echo "$file" | sed "s|$CODEBASE_PATH/||")
            echo "- \`$rel_file\`"
        done
        echo ""
        
        echo "### .gitignore Check"
        echo ""
        if [ -f "$CODEBASE_PATH/.gitignore" ]; then
            if grep -q "\.env" "$CODEBASE_PATH/.gitignore" 2>/dev/null; then
                echo "✅ .env files are in .gitignore"
            else
                echo "⚠️ .env files may NOT be in .gitignore"
            fi
        else
            echo "⚠️ No .gitignore found"
        fi
        echo ""
        
        echo "## Potential Security Issues"
        echo ""
        
        echo "### Hardcoded Secrets Scan"
        echo ""
        echo '```'
        grep -rn "password\s*=\|secret\s*=\|api_key\s*=\|apiKey\s*=" "$CODEBASE_PATH" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v "type\|interface\|process\.env\|import" | head -10 || echo "No obvious hardcoded secrets found"
        echo '```'
        echo ""
        
        echo "### Environment Variable Usage"
        echo ""
        echo "Variables referenced in code:"
        echo ""
        grep -roh "process\.env\.[A-Z_]*\|import\.meta\.env\.[A-Z_]*" "$CODEBASE_PATH" --include="*.ts" --include="*.tsx" 2>/dev/null | sort | uniq -c | sort -rn | head -20
        
    } > "$output_file"
    
    print_success "Security analysis saved to $output_file"
}

analyze_documentation() {
    print_section "Analyzing Documentation"
    
    local output_file="$OUTPUT_PATH/09-documentation.md"
    
    {
        echo "# Documentation Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo "**Path:** $DOCS_PATH"
        echo ""
        
        echo "## Document Inventory"
        echo ""
        echo "### All Markdown Files"
        echo ""
        find "$DOCS_PATH" -name "*.md" 2>/dev/null | while read -r file; do
            rel_file=$(echo "$file" | sed "s|$DOCS_PATH/||")
            lines=$(wc -l < "$file" | tr -d ' ')
            size=$(du -h "$file" | cut -f1)
            echo "- \`$rel_file\` ($lines lines, $size)"
        done
        echo ""
        
        echo "## Document Detection"
        echo ""
        echo "| Document Type | Found | File |"
        echo "|---------------|-------|------|"
        
        # Check for common document types
        for pattern in "PRD\|product.*requirement\|prd" "ARCHITECTURE\|technical.*arch\|tech.*spec" "BUSINESS.*LOGIC\|business.*rule" "USER.*STOR\|user.*stories" "DESIGN.*SYSTEM\|design.*token" "API\|endpoint\|contract" "README"; do
            found=$(find "$DOCS_PATH" -name "*.md" -exec grep -li "$pattern" {} \; 2>/dev/null | head -1)
            if [ -n "$found" ]; then
                rel_found=$(echo "$found" | sed "s|$DOCS_PATH/||")
                echo "| $pattern | ✅ | \`$rel_found\` |"
            else
                echo "| $pattern | ❌ | Not found |"
            fi
        done
        echo ""
        
        echo "## Document Contents Preview"
        echo ""
        
        find "$DOCS_PATH" -name "*.md" 2>/dev/null | head -5 | while read -r file; do
            rel_file=$(echo "$file" | sed "s|$DOCS_PATH/||")
            echo "### $rel_file"
            echo ""
            echo '```markdown'
            head -50 "$file"
            echo '```'
            echo ""
        done
        
    } > "$output_file"
    
    print_success "Documentation analysis saved to $output_file"
}

analyze_contracts() {
    print_section "Analyzing Contracts"
    
    local output_file="$OUTPUT_PATH/10-contracts.md"
    
    {
        echo "# Contracts Analysis"
        echo ""
        echo "**Analyzed:** $(date)"
        echo ""
        
        local contracts_path=""
        for dir in "contracts" "src/contracts" "src/types" "types"; do
            if [ -d "$CODEBASE_PATH/$dir" ]; then
                contracts_path="$CODEBASE_PATH/$dir"
                break
            fi
        done
        
        # Also check docs path
        if [ -z "$contracts_path" ] && [ -d "$DOCS_PATH/contracts" ]; then
            contracts_path="$DOCS_PATH/contracts"
        fi
        
        if [ -n "$contracts_path" ]; then
            echo "## Contracts Directory: \`$contracts_path\`"
            echo ""
            
            echo "### Contract Files"
            echo ""
            find "$contracts_path" -name "*.ts" 2>/dev/null | while read -r file; do
                rel_file=$(echo "$file" | sed "s|$contracts_path/||")
                echo "- \`$rel_file\`"
            done
            echo ""
            
            echo "### Interfaces Defined"
            echo ""
            grep -rh "export interface\|export type" "$contracts_path" 2>/dev/null | head -30
            echo ""
            
            echo "### Contract Sources (@source annotations)"
            echo ""
            grep -rh "@source" "$contracts_path" 2>/dev/null | head -20 || echo "No @source annotations found"
            
        else
            echo "## ⚠️ No Contracts Directory Found"
            echo ""
            echo "Checked locations:"
            echo "- contracts/"
            echo "- src/contracts/"
            echo "- src/types/"
            echo "- types/"
            echo "- [docs]/contracts/"
        fi
        
    } > "$output_file"
    
    print_success "Contracts analysis saved to $output_file"
}

generate_gap_analysis() {
    print_section "Generating Gap Analysis"
    
    local output_file="$OUTPUT_PATH/11-gap-analysis.md"
    
    {
        echo "# Gap Analysis"
        echo ""
        echo "**Generated:** $(date)"
        echo ""
        
        echo "## Summary of Gaps"
        echo ""
        echo "Based on the analysis, the following gaps were identified:"
        echo ""
        
        echo "### Documentation Gaps"
        echo ""
        
        # Check for missing docs
        for doc in "PRD" "ARCHITECTURE" "BUSINESS_LOGIC" "USER_STORIES" "DESIGN_SYSTEM" "API_CONTRACTS"; do
            pattern=$(echo "$doc" | tr '_' '.*')
            if ! find "$DOCS_PATH" -name "*.md" -exec grep -li "$pattern" {} \; 2>/dev/null | grep -q .; then
                echo "- ❌ **DOC-MISSING:** $doc document not found"
            fi
        done
        echo ""
        
        echo "### Codebase Gaps"
        echo ""
        
        # Check for missing essentials
        if [ ! -f "$CODEBASE_PATH/package.json" ]; then
            echo "- ❌ **CODE-MISSING:** No package.json found"
        fi
        
        if [ ! -f "$CODEBASE_PATH/tsconfig.json" ]; then
            echo "- ⚠️ **CODE-CONFIG:** No TypeScript configuration"
        fi
        
        test_count=$(find "$CODEBASE_PATH" \( -name "*.test.ts" -o -name "*.test.tsx" \) -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$test_count" -eq 0 ]; then
            echo "- ❌ **CODE-QUALITY:** No test files found"
        elif [ "$test_count" -lt 10 ]; then
            echo "- ⚠️ **CODE-QUALITY:** Low test coverage ($test_count test files)"
        fi
        
        if [ ! -f "$CODEBASE_PATH/CLAUDE.md" ]; then
            echo "- ⚠️ **PIPELINE-MISSING:** No CLAUDE.md for agent instructions"
        fi
        
        if [ ! -d "$CODEBASE_PATH/contracts" ] && [ ! -d "$CODEBASE_PATH/src/contracts" ]; then
            echo "- ❌ **CONTRACT-MISSING:** No contracts directory"
        fi
        
        echo ""
        echo "### V4.3 Pipeline Readiness Gaps"
        echo ""
        
        # Check for pipeline requirements
        if [ ! -d "$CODEBASE_PATH/stories" ] && [ ! -d "$DOCS_PATH/stories" ]; then
            echo "- ❌ **PG-3:** No AI-ready stories found"
        fi
        
        echo ""
        echo "## Recommended Next Steps"
        echo ""
        echo "1. Address all ❌ CRITICAL gaps first"
        echo "2. Then address ⚠️ WARNING gaps"
        echo "3. Run CTO Validator V5 to confirm readiness"
        echo ""
        
    } > "$output_file"
    
    print_success "Gap analysis saved to $output_file"
}

generate_summary_report() {
    print_section "Generating Summary Report"
    
    local output_file="$OUTPUT_PATH/00-SUMMARY-REPORT.md"
    
    {
        echo "# CTO Analysis Summary Report"
        echo ""
        echo "**Project:** $(basename "$CODEBASE_PATH")"
        echo "**Analysis Date:** $(date)"
        echo "**Analyzer Version:** $VERSION"
        echo ""
        echo "---"
        echo ""
        echo "## Executive Summary"
        echo ""
        echo "This report provides a comprehensive analysis of the codebase and documentation."
        echo ""
        echo "### Quick Stats"
        echo ""
        echo "| Metric | Value |"
        echo "|--------|-------|"
        echo "| Total Source Files | $(find "$CODEBASE_PATH" \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| Test Files | $(find "$CODEBASE_PATH" \( -name "*.test.ts" -o -name "*.test.tsx" \) -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| Documentation Files | $(find "$DOCS_PATH" -name "*.md" 2>/dev/null | wc -l | tr -d ' ') |"
        echo "| SQL Migration Files | $(find "$CODEBASE_PATH" -name "*.sql" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ') |"
        echo ""
        echo "### Analysis Reports Generated"
        echo ""
        echo "| # | Report | Description |"
        echo "|---|--------|-------------|"
        echo "| 1 | [Codebase Structure](./01-codebase-structure.md) | Directory tree and file statistics |"
        echo "| 2 | [Dependencies](./02-dependencies.md) | package.json analysis |"
        echo "| 3 | [TypeScript Config](./03-typescript-config.md) | tsconfig.json analysis |"
        echo "| 4 | [Database Schema](./04-database-schema.md) | Migrations and tables |"
        echo "| 5 | [API Routes](./05-api-routes.md) | Endpoint inventory |"
        echo "| 6 | [Components](./06-components.md) | React components |"
        echo "| 7 | [Tests](./07-tests.md) | Test coverage |"
        echo "| 8 | [Security](./08-security.md) | Security scan |"
        echo "| 9 | [Documentation](./09-documentation.md) | Docs inventory |"
        echo "| 10 | [Contracts](./10-contracts.md) | TypeScript contracts |"
        echo "| 11 | [Gap Analysis](./11-gap-analysis.md) | Identified gaps |"
        echo ""
        echo "---"
        echo ""
        echo "## Next Steps"
        echo ""
        echo "1. Review the [Gap Analysis](./11-gap-analysis.md) for prioritized issues"
        echo "2. Address critical gaps first"
        echo "3. Run CTO Validator V5 to confirm V4.3 pipeline readiness"
        echo ""
        echo "---"
        echo ""
        echo "*Generated by CTO Codebase & Documentation Analyzer V${VERSION}*"
        
    } > "$output_file"
    
    print_success "Summary report saved to $output_file"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    print_header "CTO CODEBASE & DOCUMENTATION ANALYZER V${VERSION}"
    
    # Parse arguments
    CODEBASE_PATH="$1"
    DOCS_PATH="$2"
    OUTPUT_PATH="${3:-./cto-analysis-$TIMESTAMP}"
    
    # Validate inputs
    validate_inputs
    
    # Create output directory
    mkdir -p "$OUTPUT_PATH"
    print_success "Output directory created: $OUTPUT_PATH"
    
    # Run all analyses
    analyze_codebase_structure
    analyze_package_json
    analyze_typescript_config
    analyze_database
    analyze_api_routes
    analyze_components
    analyze_tests
    analyze_security
    analyze_documentation
    analyze_contracts
    generate_gap_analysis
    generate_summary_report
    
    print_header "ANALYSIS COMPLETE"
    
    echo ""
    print_success "All reports saved to: $OUTPUT_PATH"
    echo ""
    echo "Reports generated:"
    ls -la "$OUTPUT_PATH"/*.md 2>/dev/null
    echo ""
    print_info "Start by reading: $OUTPUT_PATH/00-SUMMARY-REPORT.md"
    echo ""
}

# Run main function
main "$@"
