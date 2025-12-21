# CTO Decision: Landing Page Implementation Plan

**Decision ID**: CTO-001
**Date**: 2025-12-20
**Status**: APPROVED
**Author**: CTO Agent

---

## Executive Summary

This document defines the implementation plan to close the gap between the approved design (`footprint-responsive.html`) and the current codebase. The plan is organized into 2 sprints with clear agent assignments.

---

## Component Architecture

### New Components Required

```
footprint/components/
├── ui/                          # Frontend-A owns
│   ├── Button.tsx               # Already have CSS, need component
│   ├── Card.tsx                 # Reusable card wrapper
│   ├── Input.tsx                # Form input component
│   ├── Badge.tsx                # Product badges, cart badge
│   └── Icon.tsx                 # SVG icon wrapper (optional)
│
├── layout/                      # Frontend-A owns
│   ├── Navbar.tsx               # Extract from page.tsx
│   ├── MobileMenu.tsx           # Slide-out mobile nav
│   ├── Footer.tsx               # Full 4-column footer
│   ├── AnnouncementBar.tsx      # Top promo bar
│   └── WhatsAppButton.tsx       # Fixed floating button
│
├── landing/                     # Frontend-B owns
│   ├── HeroSection.tsx          # Extract from page.tsx
│   ├── FeaturesBar.tsx          # Extract from page.tsx
│   ├── ProductsSection.tsx      # NEW - 3 product cards
│   ├── ProductCard.tsx          # Individual product
│   ├── GallerySection.tsx       # NEW - Art styles grid
│   ├── StyleCard.tsx            # Individual style option
│   ├── HowItWorks.tsx           # NEW - 3-step process
│   ├── StepCard.tsx             # Individual step
│   ├── TestimonialsSection.tsx  # NEW - Reviews
│   ├── TestimonialCard.tsx      # Individual review
│   ├── NewsletterSection.tsx    # NEW - Email signup
│   └── CTASection.tsx           # Extract from page.tsx
│
├── create/                      # Frontend-B owns
│   ├── UploadZone.tsx           # Extract from create/page.tsx
│   ├── StylePicker.tsx          # Step 2: AI style selection
│   ├── StyleOption.tsx          # Individual style with preview
│   ├── ProductConfig.tsx        # Step 3: Size/Paper/Frame
│   ├── SizeSelector.tsx         # A5, A4, A3, A2 options
│   ├── PaperSelector.tsx        # Matte, Glossy, Canvas
│   ├── FrameSelector.tsx        # None, Black, White, Oak
│   ├── PriceCalculator.tsx      # Dynamic pricing display
│   ├── GiftOptions.tsx          # Gift toggle + message
│   └── OrderSummary.tsx         # Sidebar summary
│
└── checkout/                    # Frontend-B owns
    ├── CheckoutForm.tsx         # Address + payment wrapper
    ├── AddressForm.tsx          # Shipping address
    ├── PaymentForm.tsx          # Stripe elements
    ├── DiscountCode.tsx         # Promo code input
    └── OrderConfirmation.tsx    # Success page content
```

---

## Sprint 1: Landing Page Completion (MVP)

**Goal**: Complete marketing landing page for launch

### Story LP-01: Products Section
**Agent**: Frontend-B
**Points**: 3
**Priority**: P0

**Description**: Implement the products section with 3 product cards matching the design.

**Files**:
- `components/landing/ProductsSection.tsx`
- `components/landing/ProductCard.tsx`

**Acceptance Criteria**:
- [ ] 3 product cards: AI Art, Family Portrait, Pet Portrait
- [ ] Each card has: icon, badge (optional), title, description, price, CTA button
- [ ] Responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Hover effects on cards
- [ ] "Most Popular" badge on Family Portrait

**Data**:
```typescript
const products = [
  {
    id: 'ai-art',
    icon: 'sparkles',
    color: '#8b5cf6',
    subtitle: 'AI Art Print',
    title: 'אמנות AI מתמונה',
    description: 'הבינה המלאכותית שלנו הופכת את התמונה שלכם ליצירת אמנות בסגנון ייחודי.',
    price: 89,
    badge: null,
  },
  {
    id: 'family',
    icon: 'users',
    color: '#ec4899',
    subtitle: 'Family Portrait',
    title: 'פורטרט משפחתי',
    description: 'הפכו תמונה משפחתית ליצירת אמנות מרהיבה. מושלם כמתנה.',
    price: 149,
    badge: 'הכי פופולרי',
  },
  {
    id: 'pet',
    icon: 'heart',
    color: '#f59e0b',
    subtitle: 'Pet Portrait',
    title: 'פורטרט חיית מחמד',
    description: 'הנציחו את חיית המחמד האהובה בסגנון אמנותי ייחודי.',
    price: 119,
    badge: null,
  },
];
```

---

### Story LP-02: Gallery/Styles Section
**Agent**: Frontend-B
**Points**: 2
**Priority**: P0

**Description**: Implement art styles gallery grid.

**Files**:
- `components/landing/GallerySection.tsx`
- `components/landing/StyleCard.tsx`

