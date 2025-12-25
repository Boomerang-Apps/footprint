# PM Agent Execution Plan - Sprint 4 & Beyond

**Created**: 2025-12-24
**CTO Approved**: Yes
**Status**: Ready for Execution

---

```
+======================================================================+
|  SAFETY PROTOCOL ACTIVE                                              |
|  Workflow 2.0: CTO -> PM -> Agent -> QA -> PM                        |
|  Safety Gates: 0-Research -> 1-Plan -> 2-Build -> 3-Test -> 4-Review |
|  TDD: Tests First | 80%+ Coverage Required                           |
|  Agent: PM | Sprint: 4 | Focus: UI Implementation                    |
+======================================================================+
```

---

## 1. Current State Summary

### Completed Sprints
| Sprint | Focus | Stories | Status |
|--------|-------|---------|--------|
| 0 | Infrastructure | 7/7 | ✅ COMPLETE |
| 1 | Photo Upload | 4/4 | ✅ COMPLETE |
| 2 | AI & Customization | 8/8 | ✅ COMPLETE |
| 3 | Checkout & Gifting | 6/6 | ✅ COMPLETE |

### Active Sprint
| Sprint | Focus | Stories | Points | Status |
|--------|-------|---------|--------|--------|
| 4 | UI Implementation | 6 | 18 | 🔵 ACTIVE |

### Stories Done (Recent)
- ✅ CO-01: Shipping Address Form (merged)
- ✅ CO-02: PayPlus Payment (merged)
- ✅ CO-04: Order Confirmation (merged)
- ✅ GF-01, GF-02, GF-03: Gift Features (merged)

---

## 2. Sprint 4 Stories - Execution Order

### Phase 1: Foundation (FIRST)

#### UI-06: Demo Data & Mock Images
| Field | Value |
|-------|-------|
| **Story ID** | UI-06 |
| **Points** | 2 |
| **Agent** | Frontend-B |
| **Priority** | P0 - START FIRST |
| **Dependencies** | None |
| **Mockup** | N/A (data layer) |

**Deliverables**:
```
footprint/data/demo/
├── orders.ts        # 3+ sample orders with different statuses
├── products.ts      # Size/paper/frame pricing (ILS)
├── styles.ts        # 8 AI styles with preview image URLs
├── images.ts        # Mock image URLs for testing
└── index.ts         # Export all demo data
```

**Acceptance Criteria**:
- [ ] Demo data matches `types/database.ts` interfaces
- [ ] At least 3 sample orders (pending, processing, delivered)
- [ ] 8 style previews with before/after mock images
- [ ] Price data in ILS (₪) matching product_prices table
- [ ] Tests: 80%+ coverage

---

### Phase 2: Order Flow Pages (Sequential)

#### UI-01: Upload Page UI
| Field | Value |
|-------|-------|
| **Story ID** | UI-01 |
| **Points** | 3 |
| **Agent** | Frontend-B |
| **Dependencies** | UI-06 |
| **Mockup** | `design_mockups/01-upload.html` |
| **Route** | `/create` |

**Key Elements**:
- Hebrew headline: "העלה תמונה והפוך אותה ליצירת אמנות"
- Large drag-drop zone with dashed border
- Camera/gallery button for mobile
- File type hints (JPG, PNG, HEIC - 20MB max)
- Upload progress indicator
- Error states for invalid files

**Acceptance Criteria**:
- [ ] Matches mockup visually
- [ ] RTL layout correct
- [ ] Mobile responsive (375px+)
- [ ] Tests: 80%+ coverage

---

#### UI-02: Style Selection UI
| Field | Value |
|-------|-------|
| **Story ID** | UI-02 |
| **Points** | 3 |
| **Agent** | Frontend-B |
| **Dependencies** | UI-01 |
| **Mockup** | `design_mockups/02-style-selection.html` |
| **Route** | `/create/style` |

**Key Elements**:
- 2x4 grid of 8 style options
- Hebrew labels: פופ ארט, צבעי מים, קווי מתאר, ציור שמן, רומנטי, קומיקס, וינטג', מקורי
- Selected state with purple border
- Before/after preview toggle
- Loading skeleton during preview generation

**Acceptance Criteria**:
- [ ] 8 styles displayed in grid
- [ ] Selection state visible
- [ ] Preview toggle functional
- [ ] Tests: 80%+ coverage

---

#### UI-03: Customize Page UI
| Field | Value |
|-------|-------|
| **Story ID** | UI-03 |
| **Points** | 3 |
| **Agent** | Frontend-B |
| **Dependencies** | UI-02 |
| **Mockup** | `design_mockups/03-customize.html` |
| **Route** | `/create/customize` |

**Key Elements**:
- Large preview image (left/top on mobile)
- Size selector: A5, A4, A3, A2
- Paper selector: מאט (Matte), מבריק (Glossy), קנבס (Canvas)
- Frame selector: ללא, שחור, לבן, אלון
- Live price breakdown in ILS

