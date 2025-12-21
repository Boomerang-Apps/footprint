#!/bin/bash

# Multi-Agent Framework Setup Script v2.0
# Usage: ./setup-multi-agent.sh [project-name]

set -e

PROJECT_NAME="${1:-my-project}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"
WORKTREES_DIR="${PROJECT_DIR}-worktrees"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  Multi-Agent Framework Setup v2.0                                ║"
echo "║  Project: $PROJECT_NAME"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository. Please initialize git first:"
    echo "  git init"
    exit 1
fi

echo "📁 Creating .claudecode directory structure..."

# Create main directories
mkdir -p .claudecode/{agents,handoffs,milestones,research,decisions,templates,workflows,linear-stories}
mkdir -p .claudecode/milestones/sprint-1

echo "✅ Directory structure created"

# Create agent inbox files
echo "📬 Creating agent inbox files..."
for agent in cto pm qa backend-1 backend-2 frontend-a frontend-b; do
    cat > ".claudecode/handoffs/${agent}-inbox.md" << EOF
# ${agent^} Agent Inbox

---

*No messages yet.*

---

*Last checked: $(date +%Y-%m-%d)*
EOF
done
echo "✅ Inbox files created"

# Create Mandatory Safety Framework
echo "🛡️  Creating safety framework..."
cat > ".claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md" << 'EOF'
# Mandatory Safety Framework

**Version**: 2.0
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

## MANDATORY COMPLIANCE BANNER

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

---

## Safety Gates

### Gate 0: Research (CTO Enforced)
- Research document in `.claudecode/research/GATE0-[topic].md`
- Security implications documented
- CTO approval signature

### Gate 1: Planning
- Feature branch created
- START.md exists
- ROLLBACK-PLAN.md exists
- Git tag created

### Gate 2: Implementation (TDD)
- Tests written FIRST
- Minimum code to pass
- Atomic commits

### Gate 3: Testing (QA)
- 80%+ coverage
- All tests passing
- QA validation

### Gate 4: Review
- TypeScript clean
- Linter clean
- No security issues

### Gate 5: Deployment
- All gates passed
- COMPLETION.md created
- PM approval
- Merged to main

---

## Enforcement

PM Agent will BLOCK merges that:
- Skip any gate
- Have coverage <80%
- Missing milestone files
- Missing QA approval

---

**This framework is PERMANENT. NO EXCEPTIONS.**
EOF

# Create PM Orchestration Workflow
cat > ".claudecode/workflows/WORKFLOW-2.0-PM-ORCHESTRATION.md" << 'EOF'
# Workflow 2.0: PM Orchestration Protocol

**Version**: 2.0
**Status**: MANDATORY

---

## Overview

The PM Agent orchestrates ALL development work. No direct agent-to-agent handoffs.

---

## Workflow Flow

```
User Request
     ↓
CTO Decision (if architecture/security)
     ↓
PM Orchestration ← Central Hub
     ↓
Agent Execution (Backend-1/2, Frontend-A/B)
     ↓
QA Validation
     ↓
PM Merge
```

---

## PM Responsibilities

### Sprint Initialization
- [ ] Verify all Gate 0 research is CTO-approved
- [ ] Create agent assignments in each inbox
- [ ] Document sprint status
- [ ] Verify worktrees are synced

### Gate Progression Tracking
| Gate | Owner | PM Action |
|------|-------|-----------|
| Gate 0 | CTO | Wait for approval |
| Gate 1 | Agent | Verify milestone files |
| Gate 2 | Agent | Monitor progress |
| Gate 3 | QA | Route for validation |
| Gate 4 | PM | Final review |
| Gate 5 | PM | Merge to main |

### Merge Checklist (MANDATORY)
- [ ] START.md exists
- [ ] ROLLBACK-PLAN.md exists
- [ ] Git tag exists
- [ ] QA approved
- [ ] Tests passing
- [ ] Coverage ≥80%

---

## Agent Assignment Matrix

