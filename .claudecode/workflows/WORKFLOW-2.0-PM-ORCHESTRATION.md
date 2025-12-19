# Workflow 2.0 - PM Orchestration

**Version**: 2.0
**Status**: ENFORCED
**Last Updated**: 2025-12-19

---

## Flow Diagram

```
User Request
     |
     v
+-------------------+
|   CTO Decision    |  <- Architecture, Security, Gate 0
+--------+----------+
         |
         v
+-------------------+
| PM Orchestration  |  <- Assignment, Tracking, Coordination
+--------+----------+
         |
         v
+-------------------+
| Agent Execution   |  <- Backend-1/2, Frontend-A/B (TDD)
+--------+----------+
         |
         v
+-------------------+
|   QA Validation   |  <- Testing, Coverage, Approval
+--------+----------+
         |
         v
+-------------------+
|     PM Merge      |  <- Final review, merge to main
+-------------------+
```

---

## Core Rules

### NEVER DO
- CTO NEVER assigns directly to dev agents
- Devs NEVER hand off to each other
- Code NEVER merges without QA approval
- Agents NEVER skip safety gates
- Agents NEVER communicate outside inbox files

### ALWAYS DO
- ALL work routes through PM
- ALL agents display safety banner
- ALL stories have Gate 1 files (START.md, ROLLBACK-PLAN.md)
- ALL handoffs use inbox files

---

## Agent Assignment Matrix

| Domain | Assign To | Inbox File |
|--------|-----------|------------|
| Database, Auth, State | Backend-1 | backend-1-inbox.md |
| External APIs, Integrations | Backend-2 | backend-2-inbox.md |
| Auth screens, Navigation, UI primitives | Frontend-A | frontend-a-inbox.md |
| Feature components, Screens | Frontend-B | frontend-b-inbox.md |
| All testing | QA | qa-inbox.md |

---

## Footprint Domain Ownership

### Backend-1 Owns
```
stores/orderStore.ts
lib/auth/
hooks/useAuth.ts
hooks/useUser.ts
types/user.ts
```

### Backend-2 Owns
```
lib/api/
lib/ai/
lib/storage/
app/api/
```

### Frontend-A Owns
```
app/layout.tsx
app/providers.tsx
app/(marketing)/
components/ui/
tailwind.config.ts
```

### Frontend-B Owns
```
app/(app)/create/
app/admin/
components/upload/
components/style-picker/
components/product-config/
components/checkout/
```

---

## Handoff Protocol

### PM -> Dev Agent
1. Write task to agent's inbox
2. Include: Story ID, Gate, Context, Assignment, Acceptance Criteria
3. Specify: Files to modify, handoff destination

### Dev Agent -> QA
1. Write completion notice to qa-inbox.md
2. Include: Story ID, Branch, Completed items, Test results
3. State: "Ready for QA validation"

### QA -> PM
1. Write approval/block to pm-inbox.md
2. If approved: Include test results, coverage, "APPROVED for merge"
3. If blocked: Include issues, return to dev agent

### QA -> Dev Agent (Block)
1. Write block notice to agent's inbox
2. Include: Issues found, required fixes
3. Dev fixes and re-submits to QA

---

## Sprint Tracking

### Daily PM Sync
```markdown
## Daily Sync - YYYY-MM-DD

### Agent Status
- [ ] Backend-1: [Story] - [Gate] - [Status]
- [ ] Backend-2: [Story] - [Gate] - [Status]
- [ ] Frontend-A: [Story] - [Gate] - [Status]
- [ ] Frontend-B: [Story] - [Gate] - [Status]
- [ ] QA: [Validating] - [Status]

### Blockers
- [ ] Any agents blocked?
- [ ] Dependencies unresolved?

### Queue
- [ ] Stories waiting for QA?
- [ ] Stories waiting for merge?
```

### Sprint Status Matrix
```markdown
| Story | Agent | G0 | G1 | G2 | G3 | G4 | G5 | Status |
|-------|-------|----|----|----|----|----|----|--------|
| STORY-001 | Backend-1 | OK | OK | OK | IP | -- | -- | In QA |
| STORY-002 | Frontend-A | OK | OK | 60% | -- | -- | -- | Building |

Legend: OK = Complete, IP = In Progress, -- = Pending
```

---

## Communication Paths

```
CTO <-> PM <-> Backend-1
            <-> Backend-2
            <-> Frontend-A
            <-> Frontend-B
            <-> QA

QA <-> Backend-1 (block/fix cycle)
   <-> Backend-2
   <-> Frontend-A
   <-> Frontend-B
```

**All paths go through inbox files in `.claudecode/handoffs/`**

---

## Merge Checklist (PM)

Before merging any story:

### Gate 1 Files (BLOCK IF MISSING)
- [ ] `.claudecode/milestones/sprint-N/STORY-ID/START.md` exists
- [ ] `.claudecode/milestones/sprint-N/STORY-ID/ROLLBACK-PLAN.md` exists
- [ ] Git tag `STORY-ID-start` exists

### Quality Gates
- [ ] QA Agent explicitly approved in pm-inbox.md
- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] TypeScript clean
- [ ] Linter clean

### Final Steps
- [ ] Create COMPLETION.md
- [ ] Create git tag `story/STORY-ID-complete`
- [ ] Merge to main/develop
- [ ] Update sprint tracking

---

**THIS WORKFLOW IS PERMANENT. NO EXCEPTIONS.**