**Acceptance Criteria**:
- [ ] Grid of style options (4 shown in design, 8 available)
- [ ] Each card: icon, label, hover effect
- [ ] Responsive: 2 col mobile, 4 col desktop
- [ ] Clicking navigates to `/create` with style pre-selected (future)

**Data**:
```typescript
const styles = [
  { id: 'romantic', icon: 'heart', label: 'רומנטי', color: '#ec4899' },
  { id: 'artistic', icon: 'brush', label: 'אמנותי', color: '#8b5cf6' },
  { id: 'family', icon: 'camera', label: 'משפחתי', color: '#3b82f6' },
  { id: 'minimal', icon: 'pen', label: 'מינימליסטי', color: '#f59e0b' },
  // Additional styles for step 2
  { id: 'pop-art', icon: 'zap', label: 'פופ ארט', color: '#ef4444' },
  { id: 'watercolor', icon: 'droplet', label: 'צבעי מים', color: '#06b6d4' },
  { id: 'oil', icon: 'palette', label: 'שמן', color: '#84cc16' },
  { id: 'comic', icon: 'star', label: 'קומיקס', color: '#f97316' },
];
```

---

### Story LP-03: How It Works Section
**Agent**: Frontend-B
**Points**: 2
**Priority**: P0

**Description**: Implement 3-step process section.

**Files**:
- `components/landing/HowItWorks.tsx`
- `components/landing/StepCard.tsx`

**Acceptance Criteria**:
- [ ] 3 steps with numbered badges
- [ ] Icons: upload, palette, package
- [ ] Responsive: vertical mobile, horizontal desktop
- [ ] Section header with title and subtitle

**Data**:
```typescript
const steps = [
  { number: '01', icon: 'upload', title: 'העלו תמונה', desc: 'בחרו תמונה מהגלריה שלכם' },
  { number: '02', icon: 'palette', title: 'בחרו סגנון', desc: 'AI הופך את התמונה לאמנות' },
  { number: '03', icon: 'package', title: 'קבלו הדפסה', desc: 'משלוח מהיר עד הבית' },
];
```

---

### Story LP-04: Testimonials Section
**Agent**: Frontend-B
**Points**: 2
**Priority**: P1

**Description**: Implement customer reviews section.

**Files**:
- `components/landing/TestimonialsSection.tsx`
- `components/landing/TestimonialCard.tsx`

**Acceptance Criteria**:
- [ ] Header with 5 stars + review count
- [ ] 3 testimonial cards
- [ ] Each card: stars, quote, author avatar, name, location
- [ ] Responsive: 1 col mobile, 3 col desktop

---

### Story LP-05: Newsletter Section
**Agent**: Frontend-B
**Points**: 1
**Priority**: P2

**Description**: Email signup section with discount offer.

**Files**:
- `components/landing/NewsletterSection.tsx`

**Acceptance Criteria**:
- [ ] Card with gift icon
- [ ] Email input + submit button
- [ ] "10% discount" messaging
- [ ] Form validation (email format)
- [ ] Success/error toast feedback

---

### Story LP-06: Mobile Navigation
**Agent**: Frontend-A
**Points**: 3
**Priority**: P0

**Description**: Implement responsive mobile menu.

**Files**:
- `components/layout/Navbar.tsx` (extract + enhance)
- `components/layout/MobileMenu.tsx`

**Acceptance Criteria**:
- [ ] Hamburger icon on mobile (< 1024px)
- [ ] Full-screen overlay menu
- [ ] Animated open/close
- [ ] Navigation links + CTA button
- [ ] Close on link click
- [ ] Close on overlay click
- [ ] Body scroll lock when open

---

### Story LP-07: Full Footer
**Agent**: Frontend-A
**Points**: 2
**Priority**: P1

**Description**: Implement 4-column footer matching design.

**Files**:
- `components/layout/Footer.tsx`

**Acceptance Criteria**:
- [ ] 4 columns: Brand, Products, Info, Contact
- [ ] Social links: Instagram, Facebook, TikTok, Snapchat
- [ ] Bottom row: copyright + legal links
- [ ] Responsive: stacked mobile, grid desktop

---

### Story LP-08: WhatsApp Button
**Agent**: Frontend-A
**Points**: 1
**Priority**: P2

**Description**: Fixed floating WhatsApp contact button.

**Files**:
- `components/layout/WhatsAppButton.tsx`

**Acceptance Criteria**:
- [ ] Fixed bottom-left position
- [ ] Green background with message icon
- [ ] Links to WhatsApp with pre-filled message
- [ ] Shadow effect
- [ ] Hide on scroll down, show on scroll up (optional enhancement)

---

### Story LP-09: Integrate Landing Page
**Agent**: Frontend-B
**Points**: 2
**Priority**: P0

**Description**: Integrate all new sections into landing page.

**Files**:
- `app/page.tsx` (refactor to use components)

**Acceptance Criteria**:
- [ ] All sections in correct order
- [ ] Smooth scroll to section anchors
- [ ] Performance: no layout shift
- [ ] All responsive breakpoints work

