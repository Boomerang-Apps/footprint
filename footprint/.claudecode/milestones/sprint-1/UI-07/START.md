# UI-07: Base UI Primitives

**Agent**: Frontend-A
**Branch**: feature/ui-07-base-primitives
**Started**: 2025-12-24
**Gate**: 2 → 3 (Ready for QA)
**Completed**: 2025-12-25

---

## Objective

Create foundational UI components for Footprint design system:
- Button (primary, secondary, ghost, destructive variants)
- Card (container with optional header/footer)
- Input (text input with label, error states)
- Select (dropdown selection)
- Checkbox (toggle with label)
- Badge (status indicator)

All components must be:
- RTL-ready (Hebrew/English)
- Dark mode compatible
- Accessible (ARIA, keyboard nav)
- Tested with 80%+ coverage

---

## Design Tokens (from tailwind.config.ts)

```typescript
// Brand colors
brand.purple: '#8b5cf6'
brand.pink: '#ec4899'
brand.cyan: '#22d3ee'
brand.orange: '#f59e0b'

// Light theme
light.bg: '#ffffff'
light.soft: '#fafafa'
light.muted: '#f5f5f5'
light.border: '#e5e5e5'

// Text
text.primary: '#1a1a1a'
text.secondary: '#525252'
text.muted: '#737373'

// Shadows
shadow-soft-sm, shadow-soft-md, shadow-soft-lg
shadow-brand, shadow-brand-lg
```

---

## Implementation Plan

### Phase 1: Core Components
1. **Button** - Primary interaction element
   - Variants: primary, secondary, ghost, destructive
   - Sizes: sm, md, lg
   - States: default, hover, active, disabled, loading

2. **Input** - Text entry
   - Label support
   - Error state with message
   - RTL text direction

3. **Card** - Content container
   - Optional header/footer slots
   - Padding variants

### Phase 2: Selection Components
4. **Checkbox** - Boolean toggle
   - Checked/unchecked states
   - Label positioning (start/end for RTL)
   - Disabled state

5. **Select** - Dropdown
   - Native select wrapper
   - Custom styling
   - RTL arrow direction

6. **Badge** - Status indicator
   - Variants: default, success, warning, error, info
   - Sizes: sm, md

---

## File Structure

```
components/ui/
├── Button.tsx
├── Button.test.tsx
├── Card.tsx
├── Card.test.tsx
├── Input.tsx
├── Input.test.tsx
├── Select.tsx
├── Select.test.tsx
├── Checkbox.tsx
├── Checkbox.test.tsx
├── Badge.tsx
├── Badge.test.tsx
├── index.ts          # Barrel export
└── utils.ts          # cn() helper
```

---

## TDD Approach

For each component:
1. Write test file with all expected behaviors
2. Run tests (RED)
3. Implement component
4. Run tests (GREEN)
5. Refactor if needed

---

## Acceptance Criteria

- [x] All 6 components implemented
- [x] Tests written FIRST (TDD)
- [x] 134 tests passing on UI components
- [x] TypeScript strict mode (0 errors)
- [x] ESLint clean
- [x] RTL support (dir attribute, label positioning)
- [x] Accessible (keyboard nav, ARIA, focus states)

---

## Dependencies

- clsx (installed)
- tailwind-merge (installed)
- No additional dependencies needed

---

## Rollback

See ROLLBACK-PLAN.md
