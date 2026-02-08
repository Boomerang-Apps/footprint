# /status - CTO Situational Awareness Dashboard

**Priority:** P1 (HIGH)
**Recommended Model:** Sonnet
**Aliases:** /st, /health

## Purpose

Comprehensive CTO dashboard providing system health, implementation progress, code quality, infrastructure readiness, and intelligent next-step recommendations. One command to answer: "Where are we, and what should we do next?"

## When to Run

- Session start (situational awareness)
- Before/after wave execution
- On demand for troubleshooting
- After environment changes
- Sprint planning / stakeholder updates

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--verbose` | Expand all sections with full detail | false |
| `--json` | Output as structured JSON | false |
| `--fix` | Attempt auto-fixes for system health issues | false |
| `--section <name>` | Show one section in verbose form | (all sections) |

**Section names:** `system`, `plan`, `tests`, `debt`, `deps`, `infra`, `velocity`, `hygiene`, `signals`, `next`

---

## Execution Instructions

When this command is invoked, execute each section below **in order**. Collect results, then render the dashboard in the appropriate output format.

### Output Modes

1. **Default** (~35 lines): Compact summary, one screen. Each section gets 1-3 lines.
2. **`--verbose`**: Full expansion of every section with tables, file lists, per-wave breakdowns.
3. **`--json`**: Structured JSON object with all section data.
4. **`--section <name>`**: Show only that section in verbose form.

### Default Dashboard Layout

```
╔═══════════════════════════════════════════════════════════════╗
║  FOOTPRINT STATUS DASHBOARD                         /status  ║
╠═══════════════════════════════════════════════════════════════╣
║  A. SYSTEM HEALTH      ✓ Git | ✓ Build | ✓ Env | ✓ Supabase ║
║  B. IMPLEMENTATION      ████████░░░░ 65% (8/12 stories)     ║
║  C. CODE HEALTH         Tests: 84 pass, 0 fail | Debt: 12   ║
║  D. INFRASTRUCTURE      Features: 6/7 | Storybook: ok       ║
║  E. NEXT STEPS          1. ... 2. ... 3. ...                 ║
╚═══════════════════════════════════════════════════════════════╝
```

In default mode, sections D-I from the detailed list below are collapsed into the "INFRASTRUCTURE" line. Section J becomes "NEXT STEPS".

---

## Section A: System Health

**Purpose:** Core environment health checks (preserved from original `/status`).
**Section flag:** `--section system`

### Checks to Execute

#### A1. Git Status
```bash
git status --porcelain | head -20
git branch --show-current
git log origin/main..HEAD --oneline 2>/dev/null | head -5
```
- Report branch name, clean/dirty status, ahead/behind count

#### A2. Build Status
```bash
pnpm type-check 2>&1 | tail -5
```
- Report pass/fail and error count if failing

#### A3. Environment Variables
Check for presence (not values) of:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REPLICATE_API_TOKEN`
- `STRIPE_SECRET_KEY`

Report count of set vs required.

#### A4. Supabase Local
```bash
supabase status 2>/dev/null | head -10
```
- If supabase CLI not available or not running, report status accordingly

#### A5. Node/pnpm Versions
```bash
node --version 2>/dev/null
pnpm --version 2>/dev/null
```

### Default Output (Section A)
```
[✓] Git: main, clean working tree
[✓] Build: Type-check passing
[✓] Env: 5/5 vars set
[✓] Supabase: Local running
```

### Verbose Output (Section A)
Show full git log, tsc output, env var names (not values), Supabase status, node/pnpm versions.

### Auto-Fix Mode (`--fix`)

When `--fix` is passed, attempt automatic remediation for Section A issues only:

```
Footprint System Status (Auto-Fix)
===================================

[FIX] Missing node_modules...
  Running: pnpm install
  Result: ✓ Installed

[SKIP] Uncommitted changes
  Reason: Cannot auto-fix - manual decision required

Fixed 1/2 issues.
Remaining: 1 manual fix required
```

Fixable issues:
- Missing node_modules → `pnpm install`
- Supabase not running → `supabase start`
- TypeScript errors → report only (cannot auto-fix)

---

## Section B: Plan vs Actual (Implementation Progress)

**Purpose:** Inventory wave stories and cross-reference with git history to show what's done vs planned.
**Section flag:** `--section plan`

### Data Collection

