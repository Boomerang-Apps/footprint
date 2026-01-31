#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# TEST QUALITY VALIDATOR
# ═══════════════════════════════════════════════════════════════════════════════
# Validates that tests are REAL and not dummy/fake tests
# Run: ./scripts/validate-test-quality.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN} TEST QUALITY VALIDATOR${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. CHECK FOR DUMMY ASSERTIONS
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}1. Checking for dummy assertions...${NC}"

DUMMY_TRUE=$(grep -r "expect(true).toBe(true)\|expect(true).toEqual(true)" "$PROJECT_DIR" --include="*.test.*" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$DUMMY_TRUE" -eq 0 ]; then
    check_pass "No 'expect(true).toBe(true)' found"
else
    check_fail "Found $DUMMY_TRUE dummy assertions: expect(true).toBe(true)"
fi

DUMMY_ONE=$(grep -r "expect(1).toBe(1)\|expect(1).toEqual(1)" "$PROJECT_DIR" --include="*.test.*" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$DUMMY_ONE" -eq 0 ]; then
    check_pass "No 'expect(1).toBe(1)' found"
else
    check_fail "Found $DUMMY_ONE dummy assertions: expect(1).toBe(1)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. CHECK FOR EMPTY TEST BODIES
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}2. Checking for empty test bodies...${NC}"

EMPTY_TESTS=$(grep -r "it('.*', () => {})\|it('.*', async () => {})\|test('.*', () => {})" "$PROJECT_DIR" --include="*.test.*" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$EMPTY_TESTS" -eq 0 ]; then
    check_pass "No empty test bodies found"
else
    check_fail "Found $EMPTY_TESTS empty test bodies"
    grep -rn "it('.*', () => {})\|it('.*', async () => {})" "$PROJECT_DIR" --include="*.test.*" 2>/dev/null | grep -v node_modules | head -5
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. CHECK ASSERTION DENSITY
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}3. Checking assertion density (min 1 assertion per test)...${NC}"

LOW_ASSERTION_FILES=0
for f in $(find "$PROJECT_DIR/app" "$PROJECT_DIR/components" "$PROJECT_DIR/lib" -name "*.test.*" 2>/dev/null | grep -v node_modules); do
    if [ -f "$f" ]; then
        TESTS=$(grep -c "it(\|test(" "$f" 2>/dev/null || echo 0)
        EXPECTS=$(grep -c "expect(" "$f" 2>/dev/null || echo 0)
        if [ "$TESTS" -gt 0 ]; then
            RATIO=$(echo "$EXPECTS / $TESTS" | bc 2>/dev/null || echo 0)
            if [ "$RATIO" -lt 1 ]; then
                check_warn "$(basename $f): $TESTS tests, $EXPECTS expects (ratio < 1)"
                ((LOW_ASSERTION_FILES++))
            fi
        fi
    fi
done

if [ "$LOW_ASSERTION_FILES" -eq 0 ]; then
    check_pass "All test files have adequate assertion density"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. CHECK FOR REAL DOM ASSERTIONS
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}4. Checking for real DOM testing (React Testing Library)...${NC}"

DOM_ASSERTIONS=$(grep -r "toBeInTheDocument\|toBeVisible\|toHaveTextContent\|toHaveAttribute\|toBeDisabled\|toBeEnabled" "$PROJECT_DIR/app" --include="*.test.*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$DOM_ASSERTIONS" -gt 50 ]; then
    check_pass "Found $DOM_ASSERTIONS DOM assertions (good coverage)"
elif [ "$DOM_ASSERTIONS" -gt 10 ]; then
    check_warn "Found $DOM_ASSERTIONS DOM assertions (could be more)"
else
    check_fail "Only $DOM_ASSERTIONS DOM assertions (too few)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. CHECK FOR BEHAVIOR ASSERTIONS
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}5. Checking for behavior/mock assertions...${NC}"

BEHAVIOR_ASSERTIONS=$(grep -r "toHaveBeenCalled\|toHaveBeenCalledWith\|toHaveBeenCalledTimes" "$PROJECT_DIR/app" --include="*.test.*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$BEHAVIOR_ASSERTIONS" -gt 20 ]; then
    check_pass "Found $BEHAVIOR_ASSERTIONS behavior assertions (testing interactions)"
elif [ "$BEHAVIOR_ASSERTIONS" -gt 5 ]; then
    check_warn "Found $BEHAVIOR_ASSERTIONS behavior assertions (could test more interactions)"
else
    check_fail "Only $BEHAVIOR_ASSERTIONS behavior assertions (missing interaction tests)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. CHECK FOR USER EVENT TESTING
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}6. Checking for user interaction testing...${NC}"

USER_EVENTS=$(grep -r "userEvent\|fireEvent" "$PROJECT_DIR/app" --include="*.test.*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$USER_EVENTS" -gt 30 ]; then
    check_pass "Found $USER_EVENTS user interaction tests"
elif [ "$USER_EVENTS" -gt 10 ]; then
    check_warn "Found $USER_EVENTS user interaction tests (could be more)"
else
    check_fail "Only $USER_EVENTS user interaction tests (too few)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 7. CHECK FOR ASYNC/AWAIT TESTING
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}7. Checking for async testing (waitFor, findBy)...${NC}"

ASYNC_TESTS=$(grep -r "waitFor\|findBy\|await" "$PROJECT_DIR/app" --include="*.test.*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$ASYNC_TESTS" -gt 20 ]; then
    check_pass "Found $ASYNC_TESTS async test patterns"
elif [ "$ASYNC_TESTS" -gt 5 ]; then
    check_warn "Found $ASYNC_TESTS async test patterns (consider testing more async flows)"
else
    check_fail "Only $ASYNC_TESTS async test patterns (missing async testing)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 8. CHECK FOR TODO/SKIP TESTS
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}8. Checking for skipped/todo tests...${NC}"

SKIPPED=$(grep -r "it.skip\|test.skip\|it.todo\|test.todo\|xit\|xtest" "$PROJECT_DIR" --include="*.test.*" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
if [ "$SKIPPED" -eq 0 ]; then
    check_pass "No skipped tests found"
else
    check_warn "Found $SKIPPED skipped/todo tests"
    grep -rn "it.skip\|test.skip\|it.todo\|test.todo" "$PROJECT_DIR" --include="*.test.*" 2>/dev/null | grep -v node_modules | head -5
fi

# ─────────────────────────────────────────────────────────────────────────────
# 9. RUN ACTUAL TESTS TO VERIFY
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}9. Running tests to verify they actually work...${NC}"

cd "$PROJECT_DIR"
if npm run test:run -- --reporter=dot 2>&1 | tail -5; then
    TEST_RESULT=$(npm run test:run -- --reporter=json 2>&1 | grep -o '"numPassedTests":[0-9]*' | cut -d: -f2 || echo "0")
    if [ "$TEST_RESULT" -gt 0 ]; then
        check_pass "Tests actually run and pass ($TEST_RESULT passed)"
    fi
else
    check_fail "Tests failed to run"
fi

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN} TEST QUALITY SUMMARY${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}PASSED:${NC}   $PASSED"
echo -e "  ${YELLOW}WARNINGS:${NC} $WARNINGS"
echo -e "  ${RED}FAILED:${NC}   $FAILED"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✓ TEST QUALITY: VALIDATED - Tests are REAL${NC}"
    exit 0
else
    echo -e "${RED}✗ TEST QUALITY: ISSUES FOUND - Review required${NC}"
    exit 1
fi
