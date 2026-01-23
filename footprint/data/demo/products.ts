/**
 * Demo Product Data
 *
 * Style definitions and product configuration for UI testing.
 */

import type { Style, StyleType, Size, Paper, Frame } from '@/types';

// Complete style definitions with Hebrew translations
export const demoStyles: Style[] = [
  {
    id: 'original',
    name: 'No Filter',
    nameHe: 'ללא פילטר',
    description: 'Keep your photo as-is without any transformation',
    descriptionHe: 'שמור על התמונה המקורית ללא שינוי',
    thumbnailUrl: '/demo/styles/original.jpg',
    processingTime: 0,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    nameHe: 'צבעי מים',
    description: 'Soft edges and flowing colors like a painting',
    descriptionHe: 'קצוות רכים וצבעים זורמים כמו ציור',
    thumbnailUrl: '/demo/styles/watercolor.jpg',
    processingTime: 10,
    popular: true,
  },
  {
    id: 'line_art',
    name: 'Line Art',
    nameHe: 'ציור קווי',
    description: 'Clean minimalist lines, elegant simplicity',
    descriptionHe: 'קווים נקיים ומינימליסטיים, פשטות אלגנטית',
    thumbnailUrl: '/demo/styles/line-art.jpg',
    processingTime: 6,
  },
  {
    id: 'line_art_watercolor',
    name: 'Line + Watercolor',
    nameHe: 'קווי + צבעי מים',
    description: 'Combination of clean lines with watercolor fills',
    descriptionHe: 'שילוב של קווים נקיים עם מילוי צבעי מים',
    thumbnailUrl: '/demo/styles/line-watercolor.jpg',
    processingTime: 12,
  },
  {
    id: 'oil_painting',
    name: 'Oil',
    nameHe: 'ציור שמן',
    description: 'Thick brushstrokes, classic museum quality',
    descriptionHe: 'משיכות מכחול עבות, איכות מוזיאון קלאסית',
    thumbnailUrl: '/demo/styles/oil-painting.jpg',
    processingTime: 12,
  },
  {
    id: 'avatar_cartoon',
    name: 'Avatar Cartoon',
    nameHe: 'אווטאר קרטון',
    description: '3D cartoon avatar style like Pixar characters',
    descriptionHe: 'סגנון אווטאר קרטון תלת מימדי כמו דמויות פיקסאר',
    thumbnailUrl: '/demo/styles/avatar-cartoon.jpg',
    processingTime: 10,
    popular: true,
  },
];

// Size configurations
export const demoSizes: Size[] = [
  {
    id: 'A5',
    name: 'A5',
    dimensions: '14.8 × 21 ס"מ',
    dimensionsCm: { width: 14.8, height: 21 },
    price: 89,
  },
  {
    id: 'A4',
    name: 'A4',
    dimensions: '21 × 29.7 ס"מ',
    dimensionsCm: { width: 21, height: 29.7 },
    price: 129,
    popular: true,
  },
  {
    id: 'A3',
    name: 'A3',
    dimensions: '29.7 × 42 ס"מ',
    dimensionsCm: { width: 29.7, height: 42 },
    price: 179,
  },
  {
    id: 'A2',
    name: 'A2',
    dimensions: '42 × 59.4 ס"מ',
    dimensionsCm: { width: 42, height: 59.4 },
    price: 249,
  },
];

// Paper configurations
export const demoPapers: Paper[] = [
  {
    id: 'matte',
    name: 'Fine Art Matte',
    nameHe: 'מט אמנותי',
    description: 'Museum quality matte finish',
    descriptionHe: 'גימור מט באיכות מוזיאון',
    priceModifier: 0,
  },
  {
    id: 'glossy',
    name: 'Glossy Photo',
    nameHe: 'מבריק',
    description: 'Vibrant colors, classic photo finish',
    descriptionHe: 'צבעים חיים, גימור צילום קלאסי',
    priceModifier: 20,
  },
  {
    id: 'canvas',
    name: 'Canvas Texture',
    nameHe: 'קנבס',
    description: 'Artistic canvas texture feel',
    descriptionHe: 'מרקם קנבס אמנותי',
    priceModifier: 50,
  },
];

// Frame configurations
export const demoFrames: Frame[] = [
  {
    id: 'none',
    name: 'No Frame',
    nameHe: 'ללא מסגרת',
    color: 'transparent',
    price: 0,
  },
  {
    id: 'black',
    name: 'Black Wood',
    nameHe: 'עץ שחור',
    color: '#1a1a1a',
    price: 79,
    popular: true,
  },
  {
    id: 'white',
    name: 'White Wood',
    nameHe: 'עץ לבן',
    color: '#f5f5f5',
    price: 79,
  },
  {
    id: 'oak',
    name: 'Natural Oak',
    nameHe: 'אלון טבעי',
    color: '#c4a77d',
    price: 99,
  },
];

/**
 * Get style by ID
 */
export function getStyleById(id: StyleType): Style | undefined {
  return demoStyles.find((s) => s.id === id);
}

/**
 * Get popular styles
 */
export function getPopularStyles(): Style[] {
  return demoStyles.filter((s) => s.popular);
}
