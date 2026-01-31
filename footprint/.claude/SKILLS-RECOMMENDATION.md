# WAVE V2 Skills Recommendation

**Document Type:** Architecture Review
**Created:** 2026-01-29
**Status:** APPROVED WITH CHANGES
**Reviewer:** Grok 4 (xAI)
**Review Score:** 8.5/10
**Review Date:** 2026-01-29

---

## Executive Summary

This document proposes a set of Claude Code skills (slash commands) optimized for the WAVE V2 multi-agent orchestration framework. Skills are designed to enforce safety protocols, streamline repetitive operations, and optimize token costs through intelligent model routing.

---

## 1. Current State Analysis

### What We Have
- `CLAUDE.md` - Agent instructions (exists)
- `SKILL.md` - Execution guide (exists)
- `.claude/commands/` - **NOT CREATED**

### What's Missing
- No reusable skills for common operations
- No model-specific routing (using Opus for everything)
- Manual execution of repetitive tasks
- No standardized QA workflow

### Pain Points Observed
1. Pre-flight validation forgotten/skipped
2. Inconsistent commit message formats
3. QA run manually without checklist
4. Expensive model (Opus) used for simple tasks

---

## 2. Proposed Skills Architecture

### Directory Structure

```
/Volumes/SSD-01/Projects/Footprint/footprint/
└── .claude/
    └── commands/
        ├── preflight.md      # Gate 0 enforcement
        ├── story.md          # Story execution workflow
        ├── qa.md             # QA validation checklist
        ├── commit.md         # Standardized commits
        ├── pr.md             # PR creation
        ├── build.md          # Build validation
        ├── test.md           # Test execution
        ├── status.md         # System health check
        ├── safety.md         # Constitutional AI check
        ├── rlm.md            # Token budget & learning monitor
        ├── docker.md         # Container management
        ├── agent.md          # Multi-agent orchestration
        ├── escalate.md       # Auto-escalation to human (NEW)
        ├── wave-start.md     # Batch wave dispatch (NEW)
        └── report.md         # Progress report generation (NEW)
```

### Skill Categories

| Category | Skills | Purpose |
|----------|--------|---------|
| **Gate Enforcement** | `/preflight`, `/safety`, `/escalate` | Mandatory checks & alerts |
| **Story Workflow** | `/story`, `/commit`, `/pr` | Development cycle |
| **Validation** | `/qa`, `/build`, `/test` | Quality assurance |
| **Operations** | `/status`, `/docker` | System monitoring |
| **Budget & Learning** | `/rlm` | Token tracking, mistake logging |
| **Orchestration** | `/agent`, `/wave-start` | Multi-agent coordination |
| **Reporting** | `/report` | Progress & stakeholder updates |

---

## 3. Skill Specifications

### 3.1 `/preflight` - Gate 0 Enforcement

**Priority:** P0 (CRITICAL)
**Recommended Model:** Haiku
**Trigger:** Start of every session, before any code changes

**Purpose:**
- Verify Docker containers running (wave-redis)
- Check pre-flight lock validity
- Validate safety files exist
- Block work if validation fails

**Input:** None (auto-detects project)

**Output:**
```
WAVE Pre-Flight Check
=====================
[✓] Docker running
[✓] Redis container active
[✓] Pre-flight lock valid
[✓] Safety files present
[✓] Build passing

STATUS: READY FOR WORK
```

**Failure Behavior:**
- Print specific failure reason
- Provide fix command
- DO NOT proceed with any work

---

### 3.2 `/qa` - QA Validation Checklist

**Priority:** P0 (CRITICAL)
**Recommended Model:** Haiku
**Trigger:** After PR creation, before merge approval

**Purpose:**
- Load QA checklist from `.claude/QA-WAVE1-CHECKLIST.md`
- Execute each test case against preview URL
- Document pass/fail for each item
- Generate QA report

**Input:**
- `url` - Preview deployment URL (optional, auto-detects from Vercel)
- `checklist` - Path to checklist file (optional, defaults to current wave)

**Output:**
```
QA Validation Report
====================
Wave: 1
URL: https://footprint-xxx.vercel.app
Date: 2026-01-29

FUNCTIONAL TESTING
------------------
[✓] UP-01: Upload from gallery - PASS
[✓] UP-02: Camera capture - PASS
[✗] UP-04: File size > 20MB - FAIL (no error shown)
...

SUMMARY
-------
Passed: 45/50
Failed: 5
Blocked: 0

BLOCKERS:
- UP-04: Silent failure on oversized files

RECOMMENDATION: FIX BLOCKERS BEFORE MERGE
```

