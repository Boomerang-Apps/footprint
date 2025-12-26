# INT-04: Create Order on Payment Success

**Started**: 2025-12-26
**Agent**: Backend-2
**Branch**: feature/INT-04-order-on-payment
**Gate**: 1 - Planning
**Linear**: N/A

---

## Story Summary

Create order record in database when payment succeeds (via Stripe or PayPlus webhook), and trigger confirmation email to customer. This connects the payment flow to order management.

---

## Scope

### In Scope
- Order creation service (`lib/orders/create.ts`)
- Generate unique order number (FP-YYYYMMDD-XXXX format)
- Store order details in Supabase orders table
- Update Stripe webhook to create order on payment_intent.succeeded
- Update PayPlus webhook to create order on status_code "000"
- Trigger confirmation email via existing `/api/orders/[id]/confirm` endpoint

### Out of Scope
- Creating the orders table (assumed to exist)
- Payment processing itself (already implemented)
- Order editing/cancellation
- Inventory management

---

## Technical Approach

### 1. Order Creation Service

```typescript
// lib/orders/create.ts
interface CreateOrderParams {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentProvider: 'stripe' | 'payplus';
  paymentTransactionId: string;
  isGift?: boolean;
  giftMessage?: string;
}

interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
}

async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult>
```

### 2. Order Number Generation

Format: `FP-YYYYMMDD-XXXX` where XXXX is a sequential counter per day.

```typescript
// Example: FP-20251226-0001, FP-20251226-0002
function generateOrderNumber(date: Date): Promise<string>
```

### 3. Webhook Integration

**Stripe webhook** (`payment_intent.succeeded`):
```typescript
const orderResult = await createOrder({
  userId: metadata.userId,
  customerEmail: receipt_email,
  paymentProvider: 'stripe',
  paymentTransactionId: paymentIntent.id,
  // ... other fields from metadata
});

// Trigger confirmation email
await triggerConfirmationEmail(orderResult.orderId);
```

**PayPlus webhook** (`status_code "000"`):
```typescript
const orderResult = await createOrder({
  customerEmail: payload.customer_email,
  paymentProvider: 'payplus',
  paymentTransactionId: payload.transaction_uid,
  // ... other fields from more_info fields
});

await triggerConfirmationEmail(orderResult.orderId);
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| footprint/lib/orders/create.ts | Create | Order creation service |
| footprint/lib/orders/create.test.ts | Create | TDD tests |
| footprint/app/api/webhooks/stripe/route.ts | Modify | Add order creation |
| footprint/app/api/webhooks/payplus/route.ts | Modify | Add order creation |

---

## Dependencies

### Uses Existing
- `lib/supabase/server.ts` - Database client
- `lib/email/resend.ts` - Email service
- `app/api/orders/[id]/confirm/route.ts` - Confirmation endpoint

### Blocked By
- None (payment webhooks exist)

### Blocks
- Order tracking UI
- Admin order list

---

## Database Schema (Expected)

```sql
-- orders table (assumed to exist)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'paid',
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_provider VARCHAR(20) NOT NULL,
  payment_transaction_id VARCHAR(255) NOT NULL,
  is_gift BOOLEAN DEFAULT false,
  gift_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Acceptance Criteria

- [ ] Order record created in database on successful Stripe payment
- [ ] Order record created in database on successful PayPlus payment
- [ ] Unique order number generated (FP-YYYYMMDD-XXXX format)
- [ ] Confirmation email triggered after order creation
- [ ] Idempotent: duplicate webhook calls don't create duplicate orders
- [ ] Tests written (TDD approach)
- [ ] 80%+ coverage for new code
- [ ] TypeScript clean
- [ ] Lint clean

---

## Test Plan

### Unit Tests (lib/orders/create.ts)
- generateOrderNumber() creates unique sequential numbers
- createOrder() validates required fields
- createOrder() inserts order into database
- createOrder() returns orderId and orderNumber
- Handles duplicate transaction IDs (idempotency)

### Integration Tests (Webhooks)
- Stripe webhook creates order on payment_intent.succeeded
- PayPlus webhook creates order on status_code "000"
- Confirmation email triggered after order creation
- Failed payments don't create orders

---

## Safety Gate Progress

- [ ] Gate 0: Research (N/A - standard database operations)
- [ ] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Backend-2 Agent - 2025-12-26*
