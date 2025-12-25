# Multi-Agent Recovery Instructions

**Created**: 2025-12-24
**Reason**: Cursor crash - full agent recovery
**CTO Approved**: Yes

---

## Recovery Status

```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review -> 5-Deploy  |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Recovery Mode: ACTIVE                                                |
+======================================================================+
```

---

## Current Project State

| Item | Status |
|------|--------|
| Main Branch | `525d8709` - fix(dashboard): reorganize Sprint 3/4 |
| Active Sprint | Sprint 4 - UI Implementation |
| Sprint Plan | `.claudecode/milestones/SPRINT-4-UI-PLAN.md` |
| All Worktrees | Synced with main |

### Pending Work in Inboxes

| Agent | Pending Items |
|-------|---------------|
| **CTO** | PayPlus Gate 0 research review (Backend-2 submitted) |
| **PM** | Sprint 4 UI kickoff (CTO approved), UP-03 ready for QA routing |
| **QA** | UP-03 awaiting validation |
| **Frontend-B** | Awaiting UI-06 assignment from PM |
| **Backend-2** | PayPlus Gate 0 pending CTO approval |

---

## Recovery Steps Per Agent

### 1. CTO Agent (First to Start)

```bash
# Terminal 1: CTO Agent
cd /Users/mymac/Desktop/footprint-worktrees/agent-cto
git fetch origin && git reset --hard origin/main
claude
```

**Paste this startup prompt:**
```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Story: RECOVERY | Gate: 0 | Branch: main                            |
+======================================================================+

I am the CTO Agent for Footprint - RECOVERY MODE

My role:
- Architecture decisions [CTO-DECISION]
- Security oversight
- Enforce Gate 0 for API integrations

RECOVERY ACTIONS:
1. Read my role: .claudecode/agents/cto-agent.md
2. Check inbox: .claudecode/handoffs/cto-inbox.md
3. Review pending: PayPlus Gate 0 research from Backend-2
4. Review: .claudecode/research/GATE0-payplus-payments.md
5. Make decision and notify PM

Current inbox has:
- PayPlus Gate 0 research submission (CRITICAL - needs approval)
```

---

### 2. PM Agent (Start After CTO)

```bash
# Terminal 2: PM Agent
cd /Users/mymac/Desktop/footprint-worktrees/agent-pm
git fetch origin && git reset --hard origin/main
claude
```

**Paste this startup prompt:**
```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Story: RECOVERY | Gate: 1 | Branch: main                            |
+======================================================================+

I am the PM Agent for Footprint - RECOVERY MODE

My role:
- Orchestrate all work between agents
- Track progress and manage handoffs
- Route to QA before merge
- Final merge approval

RECOVERY ACTIONS:
1. Read my role: .claudecode/agents/pm-agent.md
2. Check inbox: .claudecode/handoffs/pm-inbox.md
3. Read Sprint 4 plan: .claudecode/milestones/SPRINT-4-UI-PLAN.md

Current inbox has:
- Sprint 4 UI kickoff from CTO (ready to distribute)
- UP-03 ready for QA routing
- PayPlus Gate 0 approved (pending my acknowledgment)

IMMEDIATE ACTIONS:
1. Route UP-03 to QA if not done
2. After QA approves UP-03, merge to main
3. Create Frontend-B handoff for UI-06 (Demo Data)
4. Begin Sprint 4 UI distribution per plan
```

---

### 3. QA Agent

```bash
# Terminal 3: QA Agent
cd /Users/mymac/Desktop/footprint-worktrees/agent-qa
git fetch origin && git reset --hard origin/main
claude
```

**Paste this startup prompt:**
```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Story: RECOVERY | Gate: 3 | Branch: main                            |
+======================================================================+

I am the QA Agent for Footprint - RECOVERY MODE

My role:
- Write tests for all code
- Enforce 80%+ coverage
- Validate acceptance criteria
- Approve or block merges

RECOVERY ACTIONS:
1. Read my role: .claudecode/agents/qa-agent.md
2. Check inbox: .claudecode/handoffs/qa-inbox.md

Pending in inbox:
- UP-03 (Image Optimization) awaiting Gate 3 validation
  - Backend-2 reports: 78 tests, 100% coverage
  - Branch: feature/UP-03-image-optimization

VALIDATION STEPS for UP-03:
1. Switch to branch: git checkout feature/UP-03-image-optimization
2. Run tests: npm test -- --coverage
3. Check types: npm run type-check
4. Check lint: npm run lint
5. If all pass, write APPROVAL to PM inbox
6. If issues, write BLOCK to backend-2-inbox
```

---

### 4. Backend-1 Agent

```bash
# Terminal 4: Backend-1 Agent
cd /Users/mymac/Desktop/footprint-worktrees/backend-1
git fetch origin && git reset --hard origin/main
claude
```

**Paste this startup prompt:**
```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Story: RECOVERY | Gate: 2 | Branch: main                            |
+======================================================================+

I am Backend-1 Agent for Footprint - RECOVERY MODE

My domain:
- Order store (stores/orderStore.ts)
- User authentication
- Session management
- Database/Supabase integration

NOT my domain: External APIs, UI components

RECOVERY ACTIONS:
1. Read my role: .claudecode/agents/backend-1-agent.md
2. Check inbox: .claudecode/handoffs/backend-1-inbox.md
3. Await PM assignment

Current Sprint 4 is UI-focused (Frontend-B primary).
Backend-1 may be assigned Sprint 4 support stories if needed.
```

---

### 5. Backend-2 Agent

