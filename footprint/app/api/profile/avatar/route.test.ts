/**
 * Tests for Avatar Upload API
 * POST /api/profile/avatar - Upload user avatar image
 *
 * Story: BE-04 - User Profile API
 * Gate 2: TDD RED Phase - Tests written BEFORE implementation
 *
 * Acceptance Criteria:
 * - AC-006: POST uploads and stores avatar image
 * - AC-007: POST validates file type (jpg, png, webp)
 * - AC-008: POST enforces 2MB file size limit
 * - AC-009: Rate limiting applied
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

vi.mock('@/lib/storage/r2', () => ({
  uploadToR2: vi.fn(),
}));

// Import mocked modules
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { uploadToR2 } from '@/lib/storage/r2';

// Import handler (will fail until implementation exists)
import { POST } from './route';

// Helper to create mock file upload request
function createUploadRequest(
  file: { name: string; type: string; size: number; content?: ArrayBuffer }
): NextRequest {
  // Create content buffer - for size testing, we need the actual content size
  const content = file.content || new ArrayBuffer(file.size);

  // Create a mock file object with required Blob-like properties
  const mockFile = {
    name: file.name,
    type: file.type,
    size: file.size,
    arrayBuffer: () => Promise.resolve(content),
  };

  // Create mock FormData that returns our mock file
  const mockFormData = {
    get: (key: string) => (key === 'avatar' ? mockFile : null),
  };

  // Create a mock request with formData method that returns a resolved promise
  const mockRequest = {
    method: 'POST',
    url: 'http://localhost:3000/api/profile/avatar',
    headers: new Headers({ 'content-type': 'multipart/form-data' }),
    formData: () => Promise.resolve(mockFormData),
  } as unknown as NextRequest;

  return mockRequest;
}

// Mock authenticated user
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
};

// Mock profile data
const mockDbProfile = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'Test User',
  avatar_url: null,
};

describe('POST /api/profile/avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue(null);
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      } as any);

      const request = createUploadRequest({
        name: 'avatar.jpg',
        type: 'image/jpeg',
        size: 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });

  describe('File Type Validation (AC-007)', () => {
    it('should accept JPEG files', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { ...mockDbProfile, avatar_url: 'https://r2.example.com/avatars/user-123.jpg' },
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockResolvedValue({
        publicUrl: 'https://r2.example.com/avatars/user-123.jpg',
        key: 'avatars/user-123.jpg',
        size: 1024,
      });

      const request = createUploadRequest({
        name: 'avatar.jpg',
        type: 'image/jpeg',
        size: 1024,
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept PNG files', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { ...mockDbProfile, avatar_url: 'https://r2.example.com/avatars/user-123.png' },
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockResolvedValue({
        publicUrl: 'https://r2.example.com/avatars/user-123.png',
        key: 'avatars/user-123.png',
        size: 1024,
      });

      const request = createUploadRequest({
        name: 'avatar.png',
        type: 'image/png',
        size: 1024,
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept WebP files', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { ...mockDbProfile, avatar_url: 'https://r2.example.com/avatars/user-123.webp' },
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockResolvedValue({
        publicUrl: 'https://r2.example.com/avatars/user-123.webp',
        key: 'avatars/user-123.webp',
        size: 1024,
      });

      const request = createUploadRequest({
        name: 'avatar.webp',
        type: 'image/webp',
        size: 1024,
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject PDF files', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createUploadRequest({
        name: 'document.pdf',
        type: 'application/pdf',
        size: 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('file type');
    });

    it('should reject GIF files', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createUploadRequest({
        name: 'animation.gif',
        type: 'image/gif',
        size: 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('file type');
    });

    it('should reject SVG files', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createUploadRequest({
        name: 'image.svg',
        type: 'image/svg+xml',
        size: 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('file type');
    });
  });

  describe('File Size Validation (AC-008)', () => {
    it('should accept files under 2MB', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { ...mockDbProfile, avatar_url: 'https://r2.example.com/avatars/user-123.jpg' },
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockResolvedValue({
        publicUrl: 'https://r2.example.com/avatars/user-123.jpg',
        key: 'avatars/user-123.jpg',
        size: 1024,
      });

      // 1.5 MB file
      const request = createUploadRequest({
        name: 'avatar.jpg',
        type: 'image/jpeg',
        size: 1.5 * 1024 * 1024,
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject files over 2MB', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      // 5 MB file
      const request = createUploadRequest({
        name: 'large-avatar.jpg',
        type: 'image/jpeg',
        size: 5 * 1024 * 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('size');
    });

    it('should reject files exactly at 2MB boundary', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      // Exactly 2MB + 1 byte
      const request = createUploadRequest({
        name: 'boundary-avatar.jpg',
        type: 'image/jpeg',
        size: 2 * 1024 * 1024 + 1,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('size');
    });
  });

  describe('Upload Success (AC-006)', () => {
    it('should upload avatar and update profile', async () => {
      const newAvatarUrl = 'https://r2.example.com/avatars/user-123.jpg';

      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { ...mockDbProfile, avatar_url: newAvatarUrl },
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockResolvedValue({
        publicUrl: newAvatarUrl,
        key: 'avatars/user-123.jpg',
        size: 1024,
      });

      const request = createUploadRequest({
        name: 'avatar.jpg',
        type: 'image/jpeg',
        size: 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.avatarUrl).toBe(newAvatarUrl);
      expect(vi.mocked(uploadToR2)).toHaveBeenCalled();
    });

    it('should return the new avatar URL', async () => {
      const newAvatarUrl = 'https://r2.example.com/avatars/user-123-new.jpg';

      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { ...mockDbProfile, avatar_url: newAvatarUrl },
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockResolvedValue({
        publicUrl: newAvatarUrl,
        key: 'avatars/user-123-new.jpg',
        size: 1024,
      });

      const request = createUploadRequest({
        name: 'new-avatar.jpg',
        type: 'image/jpeg',
        size: 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('avatarUrl');
      expect(data.avatarUrl).toBe(newAvatarUrl);
    });
  });

  describe('Rate Limiting (AC-009)', () => {
    it('should return 429 when rate limited', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429 }
      );

      vi.mocked(checkRateLimit).mockResolvedValue(rateLimitResponse as any);

      const request = createUploadRequest({
        name: 'avatar.jpg',
        type: 'image/jpeg',
        size: 1024,
      });
      const response = await POST(request);

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
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: mockDbProfile,
              error: null,
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockResolvedValue({
        publicUrl: 'https://r2.example.com/avatars/user-123.jpg',
        key: 'avatars/user-123.jpg',
        size: 1024,
      });

      const request = createUploadRequest({
        name: 'avatar.jpg',
        type: 'image/jpeg',
        size: 1024,
      });
      await POST(request);

      expect(vi.mocked(checkRateLimit)).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should return 400 when no file provided', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      // Empty request without file
      const request = new NextRequest(
        new Request('http://localhost:3000/api/profile/avatar', {
          method: 'POST',
          body: new FormData(),
        })
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 500 on storage upload error', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockRejectedValue(new Error('Storage error'));

      const request = createUploadRequest({
        name: 'avatar.jpg',
        type: 'image/jpeg',
        size: 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 on database update error', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);
      vi.mocked(uploadToR2).mockResolvedValue({
        publicUrl: 'https://r2.example.com/avatars/user-123.jpg',
        key: 'avatars/user-123.jpg',
        size: 1024,
      });

      const request = createUploadRequest({
        name: 'avatar.jpg',
        type: 'image/jpeg',
        size: 1024,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
