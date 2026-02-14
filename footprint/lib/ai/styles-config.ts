/**
 * Nano Banana (Gemini) Style Configuration
 *
 * Optimized prompts based on Google's official documentation and best practices.
 *
 * Sources:
 * - https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/
 * - https://ai.google.dev/gemini-api/docs/image-generation
 * - https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide
 * - https://blog.google/products-and-platforms/products/gemini/image-generation-prompting-tips/
 *
 * Best Practices Applied:
 * 1. Describe scenes narratively, not with keyword lists (94% vs 61% scene coherence)
 * 2. Specify: medium, era, palette, lighting, texture
 * 3. Use concrete descriptors over vague terms
 * 4. Include composition and framing guidance
 * 5. Preserve subject identity explicitly
 */

/**
 * Style type identifier
 */
export type StyleId =
  | 'pop_art'
  | 'watercolor'
  | 'line_art'
  | 'original_enhanced'
  | 'wpap';

/**
 * Complete style configuration
 */
export interface StyleConfig {
  /** Unique identifier */
  id: StyleId;

  /** Display name in Hebrew */
  nameHe: string;

  /** Display name in English */
  nameEn: string;

  /** Short description */
  description: string;

  /**
   * Primary transformation prompt
   * Uses Google's recommended structure:
   * "Transform the provided photograph into [style]. Preserve [subject details] but render with [specific techniques]."
   */
  prompt: string;

  /**
   * Negative prompt for styles that need explicit exclusions.
   * For Gemini, these are folded into the main prompt as "do not" instructions.
   * Stored separately for documentation and potential use with other providers.
   */
  negativePrompt?: string;

  /**
   * Detailed style anchors (medium, era, palette, texture)
   * For iterative refinement if needed
   */
  styleAnchors: {
    medium: string;
    era?: string;
    palette: string;
    texture: string;
    lighting?: string;
  };

  /**
   * Generation parameters
   */
  parameters: {
    temperature: number;
    aspectRatio?: string;
  };

  /**
   * Fallback CSS filter for demo mode
   */
  cssFilter: string;

  /**
   * Icon identifier for UI
   */
  icon: string;

  /**
   * Gradient colors for UI
   */
  gradient: [string, string];
}

/**
 * Proven, optimized style configurations
 *
 * Each prompt follows Google's official guidance:
 * - Narrative description over keyword lists
 * - Explicit style anchors (medium, palette, texture)
 * - Subject preservation instructions
 * - Composition guidance
 */
