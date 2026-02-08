# QA Testing Instructions: AUTH-02 Guest Checkout Option

**Story ID:** AUTH-02
**Feature:** Guest Checkout Option
**Priority:** High
**Wave:** 8
**Status:** Ready for QA

---

## Executive Summary

This feature allows customers to complete purchases without creating an account. Key flows include:
1. Guest checkout with email collection
2. Post-purchase account creation offer
3. Guest order lookup by order number + email
4. Email persistence for returning guests
5. Analytics tracking for conversion analysis

---

## Test Environment Setup

### Prerequisites
- Application running on local or staging environment
- Test email addresses (use `+test` suffix for real emails or disposable test accounts)
- Browser dev tools open (for analytics verification)
- Clean browser state (clear localStorage for fresh tests)

### Test Data
- Valid test emails: `test@example.com`, `qa@footprint.test`
- Invalid emails: `invalid`, `@test.com`, `test@`, `test@@example.com`
- Test order numbers: Generate from previous test purchases

---

## Acceptance Criteria Test Cases

### AC-001: Guest Checkout Option Display

**Scenario:** Verify guest checkout button appears for unauthenticated users

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Clear cookies/localStorage | Browser state cleared |
| 2 | Navigate to checkout flow | Auth gate displayed |
| 3 | Verify guest button present | Button "המשך כאורח" (Continue as Guest) visible |
| 4 | Verify login button present | Button "התחברות" (Login) visible alongside |
| 5 | Verify button styling | Guest button: white bg, violet border; Login: violet bg |

**Pass Criteria:**
- [ ] Guest button displays in Hebrew
- [ ] Button is clickable and not disabled
- [ ] RTL layout correct (button text aligned right)

---

### AC-002: Email Collection for Guest Checkout

**Scenario:** Verify email is required for guest checkout

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "המשך כאורח" button | Email form displayed |
| 2 | Verify email input present | Input field with "אימייל" label visible |
| 3 | Verify back button present | Arrow button to return to choice screen |
| 4 | Click back button | Returns to guest/login choice |
| 5 | Click guest again, leave email empty | Submit button present |
| 6 | Click submit without email | Error "נא להזין אימייל" displayed |

**Pass Criteria:**
- [ ] Email input field clearly visible
- [ ] Label in Hebrew: "אימייל"
- [ ] Placeholder shows example email format
- [ ] Empty submission shows Hebrew error

---

### AC-003: Email Validation

**Scenario:** Verify email format validation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter "invalid" | Error shown on submit |
| 2 | Enter "@test.com" | Error "אימייל לא תקין" shown |
| 3 | Enter "test@" | Error shown |
| 4 | Enter "test@@example.com" | Error shown |
| 5 | Enter "test+qa@example.com" | Valid, proceeds to next step |
| 6 | Enter "test@subdomain.example.co.il" | Valid, proceeds to next step |

**Invalid Email Test Cases:**
```
invalid
@test.com
test@
test@@example.com
test@.com
.test@example.com
test@example..com
```

**Valid Email Test Cases:**
```
test@example.com
test+qa@example.com
user.name@domain.co.il
a@b.co
```

**Pass Criteria:**
- [ ] Invalid emails show Hebrew error: "אימייל לא תקין"
- [ ] Error clears when user starts typing
- [ ] Valid emails allow progression

---

### AC-007: Post-Purchase Account Creation Prompt

**Scenario:** Verify signup prompt appears after guest checkout completion

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Complete a guest checkout order | Order confirmation page displayed |
| 2 | Verify signup prompt visible | Prompt with "צור חשבון לעקוב אחרי ההזמנה" shown |
| 3 | Verify email pre-filled | Email from checkout displayed (non-editable) |
| 4 | Verify benefits listed | 3 benefits shown with icons |
| 5 | Verify password field | Password input with show/hide toggle |
| 6 | Verify confirm password field | Second password input present |
| 7 | Verify dismiss option | "אולי אחר כך" button visible |

**Benefits Verification:**
- [ ] "עקוב אחרי ההזמנה בזמן אמת" (Track order in real-time) - Package icon
- [ ] "שמור כתובות למשלוחים עתידיים" (Save addresses) - MapPin icon
- [ ] "קבל הנחות ומבצעים בלעדיים" (Get exclusive deals) - Tag icon

