# WAVE V2 Retrospective: Failed Wave 3 Launch
**Date:** 2026-01-29
**Wave:** 3
**Stories:** UI-04A (completed manually), UI-04B, UI-04C (failed to execute)
**Outcome:** FAILED - Agents unable to execute due to infrastructure issues

---

## Executive Summary

Wave 3 launch followed the 10-step WAVE V2 workflow but failed during agent execution due to multiple infrastructure misconfigurations. The root causes were:
1. Git repository structure mismatch with Docker mount paths
2. P.json auto-regeneration overwriting configuration
3. LangSmith tracing not compatible with Claude Code CLI

---

## Timeline of Events

| Time | Event | Status |
|------|-------|--------|
| 19:45 | wave-launch.sh executed | Partial success (script errors) |
| 19:47 | wave-redis started | Success |
| 19:47 | Stories copied to project | Success |
| 19:48 | P.json updated for Wave 3 | Reverted by auto-process |
| 19:50 | Manual dispatch of UI-04B, UI-04C | Success |
| 19:51 | Slack notifications sent | Success |
| 19:53 | Docker agents started | Started but failed |
| 19:53 | fe-dev-1 found assignment | Success |
| 19:53 | fe-dev-1 "Executing Claude..." | Hung/Failed |
| 19:56 | Discovered worktree path issue | Root cause found |
| 19:56 | Created symlinks | Failed (Docker can't follow) |
| 19:57 | All processes stopped | Manual intervention |

---

## What Went Wrong

### 1. Git Repository Structure Mismatch

**Problem:**
```
Git root:     /Volumes/SSD-01/Projects/Footprint
Next.js app:  /Volumes/SSD-01/Projects/Footprint/footprint
Worktrees:    /Volumes/SSD-01/Projects/Footprint/worktrees/
Docker mount: /Volumes/SSD-01/Projects/Footprint/footprint -> /project
```

Docker containers expected worktrees at `/project/worktrees/` which maps to `/Footprint/footprint/worktrees/` - but actual worktrees are at `/Footprint/worktrees/`.

**Impact:** Agents could not access git worktrees, Claude CLI failed silently.

**Evidence:**
```
docker exec wave-fe-dev-1 ls /project/worktrees/fe-dev-1/
# Error: no such file or directory
```

### 2. P.json Auto-Regeneration

**Problem:** Some process continuously regenerates P.json, overwriting manual edits to `wave_state`.

**Impact:**
- Wave number kept reverting to 1
- Stories list kept reverting to WAVE1 stories
- Work dispatcher dispatched wrong stories

**Evidence:**
```json
// Edited to:
"current_wave": 3,
"stories": ["UI-04B...", "UI-04C..."]

// Auto-reverted to:
"current_wave": 1,
"stories": ["WAVE1-BE-001.json", "WAVE1-FE-001.json", ...]
```

### 3. LangSmith Tracing Not Working

**Problem:** Claude Code CLI (`@anthropic-ai/claude-code`) does not natively integrate with LangSmith.

**Impact:** No visibility into agent API calls, token usage, or execution traces.

**Evidence:** LangSmith dashboard showed traces from 9 hours ago, no new traces despite agents running.

### 4. Work Dispatcher Reading Wrong Source

**Problem:** `work-dispatcher.sh` reads stories from P.json first, falling back to directory scan only if P.json is empty.

**Impact:** Even though correct stories existed in `stories/wave3/`, dispatcher used P.json's stale WAVE1 list.

### 5. Incomplete Workflow Execution

**Problem:** UI-04A was completed manually outside the WAVE workflow, bypassing:
- Proper branch/worktree setup
- QA validation gates
- Merge watcher orchestration

**Impact:** Inconsistent state, manual PR creation required.

---

## Root Cause Analysis

```
                    ┌─────────────────────────────┐
                    │   Git Repo Structure        │
                    │   (root != app directory)   │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   PROJECT_PATH points to    │
                    │   /footprint (app) not      │
                    │   /Footprint (git root)     │
                    └──────────────┬──────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Worktrees not   │    │ .claude/ in     │    │ Stories path    │
│ accessible in   │    │ wrong location  │    │ mismatch        │
│ Docker          │    │ for agents      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   AGENTS FAIL TO EXECUTE    │
                    └─────────────────────────────┘
```

---

## What Worked

1. **wave-launch.sh** - Validation steps ran correctly
2. **Slack notifications** - Successfully sent when webhook sourced
3. **Docker containers** - Started and showed healthy status
4. **Assignment signals** - Created correctly
5. **Agent initialization** - Loaded P.md, found assignments
6. **Manual story completion** - UI-04A completed with 31/31 tests passing

---

## Lessons Learned

### Technical

1. **Docker mount paths must match git root** - When git worktrees are involved, the entire repository must be mounted, not just a subdirectory.

2. **Symlinks don't work across Docker mount boundaries** - Host symlinks pointing outside the mounted volume are invisible to containers.

3. **Claude Code CLI ≠ Anthropic SDK** - Tracing, callbacks, and integrations designed for the SDK don't work with the CLI tool.

4. **P.json needs locking mechanism** - Auto-regeneration processes must respect manual overrides or use a separate configuration file.

### Process

5. **Pre-flight must validate worktree accessibility** - Add check that agents can actually access their worktrees.

6. **Dry-run mode needed** - Ability to test full workflow without executing Claude.

7. **Manual execution breaks workflow state** - Completing stories outside WAVE creates inconsistent state.

---

## Action Items

### P0 - Critical (Must fix before next wave)

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Change PROJECT_PATH to git root `/Volumes/SSD-01/Projects/Footprint` | - | TODO |
| 2 | Update agent scripts to handle `PROJECT_SUBDIR` for app paths | - | TODO |
| 3 | Add worktree accessibility check to pre-flight | - | TODO |
| 4 | Fix P.json regeneration (add wave_state lock or separate config) | - | TODO |

### P1 - Important (Should fix soon)

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 5 | Add LangSmith tracing wrapper for Claude Code CLI | - | TODO |
| 6 | Update work-dispatcher to prefer directory scan over P.json | - | TODO |
| 7 | Add dry-run mode to wave-launch.sh | - | TODO |
| 8 | Document git repository structure requirements | - | TODO |

### P2 - Nice to have

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 9 | Add agent health endpoint that verifies worktree access | - | TODO |
| 10 | Create unified path configuration (single source of truth) | - | TODO |
| 11 | Add automatic worktree setup to wave-launch.sh | - | TODO |

---

## Configuration Fixes Required

### 1. Update WAVE .env

```bash
# Change from:
PROJECT_PATH=/Volumes/SSD-01/Projects/Footprint/footprint

# Change to:
PROJECT_PATH=/Volumes/SSD-01/Projects/Footprint
PROJECT_SUBDIR=footprint
```

### 2. Update docker-compose.yml volumes

```yaml
volumes:
  - ${PROJECT_PATH}:/project
  # App-specific paths use PROJECT_SUBDIR
working_dir: /project/${PROJECT_SUBDIR:-}
```

### 3. Update agent scripts

```bash
# Signal directory
SIGNAL_DIR="${PROJECT_PATH}/${PROJECT_SUBDIR:-.}/.claude"

# Stories directory
STORIES_DIR="${PROJECT_PATH}/${PROJECT_SUBDIR:-.}/stories/wave${WAVE}"
```

### 4. Lock P.json wave_state

Option A: Separate config file `wave-config.json`
Option B: Add `wave_state_locked: true` flag
Option C: Move wave_state to Redis

---

## Metrics

| Metric | Value |
|--------|-------|
| Stories attempted | 3 |
| Stories completed | 1 (manual) |
| Stories failed | 2 |
| Time spent debugging | ~45 minutes |
| Docker restarts | 2 |
| Root causes identified | 5 |
| Action items created | 11 |

---

## Next Steps

1. Fix P0 items before attempting Wave 3 again
2. Create test script to validate infrastructure before launch
3. Consider restructuring git repository to have app at root
4. Schedule follow-up to review P1 items

---

## Appendix: Successful UI-04A Execution (Manual)

Despite the automation failure, UI-04A was completed manually:

- **Branch:** `feature/UI-04A-order-details-api`
- **PR:** #5 (merged to main)
- **Files created:** 4
  - `app/api/orders/route.ts`
  - `app/api/orders/route.test.ts`
  - `app/api/orders/[id]/route.ts`
  - `app/api/orders/[id]/route.test.ts`
- **Tests:** 31/31 passing
- **Coverage:** 96-100%

This proves the story definitions and acceptance criteria were correct - only the automation infrastructure failed.

---

*Generated by WAVE CTO Agent retrospective process*
