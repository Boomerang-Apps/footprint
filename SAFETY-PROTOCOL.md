# Safety Protocol & Git Workflow

This document establishes the safety protocols for the Footprint project, including Git branching strategy, milestone tagging, and rollback procedures.

## Git Branching Strategy

### Branch Types

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production-ready code | Protected, requires PR |
| `feature/*` | New features | Merged via PR |
| `fix/*` | Bug fixes | Merged via PR |
| `agent/*` | WAVE agent work branches | Auto-created by agents |
| `wave{N}-*` | Wave-specific development | Merged after QA approval |

### Branch Naming Convention

```
feature/{ticket-id}-{short-description}
fix/{ticket-id}-{short-description}
agent/{agent-type}-{wave-number}
wave{N}-{worktree-name}
```

**Examples:**
- `feature/AI-02-style-transform`
- `fix/CO-03-payment-error`
- `agent/frontend-a`
- `wave3-fe-dev`

### Protected Branches

**main branch rules:**
- ✅ Require pull request before merging
- ✅ Require at least 1 approval
- ✅ Require status checks to pass (CI)
- ✅ Require branches to be up to date
- ❌ No force pushes
- ❌ No deletions

## Milestone & Tagging Strategy

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Tag Format

```
v{MAJOR}.{MINOR}.{PATCH}[-{prerelease}]
```

**Examples:**
- `v1.0.0` - First production release
- `v1.1.0` - New feature added
- `v1.1.1` - Bug fix
- `v2.0.0-beta.1` - Beta release with breaking changes

### Creating Tags

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial production release"

# Push tag to remote
git push origin v1.0.0

# Push all tags
git push origin --tags
```

### Milestone Checkpoints

| Milestone | Tag Pattern | Trigger |
|-----------|-------------|---------|
| Wave Complete | `wave{N}-complete` | All wave stories merged |
| Sprint Release | `v{X}.{Y}.0` | Sprint end |
| Hotfix | `v{X}.{Y}.{Z}` | Critical bug fix |
| Production Deploy | `prod-{YYYYMMDD}` | Vercel production deploy |

## Rollback Procedures

### Level 1: Revert Last Commit

**When:** Single bad commit on main

```bash
# Revert the last commit (creates new commit)
git revert HEAD
git push origin main
```

### Level 2: Revert Specific Commit

**When:** Specific commit caused issues

```bash
# Find the commit hash
git log --oneline -10

# Revert specific commit
git revert <commit-hash>
git push origin main
```

### Level 3: Revert Merge Commit

**When:** Entire PR/merge caused issues

```bash
# Find the merge commit
git log --oneline --merges -5

# Revert merge (specify parent)
git revert -m 1 <merge-commit-hash>
git push origin main
```

### Level 4: Reset to Tag (Emergency)

**When:** Multiple commits need rollback, have a known good tag

```bash
# ⚠️ DANGEROUS - Requires force push
# Only use in emergencies with team coordination

# Reset to specific tag
git reset --hard v1.0.0

# Force push (requires admin override)
git push --force-with-lease origin main
```

### Level 5: Vercel Rollback

**When:** Production deployment issues

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback [deployment-url]
```

## Emergency Stop Procedure

### Triggering Emergency Stop

Create emergency stop file to halt all WAVE automation:

```bash
touch .claude/EMERGENCY_STOP
git add .claude/EMERGENCY_STOP
git commit -m "EMERGENCY STOP: [reason]"
git push origin main
```

### Clearing Emergency Stop

```bash
rm .claude/EMERGENCY_STOP
git add .claude/EMERGENCY_STOP
git commit -m "Clear emergency stop: [resolution]"
git push origin main
```

## Pre-Merge Checklist

Before merging any PR to main:

- [ ] All CI checks pass (type-check, lint, test, build)
- [ ] Code reviewed and approved
- [ ] No merge conflicts
- [ ] Branch is up to date with main
- [ ] For waves: QA agent approval signal exists
- [ ] No EMERGENCY_STOP file active

## Audit Trail

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Required Metadata

All significant changes must include:
- Commit author (human or AI agent)
- Co-author attribution for AI-assisted commits
- Reference to story/ticket ID when applicable

## Recovery Contacts

| Role | Action |
|------|--------|
| **Developer** | Revert commits, create fix branches |
| **Tech Lead** | Approve force pushes, coordinate rollbacks |
| **DevOps** | Vercel rollbacks, infrastructure issues |

---

**Last Updated:** 2026-01-23
**Version:** 1.0.0
