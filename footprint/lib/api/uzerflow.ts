/**
 * Uzerflow API Client
 * 
 * This client will connect to Uzerflow when it's ready.
 * For now, it throws errors to ensure we're using the mock client during development.
 * 
 * TODO: Implement when Uzerflow API is available
 */

import type { ApiClient } from './types';

const UZERFLOW_API_URL = process.env.UZERFLOW_API_URL;
const UZERFLOW_API_KEY = process.env.UZERFLOW_API_KEY;

// Helper for API requests
async function uzerflowFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!UZERFLOW_API_URL || !UZERFLOW_API_KEY) {
    throw new Error('Uzerflow is not configured. Set UZERFLOW_API_URL and UZERFLOW_API_KEY.');
  }

  const response = await fetch(`${UZERFLOW_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${UZERFLOW_API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Uzerflow API error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// UZERFLOW CLIENT IMPLEMENTATION
// ============================================

export const uzerflowClient: ApiClient = {
  // Authentication
  auth: {
    async login({ email, password }) {
      return uzerflowFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    async register({ email, password, name, phone }) {
      return uzerflowFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, phone }),
      });
    },

    async logout() {
      await uzerflowFetch('/auth/logout', { method: 'POST' });
    },

    async getSession() {
      try {
        return await uzerflowFetch('/auth/session');
      } catch {
        return null;
      }
    },

    async resetPassword(email) {
      await uzerflowFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  },

  // Orders
  orders: {
    async create(input) {
      return uzerflowFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async get(id) {
      return uzerflowFetch(`/orders/${id}`);
    },

    async list(userId) {
      const query = userId ? `?userId=${userId}` : '';
      return uzerflowFetch(`/orders${query}`);
    },

    async updateStatus(id, status) {
      return uzerflowFetch(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    async addTracking(id, trackingNumber, carrier) {
      return uzerflowFetch(`/orders/${id}/tracking`, {
        method: 'PATCH',
        body: JSON.stringify({ trackingNumber, carrier }),
      });
    },
  },

  // Products
  products: {
    async getStyles() {
      return uzerflowFetch('/products/styles');
    },

    async getSizes() {
      return uzerflowFetch('/products/sizes');
    },

    async getPapers() {
      return uzerflowFetch('/products/papers');
    },

    async getFrames() {
      return uzerflowFetch('/products/frames');
    },

    async calculatePrice(config) {
      return uzerflowFetch('/products/calculate-price', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    },
  },

  // Users
  users: {
    async get(id) {
      return uzerflowFetch(`/users/${id}`);
    },

    async update(id, data) {
      return uzerflowFetch(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async getAddresses(userId) {
      return uzerflowFetch(`/users/${userId}/addresses`);
    },

    async addAddress(userId, address) {
      return uzerflowFetch(`/users/${userId}/addresses`, {
        method: 'POST',
        body: JSON.stringify(address),
      });
    },
  },
};
