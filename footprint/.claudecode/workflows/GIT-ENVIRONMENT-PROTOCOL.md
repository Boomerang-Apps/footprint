# Git Environment & CI/CD Protocol v1.0

**Status**: MANDATORY
**Enforcement**: All agents, all branches, no exceptions

---

## Three-Environment Strategy

```
╔══════════════════════════════════════════════════════════════════╗
║  🌳 GIT BRANCHING STRATEGY                                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PRODUCTION ──────────────────────────────────────────────────   ║
║       │                                                          ║
║       │  main                                                    ║
║       │  └── Protected branch                                    ║
║       │  └── Triggers: production build                          ║
║       │  └── Deploys to: App Store / Play Store                  ║
║       │                                                          ║
║  STAGING ─────────────────────────────────────────────────────   ║
║       │                                                          ║
║       │  develop                                                 ║
║       │  └── Integration branch                                  ║
║       │  └── Triggers: preview build                             ║
║       │  └── Deploys to: TestFlight / Internal Track             ║
║       │                                                          ║
║  DEVELOPMENT ─────────────────────────────────────────────────   ║
║       │                                                          ║
║       │  feature/RZ-XXX-description                              ║
║       │  └── Agent working branches                              ║
║       │  └── Triggers: CI tests only                             ║
║       │  └── Deploys to: nothing (local dev)                     ║
║       │                                                          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Branch Hierarchy

### 1. Production: `main`

| Attribute | Value |
|-----------|-------|
| Purpose | Production-ready code |
| Protection | PROTECTED - Requires PR |
| Merge from | `develop` only |
| Merge frequency | Release cycles |
| EAS Profile | `production` |
| Environment | `EXPO_PUBLIC_ENV=production` |
| Distribution | App Store, Play Store |

**Rules**:
- NEVER commit directly to main
- ONLY merge from develop via PR
- Requires PM approval
- Requires all CI checks passing
- Tagged with version: `v1.0.0`

### 2. Staging: `develop`

| Attribute | Value |
|-----------|-------|
| Purpose | Integration & testing |
| Protection | PROTECTED - Requires PR |
| Merge from | `feature/*` branches |
| Merge frequency | Per completed story |
| EAS Profile | `preview` |
| Environment | `EXPO_PUBLIC_ENV=preview` |
| Distribution | TestFlight, Internal Track |

**Rules**:
- Feature branches merge here first
- QA validation happens on develop builds
- PM approves all merges
- Tagged with story: `RZ-XXX-complete`

### 3. Development: `feature/*`

| Attribute | Value |
|-----------|-------|
| Purpose | Active development |
| Protection | None |
| Merge to | `develop` only |
| Merge frequency | When story complete |
| EAS Profile | `development` |
| Environment | `EXPO_PUBLIC_ENV=development` |
| Distribution | Local simulators only |

**Naming Convention**:
```
feature/RZ-XXX-short-description
fix/RZ-XXX-bug-description
test/RZ-XXX-test-description
hotfix/RZ-XXX-critical-fix
```

---

## Workflow: Feature to Production

```
┌─────────────────────────────────────────────────────────────────┐
│  FEATURE DEVELOPMENT FLOW                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. AGENT CREATES FEATURE BRANCH                                 │
│     ┌──────────────────────────────────────────┐                │
│     │ git checkout develop                      │                │
│     │ git pull origin develop                   │                │
│     │ git checkout -b feature/RZ-XXX-desc       │                │
│     └──────────────────────────────────────────┘                │
│                           │                                      │
│                           ▼                                      │
│  2. AGENT DEVELOPS (TDD)                                         │
│     ┌──────────────────────────────────────────┐                │
│     │ Write tests → Implement → Commit          │                │
│     │ git push origin feature/RZ-XXX-desc       │                │
│     └──────────────────────────────────────────┘                │
│                           │                                      │
│                           ▼                                      │
│  3. QA VALIDATES                                                 │
│     ┌──────────────────────────────────────────┐                │
│     │ npm test -- --coverage                    │                │
│     │ Verify 80%+ coverage                      │                │
│     │ Approve → qa-inbox.md                     │                │
│     └──────────────────────────────────────────┘                │
│                           │                                      │
│                           ▼                                      │
│  4. PM MERGES TO DEVELOP                                         │
│     ┌──────────────────────────────────────────┐                │
│     │ git checkout develop                      │                │
│     │ git merge --no-ff feature/RZ-XXX-desc     │                │
│     │ git push origin develop                   │                │
│     │ git tag RZ-XXX-complete                   │                │
│     └──────────────────────────────────────────┘                │
│                           │                                      │
│                           ▼                                      │
│  5. PREVIEW BUILD TRIGGERS                                       │
│     ┌──────────────────────────────────────────┐                │
│     │ CI/CD: eas build --profile preview        │                │
│     │ TestFlight / Internal Track               │                │
│     └──────────────────────────────────────────┘                │
│                           │                                      │
│                           ▼                                      │
│  6. PM RELEASES TO PRODUCTION (Sprint End)                       │
│     ┌──────────────────────────────────────────┐                │
│     │ git checkout main                         │                │
│     │ git merge --no-ff develop                 │                │
│     │ git push origin main                      │                │
│     │ git tag v1.X.0                            │                │
│     └──────────────────────────────────────────┘                │
│                           │                                      │
│                           ▼                                      │
│  7. PRODUCTION BUILD TRIGGERS                                    │
│     ┌──────────────────────────────────────────┐                │
│     │ CI/CD: eas build --profile production     │                │
│     │ App Store / Play Store                    │                │
│     └──────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `test.yml` | Push to main, develop, PR | Lint, TypeScript, Tests |
| `build.yml` | Push to main, tags | EAS Build |
| `deploy.yml` | Tags `v*` | App Store Submit |

### test.yml Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

### build.yml Logic

| Event | Profile | Result |
|-------|---------|--------|
| Push to develop | preview | TestFlight build |
| Push to main | preview | TestFlight build |
| Tag `v*` | production | App Store build |
| Manual dispatch | selected | On-demand build |

---

## EAS Build Profiles

### eas.json Configuration

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_ENV": "preview" },
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "env": { "EXPO_PUBLIC_ENV": "production" },
      "channel": "production"
    }
  }
}
```

### Environment Variables by Profile

| Profile | EXPO_PUBLIC_ENV | Supabase | Other APIs |
|---------|-----------------|----------|------------|
| development | development | Local/Dev instance | Sandbox |
| preview | preview | Staging instance | Sandbox |
| production | production | Production instance | Live |

---

## Branch Protection Rules

### main Branch

```
Required:
- [ ] Require pull request before merging
- [ ] Require approvals: 1 (PM)
- [ ] Require status checks: lint, typecheck, test
- [ ] Require branches to be up to date
- [ ] Do not allow bypassing settings
```

### develop Branch

```
Required:
- [ ] Require pull request before merging
- [ ] Require status checks: lint, typecheck, test
- [ ] Allow PM to bypass for emergency fixes
```

---

## Agent Branch Rules

### BEFORE Starting Work

```bash
# 1. Ensure you're on develop
git checkout develop

# 2. Pull latest
git pull origin develop

# 3. Create feature branch FROM develop
git checkout -b feature/RZ-XXX-description

# 4. Verify you're on correct branch
git branch --show-current
# Expected: feature/RZ-XXX-description
```

### DURING Development

```bash
# Push regularly to remote
git push origin feature/RZ-XXX-description

# Keep sync with develop
git fetch origin develop
git merge origin/develop
# Resolve conflicts if any
```

### AFTER Completion

```bash
# 1. Final push
git push origin feature/RZ-XXX-description

# 2. Request merge to develop via inbox
# Write to pm-inbox.md requesting merge

# AGENTS NEVER MERGE DIRECTLY
# PM handles all merges to develop and main
```

---

## Merge Responsibilities

### PM Agent Merges to Develop

```bash
# After QA approval
git checkout develop
git pull origin develop
git merge --no-ff feature/RZ-XXX-description -m "Merge feature/RZ-XXX: [Title]"
git push origin develop
git tag RZ-XXX-complete
git push origin RZ-XXX-complete
```

### PM Agent Releases to Main

```bash
# At sprint end or release point
git checkout main
git pull origin main
git merge --no-ff develop -m "Release: Sprint X complete"
git push origin main
git tag vX.Y.Z
git push origin vX.Y.Z
```

---

## Hotfix Protocol

For critical production bugs:

```
╔══════════════════════════════════════════════════════════════════╗
║  🚨 HOTFIX FLOW                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  1. Create hotfix branch from main                               ║
║     git checkout main                                            ║
║     git checkout -b hotfix/RZ-XXX-critical-fix                   ║
║                                                                  ║
║  2. Fix and test                                                 ║
║     [Make minimal fix]                                           ║
║     npm test                                                     ║
║                                                                  ║
║  3. PM merges to main AND develop                                ║
║     git checkout main                                            ║
║     git merge --no-ff hotfix/RZ-XXX-critical-fix                 ║
║     git tag vX.Y.Z                                               ║
║                                                                  ║
║     git checkout develop                                         ║
║     git merge --no-ff hotfix/RZ-XXX-critical-fix                 ║
║                                                                  ║
║  4. Production build triggers automatically                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Validation Checklist

### Before Creating Feature Branch

- [ ] On develop branch
- [ ] Pulled latest from origin
- [ ] Branch name follows convention: `feature/RZ-XXX-desc`

### Before Requesting Merge

- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] TypeScript clean
- [ ] ESLint clean
- [ ] Linear updated
- [ ] QA approved

### Before PM Merges to Develop

- [ ] QA approval in qa-inbox.md
- [ ] All CI checks green
- [ ] No merge conflicts
- [ ] Story complete per Linear

### Before PM Releases to Main

- [ ] All sprint stories complete
- [ ] Develop branch stable
- [ ] TestFlight testing complete
- [ ] Version tag prepared

---

## Environment Configuration

### Supabase Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:54321 | Local dev |
| Preview | [project]-staging.supabase.co | Staging |
| Production | [project].supabase.co | Live |

### API Keys (Secrets)

| Secret | Development | Preview | Production |
|--------|-------------|---------|------------|
| SUPABASE_URL | Local | Staging | Production |
| SUPABASE_ANON_KEY | Dev key | Staging key | Prod key |
| TWILIO_* | Sandbox | Sandbox | Live |
| REVENUECAT_* | Sandbox | Sandbox | Live |

---

## Rollback Procedures

### Rollback Develop

```bash
# Revert last merge
git checkout develop
git revert -m 1 HEAD
git push origin develop
```

### Rollback Production

```bash
# Revert and re-release
git checkout main
git revert -m 1 HEAD
git push origin main
git tag vX.Y.Z-hotfix
git push origin vX.Y.Z-hotfix
```

---

## Integration with Safety Gates

| Gate | Branch State | CI/CD |
|------|--------------|-------|
| Gate 0 | No branch yet | None |
| Gate 1 | feature/* created | Tests run |
| Gate 2 | feature/* commits | Tests run |
| Gate 3 | feature/* ready | Tests run |
| Gate 4 | PR to develop | Tests required |
| Gate 5 | Merged to develop | Preview build |
| Release | Merged to main | Production build |

---

## Summary

```
╔══════════════════════════════════════════════════════════════════╗
║  ENVIRONMENT SUMMARY                                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  BRANCH          ENVIRONMENT       BUILD PROFILE                 ║
║  ──────────────────────────────────────────────────────────────  ║
║  main            Production        production → App Store        ║
║  develop         Staging           preview → TestFlight          ║
║  feature/*       Development       development → Simulator       ║
║                                                                  ║
║  MERGE FLOW                                                      ║
║  ──────────────────────────────────────────────────────────────  ║
║  feature/* → develop → main                                      ║
║  (Agent)      (PM)      (PM)                                     ║
║                                                                  ║
║  PROTECTION                                                      ║
║  ──────────────────────────────────────────────────────────────  ║
║  main: PR required, PM approval, all checks pass                 ║
║  develop: PR required, all checks pass                           ║
║  feature/*: No protection, agent workspace                       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

**Git Environment Protocol v1.0**
*Last Updated: 2025-12-19*
