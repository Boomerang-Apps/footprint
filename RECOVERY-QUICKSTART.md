# Multi-Agent Recovery Quickstart

**Generated**: 2025-12-22
**Purpose**: Recover all agent terminals after Cursor crash
**CTO Approved**: Yes

---

## Quick Recovery Commands

Open 7 terminal tabs in Cursor and run these commands:

### Terminal 1: CTO Agent
```bash
cd /Users/mymac/Desktop/footprint-worktrees/agent-cto
claude
```
**Resume Prompt**:
```
You are the CTO Agent for Footprint. Resume work from your inbox at .claudecode/handoffs/cto-inbox.md. Your role: Architecture decisions, Gate 0 research approvals, security reviews.
```

### Terminal 2: PM Agent
```bash
cd /Users/mymac/Desktop/footprint-worktrees/agent-pm
claude
```
**Resume Prompt**:

### Terminal 3: QA Agent
```bash
cd /Users/mymac/Desktop/footprint-worktrees/agent-qa
claude
```
**Resume Prompt**:
```
You are the QA Agent for Footprint. Resume work from your inbox at .claudecode/handoffs/qa-inbox.md. Your role: Test validation, coverage enforcement (80%+), merge approval/blocking.
```

### Terminal 4: Backend-1 Agent
```bash
cd /Users/mymac/Desktop/footprint-worktrees/backend-1
claude
```
**Resume Prompt**:
```
You are Backend-1 Agent for Footprint. Resume work from your inbox at .claudecode/handoffs/backend-1-inbox.md. Your domain: Order store, user auth, state management, data persistence.
```

### Terminal 5: Backend-2 Agent
```bash
cd /Users/mymac/Desktop/footprint-worktrees/backend-2
claude
```
**Resume Prompt**:
```
You are Backend-2 Agent for Footprint. Resume work from your inbox at .claudecode/handoffs/backend-2-inbox.md. Your domain: Replicate AI, Stripe/PayPlus, Cloudflare R2, external APIs. Current task: UP-03 Image Optimization - GATE 1 REQUIRED FIRST.
```

### Terminal 6: Frontend-A Agent
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-a
claude
```
**Resume Prompt**:
```
You are Frontend-A Agent for Footprint. Resume work from your inbox at .claudecode/handoffs/frontend-a-inbox.md. Your domain: App shell, auth UI, UI primitives (Button, Card, Input), theme, navigation.
```

### Terminal 7: Frontend-B Agent
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
claude
```
**Resume Prompt**:
```
You are Frontend-B Agent for Footprint. Resume work from your inbox at .claudecode/handoffs/frontend-b-inbox.md. Your domain: Order creation flow, upload, style picker, checkout. Current task: UP-01, UP-02, UP-04 - GATE 1 COMPLIANCE REQUIRED.
```

---

## Current State Summary (2025-12-22)

### Worktree Status

| Agent | Branch | Status | Pending Work |
|-------|--------|--------|--------------|
| CTO | `agent/agent-cto` | Clean | PayPlus approved |
| PM | `agent/agent-pm` | Clean | Sprint 1 active |
| QA | `agent/agent-qa` | Clean | Awaiting submissions |
| Backend-1 | `agent/backend-1` | Clean | No assignments |
| Backend-2 | `feature/UP-03-image-optimization` | Modified | UP-03 (Gate 1 pending) |
| Frontend-A | `agent/frontend-a` | Clean | No assignments |
| Frontend-B | `feature/UP-01-camera-upload` | Modified | UP-01/02/04 (Gate 1 pending) |

### Active Sprint: Sprint 1

| Story | Agent | Status | Gate |
|-------|-------|--------|------|
| UP-01 | Frontend-B | In Progress | Gate 1 REQUIRED |
| UP-02 | Frontend-B | In Progress | Gate 1 REQUIRED |
| UP-03 | Backend-2 | In Progress | Gate 1 REQUIRED |
| UP-04 | Frontend-B | In Progress | Gate 1 REQUIRED |

### Inbox Summary

