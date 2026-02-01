# AI Story Schema V4 - Gate 0 Research Report

## Story: UI-04 - Order Tracking Page

**Research Date**: 2026-01-29
**Research Status**: COMPLETE
**Validation Result**: REQUIRES NEW IMPLEMENTATION (2 New Pages)

---

## Executive Summary

Gate 0 research reveals that **UI-04 is partially implemented**. The Order Timeline component and order confirmation page exist, but dedicated customer-facing order tracking and order history pages are **missing**.

### Current State: 60% Complete

| Component | Status | Action Required |
|-----------|--------|-----------------|
| OrderTimeline Component | COMPLETE | Reuse as-is |
| Order Complete Page | COMPLETE | Reference patterns |
| Order Tracking Page (`/order/[id]`) | MISSING | **NEW - Create** |
| Order History Page (`/account/orders`) | MISSING | **NEW - Create** |
| Backend APIs | PARTIAL | Minor additions |

---

## Part 1: Reusable Components Inventory

### 1.1 OrderTimeline Component (READY TO REUSE)

**File**: `components/ui/OrderTimeline.tsx` (208 lines)

| Feature | Status | Details |
|---------|--------|---------|
| 4-step progress | COMPLETE | received, processing, shipped, delivered |
| RTL Hebrew support | COMPLETE | Default locale='he' |
| LTR English support | COMPLETE | locale='en' option |
| Vertical layout | COMPLETE | Default layout |
| Horizontal layout | COMPLETE | layout='horizontal' |
| Estimated dates | COMPLETE | estimatedDates prop |
| Accessibility | COMPLETE | aria-label, aria-current, roles |
| Custom className | COMPLETE | className prop |

**Props Interface**:
```typescript
interface OrderTimelineProps {
  currentStatus: 'received' | 'processing' | 'shipped' | 'delivered';
  estimatedDates?: Record<OrderStatus, string>;
  locale?: 'en' | 'he';
  layout?: 'vertical' | 'horizontal';
  className?: string;
}
```

**Test Coverage**: 35 tests in `OrderTimeline.test.tsx`

---

### 1.2 UI Primitive Components (READY TO REUSE)

| Component | File | Variants/Features |
|-----------|------|-------------------|
| **Button** | `components/ui/Button.tsx` | primary, secondary, ghost, destructive, outline; sm, md, lg, icon; loading state |
| **Card** | `components/ui/Card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| **Badge** | `components/ui/Badge.tsx` | default, success, warning, error, info, brand, secondary; sm, md; icon, showDot |
| **Input** | `components/ui/Input.tsx` | error state, errorMessage, disabled |
| **StepProgress** | `components/ui/StepProgress.tsx` | N-step progress, Hebrew/English, RTL |

**Utility Function**:
```typescript
// components/ui/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

---

### 1.3 Design Tokens (Tailwind Config)

**File**: `tailwind.config.ts`

| Token | Value | Usage |
|-------|-------|-------|
| `brand-purple` | #8b5cf6 | Primary actions, active states |
| `brand-pink` | #ec4899 | Gradients, accents |
| `light-bg` | #ffffff | Page backgrounds |
| `light-muted` | #f5f5f5 | Card backgrounds |
| `light-border` | #e5e5e5 | Borders |
| `text-primary` | #1a1a1a | Main text |
| `text-muted` | #737373 | Secondary text |
| `shadow-soft-sm` | 0 1px 2px | Card shadows |
| `shadow-brand` | brand purple glow | Button highlights |

**Font**: Heebo (Hebrew-first)

---

## Part 2: Existing Order System Analysis

### 2.1 Order Types

**File**: `types/order.ts` (92 lines)

```typescript
type OrderStatus = 'pending' | 'paid' | 'processing' | 'printing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: string;
  originalImageUrl: string;
  transformedImageUrl: string | null;
  style: StyleType;
  size: SizeType;
  paperType: PaperType;
  frameType: FrameType;
  price: number;
}
```

---

### 2.2 Order Status Management

