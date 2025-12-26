# INT-05: Connect Confirmation to Order API

## Story
**ID**: INT-05
**Title**: Connect Confirmation to Order API
**Agent**: Frontend-B
**Sprint**: 5
**Points**: TBD

## Objective
Fetch real order data from API and display actual order number, tracking info, and enable WhatsApp sharing with real data.

## Current State
- Confirmation page uses static data from orderStore
- Order number is randomly generated on each page load (`formatOrderId()`)
- Customer email is hard-coded placeholder
- WhatsApp share uses fake order number
- No API integration for order confirmation

## Target State
- Get order ID from URL search params (`?orderId=xxx`)
- Fetch order details from `/api/orders/[orderId]/confirm` (GET)
- Display real order number from API response
- Show actual customer email from order data
- Use WhatsApp URL from API response
- Handle loading state during fetch
- Handle error state if order not found
- Fallback gracefully if no orderId param

## Technical Approach

### 1. URL Parameter Handling
```typescript
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const orderId = searchParams.get('orderId');
```

### 2. Order Data Fetching
```typescript
const [orderData, setOrderData] = useState<OrderConfirmation | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!orderId) {
    // Fallback to store data
    return;
  }

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrderData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  fetchOrder();
}, [orderId]);
```

### 3. API Response Interface
```typescript
interface OrderConfirmation {
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  whatsappUrl: string;
}
```

### 4. Loading State
Display skeleton loader while fetching order data.

### 5. Error State
Show error message with option to go home if order not found.

## Dependencies
- `/api/orders/[id]/confirm` endpoint (Backend-2) - READY
- orderStore for fallback data (Backend-1) - READY

## Acceptance Criteria
- [ ] Reads orderId from URL search params
- [ ] Fetches order data from confirmation API
- [ ] Displays real order number from API
- [ ] Uses WhatsApp URL from API response
- [ ] Shows loading state during fetch
- [ ] Shows error state if API fails
- [ ] Fallback to store data if no orderId
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

## Files to Modify
| File | Change |
|------|--------|
| `app/(app)/create/complete/page.tsx` | Add API integration |
| `app/(app)/create/complete/page.test.tsx` | Add integration tests |

## Branch
`feature/int-05-confirmation-order-api`

## Start Tag
`INT-05-start`

---
**Started**: 2025-12-26
**Agent**: Frontend-B
