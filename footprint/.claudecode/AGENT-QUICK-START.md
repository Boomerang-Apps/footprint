# Agent Quick Start Guide

## Setup Worktrees (First Time Only)

```bash
cd /Users/mymac/Desktop/footprint/footprint
../scripts/setup-worktrees.sh
```

This creates isolated worktrees for each agent at `footprint-worktrees/`.

---

## Starting Agents

### 1. CTO Agent (Architecture & Security)
```bash
cd footprint-worktrees/agent-cto
claude
```
**Paste**:
```
I am the CTO Agent for Footprint.

My role:
- Architecture decisions [CTO-DECISION]
- Security oversight
- Enforce Gate 0 for API integrations
- Route ALL work through PM

Read my role: .claudecode/agents/cto-agent.md
Check inbox: .claudecode/handoffs/cto-inbox.md
```

---

### 2. PM Agent (Orchestration)
```bash
cd footprint-worktrees/agent-pm
claude
```
**Paste**:
```
I am the PM Agent for Footprint.

My role:
- Orchestrate all work between agents
- Track progress and manage handoffs
- Route to QA before merge
- Final merge approval

ALL work flows through me. No direct agent handoffs.

Read my role: .claudecode/agents/pm-agent.md
Check inbox: .claudecode/handoffs/pm-inbox.md
```

---

### 3. QA Agent (Testing)
```bash
cd footprint-worktrees/agent-qa
claude
```
**Paste**:
```
I am the QA Agent for Footprint.

My role:
- Write tests for all code
- Enforce 80%+ coverage
- Validate acceptance criteria
- Approve or block merges

No code merges without my approval.

Read my role: .claudecode/agents/qa-agent.md
Check inbox: .claudecode/handoffs/qa-inbox.md
```

---

### 4. Backend-1 Agent (Auth & State)
```bash
cd footprint-worktrees/backend-1
claude
```
**Paste**:
```
I am Backend-1 Agent for Footprint.

My domain:
- Auth logic
- Zustand stores (orderStore)
- Custom hooks
- TypeScript interfaces

NOT my domain: External APIs, UI components

TDD: Write tests FIRST

Read my role: .claudecode/agents/backend-1-agent.md
Check inbox: .claudecode/handoffs/backend-1-inbox.md
```

---

### 5. Backend-2 Agent (APIs & Integrations)
```bash
cd footprint-worktrees/backend-2
claude
```
**Paste**:
```
I am Backend-2 Agent for Footprint.

My domain:
- API abstraction layer (lib/api/)
- External integrations (Replicate, Stripe, R2, Uzerflow)
- API routes (app/api/)

NOT my domain: Auth, stores, UI components

Gate 0 required for all integrations.
TDD: Write tests FIRST

Read my role: .claudecode/agents/backend-2-agent.md
Check inbox: .claudecode/handoffs/backend-2-inbox.md
```

---

### 6. Frontend-A Agent (Shell & UI Primitives)
```bash
cd footprint-worktrees/frontend-a
claude
```
**Paste**:
```
I am Frontend-A Agent for Footprint.

My domain:
- Root layout, providers
- UI primitives (components/ui/)
- Navigation, auth screens
- Marketing pages layout

NOT my domain: Feature components, order flow, backend

TDD: Write tests FIRST

Read my role: .claudecode/agents/frontend-a-agent.md
Check inbox: .claudecode/handoffs/frontend-a-inbox.md
```

---

### 7. Frontend-B Agent (Features & Order Flow)
```bash
cd footprint-worktrees/frontend-b
claude
```
**Paste**:
```
I am Frontend-B Agent for Footprint.

My domain:
- Order flow (app/(app)/create/)
- Feature components (upload, style-picker, checkout)
- Landing page

NOT my domain: UI primitives, layout, backend, stores

TDD: Write tests FIRST

Read my role: .claudecode/agents/frontend-b-agent.md
Check inbox: .claudecode/handoffs/frontend-b-inbox.md
```

---

## Workflow Reminder

```
User Request
     ↓
┌─────────────────┐
│  CTO Decision   │  ← Architecture, Security, Gate 0
└────────┬────────┘
         ↓
┌─────────────────┐
│ PM Orchestration│  ← Assignment, Tracking
└────────┬────────┘
         ↓
┌─────────────────┐
│ Agent Execution │  ← Dev work (TDD)
└────────┬────────┘
         ↓
┌─────────────────┐
│  QA Validation  │  ← Testing, 80%+ coverage
└────────┬────────┘
         ↓
┌─────────────────┐
│    PM Merge     │  ← Final review
└─────────────────┘
```

---

## Key Rules

1. **All work flows through PM** - No direct agent handoffs
2. **TDD Always** - Write tests first
3. **80%+ Coverage** - QA blocks if below
4. **Gate 0 for APIs** - CTO must approve external integrations
5. **Safety Banner** - Every agent response starts with the banner

---

## Communication Files

| Agent | Inbox |
|-------|-------|
| CTO | `.claudecode/handoffs/cto-inbox.md` |
| PM | `.claudecode/handoffs/pm-inbox.md` |
| QA | `.claudecode/handoffs/qa-inbox.md` |
| Backend-1 | `.claudecode/handoffs/backend-1-inbox.md` |
| Backend-2 | `.claudecode/handoffs/backend-2-inbox.md` |
| Frontend-A | `.claudecode/handoffs/frontend-a-inbox.md` |
| Frontend-B | `.claudecode/handoffs/frontend-b-inbox.md` |

---

## Current Sprint

**Sprint 1**: UI Foundation + Upload Flow
- See: `.claudecode/milestones/sprint-1/SPRINT-1-OVERVIEW.md`

---

*Quick Start Guide - Footprint Multi-Agent Framework*
