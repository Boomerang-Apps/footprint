# UI-06: Demo Data & Mock Images

**Started**: 2025-12-24
**Agent**: Frontend-B
**Branch**: feature/ui-06-demo-data
**Linear**: N/A (infrastructure story)
**Gate**: 1 - Planning

---

## Story Summary

Create centralized demo data for orders, users, and sample images to support UI testing across all 5 order flow pages. This is the foundation story for Sprint 4 UI work.

---

## Scope

### In Scope
- Demo data module with typed sample data
- Sample orders in various statuses (pending, paid, processing, shipped, delivered)
- Sample users (regular user, admin user)
- Sample addresses (shipping, billing)
- Style preview placeholder images (8 styles)
- Demo product configurations
- Utility functions for generating test data
- Integration with existing types from `types/`

### Out of Scope
- Actual image files (use placeholder URLs)
- Changes to the mock API layer (that's Backend-2)
- Changes to UI components (subsequent UI-01 to UI-05 stories)

---

## Acceptance Criteria

- [ ] Demo data module exports typed sample data
- [ ] Sample orders cover all OrderStatus values
- [ ] Sample users include regular and admin users
- [ ] Sample addresses are realistic (Hebrew + Israel)
- [ ] Style preview images have consistent placeholder URLs
- [ ] All exports are properly typed (no `any`)
- [ ] Tests written FIRST (TDD)
- [ ] 80%+ test coverage
- [ ] TypeScript strict mode clean
- [ ] Linter clean

---

## Files to Create

| File | Description |
|------|-------------|
| `footprint/data/demo/index.ts` | Main exports |
| `footprint/data/demo/orders.ts` | Sample orders and order items |
| `footprint/data/demo/users.ts` | Sample users and addresses |
| `footprint/data/demo/products.ts` | Style previews, product configs |
| `footprint/data/demo/images.ts` | Placeholder image URLs |
| `footprint/data/demo/index.test.ts` | Tests for demo data |

---

## Technical Notes

### Data Structure
```typescript
// Main export structure
export const demoData = {
  orders: Order[];
  users: User[];
  addresses: Address[];
  styles: Style[];
  images: {
    original: string[];
    transformed: Record<StyleType, string[]>;
    stylePreview: Record<StyleType, string>;
  };
};
```

### Placeholder Images
Use Unsplash/Picsum for consistent placeholder images:
- Original photos: `https://picsum.photos/seed/{id}/800/600`
- Style previews: Static paths like `/demo/styles/{style}.jpg`

### Integration Points
- Types from `@/types` (Order, User, Address, Style, etc.)
- Can be imported by UI components for testing
- Can be used by Storybook stories (future)
- Complements mock API in `lib/api/mock.ts`

---

## Dependencies

### Blocked By
- Sprint 3 complete (types stable)

### Blocks
- UI-01: Upload Page UI
- UI-02: Style Selection UI
- UI-03: Customize Page UI
- UI-04: Checkout Page UI
- UI-05: Confirmation Page UI

---

## Safety Gate Progress

- [x] Gate 0: Research (N/A - internal data)
- [x] Gate 1: Planning (this document)
- [x] Gate 2: Implementation (TDD - 51 tests, 100% coverage)
- [ ] Gate 3: QA Validation (pending)
- [x] Gate 4: Review (TypeScript clean, Lint clean)
- [ ] Gate 5: Deployment

---

*Started by Frontend-B Agent - 2025-12-24*
*Implementation complete - 2025-12-24*
