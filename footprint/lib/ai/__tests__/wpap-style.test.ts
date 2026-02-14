import { describe, it, expect } from 'vitest';
import {
  STYLE_CONFIGS,
  isValidStyleId,
  getStyleConfig,
} from '../styles-config';
import { STYLES, getStyleById } from '../styles-ui';
import { STYLE_PROMPTS, ALLOWED_STYLES, isValidStyle } from '../replicate';

describe('WPAP Style — Nano Banana Config (styles-config.ts)', () => {
  it('should include wpap in STYLE_CONFIGS', () => {
    expect(STYLE_CONFIGS).toHaveProperty('wpap');
  });

  it('should have correct Hebrew name', () => {
    expect(STYLE_CONFIGS.wpap.nameHe).toBe('דיוקן גיאומטרי');
  });

  it('should have correct English name', () => {
    expect(STYLE_CONFIGS.wpap.nameEn).toBe('WPAP');
  });

  it('should have prompt under 950 characters', () => {
    expect(STYLE_CONFIGS.wpap.prompt.length).toBeLessThan(950);
  });

  it('should have prompt containing WPAP identity keywords', () => {
    const prompt = STYLE_CONFIGS.wpap.prompt;
    expect(prompt).toContain('WPAP');
    expect(prompt).toContain('polygon');
    expect(prompt).toContain('flat');
    expect(prompt).toContain('likeness');
  });

  it('should have negativePrompt with anti-gradient terms', () => {
    const neg = STYLE_CONFIGS.wpap.negativePrompt;
    expect(neg).toBeDefined();
    expect(neg).toContain('no gradients');
    expect(neg).toContain('no watercolor');
    expect(neg).toContain('no realism');
  });

  it('should have all required styleAnchors', () => {
    const anchors = STYLE_CONFIGS.wpap.styleAnchors;
    expect(anchors.medium).toBeDefined();
    expect(anchors.palette).toBeDefined();
    expect(anchors.texture).toBeDefined();
  });

  it('should have temperature parameter set', () => {
    expect(STYLE_CONFIGS.wpap.parameters.temperature).toBeGreaterThan(0);
    expect(STYLE_CONFIGS.wpap.parameters.temperature).toBeLessThanOrEqual(1);
  });

  it('should have cssFilter defined', () => {
    expect(STYLE_CONFIGS.wpap.cssFilter).toBeDefined();
    expect(typeof STYLE_CONFIGS.wpap.cssFilter).toBe('string');
  });

  it('should have hexagon icon', () => {
    expect(STYLE_CONFIGS.wpap.icon).toBe('hexagon');
  });

  it('should have gradient with two colors', () => {
    expect(STYLE_CONFIGS.wpap.gradient).toHaveLength(2);
  });

  it('should be recognized as valid style ID', () => {
    expect(isValidStyleId('wpap')).toBe(true);
  });

  it('should return config via getStyleConfig', () => {
    const config = getStyleConfig('wpap');
    expect(config.id).toBe('wpap');
  });
});

describe('WPAP Style — Replicate/Pipeline Config (replicate.ts)', () => {
  it('should include wpap in STYLE_PROMPTS', () => {
    expect(STYLE_PROMPTS).toHaveProperty('wpap');
  });

  it('should include wpap in ALLOWED_STYLES', () => {
    expect(ALLOWED_STYLES).toContain('wpap');
  });

  it('should validate wpap as valid style', () => {
    expect(isValidStyle('wpap')).toBe(true);
  });

  it('should have WPAP prompt with geometric polygon keywords', () => {
    const prompt = STYLE_PROMPTS.wpap;
    expect(prompt).toContain('WPAP');
    expect(prompt).toContain('polygon');
  });
});

describe('WPAP Style — UI Config (styles-ui.ts)', () => {
  it('should include wpap in STYLES array', () => {
    const wpap = STYLES.find((s) => s.id === 'wpap');
    expect(wpap).toBeDefined();
  });

  it('should have badge set to new', () => {
    const wpap = STYLES.find((s) => s.id === 'wpap');
    expect(wpap?.badge).toBe('new');
  });

  it('should have correct Hebrew name', () => {
    const wpap = STYLES.find((s) => s.id === 'wpap');
    expect(wpap?.nameHe).toBe('דיוקן גיאומטרי');
  });

  it('should have correct English name', () => {
    const wpap = STYLES.find((s) => s.id === 'wpap');
    expect(wpap?.name).toBe('WPAP');
  });

  it('should be retrievable via getStyleById', () => {
    const wpap = getStyleById('wpap');
    expect(wpap).toBeDefined();
    expect(wpap?.id).toBe('wpap');
  });

  it('should be positioned after pop_art in the array', () => {
    const popArtIdx = STYLES.findIndex((s) => s.id === 'pop_art');
    const wpapIdx = STYLES.findIndex((s) => s.id === 'wpap');
    expect(wpapIdx).toBeGreaterThan(popArtIdx);
  });
});
