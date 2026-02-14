/**
 * Demo Images
 *
 * Placeholder image URLs for UI testing and development.
 * Uses Picsum for dynamic placeholder images.
 */

import type { StyleType } from '@/types';

// Original photo placeholders (portrait/landscape mix)
export const originalImages: string[] = [
  'https://picsum.photos/seed/footprint1/800/600',
  'https://picsum.photos/seed/footprint2/600/800',
  'https://picsum.photos/seed/footprint3/800/600',
  'https://picsum.photos/seed/footprint4/600/800',
  'https://picsum.photos/seed/footprint5/800/600',
  'https://picsum.photos/seed/family1/800/600',
  'https://picsum.photos/seed/portrait1/600/800',
  'https://picsum.photos/seed/nature1/800/600',
  'https://picsum.photos/seed/pet1/800/600',
  'https://picsum.photos/seed/travel1/800/600',
];

// Style preview images (shown in style selector)
export const stylePreviewImages: Record<StyleType, string> = {
  original: '/demo/styles/original.jpg',
  watercolor: '/demo/styles/watercolor.jpg',
  line_art: '/demo/styles/line-art.jpg',
  line_art_watercolor: '/demo/styles/line-watercolor.jpg',
  pop_art: '/demo/styles/pop-art.jpg',
  wpap: '/demo/styles/wpap.jpg',
};

// Transformed image examples (same image in different styles)
export const transformedExamples: Record<StyleType, string> = {
  original: 'https://picsum.photos/seed/orig_enhanced/800/600',
  watercolor: 'https://picsum.photos/seed/watercolor_demo/800/600',
  line_art: 'https://picsum.photos/seed/line_art_demo/800/600',
  line_art_watercolor: 'https://picsum.photos/seed/line_watercolor_demo/800/600',
  pop_art: 'https://picsum.photos/seed/pop_art_demo/800/600',
  wpap: 'https://picsum.photos/seed/wpap_demo/800/600',
};

// Aggregated demo images export
export const demoImages = {
  originals: originalImages,
  stylePreviews: stylePreviewImages,
  transformed: transformedExamples,
};

/**
 * Get a style preview image URL
 */
export function getStylePreviewImage(style: StyleType): string {
  return stylePreviewImages[style] || stylePreviewImages.original;
}

/**
 * Get a random original image URL
 */
export function getRandomOriginalImage(): string {
  const index = Math.floor(Math.random() * originalImages.length);
  return originalImages[index];
}
