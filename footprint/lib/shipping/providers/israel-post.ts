/**
 * Israel Post Shipping Provider - INT-07
 *
 * Integration with Israel Post API for domestic shipping.
 * Supports shipment creation, tracking, labels, and rate quotes.
 */

import { type CarrierCode } from '../tracking';
import {
  type ShippingProvider,
  type CreateShipmentRequest,
  type CreateShipmentResult,
  type TrackingDetails,
  type TrackingEvent,
  type TrackingStatus,
  type GetLabelRequest,
  type LabelResponse,
  type RateQuoteRequest,
  type RateQuote,
  ShippingProviderError,
} from './types';

// Israel Post API base URL (mock for now, would be real API in production)
const API_BASE_URL = process.env.ISRAEL_POST_API_URL || 'https://api.israelpost.co.il/v1';

/**
 * Israel Post status code mapping
 */
const STATUS_MAP: Record<string, TrackingStatus> = {
  PENDING: 'pending',
  ACCEPTED: 'picked_up',
  IN_TRANSIT: 'in_transit',
  ARRIVED_AT_DESTINATION: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED_DELIVERY: 'failed_delivery',
  RETURNED: 'returned',
  EXCEPTION: 'exception',
};

/**
 * Maps Israel Post status codes to normalized tracking status
 */
export function mapIsraelPostStatus(israelPostStatus: string): TrackingStatus {
  return STATUS_MAP[israelPostStatus] || 'pending';
}

/**
 * Israel Post API response structure
 */
interface IsraelPostApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Parses and validates Israel Post API response
 */
export function parseIsraelPostResponse<T>(response: IsraelPostApiResponse<T>): T {
  if (!response.success) {
    throw new ShippingProviderError(
      response.error || 'Unknown Israel Post API error',
      response.code || 'UNKNOWN_ERROR',
      'israel_post',
      false
    );
  }
  return response.data as T;
}

/**
 * Israel Post shipping provider implementation
 */
export class IsraelPostProvider implements ShippingProvider {
  readonly carrier: CarrierCode = 'israel_post';
  readonly name = 'Israel Post';

  private apiKey: string;
  private customerId: string;

  constructor() {
    this.apiKey = process.env.ISRAEL_POST_API_KEY || '';
    this.customerId = process.env.ISRAEL_POST_CUSTOMER_ID || '';
  }

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.customerId);
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Customer-ID': this.customerId,
    };
  }

  /**
   * Make API request to Israel Post
   */
  private async apiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: object
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new ShippingProviderError(
        'Israel Post provider is not configured',
        'NOT_CONFIGURED',
        'israel_post',
        false
      );
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new ShippingProviderError(
        data.error || `API request failed with status ${response.status}`,
        data.code || 'API_ERROR',
        'israel_post',
        response.status >= 500
      );
    }

    return data;
  }

  /**
   * Create a new shipment
   */
  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResult> {
    const payload = {
      orderId: request.orderId,
      orderNumber: request.orderNumber,
      serviceType: request.serviceType,
      sender: {
        name: request.sender.name,
        company: request.sender.company,
        address: request.sender.street,
        address2: request.sender.street2,
        city: request.sender.city,
        postalCode: request.sender.postalCode,
        phone: request.sender.phone,
        email: request.sender.email,
      },
      recipient: {
        name: request.recipient.name,
        company: request.recipient.company,
        address: request.recipient.street,
        address2: request.recipient.street2,
        city: request.recipient.city,
        postalCode: request.recipient.postalCode,
        phone: request.recipient.phone,
        email: request.recipient.email,
      },
      package: {
        length: request.package.length,
        width: request.package.width,
        height: request.package.height,
        weight: request.package.weight,
      },
      declaredValue: request.declaredValue,
      description: request.description,
      reference: request.reference || request.orderNumber,
    };

    const response = await this.apiRequest<{
      success: boolean;
      shipmentId: string;
      trackingNumber: string;
      labelUrl?: string;
      labelData?: string;
      estimatedDelivery?: { minDays: number; maxDays: number };
      cost?: { amount: number; currency: string };
    }>('/shipments', 'POST', payload);

    return {
      success: true,
      shipmentId: response.shipmentId,
      trackingNumber: response.trackingNumber,
      carrier: 'israel_post',
      labelUrl: response.labelUrl,
      labelData: response.labelData,
      estimatedDelivery: response.estimatedDelivery,
      cost: response.cost,
    };
  }

  /**
   * Get tracking details
   */
  async getTracking(trackingNumber: string): Promise<TrackingDetails> {
    const response = await this.apiRequest<{
      trackingNumber: string;
      status: string;
      estimatedDelivery?: string;
      events: Array<{
        timestamp: string;
        status: string;
        location?: string;
        description: string;
      }>;
    }>(`/tracking/${trackingNumber}`);

    const events: TrackingEvent[] = response.events.map((event) => ({
      timestamp: new Date(event.timestamp),
      status: mapIsraelPostStatus(event.status),
      location: event.location,
      description: event.description,
      rawStatus: event.status,
    }));

    return {
      trackingNumber: response.trackingNumber,
      carrier: 'israel_post',
      status: mapIsraelPostStatus(response.status),
      estimatedDelivery: response.estimatedDelivery
        ? new Date(response.estimatedDelivery)
        : undefined,
      events,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get shipping label
   */
  async getLabel(request: GetLabelRequest): Promise<LabelResponse> {
    const format = request.format || 'pdf';
    const response = await this.apiRequest<{
      format: 'pdf' | 'png' | 'zpl';
      data: string;
      url?: string;
    }>(`/shipments/${request.shipmentId}/label?format=${format}`);

    return {
      format: response.format,
      data: response.data,
      url: response.url,
    };
  }

  /**
   * Get rate quotes
   */
  async getRates(request: RateQuoteRequest): Promise<RateQuote[]> {
    const payload = {
      sender: {
        postalCode: request.sender.postalCode,
        city: request.sender.city,
        country: request.sender.country,
      },
      recipient: {
        postalCode: request.recipient.postalCode,
        city: request.recipient.city,
        country: request.recipient.country,
      },
      package: request.package,
      serviceTypes: request.serviceTypes,
    };

    const response = await this.apiRequest<{
      rates: Array<{
        serviceType: 'standard' | 'express' | 'registered';
        price: number;
        currency: string;
        minDays: number;
        maxDays: number;
      }>;
    }>('/rates', 'POST', payload);

    return response.rates.map((rate) => ({
      serviceType: rate.serviceType,
      price: rate.price,
      currency: rate.currency,
      estimatedDays: {
        min: rate.minDays,
        max: rate.maxDays,
      },
      carrier: 'israel_post',
    }));
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(shipmentId: string): Promise<boolean> {
    try {
      await this.apiRequest(`/shipments/${shipmentId}`, 'DELETE');
      return true;
    } catch (error) {
      if (error instanceof ShippingProviderError) {
        // Some cancellation failures are expected (already shipped, etc.)
        return false;
      }
      throw error;
    }
  }
}

/**
 * Default Israel Post provider instance
 */
export const israelPostProvider = new IsraelPostProvider();
