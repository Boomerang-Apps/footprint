/**
 * API Client Abstraction Layer
 *
 * This module provides a unified API interface that can be backed by:
 * 1. Mock data (for development with NEXT_PUBLIC_USE_MOCK=true)
 * 2. Supabase (default - uses Next.js API routes)
 *
 * Usage:
 *   import { api } from '@/lib/api/client';
 *   const orders = await api.orders.list();
 */

import { mockClient } from './mock';
import { supabaseClient } from './supabase-client';
import type { ApiClient } from './types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Export the appropriate client based on environment
// In mock mode, use real API for orders (so DB orders are visible) but mock for everything else
export const api: ApiClient = USE_MOCK
  ? { ...mockClient, orders: supabaseClient.orders }
  : supabaseClient;

// Re-export types
export type { ApiClient } from './types';