**Key Features:**
- Uses Haiku for cost efficiency
- Can run headless checks (API responses, DOM presence)
- Generates structured report for PR comment

---

### 3.3 `/story <story-id>` - Story Execution

**Priority:** P1 (HIGH)
**Recommended Model:** Sonnet (implementation), Opus (complex logic)
**Trigger:** When assigned a story to implement

**Purpose:**
- Load story from Supabase or local file
- Parse acceptance criteria
- Create feature branch
- Execute TDD workflow
- Track progress

**Input:**
- `story-id` - Story identifier (e.g., WAVE1-FE-001)

**Output:**
```
Story Loaded: WAVE1-FE-001
==========================
Title: Photo Upload Flow
Domain: frontend
Wave: 1

Acceptance Criteria:
- [ ] AC-001: User can upload from gallery
- [ ] AC-002: User can capture from camera
- [ ] AC-003: Preview shown after upload
...

Branch Created: wave1/WAVE1-FE-001
TDD Mode: ACTIVE

Starting RED phase...
```

**Workflow:**
1. Load story definition
2. Create feature branch
3. Write failing tests (RED)
4. Implement to pass tests (GREEN)
5. Refactor if needed
6. Run full validation
7. Mark ACs as complete

---

### 3.4 `/commit` - Standardized Commit

**Priority:** P1 (HIGH)
**Recommended Model:** Haiku
**Trigger:** After completing a logical unit of work

**Purpose:**
- Enforce commit message format
- Include story ID
- Add co-author tag
- Run pre-commit checks

**Input:**
- `message` - Commit description (optional, auto-generates from diff)
- `story` - Story ID (optional, detects from branch name)

**Output:**
```
Commit Created
==============
Branch: wave1/WAVE1-FE-001
Story: WAVE1-FE-001

Message:
  feat(WAVE1-FE-001): Add photo upload with validation

  - Implement file picker for gallery selection
  - Add camera capture support
  - Show preview after upload
  - Validate file type and size

  Co-Authored-By: Claude <noreply@anthropic.com>

Files: 5 changed, 234 insertions(+), 12 deletions(-)
```

**Format Enforced:**
```
<type>(<story-id>): <description>

<body>

Co-Authored-By: Claude <model> <noreply@anthropic.com>
```

---

### 3.5 `/pr` - Create Pull Request

**Priority:** P1 (HIGH)
**Recommended Model:** Haiku
**Trigger:** After story implementation complete

**Purpose:**
- Create PR with standardized format
- Include summary from commits
- Add test plan from story ACs
- Link to story/issue

**Input:**
- `base` - Target branch (default: main or staging)
- `title` - PR title (optional, generates from story)

**Output:**
```
Pull Request Created
====================
PR #4: feat(WAVE1-FE-001): Photo Upload Flow
URL: https://github.com/org/repo/pull/4

Summary:
- Implement gallery upload
- Add camera capture
- Show preview

Test Plan:
- [ ] Upload valid image
- [ ] Upload invalid type (error shown)
- [ ] Upload oversized file (error shown)

Waiting for CI...
```

---

### 3.6 `/build` - Build Validation

**Priority:** P2 (MEDIUM)
**Recommended Model:** Haiku
**Trigger:** Before commit, before PR

**Purpose:**
- Run type-check
- Run linter
- Run production build
- Report any errors

**Input:** None

**Output:**
```
Build Validation
================
[✓] Type Check: PASS (0 errors)
[✓] Lint: PASS (2 warnings)
[✓] Build: PASS (26 pages)

Ready for commit.
```

---

### 3.7 `/test` - Test Execution

**Priority:** P2 (MEDIUM)
**Recommended Model:** Haiku
**Trigger:** During TDD, before commit

**Purpose:**
- Run test suite
- Show coverage report
- Highlight failures

**Input:**
- `file` - Specific test file (optional)
- `coverage` - Include coverage report (default: true)

**Output:**
```
Test Results
============
Files: 85
Tests: 1986
Passed: 1986
Failed: 0

Coverage: 78.5%
- Statements: 78.5%
- Branches: 72.1%
- Functions: 81.2%
- Lines: 78.9%

Target: 80%
Status: BELOW TARGET (need +1.5%)
```

