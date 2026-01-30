# AUTH-02 Rollback Plan
**Agent**: Backend-1
**Date**: 2026-01-27
**Branch**: feature/AUTH-02-guest-state

## Rollback Strategy

### Git-based Rollback
```bash
# Return to pre-implementation state
git checkout main
git branch -D feature/AUTH-02-guest-state

# Or reset to start tag
git reset --hard AUTH-02-backend-start
```

### Manual Rollback (if partially merged)

#### 1. Remove Guest Validation Module
```bash
rm footprint/lib/auth/guest.ts
rm footprint/lib/auth/guest.test.ts
```

#### 2. Revert orderStore Changes
```typescript
// Remove from OrderState interface:
- isGuest: boolean;
- guestInfo: GuestInfo | null;

// Remove from OrderActions interface:
- setIsGuest: (value: boolean) => void;
- setGuestInfo: (info: GuestInfo) => void;
- clearGuestInfo: () => void;

// Remove from initialState:
- isGuest: false,
- guestInfo: null,

// Remove from partialize:
- isGuest: state.isGuest,
- guestInfo: state.guestInfo,

// Remove from implementation:
- setIsGuest, setGuestInfo, clearGuestInfo functions
```

#### 3. Revert Test Changes
```bash
# Remove guest tests from orderStore.test.ts
# Or restore from git:
git checkout main -- footprint/stores/orderStore.test.ts
```

#### 4. Clean Dependencies
```bash
# If Zod was added:
npm uninstall zod
```

#### 5. Verify Rollback
```bash
npm run type-check
npm test
npm run lint
```

## Verification Checklist
- [ ] All tests pass
- [ ] TypeScript compiles cleanly
- [ ] No lint errors
- [ ] No guest-related code in codebase
- [ ] orderStore functions normally
- [ ] No broken imports

## Data Impact
**localStorage**: Guest info stored in `footprint-order` key will remain but be ignored. Safe to leave.

**User Impact**: None - feature not yet in production.

## Communication
If rollback needed:
1. Update `.claudecode/handoffs/pm-inbox.md` with reason
2. Tag with `AUTH-02-backend-rollback-{reason}`
3. Notify Frontend-A (they're building GuestCheckoutForm)

## Prevention
- Run tests frequently during implementation
- Type-check after each file
- Commit in small, logical chunks
- Test localStorage persistence manually

---
**Last Updated**: 2026-01-27
