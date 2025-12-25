# Footprint Sprint Backlog

**Total Story Points**: 89
**Sprint Duration**: 2 weeks each
**MVP Timeline**: 8 weeks (4 sprints)
**Last Updated**: 2025-12-25 by PM Agent

---

## Sprint 1: Foundation (Weeks 1-2) ✅ COMPLETED

**Focus**: Project setup, photo upload, basic UI
**Story Points**: 16/16 ✅
**Status**: COMPLETED - All stories merged to main

| ID | Story | Acceptance Criteria | SP | Priority | Agent | Status |
|----|-------|--------------------|----|----------|-------|--------|
| UP-01 | Upload photo from camera roll | Camera roll opens, JPG/PNG/HEIC support, preview shown | 5 | Must | Frontend-B | ✅ Done |
| UP-02 | Drag-and-drop upload on desktop | Drop zone visible, multi-file support, progress shown | 3 | Must | Frontend-B | ✅ Done |
| UP-03 | Auto-optimize photo for print | Resize to print DPI, color profile conversion, 20MB max | 5 | Must | Backend-2 | ✅ Done |
| UP-04 | Preview uploaded photo | Full preview, zoom, replace option | 3 | Must | Frontend-B | ✅ Done |

### Sprint 1 Definition of Done
- [x] All 4 stories completed ✅
- [x] 80%+ test coverage ✅ (163 tests, 82%+ coverage)
- [x] TypeScript clean ✅
- [x] Linter clean ✅
- [x] QA approved ✅

---

## Sprint 2: AI & Customization (Weeks 3-4) ✅ COMPLETE

**Focus**: AI integration, style previews, product configuration
**Story Points**: 27/27 (100% Complete)
**Status**: ✅ COMPLETE - All 8 stories merged to main

| ID | Story | Acceptance Criteria | SP | Priority | Agent | Status |
|----|-------|--------------------|----|----------|-------|--------|
| AI-01 | Display AI style gallery | Gallery visible, thumbnails, style names | 3 | Must | Frontend-B | ✅ Done |
| AI-02 | Preview photo in different styles | Click to preview, loading indicator, < 10 seconds | 8 | Must | Backend-2 + Frontend-B | ✅ Done |
| AI-03 | Keep original photo option | 'Original' in gallery, enhancement toggle | 2 | Must | Frontend-B | ✅ Done |
| AI-04 | Unlimited free style previews | No paywall, watermark on preview, full quality on purchase | 3 | Must | Frontend-B | ✅ Done |
| PC-01 | Select print size | A5/A4/A3 options, size visualization, live price update | 3 | Must | Frontend-B | ✅ Done |
| PC-02 | Choose paper type | Matte/Glossy options, tooltips, price difference | 2 | Must | Frontend-B | ✅ Done |
| PC-03 | Add frame option | None/Black/White, frame preview, price update | 3 | Must | Frontend-B | ✅ Done |
| PC-04 | Real-time price calculation | Live calculation, breakdown visible, shipping estimate | 3 | Must | Backend-1 + Frontend-B | ✅ Done |

### Sprint 2 Definition of Done
- [x] All 8 stories completed ✅
- [x] AI transformation < 10 seconds ✅
- [x] Price calculation accurate ✅
- [x] 80%+ test coverage ✅
- [x] QA approved ✅

### Sprint 2 Dependencies
- **Gate 0 Required**: Replicate AI integration (AI-02) ✅ APPROVED
- UP-01 to UP-04 must be complete before AI-02 ✅ DONE

---

## Sprint 3: Checkout & Gifting (Weeks 5-6) ✅ COMPLETED

**Focus**: Payment integration, gift flow, order confirmation
**Story Points**: 18/18 (100% Complete)
**Status**: COMPLETED - Finished 2025-12-23

