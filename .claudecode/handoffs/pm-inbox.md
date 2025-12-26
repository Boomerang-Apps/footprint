# PM Agent Inbox

All messages for PM orchestration appear here. PM reviews completed work, routes tasks, and manages handoffs.

---

## How to Use This Inbox

### For CTO Agent:
- Architecture decisions ready for implementation
- Gate 0 approvals

### For Dev Agents:
- Work completion notifications
- Blocker reports
- Questions requiring PM decision

### For QA Agent:
- Approval/block notifications
- Test results

### Message Format:
```markdown
## [DATE] - [Agent]: [Subject]

**Story**: STORY-ID
**Priority**: P0/P1/P2

[Message content]

---
```

---

## Pending Messages

<<<<<<< HEAD
## 2025-12-26 - Frontend-B: INT-05 Ready for QA
=======
## 2025-12-26 - Frontend-B: PC-05 Ready for QA

**Story**: PC-05 - Realistic Mockup Preview
**Branch**: feature/pc-05-realistic-mockup-preview
**Sprint**: 5
**Priority**: P1

### Summary
Implemented realistic room environment mockup preview for the customize page:
- Room preview showing art on a wall with furniture context
- Size-based scaling (A5 smallest → A2 largest)
- Frame styling support (black, white, oak, none)
- Toggle between room view and simple view
- Furniture elements: sofa with pillows, side table with lamp, plant
- Responsive design with consistent aspect ratio

### Key Deliverables
- `components/mockup/RoomPreview.tsx` - New component
- `components/mockup/RoomPreview.test.tsx` - 26 TDD tests
- `app/(app)/create/customize/page.tsx` - Integrated RoomPreview

### Test Results
- **Tests**: 26 new tests passing (RoomPreview component)
- **Total**: 1036 tests passing (all project tests)
- **TypeScript**: Clean (my files)
- **Lint**: Clean (my files)

Note: Pre-existing TypeScript errors in `src/app/cockpit/page.tsx` (not my changes)

### Files Changed
| File | Action |
|------|--------|
| `footprint/components/mockup/RoomPreview.tsx` | Created - room preview component |
| `footprint/components/mockup/RoomPreview.test.tsx` | Created - 26 TDD tests |
| `footprint/app/(app)/create/customize/page.tsx` | Modified - integrated RoomPreview |
| `.claudecode/milestones/sprint-5/PC-05/START.md` | Created |
| `.claudecode/milestones/sprint-5/PC-05/ROLLBACK-PLAN.md` | Created |

### Component API
```typescript
interface RoomPreviewProps {
  imageUrl: string;      // Art image URL
  size: SizeType;        // A5 | A4 | A3 | A2
  frameType: FrameType;  // none | black | white | oak
}
```

### Features
1. **Room View**: Wall background with sofa, side table, lamp, and plant
2. **Simple View**: Clean background, art centered
3. **Size Scaling**: Art scales proportionally based on print size
4. **Frame Display**: Frame color/style applied around art
5. **Toggle Button**: Switch between room and simple views

### Gate Status
- [x] Gate 0: Research (N/A - UI implementation)
- [x] Gate 1: Planning (START.md, ROLLBACK-PLAN.md, tag PC-05-start)
- [x] Gate 2: Implementation (TDD - 26 tests)
- [x] Gate 3: Code Quality (TypeScript clean, Lint clean)
- [ ] Gate 4: Review (PM/QA validation)
- [ ] Gate 5: Deployment

**Commit**: `908e16ff`

**Ready for Gate 4 PM/QA validation.**

---

## 2025-12-26 - Frontend-B: INT-03 Ready for QA

**Story**: INT-03 - Connect Checkout to Payment APIs
**Branch**: feature/int-03-checkout-payment-integration
**Sprint**: 5
**Priority**: P1

