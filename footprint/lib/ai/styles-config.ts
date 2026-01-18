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
  | 'oil_painting'
  | 'romantic'
  | 'comic_book'
  | 'vintage'
  | 'original_enhanced';

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

  oil_painting: {
    id: 'oil_painting',
    nameHe: 'ציור שמן',
    nameEn: 'Oil Painting',
    description: 'Rich brushstrokes, classical art style',
    prompt: `Transform this photograph into a classical oil painting reminiscent of Renaissance and Baroque portraiture masters.

Apply these oil painting characteristics:
- Thick, visible impasto brushstrokes with rich texture
- Deep, luminous colors with complex layering
- Dramatic chiaroscuro lighting with rich shadows
- Warm undertones in skin with subtle color variations
- Painterly blending while maintaining brushwork visibility
- Museum-quality finish with glazed depth

Render in the style of classical portraiture with attention to realistic proportions and dignified composition. Preserve the subject's likeness while elevating it to fine art quality. The result should appear as a masterwork suitable for a gallery or museum.`,
    styleAnchors: {
      medium: 'oil on canvas, impasto technique',
      era: 'Renaissance/Baroque classical portraiture',
      palette: 'rich deep colors, warm undertones, complex layering',
      texture: 'visible brushstrokes, thick impasto, glazed layers',
      lighting: 'dramatic chiaroscuro, warm key light',
    },
    parameters: {
      temperature: 0.75,
    },
    cssFilter: 'saturate(1.5) contrast(1.2) brightness(0.95)',
    icon: 'brush',
    gradient: ['#f59e0b', '#d97706'],
  },

  romantic: {
    id: 'romantic',
    nameHe: 'רומנטי',
    nameEn: 'Romantic',
    description: 'Soft dreamy focus, warm ethereal glow',
    prompt: `Transform this photograph into a romantic, dreamy portrait with an ethereal, timeless quality.

Apply these romantic characteristics:
- Soft, diffused focus with gentle blur on edges
- Warm golden-hour lighting with soft highlights
- Delicate pink and peach tones in highlights
- Subtle lens flare or light bloom effects
- Smooth, luminous skin with soft gradients
- Dreamy, nostalgic atmosphere

Create a sense of warmth and tenderness. The lighting should feel like late afternoon golden hour. Preserve the subject's beauty while adding an idealized, romantic glow. The result should evoke emotion and feel like a treasured memory.`,
    styleAnchors: {
      medium: 'soft focus photography, diffusion filter',
      palette: 'warm golden tones, soft pink and peach highlights',
      texture: 'smooth gradients, soft bloom, gentle diffusion',
      lighting: 'golden hour warmth, soft key light, subtle rim light',
    },
    parameters: {
      temperature: 0.7,
    },
    cssFilter: 'sepia(0.3) saturate(1.2) brightness(1.1) contrast(0.95)',
    icon: 'heart',
    gradient: ['#ec4899', '#f472b6'],
  },

  comic_book: {
    id: 'comic_book',
    nameHe: 'קומיקס',
    nameEn: 'Comic Book',
    description: 'Bold outlines, vibrant flat colors',
    prompt: `Transform this photograph into a dynamic comic book illustration in the classic American superhero comic style.

Apply these comic book characteristics:
- Bold, confident black outlines of varying thickness
- Flat areas of bright, saturated color
- Ben-Day dots or halftone patterns in shadows and midtones
- Strong contrast with dramatic lighting
- Dynamic, slightly exaggerated features
- Clean color separations without gradients

The style should reference classic Marvel or DC comic art with professional inking quality. Preserve the subject's likeness while adding heroic, dynamic energy. The result should look like a panel from a professionally printed comic book.`,
    styleAnchors: {
      medium: 'comic book ink and color, Ben-Day dots',
      era: 'classic American superhero comics',
      palette: 'bright saturated primaries and secondaries',
      texture: 'halftone dots, flat color areas, bold ink lines',
      lighting: 'dramatic high contrast, strong shadows',
    },
    parameters: {
      temperature: 0.8,
    },
    cssFilter: 'saturate(1.8) contrast(1.4) brightness(1.05)',
    icon: 'zap',
    gradient: ['#f97316', '#ef4444'],
  },

  vintage: {
    id: 'vintage',
    nameHe: "וינטג'",
    nameEn: 'Vintage',
    description: 'Nostalgic sepia tones, film grain texture',
    prompt: `Transform this photograph into a vintage, nostalgic portrait reminiscent of photographs from the 1970s era.

Apply these vintage characteristics:
- Warm sepia and amber color tones
- Visible film grain texture throughout
- Slightly faded highlights and lifted blacks
- Soft vignette darkening the edges
- Muted, desaturated color palette
- Subtle light leaks or color shifts at edges

The feeling should be of a treasured old photograph found in a family album. Add authentic analog film qualities while preserving the subject's likeness. The result should evoke nostalgia and timeless memories.`,
    styleAnchors: {
      medium: 'analog film photography, 35mm film',
      era: '1970s vintage photography',
      palette: 'warm sepia, amber tones, faded colors',
      texture: 'visible film grain, soft vignette, light leaks',
      lighting: 'soft natural light, slightly overexposed highlights',
    },
    parameters: {
      temperature: 0.7,
    },
    cssFilter: 'sepia(0.6) saturate(0.8) contrast(1.1) brightness(0.95)',
    icon: 'film',
    gradient: ['#92400e', '#b45309'],
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