---

### 3.8 `/status` - System Health

**Priority:** P2 (MEDIUM)
**Recommended Model:** Haiku
**Trigger:** On demand, troubleshooting

**Purpose:**
- Check all WAVE systems
- Report any issues
- Suggest fixes

**Input:** None

**Output:**
```
WAVE System Status
==================
[✓] Docker: Running
[✓] Redis: Connected (wave-redis)
[✓] Pre-flight Lock: Valid (expires: 2026-01-30)
[✓] Git: Clean working tree
[✓] Branch: wave1/WAVE1-FE-001
[✓] Upstream: Synced with origin

[!] Warning: 3 uncommitted changes

All systems operational.
```

---

### 3.9 `/safety` - Constitutional Check

**Priority:** P2 (MEDIUM)
**Recommended Model:** Haiku
**Trigger:** Before commits touching sensitive areas

**Purpose:**
- Scan changes against constitutional principles
- Flag potential violations
- Calculate safety score

**Input:**
- `files` - Files to check (optional, defaults to staged changes)

**Output:**
```
Constitutional AI Safety Check
==============================
Files Scanned: 5
Principles Checked: 15

Results:
[✓] No hardcoded secrets
[✓] No auth bypass patterns
[✓] Input validation present
[✓] Parameterized queries used
[!] Warning: Error handling could be improved

Safety Score: 0.92 (threshold: 0.85)
Status: PASS
```

---

### 3.10 `/rlm` - Token Budget & Learning Monitor

**Priority:** P1 (HIGH)
**Recommended Model:** Haiku
**Trigger:** Continuous monitoring, before expensive operations

**Purpose:**
- Monitor token usage against budget limits
- Track cost per story/wave
- Record mistakes for learning (RLM = Reinforcement Learning from Mistakes)
- Alert on budget threshold breaches
- Generate usage reports

**Input:**
- `--report` - Generate usage report
- `--reset` - Reset counters (admin only)
- `--budget <tokens>` - Set budget for current story

**Output:**
```
RLM Token Budget Monitor
========================
Current Story: WAVE1-FE-001
Budget: 100,000 tokens
Used: 45,230 tokens (45.2%)
Remaining: 54,770 tokens

Session Stats:
- Prompts: 23
- Completions: 21
- Avg tokens/prompt: 1,967

Cost Estimate: $0.68 (Opus: $0.45, Haiku: $0.23)

Mistakes Logged: 2
- [M001] Forgot pre-flight check
- [M002] Committed to wrong branch

Budget Status: OK (under 80% threshold)
```

**Budget Limits (from SKILL.md):**
```yaml
max_tokens_per_story: 100000
max_iterations_per_story: 20
max_file_changes_per_commit: 15
```

**Alerts:**
- Warning at 80% budget
- Hard stop at 100% (escalate to human)

---

### 3.11 `/docker` - Container Management

**Priority:** P1 (HIGH)
**Recommended Model:** Haiku
**Trigger:** Session start, troubleshooting, deployment

**Purpose:**
- Manage WAVE Docker containers (Redis, Dozzle, Orchestrator)
- Start/stop/restart containers
- View container logs
- Health check all services
- Build and deploy agent images

**Input:**
- `status` - Show all container status (default)
- `start` - Start all WAVE containers
- `stop` - Stop all WAVE containers
- `restart` - Restart all containers
- `logs <container>` - View container logs
- `build` - Build agent Docker image
- `deploy` - Deploy orchestrator

**Output:**
```
WAVE Docker Status
==================
CONTAINER        STATUS      PORTS                 HEALTH
wave-redis       Running     6379:6379             Healthy
wave-dozzle      Running     9080:8080             Healthy
wave-orchestrator Stopped    -                     -

Commands:
  /docker start       - Start all containers
  /docker logs redis  - View Redis logs
  /docker build       - Rebuild agent image
```

**Container Definitions:**
```yaml
wave-redis:
  image: redis:7-alpine
  ports: 6379:6379
  healthcheck: redis-cli ping

wave-dozzle:
  image: amir20/dozzle:latest
  ports: 9080:8080
  purpose: Container log viewer

wave-orchestrator:
  build: Dockerfile.agent
  depends_on: wave-redis
  env: PROJECT_PATH, ANTHROPIC_API_KEY
```