### Summary
Integrated the checkout page with PayPlus payment API:
- Calls `/api/checkout` to create PayPlus payment link
- Redirects user to PayPlus hosted payment page
- Handles payment failure return (`?error=payment_failed`)
- Saves shipping address to orderStore before payment
- Calculates total amount in agorot (ILS cents)
- Shows loading state during payment processing
- Disables submit button while processing

### Key Deliverables
- `app/(app)/create/checkout/page.tsx` - Modified to call PayPlus API
- `app/(app)/create/checkout/page.test.tsx` - Created with 20 TDD tests
- `.claudecode/milestones/sprint-5/INT-03/*` - Planning docs

### Test Results
- **Tests**: 20 passing (new test file)
- **TypeScript**: Clean (my files)
- **Lint**: Clean (my files)

Note: Pre-existing TypeScript errors in `src/app/cockpit/page.tsx` (not my changes)

### Files Changed
| File | Action |
|------|--------|
| `footprint/app/(app)/create/checkout/page.tsx` | Modified - PayPlus integration |
| `footprint/app/(app)/create/checkout/page.test.tsx` | Created - 20 TDD tests |
| `.claudecode/milestones/sprint-5/INT-03/START.md` | Created |
| `.claudecode/milestones/sprint-5/INT-03/ROLLBACK-PLAN.md` | Created |

### Payment Flow
```
User fills form → Click "לתשלום"
→ POST /api/checkout (orderId, amount, customer info)
→ Receives paymentUrl
→ Redirect to PayPlus
→ Success: Returns to /create/complete?page_request_uid={uid}
→ Failure: Returns to /create/checkout?error=payment_failed
```

### Notes
- Stripe wallet integration API exists (`/api/checkout/wallet/create-intent`) for future enhancement
- Currently implements PayPlus for Israeli credit cards
- Wallet payments (Apple Pay/Google Pay) can be added as follow-up

### Gate Status
- [x] Gate 0: Research (N/A - uses existing APIs)
- [x] Gate 1: Planning (START.md, ROLLBACK-PLAN.md, tag INT-03-start)
- [x] Gate 2: Implementation (TDD - 20 tests)
- [x] Gate 3: Code Quality (TypeScript clean, Lint clean)
- [ ] Gate 4: Review (PM/QA validation)
- [ ] Gate 5: Deployment

**Commit**: `5a951614`

**Ready for Gate 4 PM/QA validation.**

---

## 2025-12-26 - Frontend-B: INT-02 Ready for QA

**Story**: INT-02 - Connect Style Selection to AI Transform
**Branch**: feature/int-02-style-transform-integration
**Sprint**: 5
**Priority**: P1

### Summary
Integrated the style selection page with the AI transform API:
- Calls `/api/transform` when a style is selected
- Stores transformed image URL in orderStore.transformedImage
- Displays transformed image in preview (instead of original)
- Error overlay with retry button on transform failure
- Disables "Continue" button during transform
- Handles network errors gracefully

### Key Deliverables
- `app/(app)/create/style/page.tsx` - Modified to call transform API
- `app/(app)/create/style/page.test.tsx` - Added 11 new integration tests (39 total)
- `.claudecode/milestones/sprint-5/INT-02/*` - Planning docs

### Test Results
- **Tests**: 39 passing (28 UI + 11 integration)
- **TypeScript**: Clean (my files)
- **Lint**: Clean (my files)

Note: Pre-existing TypeScript errors in `src/app/cockpit/page.tsx` (not my changes)

### Files Changed
| File | Action |
|------|--------|
| `footprint/app/(app)/create/style/page.tsx` | Modified - AI transform integration |
| `footprint/app/(app)/create/style/page.test.tsx` | Modified - added 11 integration tests |
| `.claudecode/milestones/sprint-5/INT-02/START.md` | Created |
| `.claudecode/milestones/sprint-5/INT-02/ROLLBACK-PLAN.md` | Created |

### API Integration
```typescript
// On style select, calls:
POST /api/transform
Content-Type: application/json
Body: { imageUrl: originalImage, style: selectedStyleId }

// On success, stores:
orderStore.setTransformedImage(response.transformedUrl)
```

