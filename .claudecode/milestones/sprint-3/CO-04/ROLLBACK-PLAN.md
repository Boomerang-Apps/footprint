# ROLLBACK-PLAN.md - CO-04: Order Confirmation

**Story**: CO-04
**Branch**: `feature/CO-04-order-confirmation`
**Tag**: `CO-04-start`
**Created**: 2025-12-23

---

## Rollback Triggers

Initiate rollback if any of the following occur:

1. **Email Service Failure**: Resend API consistently failing
2. **Security Issue**: Email containing sensitive data
3. **Integration Issues**: Webhook not triggering emails
4. **Breaking Changes**: Conflicts with payment flow

---

## Files to Delete (Safe Removal)

These files are new and can be safely deleted:

```bash
# Email service
rm -rf footprint/lib/email/

# Confirmation API (if new)
rm -rf footprint/app/api/orders/
```

---

## Files to Revert (Modifications)

```bash
# Revert webhook handler changes
git checkout CO-04-start -- footprint/app/api/webhooks/payplus/route.ts

# Revert confirmation page changes
git checkout CO-04-start -- footprint/app/(app)/create/complete/page.tsx
```

---

## Rollback Commands

### Quick Rollback (Keep Branch)

```bash
# From feature/CO-04-order-confirmation branch
git reset --hard CO-04-start
git clean -fd
```

### Full Rollback (Delete Branch)

```bash
git checkout main
git branch -D feature/CO-04-order-confirmation
git push origin --delete feature/CO-04-order-confirmation  # If pushed
```

### Selective Rollback

```bash
# Remove only email-related files
git rm -rf footprint/lib/email/
git rm -rf footprint/app/api/orders/
git checkout CO-04-start -- footprint/app/api/webhooks/payplus/route.ts
git commit -m "rollback(CO-04): remove order confirmation feature"
```

---

## Fallback Behavior

If order confirmation is rolled back:

1. **Immediate**:
   - Payments still work (no email sent)
   - User redirected to generic success page
   - Manual email notification via admin

2. **User Experience**:
   - Order still saved in database
   - User can contact support for confirmation
   - Admin can manually send confirmation

3. **Alternative Solutions**:
   - Supabase Edge Functions for email
   - Third-party email service (SendGrid, Mailgun)
   - Manual admin notification workflow

---

## Environment Cleanup

Remove from `.env.local` if rolling back permanently:
```bash
# RESEND_API_KEY=
# EMAIL_FROM=
```

---

## Dependencies Check

Before rollback, verify:
- [ ] No pending emails in Resend queue
- [ ] Webhook handler reverted properly
- [ ] Confirmation page shows generic success

---

## Rollback Verification

After rollback:

```bash
# Tests should still pass
cd footprint && npm test

# Type check should pass
npm run type-check

# Lint should pass
npm run lint

# App should start
npm run dev

# Payment flow should still work
# (email just won't be sent)
```

---

**Last Updated**: 2025-12-23
*Created by Backend-2 Agent*