1. **Scan story files:**
   ```bash
   find planning/ stories/ -name "*.json" -not -name "*.schema.*" -not -name "*template*" -not -name "*schedule*" 2>/dev/null | head -50
   ```
   Parse story JSON files to extract: Story ID, Title, Points, Wave number.

2. **Check git history for completed stories:**
   ```bash
   git log --oneline --all | head -100
   ```
   Match commit messages against story IDs (e.g., `WAVE1-FE-001`, `AUTH-BE-001`).
   Also check for branch names:
   ```bash
   git branch --all | head -50
   ```

3. **Calculate metrics:**
   - Total stories and story points
   - Completed stories (found in git log or with status "complete" in JSON)
   - Completion percentage (by count and by points)
   - Current wave (latest wave with activity)

### Default Output (Section B)
```
IMPLEMENTATION  ████████░░░░ 65% (8/12 stories)
  Wave: 1 (Auth & Profiles)  |  Next: WAVE1-FE-003
```

### Verbose Output (Section B)
```
PLAN VS ACTUAL
══════════════

Wave 1: Auth & Profiles     ◐ In Progress (6/8 stories)
Wave 2: Orders               ○ Not Started
Wave 3: Payments             ○ Not Started

Story Details:
| Status | Story ID     | Title                        | Pts |
|--------|-------------|------------------------------|-----|
| ✓      | WAVE1-FE-001| Upload Photo Component        | 5   |
| ✓      | WAVE1-FE-002| Style Selection               | 8   |
| ○      | WAVE1-FE-003| Checkout Flow                 | 13  |
| ...    | ...         | ...                          | ... |

Overall: 8/12 stories (65%)
```

---

## Section C: Test Health

**Purpose:** Aggregate test counts, find skipped/failing tests, calculate test density.
**Section flag:** `--section tests`

### Data Collection

1. **Unit tests (Vitest):**
   ```bash
   pnpm test:run 2>&1 | tail -20
   ```
   If that's too slow or fails, fall back to counting test files:
   ```bash
   find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | grep -v node_modules | wc -l
   ```

2. **E2E tests (Playwright):**
   ```bash
   find e2e -name "*.e2e.*" 2>/dev/null | wc -l
   ```

3. **Storybook stories:**
   ```bash
   find . -name "*.stories.*" 2>/dev/null | grep -v node_modules | grep -v storybook-static | wc -l
   ```

4. **Find skipped/disabled tests:**
   ```bash
   grep -rn "\.skip\|\.todo\|xit(\|xdescribe(\|xtest(\|test\.skip" app/ components/ lib/ hooks/ stores/ data/ 2>/dev/null | grep -v node_modules | head -20
   ```

### Default Output (Section C)
```
CODE HEALTH   Tests: 84 pass, 0 fail, 2 skipped | E2E: 6 specs | Stories: 12
```

### Verbose Output (Section C)
```
TEST HEALTH
═══════════

Unit Tests (Vitest):
  Test Files: 18
  Tests: 84 passed, 0 failed, 2 skipped
  Coverage: 72% (threshold: 70%)

E2E Tests (Playwright):
  Test Files: 6

Storybook Stories: 12 component stories

Skipped/Disabled Tests:
  lib/payments/__tests__/stripe.test.ts:23  - test.skip("needs API key")

Test Density: 4.7 tests per source file
```

---

## Section D: Technical Debt

**Purpose:** Count markers of technical debt across the codebase.
**Section flag:** `--section debt`

### Data Collection

```bash
# TODO/FIXME/HACK comments
grep -rn "TODO\|FIXME\|HACK\|XXX\|TEMP\|WORKAROUND" app/ components/ lib/ hooks/ stores/ data/ pages/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v node_modules | grep -v ".test." | wc -l
```

```bash
# TypeScript type escapes
grep -rn "as any\|@ts-ignore\|@ts-expect-error\|@ts-nocheck" app/ components/ lib/ hooks/ stores/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | wc -l
```

```bash
# Console statements in production code
grep -rn "console\.\(log\|warn\|error\|debug\)" app/ components/ lib/ hooks/ stores/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".test." | grep -v "__tests__" | wc -l
```

```bash
# Mock API usage (NEXT_PUBLIC_USE_MOCK still active?)
grep -rn "NEXT_PUBLIC_USE_MOCK\|mock\.ts\|useMock" lib/api/ 2>/dev/null | wc -l
```

### Default Output (Section D)
```
  Debt: 12 TODOs, 3 type-escapes, 5 console.logs
```

