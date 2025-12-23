# ROLLBACK-PLAN.md - CO-02: Pay with Credit Card (Stripe)

**Story**: CO-02
**Branch**: `feature/CO-02-stripe-payment`
**Tag**: `CO-02-start`
**Created**: 2025-12-23

---

## Rollback Triggers

Initiate rollback if any of the following occur:

1. **API Failure**: Stripe API consistently failing
2. **Security Issue**: API keys exposed or signature verification bypassed
3. **Integration Issues**: Webhooks not receiving events
4. **Breaking Changes**: Conflicts with existing checkout flow

---

## Files to Delete (Safe Removal)

These files are new and can be safely deleted:

```bash
# Payment module
rm footprint/lib/payments/stripe.ts
rm footprint/lib/payments/stripe.test.ts

# Checkout API
rm -rf footprint/app/api/checkout/

# Webhook handler
rm -rf footprint/app/api/webhooks/stripe/
```

---

## Rollback Commands

### Quick Rollback (Keep Branch)

```bash
# From feature/CO-02-stripe-payment branch
git reset --hard CO-02-start
git clean -fd
```

### Full Rollback (Delete Branch)

```bash
git checkout main
git branch -D feature/CO-02-stripe-payment
git push origin --delete feature/CO-02-stripe-payment  # If pushed
```

### Selective Rollback

```bash
# Remove only payment-related files
git rm -rf footprint/lib/payments/
git rm -rf footprint/app/api/checkout/
git rm -rf footprint/app/api/webhooks/stripe/
git commit -m "rollback(CO-02): remove Stripe payment integration"
```

---

## Fallback Behavior

If Stripe integration is rolled back:

1. **Immediate**:
   - Disable checkout button in UI
   - Show "Payment coming soon" message
   - Log all attempted transactions

2. **User Experience**:
   - Users can still browse and customize
   - Order saved but not payable
   - Contact support for manual payment

3. **Alternative Payment**:
   - Manual bank transfer
   - PayPal (if available)
   - Bit payment (Israeli alternative)

---

## Environment Cleanup

Remove from `.env.local` if rolling back permanently:
```bash
# STRIPE_SECRET_KEY=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# STRIPE_WEBHOOK_SECRET=
```

---

## Dependencies Check

Before rollback, verify:
- [ ] No frontend code calling `/api/checkout`
- [ ] No orders with pending Stripe payments
- [ ] Stripe CLI webhook forwarding stopped

---

## Rollback Verification

After rollback:

```bash
# Tests should still pass
npm test

# Type check should pass
npm run type-check

# Lint should pass
npm run lint

# App should start
npm run dev
```

---

**Last Updated**: 2025-12-23
*Created by Backend-2 Agent*
