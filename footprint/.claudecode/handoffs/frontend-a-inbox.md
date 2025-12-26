# frontend-a Agent Inbox

---

## 📬 AUTH-01: User Login Page

**From**: PM Agent
**Date**: 2025-12-26
**Priority**: High
**Story Points**: 3
**Sprint**: 5 (Parallel Assignment)

### Story Description

Create the user login page with email/password authentication using Supabase Auth. This is the foundation for user accounts feature.

### Requirements

1. **Login Form**
   - Email input with validation
   - Password input with show/hide toggle
   - "Remember me" checkbox
   - Submit button with loading state
   - Form validation (required fields, email format)

2. **Social Login** (optional, can defer)
   - Google OAuth button
   - Apple OAuth button

3. **Additional Links**
   - "Forgot password?" link → `/auth/reset-password`
   - "Create account" link → `/auth/register`

4. **Supabase Integration**
   ```typescript
   import { createClient } from '@/lib/supabase/client';

   const supabase = createClient();
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
   });
   ```

5. **Success Flow**
   - Redirect to `/` or previous page (use `searchParams.redirect`)
   - Store session automatically (Supabase handles this)

6. **Error Handling**
   - Invalid credentials → "אימייל או סיסמה שגויים"
   - Network error → "שגיאת תקשורת, נסו שנית"
   - Rate limited → "יותר מדי ניסיונות, נסו מאוחר יותר"

### UI Design

- RTL layout (Hebrew)
- Centered card on desktop, full-width on mobile
- Use existing UI primitives (Input, Button, Checkbox)
- Brand gradient on submit button
- Footprint logo at top

### Files to Create

```
app/
├── login/
│   ├── page.tsx           # Login page
│   └── page.test.tsx      # Tests
├── auth/
│   ├── reset-password/
│   │   └── page.tsx       # Password reset (stub OK)
│   └── register/
│       └── page.tsx       # Registration (stub OK)
```

### Acceptance Criteria

- [ ] Login form with email/password inputs
- [ ] Form validation (required, email format)
- [ ] Supabase signInWithPassword integration
- [ ] Loading state during auth
- [ ] Error messages in Hebrew
- [ ] Redirect after successful login
- [ ] Tests cover form validation and auth flow
- [ ] 80%+ test coverage

### Test Scenarios

1. Valid login → Redirects to home
2. Invalid credentials → Shows error message
3. Empty fields → Shows validation errors
4. Network error → Shows retry message

### Reference Files

- Supabase client: `lib/supabase/client.ts`
- UI components: `components/ui/` (Button, Input, Checkbox)
- Design tokens: `tailwind.config.ts`

---

**Ready for implementation!** Ping PM when complete for QA handoff.

---

*Last checked: 2025-12-26*
