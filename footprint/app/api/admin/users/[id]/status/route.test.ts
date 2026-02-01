/**
 * Admin User Status API Tests - ADMIN-03
 *
 * Tests for PATCH /api/admin/users/[id]/status - Update user account status
 */

import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from './route';

// Mock Supabase
const mockSupabaseSelect = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();

const mockSupabaseFrom = vi.fn(() => ({
  select: mockSupabaseSelect,
  update: mockSupabaseUpdate,
  insert: mockSupabaseInsert,
}));

const mockGetUser = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
    from: mockSupabaseFrom,
  })),
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        signOut: mockSignOut,
      },
    },
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

const mockActiveUser = {
  id: 'active-user-id',
  email: 'active@example.com',
  status: 'active',
  updated_at: '2026-01-30T10:00:00Z',
};

const mockInactiveUser = {
  id: 'inactive-user-id',
  email: 'inactive@example.com',
  status: 'inactive',
  updated_at: '2026-01-30T10:00:00Z',
};

// Helper to create mock request
function createRequest(url: string, body: object): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Setup chain mocks for update
function setupSupabaseUpdateChain(data: unknown | null, error: { message: string } | null = null) {
  mockSupabaseUpdate.mockReturnValue({
    eq: mockSupabaseEq,
  });
  mockSupabaseEq.mockReturnValue({
    select: mockSupabaseSelect,
  });
  mockSupabaseSelect.mockReturnValue({
    single: mockSupabaseSingle,
  });
  mockSupabaseSingle.mockResolvedValue({
    data,
    error,
  });
}

// Setup chain mocks for audit log insert
function setupAuditLogInsert(error: { message: string } | null = null) {
  mockSupabaseInsert.mockResolvedValue({ error });
}

describe('PATCH /api/admin/users/[id]/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized - Please sign in');
    });

    it('should return 403 when user is not admin', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockRegularUser }, error: null });

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('should allow admin users to access', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      setupSupabaseUpdateChain({ ...mockActiveUser, status: 'inactive' });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });

      expect(response.status).toBe(200);
    });
  });

  describe('Status Management', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should deactivate user account', async () => {
      setupSupabaseUpdateChain({ ...mockActiveUser, status: 'inactive' });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.status).toBe('inactive');
    });

    it('should reactivate user account', async () => {
      setupSupabaseUpdateChain({ ...mockInactiveUser, status: 'active' });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/inactive-user-id/status', { status: 'active' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'inactive-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.status).toBe('active');
    });

    it('should prevent self-deactivation', async () => {
      const request = createRequest('/api/admin/users/admin-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'admin-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('לא ניתן להשבית את החשבון שלך');
    });

    it('should log out deactivated user', async () => {
      setupSupabaseUpdateChain({ ...mockActiveUser, status: 'inactive' });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });

      expect(mockSignOut).toHaveBeenCalledWith('active-user-id', 'global');
    });

    it('should return updated user object in response', async () => {
      const updatedUser = { ...mockActiveUser, status: 'inactive' };
      setupSupabaseUpdateChain(updatedUser);
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe('active-user-id');
      expect(data.user.email).toBe('active@example.com');
      expect(data.user.status).toBe('inactive');
      expect(data.user.updatedAt).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should log status changes', async () => {
      setupSupabaseUpdateChain({ ...mockActiveUser, status: 'inactive' });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          actor_id: 'admin-user-id',
          target_id: 'active-user-id',
          action: 'status_change',
        })
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
      setupSupabaseUpdateChain({ ...mockActiveUser, status: 'inactive' });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });

      expect(checkRateLimit).toHaveBeenCalledWith('strict', request);
    });

    it('should return 429 when rate limited', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      const { NextResponse } = await import('next/server');
      vi.mocked(checkRateLimit).mockResolvedValueOnce(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });

      expect(response.status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: mockAdminUser }, error: null });
    });

    it('should return 500 on database error', async () => {
      setupSupabaseUpdateChain(null, { message: 'Database connection failed' });

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update user status');
    });

    it('should return 400 for invalid input', async () => {
      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'invalid' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid status');
    });

    it('should handle auth errors gracefully', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth failed' } });

      const request = createRequest('/api/admin/users/active-user-id/status', { status: 'inactive' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'active-user-id' }) });

      expect(response.status).toBe(401);
    });
  });
});
