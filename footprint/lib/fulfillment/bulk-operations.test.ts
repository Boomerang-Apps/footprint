/**
 * Bulk Operations Tests - BE-07
 *
 * Tests for client-side bulk order operation utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  bulkUpdateStatus,
  bulkDownloadPrintFiles,
  initiateDownload,
  type BulkUpdateResult,
  type BulkDownloadResult,
} from './bulk-operations';

describe('lib/fulfillment/bulk-operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('bulkUpdateStatus', () => {
    it('should send PATCH request with correct body', async () => {
      const mockResult: BulkUpdateResult = {
        success: true,
        updated: 3,
        failed: 0,
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });
      vi.stubGlobal('fetch', mockFetch);

      await bulkUpdateStatus(['order-1', 'order-2', 'order-3'], 'printing');

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/orders/bulk-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: ['order-1', 'order-2', 'order-3'],
          status: 'printing',
        }),
      });
    });

    it('should return BulkUpdateResult on success', async () => {
      const mockResult: BulkUpdateResult = {
        success: true,
        updated: 2,
        failed: 1,
        errors: [{ orderId: 'order-3', error: 'Invalid transition' }],
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await bulkUpdateStatus(['order-1', 'order-2', 'order-3'], 'shipped');

      expect(result).toEqual(mockResult);
      expect(result.success).toBe(true);
      expect(result.updated).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should throw error when response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(
        bulkUpdateStatus(['order-1'], 'printing')
      ).rejects.toThrow('Failed to update order status');
    });

    it('should handle empty orderIds array', async () => {
      const mockResult: BulkUpdateResult = {
        success: true,
        updated: 0,
        failed: 0,
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await bulkUpdateStatus([], 'printing');

      expect(result.updated).toBe(0);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/orders/bulk-status',
        expect.objectContaining({
          body: JSON.stringify({ orderIds: [], status: 'printing' }),
        })
      );
    });
  });

  describe('bulkDownloadPrintFiles', () => {
    it('should send POST request with correct body', async () => {
      const mockResult: BulkDownloadResult = {
        success: true,
        downloadUrl: 'https://storage.example.com/downloads/batch-123.zip',
        fileName: 'print-files-2024-01-15.zip',
        fileCount: 3,
        expiresIn: 3600,
        skipped: [],
        notFound: [],
        failed: [],
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });
      vi.stubGlobal('fetch', mockFetch);

      await bulkDownloadPrintFiles(['order-1', 'order-2', 'order-3']);

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/orders/bulk-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: ['order-1', 'order-2', 'order-3'],
        }),
      });
    });

    it('should return BulkDownloadResult on success', async () => {
      const mockResult: BulkDownloadResult = {
        success: true,
        downloadUrl: 'https://storage.example.com/downloads/batch-123.zip',
        fileName: 'print-files-2024-01-15.zip',
        fileCount: 2,
        expiresIn: 3600,
        skipped: ['order-3'],
        notFound: [],
        failed: [],
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await bulkDownloadPrintFiles(['order-1', 'order-2', 'order-3']);

      expect(result).toEqual(mockResult);
      expect(result.success).toBe(true);
      expect(result.downloadUrl).toBeTruthy();
      expect(result.fileName).toBeTruthy();
      expect(result.fileCount).toBe(2);
      expect(result.skipped).toEqual(['order-3']);
    });

    it('should throw error with API error message when response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'No valid print files found' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(
        bulkDownloadPrintFiles(['order-1'])
      ).rejects.toThrow('No valid print files found');
    });

    it('should throw generic error when response is not ok and json parse fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(
        bulkDownloadPrintFiles(['order-1'])
      ).rejects.toThrow('Failed to download print files');
    });

    it('should throw generic error when response has no error field', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(
        bulkDownloadPrintFiles(['order-1'])
      ).rejects.toThrow('Failed to download print files');
    });
  });

  describe('initiateDownload', () => {
    it('should create an anchor element and trigger download', () => {
      const mockClick = vi.fn();
      const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      initiateDownload('https://storage.example.com/file.zip', 'print-files.zip');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('https://storage.example.com/file.zip');
      expect(mockLink.download).toBe('print-files.zip');
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalledOnce();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });

    it('should set href and download attributes correctly', () => {
      const mockClick = vi.fn();
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      const testUrl = 'https://cdn.example.com/downloads/batch-abc.zip';
      const testFileName = 'orders-2024-01-15.zip';

      initiateDownload(testUrl, testFileName);

      expect(mockLink.href).toBe(testUrl);
      expect(mockLink.download).toBe(testFileName);
    });

    it('should remove the link element after clicking', () => {
      const callOrder: string[] = [];
      const mockLink = {
        href: '',
        download: '',
        click: () => callOrder.push('click'),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        callOrder.push('appendChild');
        return node;
      });
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
        callOrder.push('removeChild');
        return node;
      });

      initiateDownload('https://example.com/file.zip', 'file.zip');

      // Verify order: appendChild -> click -> removeChild
      expect(callOrder).toEqual(['appendChild', 'click', 'removeChild']);
    });
  });
});