### Verbose Output (Section D)
```
TECHNICAL DEBT
══════════════

Code Markers:
  TODO:        8 occurrences
  FIXME:       3 occurrences
  HACK:        1 occurrence

Type Safety:
  as any:       2 occurrences
  @ts-ignore:   1 occurrence

Console Statements (non-test):
  console.log:   4 occurrences
  console.warn:  1 occurrence

Mock API Layer:
  Mock references: 5 (check if NEXT_PUBLIC_USE_MOCK should be disabled)

Top Files by Debt:
  lib/api/supabase-client.ts     - 3 markers
  lib/payments/stripe.ts         - 2 markers

Trend: [tracked if git history available]
```

---

## Section E: Dependency Security

**Purpose:** Check for known vulnerabilities and outdated packages.
**Section flag:** `--section deps`

### Data Collection

1. **pnpm audit:**
   ```bash
   pnpm audit --json 2>/dev/null | head -80
   ```
   Extract: total vulnerabilities, critical/high/moderate/low counts.

2. **Outdated packages:**
   ```bash
   pnpm outdated 2>/dev/null | head -20
   ```

3. **Dependabot / GitHub alerts (if available):**
   ```bash
   gh api repos/{owner}/{repo}/dependabot/alerts --jq '.[].security_advisory.summary' 2>/dev/null | head -10
   ```
   If gh not authenticated or no repo, skip silently.

### Default Output (Section E)
```
  Deps: 0 critical, 1 moderate vuln | 5 outdated packages
```

### Verbose Output (Section E)
```
DEPENDENCY SECURITY
═══════════════════

pnpm audit:
  Critical:  0
  High:      0
  Moderate:  1
  Low:       3

Outdated Packages:
  next: 14.1.0 → 14.2.3
  @supabase/supabase-js: 2.38.0 → 2.42.0
  ...

GitHub Dependabot: No alerts (or: not configured)
```

---

## Section F: Infrastructure Readiness

**Purpose:** Inventory of implemented features and integration status.
**Section flag:** `--section infra`

### Data Collection

1. **Feature/module inventory:**
   ```bash
   ls -d lib/*/ 2>/dev/null
   ls -d app/\(app\)/*/ app/\(marketing\)/*/ app/\(auth\)/*/ app/api/*/ 2>/dev/null
   ```

2. **Check for mock/stub patterns (indicates incomplete integration):**
   ```bash
   grep -rn "mock\|stub\|fake\|placeholder\|not.implemented\|NotImplemented\|TODO.*implement" lib/ app/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".test." | grep -v "__tests__" | grep -v "mock.ts" | wc -l
   ```

3. **API routes inventory:**
   ```bash
   find app/api -name "route.ts" -o -name "route.js" 2>/dev/null | wc -l
   ```

4. **Storybook health:**
   ```bash
   pnpm storybook --ci 2>&1 | head -5
   ```
   Or just check if storybook config exists:
   ```bash
   test -f .storybook/main.ts && echo "configured" || echo "missing"
   ```

### Default Output (Section F)
```
  Infra: 7 lib modules | 8 API routes | Storybook: configured
```

### Verbose Output (Section F)
```
INFRASTRUCTURE READINESS
════════════════════════

Library Modules:
  ✓ lib/ai/            (Replicate integration)
  ✓ lib/pricing/       (Price calculator)
  ✓ lib/payments/      (Stripe & PayPlus)
  ✓ lib/storage/       (Cloudflare R2)
  ✓ lib/supabase/      (DB clients)
  ✓ lib/fulfillment/   (Order management)
  ✓ lib/shipping/      (Israel Post)

API Routes: 8 endpoints
  app/api/auth/
  app/api/orders/
  app/api/payments/
  ...

Storybook: Configured, 12 stories

Mock/Stub Count: 5 patterns found
```

---

## Section G: Velocity Metrics

**Purpose:** Development velocity based on git history.
**Section flag:** `--section velocity`

### Data Collection

```bash
# Commits in last 7 days
git log --oneline --since="7 days ago" | wc -l

# Commits in last 30 days
git log --oneline --since="30 days ago" | wc -l

# Story-related commits (by conventional commit pattern)
git log --oneline --since="30 days ago" --grep="feat\|fix\|refactor" | wc -l

# Unique days with commits (last 30 days)
git log --format="%ad" --date=short --since="30 days ago" | sort -u | wc -l

# Lines changed in last 7 days
git diff --stat HEAD~20 HEAD 2>/dev/null | tail -1
```

