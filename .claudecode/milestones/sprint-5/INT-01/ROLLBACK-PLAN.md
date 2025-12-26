# INT-01: Rollback Plan

## Story
**ID**: INT-01
**Title**: Connect Upload to R2 Storage

## Rollback Trigger Conditions
- Upload API integration breaks existing functionality
- Upload failures not properly handled
- Performance degradation on upload page
- R2 storage costs unexpectedly high

## Rollback Steps

### 1. Git Rollback
```bash
# Revert to pre-INT-01 state
git checkout main
git branch -D feature/int-01-upload-r2-integration

# Or revert specific commit
git revert <commit-hash>
```

### 2. Files to Restore
| File | Action |
|------|--------|
| `stores/orderStore.ts` | Remove upload state fields |
| `app/(app)/create/page.tsx` | Restore local blob URL handling |
| `hooks/useUpload.ts` | Delete if created |

### 3. State Cleanup
- Clear localStorage `footprint-order` key if schema changed
- Users may need to re-upload images

## Fallback Behavior
If upload API fails:
1. Show error message to user
2. Allow retry
3. If persistent, fall back to local blob URL (demo mode)

## Recovery Time Estimate
- Git rollback: < 5 minutes
- Testing: 15 minutes
- Total: 20 minutes

## Prevention Measures
- TDD ensures upload flow tested before merge
- Error boundaries catch upload failures
- Retry logic for transient errors

---
**Created**: 2025-12-26
**Agent**: Frontend-B