### UI States
1. **Default**: Style grid with preview showing original/transformed image
2. **Processing**: AI overlay with spinner while transform runs
3. **Error**: Error overlay with retry button
4. **Success**: Preview updates to show transformed image

### Gate Status
- [x] Gate 0: Research (N/A - uses existing API)
- [x] Gate 1: Planning (START.md, ROLLBACK-PLAN.md, tag INT-02-start)
- [x] Gate 2: Implementation (TDD - 39 tests)
- [x] Gate 3: Code Quality (TypeScript clean, Lint clean)
- [ ] Gate 4: Review (PM/QA validation)
- [ ] Gate 5: Deployment

**Commit**: `04e6e3ed`

**Ready for Gate 4 PM/QA validation.**

---

## 2025-12-26 - Frontend-B: INT-01 Ready for QA

**Story**: INT-01 - Connect Upload to R2 Storage
**Branch**: feature/int-01-upload-r2-integration
**Sprint**: 5
**Priority**: P1

### Summary
Integrated the upload page with the R2 storage API:
- Upload progress indicator during file upload (spinner + percentage)
- Error state with retry button on upload failure
- Calls `/api/upload` with direct mode when file is selected
- Stores R2 public URL in orderStore on successful upload
- Disables "Continue" button during upload
- Client-side file validation (type: JPEG/PNG/HEIC, size: max 20MB)

### Key Deliverables
- `app/(app)/create/page.tsx` - Modified to call upload API
- `app/(app)/create/page.test.tsx` - Added 11 new integration tests (35 total)
- `.claudecode/milestones/sprint-5/INT-01/*` - Planning docs

### Test Results
- **Tests**: 35 passing (24 UI + 11 integration)
- **TypeScript**: Clean (my files)
- **Lint**: Clean (my files)

Note: Pre-existing TypeScript errors in `src/app/cockpit/page.tsx` (not my changes)

### Files Changed
| File | Action |
|------|--------|
| `footprint/app/(app)/create/page.tsx` | Modified - R2 upload integration |
| `footprint/app/(app)/create/page.test.tsx` | Modified - added 11 integration tests |
| `.claudecode/milestones/sprint-5/INT-01/START.md` | Created |
| `.claudecode/milestones/sprint-5/INT-01/ROLLBACK-PLAN.md` | Created |

### API Integration
```typescript
// On file select, calls:
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File, mode: 'direct', optimize: 'true' }

// On success, stores:
orderStore.setOriginalImage(response.publicUrl, file)
```

### UI States
1. **Default**: Upload zone with gallery/camera buttons
2. **Uploading**: Progress indicator with spinner and percentage
3. **Error**: Error message with retry button
4. **Success**: Image preview with "מוכן" badge

### Gate Status
- [x] Gate 0: Research (N/A - uses existing API)
- [x] Gate 1: Planning (START.md, ROLLBACK-PLAN.md, tag INT-01-start)
- [x] Gate 2: Implementation (TDD - 35 tests)
- [x] Gate 3: Code Quality (TypeScript clean, Lint clean)
- [ ] Gate 4: Review (PM/QA validation)
- [ ] Gate 5: Deployment

**Commit**: `f17e96f2`

**Ready for Gate 4 PM/QA validation.**

---

## 2025-12-26 - Frontend-B: UI-05 Ready for QA

**Story**: UI-05 - Confirmation Page UI
**Branch**: feature/ui-05-confirmation-page
**Sprint**: 4
**Priority**: P1

### Summary
Implemented Confirmation Page UI matching 05-confirmation.html mockup:
- Success hero with animated checkmark and celebratory confetti
- Order number in FP-YYYY-XXXX format
- Order summary card with thumbnail, style name, specs, price
- Delivery info with estimated arrival date
- 4-step timeline tracker (completed, active, pending visual states)
- Share card with WhatsApp, Facebook, Copy link buttons
- Bottom CTA with "לדף הבית" and "הזמנה נוספת" buttons
- RTL layout throughout

