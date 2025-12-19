# Mandatory Safety Framework - Footprint

**Version**: 2.0
**Status**: ENFORCED
**Last Updated**: 2025-12-19

---

## Safety Protocol Banner

**EVERY agent MUST display this banner at the START of EVERY response:**

```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review -> 5-Deploy  |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Story: [STORY-ID] | Gate: [X] | Branch: [feature/STORY-ID-desc]     |
+======================================================================+
```

**NO WORK WITHOUT THIS BANNER. NO EXCEPTIONS.**

---

## The 6 Safety Gates

### Gate 0: Research (CTO Enforced)

**When Required**:
- Any external API integration (Replicate, Stripe, R2)
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

**Footprint Gate 0 Triggers**:
- Replicate AI model changes
- Stripe payment flow changes
- New cloud storage patterns
- Auth session changes

---

### Gate 1: Planning

**Requirements**:
```bash
# 1. Create feature branch
git checkout -b feature/STORY-ID-description

# 2. Create milestone files (MANDATORY)
mkdir -p .claudecode/milestones/sprint-N/STORY-ID/
cp .claudecode/templates/TEMPLATE-START.md .claudecode/milestones/sprint-N/STORY-ID/START.md
cp .claudecode/templates/TEMPLATE-ROLLBACK-PLAN.md .claudecode/milestones/sprint-N/STORY-ID/ROLLBACK-PLAN.md

# 3. Tag starting point
git tag STORY-ID-start
```

**BLOCK MERGE IF MISSING**: START.md, ROLLBACK-PLAN.md, or start tag.

---

### Gate 2: Implementation (TDD)

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

---

### Gate 3: Testing (QA)

**Coverage Requirements**:
| Area | Minimum | Target |
|------|---------|--------|
| Overall | 80% | 90% |
| Services (`lib/api/`) | 100% | 100% |
| Hooks (`hooks/`) | 90% | 95% |
| Stores (`stores/`) | 90% | 95% |
| Utils (`lib/`) | 100% | 100% |
| Components (`components/`) | 80% | 85% |

**Commands**:
```bash
npm test                  # Run tests
npm test -- --coverage    # With coverage
```

---

### Gate 4: Review

**Checklist**:
- [ ] TypeScript strict mode clean (`npm run type-check`)
- [ ] Linter clean (`npm run lint`)
- [ ] No `any` types
- [ ] Proper error handling
- [ ] No hardcoded secrets
- [ ] Proper loading states
- [ ] Proper error states
- [ ] QA Agent approval

---

### Gate 5: Deployment

**Requirements**:
1. All gates 0-4 passed
2. COMPLETION.md created
3. Git tag created: `story/STORY-ID-complete`
4. PM approval
5. Merged to main/develop

---

## Enforcement

PM Agent will BLOCK merges that:
- Skip any gate
- Have coverage < 80%
- Missing START.md or ROLLBACK-PLAN.md
- Missing QA approval
- Agent didn't display Safety Protocol Banner

---

## Anti-Patterns (DON'T DO)

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| Skip Gate 0 for APIs | Leads to security issues, rework |
| No tests | Bugs in production |
| Coverage < 80% | Untested code paths |
| Direct handoffs | Lost context, PM not tracking |
| Merge without QA | Quality issues |
| Missing rollback plan | Can't recover from failures |
| No safety banner | Not following protocol |

---

**THIS FRAMEWORK IS PERMANENT. NO EXCEPTIONS.**