export const STYLE_CONFIGS: Record<StyleId, StyleConfig> = {
  pop_art: {
    id: 'pop_art',
    nameHe: 'פופ ארט',
    nameEn: 'Pop Art',
    description: 'Bold colors, halftone dots, Warhol-inspired',
    prompt: `Transform this photograph into the iconic Pop Art style of the 1960s, inspired by Andy Warhol and Roy Lichtenstein.

Render the subject with:
- Bold, flat areas of vibrant saturated color (hot pink, electric blue, bright yellow, orange)
- Visible halftone dot patterns in shadow areas, like printed comic books
- Strong black outlines defining shapes and features
- High contrast with simplified tonal areas
- Graphic, poster-like quality with clean color separations

Preserve the subject's likeness and facial features accurately. The final result should look like a screen-printed pop art portrait suitable for framing.`,
    styleAnchors: {
      medium: 'screen print, silkscreen',
      era: '1960s Pop Art movement',
      palette: 'vibrant saturated colors: hot pink, electric blue, yellow, orange',
      texture: 'flat color areas with halftone dot patterns',
      lighting: 'high contrast, simplified shadows',
    },
    parameters: {
      temperature: 0.8,
    },
    cssFilter: 'saturate(2) contrast(1.3) brightness(1.1)',
    icon: 'zap',
    gradient: ['#8b5cf6', '#ec4899'],
  },

  watercolor: {
    id: 'watercolor',
    nameHe: 'צבעי מים',
    nameEn: 'Watercolor',
    description: 'Soft flowing colors, artistic brushstrokes',
    prompt: `Transform this photograph into a delicate watercolor painting with the qualities of traditional wet-on-wet technique.

Apply these watercolor characteristics:
- Soft, flowing edges where colors blend naturally
- Translucent color washes that layer and overlap
- Visible paper texture showing through the paint
- Gentle color bleeding at the boundaries of shapes
- Light, airy quality with white highlights preserved
- Subtle variations in color intensity across the painting

Use a harmonious palette of soft, muted tones. Preserve the subject's likeness while giving the portrait an artistic, painterly quality. The result should look like a hand-painted watercolor portrait on quality watercolor paper.`,
    styleAnchors: {
      medium: 'watercolor painting, wet-on-wet technique',
      palette: 'soft muted tones, translucent washes',
      texture: 'visible paper texture, color bleeding, soft edges',
      lighting: 'natural diffused light, preserved white highlights',
    },
    parameters: {
      temperature: 0.7,
    },
    cssFilter: 'blur(0.5px) saturate(1.3) brightness(1.05)',
    icon: 'droplet',
    gradient: ['#3b82f6', '#06b6d4'],
  },

  line_art: {
    id: 'line_art',
    nameHe: 'ציור קווי',
    nameEn: 'Line Art',
    description: 'Clean minimalist lines, elegant simplicity',
    prompt: `Transform this photograph into a clean, minimalist line art drawing with elegant simplicity.

Create using these techniques:
- Clean, precise continuous lines of consistent weight
- Pure black lines on a white background
- No shading, hatching, or fill - only outlines
- Capture essential features and contours only
- Elegant, flowing line work with confident strokes
- Vector-like quality with smooth curves

Focus on the most defining features of the subject - eyes, nose, lips, and hair outline. Remove all unnecessary detail while maintaining the subject's recognizable likeness. The result should be a sophisticated, gallery-worthy line portrait.`,
    styleAnchors: {
      medium: 'ink line drawing, single-weight pen',
      palette: 'monochrome: pure black on white',
      texture: 'clean smooth lines, no texture or hatching',
    },
    parameters: {
      temperature: 0.6,
    },
    cssFilter: 'grayscale(1) contrast(2) brightness(1.2)',
    icon: 'pen',
    gradient: ['#6b7280', '#9ca3af'],
  },

  original_enhanced: {
    id: 'original_enhanced',
    nameHe: 'מקורי משופר',
    nameEn: 'Enhanced Original',
    description: 'Professional color enhancement, sharpened details',
    prompt: `Enhance this photograph with professional photo editing while maintaining its natural, realistic appearance.

Apply these enhancements:
- Improved color vibrancy and saturation balance
- Enhanced contrast with preserved highlight and shadow detail
- Subtle sharpening of fine details
- Balanced exposure across the entire image
- Natural skin tone optimization
- Professional color grading for visual appeal

Do not apply any artistic filters or style transformations. The result should look like the same photograph but professionally retouched and color-corrected, suitable for printing and framing. Preserve the subject exactly as they appear, only improving technical quality.`,
    styleAnchors: {
      medium: 'digital photography, professional retouching',
      palette: 'natural enhanced colors, balanced tones',
      texture: 'sharp detail, smooth skin, clean finish',
      lighting: 'balanced exposure, natural lighting enhanced',
    },
    parameters: {
      temperature: 0.5,
    },
    cssFilter: 'saturate(1.2) contrast(1.1) brightness(1.05)',
    icon: 'sun',
    gradient: ['#10b981', '#34d399'],
  },
  wpap: {
    id: 'wpap',
    nameHe: 'דיוקן גיאומטרי',
    nameEn: 'WPAP',
    description: 'Sharp geometric polygons, bold flat colors, high contrast',
    prompt: `Transform the uploaded portrait into WPAP (Wedha's Pop Art Portrait) style. Preserve exact facial likeness, proportions, and identity first. Build the portrait using sharp angular polygon planes only — faceted geometry with strong high-contrast light and shadow blocks that follow facial anatomy and the original light direction. Use bold vibrant saturated colors with solid flat fills only. No gradients, no soft shading, no smooth blending, no airbrush effects. Each color region must be a single solid flat color. Crisp Illustrator-like vector edges, poster style composition. No texture, no brush strokes, no realism, no blur, no painterly effects. Preserve hairstyle, glasses, beard, and facial hair accurately. Simple flat solid background. Modern digital vector illustration, print-ready resolution.`,
    negativePrompt:
      'no gradients, no soft shading, no watercolor, no brush strokes, no oil painting, no realism, no photorealism, no smooth blending, no airbrush, no texture, no 3D render, no cartoon, no anime, no curved organic shapes, no glow, no feathering, no blur',
    styleAnchors: {
      medium: 'digital vector illustration, geometric polygon portrait',
      era: '2010s WPAP movement, Wedha Abdul Rasyid',
      palette:
        'bold vibrant saturated colors: cyan, magenta, purple, green, red, yellow',
      texture: 'flat solid color planes, crisp hard edges, no gradients',
      lighting: 'high-contrast angular light and shadow blocks',
    },
    parameters: {
      temperature: 0.8,
    },
    cssFilter: 'saturate(1.8) contrast(1.4) brightness(1.05)',
    icon: 'hexagon',
    gradient: ['#06b6d4', '#ec4899'],
  },
};

/**
 * Get all style configurations as an array
 */
export function getAllStyles(): StyleConfig[] {
  return Object.values(STYLE_CONFIGS);
}

/**
 * Get a specific style configuration
 */
export function getStyleConfig(styleId: StyleId): StyleConfig {
  const config = STYLE_CONFIGS[styleId];
  if (!config) {
    throw new Error(`Unknown style: ${styleId}`);
  }
  return config;
}

/**
 * Get the optimized prompt for a style
 */
export function getStylePrompt(styleId: StyleId): string {
  return getStyleConfig(styleId).prompt;
}

/**
 * Validate if a string is a valid style ID
 */
export function isValidStyleId(id: string): id is StyleId {
  return id in STYLE_CONFIGS;
}

/**
 * List of all valid style IDs
 */
export const STYLE_IDS = Object.keys(STYLE_CONFIGS) as StyleId[];
