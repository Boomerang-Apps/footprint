/**
 * Tests for User Profile API
 * GET /api/profile - Get current user's profile
 * PUT /api/profile - Update current user's profile
 *
 * Story: BE-04 - User Profile API
 * Gate 2: TDD RED Phase - Tests written BEFORE implementation
 *
 * Acceptance Criteria:
 * - AC-001: GET returns profile data
 * - AC-002: GET returns 401 when not authenticated
 * - AC-003: PUT updates profile fields
 * - AC-004: PUT validates with Zod schema
 * - AC-005: PUT returns 401 when not authenticated
 * - AC-009: Rate limiting applied
 * - AC-010: camelCase response format
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies - must be defined before imports
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

// Import mocked modules
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Import handlers (will fail until implementation exists)
import { GET, PUT } from './route';

// Helper to create mock request
function createRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/profile',
  body?: object
): NextRequest {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new Request(url, init));
}

// Mock authenticated user
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
};

// Mock profile data (snake_case from database)
const mockDbProfile = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'Test User',
  phone: '050-1234567',
  avatar_url: 'https://example.com/avatar.jpg',
  preferred_language: 'he',
  is_admin: false,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

// Expected camelCase response
const expectedProfileResponse = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'Test User',
  phone: '050-1234567',
  avatarUrl: 'https://example.com/avatar.jpg',
  preferredLanguage: 'he',
  isAdmin: false,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('GET /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(null);
  });

  describe('Authentication (AC-002)', () => {
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

    it('should return 401 when user is null', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
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

  describe('Success Response (AC-001)', () => {
    it('should return profile data for authenticated user', async () => {
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
                data: mockDbProfile,
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
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('phone');
      expect(data).toHaveProperty('avatarUrl');
      expect(data).toHaveProperty('preferredLanguage');
      expect(data).toHaveProperty('isAdmin');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    });

    it('should handle missing optional fields', async () => {
      const profileWithNulls = {
        ...mockDbProfile,
        name: null,
        phone: null,
        avatar_url: null,
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
                data: profileWithNulls,
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
      expect(data.name).toBeNull();
      expect(data.phone).toBeNull();
      expect(data.avatarUrl).toBeNull();
    });
  });

  describe('Response Format (AC-010)', () => {
    it('should use camelCase in response (not snake_case)', async () => {
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
                data: mockDbProfile,
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

      // Should have camelCase keys
      expect(data).toHaveProperty('avatarUrl');
      expect(data).toHaveProperty('preferredLanguage');
      expect(data).toHaveProperty('isAdmin');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');

      // Should NOT have snake_case keys
      expect(data).not.toHaveProperty('avatar_url');
      expect(data).not.toHaveProperty('preferred_language');
      expect(data).not.toHaveProperty('is_admin');
      expect(data).not.toHaveProperty('created_at');
      expect(data).not.toHaveProperty('updated_at');
    });
  });

  describe('Rate Limiting (AC-009)', () => {
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
              single: vi.fn().mockResolvedValue({
                data: mockDbProfile,
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
              single: vi.fn().mockResolvedValue({
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

describe('PUT /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(null);
  });

  describe('Authentication (AC-005)', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      } as any);

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        name: 'New Name',
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('Update Profile (AC-003)', () => {
    it('should update name field', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { ...mockDbProfile, name: 'Updated Name' },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        name: 'Updated Name',
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should update phone field', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { ...mockDbProfile, phone: '052-9876543' },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        phone: '052-9876543',
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should update language preference', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { ...mockDbProfile, preferred_language: 'en' },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        preferredLanguage: 'en',
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Validation (AC-004)', () => {
    it('should return 400 for name shorter than 2 characters', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        name: 'A', // Too short
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
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

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        phone: '12345', // Invalid Israeli phone format
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for invalid language', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        preferredLanguage: 'fr', // Only 'he' or 'en' allowed
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('Rate Limiting (AC-009)', () => {
    it('should return 429 when rate limited', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429 }
      );

      vi.mocked(checkRateLimit).mockResolvedValue(rateLimitResponse as any);

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        name: 'Test',
      });
      const response = await PUT(request);

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
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' },
                }),
              })),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('PUT', 'http://localhost:3000/api/profile', {
        name: 'Valid Name',
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
