# Multi-Agent Framework Onboarding Guide

**For New Projects and New Agent Sessions**

---

## Quick Start for New Projects

### Option 1: Automated Setup (Recommended)

```bash
# From an existing project with the framework (e.g., Ringz)
cd /path/to/ringz
./scripts/deploy-framework-to-projects.sh

# Edit the script to add your new project path first
```

### Option 2: Manual Setup

```bash
# 1. Clone or create your project
cd /path/to/your-project

# 2. Create directory structure
mkdir -p .claudecode/{agents,handoffs,milestones/sprint-1,research,decisions,templates,workflows}
mkdir -p scripts

# 3. Copy framework files from source project
SOURCE="/path/to/ringz"  # or any project with the framework

# Core workflows (REQUIRED)
cp $SOURCE/.claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md .claudecode/workflows/
cp $SOURCE/.claudecode/workflows/WORKFLOW-2.0-PM-ORCHESTRATION.md .claudecode/workflows/
cp $SOURCE/.claudecode/workflows/AGENT-VALIDATION-PROTOCOL.md .claudecode/workflows/
cp $SOURCE/.claudecode/workflows/LINEAR-FIRST-PROTOCOL.md .claudecode/workflows/
cp $SOURCE/.claudecode/workflows/GIT-ENVIRONMENT-PROTOCOL.md .claudecode/workflows/

# Agent prompts and startup
cp $SOURCE/.claudecode/AGENT-STARTUP-PROTOCOL.md .claudecode/
cp $SOURCE/.claudecode/RIGID-AGENT-PROMPTS.md .claudecode/

# Templates
cp $SOURCE/.claudecode/templates/TEMPLATE-*.md .claudecode/templates/

# Playbooks
cp $SOURCE/MULTI-AGENT-PLAYBOOK.md ./
cp $SOURCE/MULTI-AGENT-QUICKSTART.md ./

# Setup script
cp $SOURCE/scripts/setup-multi-agent.sh scripts/
chmod +x scripts/setup-multi-agent.sh

# 4. Run worktree setup
./scripts/setup-multi-agent.sh your-project-name
```

---

## Framework File Checklist

### Required Files (14 Total)

```
your-project/
├── MULTI-AGENT-PLAYBOOK.md          # Complete framework guide
├── MULTI-AGENT-QUICKSTART.md        # Quick reference
├── scripts/
│   └── setup-multi-agent.sh         # Worktree setup automation
└── .claudecode/
    ├── AGENT-STARTUP-PROTOCOL.md    # Mandatory startup sequence
    ├── RIGID-AGENT-PROMPTS.md       # Copy-paste prompts for agents
    ├── workflows/
    │   ├── MANDATORY-SAFETY-FRAMEWORK.md    # Safety gates
    │   ├── WORKFLOW-2.0-PM-ORCHESTRATION.md # PM workflow
    │   ├── AGENT-VALIDATION-PROTOCOL.md     # 8-layer validation
    │   ├── LINEAR-FIRST-PROTOCOL.md         # Linear integration
    │   └── GIT-ENVIRONMENT-PROTOCOL.md      # Dev/Staging/Prod
    └── templates/
        ├── TEMPLATE-START.md         # Story start document
        ├── TEMPLATE-ROLLBACK-PLAN.md # Rollback planning
        ├── TEMPLATE-COMPLETION.md    # Completion report
        ├── TEMPLATE-PM-ASSIGNMENT.md # PM assignments
        └── TEMPLATE-research.md      # Gate 0 research
```

### Validation Command

```bash
# Run this to verify all required files exist
for file in \
  "MULTI-AGENT-PLAYBOOK.md" \
  "MULTI-AGENT-QUICKSTART.md" \
  "scripts/setup-multi-agent.sh" \
  ".claudecode/AGENT-STARTUP-PROTOCOL.md" \
  ".claudecode/RIGID-AGENT-PROMPTS.md" \
  ".claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md" \
  ".claudecode/workflows/WORKFLOW-2.0-PM-ORCHESTRATION.md" \
  ".claudecode/workflows/AGENT-VALIDATION-PROTOCOL.md" \
  ".claudecode/workflows/LINEAR-FIRST-PROTOCOL.md" \
  ".claudecode/workflows/GIT-ENVIRONMENT-PROTOCOL.md" \
  ".claudecode/templates/TEMPLATE-START.md" \
  ".claudecode/templates/TEMPLATE-ROLLBACK-PLAN.md" \
  ".claudecode/templates/TEMPLATE-COMPLETION.md" \
  ".claudecode/templates/TEMPLATE-PM-ASSIGNMENT.md"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ MISSING: $file"
  fi
done
```

---

## Git Environment Setup

### Create Required Branches

```bash
# Ensure you have the three-environment structure
git checkout main
git checkout -b develop
git push -u origin develop
git checkout main
```

### Verify Branch Structure

```bash
git branch -a | grep -E "main|develop"
# Should show:
#   develop
# * main
#   remotes/origin/develop
#   remotes/origin/main
```

---

## Worktree Setup

### Run Setup Script

```bash
./scripts/setup-multi-agent.sh your-project-name
```

