# UI-05: Confirmation Page UI - ROLLBACK PLAN

**Story**: UI-05
**Branch**: feature/ui-05-confirmation-page
**Start Tag**: UI-05-start

## Rollback Triggers

1. Tests fail consistently after implementation
2. TypeScript errors cannot be resolved
3. Breaking changes to existing order flow
4. Critical UI regression

## Rollback Procedure

### Option 1: Soft Rollback (Undo changes, keep branch)

```bash
# Reset to start tag
git reset --hard UI-05-start

# Force push if already pushed
git push origin feature/ui-05-confirmation-page --force
```

### Option 2: Hard Rollback (Abandon branch)

```bash
# Switch to main
git checkout main

# Delete the feature branch
git branch -D feature/ui-05-confirmation-page

# Delete remote branch if pushed
git push origin --delete feature/ui-05-confirmation-page
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
3. Verify order flow still works
4. Notify PM of rollback via inbox

## Files to Restore

| File | Restore From |
|------|--------------|
| `app/(app)/create/complete/page.tsx` | Keep existing or delete if new |
| `app/(app)/create/complete/page.test.tsx` | Delete if new |

## Contact

- PM Agent: `.claudecode/handoffs/pm-inbox.md`
- QA Agent: `.claudecode/handoffs/qa-inbox.md`
