# Linear-First Protocol v1.0

**Status**: MANDATORY
**Principle**: Linear is the SINGLE SOURCE OF TRUTH for all story details
**Enforcement**: Every agent, every story, no exceptions

---

## Core Principle

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 LINEAR-FIRST: Read from Linear → Work → Update Linear        ║
║                                                                  ║
║  Linear contains:                                                ║
║  • Full story details & acceptance criteria                      ║
║  • Technical requirements & constraints                          ║
║  • Test scenarios with expected inputs/outputs                   ║
║  • Definition of Done checklist                                  ║
║                                                                  ║
║  Agents MUST read Linear BEFORE starting any work               ║
║  Agents MUST update Linear AFTER completing any work            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

# PHASE 1: PM CREATES STORY IN LINEAR

## Story Creation Checklist (PM Responsibility)

Before assigning ANY story, PM MUST ensure Linear issue contains:

```markdown
## Required Linear Fields

### Basic Info
- [ ] Title: [STORY-ID] Action Verb + Component + Description
- [ ] Team: Assigned to correct team
- [ ] Project: Linked to correct project
- [ ] Cycle/Sprint: Assigned to current sprint
- [ ] Priority: P0/P1/P2/P3 set
- [ ] Estimate: Story points assigned

### Description (MANDATORY SECTIONS)
- [ ] Overview: 1-2 sentence summary
- [ ] User Story: As a... I want... So that...
- [ ] Background: Context and history
- [ ] Technical Context: Files, dependencies, patterns

### Acceptance Criteria (Given/When/Then)
- [ ] AC1: Primary functionality
- [ ] AC2: Secondary functionality
- [ ] AC3: Edge case handling
- [ ] AC4: Error handling

### Technical Requirements
- [ ] Implementation details checklist
- [ ] Security requirements checklist
- [ ] Performance requirements checklist

### Test Scenarios
- [ ] Test case table with inputs/outputs
- [ ] Integration test requirements
- [ ] Coverage target specified

### Definition of Done
- [ ] Full DoD checklist included

### Labels Applied
- [ ] agent-[name]: Assigned agent
- [ ] gate-0-research: Current gate
- [ ] priority-[level]: Priority
- [ ] sprint-[N]: Sprint number
```

---

# PHASE 2: AGENT READS FROM LINEAR

## Mandatory Linear Read Sequence

**BEFORE starting ANY work, agent MUST:**

### Step 1: Get Linear Issue ID from Inbox

```markdown
# Check inbox for assignment
cat .claudecode/handoffs/[my-agent]-inbox.md

# Extract Linear Issue ID (e.g., UZF-1234, RZ-005)
```

### Step 2: Fetch Full Story from Linear

**Option A: Using Linear MCP (Recommended)**
```
Use the Linear MCP tool: mcp__linear-server__get_issue
with the issue ID from your inbox
```

**Option B: Using Linear URL**
```
Visit: https://linear.app/[workspace]/issue/[ISSUE-ID]
Read ALL sections completely
```

### Step 3: Output Linear Story Confirmation

**Agent MUST output this after reading Linear:**

```markdown
╔══════════════════════════════════════════════════════════════════╗
║  📋 LINEAR STORY LOADED                                          ║
╠══════════════════════════════════════════════════════════════════╣
║  Issue ID: [UZF-XXXX / RZ-XXX]                                   ║
║  Title: [Full Title from Linear]                                 ║
║  Status: [Current Status]                                        ║
║  Priority: [P0/P1/P2/P3]                                         ║
║  Estimate: [X points]                                            ║
╠══════════════════════════════════════════════════════════════════╣
║  📖 STORY DETAILS READ:                                          ║
║  ✅ Overview                                                     ║
║  ✅ User Story (As a... I want... So that...)                    ║
║  ✅ Background/Context                                           ║
║  ✅ Technical Requirements                                       ║
║  ✅ Acceptance Criteria (X criteria found)                       ║
║  ✅ Test Scenarios (X scenarios found)                           ║
║  ✅ Definition of Done (X items)                                 ║
╠══════════════════════════════════════════════════════════════════╣
║  🎯 ACCEPTANCE CRITERIA SUMMARY:                                 ║
║  AC1: [Brief description]                                        ║
║  AC2: [Brief description]                                        ║
║  AC3: [Brief description]                                        ║
║  AC4: [Brief description]                                        ║
╠══════════════════════════════════════════════════════════════════╣
║  🧪 TEST SCENARIOS TO IMPLEMENT:                                 ║
║  1. [Test case 1]                                                ║
║  2. [Test case 2]                                                ║
║  3. [Test case 3]                                                ║
╠══════════════════════════════════════════════════════════════════╣
║  ✅ READY TO BEGIN IMPLEMENTATION                                ║
╚══════════════════════════════════════════════════════════════════╝
```

