# UI-05A: User Profile Settings Page

## Story Overview
- **Story ID**: UI-05A
- **Branch**: `feature/UI-05A-user-profile-settings`
- **Created**: 2026-01-30
- **Status**: In Progress

## Objective
Build a user profile settings page where users can view and edit their personal information (name, phone) and upload/change their avatar.

## Acceptance Criteria (14 total)
- AC-001: Profile page accessible at /account/profile
- AC-002: Displays current user profile with avatar, name, phone
- AC-003: Name field editable with 2-50 char validation
- AC-004: Phone field editable with Israeli format validation
- AC-005: Avatar upload supports JPEG/PNG up to 5MB
- AC-006: Avatar preview shows before save
- AC-007: Form validation shows Hebrew error messages
- AC-008: Save button disabled when form unchanged
- AC-009: Loading state during save
- AC-010: Success toast on save
- AC-011: Error handling with retry
- AC-012: RTL layout with Hebrew text
- AC-013: Responsive design
- AC-014: Keyboard accessible

## Technical Approach

### Files to Create
1. `app/(app)/account/profile/page.tsx` - Profile page (server component wrapper)
2. `components/account/ProfileForm.tsx` - Profile form component
3. `components/account/ProfileForm.test.tsx` - ProfileForm tests
4. `components/account/AvatarUpload.tsx` - Avatar upload component
5. `components/account/AvatarUpload.test.tsx` - AvatarUpload tests
6. `hooks/useProfile.ts` - Fetch profile hook
7. `hooks/useProfile.test.ts` - useProfile tests
8. `hooks/useUpdateProfile.ts` - Update profile mutation hook
9. `hooks/useUpdateProfile.test.ts` - useUpdateProfile tests

### Dependencies
- Existing: Input, Button, Select UI components
- Existing: BE-04 API endpoints (GET/PUT /api/profile, POST /api/profile/avatar)
- Existing: React Query setup

### Patterns to Follow
- Hook pattern: useOrderHistory.ts for React Query structure
- Component pattern: OrderHistoryList.tsx for layout, states, RTL
- Test pattern: vi.hoisted() for mocks, QueryClientProvider wrapper

## TDD Implementation Order
1. RED: Write useProfile hook tests
2. GREEN: Implement useProfile hook
3. RED: Write useUpdateProfile hook tests
4. GREEN: Implement useUpdateProfile hook
5. RED: Write AvatarUpload component tests
6. GREEN: Implement AvatarUpload component
7. RED: Write ProfileForm component tests
8. GREEN: Implement ProfileForm component
9. RED: Write profile page tests
10. GREEN: Implement profile page

## Estimated Tests: ~24
