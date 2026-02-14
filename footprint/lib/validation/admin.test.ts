/**
 * Admin Validation Schema Tests
 * Story: SEC-01 - Security Hardening
 */

import { describe, it, expect } from 'vitest';
import {
  paginationSchema,
  ordersQuerySchema,
  usersQuerySchema,
  bulkStatusSchema,
  createShipmentSchema,
  parseQueryParams,
  parseRequestBody,
} from './admin';

describe('paginationSchema', () => {
  it('should accept valid pagination', () => {
    const result = paginationSchema.safeParse({ page: '2', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it('should default page to 1 and limit to 20', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('should reject page < 1', () => {
    const result = paginationSchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('should reject limit > 100', () => {
    const result = paginationSchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('should reject limit < 1', () => {
    const result = paginationSchema.safeParse({ limit: '0' });
    expect(result.success).toBe(false);
  });
});

describe('ordersQuerySchema', () => {
  it('should accept valid order query', () => {
    const result = ordersQuerySchema.safeParse({
      page: '1',
      limit: '20',
      status: 'shipped',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = ordersQuerySchema.safeParse({ status: 'invalid_status' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid sortBy', () => {
    const result = ordersQuerySchema.safeParse({ sortBy: 'password' });
    expect(result.success).toBe(false);
  });

  it('should accept search with max 200 chars', () => {
    const result = ordersQuerySchema.safeParse({ search: 'test' });
    expect(result.success).toBe(true);
  });

  it('should reject search over 200 chars', () => {
    const result = ordersQuerySchema.safeParse({ search: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });
});

describe('usersQuerySchema', () => {
  it('should accept valid user query', () => {
    const result = usersQuerySchema.safeParse({
      role: 'admin',
      sortBy: 'name',
    });
    expect(result.success).toBe(true);
  });

  it('should default role to all', () => {
    const result = usersQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('all');
    }
  });

  it('should reject invalid role', () => {
    const result = usersQuerySchema.safeParse({ role: 'superadmin' });
    expect(result.success).toBe(false);
  });
});

describe('bulkStatusSchema', () => {
  it('should accept valid bulk status request', () => {
    const result = bulkStatusSchema.safeParse({
      orderIds: ['550e8400-e29b-41d4-a716-446655440000'],
      status: 'printing',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty orderIds', () => {
    const result = bulkStatusSchema.safeParse({
      orderIds: [],
      status: 'printing',
    });
    expect(result.success).toBe(false);
  });

  it('should reject more than 100 orderIds', () => {
    const ids = Array.from({ length: 101 }, (_, i) =>
      `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`
    );
    const result = bulkStatusSchema.safeParse({
      orderIds: ids,
      status: 'printing',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUIDs', () => {
    const result = bulkStatusSchema.safeParse({
      orderIds: ['not-a-uuid'],
      status: 'printing',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid status', () => {
    const result = bulkStatusSchema.safeParse({
      orderIds: ['550e8400-e29b-41d4-a716-446655440000'],
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('createShipmentSchema', () => {
  it('should accept valid shipment request', () => {
    const result = createShipmentSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      carrier: 'israel_post',
      serviceType: 'express',
    });
    expect(result.success).toBe(true);
  });

  it('should default serviceType to registered', () => {
    const result = createShipmentSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.serviceType).toBe('registered');
    }
  });

  it('should reject invalid orderId', () => {
    const result = createShipmentSchema.safeParse({
      orderId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('parseQueryParams', () => {
  it('should return parsed data for valid params', () => {
    const params = new URLSearchParams({ page: '2', limit: '50' });
    const result = parseQueryParams(params, paginationSchema);
    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ page: 2, limit: 50 });
  });

  it('should return 400 error for invalid params', () => {
    const params = new URLSearchParams({ page: '0' });
    const result = parseQueryParams(params, paginationSchema);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });
});

describe('parseRequestBody', () => {
  it('should return parsed data for valid JSON', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderIds: ['550e8400-e29b-41d4-a716-446655440000'],
        status: 'printing',
      }),
    });
    const result = await parseRequestBody(request, bulkStatusSchema);
    expect(result.error).toBeUndefined();
    expect(result.data?.orderIds).toHaveLength(1);
  });

  it('should return 400 for invalid JSON', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      body: 'not json',
    });
    const result = await parseRequestBody(request, bulkStatusSchema);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should return 400 for valid JSON but invalid schema', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderIds: ['not-uuid'],
        status: 'invalid',
      }),
    });
    const result = await parseRequestBody(request, bulkStatusSchema);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });
});
