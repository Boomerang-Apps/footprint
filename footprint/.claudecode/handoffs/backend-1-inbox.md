# backend-1 Agent Inbox

---

## 📬 GF-05: Scheduled Delivery Date

**From**: PM Agent
**Date**: 2025-12-26
**Priority**: Medium
**Story Points**: 3
**Sprint**: 5 (Parallel Assignment)

### Story Description

Add scheduled delivery date functionality to the gift experience. Allow users to select a future delivery date for gift orders.

### Your Domain (Backend-1)

As state/store owner, you implement:
1. Add `scheduledDeliveryDate` to orderStore
2. Delivery date validation logic
3. Date calculation utilities (min/max delivery windows)

**Frontend-B will implement**: The date picker UI component (separate story if needed)

### Implementation Requirements

1. **Update orderStore.ts**
   ```typescript
   interface OrderState {
     // ... existing fields ...

     // Gift delivery scheduling
     scheduledDeliveryDate: Date | null;
     isScheduledDelivery: boolean;
   }

   interface OrderActions {
     // ... existing actions ...

     setScheduledDeliveryDate: (date: Date | null) => void;
     setIsScheduledDelivery: (value: boolean) => void;
     getDeliveryDateRange: () => { min: Date; max: Date };
     isValidDeliveryDate: (date: Date) => boolean;
   }
   ```

2. **Delivery Date Validation**
   ```typescript
   // lib/delivery/scheduling.ts

   export function getMinDeliveryDate(): Date {
     // Minimum: 5 business days from now
     const date = new Date();
     let businessDays = 0;
     while (businessDays < 5) {
       date.setDate(date.getDate() + 1);
       if (!isWeekend(date) && !isIsraeliHoliday(date)) {
         businessDays++;
       }
     }
     return date;
   }

   export function getMaxDeliveryDate(): Date {
     // Maximum: 30 days from now
     const date = new Date();
     date.setDate(date.getDate() + 30);
     return date;
   }

   export function isValidDeliveryDate(date: Date): boolean {
     const min = getMinDeliveryDate();
     const max = getMaxDeliveryDate();
     return date >= min && date <= max && !isWeekend(date);
   }
   ```

3. **Israeli Holidays (basic)**
   ```typescript
   // For MVP, just handle weekends (Friday-Saturday in Israel)
   export function isWeekend(date: Date): boolean {
     const day = date.getDay();
     return day === 5 || day === 6; // Friday or Saturday
   }
   ```

### Files to Create/Modify

1. **`stores/orderStore.ts`** (modify)
   - Add scheduledDeliveryDate field
   - Add isScheduledDelivery toggle
   - Add setter actions

2. **`lib/delivery/scheduling.ts`** (new)
   - getMinDeliveryDate()
   - getMaxDeliveryDate()
   - isValidDeliveryDate()
   - isWeekend()

3. **`lib/delivery/scheduling.test.ts`** (new)
   - Test all date validation functions

### Acceptance Criteria

- [ ] scheduledDeliveryDate added to orderStore
- [ ] isScheduledDelivery toggle in store
- [ ] getMinDeliveryDate returns 5+ business days ahead
- [ ] getMaxDeliveryDate returns 30 days ahead
- [ ] isValidDeliveryDate rejects weekends
- [ ] isValidDeliveryDate rejects dates outside range
- [ ] Store persists scheduled date (if persistence enabled)
- [ ] Tests cover all date scenarios
- [ ] 80%+ test coverage

### Test Scenarios

1. Min date: Returns date 5+ business days from today
2. Max date: Returns date 30 days from today
3. Weekend rejection: Friday/Saturday dates return false
4. Valid date: Weekday within range returns true
5. Past date: Yesterday returns false
6. Future date: 60 days ahead returns false

### Notes

- Israeli weekends are Friday-Saturday (not Saturday-Sunday)
- Full Israeli holiday calendar can be added later (post-MVP)
- Date picker UI will be Frontend-B's responsibility
- This state will be sent to order creation API (INT-04)

### Reference Files

- Order store: `stores/orderStore.ts`
- Similar validation: `lib/pricing/discounts.ts`

---

**Ready for implementation!** Ping PM when complete for QA handoff.

---

*Last checked: 2025-12-26*
