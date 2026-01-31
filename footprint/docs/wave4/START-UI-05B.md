# START.md - UI-05B: Saved Addresses Management Page

**Story ID:** UI-05B
**Wave:** 4
**Domain:** Frontend (Profile)
**Agent:** FE-Dev
**Branch:** `feature/UI-05B-saved-addresses-page`
**Status:** Ready for Implementation
**Depends On:** BE-05 (Addresses CRUD API)

---

## Objective

Create saved addresses management page with list view, add/edit/delete functionality, and set default address feature.

---

## Implementation Plan

### Phase 1: Hooks (TDD First)

1. Create address hooks:
   ```typescript
   // hooks/useAddresses.ts - Fetch addresses list
   // hooks/useCreateAddress.ts - Create mutation
   // hooks/useUpdateAddress.ts - Update mutation
   // hooks/useDeleteAddress.ts - Delete mutation
   ```

2. Write tests first for all hooks

### Phase 2: AddressCard Component

1. Create `components/account/AddressCard.tsx`
   - Display: name, street, city, postal code, phone
   - Default badge (if isDefault)
   - Edit button
   - Delete button (with confirmation)
   - "Set as Default" button (if not default)

2. Write tests: `components/account/AddressCard.test.tsx`

### Phase 3: AddressForm Component

1. Create `components/account/AddressForm.tsx`
   - Reusable for both add and edit
   - Fields: name, street, apartment, city, postalCode, phone
   - Validation using lib/validation/address.ts
   - Submit handler receives data
   - Can be modal or inline

2. Write tests: `components/account/AddressForm.test.tsx`
   - Validation for all fields
   - Empty form for add mode
   - Pre-filled form for edit mode

### Phase 4: AddressList Component

1. Create `components/account/AddressList.tsx`
   - Maps addresses to AddressCard components
   - Empty state with "Add Address" CTA
   - Loading state
   - Error state with retry

2. Write tests: `components/account/AddressList.test.tsx`

### Phase 5: Addresses Page

1. Create `app/(app)/account/addresses/page.tsx`
   - Back navigation to /account
   - "Add Address" button
   - AddressList component
   - AddressForm modal/dialog
   - Delete confirmation dialog
   - RTL layout
   - Mobile-first responsive

2. Integration tests

---

## Files to Create

| File | Purpose |
|------|---------|
| `hooks/useAddresses.ts` | Fetch addresses |
| `hooks/useAddresses.test.ts` | Tests |
| `hooks/useCreateAddress.ts` | Create mutation |
| `hooks/useCreateAddress.test.ts` | Tests |
| `hooks/useUpdateAddress.ts` | Update mutation |
| `hooks/useUpdateAddress.test.ts` | Tests |
| `hooks/useDeleteAddress.ts` | Delete mutation |
| `hooks/useDeleteAddress.test.ts` | Tests |
| `components/account/AddressCard.tsx` | Address display card |
| `components/account/AddressCard.test.tsx` | Tests |
| `components/account/AddressForm.tsx` | Add/edit form |
| `components/account/AddressForm.test.tsx` | Tests |
| `components/account/AddressList.tsx` | List container |
| `components/account/AddressList.test.tsx` | Tests |
| `app/(app)/account/addresses/page.tsx` | Addresses page |

---

## Components to Reuse

| Component | Usage |
|-----------|-------|
| `components/ui/Input.tsx` | Form inputs |
| `components/ui/Button.tsx` | Actions |
| `components/ui/Card.tsx` | Address cards |
| `components/ui/Badge.tsx` | Default indicator |
| `lib/validation/address.ts` | Zod schema (from BE-05) |

---

## Forbidden Files (Do Not Modify)

- `components/checkout/ShippingAddressForm.tsx`
- `app/api/addresses/*`

---

## UI/UX Requirements

### RTL Layout
```tsx
<div dir="rtl" className="...">
```

### Hebrew Labels
| Element | Hebrew |
|---------|--------|
| Page Title | כתובות שמורות |
| Add Address | הוספת כתובת |
| Edit | עריכה |
| Delete | מחיקה |
| Set Default | קבע כברירת מחדל |
| Default Badge | ברירת מחדל |
| Empty State | אין כתובות שמורות |
| Delete Confirm | האם למחוק את הכתובת? |
| Cancel | ביטול |
| Save | שמירה |

### Address Card Layout
```
┌─────────────────────────────────┐
│ [Default Badge]                 │
│ שם המקבל                        │
│ רחוב 123, דירה 4                │
│ תל אביב, 1234567                │
│ 050-1234567                     │
│                                 │
│ [עריכה] [מחיקה] [ברירת מחדל]    │
└─────────────────────────────────┘
```

---

## Acceptance Criteria Checklist

- [ ] AC-001: Displays list of addresses
- [ ] AC-002: Loading spinner while fetching
- [ ] AC-003: Empty state with add button
- [ ] AC-004: Card shows all fields
- [ ] AC-005: Default address highlighted
- [ ] AC-006: Add button opens form
- [ ] AC-007: Edit opens pre-filled form
- [ ] AC-008: Delete shows confirmation
- [ ] AC-009: Delete confirmation removes address
- [ ] AC-010: Set default updates badge
- [ ] AC-011: Form validates all fields
- [ ] AC-012: Postal code 7-digit validation
- [ ] AC-013: Success toast on CRUD
- [ ] AC-014: Error toast on failure
- [ ] AC-015: RTL with Hebrew labels
- [ ] AC-016: Mobile-first responsive
- [ ] AC-017: Back navigation to /account

---

## Test Coverage Target

**Minimum:** 90%
**Estimated Tests:** 33

---

## Definition of Done

1. All tests pass
2. Coverage >= 90%
3. TypeScript clean
4. ESLint clean
5. All ACs verified
6. RTL verified
7. Delete confirmation works
8. Default badge updates correctly
9. Ready for QA review

---

*Generated: 2026-01-30*
*Gate 1: Planning Complete*
