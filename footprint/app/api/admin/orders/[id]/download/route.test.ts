/**
 * Admin Print File Download API Tests
 *
 * TDD: Tests written FIRST before implementation.
 * Endpoint: GET /api/admin/orders/[id]/download
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase client - must be defined inline
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(),
      })),
    })
  ),
}));

// Mock print file generation
vi.mock('@/lib/orders/printFile', () => ({
  getOrCreatePrintFile: vi.fn(),
  isValidPrintSize: vi.fn((size: string) =>
    ['A5', 'A4', 'A3', 'A2'].includes(size)
  ),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocks
import { GET } from './route';
import { createClient } from '@/lib/supabase/server';
import { getOrCreatePrintFile } from '@/lib/orders/printFile';

// Cast to mocked types
const mockCreateClient = createClient as ReturnType<typeof vi.fn>;
const mockGetOrCreatePrintFile = getOrCreatePrintFile as ReturnType<typeof vi.fn>;

describe('GET /api/admin/orders/[id]/download', () => {
  // Helper to set up the mock client
  function setupMockClient(options: {
    user?: {
      id: string;
      email: string;
      user_metadata: { role: string };
    } | null;
    authError?: { message: string } | null;
    order?: {
      id: string;
      size: string;
      transformed_image_url: string;
      transformed_image_key: string;
    } | null;
    fetchError?: { message: string } | null;
  }) {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: options.user ?? null },
      error: options.authError ?? null,
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: options.order ?? null,
      error: options.fetchError ?? null,
    });

    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
    });

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    return { mockGetUser, mockSelect };
  }

  beforeEach(() => {
    vi.clearAllMocks();

    // Default setup: authenticated admin user with existing order
    setupMockClient({
      user: {
        id: 'admin_123',
        email: 'admin@footprint.co.il',
        user_metadata: { role: 'admin' },
      },
      order: {
        id: 'order_123',
        size: 'A4',
        transformed_image_url: 'https://example.com/image.jpg',
        transformed_image_key: 'transformed/order_123/image.jpg',
      },
    });

    // Default: print file generation succeeds
    mockGetOrCreatePrintFile.mockResolvedValue({
      downloadUrl: 'https://presigned.example.com/download',
      fileName: 'order_123_A4_1735214400_print.jpg',
      dimensions: {
        width: 2480,
        height: 3508,
        dpi: 300,
      },
      expiresIn: 3600,
    });

    // Default: image fetch succeeds
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============================================================================
  // Authentication Tests
  // ============================================================================

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      setupMockClient({
        user: null,
        authError: { message: 'Not authenticated' },
      });

      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Unauthorized');
    });

    it('should return 403 for non-admin users', async () => {
      setupMockClient({
        user: {
          id: 'user_123',
          email: 'user@example.com',
          user_metadata: { role: 'customer' },
        },
      });

      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Admin access required');
    });

    it('should allow admin users to proceed', async () => {
      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe('Request Validation', () => {
    it('should return 400 for missing size parameter', async () => {
      const request = createRequest('order_123', '');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('size');
    });

    it('should return 400 for invalid size parameter', async () => {
      const request = createRequest('order_123', 'A6');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid size');
    });

    it('should accept valid size parameters', async () => {
      const sizes = ['A5', 'A4', 'A3', 'A2'];
      for (const size of sizes) {
        const request = createRequest('order_123', size);
        const response = await GET(request, { params: { id: 'order_123' } });
        expect(response.status).toBe(200);
      }
    });

    it('should return 404 for non-existent order', async () => {
      setupMockClient({
        user: {
          id: 'admin_123',
          email: 'admin@footprint.co.il',
          user_metadata: { role: 'admin' },
        },
        order: null,
        fetchError: { message: 'Not found' },
      });

      const request = createRequest('nonexistent', 'A4');
      const response = await GET(request, { params: { id: 'nonexistent' } });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('Order not found');
    });
  });

  // ============================================================================
  // Success Response Tests
  // ============================================================================

  describe('Successful Download', () => {
    it('should return download URL in response', async () => {
      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.downloadUrl).toBe('https://presigned.example.com/download');
    });

    it('should return file name in response', async () => {
      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(body.fileName).toContain('order_123');
      expect(body.fileName).toContain('A4');
      expect(body.fileName).toContain('print.jpg');
    });

    it('should return dimensions in response', async () => {
      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(body.dimensions).toEqual({
        width: 2480,
        height: 3508,
        dpi: 300,
      });
    });

    it('should return expiration time in response', async () => {
      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(body.expiresIn).toBe(3600);
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should return 500 if print file generation fails', async () => {
      mockGetOrCreatePrintFile.mockRejectedValue(new Error('R2 upload failed'));

      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Failed to generate');
    });

    it('should return 500 if image fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Failed to fetch');
    });

    it('should return 400 if order has no transformed image', async () => {
      setupMockClient({
        user: {
          id: 'admin_123',
          email: 'admin@footprint.co.il',
          user_metadata: { role: 'admin' },
        },
        order: {
          id: 'order_123',
          size: 'A4',
          transformed_image_url: '',
          transformed_image_key: '',
        },
      });

      const request = createRequest('order_123', 'A4');
      const response = await GET(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('No transformed image');
    });
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

function createRequest(orderId: string, size: string): NextRequest {
  const url = size
    ? `http://localhost/api/admin/orders/${orderId}/download?size=${size}`
    : `http://localhost/api/admin/orders/${orderId}/download`;

  return new NextRequest(url, {
    method: 'GET',
  });
}
