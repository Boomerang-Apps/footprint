# FOOTPRINT
## AI-Powered Photo Printing Studio

# Enterprise User Stories & Technical Specifications

**Version 2.0 | December 2024**

**Development-Ready Sprint Planning Document**

---

| Field | Value |
|-------|-------|
| Document Owner | Product Team |
| Last Updated | December 2024 |
| Status | Approved for Development |
| Design Mockups | 11 HTML Screens (Attached) |
| Total Story Points | 89 |
| Sprints | 4 (2-week each) |
| MVP Timeline | 8 Weeks |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Epic 1: Photo Upload](#2-epic-1-photo-upload)
3. [Epic 2: AI Style Transformation](#3-epic-2-ai-style-transformation)
4. [Epic 3: Product Customization](#4-epic-3-product-customization)
5. [Epic 4: Gift Experience](#5-epic-4-gift-experience)
6. [Epic 5: Checkout & Payment](#6-epic-5-checkout--payment)
7. [Epic 6: Order Management (Admin)](#7-epic-6-order-management-admin)
8. [Screen-to-Story Matrix](#8-screen-to-story-matrix)
9. [API Contract Summary](#9-api-contract-summary)
10. [Data Models](#10-data-models)

---

## 1. Executive Summary

### 1.1 Project Overview

Footprint transforms everyday photos into museum-quality art prints using AI-powered style transformation. Users upload photos, apply artistic styles, customize print options, and receive professionally printed artwork delivered to their door.

**Vision:** "Turn every photo into a lasting memory, every memory into a meaningful gift."

**Target:** Under 2-minute purchase flow from upload to checkout.

### 1.2 Design Mockups Reference

| Screen | File Name | Description | User Flow |
|--------|-----------|-------------|-----------|
| 01 | `01-upload.html` | Photo upload with drag-drop & camera | Entry point |
| 02 | `02-style-selection.html` | AI style selection with live preview | Step 2 |
| 03 | `03-customize.html` | Size, paper, frame configuration | Step 3 |
| 04 | `04-checkout.html` | Payment, shipping, gift options | Step 4 |
| 05 | `05-confirmation.html` | Order success with timeline | Completion |
| 06 | `06-landing.html` | Marketing landing page | Marketing |
| 07 | `07-order-history.html` | User order list | Account |
| 08 | `08-order-detail.html` | Single order details | Account |
| 09 | `09-admin-orders.html` | Admin order dashboard | Admin |
| 10 | `10-admin-order-detail.html` | Admin order management | Admin |
| 11 | `11-login.html` | Authentication screen | Auth |

### 1.3 Sprint Summary

| Sprint | Focus | Stories | Points | Duration |
|--------|-------|---------|--------|----------|
| Sprint 1 | Foundation & Upload | UP-01 to UP-04 | 16 | Weeks 1-2 |
| Sprint 2 | AI & Customization | AI-01 to AI-04, PC-01 to PC-04 | 27 | Weeks 3-4 |
| Sprint 3 | Checkout & Gifting | GF-01 to GF-03, CO-01 to CO-04 | 18 | Weeks 5-6 |
| Sprint 4 | Admin & Polish | OM-01 to OM-04, AI-05, CO-03, CO-05 | 19 | Weeks 7-8 |

### 1.4 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Uzerflow (order management, user auth, data storage) |
| AI Processing | Replicate API |
| Image Storage | Cloudflare R2 |
| Payments | Stripe |
| Hosting | Vercel |

---

## 2. Epic 1: Photo Upload

**Goal:** Enable users to upload photos from any device in under 10 seconds

**Total Story Points:** 18

**Design Reference:** `01-upload.html`

---

### UP-01: Camera Roll Upload

| Field | Value |
|-------|-------|
| Story ID | UP-01 |
| Story Points | 5 |
| Priority | Must Have |
| Sprint | Sprint 1 |

#### User Story

> As a **user**, I want to **upload a photo from my phone's camera roll** so I can **use my existing photos to create personalized art prints.**

#### Design Reference

- **Screen:** `01-upload.html`
- **Components:** `.upload-zone`, `.upload-btn`, `.camera-btn`, `.preview-container`
- **States:** Empty, Hover, Uploading, Preview, Error

#### Acceptance Criteria

1. Tapping "בחרו תמונה" opens native camera roll picker on iOS/Android
2. System supports JPG, PNG, and HEIC formats
3. Selected image displays in preview area within 2 seconds
4. Preview shows image with "מוכן להמשך" success badge
5. "החלפת תמונה" button allows selecting a different image
6. "המשך לבחירת סגנון" button becomes active (gradient) after upload

#### Technical Specifications

**API Endpoint:**
```
POST /api/images/upload
```

**Request:**
```
Content-Type: multipart/form-data
Body: { file: <binary>, userId?: string }
```

**Response:**
```json
{
  "imageId": "string",
  "originalUrl": "string",
  "thumbnailUrl": "string",
  "width": "number",
  "height": "number",
  "fileSize": "number"
}
```

#### Validation Rules

| Rule | Value |
|------|-------|
| Max file size | 20MB |
| Min dimensions | 500x500px |
| Allowed MIME types | image/jpeg, image/png, image/heic |

#### Edge Cases & Error States

| Scenario | Behavior | UI Response |
|----------|----------|-------------|
| File too large (>20MB) | Reject upload | Toast: "הקובץ גדול מדי. מקסימום 20MB" |
| Invalid format | Reject upload | Toast: "פורמט לא נתמך. נסו JPG או PNG" |
| Network error | Show retry option | "שגיאת רשת. נסו שוב" + retry button |
| Image too small | Warn but allow | Warning: "איכות נמוכה להדפסה גדולה" |

#### Test Scenarios

1. ✅ Upload valid JPG from camera roll → Preview displayed
2. ✅ Upload valid PNG from camera roll → Preview displayed
3. ✅ Upload HEIC from iPhone → Converted and displayed
4. ❌ Upload 25MB file → Error message shown
5. ❌ Upload PDF file → Error message shown
6. ✅ Replace image after initial upload → New preview shown
7. ✅ Continue button state before upload → Disabled (gray)
8. ✅ Continue button state after upload → Active (gradient)

#### Accessibility Requirements

- Upload button: `aria-label="העלאת תמונה מהגלריה"`
- Preview image: alt text describing upload state
- Error messages: `role="alert"` for screen readers
- Keyboard navigation: Tab through all interactive elements

#### Performance Targets

| Metric | Target |
|--------|--------|
| Camera roll picker opens | < 500ms |
| Image upload completes | < 5 seconds (on 4G) |
| Preview renders | < 2 seconds after upload |
| Total time to ready state | < 10 seconds |

---

### UP-02: Drag-and-Drop Upload (Desktop)

| Field | Value |
|-------|-------|
| Story ID | UP-02 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 1 |

#### User Story

> As a **desktop user**, I want to **drag-and-drop photos onto the upload area** so I can **quickly upload from my computer without clicking through dialogs.**

#### Design Reference

- **Screen:** `01-upload.html` (desktop breakpoint 1024px+)
- **Components:** `.upload-zone` with drag states
- **Visual States:** Default → Drag Over (dashed purple border) → Uploading → Preview

#### Acceptance Criteria

1. Drop zone shows dashed border on drag enter
2. Border color changes to purple (#7c3aed) on drag over
3. Only first file processed if multiple dropped
4. Progress indicator shown during upload
5. Same validation rules as camera roll upload apply

#### Technical Implementation

**Event Handlers:**
```javascript
ondragenter, ondragover, ondragleave, ondrop
```

**CSS Classes:**
```css
.upload-zone.drag-over { 
  border: 2px dashed #7c3aed;
  background: rgba(124, 58, 237, 0.05);
}
```

#### Test Scenarios

1. ✅ Drag single JPG → Upload starts, preview shown
2. ✅ Drag multiple files → Only first processed
3. ❌ Drag non-image file → Error message shown
4. ✅ Drag and cancel (leave area) → Returns to default state

---

### UP-03: Automatic Image Optimization

| Field | Value |
|-------|-------|
| Story ID | UP-03 |
| Story Points | 5 |
| Priority | Must Have |
| Sprint | Sprint 1 |

#### User Story

> As a **user**, I want my **photo automatically optimized for printing** so it **looks great when printed without manual adjustments.**

#### Acceptance Criteria

1. Images auto-resized to print DPI (300 DPI)
2. Color profile converted to sRGB for consistent printing
3. HEIC files converted to JPG automatically
4. EXIF orientation applied correctly
5. Files exceeding 20MB rejected with clear error

#### Technical Specifications

**Processing Pipeline:**

1. Validate file size and MIME type
2. Extract and apply EXIF orientation
3. Convert HEIC to JPG if needed
4. Convert color profile to sRGB
5. Generate thumbnail (800px max dimension)
6. Store original and processed versions in R2

**Storage Structure:**
```
/images/{imageId}/original.{ext}
/images/{imageId}/processed.jpg
/images/{imageId}/thumbnail.jpg
```

**Dependencies:**
- Sharp (Node.js image processing)
- heic-convert (HEIC to JPG)

---

### UP-04: Image Preview

| Field | Value |
|-------|-------|
| Story ID | UP-04 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 1 |

#### User Story

> As a **user**, I want to **see a preview of my uploaded photo** so I can **confirm it's the correct image before proceeding.**

#### Design Reference

- **Screen:** `01-upload.html` → `.preview-container` state
- **Components:** `.preview-image-wrapper`, `.preview-badge`, `.preview-actions`

#### Acceptance Criteria

1. Full preview displayed in upload zone area
2. Green "מוכן להמשך" badge shown on successful upload
3. "החלפת תמונה" button available to select different image
4. Image maintains aspect ratio (object-fit: cover)

---

### UP-05: Face Detection Cropping (Could Have)

| Field | Value |
|-------|-------|
| Story ID | UP-05 |
| Story Points | 2 |
| Priority | Could Have |
| Sprint | Post-MVP |

#### User Story

> As a **user**, I want **face detection to suggest optimal cropping** so **portraits are centered correctly.**

#### Acceptance Criteria

1. Faces detected in uploaded image
2. Crop suggestion shown with face centered
3. Manual override available to adjust crop

---

## 3. Epic 2: AI Style Transformation

**Goal:** Transform photos into artistic styles with instant preview

**Total Story Points:** 21

**Design Reference:** `02-style-selection.html`

---

### AI-01: Style Gallery Display

| Field | Value |
|-------|-------|
| Story ID | AI-01 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 2 |

#### User Story

> As a **user**, I want to **see all available art styles** so I can **choose one that matches my vision.**

#### Design Reference

- **Screen:** `02-style-selection.html`
- **Components:** `.styles-strip`, `.style-item`, `.style-icon-btn`
- **Layout:** Horizontal scrollable strip with gradient icon buttons

#### Available Styles (MVP)

| Style ID | Hebrew Name | Icon | Gradient | Description |
|----------|-------------|------|----------|-------------|
| `pop_art` | פופ ארט | zap | purple-pink | Bold colors, halftone dots, Warhol-inspired |
| `watercolor` | צבעי מים | droplet | blue-cyan | Soft edges, flowing colors |
| `line_art` | ציור קווי | pen | gray | Clean lines, minimalist |
| `oil_painting` | ציור שמן | brush | orange | Thick brushstrokes, classic feel |
| `romantic` | רומנטי | heart | pink | Soft focus, warm tones |
| `comic` | קומיקס | zap | orange-red | Bold outlines, bright colors |
| `vintage` | וינטג׳ | film | brown | Sepia tones, film grain |
| `original` | מקורי משופר | sun | green | Enhanced original, no AI style |

#### Acceptance Criteria

1. All 8 styles displayed in horizontal strip
2. Each style shows icon with gradient background
3. Style names displayed below icons
4. "פופולרי" badge on pop_art style
5. "חדש" badge on romantic style
6. Strip is horizontally scrollable on mobile
7. Strip is centered on desktop (no scroll needed)

#### API Endpoint

```
GET /api/styles
```

**Response:**
```json
[
  {
    "id": "pop_art",
    "name": "פופ ארט",
    "icon": "zap",
    "gradient": "linear-gradient(135deg, #8b5cf6, #ec4899)",
    "badge": "פופולרי"
  }
]
```

---

### AI-02: Live Style Preview

| Field | Value |
|-------|-------|
| Story ID | AI-02 |
| Story Points | 8 |
| Priority | Must Have |
| Sprint | Sprint 2 |

#### User Story

> As a **user**, I want to **preview my photo in different styles** so I can **compare options before making a decision.**

#### Design Reference

- **Screen:** `02-style-selection.html`
- **Components:** `.preview-container`, `.ai-overlay`, `.style-badge`
- **Loading State:** `.ai-overlay` with spinner and "מעבד בסגנון..." text

#### Acceptance Criteria

1. Tapping style icon triggers transformation preview
2. Loading overlay shows during AI processing
3. Preview renders in under 10 seconds
4. Selected style shows purple border and checkmark
5. Style name badge updates on preview image
6. X button allows closing/returning to upload

#### Technical Specifications

**API Endpoint:**
```
POST /api/images/transform
```

**Request:**
```json
{
  "imageId": "string",
  "style": "pop_art"
}
```

**Response:**
```json
{
  "transformedUrl": "string",
  "cached": false
}
```

**AI Provider:** Replicate API
- Model: Stable Diffusion / Custom fine-tuned model
- Fallback: Queue system for high load

#### Performance Requirements

| Metric | Target |
|--------|--------|
| First transformation | < 10 seconds |
| Cached transformation | < 2 seconds |
| Cache duration | 24 hours |

#### Edge Cases

| Scenario | Behavior |
|----------|----------|
| AI service timeout | Show retry button, "נסו שוב" |
| AI service error | Fallback to original with message |
| Rapid style switching | Cancel previous request, start new |

---

### AI-03: Original Photo Option

| Field | Value |
|-------|-------|
| Story ID | AI-03 |
| Story Points | 2 |
| Priority | Must Have |
| Sprint | Sprint 2 |

#### User Story

> As a **user**, I want to **keep my original photo unchanged** so I can **print it as-is with optional enhancements.**

#### Acceptance Criteria

1. "מקורי משופר" style option available
2. Selecting it shows original image (no AI processing)
3. Optional: Auto-enhancement toggle (brightness, contrast)
4. Fastest option (no AI delay)

---

### AI-04: Unlimited Free Previews

| Field | Value |
|-------|-------|
| Story ID | AI-04 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 2 |

#### User Story

> As a **user**, I want to **try unlimited styles for free** so I can **explore options without commitment.**

#### Acceptance Criteria

1. No paywall for preview generation
2. Watermark on preview images (small, corner)
3. Full quality image on purchase
4. "תצוגה מקדימה חינם ללא הגבלה" notice displayed

#### Implementation Notes

- Previews generated at 800px max dimension (saves processing)
- Full resolution (300 DPI) generated only after payment
- Watermark: Semi-transparent Footprint logo in corner

---

### AI-05: Fast Transformation (Should Have)

| Field | Value |
|-------|-------|
| Story ID | AI-05 |
| Story Points | 5 |
| Priority | Should Have |
| Sprint | Sprint 4 |

#### User Story

> As a **user**, I want the **AI transformation to complete quickly** so I **don't wait too long.**

#### Acceptance Criteria

1. Target: < 10 seconds transformation time
2. Progress indicator during processing
3. Retry option on failure
4. Background processing with notification when ready

---

## 4. Epic 3: Product Customization

**Goal:** Allow users to configure print size, paper, and framing options

**Total Story Points:** 13

**Design Reference:** `03-customize.html`

---

### PC-01: Print Size Selection

| Field | Value |
|-------|-------|
| Story ID | PC-01 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 2 |

#### User Story

> As a **user**, I want to **select print size** so I **get the dimensions I need.**

#### Size Options & Pricing

| Size | Dimensions | Base Price | Print Cost | Margin |
|------|------------|------------|------------|--------|
| A5 | 14.8 × 21 ס"מ | ₪89 | ~₪15 | 83% |
| A4 | 21 × 29.7 ס"מ | ₪149 | ~₪25 | 83% |
| A3 | 29.7 × 42 ס"מ | ₪229 | ~₪40 | 83% |
| A2 | 42 × 59.4 ס"מ | ₪379 | ~₪60 | 84% |

#### Acceptance Criteria

1. All 4 size options displayed
2. Size visualization shows relative dimensions
3. Price updates live when size changes
4. Default selection: A4 (most popular)
5. "הכי פופולרי" badge on A4

#### Design Components

- `.size-options` - Container for size buttons
- `.size-option` - Individual size button
- `.size-option.selected` - Selected state with purple border

---

### PC-02: Paper Type Selection

| Field | Value |
|-------|-------|
| Story ID | PC-02 |
| Story Points | 2 |
| Priority | Must Have |
| Sprint | Sprint 2 |

#### User Story

> As a **user**, I want to **choose paper type** so I **get the finish I prefer.**

#### Paper Options

| Paper ID | Hebrew Name | Description | Price Modifier |
|----------|-------------|-------------|----------------|
| `matte` | מאט פיין ארט | Museum quality, no glare | +₪0 (default) |
| `glossy` | מבריק | Vibrant colors, photo finish | +₪0 |
| `canvas` | קנבס | Textured, painterly feel | +₪30 |

#### Acceptance Criteria

1. All paper options displayed with descriptions
2. Tooltip on hover explaining each type
3. Price difference shown for canvas
4. Default selection: Matte (Fine Art)

---

### PC-03: Frame Selection

| Field | Value |
|-------|-------|
| Story ID | PC-03 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 2 |

#### User Story

> As a **user**, I want to **add a frame** so my **print is ready to hang.**

#### Frame Options

| Frame ID | Hebrew Name | Price Modifier (by size) |
|----------|-------------|-------------------------|
| `none` | ללא מסגרת | +₪0 |
| `black` | שחור | A5: +₪40, A4: +₪60, A3: +₪90, A2: +₪120 |
| `white` | לבן | A5: +₪40, A4: +₪60, A3: +₪90, A2: +₪120 |
| `oak` | אלון טבעי | A5: +₪55, A4: +₪80, A3: +₪120, A2: +₪160 |

#### Acceptance Criteria

1. Frame options displayed with color preview
2. Price updates based on selected size
3. Frame preview shown on product mockup
4. Default selection: None

---

### PC-04: Live Price Calculator

| Field | Value |
|-------|-------|
| Story ID | PC-04 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 2 |

#### User Story

> As a **user**, I want to **see the total price update as I customize** so I **know exactly what I'm paying.**

#### Acceptance Criteria

1. Price recalculates on every option change
2. Price breakdown visible (base + frame + paper)
3. Shipping estimate shown
4. Prominent total display

#### Price Calculation Logic

```javascript
function calculatePrice(size, paper, frame) {
  const basePrice = SIZE_PRICES[size];        // ₪89-379
  const paperModifier = PAPER_PRICES[paper];  // ₪0-30
  const frameModifier = FRAME_PRICES[frame][size]; // ₪0-160
  
  return basePrice + paperModifier + frameModifier;
}
```

#### API Endpoint

```
GET /api/products/calculate-price?size=A4&paper=matte&frame=black
```

**Response:**
```json
{
  "basePrice": 149,
  "paperPrice": 0,
  "framePrice": 60,
  "subtotal": 209,
  "shipping": 29,
  "total": 238
}
```

---

### PC-05: Realistic Mockup Preview (Could Have)

| Field | Value |
|-------|-------|
| Story ID | PC-05 |
| Story Points | 2 |
| Priority | Could Have |
| Sprint | Post-MVP |

#### User Story

> As a **user**, I want to **see a realistic mockup of my framed print** so I can **visualize it on my wall.**

#### Acceptance Criteria

1. 3D frame preview with selected frame color
2. Wall context mockup (optional background)
3. Zoom capability

---

## 5. Epic 4: Gift Experience

**Goal:** Enable seamless gifting with personal messages and recipient shipping

**Total Story Points:** 13

**Design Reference:** `04-checkout.html` (gift section)

---

### GF-01: Gift Toggle

| Field | Value |
|-------|-------|
| Story ID | GF-01 |
| Story Points | 2 |
| Priority | Must Have |
| Sprint | Sprint 3 |

#### User Story

> As a **user**, I want to **mark my order as a gift** so it's **packaged appropriately.**

#### Acceptance Criteria

1. Gift toggle prominently displayed in checkout
2. Toggle label: "זוהי מתנה 🎁"
3. Toggling on reveals gift options section
4. Price not printed on packing slip for gifts
5. Gift wrap option becomes available

#### Design Components

- `.gift-toggle` - Switch component
- `.gift-options` - Collapsible section (hidden when off)

---

### GF-02: Personal Gift Message

| Field | Value |
|-------|-------|
| Story ID | GF-02 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 3 |

#### User Story

> As a **user**, I want to **add a personal message** so the **recipient knows it's from me.**

#### Acceptance Criteria

1. Text field for personal message
2. Character limit: 150 characters
3. Character counter shows remaining
4. Message printed on gift card
5. Preview of message shown

#### Data Model

```typescript
interface GiftMessage {
  message: string;      // max 150 chars
  senderName?: string;  // optional "From" name
}
```

---

### GF-03: Recipient Shipping

| Field | Value |
|-------|-------|
| Story ID | GF-03 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 3 |

#### User Story

> As a **user**, I want to **ship directly to the recipient** so I **don't handle the delivery.**

#### Acceptance Criteria

1. Separate address form for recipient
2. Recipient name field (appears on package)
3. Delivery date estimate shown
4. Option to copy buyer's address

#### Address Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| recipientName | string | Yes | Min 2 chars |
| phone | string | Yes | Israeli format |
| city | string | Yes | From city list |
| street | string | Yes | Min 3 chars |
| houseNumber | string | Yes | Alphanumeric |
| apartment | string | No | Optional |

---

### GF-04: Gift Wrapping (Should Have)

| Field | Value |
|-------|-------|
| Story ID | GF-04 |
| Story Points | 2 |
| Priority | Should Have |
| Sprint | Sprint 3 |

#### User Story

> As a **user**, I want **gift wrapping** for a **premium touch.**

#### Acceptance Criteria

1. Gift wrap add-on checkbox
2. Price: +₪15
3. Preview of wrap style shown

---

### GF-05: Scheduled Delivery (Could Have)

| Field | Value |
|-------|-------|
| Story ID | GF-05 |
| Story Points | 3 |
| Priority | Could Have |
| Sprint | Post-MVP |

#### User Story

> As a **user**, I want to **schedule delivery for a specific date** so it **arrives on time for the occasion.**

#### Acceptance Criteria

1. Date picker for delivery
2. Occasion presets (birthday, anniversary)
3. Buffer for production time (min 5 days)

---

## 6. Epic 5: Checkout & Payment

**Goal:** Fast, secure checkout with multiple payment options

**Total Story Points:** 15

**Design Reference:** `04-checkout.html`, `05-confirmation.html`

---

### CO-01: Shipping Address Entry

| Field | Value |
|-------|-------|
| Story ID | CO-01 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 3 |

#### User Story

> As a **user**, I want to **enter my shipping address quickly** so I can **complete my order fast.**

#### Address Fields

| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| fullName | string | Yes | Min 2 chars | שם מלא |
| phone | string | Yes | Israeli format (05X) | טלפון נייד |
| city | string | Yes | Autocomplete from list | עיר |
| street | string | Yes | Min 3 chars | רחוב |
| houseNumber | string | Yes | Alphanumeric | מספר בית |
| apartment | string | No | Optional | דירה |
| floor | string | No | Optional | קומה |
| entrance | string | No | Optional | כניסה |
| postalCode | string | No | 7 digits | מיקוד |
| notes | string | No | Max 200 chars | הערות למשלוח |

#### Acceptance Criteria

1. Address autocomplete for city field
2. Phone validation for Israeli format
3. Save address option for logged-in users
4. Clear validation feedback on errors
5. All required fields marked with asterisk

#### Technical Implementation

**City Autocomplete:**
- Use Israel Post city database
- Fuzzy search with Hebrew support

---

### CO-02: Credit Card Payment

| Field | Value |
|-------|-------|
| Story ID | CO-02 |
| Story Points | 5 |
| Priority | Must Have |
| Sprint | Sprint 3 |

#### User Story

> As a **user**, I want to **pay with credit card securely** so my **payment information is protected.**

#### Technical Specifications

**Provider:** Stripe

**Integration:** Stripe Elements (embedded card form)

**Supported Cards:**
- Visa
- Mastercard
- American Express
- Israeli Debit (Isracard)

**Security:**
- PCI-DSS compliant (Stripe handles)
- 3D Secure required for Israeli cards
- No card data stored on our servers

#### API Flow

1. Frontend requests payment intent:
```
POST /api/payments/create-intent
Body: { amount: number, currency: "ILS", orderId: string }
Response: { clientSecret: string }
```

2. Frontend confirms payment with Stripe:
```javascript
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name, email }
  }
});
```

3. Webhook receives confirmation:
```
POST /api/payments/webhook
Event: payment_intent.succeeded
Action: Create order, send confirmation
```

#### Acceptance Criteria

1. Stripe Elements card form embedded
2. Real-time card validation
3. 3D Secure popup when required
4. Loading state during processing
5. Clear error messages on failure

#### Error Handling

| Error | Message |
|-------|---------|
| Card declined | "הכרטיס נדחה. נסו כרטיס אחר" |
| Insufficient funds | "אין מספיק יתרה בכרטיס" |
| Expired card | "הכרטיס פג תוקף" |
| Network error | "שגיאת רשת. נסו שוב" |

---

### CO-03: Apple Pay / Google Pay (Should Have)

| Field | Value |
|-------|-------|
| Story ID | CO-03 |
| Story Points | 3 |
| Priority | Should Have |
| Sprint | Sprint 4 |

#### User Story

> As a **user**, I want to **pay with Apple Pay / Google Pay** so I can **checkout faster.**

#### Acceptance Criteria

1. Wallet button shown when available
2. Device detection for Apple/Google Pay
3. One-tap payment flow
4. Same confirmation flow as card payment

---

### CO-04: Order Confirmation

| Field | Value |
|-------|-------|
| Story ID | CO-04 |
| Story Points | 2 |
| Priority | Must Have |
| Sprint | Sprint 3 |

#### User Story

> As a **user**, I want to **receive order confirmation immediately** so I **know my order was successful.**

#### Design Reference

- **Screen:** `05-confirmation.html`
- **Components:** Success hero, order summary, timeline, share buttons

#### Acceptance Criteria

1. Confirmation page shown immediately after payment
2. Order number displayed prominently
3. Email confirmation sent within 1 minute
4. WhatsApp notification option
5. Order timeline showing next steps

#### Confirmation Email Content

- Order number
- Product details (image thumbnail, style, size)
- Shipping address
- Estimated delivery date
- Total paid
- Support contact

---

### CO-05: Discount Codes (Should Have)

| Field | Value |
|-------|-------|
| Story ID | CO-05 |
| Story Points | 2 |
| Priority | Should Have |
| Sprint | Sprint 4 |

#### User Story

> As a **user**, I want to **apply a discount code** so I can **save money on my order.**

#### Acceptance Criteria

1. Discount code input field in checkout
2. "החל" button to validate code
3. Valid code: Show discount amount, update total
4. Invalid code: Show error "קוד לא תקין"
5. Expired code: Show "הקוד פג תוקף"

#### Discount Types

| Type | Example | Description |
|------|---------|-------------|
| Percentage | WELCOME10 | 10% off order |
| Fixed amount | SAVE20 | ₪20 off order |
| Free shipping | FREESHIP | ₪0 shipping |

---

## 7. Epic 6: Order Management (Admin)

**Goal:** Admin dashboard for order fulfillment and tracking

**Total Story Points:** 9

**Design Reference:** `09-admin-orders.html`, `10-admin-order-detail.html`

---

### OM-01: Order Dashboard

| Field | Value |
|-------|-------|
| Story ID | OM-01 |
| Story Points | 3 |
| Priority | Must Have |
| Sprint | Sprint 4 |

#### User Story

> As an **admin**, I want to **see all orders in a dashboard** so I can **manage fulfillment efficiently.**

#### Design Reference

- **Screen:** `09-admin-orders.html`
- **Components:** Stats cards, filter tabs, order table

#### Acceptance Criteria

1. Order list view with all orders
2. Stats cards: Total orders, pending, processing, shipped
3. Filter by status tabs
4. Search by order number or customer name
5. Sort by date (newest first default)
6. Pagination (20 orders per page)

#### Order List Columns

| Column | Description |
|--------|-------------|
| Order # | FP-XXXXX format |
| Date | Creation timestamp |
| Customer | Name + phone |
| Product | Style + size |
| Total | Amount in ILS |
| Status | Badge with color |
| Actions | View button |

---

### OM-02: Status Updates

| Field | Value |
|-------|-------|
| Story ID | OM-02 |
| Story Points | 2 |
| Priority | Must Have |
| Sprint | Sprint 4 |

#### User Story

> As an **admin**, I want to **update order status** so **customers know their order progress.**

#### Order Status Flow

```
pending → processing → shipped → delivered
            ↓
         cancelled
```

| Status | Hebrew | Color | Description |
|--------|--------|-------|-------------|
| pending | ממתין | Yellow | Payment received, awaiting processing |
| processing | בהכנה | Blue | Being printed/framed |
| shipped | נשלח | Purple | Handed to carrier |
| delivered | נמסר | Green | Confirmed delivery |
| cancelled | בוטל | Red | Order cancelled |

#### Acceptance Criteria

1. Status dropdown in order detail
2. Each change timestamped
3. Customer notified via email on change
4. Optional WhatsApp notification
5. Status history log visible

#### API Endpoint

```
PATCH /api/orders/:id/status
Body: { status: "processing", note?: string }
Response: { success: true, notified: true }
```

---

### OM-03: Print File Download

| Field | Value |
|-------|-------|
| Story ID | OM-03 |
| Story Points | 2 |
| Priority | Must Have |
| Sprint | Sprint 4 |

#### User Story

> As an **admin**, I want to **download print-ready files** so I can **send them to the printer.**

#### File Specifications

| Attribute | Value |
|-----------|-------|
| Format | JPEG or TIFF |
| Resolution | 300 DPI |
| Color profile | sRGB |
| Bleed | 3mm on all sides |

#### Size Dimensions (with bleed)

| Size | Print Dimensions | File Dimensions |
|------|------------------|-----------------|
| A5 | 148 × 210 mm | 154 × 216 mm |
| A4 | 210 × 297 mm | 216 × 303 mm |
| A3 | 297 × 420 mm | 303 × 426 mm |
| A2 | 420 × 594 mm | 426 × 600 mm |

#### Acceptance Criteria

1. Download button in order detail
2. High-resolution file (not preview)
3. Correct dimensions for ordered size
4. Color profile embedded
5. Filename: `FP-{orderId}-{size}.jpg`

---

### OM-04: Tracking Number Entry

| Field | Value |
|-------|-------|
| Story ID | OM-04 |
| Story Points | 2 |
| Priority | Must Have |
| Sprint | Sprint 4 |

#### User Story

> As an **admin**, I want to **add tracking numbers** so **customers can track their delivery.**

#### Supported Carriers

| Carrier | ID | Tracking URL Pattern |
|---------|----|--------------------|
| Israel Post | `israel_post` | https://israelpost.co.il/... |
| Cheetah | `cheetah` | https://cheetah.co.il/... |
| Other | `other` | Manual entry |

#### Acceptance Criteria

1. Tracking number input field
2. Carrier dropdown selection
3. Auto-changes status to "shipped" on save
4. Customer notified with tracking link
5. Tracking link clickable in customer order view

---

## 8. Screen-to-Story Matrix

| Screen | File | Stories Implemented | Key Components |
|--------|------|---------------------|----------------|
| Upload | `01-upload.html` | UP-01, UP-02, UP-03, UP-04 | Upload zone, preview, progress bar |
| Style Selection | `02-style-selection.html` | AI-01, AI-02, AI-03, AI-04 | Style strip, preview container, AI overlay |
| Customize | `03-customize.html` | PC-01, PC-02, PC-03, PC-04 | Size/paper/frame selectors, price calculator |
| Checkout | `04-checkout.html` | GF-01, GF-02, GF-03, CO-01, CO-02, CO-05 | Address form, payment form, gift toggle |
| Confirmation | `05-confirmation.html` | CO-04 | Success hero, order summary, timeline |
| Landing | `06-landing.html` | Marketing | Hero, features, testimonials, CTA |
| Order History | `07-order-history.html` | User account | Order list, status badges |
| Order Detail | `08-order-detail.html` | User account | Order info, timeline, reorder |
| Admin Orders | `09-admin-orders.html` | OM-01 | Stats cards, order table, filters |
| Admin Detail | `10-admin-order-detail.html` | OM-02, OM-03, OM-04 | Status update, download, tracking |
| Login | `11-login.html` | Authentication | Login/signup forms |

---

## 9. API Contract Summary

### Image Operations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/images/upload` | Upload image to storage | Optional |
| POST | `/api/images/transform` | Apply AI style transformation | Optional |
| GET | `/api/styles` | List available AI styles | Public |

### Order Operations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create new order | Required |
| GET | `/api/orders/:id` | Get order details | Required |
| GET | `/api/orders/user/:userId` | Get user's order history | Required |
| PATCH | `/api/orders/:id/status` | Update order status | Admin |
| GET | `/api/orders/:id/download` | Download print file | Admin |

### Payment Operations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-intent` | Create Stripe payment intent | Required |
| POST | `/api/payments/webhook` | Handle Stripe webhooks | Stripe signature |

### Product Operations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products/sizes` | Get available sizes with prices | Public |
| GET | `/api/products/papers` | Get paper options with prices | Public |
| GET | `/api/products/frames` | Get frame options with prices | Public |
| GET | `/api/products/calculate-price` | Calculate total price | Public |

---

## 10. Data Models

### User

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique
  phone?: string;                // Israeli format
  name?: string;
  addresses: Address[];          // Saved addresses
  createdAt: Date;
  updatedAt: Date;
}
```

### Address

```typescript
interface Address {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  street: string;
  houseNumber: string;
  apartment?: string;
  floor?: string;
  entrance?: string;
  postalCode?: string;
  notes?: string;
  isDefault: boolean;
}
```

### Order

```typescript
interface Order {
  id: string;                    // FP-XXXXX format
  userId?: string;               // Optional (guest checkout)
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  isGift: boolean;
  giftMessage?: string;
  recipientAddress?: Address;    // If gift
  subtotal: number;
  shippingCost: number;
  discount?: number;
  discountCode?: string;
  total: number;
  paymentIntentId: string;       // Stripe
  trackingNumber?: string;
  trackingCarrier?: string;
  statusHistory: StatusChange[];
  createdAt: Date;
  updatedAt: Date;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface StatusChange {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}
```

### OrderItem

```typescript
interface OrderItem {
  id: string;
  originalImageUrl: string;
  transformedImageUrl: string;
  style: string;                 // AI style ID
  size: 'A5' | 'A4' | 'A3' | 'A2';
  paper: 'matte' | 'glossy' | 'canvas';
  frame: 'none' | 'black' | 'white' | 'oak';
  price: number;
}
```

### Image

```typescript
interface Image {
  id: string;
  userId?: string;
  originalUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  transformations: Transformation[];
  createdAt: Date;
}

interface Transformation {
  style: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;              // Cache expiry
}
```

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| AI Style | Artistic transformation applied to photos using machine learning |
| DPI | Dots Per Inch - print resolution (300 DPI standard for quality prints) |
| Fine Art Paper | Museum-quality matte paper for archival prints |
| HEIC | High Efficiency Image Format - Apple's photo format |
| sRGB | Standard color profile for web and print consistency |
| R2 | Cloudflare's object storage service |
| Replicate | AI model hosting platform |

---

## Appendix B: Hebrew Translations Reference

| English | Hebrew |
|---------|--------|
| Upload | העלאה |
| Style | סגנון |
| Customize | התאמה |
| Checkout | תשלום |
| Size | גודל |
| Paper | נייר |
| Frame | מסגרת |
| Gift | מתנה |
| Shipping | משלוח |
| Order | הזמנה |
| Continue | המשך |
| Back | חזרה |
| Processing | בהכנה |
| Shipped | נשלח |
| Delivered | נמסר |

---

**— End of Document —**

*Footprint User Stories v2.0*
*December 2024*