| Domain | Assign To |
|--------|-----------|
| Database, Auth, State | Backend-1 |
| External APIs, Integrations | Backend-2 |
| Auth UI, Navigation, Primitives | Frontend-A |
| Feature Components | Frontend-B |
| Testing | QA |

---

*This protocol is MANDATORY for all PM orchestration activities.*
EOF

echo "✅ Safety framework created"

# Create templates
echo "📝 Creating templates..."

# START.md template
cat > ".claudecode/templates/TEMPLATE-START.md" << 'EOF'
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
- Item 1

---

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

---

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| path/to/file | Create | Description |

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
EOF

# ROLLBACK-PLAN.md template
cat > ".claudecode/templates/TEMPLATE-ROLLBACK-PLAN.md" << 'EOF'
# Rollback Plan: STORY-ID

**Story**: STORY-ID - [Title]
**Created**: YYYY-MM-DD
**Agent**: [Agent Name]

---

## Rollback Scenarios

### Scenario 1: Tests Fail
```bash
git checkout develop
git branch -D feature/STORY-ID-description
```
**Recovery Time**: < 5 minutes

### Scenario 2: Need to Restart
```bash
git reset --hard [commit-hash]
```
**Recovery Time**: < 5 minutes

### Scenario 3: Breaking Production
```bash
git revert [merge-commit-hash]
git push origin develop
```
**Recovery Time**: < 15 minutes

---

## Pre-Rollback Checklist
- [ ] Document the issue
- [ ] Notify PM Agent
- [ ] Notify CTO if security-related
- [ ] Confirm no data loss

---

## Maximum Rollback Time: < 30 minutes

---

*Rollback plan by [Agent Name] - YYYY-MM-DD*
EOF

# COMPLETION.md template
cat > ".claudecode/templates/TEMPLATE-COMPLETION.md" << 'EOF'
# STORY-ID: [Story Title] - COMPLETE

**Completed**: YYYY-MM-DD
**Agent**: [Agent Name]
**Tag**: story/STORY-ID-complete

---

## Summary
Brief description of what was implemented.

---

## Acceptance Criteria - Final Status
- [x] All criteria met
- [x] Tests written (TDD)
- [x] 80%+ coverage
- [x] TypeScript clean
- [x] Linter clean

---

## Files Changed
| File | Change |
|------|--------|
| path/to/file | Created |

---

## Test Results
- Tests: XX passing
- Coverage: XX%

---

## QA Validation
**QA Approval**: ✅ Approved on YYYY-MM-DD

---

## Safety Gates Completed
- [x] All 6 gates passed

---

*Completed by [Agent Name] - YYYY-MM-DD*
EOF

# Research template
cat > ".claudecode/templates/TEMPLATE-research.md" << 'EOF'
# Research: [Topic]

**Date**: YYYY-MM-DD
**Author**: [Agent Name]
**Story**: STORY-ID
**Gate**: 0 - Research

---

## Objective
What are we trying to learn/validate?

---

## Research Findings

### Source 1: [Name/URL]
- Finding 1
- Finding 2

---

## Options Evaluated

### Option A: [Name]
**Pros:** ...
**Cons:** ...
**Cost:** $X

---

## Recommendation
**Recommended Approach:** Option [X]

---

## Security Considerations
- [ ] API keys stored securely
- [ ] No sensitive data exposed

---

## CTO Approval
**Status:** Pending / Approved / Blocked

---

*Research by [Agent Name] - YYYY-MM-DD*
EOF

echo "✅ Templates created"

# Create agent definition files
echo "🤖 Creating agent definitions..."

# CTO Agent
cat > ".claudecode/agents/cto-agent.md" << EOF
# CTO Agent - ${PROJECT_NAME}

