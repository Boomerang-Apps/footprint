# [CTO-DECISION] Footprint Architecture Decisions

**Date**: 2025-12-19
**Decision By**: CTO Agent
**Status**: APPROVED

---

## Decision 1: API Abstraction Layer

### Context
Footprint depends on Uzerflow backend which may not be fully ready during development.

### Decision
Implement an API abstraction layer that allows switching between mock and production APIs.

### Rationale
- Enables parallel frontend/backend development
- Same interface guarantees compatibility
- Easy testing with controlled mock data
- Zero code changes needed when switching to production

### Implementation
```typescript
const api = process.env.USE_MOCK ? mockClient : uzerflowClient;
```

---

## Decision 2: Stripe Checkout over Elements

### Context
Need to implement payment processing for Footprint orders.

### Decision
Use Stripe Checkout (hosted) for MVP instead of Stripe Elements (embedded).

### Rationale
- PCI compliant by default
- Automatic 3D Secure handling
- Built-in Apple Pay / Google Pay
- Faster implementation
- Reduced security surface area

### Trade-offs
- Less UI customization
- Redirect to Stripe page
- Consider Elements for Phase 2 if needed

---

## Decision 3: Cloudflare R2 over AWS S3

### Context
Need cloud storage for user-uploaded images and transformed results.

### Decision
Use Cloudflare R2 as primary image storage.

### Rationale
- Zero egress fees (major cost savings)
- S3-compatible SDK (easy migration)
- Global edge network
- Cloudflare Images integration for thumbnails

### Implementation
- Presigned URLs for uploads
- User-isolated paths
- CORS restricted to our domain

---

## Decision 4: Zustand for Client State

### Context
Need state management for the 5-step order creation flow.

### Decision
Use Zustand with localStorage persistence for order state.

### Rationale
- Lightweight (2KB)
- Simple API
- Built-in persistence middleware
- No boilerplate like Redux
- React Query handles server state

### Implementation
```typescript
const useOrderStore = create(
  persist(
    (set) => ({ /* state */ }),
    { name: 'footprint-order' }
  )
);
```

---

## Decision 5: TDD with 80% Coverage Minimum

### Context
Need quality assurance for a production e-commerce application.

### Decision
Enforce Test-Driven Development with 80% minimum code coverage.

### Rationale
- Reduces bugs in production
- Forces better design
- Enables confident refactoring
- Critical for payment processing code

### Implementation
- QA Agent blocks merges below 80%
- 100% coverage for services and utils
- Tests written before implementation

---

## Decision 6: Multi-Agent Orchestration

### Context
Complex project with multiple domains (AI, payments, frontend).

### Decision
Use 7-agent development framework with PM orchestration.

### Rationale
- Clear domain ownership
- No merge conflicts between domains
- PM tracks all progress
- QA gates ensure quality
- CTO approves architecture

### Agents
CTO, PM, QA, Backend-1, Backend-2, Frontend-A, Frontend-B

---

## Decision 7: Bilingual Support (EN/HE)

### Context
Primary market is Israel, needs Hebrew support.

### Decision
Build with bilingual support from day one.

### Rationale
- 80%+ of traffic expected from Israel
- RTL layout support critical
- User preference stored in profile
- Avoid retrofitting later

### Implementation
- Heebo font for Hebrew
- `dir="rtl"` attribute support
- `preferredLanguage` in User type

---

## Decision 8: Under 2-Minute Purchase Target

### Context
Mobile-first e-commerce requires fast checkout.

### Decision
Design entire flow for under 2-minute completion.

### Rationale
- Mobile users have short attention spans
- Reduces cart abandonment
- Key differentiator from competitors

### Implementation
- 5 focused steps
- Minimal required fields
- Address autocomplete
- One-tap payment support

---

## Action Items

| Decision | Owner | Status |
|----------|-------|--------|
| API Abstraction Layer | Backend-1/2 | Implemented |
| Stripe Checkout | Backend-2 | Gate 0 Approved |
| R2 Storage | Backend-2 | Gate 0 Approved |
| Zustand Store | Backend-1 | Implemented |
| TDD Enforcement | QA | Active |
| Multi-Agent | PM | Active |
| Bilingual | Frontend-A | Pending |
| 2-Min Target | All | Metric |

---

## Review Date

These decisions should be reviewed: 2026-03-19 (3 months)

---

*Decisions recorded by CTO Agent - 2025-12-19*
