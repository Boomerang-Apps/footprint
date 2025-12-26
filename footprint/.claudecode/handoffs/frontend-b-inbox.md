# frontend-b Agent Inbox

---

## 📬 INT-05: Connect Confirmation Page to API

**From**: PM Agent
**Date**: 2025-12-26
**Priority**: High
**Story Points**: 2
**Sprint**: 5 (Integration - Final Story!)
**Dependencies**: INT-04 (in progress by Backend-2)

### Story Description

Replace hardcoded/simulated data in the confirmation page with real API calls. Fetch actual order details after payment success.

### Current Implementation (to replace)

File: `app/(app)/create/complete/page.tsx`

**Problems to fix:**
1. `formatOrderId()` generates fake order number (line 50-54)
2. `customerEmail` is hardcoded placeholder (line 163)
3. `getEstimatedDelivery()` calculates locally instead of from order (line 56-68)
4. No API call to fetch real order data

### API Specification

**Endpoint**: `GET /api/orders/[id]/confirm`

**How to get order ID:**
- PayPlus redirects to: `/create/complete?page_request_uid={uid}`
- Use `page_request_uid` to look up the order

**Response**:
```typescript
{
  orderNumber: string;      // "FP-20251226-A7K9"
  status: string;           // "confirmed"
  items: [{
    name: string;
    quantity: number;
    price: number;
  }];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  whatsappUrl: string;      // Pre-generated share URL
}
```

### Implementation Requirements

1. **Get order ID from URL params**
   ```typescript
   import { useSearchParams } from 'next/navigation';

   const searchParams = useSearchParams();
   const pageRequestUid = searchParams.get('page_request_uid');
   ```

2. **Fetch order details**
   ```typescript
   // Need to first get orderId from page_request_uid
   // This might require a lookup endpoint or storing orderId in session

   const response = await fetch(`/api/orders/${orderId}/confirm`);
   const orderData = await response.json();
   ```

3. **Handle loading state**
   - Show skeleton/spinner while fetching
   - Handle case where order not found

4. **Update displayed data**
   - `orderNumber` → from API response
   - `customerEmail` → from user session or API
   - `estimatedDelivery` → calculate from order created_at
   - `total` → from API response

5. **WhatsApp share**
   - Use `whatsappUrl` from API instead of generating locally

### Files to Modify

1. **`app/(app)/create/complete/page.tsx`**
   - Add useSearchParams to get page_request_uid
   - Add useEffect to fetch order data
   - Replace hardcoded values with API data
   - Add loading/error states

### Acceptance Criteria

- [ ] Gets page_request_uid from URL params
- [ ] Fetches real order data from API
- [ ] Displays actual order number from database
- [ ] Shows loading state while fetching
- [ ] Handles order not found gracefully
- [ ] WhatsApp share uses API-provided URL
- [ ] Tests cover API integration
- [ ] 80%+ test coverage maintained

### Test Scenarios

1. Happy path: page_request_uid in URL → Fetch order → Display data
2. Missing param: No page_request_uid → Show error/redirect
3. Order not found: API returns 404 → Show error message
4. Loading state: API pending → Show skeleton

### Notes

- INT-04 (Backend-2) is implementing the order creation - coordinate if needed
- The order lookup by page_request_uid may need Backend-2 to add an endpoint
- Confetti animation should still trigger on mount

### Reference Files

- Current page: `app/(app)/create/complete/page.tsx`
- Confirm API: `app/api/orders/[id]/confirm/route.ts`
- Order store: `stores/orderStore.ts`

---

**Ready for implementation!** This completes Sprint 5 Integration.

Ping PM when complete for QA handoff.

---

*Last checked: 2025-12-26*
