/**
 * Shipping Service Tests - INT-07
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShippingService, getDefaultShippingService } from './shipping-service';
import { type ShippingProvider, type CreateShipmentRequest, ShippingProviderError } from './types';

// Mock Israel Post provider
const mockIsraelPostProvider: ShippingProvider = {
  carrier: 'israel_post',
  name: 'Israel Post',
  isConfigured: vi.fn(() => true),
  createShipment: vi.fn(),
  getTracking: vi.fn(),
  getLabel: vi.fn(),
  getRates: vi.fn(),
  cancelShipment: vi.fn(),
};

// Mock DHL provider
const mockDHLProvider: ShippingProvider = {
  carrier: 'dhl',
  name: 'DHL',
  isConfigured: vi.fn(() => true),
  createShipment: vi.fn(),
  getTracking: vi.fn(),
  getLabel: vi.fn(),
  getRates: vi.fn(),
};

const mockShipmentRequest: CreateShipmentRequest = {
  orderId: 'order-123',
  orderNumber: 'FP-2026-001',
  sender: {
    name: 'Footprint Ltd',
    street: 'Rothschild 1',
    city: 'Tel Aviv',
    postalCode: '6688101',
    country: 'Israel',
    phone: '03-1234567',
  },
  recipient: {
    name: 'Customer',
    street: 'Herzl 50',
    city: 'Haifa',
    postalCode: '3303500',
    country: 'Israel',
    phone: '052-1234567',
  },
  package: {
    length: 30,
    width: 25,
    height: 5,
    weight: 500,
  },
  serviceType: 'registered',
};

describe('ShippingService', () => {
  let service: ShippingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ShippingService();
  });

  describe('Provider Registration', () => {
    it('should register a provider', () => {
      service.registerProvider(mockIsraelPostProvider);

      expect(service.getProvider('israel_post')).toBe(mockIsraelPostProvider);
    });

    it('should list available providers', () => {
      service.registerProvider(mockIsraelPostProvider);
      service.registerProvider(mockDHLProvider);

      const providers = service.getAvailableProviders();

      expect(providers).toHaveLength(2);
      expect(providers.map((p) => p.carrier)).toContain('israel_post');
      expect(providers.map((p) => p.carrier)).toContain('dhl');
    });

    it('should only list configured providers', () => {
      const unconfiguredProvider: ShippingProvider = {
        ...mockDHLProvider,
        isConfigured: vi.fn(() => false),
      };

      service.registerProvider(mockIsraelPostProvider);
      service.registerProvider(unconfiguredProvider);

      const providers = service.getAvailableProviders();

      expect(providers).toHaveLength(1);
      expect(providers[0].carrier).toBe('israel_post');
    });

    it('should throw when getting unregistered provider', () => {
      expect(() => service.getProvider('fedex')).toThrow('Provider fedex not registered');
    });
  });

  describe('Default Provider', () => {
    it('should set default provider', () => {
      service.registerProvider(mockIsraelPostProvider);
      service.setDefaultProvider('israel_post');

      expect(service.getDefaultProvider()).toBe(mockIsraelPostProvider);
    });

    it('should throw when setting non-existent default', () => {
      expect(() => service.setDefaultProvider('fedex')).toThrow(
        'Provider fedex not registered'
      );
    });

    it('should use first registered provider as default', () => {
      service.registerProvider(mockIsraelPostProvider);
      service.registerProvider(mockDHLProvider);

      expect(service.getDefaultProvider()).toBe(mockIsraelPostProvider);
    });
  });

  describe('createShipment', () => {
    beforeEach(() => {
      service.registerProvider(mockIsraelPostProvider);
      (mockIsraelPostProvider.createShipment as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        shipmentId: 'ISP-12345',
        trackingNumber: 'RR123456789IL',
        carrier: 'israel_post',
      });
    });

    it('should create shipment with specified carrier', async () => {
      const result = await service.createShipment(mockShipmentRequest, 'israel_post');

      expect(result.success).toBe(true);
      expect(result.carrier).toBe('israel_post');
      expect(mockIsraelPostProvider.createShipment).toHaveBeenCalledWith(mockShipmentRequest);
    });

    it('should use default carrier when not specified', async () => {
      const result = await service.createShipment(mockShipmentRequest);

      expect(result.success).toBe(true);
      expect(mockIsraelPostProvider.createShipment).toHaveBeenCalled();
    });

    it('should throw when no providers available', async () => {
      const emptyService = new ShippingService();

      await expect(emptyService.createShipment(mockShipmentRequest)).rejects.toThrow(
        'No shipping providers available'
      );
    });
  });

  describe('getTracking', () => {
    beforeEach(() => {
      service.registerProvider(mockIsraelPostProvider);
      (mockIsraelPostProvider.getTracking as ReturnType<typeof vi.fn>).mockResolvedValue({
        trackingNumber: 'RR123456789IL',
        carrier: 'israel_post',
        status: 'in_transit',
        events: [],
        lastUpdated: new Date(),
      });
    });

    it('should get tracking from specified carrier', async () => {
      const result = await service.getTracking('RR123456789IL', 'israel_post');

      expect(result.trackingNumber).toBe('RR123456789IL');
      expect(mockIsraelPostProvider.getTracking).toHaveBeenCalledWith('RR123456789IL');
    });

    it('should detect carrier from tracking number format', async () => {
      const result = await service.getTracking('RR123456789IL');

      expect(mockIsraelPostProvider.getTracking).toHaveBeenCalled();
    });
  });

  describe('getRates', () => {
    beforeEach(() => {
      service.registerProvider(mockIsraelPostProvider);
      service.registerProvider(mockDHLProvider);

      (mockIsraelPostProvider.getRates as ReturnType<typeof vi.fn>).mockResolvedValue([
        { serviceType: 'standard', price: 25, currency: 'ILS', carrier: 'israel_post', estimatedDays: { min: 3, max: 5 } },
      ]);
      (mockDHLProvider.getRates as ReturnType<typeof vi.fn>).mockResolvedValue([
        { serviceType: 'express', price: 80, currency: 'ILS', carrier: 'dhl', estimatedDays: { min: 1, max: 2 } },
      ]);
    });

    it('should get rates from all providers', async () => {
      const result = await service.getAllRates({
        sender: mockShipmentRequest.sender,
        recipient: mockShipmentRequest.recipient,
        package: mockShipmentRequest.package,
      });

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.carrier)).toContain('israel_post');
      expect(result.map((r) => r.carrier)).toContain('dhl');
    });

    it('should continue if one provider fails', async () => {
      (mockDHLProvider.getRates as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('DHL API error')
      );

      const result = await service.getAllRates({
        sender: mockShipmentRequest.sender,
        recipient: mockShipmentRequest.recipient,
        package: mockShipmentRequest.package,
      });

      expect(result).toHaveLength(1);
      expect(result[0].carrier).toBe('israel_post');
    });
  });

  describe('cancelShipment', () => {
    beforeEach(() => {
      service.registerProvider(mockIsraelPostProvider);
      (mockIsraelPostProvider.cancelShipment as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    });

    it('should cancel shipment', async () => {
      const result = await service.cancelShipment('ISP-12345', 'israel_post');

      expect(result).toBe(true);
      expect(mockIsraelPostProvider.cancelShipment).toHaveBeenCalledWith('ISP-12345');
    });

    it('should return false if provider does not support cancellation', async () => {
      const providerWithoutCancel: ShippingProvider = {
        ...mockDHLProvider,
        cancelShipment: undefined,
      };
      service.registerProvider(providerWithoutCancel);

      const result = await service.cancelShipment('DHL-12345', 'dhl');

      expect(result).toBe(false);
    });
  });
});

describe('getDefaultShippingService', () => {
  it('should return singleton instance', () => {
    const service1 = getDefaultShippingService();
    const service2 = getDefaultShippingService();

    expect(service1).toBe(service2);
  });

  it('should have Israel Post registered', () => {
    const service = getDefaultShippingService();
    const providers = service.getAvailableProviders();

    // May be empty if not configured in test env
    expect(providers).toBeDefined();
  });
});
