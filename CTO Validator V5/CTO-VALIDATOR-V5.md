# CTO VALIDATOR V5 - COMPLETE ARCHITECTURE VALIDATION SYSTEM

## Pre-Pipeline Validation for Workflow V4.3 Multi-Agent Compliance

**Version:** 5.0  
**Date:** January 2026  
**Aligns With:** Workflow V4.3 + AI Planning Framework V2.0 + Planning Gates PG-1→PG-5  
**Purpose:** Validate ALL documentation before multi-agent execution begins

---

## WHAT'S NEW IN V5

| Feature | V4 | V5 |
|---------|----|----|
| Document Completeness | ✅ | ✅ Enhanced |
| Cross-Document Consistency | ⚠️ Partial | ✅ Complete |
| **Planning Gate Alignment (PG-1→PG-5)** | ❌ | 🆕 **MANDATORY** |
| **Execution Gate Readiness (G0→G8)** | ❌ | 🆕 **MANDATORY** |
| **Contract Registry Validation** | ❌ | 🆕 **MANDATORY** |
| **EARS Criteria Validation** | ❌ | 🆕 **MANDATORY** |
| **Multi-Agent Ownership Validation** | ❌ | 🆕 **MANDATORY** |
| **Best Practices Research** | ❌ | 🆕 **WITH WEB SEARCH** |
| Workflow V4.3 Compliance | ❌ | ✅ Complete |

---

## PART 1: VALIDATION CHECKLIST (78 CHECKS)

### Section A: Core Documentation (12 Checks)

```
[ ] A1: PRD exists and has executive summary
[ ] A2: PRD has user personas (3+ defined with needs)
[ ] A3: PRD has functional requirements per module
[ ] A4: PRD has data models (TypeScript interfaces or schema)
[ ] A5: PRD has tech stack specification with rationale
[ ] A6: PRD has security requirements
[ ] A7: PRD has MVP scope (IN/OUT lists)
[ ] A8: PRD has success metrics with targets
[ ] A9: Technical Architecture document exists
[ ] A10: Business Logic document exists with state machines
[ ] A11: User Stories document exists (Gherkin/EARS format)
[ ] A12: Design System document exists and is LOCKED
```

### Section B: Planning Gate PG-1 - PRD Analysis (8 Checks)

```
[ ] B1: Domains extracted from PRD
[ ] B2: Each domain has ownership paths (FE + BE)
[ ] B3: Features mapped to domains
[ ] B4: Screen inventory complete
[ ] B5: Screens mapped to mockups
[ ] B6: User journeys documented
[ ] B7: No orphaned screens (all screens have features)
[ ] B8: No orphaned features (all features have stories)
```

### Section C: Planning Gate PG-2 - Contract Registry (10 Checks)

```
[ ] C1: /contracts/entities/ directory exists
[ ] C2: /contracts/api/ directory exists
[ ] C3: registry.json exists and is complete
[ ] C4: All entity contracts have @source citations
[ ] C5: All entity contracts have @confidence ratings
[ ] C6: All API contracts have request/response types
[ ] C7: All API contracts have error codes defined
[ ] C8: Contracts match PRD data models
[ ] C9: Contracts match database schema
[ ] C10: No circular dependencies between contracts
```

### Section D: Planning Gate PG-3 - Story Completeness (12 Checks)

```
[ ] D1: Stories exist in AI-ready JSON format
[ ] D2: Each story has unique ID (DOMAIN-TYPE-NNN)
[ ] D3: Each story has domain assignment
[ ] D4: Each story has agent assignment (fe-dev, be-dev)
[ ] D5: Each story has wave assignment
[ ] D6: Each story has CONTENT_REQUIREMENTS
[ ] D7: Each story has acceptance_criteria array
[ ] D8: Each AC has EARS pattern (event-driven, state-driven, unwanted)
[ ] D9: Each AC has measurable threshold
[ ] D10: Each story has files.create array
[ ] D11: Each story has files.forbidden array
[ ] D12: Each story has contracts_referenced array
```

### Section E: Planning Gate PG-4 - Story Linting (6 Checks)

```
[ ] E1: Story linter installed and configured
[ ] E2: All stories pass schema validation
[ ] E3: All stories score ≥95% completeness
[ ] E4: No stories have undefined contract references
[ ] E5: No stories have files outside domain ownership
[ ] E6: All stories have safety.max_iterations defined
```