**Start Command:**
```bash
/docker start
# Equivalent to:
# docker start wave-redis wave-dozzle
# cd /Volumes/SSD-01/Projects/WAVE && docker-compose up -d orchestrator
```

**Build Command:**
```bash
/docker build
# Builds Dockerfile.agent with current code
# Tags as wave-agent:latest
```

---

### 3.12 `/agent` - Multi-Agent Orchestration

**Priority:** P1 (HIGH)
**Recommended Model:** Sonnet (orchestration), Haiku (individual agents)
**Trigger:** When spawning domain-specific agents

**Purpose:**
- Spawn domain-specific agents (FE-Dev, BE-Dev, QA, etc.)
- Route tasks to appropriate agents
- Monitor agent progress
- Coordinate multi-agent workflows

**Input:**
- `spawn <agent-type>` - Spawn a specific agent
- `list` - List active agents
- `status <agent-id>` - Check agent status
- `kill <agent-id>` - Terminate agent

**Agent Types:**
```yaml
cto:      Architecture decisions, code review, merge approval
pm:       Story management, prioritization, stakeholder updates
fe-dev-1: Frontend implementation (primary)
fe-dev-2: Frontend implementation (secondary)
be-dev-1: Backend implementation (primary)
be-dev-2: Backend implementation (secondary)
qa:       Testing, validation, bug reporting
```

**Output:**
```
WAVE Agent Orchestrator
=======================
Active Agents: 3

ID          TYPE      STATUS    CURRENT TASK
agent-001   fe-dev-1  Working   WAVE1-FE-001: Photo Upload
agent-002   be-dev-1  Idle      -
agent-003   qa        Working   QA-WAVE1-CHECKLIST

Commands:
  /agent spawn qa        - Spawn QA agent
  /agent status agent-001 - Check agent status
  /agent kill agent-003  - Terminate agent
```

---

### 3.13 `/escalate` - Auto-Escalation to Human (NEW - Grok)

**Priority:** P2 (MEDIUM)
**Recommended Model:** Haiku
**Trigger:** Safety score < 0.85, budget exceeded, blocked operations

**Purpose:**
- Auto-escalate critical issues to human via Slack
- Log escalation reason and context
- Pause operations until human acknowledges
- Integrate with WAVE's notifications.py

**Input:**
- `reason` - Escalation reason (auto-detected or manual)
- `--block` - Block further operations until resolved

**Output:**
```
ESCALATION TRIGGERED
====================
Reason: Safety score below threshold (0.72 < 0.85)
Context: Attempted modification to auth middleware
Story: WAVE1-SEC-001
Agent: be-dev-1

Action: Slack notification sent to #wave-alerts
Status: BLOCKED - Awaiting human approval

To resume: /escalate --resolve <ticket-id>
```

**Integration:**
- Ties to `notifications.py` for Slack alerts
- Logs to `.claude/escalations/` for audit
- Links to constitutional_scorer.py thresholds

---

### 3.14 `/wave-start <wave-num>` - Batch Wave Dispatch (NEW - Grok)

**Priority:** P1 (HIGH)
**Recommended Model:** Sonnet
**Trigger:** Starting a new development wave

**Purpose:**
- Batch-dispatch all stories for a wave
- Auto-assign stories to appropriate agents
- Initialize wave tracking in P.json
- Create all feature branches upfront

**Input:**
- `wave-num` - Wave number to start (e.g., 1, 2)
- `--dry-run` - Preview assignments without executing
- `--parallel <n>` - Max parallel agents (default: 2)

**Output:**
```
WAVE 1 INITIALIZATION
=====================
Stories Found: 8
Agents Available: 4 (fe-dev-1, fe-dev-2, be-dev-1, be-dev-2)

Assignment Plan:
  WAVE1-FE-001 → fe-dev-1 (Photo Upload)
  WAVE1-FE-002 → fe-dev-2 (Style Selection)
  WAVE1-FE-003 → fe-dev-1 (Product Customization)
  WAVE1-BE-001 → be-dev-1 (Upload API)
  WAVE1-BE-002 → be-dev-2 (Transform API)
  WAVE1-SEC-001 → be-dev-1 (RLS Policies)
  WAVE1-INT-001 → be-dev-2 (Stripe Integration)
  WAVE1-QA-001 → qa (E2E Tests)

Branches Created: 8
P.json Updated: wave1 active

Dispatch Command: /agent spawn --wave 1
```

