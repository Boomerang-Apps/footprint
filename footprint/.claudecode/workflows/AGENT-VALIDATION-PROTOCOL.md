# Agent Validation Protocol v1.0

**Status**: MANDATORY
**Enforcement**: Every agent, every response, every session
**Purpose**: Ensure 100% compliance with framework rules

---

## Overview

This protocol defines rigid validation checkpoints that EVERY agent MUST complete. Failure to pass any checkpoint = STOP WORK immediately.

---

# LAYER 1: SESSION STARTUP VALIDATION

## Mandatory Startup Sequence

**BEFORE ANY WORK, agent MUST execute this exact sequence:**

```bash
# STEP 1: Identity Confirmation
cat .claudecode/agents/[my-agent]-agent.md

# STEP 2: Read Safety Framework
cat .claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md

# STEP 3: Read Workflow Protocol
cat .claudecode/workflows/WORKFLOW-2.0-PM-ORCHESTRATION.md

# STEP 4: Read This Validation Protocol
cat .claudecode/workflows/AGENT-VALIDATION-PROTOCOL.md

# STEP 5: Check My Inbox
cat .claudecode/handoffs/[my-agent]-inbox.md

# STEP 6: Confirm Current Branch
git branch --show-current

# STEP 7: Confirm Worktree Isolation
git worktree list
pwd
```

## Startup Declaration

**After reading all documents, agent MUST output this declaration:**

```markdown
╔══════════════════════════════════════════════════════════════════╗
║  🔐 AGENT IDENTITY CONFIRMED                                     ║
╠══════════════════════════════════════════════════════════════════╣
║  Agent: [Agent Name]                                             ║
║  Model: [Model Name]                                             ║
║  Domain: [My Domain]                                             ║
║  Worktree: [Current Path]                                        ║
║  Branch: [Current Branch]                                        ║
╠══════════════════════════════════════════════════════════════════╣
║  📖 DOCUMENTS READ:                                              ║
║  ✅ Agent Role Definition                                        ║
║  ✅ Safety Framework                                             ║
║  ✅ Workflow 2.0 Protocol                                        ║
║  ✅ Validation Protocol                                          ║
║  ✅ My Inbox                                                     ║
╠══════════════════════════════════════════════════════════════════╣
║  🚫 BOUNDARIES ACKNOWLEDGED:                                     ║
║  I WILL: [List 3 things I do]                                    ║
║  I WILL NOT: [List 3 things I never do]                          ║
╠══════════════════════════════════════════════════════════════════╣
║  📋 CURRENT ASSIGNMENT:                                          ║
║  Story: [STORY-ID or "Awaiting Assignment"]                      ║
║  Gate: [Current Gate]                                            ║
║  Task: [Brief Description]                                       ║
╚══════════════════════════════════════════════════════════════════╝
```

**IF AGENT CANNOT COMPLETE THIS DECLARATION → STOP. DO NOT PROCEED.**

---

# LAYER 2: PRE-ACTION VALIDATION

## Before EVERY File Operation

**Before creating, editing, or deleting ANY file, agent MUST:**

### Step 1: Domain Check
```markdown
🔍 DOMAIN CHECK:
File: [path/to/file]
Action: [Create/Edit/Delete]
Is this in MY domain? [YES/NO]
Justification: [Why this file belongs to me]
```

### Step 2: Authority Check
```markdown
🔍 AUTHORITY CHECK:
Do I have assignment for this? [YES/NO]
Story ID: [STORY-ID]
Is this in my inbox assignment? [YES/NO]
```

### Step 3: TDD Check (for implementation)
```markdown
🔍 TDD CHECK:
Is there a test for this code? [YES/NO]
Test file: [path/to/test]
Test status: [Written/Passing/Failing]
```

**IF ANY CHECK FAILS → STOP. ASK PM FOR CLARIFICATION.**

---

## Domain Boundary Matrix

**Each agent MUST memorize their boundaries:**

### Backend-1 Boundaries
```
✅ ALLOWED FILES:
- stores/*.ts
- hooks/useAuth.ts, useBalance.ts
- lib/supabase.ts
- services/supabase.ts
- supabase/schema.sql
- supabase/functions/* (auth, balance related)

❌ FORBIDDEN FILES:
- services/twilio.ts (Backend-2)
- services/translation.ts (Backend-2)
- services/revenuecat.ts (Backend-2)
- components/* (Frontend)
- app/* (Frontend)
```

### Backend-2 Boundaries
```
✅ ALLOWED FILES:
- services/twilio.ts
- services/translation.ts
- services/revenuecat.ts
- stores/callStore.ts
- hooks/useCall.ts, useTranslation.ts
- supabase/functions/* (call, translation related)

❌ FORBIDDEN FILES:
- lib/supabase.ts (Backend-1)
- stores/authStore.ts (Backend-1)
- stores/balanceStore.ts (Backend-1)
- components/* (Frontend)
- app/* (Frontend)
```

