# Milestone M003: Gift Options, Saved Versions & Passepartout

**Date:** 2026-01-20
**Branch:** `feature/tweak-step`
**Commit:** `ec1da2d9`
**Status:** Deployed to Vercel (Preview)

---

## Summary

Major UI/UX enhancements including gift options in checkout, saved versions for AI transformations, passepartout display for artwork preview, and mobile navigation improvements.

---

## Features Implemented

### 1. Gift Options (Checkout Page)
**Files:** `stores/orderStore.ts`, `app/(app)/create/checkout/page.tsx`

- **Gift Toggle**: Collapsible "Is this a gift?" section
- **Occasion Selector**: 9 gift types in 3x3 grid
  - Birthday, Love/Anniversary, Wedding
  - New Baby, Bar/Bat Mitzvah, Housewarming
  - Graduation, Thank You, Just Because
- **Personal Message**: Textarea with 150 character limit
- **Hide Price**: Checkbox to hide price from recipient
- **Store Fields**: `giftOccasion`, `hideGiftPrice` added to orderStore

### 2. Saved Versions (Style Page)
**Files:** `stores/orderStore.ts`, `app/(app)/create/style/page.tsx`

- Save up to 10 AI transformation versions
- Heart icon button (outline → filled red when saved)
- Grid modal to view all saved versions
- Select version to continue with
- Delete individual versions
- Counter badge showing saved count

### 3. Passepartout/Mat Display (RoomPreview)
**Files:** `components/mockup/RoomPreview.tsx`

- Toggle for passepartout on/off
- White mat (industry standard) with thin bevel line
- Frame width proportional to paper size:
  - A5: 4px / A4: 5px / A3: 6px / A2: 7px
- Mat width proportional to paper size:
  - A5: 10px / A4: 12px / A3: 14px / A2: 16px
- Info box moved to top in fullscreen mode
- Custom passepartout icon (nested squares)

### 4. Homepage Mobile Navigation
**Files:** `app/page.tsx`

- Hamburger menu with slide-in panel
- Login/Signup links in mobile menu
- Removed "Start Here" button from mobile
- Desktop login/signup preserved

### 5. Style Page Improvements
**Files:** `app/(app)/create/style/page.tsx`

- Regenerate button shows style name (e.g., "צבעי מים")
- Moved to bottom-right position
- Style badge with refresh icon

### 6. Checkout/Complete Consistency
**Files:** `app/(app)/create/checkout/page.tsx`, `app/(app)/create/complete/page.tsx`

- Sandbox mode detection and success page
- Consistent back button styling
- Sticky bottom CTA button

---

## Store Changes

```typescript
// New types
export type GiftOccasion =
  | 'birthday' | 'love' | 'wedding' | 'newBaby'
  | 'barMitzvah' | 'housewarming' | 'graduation'
  | 'thankYou' | 'justBecause' | null;

// New state fields
giftOccasion: GiftOccasion;
hideGiftPrice: boolean;

// New actions
setGiftOccasion: (occasion: GiftOccasion) => void;
setHideGiftPrice: (value: boolean) => void;
```

---

## Testing Checklist

- [ ] Gift toggle expands/collapses
- [ ] Occasion selector selects/deselects
- [ ] Personal message saves (max 150 chars)
- [ ] Hide price checkbox works
- [ ] Save version heart turns red when saved
- [ ] Grid modal shows all saved versions
- [ ] Select version from grid works
- [ ] Delete version works
- [ ] Passepartout toggle shows/hides mat
- [ ] Frame size proportional to paper size
- [ ] Fullscreen info at top, controls at bottom
- [ ] Mobile hamburger menu works
- [ ] Login/signup in mobile menu

---

## Rollback Plan

### Quick Rollback (Revert Commit)
```bash
git revert ec1da2d9 --no-commit
git commit -m "rollback: revert M003 gift options and UI changes"
git push origin feature/tweak-step
```

### Full Rollback (Reset to Previous)
```bash
git reset --hard 15449bb0
git push --force origin feature/tweak-step
```

### Partial Rollback (Specific Features)

**Disable Gift Options Only:**
```typescript
// In checkout/page.tsx, comment out the Gift Options section
// Lines 401-485
```

**Disable Passepartout Only:**
```typescript
// In RoomPreview.tsx, set showPassepartout to always false
const showPassepartout = false; // was: onPassepartoutChange ? hasPassepartout : localPassepartout;
```

**Disable Saved Versions Only:**
```typescript
// In style/page.tsx, hide save button and grid
// Comment out lines 359-379 (save button)
// Comment out lines 387-396 (grid button)
```

---

## Dependencies

- No new npm packages added
- Uses existing lucide-react icons
- Zustand persist middleware for state

---

## Deployment

- **Preview URL:** Vercel auto-deploys from `feature/tweak-step`
- **Production:** Merge to `main` after testing

---

## Next Steps

1. Test on Vercel preview
2. Verify mobile responsiveness
3. Test gift flow end-to-end
4. Create PR for main branch merge

---

## Files Changed

| File | Changes |
|------|---------|
| `stores/orderStore.ts` | +91 lines (gift occasion, saved versions) |
| `app/(app)/create/checkout/page.tsx` | +231 lines (gift section) |
| `app/(app)/create/style/page.tsx` | +384 lines (saved versions, regenerate) |
| `components/mockup/RoomPreview.tsx` | +400 lines (passepartout, proportional) |
| `app/page.tsx` | +119 lines (mobile menu) |
| + 21 other files | Various improvements |

**Total:** +2010 / -788 lines across 26 files
