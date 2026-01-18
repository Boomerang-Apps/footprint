# CTO CODEBASE & DOCUMENTATION ANALYZER V2.0

## Strategic Assessment Tool for Existing Projects
### Analyzes BOTH Codebase AND Documentation

**Version:** 2.0  
**Date:** January 2026  
**Purpose:** Comprehensive analysis of code + docs, gap identification, actionable roadmap  
**Scope:** Documentation audit + Codebase inspection + Cross-validation

---

## WHAT THIS TOOL DOES

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                CTO CODEBASE & DOCUMENTATION ANALYZER V2.0                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  INPUTS                                                                         │
│  ──────                                                                         │
│  ┌─────────────────────┐          ┌─────────────────────┐                      │
│  │   DOCUMENTATION     │          │     CODEBASE        │                      │
│  │   ───────────────   │          │     ────────        │                      │
│  │   • PRD             │          │   • Source files    │                      │
│  │   • Architecture    │          │   • Package.json    │                      │
│  │   • Business Logic  │          │   • Config files    │                      │
│  │   • User Stories    │          │   • Database schema │                      │
│  │   • Contracts       │          │   • API routes      │                      │
│  │   • Design System   │          │   • Components      │                      │
│  └──────────┬──────────┘          └──────────┬──────────┘                      │
│             │                                 │                                 │
│             └────────────┬────────────────────┘                                 │
│                          ▼                                                      │
│  ANALYSIS ENGINE                                                                │
│  ───────────────                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  1. Documentation Audit    → What docs exist? Quality? Completeness?    │   │
│  │  2. Codebase Inspection    → Structure? Patterns? Tech stack? Health?   │   │
│  │  3. Cross-Validation       → Do docs match code? Gaps? Drift?           │   │
│  │  4. Best Practices Check   → Web search validation                      │   │
│  │  5. V4.3 Readiness         → Pipeline compatibility                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                          │                                                      │
│                          ▼                                                      │
│  OUTPUTS                                                                        │
│  ───────                                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │ Current State   │  │ Gap Analysis    │  │ Roadmap &       │                 │
│  │ Report          │  │ Register        │  │ Recommendations │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 1: ANALYSIS DIMENSIONS

### 1.1 Documentation Analysis

| Dimension | What We Check | Why It Matters |
|-----------|---------------|----------------|
| **Existence** | Does the document exist? | Can't build without specs |
| **Completeness** | Are all sections present? | Partial docs cause confusion |
| **Accuracy** | Does it reflect reality? | Stale docs mislead |
| **Consistency** | Does it align with other docs? | Conflicts cause rework |
| **Format Compliance** | Does it meet V4.3 standards? | Pipeline compatibility |

### 1.2 Codebase Analysis

| Dimension | What We Check | Why It Matters |
|-----------|---------------|----------------|
| **Structure** | Folder organization, naming | Maintainability |
| **Tech Stack** | Dependencies, versions | Security, compatibility |
| **Patterns** | Architecture patterns used | Consistency, scalability |
| **Quality** | Tests, types, linting | Reliability |
| **Security** | Auth, env vars, secrets | Risk mitigation |
| **Performance** | Bundle size, queries | User experience |

### 1.3 Cross-Validation Analysis

| Dimension | What We Check | Why It Matters |
|-----------|---------------|----------------|
| **Schema Match** | DB schema vs contracts vs PRD | Data integrity |
| **API Match** | Routes vs API contracts | Integration reliability |
| **Component Match** | Components vs design system | UI consistency |
| **Logic Match** | Code logic vs business rules | Business accuracy |
| **Coverage** | Features in code vs stories | Scope tracking |

---

## PART 2: CODEBASE INSPECTION PROTOCOL

### 2.1 Directory Structure Analysis

**Commands to Run:**
```bash
# Get project structure (2 levels deep)
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -100

# Or use tree if available
tree -L 3 -I 'node_modules|.git|dist|.next|coverage'

# Get folder structure
ls -la
ls -la src/
ls -la src/app/ 2>/dev/null || ls -la pages/ 2>/dev/null
ls -la src/components/ 2>/dev/null || ls -la components/ 2>/dev/null
```