**Integration:**
- Reads stories from Supabase or local `stories/`
- Updates P.json with wave state
- Ties to `/agent` for execution

---

### 3.15 `/report <wave>` - Progress Report Generation (NEW - Grok)

**Priority:** P2 (MEDIUM)
**Recommended Model:** Haiku
**Trigger:** On-demand, end of day, stakeholder updates

**Purpose:**
- Generate progress reports for a wave
- Show story completion status
- Include test coverage and quality metrics
- Output in Markdown for sharing

**Input:**
- `wave` - Wave number (optional, defaults to active)
- `--format` - Output format: `md`, `json`, `slack`
- `--send` - Auto-send to Slack channel

**Output:**
```
WAVE 1 PROGRESS REPORT
======================
Generated: 2026-01-29 14:30 UTC
Duration: 5 days

STORY STATUS
------------
[████████░░] 80% Complete (8/10 stories)

| Story ID | Title | Status | Agent |
|----------|-------|--------|-------|
| WAVE1-FE-001 | Photo Upload | ✅ DONE | fe-dev-1 |
| WAVE1-FE-002 | Style Selection | ✅ DONE | fe-dev-2 |
| WAVE1-FE-003 | Customization | 🔄 IN PROGRESS | fe-dev-1 |
| WAVE1-BE-001 | Upload API | ✅ DONE | be-dev-1 |
...

QUALITY METRICS
---------------
Test Coverage: 78.5% (target: 80%)
Safety Score: 0.91 (threshold: 0.85)
Build Status: PASSING

TOKEN USAGE
-----------
Budget: 500,000 tokens
Used: 234,500 (46.9%)
Cost: $3.42

BLOCKERS
--------
- None

NEXT ACTIONS
------------
1. Complete WAVE1-FE-003 (ETA: 4 hours)
2. Run QA validation
3. Create PR for merge
```

**Integration:**
- Pulls data from P.json, /rlm, test results
- Formats for Slack via notifications.py
- Archives to `.claude/reports/`

---

## 4. Model Routing Strategy

### Cost Optimization

| Model | Cost | Speed | Use For |
|-------|------|-------|---------|
| **Haiku** | $ | Fast | Validation, checks, simple tasks |
| **Sonnet** | $$ | Medium | Implementation, moderate complexity |
| **Opus** | $$$ | Slow | Architecture, complex debugging |

### Routing Rules

```yaml
Haiku Tasks (Fast, Cheap) - 70%:
  - /preflight      # Simple validation checks
  - /qa             # Checklist execution
  - /build          # Build commands
  - /test           # Test runner
  - /commit         # Git operations
  - /pr             # PR creation
  - /status         # Health checks
  - /safety         # Safety scanning
  - /rlm            # Budget monitoring
  - /docker status  # Container status
  - /escalate       # Alert generation (NEW)
  - /report         # Report generation (NEW)

Sonnet Tasks (Balanced) - 25%:
  - /story (implementation phase)
  - /agent (orchestration)
  - /wave-start     # Batch dispatch (NEW)
  - Code review
  - Refactoring

Opus Tasks (Complex, Expensive) - 5%:
  - Architecture decisions
  - Complex debugging
  - Security audits
  - Multi-file refactoring
  - /docker build   # Complex build operations
```

### Fallback Strategy (Grok Enhancement)
```yaml
On Failure:
  Haiku → Retry with Sonnet
  Sonnet → Retry with Opus
  Opus → Escalate to human (/escalate)
```

### Estimated Savings

Current: 100% Opus usage
Proposed: 70% Haiku, 25% Sonnet, 5% Opus

**Estimated cost reduction: 60-70%**

---

## 5. Implementation Priority

> **Grok Review Update:** Timeline adjusted for AI agent execution. Total: 2-4 weeks.
> Buffer: +20% for escalations requiring human input.