**Price Display Example**:
```
גודל: A4           ₪149
נייר: מאט          ₪0
מסגרת: שחורה       ₪60
───────────────────
סה"כ:              ₪209
```

**Acceptance Criteria**:
- [ ] All selectors functional
- [ ] Price updates live
- [ ] Matches mockup layout
- [ ] Tests: 80%+ coverage

---

#### UI-04: Checkout Page UI
| Field | Value |
|-------|-------|
| **Story ID** | UI-04 |
| **Points** | 5 |
| **Agent** | Frontend-B |
| **Dependencies** | UI-03 |
| **Mockup** | `design_mockups/04-checkout.html` |
| **Route** | `/create/checkout` |

**Key Elements**:
- Order summary sidebar
- Gift toggle with message field (150 char)
- Shipping address form (Hebrew fields)
- Payment section placeholder
- Discount code input
- Terms checkbox
- "השלם הזמנה" CTA button

**Form Fields**:
- שם מלא (Full name) - required
- טלפון (Phone) - required
- רחוב ומספר (Street) - required
- דירה (Apartment) - optional
- עיר (City) - required
- מיקוד (Postal code) - optional

**Acceptance Criteria**:
- [ ] Form validation works
- [ ] Gift toggle reveals message field
- [ ] Order summary displays correctly
- [ ] Tests: 80%+ coverage

---

#### UI-05: Confirmation Page UI
| Field | Value |
|-------|-------|
| **Story ID** | UI-05 |
| **Points** | 2 |
| **Agent** | Frontend-B |
| **Dependencies** | UI-04 |
| **Mockup** | `design_mockups/05-confirmation.html` |
| **Route** | `/create/complete` |

**Key Elements**:
- Success checkmark animation
- Order number: FP-2024-XXXX format
- Order timeline tracker (4 states)
- Product thumbnail
- Estimated delivery date
- WhatsApp share button
- "צור הזמנה נוספת" CTA

**Timeline States**:
1. ✓ הזמנה התקבלה (Order received) - active
2. ○ בהדפסה (Printing)
3. ○ נשלח (Shipped)
4. ○ נמסר (Delivered)

**Acceptance Criteria**:
- [ ] Timeline displays correctly
- [ ] WhatsApp share functional
- [ ] Order number shown
- [ ] Tests: 80%+ coverage

---

## 3. PM Handoff Templates

### Assigning Story to Frontend-B

Write to: `.claudecode/handoffs/frontend-b-inbox.md`

```markdown
## [DATE] - PM: [STORY-ID] Assignment

**Story**: [STORY-ID]
**Priority**: P0
**Type**: Sprint 4 - UI Implementation

### Assignment
You are assigned [STORY-ID]: [Title]

**Points**: X
**Mockup**: `design_mockups/XX-name.html`
**Route**: `/create/[path]`

### Requirements
1. Match mockup design exactly
2. Hebrew RTL support
3. Mobile responsive (375px+)
4. Use demo data from `data/demo/`
5. TDD: Write tests first
6. Coverage: 80%+ minimum

### Acceptance Criteria
- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]

### Gate 1 Checklist (Before Coding)
- [ ] Create branch: `git checkout -b feature/[STORY-ID]-description`
- [ ] Create START.md: `.claudecode/milestones/sprint-4/[STORY-ID]/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag [STORY-ID]-start`

### On Completion
Write handoff to: `.claudecode/handoffs/qa-inbox.md`

---
```

### Routing to QA

When Frontend-B completes, route to QA:

Write to: `.claudecode/handoffs/qa-inbox.md`

```markdown
## [DATE] - PM: [STORY-ID] Ready for QA

**Story**: [STORY-ID]
**Priority**: P0
**Type**: Gate 3 Validation

### Context
Frontend-B has completed [STORY-ID]: [Title]

**Branch**: `feature/[STORY-ID]-description`
**Reported Coverage**: XX%

### Validation Required
1. Run tests: `npm test -- --coverage`
2. Check types: `npm run type-check`
3. Check lint: `npm run lint`
4. Visual review against mockup
5. RTL verification
6. Mobile responsive check

### Acceptance Criteria to Verify
- [ ] [Criteria 1]
- [ ] [Criteria 2]

### On Approval
Write to: `.claudecode/handoffs/pm-inbox.md` with APPROVED status

### On Block
Write to: `.claudecode/handoffs/frontend-b-inbox.md` with issues

---
```

---

## 4. PM Daily Checklist

### Morning
- [ ] Check PM inbox for overnight messages
- [ ] Review dev-dashboard for status updates
- [ ] Identify any blocked stories

### Per Story Workflow
1. **Assign**: Write handoff to agent inbox
2. **Track**: Update dev-progress.ts status to `in-progress`
3. **Route**: When complete, send to QA
4. **Merge**: After QA approval, merge to main
5. **Update**: Set status to `done` in dev-progress.ts
6. **Next**: Assign next story in sequence