### Section F: Planning Gate PG-5 - Scheduling (8 Checks)

```
[ ] F1: Wave assignments complete for all stories
[ ] F2: Dependencies mapped between stories
[ ] F3: No circular dependencies between stories
[ ] F4: Cross-wave dependencies resolved (earlier wave first)
[ ] F5: No file conflicts within same wave
[ ] F6: FE/BE parallel execution validated
[ ] F7: Critical path identified
[ ] F8: Estimated duration calculated
```

### Section G: Gate 0 Readiness - CTO Research (6 Checks)

```
[ ] G1: Architecture decisions documented with rationale
[ ] G2: Tech stack validated against best practices
[ ] G3: Database schema complete with indexes
[ ] G4: Security model defined (auth, RLS, permissions)
[ ] G5: Integration points documented (payments, email, SMS)
[ ] G6: Risks identified with mitigations
```

### Section H: Gate 2 Readiness - Dev Building (6 Checks)

```
[ ] H1: Domain ownership paths defined per agent
[ ] H2: File naming conventions documented
[ ] H3: Component structure defined
[ ] H4: API endpoint patterns defined
[ ] H5: Test file conventions defined
[ ] H6: CLAUDE.md agent instructions complete
```

### Section I: Gate 4 Readiness - QA Validation (5 Checks)

```
[ ] I1: All acceptance criteria are testable
[ ] I2: All thresholds are measurable (ms, %, count)
[ ] I3: Error scenarios defined
[ ] I4: Edge cases documented
[ ] I5: Security test cases defined
```

### Section J: Gate 6-8 Readiness - CI/CD & Deploy (5 Checks)

```
[ ] J1: CI/CD requirements defined (lint, type, test, build)
[ ] J2: Coverage threshold defined (≥80%)
[ ] J3: Environment variables documented
[ ] J4: Deployment target configured (Vercel, etc.)
[ ] J5: Monitoring/alerting plan exists
```

---

## PART 2: CROSS-DOCUMENT CONSISTENCY VALIDATION

### 2.1 PRD ↔ Contracts Alignment

```
[ ] PRD data models match contract interfaces
[ ] PRD validation rules match contract validation
[ ] PRD enums match contract type unions
[ ] PRD API endpoints match API contracts
[ ] PRD error codes match contract error types
```

### 2.2 PRD ↔ Business Logic Alignment

```
[ ] PRD entities have state machines in Business Logic
[ ] PRD calculations documented in Business Logic
[ ] PRD business rules have guard conditions
[ ] PRD workflows have transition definitions
```

### 2.3 PRD ↔ User Stories Alignment

```
[ ] All PRD features have corresponding stories
[ ] Story acceptance criteria match PRD requirements
[ ] Story points cover full PRD scope
[ ] Story priorities match PRD MoSCoW
```

### 2.4 Contracts ↔ Database Schema Alignment

```
[ ] All contract entities have database tables
[ ] Contract field types match database column types
[ ] Contract enums match database enums
[ ] Contract relationships match foreign keys
```

### 2.5 Design System ↔ Implementation Alignment

```
[ ] Design tokens defined (colors, typography, spacing)
[ ] Tailwind config matches Design System
[ ] Component specifications exist
[ ] Responsive breakpoints defined
```

### 2.6 Naming Consistency Check

```
[ ] Entity names consistent across all documents
[ ] Enum values consistent across all documents
[ ] API endpoint names consistent
[ ] Status/state names consistent
[ ] No conflicting terminology (e.g., "Basic" vs "Professional")
```

---

## PART 3: BEST PRACTICES VALIDATION (WITH WEB SEARCH)

### 3.1 Tech Stack Validation

**Instructions:** Use web search to validate each technology choice against current best practices.

```
[ ] Database choice appropriate for use case
[ ] Backend framework follows current standards
[ ] Frontend framework version is current/LTS
[ ] Auth approach follows security best practices
[ ] Payment integration follows PCI compliance
[ ] File storage approach is scalable
```

### 3.2 Architecture Pattern Validation

```
[ ] State machine design follows industry patterns
[ ] API design follows REST/GraphQL best practices
[ ] Database indexing strategy is sound
[ ] Caching strategy defined (if needed)
[ ] Real-time approach appropriate (if needed)
```

### 3.3 Security Validation

