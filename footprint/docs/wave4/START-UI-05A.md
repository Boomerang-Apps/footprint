# START.md - UI-05A: User Profile Settings Page

**Story ID:** UI-05A
**Wave:** 4
**Domain:** Frontend (Profile)
**Agent:** FE-Dev
**Branch:** `feature/UI-05A-user-profile-settings`
**Status:** Ready for Implementation
**Depends On:** BE-04 (User Profile API)

---

## Objective

Create user profile settings page with form to view and edit profile information including name, phone, avatar, and language preference.

---

## Implementation Plan

### Phase 1: Hooks (TDD First)

1. Create `hooks/useProfile.ts`
   ```typescript
   // React Query hook to fetch profile
   export function useProfile() {
     return useQuery({
       queryKey: ['profile'],
       queryFn: () => fetch('/api/profile').then(r => r.json()),
       staleTime: 10 * 60 * 1000, // 10 minutes
     });
   }
   ```

2. Create `hooks/useUpdateProfile.ts`
   ```typescript
   // React Query mutation to update profile
   export function useUpdateProfile() {
     return useMutation({
       mutationFn: (data) => fetch('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
       onSuccess: () => queryClient.invalidateQueries(['profile']),
     });
   }
   ```

3. Write tests first: `hooks/useProfile.test.ts`, `hooks/useUpdateProfile.test.ts`

### Phase 2: AvatarUpload Component

1. Create `components/account/AvatarUpload.tsx`
   - Display current avatar or placeholder
   - File picker trigger on click
   - Upload progress indicator
   - Preview after upload

2. Write tests: `components/account/AvatarUpload.test.tsx`

### Phase 3: ProfileForm Component

1. Create `components/account/ProfileForm.tsx`
   - Name input (editable, min 2 chars validation)
   - Email input (read-only/disabled)
   - Phone input (Israeli format validation)
   - Language select (Hebrew/English)
   - Save button with loading state
   - Success/error toasts

2. Write tests: `components/account/ProfileForm.test.tsx`
   - Loading state
   - Error state with retry
   - Validation errors
   - Successful submission

### Phase 4: Profile Page

1. Create `app/(app)/account/profile/page.tsx`
   - Back navigation to /account
   - ProfileForm component
   - RTL layout (dir="rtl")
   - Mobile-first responsive (max-w-[600px])

2. Integration tests

---

## Files to Create

| File | Purpose |
|------|---------|
| `hooks/useProfile.ts` | Fetch profile hook |
| `hooks/useProfile.test.ts` | Tests |
| `hooks/useUpdateProfile.ts` | Update mutation hook |
| `hooks/useUpdateProfile.test.ts` | Tests |
| `components/account/AvatarUpload.tsx` | Avatar upload component |
| `components/account/AvatarUpload.test.tsx` | Tests |
| `components/account/ProfileForm.tsx` | Profile form component |
| `components/account/ProfileForm.test.tsx` | Tests |
| `app/(app)/account/profile/page.tsx` | Profile page |

---

## Components to Reuse

| Component | Usage |
|-----------|-------|
| `components/ui/Input.tsx` | Form inputs |
| `components/ui/Button.tsx` | Save button |
| `components/ui/Card.tsx` | Form container |
| `components/ui/Select.tsx` | Language selector |

---

## Forbidden Files (Do Not Modify)

- `app/api/profile/route.ts`
- `lib/auth/*`

---

## UI/UX Requirements

### RTL Layout
```tsx
<div dir="rtl" className="...">
```

### Hebrew Labels
| Field | Hebrew |
|-------|--------|
| Name | שם מלא |
| Email | אימייל |
| Phone | טלפון |
| Language | שפה |
| Save | שמירה |
| Back | חזרה |

### Responsive
- Max width: 600px
- Mobile-first
- Centered on desktop

---

## Acceptance Criteria Checklist

- [ ] AC-001: Displays profile data on load
- [ ] AC-002: Loading spinner while fetching
- [ ] AC-003: Error state with retry button
- [ ] AC-004: Name validation (min 2 chars)
- [ ] AC-005: Phone validation (Israeli format)
- [ ] AC-006: Email is read-only
- [ ] AC-007: Language selector (he/en)
- [ ] AC-008: Avatar with upload button
- [ ] AC-009: Save button loading state
- [ ] AC-010: Success toast on update
- [ ] AC-011: Error toast on failure
- [ ] AC-012: RTL with Hebrew labels
- [ ] AC-013: Mobile-first responsive
- [ ] AC-014: Back navigation to /account

---

## Test Coverage Target

**Minimum:** 90%
**Estimated Tests:** 24

---

## Definition of Done

1. All tests pass
2. Coverage >= 90%
3. TypeScript clean
4. ESLint clean
5. All ACs verified
6. RTL verified
7. Responsive verified
8. Ready for QA review

---

*Generated: 2026-01-30*
*Gate 1: Planning Complete*
