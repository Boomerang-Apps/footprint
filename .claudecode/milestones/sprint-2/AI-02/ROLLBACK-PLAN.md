# ROLLBACK-PLAN.md - AI-02: Preview Photo in Different Styles

**Story**: AI-02
**Branch**: `feature/AI-02-style-transform`
**Tag**: `AI-02-start`
**Created**: 2025-12-23

---

## Rollback Triggers

Initiate rollback if any of the following occur:

1. **API Failure**: Replicate API error rate >50% for >5 minutes
2. **Performance**: Transformation time consistently >30 seconds
3. **Cost Overrun**: Daily API costs exceed $50
4. **Security**: API token exposure or unauthorized access
5. **Data Loss**: Transformed images not saving to R2
6. **Breaking Changes**: Type errors or test failures in dependent code

---

## Files to Delete (Safe Removal)

These files can be safely deleted as they are new and have no dependencies:

```bash
# AI module
rm footprint/lib/ai/replicate.ts
rm footprint/lib/ai/replicate.test.ts

# API route
rm -rf footprint/app/api/transform/
```

---

## Files to Restore (If Modified)

```bash
# If r2.ts was modified for transformed folder support
git checkout AI-02-start -- footprint/lib/storage/r2.ts
```

---

## Rollback Commands

### Quick Rollback (Keep Branch)

```bash
# From feature/AI-02-style-transform branch
git reset --hard AI-02-start
git clean -fd
```

### Full Rollback (Delete Branch)

```bash
git checkout main
git branch -D feature/AI-02-style-transform
git push origin --delete feature/AI-02-style-transform  # If pushed
```

### Selective Rollback (Keep Some Changes)

```bash
# Remove only AI-related files, keep other changes
git rm footprint/lib/ai/replicate.ts
git rm footprint/lib/ai/replicate.test.ts
git rm -rf footprint/app/api/transform/
git commit -m "rollback(AI-02): remove AI transformation (issues encountered)"
```

---

## Fallback Behavior

If AI transformation is rolled back, the system should:

1. **Immediate**:
   - Disable style transformation in UI (Frontend-B handles)
   - Show "Coming Soon" for AI styles
   - Allow "Original Enhanced" as only option

2. **User Experience**:
   - Users can still upload and purchase with original photo
   - No broken functionality

3. **Monitoring**:
   - Log rollback event
   - Alert team via monitoring system

---

## Recovery Steps (Post-Rollback)

After rollback, to retry implementation:

1. Investigate root cause
2. Create new branch from main
3. Apply fixes based on findings
4. Re-implement with additional safeguards

---

## Environment Cleanup

No environment variables need to be removed. `REPLICATE_API_TOKEN` can remain for future use.

---

## Dependencies Check

Before rollback, verify:
- [ ] No other code depends on `lib/ai/replicate.ts`
- [ ] No frontend components calling `/api/transform`
- [ ] No database migrations (none expected)

---

## Rollback Verification

After rollback, verify:

```bash
# Tests should still pass
npm test

# Type check should pass
npm run type-check

# Lint should pass
npm run lint

# App should start without errors
npm run dev
```

---

**Last Updated**: 2025-12-23
*Created by Backend-2 Agent*
