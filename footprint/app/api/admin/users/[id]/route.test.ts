/**
 * Admin Single User API Tests - ADMIN-02
 *
 * Tests for GET /api/admin/users/[id] - Get single user with full details
 */

import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock Supabase
const mockSupabaseSelect = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseEq = vi.fn();

const mockSupabaseFrom = vi.fn(() => ({
  select: mockSupabaseSelect,
}));

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
    from: mockSupabaseFrom,
  })),
}));

// Mock rate limiter
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

// Sample test data
const mockAdminUser = {
  id: 'admin-user-id',
  email: 'admin@footprint.co.il',
  user_metadata: { role: 'admin' },
};

const mockRegularUser = {
  id: 'regular-user-id',
  email: 'user@example.com',
  user_metadata: { role: 'user' },
};

const mockUserProfile = {
  id: 'user-1',
  email: 'john@example.com',
  name: 'John Doe',
  phone: '054-1234567',
  avatar_url: 'https://example.com/avatar1.jpg',
  preferred_language: 'he',
  is_admin: false,
  status: 'active',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-20T10:00:00Z',
  order_count: 5,
  total_spent: 125000, // in agorot
  last_order_date: '2026-01-18T10:00:00Z',
  addresses: [
    {
      id: 'addr-1',
      name: 'Home',
      street: 'Herzl 1',
      city: 'Tel Aviv',
      postal_code: '12345',
      is_default: true,
    },
  ],
  orders: [
    {
      id: 'order-1',
      order_number: 'FP-2026-001',
      status: 'delivered',
      total: 23700,
      created_at: '2026-01-18T10:00:00Z',
    },
  ],
};

// Helper to create mock request
function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

// Setup chain mocks
function setupSupabaseChain(data: unknown | null, error: { message: string } | null = null) {
  mockSupabaseSelect.mockReturnValue({
    eq: mockSupabaseEq,
  });
  mockSupabaseEq.mockReturnValue({
    single: mockSupabaseSingle,
  });
  mockSupabaseSingle.mockResolvedValue({
    data,
    error,
  });
}

describe('GET /api/admin/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized - Please sign in');
    });

    it('should return 403 when user is not admin', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockRegularUser }, error: null });

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('should allow admin users to access', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      setupSupabaseChain(mockUserProfile);

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });

      expect(response.status).toBe(200);
    });
  });

  describe('Single User', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should return user with full profile details', async () => {
      setupSupabaseChain(mockUserProfile);

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('user-1');
      expect(data.email).toBe('john@example.com');
      expect(data.name).toBe('John Doe');
      expect(data.phone).toBe('054-1234567');
      expect(data.avatarUrl).toBe('https://example.com/avatar1.jpg');
      expect(data.preferredLanguage).toBe('he');
      expect(data.isAdmin).toBe(false);
    });

    it('should include orderCount, totalSpent, lastOrderDate', async () => {
      setupSupabaseChain(mockUserProfile);

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
      const data = await response.json();

      expect(data.orderCount).toBe(5);
      expect(data.totalSpent).toBe(1250); // Converted from agorot to ILS
      expect(data.lastOrderDate).toBe('2026-01-18T10:00:00Z');
    });

    it('should include addresses array', async () => {
      setupSupabaseChain(mockUserProfile);

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
      const data = await response.json();

      expect(data.addresses).toBeDefined();
      expect(data.addresses).toHaveLength(1);
      expect(data.addresses[0].street).toBe('Herzl 1');
      expect(data.addresses[0].isDefault).toBe(true);
    });

    it('should include orders array', async () => {
      setupSupabaseChain(mockUserProfile);

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
      const data = await response.json();

      expect(data.orders).toBeDefined();
      expect(data.orders).toHaveLength(1);
      expect(data.orders[0].orderNumber).toBe('FP-2026-001');
      expect(data.orders[0].total).toBe(237); // Converted from agorot
    });

    it('should return 404 for non-existent user', async () => {
      setupSupabaseChain(null, { message: 'Row not found' });

      const request = createRequest('/api/admin/users/non-existent');
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('משתמש לא נמצא');
    });

    it('should use camelCase in response', async () => {
      setupSupabaseChain(mockUserProfile);

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
      const data = await response.json();

      // Verify camelCase field names
      expect(data).toHaveProperty('avatarUrl');
      expect(data).toHaveProperty('preferredLanguage');
      expect(data).toHaveProperty('isAdmin');
      expect(data).toHaveProperty('orderCount');
      expect(data).toHaveProperty('totalSpent');
      expect(data).toHaveProperty('lastOrderDate');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');

      // Verify snake_case fields are NOT present
      expect(data).not.toHaveProperty('avatar_url');
      expect(data).not.toHaveProperty('preferred_language');
      expect(data).not.toHaveProperty('is_admin');
      expect(data).not.toHaveProperty('order_count');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      setupSupabaseChain(mockUserProfile);

      const request = createRequest('/api/admin/users/user-1');
      await GET(request, { params: Promise.resolve({ id: 'user-1' }) });

      expect(checkRateLimit).toHaveBeenCalledWith('general', request);
    });

    it('should return 429 when rate limited', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      const { NextResponse } = await import('next/server');
      vi.mocked(checkRateLimit).mockResolvedValueOnce(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });

      expect(response.status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should return 500 on database error', async () => {
      setupSupabaseChain(null, { message: 'Database connection failed' });

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch user');
    });

    it('should handle auth errors gracefully', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth failed' } });

      const request = createRequest('/api/admin/users/user-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });

      expect(response.status).toBe(401);
    });
  });
});
