# CO-03: Rollback Plan

**Story**: CO-03 - Apple Pay / Google Pay
**Branch**: feature/CO-03-apple-google-pay
**Created**: 2025-12-25

---

## Rollback Triggers

Execute rollback if any of the following occur:

1. **Critical Bug**: Wallet payments failing in production
2. **Security Issue**: Payment data exposure or vulnerability
3. **Integration Failure**: Stripe API incompatibility
4. **QA Rejection**: Failing acceptance criteria

---

## Rollback Steps

### Step 1: Revert to Tag

```bash
# Return to pre-implementation state
git checkout CO-03-start
```

### Step 2: Delete Feature Branch (if needed)

```bash
git branch -D feature/CO-03-apple-google-pay
```

### Step 3: Remove Created Files

Files that can be safely deleted:

```bash
rm -f footprint/lib/payments/stripe.ts
rm -f footprint/lib/payments/stripe.test.ts
rm -f footprint/lib/payments/wallet.ts
rm -f footprint/lib/payments/wallet.test.ts
rm -rf footprint/app/api/checkout/wallet/
rm -rf footprint/app/api/webhooks/stripe/
rm -f footprint/components/checkout/WalletPayment.tsx
rm -f footprint/components/checkout/WalletPayment.test.tsx
```

### Step 4: Verify Clean State

```bash
npm run type-check
npm test
npm run lint
```

---

## Recovery Options

### Option A: Fix Forward
If the issue is minor, fix in a new commit rather than rolling back.

### Option B: Disable Feature
Add feature flag to hide wallet buttons without removing code:

```typescript
const ENABLE_WALLET_PAYMENTS = process.env.NEXT_PUBLIC_ENABLE_WALLET ?? 'false';
```

### Option C: Full Rollback
Use the steps above for complete removal.

---

## Impact Assessment

| Component | Impact if Rolled Back |
|-----------|----------------------|
| Checkout Flow | PayPlus still available for Israeli customers |
| International Users | No wallet option, can still use PayPlus |
| Orders | No impact on existing orders |
| Database | No schema changes in this story |

---

## Notification

If rollback executed:
1. Update PM inbox with reason
2. Create new story for fix if needed
3. Document lessons learned

---

*Rollback plan created by Backend-2 Agent - 2025-12-25*