### Key Deliverables
- `app/(app)/create/complete/page.tsx` - Complete page rewrite matching mockup
- `app/(app)/create/complete/page.test.tsx` - 45 TDD tests

### Test Results
- **Tests**: 45 passing (page-specific)
- **TypeScript**: Clean (my files)
- **Lint**: Clean (my files)

### Files Changed
| File | Action |
|------|--------|
| `footprint/app/(app)/create/complete/page.tsx` | Modified - complete rewrite |
| `footprint/app/(app)/create/complete/page.test.tsx` | Created - 45 TDD tests |
| `.claudecode/milestones/sprint-4/UI-05/*` | Created - planning docs |

### Gate Status
- [x] Gate 0: Research (N/A - UI implementation)
- [x] Gate 1: Planning (START.md, ROLLBACK-PLAN.md)
- [x] Gate 2: Implementation (TDD - 45 tests)
- [x] Gate 3: QA Validation (TypeScript clean, Lint clean)
- [ ] Gate 4: Review (PM/QA validation)
- [ ] Gate 5: Deployment

**Commit**: `6cc85ab7`

**Ready for Gate 4 PM/QA validation.**

**Completes UI Flow**: UI-01 → UI-02 → UI-03 → UI-04 → **UI-05** (order creation flow complete)

---

## 2025-12-26 - Frontend-B: OM-01 Ready for QA

**Story**: OM-01 - Admin Order Dashboard
**Branch**: feature/om-01-admin-dashboard
**Sprint**: 4
**Priority**: P1
**Linear**: UZF-1845

### Summary
Implemented Admin Order Dashboard matching 09-admin-orders.html mockup:
- Stats grid with 4 cards (today orders, pending, shipped, revenue)
- Search bar for filtering by order ID, customer name, or phone
- Status filter tabs (all, pending, processing, shipped, delivered)
- Orders list with thumbnails, FP-YYYY-XXXX IDs, status badges, and prices
- Time ago formatting (Hebrew: "לפני X דק׳", "לפני X שעות", etc.)
- RTL layout throughout
- Uses demo data from `data/demo/orders.ts`

### Key Deliverables
- `app/admin/page.tsx` - Complete admin dashboard
- `app/admin/page.test.tsx` - 38 TDD tests

### Test Results
- **Tests**: 38 passing (page-specific)
- **TypeScript**: Clean (my files)
- **Lint**: Clean (my files)

Note: Pre-existing TypeScript/lint errors exist in `src/app/cockpit/page.tsx` (not my changes)

### Files Changed
| File | Action |
|------|--------|
| `footprint/app/admin/page.tsx` | Created - full admin dashboard |
| `footprint/app/admin/page.test.tsx` | Created - 38 TDD tests |
| `.claudecode/milestones/sprint-4/OM-01/*` | Created - planning docs |

### Gate Status
- [x] Gate 0: Research (N/A - UI implementation)
- [x] Gate 1: Planning (START.md, ROLLBACK-PLAN.md)
- [x] Gate 2: Implementation (TDD - 38 tests)
- [x] Gate 3: QA Validation (TypeScript clean, Lint clean)
- [ ] Gate 4: Review (PM/QA validation)
- [ ] Gate 5: Deployment

**Commit**: `a7fff31e`

**Ready for Gate 4 PM/QA validation.**

---

## 2025-12-25 - Backend-2: CO-03 Ready for QA
>>>>>>> feature/pc-05-realistic-mockup-preview

**Story**: INT-05 - Connect Confirmation to Order API
**Branch**: feature/int-05-confirmation-order-api
**Sprint**: 5
**Priority**: P1

### Summary
Connected the confirmation page to the order confirmation API:
- Reads orderId from URL search params (`?orderId=xxx`)
- Fetches order data from `/api/orders/[orderId]/confirm`
- Displays real order number from API response
- Uses WhatsApp URL from API for share functionality
- Shows loading state with spinner while fetching
- Shows error state with home button if API fails
- Falls back to store data when no orderId provided

