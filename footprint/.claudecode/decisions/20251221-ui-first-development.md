# [CTO-DECISION] UI-First Development Approach

**Date**: 2025-12-21
**Status**: APPROVED
**Decision ID**: CTO-2025-001

---

## Context

The Footprint project requires integration with multiple external services (Replicate AI, Stripe, Cloudflare R2, Uzerflow) that require Gate 0 research and approval. Rather than blocking frontend development while research is conducted, we need an approach that allows parallel workstreams.

Additionally, Footprint's core value proposition is UX - "under 2-minute purchase flow from upload to checkout." The user experience must be validated before backend integrations are wired.

---

## Decision

**[CTO-DECISION] UI-First development approach is APPROVED.**

Frontend agents (Frontend-A, Frontend-B) will build the complete UI with mock data before backend integrations are connected.

---

## Phased Approach

### Phase 1: UI Shell + Mock Data (Sprint 1-2)
- Complete 5-step order flow UI
- All components with realistic demo data
- Interactive prototype (fully clickable)
- Loading, error, and empty states implemented
- Validate UX with stakeholders

### Phase 2: State + API Contracts (Sprint 2-3)
- Zustand store implementation (Backend-1)
- Define TypeScript API interfaces
- Mock API returns realistic data shapes
- Component integration with store

### Phase 3: Integration (Sprint 3-4)
- Gate 0 approvals complete for all integrations
- Swap mock → real APIs (Backend-2)
- Integration testing
- QA validation

---

## Workflow Adjustment

```
Standard Playbook:
  CTO (Gate 0) → PM → Dev → QA → Merge

UI-First Modification:
  Phase 1: PM → Frontend-A/B (UI + Mock) → QA → Merge
  Parallel: CTO conducts Gate 0 research
  Phase 3: PM → Backend-1/2 (Integration) → QA → Merge
```

**Key Change**: Frontend agents begin Sprint 1 immediately. CTO conducts Gate 0 research in parallel.

---

## Conditions & Guardrails

| Condition | Rationale |
|-----------|-----------|
| Define TypeScript interfaces FIRST | Prevents data shape mismatches when connecting real APIs |
| Mock data must be realistic | Not just "test" strings - use realistic order data, prices, addresses |
| Build loading/error states from day 1 | Often forgotten in UI-first, causes rework later |
| No hardcoded magic values | Use constants/config for prices, sizes, options |
| Component tests with mock data | Tests should work identically when real API connected |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| UI built without backend constraints | Define API interfaces before UI implementation |
| Demo looks good but can't scale | Architecture review at Phase 2 gate |
| Mock data shapes don't match real API | CTO validates API contracts during Gate 0 research |

---

## API Interface Contract

Frontend will build against these interfaces (Backend-2 will implement):

```typescript
// lib/api/types.ts
interface ApiClient {
  orders: {
    create(data: CreateOrderInput): Promise<Order>;
    get(id: string): Promise<Order>;
    list(): Promise<Order[]>;
  };
  images: {
    upload(file: File): Promise<UploadResult>;
    transform(url: string, style: StyleType): Promise<TransformResult>;
  };
  styles: {
    list(): Promise<Style[]>;
  };
  pricing: {
    calculate(config: ProductConfig): Promise<PricingResult>;
  };
}
```

---

## Immediate Actions

1. **PM Agent**: Adjust sprint assignments to prioritize UI stories
2. **Frontend-A**: Begin UI primitives (Button, Card, Input, etc.)
3. **Frontend-B**: Begin Upload UI and Style Picker UI with mock data
4. **CTO**: Begin Gate 0 research for Replicate, Stripe, R2, Uzerflow
5. **Backend-1**: Define TypeScript interfaces and order store

---

## Gate 0 Research Schedule (CTO)

| Integration | Research Document | Priority |
|-------------|-------------------|----------|
| Replicate AI | `GATE0-replicate-ai.md` | P0 - Needed for style preview |
| Cloudflare R2 | `GATE0-cloudflare-r2.md` | P0 - Needed for image upload |
| Stripe | `GATE0-stripe-payments.md` | P1 - Needed for checkout |
| Uzerflow | `GATE0-uzerflow-backend.md` | P1 - Needed for orders |

---

## Success Criteria

- [ ] Complete clickable prototype by end of Sprint 2
- [ ] All 5 order flow steps implemented with mock data
- [ ] Loading/error states for all async operations
- [ ] TypeScript interfaces defined for all API contracts
- [ ] Gate 0 research complete for all integrations

---

**[CTO-DECISION] This approach is approved and effective immediately.**

---

*Decision made by CTO Agent - 2025-12-21*