**Expected Structure (Next.js App Router):**
```
project/
├── src/
│   ├── app/                    # Routes (App Router)
│   │   ├── (auth)/            # Auth route group
│   │   ├── (dashboard)/       # Dashboard route group
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   └── [domain]/         # Domain components
│   ├── lib/                   # Utilities
│   │   ├── supabase/         # Supabase client
│   │   ├── utils/            # Helper functions
│   │   └── hooks/            # Custom hooks
│   ├── types/                 # TypeScript types
│   └── styles/               # Global styles
├── supabase/
│   ├── migrations/           # Database migrations
│   └── functions/            # Edge functions
├── contracts/                 # TypeScript contracts
├── stories/                   # AI-ready stories
├── public/                    # Static assets
├── tests/                     # Test files
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── CLAUDE.md                  # Agent instructions
```

**Structure Assessment Checklist:**
```
[ ] Has clear separation of concerns
[ ] Follows framework conventions (Next.js App Router)
[ ] Domain-organized components
[ ] Centralized types/contracts
[ ] Database migrations present
[ ] Test directory exists
[ ] Config files at root
[ ] CLAUDE.md exists
```

### 2.2 Package.json Analysis

**Commands to Run:**
```bash
# View package.json
cat package.json

# Check for outdated packages
npm outdated 2>/dev/null || pnpm outdated 2>/dev/null

# Check for vulnerabilities
npm audit 2>/dev/null || pnpm audit 2>/dev/null
```

**Assessment Checklist:**
```
[ ] Framework version is current (Next.js 14+)
[ ] React version is current (18+)
[ ] TypeScript is installed
[ ] ESLint configured
[ ] Prettier configured
[ ] Testing framework installed (Vitest/Jest)
[ ] No high/critical vulnerabilities
[ ] Scripts defined (dev, build, test, lint)
[ ] Type definitions present (@types/*)
```

