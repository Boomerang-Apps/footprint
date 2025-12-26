# INT-05: Rollback Plan

## Story
**ID**: INT-05
**Title**: Connect Confirmation to Order API

## Rollback Trigger Conditions
- API integration breaks confirmation page
- Loading states cause poor UX
- Error handling not working properly
- WhatsApp share fails with API data

## Rollback Steps

### 1. Git Rollback
```bash
# Revert to pre-INT-05 state
git checkout main
git branch -D feature/int-05-confirmation-order-api

# Or revert specific commit
git revert <commit-hash>
```

### 2. Files to Restore
| File | Action |
|------|--------|
| `app/(app)/create/complete/page.tsx` | Restore static data version |
| `app/(app)/create/complete/page.test.tsx` | Remove API integration tests |

### 3. No Data Cleanup
- Feature is read-only (fetches data, doesn't create)
- No database changes to revert

## Fallback Behavior
If API fails or orderId not provided:
1. Use existing orderStore data (fallback)
2. Generate client-side order number
3. Page continues to work without API

## Recovery Time Estimate
- Git rollback: < 5 minutes
- Testing: 10 minutes
- Total: 15 minutes

## Prevention Measures
- TDD ensures API integration tested
- Graceful fallback to store data
- Loading state prevents content flash
- Error boundary for unexpected failures
- WhatsApp URL has fallback generation

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API unavailable | Low | Medium | Fallback to store data |
| Invalid orderId | Medium | Low | Error message + home link |
| Slow API | Low | Low | Loading skeleton |

---
**Created**: 2025-12-26
**Agent**: Frontend-B
