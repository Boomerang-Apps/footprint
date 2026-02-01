/**
 * Israel Post Shipping Provider Tests - INT-07
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  IsraelPostProvider,
  mapIsraelPostStatus,
  parseIsraelPostResponse,
} from './israel-post';
import {
  type CreateShipmentRequest,
  type ShippingAddress,
  type PackageDimensions,
  ShippingProviderError,
} from './types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSenderAddress: ShippingAddress = {
  name: 'Footprint Ltd',
  company: 'Footprint',
  street: 'Rothschild 1',
  city: 'Tel Aviv',
  postalCode: '6688101',
  country: 'Israel',
  phone: '03-1234567',
  email: 'shop@footprint.co.il',
};

const mockRecipientAddress: ShippingAddress = {
  name: 'ישראל ישראלי',
  street: 'הרצל 50',
  city: 'חיפה',
  postalCode: '3303500',
  country: 'Israel',
  phone: '052-1234567',
  email: 'customer@example.com',
};

const mockPackage: PackageDimensions = {
  length: 30,
  width: 25,
  height: 5,
  weight: 500,
};

const mockShipmentRequest: CreateShipmentRequest = {
  orderId: 'order-123',
  orderNumber: 'FP-2026-001',
  sender: mockSenderAddress,
  recipient: mockRecipientAddress,
  package: mockPackage,
  serviceType: 'registered',
  declaredValue: 250,
  description: 'Baby footprint art',
};

describe('IsraelPostProvider', () => {
  let provider: IsraelPostProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    vi.stubEnv('ISRAEL_POST_API_KEY', 'test-api-key');
    vi.stubEnv('ISRAEL_POST_CUSTOMER_ID', 'test-customer-id');
    provider = new IsraelPostProvider();
  });

  describe('Configuration', () => {
    it('should have correct carrier code', () => {
      expect(provider.carrier).toBe('israel_post');
    });

    it('should have correct provider name', () => {
      expect(provider.name).toBe('Israel Post');
    });

    it('should report configured when env vars present', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('should report not configured when env vars missing', () => {
      vi.stubEnv('ISRAEL_POST_API_KEY', '');
      const unconfiguredProvider = new IsraelPostProvider();
      expect(unconfiguredProvider.isConfigured()).toBe(false);
    });
  });

  describe('createShipment', () => {
    it('should create shipment successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            shipmentId: 'ISP-12345',
            trackingNumber: 'RR123456789IL',
            labelUrl: 'https://israelpost.co.il/labels/ISP-12345.pdf',
          }),
      });

      const result = await provider.createShipment(mockShipmentRequest);

      expect(result.success).toBe(true);
      expect(result.shipmentId).toBe('ISP-12345');
      expect(result.trackingNumber).toBe('RR123456789IL');
      expect(result.carrier).toBe('israel_post');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: 'Invalid address',
            code: 'INVALID_ADDRESS',
          }),
      });

      await expect(provider.createShipment(mockShipmentRequest)).rejects.toThrow(
        ShippingProviderError
      );
    });

    it('should throw error when not configured', async () => {
      vi.stubEnv('ISRAEL_POST_API_KEY', '');
      const unconfiguredProvider = new IsraelPostProvider();

      await expect(
        unconfiguredProvider.createShipment(mockShipmentRequest)
      ).rejects.toThrow('Israel Post provider is not configured');
    });

    it('should include service type in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            shipmentId: 'ISP-12345',
            trackingNumber: 'RR123456789IL',
          }),
      });

      await provider.createShipment({
        ...mockShipmentRequest,
        serviceType: 'express',
      });

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.serviceType).toBe('express');
    });
  });

  describe('getTracking', () => {
    it('should return tracking details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            trackingNumber: 'RR123456789IL',
            status: 'IN_TRANSIT',
            events: [
              {
                timestamp: '2026-01-15T10:30:00Z',
                status: 'ACCEPTED',
                location: 'Tel Aviv',
                description: 'Package accepted at post office',
              },
              {
                timestamp: '2026-01-15T14:00:00Z',
                status: 'IN_TRANSIT',
                location: 'Haifa',
                description: 'Package in transit',
              },
            ],
          }),
      });

      const result = await provider.getTracking('RR123456789IL');

      expect(result.trackingNumber).toBe('RR123456789IL');
      expect(result.carrier).toBe('israel_post');
      expect(result.status).toBe('in_transit');
      expect(result.events).toHaveLength(2);
    });

    it('should throw error for invalid tracking number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            error: 'Tracking number not found',
          }),
      });

      await expect(provider.getTracking('INVALID123')).rejects.toThrow(
        ShippingProviderError
      );
    });
  });

  describe('getLabel', () => {
    it('should return label data', async () => {
      const mockLabelData = 'JVBERi0xLjQK...'; // Mock base64 PDF
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            format: 'pdf',
            data: mockLabelData,
            url: 'https://israelpost.co.il/labels/ISP-12345.pdf',
          }),
      });

      const result = await provider.getLabel({
        shipmentId: 'ISP-12345',
        format: 'pdf',
      });

      expect(result.format).toBe('pdf');
      expect(result.data).toBe(mockLabelData);
      expect(result.url).toBeDefined();
    });
  });

  describe('getRates', () => {
    it('should return rate quotes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            rates: [
              {
                serviceType: 'standard',
                price: 25,
                currency: 'ILS',
                minDays: 3,
                maxDays: 5,
              },
              {
                serviceType: 'registered',
                price: 35,
                currency: 'ILS',
                minDays: 2,
                maxDays: 4,
              },
              {
                serviceType: 'express',
                price: 55,
                currency: 'ILS',
                minDays: 1,
                maxDays: 2,
              },
            ],
          }),
      });

      const result = await provider.getRates({
        sender: mockSenderAddress,
        recipient: mockRecipientAddress,
        package: mockPackage,
      });

      expect(result).toHaveLength(3);
      expect(result[0].carrier).toBe('israel_post');
      expect(result[0].currency).toBe('ILS');
    });
  });

  describe('cancelShipment', () => {
    it('should cancel shipment successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Shipment cancelled',
          }),
      });

      const result = await provider.cancelShipment!('ISP-12345');

      expect(result).toBe(true);
    });

    it('should return false if cancellation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Shipment already in transit',
          }),
      });

      const result = await provider.cancelShipment!('ISP-12345');

      expect(result).toBe(false);
    });
  });
});

describe('mapIsraelPostStatus', () => {
  it('should map ACCEPTED to picked_up', () => {
    expect(mapIsraelPostStatus('ACCEPTED')).toBe('picked_up');
  });

  it('should map IN_TRANSIT to in_transit', () => {
    expect(mapIsraelPostStatus('IN_TRANSIT')).toBe('in_transit');
  });

  it('should map OUT_FOR_DELIVERY to out_for_delivery', () => {
    expect(mapIsraelPostStatus('OUT_FOR_DELIVERY')).toBe('out_for_delivery');
  });

  it('should map DELIVERED to delivered', () => {
    expect(mapIsraelPostStatus('DELIVERED')).toBe('delivered');
  });

  it('should map RETURNED to returned', () => {
    expect(mapIsraelPostStatus('RETURNED')).toBe('returned');
  });

  it('should map FAILED_DELIVERY to failed_delivery', () => {
    expect(mapIsraelPostStatus('FAILED_DELIVERY')).toBe('failed_delivery');
  });

  it('should map unknown status to pending', () => {
    expect(mapIsraelPostStatus('UNKNOWN_STATUS')).toBe('pending');
  });
});

describe('parseIsraelPostResponse', () => {
  it('should parse successful response', () => {
    const response = {
      success: true,
      data: { value: 'test' },
    };

    const result = parseIsraelPostResponse(response);
    expect(result).toEqual({ value: 'test' });
  });

  it('should throw on error response', () => {
    const response = {
      success: false,
      error: 'Something went wrong',
      code: 'ERROR_CODE',
    };

    expect(() => parseIsraelPostResponse(response)).toThrow(
      ShippingProviderError
    );
  });
});
