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

## 2025-12-26 - PM: AUTH-02 Assignment - Guest Checkout Option

**Story**: AUTH-02
**Priority**: P1
**Type**: Parallel Assignment (4 agents)
**Sprint**: 6
**Points**: 2

### Context

CTO has expanded your domain to include **Auth + Standalone Pages**. You successfully delivered AUTH-01 (User Login) with 100% coverage. Now handle the guest checkout flow.

**Pairing**: Backend-1 will implement guest session state in orderStore. Coordinate if needed.

### Assignment

Implement guest checkout option allowing users to purchase without creating an account.

### Requirements

1. **Guest Checkout Toggle**
   - Option on checkout page to continue as guest
   - Clear distinction from logged-in flow
   - Email capture for order updates

2. **Guest Form**
   ```typescript
   interface GuestCheckoutForm {
     email: string;           // Required - for order confirmation
     firstName: string;       // Required
     lastName: string;        // Required
     phone?: string;          // Optional
     marketingConsent: boolean; // Checkbox for future emails
   }
   ```

3. **UI Components**
   - GuestCheckoutForm component
   - Email validation with real-time feedback
   - "Create account after purchase" optional checkbox
   - Hebrew labels with RTL support

### Files to Create/Modify

| File | Action |
|------|--------|
| `components/checkout/GuestCheckoutForm.tsx` | Create |
| `components/checkout/GuestCheckoutForm.test.tsx` | Create |
| `components/checkout/index.ts` | Modify (add export) |

### Acceptance Criteria

- [ ] Guest checkout form renders correctly
- [ ] Email validation works (format check)
- [ ] Form integrates with orderStore (Backend-1's work)
- [ ] RTL Hebrew layout works
- [ ] Marketing consent checkbox functional
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum
- [ ] TypeScript clean
- [ ] ESLint clean

### Gate 1 Checklist (MANDATORY)

- [ ] Create branch: `git checkout -b feature/AUTH-02-guest-checkout`
- [ ] Create START.md: `.claudecode/milestones/sprint-6/AUTH-02/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag AUTH-02-start`

### On Completion

Write handoff to: `.claudecode/handoffs/qa-inbox.md`

---

## 2025-12-25 - PM: UI-08 Assignment - Step Progress Indicator [COMPLETED]

**Story**: UI-08
**Priority**: P0 - Start Immediately
**Type**: Sprint 4 - UI Primitives (Parallel Track)
**Sprint**: 4

### Context
UI-07 (Base UI Primitives) is now merged ✅. You can start UI-08 immediately.

Your components from UI-07 are available: Button, Card, Input, Select, Checkbox, Badge.

### Assignment
You are assigned UI-08: Step Progress Indicator

**Points**: 2
**Dependencies**: UI-07 ✅ (merged)

### Requirements
Create a reusable step progress indicator for the 5-step order flow.

**Reference**: See mockups `01-upload.html` through `05-confirmation.html` - all have a progress bar at the top.

**Files to Create**:
```
footprint/components/ui/
├── StepProgress.tsx       # Main progress indicator component
├── StepProgress.test.tsx  # TDD tests
└── index.ts               # Update exports
```

### Component Interface
```typescript
interface Step {
  id: number;
  label: string;      // Hebrew label
  labelEn?: string;   // Optional English label
}

interface StepProgressProps {
  steps: Step[];              // Array of steps
  currentStep: number;        // Current active step (1-based)
  className?: string;         // Optional additional styling
}

// Default steps for Footprint order flow:
const defaultSteps: Step[] = [
  { id: 1, label: 'העלאה', labelEn: 'Upload' },
  { id: 2, label: 'סגנון', labelEn: 'Style' },
  { id: 3, label: 'התאמה', labelEn: 'Customize' },
  { id: 4, label: 'תשלום', labelEn: 'Checkout' },
];
```

### Visual Requirements (from mockups)
1. **Progress Bar**:
   - Height: 4px
   - Background: gray-200
   - Fill: gradient purple→pink (`from-violet-500 to-pink-500`)
   - Fill width: (currentStep / totalSteps) * 100%
   - Rounded corners

2. **Step Labels**:
   - Display below progress bar
   - Space evenly across width
   - Font: 12px, gray-400 for inactive
   - Active step: purple color, font-weight 600
   - Completed steps: green color with checkmark dot

3. **Step Dots**:
   - Small circles (8px) next to labels
   - Gray for pending, purple for active, green for completed

### RTL Support
- Labels are Hebrew by default
- Progress bar fills from RIGHT to LEFT in RTL mode
- `dir="rtl"` must work correctly

### Acceptance Criteria
- [ ] StepProgress component renders correctly
- [ ] Shows current step highlighted
- [ ] Shows completed steps with green styling
- [ ] Progress bar fills proportionally
- [ ] RTL layout works correctly
- [ ] Responsive (mobile-first)
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum
- [ ] TypeScript clean
- [ ] ESLint clean

### Gate 1 Checklist (MANDATORY - Before Coding)
- [ ] Create branch: `git checkout -b feature/UI-08-step-progress`
- [ ] Create START.md: `.claudecode/milestones/sprint-4/UI-08/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag UI-08-start`

### Next Story (After UI-08)
- **UI-09**: Price Display & Timeline (2 SP) - Frontend-B's UI-05 depends on this

### On Completion
Write handoff to: `.claudecode/handoffs/qa-inbox.md`

**Unblocks**: All order flow pages can use this component

---

---

## Completed Messages

## 2025-12-25 - PM: UI-07 Assignment [COMPLETED]

**Story**: UI-07
**Status**: ✅ QA APPROVED & MERGED (2025-12-25)
**Results**: 134 tests, 100% statement coverage, 98% branch coverage

**Components Delivered**: Button, Card, Input, Select, Checkbox, Badge, utils

---

## 2025-12-24 - PM: Test Infrastructure Fix [COMPLETED]

**Status**: ✅ RESOLVED
**Fixed By**: Frontend-A (2025-12-24)

---
