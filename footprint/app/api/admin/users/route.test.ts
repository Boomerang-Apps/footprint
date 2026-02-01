/**
 * Admin Users List API Tests - ADMIN-02
 *
 * Tests for GET /api/admin/users - List all users with search, filters, pagination
 */

import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock Supabase
const mockSupabaseSelect = vi.fn();
const mockSupabaseOrder = vi.fn();
const mockSupabaseRange = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseGte = vi.fn();
const mockSupabaseLte = vi.fn();
const mockSupabaseIlike = vi.fn();
const mockSupabaseOr = vi.fn();

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

const mockUsers = [
  {
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
  },
  {
    id: 'user-2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    phone: '054-7654321',
    avatar_url: null,
    preferred_language: 'en',
    is_admin: true,
    status: 'active',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-25T10:00:00Z',
    order_count: 12,
    total_spent: 350000,
    last_order_date: '2026-01-25T10:00:00Z',
  },
];

// Helper to create mock request
function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

// Setup chain mocks
function setupSupabaseChain(data: unknown[], count: number = data.length) {
  mockSupabaseSelect.mockReturnValue({
    order: mockSupabaseOrder,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    or: mockSupabaseOr,
  });
  mockSupabaseOrder.mockReturnValue({
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    or: mockSupabaseOr,
  });
  mockSupabaseRange.mockResolvedValue({
    data,
    error: null,
    count,
  });
  mockSupabaseEq.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    or: mockSupabaseOr,
  });
  mockSupabaseGte.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    or: mockSupabaseOr,
  });
  mockSupabaseLte.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    or: mockSupabaseOr,
  });
  mockSupabaseIlike.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    or: mockSupabaseOr,
  });
  mockSupabaseOr.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    or: mockSupabaseOr,
  });
}

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized - Please sign in');
    });

    it('should return 403 when user is not admin', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockRegularUser }, error: null });

      const request = createRequest('/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('should allow admin users to access', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      setupSupabaseChain(mockUsers);

      const request = createRequest('/api/admin/users');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('List Users', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should return users with correct structure', async () => {
      setupSupabaseChain(mockUsers, 2);

      const request = createRequest('/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toBeDefined();
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should transform user data to camelCase', async () => {
      setupSupabaseChain([mockUsers[0]], 1);

      const request = createRequest('/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      const user = data.users[0];
      expect(user.id).toBe('user-1');
      expect(user.email).toBe('john@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.phone).toBe('054-1234567');
      expect(user.avatarUrl).toBe('https://example.com/avatar1.jpg');
      expect(user.preferredLanguage).toBe('he');
      expect(user.isAdmin).toBe(false);
      expect(user.orderCount).toBe(5);
      expect(user.totalSpent).toBe(1250); // Converted from agorot to ILS
      expect(user.lastOrderDate).toBe('2026-01-18T10:00:00Z');
      expect(user.createdAt).toBe('2026-01-15T10:00:00Z');
      expect(user.updatedAt).toBe('2026-01-20T10:00:00Z');
    });

    it('should include orderCount and lastOrderDate fields', async () => {
      setupSupabaseChain(mockUsers, 2);

      const request = createRequest('/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      data.users.forEach((user: { orderCount: number; lastOrderDate: string | null }) => {
        expect(user).toHaveProperty('orderCount');
        expect(user).toHaveProperty('lastOrderDate');
      });
    });

    it('should return empty array when no users match', async () => {
      setupSupabaseChain([], 0);

      const request = createRequest('/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('Search & Filter', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      setupSupabaseChain(mockUsers);
    });

    it('should search by email (case-insensitive)', async () => {
      const request = createRequest('/api/admin/users?search=john');
      await GET(request);

      expect(mockSupabaseOr).toHaveBeenCalledWith(
        expect.stringContaining('email.ilike.%john%')
      );
    });

    it('should search by name (case-insensitive)', async () => {
      const request = createRequest('/api/admin/users?search=doe');
      await GET(request);

      expect(mockSupabaseOr).toHaveBeenCalledWith(
        expect.stringContaining('name.ilike.%doe%')
      );
    });

    it('should filter by admin role', async () => {
      const request = createRequest('/api/admin/users?role=admin');
      await GET(request);

      expect(mockSupabaseEq).toHaveBeenCalledWith('is_admin', true);
    });

    it('should filter by user role', async () => {
      const request = createRequest('/api/admin/users?role=user');
      await GET(request);

      expect(mockSupabaseEq).toHaveBeenCalledWith('is_admin', false);
    });

    it('should filter by date range (registeredFrom)', async () => {
      const request = createRequest('/api/admin/users?registeredFrom=2026-01-01');
      await GET(request);

      expect(mockSupabaseGte).toHaveBeenCalledWith('created_at', '2026-01-01T00:00:00.000Z');
    });

    it('should filter by date range (registeredTo)', async () => {
      const request = createRequest('/api/admin/users?registeredTo=2026-01-31');
      await GET(request);

      expect(mockSupabaseLte).toHaveBeenCalledWith('created_at', '2026-01-31T23:59:59.999Z');
    });

    it('should combine search and role filters', async () => {
      const request = createRequest('/api/admin/users?search=john&role=admin');
      await GET(request);

      expect(mockSupabaseOr).toHaveBeenCalled();
      expect(mockSupabaseEq).toHaveBeenCalledWith('is_admin', true);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      setupSupabaseChain(mockUsers);
    });

    it('should sort by created_at descending by default', async () => {
      const request = createRequest('/api/admin/users');
      await GET(request);

      expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should sort by name', async () => {
      const request = createRequest('/api/admin/users?sortBy=name');
      await GET(request);

      expect(mockSupabaseOrder).toHaveBeenCalledWith('name', { ascending: false });
    });

    it('should sort by order_count', async () => {
      const request = createRequest('/api/admin/users?sortBy=order_count');
      await GET(request);

      expect(mockSupabaseOrder).toHaveBeenCalledWith('order_count', { ascending: false });
    });

    it('should support ascending sort order', async () => {
      const request = createRequest('/api/admin/users?sortBy=created_at&sortOrder=asc');
      await GET(request);

      expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: true });
    });

    it('should reject invalid sort fields', async () => {
      const request = createRequest('/api/admin/users?sortBy=password');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid sort field');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should use default pagination (page 1, limit 20)', async () => {
      setupSupabaseChain(mockUsers);

      const request = createRequest('/api/admin/users');
      await GET(request);

      expect(mockSupabaseRange).toHaveBeenCalledWith(0, 19);
    });

    it('should apply custom pagination parameters', async () => {
      setupSupabaseChain(mockUsers);

      const request = createRequest('/api/admin/users?page=2&limit=10');
      await GET(request);

      expect(mockSupabaseRange).toHaveBeenCalledWith(10, 19);
    });

    it('should cap limit at 100', async () => {
      setupSupabaseChain(mockUsers);

      const request = createRequest('/api/admin/users?limit=500');
      await GET(request);

      expect(mockSupabaseRange).toHaveBeenCalledWith(0, 99);
    });

    it('should calculate totalPages correctly', async () => {
      setupSupabaseChain(mockUsers, 50);

      const request = createRequest('/api/admin/users?page=2&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
      expect(data.total).toBe(50);
      expect(data.totalPages).toBe(5);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      setupSupabaseChain(mockUsers);

      const request = createRequest('/api/admin/users');
      await GET(request);

      expect(checkRateLimit).toHaveBeenCalledWith('general', request);
    });

    it('should return 429 when rate limited', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      const { NextResponse } = await import('next/server');
      vi.mocked(checkRateLimit).mockResolvedValueOnce(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );

      const request = createRequest('/api/admin/users');
      const response = await GET(request);

      expect(response.status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should return 500 on database error', async () => {
      mockSupabaseSelect.mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      const request = createRequest('/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch users');
    });

    it('should return 400 for invalid parameters', async () => {
      const request = createRequest('/api/admin/users?role=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid role');
    });

    it('should handle auth errors gracefully', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth failed' } });

      const request = createRequest('/api/admin/users');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});