### Frontend-A Boundaries
```
✅ ALLOWED FILES:
- app/(auth)/*
- app/(tabs)/_layout.tsx
- app/_layout.tsx
- components/ui/*
- constants/*

❌ FORBIDDEN FILES:
- services/* (Backend)
- stores/* (Backend)
- app/(tabs)/index.tsx (Frontend-B)
- app/(tabs)/contacts.tsx (Frontend-B)
- app/(tabs)/chats.tsx (Frontend-B)
- components/Keypad.tsx (Frontend-B)
- components/ContactList.tsx (Frontend-B)
```

### Frontend-B Boundaries
```
✅ ALLOWED FILES:
- app/(tabs)/index.tsx (keypad screen)
- app/(tabs)/contacts.tsx
- app/(tabs)/chats.tsx
- app/(tabs)/credits.tsx
- app/call/*
- app/chat/*
- components/Keypad.tsx
- components/ContactList.tsx
- components/BalanceCard.tsx
- components/TranslationBubble.tsx

❌ FORBIDDEN FILES:
- services/* (Backend)
- stores/* (Backend)
- app/(auth)/* (Frontend-A)
- app/(tabs)/_layout.tsx (Frontend-A)
- components/ui/* (Frontend-A)
```

---

# LAYER 3: CONTINUOUS VALIDATION

## Every Response Must Include

**EVERY agent response MUST start with the Safety Banner:**

```
╔══════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE                                      ║
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM                     ║
║  ✅ Safety Gates: 0→1→2→3→4→5                                    ║
║  ✅ TDD: Tests First | 80%+ Coverage                             ║
║  📋 Story: [ID] | Gate: [N] | Branch: [name]                     ║
╚══════════════════════════════════════════════════════════════════╝
```

**IF BANNER IS MISSING → RESPONSE IS INVALID.**

---

## Periodic Self-Check (Every 3 Actions)

**After every 3 file operations, agent MUST pause and verify:**

```markdown
╔══════════════════════════════════════════════════════════════════╗
║  🔄 PERIODIC SELF-CHECK                                          ║
╠══════════════════════════════════════════════════════════════════╣
║  Actions completed: [N]                                          ║
║  Am I still working on: [STORY-ID]?                              ║
║  Am I still in my domain? [YES/NO]                               ║
║  Have I written tests first? [YES/NO]                            ║
║  Files touched this session:                                     ║
║    - [file1] ✅ In domain                                        ║
║    - [file2] ✅ In domain                                        ║
║  Any concerns? [None / Describe]                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

# LAYER 4: GATE COMPLIANCE VALIDATION

## Before Moving to Next Gate

**Agent MUST verify gate completion:**

### Gate 1 Completion Check
```markdown
╔══════════════════════════════════════════════════════════════════╗
║  ✅ GATE 1 COMPLETION CHECK                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  [ ] Branch created: feature/[STORY-ID]-description              ║
║  [ ] START.md exists at correct path                             ║
║  [ ] ROLLBACK-PLAN.md exists at correct path                     ║
║  [ ] Git tag created: [STORY-ID]-start                           ║
║  [ ] Inbox assignment matches my work                            ║
╚══════════════════════════════════════════════════════════════════╝

Verification commands:
git branch --show-current
ls -la .claudecode/milestones/sprint-*/[STORY-ID]/
git tag -l "[STORY-ID]*"
```

### Gate 2 Progress Check
```markdown
╔══════════════════════════════════════════════════════════════════╗
║  🔄 GATE 2 PROGRESS CHECK                                        ║
╠══════════════════════════════════════════════════════════════════╣
║  TDD Status:                                                     ║
║  [ ] Test file created BEFORE implementation                     ║
║  [ ] Tests currently: [Passing/Failing/Not Run]                  ║
║  [ ] Implementation follows test requirements                    ║
║                                                                  ║
║  Commit History:                                                 ║
║  [ ] Commits are atomic (30-90 min chunks)                       ║
║  [ ] Commit messages follow convention                           ║
╚══════════════════════════════════════════════════════════════════╝

Verification:
npm test -- --coverage
git log --oneline -5
```

### Gate 2 Completion Check
```markdown
╔══════════════════════════════════════════════════════════════════╗
║  ✅ GATE 2 COMPLETION CHECK                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  [ ] All acceptance criteria implemented                         ║
║  [ ] All tests passing                                           ║
║  [ ] Coverage ≥80%                                               ║
║  [ ] TypeScript clean (npm run typecheck)                        ║
║  [ ] Linter clean (npm run lint)                                 ║
║  [ ] No files outside my domain touched                          ║
╚══════════════════════════════════════════════════════════════════╝

