/**
 * POST /api/admin/orders/bulk-download
 *
 * Tests for bulk print file download endpoint - BE-08
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockIn = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

// Mock R2 storage
vi.mock('@/lib/storage/r2', () => ({
  uploadToR2: vi.fn(() => Promise.resolve({
    key: 'bulk-downloads/test-zip.zip',
    publicUrl: 'https://storage.example.com/bulk-downloads/test-zip.zip',
  })),
  getDownloadUrl: vi.fn(() => Promise.resolve('https://presigned.example.com/download')),
}));

// Mock print file generation
vi.mock('@/lib/orders/printFile', () => ({
  getOrCreatePrintFile: vi.fn(() => Promise.resolve({
    downloadUrl: 'https://presigned.example.com/print-file.jpg',
    fileName: 'order_123_A4_print.jpg',
    dimensions: { width: 2480, height: 3508, dpi: 300 },
    expiresIn: 3600,
  })),
  isValidPrintSize: vi.fn((size) => ['A5', 'A4', 'A3', 'A2'].includes(size)),
}));

// Mock ZIP archive utility
vi.mock('@/lib/fulfillment/zip-archive', () => ({
  createZipArchive: vi.fn(() => Promise.resolve(Buffer.from('mock-zip-data'))),
  generateZipFileName: vi.fn(() => 'print-files-2026-01-15-12345.zip'),
}));

// Import after mocks are set up
import { POST } from './route';

function createRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/admin/orders/bulk-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/orders/bulk-download', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', user_metadata: { role: 'admin' } } },
      error: null,
    });

    // Default: mock database chain
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
    mockSelect.mockReturnValue({ in: mockIn });
    mockInsert.mockResolvedValue({ data: null, error: null });
    mockIn.mockResolvedValue({
      data: [
        {
          id: 'order-1',
          order_number: 'FP-2026-001',
          size: 'A4',
          transformed_image_url: 'https://storage.example.com/image1.jpg',
          transformed_image_key: 'transformed/order-1/image.jpg',
        },
        {
          id: 'order-2',
          order_number: 'FP-2026-002',
          size: 'A3',
          transformed_image_url: 'https://storage.example.com/image2.jpg',
          transformed_image_key: 'transformed/order-2/image.jpg',
        },
      ],
      error: null,
    });

    // Mock fetch for image retrieval
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    });
  });

  describe('Authentication (AC-009)', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = createRequest({ orderIds: ['order-1'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('נדרשת הרשאת מנהל');
    });

    it('should return 403 when user is not admin', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', user_metadata: { role: 'customer' } } },
        error: null,
      });

      const request = createRequest({ orderIds: ['order-1'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('נדרשת הרשאת מנהל');
    });
  });

  describe('Request Validation', () => {
    it('should return 400 when orderIds is missing', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('orderIds');
    });

    it('should return 400 when orderIds is empty', async () => {
      const request = createRequest({ orderIds: [] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 when orderIds is not an array', async () => {
      const request = createRequest({ orderIds: 'order-1' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('מערך');
    });

    it('should return 400 when orderIds exceeds maximum limit (AC-004)', async () => {
      const orderIds = Array.from({ length: 51 }, (_, i) => `order-${i}`);
      const request = createRequest({ orderIds });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('50');
      expect(data.error).toContain('מקסימום');
    });
  });

  describe('Order Fetching', () => {
    it('should return 404 when no orders found', async () => {
      mockIn.mockResolvedValue({ data: [], error: null });

      const request = createRequest({ orderIds: ['order-1'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('לא נמצאו');
    });

    it('should return 500 on database error', async () => {
      mockIn.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const request = createRequest({ orderIds: ['order-1'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('שגיאת מערכת');
    });

    it('should skip orders without transformed images (AC-005)', async () => {
      mockIn.mockResolvedValue({
        data: [
          {
            id: 'order-1',
            order_number: 'FP-2026-001',
            size: 'A4',
            transformed_image_url: 'https://storage.example.com/image1.jpg',
            transformed_image_key: 'transformed/order-1/image.jpg',
          },
          {
            id: 'order-2',
            order_number: 'FP-2026-002',
            size: 'A3',
            transformed_image_url: null,
            transformed_image_key: null,
          },
        ],
        error: null,
      });

      const request = createRequest({ orderIds: ['order-1', 'order-2'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.skipped).toContain('order-2');
    });
  });

  describe('Successful Download', () => {
    it('should return download URL for valid request', async () => {
      const request = createRequest({ orderIds: ['order-1', 'order-2'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.downloadUrl).toBeDefined();
    });

    it('should include file count in response', async () => {
      const request = createRequest({ orderIds: ['order-1', 'order-2'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fileCount).toBe(2);
    });

    it('should include expiration time', async () => {
      const request = createRequest({ orderIds: ['order-1'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expiresIn).toBeDefined();
      expect(typeof data.expiresIn).toBe('number');
    });

    it('should return ZIP filename', async () => {
      const request = createRequest({ orderIds: ['order-1'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fileName).toContain('.zip');
    });

    it('should organize files by order number in ZIP (AC-002)', async () => {
      const { createZipArchive } = await import('@/lib/fulfillment/zip-archive');

      const request = createRequest({ orderIds: ['order-1'] });
      await POST(request);

      // Verify createZipArchive was called with folder-organized names
      expect(vi.mocked(createZipArchive)).toHaveBeenCalled();
      const filesArg = vi.mocked(createZipArchive).mock.calls[0][0];
      const printFile = filesArg.find((f) => f.name.endsWith('.jpg'));
      expect(printFile?.name).toMatch(/^FP-2026-001\//);
    });

    it('should include manifest.json in ZIP (AC-003)', async () => {
      const { createZipArchive } = await import('@/lib/fulfillment/zip-archive');

      const request = createRequest({ orderIds: ['order-1'] });
      await POST(request);

      const filesArg = vi.mocked(createZipArchive).mock.calls[0][0];
      const manifest = filesArg.find((f) => f.name === 'manifest.json');
      expect(manifest).toBeDefined();

      const manifestData = JSON.parse(manifest!.buffer.toString());
      expect(manifestData.totalOrders).toBeDefined();
      expect(manifestData.entries).toBeDefined();
    });
  });

  describe('Partial Success', () => {
    it('should report skipped orders in response', async () => {
      mockIn.mockResolvedValue({
        data: [
          {
            id: 'order-1',
            order_number: 'FP-2026-001',
            size: 'A4',
            transformed_image_url: 'https://storage.example.com/image1.jpg',
            transformed_image_key: 'transformed/order-1/image.jpg',
          },
        ],
        error: null,
      });

      const request = createRequest({ orderIds: ['order-1', 'order-missing'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notFound).toContain('order-missing');
    });
  });

  describe('Audit Logging (AC-011)', () => {
    it('should log download to admin_audit_log', async () => {
      const request = createRequest({ orderIds: ['order-1', 'order-2'] });
      await POST(request);

      expect(mockFrom).toHaveBeenCalledWith('admin_audit_log');
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should return 400 when all images fail to fetch', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const request = createRequest({ orderIds: ['order-1'] });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('קבצי הדפסה');
    });
  });
});
