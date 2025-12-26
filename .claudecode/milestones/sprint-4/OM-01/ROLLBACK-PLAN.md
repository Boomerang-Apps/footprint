# OM-01: Admin Order Dashboard - ROLLBACK PLAN

**Story**: OM-01
**Branch**: feature/om-01-admin-dashboard
**Start Tag**: OM-01-start

## Rollback Triggers

1. Tests fail consistently after implementation
2. TypeScript errors cannot be resolved
3. Breaking changes to existing admin functionality
4. Critical UI regression

## Rollback Procedure

### Option 1: Soft Rollback (Undo changes, keep branch)

```bash
# Reset to start tag
git reset --hard OM-01-start

# Force push if already pushed
git push origin feature/om-01-admin-dashboard --force
```

### Option 2: Hard Rollback (Abandon branch)

```bash
# Switch to main
git checkout main

# Delete the feature branch
git branch -D feature/om-01-admin-dashboard

# Delete remote branch if pushed
git push origin --delete feature/om-01-admin-dashboard
```

### Option 3: Partial Rollback (Selective revert)

```bash
# Identify problematic commits
git log --oneline

# Revert specific commit
git revert <commit-hash>
```

## Recovery Steps

1. Run tests to verify baseline: `npm test`
2. Check TypeScript: `npx tsc --noEmit`
3. Verify existing admin routes still work
4. Notify PM of rollback via inbox

## Files to Restore

| File | Restore From |
|------|--------------|
| `app/admin/page.tsx` | Delete if new |
| `app/admin/page.test.tsx` | Delete if new |
| `app/admin/layout.tsx` | Delete if new |

## Contact

- PM Agent: `.claudecode/handoffs/pm-inbox.md`
- QA Agent: `.claudecode/handoffs/qa-inbox.md`