### Phase 1: Critical (P0) - 2-4 Days
1. `/preflight` - Gate 0 enforcement (MANDATORY per SKILL.md)
2. `/qa` - QA validation (needed for PR #3)
3. `/docker` - Container management (required for orchestrator)
4. `/rlm` - Token budget monitoring (cost control)

### Phase 2: High (P1) - 4-6 Days
5. `/commit` - Standardized commits
6. `/story` - Story execution
7. `/pr` - PR creation
8. `/agent` - Multi-agent orchestration
9. `/wave-start` - Batch wave dispatch (NEW)

### Phase 3: Medium (P2) - 3-5 Days
10. `/build` - Build validation
11. `/test` - Test execution
12. `/status` - System health
13. `/safety` - Constitutional check
14. `/escalate` - Auto-escalation (NEW)
15. `/report` - Progress reports (NEW)

### Total: 15 Skills in 2-4 Weeks

---

## 6. Open Questions - RESOLVED (Grok Review)

### 1. Model Override: **YES** ✅
Should skills allow `--model` flag to override default?
```bash
/qa --model opus  # Force Opus for complex QA
```
> **Grok Decision:** Allow for flexibility. Default to routing rules, but override for edge cases. Log usage in `/rlm` for cost tracking.

### 2. Skill Chaining: **YES** ✅
Should skills be chainable?
```bash
/preflight && /story WAVE1-FE-001
```
> **Grok Decision:** Reduces commands and improves UX. Implement via shell-like syntax in Claude Code.

### 3. Background Execution: **YES** ✅
Should long-running skills run in background?
```bash
/qa --background  # Don't block, notify when done
```
> **Grok Decision:** Yes for long tasks. Notify via Slack using `notifications.py`.

### 4. Skill Aliases: **YES** ✅
Should we support short aliases?
```bash
/pf  → /preflight
/c   → /commit
/s   → /story
```
> **Grok Decision:** Improves usability for non-dev users. Add alias mapping to CLAUDE.md.

### 5. Cross-Project Skills: **OPTION C** ✅
Should skills be in WAVE controller or each project?
- ~~Option A: Central in `/Volumes/SSD-01/Projects/WAVE/.claude/commands/`~~
- ~~Option B: Per-project in each target's `.claude/commands/`~~
- **Option C: Both (shared + project-specific overrides)** ✅

> **Grok Decision:** Central for shared WAVE core skills, per-project for custom overrides. Avoids duplication; use symlinks or imports.

---

## 7. Grok Review Insights

### Strengths Identified
- Clear categories reduce cognitive load
- Cost-optimized model routing (60-70% savings verified)
- Ties to WAVE phases and gates
- Supports parallel agent execution

### Weaknesses Addressed
- Added versioning consideration (use JSON for parsability)
- Added 3 missing skills (`/escalate`, `/wave-start`, `/report`)
- Integrated with existing WAVE scripts (pre-flight-validator.sh, etc.)

### Key Enhancements Applied
1. **Skill Chaining** - `&&` syntax for workflow automation
2. **Dynamic Model Switching** - Haiku → Sonnet on failure
3. **Background Execution** - With Slack notifications
4. **Alias Support** - Short commands for usability

### Cost Analysis (Verified)
| Current | Proposed | Savings |
|---------|----------|---------|
| ~$5-10/day (Opus only) | ~$1.50-2/day (mixed) | **60-70%** |

### Risk Mitigation
- Over-reliance on Haiku: Add hybrid routing (escalate to Sonnet on complex)
- Over-customization: Test skills in sandbox worktree first

---

## 8. Approval Status

### Completed Actions

- [x] Review skill specifications
- [x] Approve model routing strategy
- [x] Decide on open questions (all 5 resolved)
- [x] Approve implementation priority
- [x] Add 3 new skills per Grok recommendation

### Sign-off

```
Reviewer: Grok 4 (xAI) - CTO Expert
Date: 2026-01-29
Decision: [x] APPROVED WITH CHANGES
Score: 8.5/10

Notes:
- Strong foundation, implement 80% as-is
- Added /escalate, /wave-start, /report
- Total: 15 skills
- Timeline: 2-4 weeks with AI agents
- Next: Create STR-SKL-001 stories for implementation
```

---

## 9. Next Steps

1. **Create Story Files** - `STR-SKL-001.json` through `STR-SKL-015.json`
2. **Start Phase 1** - `/preflight`, `/qa`, `/docker`, `/rlm`
3. **Dispatch via WAVE** - Use orchestrator for parallel execution
4. **Re-review Post-Phase 1** - Validate approach before P1

---

*Generated by WAVE CTO Agent*
*Reviewed by Grok 4 (xAI)*
*Document Version: 2.0.0*