**IF AGENT CANNOT LOAD LINEAR STORY → STOP. REQUEST FROM PM.**

---

### Step 4: Create START.md from Linear Details

**Agent copies Linear details into milestone START.md:**

```markdown
# [STORY-ID]: [Title from Linear]

**Linear Issue**: [URL]
**Started**: YYYY-MM-DD
**Agent**: [Agent Name]
**Branch**: feature/[STORY-ID]-description

---

## From Linear

### User Story
[Copy exact user story from Linear]

### Acceptance Criteria
[Copy ALL acceptance criteria from Linear - Given/When/Then format]

### Technical Requirements
[Copy ALL technical requirements from Linear]

### Test Scenarios
[Copy ALL test scenarios from Linear with expected inputs/outputs]

### Definition of Done
[Copy FULL DoD checklist from Linear]

---

## Implementation Plan

[Agent's plan to implement the requirements]

---

## Files to Create/Modify

| File | Action | Acceptance Criteria |
|------|--------|---------------------|
| [file] | Create | Maps to AC1 |

---

*Loaded from Linear: [Issue URL]*
```

---

# PHASE 3: AGENT UPDATES LINEAR DURING WORK

## Status Updates Required

**Agent MUST update Linear status at these points:**

| Event | Linear Status | Linear Comment |
|-------|---------------|----------------|
| Started work | "In Progress" | "Started implementation. Branch: feature/[ID]-desc" |
| Gate 1 complete | "In Progress" | "Gate 1 complete. START.md and ROLLBACK-PLAN.md created." |
| 50% complete | "In Progress" | "Progress update: [X/Y] acceptance criteria implemented" |
| Tests written | "In Progress" | "All tests written. Running TDD cycle." |
| Ready for QA | "In Review" | "Implementation complete. Handed off to QA. Coverage: XX%" |
| QA blocked | "In Progress" | "QA blocked: [reason]. Fixing issues." |
| Merged | "Done" | "Merged to main. Tag: story/[ID]-complete" |

## How to Update Linear

**Option A: Using Linear MCP**
```
Use: mcp__linear-server__update_issue
- id: [issue-id]
- state: [new-state]

Use: mcp__linear-server__create_comment
- issueId: [issue-id]
- body: [comment markdown]
```

**Option B: Request PM to Update**
```markdown
# [Agent] → PM: Linear Update Request

Please update Linear issue [ID]:
- Status: [new status]
- Comment: [comment text]
```

---

# PHASE 4: COMPLETION UPDATES

## When Work is Complete

**Agent MUST do BOTH:**

### 1. Update Linear Issue

```
Status: "In Review" (ready for QA)
Comment:
---
## Implementation Complete

**Branch**: feature/[STORY-ID]-desc
**Coverage**: XX%
**Tests**: XX passing

### Acceptance Criteria Status
- [x] AC1: [description] ✅
- [x] AC2: [description] ✅
- [x] AC3: [description] ✅
- [x] AC4: [description] ✅

### Files Changed
| File | Change |
|------|--------|
| [file] | Created |

### Ready for QA validation
---
```

### 2. Update PM Inbox

```markdown
# [Agent] → PM: [STORY-ID] Ready for QA

**Linear Issue**: [URL]
**Branch**: feature/[STORY-ID]-desc

## Summary
[Brief summary]

## Linear Status
- Issue updated to: "In Review"
- Comment added with implementation details

## Test Results
- Tests: XX passing
- Coverage: XX%

## Next Step
→ Route to QA for validation

---
**[Agent Name]**
```

---

# PHASE 5: QA UPDATES LINEAR

## When QA Validates

**QA Agent MUST update Linear:**

### If Approved
```
Status: Keep "In Review"
Comment:
---
## QA Validation: ✅ APPROVED

**Validated by**: QA Agent
**Date**: YYYY-MM-DD

### Test Results
- All tests passing
- Coverage: XX% (≥80%)
- TypeScript: Clean
- Linter: Clean

### Acceptance Criteria Verified
- [x] AC1: Verified ✅
- [x] AC2: Verified ✅
- [x] AC3: Verified ✅
- [x] AC4: Verified ✅

### Recommendation
Ready for PM merge approval.
---
```