### Key Deliverables
- `app/(app)/create/complete/page.tsx` - Modified with API integration
- `app/(app)/create/complete/page.test.tsx` - Added 9 integration tests (54 total)
- `.claudecode/milestones/sprint-5/INT-05/*` - Planning docs

### Test Results
- **Tests**: 54 passing (45 UI + 9 integration)
- **Total**: 1236 tests passing (all project tests)
- **TypeScript**: Clean (my files)
- **Lint**: Clean (my files)

Note: Pre-existing TypeScript errors in `src/app/cockpit/page.tsx` (not my changes)

### Files Changed
| File | Action |
|------|--------|
| `footprint/app/(app)/create/complete/page.tsx` | Modified - API integration |
| `footprint/app/(app)/create/complete/page.test.tsx` | Modified - added 9 integration tests |
| `.claudecode/milestones/sprint-5/INT-05/START.md` | Created |
| `.claudecode/milestones/sprint-5/INT-05/ROLLBACK-PLAN.md` | Created |

### API Integration
```typescript
// URL param handling
const searchParams = useSearchParams();
const orderId = searchParams.get('orderId');

// On mount, if orderId present:
GET /api/orders/{orderId}/confirm

// Response used for:
- orderNumber (displayed instead of random)
- total (for price display)
- whatsappUrl (for share button)
```

### UI States
1. **Loading**: Spinner with "טוען פרטי הזמנה..." text
2. **Error**: Error icon, message, and home button
3. **Success**: Full confirmation page with API data
4. **Fallback**: No orderId → uses store data + generated order number

### Gate Status
- [x] Gate 0: Research (N/A - uses existing API)
- [x] Gate 1: Planning (START.md, ROLLBACK-PLAN.md, tag INT-05-start)
- [x] Gate 2: Implementation (TDD - 54 tests)
- [x] Gate 3: Code Quality (TypeScript clean, Lint clean)
- [ ] Gate 4: Review (PM/QA validation)
- [ ] Gate 5: Deployment

**Commit**: `0f9d9a56`

**Ready for Gate 4 PM/QA validation.**

---

## 2025-12-26 - Backend-2: OM-03 Ready for QA

**Story**: OM-03 - Download Print-Ready Files
**Priority**: P1
**Type**: Gate 2 Complete - Ready for QA

### Summary
Implemented admin print-ready file download functionality using TDD:
- Print file generation library with 300 DPI optimization
- Admin API endpoint (GET /api/admin/orders/[id]/download)
- Support for all print sizes: A5, A4, A3, A2
- Presigned download URLs (1 hour expiry)

### Key Decisions
- Uses existing lib/image/optimize.ts for print processing
- Uses existing lib/storage/r2.ts for storage operations
- Files generated on-demand from transformed images
- sRGB color profile preserved (CMYK handled by print shop)

### Test Results
- **Tests**: 28 passing (14 lib + 14 API)
- **Coverage**: 93.75% for lib/orders/printFile.ts
- **TypeScript**: 0 errors in OM-03 files
- **Lint**: Clean

### Files Changed
| File | Status |
|------|--------|
| footprint/lib/orders/printFile.ts | Created |
| footprint/lib/orders/printFile.test.ts | Created |
| footprint/app/api/admin/orders/[id]/download/route.ts | Created |
| footprint/app/api/admin/orders/[id]/download/route.test.ts | Created |

### Branch
`feature/OM-03-print-ready-download` (commit `fa9148f4`)

**Ready for Gate 3 QA validation.**

---

## 2025-12-21 - CTO: PayPlus Gate 0 APPROVED

**Story**: CO-06 (UZF-1853)
**Priority**: P0
**Type**: Gate 0 Approval

### Decision
PayPlus integration APPROVED as complementary to Stripe.

**Architecture:**
- Israeli Customers → PayPlus (Bit, cards, תשלומים)
- International Customers → Stripe

