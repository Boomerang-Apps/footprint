/**
 * POST /api/admin/orders/bulk-download
 *
 * Downloads print-ready files for multiple orders as a ZIP archive.
 * Admin-only endpoint. - BE-08
 *
 * Request body:
 * {
 *   "orderIds": ["order-1", "order-2", ...]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "downloadUrl": "https://presigned...",
 *   "fileName": "print-files-2026-01-15.zip",
 *   "fileCount": 5,
 *   "expiresIn": 3600,
 *   "skipped": ["order-3"],  // Orders without transformed images
 *   "notFound": ["order-4"], // Orders not in database
 *   "failed": ["order-5"]    // Orders that failed to process
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { bulkDownloadSchema, parseRequestBody } from '@/lib/validation/admin';
import { uploadToR2, getDownloadUrl } from '@/lib/storage/r2';
import { getOrCreatePrintFile, isValidPrintSize, PrintSize } from '@/lib/orders/printFile';
import { createZipArchive, generateZipFileName } from '@/lib/fulfillment/zip-archive';

const ZIP_EXPIRES_IN = 3600; // 1 hour

interface BulkDownloadResponse {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  fileCount: number;
  expiresIn: number;
  skipped: string[];
  notFound: string[];
  failed: string[];
}

interface ErrorResponse {
  error: string;
}

interface OrderRecord {
  id: string;
  order_number: string;
  size: string;
  transformed_image_url: string | null;
  transformed_image_key: string | null;
}

interface ManifestEntry {
  orderId: string;
  orderNumber: string;
  size: string;
  fileName: string;
  status: 'included' | 'skipped' | 'failed';
  reason?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkDownloadResponse | ErrorResponse>> {
  // Rate limiting — 5/min for downloads (AC-010)
  const rateLimited = await checkRateLimit('download', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    // 1. Admin authorization (DB-backed)
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) return auth.error!;
    const user = auth.user!;

    const supabase = await createClient();

    // 2. Parse and validate request body
    const parsed = await parseRequestBody(request, bulkDownloadSchema);
    if (parsed.error) return parsed.error as NextResponse<ErrorResponse>;
    const { orderIds } = parsed.data;

    // 3. Fetch orders from database
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, size, transformed_image_url, transformed_image_key')
      .in('id', orderIds);

    if (fetchError) {
      logger.error('Failed to fetch orders', fetchError);
      return NextResponse.json(
        { error: 'שגיאת מערכת' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'לא נמצאו הזמנות' },
        { status: 404 }
      );
    }

    // 4. Track which orders were found and which weren't
    const foundOrderIds = new Set(orders.map((o: OrderRecord) => o.id));
    const notFound = orderIds.filter((id) => !foundOrderIds.has(id));

    // 5. Process each order and collect files
    const files: Array<{ name: string; buffer: Buffer }> = [];
    const skipped: string[] = [];
    const failed: string[] = [];
    const manifestEntries: ManifestEntry[] = [];

    for (const order of orders as OrderRecord[]) {
      const printSize = order.size || 'A4';

      // Skip orders without transformed images (AC-005)
      if (!order.transformed_image_url || !order.transformed_image_key) {
        skipped.push(order.id);
        manifestEntries.push({
          orderId: order.id,
          orderNumber: order.order_number,
          size: printSize,
          fileName: '',
          status: 'skipped',
          reason: 'No transformed image',
        });
        continue;
      }

      // Validate print size
      if (!isValidPrintSize(printSize)) {
        skipped.push(order.id);
        manifestEntries.push({
          orderId: order.id,
          orderNumber: order.order_number,
          size: printSize,
          fileName: '',
          status: 'skipped',
          reason: `Invalid print size: ${printSize}`,
        });
        continue;
      }

      try {
        // Fetch the transformed image (AC-007)
        const imageResponse = await fetch(order.transformed_image_url);
        if (!imageResponse.ok) {
          failed.push(order.id);
          manifestEntries.push({
            orderId: order.id,
            orderNumber: order.order_number,
            size: printSize,
            fileName: '',
            status: 'failed',
            reason: 'Failed to fetch image',
          });
          continue;
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Generate print-ready file
        const printFile = await getOrCreatePrintFile(
          imageBuffer,
          order.id,
          printSize as PrintSize
        );

        // Fetch the generated print file
        const printFileResponse = await fetch(printFile.downloadUrl);
        if (!printFileResponse.ok) {
          failed.push(order.id);
          manifestEntries.push({
            orderId: order.id,
            orderNumber: order.order_number,
            size: printSize,
            fileName: '',
            status: 'failed',
            reason: 'Failed to fetch print file',
          });
          continue;
        }

        const printFileBuffer = Buffer.from(await printFileResponse.arrayBuffer());

        // AC-002: Organize files by order number in folders
        // AC-008: Descriptive file naming
        const fileName = `${order.order_number}/${order.order_number}_${printSize}_print.jpg`;
        files.push({
          name: fileName,
          buffer: printFileBuffer,
        });

        manifestEntries.push({
          orderId: order.id,
          orderNumber: order.order_number,
          size: printSize,
          fileName,
          status: 'included',
        });
      } catch (error) {
        logger.error(`Failed to process order ${order.id}`, error);
        failed.push(order.id);
        manifestEntries.push({
          orderId: order.id,
          orderNumber: order.order_number,
          size: printSize,
          fileName: '',
          status: 'failed',
          reason: 'Processing error',
        });
      }
    }

    // 6. Check if we have any files to include
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'לא נמצאו קבצי הדפסה תקינים' },
        { status: 400 }
      );
    }

    // AC-003: Include manifest.json in ZIP
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalOrders: orderIds.length,
      included: files.length,
      skipped: skipped.length,
      failed: failed.length,
      notFound: notFound.length,
      entries: manifestEntries,
    };
    files.push({
      name: 'manifest.json',
      buffer: Buffer.from(JSON.stringify(manifest, null, 2)),
    });

    // 7. Create ZIP archive
    const zipBuffer = await createZipArchive(files);
    const zipFileName = generateZipFileName();

    // 8. Upload ZIP to R2 storage
    const uploadResult = await uploadToR2(
      zipBuffer,
      'bulk-downloads',
      zipFileName,
      'application/zip',
      'bulk-downloads'
    );

    // 9. Get presigned download URL
    const downloadUrl = await getDownloadUrl(uploadResult.key, ZIP_EXPIRES_IN);

    // 10. Audit log for download (AC-011)
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'bulk_download',
      details: {
        orderIds: orders.map((o: OrderRecord) => o.id),
        fileCount: files.length - 1, // exclude manifest
        skipped,
        failed,
        notFound,
      },
      created_at: new Date().toISOString(),
    });

    // 11. Return success response
    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: zipFileName,
      fileCount: files.length - 1, // exclude manifest from count
      expiresIn: ZIP_EXPIRES_IN,
      skipped,
      notFound,
      failed,
    });
  } catch (error) {
    logger.error('Bulk download error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
