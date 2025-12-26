# PC-05: Rollback Plan

## Story
**ID**: PC-05
**Title**: Realistic Mockup Preview

## Rollback Trigger Conditions
- Room preview breaks customize page layout
- Performance issues with image rendering
- Visual bugs on mobile devices
- User testing indicates confusion vs simple preview

## Rollback Steps

### 1. Git Rollback
```bash
# Revert to pre-PC-05 state
git checkout main
git branch -D feature/pc-05-realistic-mockup-preview

# Or revert specific commit
git revert <commit-hash>
```

### 2. Files to Restore/Delete
| File | Action |
|------|--------|
| `components/mockup/RoomPreview.tsx` | Delete |
| `components/mockup/RoomPreview.test.tsx` | Delete |
| `app/(app)/create/customize/page.tsx` | Restore original preview |
| `app/(app)/create/customize/page.test.tsx` | Remove room preview tests |

### 3. No Data Cleanup
- Feature is UI-only, no database changes
- No API integrations to revert

## Fallback Behavior
If room preview fails:
1. Graceful fallback to simple preview (current implementation)
2. Error boundary catches render failures
3. Simple preview always available as toggle option

## Recovery Time Estimate
- Git rollback: < 5 minutes
- Testing: 10 minutes
- Total: 15 minutes

## Prevention Measures
- TDD ensures preview renders correctly
- Error boundary wraps room preview component
- Toggle allows users to switch views
- Mobile-first responsive testing
- Performance testing for image loading

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Layout breakage | Low | Medium | Keep toggle to simple view |
| Mobile perf | Medium | Low | Lazy load room assets |
| User confusion | Low | Low | Clear toggle UI |

---
**Created**: 2025-12-26
**Agent**: Frontend-B