**File**: `lib/orders/status.ts` (123 lines)

| Function | Purpose |
|----------|---------|
| `getStatusLabel(status, locale)` | Returns Hebrew/English label |
| `isValidStatusTransition(from, to)` | Validates status changes |
| `getValidNextStatuses(status)` | Returns allowed transitions |
| `createStatusHistoryEntry(...)` | Creates audit trail entry |

**Status Labels**:
| Status | Hebrew | English |
|--------|--------|---------|
| pending | ממתין לתשלום | Pending Payment |
| paid | שולם | Paid |
| processing | בטיפול | Processing |
| printing | בהדפסה | Printing |
| shipped | נשלח | Shipped |
| delivered | נמסר | Delivered |
| cancelled | בוטל | Cancelled |

---

### 2.3 Tracking System

**File**: `lib/orders/tracking.ts` (229 lines)

| Feature | Status | Details |
|---------|--------|---------|
| Carrier support | COMPLETE | Israel Post, DHL, FedEx, UPS, Other |
| Tracking URL generation | COMPLETE | `generateTrackingUrl(trackingNumber, carrier)` |
| Tracking validation | COMPLETE | Format validation per carrier |

**Carrier URL Patterns**:
```typescript
const CARRIERS = {
  israel_post: 'https://israelpost.co.il/itemtrace?itemcode={tracking}',
  dhl: 'https://www.dhl.com/il-he/home/tracking.html?tracking-id={tracking}',
  fedex: 'https://www.fedex.com/fedextrack/?trknbr={tracking}',
  ups: 'https://www.ups.com/track?tracknum={tracking}',
  other: null,
};
```

---

### 2.4 Existing API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/orders/[id]/confirm` | GET | Get order details | User |
| `/api/orders/[id]/confirm` | POST | Send confirmation email | User |
| `/api/admin/orders/[id]/status` | PATCH | Update order status | Admin |
| `/api/admin/orders/[id]/tracking` | PATCH | Add tracking info | Admin |
| `/api/admin/orders/[id]/download` | GET | Download print file | Admin |

**Missing for UI-04**:
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/orders` | GET | List user's orders | P0 |
| `/api/orders/[id]` | GET | Get single order details | P0 |

---

## Part 3: Page Pattern Analysis

### 3.1 Mobile-First Layout Pattern

**Reference**: `app/(app)/create/complete/page.tsx`

```typescript
// Standard page structure
export default function Page() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 py-3.5 px-4">
        <div className="max-w-[600px] mx-auto">...</div>
      </header>

      {/* Main Content - RTL */}
      <main dir="rtl" className="max-w-[550px] mx-auto px-4 py-6 pb-32">
        {/* Content cards */}
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-[550px] mx-auto px-4 py-4">...</div>
      </div>
    </div>
  );
}
```

**Key Patterns**:
- Max width: `max-w-[550px]` for mobile content
- Bottom padding: `pb-32` to account for fixed CTA
- Safe area: `pb-[max(16px,env(safe-area-inset-bottom))]`
- RTL: `dir="rtl"` on main content

---

### 3.2 Card Pattern

**Reference**: Complete page order summary card

```tsx
<div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
  {/* Card header with icon */}
  <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center gap-2">
    <Package className="w-[18px] h-[18px] text-violet-600" />
    <span className="text-sm font-semibold">כותרת</span>
  </div>
  {/* Card body */}
  <div className="p-4">...</div>
</div>
```

---

### 3.3 Loading/Error Pattern

```tsx
// Loading state
if (isLoading) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
        <p className="text-zinc-500">טוען...</p>
      </div>
    </div>
  );
}

// Error state
if (error) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">שגיאה</h1>
        <p className="text-zinc-500">{error}</p>
      </div>
    </div>
  );
}
```

---

## Part 4: Test Pattern Analysis

### 4.1 Test Structure

**Framework**: Vitest + React Testing Library

**Standard Test File Structure**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders expected elements', () => {...});
  });

  describe('User Interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      // ...
    });
  });

  describe('States', () => {
    it('shows loading state', () => {...});
    it('shows error state', () => {...});
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {...});
  });

  describe('RTL Support', () => {
    it('applies RTL direction', () => {...});
  });
});
```

