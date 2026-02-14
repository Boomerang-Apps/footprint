// Product Types for Footprint

// AI Style Types
export type StyleType =
  | 'original'
  | 'watercolor'
  | 'line_art'
  | 'line_art_watercolor'
  | 'pop_art'
  | 'wpap';

export interface Style {
  id: StyleType;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  thumbnailUrl: string;
  processingTime: number; // seconds
  popular?: boolean;
}

// Size Types
export type SizeType = 'A5' | 'A4' | 'A3' | 'A2';

export interface Size {
  id: SizeType;
  name: string;
  dimensions: string; // e.g., "14.8 x 21 cm"
  dimensionsCm: { width: number; height: number };
  price: number;
  popular?: boolean;
}

// Paper Types
export type PaperType = 'matte' | 'glossy' | 'canvas';

export interface Paper {
  id: PaperType;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  priceModifier: number; // Added to base price
}

// Frame Types
export type FrameType = 'none' | 'black' | 'white' | 'oak';

export interface Frame {
  id: FrameType;
  name: string;
  nameHe: string;
  color: string; // CSS color for preview
  price: number; // Added to base price
  popular?: boolean;
}

// Orientation Types
/**
 * Print orientation type - portrait (vertical) or landscape (horizontal)
 */
export type OrientationType = 'portrait' | 'landscape';

/**
 * Orientation configuration for print layout
 * @property id - Orientation identifier (portrait or landscape)
 * @property name - English display name
 * @property nameHe - Hebrew display name (RTL)
 * @property description - English description of the orientation
 * @property descriptionHe - Hebrew description of the orientation
 */
export interface Orientation {
  id: OrientationType;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
}

// Product Configuration
export interface ProductConfig {
  style: StyleType;
  size: SizeType;
  paperType: PaperType;
  frameType: FrameType;
  orientation: OrientationType;
}

// Price Calculation Result
export interface PriceBreakdown {
  basePrice: number;
  paperModifier: number;
  framePrice: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}