**Pass Criteria:**
- [ ] Prompt only shows for guest users (not logged-in users)
- [ ] Email displayed but not editable
- [ ] Password visibility toggle works
- [ ] All text in Hebrew with RTL layout

---

### AC-008: Guest to Account Conversion

**Scenario:** Verify guest can create account post-purchase

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On signup prompt, enter password < 8 chars | Error about minimum length |
| 2 | Enter valid password (8+ chars) | No error |
| 3 | Enter different confirm password | Error "הסיסמאות אינן תואמות" |
| 4 | Enter matching confirm password | No error |
| 5 | Submit form | Loading spinner shown |
| 6 | Wait for completion | Success message displayed |
| 7 | Verify success message | "החשבון נוצר בהצלחה!" with green styling |

**Password Validation:**
- Minimum 8 characters
- Must match confirmation
- Error messages in Hebrew

**Pass Criteria:**
- [ ] Account created in Supabase
- [ ] Order linked to new account (check user metadata)
- [ ] Verification email sent
- [ ] Success animation/state shown
- [ ] Form disabled during loading

---

### AC-009: Guest Order Lookup

**Scenario:** Verify guests can look up orders by order number + email

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to order lookup page | Lookup form displayed |
| 2 | Leave both fields empty, submit | Validation errors shown |
| 3 | Enter valid order number only | Email required error |
| 4 | Enter valid email only | Order number required error |
| 5 | Enter invalid order format | Format error shown |
| 6 | Enter non-existent order + valid email | "הזמנה לא נמצאה" message |
| 7 | Enter valid order + wrong email | "הזמנה לא נמצאה" message |
| 8 | Enter valid order + correct email | Order details displayed |

**Order Number Validation:**
- Must be non-empty
- Format check (if applicable)

**Success Display Verification:**
- [ ] Order status badge (color-coded)
- [ ] Order date formatted correctly
- [ ] Order total displayed
- [ ] Item details shown
- [ ] Shipping address displayed

**Pass Criteria:**
- [ ] Both fields required
- [ ] Matching order+email shows details
- [ ] Non-matching shows generic error (security)
- [ ] Loading state during API call

---

### AC-010: Remember Guest Email

**Scenario:** Verify email persists for returning guests

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Clear localStorage completely | Storage empty |
| 2 | Navigate to guest checkout | Email field empty |
| 3 | Enter email and submit | Email saved |
| 4 | Refresh page | Email still in form |
| 5 | Navigate away and back | Email pre-filled |
| 6 | Check localStorage | `footprint-guest-email` key present |

**localStorage Key:** `footprint-guest-email`

**Pass Criteria:**
- [ ] Email saved to localStorage on submission
- [ ] Email pre-filled on form mount
- [ ] Works across page navigations
- [ ] Persists after browser close/reopen

---

### AC-011: Analytics Tracking

**Scenario:** Verify analytics events fire correctly

Open browser DevTools Console and filter for `[Analytics]` or check Network tab for gtag calls.

| Event | Trigger | Expected Data |
|-------|---------|---------------|
| `guest_checkout_started` | Click "המשך כאורח" | `{ source: 'checkout_form' }` |
| `guest_email_submitted` | Submit email form | `{ email: 'user@example.com' }` |
| `guest_checkout_completed` | Order complete | `{ orderId, orderTotal, email }` |
| `signup_prompt_shown` | Confirmation page load | `{ orderId, email }` |
| `signup_prompt_dismissed` | Click "אולי אחר כך" | `{ orderId, email }` |
| `guest_conversion` | Account created | `{ conversionType, email, userId }` |

**Verification Method:**
```javascript
// In console, add listener before testing:
window.addEventListener('analytics:guest_checkout', e => console.log('Event:', e.detail));
window.addEventListener('analytics:guest_email', e => console.log('Event:', e.detail));
window.addEventListener('analytics:guest_purchase', e => console.log('Event:', e.detail));
window.addEventListener('analytics:signup_prompt', e => console.log('Event:', e.detail));
window.addEventListener('analytics:signup_dismissed', e => console.log('Event:', e.detail));
window.addEventListener('analytics:guest_conversion', e => console.log('Event:', e.detail));
```

