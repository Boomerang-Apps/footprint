# backend-2 Agent Inbox

---

## 📬 INT-04: Create Order on Payment Success

**From**: PM Agent
**Date**: 2025-12-26
**Priority**: High
**Story Points**: 3
**Dependencies**: INT-03 ✅, CO-04 ✅ (all complete)

### Story Description

Implement order creation flow when payment succeeds. The PayPlus webhook (`/api/webhooks/payplus`) receives payment confirmation but currently has a TODO stub for `updateOrderStatus()`. Complete this flow to create/update order records and trigger confirmation emails.

### Current Implementation (to complete)

File: `app/api/webhooks/payplus/route.ts` lines 52-67

```typescript
/**
 * Updates order status in the database
 * TODO: Implement with actual Supabase client
 */
async function updateOrderStatus(
  orderId: string,
  status: 'paid' | 'failed',
  paymentDetails: {...}
): Promise<void> {
  // TODO: Update order in Supabase
  console.log(`Updating order ${orderId} to status: ${status}`, paymentDetails);
}
```

---

### Order Flow Overview

```
┌──────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│  User pays on    │────▶│  PayPlus webhook   │────▶│  Create/update  │
│  PayPlus page    │     │  /api/webhooks/    │     │  order in DB    │
└──────────────────┘     │  payplus           │     └────────┬────────┘
                         └────────────────────┘              │
                                                             ▼
                         ┌────────────────────┐     ┌────────────────┐
                         │  User lands on     │◀────│  Send confirm  │
                         │  /create/complete  │     │  email         │
                         └────────────────────┘     └────────────────┘
```

---

### Implementation Requirements

1. **Create orders table schema** (if not exists)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',

  -- Product details
  original_image_url TEXT,
  transformed_image_url TEXT,
  style VARCHAR(50),
  size VARCHAR(10),
  paper_type VARCHAR(20),
  frame_type VARCHAR(20),

  -- Gift options
  is_gift BOOLEAN DEFAULT FALSE,
  gift_message TEXT,

  -- Pricing (in agorot)
  subtotal INTEGER,
  shipping INTEGER,
  discount INTEGER DEFAULT 0,
  total INTEGER,

  -- Customer
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),

  -- Shipping address (JSONB)
  shipping_address JSONB,

  -- Payment
  payment_status VARCHAR(20) DEFAULT 'pending',
  transaction_uid VARCHAR(100),
  page_request_uid VARCHAR(100),
  paid_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **Implement `updateOrderStatus()` in webhook**

```typescript
import { createAdminClient } from '@/lib/supabase/server';

async function updateOrderStatus(
  orderId: string,
  status: 'paid' | 'failed',
  paymentDetails: {...}
): Promise<void> {
  const supabase = createAdminClient();

  const updateData = status === 'paid'
    ? {
        payment_status: 'paid',
        status: 'confirmed',
        transaction_uid: paymentDetails.transactionUid,
        page_request_uid: paymentDetails.pageRequestUid,
        paid_at: paymentDetails.paidAt?.toISOString(),
        updated_at: new Date().toISOString(),
      }
    : {
        payment_status: 'failed',
        status: 'payment_failed',
        transaction_uid: paymentDetails.transactionUid,
        updated_at: new Date().toISOString(),
      };

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) {
    console.error('Failed to update order:', error);
    throw error;
  }
}
```

3. **Create order BEFORE payment redirect (INT-03 already does this)**

The order should be created with `status: 'pending'` before redirecting to PayPlus. INT-03 generates an orderId - we need an API endpoint to create the order record:

**New Endpoint**: `POST /api/orders`

```typescript
// Request body from checkout page:
{
  originalImageUrl: string;
  transformedImageUrl: string;
  style: string;
  size: string;
  paperType: string;
  frameType: string;
  isGift: boolean;
  giftMessage?: string;
  subtotal: number;      // in agorot
  shipping: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// Response:
{
  orderId: string;       // UUID
  orderNumber: string;   // Human-readable: FP-20251226-XXXX
}
```

4. **Trigger confirmation email after payment success**

After updating order status to 'paid', call the confirmation endpoint:

```typescript
// In webhook after successful payment:
if (isSuccess) {
  await updateOrderStatus(orderId, 'paid', {...});

  // Trigger confirmation email
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${orderId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

### Files to Create/Modify

1. **`supabase/migrations/XXXXXXXX_create_orders_table.sql`** (new)
   - Orders table schema

2. **`app/api/orders/route.ts`** (new)
   - POST: Create order with pending status
   - Returns orderId and orderNumber

3. **`app/api/webhooks/payplus/route.ts`** (modify)
   - Implement `updateOrderStatus()` with Supabase
   - Trigger confirmation email on success

4. **`lib/orders/generate-order-number.ts`** (new)
   - Generate human-readable order numbers: `FP-YYYYMMDD-XXXX`

---

### Order Number Format

```typescript
// Format: FP-YYYYMMDD-XXXX (e.g., FP-20251226-A7K9)
function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FP-${date}-${random}`;
}
```

---

### Acceptance Criteria

- [ ] Orders table created with proper schema
- [ ] POST /api/orders creates order with pending status
- [ ] Order number generated in FP-YYYYMMDD-XXXX format
- [ ] Webhook updates order status on payment success
- [ ] Webhook updates order status on payment failure
- [ ] Confirmation email triggered after successful payment
- [ ] Tests cover order creation and status updates
- [ ] 80%+ test coverage maintained

---

### Test Scenarios

1. **Create Order**: POST /api/orders → Returns orderId + orderNumber
2. **Webhook Success**: status_code=000 → Order status=confirmed, payment_status=paid
3. **Webhook Failure**: status_code!=000 → Order status=payment_failed
4. **Email Trigger**: After successful payment → Confirmation endpoint called
5. **Duplicate Prevention**: Same transaction_uid handled gracefully

---

### Reference Files

- Webhook: `app/api/webhooks/payplus/route.ts`
- Confirmation: `app/api/orders/[id]/confirm/route.ts`
- Supabase admin: `lib/supabase/server.ts` (use `createAdminClient`)

---

**Ready for implementation!** Ping PM when complete for QA handoff.

---

*Last checked: 2025-12-26*