**Key Dependencies to Check:**
| Category | Expected Packages | Status |
|----------|-------------------|--------|
| Framework | next, react, react-dom | |
| Language | typescript | |
| Styling | tailwindcss, postcss | |
| UI | @radix-ui/*, shadcn components | |
| Forms | react-hook-form, zod | |
| State | zustand, @tanstack/react-query | |
| Database | @supabase/supabase-js | |
| Auth | @supabase/auth-helpers-nextjs | |
| Testing | vitest, @testing-library/* | |
| Linting | eslint, prettier | |

### 2.3 TypeScript Configuration Analysis

**Commands to Run:**
```bash
# View TypeScript config
cat tsconfig.json

# Check for type errors
npx tsc --noEmit 2>&1 | head -50
```

**Assessment Checklist:**
```
[ ] strict mode enabled
[ ] Path aliases configured (@/*)
[ ] Include/exclude properly set
[ ] Target is modern (ES2020+)
[ ] Module resolution is correct
[ ] No type errors (or documented exceptions)
```

### 2.4 Database Schema Analysis

**Commands to Run:**
```bash
# Check Supabase migrations
ls -la supabase/migrations/

# View latest migration
cat supabase/migrations/$(ls supabase/migrations/ | tail -1)

# Or check for Prisma schema
cat prisma/schema.prisma 2>/dev/null
```

**Assessment Checklist:**
```
[ ] Migrations exist and are versioned
[ ] Tables match PRD entities
[ ] Foreign keys properly defined
[ ] Indexes on query columns
[ ] RLS policies defined
[ ] Enums match contract types
[ ] Timestamps (created_at, updated_at) present
[ ] Soft delete pattern (if required)
```

### 2.5 API Routes Analysis

**Commands to Run:**
```bash
# List API routes (App Router)
find src/app/api -name "route.ts" -o -name "route.js" 2>/dev/null

# View a sample route
cat src/app/api/[first-route]/route.ts 2>/dev/null | head -50
```

**Assessment Checklist:**
```
[ ] Routes follow RESTful conventions
[ ] Authentication middleware applied
[ ] Input validation present (Zod)
[ ] Error handling standardized
[ ] Response types match contracts
[ ] Rate limiting considered
[ ] CORS configured (if needed)
```

### 2.6 Component Analysis

**Commands to Run:**
```bash
# List components
find src/components -name "*.tsx" 2>/dev/null | head -30

# Count components by directory
find src/components -name "*.tsx" 2>/dev/null | xargs -I {} dirname {} | sort | uniq -c

# Check for test files
find src -name "*.test.tsx" -o -name "*.spec.tsx" 2>/dev/null | wc -l
```

**Assessment Checklist:**
```
[ ] Components are domain-organized
[ ] Base UI components in /ui
[ ] Consistent naming (PascalCase)
[ ] Props are typed
[ ] Tests exist for key components
[ ] Follows design system
[ ] Accessible (aria-*, semantic HTML)
[ ] Responsive (mobile-first)
```

### 2.7 Security Analysis

**Commands to Run:**
```bash
# Check for .env files
ls -la .env* 2>/dev/null

# Check .gitignore
cat .gitignore | grep -E "env|secret|key"

# Search for hardcoded secrets (basic)
grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | grep -v "type\|interface\|import" | head -20
```

**Assessment Checklist:**
```
[ ] .env files in .gitignore
[ ] No hardcoded secrets in code
[ ] Environment variables documented
[ ] Auth uses secure patterns
[ ] HTTPS enforced
[ ] Input sanitization present
[ ] SQL injection prevented (parameterized queries)
[ ] XSS prevention (React escaping + CSP)
```

### 2.8 Test Coverage Analysis

**Commands to Run:**
```bash
# Run tests with coverage
npm test -- --coverage 2>/dev/null || pnpm test --coverage 2>/dev/null

# Or just check test file count
find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null | wc -l
```

**Assessment Checklist:**
```
[ ] Test framework configured
[ ] Unit tests exist
[ ] Integration tests exist
[ ] Coverage meets threshold (≥80%)
[ ] Critical paths tested
[ ] E2E tests present (optional)
```

---

## PART 3: CROSS-VALIDATION CHECKS

### 3.1 PRD vs Codebase

| PRD Element | Code Check | Command |
|-------------|------------|---------|
| Entities | Tables exist in schema | `grep -l "CREATE TABLE" supabase/migrations/*` |
| API Endpoints | Routes exist | `find src/app/api -name "route.ts"` |
| User Roles | Auth checks present | `grep -r "role\|permission" src/` |
| Features | Components exist | `ls src/components/` |
| Validations | Zod schemas exist | `grep -r "z\." src/lib/` |

### 3.2 Contracts vs Codebase

| Contract | Code Check | Validation |
|----------|------------|------------|
| Entity interfaces | Types imported/used | `grep -r "import.*from.*contracts" src/` |
| API request types | Used in routes | `grep -r "Request\|Response" src/app/api/` |
| Enums | Used consistently | `grep -r "type.*=\|enum" src/` |

### 3.3 Stories vs Codebase

| Story Element | Code Check | Validation |
|---------------|------------|------------|
| files.create | Files exist | `ls -la [path]` |
| Components | Exported properly | `grep -r "export.*function\|export.*const" [file]` |
| Tests | Test file exists | `ls -la [file].test.tsx` |

### 3.4 Design System vs Codebase

| Design Token | Code Check | Validation |
|--------------|------------|------------|
| Colors | In tailwind.config | `grep -A 20 "colors:" tailwind.config.js` |
| Typography | Font configured | `grep -r "font-" src/` |
| Spacing | Consistent scale | `grep -r "p-\|m-\|gap-" src/components/` |
| Components | Match mockups | Visual inspection required |

---

## PART 4: GAP CATEGORIES

### 4.1 Documentation Gaps

| Gap Type | Description | Severity |
|----------|-------------|----------|
| **DOC-MISSING** | Required document doesn't exist | 🔴 Critical |
| **DOC-INCOMPLETE** | Document exists but missing sections | 🟠 High |
| **DOC-OUTDATED** | Document doesn't match current code | 🟡 Medium |
| **DOC-INCONSISTENT** | Conflicts with other documents | 🔴 Critical |
| **DOC-NONCOMPLIANT** | Doesn't meet V4.3 format | 🟡 Medium |

### 4.2 Codebase Gaps

| Gap Type | Description | Severity |
|----------|-------------|----------|
| **CODE-STRUCTURE** | Poor/inconsistent folder organization | 🟠 High |
| **CODE-QUALITY** | Missing types, tests, or linting | 🟠 High |
| **CODE-SECURITY** | Security vulnerabilities or bad practices | 🔴 Critical |
| **CODE-OUTDATED** | Deprecated dependencies or patterns | 🟡 Medium |
| **CODE-INCOMPLETE** | Partial implementations, TODOs | 🟠 High |
| **CODE-UNDOCUMENTED** | Code without comments or docs | 🟢 Low |

### 4.3 Cross-Validation Gaps

| Gap Type | Description | Severity |
|----------|-------------|----------|
| **DRIFT-SCHEMA** | DB schema doesn't match contracts | 🔴 Critical |
| **DRIFT-API** | API routes don't match contracts | 🔴 Critical |
| **DRIFT-LOGIC** | Code logic doesn't match business rules | 🔴 Critical |
| **DRIFT-UI** | Components don't match design system | 🟠 High |
| **COVERAGE-GAP** | Features in PRD not in code | 🟠 High |
| **ORPHAN-CODE** | Code not referenced in any story | 🟢 Low |

---

## PART 5: ANALYSIS REPORT TEMPLATE

```markdown
# CTO Codebase & Documentation Analysis Report

## Project: [PROJECT NAME]
## Analysis Date: [DATE]
## Analyst: Claude CTO Analyzer V2.0

---

## Executive Summary

[3-4 paragraph summary covering:
- Overall project health assessment
- Key strengths identified
- Critical gaps found
- Recommended path forward]

### Quick Stats

| Metric | Value | Assessment |
|--------|-------|------------|
| **Documentation Maturity** | L[X]/5 | [Good/Needs Work/Critical] |
| **Codebase Health** | [X]/100 | [Good/Needs Work/Critical] |
| **Doc-Code Alignment** | [X]% | [Aligned/Drifted/Misaligned] |
| **V4.3 Readiness** | [X]% | [Ready/Near/Far] |
| **Estimated Effort to Ready** | [X] weeks | |

---

## Section 1: Documentation Analysis

### 1.1 Document Inventory

| Document | Status | Completeness | Quality | Notes |
|----------|--------|--------------|---------|-------|
| PRD | ✅/🟡/❌ | X% | X/5 | |
| Technical Architecture | ✅/🟡/❌ | X% | X/5 | |
| Business Logic | ✅/🟡/❌ | X% | X/5 | |
| User Stories | ✅/🟡/❌ | X% | X/5 | |
| Design System | ✅/🟡/❌ | X% | X/5 | |
| Entity Contracts | ✅/🟡/❌ | X% | X/5 | |
| API Contracts | ✅/🟡/❌ | X% | X/5 | |
| CLAUDE.md | ✅/🟡/❌ | X% | X/5 | |

### 1.2 Documentation Maturity Level

**Current Level:** L[X] - [Level Name]

```
L0 ━━━━ L1 ━━━━ L2 ━━━━ L3 ━━━━ L4 ━━━━ L5
Idea   Vision  Design  Spec'd  Contract V4.3
                         ▲
                    YOU ARE HERE
```

### 1.3 Documentation Gaps

| ID | Gap | Type | Severity | Document | Remediation |
|----|-----|------|----------|----------|-------------|
| DOC-001 | | | 🔴/🟠/🟡/🟢 | | |
| DOC-002 | | | | | |

---

## Section 2: Codebase Analysis

### 2.1 Project Structure

```
[Insert actual project tree]
```

**Structure Assessment:**
| Aspect | Status | Notes |
|--------|--------|-------|
| Folder Organization | ✅/🟡/❌ | |
| Naming Conventions | ✅/🟡/❌ | |
| Framework Compliance | ✅/🟡/❌ | |
| Domain Separation | ✅/🟡/❌ | |

### 2.2 Tech Stack

| Category | Package | Version | Latest | Status |
|----------|---------|---------|--------|--------|
| Framework | next | X.X.X | X.X.X | ✅/⚠️ |
| React | react | X.X.X | X.X.X | ✅/⚠️ |
| Language | typescript | X.X.X | X.X.X | ✅/⚠️ |
| Database | @supabase/supabase-js | X.X.X | X.X.X | ✅/⚠️ |
| Styling | tailwindcss | X.X.X | X.X.X | ✅/⚠️ |
| ... | | | | |

**Vulnerabilities:**
| Severity | Count | Action |
|----------|-------|--------|
| Critical | X | Immediate fix |
| High | X | Fix this sprint |
| Medium | X | Plan to fix |
| Low | X | Monitor |

### 2.3 Code Quality Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| TypeScript Errors | X | 0 | ✅/❌ |
| ESLint Errors | X | 0 | ✅/❌ |
| Test Files | X | - | |
| Test Coverage | X% | ≥80% | ✅/❌ |
| Build Status | Pass/Fail | Pass | ✅/❌ |

### 2.4 Database Schema

| Table | Exists | Matches Contract | RLS | Indexes |
|-------|--------|------------------|-----|---------|
| users | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| profiles | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| [entity] | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |

### 2.5 API Routes

| Endpoint | Exists | Matches Contract | Auth | Validation |
|----------|--------|------------------|------|------------|
| POST /api/auth/login | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| GET /api/users/me | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| [endpoint] | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |

### 2.6 Security Assessment

| Check | Status | Notes |
|-------|--------|-------|
| Secrets in .gitignore | ✅/❌ | |
| No hardcoded credentials | ✅/❌ | |
| Auth implemented | ✅/❌ | |
| Input validation | ✅/❌ | |
| RLS policies | ✅/❌ | |
| HTTPS enforced | ✅/❌ | |

### 2.7 Codebase Gaps

| ID | Gap | Type | Severity | Location | Remediation |
|----|-----|------|----------|----------|-------------|
| CODE-001 | | | 🔴/🟠/🟡/🟢 | | |
| CODE-002 | | | | | |

---

## Section 3: Cross-Validation Analysis

### 3.1 Documentation ↔ Code Alignment

| Area | Alignment | Drift Detected | Severity |
|------|-----------|----------------|----------|
| PRD → Code Features | X% | [Yes/No] | |
| Contracts → DB Schema | X% | [Yes/No] | |
| Contracts → API Routes | X% | [Yes/No] | |
| Business Logic → Code | X% | [Yes/No] | |
| Design System → Components | X% | [Yes/No] | |
| Stories → Implementations | X% | [Yes/No] | |

### 3.2 Drift Details

| ID | Drift Description | Doc Says | Code Says | Resolution |
|----|-------------------|----------|-----------|------------|
| DRIFT-001 | | | | |
| DRIFT-002 | | | | |

### 3.3 Coverage Analysis

**Features in PRD but not in Code:**
| Feature | PRD Reference | Status | Priority |
|---------|---------------|--------|----------|
| | | Not Started / In Progress / Blocked | |

**Code not referenced in Stories:**
| Code File/Component | Purpose | Action |
|---------------------|---------|--------|
| | | Document / Remove / Keep |

---

## Section 4: V4.3 Pipeline Readiness

### 4.1 Planning Gate Readiness

| Gate | Status | Gaps | Effort |
|------|--------|------|--------|
| PG-1: PRD Analysis | ✅/🟡/❌ | X | X days |
| PG-2: Contracts | ✅/🟡/❌ | X | X days |
| PG-3: Stories | ✅/🟡/❌ | X | X days |
| PG-4: Linting | ✅/🟡/❌ | X | X days |
| PG-5: Scheduling | ✅/🟡/❌ | X | X days |

### 4.2 Execution Gate Readiness

| Gate | Status | Blocker |
|------|--------|---------|
| G0: CTO Research | ✅/🟡/❌ | |
| G0.5: Workspace | ✅/🟡/❌ | |
| G1: PM Planning | ✅/🟡/❌ | |
| G2: Dev Building | ✅/🟡/❌ | |
| G3-G4: Testing/QA | ✅/🟡/❌ | |
| G5-G8: Review/Deploy | ✅/🟡/❌ | |

### 4.3 Multi-Agent Readiness

| Requirement | Status | Gap |
|-------------|--------|-----|
| Domain ownership paths | ✅/❌ | |
| CLAUDE.md complete | ✅/❌ | |
| Signal file structure | ✅/❌ | |
| Story JSON format | ✅/❌ | |

---

## Section 5: Consolidated Gap Analysis

### 5.1 All Gaps by Severity

#### 🔴 Critical Gaps (X total)
| ID | Gap | Category | Impact | Effort | Priority |
|----|-----|----------|--------|--------|----------|
| | | DOC/CODE/DRIFT | | S/M/L | P0 |

#### 🟠 High Gaps (X total)
| ID | Gap | Category | Impact | Effort | Priority |
|----|-----|----------|--------|--------|----------|
| | | DOC/CODE/DRIFT | | S/M/L | P1 |

#### 🟡 Medium Gaps (X total)
| ID | Gap | Category | Impact | Effort | Priority |
|----|-----|----------|--------|--------|----------|
| | | DOC/CODE/DRIFT | | S/M/L | P2 |

#### 🟢 Low Gaps (X total)
| ID | Gap | Category | Impact | Effort | Priority |
|----|-----|----------|--------|--------|----------|
| | | DOC/CODE/DRIFT | | S/M/L | P3 |

### 5.2 Gap Dependency Graph

```
[Visual showing which gaps block which]

CRITICAL PATH:
DOC-001 ──▶ CODE-003 ──▶ DRIFT-001 ──▶ V4.3 Ready

PARALLEL TRACK:
DOC-002 ──▶ CODE-005
            │
CODE-004 ───┘
```

---

## Section 6: Recommendations & Roadmap

### 6.1 Strategic Recommendation

**Recommended Approach:** [Full Compliance / Progressive / Parallel]

**Rationale:** [Why this approach for this project]

### 6.2 Prioritized Roadmap

#### Phase 0: Critical Fixes (Week 1)
| Task | Gap ID | Description | Effort | Owner |
|------|--------|-------------|--------|-------|
| T-001 | | | X days | |
| T-002 | | | X days | |

**Exit Criteria:** [All critical gaps resolved]

#### Phase 1: Documentation (Weeks 2-3)
| Task | Gap ID | Description | Effort | Owner |
|------|--------|-------------|--------|-------|
| T-003 | | | X days | |
| T-004 | | | X days | |

**Exit Criteria:** [Documentation maturity L4+]

#### Phase 2: Code Quality (Week 4)
| Task | Gap ID | Description | Effort | Owner |
|------|--------|-------------|--------|-------|
| T-005 | | | X days | |
| T-006 | | | X days | |

**Exit Criteria:** [Code health 80+]

#### Phase 3: Pipeline Setup (Week 5)
| Task | Gap ID | Description | Effort | Owner |
|------|--------|-------------|--------|-------|
| T-007 | | | X days | |
| T-008 | | | X days | |

**Exit Criteria:** [CTO Validator V5 score ≥90%]

### 6.3 Quick Wins (Do This Week)

| # | Quick Win | Effort | Impact | Gap ID |
|---|-----------|--------|--------|--------|
| 1 | | X hours | High | |
| 2 | | X hours | High | |
| 3 | | X hours | High | |

### 6.4 Technical Debt Items

| Item | Description | Effort | Priority |
|------|-------------|--------|----------|
| | | | |

### 6.5 Decisions Required

| Decision | Options | Deadline | Owner |
|----------|---------|----------|-------|
| | A, B, C | | |

---

## Section 7: Next Steps

### Immediate Actions (This Week)

1. **[Action 1]**
   - Description: [What to do]
   - Owner: [Who]
   - Deliverable: [What output]
   - Due: [Date]

2. **[Action 2]**
   - Description: [What to do]
   - Owner: [Who]
   - Deliverable: [What output]
   - Due: [Date]

3. **[Action 3]**
   - Description: [What to do]
   - Owner: [Who]
   - Deliverable: [What output]
   - Due: [Date]

### Short-Term (Next 2 Weeks)

[List of actions]

### Medium-Term (Next Month)

[List of actions]

### Success Criteria

The project is ready for V4.3 when:
- [ ] CTO Validator V5 score ≥ 90%
- [ ] All critical gaps resolved
- [ ] All high gaps resolved
- [ ] Documentation at L4+
- [ ] Codebase health ≥ 80
- [ ] Doc-Code alignment ≥ 90%

---

## Appendix A: Full Gap Register

[Complete list of all gaps with details]

## Appendix B: File Inventory

[List of all code files analyzed]

## Appendix C: Command Outputs

[Raw outputs from analysis commands]

## Appendix D: Best Practices Research

[Web search results used for validation]

---

**Report Generated:** [Date]  
**Analyzer Version:** CTO Codebase & Documentation Analyzer V2.0  
**Analysis Duration:** [X] hours
```

---

## PART 6: ANALYZER PROMPT

Copy this prompt into Claude to run the analysis:

```markdown
# CTO Codebase & Documentation Analyzer V2.0 Activation

You are a CTO performing a comprehensive analysis of an existing project. You will examine BOTH the documentation AND the codebase to assess current state, identify gaps, and create an actionable roadmap.

## Your Analysis Mandate

1. **Examine Everything** - Read docs, inspect code, run commands
2. **Cross-Validate** - Check that docs match code reality
3. **Identify All Gaps** - Documentation, code quality, drift
4. **Prioritize Ruthlessly** - Focus on what blocks progress
5. **Be Actionable** - Specific tasks with effort estimates
6. **Research Best Practices** - Use web search to validate decisions

## Analysis Process

### Phase 1: Documentation Audit
1. Inventory all provided documents
2. Assess completeness and quality of each
3. Check cross-document consistency
4. Identify documentation gaps

### Phase 2: Codebase Inspection
For each area, use the `view` tool to examine files and `bash` to run commands:

**Structure Analysis:**
```bash
# View project structure
ls -la
ls -la src/ 2>/dev/null
tree -L 2 -I 'node_modules|.git' 2>/dev/null || find . -type d -maxdepth 2 | head -30
```

**Dependencies Analysis:**
```bash
# Check package.json
cat package.json
npm outdated 2>/dev/null || echo "Run npm outdated manually"
```

**TypeScript Analysis:**
```bash
# Check for type errors
cat tsconfig.json
npx tsc --noEmit 2>&1 | head -30
```

**Database Analysis:**
```bash
# Check migrations/schema
ls -la supabase/migrations/ 2>/dev/null || ls -la prisma/ 2>/dev/null
cat supabase/migrations/*.sql 2>/dev/null | head -100
```

**API Routes Analysis:**
```bash
# List API routes
find src/app/api -name "route.ts" 2>/dev/null
```

**Test Analysis:**
```bash
# Count tests
find . -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l
```

**Security Analysis:**
```bash
# Check for env handling
cat .gitignore | grep -i env
ls -la .env* 2>/dev/null
```

### Phase 3: Cross-Validation
- Compare contracts to actual schema
- Compare API contracts to actual routes
- Compare stories to actual implementations
- Check for drift between docs and code

### Phase 4: Gap Analysis
- Categorize all gaps (DOC/CODE/DRIFT)
- Assign severity levels
- Calculate effort estimates
- Identify dependencies

### Phase 5: Recommendations
- Create prioritized roadmap
- Identify quick wins
- List decisions needed
- Define success criteria

### Phase 6: Report Generation
- Use the report template
- Include all findings
- Be specific and actionable

## Output

Generate a complete CTO Codebase & Documentation Analysis Report.

## Begin Analysis

I will now analyze the provided project. Please ensure I have access to:
1. All documentation files (PRD, architecture, stories, etc.)
2. The codebase (or key files if full access not available)
3. Package.json and config files
4. Database schema/migrations

I will use bash commands and file viewing to inspect the codebase directly.

Ready to analyze.
```

---

## PART 7: QUICK COMMANDS

**Full Analysis:**
```
Run complete CTO Codebase & Documentation Analysis.
Inspect all docs, examine codebase structure, cross-validate, identify gaps.
Generate full report with roadmap.
```

**Documentation Only:**
```
Analyze only the documentation.
Assess completeness, quality, consistency.
Identify documentation gaps.
```

**Codebase Only:**
```
Analyze only the codebase.
Inspect structure, dependencies, quality, security.
Identify code gaps and technical debt.
```

**Cross-Validation Only:**
```
Cross-validate documentation against codebase.
Find drift between docs and code.
Identify alignment issues.
```

**Gap Analysis Only:**
```
Compile all gaps from docs and code.
Categorize by type and severity.
Create prioritized gap register.
```

**Roadmap Only:**
```
Based on gaps, create prioritized roadmap.
Include phases, tasks, effort estimates.
Define success criteria.
```

---

## PART 8: TOOL RELATIONSHIPS

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        CTO TOOLS ECOSYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  CTO CODEBASE & DOCUMENTATION ANALYZER V2.0                               │ │
│  │  ─────────────────────────────────────────                                │ │
│  │  WHEN: Starting analysis of existing project                              │ │
│  │  INPUT: Docs + Codebase                                                   │ │
│  │  OUTPUT: Current state report + Gap analysis + Roadmap                    │ │
│  │  QUESTION: "Where are we? What's the gap? What do we do?"                │ │
│  └─────────────────────────────────┬─────────────────────────────────────────┘ │
│                                    │                                            │
│                                    ▼                                            │
│                           Execute Roadmap                                       │
│                           (Fix gaps, create docs, refactor code)               │
│                                    │                                            │
│                                    ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  CTO VALIDATOR V5                                                         │ │
│  │  ────────────────                                                         │ │
│  │  WHEN: Ready to start V4.3 pipeline                                       │ │
│  │  INPUT: Docs + Contracts + Stories                                        │ │
│  │  OUTPUT: Score + Certification + GO/NO-GO                                 │ │
│  │  QUESTION: "Are we ready to start multi-agent execution?"                │ │
│  └─────────────────────────────────┬─────────────────────────────────────────┘ │
│                                    │                                            │
│                          If CERTIFIED (≥90%)                                   │
│                                    │                                            │
│                                    ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  V4.3 MULTI-AGENT PIPELINE                                                │ │
│  │  ─────────────────────────                                                │ │
│  │  Planning Gates: PG-1 → PG-5                                              │ │
│  │  Execution Gates: G0 → G8                                                 │ │
│  │  Agents: CTO, PM, QA, FE Dev, BE Dev                                     │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## SUMMARY

### CTO Codebase & Documentation Analyzer V2.0

**Analyzes:**
- ✅ Documentation (PRD, architecture, contracts, stories)
- ✅ Codebase (structure, dependencies, quality, security)
- ✅ Cross-validation (docs vs code alignment)
- ✅ V4.3 readiness (pipeline compatibility)

**Outputs:**
- 📊 Current state assessment
- 📋 Comprehensive gap analysis
- 🗺️ Prioritized roadmap
- ✅ Actionable next steps

**Use When:**
- Starting on an existing project
- Inheriting a codebase
- Assessing technical debt
- Planning modernization
- Preparing for V4.3 pipeline

---

**Document Version:** 2.0  
**Created:** January 2026  
**Companion Tools:** CTO Validator V5, PM Validator V5  
**Scope:** Documentation + Codebase Analysis
