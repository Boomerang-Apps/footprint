/**
 * Shipping Service - INT-07
 *
 * Central service for managing shipping providers and operations.
 * Provides a unified interface for all shipping operations.
 */

import { type CarrierCode } from '../tracking';
import {
  type ShippingProvider,
  type CreateShipmentRequest,
  type CreateShipmentResult,
  type TrackingDetails,
  type GetLabelRequest,
  type LabelResponse,
  type RateQuoteRequest,
  type RateQuote,
  ShippingProviderError,
} from './types';
import { IsraelPostProvider } from './israel-post';

/**
 * Shipping service for managing multiple carriers
 */
export class ShippingService {
  private providers: Map<CarrierCode, ShippingProvider> = new Map();
  private defaultCarrier: CarrierCode | null = null;

  /**
   * Register a shipping provider
   */
  registerProvider(provider: ShippingProvider): void {
    this.providers.set(provider.carrier, provider);

    // Set first registered provider as default
    if (!this.defaultCarrier) {
      this.defaultCarrier = provider.carrier;
    }
  }

  /**
   * Get a provider by carrier code
   */
  getProvider(carrier: CarrierCode): ShippingProvider {
    const provider = this.providers.get(carrier);
    if (!provider) {
      throw new ShippingProviderError(
        `Provider ${carrier} not registered`,
        'PROVIDER_NOT_FOUND',
        carrier,
        false
      );
    }
    return provider;
  }

  /**
   * Get all available (configured) providers
   */
  getAvailableProviders(): ShippingProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.isConfigured());
  }

  /**
   * Set the default carrier
   */
  setDefaultProvider(carrier: CarrierCode): void {
    if (!this.providers.has(carrier)) {
      throw new ShippingProviderError(
        `Provider ${carrier} not registered`,
        'PROVIDER_NOT_FOUND',
        carrier,
        false
      );
    }
    this.defaultCarrier = carrier;
  }

  /**
   * Get the default provider
   */
  getDefaultProvider(): ShippingProvider | null {
    if (!this.defaultCarrier) {
      const available = this.getAvailableProviders();
      return available.length > 0 ? available[0] : null;
    }
    return this.providers.get(this.defaultCarrier) || null;
  }

  /**
   * Detect carrier from tracking number format
   */
  detectCarrier(trackingNumber: string): CarrierCode | null {
    const trimmed = trackingNumber.trim().toUpperCase();

    // Israel Post: RR/RL/EA/EE + 9 digits + IL
    if (/^(RR|RL|EA|EE)\d{9}IL$/.test(trimmed)) {
      return 'israel_post';
    }

    // DHL: 10 digits
    if (/^\d{10}$/.test(trimmed)) {
      return 'dhl';
    }

    // FedEx: 12-22 digits
    if (/^\d{12,22}$/.test(trimmed)) {
      return 'fedex';
    }

    // UPS: 1Z + 16 alphanumeric
    if (/^1Z[A-Z0-9]{16}$/.test(trimmed)) {
      return 'ups';
    }

    return null;
  }

  /**
   * Create a shipment
   */
  async createShipment(
    request: CreateShipmentRequest,
    carrier?: CarrierCode
  ): Promise<CreateShipmentResult> {
    const provider = carrier
      ? this.getProvider(carrier)
      : this.getDefaultProvider();

    if (!provider) {
      throw new ShippingProviderError(
        'No shipping providers available',
        'NO_PROVIDERS',
        'other',
        false
      );
    }

    return provider.createShipment(request);
  }

  /**
   * Get tracking details
   */
  async getTracking(
    trackingNumber: string,
    carrier?: CarrierCode
  ): Promise<TrackingDetails> {
    const detectedCarrier = carrier || this.detectCarrier(trackingNumber);
    const provider = detectedCarrier
      ? this.getProvider(detectedCarrier)
      : this.getDefaultProvider();

    if (!provider) {
      throw new ShippingProviderError(
        'No shipping providers available',
        'NO_PROVIDERS',
        'other',
        false
      );
    }

    return provider.getTracking(trackingNumber);
  }

  /**
   * Get shipping label
   */
  async getLabel(
    request: GetLabelRequest,
    carrier: CarrierCode
  ): Promise<LabelResponse> {
    const provider = this.getProvider(carrier);
    return provider.getLabel(request);
  }

  /**
   * Get rates from a specific carrier
   */
  async getRates(
    request: RateQuoteRequest,
    carrier: CarrierCode
  ): Promise<RateQuote[]> {
    const provider = this.getProvider(carrier);
    return provider.getRates(request);
  }

  /**
   * Get rates from all available carriers
   */
  async getAllRates(request: RateQuoteRequest): Promise<RateQuote[]> {
    const providers = this.getAvailableProviders();
    const results: RateQuote[] = [];

    await Promise.all(
      providers.map(async (provider) => {
        try {
          const rates = await provider.getRates(request);
          results.push(...rates);
        } catch (error) {
          // Log but don't fail if one provider errors
          console.error(`Failed to get rates from ${provider.name}:`, error);
        }
      })
    );

    return results;
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(
    shipmentId: string,
    carrier: CarrierCode
  ): Promise<boolean> {
    const provider = this.getProvider(carrier);

    if (!provider.cancelShipment) {
      return false;
    }

    return provider.cancelShipment(shipmentId);
  }
}

// Singleton instance
let defaultService: ShippingService | null = null;

/**
 * Get the default shipping service instance
 * Initializes with configured providers
 */
export function getDefaultShippingService(): ShippingService {
  if (!defaultService) {
    defaultService = new ShippingService();

    // Register Israel Post provider
    const israelPost = new IsraelPostProvider();
    if (israelPost.isConfigured()) {
      defaultService.registerProvider(israelPost);
    }

    // Additional providers can be registered here
  }

  return defaultService;
}
