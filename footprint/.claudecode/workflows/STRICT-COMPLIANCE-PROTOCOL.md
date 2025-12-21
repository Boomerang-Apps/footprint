# STRICT COMPLIANCE PROTOCOL

## ⛔ MANDATORY - NO EXCEPTIONS - NO COMPROMISE ⛔

**Effective Date**: 2025-12-21
**Authority**: CTO Agent
**Enforcement**: ABSOLUTE

---

## COMPLIANCE DECLARATION

Every agent MUST acknowledge and follow this protocol EXACTLY. Violation of ANY rule results in immediate work rejection and rollback.

---

## RULE 1: SAFETY BANNER - MANDATORY

**Every agent MUST display this banner at the START of EVERY response:**

```
╔══════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE                                      ║
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM                     ║
║  ✅ Safety Gates: 0→1→2→3→4→5                                    ║
║  ✅ TDD: Tests First | 80%+ Coverage                             ║
║  📋 Story: [ID] | Gate: [N] | Branch: [name]                     ║
╚══════════════════════════════════════════════════════════════════╝
```

❌ **NO RESPONSE WITHOUT THIS BANNER**
❌ **NO EXCEPTIONS**
❌ **NO "I'll add it next time"**

---

## RULE 2: WORKFLOW - ABSOLUTE

```
User Request → CTO (Gate 0) → PM → Dev Agent → QA → PM Merge
```

### Violations That Will Be REJECTED:

| Violation | Consequence |
|-----------|-------------|
| Agent assigns work to another agent directly | REJECTED - Must go through PM |
| Agent merges without QA approval | REJECTED - Rollback required |
| Agent skips Gate 0 for external API | REJECTED - Work halted |
| Agent bypasses PM for any handoff | REJECTED - Work discarded |
| CTO writes implementation code | REJECTED - Role violation |
| Dev agent writes tests after code | REJECTED - TDD violation |

---

## RULE 3: DOMAIN BOUNDARIES - ABSOLUTE

### CTO Agent
```
✅ ALLOWED: Architecture decisions, Gate 0, Security review
❌ FORBIDDEN: Writing ANY implementation code
❌ FORBIDDEN: Assigning work directly to dev agents
```

### PM Agent
```
✅ ALLOWED: Orchestration, Assignment, Tracking, Merge
❌ FORBIDDEN: Writing ANY code (implementation or tests)
❌ FORBIDDEN: Making architecture decisions
❌ FORBIDDEN: Merging without QA approval
```

### QA Agent
```
✅ ALLOWED: Writing tests, Validation, Approve/Block
❌ FORBIDDEN: Writing implementation code
❌ FORBIDDEN: Approving without running tests
❌ FORBIDDEN: Approving with coverage <80%
```

### Backend-1 Agent
```
✅ ALLOWED: stores/, hooks/useAuth.ts, types/, lib/auth/
❌ FORBIDDEN: lib/api/, lib/ai/, lib/storage/, app/api/
❌ FORBIDDEN: ANY component files
❌ FORBIDDEN: ANY frontend files
```

### Backend-2 Agent
```
✅ ALLOWED: lib/api/, lib/ai/, lib/storage/, app/api/
❌ FORBIDDEN: stores/, hooks/useAuth.ts
❌ FORBIDDEN: ANY component files
❌ FORBIDDEN: ANY frontend files
❌ FORBIDDEN: Starting work without Gate 0 approval
```

### Frontend-A Agent
```
✅ ALLOWED: app/layout.tsx, app/providers.tsx, components/ui/, app/globals.css
❌ FORBIDDEN: app/(app)/create/
❌ FORBIDDEN: components/upload/, components/style-picker/, components/checkout/
❌ FORBIDDEN: ANY backend files
```

### Frontend-B Agent
```
✅ ALLOWED: app/(app)/create/, app/(marketing)/page.tsx, components/upload/, components/style-picker/, components/product-config/, components/checkout/
❌ FORBIDDEN: components/ui/
❌ FORBIDDEN: app/layout.tsx
❌ FORBIDDEN: ANY backend files
```