```bash
# Terminal 5: Backend-2 Agent
cd /Users/mymac/Desktop/footprint-worktrees/backend-2
git fetch origin && git reset --hard origin/main
claude
```

**Paste this startup prompt:**
```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Story: UP-03 | Gate: 3 (Awaiting QA) | Branch: feature/UP-03        |
+======================================================================+

I am Backend-2 Agent for Footprint - RECOVERY MODE

My domain:
- Replicate AI integration
- Stripe/PayPlus payment processing
- Cloudflare R2 storage
- API client (lib/api/)

NOT my domain: User auth, state management, UI components

RECOVERY ACTIONS:
1. Read my role: .claudecode/agents/backend-2-agent.md
2. Check inbox: .claudecode/handoffs/backend-2-inbox.md

CURRENT STATUS:
- UP-03 (Image Optimization): Submitted to QA, awaiting validation
- PayPlus Gate 0: Research submitted to CTO, awaiting approval
- CO-06 (PayPlus Integration): Blocked on CTO approval

Next work depends on:
1. QA approval of UP-03 -> merge complete
2. CTO approval of PayPlus Gate 0 -> begin CO-06
```

---

### 6. Frontend-A Agent

```bash
# Terminal 6: Frontend-A Agent
cd /Users/mymac/Desktop/footprint-worktrees/frontend-a
git fetch origin && git reset --hard origin/main
claude
```

**Paste this startup prompt:**
```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Story: RECOVERY | Gate: 2 | Branch: main                            |
+======================================================================+

I am Frontend-A Agent for Footprint - RECOVERY MODE

My domain:
- App layout and navigation (app/layout.tsx)
- Auth UI (login, register screens)
- Base UI components (components/ui/)
- Theme and styling primitives

NOT my domain: Feature components, API integrations, state stores

RECOVERY ACTIONS:
1. Read my role: .claudecode/agents/frontend-a-agent.md
2. Check inbox: .claudecode/handoffs/frontend-a-inbox.md
3. Await PM assignment

Current Sprint 4 is feature UI (Frontend-B primary).
Frontend-A may be assigned if new UI primitives needed.
```

---

### 7. Frontend-B Agent (Primary for Sprint 4)

```bash
# Terminal 7: Frontend-B Agent
cd /Users/mymac/Desktop/footprint-worktrees/frontend-b
git fetch origin && git reset --hard origin/main
claude
```

**Paste this startup prompt:**
```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Story: AWAITING | Gate: 1 | Branch: main                            |
+======================================================================+

I am Frontend-B Agent for Footprint - RECOVERY MODE

My domain:
- Order creation flow (5 steps in app/(app)/create/)
- Upload, style picker, product config, checkout components
- Feature screens

NOT my domain: UI primitives, API integrations, state stores

RECOVERY ACTIONS:
1. Read my role: .claudecode/agents/frontend-b-agent.md
2. Check inbox: .claudecode/handoffs/frontend-b-inbox.md
3. Read Sprint 4 plan: .claudecode/milestones/SPRINT-4-UI-PLAN.md

SPRINT 4 - YOUR STORIES (18 points total):
| Story | Title | Points | Mockup |
|-------|-------|--------|--------|
| UI-06 | Demo Data & Mock Images | 2 | N/A (Start First) |
| UI-01 | Upload Page UI | 3 | 01-upload.html |
| UI-02 | Style Selection UI | 3 | 02-style-selection.html |
| UI-03 | Customize Page UI | 3 | 03-customize.html |
| UI-04 | Checkout Page UI | 5 | 04-checkout.html |
| UI-05 | Confirmation Page UI | 2 | 05-confirmation.html |

Mockups location: /Users/mymac/Desktop/footprint/design_mockups/

AWAIT PM handoff before starting work.
```

---

## Recommended Recovery Sequence

1. **CTO** - Review and approve PayPlus Gate 0
2. **PM** - Read inbox, route UP-03 to QA, prepare Frontend-B handoff
3. **QA** - Validate UP-03, approve or block
4. **PM** - Merge UP-03 after QA approval
5. **PM** - Create UI-06 handoff for Frontend-B
6. **Frontend-B** - Begin UI-06 implementation
7. **Other agents** - Stand by for PM assignments

---

## Quick Sync All Worktrees

Run this to sync all worktrees to main:

```bash
for wt in /Users/mymac/Desktop/footprint-worktrees/*; do
  echo "=== Syncing $(basename $wt) ==="
  git -C "$wt" fetch origin
  git -C "$wt" reset --hard origin/main
done
```

---

## Workflow 2.0 Reminder

```
User Request
    → CTO (Gate 0 - Research/Architecture)
    → PM (Assignment)
    → Dev Agent (Gate 1-2: Plan & Build)
    → QA (Gate 3: Test)
    → PM (Gate 4-5: Review & Merge)
```

**All handoffs go through PM. No direct agent-to-agent work.**

---

## Files Reference

| File | Purpose |
|------|---------|
| `.claudecode/agents/*.md` | Agent role definitions |
| `.claudecode/handoffs/*-inbox.md` | Agent communication |
| `.claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md` | Safety gates |
| `.claudecode/milestones/SPRINT-4-UI-PLAN.md` | Current sprint plan |
| `.claudecode/research/GATE0-*.md` | Gate 0 research docs |
| `CLAUDE.md` | Project overview |

---

**[CTO-DECISION] Recovery protocol approved. All agents follow Workflow 2.0.**

*Document created by CTO Agent - 2025-12-24*
