# UI-04: Checkout Page UI - ROLLBACK PLAN

**Story**: UI-04
**Branch**: feature/ui-04-checkout-page
**Start Tag**: UI-04-start

## Rollback Triggers

1. Tests fail consistently after implementation
2. TypeScript errors cannot be resolved
3. Breaking changes to order flow
4. Critical UI regression

## Rollback Procedure

### Option 1: Soft Rollback (Undo changes, keep branch)

```bash
# Reset to start tag
git reset --hard UI-04-start

# Force push if already pushed
git push origin feature/ui-04-checkout-page --force
```

### Option 2: Hard Rollback (Abandon branch)

```bash
# Switch to previous branch
git checkout feature/ui-03-customize-page

# Delete the feature branch
git branch -D feature/ui-04-checkout-page

# Delete remote branch if pushed
git push origin --delete feature/ui-04-checkout-page
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
3. Verify existing checkout page still works
4. Notify PM of rollback via inbox

## Files to Restore

| File | Restore From |
|------|--------------|
| `app/(app)/create/checkout/page.tsx` | UI-04-start tag |
| `app/(app)/create/checkout/page.test.tsx` | Delete if new |

## Contact

- PM Agent: `.claudecode/handoffs/pm-inbox.md`
- QA Agent: `.claudecode/handoffs/qa-inbox.md`