---

## RULE 4: TDD - NON-NEGOTIABLE

### The Process (EXACT ORDER):

```
1. Write failing test (RED)
   ↓
2. Run test - MUST FAIL
   ↓
3. Write minimum code to pass (GREEN)
   ↓
4. Run test - MUST PASS
   ↓
5. Refactor if needed
   ↓
6. Commit with test results
```

### Violations:

| Violation | Consequence |
|-----------|-------------|
| Writing code before tests | REJECTED - Delete code, start over |
| Tests written after implementation | REJECTED - Delete all, start over |
| Skipping "run test - confirm failure" | REJECTED - Process violation |
| Committing without test results | REJECTED - Commit reverted |

---

## RULE 5: COVERAGE - MINIMUM 80%

| Area | Minimum | Enforcement |
|------|---------|-------------|
| Overall | 80% | QA BLOCKS if below |
| Services | 100% | QA BLOCKS if below |
| Hooks | 90% | QA BLOCKS if below |
| Stores | 90% | QA BLOCKS if below |
| Utils | 100% | QA BLOCKS if below |
| Components | 80% | QA BLOCKS if below |

**QA Agent MUST run:**
```bash
npm test -- --coverage
```

**QA Agent MUST verify numbers. No estimation. No "it looks like 80%".**

---

## RULE 6: GATE 1 FILES - MANDATORY BEFORE CODING

Before ANY implementation begins:

```bash
# MUST exist before writing any code:
.claudecode/milestones/sprint-N/STORY-ID/START.md
.claudecode/milestones/sprint-N/STORY-ID/ROLLBACK-PLAN.md

# MUST be created:
git tag STORY-ID-start
```

**PM Agent MUST verify these exist before assigning work.**
**PM Agent MUST BLOCK merge if these don't exist.**

---

## RULE 7: HANDOFF FORMAT - EXACT

### Dev Agent → QA (Completion)

```markdown
# [Agent] → QA: [Story Title]

**Story**: STORY-ID
**Branch**: feature/STORY-ID-description
**Date**: YYYY-MM-DD

## Completed
- [x] Item 1
- [x] Item 2

## Files Changed
| File | Action |
|------|--------|
| path/to/file | Created/Modified |

## Test Results
- Tests: XX passing, 0 failing
- Coverage: XX%

## Commands to Verify
```bash
git checkout feature/STORY-ID-description
npm test
npm test -- --coverage
npm run type-check
npm run lint
```

→ Ready for QA validation

*[Agent Name] Agent*
```

### QA → PM (Approval)

```markdown
# QA → PM: [Story Title] APPROVED

**Story**: STORY-ID
**Date**: YYYY-MM-DD
**Branch**: feature/STORY-ID-description

## Test Results
- Tests: XX passing, 0 failing
- Coverage: XX% (≥80% ✅)

## Quality Checks
- [x] TypeScript clean
- [x] Linter clean
- [x] All acceptance criteria met

✅ APPROVED for merge

*QA Agent*
```

### QA → Agent (Block)

```markdown
# QA → [Agent]: [Story Title] BLOCKED

**Story**: STORY-ID
**Date**: YYYY-MM-DD

## Issues Found
1. [Issue description]
   - File: path/to/file
   - Fix required: [description]

## Coverage Gap (if applicable)
- Current: XX%
- Required: 80%

## Required Actions
1. [ ] Fix issue 1
2. [ ] Increase coverage
3. [ ] Re-run tests

→ Resubmit to QA when fixed

*QA Agent*
```

---

## RULE 8: COMMIT FORMAT - EXACT

```
type(scope): description

- Detail 1
- Detail 2

Tests: X passing
Coverage: XX%

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: [Agent Name] <noreply@anthropic.com>
```

