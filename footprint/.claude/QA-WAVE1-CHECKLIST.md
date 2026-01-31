# QA VALIDATION CHECKLIST - WAVE 1

**Project:** Footprint
**Wave:** 1
**Date:** 2026-01-29
**Status:** PENDING QA

---

## 1. FUNCTIONAL TESTING

### WAVE1-FE-001: Photo Upload Flow
| ID | Test Case | Expected Result | Pass/Fail |
|----|-----------|-----------------|-----------|
| UP-01 | Upload from gallery | File picker opens, image uploads | [ ] |
| UP-02 | Camera capture | Camera opens on mobile, captures photo | [ ] |
| UP-03 | Image preview | Preview shown after selection | [ ] |
| UP-04 | File size > 20MB | Error message shown (currently silent!) | [ ] |
| UP-05 | Invalid file type | Error message shown (currently silent!) | [ ] |
| UP-06 | Drag and drop | Visual feedback, file uploads | [ ] |
| UP-07 | Upload progress | Progress bar updates | [ ] |
| UP-08 | R2 storage | Image persisted, URL returned | [ ] |
| UP-09 | Replace image | Can replace uploaded image | [ ] |
| UP-10 | Remove image | Can remove and start over | [ ] |

**Known Issues:**
- [ ] BUG: Silent validation failures (no user feedback for invalid files)

### WAVE1-FE-002: Style Selection
| ID | Test Case | Expected Result | Pass/Fail |
|----|-----------|-----------------|-----------|
| ST-01 | Display 8+ styles | At least 8 style options shown | [ ] |
| ST-02 | Hebrew labels | All styles have Hebrew names | [ ] |
| ST-03 | Selection highlight | Purple border on selected style | [ ] |
| ST-04 | AI preview generation | Transformed image shown | [ ] |
| ST-05 | Loading spinner | Spinner during AI processing | [ ] |
| ST-06 | Popular/New badges | Badges visible on styles | [ ] |
| ST-07 | Error handling | Error message + retry button | [ ] |
| ST-08 | Multiple transformations | Can try different styles | [ ] |

**Known Issues:**
- [ ] BUG: Only 6 styles (watercolor, line art, line+water, oil, avatar, original) - need 8+
- [ ] BUG: Badges defined but not rendered in UI

### WAVE1-FE-003: Product Customization
| ID | Test Case | Expected Result | Pass/Fail |
|----|-----------|-----------------|-----------|
| PC-01 | Size selection | A5/A4/A3/A2 with prices | [ ] |
| PC-02 | A4 popular badge | "Most popular" shown on A4 | [ ] |
| PC-03 | Paper type selection | Matte/Glossy/Canvas options | [ ] |
| PC-04 | Frame options | None/Black/White/Oak | [ ] |
| PC-05 | Live price calculator | Price updates on selection | [ ] |
| PC-06 | ILS currency | Prices in ₪ format | [ ] |
| PC-07 | Continue button | Enabled when valid selection | [ ] |
| PC-08 | Mobile responsive | Layout works on mobile | [ ] |

---

## 2. SECURITY TESTING

### Critical Security Checks
| ID | Test Case | Expected Result | Pass/Fail |
|----|-----------|-----------------|-----------|
| SEC-01 | API keys not in client | No secrets in browser console/source | [ ] |
| SEC-02 | File upload validation | Server rejects invalid files | [ ] |
| SEC-03 | Auth on protected routes | 401 without token | [ ] |
| SEC-04 | Rate limiting | Too many requests = 429 | [ ] |
| SEC-05 | CSRF protection | Invalid CSRF = rejected | [ ] |
| SEC-06 | SQL injection | Parameterized queries only | [ ] |
| SEC-07 | XSS prevention | User input sanitized | [ ] |
| SEC-08 | Admin route protection | Non-admin cannot access | [ ] |

### Webhook Security
| ID | Test Case | Expected Result | Pass/Fail |
|----|-----------|-----------------|-----------|
| WH-01 | Stripe signature | Invalid signature = 400 | [ ] |
| WH-02 | PayPlus HMAC | Invalid HMAC = 400 | [ ] |

---

## 3. TEST COVERAGE VALIDATION