### End of Day
- [ ] Update dev-progress.ts with current statuses
- [ ] Clear completed messages from inboxes
- [ ] Note any blockers for next day

---

## 5. Immediate Actions (Start Here)

### Action 1: Acknowledge Sprint 4 Kickoff
Mark CTO message as acknowledged in PM inbox.

### Action 2: Create UI-06 Handoff
Write to `.claudecode/handoffs/frontend-b-inbox.md`:

```markdown
## 2025-12-24 - PM: UI-06 Assignment - Demo Data Foundation

**Story**: UI-06
**Priority**: P0 - START FIRST
**Type**: Sprint 4 - UI Implementation

### Assignment
You are assigned UI-06: Demo Data & Mock Images

**Points**: 2
**Mockup**: N/A (data layer)
**Route**: N/A (data files)

### Requirements
Create mock data foundation for UI testing:

**Files to Create**:
```
footprint/data/demo/
├── orders.ts        # 3+ sample orders
├── products.ts      # Size/paper/frame pricing
├── styles.ts        # 8 AI styles with previews
├── images.ts        # Mock image URLs
└── index.ts         # Export all
```

### Acceptance Criteria
- [ ] Demo data matches `types/database.ts` interfaces
- [ ] At least 3 sample orders (pending, processing, delivered)
- [ ] 8 style previews with before/after mock images
- [ ] Price data in ILS (₪)
- [ ] Tests: 80%+ coverage

### Gate 1 Checklist
- [ ] Create branch: `git checkout -b feature/UI-06-demo-data`
- [ ] Create START.md: `.claudecode/milestones/sprint-4/UI-06/START.md`
- [ ] Create ROLLBACK-PLAN.md
- [ ] Create tag: `git tag UI-06-start`

### On Completion
Write handoff to: `.claudecode/handoffs/qa-inbox.md`

---
```

### Action 3: Update dev-progress.ts
Change UI-06 status from `backlog` to `in-progress`.

---

## 6. Sprint 4 Timeline

| Day | Stories | Actions |
|-----|---------|---------|
| 1 | UI-06 | Assign, monitor, route to QA |
| 2 | UI-01, UI-02 | Assign after UI-06 done |
| 3 | UI-03, UI-04 | Sequential assignment |
| 4 | UI-05 | Final page, sprint wrap-up |

---

## 7. Post-Sprint 4 Backlog

After Sprint 4, the following stories are ready:

### Sprint 5 Candidates (Admin & Polish)
| Story | Title | Agent | Points |
|-------|-------|-------|--------|
| OM-01 | Admin Order Dashboard | Frontend-B | 3 |
| OM-02 | Update Order Status | Backend-2 | 2 |
| OM-03 | Download Print-Ready Files | Backend-2 | 2 |
| OM-04 | Add Tracking Numbers | Backend-2 | 2 |
| CO-06 | PayPlus Israeli Payment | Backend-2 | 5 |
| CO-03 | Apple Pay / Google Pay | Backend-2 | 3 |
| CO-05 | Apply Discount Codes | Backend-1 | 2 |

### Sprint 6 Candidates (User Accounts)
| Story | Title | Agent | Points |
|-------|-------|-------|--------|
| UA-01 | Order History Page | Frontend-B | 3 |
| UA-02 | Order Detail Page | Frontend-B | 3 |
| AUTH-01 | User Login Page | Frontend-A | 3 |
| AUTH-02 | Guest Checkout Option | Frontend-B | 2 |

---

## 8. Escalation Paths

| Issue | Escalate To | Via |
|-------|-------------|-----|
| Architecture questions | CTO | cto-inbox.md |
| API integration blockers | Backend-2 | backend-2-inbox.md |
| UI primitive needs | Frontend-A | frontend-a-inbox.md |
| Test failures | QA | qa-inbox.md |
| Store/auth issues | Backend-1 | backend-1-inbox.md |

---

## 9. Key Files Reference

| File | Purpose |
|------|---------|
| `.claudecode/milestones/SPRINT-4-UI-PLAN.md` | Detailed sprint plan |
| `footprint/data/dashboard/dev-progress.ts` | Story statuses (update this!) |
| `design_mockups/01-05*.html` | UI mockups |
| `types/database.ts` | Database types for demo data |
| `stores/orderStore.ts` | Order state management |

---

## 10. Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Sprint 4 Stories | 6/6 | 0/6 |
| Test Coverage | >= 80% | - |
| TypeScript Errors | 0 | - |
| Lint Errors | 0 | - |
| Visual Match | 100% | - |

---

**PM Agent: Execute this plan following Workflow 2.0. Start with Action 1-3 immediately.**

---

*Plan created by CTO Agent - 2025-12-24*
