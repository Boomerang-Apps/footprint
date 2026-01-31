# QA Validation Instructions for Claude Haiku

**Project:** Footprint
**PR:** #3 - P1 Bug Fixes
**Date:** 2026-01-29

---

## Your Role

You are a QA Engineer validating P1 bug fixes before merge. Test the preview deployment and report pass/fail for each test case.

---

## Preview URL

```
https://footprint-git-fix-p1-bugs-pre-qa-boomerang-apps-c381d567.vercel.app
```

---

## What Was Fixed (P1 Bugs)

| Bug ID | Description | Fix Applied |
|--------|-------------|-------------|
| FE-001 | Silent validation failures on file upload | Added toast error messages in Hebrew |
| FE-002a | Only 6 styles (need 8+) | Added 3 new styles: pop_art, vintage, romantic (now 9 total) |
| FE-002b | Style badges not rendering | Added badge rendering for "popular" and "new" |
| SEC-HIGH-01 | No rate limiting | Added Upstash rate limiting to all API endpoints |
| SEC-HIGH-02 | Admin routes unprotected | Verified admin auth + added rate limiting |

---

## Test Cases to Validate

### TEST 1: File Upload Validation Errors (FE-001)

**URL:** `{preview}/create`

**Test 1.1: Invalid File Type**
- Action: Try to upload a non-image file (e.g., .txt, .pdf)
- Expected: Hebrew error toast appears: "סוג קובץ לא נתמך"
- Pass Criteria: Toast is visible, user-friendly message

**Test 1.2: Oversized File (>20MB)**
- Action: Try to upload an image larger than 20MB
- Expected: Hebrew error toast appears: "הקובץ גדול מדי"
- Pass Criteria: Toast is visible before upload starts

**Test 1.3: Valid File Upload**
- Action: Upload a valid JPG/PNG under 20MB
- Expected: Upload succeeds, preview shown
- Pass Criteria: No errors, image preview displays

---

### TEST 2: Style Selection (FE-002)

**URL:** `{preview}/create/style`

**Test 2.1: Style Count**
- Action: Count the number of style options displayed
- Expected: 9 styles visible
- Pass Criteria: At least 9 style buttons/cards

**Test 2.2: New Styles Present**
- Action: Look for these specific styles:
  - Pop Art (פופ ארט)
  - Vintage (וינטג׳)
  - Romantic (רומנטי)
- Expected: All 3 new styles visible
- Pass Criteria: Names visible in Hebrew

**Test 2.3: Style Badges**
- Action: Look for "חדש" (new) or "פופולרי" (popular) badges
- Expected: Badges visible on some style cards
- Pass Criteria: At least 1-2 badges rendered

**Test 2.4: Style Selection Works**
- Action: Click on a style (e.g., Pop Art)
- Expected: Style becomes selected (purple border/highlight)
- Pass Criteria: Visual feedback on selection

---

### TEST 3: Rate Limiting (SEC-HIGH-01)

> Note: This requires API testing. May not be fully testable from UI.

**Test 3.1: API Rate Limit Headers**
- Action: Check network tab for API responses
- Expected: Rate limit headers present (X-RateLimit-*)
- Pass Criteria: Headers visible OR graceful handling

**Test 3.2: Rate Limit Message (if triggerable)**
- Action: Rapidly click upload/transform buttons
- Expected: Eventually see "Too many requests" or similar
- Pass Criteria: 429 response handled gracefully

> If Upstash is not configured in preview, rate limiting will be skipped. Note this in report.

---

### TEST 4: General UI/UX

**Test 4.1: Hebrew RTL Layout**
- Action: Check all pages are right-to-left
- Expected: Text aligned right, navigation correct
- Pass Criteria: No layout breaks

**Test 4.2: Mobile Responsive**
- Action: Resize browser to mobile width (~375px)
- Expected: Layout adapts, no horizontal scroll
- Pass Criteria: Usable on mobile viewport

**Test 4.3: Navigation Flow**
- Action: Go through: Upload → Style → Customize
- Expected: Progress indicator updates, can navigate back
- Pass Criteria: Flow works end-to-end

---

## Pages to Test

| Page | URL Path | Purpose |
|------|----------|---------|
| Home | `/` | Landing page |
| Create/Upload | `/create` | Photo upload |
| Style Selection | `/create/style` | Choose art style |
| Customize | `/create/customize` | Size, paper, frame |
| Checkout | `/create/checkout` | Payment |

---

## How to Report Results

Use this format for your QA report:

```
# QA VALIDATION REPORT
======================
PR: #3 - P1 Bug Fixes
Preview: https://footprint-git-fix-p1-bugs-pre-qa-boomerang-apps-c381d567.vercel.app
Date: 2026-01-29
Tester: Claude Haiku

## RESULTS SUMMARY
------------------
Total Tests: X
Passed: X
Failed: X
Blocked: X

## DETAILED RESULTS
-------------------

### TEST 1: File Upload Validation (FE-001)
- [PASS/FAIL] Test 1.1: Invalid file type error
- [PASS/FAIL] Test 1.2: Oversized file error
- [PASS/FAIL] Test 1.3: Valid upload works

### TEST 2: Style Selection (FE-002)
- [PASS/FAIL] Test 2.1: 9 styles visible
- [PASS/FAIL] Test 2.2: New styles present
- [PASS/FAIL] Test 2.3: Badges rendered
- [PASS/FAIL] Test 2.4: Selection works

### TEST 3: Rate Limiting (SEC-HIGH-01)
- [PASS/FAIL/BLOCKED] Test 3.1: Rate limit headers
- [PASS/FAIL/BLOCKED] Test 3.2: Rate limit handling

### TEST 4: General UI/UX
- [PASS/FAIL] Test 4.1: Hebrew RTL layout
- [PASS/FAIL] Test 4.2: Mobile responsive
- [PASS/FAIL] Test 4.3: Navigation flow

## BUGS FOUND
-------------
(List any new bugs discovered)

## RECOMMENDATION
-----------------
[ ] APPROVE - All critical tests pass
[ ] REJECT - Blocking issues found
[ ] CONDITIONAL - Minor issues, can merge with follow-up

## NOTES
--------
(Any additional observations)
```

---

## Important Notes

1. **Focus on P1 fixes** - These are the critical items
2. **Hebrew UI** - Site is in Hebrew, RTL layout
3. **Rate limiting** - May be disabled in preview if Upstash not configured
4. **Admin routes** - Cannot test without admin credentials (skip if blocked)
5. **Be thorough but efficient** - Report actual findings, not assumptions

---

## Files for Reference (if needed)

- QA Checklist: `/Volumes/SSD-01/Projects/Footprint/footprint/.claude/QA-WAVE1-CHECKLIST.md`
- Product Types: `/Volumes/SSD-01/Projects/Footprint/footprint/types/product.ts`
- Style Page: `/Volumes/SSD-01/Projects/Footprint/footprint/app/(app)/create/style/page.tsx`
- Upload Page: `/Volumes/SSD-01/Projects/Footprint/footprint/app/(app)/create/page.tsx`

---

*Generated for WAVE QA Process*