| Agent | Pending Messages |
|-------|------------------|
| CTO | PayPlus request (already processed) |
| PM | PayPlus approval acknowledged |
| QA | None |
| Backend-1 | None |
| Backend-2 | Gate 1 compliance + UP-03 assignment |
| Frontend-A | None |
| Frontend-B | Gate 1 compliance + UP-01/02/04 assignment |

---

## Critical Actions Needed

### 1. Backend-2: Complete Gate 1 for UP-03
```bash
cd /Users/mymac/Desktop/footprint-worktrees/backend-2
mkdir -p .claudecode/milestones/sprint-1/UP-03/
# Create START.md
# Create ROLLBACK-PLAN.md
git tag UP-03-start
```

### 2. Frontend-B: Complete Gate 1 for UP-01
```bash
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
mkdir -p .claudecode/milestones/sprint-1/UP-01/
# Create START.md
# Create ROLLBACK-PLAN.md
git tag UP-01-start
```

---

## Validation Commands

### Check All Worktrees Status
```bash
for wt in /Users/mymac/Desktop/footprint-worktrees/*; do
  echo "=== $(basename $wt) ==="
  git -C "$wt" status -s
  git -C "$wt" log --oneline -1
done
```

### Sync All Worktrees with Main
```bash
for wt in /Users/mymac/Desktop/footprint-worktrees/*; do
  echo "Syncing $(basename $wt)..."
  git -C "$wt" fetch origin
  git -C "$wt" merge origin/main --no-edit 2>/dev/null || echo "Merge conflict or up-to-date"
done
```

### Check All Inboxes
```bash
for inbox in cto pm qa backend-1 backend-2 frontend-a frontend-b; do
  echo "=== $inbox-inbox.md ==="
  grep -A 3 "## Pending Messages" /Users/mymac/Desktop/footprint/.claudecode/handoffs/$inbox-inbox.md
done
```

---

## One-Liner: Open All Terminals

For iTerm2 or Terminal.app with tmux:
```bash
# Create tmux session with all agents
tmux new-session -d -s footprint
tmux send-keys "cd /Users/mymac/Desktop/footprint-worktrees/agent-cto && claude" C-m
tmux split-window -h
tmux send-keys "cd /Users/mymac/Desktop/footprint-worktrees/agent-pm && claude" C-m
tmux split-window -v
tmux send-keys "cd /Users/mymac/Desktop/footprint-worktrees/agent-qa && claude" C-m
tmux select-pane -t 0
tmux split-window -v
tmux send-keys "cd /Users/mymac/Desktop/footprint-worktrees/backend-1 && claude" C-m
tmux new-window
tmux send-keys "cd /Users/mymac/Desktop/footprint-worktrees/backend-2 && claude" C-m
tmux split-window -h
tmux send-keys "cd /Users/mymac/Desktop/footprint-worktrees/frontend-a && claude" C-m
tmux split-window -v
tmux send-keys "cd /Users/mymac/Desktop/footprint-worktrees/frontend-b && claude" C-m
tmux attach -t footprint
```

---

## Architecture Decisions Active

| # | Decision | Status |
|---|----------|--------|
| 1 | API Abstraction Layer | Implemented |
| 2 | Stripe Checkout (+ PayPlus for IL) | Approved |
| 3 | Cloudflare R2 | Approved |
| 4 | Zustand for Client State | Implemented |
| 5 | TDD 80% Coverage | Active |
| 6 | Multi-Agent Framework | Active |
| 7 | Bilingual EN/HE | Pending |
| 8 | Under 2-Min Purchase | Target |

---

## Safety Protocol Reminder

All agents must follow the 6-gate safety framework:

1. **Gate 0**: Research (CTO approval for new APIs)
2. **Gate 1**: Planning (START.md, ROLLBACK-PLAN.md, git tag)
3. **Gate 2**: Implementation (TDD, tests first)
4. **Gate 3**: QA Validation (80%+ coverage)
5. **Gate 4**: Review (TypeScript, lint clean)
6. **Gate 5**: Deployment (merge to main)

**Reference**: `.claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md`

---

*Generated by CTO Agent - 2025-12-22*