**Key Benefits:**
- Bit Support: 6+ million Israeli users
- Installments: Native credit (תשלומים)
- Lower Fees: ~0.4% savings on Israeli transactions
- Faster Settlement: T+1 for Israeli banks

**New Story Created:**
| Linear ID | Story | Sprint | Agent | Points |
|-----------|-------|--------|-------|--------|
| UZF-1853 | [CO-06] PayPlus Israeli Payment Integration | 4 | Backend-2 | 5 |

**Dependency:** CO-02 (Stripe) must complete first

**Research Document:** `.claudecode/research/GATE0-payplus-payments.md`

**Action Required:** PM to acknowledge and proceed with Sprint 1 kickoff.

**✅ PM Action Taken (2025-12-21):**
- Acknowledged PayPlus Gate 0 approval
- Sprint 1 kicked off
- Frontend-B assigned: UP-01, UP-02, UP-04
- Backend-2 assigned: UP-03

---

## 2025-12-22 - Backend-2: UP-03 Ready for QA

**Story**: UP-03
**Priority**: P0
**Type**: Gate 2 Complete

### Summary
Implemented image optimization pipeline for print-ready photos:
- Sharp-based image processing (resize to 300 DPI, HEIC→JPEG conversion)
- File validation (20MB max, JPEG/PNG/HEIC/WebP supported)
- Cloudflare R2 storage integration with presigned URLs
- RESTful upload API with two modes (presigned & direct)

### Key Decisions
- Used presigned URL approach for client uploads (as per Gate 0 research)
- Implemented direct upload mode for server-side optimization
- Added print size presets (A5, A4, A3, A2) for future use

### Test Results
- **Tests**: 78 passing (32 image, 30 storage, 16 API)
- **Coverage**: 100% for lib/image/, 100% for lib/storage/
- **TypeScript**: 0 errors (in my files)
- **Lint**: Clean

### Files Changed
| File | Status |
|------|--------|
| footprint/lib/image/optimize.ts | Created |
| footprint/lib/storage/r2.ts | Created |
| footprint/app/api/upload/route.ts | Created |
| + test files for each | Created |

### Branch
`feature/UP-03-image-optimization` (commit `82c076fd`)

**Ready for Gate 3 QA validation.**

QA handoff written to: `.claudecode/handoffs/qa-inbox.md`

---

## 2025-12-26 - Frontend-A: UI-08 Ready for QA

**Story**: UI-08
**Priority**: P1
**Type**: Gate 2 Complete

### Summary
Implemented StepProgress component for 5-step order flow indicator:
- Displays all 5 steps with labels (Upload, Style, Customize, Checkout, Complete)
- Current step highlighting with brand purple accent
- Completed steps show checkmark icons
- Hebrew labels with RTL layout support
- Connector lines between steps with proper styling
- Full accessibility support (nav role, aria-current, aria-labels)

### Key Decisions
- Used `locale` prop for language switching ('en' | 'he')
- RTL direction auto-applied when locale is Hebrew
- Follows existing UI primitive patterns (forwardRef, cn utility)
- Designed as reusable component with configurable steps

### Test Results
- **Tests**: 29 passing
- **Coverage**: 100% (statements, branches, functions, lines)
- **TypeScript**: 0 errors
- **Lint**: Clean

### Files Changed
| File | Status |
|------|--------|
| footprint/components/ui/StepProgress.tsx | Created |
| footprint/components/ui/StepProgress.test.tsx | Created |
| footprint/components/ui/index.ts | Modified (export added) |
| .claudecode/milestones/sprint-2/UI-08/START.md | Created |
| .claudecode/milestones/sprint-2/UI-08/ROLLBACK-PLAN.md | Created |

### Branch
`feature/ui-08-step-progress` (commit `5c859e6a`)

**Ready for Gate 3 QA validation.**

---

## 2025-12-26 - Frontend-A: UI-09 Ready for QA

