# Mandatory Safety Framework - Ringz.io

**Version**: 2.1
**Status**: Active
**Enforcement**: All sprints, all stories, no exceptions

---

## Core Rules

```
RULE 1: EVERY story MUST pass through 6 safety gates.
RULE 2: EVERY agent MUST confirm compliance before starting work.
NO shortcuts. NO exceptions.
```

---

## 🚨 MANDATORY COMPLIANCE BANNER

**EVERY agent MUST display this banner at the START of EVERY response:**

```
╔══════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE                                      ║
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM                     ║
║  ✅ Safety Gates: 0-Research → 1-Plan → 2-Build → 3-Test → 4-Review → 5-Deploy  ║
║  ✅ TDD: Tests First | 80%+ Coverage Required                    ║
║  📋 Story: [RZ-XXX] | Gate: [X] | Branch: [feature/RZ-XXX-desc]  ║
╚══════════════════════════════════════════════════════════════════╝
```

**This banner MUST appear before ANY work is done.**

### Banner Requirements

1. **Always visible** - First thing in every agent response
2. **Story tracking** - Shows current story ID
3. **Gate tracking** - Shows current gate (0-5)
4. **Branch tracking** - Shows feature branch name

### Example Agent Response

```markdown
╔══════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE                                      ║
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM                     ║
║  ✅ Safety Gates: 0-Research → 1-Plan → 2-Build → 3-Test → 4-Review → 5-Deploy  ║
║  ✅ TDD: Tests First | 80%+ Coverage Required                    ║
║  📋 Story: RZ-005 | Gate: 2 | Branch: feature/RZ-005-balance     ║
╚══════════════════════════════════════════════════════════════════╝

## Work Summary

[Agent's actual work here...]
```

**If milestone files don't exist, agent MUST create them BEFORE any implementation.**

---

---

## Safety Gates

### Gate 0: Research (CTO Enforced)

**When Required**:
- Twilio API integration
- OpenAI/ElevenLabs integration
- Payment processing (RevenueCat, dLocal)
- Auth patterns
- Any security-sensitive feature

**Requirements**:
- Research best practices
- Document in `.claudecode/research/YYYYMMDD-[topic].md`
- Get CTO approval

---

### Gate 1: Planning

**Requirements**:
```bash
# 1. Create feature branch
git checkout -b feature/RZ-XXX-description

# 2. Create milestone files
mkdir -p .claudecode/milestones/sprint-N/RZ-XXX/
touch .claudecode/milestones/sprint-N/RZ-XXX/START.md
touch .claudecode/milestones/sprint-N/RZ-XXX/ROLLBACK-PLAN.md
```

**START.md Template**:
```markdown
# RZ-XXX: [Title]

**Started**: YYYY-MM-DD
**Agent**: [Agent Name]
**Branch**: feature/RZ-XXX-description

## Scope
- Item 1
- Item 2

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Files to Change
| File | Action |
|------|--------|
| path/to/file | Create/Modify |
```

**ROLLBACK-PLAN.md Template**:
```markdown
# Rollback Plan: RZ-XXX

## Scenarios

### 1. Tests Fail
```bash
git checkout develop
git branch -D feature/RZ-XXX-description
```

### 2. Partial Implementation
```bash
git revert [commit-hash]
```

### 3. Breaking Change Found
```bash
git reset --hard [safe-commit]
```

## Rollback Time: <30 minutes
```

---

### Gate 2: Implementation (TDD)

**Requirements**:
1. Write tests FIRST
2. Run tests (RED)
3. Implement minimum code
4. Run tests (GREEN)
5. Refactor
6. Commit atomically (30-90 min chunks)

**Commit Format**:
```
feat(scope): description

- Detail 1
- Detail 2

Tests: X passing
Coverage: XX%
```

---

### Gate 3: Testing (QA)

**Coverage Requirements**:
| Area | Minimum |
|------|---------|
| Overall | 80% |
| Services | 100% |
| Hooks | 90% |
| Stores | 90% |
| Utils | 100% |
| Components | 80% |

**Commands**:
```bash
npm test -- --coverage
```

---

### Gate 4: Review

**Checklist**:
- [ ] TypeScript strict mode clean
- [ ] ESLint clean
- [ ] No `any` types
- [ ] Proper error handling
- [ ] No hardcoded secrets
- [ ] Proper loading states
- [ ] Proper error states

---

### Gate 5: Deployment

**Requirements**:
1. All gates 0-4 passed
2. COMPLETION.md created
3. Git tag created
4. PM approval

**COMPLETION.md Template**:
```markdown
# RZ-XXX: [Title] - COMPLETE

**Completed**: YYYY-MM-DD
**Agent**: [Agent Name]

## Summary
Brief description of what was implemented.

## Files Changed
| File | Change |
|------|--------|
| path/to/file | Description |

## Test Results
- Tests: XX passing
- Coverage: XX%

## Verification
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] QA approved

## Tag
`story/RZ-XXX-complete`
```

---

## Workflow 2.0 Enforcement

```
CTO Decision → PM Orchestration → Agent Execution → QA Validation → PM Merge
```

**Rules**:
- ❌ CTO NEVER assigns directly to devs
- ❌ Devs NEVER hand off to each other
- ❌ Code NEVER merges without QA
- ✅ ALL work routes through PM

---

## Anti-Patterns (DON'T DO)

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| Skip Gate 0 | Leads to rework |
| No tests | Bugs in production |
| Coverage <80% | Untested code |
| Direct handoffs | Lost context |
| Merge without QA | Quality issues |

---

## Enforcement

PM Agent will BLOCK merges that:
- Skip any gate
- Have coverage <80%
- Missing milestone files
- Missing QA approval

---

**This framework is PERMANENT. NO EXCEPTIONS.**