---

## Sprint 2: Create Flow Completion

**Goal**: Complete the 5-step order creation flow

### Story CF-01: Style Selection Page
**Agent**: Frontend-B
**Points**: 5
**Priority**: P0

**Description**: Step 2 of create flow - AI style selection.

**Files**:
- `app/(app)/create/style/page.tsx`
- `components/create/StylePicker.tsx`
- `components/create/StyleOption.tsx`

**Acceptance Criteria**:
- [ ] Grid of 8 AI styles
- [ ] Preview transformation (mock initially)
- [ ] Loading state during "transformation"
- [ ] Selected style highlight
- [ ] Continue button → `/create/customize`
- [ ] Back button → `/create`
- [ ] Progress indicator shows step 2

---

### Story CF-02: Customize Page
**Agent**: Frontend-B
**Points**: 5
**Priority**: P0

**Description**: Step 3 of create flow - product configuration.

**Files**:
- `app/(app)/create/customize/page.tsx`
- `components/create/ProductConfig.tsx`
- `components/create/SizeSelector.tsx`
- `components/create/PaperSelector.tsx`
- `components/create/FrameSelector.tsx`
- `components/create/PriceCalculator.tsx`
- `components/create/GiftOptions.tsx`

**Acceptance Criteria**:
- [ ] Image preview (original + transformed side by side)
- [ ] Size selection: A5 (₪89), A4 (₪119), A3 (₪149), A2 (₪199)
- [ ] Paper selection: Matte, Glossy (+₪20), Canvas (+₪50)
- [ ] Frame selection: None, Black (+₪80), White (+₪80), Oak (+₪120)
- [ ] Gift toggle with message field (150 chars max)
- [ ] Real-time price calculation
- [ ] Order summary sidebar
- [ ] Continue → `/create/checkout`

---

### Story CF-03: Checkout Page
**Agent**: Frontend-B + Backend-2
**Points**: 8
**Priority**: P0

**Description**: Step 4 - payment and shipping.

**Files**:
- `app/(app)/create/checkout/page.tsx`
- `components/checkout/CheckoutForm.tsx`
- `components/checkout/AddressForm.tsx`
- `components/checkout/PaymentForm.tsx`
- `components/checkout/DiscountCode.tsx`

**Acceptance Criteria**:
- [ ] Shipping address form (required fields)
- [ ] Gift recipient address (if gift mode)
- [ ] Discount code input with validation
- [ ] Order summary with all line items
- [ ] Stripe payment form (card, Apple Pay, Google Pay)
- [ ] Form validation
- [ ] Submit → create order → redirect to complete
- [ ] Error handling for payment failures

**Dependencies**:
- Stripe integration (Gate 0 approved)
- Backend-2: `/api/orders/create` endpoint

---

### Story CF-04: Confirmation Page
**Agent**: Frontend-B
**Points**: 2
**Priority**: P0

**Description**: Step 5 - order confirmation.

**Files**:
- `app/(app)/create/complete/page.tsx`
- `components/checkout/OrderConfirmation.tsx`

**Acceptance Criteria**:
- [ ] Success animation/icon
- [ ] Order number display
- [ ] Order summary
- [ ] Estimated delivery date
- [ ] "Continue Shopping" CTA
- [ ] Share on social (optional)
- [ ] Clear order store on mount

---

## Agent Assignments Summary

| Agent | Stories | Points |
|-------|---------|--------|
| **Frontend-A** | LP-06, LP-07, LP-08 | 6 |
| **Frontend-B** | LP-01 to LP-05, LP-09, CF-01 to CF-04 | 29 |
| **Backend-2** | CF-03 (API support) | 3 |
| **QA** | All stories (test coverage) | - |

---

## Technical Notes

### Tailwind Configuration
Ensure `tailwind.config.js` includes:
```javascript
theme: {
  extend: {
    colors: {
      'brand-purple': '#8b5cf6',
      'brand-pink': '#ec4899',
      'brand-cyan': '#22d3ee',
      'brand-orange': '#f59e0b',
      'dark-card': '#18181b',
      'dark-border': '#27272a',
    },
  },
},
```

### Icon Strategy
Use `lucide-react` for all icons. Already installed and used in current code.

### State Management
Order store (`stores/orderStore.ts`) already handles:
- Image state
- Style selection
- Product configuration
- Gift options

Extend for checkout data as needed.

---

## Definition of Done

- [ ] All components created with TypeScript
- [ ] Responsive at all breakpoints (mobile-first)
- [ ] RTL Hebrew text alignment
- [ ] Hover/focus states
- [ ] Loading states where applicable
- [ ] Error handling
- [ ] 80%+ test coverage
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Matches design pixel-close

---

## Approval

**CTO Decision**: APPROVED for implementation

**Next Steps**:
1. PM to create Linear stories from this document
2. Frontend-A to start LP-06 (Mobile Nav) immediately
3. Frontend-B to start LP-01 (Products Section) immediately
4. Daily standups to track progress

---

*Document created by CTO Agent - 2025-12-20*
