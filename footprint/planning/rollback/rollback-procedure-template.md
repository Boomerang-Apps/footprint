# Rollback Procedure Template

## Story: {STORY-ID}

### Pre-Rollback Checklist
- [ ] Incident confirmed and documented
- [ ] Stakeholders notified
- [ ] Current state captured (logs, metrics)

### Rollback Steps

#### Database Changes (if applicable)
```sql
-- Revert migration
-- Example: DROP TABLE IF EXISTS new_table;
```

#### Code Rollback
```bash
# Identify the last good commit
git log --oneline -10

# Revert to specific commit
git revert {commit-hash}

# Or reset branch (if not pushed)
git reset --hard {commit-hash}
```

#### Environment Variables
- List any environment variables to revert

#### External Services
- List any external service configurations to revert

### Post-Rollback Verification

1. [ ] Build passes: `pnpm build`
2. [ ] Tests pass: `pnpm test:run`
3. [ ] Application starts: `pnpm dev`
4. [ ] Smoke test critical paths
5. [ ] Monitor error rates

### Communication Template

```
Subject: [ROLLBACK] {STORY-ID} - {Brief Description}

Status: Rollback initiated/completed
Reason: {Why rollback was needed}
Impact: {What was affected}
Resolution: {Next steps}
ETA for fix: {If applicable}
```

### Lessons Learned
- What caused the issue?
- What could prevent this in the future?
- Process improvements needed?
