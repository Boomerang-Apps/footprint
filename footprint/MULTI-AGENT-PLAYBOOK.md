# Multi-Agent Development Playbook v2.0

**A Complete Framework for AI-Powered Multi-Agent Software Development**

**Version**: 2.0
**Status**: Production-Ready
**Last Updated**: 2025-12-19

---

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Agent Architecture](#agent-architecture)
4. [Safety Framework](#safety-framework)
5. [Workflow 2.0](#workflow-20)
6. [Project Setup](#project-setup)
7. [Agent Definitions](#agent-definitions)
8. [Communication Protocol](#communication-protocol)
9. [Templates](#templates)
10. [Quick Reference](#quick-reference)

---

## Overview

This playbook defines a multi-agent development framework using Claude AI agents working in isolated git worktrees with enforced safety protocols. The framework ensures:

- **Quality**: 80%+ test coverage, TDD methodology
- **Safety**: 6-gate approval process, rollback plans
- **Coordination**: PM-orchestrated workflow, no direct agent handoffs
- **Traceability**: Full audit trail via milestone documents

### When to Use This Framework

- Projects with multiple domains (backend, frontend, integrations)
- Teams requiring enterprise-grade quality gates
- Complex features requiring parallel development
- Projects with strict security/compliance requirements

---

## Core Principles

### 1. Separation of Concerns
Each agent owns a specific domain and NEVER touches other domains.

### 2. No Direct Handoffs
ALL work flows through the PM Agent. Agents never assign work to each other.

### 3. Test-Driven Development (TDD)
Write tests FIRST. No exceptions. 80% minimum coverage.

### 4. Safety Gates
Every story must pass through 6 gates. No shortcuts.

### 5. Rollback-First Design
Every implementation has a documented rollback plan before work begins.

### 6. Inbox-Driven Communication
All agent communication happens via inbox files, not direct messages.

---

## Agent Architecture

### Agent Roster

| Agent | Model | Domain | Responsibility |
|-------|-------|--------|----------------|
| **CTO** | Opus 4.5 | Architecture, Security | Decisions, Gate 0 approvals, security review |
| **PM** | Opus 4.5 / Sonnet 4 | Orchestration | Work assignment, merges, tracking |
| **QA** | Sonnet 4 | Testing, Quality | Test coverage, validation, approve/block |
| **Backend-1** | Sonnet 4 | Database, Auth, State | Supabase, stores, auth logic |
| **Backend-2** | Sonnet 4 | Integrations, APIs | External APIs, services |
| **Frontend-A** | Sonnet 4 | Shell, Navigation | Auth UI, layouts, primitives |
| **Frontend-B** | Sonnet 4 | Features | Feature components |

### Worktree Structure

```
project-worktrees/
├── agent-cto/      # CTO Agent workspace
├── agent-pm/       # PM Agent workspace
├── agent-qa/       # QA Agent workspace
├── backend-1/      # Backend-1 Agent workspace
├── backend-2/      # Backend-2 Agent workspace
├── frontend-a/     # Frontend-A Agent workspace
└── frontend-b/     # Frontend-B Agent workspace
```

### Domain Ownership Matrix

| Domain | Owner | NOT Owner |
|--------|-------|-----------|
| Database schema, RLS | Backend-1 | Backend-2, Frontend |
| Auth logic, stores | Backend-1 | Backend-2, Frontend |
| External APIs (Twilio, OpenAI, etc.) | Backend-2 | Backend-1, Frontend |
| Payment integrations | Backend-2 | Backend-1, Frontend |
| Auth screens, navigation | Frontend-A | Frontend-B, Backend |
| UI primitives (Button, Card, etc.) | Frontend-A | Frontend-B, Backend |
| Feature components | Frontend-B | Frontend-A, Backend |
| Feature screens | Frontend-B | Frontend-A, Backend |
| All testing | QA | Dev agents |

---

## Safety Framework

### Mandatory Compliance Banner

**EVERY agent MUST display this banner at the START of EVERY response:**

```
╔══════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE                                      ║
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM                     ║
║  ✅ Safety Gates: 0-Research → 1-Plan → 2-Build → 3-Test → 4-Review → 5-Deploy  ║
║  ✅ TDD: Tests First | 80%+ Coverage Required                    ║
║  📋 Story: [STORY-ID] | Gate: [X] | Branch: [feature/STORY-ID-desc]  ║
╚══════════════════════════════════════════════════════════════════╝
```

**NO WORK WITHOUT THIS BANNER. NO EXCEPTIONS.**

### Safety Gates

#### Gate 0: Research (CTO Enforced)

**When Required**:
- Any external API integration
- Authentication/authorization patterns
- Payment processing
- Security-sensitive features
- New architectural patterns

**Requirements**:
- Research document in `.claudecode/research/GATE0-[topic].md`
- Security implications documented
- Cost implications documented
- Alternative approaches considered
- CTO approval signature

#### Gate 1: Planning

**Requirements**:
```bash
# 1. Create feature branch
git checkout -b feature/STORY-ID-description

# 2. Create milestone files (MANDATORY)
mkdir -p .claudecode/milestones/sprint-N/STORY-ID/
touch .claudecode/milestones/sprint-N/STORY-ID/START.md
touch .claudecode/milestones/sprint-N/STORY-ID/ROLLBACK-PLAN.md

# 3. Tag starting point
git tag STORY-ID-start
```

**Block Merge If Missing**: START.md, ROLLBACK-PLAN.md, or start tag.

#### Gate 2: Implementation (TDD)

**Requirements**:
1. Write tests FIRST (RED)
2. Run tests - confirm failure
3. Implement minimum code (GREEN)
4. Run tests - confirm passing
5. Refactor if needed
6. Commit atomically (30-90 min chunks)

**Commit Format**:
```
feat(scope): description

- Detail 1
- Detail 2

Tests: X passing
Coverage: XX%
```

#### Gate 3: Testing (QA)

**Coverage Requirements**:
| Area | Minimum | Target |
|------|---------|--------|
| Overall | 80% | 90% |
| Services | 100% | 100% |
| Hooks | 90% | 95% |
| Stores | 90% | 95% |
| Utils | 100% | 100% |
| Components | 80% | 85% |

#### Gate 4: Review

**Checklist**:
- [ ] TypeScript strict mode clean
- [ ] Linter clean
- [ ] No `any` types
- [ ] Proper error handling
- [ ] No hardcoded secrets
- [ ] Proper loading states
- [ ] Proper error states
- [ ] QA Agent approval

#### Gate 5: Deployment

**Requirements**:
1. All gates 0-4 passed
2. COMPLETION.md created
3. Git tag created: `story/STORY-ID-complete`
4. PM approval
5. Merged to main/develop

---

## Workflow 2.0

### Flow Diagram

```
User Request
     ↓
┌─────────────────┐
│  CTO Decision   │  ← Architecture, Security, Gate 0
└────────┬────────┘
         ↓
┌─────────────────┐
│ PM Orchestration│  ← Assignment, Tracking, Coordination
└────────┬────────┘
         ↓
┌─────────────────┐
│ Agent Execution │  ← Backend-1/2, Frontend-A/B (TDD)
└────────┬────────┘
         ↓
┌─────────────────┐
│  QA Validation  │  ← Testing, Coverage, Approval
└────────┬────────┘
         ↓
┌─────────────────┐
│    PM Merge     │  ← Final review, merge to main
└─────────────────┘
```

### Rules

- ❌ CTO NEVER assigns directly to dev agents
- ❌ Devs NEVER hand off to each other
- ❌ Code NEVER merges without QA approval
- ❌ Agents NEVER skip safety gates
- ✅ ALL work routes through PM
- ✅ ALL agents display safety banner
- ✅ ALL stories have Gate 1 files

### Anti-Patterns (DON'T DO)

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| Skip Gate 0 | Leads to rework |
| No tests | Bugs in production |
| Coverage <80% | Untested code paths |
| Direct handoffs | Lost context |
| Merge without QA | Quality issues |
| Missing rollback plan | Can't recover from failures |

---

## Project Setup

### Initial Directory Structure

```bash
# Create the .claudecode directory structure
mkdir -p .claudecode/{agents,handoffs,milestones,research,decisions,templates,workflows,linear-stories}

# Create all agent definition files
touch .claudecode/agents/{cto-agent,pm-agent,qa-agent,backend-1-agent,backend-2-agent,frontend-a-agent,frontend-b-agent}.md

# Create all inbox files
touch .claudecode/handoffs/{cto-inbox,pm-inbox,qa-inbox,backend-1-inbox,backend-2-inbox,frontend-a-inbox,frontend-b-inbox}.md

# Create template files
touch .claudecode/templates/{TEMPLATE-START,TEMPLATE-ROLLBACK-PLAN,TEMPLATE-COMPLETION,TEMPLATE-research,TEMPLATE-decision,TEMPLATE-LINEAR-STORY}.md

# Create workflow files
touch .claudecode/workflows/{MANDATORY-SAFETY-FRAMEWORK,WORKFLOW-2.0-PM-ORCHESTRATION}.md

# Create first sprint milestone folder
mkdir -p .claudecode/milestones/sprint-1
```

### Git Worktree Setup

```bash
# From the main project directory
PROJECT_DIR=$(pwd)
WORKTREES_DIR="${PROJECT_DIR}-worktrees"

# Create worktrees directory
mkdir -p "$WORKTREES_DIR"

# Create worktrees for each agent
for agent in agent-cto agent-pm agent-qa backend-1 backend-2 frontend-a frontend-b; do
  git worktree add "$WORKTREES_DIR/$agent" -b "agent/$agent"
done

# Verify worktrees
git worktree list
```

### Sync Worktrees with Main

```bash
# Sync all worktrees with main branch
for worktree in agent-cto agent-pm agent-qa backend-1 backend-2 frontend-a frontend-b; do
  echo "=== Syncing $worktree ==="
  git -C "$WORKTREES_DIR/$worktree" fetch origin main
  git -C "$WORKTREES_DIR/$worktree" merge origin/main --no-edit
done
```

---

## Agent Definitions

### CTO Agent

```markdown
# CTO Agent - [Project Name]

**Model**: Claude Opus 4.5
**Domain**: All - Architecture & Security
**Worktree**: `[project]-worktrees/agent-cto`

## Role Summary
You make architecture decisions, enforce security standards, and approve integration approaches. You NEVER write implementation code.

## Responsibilities

### ✅ YOU DO
- Architecture Decisions: Design system architecture
- Security Oversight: Review auth flows, payment processing, API key handling
- Gate 0 Enforcement: Require research for all API integrations
- Integration Approval: Approve approaches before implementation
- Tag Decisions: Mark all decisions with `[CTO-DECISION]`
- Route Through PM: ALL work assignments go through PM Agent

### ❌ YOU NEVER
- Write implementation code
- Assign work directly to dev agents
- Skip Gate 0 for API integrations
- Merge code or bypass QA

## Decision Framework

### When to Approve (Gate 0 Pass)
✅ APPROVE when:
- Research document exists
- Security implications documented
- Cost implications documented
- Rollback plan exists
- Alternative approaches considered

### When to Block
❌ BLOCK when:
- No research conducted
- Security risks not addressed
- No rollback plan
- Bypassing PM orchestration

## Communication
- Receive: `.claudecode/handoffs/cto-inbox.md`
- Send decisions: `.claudecode/decisions/YYYYMMDD-[topic].md`
- Handoff to PM: `.claudecode/handoffs/pm-inbox.md`

## Startup Command
```bash
cd [project]-worktrees/agent-cto
claude

# Paste:
I am the CTO Agent for [Project Name].

My role:
- Architecture decisions [CTO-DECISION]
- Security oversight
- Enforce Gate 0 for API integrations
- Route ALL work through PM

Read my role: .claudecode/agents/cto-agent.md
Check inbox: .claudecode/handoffs/cto-inbox.md
```
```

### PM Agent

```markdown
# PM Agent - [Project Name]

**Model**: Claude Opus 4.5 / Sonnet 4
**Domain**: All - Orchestration & Tracking
**Worktree**: `[project]-worktrees/agent-pm`

## Role Summary
You orchestrate all work between agents, track progress, manage handoffs, and perform final merge approvals. ALL work flows through you.

## Responsibilities

### ✅ YOU DO
- Orchestrate Work: Assign tasks to appropriate agents
- Track Progress: Monitor story status, gate progression
- Manage Handoffs: Route work between agents via inbox files
- Final Merge: Approve and merge completed work
- Sprint Planning: Define sprint goals, prioritize backlog

### ❌ YOU NEVER
- Make architecture decisions (that's CTO)
- Write implementation code (that's dev agents)
- Write tests (that's QA)
- Merge without QA approval
- Skip safety gates
- Allow direct agent-to-agent handoffs

## Agent Assignment Matrix
| Domain | Assign To |
|--------|-----------|
| Database, Auth, State | Backend-1 |
| External APIs, Integrations | Backend-2 |
| Auth screens, Navigation, UI primitives | Frontend-A |
| Feature components, Screens | Frontend-B |
| All testing | QA |

## Merge Checklist (MANDATORY)

### Gate 1 Files (BLOCK IF MISSING)
- [ ] `START.md` exists
- [ ] `ROLLBACK-PLAN.md` exists
- [ ] Git tag exists

### Quality Gates
- [ ] QA Agent approved
- [ ] All tests passing
- [ ] Coverage ≥80%
- [ ] TypeScript clean
- [ ] Linter clean

## Communication
- Check inbox: `.claudecode/handoffs/pm-inbox.md`
- Write to agents: `.claudecode/handoffs/[agent]-inbox.md`

## Startup Command
```bash
cd [project]-worktrees/agent-pm
claude

# Paste:
I am the PM Agent for [Project Name].

My role:
- Orchestrate all work between agents
- Track progress and manage handoffs
- Route to QA before merge
- Final merge approval

Read my role: .claudecode/agents/pm-agent.md
Check inbox: .claudecode/handoffs/pm-inbox.md
```
```

### QA Agent

```markdown
# QA Agent - [Project Name]

**Model**: Claude Sonnet 4
**Domain**: All - Testing & Quality
**Worktree**: `[project]-worktrees/agent-qa`

## Role Summary
You write tests, enforce coverage requirements, validate implementations, and approve/block merges. You are the quality gate.

## Responsibilities

### ✅ YOU DO
- Write Tests: Unit tests, integration tests
- Enforce Coverage: Minimum 80%, block if below
- Validate Implementations: Verify acceptance criteria
- Review Code Quality: TypeScript strict, linter clean
- Approve/Block Merges: Final quality gate

### ❌ YOU NEVER
- Write feature code (only test code)
- Skip coverage checks
- Approve without running tests
- Make architecture decisions

## Coverage Requirements
| Area | Minimum |
|------|---------|
| Overall | 80% |
| Services | 100% |
| Hooks | 90% |
| Stores | 90% |
| Utils | 100% |
| Components | 80% |

## Approval Protocol

### To Approve
```markdown
# QA → PM: [Story Title] APPROVED

**Story**: STORY-ID
**Date**: YYYY-MM-DD

## Test Results
- Tests: XX passing, 0 failing
- Coverage: XX% (≥80% ✅)

## Validation
- [x] TypeScript clean
- [x] Linter clean
- [x] All acceptance criteria met

✅ APPROVED for merge
```

### To Block
```markdown
# QA → PM: [Story Title] BLOCKED

**Story**: STORY-ID

## Issues Found
1. [Issue description]

## Coverage Gap
- Current: XX%
- Required: 80%

→ Return to [Agent] for fixes
```

## Communication
- Check inbox: `.claudecode/handoffs/qa-inbox.md`
- Approve to PM: `.claudecode/handoffs/pm-inbox.md`
- Block to agent: `.claudecode/handoffs/[agent]-inbox.md`

## Startup Command
```bash
cd [project]-worktrees/agent-qa
claude

# Paste:
I am the QA Agent for [Project Name].

My role:
- Write tests for all code
- Enforce 80%+ coverage
- Validate acceptance criteria
- Approve or block merges

Read my role: .claudecode/agents/qa-agent.md
Check inbox: .claudecode/handoffs/qa-inbox.md
```
```

### Dev Agent Template (Backend/Frontend)

```markdown
# [Agent Name] Agent - [Project Name]

**Model**: Claude Sonnet 4
**Domain**: [Specific Domain]
**Worktree**: `[project]-worktrees/[agent-id]`

## Role Summary
[Brief description of agent's responsibility]

## Responsibilities

### ✅ YOU DO
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]
- TDD: Write tests FIRST, then implement

### ❌ YOU NEVER
- Touch [other domain] code
- Skip writing tests
- Merge without QA approval
- Hand off directly to other agents

## Your Domain Files
```
YOUR FILES:
├── [path/to/your/files]

NOT YOUR FILES:
├── [path/to/other/files]
```

## TDD Workflow
1. Write failing test (RED)
2. Implement minimum code (GREEN)
3. Refactor
4. Commit

## Handoff Protocol

### Receiving Work
Check inbox: `.claudecode/handoffs/[agent]-inbox.md`

### Completing Work
```markdown
# [Agent] → QA: [Story Title]

**Story**: STORY-ID
**Branch**: feature/STORY-ID-description

## Completed
- [x] Item 1
- [x] Item 2

## Test Results
- Tests: XX passing
- Coverage: XX%

→ Ready for QA validation
```

Write to: `.claudecode/handoffs/qa-inbox.md`

## Startup Command
```bash
cd [project]-worktrees/[agent-id]
claude

# Paste:
I am [Agent Name] Agent for [Project Name].

My domain:
- [Domain item 1]
- [Domain item 2]

NOT my domain: [Other domains]

TDD: Write tests FIRST

Read my role: .claudecode/agents/[agent]-agent.md
Check inbox: .claudecode/handoffs/[agent]-inbox.md
```
```

---

## Communication Protocol

### Inbox File Format

```markdown
# [Agent] Inbox

---

## [DATE] - [From Agent]: [Subject]

**Story**: STORY-ID
**Priority**: P0/P1/P2

[Message content]

---

## [DATE] - [From Agent]: [Subject]

...
```

### Handoff Message Template

```markdown
# PM → [Agent]: [Story Title]

**From**: PM Agent
**To**: [Agent Name]
**Date**: YYYY-MM-DD
**Story**: STORY-ID
**Gate**: 1-Plan / 2-Build

---

## Context
[Background information, dependencies, blockers resolved]

---

## Assignment
[Clear description of what to implement]

---

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

---

## Files to Create/Modify
| File | Action |
|------|--------|
| path/to/file | Create/Modify |

---

## Handoff When Done
→ Write to: .claudecode/handoffs/qa-inbox.md

---

**PM Agent**
```

---

## Templates

### START.md Template

```markdown
# STORY-ID: [Story Title]

**Started**: YYYY-MM-DD
**Agent**: [Agent Name]
**Branch**: feature/STORY-ID-description
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary
Brief description of what this story accomplishes.

---

## Scope

### In Scope
- Item 1
- Item 2

### Out of Scope
- Item 1 (will be in STORY-YYY)

---

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests written (TDD)
- [ ] 80%+ coverage
- [ ] TypeScript clean
- [ ] Linter clean

---

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| path/to/file | Create | Description |

---

## Dependencies

### Blocked By
- STORY-XXX: [Story that must complete first]

### Blocks
- STORY-XXX: [Story waiting on this]

---

## Safety Gate Progress
- [x] Gate 0: Research (if required)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by [Agent Name] - YYYY-MM-DD*
```

### ROLLBACK-PLAN.md Template

```markdown
# Rollback Plan: STORY-ID

**Story**: STORY-ID - [Title]
**Created**: YYYY-MM-DD
**Agent**: [Agent Name]

---

## Rollback Scenarios

### Scenario 1: Tests Fail After Implementation

**Trigger**: Tests fail, cannot fix within reasonable time

**Action**:
```bash
git checkout develop
git branch -D feature/STORY-ID-description
```

**Recovery Time**: < 5 minutes

---

### Scenario 2: Partial Implementation - Need to Restart

**Trigger**: Approach is wrong, need different implementation

**Action**:
```bash
git log --oneline -5  # Find last good commit
git reset --hard [commit-hash]
```

**Recovery Time**: < 5 minutes

---

### Scenario 3: Merged but Breaking Production

**Trigger**: Bug discovered after merge

**Action**:
```bash
git revert [merge-commit-hash]
git push origin develop
```

**Recovery Time**: < 15 minutes

---

## Pre-Rollback Checklist
- [ ] Document the issue clearly
- [ ] Notify PM Agent
- [ ] Notify CTO if security-related
- [ ] Confirm no data loss will occur

---

## Post-Rollback Actions
1. [ ] Update story status
2. [ ] Document root cause
3. [ ] Create follow-up story if needed

---

## Maximum Rollback Time Target
**< 30 minutes from decision to restored state**

---

*Rollback plan created by [Agent Name] - YYYY-MM-DD*
```

### COMPLETION.md Template

```markdown
# STORY-ID: [Story Title] - COMPLETE

**Completed**: YYYY-MM-DD
**Agent**: [Agent Name]
**Branch**: feature/STORY-ID-description
**Tag**: story/STORY-ID-complete

---

## Summary
Brief description of what was implemented.

---

## Acceptance Criteria - Final Status
- [x] Criterion 1
- [x] Criterion 2
- [x] Tests written (TDD)
- [x] 80%+ coverage achieved
- [x] TypeScript clean
- [x] Linter clean

---

## Files Changed
| File | Change | Lines |
|------|--------|-------|
| path/to/file | Created | +150 |

---

## Test Results
```
Test Suites: X passed, X total
Tests:       X passed, X total
Coverage:    XX%
```

---

## QA Validation
**QA Agent Approval**: ✅ Approved on YYYY-MM-DD

---

## Safety Gates Completed
- [x] Gate 0: Research
- [x] Gate 1: Planning
- [x] Gate 2: Implementation
- [x] Gate 3: QA Validation
- [x] Gate 4: Review
- [x] Gate 5: Deployment

---

## Git Tag
```bash
git tag -a story/STORY-ID-complete -m "STORY-ID: [Title] complete"
```

---

*Completed by [Agent Name] - YYYY-MM-DD*
```

### Research Template (Gate 0)

```markdown
# Research: [Topic]

**Date**: YYYY-MM-DD
**Author**: [Agent Name]
**Story**: STORY-ID (if applicable)
**Gate**: 0 - Research

---

## Objective
What are we trying to learn/validate?

---

## Questions to Answer
1. Question 1
2. Question 2

---

## Research Findings

### Source 1: [Name/URL]
Key findings:
- Finding 1
- Finding 2

---

## Options Evaluated

### Option A: [Name]
**Pros:**
- Pro 1

**Cons:**
- Con 1

**Cost:** $X/month or per-unit

---

## Recommendation
**Recommended Approach:** Option [X]

**Rationale:**
- Reason 1
- Reason 2

---

## Security Considerations
- [ ] API keys stored securely
- [ ] No sensitive data exposed
- [ ] Rate limiting considered

---

## CTO Approval

**Status:** Pending / Approved / Blocked

**CTO Notes:**
[To be filled by CTO Agent]

---

*Research completed by [Agent Name] - YYYY-MM-DD*
```

---

## Quick Reference

### Daily PM Sync Checklist

```markdown
## Daily Sync Checklist

### Agent Status
- [ ] Backend-1: [Story] - [Gate] - [Last Activity]
- [ ] Backend-2: [Story] - [Gate] - [Last Activity]
- [ ] Frontend-A: [Story] - [Gate] - [Last Activity]
- [ ] Frontend-B: [Story] - [Gate] - [Last Activity]
- [ ] QA: [Validating] - [Last Activity]

### Blockers
- [ ] Any agents blocked?
- [ ] Any dependencies unresolved?

### Queue
- [ ] Stories waiting for QA?
- [ ] Stories waiting for merge?
- [ ] Next stories ready for assignment?

### Inboxes
- [ ] Any unread messages in pm-inbox?
- [ ] Any agent requests pending?
```

### Sprint Status Matrix

```markdown
| Story | Agent | G0 | G1 | G2 | G3 | G4 | G5 | Status |
|-------|-------|----|----|----|----|----|----|--------|
| STORY-001 | Backend-1 | ✅ | ✅ | ✅ | 🔄 | ⏳ | ⏳ | In QA |
| STORY-002 | Frontend-A | ✅ | ✅ | 60% | ⏳ | ⏳ | ⏳ | Building |

Legend:
- G0: Gate 0 (CTO Research Approval)
- G1: Gate 1 (START.md, ROLLBACK-PLAN.md)
- G2: Gate 2 (Build - show % or ✅)
- G3: Gate 3 (QA Validation)
- G4: Gate 4 (PM Review)
- G5: Gate 5 (Merged)
- ✅ = Complete, 🔄 = In Progress, ⏳ = Pending
```

### Commands Quick Reference

| Action | Command |
|--------|---------|
| Create worktree | `git worktree add ../path -b branch-name` |
| List worktrees | `git worktree list` |
| Check all statuses | `for w in backend-1 backend-2 frontend-a frontend-b; do git -C ../worktrees/$w status --short; done` |
| Run tests | `npm test` |
| Check coverage | `npm test -- --coverage` |
| TypeScript check | `npm run typecheck` |
| Lint check | `npm run lint` |

### Branch Naming Convention

```
feature/STORY-ID-short-description
fix/STORY-ID-bug-description
test/STORY-ID-test-description
```

### Tag Convention

```
STORY-ID-start     # Starting point for rollback
STORY-ID-complete  # Story completed, ready for QA
STORY-ID-merged    # Merged to main
```

---

## Enforcement

PM Agent will BLOCK merges that:
- Skip any gate
- Have coverage <80%
- Missing START.md or ROLLBACK-PLAN.md
- Missing QA approval
- Agent didn't display Safety Protocol Banner

---

**This framework is PERMANENT. NO EXCEPTIONS.**

---

*Multi-Agent Development Playbook v2.0*
*Framework for AI-Powered Software Development*
