# UI-07 Rollback Plan

**Story**: UI-07 - Base UI Primitives
**Branch**: feature/ui-07-base-primitives
**Start Tag**: UI-07-start

---

## Rollback Command

```bash
# If need to abort and rollback:
git checkout agent/frontend-a
git branch -D feature/ui-07-base-primitives
git tag -d UI-07-start
```

---

## Files Created

All new files - safe to delete:
- components/ui/Button.tsx
- components/ui/Button.test.tsx
- components/ui/Card.tsx
- components/ui/Card.test.tsx
- components/ui/Input.tsx
- components/ui/Input.test.tsx
- components/ui/Select.tsx
- components/ui/Select.test.tsx
- components/ui/Checkbox.tsx
- components/ui/Checkbox.test.tsx
- components/ui/Badge.tsx
- components/ui/Badge.test.tsx
- components/ui/index.ts
- components/ui/utils.ts

---

## No Breaking Changes

This story creates new components only.
No existing code modified.
No breaking changes to existing features.

---

## Verification

After rollback, verify:
```bash
npm test -- --run
npm run type-check
npm run lint
```

All should pass as before UI-07.