### Default Output (Section G)
```
  Velocity: 32 commits/30d | 8 stories landed | 4 active days/wk
```

### Verbose Output (Section G)
```
VELOCITY METRICS
════════════════

Commit Activity:
  Last 7 days:    12 commits
  Last 30 days:   32 commits
  Active days:    12/30 (40%)

Story Throughput:
  Stories completed: 8
  Avg per week:     ~2

Code Churn (last 7 days):
  Files changed: 22
  Insertions:    1,430
  Deletions:     280
```

---

## Section H: Untracked File Hygiene

**Purpose:** Identify untracked files that may need to be committed or gitignored.
**Section flag:** `--section hygiene`

### Data Collection

```bash
# Count untracked files
git status --porcelain | grep "^??" | wc -l

# List untracked files (first 30)
git status --porcelain | grep "^??" | head -30

# Check if .gitignore exists
test -f .gitignore && echo "exists" || echo "missing"
```

### Classification

Classify untracked files into categories:
- **Should commit:** Source files, configs, docs (`.claude/commands/`, `docs/`, `planning/`)
- **Should gitignore:** Build artifacts, coverage reports, temp files (`coverage/`, `storybook-static/`, `.next/`)
- **Review needed:** Everything else

### Default Output (Section H)
```
  Hygiene: 15 untracked files (5 to commit, 4 to gitignore, 6 review)
```

### Verbose Output (Section H)
```
UNTRACKED FILE HYGIENE
══════════════════════

Total Untracked: 15 files

Should Commit (5):
  .claude/commands/new-command.md
  planning/gaps/auth-gaps.md
  ...

Should .gitignore (4):
  coverage/               (build artifact)
  storybook-static/       (generated)
  ...

Review Needed (6):
  IMPLEMENTATION-SUMMARY.md
  ...

Suggested .gitignore additions:
  coverage/
  storybook-static/
```

---

## Section I: Signal & Lock Check

**Purpose:** Check for emergency stops, stale signals, expired locks.
**Section flag:** `--section signals`

### Data Collection

1. **Emergency stop:**
   ```bash
   test -f .claude/EMERGENCY-STOP && cat .claude/EMERGENCY-STOP || echo "not set"
   ```

2. **Signal files:**
   ```bash
   ls -la .claude/signal-* 2>/dev/null
   ls -la .claude/signals/ 2>/dev/null
   ```
   Flag any signals older than 24 hours as "stale."

3. **Lock files:**
   ```bash
   ls -la .claude/*.lock .claude/gate0-lock.json 2>/dev/null
   ```

4. **Handoff files:**
   ```bash
   ls -la .claude/handoffs/ 2>/dev/null
   ```
   Report count and most recent.

5. **QA reports:**
   ```bash
   ls -la .claude/qa/ .claude/reports/ .claude/retrospectives/ 2>/dev/null
   ```

### Default Output (Section I)
```
  Signals: No emergency stop | 0 stale signals | 1 lock | 2 handoffs
```

### Verbose Output (Section I)
```
SIGNAL & LOCK CHECK
═══════════════════

Emergency Stop:  ✓ Not active
Stale Signals:   0 found

Lock Files:
  .claude/gate0-lock.json       (exists)
  .claude/PREFLIGHT.lock        (exists)

Handoff Files:
  .claude/handoffs/             (directory present)

QA Reports:
  .claude/qa/                   (2 files)
  .claude/retrospectives/       (1 file)

Signal Health: All clear
```

---

## Section J: Next Steps (Intelligent Recommendations)

**Purpose:** Based on all collected data, provide prioritized next actions.
**Section flag:** `--section next`

### Recommendation Logic

Analyze the results from all sections above and generate 3-5 prioritized recommendations. Use this priority order:

1. **BLOCKERS** (from Section A): System health failures that prevent work
   - e.g., "Fix build: TypeScript errors"
   - e.g., "Set missing env var: STRIPE_SECRET_KEY"

2. **SECURITY** (from Section E): Critical/high vulnerabilities
   - e.g., "Run `pnpm audit fix` — 1 high severity vulnerability"

3. **NEXT STORY** (from Section B): The next unstarted story in execution order
   - e.g., "Start WAVE1-FE-003 (Checkout Flow, 13 pts) — dependencies met"

