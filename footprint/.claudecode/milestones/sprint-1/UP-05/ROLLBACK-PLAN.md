# UP-05: Rollback Plan

**Story**: UP-05 - Face Detection Cropping
**Agent**: Backend-2
**Branch**: feature/UP-05-face-detection-cropping
**Start Tag**: UP-05-start

---

## Rollback Triggers

Execute rollback if ANY of these occur:
- [ ] Face detection accuracy < 70% on test images
- [ ] smartcrop-sharp has critical security vulnerability
- [ ] Processing time > 5 seconds per image
- [ ] Memory usage exceeds server limits
- [ ] Tests cannot achieve 80% coverage
- [ ] TypeScript errors cannot be resolved
- [ ] Integration breaks existing image pipeline

---

## Rollback Steps

### Step 1: Revert to Start Tag
```bash
# Ensure we're on the feature branch
git checkout feature/UP-05-face-detection-cropping

# Reset to starting point
git reset --hard UP-05-start

# Force push if already pushed (with caution)
# git push --force origin feature/UP-05-face-detection-cropping
```

### Step 2: Remove New Files
```bash
# Files created by this story (safe to delete)
rm -f footprint/lib/image/faceDetection.ts
rm -f footprint/lib/image/faceDetection.test.ts
rm -f footprint/app/api/detect-crop/route.ts
rm -f footprint/app/api/detect-crop/route.test.ts
```

### Step 3: Revert Package Changes
```bash
# Remove smartcrop-sharp if added
npm uninstall smartcrop-sharp
```

### Step 4: Verify Clean State
```bash
# Run tests to ensure no regressions
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Files Safe to Delete

| File | Reason |
|------|--------|
| `lib/image/faceDetection.ts` | New file, no dependencies |
| `lib/image/faceDetection.test.ts` | Test file only |
| `app/api/detect-crop/route.ts` | New API, not integrated |
| `app/api/detect-crop/route.test.ts` | Test file only |

---

## Files Modified (Need Careful Revert)

| File | Changes | Revert Method |
|------|---------|---------------|
| `package.json` | Added smartcrop-sharp | `npm uninstall smartcrop-sharp` |
| `package-lock.json` | Auto-updated | Regenerate with `npm install` |

---

## Notification on Rollback

If rollback is executed, notify:
1. PM Agent via `.claudecode/handoffs/pm-inbox.md`
2. Include:
   - Reason for rollback
   - Trigger that caused it
   - Recommended next steps

### Rollback Notification Template

```markdown
## [DATE] - Backend-2: UP-05 ROLLBACK

**Story**: UP-05 - Face Detection Cropping
**Status**: ROLLED BACK

### Reason
[Describe trigger that caused rollback]

### Actions Taken
- Reverted to UP-05-start tag
- Removed new files
- Verified tests still pass

### Recommendation
[Suggest alternative approach or defer story]
```

---

## Alternative Approaches (If Rollback Needed)

1. **Use face-api.js instead**: More accurate but heavier
2. **Use Replicate face detection**: External API, needs Gate 0
3. **Defer feature**: Release without face detection
4. **Simple center crop**: Basic cropping without face detection

---

*Rollback plan created by Backend-2 Agent - 2025-12-26*