```
[ ] Authentication follows OWASP guidelines
[ ] Authorization model is sound (RBAC/ABAC)
[ ] Data protection requirements met
[ ] Input validation approach defined
[ ] Rate limiting planned
```

---

## PART 4: MULTI-AGENT VALIDATION

### 4.1 Agent Ownership Validation

| Agent | Domain | Allowed Paths | Forbidden Paths |
|-------|--------|---------------|-----------------|
| CTO | All | Read all, write contracts | Production config |
| PM | All | Stories, docs | Code files |
| FE Dev | Frontend | src/app/**, src/components/** | src/lib/core/**, api/** |
| BE Dev | Backend | src/app/api/**, supabase/** | src/components/** |
| QA | Testing | tests/**, *.test.ts | Source code |

```
[ ] Each agent has defined ownership paths
[ ] No overlapping write permissions
[ ] Forbidden paths explicitly listed
[ ] Domain boundaries prevent conflicts
```

### 4.2 Signal File Validation

```
[ ] .claude/ directory structure defined
[ ] Signal file naming convention documented
[ ] Gate transition signals defined
[ ] Notification triggers mapped
```

### 4.3 Model Assignment Validation

| Gate | Model | Rationale |
|------|-------|-----------|
| G0 | Opus | Complex architecture decisions |
| G1 | Opus | Planning requires reasoning |
| G2 | Sonnet | Code generation efficiency |
| G3 | Sonnet | Self-test execution |
| G4 | Haiku | Fast validation checks |
| G4.5 | Sonnet | Fix implementation |
| G5 | Opus | Review requires judgment |
| G6 | Haiku | CI/CD automation |
| G7 | Opus | Merge decision |
| G8 | PM | Deploy oversight |

```
[ ] Model assignments documented per gate
[ ] Token budgets defined per gate
[ ] Cost estimates calculated
```

---

## PART 5: GAP ANALYSIS TEMPLATE

### 5.1 Gap Severity Levels

| Level | Definition | Action |
|-------|------------|--------|
| 🔴 **CRITICAL** | Blocks pipeline execution | Must fix before any development |
| 🟠 **HIGH** | Will cause agent failures | Fix in Sprint 0 |
| 🟡 **MEDIUM** | May cause rework | Fix in Sprint 1 |
| 🟢 **LOW** | Quality improvement | Fix when convenient |

### 5.2 Gap Documentation Template

| # | Gap Description | Severity | Document | Section | Remediation | Owner | Due |
|---|-----------------|----------|----------|---------|-------------|-------|-----|
| 1 | | | | | | | |
| 2 | | | | | | | |

---

## PART 6: VALIDATION REPORT TEMPLATE

```markdown
# CTO Validation Report V5

## Project: [PROJECT NAME]
## Date: [DATE]
## Validator: Claude CTO Validator V5

---

## Executive Summary

[2-3 sentence summary of findings]

**Overall Score:** XX/100  
**Certification Status:** [CERTIFIED / CONDITIONAL / REVISION NEEDED / NOT CERTIFIED]

---

## Section Scores

| Section | Checks | Passed | Score |
|---------|--------|--------|-------|
| A: Core Documentation | 12 | X | X% |
| B: PG-1 PRD Analysis | 8 | X | X% |
| C: PG-2 Contract Registry | 10 | X | X% |
| D: PG-3 Story Completeness | 12 | X | X% |
| E: PG-4 Story Linting | 6 | X | X% |
| F: PG-5 Scheduling | 8 | X | X% |
| G: Gate 0 Readiness | 6 | X | X% |
| H: Gate 2 Readiness | 6 | X | X% |
| I: Gate 4 Readiness | 5 | X | X% |
| J: Gate 6-8 Readiness | 5 | X | X% |
| **TOTAL** | **78** | **X** | **X%** |

---

## Cross-Document Consistency

| Check | Status |
|-------|--------|
| PRD ↔ Contracts | ✅/⚠️/❌ |
| PRD ↔ Business Logic | ✅/⚠️/❌ |
| PRD ↔ User Stories | ✅/⚠️/❌ |
| Contracts ↔ Database | ✅/⚠️/❌ |
| Design System ↔ Implementation | ✅/⚠️/❌ |
| Naming Consistency | ✅/⚠️/❌ |

---

## Best Practices Validation

| Area | Finding | Evidence Source |
|------|---------|-----------------|
| Tech Stack | | |
| Architecture | | |
| Security | | |

---

## Critical Gaps (Must Fix)

| # | Gap | Severity | Remediation |
|---|-----|----------|-------------|
| 1 | | 🔴 CRITICAL | |
| 2 | | 🔴 CRITICAL | |

---

## High Priority Gaps (Fix in Sprint 0)

| # | Gap | Severity | Remediation |
|---|-----|----------|-------------|
| 1 | | 🟠 HIGH | |
| 2 | | 🟠 HIGH | |

---

## Certification Decision

### Status: [CERTIFIED / CONDITIONAL / REVISION NEEDED / NOT CERTIFIED]

| Score Range | Status | Meaning |
|-------------|--------|---------|
| 90-100 | ✅ CERTIFIED | Ready for multi-agent execution |
| 80-89 | ⚠️ CONDITIONAL | Fix critical gaps, then proceed |
| 70-79 | 🔄 REVISION NEEDED | Address all high gaps before development |
| <70 | ❌ NOT CERTIFIED | Major rework required |

### Conditions for Proceeding (if CONDITIONAL):

1. [ ] [Condition 1]
2. [ ] [Condition 2]
3. [ ] [Condition 3]

---

## Next Steps

1. [Action 1]
2. [Action 2]
3. [Action 3]

---

## Appendix: Detailed Checklist Results

[Full checklist with individual PASS/FAIL]
```

---

## PART 7: CTO VALIDATOR PROMPT

Copy this prompt into a **new Claude session** to run the validation:

```markdown
# CTO Validator V5 Activation

You are a CTO Validator performing an independent architecture audit. Your role is to critically examine whether the project documentation is complete, consistent, and ready for multi-agent execution under Workflow V4.3.

## Your Validation Mandate

1. **Be Critical** - Assume nothing is correct until verified
2. **Check Evidence** - Every claim must have supporting documentation
3. **Score Objectively** - Use the rubrics provided
4. **Flag Gaps** - Document every missing or incomplete item
5. **Research Best Practices** - Use web search to validate tech decisions
6. **Provide Remediation** - For each issue, suggest the fix

## Pipeline Context

You are validating readiness for:

**Planning Gates (PG-1 → PG-5):**
- PG-1: PRD Analysis (domains, features, screens)
- PG-2: Contract Registry (TypeScript interfaces)
- PG-3: Story Drafting (AI-ready JSON)
- PG-4: Story Linting (score ≥95%)
- PG-5: Scheduling (waves, dependencies)

**Execution Gates (G0 → G8):**
- G0: CTO Research (Opus) - Architecture approval
- G0.5: Workspace Validator - Domain boundaries
- G1: PM Planning (Opus) - Story breakdown
- G2: Dev Building (Sonnet) - FE + BE parallel
- G3: Self-Test (Sonnet) - Validation report
- G4: QA Validation (Haiku) - Acceptance criteria
- G4.5: Dev Fix (Sonnet) - Retry loop
- G5: PM Review (Opus) - Merge approval
- G6: CI/CD (Haiku) - Automated checks
- G7: Domain CTO (Opus) - Final approval
- G8: Deploy (PM) - Production release

**Agents:**
- CTO Agent (Opus) - Architecture, contracts, approvals
- PM Agent (Opus) - Planning, reviews, deploy
- FE Dev Agent (Sonnet) - Frontend code
- BE Dev Agent (Sonnet) - Backend code
- QA Agent (Haiku) - Testing, validation

## Validation Process

### Step 1: Document Inventory
List all provided files and map to required documents:
- PRD
- Technical Architecture
- Business Logic
- User Stories
- Design System
- Entity Contracts
- API Contracts
- Database Schema
- CLAUDE.md

### Step 2: Section-by-Section Validation
Run through the 78-check validation checklist.
Score each section.

### Step 3: Cross-Document Consistency
Verify alignment between documents.
Flag any conflicts or inconsistencies.

### Step 4: Best Practices Research
Use web search to validate:
- Tech stack choices
- Architecture patterns
- Security approach

### Step 5: Gap Analysis
Compile all gaps with severity levels.
Provide remediation for each.

### Step 6: Generate Report
Use the report template.
Calculate final score.
Determine certification status.

## Output Format

Produce a complete CTO Validation Report following the template in Part 6.

## Begin Validation

Please provide the project files to audit. I will:
1. Inventory all documents
2. Run the 78-check validation
3. Verify cross-document consistency
4. Research best practices
5. Identify and prioritize gaps
6. Generate certification decision

Ready to validate.
```

---

## PART 8: QUICK VALIDATION COMMANDS

Use these commands in the validator session:

**Full Audit:**
```
Run complete CTO V5 validation audit on the provided files.
Use web search to validate tech stack against best practices.
Generate full report with certification decision.
```

**Planning Gates Only:**
```
Validate only Planning Gates PG-1 through PG-5.
Check PRD analysis, contracts, stories, linting, scheduling.
```

**Execution Readiness Only:**
```
Validate readiness for Execution Gates G0 through G8.
Focus on agent ownership, signal files, model assignments.
```

**Cross-Document Consistency Only:**
```
Check consistency between PRD, Contracts, Business Logic, and Stories.
Flag any naming conflicts or misalignments.
```

**Gap Analysis Only:**
```
Identify all gaps across all documents.
Categorize by severity (Critical, High, Medium, Low).
Provide remediation steps for each.
```

---

## PART 9: CERTIFICATION THRESHOLDS

### Score Calculation

| Category | Weight | Max Points |
|----------|--------|------------|
| Core Documentation (A) | 15% | 12 |
| PG-1 PRD Analysis (B) | 10% | 8 |
| PG-2 Contracts (C) | 15% | 10 |
| PG-3 Stories (D) | 15% | 12 |
| PG-4 Linting (E) | 5% | 6 |
| PG-5 Scheduling (F) | 10% | 8 |
| G0 Readiness (G) | 10% | 6 |
| G2 Readiness (H) | 5% | 6 |
| G4 Readiness (I) | 5% | 5 |
| G6-8 Readiness (J) | 5% | 5 |
| Cross-Document Consistency | 5% | 6 |
| **TOTAL** | **100%** | **84** |

### Certification Levels

| Score | Status | Action |
|-------|--------|--------|
| **90-100%** | ✅ **CERTIFIED** | Proceed with multi-agent execution |
| **80-89%** | ⚠️ **CONDITIONAL** | Fix critical gaps, then proceed |
| **70-79%** | 🔄 **REVISION NEEDED** | Major gaps must be addressed |
| **<70%** | ❌ **NOT CERTIFIED** | Significant rework required |

### Automatic Blockers (Fail regardless of score)

These items cause automatic NOT CERTIFIED status:

1. ❌ PRD does not exist
2. ❌ No contracts defined
3. ❌ No user stories exist
4. ❌ Critical naming conflicts between documents
5. ❌ No domain ownership defined for agents
6. ❌ Security requirements completely missing
7. ❌ Payment/escrow legal issues unresolved (if applicable)

---

## PART 10: VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 5.0 | Jan 2026 | Full V4.3 alignment, Planning Gates, Multi-Agent validation |
| 4.0 | Dec 2025 | Added cross-document consistency |
| 3.0 | Nov 2025 | Added best practices research |
| 2.0 | Oct 2025 | Added contract validation |
| 1.0 | Sep 2025 | Initial release |

---

## SUMMARY

### CTO Validator V5 Key Features

1. **78 Validation Checks** across 10 sections
2. **Planning Gate Alignment** (PG-1 → PG-5)
3. **Execution Gate Readiness** (G0 → G8)
4. **Cross-Document Consistency** validation
5. **Best Practices Research** with web search
6. **Multi-Agent Ownership** validation
7. **Weighted Scoring** with certification thresholds
8. **Gap Analysis** with severity and remediation
9. **Report Template** for consistent output
10. **Fresh Session Prompt** for independent audit

### When to Use CTO Validator V5

- ✅ Before starting any new project
- ✅ Before Sprint 0 / first development sprint
- ✅ After major documentation changes
- ✅ After adding new domains or features
- ✅ Before onboarding new team members
- ✅ As part of architecture review process

### What CTO Validator V5 Does NOT Do

- ❌ Execute code or run tests
- ❌ Create missing documentation (only identifies gaps)
- ❌ Make business decisions (only flags for stakeholder)
- ❌ Replace human CTO judgment (augments it)

---

**Document Version:** 5.0  
**Created:** January 2026  
**Status:** Ready for Use  
**Compliance Target:** Workflow V4.3 + AI Planning Framework V2.0