This creates:
```
../your-project-worktrees/
├── agent-cto/      # CTO Agent worktree
├── agent-pm/       # PM Agent worktree
├── agent-qa/       # QA Agent worktree
├── backend-1/      # Backend-1 Agent worktree
├── backend-2/      # Backend-2 Agent worktree
├── frontend-a/     # Frontend-A Agent worktree
└── frontend-b/     # Frontend-B Agent worktree
```

---

## Agent Onboarding

### Starting a New Agent Session

1. **Navigate to worktree**
   ```bash
   cd /path/to/project-worktrees/[agent-name]
   claude
   ```

2. **Paste the rigid prompt from RIGID-AGENT-PROMPTS.md**
   - Open `.claudecode/RIGID-AGENT-PROMPTS.md`
   - Find your agent section
   - Copy the EXACT prompt
   - Paste into Claude

3. **Agent reads required documents**
   - The prompt instructs the agent to read all required files
   - Agent outputs Identity Declaration when ready

4. **Verify Safety Banner**
   - Every response must show the safety banner
   - If missing, agent has not completed startup

### Agent Startup Verification

Agent MUST output this after reading documents:

```
╔══════════════════════════════════════════════════════════════════╗
║  🔐 AGENT IDENTITY CONFIRMED                                     ║
╠══════════════════════════════════════════════════════════════════╣
║  Agent: [Agent Name]                                             ║
║  Model: Claude [Model]                                           ║
║  Domain: [Domain Description]                                    ║
║  Worktree: [Path]                                                ║
║  Branch: [Branch Name]                                           ║
╠══════════════════════════════════════════════════════════════════╣
║  📖 DOCUMENTS READ & UNDERSTOOD:                                 ║
║  ✅ [1] Agent Role Definition                                    ║
║  ✅ [2] Safety Framework                                         ║
║  ✅ [3] Workflow 2.0 Protocol                                    ║
║  ✅ [4] Validation Protocol                                      ║
║  ✅ [5] My Inbox                                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

**IF THIS IS NOT OUTPUT → DO NOT GIVE WORK**

---

## Customizing for Your Project

### 1. Update Agent Definitions

Edit `.claudecode/agents/[agent]-agent.md` files:
- Set correct domain boundaries (allowed/forbidden files)
- Define role for your project
- Update worktree paths

### 2. Update RIGID-AGENT-PROMPTS.md

Customize the domain rules for each dev agent:
```
MY DOMAIN (memorized):
✅ ALLOWED: [your project's file patterns]
❌ FORBIDDEN: [files other agents own]
```

### 3. Configure Linear Integration

- Create your project in Linear
- Update story ID patterns (e.g., `RZ-XXX` → `YOUR-XXX`)
- Link Linear workspace in protocol files

### 4. Set Up CI/CD

Ensure `.github/workflows/` includes:
- `test.yml` - triggers on main, develop, PRs
- `build.yml` - triggers on main, tags

---

## Quick Reference: Agent Startup Prompts

### CTO Agent
```bash
cd project-worktrees/agent-cto && claude
# Paste CTO prompt from RIGID-AGENT-PROMPTS.md
```

### PM Agent
```bash
cd project-worktrees/agent-pm && claude
# Paste PM prompt from RIGID-AGENT-PROMPTS.md
```

### QA Agent
```bash
cd project-worktrees/agent-qa && claude
# Paste QA prompt from RIGID-AGENT-PROMPTS.md
```

### Dev Agents
```bash
cd project-worktrees/backend-1 && claude  # Backend-1
cd project-worktrees/backend-2 && claude  # Backend-2
cd project-worktrees/frontend-a && claude # Frontend-A
cd project-worktrees/frontend-b && claude # Frontend-B
# Paste respective prompts from RIGID-AGENT-PROMPTS.md
```

---

## Protocols Summary

| Protocol | Purpose | File |
|----------|---------|------|
| Safety Framework | 6 gates, quality requirements | MANDATORY-SAFETY-FRAMEWORK.md |
| Workflow 2.0 | CTO→PM→Agent→QA→PM flow | WORKFLOW-2.0-PM-ORCHESTRATION.md |
| Validation | 8-layer agent validation | AGENT-VALIDATION-PROTOCOL.md |
| Linear-First | Source of truth for stories | LINEAR-FIRST-PROTOCOL.md |
| Git Environment | Dev→Staging→Production | GIT-ENVIRONMENT-PROTOCOL.md |

---

## Troubleshooting

### Agent Not Following Rules

1. Check if agent output Identity Declaration
2. Verify Safety Banner on every response
3. Re-paste rigid prompt if needed
4. Check if agent read all required documents

### Missing Worktrees

```bash
git worktree list  # See current worktrees
./scripts/setup-multi-agent.sh your-project  # Recreate
```

### Branch Issues

```bash
# Ensure develop exists
git checkout -b develop 2>/dev/null || git checkout develop
git push -u origin develop
```

### Files Out of Sync

```bash
# Re-deploy from source project
/path/to/source/scripts/deploy-framework-to-projects.sh
```

---

## Source of Truth

**Ringz** (`/Users/mymac/Desktop/ringz`) is the canonical source for:
- All protocol documents
- Agent prompts
- Templates
- Setup scripts

When updating protocols, update Ringz first, then deploy to other projects.

---

*Multi-Agent Framework Onboarding Guide v1.0*
*Last Updated: 2025-12-19*
