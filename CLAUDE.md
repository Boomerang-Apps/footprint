# CLAUDE.md - Footprint Development Protocol

**Project**: Footprint - AI-Powered Photo Printing Studio
**Version**: 1.0
**Last Updated**: 2025-12-19
**CTO Approved**: Yes

---

## Project Overview

Footprint transforms everyday photos into museum-quality art prints using AI-powered style transformation. Users upload photos, apply artistic styles (pop art, watercolor, etc.), customize print options, and receive professionally printed artwork.

**Vision**: "Turn every photo into a lasting memory, every memory into a meaningful gift."

**Target**: Under 2-minute purchase flow from upload to checkout.

---

## Quick Start

```bash
# Install dependencies
npm install

# Development (with mock API)
NEXT_PUBLIC_USE_MOCK=true npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm test
npm test -- --coverage
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | React framework, SSR |
| UI | React 18, Tailwind CSS | Components, styling |
| State | Zustand | Client state (order flow) |
| Server State | TanStack React Query | API data, caching |
| Language | TypeScript (strict) | Type safety |
| Backend | Uzerflow | Auth, orders, users |
| AI | Replicate API | Image transformation |
| Storage | Cloudflare R2 | Image storage |
| Payments | Stripe | Payment processing |
| Hosting | Vercel | Frontend deployment |

---

## Multi-Agent Development Framework

This project uses a 7-agent orchestration system. **All work flows through the PM Agent.**

### Agent Roster

| Agent | Domain | Files Owned |
|-------|--------|-------------|
| **CTO** | Architecture, Security, Gate 0 | Decisions, research approvals |
| **PM** | Orchestration, Tracking, Merges | All coordination |
| **QA** | Testing, Coverage (80%+) | Test files |
| **Backend-1** | Auth, State, Stores | `stores/`, `hooks/useAuth.ts` |
| **Backend-2** | External APIs | `lib/api/`, `lib/ai/`, `lib/storage/`, `app/api/` |
| **Frontend-A** | Shell, Primitives | `app/layout.tsx`, `components/ui/` |
| **Frontend-B** | Features, Order Flow | `app/(app)/create/`, feature components |

### Workflow

```
User Request → CTO (Gate 0) → PM → Dev Agent → QA → PM Merge
```

### Safety Gates

1. **Gate 0**: Research (CTO approval for APIs)
2. **Gate 1**: Planning (START.md, ROLLBACK-PLAN.md)
3. **Gate 2**: Implementation (TDD, tests first)
4. **Gate 3**: QA Validation (80%+ coverage)
5. **Gate 4**: Review (TypeScript, lint clean)
6. **Gate 5**: Deployment (merge to main)

---

## Project Structure

```
footprint/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages
│   │   └── page.tsx              # Landing page with hero upload
│   ├── (app)/                    # Protected app pages
│   │   └── create/               # 5-step order flow
│   │       ├── page.tsx          # Step 1: Upload
│   │       ├── style/            # Step 2: AI Style
│   │       ├── customize/        # Step 3: Size/Paper/Frame
│   │       ├── checkout/         # Step 4: Payment
│   │       └── complete/         # Step 5: Confirmation
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── upload/               # Image upload endpoint
│   │   ├── transform/            # AI transformation
│   │   └── webhooks/stripe/      # Stripe webhooks
│   ├── layout.tsx                # Root layout
│   └── providers.tsx             # Context providers
├── components/
│   ├── ui/                       # Base primitives (Button, Card, Input)
│   ├── upload/                   # Photo upload components
│   ├── style-picker/             # AI style selection
│   ├── product-config/           # Size, paper, frame selectors
│   └── checkout/                 # Payment, address forms
├── lib/
│   ├── api/                      # API abstraction layer
│   │   ├── client.ts             # Unified client (mock/uzerflow)
│   │   ├── mock.ts               # Development mock API
│   │   ├── uzerflow.ts           # Production Uzerflow API
│   │   └── types.ts              # API interfaces
│   ├── ai/                       # Replicate integration
│   └── storage/                  # R2 storage utilities
├── stores/
│   └── orderStore.ts             # Order creation state
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript definitions
└── .claudecode/                  # Multi-agent framework
    ├── agents/                   # Agent role definitions
    ├── handoffs/                 # Agent communication inboxes
    ├── milestones/               # Sprint tracking
    ├── research/                 # Gate 0 research docs
    └── workflows/                # Safety protocols
