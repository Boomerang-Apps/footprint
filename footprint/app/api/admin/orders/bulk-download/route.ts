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
import { checkRateLimit } from '@/lib/rate-limit';
import { uploadToR2, getDownloadUrl } from '@/lib/storage/r2';
import { getOrCreatePrintFile, isValidPrintSize, PrintSize } from '@/lib/orders/printFile';
import { createZipArchive, generateZipFileName } from '@/lib/fulfillment/zip-archive';

const MAX_ORDERS = 50;
const ZIP_EXPIRES_IN = 3600; // 1 hour

interface BulkDownloadRequest {
  orderIds: string[];
}

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

export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkDownloadResponse | ErrorResponse>> {
  // Rate limiting
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    // 1. Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Check admin role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    let body: BulkDownloadRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { orderIds } = body;

    if (!orderIds) {
      return NextResponse.json(
        { error: 'Missing required field: orderIds' },
        { status: 400 }
      );
    }

    if (!Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: 'orderIds must be an array' },
        { status: 400 }
      );
    }

    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: 'orderIds must contain at least one order ID' },
        { status: 400 }
      );
    }

    if (orderIds.length > MAX_ORDERS) {
      return NextResponse.json(
        { error: `Cannot download more than ${MAX_ORDERS} orders at once` },
        { status: 400 }
      );
    }

    // 4. Fetch orders from database
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, size, transformed_image_url, transformed_image_key')
      .in('id', orderIds);

    if (fetchError) {
      console.error('Failed to fetch orders:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch orders from database' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found for the provided IDs' },
        { status: 404 }
      );
    }

    // 5. Track which orders were found and which weren't
    const foundOrderIds = new Set(orders.map((o: OrderRecord) => o.id));
    const notFound = orderIds.filter((id) => !foundOrderIds.has(id));

    // 6. Process each order and collect files
    const files: Array<{ name: string; buffer: Buffer }> = [];
    const skipped: string[] = [];
    const failed: string[] = [];

    for (const order of orders as OrderRecord[]) {
      // Skip orders without transformed images
      if (!order.transformed_image_url || !order.transformed_image_key) {
        skipped.push(order.id);
        continue;
      }

      // Validate print size
      const printSize = order.size || 'A4';
      if (!isValidPrintSize(printSize)) {
        skipped.push(order.id);
        continue;
      }

      try {
        // Fetch the transformed image
        const imageResponse = await fetch(order.transformed_image_url);
        if (!imageResponse.ok) {
          failed.push(order.id);
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
          continue;
        }

        const printFileBuffer = Buffer.from(await printFileResponse.arrayBuffer());

        // Add to files list with a descriptive name
        files.push({
          name: `${order.order_number}_${printSize}_print.jpg`,
          buffer: printFileBuffer,
        });
      } catch (error) {
        console.error(`Failed to process order ${order.id}:`, error);
        failed.push(order.id);
      }
    }

    // 7. Check if we have any files to include
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No valid print files could be generated' },
        { status: 400 }
      );
    }

    // 8. Create ZIP archive
    const zipBuffer = await createZipArchive(files);
    const zipFileName = generateZipFileName();

    // 9. Upload ZIP to R2 storage
    const uploadResult = await uploadToR2(
      zipBuffer,
      'bulk-downloads',
      zipFileName,
      'application/zip',
      'bulk-downloads'
    );

    // 10. Get presigned download URL
    const downloadUrl = await getDownloadUrl(uploadResult.key, ZIP_EXPIRES_IN);

    // 11. Return success response
    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: zipFileName,
      fileCount: files.length,
      expiresIn: ZIP_EXPIRES_IN,
      skipped,
      notFound,
      failed,
    });
  } catch (error) {
    console.error('Bulk download error:', error);
    return NextResponse.json(
      { error: 'Failed to create bulk download' },
      { status: 500 }
    );
  }
}
