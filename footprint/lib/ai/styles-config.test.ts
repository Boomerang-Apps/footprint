/**
 * Style Configuration Tests
 *
 * Tests for STYLE_CONFIGS, getAllStyles, getStyleConfig,
 * getStylePrompt, isValidStyleId, and STYLE_IDS.
 */

import { describe, it, expect } from 'vitest';
import {
  STYLE_CONFIGS,
  getAllStyles,
  getStyleConfig,
  getStylePrompt,
  isValidStyleId,
  STYLE_IDS,
  type StyleId,
  type StyleConfig,
} from './styles-config';

describe('STYLE_CONFIGS', () => {
  const expectedStyles: StyleId[] = [
    'pop_art',
    'watercolor',
    'line_art',
    'oil_painting',
    'romantic',
    'comic_book',
    'vintage',
    'original_enhanced',
  ];

  it('should have all 8 styles defined', () => {
    expect(Object.keys(STYLE_CONFIGS)).toHaveLength(8);
  });

  it('should include every expected style', () => {
    for (const style of expectedStyles) {
      expect(STYLE_CONFIGS[style]).toBeDefined();
    }
  });

  describe.each(expectedStyles)('style: %s', (styleId) => {
    let config: StyleConfig;

    beforeEach(() => {
      config = STYLE_CONFIGS[styleId];
    });

    it('should have matching id', () => {
      expect(config.id).toBe(styleId);
    });

    it('should have Hebrew name', () => {
      expect(config.nameHe).toBeTruthy();
      expect(typeof config.nameHe).toBe('string');
    });

    it('should have English name', () => {
      expect(config.nameEn).toBeTruthy();
      expect(typeof config.nameEn).toBe('string');
    });

    it('should have description', () => {
      expect(config.description).toBeTruthy();
    });

    it('should have a non-empty prompt', () => {
      expect(config.prompt.length).toBeGreaterThan(50);
    });

    it('should have style anchors with required fields', () => {
      expect(config.styleAnchors.medium).toBeTruthy();
      expect(config.styleAnchors.palette).toBeTruthy();
      expect(config.styleAnchors.texture).toBeTruthy();
    });

    it('should have temperature between 0 and 1', () => {
      expect(config.parameters.temperature).toBeGreaterThan(0);
      expect(config.parameters.temperature).toBeLessThanOrEqual(1);
    });

    it('should have cssFilter string', () => {
      expect(typeof config.cssFilter).toBe('string');
      expect(config.cssFilter.length).toBeGreaterThan(0);
    });

    it('should have icon identifier', () => {
      expect(config.icon).toBeTruthy();
    });

    it('should have gradient with exactly 2 colors', () => {
      expect(config.gradient).toHaveLength(2);
      expect(config.gradient[0]).toMatch(/^#/);
      expect(config.gradient[1]).toMatch(/^#/);
    });
  });
});

describe('getAllStyles', () => {
  it('should return array of all 8 styles', () => {
    const styles = getAllStyles();
    expect(styles).toHaveLength(8);
  });

  it('should return StyleConfig objects', () => {
    const styles = getAllStyles();
    for (const style of styles) {
      expect(style.id).toBeTruthy();
      expect(style.nameEn).toBeTruthy();
      expect(style.prompt).toBeTruthy();
    }
  });

  it('should include pop_art and watercolor', () => {
    const styles = getAllStyles();
    const ids = styles.map((s) => s.id);
    expect(ids).toContain('pop_art');
    expect(ids).toContain('watercolor');
  });
});

describe('getStyleConfig', () => {
  it('should return config for valid style', () => {
    const config = getStyleConfig('watercolor');
    expect(config.id).toBe('watercolor');
    expect(config.nameEn).toBe('Watercolor');
  });

  it('should return config for each style id', () => {
    for (const id of STYLE_IDS) {
      const config = getStyleConfig(id);
      expect(config.id).toBe(id);
    }
  });

  it('should throw for unknown style', () => {
    expect(() => getStyleConfig('nonexistent' as StyleId)).toThrow('Unknown style');
  });
});

describe('getStylePrompt', () => {
  it('should return prompt string for valid style', () => {
    const prompt = getStylePrompt('oil_painting');
    expect(prompt).toContain('oil painting');
    expect(prompt.length).toBeGreaterThan(50);
  });

  it('should return the same prompt as STYLE_CONFIGS', () => {
    const prompt = getStylePrompt('pop_art');
    expect(prompt).toBe(STYLE_CONFIGS.pop_art.prompt);
  });

  it('should throw for unknown style', () => {
    expect(() => getStylePrompt('unknown' as StyleId)).toThrow('Unknown style');
  });
});

describe('isValidStyleId', () => {
  it('should return true for all valid style ids', () => {
    for (const id of STYLE_IDS) {
      expect(isValidStyleId(id)).toBe(true);
    }
  });

  it('should return false for invalid ids', () => {
    expect(isValidStyleId('fake')).toBe(false);
    expect(isValidStyleId('')).toBe(false);
    expect(isValidStyleId('WATERCOLOR')).toBe(false);
  });
});

describe('STYLE_IDS', () => {
  it('should have 8 entries', () => {
    expect(STYLE_IDS).toHaveLength(8);
  });

  it('should match keys of STYLE_CONFIGS', () => {
    const configKeys = Object.keys(STYLE_CONFIGS).sort();
    const sortedIds = [...STYLE_IDS].sort();
    expect(sortedIds).toEqual(configKeys);
  });
});
