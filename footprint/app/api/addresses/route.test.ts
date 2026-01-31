/**
 * Tests for Addresses API
 * GET /api/addresses - List user's addresses
 * POST /api/addresses - Create new address
 *
 * Story: BE-05 - Addresses CRUD API
 * Gate 2: TDD RED Phase - Tests written BEFORE implementation
 *
 * Acceptance Criteria:
 * - AC-001: GET returns list of user's saved addresses
 * - AC-002: GET returns empty array for users with no addresses
 * - AC-003: POST creates a new address
 * - AC-004: POST validates input with Zod schema
 * - AC-005: POST sets isDefault=true if first address
 * - AC-013: All endpoints return 401 when not authenticated
 * - AC-014: Rate limiting applied
 * - AC-015: camelCase response format
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
import { GET, POST } from './route';

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
    new Request('http://localhost:3000/api/addresses', init)
  );
}

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

describe('GET /api/addresses', () => {
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
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('List Addresses (AC-001)', () => {
    it('should return list of user addresses', async () => {
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
              order: vi.fn().mockResolvedValue({
                data: [mockDbAddress, mockDbAddress2],
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.addresses).toHaveLength(2);
      expect(data.addresses[0]).toHaveProperty('id');
      expect(data.addresses[0]).toHaveProperty('name');
      expect(data.addresses[0]).toHaveProperty('street');
    });
  });

  describe('Empty List (AC-002)', () => {
    it('should return empty array for users with no addresses', async () => {
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
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.addresses).toEqual([]);
    });
  });

  describe('Response Format (AC-015)', () => {
    it('should use camelCase in response', async () => {
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
              order: vi.fn().mockResolvedValue({
                data: [mockDbAddress],
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should have camelCase
      expect(data.addresses[0]).toHaveProperty('postalCode');
      expect(data.addresses[0]).toHaveProperty('isDefault');
      expect(data.addresses[0]).toHaveProperty('createdAt');
      // Should NOT have snake_case
      expect(data.addresses[0]).not.toHaveProperty('postal_code');
      expect(data.addresses[0]).not.toHaveProperty('is_default');
      expect(data.addresses[0]).not.toHaveProperty('created_at');
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
      const response = await GET(request);

      expect(response.status).toBe(429);
    });

    it('should call checkRateLimit', async () => {
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
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('GET');
      await GET(request);

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
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});

describe('POST /api/addresses', () => {
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

      const request = createRequest('POST', {
        name: 'Home',
        street: 'Rothschild 1',
        city: 'Tel Aviv',
        postalCode: '1234567',
        country: 'Israel',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('Create Address (AC-003)', () => {
    it('should create a new address', async () => {
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
              order: vi.fn().mockResolvedValue({
                data: [], // No existing addresses
                error: null,
              }),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockDbAddress,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('POST', {
        name: 'Home',
        street: 'Rothschild 1',
        apartment: 'Apt 5',
        city: 'Tel Aviv',
        postalCode: '1234567',
        country: 'Israel',
        phone: '050-1234567',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.address).toHaveProperty('id');
    });
  });

  describe('Validation (AC-004)', () => {
    it('should return 400 for missing required fields', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('POST', {
        name: 'Home',
        // Missing street, city, postalCode
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for invalid postal code format', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('POST', {
        name: 'Home',
        street: 'Rothschild 1',
        city: 'Tel Aviv',
        postalCode: '123', // Invalid - should be 7 digits
        country: 'Israel',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.toLowerCase()).toContain('postal');
    });

    it('should return 400 for invalid phone format', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('POST', {
        name: 'Home',
        street: 'Rothschild 1',
        city: 'Tel Aviv',
        postalCode: '1234567',
        country: 'Israel',
        phone: '12345', // Invalid phone
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('phone');
    });
  });

  describe('First Address Default (AC-005)', () => {
    it('should set isDefault=true if first address', async () => {
      const newAddress = { ...mockDbAddress, is_default: true };

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
              order: vi.fn().mockResolvedValue({
                data: [], // No existing addresses
                error: null,
              }),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: newAddress,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('POST', {
        name: 'Home',
        street: 'Rothschild 1',
        city: 'Tel Aviv',
        postalCode: '1234567',
        country: 'Israel',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.address.isDefault).toBe(true);
    });

    it('should not set isDefault if other addresses exist', async () => {
      const newAddress = { ...mockDbAddress, id: 'addr-new', is_default: false };

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
              order: vi.fn().mockResolvedValue({
                data: [mockDbAddress], // Existing address
                error: null,
              }),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: newAddress,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('POST', {
        name: 'Work',
        street: 'Dizengoff 100',
        city: 'Tel Aviv',
        postalCode: '6789012',
        country: 'Israel',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.address.isDefault).toBe(false);
    });
  });

  describe('Rate Limiting (AC-014)', () => {
    it('should return 429 when rate limited', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429 }
      );

      vi.mocked(checkRateLimit).mockResolvedValue(rateLimitResponse as any);

      const request = createRequest('POST', {
        name: 'Home',
        street: 'Rothschild 1',
        city: 'Tel Aviv',
        postalCode: '1234567',
        country: 'Israel',
      });
      const response = await POST(request);

      expect(response.status).toBe(429);
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
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('POST', {
        name: 'Home',
        street: 'Rothschild 1',
        city: 'Tel Aviv',
        postalCode: '1234567',
        country: 'Israel',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
