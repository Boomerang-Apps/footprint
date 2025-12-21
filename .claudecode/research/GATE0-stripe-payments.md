# Research: Stripe Payment Integration

**Date**: 2025-12-19
**Author**: CTO Agent
**Story**: CO-02 (Pay with credit card)
**Gate**: 0 - Research

---

## Objective

Evaluate and document the Stripe integration approach for secure payment processing. Ensure PCI compliance, support for Israeli market, and seamless checkout experience.

---

## Questions to Answer

1. What is the optimal Stripe integration pattern for Next.js?
2. How do we handle Israeli Shekels (ILS) payments?
3. What payment methods should we support?
4. How do we secure webhooks?
5. What are the fee structures?

---

## Research Findings

### Stripe for Israel
- **Currency**: ILS (Israeli New Shekel) fully supported
- **Payment Methods**: Credit cards, Apple Pay, Google Pay
- **Local Cards**: Isracard, Visa, Mastercard supported
- **Fees**: 2.9% + 0.30 ILS per successful charge

### Integration Pattern

#### Recommended: Stripe Checkout (Hosted)

**Pros**:
- PCI compliant by default
- Handles 3D Secure automatically
- Apple Pay / Google Pay built-in
- Mobile optimized
- Reduced implementation complexity

**Cons**:
- Less UI customization
- Redirect to Stripe-hosted page

#### Alternative: Stripe Elements (Embedded)

**Pros**:
- Full UI control
- No redirect
- Better brand experience

**Cons**:
- More implementation work
- Must handle 3D Secure manually

**[CTO-DECISION]**: Use Stripe Checkout for MVP, consider Elements for Phase 2.

---

## Implementation Architecture

### Checkout Flow

```
User clicks "Pay"
    → Frontend calls /api/checkout/create-session
    → Backend creates Stripe Checkout Session
    → User redirected to Stripe Checkout
    → User completes payment
    → Stripe redirects to success/cancel URL
    → Webhook confirms payment
    → Order status updated
```

### API Implementation

```typescript
// app/api/checkout/create-session/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { orderId, items, customerEmail } = await request.json();

  // Validate order exists and is pending
  const order = await getOrder(orderId);
  if (!order || order.status !== 'pending') {
    return Response.json({ error: 'Invalid order' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    currency: 'ils',
    line_items: items.map(item => ({
      price_data: {
        currency: 'ils',
        product_data: {
          name: `${item.style} Print - ${item.size}`,
          description: `${item.paper} paper, ${item.frame} frame`,
        },
        unit_amount: Math.round(item.price * 100), // Agorot
      },
      quantity: 1,
    })),
    metadata: {
      orderId: orderId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/create/checkout?canceled=true`,
  });

  return Response.json({ sessionId: session.id, url: session.url });
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handlePaymentSuccess(session.metadata.orderId);
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      await handlePaymentExpired(expiredSession.metadata.orderId);
      break;
  }

  return Response.json({ received: true });
}

async function handlePaymentSuccess(orderId: string) {
  // Update order status to 'paid'
  await updateOrderStatus(orderId, 'paid');

  // Send confirmation email
  await sendOrderConfirmation(orderId);

  // Notify admin
  await notifyAdmin(orderId);
}
```

---

## Security Considerations

- [x] **Webhook Signature Verification**: Always verify Stripe signatures
- [x] **Secret Key Protection**: Only use on server-side
- [x] **Publishable Key**: Safe for client-side
- [x] **HTTPS Only**: All Stripe communication over HTTPS
- [x] **Idempotency**: Handle duplicate webhooks gracefully
- [x] **Amount Validation**: Verify amounts match order before confirming

### Environment Variables

```bash
# Server-side only
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Client-side safe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

## Fee Structure

| Transaction | Stripe Fee | Example (₪100 order) |
|-------------|------------|---------------------|
| Credit Card | 2.9% + ₪0.30 | ₪3.20 |
| Apple Pay | 2.9% + ₪0.30 | ₪3.20 |
| Google Pay | 2.9% + ₪0.30 | ₪3.20 |

**Monthly Estimate** (500 orders, ₪150 avg):

- Gross: ₪75,000
- Stripe Fees: ~₪2,325 (3.1%)
- Net: ~₪72,675

---

## Testing Strategy

1. **Test Mode**: Use `sk_test_` keys during development
2. **Test Cards**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`
3. **Webhook Testing**: Use Stripe CLI for local testing
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

## Apple Pay / Google Pay (CO-03)

Stripe Checkout supports these automatically when:
1. User is on Safari (Apple Pay) or Chrome (Google Pay)
2. Payment method is configured in Stripe Dashboard
3. Domain is verified with Apple/Google

No additional code required for Checkout integration.

---

## Rollback Plan

If Stripe integration fails:

1. **Immediate**: Display "Payment temporarily unavailable"
2. **Short-term**: Implement bank transfer option
3. **Long-term**: Add PayPlus or other Israeli payment provider

---

## CTO Approval

**Status**: APPROVED

**CTO Notes**:
- Use Stripe Checkout for MVP (simplest, most secure)
- Implement webhook signature verification (mandatory)
- Add idempotency handling for webhooks
- Test thoroughly with Israeli cards before launch
- Log all payment events for debugging
- Never log full card numbers or CVV

**Approved by**: CTO Agent
**Date**: 2025-12-19

---

*Research completed by CTO Agent - 2025-12-19*