**Story**: UI-09
**Priority**: P1
**Type**: Gate 2 Complete

### Summary
Implemented two shared UI components:

**PriceDisplay:**
- ILS currency formatting with ₪ symbol
- Support for integers, decimals, and thousands separator
- Strikethrough for original prices
- "חינם" (Free) display for zero amounts
- Size and color variants
- RTL support for Hebrew

**OrderTimeline:**
- 4-step order status tracker (received, processing, shipped, delivered)
- Current step highlighting, completed step checkmarks
- Hebrew labels with RTL layout support
- Vertical and horizontal layout options
- Estimated dates display

### Key Decisions
- PriceDisplay defaults to Hebrew locale (RTL) as primary market is Israel
- OrderTimeline supports vertical (default for sidebar/mobile) and horizontal layouts
- Both components follow existing design system patterns

### Test Results
- **Tests**: 62 passing (31 PriceDisplay + 31 OrderTimeline)
- **Coverage**: 100% (both components)
- **TypeScript**: 0 errors
- **Lint**: Clean

### Files Changed
| File | Status |
|------|--------|
| footprint/components/ui/PriceDisplay.tsx | Created |
| footprint/components/ui/PriceDisplay.test.tsx | Created |
| footprint/components/ui/OrderTimeline.tsx | Created |
| footprint/components/ui/OrderTimeline.test.tsx | Created |
| footprint/components/ui/index.ts | Modified |
| .claudecode/milestones/sprint-2/UI-09/START.md | Created |
| .claudecode/milestones/sprint-2/UI-09/ROLLBACK-PLAN.md | Created |

### Branch
`feature/ui-09-price-timeline` (commit `34058e19`)

**Ready for Gate 3 QA validation.**

---

## 2025-12-26 - Frontend-A: AUTH-01 Ready for QA

**Story**: AUTH-01
**Priority**: P1
**Type**: Gate 2 Complete

### Summary
Implemented user login page with TDD:

**LoginForm:**
- Email input with validation (required, email format)
- Password input with show/hide visibility toggle
- Form validation with inline error messages
- Loading and disabled states
- RTL/Hebrew layout support via dir prop
- Server error display
- Links to forgot password and registration

**SocialLoginButtons:**
- Google OAuth button with icon
- Apple OAuth button with icon
- Loading states for each provider
- Disabled state when any login is in progress
- RTL support for Hebrew labels
- "or" divider between social and form login

**Login Page:**
- Full page layout with Card component
- Integrated LoginForm and SocialLoginButtons
- State management for loading and errors
- Ready for Backend-1 auth integration

### Key Decisions
- Used placeholder text selectors in tests for specificity (avoids conflicts with aria-labels)
- Kept auth API calls as TODOs - Backend-1 owns auth integration
- Password visibility toggle uses accessible aria-labels
- Email validation uses standard regex pattern

### Test Results
- **Tests**: 39 passing (21 LoginForm + 18 SocialLoginButtons)
- **Coverage**: Full statement/branch coverage for auth components
- **TypeScript**: 0 errors
- **Lint**: Clean
- **All Project Tests**: 799 passing

### Files Changed
| File | Status |
|------|--------|
| footprint/components/auth/LoginForm.tsx | Created |
| footprint/components/auth/LoginForm.test.tsx | Created |
| footprint/components/auth/SocialLoginButtons.tsx | Created |
| footprint/components/auth/SocialLoginButtons.test.tsx | Created |
| footprint/components/auth/index.ts | Created |
| footprint/app/(auth)/login/page.tsx | Created |
| footprint/app/(auth)/layout.tsx | Created |
| .claudecode/milestones/sprint-4/AUTH-01/START.md | Created |
| .claudecode/milestones/sprint-4/AUTH-01/ROLLBACK-PLAN.md | Created |

### Branch
`feature/auth-01-login-page` (commits `d16421fa`, `d2239650`)

### Blockers
None - auth API integration is Backend-1's domain

**Ready for Gate 3 QA validation.**

---

---
