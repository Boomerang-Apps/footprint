# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev              # Start Next.js dev server at localhost:3000
pnpm build            # Production build
pnpm lint             # ESLint
pnpm type-check       # TypeScript check (tsc --noEmit)

# Testing
pnpm test             # Run Vitest in watch mode
pnpm test:run         # Single test run
pnpm test:coverage    # Coverage report
pnpm test -- path/to/file.test.ts  # Run specific test file

# E2E (start dev server first)
pnpm test:e2e         # Playwright tests
pnpm test:e2e:ui      # Playwright interactive mode

# Storybook
pnpm storybook        # Component playground at localhost:6006
```

## Architecture Overview

**Footprint** is a Hebrew RTL photo-to-art e-commerce app. Users upload photos, apply AI style transformations (via Replicate), customize print options, and checkout.

### Route Groups (App Router)
- `app/(marketing)/` - Public landing pages
- `app/(app)/` - Protected user flows (create order, account)
- `app/(auth)/` - Login/signup
- `app/admin/`, `app/cockpit/` - Admin dashboards
- `app/track/` - Order tracking (public)
- `app/api/` - API routes

### Order Creation Flow
Multi-step wizard with state persisted in Zustand:
1. **Upload** (`/create`) - Photo upload via dropzone
2. **Style** (`/create/style`) - AI style selection, triggers Replicate transformation
3. **Tweak** (`/create/tweak`) - Brightness, contrast, crop adjustments
4. **Customize** (`/create/customize`) - Size, paper, frame, gift options
5. **Checkout** (`/create/checkout`) - Payment via Stripe/PayPlus
6. **Complete** (`/create/complete`) - Confirmation

### State Management
- **Zustand** (`stores/orderStore.ts`) - Order wizard state, persisted to localStorage
- **TanStack Query** - Server state for orders, profiles, addresses (hooks in `hooks/`)

### API Abstraction Layer
`lib/api/client.ts` exports unified `api` object backed by:
- `mock.ts` - Development (set `NEXT_PUBLIC_USE_MOCK=true`)
- `supabase-client.ts` - Production (calls Next.js API routes → Supabase)

```typescript
import { api } from '@/lib/api/client';
await api.orders.list();
await api.auth.login({ email, password });
```

### Key Library Modules
| Path | Purpose |
|------|---------|
| `lib/ai/` | Replicate integration, style configs |
| `lib/pricing/` | Price calculator, discounts, shipping |
| `lib/payments/` | Stripe & PayPlus processors |
| `lib/storage/` | Cloudflare R2 file storage |
| `lib/supabase/` | DB client (client.ts for browser, server.ts for API routes) |
| `lib/fulfillment/` | Order status transitions, bulk operations |
| `lib/shipping/` | Israel Post integration, tracking |

## Code Patterns

### TypeScript Path Alias
Use `@/` for imports from project root:
```typescript
import { Button } from '@/components/ui/Button';
import { useOrderStore } from '@/stores/orderStore';
```

### Component Conventions
- Server Components by default
- Add `'use client'` only when needed (hooks, interactivity)
- UI primitives in `components/ui/` (Button, Card, Input, etc.)
- Feature components colocated: `components/checkout/`, `components/upload/`, etc.

### RTL/Hebrew Support
Root layout sets `dir="rtl"` and `lang="he"`. Use Tailwind logical properties:
- `start/end` instead of `left/right`
- `ms-`/`me-` instead of `ml-`/`mr-`
- `ps-`/`pe-` instead of `pl-`/`pr-`

### Testing Patterns
- Unit tests: `*.test.ts` colocated with source
- Vitest + jsdom for component/hook tests
- Testing Library for React components
- Coverage targets: `lib/`, `stores/`, `data/`, `app/api/`

## Environment Variables

```env
# Development mode
NEXT_PUBLIC_USE_MOCK=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
REPLICATE_API_TOKEN=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPLUS_API_KEY=
PAYPLUS_SECRET_KEY=

# Storage
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ACCOUNT_ID=
```

## WAVE V2 Workflow (if active)

When working under WAVE V2 orchestration, follow gates sequentially:
- Gate 0-1: Pre-flight, self-review
- Gate 2-3: Build passes, tests pass
- Gate 4-5: QA/PM acceptance
- Gate 6-7: Architecture review, merge approval

Signal files in `.claude/signals/`. Run `/commands` for available slash commands.
