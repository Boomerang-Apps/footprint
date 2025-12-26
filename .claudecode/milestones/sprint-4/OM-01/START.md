# OM-01: Admin Order Dashboard - START

**Story**: OM-01
**Agent**: Frontend-B
**Sprint**: 4
**Points**: 3
**Branch**: feature/om-01-admin-dashboard
**Started**: 2025-12-25
**Linear**: UZF-1845

## Objective

Implement Admin Order Dashboard matching mockup `09-admin-orders.html`:
- Order list with thumbnails
- Filter by status (pending, processing, shipped, delivered)
- Search by order number, customer, phone
- Stats summary cards
- Admin navigation

## Mockup Analysis

### Key UI Elements
1. **Admin Header**: Dark background (#18181b), logo with gradient icon, "Admin" badge, user avatar
2. **Page Header**: Title "הזמנות" + refresh & filter action buttons
3. **Stats Grid** (2x2 mobile, 4 col desktop):
   - היום (Today's orders) - purple icon
   - ממתינות (Pending) - yellow icon
   - בדרך (In transit) - blue icon
   - הכנסות היום (Today's revenue) - green icon
4. **Search Bar**: Search placeholder "חיפוש הזמנה, לקוח או טלפון..."
5. **Status Filter Tabs**: Horizontal scrollable with counts
   - הכל (All): 25
   - ממתינות (Pending): 5
   - בהכנה (Processing): 4
   - נשלחו (Shipped): 8
   - הגיעו (Delivered): 8
6. **Orders List**: Cards with:
   - Thumbnail (50x50)
   - Order ID (FP-2024-XXXX)
   - Customer name
   - Time ago
   - Status badge (color-coded)
   - Price
   - Arrow action button
7. **Bottom Nav**: Fixed with 3 items (הזמנות, דוחות, הגדרות)

### Status Badge Colors
- pending (ממתין): yellow/amber
- processing (בהכנה): blue
- shipped (נשלח): purple
- delivered (הגיע): green

## Technical Approach

- TDD: Write tests first
- Use demo data from `data/demo/orders.ts`
- RTL layout with dir="rtl"
- Mobile-first responsive design (2 col → 4 col stats)
- Tailwind CSS styling matching mockup

## Files to Create/Modify

| File | Action |
|------|--------|
| `app/admin/page.tsx` | Create admin dashboard |
| `app/admin/page.test.tsx` | Create TDD tests |
| `app/admin/layout.tsx` | Create admin layout with header/nav |

## Acceptance Criteria

- [ ] Matches mockup visually
- [ ] Stats grid with 4 cards
- [ ] Search bar functional
- [ ] Status filter tabs with counts
- [ ] Orders list with all details
- [ ] Status badges color-coded
- [ ] Bottom admin navigation
- [ ] Responsive (mobile → desktop)
- [ ] RTL layout correct
- [ ] Tests written (TDD)
- [ ] Coverage: 80%+ minimum

## Dependencies

- UI-06: Demo Data (provides sample orders) ✅