```

---

## Core Features

### 1. Photo Upload (Epic 1)
- Camera roll integration (mobile)
- Drag-and-drop (desktop)
- Formats: JPG, PNG, HEIC
- Max size: 20MB
- Auto-optimization for print DPI

### 2. AI Style Transformation (Epic 2)
- **Pop Art**: Bold colors, halftone, Warhol-inspired
- **Watercolor**: Soft edges, flowing colors
- **Line Art**: Clean lines, minimalist
- **Oil Painting**: Thick brushstrokes, classic
- **Romantic**: Soft focus, warm tones
- **Comic Book**: Bold outlines, bright colors
- **Vintage/Retro**: Sepia, film grain
- **Original Enhanced**: Photo with color enhancement

Target: < 10 second transformation time

### 3. Product Configuration (Epic 3)
| Option | Choices |
|--------|---------|
| Size | A5, A4, A3, A2 |
| Paper | Fine Art Matte, Glossy Photo, Canvas |
| Frame | None, Black, White, Natural Oak |

### 4. Gift Experience (Epic 4)
- Gift toggle with wrap option
- Personal message (150 chars)
- Recipient shipping address
- Price hidden from recipient

### 5. Checkout (Epic 5)
- Stripe payment (cards, Apple Pay, Google Pay)
- Address autocomplete
- Discount codes
- Order confirmation email + WhatsApp

### 6. Admin Dashboard (Epic 6)
- Order list with status filters
- Print-ready file downloads
- Tracking number input
- Customer notifications

---

## API Abstraction Layer

Development uses mock API until Uzerflow is ready:

```typescript
// Controlled by NEXT_PUBLIC_USE_MOCK env variable
import { api } from '@/lib/api/client';

// Same interface for mock and production
const orders = await api.orders.list();
const user = await api.auth.getSession();
```

---

## State Management

Order creation flow uses Zustand store:

```typescript
// stores/orderStore.ts
interface OrderState {
  currentStep: 1 | 2 | 3 | 4 | 5;

  // Images
  originalImage: string | null;
  transformedImage: string | null;

  // Configuration
  selectedStyle: StyleType | null;
  size: 'A5' | 'A4' | 'A3' | 'A2';
  paper: 'matte' | 'glossy' | 'canvas';
  frame: 'none' | 'black' | 'white' | 'oak';

  // Gift
  isGift: boolean;
  giftMessage: string;

  // Addresses
  shippingAddress: Address | null;

  // Pricing
  subtotal: number;
  shipping: number;
  total: number;
}
```

---

## Environment Variables

```bash
# API Mode
NEXT_PUBLIC_USE_MOCK=true          # true for dev, false for prod

# Uzerflow Backend
UZERFLOW_API_URL=https://api.uzerflow.com
UZERFLOW_API_KEY=uz_xxxxx

# AI (Replicate)
REPLICATE_API_TOKEN=r8_xxxxx

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=footprint-images

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App
NEXT_PUBLIC_APP_URL=https://footprint.co.il
```

---

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types
- Explicit return types on functions
- Interface over type for objects

### Components
- Functional components only
- Props interfaces defined
- Use Tailwind CSS (no inline styles)
- Support dark mode

### Testing (TDD Required)
- Write tests FIRST
- 80% minimum coverage
- 100% for services and utils
- Use Vitest or Jest

### Git Conventions
```
feat(scope): description    # New feature
fix(scope): description     # Bug fix
test(scope): description    # Tests
docs(scope): description    # Documentation
refactor(scope): description
```

---

## Sprint Backlog Summary

| Sprint | Focus | Stories | Points |
|--------|-------|---------|--------|
| 1 | Foundation, Upload | UP-01 to UP-04 | 16 |
| 2 | AI, Customization | AI-01 to AI-04, PC-01 to PC-04 | 27 |
| 3 | Checkout, Gifting | GF-01 to GF-03, CO-01, CO-02, CO-04 | 18 |
| 4 | Admin, Polish | OM-01 to OM-04, AI-05, CO-03, CO-05 | 19 |

**Total**: 89 story points across 8 weeks

---

## Gate 0 Required Integrations

The following require CTO research approval before implementation:

1. **Replicate AI** - Image transformation API
2. **Stripe** - Payment processing
3. **Cloudflare R2** - Image storage
4. **Uzerflow** - Backend platform

Research documents: `.claudecode/research/GATE0-*.md`

---

## Key Metrics

| Metric | Target |
|--------|--------|
| Upload to Purchase | < 2 minutes |
| AI Transformation | < 10 seconds |
| Test Coverage | >= 80% |
| Conversion Rate | >= 15% |
| Customer Satisfaction | >= 4.8 stars |

---

## Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run build               # Production build
npm run start               # Start production

# Quality
npm run type-check          # TypeScript check
npm run lint                # ESLint
npm test                    # Run tests
npm test -- --coverage      # Tests with coverage

# Multi-Agent
./scripts/setup-worktrees.sh    # Create agent worktrees
./scripts/sync-worktrees.sh     # Sync with main
```

---

## Documentation

| Document | Location |
|----------|----------|
| This file | `CLAUDE.md` |
| Quick Start | `MULTI-AGENT-QUICKSTART.md` |
| Full Playbook | `multi-agent-doc/multi-agent-playbook.md` |
| Agent Definitions | `.claudecode/agents/*.md` |
| Safety Framework | `.claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md` |
| Sprint Stories | `.claudecode/linear-stories/` |

---

**[CTO-DECISION] This protocol is approved and enforced.**

*Document created by CTO Agent - 2025-12-19*
