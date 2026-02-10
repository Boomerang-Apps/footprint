/**
 * Admin Authentication Tests
 *
 * Tests for admin auth verification and withAdminAuth HOF.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock Supabase server client
const mockGetUser = vi.fn();
const mockCreateClient = vi.fn().mockResolvedValue({
  auth: {
    getUser: mockGetUser,
  },
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
    it('should return authorized for admin user', async () => {
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

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(true);
      expect(result.user).toEqual({
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
      });
      expect(result.error).toBeUndefined();
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

    it('should return 403 when user is not admin', async () => {
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

      const result = await verifyAdmin();

      expect(result.isAuthorized).toBe(false);
      expect(result.error).toBeInstanceOf(NextResponse);
    });

    it('should return 403 when user has no role metadata', async () => {
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

    it('should not call handler when user is not admin', async () => {
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
