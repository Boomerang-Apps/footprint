/**
 * Bulk Order Operations - BE-07
 *
 * Client-side utilities for bulk order operations.
 */

import { type FulfillmentStatus } from './status-transitions';

export interface BulkUpdateResult {
  success: boolean;
  updated: number;
  failed: number;
  errors?: Array<{ orderId: string; error: string }>;
}

/**
 * Update status for multiple orders at once
 */
export async function bulkUpdateStatus(
  orderIds: string[],
  newStatus: FulfillmentStatus
): Promise<BulkUpdateResult> {
  const response = await fetch('/api/admin/orders/bulk-status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderIds,
      status: newStatus,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }

  return response.json();
}

export interface BulkDownloadResult {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  fileCount: number;
  expiresIn: number;
  skipped: string[];
  notFound: string[];
  failed: string[];
}

/**
 * Request bulk download of print files for multiple orders
 * Returns the download URL and metadata
 */
export async function bulkDownloadPrintFiles(orderIds: string[]): Promise<BulkDownloadResult> {
  const response = await fetch('/api/admin/orders/bulk-download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderIds }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to download print files');
  }

  return response.json();
}

/**
 * Initiates the download of a ZIP file in the browser
 */
export function initiateDownload(downloadUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
