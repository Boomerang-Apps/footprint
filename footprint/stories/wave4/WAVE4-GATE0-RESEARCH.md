# Wave 4: Customer Account - Gate 0 Research Report

**Research Date:** 2026-01-30
**Status:** APPROVED - Ready for Implementation
**Researcher:** Claude Opus 4.5

---

## Executive Summary

Wave 4 focuses on Customer Account features. Gate 0 research confirms the codebase has solid foundations:

- **Database schema exists** for profiles and addresses tables
- **Type definitions exist** for User, SavedAddress, DbProfile, DbAddress
- **ShippingAddressForm component** provides validation patterns to reuse
- **React Query patterns** established via useOrderHistory hook
- **UI components available** (Input, Button, Card, Select, Badge)

**Recommendation:** PROCEED with implementation following existing patterns.

---

## Stories Overview

| Story ID | Title | Domain | Points | Dependencies |
|----------|-------|--------|--------|--------------|
| BE-04 | User Profile API | Backend | 3 | None |
| BE-05 | Addresses CRUD API | Backend | 5 | None |
| UI-05A | User Profile Settings Page | Frontend | 3 | BE-04 |
| UI-05B | Saved Addresses Management | Frontend | 5 | BE-05 |

---

## Existing Code Analysis

### Database Schema (COMPLETE)

**profiles table** (`supabase/migrations/001_initial_schema.sql`):
- id (UUID, FK to auth.users)
- email, name, phone, avatar_url
- preferred_language ('he' | 'en')
- is_admin (boolean)
- created_at, updated_at

**addresses table**:
- id (UUID)
- user_id (UUID, FK to profiles, nullable for guest)
- name, street, apartment, city, postal_code, country, phone
- is_default (boolean)
- created_at, updated_at

### Types (COMPLETE)

**`types/user.ts`:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  defaultAddress?: SavedAddress;
  preferredLanguage: 'he' | 'en';
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SavedAddress {
  id?: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}
```

### Reusable Components

| Component | Location | Reuse For |
|-----------|----------|-----------|
| ShippingAddressForm | components/checkout/ | Address validation patterns |
| OrderHistoryList | components/account/ | Page layout pattern |
| OrderCard | components/account/ | Card display pattern |
| Input, Button, Card | components/ui/ | Form building |

### API Patterns

**Authentication:**
```typescript
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

**Response Format:**
```typescript
// Success
return NextResponse.json({ data: result });

// Error
return NextResponse.json({ error: 'Message' }, { status: 4xx });
```

### Hooks Pattern (React Query)

```typescript
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.users.get('me'),
    staleTime: 10 * 60 * 1000,
  });
}
```

---

## Implementation Requirements

### BE-04: User Profile API

**Endpoints to Create:**
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile (name, phone, language)
- `POST /api/profile/avatar` - Upload avatar image

**Files to Create:**
- `app/api/profile/route.ts`
- `app/api/profile/route.test.ts`
- `app/api/profile/avatar/route.ts`
- `app/api/profile/avatar/route.test.ts`

### BE-05: Addresses CRUD API

**Endpoints to Create:**
- `GET /api/addresses` - List user addresses
- `POST /api/addresses` - Create new address
- `GET /api/addresses/[id]` - Get single address
- `PUT /api/addresses/[id]` - Update address
- `DELETE /api/addresses/[id]` - Delete address
- `PATCH /api/addresses/[id]/default` - Set as default

**Files to Create:**
- `app/api/addresses/route.ts`
- `app/api/addresses/route.test.ts`
- `app/api/addresses/[id]/route.ts`
- `app/api/addresses/[id]/route.test.ts`
- `app/api/addresses/[id]/default/route.ts`
- `app/api/addresses/[id]/default/route.test.ts`

### UI-05A: User Profile Settings Page

**Components to Create:**
- `components/account/ProfileForm.tsx` - Edit profile form
- `app/(app)/account/profile/page.tsx` - Profile page

**Hooks to Create:**
- `hooks/useProfile.ts` - Fetch profile
- `hooks/useUpdateProfile.ts` - Update mutation

### UI-05B: Saved Addresses Management

**Components to Create:**
- `components/account/AddressList.tsx` - List of addresses
- `components/account/AddressCard.tsx` - Single address card
- `components/account/AddressForm.tsx` - Reusable form (extract from ShippingAddressForm)
- `app/(app)/account/addresses/page.tsx` - Addresses page

**Hooks to Create:**
- `hooks/useAddresses.ts` - Fetch addresses list
- `hooks/useCreateAddress.ts` - Create mutation
- `hooks/useUpdateAddress.ts` - Update mutation
- `hooks/useDeleteAddress.ts` - Delete mutation

---

## Validation Schemas (Zod)

**Create:** `lib/validation/profile.ts`
```typescript
export const profileSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  phone: z.string().regex(/^0\d{1,2}[-]?\d{7}$/, 'מספר טלפון לא תקין').optional(),
  preferredLanguage: z.enum(['he', 'en']),
});
```

**Create:** `lib/validation/address.ts`
```typescript
export const addressSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  street: z.string().min(5, 'כתובת חייבת להכיל לפחות 5 תווים'),
  city: z.string().min(2, 'עיר חייבת להכיל לפחות 2 תווים'),
  postalCode: z.string().regex(/^\d{7}$/, 'מיקוד חייב להכיל 7 ספרות'),
  country: z.string().default('Israel'),
  phone: z.string().regex(/^0\d{1,2}[-]?\d{7}$/).optional(),
  isDefault: z.boolean().optional(),
});
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Address validation conflicts with checkout | Low | Medium | Extract shared validation schema |
| Avatar upload size limits | Medium | Low | Implement 2MB limit, resize on client |
| Default address race conditions | Low | Medium | Use database transaction |

---

## Test Coverage Requirements

- All API endpoints: 80%+ coverage
- Components: 80%+ coverage
- Hooks: 80%+ coverage
- Include error handling tests
- Include validation tests
- Include RTL/accessibility tests

---

## Approval

**Gate 0 Status:** APPROVED
**Next Step:** Create Schema V4 story JSON files, then proceed to Gate 1 (branching)
