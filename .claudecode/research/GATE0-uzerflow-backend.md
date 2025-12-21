# Research: Uzerflow Backend Integration

**Date**: 2025-12-19
**Author**: CTO Agent
**Story**: All backend stories
**Gate**: 0 - Research

---

## Objective

Document the Uzerflow backend integration strategy. Uzerflow is the SaaS backend platform providing authentication, order management, and data persistence for Footprint.

---

## Questions to Answer

1. What services does Uzerflow provide?
2. How do we integrate during development before Uzerflow is ready?
3. What is the API contract?
4. How do we handle authentication?
5. What is the migration path from mock to production?

---

## Research Findings

### Uzerflow Services

| Service | Description |
|---------|-------------|
| **Authentication** | OAuth2, JWT tokens, session management |
| **Users** | User profiles, preferences, addresses |
| **Orders** | Order creation, status, history |
| **Products** | Catalog, pricing, inventory |
| **Payments** | Payment processing coordination |
| **Admin** | Dashboard, analytics, reporting |

### Development Strategy

**[CTO-DECISION]**: Implement API abstraction layer to switch between mock (development) and Uzerflow (production).

```
Development: Mock API → Same interface → Same frontend code
Production:  Uzerflow API → Same interface → Same frontend code
```

---

## API Abstraction Layer

### Interface Contract

```typescript
// lib/api/types.ts
export interface ApiClient {
  auth: {
    login(email: string, password: string): Promise<User>;
    logout(): Promise<void>;
    getSession(): Promise<User | null>;
    register(data: RegisterInput): Promise<User>;
  };

  users: {
    get(id: string): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    getAddresses(userId: string): Promise<Address[]>;
    addAddress(userId: string, address: Address): Promise<Address>;
  };

  orders: {
    create(data: CreateOrderInput): Promise<Order>;
    get(id: string): Promise<Order>;
    list(userId?: string): Promise<Order[]>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
  };

  products: {
    getStyles(): Promise<Style[]>;
    getSizes(): Promise<Size[]>;
    getPapers(): Promise<Paper[]>;
    getFrames(): Promise<Frame[]>;
    calculatePrice(config: ProductConfig): Promise<PriceBreakdown>;
  };
}
```

### Client Implementation

```typescript
// lib/api/client.ts
import { uzerflowClient } from './uzerflow';
import { mockClient } from './mock';
import type { ApiClient } from './types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const api: ApiClient = USE_MOCK ? mockClient : uzerflowClient;
```

### Mock Client

```typescript
// lib/api/mock.ts
import type { ApiClient } from './types';

// Simulated database
const mockDb = {
  users: new Map<string, User>(),
  orders: new Map<string, Order>(),
  // ...
};

export const mockClient: ApiClient = {
  auth: {
    async login(email, password) {
      await delay(500); // Simulate network
      const user = findUserByEmail(email);
      if (!user || !verifyPassword(password, user.password)) {
        throw new Error('Invalid credentials');
      }
      return user;
    },
    // ... other methods
  },

  orders: {
    async create(data) {
      await delay(300);
      const order = {
        id: generateId(),
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      mockDb.orders.set(order.id, order);
      return order;
    },
    // ... other methods
  },

  // ... other services
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Uzerflow Client (Production)

```typescript
// lib/api/uzerflow.ts
import type { ApiClient } from './types';

const UZERFLOW_URL = process.env.UZERFLOW_API_URL;
const UZERFLOW_KEY = process.env.UZERFLOW_API_KEY;

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${UZERFLOW_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${UZERFLOW_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const uzerflowClient: ApiClient = {
  auth: {
    async login(email, password) {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    // ... other methods
  },

  orders: {
    async create(data) {
      return request('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    // ... other methods
  },

  // ... other services
};
```

---

## Authentication Flow

### JWT Token Management

```typescript
// lib/auth/session.ts
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createSession(user: User): Promise<string> {
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function getSession(): Promise<User | null> {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return api.users.get(payload.userId as string);
  } catch {
    return null;
  }
}
```

---

## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  preferredLanguage: 'en' | 'he';
  isAdmin: boolean;
  createdAt: string;
}
```

### Order

```typescript
interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  isGift: boolean;
  giftMessage?: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentIntentId?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}
```

### OrderItem

```typescript
interface OrderItem {
  id: string;
  orderId: string;
  originalImageUrl: string;
  transformedImageUrl: string;
  style: StyleType;
  size: 'A5' | 'A4' | 'A3' | 'A2';
  paper: 'matte' | 'glossy' | 'canvas';
  frame: 'none' | 'black' | 'white' | 'oak';
  price: number;
}
```

---

## Security Considerations

- [x] **API Key Protection**: Server-side only, never exposed to client
- [x] **JWT Tokens**: HttpOnly cookies, secure flag in production
- [x] **Session Validation**: Verify on every protected request
- [x] **CORS**: Restrict to allowed origins
- [x] **Rate Limiting**: Implement on sensitive endpoints
- [x] **Input Validation**: Validate all inputs with Zod

---

## Migration Path

### Phase 1: Development (Current)
- `NEXT_PUBLIC_USE_MOCK=true`
- Mock API with in-memory storage
- Realistic delays and error simulation

### Phase 2: Staging
- `NEXT_PUBLIC_USE_MOCK=false`
- `UZERFLOW_API_URL=https://staging.uzerflow.com`
- Test with Uzerflow staging environment

### Phase 3: Production
- `NEXT_PUBLIC_USE_MOCK=false`
- `UZERFLOW_API_URL=https://api.uzerflow.com`
- Production Uzerflow environment

---

## Rollback Plan

If Uzerflow becomes unavailable:

1. **Immediate**: Switch to mock API (`NEXT_PUBLIC_USE_MOCK=true`)
2. **Short-term**: Implement local database fallback (SQLite/PostgreSQL)
3. **Long-term**: Self-hosted backend if persistent issues

---

## CTO Approval

**Status**: APPROVED

**CTO Notes**:
- API abstraction layer is mandatory
- Mock API must match Uzerflow contract exactly
- JWT secrets must be different per environment
- Add comprehensive error handling
- Implement retry logic for transient failures
- Log all API errors for debugging

**Approved by**: CTO Agent
**Date**: 2025-12-19

---

*Research completed by CTO Agent - 2025-12-19*
