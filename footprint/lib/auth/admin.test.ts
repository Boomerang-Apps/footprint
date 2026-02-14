/**
 * Admin Authentication Tests
 *
 * Tests for admin auth verification and withAdminAuth HOF.
 * Verifies DB-backed admin check (profiles.is_admin) instead of JWT claims.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock Supabase server client
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn().mockReturnValue({
  select: (...args: unknown[]) => {
    mockSelect(...args);
    return {
      eq: (...eqArgs: unknown[]) => {
        mockEq(...eqArgs);
        return { single: mockSingle };
      },
    };
  },
});

const mockCreateClient = vi.fn().mockResolvedValue({
  auth: {
    getUser: mockGetUser,
  },
  from: mockFrom,
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { verifyAdmin, withAdminAuth, type AdminAuthResult } from './admin';
import { logger } from '@/lib/logger';

describe('lib/auth/admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the ADMIN_EMAIL_ALLOWLIST env var
    delete process.env.ADMIN_EMAIL_ALLOWLIST;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('verifyAdmin', () => {
    it('should return authorized for admin user with DB is_admin=true', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'admin@example.com',
            user_metadata: { role: 'admin' },
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: true },
        error: null,
      });

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(true);
      expect(result.user).toEqual({
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
      });
      expect(result.error).toBeUndefined();
      // Verify DB query was made
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('is_admin');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
    });

    it('should return 401 when auth error occurs', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth session expired'),
      });

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
      expect(result.error).toBeInstanceOf(NextResponse);
    });

    it('should return 401 when user is null', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
      expect(result.error).toBeInstanceOf(NextResponse);
    });

    it('should return 403 when user is not admin in DB', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-456',
            email: 'user@example.com',
            user_metadata: { role: 'client' },
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: false },
        error: null,
      });

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
      expect(result.error).toBeInstanceOf(NextResponse);
    });

    it('should return 403 when profile query fails', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-789',
            email: 'norole@example.com',
            user_metadata: {},
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: null,
        error: new Error('Profile not found'),
      });

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
    });

    it('should return 403 when profile has no is_admin field', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-789',
            email: 'norole@example.com',
            user_metadata: {},
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: null },
        error: null,
      });

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
    });

    it('should ignore user_metadata.role and rely on DB', async () => {
      // User has admin in JWT but NOT in DB — should be denied
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-spoofed',
            email: 'spoofed@example.com',
            user_metadata: { role: 'admin' },
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: false },
        error: null,
      });

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
    });

    it('should handle empty email gracefully', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-no-email',
            email: null,
            user_metadata: { role: 'admin' },
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: true },
        error: null,
      });

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(true);
      expect(result.user!.email).toBe('');
    });

    it('should return 500 when an unexpected error occurs', async () => {
      mockCreateClient.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
      expect(result.error).toBeInstanceOf(NextResponse);
      expect(logger.error).toHaveBeenCalledWith(
        'Admin verification error',
        expect.any(Error)
      );
    });

    it('should handle getUser throwing an error', async () => {
      mockGetUser.mockRejectedValue(new Error('Database timeout'));

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return Hebrew error messages', async () => {
      // Test 401 message
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result401 = await verifyAdmin();
      const body401 = await result401.error!.json();
      expect(body401.error).toBe('נדרשת הזדהות');

      // Test 403 message
      vi.clearAllMocks();
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-403',
            email: 'user@example.com',
            user_metadata: {},
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: false },
        error: null,
      });

      const result403 = await verifyAdmin();
      const body403 = await result403.error!.json();
      expect(body403.error).toBe('נדרשת הרשאת מנהל');
    });
  });

  describe('withAdminAuth', () => {
    it('should call handler with admin user when authorized', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@example.com',
            user_metadata: { role: 'admin' },
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: true },
        error: null,
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ data: 'success' }, { status: 200 })
      );

      const wrappedHandler = withAdminAuth(mockHandler);
      const mockRequest = new Request('https://example.com/api/admin/test');

      await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(
        mockRequest,
        {
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'admin',
        }
      );
    });

    it('should return error response when not authorized', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const mockHandler = vi.fn();

      const wrappedHandler = withAdminAuth(mockHandler);
      const mockRequest = new Request('https://example.com/api/admin/test');

      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should not call handler when user is not admin in DB', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-regular',
            email: 'user@example.com',
            user_metadata: { role: 'client' },
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: false },
        error: null,
      });

      const mockHandler = vi.fn();

      const wrappedHandler = withAdminAuth(mockHandler);
      const mockRequest = new Request('https://example.com/api/admin/orders');

      await wrappedHandler(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return handler result when authorized', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@example.com',
            user_metadata: { role: 'admin' },
          },
        },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { is_admin: true },
        error: null,
      });

      const expectedResponse = NextResponse.json(
        { orders: [{ id: '1' }, { id: '2' }] },
        { status: 200 }
      );
      const mockHandler = vi.fn().mockResolvedValue(expectedResponse);

      const wrappedHandler = withAdminAuth(mockHandler);
      const mockRequest = new Request('https://example.com/api/admin/orders');

      const result = await wrappedHandler(mockRequest);

      expect(result).toBe(expectedResponse);
    });
  });
});
