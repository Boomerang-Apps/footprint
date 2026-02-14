/**
 * Zod validation schemas for Admin API routes
 * Story: SEC-01 - Security Hardening
 */

import { z } from 'zod';
import { NextResponse } from 'next/server';

// ============================================================================
// Shared schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

// ============================================================================
// Orders query
// ============================================================================

const ORDER_STATUSES = [
  'pending', 'paid', 'processing', 'printing',
  'shipped', 'delivered', 'cancelled',
] as const;

const ORDER_SORT_FIELDS = [
  'created_at', 'updated_at', 'total', 'status', 'order_number',
] as const;

export const ordersQuerySchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(ORDER_SORT_FIELDS).default('created_at'),
  sortOrder: sortOrderSchema,
});

export type OrdersQueryInput = z.infer<typeof ordersQuerySchema>;

// ============================================================================
// Users query
// ============================================================================

const USER_ROLES = ['all', 'admin', 'user'] as const;

const USER_SORT_FIELDS = [
  'created_at', 'name', 'order_count', 'email',
] as const;

export const usersQuerySchema = paginationSchema.extend({
  search: z.string().max(200).optional(),
  role: z.enum(USER_ROLES).default('all'),
  registeredFrom: z.string().optional(),
  registeredTo: z.string().optional(),
  sortBy: z.enum(USER_SORT_FIELDS).default('created_at'),
  sortOrder: sortOrderSchema,
});

export type UsersQueryInput = z.infer<typeof usersQuerySchema>;

// ============================================================================
// Bulk status update
// ============================================================================

const FULFILLMENT_STATUSES = [
  'pending', 'printing', 'ready_to_ship',
  'shipped', 'delivered', 'cancelled',
] as const;

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const bulkStatusSchema = z.object({
  orderIds: z.array(z.string().regex(uuidRegex, 'Invalid UUID')).min(1).max(100),
  status: z.enum(FULFILLMENT_STATUSES),
});

export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;

// ============================================================================
// Create shipment
// ============================================================================

const CARRIERS = ['israel_post', 'dhl', 'fedex', 'ups', 'other'] as const;
const SERVICE_TYPES = ['standard', 'express', 'registered'] as const;

export const createShipmentSchema = z.object({
  orderId: z.string().regex(uuidRegex, 'Invalid UUID'),
  carrier: z.enum(CARRIERS).optional(),
  serviceType: z.enum(SERVICE_TYPES).default('registered'),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;

// ============================================================================
// Fulfillment orders query
// ============================================================================

const PRINT_SIZES = ['A5', 'A4', 'A3', 'A2'] as const;
const PAPER_TYPES = ['matte', 'glossy', 'canvas'] as const;
const FRAME_TYPES = ['none', 'black', 'white', 'oak'] as const;

export const fulfillmentOrdersQuerySchema = paginationSchema.extend({
  status: z.enum(FULFILLMENT_STATUSES).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().max(200).optional(),
  size: z.enum(PRINT_SIZES).optional(),
  paper: z.enum(PAPER_TYPES).optional(),
  frame: z.enum(FRAME_TYPES).optional(),
});

export type FulfillmentOrdersQueryInput = z.infer<typeof fulfillmentOrdersQuerySchema>;

// ============================================================================
// Shipments list query
// ============================================================================

export const shipmentsQuerySchema = paginationSchema.extend({
  orderId: z.string().regex(uuidRegex, 'Invalid UUID').optional(),
});

export type ShipmentsQueryInput = z.infer<typeof shipmentsQuerySchema>;

// ============================================================================
// Shipment quote query
// ============================================================================

export const shipmentQuoteSchema = z.object({
  orderId: z.string().regex(uuidRegex, 'Invalid UUID'),
  carrier: z.enum(CARRIERS).optional(),
});

export type ShipmentQuoteInput = z.infer<typeof shipmentQuoteSchema>;

// ============================================================================
// Order status update
// ============================================================================

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(500).optional(),
});

export type OrderStatusInput = z.infer<typeof orderStatusSchema>;

// ============================================================================
// Fulfillment status update
// ============================================================================

export const fulfillmentStatusSchema = z.object({
  status: z.enum(FULFILLMENT_STATUSES),
  note: z.string().max(500).optional(),
});

export type FulfillmentStatusInput = z.infer<typeof fulfillmentStatusSchema>;

// ============================================================================
// Tracking update
// ============================================================================

export const trackingSchema = z.object({
  trackingNumber: z.string().min(1).max(100),
  carrier: z.enum(CARRIERS),
  note: z.string().max(500).optional(),
});

export type TrackingInput = z.infer<typeof trackingSchema>;

// ============================================================================
// Refund
// ============================================================================

export const refundSchema = z.object({
  amount: z.number().int().min(1).max(10_000_000),
  reason: z.string().max(500).optional(),
});

export type RefundInput = z.infer<typeof refundSchema>;

// ============================================================================
// Download query
// ============================================================================

export const downloadQuerySchema = z.object({
  size: z.enum(PRINT_SIZES),
});

export type DownloadQueryInput = z.infer<typeof downloadQuerySchema>;

// ============================================================================
// Bulk download
// ============================================================================

export const bulkDownloadSchema = z.object({
  orderIds: z.array(z.string().regex(uuidRegex, 'Invalid UUID')).min(1).max(50),
});

export type BulkDownloadInput = z.infer<typeof bulkDownloadSchema>;

// ============================================================================
// User role update
// ============================================================================

export const userRoleSchema = z.object({
  isAdmin: z.boolean(),
});

export type UserRoleInput = z.infer<typeof userRoleSchema>;

// ============================================================================
// User status update
// ============================================================================

const USER_STATUSES = ['active', 'inactive', 'suspended'] as const;

export const userStatusSchema = z.object({
  status: z.enum(USER_STATUSES),
});

export type UserStatusInput = z.infer<typeof userStatusSchema>;

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Parses URL search params against a Zod schema.
 * Returns parsed data or a 400 Response.
 */
export function parseQueryParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): { data: z.infer<T>; error?: undefined } | { data?: undefined; error: NextResponse } {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  const result = schema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues.map(
      (i) => `${i.path.join('.')}: ${i.message}`
    );
    return {
      error: NextResponse.json(
        { error: 'Invalid query parameters', details: messages },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}

/**
 * Parses a JSON request body against a Zod schema.
 * Returns parsed data or a 400 Response.
 */
export async function parseRequestBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T>; error?: undefined } | { data?: undefined; error: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      error: NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.issues.map(
      (i) => `${i.path.join('.')}: ${i.message}`
    );
    return {
      error: NextResponse.json(
        { error: 'Invalid request body', details: messages },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}