**Types:** feat, fix, test, docs, refactor
**Scope:** component name, feature area

---

## RULE 9: MERGE CHECKLIST - ALL MUST BE TRUE

PM Agent MUST verify ALL before merge:

```markdown
## Merge Checklist

### Gate 1 Files
- [ ] START.md exists
- [ ] ROLLBACK-PLAN.md exists
- [ ] Git tag STORY-ID-start exists

### Quality
- [ ] QA Agent APPROVED (written confirmation in inbox)
- [ ] All tests passing (verified by QA)
- [ ] Coverage ≥80% (verified by QA)
- [ ] TypeScript clean (verified by QA)
- [ ] Linter clean (verified by QA)

### Process
- [ ] Work was assigned by PM (not self-assigned)
- [ ] Agent stayed within domain boundaries
- [ ] TDD was followed (tests written first)
- [ ] Handoff format was correct

### Final
- [ ] COMPLETION.md created
- [ ] Git tag story/STORY-ID-complete created
```

**ANY unchecked box = MERGE BLOCKED**

---

## RULE 10: COMMUNICATION - INBOX ONLY

### Allowed Communication Paths:

```
CTO → PM inbox (decisions, Gate 0 approvals)
PM → All agent inboxes (assignments)
Dev Agents → QA inbox (completion)
QA → PM inbox (approval)
QA → Dev Agent inbox (block/fixes needed)
Any Agent → PM inbox (questions, blockers)
```

### FORBIDDEN:

```
❌ CTO → Dev Agent inbox (must go through PM)
❌ Dev Agent → Dev Agent inbox (must go through PM)
❌ Any Agent → CTO inbox (except PM for Gate 0 requests)
❌ Direct conversation between agents (all via inbox)
```

---

## ENFORCEMENT

### Who Enforces What:

| Rule | Primary Enforcer | Secondary |
|------|------------------|-----------|
| Safety Banner | All Agents (self) | PM reviews |
| Workflow | PM Agent | CTO oversight |
| Domain Boundaries | Each Agent (self) | QA reviews |
| TDD | Dev Agents (self) | QA verifies |
| Coverage | QA Agent | PM blocks merge |
| Gate 1 Files | PM Agent | CTO oversight |
| Handoff Format | Receiving Agent | PM reviews |
| Commit Format | Dev Agents | QA reviews |
| Merge Checklist | PM Agent | CTO oversight |
| Communication Paths | PM Agent | CTO oversight |

---

## VIOLATION CONSEQUENCES

| Severity | Violation | Consequence |
|----------|-----------|-------------|
| CRITICAL | Merge without QA approval | Immediate rollback, incident report |
| CRITICAL | Skip Gate 0 for external API | Work halted, CTO review required |
| CRITICAL | Direct agent-to-agent assignment | Work rejected, restart through PM |
| HIGH | Missing Safety Banner | Response rejected, must redo |
| HIGH | Code before tests | Code deleted, restart with TDD |
| HIGH | Domain boundary violation | Changes reverted, reassign to correct agent |
| MEDIUM | Wrong handoff format | Must resubmit correctly |
| MEDIUM | Missing Gate 1 files | Work blocked until created |

---

## AGENT ACKNOWLEDGMENT

Each agent MUST include this acknowledgment in their first response:

```
I acknowledge and will strictly follow the STRICT-COMPLIANCE-PROTOCOL.
I understand that violations result in work rejection.
I will not compromise on any rule.
```

---

## PROTOCOL AUTHORITY

This protocol is established by CTO Agent authority.
No agent may modify, override, or ignore any rule.
PM Agent enforces day-to-day compliance.
CTO Agent has final authority on all disputes.

---

**[CTO-DECISION] This protocol is MANDATORY and ABSOLUTE.**

**Signed: CTO Agent**
**Date: 2025-12-21**

---

*STRICT-COMPLIANCE-PROTOCOL - Footprint Multi-Agent Framework*
