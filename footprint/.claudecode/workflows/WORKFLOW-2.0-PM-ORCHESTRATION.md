# Workflow 2.0: PM Orchestration Protocol

**Version**: 2.0
**Last Updated**: 2025-12-17
**Status**: MANDATORY

---

## Overview

The PM Agent is responsible for **orchestrating all development work** across the multi-agent framework. This document defines the synchronization protocol that ensures logical flow, achievement tracking, and proper handoffs.

---

## Core Principles

1. **No Direct Agent-to-Agent Handoffs** - All work flows through PM
2. **Achievement-Based Progression** - Gates unlock based on completion, not time
3. **Synchronization Checkpoints** - PM validates state before advancing
4. **Inbox-Driven Communication** - All communication via inbox files
5. **Kickstart Prompts** - PM provides specific prompts to activate agents

---

## PM Orchestration Responsibilities

### 1. Sprint Initialization

```
PM MUST:
[ ] Verify all Gate 0 research is CTO-approved
[ ] Create agent assignments in each inbox
[ ] Generate kickstart prompts for each agent
[ ] Document sprint status in pm-inbox.md
[ ] Verify worktrees are synced with main
```

### 2. Gate Progression Tracking

| Gate | Owner | PM Action |
|------|-------|-----------|
| Gate 0 | CTO | Wait for approval, then notify agents |
| Gate 1 | Agent | Verify START.md + ROLLBACK-PLAN.md exist |
| Gate 2 | Agent | Monitor progress, resolve blockers |
| Gate 3 | QA | Route completed work to QA for validation |
| Gate 4 | PM | Review QA approval, verify coverage |
| Gate 5 | PM | Merge to main, tag, update Linear |

### 3. Synchronization Checkpoints

PM MUST perform sync checks at these points:

#### Before Agent Starts Work
```
[ ] Agent inbox updated with assignment
[ ] Gate 0 research document exists
[ ] Previous dependencies completed (if any)
[ ] Kickstart prompt generated
[ ] Worktree synced with main
```

#### After Agent Reports Completion
```
[ ] Tests passing (verify with npm test)
[ ] Coverage meets 80%+ threshold
[ ] Gate 1 milestone files exist
[ ] No TypeScript errors
[ ] No ESLint errors
[ ] Hand off to QA (not merge)
```

#### After QA Validation
```
[ ] QA approval in pm-inbox.md
[ ] All acceptance criteria checked
[ ] Coverage verified by QA
[ ] No blocking issues
[ ] Ready for Gate 5 merge
```

---

## Achievement Tracking Matrix

PM maintains this matrix in pm-inbox.md:

```markdown
## Sprint Status Matrix

| Story | Agent | G0 | G1 | G2 | G3 | G4 | G5 | Status |
|-------|-------|----|----|----|----|----|----|--------|
| RZ-XXX | Agent | ✅/❌ | ✅/❌ | %/✅ | ✅/❌ | ✅/❌ | ✅/❌ | Text |

Legend:
- G0: Gate 0 (CTO Research Approval)
- G1: Gate 1 (START.md, ROLLBACK-PLAN.md, tag)
- G2: Gate 2 (Build - show % or ✅ when complete)
- G3: Gate 3 (QA Validation)
- G4: Gate 4 (PM Review)
- G5: Gate 5 (Merged to main)
```

---

## Dependency Management

### Blocking Dependencies

When Story B depends on Story A:

```
Story A (RZ-001) ──[blocks]──> Story B (RZ-005)

PM Actions:
1. Do NOT assign RZ-005 until RZ-001 merged
2. Update RZ-005 inbox when unblocked
3. Generate new kickstart prompt with context
4. Notify agent with specific unblock message
```

### Parallel Work

When stories are independent:

```
Story A (RZ-006) ──[parallel]──> Story B (RZ-101)

PM Actions:
1. Assign both simultaneously
2. Monitor both progress
3. Route to QA as each completes (order doesn't matter)
4. Merge in completion order
```

---

## Synchronization Commands

PM uses these commands to check state:

### Check All Worktree Status
```bash
for agent in backend-1 backend-2 frontend-a frontend-b agent-qa; do
  echo "=== $agent ==="
  git -C /Users/mymac/Desktop/ringz-worktrees/$agent status --short
  git -C /Users/mymac/Desktop/ringz-worktrees/$agent log --oneline -1
done
```

### Check Test Status Per Agent
```bash
# Backend-1
npm test --prefix /Users/mymac/Desktop/ringz-worktrees/backend-1 2>/dev/null | tail -5

# Frontend-B
npm test --prefix /Users/mymac/Desktop/ringz-worktrees/frontend-b 2>/dev/null | tail -5
```

