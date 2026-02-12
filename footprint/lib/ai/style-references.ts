/**
 * Style Reference Images Configuration
 *
 * Each style can have up to 6 reference images that are sent
 * to Gemini along with the source image to ensure consistent style output.
 *
 * Reference images should be:
 * - High quality examples of the target style
 * - Diverse subjects (portraits, landscapes, objects)
 * - Stored in /public/style-references/{style_id}/
 */

import type { StyleType } from '@/types';

export interface StyleReference {
  /** Path to reference image (relative to /public) */
  path: string;
  /** Description of what this reference demonstrates */
  description: string;
}

export interface StyleConfig {
  /** Style identifier */
  id: StyleType;
  /** Reference images for this style (max 6 recommended) */
  references: StyleReference[];
  /** Whether to use references in API calls */
  useReferences: boolean;
  /** Prompt to explain reference usage */
  referencePrompt: string;
}

/**
 * Style reference configurations
 *
 * Add 5-6 reference images per style for best consistency.
 * Images should be placed in /public/style-references/{style_id}/
 */
export const STYLE_REFERENCES: Record<StyleType, StyleConfig> = {
  original: {
    id: 'original',
    references: [],
    useReferences: false,
    referencePrompt: '',
  },

  watercolor: {
    id: 'watercolor',
    references: [
      // Add your reference images here:
      // { path: '/style-references/watercolor/ref1.jpg', description: 'Portrait with soft washes' },
      // { path: '/style-references/watercolor/ref2.jpg', description: 'Landscape with bleeding colors' },
    ],
    useReferences: true,
    referencePrompt:
      'Apply the exact watercolor style shown in the reference images. Match the soft edges, translucent washes, and color bleeding technique.',
  },

  line_art: {
    id: 'line_art',
    references: [
      // Add your reference images here:
      // { path: '/style-references/line_art/ref1.jpg', description: 'Clean contour portrait' },
    ],
    useReferences: true,
    referencePrompt:
      'Apply the exact line art style shown in the reference images. Match the line weight, simplicity, and contour technique.',
  },

  line_art_watercolor: {
    id: 'line_art_watercolor',
    references: [
      { path: '/style-references/line_art_watercolor/ref1.webp', description: 'Line art watercolor example 1' },
      { path: '/style-references/line_art_watercolor/ref2.webp', description: 'Line art watercolor example 2' },
      { path: '/style-references/line_art_watercolor/ref3.webp', description: 'Line art watercolor example 3' },
      { path: '/style-references/line_art_watercolor/ref4.webp', description: 'Line art watercolor example 4' },
      { path: '/style-references/line_art_watercolor/ref5.webp', description: 'Line art watercolor example 5' },
      { path: '/style-references/line_art_watercolor/ref6.webp', description: 'Line art watercolor example 6' },
    ],
    useReferences: true,
    referencePrompt:
      'Learn from the reference images: notice the delicate line work combined with soft watercolor washes. Apply this ink-and-wash aesthetic to the source photo - use clean contour lines with loose, flowing watercolor fills. DO NOT copy the content from references.',
  },

  oil_painting: {
    id: 'oil_painting',
    references: [
      // Add your reference images here:
    ],
    useReferences: true,
    referencePrompt:
      'Apply the exact oil painting style shown in the reference images. Match the brushstroke texture, color richness, and lighting.',
  },

  avatar_cartoon: {
    id: 'avatar_cartoon',
    references: [
      // Add your reference images here:
      // { path: '/style-references/avatar_cartoon/ref1.jpg', description: 'Pixar-style character' },
    ],
    useReferences: true,
    referencePrompt:
      'Apply the exact 3D cartoon style shown in the reference images. Match the eye size, skin smoothness, and overall Pixar/Disney aesthetic.',
  },

  pop_art: {
    id: 'pop_art',
    references: [],
    useReferences: true,
    referencePrompt:
      'Transform into bold pop art style with vibrant colors, halftone dots, and strong outlines inspired by Warhol and Lichtenstein.',
  },

  vintage: {
    id: 'vintage',
    references: [],
    useReferences: true,
    referencePrompt:
      'Apply a vintage photographic look with muted tones, film grain, sepia hints, and classic retro aesthetic.',
  },

  romantic: {
    id: 'romantic',
    references: [],
    useReferences: true,
    referencePrompt:
      'Create a soft, romantic atmosphere with dreamy lighting, soft focus effects, pastel tones, and ethereal glow.',
  },
};

/**
 * Get reference image paths for a style
 */
export function getStyleReferences(style: StyleType): string[] {
  const config = STYLE_REFERENCES[style];
  if (!config.useReferences || config.references.length === 0) {
    return [];
  }
  return config.references.map((ref) => ref.path);
}

/**
 * Get the reference prompt for a style
 */
export function getStyleReferencePrompt(style: StyleType): string {
  const config = STYLE_REFERENCES[style];
  return config.referencePrompt;
}

/**
 * Check if a style has reference images configured
 */
export function hasStyleReferences(style: StyleType): boolean {
  const config = STYLE_REFERENCES[style];
  return config.useReferences && config.references.length > 0;
}
