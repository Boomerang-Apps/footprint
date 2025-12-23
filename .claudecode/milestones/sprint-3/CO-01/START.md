# CO-01: Enter Shipping Address

**Started**: 2025-12-23
**Agent**: Frontend-B
**Branch**: feature/co-01-shipping-address
**Linear**: https://linear.app/boomerang-apps/issue/UZF-1842
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary

Create a shipping address form with validation, autocomplete support, and save-for-future functionality.

---

## Scope

### In Scope
- ShippingAddressForm component
- Form fields: name, street, city, postalCode, country, phone
- Field validation (required fields, format validation)
- Save for future option (checkbox)
- Integration with orderStore.shippingAddress
- Hebrew UI with RTL support

### Out of Scope
- Google Places API integration (future enhancement)
- Billing address (CO-02)
- Payment processing (CO-04)

---

## Acceptance Criteria
- [ ] All required fields: name, street, city, postalCode, country
- [ ] Optional phone field
- [ ] Required field validation
- [ ] Visual error states for invalid fields
- [ ] "Save for future" checkbox
- [ ] Updates orderStore.shippingAddress on change
- [ ] Hebrew labels and placeholders
- [ ] Tests written FIRST (TDD)
- [ ] 80%+ test coverage
- [ ] TypeScript strict mode clean
- [ ] Linter clean

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `components/checkout/ShippingAddressForm.tsx` | Create | Address form with validation |
| `components/checkout/ShippingAddressForm.test.tsx` | Create | TDD tests |

---

## Dependencies

### Blocked By
- Sprint 1 & 2 complete

### Blocks
- CO-02: Billing address (same/different)
- CO-04: Payment processing

---

## Technical Notes

### Address Type (from types/user.ts)
```typescript
interface Address {
  id?: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}
```

### orderStore Integration
```typescript
shippingAddress: Address | null;
setShippingAddress: (address: Address) => void;
```

### Validation Rules
- name: required, min 2 chars
- street: required, min 5 chars
- city: required, min 2 chars
- postalCode: required, 7 digits for Israel
- country: required (default: ישראל)
- phone: optional, valid format if provided

---

## Safety Gate Progress
- [x] Gate 0: Research (N/A - standard UI component)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-23*
