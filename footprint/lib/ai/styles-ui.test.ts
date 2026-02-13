import { describe, it, expect } from 'vitest';
import { STYLES, getStyleById, type StyleOption } from './styles-ui';

describe('styles-ui', () => {
  describe('STYLES array', () => {
    it('should export STYLES array with 9 style options', () => {
      expect(STYLES).toBeDefined();
      expect(STYLES).toHaveLength(9);
    });

    it('should have correct shape for each StyleOption', () => {
      for (const style of STYLES) {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('name');
        expect(style).toHaveProperty('nameHe');
        expect(style).toHaveProperty('icon');
        expect(style).toHaveProperty('gradient');
        expect(typeof style.id).toBe('string');
        expect(typeof style.name).toBe('string');
        expect(typeof style.nameHe).toBe('string');
        expect(typeof style.gradient).toBe('string');
      }
    });

    it('should include all expected style IDs', () => {
      const ids = STYLES.map((s) => s.id);
      expect(ids).toContain('original');
      expect(ids).toContain('watercolor');
      expect(ids).toContain('line_art');
      expect(ids).toContain('line_art_watercolor');
      expect(ids).toContain('oil_painting');
      expect(ids).toContain('avatar_cartoon');
      expect(ids).toContain('pop_art');
      expect(ids).toContain('vintage');
      expect(ids).toContain('romantic');
    });

    it('should have badge only on watercolor (popular) and pop_art/romantic (new)', () => {
      const watercolor = STYLES.find((s) => s.id === 'watercolor');
      expect(watercolor?.badge).toBe('popular');

      const popArt = STYLES.find((s) => s.id === 'pop_art');
      expect(popArt?.badge).toBe('new');

      const romantic = STYLES.find((s) => s.id === 'romantic');
      expect(romantic?.badge).toBe('new');

      const noBadge = STYLES.filter(
        (s) => !['watercolor', 'pop_art', 'romantic'].includes(s.id)
      );
      for (const style of noBadge) {
        expect(style.badge).toBeUndefined();
      }
    });
  });

  describe('getStyleById', () => {
    it('should return correct style for valid ID', () => {
      const result = getStyleById('watercolor');
      expect(result).toBeDefined();
      expect(result?.id).toBe('watercolor');
      expect(result?.nameHe).toBe('צבעי מים');
    });

    it('should return undefined for invalid ID', () => {
      const result = getStyleById('nonexistent' as any);
      expect(result).toBeUndefined();
    });
  });
});