### If Blocked
```
Status: "In Progress" (sent back)
Comment:
---
## QA Validation: ❌ BLOCKED

**Blocked by**: QA Agent
**Date**: YYYY-MM-DD

### Issues Found
1. [Issue description]
2. [Issue description]

### Coverage Gap
- Current: XX%
- Required: 80%
- Missing: [areas]

### Required Actions
- [ ] Fix issue 1
- [ ] Fix issue 2
- [ ] Add tests for [area]

Returning to [Agent] for fixes.
---
```

---

# PHASE 6: PM CLOSES IN LINEAR

## When Merging to Main

**PM Agent MUST update Linear:**

```
Status: "Done"
Labels: Add "gate-5-deploy", Remove "gate-X-*"
Comment:
---
## Merged to Main ✅

**Merged by**: PM Agent
**Date**: YYYY-MM-DD
**Commit**: [hash]
**Tag**: story/[STORY-ID]-complete

### Final Status
- All 6 safety gates passed
- Coverage: XX%
- QA Approved: ✅
- PM Approved: ✅

### Definition of Done
- [x] All acceptance criteria met
- [x] Code reviewed
- [x] Tests passing
- [x] Coverage ≥80%
- [x] TypeScript clean
- [x] Linter clean
- [x] QA validated
- [x] PM approved
- [x] Merged to main
- [x] Tagged

This issue is complete.
---
```

---

# LINEAR LABELS

## Gate Labels (Mutually Exclusive)

| Label | Color | Meaning |
|-------|-------|---------|
| `gate-0-research` | Gray | CTO research required |
| `gate-1-plan` | Blue | Planning phase |
| `gate-2-build` | Amber | Implementation in progress |
| `gate-3-test` | Purple | QA validation |
| `gate-4-review` | Pink | PM review |
| `gate-5-deploy` | Green | Merged/Complete |

## Agent Labels

| Label | Meaning |
|-------|---------|
| `agent-cto` | Assigned to CTO |
| `agent-pm` | PM handling |
| `agent-qa` | QA validating |
| `agent-backend-1` | Backend-1 implementing |
| `agent-backend-2` | Backend-2 implementing |
| `agent-frontend-a` | Frontend-A implementing |
| `agent-frontend-b` | Frontend-B implementing |

## Status Labels

| Label | Meaning |
|-------|---------|
| `blocked` | Blocked by dependency |
| `needs-research` | Needs Gate 0 research |
| `needs-clarification` | Waiting for clarification |

---

# VALIDATION CHECKLIST

## Before Starting Work
- [ ] Linear issue ID received from PM inbox
- [ ] Full Linear story fetched and read
- [ ] Linear Story Confirmation output displayed
- [ ] All acceptance criteria understood
- [ ] All test scenarios documented
- [ ] START.md created from Linear details

## During Work
- [ ] Linear status updated to "In Progress"
- [ ] Progress comments added at 50%
- [ ] Linear updated when blocked/unblocked

## After Completing Work
- [ ] Linear status updated to "In Review"
- [ ] Implementation summary comment added
- [ ] All AC status documented in Linear
- [ ] PM inbox updated with Linear URL
- [ ] QA inbox includes Linear reference

## After Merge
- [ ] Linear status updated to "Done"
- [ ] Final summary comment added
- [ ] Gate-5-deploy label applied
- [ ] Issue closed

---

# INTEGRATION WITH VALIDATION PROTOCOL

## Updated Startup Sequence

Add to mandatory startup:

```
STEP 6: Fetch Linear Story (if assigned)
STEP 7: Output Linear Story Confirmation
STEP 8: Verify Linear details match inbox assignment
```

## Updated Safety Banner

```
╔══════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE                                      ║
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM                     ║
║  ✅ Safety Gates: 0→1→2→3→4→5                                    ║
║  ✅ TDD: Tests First | 80%+ Coverage                             ║
║  ✅ Linear-First: Read Linear → Work → Update Linear             ║
║  📋 Linear: [ID] | Gate: [N] | Branch: [name]                    ║
╚══════════════════════════════════════════════════════════════════╝
```

---

**LINEAR IS THE SOURCE OF TRUTH. NO EXCEPTIONS.**

---

*Linear-First Protocol v1.0*
*Last Updated: 2025-12-19*