**Pass Criteria:**
- [ ] All events fire at correct times
- [ ] Event data contains required properties
- [ ] gtag called when available
- [ ] No errors in console

---

### AC-012: RTL and Hebrew Support

**Scenario:** Verify complete Hebrew/RTL support

| Component | Check | Expected |
|-----------|-------|----------|
| GuestCheckoutForm | Text direction | RTL (`dir="rtl"`) |
| GuestCheckoutForm | Button text | Hebrew only |
| GuestCheckoutForm | Error messages | Hebrew |
| PostPurchaseSignup | All labels | Hebrew |
| PostPurchaseSignup | Benefits list | Hebrew with correct icons |
| GuestOrderLookup | Form labels | Hebrew |
| GuestOrderLookup | Error states | Hebrew |
| Email input | Direction | LTR (`dir="ltr"` on input) |

**Visual Checks:**
- [ ] Text aligned to right
- [ ] Icons on correct side
- [ ] Form flows right-to-left
- [ ] Email input is LTR (for Latin characters)
- [ ] No English text visible (except email addresses)

---

## Edge Cases & Error Handling

### Network Failures
| Scenario | Expected Behavior |
|----------|-------------------|
| API timeout on order lookup | Error message shown, retry possible |
| Supabase signup fails | Hebrew error message, form re-enabled |
| Network error during form submit | Generic error, user can retry |

### Concurrent Sessions
| Scenario | Expected Behavior |
|----------|-------------------|
| Guest logs in during checkout | Guest state cleared, user session used |
| Multiple tabs with guest checkout | Each tab maintains own state |

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Security Verification

### Order Lookup Security
- [ ] Cannot enumerate orders (generic error for all failures)
- [ ] Rate limiting in place (if implemented)
- [ ] No sensitive data in error messages

### Email Handling
- [ ] Email validated server-side (not just client)
- [ ] No email injection possible

### Session Security
- [ ] Guest sessions expire appropriately
- [ ] Post-signup session properly upgraded

---

## Performance Checks

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Form render | < 100ms | DevTools Performance |
| Email validation | < 50ms | User perception |
| Order lookup API | < 2s | Network tab |
| Signup submission | < 3s | Network tab |

---

## Regression Testing

Verify these existing features still work:

- [ ] Normal user login flow
- [ ] Social login (Google, Apple) if enabled
- [ ] Authenticated checkout flow
- [ ] Order history for logged-in users
- [ ] Password reset flow

---

## Bug Report Template

```markdown
**Bug ID:** AUTH-02-QA-XXX
**Severity:** Critical / High / Medium / Low
**AC Reference:** AC-XXX

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**


**Actual Result:**


**Environment:**
- Browser:
- Device:
- Screen Size:

**Screenshots/Video:**

**Console Errors:**

```

---

## QA Sign-Off Checklist

| Category | Status | Tester | Date |
|----------|--------|--------|------|
| AC-001: Guest option display | [ ] Pass / [ ] Fail | | |
| AC-002: Email collection | [ ] Pass / [ ] Fail | | |
| AC-003: Email validation | [ ] Pass / [ ] Fail | | |
| AC-007: Signup prompt | [ ] Pass / [ ] Fail | | |
| AC-008: Account conversion | [ ] Pass / [ ] Fail | | |
| AC-009: Order lookup | [ ] Pass / [ ] Fail | | |
| AC-010: Email persistence | [ ] Pass / [ ] Fail | | |
| AC-011: Analytics | [ ] Pass / [ ] Fail | | |
| AC-012: RTL/Hebrew | [ ] Pass / [ ] Fail | | |
| Edge cases | [ ] Pass / [ ] Fail | | |
| Security | [ ] Pass / [ ] Fail | | |
| Performance | [ ] Pass / [ ] Fail | | |
| Regression | [ ] Pass / [ ] Fail | | |

---

## Final QA Verdict

**Overall Status:** [ ] APPROVED / [ ] REJECTED

**Notes:**


**Tester:** _________________
**Date:** _________________

---

*Document Version: 1.0*
*Last Updated: 2026-02-03*
*Story Reference: AUTH-02-guest-checkout-option*
