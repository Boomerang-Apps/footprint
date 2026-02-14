/**
 * Admin User Stats API Tests - ADMIN-02
 *
 * Tests for GET /api/admin/users/stats - Get user statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock Supabase query responses
const mockRpcResult = vi.fn();
const mockSupabaseSelect = vi.fn();

const mockSupabaseRpc = vi.fn(() => mockRpcResult());

const mockSupabaseFrom = vi.fn(() => ({
  select: mockSupabaseSelect,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockSupabaseFrom,
    rpc: mockSupabaseRpc,
  })),
}));

// Mock admin auth
const mockVerifyAdmin = vi.fn();
vi.mock('@/lib/auth/admin', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

// Mock rate limiter
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

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
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: false, error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }) });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('נדרשת הזדהות');
    });

    it('should return 403 when user is not admin', async () => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: false, error: NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 }) });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('נדרשת הרשאת מנהל');
    });

    it('should allow admin users to access', async () => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
      mockRpcResult.mockResolvedValue({ data: mockStats, error: null });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Stats Response', () => {
    beforeEach(() => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
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
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
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
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
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
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: false, error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }) });

      const request = createRequest('/api/admin/users/stats');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});