**Model**: Claude Opus 4.5
**Domain**: All - Architecture & Security
**Worktree**: \`${PROJECT_NAME}-worktrees/agent-cto\`

---

## MANDATORY SAFETY BANNER
Display at START of EVERY response:
\`\`\`
╔══════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE                                      ║
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM                     ║
║  ✅ Safety Gates: 0-Research → 1-Plan → 2-Build → 3-Test → 4-Review → 5-Deploy  ║
║  ✅ TDD: Tests First | 80%+ Coverage Required                    ║
║  📋 Story: [STORY-ID] | Gate: [X] | Branch: [feature/STORY-ID-desc]  ║
╚══════════════════════════════════════════════════════════════════╝
\`\`\`

---

## Role Summary
Architecture decisions, security oversight, Gate 0 approval. NEVER write implementation code.

## ✅ YOU DO
- Architecture Decisions
- Security Oversight
- Gate 0 Enforcement
- Route ALL work through PM

## ❌ YOU NEVER
- Write implementation code
- Assign directly to dev agents
- Skip Gate 0
- Merge code

## Communication
- Inbox: \`.claudecode/handoffs/cto-inbox.md\`
- Handoff to PM: \`.claudecode/handoffs/pm-inbox.md\`

## Startup
\`\`\`bash
cd ${PROJECT_NAME}-worktrees/agent-cto && claude
# Paste: I am the CTO Agent. Read .claudecode/agents/cto-agent.md
\`\`\`
EOF

# PM Agent
cat > ".claudecode/agents/pm-agent.md" << EOF
# PM Agent - ${PROJECT_NAME}

**Model**: Claude Opus 4.5 / Sonnet 4
**Domain**: All - Orchestration & Tracking

---

## MANDATORY SAFETY BANNER
[Same as CTO]

---

## Role Summary
Orchestrate ALL work. Central hub for all agent communication.

## ✅ YOU DO
- Assign tasks to agents
- Track progress
- Manage handoffs via inbox files
- Final merge approval

## ❌ YOU NEVER
- Make architecture decisions
- Write code
- Merge without QA approval
- Allow direct agent-to-agent handoffs

## Merge Checklist (BLOCK IF MISSING)
- [ ] START.md exists
- [ ] ROLLBACK-PLAN.md exists
- [ ] QA approved
- [ ] Coverage ≥80%

## Agent Assignment
| Domain | Agent |
|--------|-------|
| Database, Auth | Backend-1 |
| External APIs | Backend-2 |
| Auth UI, Navigation | Frontend-A |
| Features | Frontend-B |

## Communication
- Inbox: \`.claudecode/handoffs/pm-inbox.md\`
- Agent inboxes: \`.claudecode/handoffs/[agent]-inbox.md\`
EOF

# QA Agent
cat > ".claudecode/agents/qa-agent.md" << EOF
# QA Agent - ${PROJECT_NAME}

**Model**: Claude Sonnet 4
**Domain**: All - Testing & Quality

---

## MANDATORY SAFETY BANNER
[Same as CTO]

---

## Role Summary
Write tests, enforce coverage, validate implementations, approve/block merges.

## ✅ YOU DO
- Write tests (unit, integration)
- Enforce 80%+ coverage
- Validate acceptance criteria
- Approve or block merges

## ❌ YOU NEVER
- Write feature code
- Skip coverage checks
- Approve without testing

## Coverage Requirements
| Area | Minimum |
|------|---------|
| Overall | 80% |
| Services | 100% |
| Utils | 100% |

## Approval Format
\`\`\`markdown
# QA → PM: [Story] APPROVED/BLOCKED
- Coverage: XX%
- Issues: [list if blocked]
\`\`\`
EOF

# Backend-1 Agent
cat > ".claudecode/agents/backend-1-agent.md" << EOF
# Backend-1 Agent - ${PROJECT_NAME}

**Model**: Claude Sonnet 4
**Domain**: Database, Auth, State Management

---

## MANDATORY SAFETY BANNER
[Same as CTO]

---

## Role Summary
Implement database, authentication, state management. Follow TDD strictly.

## ✅ YOU DO
- Database schemas
- Auth logic
- State stores
- TDD: Tests FIRST

## ❌ YOU NEVER
- Touch external APIs (Backend-2)
- Touch UI (Frontend)
- Skip tests

## Handoff
- Inbox: \`.claudecode/handoffs/backend-1-inbox.md\`
- Complete to: \`.claudecode/handoffs/qa-inbox.md\`
EOF

# Backend-2 Agent
cat > ".claudecode/agents/backend-2-agent.md" << EOF
# Backend-2 Agent - ${PROJECT_NAME}

**Model**: Claude Sonnet 4
**Domain**: External APIs, Integrations

---

## MANDATORY SAFETY BANNER
[Same as CTO]

---

## Role Summary
Implement external API integrations. Follow TDD strictly.

## ✅ YOU DO
- External API integrations
- Third-party services
- TDD: Tests FIRST

## ❌ YOU NEVER
- Touch database (Backend-1)
- Touch auth (Backend-1)
- Touch UI (Frontend)
- Skip tests

## Handoff
- Inbox: \`.claudecode/handoffs/backend-2-inbox.md\`
- Complete to: \`.claudecode/handoffs/qa-inbox.md\`
EOF

# Frontend-A Agent
cat > ".claudecode/agents/frontend-a-agent.md" << EOF
# Frontend-A Agent - ${PROJECT_NAME}

**Model**: Claude Sonnet 4
**Domain**: Auth UI, Navigation, UI Primitives

---

## MANDATORY SAFETY BANNER
[Same as CTO]

---

## Role Summary
Implement auth screens, navigation, UI primitives. Follow TDD strictly.

## ✅ YOU DO
- Auth screens
- Navigation/routing
- UI primitives (Button, Card, etc.)
- TDD: Tests FIRST

## ❌ YOU NEVER
- Touch services (Backend)
- Touch feature components (Frontend-B)
- Skip tests

## Handoff
- Inbox: \`.claudecode/handoffs/frontend-a-inbox.md\`
- Complete to: \`.claudecode/handoffs/qa-inbox.md\`
EOF

# Frontend-B Agent
cat > ".claudecode/agents/frontend-b-agent.md" << EOF
# Frontend-B Agent - ${PROJECT_NAME}

**Model**: Claude Sonnet 4
**Domain**: Feature Components

---

## MANDATORY SAFETY BANNER
[Same as CTO]

---

## Role Summary
Implement feature-specific components and screens. Follow TDD strictly.

## ✅ YOU DO
- Feature components
- Feature screens
- TDD: Tests FIRST

## ❌ YOU NEVER
- Touch services (Backend)
- Touch auth/navigation (Frontend-A)
- Touch UI primitives (Frontend-A)
- Skip tests

## Handoff
- Inbox: \`.claudecode/handoffs/frontend-b-inbox.md\`
- Complete to: \`.claudecode/handoffs/qa-inbox.md\`
EOF

echo "✅ Agent definitions created"

# Create worktrees
echo "🌲 Creating git worktrees..."
mkdir -p "$WORKTREES_DIR"

for agent in agent-cto agent-pm agent-qa backend-1 backend-2 frontend-a frontend-b; do
    if [ ! -d "$WORKTREES_DIR/$agent" ]; then
        git worktree add "$WORKTREES_DIR/$agent" -b "agent/$agent" 2>/dev/null || true
        echo "  ✅ Created worktree: $agent"
    else
        echo "  ⏭️  Worktree exists: $agent"
    fi
done

echo "✅ Worktrees created"

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  ✅ Multi-Agent Framework Setup Complete!                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Structure created:"
echo "   .claudecode/"
echo "   ├── agents/        # Agent role definitions"
echo "   ├── handoffs/      # Agent inbox files"
echo "   ├── milestones/    # Sprint milestone tracking"
echo "   ├── research/      # Gate 0 research docs"
echo "   ├── decisions/     # CTO decisions"
echo "   ├── templates/     # Document templates"
echo "   └── workflows/     # Safety & workflow docs"
echo ""
echo "🌲 Worktrees created at: $WORKTREES_DIR"
echo ""
echo "🚀 Next steps:"
echo "   1. Read the playbook: MULTI-AGENT-PLAYBOOK.md"
echo "   2. Start CTO agent: cd $WORKTREES_DIR/agent-cto && claude"
echo "   3. Start PM agent:  cd $WORKTREES_DIR/agent-pm && claude"
echo ""
echo "Happy building! 🎉"