| ID | Story | Acceptance Criteria | SP | Priority | Agent | Status |
|----|-------|--------------------|----|----------|-------|--------|
| GF-01 | Mark order as gift | Gift toggle prominent, gift wrap option, no price on slip | 2 | Must | Frontend-B | ✅ Done |
| GF-02 | Add personal message | 150 char limit, preview shown, printed on card | 3 | Must | Frontend-B | ✅ Done |
| GF-03 | Ship to recipient | Separate address form, recipient name, delivery estimate | 3 | Must | Frontend-B + Backend-1 | ✅ Done |
| CO-01 | Enter shipping address | Autocomplete, save for future, validation | 3 | Must | Frontend-B | ✅ Done |
| CO-02 | Pay with credit card (PayPlus) | PayPlus integration, Bit support, Israeli cards | 5 | Must | Backend-2 | ✅ Done |
| CO-04 | Order confirmation | Email sent, order number shown, WhatsApp option | 2 | Must | Backend-2 | ✅ Done |

### Sprint 3 Dependencies
- **Gate 0 Required**: Stripe/PayPlus integration (CO-02) ✅ APPROVED
- AI and product config must be complete ✅ DONE

### Sprint 3 Definition of Done
- [x] All 6 stories completed ✅
- [x] Payment flow secure (PayPlus HMAC-SHA256) ✅
- [x] Gift flow tested ✅
- [x] 80%+ test coverage ✅
- [x] QA approved ✅

---

## Sprint 4: Admin & Polish (Weeks 7-8) 🟡 NEXT

**Focus**: Admin dashboard, additional features, launch prep
**Story Points**: 0/19 (Ready to Start)

| ID | Story | Acceptance Criteria | SP | Priority | Agent |
|----|-------|--------------------|----|----------|-------|
| OM-01 | Admin order dashboard | Order list, filter by status, search by # | 3 | Must | Frontend-B |
| OM-02 | Update order status | Status dropdown, timestamp logged, customer notified | 2 | Must | Backend-2 |
| OM-03 | Download print-ready files | High-res download, correct dimensions, color profile | 2 | Must | Backend-2 |
| OM-04 | Add tracking numbers | Tracking input, carrier selection, auto-notify | 2 | Must | Backend-2 |
| AI-05 | Fast AI transformation | Target < 10 seconds, progress shown, retry on failure | 5 | Should | Backend-2 |
| CO-03 | Apple Pay / Google Pay | Wallet detection, one-tap payment, same confirmation | 3 | Should | Backend-2 |
| CO-05 | Apply discount codes | Code input, validation feedback, discount shown | 2 | Should | Backend-1 |

### Sprint 4 Definition of Done
- [ ] All 7 stories completed
- [ ] Admin dashboard functional
- [ ] Performance targets met
- [ ] Full regression test
- [ ] Launch ready

---

## Backlog (Post-MVP)

| ID | Story | SP | Priority |
|----|-------|----|----------|
| UP-05 | Face detection for optimal cropping | 2 | Could |
| PC-05 | 3D mockup of framed print | 2 | Could |
| GF-04 | Gift wrapping add-on | 2 | Should |
| GF-05 | Scheduled delivery date | 3 | Could |

---

## Story Point Summary

| Epic | Stories | Points | % of Total |
|------|---------|--------|------------|
| Photo Upload | 5 | 18 | 20% |
| AI Transformation | 5 | 21 | 24% |
| Product Config | 5 | 13 | 15% |
| Gift Experience | 5 | 13 | 15% |
| Checkout | 5 | 15 | 17% |
| Admin | 4 | 9 | 10% |
| **Total** | **29** | **89** | **100%** |

---

## Agent Assignment Summary

| Agent | Stories | Total SP |
|-------|---------|----------|
| Frontend-B | UP-01, UP-02, UP-04, AI-01, AI-03, AI-04, PC-01, PC-02, PC-03, GF-01, GF-02, CO-01, OM-01 | 35 |
| Backend-2 | UP-03, AI-02, CO-02, CO-04, OM-02, OM-03, OM-04, AI-05, CO-03 | 32 |
| Backend-1 | PC-04, GF-03, CO-05 | 8 |
| Shared | AI-02 (B2+FB), PC-04 (B1+FB), GF-03 (FB+B1) | - |

---

*Sprint Backlog created by CTO Agent - 2025-12-19*