### Check Coverage Per Story
```bash
npm test --prefix /path/to/worktree -- --coverage --collectCoverageFrom="specific/file.ts"
```

---

## Kickstart Prompt Protocol

### When to Generate Prompts

PM generates kickstart prompts when:
1. Sprint starts (all agents)
2. Agent completes a story and has next assignment
3. Blocker is resolved (unblocked agent)
4. Agent needs redirection (scope change)

### Prompt Template

```markdown
You are [Agent Name] Agent for Ringz.io. Your domain: [Domain].

## IMMEDIATE ACTION

Read your inbox: `.claudecode/handoffs/[agent]-inbox.md`

## CURRENT ASSIGNMENT: [Story ID] [Title]

**Status**: [Status]
**Gate**: [Current Gate]
**Branch**: [Branch Name]

## CONTEXT

[Any relevant context: CTO decisions, unblock info, dependencies]

## YOUR TASKS

1. [Task 1]
2. [Task 2]
3. [Task 3]

## WORKFLOW 2.0 COMPLIANCE

- [ ] Read inbox before starting
- [ ] Follow TDD methodology
- [ ] Maintain 80%+ coverage
- [ ] Hand off to QA (not directly to PM)
- [ ] Do NOT merge - PM handles Gate 5

Begin by reading your full inbox, then [specific action].
```

---

## Event-Driven Orchestration

### On Agent Completion Report

```
1. Read completion report from agent inbox
2. Verify claims:
   - Run tests in agent worktree
   - Check coverage numbers
   - Verify Gate 1 files exist
3. If valid:
   - Route to QA inbox
   - Generate QA kickstart prompt
   - Update sprint matrix
4. If invalid:
   - Return to agent inbox with issues
   - Generate correction prompt
```

### On QA Approval

```
1. Read QA approval from pm-inbox
2. Verify QA checklist complete
3. Perform Gate 4 review:
   - Quick code review
   - Check for security issues
   - Verify no regressions
4. If approved:
   - Merge to main
   - Tag: story/RZ-XXX-complete
   - Update Linear status
   - Update sprint matrix
   - Assign next story to agent
5. If issues:
   - Return to agent with feedback
```

### On Blocker Resolution

```
1. Identify blocked agent
2. Update agent inbox with unblock notice
3. Include relevant context (what was resolved)
4. Generate new kickstart prompt
5. Update sprint matrix
```

---

## Daily Sync Checklist

PM should perform this check at least once per session:

```markdown
## Daily Sync Checklist

### Agent Status
- [ ] Backend-1: [Story] - [Gate] - [Last Activity]
- [ ] Backend-2: [Story] - [Gate] - [Last Activity]
- [ ] Frontend-A: [Story] - [Gate] - [Last Activity]
- [ ] Frontend-B: [Story] - [Gate] - [Last Activity]
- [ ] QA: [Validating] - [Last Activity]

### Blockers
- [ ] Any agents blocked? If yes, escalate to CTO
- [ ] Any dependencies unresolved?

### Queue
- [ ] Stories waiting for QA?
- [ ] Stories waiting for merge?
- [ ] Next stories ready for assignment?

### Inboxes
- [ ] Any unread messages in pm-inbox?
- [ ] Any agent requests pending?
```

---

## Error Recovery

### Agent Produces Failing Tests

```
1. Do NOT route to QA
2. Return to agent inbox with failure details
3. Request fix before re-submission
4. Update sprint matrix (back to Gate 2)
```

### QA Blocks Story

```
1. Read blocking reasons
2. Forward to agent inbox
3. Include specific issues to fix
4. Update sprint matrix (back to Gate 2)
```

### Merge Conflict

```
1. Identify conflicting branches
2. Determine priority (which merges first)
3. Instruct lower-priority agent to rebase after merge
4. Provide rebase instructions in inbox
```

---

## Mandatory PM Actions Summary

| Event | PM MUST |
|-------|---------|
| Sprint Start | Generate all kickstart prompts |
| Agent Assignment | Update inbox + generate prompt |
| Agent Completion | Verify + route to QA |
| QA Approval | Review + merge + assign next |
| Blocker Found | Escalate to CTO |
| Blocker Resolved | Update inbox + generate prompt |
| Daily Check | Run sync checklist |

---

## References

- Agent Inboxes: `.claudecode/handoffs/[agent]-inbox.md`
- Gate 0 Research: `.claudecode/research/GATE0-RZ-XXX-*.md`
- Milestone Files: `.claudecode/milestones/sprint-X/RZ-XXX/`
- Decision Log: `.claudecode/decisions/`
- Linear Stories: `.claudecode/linear-stories/`

---

*This protocol is MANDATORY for all PM orchestration activities.*
*Last Updated: 2025-12-17*
