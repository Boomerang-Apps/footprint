/**
 * Style References Tests
 *
 * Tests for STYLE_REFERENCES, getStyleReferences,
 * getStyleReferencePrompt, and hasStyleReferences.
 */

import { describe, it, expect } from 'vitest';
import {
  STYLE_REFERENCES,
  getStyleReferences,
  getStyleReferencePrompt,
  hasStyleReferences,
} from './style-references';
import type { StyleType } from '@/types';

const ALL_STYLES: StyleType[] = [
  'original',
  'watercolor',
  'line_art',
  'line_art_watercolor',
  'pop_art',
];

describe('STYLE_REFERENCES', () => {
  it('should have config for all style types', () => {
    for (const style of ALL_STYLES) {
      expect(STYLE_REFERENCES[style]).toBeDefined();
      expect(STYLE_REFERENCES[style].id).toBe(style);
    }
  });

  it('should have useReferences=false for original', () => {
    expect(STYLE_REFERENCES.original.useReferences).toBe(false);
  });

  it('should have useReferences=true for non-original styles', () => {
    const nonOriginal = ALL_STYLES.filter((s) => s !== 'original');
    for (const style of nonOriginal) {
      expect(STYLE_REFERENCES[style].useReferences).toBe(true);
    }
  });

  it('should have empty referencePrompt for original', () => {
    expect(STYLE_REFERENCES.original.referencePrompt).toBe('');
  });

  it('should have non-empty referencePrompt for non-original styles', () => {
    const nonOriginal = ALL_STYLES.filter((s) => s !== 'original');
    for (const style of nonOriginal) {
      expect(STYLE_REFERENCES[style].referencePrompt.length).toBeGreaterThan(0);
    }
  });

  it('should have reference images for line_art_watercolor', () => {
    const config = STYLE_REFERENCES.line_art_watercolor;
    expect(config.references.length).toBe(6);
    for (const ref of config.references) {
      expect(ref.path).toContain('line_art_watercolor');
      expect(ref.description).toBeTruthy();
    }
  });
});

describe('getStyleReferences', () => {
  it('should return empty array for original', () => {
    expect(getStyleReferences('original')).toEqual([]);
  });

  it('should return paths for line_art_watercolor', () => {
    const refs = getStyleReferences('line_art_watercolor');
    expect(refs).toHaveLength(6);
    for (const path of refs) {
      expect(path).toMatch(/^\/style-references\/line_art_watercolor\//);
    }
  });

  it('should return empty array for styles with useReferences=true but no images', () => {
    // watercolor has useReferences=true but no reference images added yet
    expect(getStyleReferences('watercolor')).toEqual([]);
  });
});

describe('getStyleReferencePrompt', () => {
  it('should return empty string for original', () => {
    expect(getStyleReferencePrompt('original')).toBe('');
  });

  it('should return prompt for watercolor', () => {
    const prompt = getStyleReferencePrompt('watercolor');
    expect(prompt).toContain('watercolor');
  });

  it('should return prompt for line_art_watercolor', () => {
    const prompt = getStyleReferencePrompt('line_art_watercolor');
    expect(prompt).toContain('line');
    expect(prompt).toContain('watercolor');
  });

  it('should return prompt for all styles', () => {
    for (const style of ALL_STYLES) {
      const prompt = getStyleReferencePrompt(style);
      expect(typeof prompt).toBe('string');
    }
  });
});

describe('hasStyleReferences', () => {
  it('should return false for original (useReferences=false)', () => {
    expect(hasStyleReferences('original')).toBe(false);
  });

  it('should return true for line_art_watercolor (has references)', () => {
    expect(hasStyleReferences('line_art_watercolor')).toBe(true);
  });

  it('should return false for watercolor (useReferences=true but empty)', () => {
    expect(hasStyleReferences('watercolor')).toBe(false);
  });

  it('should return false for styles with useReferences=true but no images', () => {
    // These have useReferences=true but empty references array
    expect(hasStyleReferences('pop_art')).toBe(false);
  });
});
