/**
 * Tests for Set Default Address API
 * PATCH /api/addresses/[id]/default - Set address as default
 *
 * Story: BE-05 - Addresses CRUD API
 * Gate 2: TDD RED Phase - Tests written BEFORE implementation
 *
 * Acceptance Criteria:
 * - AC-012: PATCH sets address as default and unsets previous default
 * - AC-013: Returns 401 when not authenticated
 * - AC-014: Rate limiting applied
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

// Import mocked modules
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Import handler
import { PATCH } from './route';

// Helper to create mock request
function createRequest(): NextRequest {
  return new NextRequest(
    new Request('http://localhost:3000/api/addresses/addr-2/default', {
      method: 'PATCH',
    })
  );
}

// Mock params (Next.js 15: params is a Promise)
const mockParams = Promise.resolve({ id: 'addr-2' });

// Mock authenticated user
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
};

// Mock address data
const mockDbAddress = {
  id: 'addr-1',
  user_id: 'user-123',
  name: 'Home',
  street: 'Rothschild 1',
  apartment: 'Apt 5',
  city: 'Tel Aviv',
  postal_code: '1234567',
  country: 'Israel',
  phone: '050-1234567',
  is_default: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

const mockDbAddress2 = {
  id: 'addr-2',
  user_id: 'user-123',
  name: 'Work',
  street: 'Dizengoff 100',
  apartment: null,
  city: 'Tel Aviv',
  postal_code: '6789012',
  country: 'Israel',
  phone: '052-9876543',
  is_default: false,
  created_at: '2024-01-16T10:00:00Z',
  updated_at: '2024-01-16T10:00:00Z',
};

// Address owned by another user
const otherUserAddress = {
  ...mockDbAddress2,
  id: 'addr-other',
  user_id: 'other-user-456',
};

describe('PATCH /api/addresses/[id]/default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(null);
  });

  describe('Authentication (AC-013)', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      } as any);

      const request = createRequest();
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('Set Default Address (AC-012)', () => {
    it('should set address as default', async () => {
      const updatedAddress = { ...mockDbAddress2, is_default: true };

      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDbAddress2,
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: updatedAddress,
                  error: null,
                }),
              })),
              neq: vi.fn().mockResolvedValue({
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.address.isDefault).toBe(true);
    });

    it('should unset previous default', async () => {
      const updatedAddress = { ...mockDbAddress2, is_default: true };

      // Track if update was called to unset other defaults
      const updateMock = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: updatedAddress,
              error: null,
            }),
          })),
          neq: vi.fn().mockResolvedValue({
            error: null,
          }),
        })),
      }));

      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDbAddress2,
                error: null,
              }),
            })),
          })),
          update: updateMock,
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await PATCH(request, { params: mockParams });

      expect(response.status).toBe(200);
      // Verify update was called (to unset previous default and set new one)
      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('Not Found', () => {
    it('should return 404 for non-existent address', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await PATCH(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe('Access Control', () => {
    it('should return 403 for other user\'s address', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: otherUserAddress,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await PATCH(request, { params: Promise.resolve({ id: 'addr-other' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
    });
  });

  describe('Rate Limiting (AC-014)', () => {
    it('should return 429 when rate limited', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429 }
      );

      vi.mocked(checkRateLimit).mockResolvedValue(rateLimitResponse as any);

      const request = createRequest();
      const response = await PATCH(request, { params: mockParams });

      expect(response.status).toBe(429);
    });

    it('should call checkRateLimit', async () => {
      const updatedAddress = { ...mockDbAddress2, is_default: true };

      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDbAddress2,
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: updatedAddress,
                  error: null,
                }),
              })),
              neq: vi.fn().mockResolvedValue({
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      await PATCH(request, { params: mockParams });

      expect(vi.mocked(checkRateLimit)).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDbAddress2,
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' },
                }),
              })),
              neq: vi.fn().mockResolvedValue({
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