Verification:
npm test -- --coverage
npm run typecheck
npm run lint
```

---

# LAYER 5: HANDOFF VALIDATION

## Before Writing to Any Inbox

**Agent MUST verify handoff correctness:**

```markdown
╔══════════════════════════════════════════════════════════════════╗
║  📤 HANDOFF VALIDATION                                           ║
╠══════════════════════════════════════════════════════════════════╣
║  From: [My Agent Name]                                           ║
║  To: [Target Inbox]                                              ║
║  Correct destination?                                            ║
║    - Completed work → qa-inbox.md ✅                             ║
║    - Blocked/Need help → pm-inbox.md ✅                          ║
║    - Security issue → cto-inbox.md ✅                            ║
║                                                                  ║
║  [ ] I am NOT handing off directly to another dev agent          ║
║  [ ] I have included all required information                    ║
║  [ ] Test results are included                                   ║
║  [ ] Coverage numbers are included                               ║
╚══════════════════════════════════════════════════════════════════╝
```

**FORBIDDEN HANDOFFS:**
- ❌ Backend-1 → Backend-2 (MUST go through PM)
- ❌ Backend-1 → Frontend-A (MUST go through PM)
- ❌ Frontend-A → Frontend-B (MUST go through PM)
- ❌ Any Dev → Any Dev (ALWAYS through PM)

---

# LAYER 6: ANTI-DRIFT ANCHORING

## Context Anchoring Statement

**If conversation is long (>10 exchanges), agent MUST re-anchor:**

```markdown
╔══════════════════════════════════════════════════════════════════╗
║  ⚓ CONTEXT RE-ANCHOR                                            ║
╠══════════════════════════════════════════════════════════════════╣
║  I am: [Agent Name]                                              ║
║  My domain: [Domain]                                             ║
║  Current story: [STORY-ID]                                       ║
║  Current gate: [Gate N]                                          ║
║  What I'm doing: [Specific task]                                 ║
║  What I've completed: [List]                                     ║
║  What remains: [List]                                            ║
║                                                                  ║
║  I will NOT:                                                     ║
║  - Touch files outside my domain                                 ║
║  - Skip writing tests                                            ║
║  - Hand off to other dev agents                                  ║
║  - Forget my role mid-task                                       ║
╚══════════════════════════════════════════════════════════════════╝
```

---

# LAYER 7: VIOLATION DETECTION

## Red Flags - STOP IMMEDIATELY If:

| Violation | Action |
|-----------|--------|
| About to edit file outside domain | STOP → Ask PM |
| No test exists for code being written | STOP → Write test first |
| No START.md exists | STOP → Create it first |
| No ROLLBACK-PLAN.md exists | STOP → Create it first |
| No inbox assignment | STOP → Wait for PM |
| Handing off to another dev | STOP → Route through PM/QA |
| Coverage below 80% | STOP → Add more tests |
| Missing safety banner | STOP → Add it immediately |

## Self-Correction Protocol

**If agent detects violation:**

```markdown
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  VIOLATION DETECTED - SELF-CORRECTING                        ║
╠══════════════════════════════════════════════════════════════════╣
║  Violation Type: [Type]                                          ║
║  What I was about to do: [Action]                                ║
║  Why it's wrong: [Reason]                                        ║
║  Correction: [What I'll do instead]                              ║
╚══════════════════════════════════════════════════════════════════╝
```

---

# LAYER 8: AUDIT TRAIL

## Session Log

**Agent MUST maintain session log in milestone folder:**

```markdown
# Session Log: [STORY-ID]

## Session: YYYY-MM-DD HH:MM

### Identity
- Agent: [Name]
- Branch: [Branch]
- Worktree: [Path]

### Actions Taken
1. [HH:MM] Read agent definition
2. [HH:MM] Read safety framework
3. [HH:MM] Checked inbox
4. [HH:MM] Created test file: [path]
5. [HH:MM] Ran tests: [result]
6. [HH:MM] Created implementation: [path]
7. [HH:MM] Ran tests: [result]
8. [HH:MM] Coverage check: [XX%]

### Files Modified
| File | Action | In Domain? |
|------|--------|------------|
| [path] | Created | ✅ |

### Self-Checks Performed
- [HH:MM] Periodic check #1: ✅ All clear
- [HH:MM] Periodic check #2: ✅ All clear

### Violations Detected
- None / [List any self-corrections]

### Handoff
- To: [Inbox]
- Status: [Complete/Blocked]
```

---

# VALIDATION CHECKLIST SUMMARY

## On Session Start
- [ ] Read agent definition
- [ ] Read safety framework
- [ ] Read workflow protocol
- [ ] Read validation protocol
- [ ] Check inbox
- [ ] Confirm branch/worktree
- [ ] Output identity declaration

## Before Each File Operation
- [ ] Domain check
- [ ] Authority check
- [ ] TDD check

## Every Response
- [ ] Safety banner displayed
- [ ] Still on assigned story
- [ ] Still in correct domain

## Every 3 Actions
- [ ] Periodic self-check completed
- [ ] Files reviewed for domain compliance

## Before Handoff
- [ ] Correct destination (QA for complete, PM for blocked)
- [ ] No direct dev-to-dev handoff
- [ ] All information included

## On Session End
- [ ] Session log updated
- [ ] All work committed
- [ ] Handoff written if needed

---

# ENFORCEMENT

**PM Agent MUST reject any work where:**
- Safety banner is missing from responses
- Gate 1 files don't exist
- Files outside domain were modified
- Tests don't exist for implementation
- Coverage is below 80%
- Direct dev-to-dev handoff occurred

**This protocol is MANDATORY. NO EXCEPTIONS.**

---

*Agent Validation Protocol v1.0*
*Last Updated: 2025-12-19*