### Required Tests Before Launch
| Area | Current | Required | Status |
|------|---------|----------|--------|
| Create page | ✅ | 80% | PASS |
| Style page | ✅ | 80% | PASS |
| Customize page | ✅ | 80% | PASS |
| Checkout page | ✅ | 80% | PASS |
| Complete page | ✅ | 80% | PASS |
| Tweak page | ❌ 0% | 80% | **FAIL** |
| Login page | ❌ 0% | 80% | **FAIL** |
| Home page | ❌ 0% | 80% | **FAIL** |

### Run Test Suite
```bash
# Run all tests
npm run test:run

# Generate coverage report
npm run test:coverage

# Required: All tests must pass
# Required: Coverage >= 80% for core flows
```

---

## 4. BROWSER/DEVICE TESTING

### Desktop Browsers
| Browser | Version | Pass/Fail |
|---------|---------|-----------|
| Chrome | Latest | [ ] |
| Firefox | Latest | [ ] |
| Safari | Latest | [ ] |
| Edge | Latest | [ ] |

### Mobile Devices
| Device | OS | Pass/Fail |
|--------|-----|-----------|
| iPhone 14 | iOS 17 | [ ] |
| iPhone SE | iOS 16 | [ ] |
| Samsung S23 | Android 14 | [ ] |
| Pixel 7 | Android 13 | [ ] |

### Mobile-Specific Tests
| ID | Test Case | Pass/Fail |
|----|-----------|-----------|
| MOB-01 | Camera access permission | [ ] |
| MOB-02 | Gallery access permission | [ ] |
| MOB-03 | Touch interactions | [ ] |
| MOB-04 | Responsive layout | [ ] |
| MOB-05 | RTL Hebrew layout | [ ] |

---

## 5. PERFORMANCE TESTING

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| First Contentful Paint | < 1.5s | | [ ] |
| Largest Contentful Paint | < 2.5s | | [ ] |
| Time to Interactive | < 3.0s | | [ ] |
| Image upload time | < 5s | | [ ] |
| AI transform time | < 30s | | [ ] |

---

## 6. ACCESSIBILITY TESTING

| ID | Test Case | Pass/Fail |
|----|-----------|-----------|
| A11Y-01 | Keyboard navigation | [ ] |
| A11Y-02 | Screen reader compatible | [ ] |
| A11Y-03 | Color contrast (WCAG AA) | [ ] |
| A11Y-04 | Focus indicators | [ ] |
| A11Y-05 | Alt text on images | [ ] |
| A11Y-06 | Hebrew RTL support | [ ] |

---

## 7. INTEGRATION TESTING

| ID | Integration | Test Case | Pass/Fail |
|----|-------------|-----------|-----------|
| INT-01 | Supabase | User data persists | [ ] |
| INT-02 | R2 Storage | Images upload/retrieve | [ ] |
| INT-03 | AI API | Transformations work | [ ] |
| INT-04 | Stripe | Payment flow completes | [ ] |
| INT-05 | PayPlus | Alternative payment works | [ ] |
| INT-06 | Email | Confirmation emails sent | [ ] |

---

## QA SIGN-OFF

### Blockers Found
- [ ] List any blocking issues here

### Passed With Notes
- [ ] List any passed items with caveats

### QA Approval
- [ ] All critical tests pass
- [ ] Security audit complete
- [ ] Test coverage >= 80%
- [ ] No P0/P1 bugs open

**QA Engineer:** ________________________
**Date:** ________________________
**Signature:** ________________________

---

## BUGS TO FIX BEFORE LAUNCH

### P0 - Critical (Must Fix)
1. **SEC-CRIT-01**: Exposed API keys in .env - REVOKE IMMEDIATELY
2. **SEC-CRIT-02**: Rate limiting not implemented

### P1 - High (Should Fix)
1. **FE-001-BUG**: Silent validation failures on file upload
2. **FE-002-BUG**: Only 6 styles instead of 8+
3. **FE-002-BUG**: Style badges not rendered
4. **SEC-HIGH-01**: CSRF protection missing
5. **SEC-HIGH-02**: Admin route unprotected

### P2 - Medium (Nice to Fix)
1. **FE-003-IMP**: Frame preview size too small
2. **TEST-001**: Missing tests for tweak/login/home pages
3. **TEST-002**: Regenerate coverage report

---

*Generated by WAVE Pre-Launch Analysis*
*Version: 1.0.0*
