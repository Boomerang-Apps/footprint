# Research: Supabase Backend Integration

**Date**: 2025-12-19
**Author**: CTO Agent
**Story**: All backend stories
**Gate**: 0 - Research

---

## Objective

Document the Supabase integration for Footprint. Supabase replaces the originally planned custom Uzerflow backend, providing authentication, database, and storage services.

---

## [CTO-DECISION] Architecture Change

**Original Plan**: Custom Uzerflow backend platform
**New Plan**: Direct Supabase integration (shared with Uzerflow project)

**Rationale**:
- Faster development (no custom backend needed)
- Shared infrastructure reduces costs
- Supabase provides auth, database, and storage out of the box
- Real-time subscriptions for order updates
- Row Level Security for data protection

---

## Supabase Project Details

| Setting | Value |
|---------|-------|
| Project Reference | gqupiqdvwzskjpybwkbq |
| Region | us-east-1 (N. Virginia) |
| Database | PostgreSQL 15 |
| Shared With | Uzerflow Platform |

---

## Database Schema for Footprint

### Tables to Create

```sql
-- Footprint Users (extends auth.users)
CREATE TABLE footprint_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(100),
  phone VARCHAR(20),
  preferred_language VARCHAR(5) DEFAULT 'he',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE footprint_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending',
  is_gift BOOLEAN DEFAULT FALSE,
  gift_message TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  subtotal DECIMAL(10,2),
  shipping DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  stripe_payment_intent_id VARCHAR(255),
  tracking_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE footprint_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES footprint_orders(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  transformed_image_url TEXT,
  style VARCHAR(50) NOT NULL,
  size VARCHAR(10) NOT NULL,
  paper VARCHAR(30) NOT NULL,
  frame VARCHAR(30) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Addresses
CREATE TABLE footprint_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  label VARCHAR(50),
  full_name VARCHAR(100),
  street VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'IL',
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount Codes
CREATE TABLE footprint_discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security

```sql
-- Users can only see their own data
ALTER TABLE footprint_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE footprint_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE footprint_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE footprint_addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users see own profile
CREATE POLICY "Users can view own profile"
  ON footprint_users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users see own orders
CREATE POLICY "Users can view own orders"
  ON footprint_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create orders
CREATE POLICY "Users can create orders"
  ON footprint_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users see own order items
CREATE POLICY "Users can view own order items"
  ON footprint_order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM footprint_orders WHERE user_id = auth.uid()
    )
  );
```

---

## Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

---

## API Abstraction (Updated)

The API abstraction layer now wraps Supabase:

```typescript
// lib/api/supabase-client.ts
import { createClient } from '@/lib/supabase/client';
import type { ApiClient } from './types';

export const supabaseApiClient: ApiClient = {
  auth: {
    async login(email, password) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data.user;
    },

    async logout() {
      const supabase = createClient();
      await supabase.auth.signOut();
    },

    async getSession() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      return data.session?.user ?? null;
    },
  },

  orders: {
    async create(orderData) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('footprint_orders')
        .insert(orderData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async get(id) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('footprint_orders')
        .select('*, footprint_order_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async list(userId) {
      const supabase = createClient();
      let query = supabase
        .from('footprint_orders')
        .select('*, footprint_order_items(*)')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  },

  // ... other methods
};
```

---

## Real-Time Order Updates

```typescript
// hooks/useOrderUpdates.ts
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useOrderUpdates(orderId: string, onUpdate: (order: Order) => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'footprint_orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          onUpdate(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onUpdate]);
}
```

---

## Security Considerations

- [x] **RLS Enabled**: All tables have Row Level Security
- [x] **Service Role Key**: Server-side only, never exposed
- [x] **Anon Key**: Safe for client-side (limited by RLS)
- [x] **Auth via Supabase**: Secure session management
- [x] **Table Prefixing**: All tables prefixed with `footprint_` for isolation

---

## Migration Strategy

1. **Phase 1**: Create Footprint tables in shared Supabase
2. **Phase 2**: Implement Supabase client wrapper
3. **Phase 3**: Update API abstraction to use Supabase
4. **Phase 4**: Remove mock API dependency for auth/orders

---

## Rollback Plan

If Supabase integration issues arise:

1. **Immediate**: Fall back to mock API
2. **Short-term**: Spin up dedicated Supabase project
3. **Long-term**: Consider PlanetScale or custom backend

---

## CTO Approval

**Status**: APPROVED

**CTO Notes**:
- Use shared Supabase instance with Uzerflow
- Prefix all tables with `footprint_` for isolation
- Enable RLS on all tables
- Never expose service role key to client
- Generate TypeScript types with `supabase gen types`
- Use real-time subscriptions for order status updates

**Approved by**: CTO Agent
**Date**: 2025-12-19

---

*Research completed by CTO Agent - 2025-12-19*