4. **TEST GAPS** (from Section C): Skipped tests or low coverage
   - e.g., "Re-enable 2 skipped tests in payments module"

5. **DEBT HOTSPOTS** (from Section D): Files with high debt concentration
   - e.g., "Address 3 TODOs in lib/api/supabase-client.ts"

6. **HYGIENE** (from Section H): Untracked files that need attention
   - e.g., "Add coverage/ to .gitignore (build artifacts)"

7. **STALE SIGNALS** (from Section I): Expired locks or old signals
   - e.g., "Clean up stale preflight lock"

### Default Output (Section J)
```
NEXT STEPS
  1. Start WAVE1-FE-003 (Checkout Flow, 13 pts)
  2. Run pnpm audit fix (1 moderate vulnerability)
  3. Re-enable 2 skipped tests
  4. Add coverage/ to .gitignore
```

### Verbose Output (Section J)
```
NEXT STEPS (Prioritized)
════════════════════════

Priority 1 — NEXT STORY
  → Start WAVE1-FE-003: Checkout Flow (13 pts)
    Dependencies: WAVE1-FE-002 ✓ complete
    Command: /execute-story WAVE1-FE-003

Priority 2 — SECURITY
  → Run: pnpm audit fix
    1 moderate vulnerability can be auto-fixed

Priority 3 — TEST HEALTH
  → Re-enable skipped tests:
    - lib/payments/__tests__/stripe.test.ts:23

Priority 4 — HYGIENE
  → Add to .gitignore: coverage/, storybook-static/

Priority 5 — TECHNICAL DEBT
  → Top debt file: lib/api/supabase-client.ts (3 TODOs)
    Consider addressing during next related story
```

---

## JSON Output Format (`--json`)

When `--json` is passed, output a single JSON object:

```json
{
  "timestamp": "2026-02-08T14:30:00Z",
  "dashboard_version": "2.0.0",
  "project": "footprint",
  "system_health": {
    "healthy": true,
    "checks": {
      "git": { "status": "ok", "branch": "main", "clean": true },
      "build": { "status": "ok", "errors": 0 },
      "env": { "status": "ok", "vars_set": 5, "vars_required": 5 },
      "supabase": { "status": "ok", "local": true }
    }
  },
  "implementation": {
    "total_stories": 12,
    "completed_stories": 8,
    "completion_pct": 65,
    "current_wave": "Wave 1: Auth & Profiles",
    "next_story": "WAVE1-FE-003"
  },
  "code_health": {
    "test_files": 18,
    "tests_passed": 84,
    "tests_failed": 0,
    "tests_skipped": 2,
    "e2e_specs": 6,
    "storybook_stories": 12,
    "coverage_pct": 72
  },
  "technical_debt": {
    "total_markers": 12,
    "todos": 8,
    "fixmes": 3,
    "hacks": 1,
    "type_escapes": 3,
    "console_statements": 5
  },
  "dependency_security": {
    "vulnerabilities": { "critical": 0, "high": 0, "moderate": 1, "low": 3 },
    "outdated_packages": 5
  },
  "infrastructure": {
    "lib_modules": 7,
    "api_routes": 8,
    "storybook": "configured",
    "mock_patterns": 5
  },
  "velocity": {
    "commits_7d": 12,
    "commits_30d": 32,
    "stories_completed": 8,
    "active_days_30d": 12
  },
  "hygiene": {
    "untracked_files": 15,
    "should_commit": 5,
    "should_gitignore": 4,
    "review_needed": 6
  },
  "signals": {
    "emergency_stop": false,
    "stale_signals": 0,
    "lock_files": 2,
    "handoff_files": 1
  },
  "next_steps": [
    "Start WAVE1-FE-003 (Checkout Flow, 13 pts)",
    "Run pnpm audit fix (1 moderate vulnerability)",
    "Re-enable 2 skipped tests",
    "Add coverage/ to .gitignore"
  ]
}
```

---

## Rendering Rules

### Default Mode (no flags)

Render the compact dashboard (~35 lines):

