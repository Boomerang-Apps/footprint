/**
 * Admin User Role API Tests - ADMIN-03
 *
 * Tests for PATCH /api/admin/users/[id]/role - Update user admin status
 */

import { NextRequest, NextResponse } from 'next/server';
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

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockSupabaseFrom,
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

const mockTargetUser = {
  id: 'target-user-id',
  email: 'target@example.com',
  is_admin: false,
  updated_at: '2026-01-30T10:00:00Z',
};

const mockTargetAdmin = {
  id: 'target-admin-id',
  email: 'targetadmin@example.com',
  is_admin: true,
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

// Setup chain mocks for select (user lookup)
function setupSupabaseSelectChain(data: unknown | null, error: { message: string } | null = null) {
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

describe('PATCH /api/admin/users/[id]/role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: false, error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }) });

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('נדרשת הזדהות');
    });

    it('should return 403 when user is not admin', async () => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: false, error: NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 }) });

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('נדרשת הרשאת מנהל');
    });

    it('should allow admin users to access', async () => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
      setupSupabaseUpdateChain({ ...mockTargetUser, is_admin: true });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });

      expect(response.status).toBe(200);
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
    });

    it('should promote user to admin', async () => {
      setupSupabaseUpdateChain({ ...mockTargetUser, is_admin: true });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.isAdmin).toBe(true);
    });

    it('should demote admin to user', async () => {
      setupSupabaseUpdateChain({ ...mockTargetAdmin, is_admin: false });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/target-admin-id/role', { isAdmin: false });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-admin-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.isAdmin).toBe(false);
    });

    it('should prevent self-demotion', async () => {
      const request = createRequest('/api/admin/users/admin-user-id/role', { isAdmin: false });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'admin-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('לא ניתן להסיר הרשאות מעצמך');
    });

    it('should return 404 for non-existent user', async () => {
      setupSupabaseUpdateChain(null, { message: 'Row not found' });

      const request = createRequest('/api/admin/users/non-existent/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('משתמש לא נמצא');
    });

    it('should return updated user object in response', async () => {
      const updatedUser = { ...mockTargetUser, is_admin: true };
      setupSupabaseUpdateChain(updatedUser);
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe('target-user-id');
      expect(data.user.email).toBe('target@example.com');
      expect(data.user.isAdmin).toBe(true);
      expect(data.user.updatedAt).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
    });

    it('should log role changes', async () => {
      setupSupabaseUpdateChain({ ...mockTargetUser, is_admin: true });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          actor_id: 'admin-user-id',
          target_id: 'target-user-id',
          action: 'role_change',
        })
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
      setupSupabaseUpdateChain({ ...mockTargetUser, is_admin: true });
      setupAuditLogInsert();

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });

      expect(checkRateLimit).toHaveBeenCalledWith('strict', request);
    });

    it('should return 429 when rate limited', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      const { NextResponse } = await import('next/server');
      vi.mocked(checkRateLimit).mockResolvedValueOnce(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });

      expect(response.status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: true, user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' } });
    });

    it('should return 500 on database error', async () => {
      setupSupabaseUpdateChain(null, { message: 'Database connection failed' });

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update user role');
    });

    it('should return 400 for invalid input', async () => {
      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: 'invalid' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid');
    });

    it('should handle auth errors gracefully', async () => {
      mockVerifyAdmin.mockResolvedValue({ isAuthorized: false, error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }) });

      const request = createRequest('/api/admin/users/target-user-id/role', { isAdmin: true });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'target-user-id' }) });

      expect(response.status).toBe(401);
    });
  });
});
