# CTO AI ANALYSIS PROMPT

## Use After Running cto-analyzer.sh

After running the bash script to gather codebase and documentation data, paste this prompt along with the generated reports into Claude for deep AI analysis.

---

## PROMPT TO PASTE INTO CLAUDE:

```
# CTO Deep Analysis Request

You are a CTO performing a strategic analysis of an existing project. I have run an automated scan that gathered data from the codebase and documentation. Please analyze all the reports and provide:

1. **Current State Assessment** - Overall health and maturity
2. **Critical Gaps** - What's blocking progress
3. **Prioritized Roadmap** - Steps to V4.3 readiness
4. **Specific Recommendations** - Actionable next steps

## Context

I'm using the V4.3 Multi-Agent Pipeline with:
- Planning Gates: PG-1 (PRD) → PG-2 (Contracts) → PG-3 (Stories) → PG-4 (Linting) → PG-5 (Scheduling)
- Execution Gates: G0 (CTO) → G1 (PM) → G2 (Dev) → G3 (Self-Test) → G4 (QA) → G4.5 (Fix) → G5 (PM Review) → G6 (CI/CD) → G7 (CTO Merge) → G8 (Deploy)
- Agents: CTO (Opus), PM (Opus), FE Dev (Sonnet), BE Dev (Sonnet), QA (Haiku)

## Analysis Reports

[PASTE ALL THE GENERATED REPORTS HERE]

---

## Your Analysis Should Include:

### 1. Executive Summary
- One paragraph overall assessment
- Current maturity level (L0-L5)
- Key strengths and weaknesses
- Estimated effort to V4.3 readiness

### 2. Documentation Assessment
For each expected document type, assess:
- Does it exist?
- How complete is it (percentage)?
- What's missing?
- Quality rating (1-5)

Expected documents:
- PRD (Product Requirements)
- Technical Architecture
- Business Logic / State Machines
- User Stories (Gherkin/EARS format)
- Design System
- Entity Contracts (TypeScript)
- API Contracts (TypeScript)
- Database Schema
- CLAUDE.md (Agent Instructions)

### 3. Codebase Assessment
Rate each area (1-5) and note issues:
- Project Structure
- Dependency Health
- TypeScript Configuration
- Database Schema
- API Routes
- Component Organization
- Test Coverage
- Security Practices

### 4. Cross-Validation
Check alignment between:
- PRD ↔ Implemented Features
- Contracts ↔ Database Schema
- Contracts ↔ API Routes
- Stories ↔ Implementations
- Design System ↔ Components

### 5. Gap Analysis
Create a prioritized gap register:

| ID | Gap | Category | Severity | Impact | Effort | Priority |
|----|-----|----------|----------|--------|--------|----------|
| G-001 | | DOC/CODE/DRIFT | 🔴/🟠/🟡/🟢 | | S/M/L | P0-P3 |

Categories:
- DOC-MISSING: Document doesn't exist
- DOC-INCOMPLETE: Document missing sections
- DOC-OUTDATED: Document doesn't match code
- CODE-STRUCTURE: Poor organization
- CODE-QUALITY: Missing tests/types
- CODE-SECURITY: Security issues
- DRIFT: Docs don't match code
- PIPELINE: V4.3 requirements missing

### 6. V4.3 Readiness Checklist

#### Planning Gates
- [ ] PG-1: PRD can be parsed for domains/features
- [ ] PG-2: TypeScript contracts exist with @source
- [ ] PG-3: Stories in AI-ready JSON format
- [ ] PG-4: Stories pass linter (≥95%)
- [ ] PG-5: Dependencies mapped, waves assigned

#### Execution Gates
- [ ] G0: Architecture documented
- [ ] G0.5: Domain ownership defined
- [ ] G1: Stories assignable to agents
- [ ] G2: Contracts available for dev
- [ ] G4: Acceptance criteria testable
- [ ] G6: CI/CD configured
- [ ] G8: Deploy process defined

### 7. Prioritized Roadmap

Create a phased plan:

#### Phase 0: Critical Fixes (Must do first)
| Task | Gap ID | Effort | Owner |
|------|--------|--------|-------|

#### Phase 1: Documentation (Week X)
| Task | Gap ID | Effort | Owner |
|------|--------|--------|-------|

#### Phase 2: Code Quality (Week X)
| Task | Gap ID | Effort | Owner |
|------|--------|--------|-------|

#### Phase 3: Pipeline Setup (Week X)
| Task | Gap ID | Effort | Owner |
|------|--------|--------|-------|

### 8. Quick Wins (Do This Week)
List 5 high-impact, low-effort improvements.

### 9. Decisions Required
List any decisions that need stakeholder input.

### 10. Next Steps
Specific actions with owners and due dates.

---

Please provide your complete analysis following this structure.
```

---

## HOW TO USE

1. **Run the bash script:**
   ```bash
   chmod +x cto-analyzer.sh
   ./cto-analyzer.sh /path/to/codebase /path/to/docs ./output-folder
   ```

2. **Collect the output reports:**
   - 00-SUMMARY-REPORT.md
   - 01-codebase-structure.md
   - 02-dependencies.md
   - ... (all 11 reports)

3. **Open a new Claude session**

4. **Paste the prompt above** followed by all the report contents

5. **Claude will provide:**
   - Deep analysis
   - Gap prioritization
   - Actionable roadmap
   - Specific recommendations

---

## ALTERNATIVE: SINGLE COMMAND

If you want Claude to run the analysis directly (when Claude has computer access):

```
Please analyze the project at:
- Codebase: /path/to/codebase
- Documentation: /path/to/docs

Run the cto-analyzer.sh script, then analyze all outputs and provide:
1. Current state assessment
2. Gap analysis with priorities
3. Roadmap to V4.3 readiness
4. Specific next steps
```