```
╔═══════════════════════════════════════════════════════════════╗
║  FOOTPRINT STATUS DASHBOARD                         /status  ║
╠═══════════════════════════════════════════════════════════════╣

  SYSTEM HEALTH
  [✓] Git   [✓] Build   [✓] Env   [✓] Supabase

  IMPLEMENTATION
  ████████████░░░░░░░░ 65%  (8/12 stories)
  Current: Wave 1 — Auth & Profiles  |  Next: WAVE1-FE-003

  CODE HEALTH
  Tests: 84 pass, 0 fail, 2 skip  |  E2E: 6  |  Debt: 12 markers

  INFRASTRUCTURE
  Lib modules: 7  |  API routes: 8  |  Storybook: 12 stories
  Signals: clean  |  Hygiene: 15 untracked (4 should gitignore)

  NEXT STEPS
  1. Start WAVE1-FE-003 (Checkout Flow, 13 pts)
  2. Run pnpm audit fix — 1 moderate vulnerability
  3. Re-enable 2 skipped tests
  4. Add coverage/ to .gitignore

╚═══════════════════════════════════════════════════════════════╝
```

### Progress Bar Rendering

Use block characters for the progress bar:
- `█` for completed portions
- `░` for remaining portions
- Scale to 20 characters wide
- Show percentage and fraction

Example at 65%: `█████████████░░░░░░░ 65%`

### Status Icons

- `[✓]` — passing / healthy / complete
- `[✗]` — failing / error / blocked
- `[!]` — warning / needs attention
- `✓` — inline pass (for story status)
- `○` — not started
- `◐` — in progress

### Color Guidance

When rendering in a terminal-capable environment:
- Green: passing, healthy, complete
- Red: failing, critical
- Yellow: warnings, in progress
- Dim: informational, not started

---

## Verbose Mode (`--verbose`)

When `--verbose` is passed, render ALL sections with their verbose output format. Use the section headers with double-line box characters:

```
═══════════════════════════════════════════════════════════════
  FOOTPRINT STATUS DASHBOARD (Verbose)               /status
═══════════════════════════════════════════════════════════════

SYSTEM HEALTH
═════════════
[verbose Section A output]

PLAN VS ACTUAL
══════════════
[verbose Section B output]

TEST HEALTH
═══════════
[verbose Section C output]

TECHNICAL DEBT
══════════════
[verbose Section D output]

DEPENDENCY SECURITY
═══════════════════
[verbose Section E output]

INFRASTRUCTURE READINESS
════════════════════════
[verbose Section F output]

VELOCITY METRICS
════════════════
[verbose Section G output]

UNTRACKED FILE HYGIENE
══════════════════════
[verbose Section H output]

SIGNAL & LOCK CHECK
═══════════════════
[verbose Section I output]

NEXT STEPS (Prioritized)
════════════════════════
[verbose Section J output]

═══════════════════════════════════════════════════════════════
```

---

## Section-Only Mode (`--section <name>`)

When `--section <name>` is passed, show only that section in verbose form.

**Valid section names and mappings:**
| Name | Section |
|------|---------|
| `system` | A. System Health |
| `plan` | B. Plan vs Actual |
| `tests` | C. Test Health |
| `debt` | D. Technical Debt |
| `deps` | E. Dependency Security |
| `infra` | F. Infrastructure Readiness |
| `velocity` | G. Velocity Metrics |
| `hygiene` | H. Untracked Hygiene |
| `signals` | I. Signal & Lock Check |
| `next` | J. Next Steps |

If an invalid section name is given, show the list of valid names.

---

## Error Handling

- If a command fails (e.g., `supabase` not installed, `pnpm` not found), mark that check as `[!] Unavailable` and continue.
- Never let one section failure prevent other sections from running.
- If no story files are found, skip Section B with: `[!] Plan: No story files found`
- Skip checks gracefully when directories don't exist.

---

## Backward Compatibility

- `--fix` works exactly as before, applying only to Section A (System Health)
- `--section system` gives output equivalent to the old `/status` command
- All original health checks preserved in Section A
- JSON output includes all original fields in `system_health` plus new sections

---

## Integration

- Used by: `/preflight` (Section A subset), `/go` (session start)
- Used by: `/report` (velocity and progress data)
- Reads: Git, Environment, Supabase, story files, source files
- Outputs: Console, JSON

## Performance Notes

- Default mode should complete in <15 seconds
- Avoid running full test suites in default mode (count files instead)
- `--verbose` may take 30-60 seconds due to pnpm audit and test execution
- Cache nothing — always show live data

## Evidence Sources

- Original spec: `.claude/SKILLS-RECOMMENDATION.md` (Section 3.8)
- Story files: Implementation plan and progress
- Git history: Completion evidence
- pnpm/Supabase: Runtime health
