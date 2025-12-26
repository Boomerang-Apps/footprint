# AUTH-01: User Login Page

**Started**: 2025-12-26
**Agent**: Frontend-A
**Branch**: feature/auth-01-login-page
**Gate**: 1 - Planning → 2 - Build

---

## Story Summary
Implement the user login page with email/password authentication and social login options (Google, Apple). The page must support Hebrew RTL layout and follow the Footprint design system.

---

## Scope

### In Scope
- Email/password login form with validation
- Social login buttons (Google, Apple)
- Hebrew RTL layout support
- "Forgot password" link
- "Create account" link to registration
- Loading and error states
- Responsive design (mobile-first)

### Out of Scope
- Registration page (will be in AUTH-02)
- Password reset flow (will be in AUTH-03)
- Auth API integration (Backend-1 owns)
- Session management (Backend-1 owns)

---

## Acceptance Criteria
- [ ] Email input with validation (required, email format)
- [ ] Password input with show/hide toggle
- [ ] Login button with loading state
- [ ] Google social login button
- [ ] Apple social login button
- [ ] Error message display
- [ ] RTL layout for Hebrew
- [ ] Tests written (TDD)
- [ ] 80%+ coverage
- [ ] TypeScript clean
- [ ] Linter clean

---

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| app/(auth)/login/page.tsx | Create | Login page component |
| components/auth/LoginForm.tsx | Create | Login form component |
| components/auth/SocialLoginButtons.tsx | Create | Social login buttons |
| components/auth/LoginForm.test.tsx | Create | TDD tests |
| components/auth/SocialLoginButtons.test.tsx | Create | TDD tests |

---

## Dependencies

### Blocked By
- None (UI primitives available from UI-07)

### Blocks
- AUTH-02: User Registration Page (can use shared components)
- AUTH-03: Password Reset Flow

---

## Safety Gate Progress
- [ ] Gate 0: Research (not required - UI only)
- [x] Gate 1: Planning (this document)
- [ ] Gate 2: Implementation (TDD)
- [ ] Gate 3: QA Validation
- [ ] Gate 4: Review
- [ ] Gate 5: Deployment

---

*Started by Frontend-A Agent - 2025-12-26*
