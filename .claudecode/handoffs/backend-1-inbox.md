# Backend-1 Agent Inbox

Work assignments for database, auth, and state management appear here.

---

## Domain Reminder
Your domain: Order store, user auth, state management, data persistence

NOT your domain: External APIs (Backend-2), UI components (Frontend-A/B)

---

## How to Use This Inbox

### For PM Agent:
Assign work related to:
- Order store (`stores/orderStore.ts`)
- User authentication
- Session management
- Data persistence

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

## 2025-12-26 - PM: AUTH-02 Backend - Guest Session State

**Story**: AUTH-02 (Backend portion)
**Priority**: P1
**Type**: Parallel Assignment (4 agents)
**Sprint**: 6
**Points**: 2 (shared with Frontend-A)

### Context

AUTH-02 is being split between Frontend-A (UI) and Backend-1 (state). You handle the orderStore integration for guest checkout sessions.

**Pairing**: Frontend-A is building GuestCheckoutForm component. Coordinate on interface.

### Assignment

Implement guest checkout state management in orderStore.

### Requirements

1. **Guest State in orderStore**
   ```typescript
   interface GuestInfo {
     email: string;
     firstName: string;
     lastName: string;
     phone?: string;
     marketingConsent: boolean;
   }

   interface OrderState {
     // ... existing fields ...

     // Guest checkout
     isGuest: boolean;
     guestInfo: GuestInfo | null;
   }

   interface OrderActions {
     // ... existing actions ...

     setIsGuest: (value: boolean) => void;
     setGuestInfo: (info: GuestInfo) => void;
     clearGuestInfo: () => void;
   }
   ```

2. **Validation Functions**
   ```typescript
   // lib/auth/guest.ts
   export function isValidGuestEmail(email: string): boolean;
   export function isValidGuestInfo(info: GuestInfo): { valid: boolean; errors: string[] };
   ```

3. **Persistence**
   - Guest info should persist in localStorage (like other order data)
   - Clear on order completion

### Files to Create/Modify

| File | Action |
|------|--------|
| `stores/orderStore.ts` | Modify (add guest state) |
| `stores/orderStore.test.ts` | Modify (add guest tests) |
| `lib/auth/guest.ts` | Create |
| `lib/auth/guest.test.ts` | Create |

### Acceptance Criteria

- [ ] isGuest toggle in orderStore
- [ ] guestInfo stored correctly
- [ ] setGuestInfo validates before storing
- [ ] clearGuestInfo resets state
- [ ] Guest info persists to localStorage
- [ ] Email validation works
- [ ] Tests cover all scenarios
- [ ] Coverage: 80%+ minimum
- [ ] TypeScript clean

### Gate 1 Checklist (MANDATORY)

- [ ] Create branch: `git checkout -b feature/AUTH-02-guest-state`
- [ ] Create START.md: `.claudecode/milestones/sprint-6/AUTH-02/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag AUTH-02-backend-start`

### On Completion

Write handoff to: `.claudecode/handoffs/qa-inbox.md`

**Coordinate with Frontend-A** on GuestCheckoutForm integration.

---
