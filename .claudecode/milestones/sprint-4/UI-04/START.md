# UI-04: Checkout Page UI - START

**Story**: UI-04
**Agent**: Frontend-B
**Sprint**: 4
**Points**: 5
**Branch**: feature/ui-04-checkout-page
**Started**: 2025-12-25

## Objective

Implement the Checkout Page UI matching the mockup `04-checkout.html`:
- Gift toggle with message textarea
- Shipping address form
- Payment method selection
- Coupon code input
- Price breakdown
- Secure payment CTA

## Mockup Analysis

### Key UI Elements
1. **Header**: Back button (→) + title "תשלום"
2. **Progress Bar**: 80% filled (Step 4 of 4)
3. **Order Summary Card**: Product thumbnail, style, specs, edit button
4. **Gift Section**: Toggle + message textarea (150 chars max)
5. **Shipping Section**: Name, phone, address, city, postal code
6. **Payment Section**:
   - Payment methods (Credit Card, Apple Pay, Google Pay)
   - Coupon code input
   - Price breakdown
7. **Bottom CTA**: Secure badge + "לתשלום ₪XXX" button

## Technical Approach

- TDD: Write tests first
- Use existing orderStore for state
- RTL layout with dir="rtl"
- Mobile-first responsive design
- Tailwind CSS styling

## Files to Modify

| File | Action |
|------|--------|
| `app/(app)/create/checkout/page.tsx` | Update to match mockup |
| `app/(app)/create/checkout/page.test.tsx` | Create TDD tests |

## Acceptance Criteria

- [ ] Matches mockup visually
- [ ] Gift toggle with message (150 char limit)
- [ ] Shipping form with all fields
- [ ] Payment method selection (3 options)
- [ ] Coupon code input with apply button
- [ ] Price breakdown matches mockup
- [ ] Progress bar shows 80% (step 4)
- [ ] RTL layout correct
- [ ] Mobile responsive
- [ ] Navigation works (back to /create/customize, forward to /create/complete)
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum

## Dependencies

- UI-03: Customize Page ✅ (merged)
