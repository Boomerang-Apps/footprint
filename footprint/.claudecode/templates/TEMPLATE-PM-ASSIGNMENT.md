# PM Assignment Template (Linear-First)

Use this template when assigning work to agents.

---

```markdown
# PM → [Agent]: [Story Title]

**From**: PM Agent
**To**: [Agent Name]
**Date**: YYYY-MM-DD

---

## 📋 LINEAR ISSUE (SOURCE OF TRUTH)

| Field | Value |
|-------|-------|
| **Issue ID** | [UZF-XXXX / RZ-XXX] |
| **URL** | https://linear.app/[workspace]/issue/[ID] |
| **Title** | [Full title from Linear] |
| **Status** | Todo → In Progress |
| **Priority** | [P0/P1/P2/P3] |
| **Estimate** | [X points] |
| **Labels** | agent-[name], gate-1-plan, sprint-[N] |

---

## ⚠️ MANDATORY: READ LINEAR FIRST

Before starting ANY work, you MUST:

1. **Fetch the full Linear issue** using:
   - Linear MCP: `mcp__linear-server__get_issue` with id: `[ISSUE-ID]`
   - OR visit the URL above

2. **Read ALL sections**:
   - User Story
   - Acceptance Criteria (Given/When/Then)
   - Technical Requirements
   - Test Scenarios with expected inputs/outputs
   - Definition of Done

3. **Output the Linear Story Confirmation** block

4. **Create START.md** from Linear details

---

## 📝 ASSIGNMENT SUMMARY

[Brief summary of what to implement - but Linear has the full details]

---

## ✅ ACCEPTANCE CRITERIA (from Linear)

The full acceptance criteria are in Linear. Key points:

- AC1: [Brief summary]
- AC2: [Brief summary]
- AC3: [Brief summary]
- AC4: [Brief summary]

**→ Read the FULL Given/When/Then criteria from Linear**

---

## 🧪 TEST SCENARIOS (from Linear)

Linear contains test scenarios with expected inputs/outputs:

| Test | Input | Expected Output |
|------|-------|-----------------|
| [Test 1] | [input] | [output] |

**→ Read the FULL test scenarios from Linear**

---

## 📁 FILES TO MODIFY

| File | Action | Notes |
|------|--------|-------|
| [path] | Create/Modify | [notes] |

---

## 🔄 WORKFLOW REQUIREMENTS

### Gate 1 (Before Implementation)
- [ ] Fetch and read FULL Linear issue
- [ ] Output Linear Story Confirmation
- [ ] Create branch: `feature/[STORY-ID]-description`
- [ ] Create START.md from Linear details
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create git tag: `[STORY-ID]-start`
- [ ] Update Linear status to "In Progress"
- [ ] Add Linear comment: "Started implementation"

### Gate 2 (Implementation)
- [ ] Write tests FIRST (TDD)
- [ ] Implement acceptance criteria
- [ ] Update Linear at 50% progress
- [ ] Achieve 80%+ coverage

### Gate 3 (Handoff)
- [ ] Update Linear status to "In Review"
- [ ] Add Linear comment with implementation summary
- [ ] Write to QA inbox with Linear URL
- [ ] Write to PM inbox confirming Linear updated

---

## 📤 HANDOFF WHEN COMPLETE

Write to BOTH:

### 1. Linear Issue
Update status and add implementation comment

### 2. QA Inbox (`.claudecode/handoffs/qa-inbox.md`)
```markdown
# [Agent] → QA: [STORY-ID] Ready for Validation

**Linear Issue**: [URL]
**Branch**: feature/[STORY-ID]-desc
**Coverage**: XX%

[Include summary and test results]
```

### 3. PM Inbox (`.claudecode/handoffs/pm-inbox.md`)
```markdown
# [Agent] → PM: [STORY-ID] Handed to QA

**Linear Issue**: [URL] - Updated to "In Review"
**Status**: Handed to QA for validation
```

---

## 🚫 DO NOT

- Start work without reading the FULL Linear issue
- Make assumptions about requirements not in Linear
- Complete work without updating Linear
- Hand off without Linear URL

---

**PM Agent**
*Linear is the source of truth*
```

---

## Quick Copy Template

```
# PM → [AGENT]: [STORY-ID] [Title]

**Linear Issue**: [URL]
**Status**: Todo → In Progress
**Priority**: [P0/P1/P2/P3]

## MANDATORY
1. Fetch FULL story from Linear: `mcp__linear-server__get_issue` id: "[ID]"
2. Read ALL acceptance criteria and test scenarios
3. Output Linear Story Confirmation
4. Update Linear when starting, at 50%, and when complete

## Summary
[Brief summary]

## Key Acceptance Criteria (see Linear for full details)
- AC1: [summary]
- AC2: [summary]

## Handoff
- Update Linear to "In Review"
- Write to QA inbox with Linear URL
- Write to PM inbox confirming Linear updated

---
**PM Agent**
```
