/**
 * API Client Abstraction Layer
 * 
 * This module provides a unified API interface that can be backed by:
 * 1. Mock data (for development)
 * 2. Uzerflow (when ready)
 * 
 * Usage:
 *   import { api } from '@/lib/api/client';
 *   const orders = await api.orders.list();
 */

import { mockClient } from './mock';
import { uzerflowClient } from './uzerflow';
import type { ApiClient } from './types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Export the appropriate client based on environment
export const api: ApiClient = USE_MOCK ? mockClient : uzerflowClient;

// Re-export types
export type { ApiClient } from './types';
