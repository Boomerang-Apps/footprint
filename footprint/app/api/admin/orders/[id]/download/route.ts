/**
 * GET /api/admin/orders/[id]/download
 *
 * Downloads a print-ready file for an order.
 * Admin-only endpoint.
 *
 * Query parameters:
 * - size: Print size (A5, A4, A3, A2) - required
 *
 * Response:
 * {
 *   "success": true,
 *   "downloadUrl": "https://presigned...",
 *   "fileName": "order_123_A4_print.jpg",
 *   "dimensions": {
 *     "width": 2480,
 *     "height": 3508,
 *     "dpi": 300
 *   },
 *   "expiresIn": 3600
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getOrCreatePrintFile,
  isValidPrintSize,
  PrintSize,
} from '@/lib/orders/printFile';
import { checkRateLimit } from '@/lib/rate-limit';

interface DownloadResponse {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  dimensions: {
    width: number;
    height: number;
    dpi: number;
  };
  expiresIn: number;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<DownloadResponse | ErrorResponse>> {
  // Rate limiting: general limit for admin routes
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    const orderId = params.id;

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

    // 3. Get and validate size parameter
    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size');

    if (!size) {
      return NextResponse.json(
        { error: 'Missing required query parameter: size' },
        { status: 400 }
      );
    }

    if (!isValidPrintSize(size)) {
      return NextResponse.json(
        { error: 'Invalid size. Must be one of: A5, A4, A3, A2' },
        { status: 400 }
      );
    }

    // 4. Fetch order from database
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, size, transformed_image_url, transformed_image_key')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 5. Verify order has transformed image
    if (!order.transformed_image_url || !order.transformed_image_key) {
      return NextResponse.json(
        { error: 'No transformed image available for this order' },
        { status: 400 }
      );
    }

    // 6. Fetch the transformed image for processing
    const imageResponse = await fetch(order.transformed_image_url);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch transformed image' },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // 7. Generate print-ready file and get download URL
    const printFile = await getOrCreatePrintFile(
      imageBuffer,
      orderId,
      size as PrintSize
    );

    // 8. Return success response
    return NextResponse.json({
      success: true,
      downloadUrl: printFile.downloadUrl,
      fileName: printFile.fileName,
      dimensions: printFile.dimensions,
      expiresIn: printFile.expiresIn,
    });
  } catch (error) {
    console.error('Print file download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate print file' },
      { status: 500 }
    );
  }
}
