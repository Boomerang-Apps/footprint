/**
 * Shipping Provider Types - INT-07
 *
 * Common types and interfaces for shipping provider integrations.
 */

import { type CarrierCode } from '../tracking';

/**
 * Address for shipping
 */
export interface ShippingAddress {
  name: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

/**
 * Package dimensions and weight
 */
export interface PackageDimensions {
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // grams
}

/**
 * Shipment request to create a new shipment
 */
export interface CreateShipmentRequest {
  orderId: string;
  orderNumber: string;
  sender: ShippingAddress;
  recipient: ShippingAddress;
  package: PackageDimensions;
  serviceType: 'standard' | 'express' | 'registered';
  declaredValue?: number;
  description?: string;
  reference?: string;
}

/**
 * Result of creating a shipment
 */
export interface CreateShipmentResult {
  success: boolean;
  shipmentId: string;
  trackingNumber: string;
  carrier: CarrierCode;
  labelUrl?: string;
  labelData?: string; // Base64 encoded label
  estimatedDelivery?: {
    minDays: number;
    maxDays: number;
  };
  cost?: {
    amount: number;
    currency: string;
  };
}

/**
 * Tracking event from carrier
 */
export interface TrackingEvent {
  timestamp: Date;
  status: TrackingStatus;
  location?: string;
  description: string;
  rawStatus?: string;
}

/**
 * Normalized tracking status
 */
export type TrackingStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'returned'
  | 'exception';

/**
 * Full tracking information
 */
export interface TrackingDetails {
  trackingNumber: string;
  carrier: CarrierCode;
  status: TrackingStatus;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  lastUpdated: Date;
}

/**
 * Label format options
 */
export type LabelFormat = 'pdf' | 'png' | 'zpl';

/**
 * Get label request
 */
export interface GetLabelRequest {
  shipmentId: string;
  format?: LabelFormat;
}

/**
 * Label response
 */
export interface LabelResponse {
  format: LabelFormat;
  data: string; // Base64 encoded
  url?: string;
}

/**
 * Rate quote request
 */
export interface RateQuoteRequest {
  sender: ShippingAddress;
  recipient: ShippingAddress;
  package: PackageDimensions;
  serviceTypes?: Array<'standard' | 'express' | 'registered'>;
}

/**
 * Single rate quote
 */
export interface RateQuote {
  serviceType: 'standard' | 'express' | 'registered';
  price: number;
  currency: string;
  estimatedDays: {
    min: number;
    max: number;
  };
  carrier: CarrierCode;
}

/**
 * Shipping provider interface
 * All shipping integrations must implement this interface
 */
export interface ShippingProvider {
  /**
   * Provider carrier code
   */
  readonly carrier: CarrierCode;

  /**
   * Provider name
   */
  readonly name: string;

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;

  /**
   * Create a new shipment
   */
  createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResult>;

  /**
   * Get tracking details for a shipment
   */
  getTracking(trackingNumber: string): Promise<TrackingDetails>;

  /**
   * Get shipping label
   */
  getLabel(request: GetLabelRequest): Promise<LabelResponse>;

  /**
   * Get rate quotes
   */
  getRates(request: RateQuoteRequest): Promise<RateQuote[]>;

  /**
   * Cancel a shipment (if supported)
   */
  cancelShipment?(shipmentId: string): Promise<boolean>;

  /**
   * Validate address with carrier
   */
  validateAddress?(address: ShippingAddress): Promise<{
    valid: boolean;
    suggestions?: ShippingAddress[];
    errors?: string[];
  }>;
}

/**
 * Error from shipping provider
 */
export class ShippingProviderError extends Error {
  public readonly code: string;
  public readonly carrier: CarrierCode;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    carrier: CarrierCode,
    retryable = false
  ) {
    super(message);
    this.name = 'ShippingProviderError';
    this.code = code;
    this.carrier = carrier;
    this.retryable = retryable;
  }
}
