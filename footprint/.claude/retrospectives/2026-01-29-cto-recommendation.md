# CTO Recommendation: WAVE Infrastructure Fix

**Date:** 2026-01-29
**Author:** CTO Agent (Opus 4.5)
**Status:** ANALYSIS COMPLETE

---

## Executive Summary

The Claude.ai recommendation is **70% over-engineered** for the actual problem. The root cause is a **single misconfiguration** that cascades into multiple symptoms.

**Recommendation:** Apply minimal fix (15 minutes), not 7-phase overhaul (45-60 minutes).

---

## Root Cause Analysis

### The Actual Problem

```
Footprint Project Structure:
/Volumes/SSD-01/Projects/Footprint/          ← Git root (.git here)
├── .git/
├── worktrees/                               ← Worktrees here (correct)
│   ├── fe-dev-1/
│   ├── fe-dev-2/
│   └── ...
├── footprint/                               ← Next.js app (subdirectory)
│   ├── package.json
│   ├── .claude/                             ← Signals and config here
│   └── stories/wave3/
└── package.json                             ← Root package.json (monorepo?)
```

**Current .env configuration (WRONG):**
```bash
PROJECT_PATH=/Volumes/SSD-01/Projects/Footprint/footprint
```

**This causes:**
- Docker mounts `/footprint` as `/project`
- Docker cannot see `/worktrees/` (it's at parent level)
- Agents fail because `WORKTREE_PATH=/project/worktrees/fe-dev-1` doesn't exist

### What Claude.ai Got Right

1. ✓ PROJECT_PATH should point to git root
2. ✓ Need PROJECT_SUBDIR for app location
3. ✓ Worktrees must be accessible in Docker

### What Claude.ai Over-Engineered

| Recommendation | Actual Need | Verdict |
|----------------|-------------|---------|
| Create `paths.py` module | Not needed - bash scripts work fine | SKIP |
| Create `wave-state.json` | P.json works, just don't overwrite it | SKIP |
| Create `validate-infrastructure.sh` | Use existing `wave-preflight.sh` | SKIP |
| Update all scripts for PROJECT_SUBDIR | Only 2-3 lines need change | OVERKILL |
| 7-phase implementation plan | Single .env change + 2 script tweaks | OVERKILL |

---

## Existing Code Analysis

### entrypoint-agent.sh (Already Correct)

```bash
# Line 39-40 - Already supports PROJECT_PATH
PROJECT_PATH=${PROJECT_PATH:-/project}
CLAUDE_DIR="${PROJECT_PATH}/.claude"
```

**Issue:** Assumes `.claude` is at PROJECT_PATH root. With nested project, it's at `${PROJECT_PATH}/${PROJECT_SUBDIR}/.claude`.

**Fix:** Add 1 line:
```bash
CLAUDE_DIR="${PROJECT_PATH}/${PROJECT_SUBDIR:-.}/.claude"
```

### setup-worktrees.sh (Already Correct)

```bash
# Line 42-46 - Correctly checks for .git at PROJECT_ROOT
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo "Error: Not a git repository: $PROJECT_ROOT"
```

**Verdict:** No changes needed - it already requires git root.

### docker-compose.yml Volumes (Correct Pattern)

```yaml
volumes:
  - ${PROJECT_PATH:-.}:/project
```

**Verdict:** No changes needed - just need correct PROJECT_PATH.

### work-dispatcher.sh (Minor Issue)

```bash
# Line 19 - Hardcoded path
STORIES_DIR="${PROJECT_ROOT}/stories/wave${WAVE_NUMBER}"
```

**Fix:** Add PROJECT_SUBDIR:
```bash
STORIES_DIR="${PROJECT_ROOT}/${PROJECT_SUBDIR:-.}/stories/wave${WAVE_NUMBER}"
```

---

## Minimal Fix Plan (15 minutes)

### Step 1: Update .env (2 minutes)

```bash
# File: /Volumes/SSD-01/Projects/WAVE/.env

# OLD:
PROJECT_PATH=/Volumes/SSD-01/Projects/Footprint/footprint

# NEW:
PROJECT_PATH=/Volumes/SSD-01/Projects/Footprint
PROJECT_SUBDIR=footprint
WAVE_NUMBER=3
```

### Step 2: Update entrypoint-agent.sh (3 minutes)

```bash
# Add after line 40:
PROJECT_SUBDIR=${PROJECT_SUBDIR:-}
APP_ROOT="${PROJECT_PATH}/${PROJECT_SUBDIR:-.}"
CLAUDE_DIR="${APP_ROOT}/.claude"
```

And update line 82-83 in load_p_variable():
```bash
local p_file="${APP_ROOT}/.claude/P.md"
```

### Step 3: Update work-dispatcher.sh (3 minutes)

```bash
# Add after line 18:
PROJECT_SUBDIR="${PROJECT_SUBDIR:-}"
APP_ROOT="${PROJECT_ROOT}/${PROJECT_SUBDIR:-.}"

# Update line 19:
STORIES_DIR="${APP_ROOT}/stories/wave${WAVE_NUMBER}"

# Update line 18:
SIGNAL_DIR="${APP_ROOT}/.claude"
```

### Step 4: Verify (5 minutes)

```bash
# Test Docker can see worktrees
docker run --rm \
  -v "/Volumes/SSD-01/Projects/Footprint:/project" \
  alpine ls -la /project/worktrees/

# Test Docker can see app
docker run --rm \
  -v "/Volumes/SSD-01/Projects/Footprint:/project" \
  -e PROJECT_SUBDIR=footprint \
  alpine ls -la /project/footprint/.claude/
```

### Step 5: Restart Agents (2 minutes)

```bash
cd /Volumes/SSD-01/Projects/WAVE
docker compose down
docker compose up -d fe-dev-1 fe-dev-2 qa
```

---

## What NOT To Do

### 1. Don't Create paths.py

The existing bash scripts are simple and work. Adding a Python module:
- Increases complexity
- Requires Python in containers (already there, but still)
- Creates another dependency to maintain
- Solves a problem that doesn't exist

### 2. Don't Create wave-state.json

P.json regeneration is not the root cause. The dispatcher reads P.json because:
1. P.json has `current_wave: 1` (stale)
2. Stories list is wrong

**Actual fix:** Update P.json once with correct values, or fix whatever regenerates it.

### 3. Don't Create validate-infrastructure.sh

Existing scripts:
- `wave-preflight.sh` - Already validates pre-flight
- `wave-launch.sh` - Already has 6-step validation
- `pre-flight-validator.sh` - Already checks paths

Adding another validation script creates confusion about which to use.

### 4. Don't Do 7-Phase Implementation

This is a **20-line fix** being turned into a **500-line project**.

---

## P.json Regeneration Issue

### Investigation

```bash
# What regenerates P.json?
grep -r "P.json" /Volumes/SSD-01/Projects/WAVE/core/scripts/
```

Most likely candidates:
1. `load-project-variable.sh` in RLM
2. Some pre-commit hook
3. Claude Code itself (when it runs `p` command)

### Recommendation

Don't create a separate `wave-state.json`. Instead:
1. Find what regenerates P.json
2. Either fix it to preserve wave_state
3. Or add `wave_state_source: "external"` flag it checks

---

## Summary: My CTO Recommendation

| Action | Time | Priority |
|--------|------|----------|
| Update .env (PROJECT_PATH, PROJECT_SUBDIR) | 2 min | P0 |
| Update entrypoint-agent.sh (3 lines) | 3 min | P0 |
| Update work-dispatcher.sh (3 lines) | 3 min | P0 |
| Verify with docker run test | 5 min | P0 |
| Restart agents | 2 min | P0 |
| **TOTAL** | **15 min** | |

### What to Skip from Claude.ai Plan

| Phase | Skip? | Reason |
|-------|-------|--------|
| Phase 1 | PARTIAL | Only .env change needed |
| Phase 2 | SKIP | Docker compose is fine |
| Phase 3 | SKIP | P.json issue is symptom, not cause |
| Phase 4 | SKIP | paths.py is over-engineering |
| Phase 5 | SKIP | Existing pre-flight is sufficient |
| Phase 6 | PARTIAL | Just run docker test |
| Phase 7 | SKIP | Update CLAUDE.md later if needed |

---

## Risk Assessment

### Minimal Fix Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Script breaks | Low | Test with docker run first |
| Path issues | Low | PROJECT_SUBDIR defaults to empty |
| Rollback needed | Low | Just revert .env |

### Over-Engineering Risks

| Risk | Likelihood | Impact |
|------|------------|--------|
| Introduces new bugs | Medium | More code = more bugs |
| Delays Wave 3 | High | 45-60 min vs 15 min |
| Creates maintenance debt | High | More files to maintain |
| Team confusion | Medium | Which validation script to use? |

---

## Final Verdict

**Claude.ai's analysis of the problem was correct.**
**Claude.ai's proposed solution is over-engineered.**

Apply the **minimal fix** (15 minutes), test, and move on.

If additional issues arise, address them incrementally rather than building a comprehensive framework for a problem we haven't fully diagnosed yet.

---

*"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."*
— Antoine de Saint-Exupéry

---

## Appendix: Actual Code Changes

### File 1: /Volumes/SSD-01/Projects/WAVE/.env

```diff
- PROJECT_PATH=/Volumes/SSD-01/Projects/Footprint/footprint
+ PROJECT_PATH=/Volumes/SSD-01/Projects/Footprint
+ PROJECT_SUBDIR=footprint
- WAVE_NUMBER=1
+ WAVE_NUMBER=3
```

### File 2: /Volumes/SSD-01/Projects/WAVE/entrypoint-agent.sh

```diff
  PROJECT_PATH=${PROJECT_PATH:-/project}
- CLAUDE_DIR="${PROJECT_PATH}/.claude"
+ PROJECT_SUBDIR=${PROJECT_SUBDIR:-}
+ APP_ROOT="${PROJECT_PATH}${PROJECT_SUBDIR:+/$PROJECT_SUBDIR}"
+ CLAUDE_DIR="${APP_ROOT}/.claude"
```

### File 3: /Volumes/SSD-01/Projects/WAVE/core/scripts/work-dispatcher.sh

```diff
  PROJECT_ROOT="${PROJECT_ROOT:-/project}"
- SIGNAL_DIR="${PROJECT_ROOT}/.claude"
- STORIES_DIR="${PROJECT_ROOT}/stories/wave${WAVE_NUMBER}"
+ PROJECT_SUBDIR="${PROJECT_SUBDIR:-}"
+ APP_ROOT="${PROJECT_ROOT}${PROJECT_SUBDIR:+/$PROJECT_SUBDIR}"
+ SIGNAL_DIR="${APP_ROOT}/.claude"
+ STORIES_DIR="${APP_ROOT}/stories/wave${WAVE_NUMBER}"
```

**Total: ~10 lines changed across 3 files.**
