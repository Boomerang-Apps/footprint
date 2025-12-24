# Frontend-A Agent Inbox

Work assignments for shell, navigation, and UI primitives appear here.

---

## Domain Reminder
Your domain: App shell, auth UI, UI primitives (Button, Card, Input), theme, navigation

NOT your domain: Feature components (Frontend-B), APIs (Backend-2), stores (Backend-1)

---

## How to Use This Inbox

### For PM Agent:
Assign work related to:
- App layout and navigation
- Auth screens (login, register)
- UI primitive components
- Theme and styling

### Message Format:
```markdown
## [DATE] - PM: [Story Title]

**Story**: STORY-ID
**Gate**: 1-Plan / 2-Build
**Priority**: P0/P1/P2

## Context
[Background information]

## Assignment
[What to implement]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Tests written (TDD)
- [ ] 80%+ coverage

## Files to Create/Modify
| File | Action |
|------|--------|
| path/to/file | Create/Modify |

→ When done, write to: .claudecode/handoffs/qa-inbox.md

---
```

---

## Pending Messages

## 2025-12-24 - PM: ✅ RESOLVED - Test Infrastructure Fix

**Status**: COMPLETE
**Fixed By**: Frontend-A (2025-12-24)

### Results
- Tests: 535 passing (25 files)
- TypeScript: 0 errors
- ESLint: Clean

### Fixes Applied
- Installed @testing-library/user-event, @testing-library/dom
- Added @vitejs/plugin-react to vitest config
- Added Address type export

**→ Proceed to UI-07 below**

---

## 2025-12-24 - PM: UI-07 Assignment - Base UI Primitives

**Story**: UI-07
**Priority**: P0 - Start Immediately
**Type**: Sprint 4 - UI Primitives (Parallel Track)
**Sprint**: 4

### Context
Sprint 4 has been reorganized with **two parallel tracks**:
- **Frontend-A (You)**: UI Primitives (UI-07 → UI-08 → UI-09) = 7 SP
- **Frontend-B**: Feature Pages (UI-01 → UI-05) = 16 SP

Your work runs in parallel. Frontend-B's UI-05 (Confirmation) depends on your UI-09 (Timeline).

### Assignment
You are assigned UI-07: Base UI Primitives (components/ui/)

**Points**: 3
**Dependencies**: None - start immediately

### Requirements
Create the `components/ui/` folder with foundational UI components:

**Files to Create**:
```
footprint/components/ui/
├── Button.tsx           # Primary, secondary, outline, ghost variants
├── Button.test.tsx
├── Card.tsx             # Container with header, body, footer
├── Card.test.tsx
├── Input.tsx            # Text input with label, error state
├── Input.test.tsx
├── Select.tsx           # Dropdown select with options
├── Select.test.tsx
├── Checkbox.tsx         # Checkbox with label
├── Checkbox.test.tsx
├── Badge.tsx            # Status badges (pending, success, etc.)
├── Badge.test.tsx
└── index.ts             # Export all components
```

### Component Requirements
1. **RTL Support**: All components must work with `dir="rtl"`
2. **Tailwind CSS**: Use Tailwind classes only (no CSS modules)
3. **TypeScript**: Strict types, proper interfaces
4. **Accessibility**: ARIA labels, keyboard navigation
5. **Hebrew Labels**: Support Hebrew text without breaking
6. **Variants**: Each component should have size/color variants

### Button Variants Example
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Acceptance Criteria
- [ ] All 6 components created with TypeScript interfaces
- [ ] RTL layout works correctly
- [ ] Tailwind styling only
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum
- [ ] TypeScript clean
- [ ] ESLint clean

### Gate 1 Checklist (MANDATORY - Before Coding)
- [ ] Create branch: `git checkout -b feature/UI-07-ui-primitives`
- [ ] Create START.md: `.claudecode/milestones/sprint-4/UI-07/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag UI-07-start`

### Next Stories (After UI-07)
- **UI-08**: Step Progress Indicator (2 SP)
- **UI-09**: Price Display & Timeline (2 SP) - Frontend-B's UI-05 depends on this

### On Completion
Write handoff to: `.claudecode/handoffs/qa-inbox.md`

Include:
- Branch name
- Test results (`npm test -- --coverage`)
- TypeScript check (`npm run type-check`)
- Files created

---

---
