/**
 * Tests for Single Address API
 * GET /api/addresses/[id] - Get address by ID
 * PUT /api/addresses/[id] - Update address
 * DELETE /api/addresses/[id] - Delete address
 *
 * Story: BE-05 - Addresses CRUD API
 * Gate 2: TDD RED Phase - Tests written BEFORE implementation
 *
 * Acceptance Criteria:
 * - AC-006: GET returns single address by ID
 * - AC-007: GET returns 404 for non-existent address
 * - AC-008: GET returns 403 for other user's address
 * - AC-009: PUT updates address fields
 * - AC-010: DELETE removes address
 * - AC-011: DELETE prevents deleting default if others exist
 * - AC-013: All endpoints return 401 when not authenticated
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

// Import handlers
import { GET, PUT, DELETE } from './route';

// Helper to create mock request
function createRequest(
  method: string = 'GET',
  body?: object
): NextRequest {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(
    new Request('http://localhost:3000/api/addresses/addr-1', init)
  );
}

// Mock params (Next.js 15: params is a Promise)
const mockParams = Promise.resolve({ id: 'addr-1' });

// Mock authenticated user
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
};

// Mock address data (snake_case from database)
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
  ...mockDbAddress,
  id: 'addr-other',
  user_id: 'other-user-456',
};

describe('GET /api/addresses/[id]', () => {
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

      const request = createRequest('GET');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('Get Single Address (AC-006)', () => {
    it('should return address by ID', async () => {
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
                data: mockDbAddress,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('GET');
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('addr-1');
      expect(data.name).toBe('Home');
      expect(data.street).toBe('Rothschild 1');
    });
  });

  describe('Not Found (AC-007)', () => {
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

      const request = createRequest('GET');
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe('Access Control (AC-008)', () => {
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

      const request = createRequest('GET');
      const response = await GET(request, { params: Promise.resolve({ id: 'addr-other' }) });
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

      const request = createRequest('GET');
      const response = await GET(request, { params: mockParams });

      expect(response.status).toBe(429);
    });
  });
});

describe('PUT /api/addresses/[id]', () => {
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

      const request = createRequest('PUT', { name: 'Updated' });
      const response = await PUT(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('Update Address (AC-009)', () => {
    it('should update address fields', async () => {
      const updatedAddress = {
        ...mockDbAddress,
        name: 'Updated Home',
        street: 'New Street 99',
      };

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
                data: mockDbAddress,
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
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('PUT', {
        name: 'Updated Home',
        street: 'New Street 99',
      });
      const response = await PUT(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.address.name).toBe('Updated Home');
    });

    it('should validate updated fields', async () => {
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
                data: mockDbAddress,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('PUT', {
        postalCode: '123', // Invalid
      });
      const response = await PUT(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
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

      const request = createRequest('PUT', { name: 'Updated' });
      const response = await PUT(request, { params: Promise.resolve({ id: 'non-existent' }) });
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

      const request = createRequest('PUT', { name: 'Hacked' });
      const response = await PUT(request, { params: Promise.resolve({ id: 'addr-other' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
    });
  });
});

describe('DELETE /api/addresses/[id]', () => {
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

      const request = createRequest('DELETE');
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('Delete Address (AC-010)', () => {
    it('should delete address', async () => {
      // Non-default address can be deleted freely
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
                data: mockDbAddress2, // Non-default
                error: null,
              }),
              order: vi.fn().mockResolvedValue({
                data: [mockDbAddress, mockDbAddress2],
                error: null,
              }),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('DELETE');
      const response = await DELETE(request, { params: Promise.resolve({ id: 'addr-2' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Prevent Delete Default (AC-011)', () => {
    it('should prevent deleting default address if others exist', async () => {
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
                data: mockDbAddress, // Default address
                error: null,
              }),
              order: vi.fn().mockResolvedValue({
                data: [mockDbAddress, mockDbAddress2], // Other addresses exist
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('DELETE');
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('default');
    });

    it('should allow deleting default address if it is the only one', async () => {
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
                data: mockDbAddress, // Default address
                error: null,
              }),
              order: vi.fn().mockResolvedValue({
                data: [mockDbAddress], // Only address
                error: null,
              }),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('DELETE');
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
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

      const request = createRequest('DELETE');
      const response = await DELETE(request, { params: Promise.resolve({ id: 'non-existent' }) });
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

      const request = createRequest('DELETE');
      const response = await DELETE(request, { params: Promise.resolve({ id: 'addr-other' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
    });
  });
});
