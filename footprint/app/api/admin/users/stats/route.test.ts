/**
 * Admin User Stats API Tests - ADMIN-02
 *
 * Tests for GET /api/admin/users/stats - Get user statistics
 */

import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock Supabase query responses
const mockRpcResult = vi.fn();
const mockSupabaseSelect = vi.fn();

const mockSupabaseRpc = vi.fn(() => mockRpcResult());

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
    rpc: mockSupabaseRpc,
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

const mockStats = {
  totalUsers: 150,
  newThisWeek: 12,
  newThisMonth: 45,
  adminCount: 3,
  activeUsers: 142,
};

// Helper to create mock request
function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('GET /api/admin/users/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized - Please sign in');
    });

    it('should return 403 when user is not admin', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockRegularUser }, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('should allow admin users to access', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Stats Response', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should return total user count', async () => {
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalUsers).toBe(150);
    });

    it('should return new users this week', async () => {
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(data.newThisWeek).toBe(12);
    });

    it('should return new users this month', async () => {
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(data.newThisMonth).toBe(45);
    });

    it('should return admin count', async () => {
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(data.adminCount).toBe(3);
    });

    it('should return active users count', async () => {
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(data.activeUsers).toBe(142);
    });

    it('should return all stats in camelCase format', async () => {
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('totalUsers');
      expect(data).toHaveProperty('newThisWeek');
      expect(data).toHaveProperty('newThisMonth');
      expect(data).toHaveProperty('adminCount');
      expect(data).toHaveProperty('activeUsers');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      await GET(request);

      expect(checkRateLimit).toHaveBeenCalledWith('general', request);
    });

    it('should return 429 when rate limited', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      const { NextResponse } = await import('next/server');
      vi.mocked(checkRateLimit).mockResolvedValueOnce(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);

      expect(response.status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should return 500 on database error', async () => {
      mockRpcResult.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch user stats');
    });

    it('should handle auth errors gracefully', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth failed' } });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});