### 4.2 Test Utilities

| Utility | Usage |
|---------|-------|
| `screen.getByTestId()` | Find elements by data-testid |
| `screen.getByRole()` | Find by ARIA role |
| `screen.getByText()` | Find by text content |
| `within(element).getByText()` | Scoped queries |
| `userEvent.setup()` | User interaction simulation |

---

## Part 5: Gap Analysis

### 5.1 Required New Files

| File | Purpose | Priority |
|------|---------|----------|
| `app/(app)/order/[id]/page.tsx` | Order tracking page | P0 |
| `app/(app)/order/[id]/page.test.tsx` | Tests for tracking page | P0 |
| `app/(app)/account/orders/page.tsx` | Order history page | P0 |
| `app/(app)/account/orders/page.test.tsx` | Tests for history page | P0 |
| `app/api/orders/route.ts` | List user orders API | P0 |
| `app/api/orders/route.test.ts` | Tests for list API | P0 |
| `app/api/orders/[id]/route.ts` | Get order details API | P0 |
| `app/api/orders/[id]/route.test.ts` | Tests for details API | P0 |

### 5.2 Files to Modify

| File | Modification | Priority |
|------|--------------|----------|
| None | No modifications needed | - |

### 5.3 Forbidden Files (Do Not Modify)

- `components/ui/OrderTimeline.tsx` - Already complete
- `lib/orders/status.ts` - Already complete
- `lib/orders/tracking.ts` - Already complete
- `types/order.ts` - Already complete

---

## Part 6: Acceptance Criteria Mapping

### Original Acceptance Criteria

| # | Criteria | Implementation Plan |
|---|----------|---------------------|
| AC-01 | Display order status | Use `OrderTimeline` component with `currentStatus` prop |
| AC-02 | Show order details | Fetch from `/api/orders/[id]`, display in Card components |
| AC-03 | Delivery tracking link | Use `generateTrackingUrl()` from `lib/orders/tracking.ts` |
| AC-04 | Order history view | New `/account/orders` page with list from `/api/orders` |

---

## Part 7: Recommended Story Split

Based on complexity and TDD approach, UI-04 should be split into **3 stories**:

### Story 1: UI-04A - Order Details API
- Create `/api/orders` endpoint (list)
- Create `/api/orders/[id]` endpoint (details)
- Full TDD with 100% coverage

### Story 2: UI-04B - Order Tracking Page
- Create `/order/[id]/page.tsx`
- Reuse `OrderTimeline` component
- Display tracking link with carrier URL

### Story 3: UI-04C - Order History Page
- Create `/account/orders/page.tsx`
- List all user orders
- Filter by status
- Link to individual order pages

---

## Part 8: TDD Test Plan

### Coverage Targets

| Component | Target | Rationale |
|-----------|--------|-----------|
| API Routes | 100% | Critical business logic |
| Page Components | 85%+ | UI logic coverage |
| Integration | Key flows | E2E critical paths |

### Test Categories

1. **API Tests** (50+ tests)
   - Authentication (5)
   - Authorization (5)
   - Input validation (10)
   - Success responses (10)
   - Error handling (10)
   - Edge cases (10)

2. **Page Tests** (80+ tests)
   - Rendering (15)
   - Loading states (5)
   - Error states (5)
   - User interactions (15)
   - Navigation (10)
   - Accessibility (10)
   - RTL support (10)
   - Responsive design (10)

---

## Conclusion

UI-04 requires:
1. **2 new API endpoints** for order data access
2. **2 new pages** for tracking and history
3. **Full TDD coverage** following existing patterns
4. **Maximum component reuse** from existing UI library

All existing components and utilities are production-ready and should be reused without modification.

---

**Research Completed**: 2026-01-29
**Next Step**: Create AI Stories (Schema V4)
