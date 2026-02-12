import { dashboardConfig, type Story } from '@/data/dashboard/dev-progress';

export function generateAgentPrompt(story: Story): string {
  const linearUrl = story.linearId
    ? `https://linear.app/${dashboardConfig.linearWorkspace}/issue/${story.linearId}`
    : 'N/A';

  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🛡️  SAFETY PROTOCOL ACTIVE - ${dashboardConfig.name.toUpperCase()}
║  ✅ Workflow 2.0: CTO → PM → Agent → QA → PM
║  ✅ Gates: 0→1→2→3→4→5
║  📋 Story: ${story.id} | Agent: ${story.agent || 'Unassigned'}
╚══════════════════════════════════════════════════════════════════════════════╝

## Agent Identity Declaration

**Model**: Claude (Sonnet 4 / Opus 4.5)
**Role**: ${story.agent || 'Developer'}
**Story**: ${story.id}
**Linear**: ${linearUrl}

---

## 📋 Story Details

**ID**: ${story.id}
**Title**: ${story.title}
**Description**: ${story.description || 'See Linear for full details'}
**Status**: ${story.status}
**Points**: ${story.points || 'Not estimated'}
**Component**: ${story.component || 'General'}
${story.blockedBy?.length ? `**Blocked By**: ${story.blockedBy.join(', ')}` : ''}

---

## ✅ Agent Checklist

Before starting work, confirm:

1. [ ] **Read CLAUDE.md** - Understand project context and coding conventions
2. [ ] **Verify Worktree** - Working in isolated worktree for this story
3. [ ] **Read Full Story** - Open Linear link and read all acceptance criteria
4. [ ] **Check Dependencies** - Ensure blockers are resolved

---

## 🚀 Workflow Steps

### Gate 1 - Planning
\`\`\`bash
# Create feature branch
git checkout -b feature/${story.id.toLowerCase()}-[description]

# Create gate files
mkdir -p .claudecode/milestones/sprint-X/${story.id}/
touch .claudecode/milestones/sprint-X/${story.id}/START.md
touch .claudecode/milestones/sprint-X/${story.id}/ROLLBACK-PLAN.md

# Tag start point
git tag ${story.id}-start
\`\`\`

### Gate 2 - TDD Implementation
1. Write tests FIRST (target 80%+ coverage)
2. Implement to pass tests
3. Refactor if needed
4. Run: \`npm test && npx tsc --noEmit\`

### Gate 3 - Ready for QA
1. All tests passing
2. TypeScript clean (0 errors)
3. Lint clean
4. Update PM inbox: \`.claudecode/handoffs/pm-inbox.md\`

---

## 📝 PM Notification Template

When ready for QA, write to \`pm-inbox.md\`:

\`\`\`markdown
## ${story.id} Ready for QA

**From**: ${story.agent || 'Developer'}
**Date**: [DATE]
**Status**: Gate 2 Complete - Ready for QA

### Summary
- [What was implemented]
- [Key decisions made]

### Test Results
- Tests: XX passing
- Coverage: XX%
- TypeScript: 0 errors

### Files Changed
- [List main files]

Ready for Gate 3 QA validation.
\`\`\`

---

## ⚠️ Safety Reminders

- **NEVER** merge without QA approval
- **NEVER** skip gates
- **ALWAYS** work in isolated worktree
- **ALWAYS** write tests first (TDD)
- **ALWAYS** update PM on progress

---

**Start by displaying this banner, then proceed with Gate 1.**
`.trim();
}
