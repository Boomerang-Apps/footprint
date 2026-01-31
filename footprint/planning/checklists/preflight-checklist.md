# Wave V2 Pre-Flight Checklist

## Gate 0: Pre-Flight Authorization

### Safety Systems
- [ ] Emergency stop file check: `.claude/EMERGENCY-STOP` does not exist
- [ ] Constitutional AI principles loaded from `.claude/safety/constitutional.json`
- [ ] Budget tracking initialized
- [ ] Domain isolation configured

### Environment Validation
- [ ] Required environment variables present:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Node.js version compatible (18+)
- [ ] pnpm available

### Repository State
- [ ] Git repository clean or changes staged
- [ ] On correct feature branch
- [ ] No merge conflicts

### Dependencies
- [ ] `pnpm install` completes without errors
- [ ] No security vulnerabilities (critical)
- [ ] TypeScript types resolve

### Build Verification
- [ ] `pnpm build` completes successfully
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Test Baseline
- [ ] `pnpm test:run` passes
- [ ] Coverage meets threshold (70%)

---

## Checklist Status

| Check | Status | Notes |
|-------|--------|-------|
| Safety Systems | Pending | |
| Environment | Pending | |
| Repository | Pending | |
| Dependencies | Pending | |
| Build | Pending | |
| Tests | Pending | |

---

## Authorization

- **Validated By**:
- **Timestamp**:
- **Gate 0 Lock**: `.claude/PREFLIGHT.lock`
