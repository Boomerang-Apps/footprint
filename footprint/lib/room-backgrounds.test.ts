/**
 * Room Backgrounds Tests
 *
 * Tests for room background configuration and lookup functions.
 */

import { describe, it, expect } from 'vitest';
import {
  ROOM_BACKGROUNDS,
  getRoomBackground,
  getDefaultRoomBackground,
  type RoomBackground,
} from './room-backgrounds';

describe('lib/room-backgrounds', () => {
  describe('ROOM_BACKGROUNDS', () => {
    it('should export exactly 5 room backgrounds', () => {
      expect(ROOM_BACKGROUNDS).toHaveLength(5);
    });

    it('should have unique IDs for all backgrounds', () => {
      const ids = ROOM_BACKGROUNDS.map((bg) => bg.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ROOM_BACKGROUNDS.length);
    });

    it('should have all required fields on every background', () => {
      ROOM_BACKGROUNDS.forEach((bg) => {
        expect(bg.id).toBeTruthy();
        expect(bg.name).toBeTruthy();
        expect(bg.nameHe).toBeTruthy();
        expect(bg.url).toBeTruthy();
        expect(typeof bg.artworkTop).toBe('number');
        expect(typeof bg.artworkLeft).toBe('number');
        expect(typeof bg.artworkScale).toBe('number');
        expect(typeof bg.showShadow).toBe('boolean');
        expect(bg.credit).toBeTruthy();
      });
    });

    it('should have valid URLs for all backgrounds', () => {
      ROOM_BACKGROUNDS.forEach((bg) => {
        expect(bg.url).toMatch(/^https:\/\//);
      });
    });

    it('should have artworkTop values between 0 and 100', () => {
      ROOM_BACKGROUNDS.forEach((bg) => {
        expect(bg.artworkTop).toBeGreaterThanOrEqual(0);
        expect(bg.artworkTop).toBeLessThanOrEqual(100);
      });
    });

    it('should have artworkLeft values between 0 and 100', () => {
      ROOM_BACKGROUNDS.forEach((bg) => {
        expect(bg.artworkLeft).toBeGreaterThanOrEqual(0);
        expect(bg.artworkLeft).toBeLessThanOrEqual(100);
      });
    });

    it('should have positive artworkScale values', () => {
      ROOM_BACKGROUNDS.forEach((bg) => {
        expect(bg.artworkScale).toBeGreaterThan(0);
      });
    });

    it('should contain expected background IDs', () => {
      const ids = ROOM_BACKGROUNDS.map((bg) => bg.id);
      expect(ids).toContain('living-sofa-white');
      expect(ids).toContain('living-gray-modern');
      expect(ids).toContain('bedroom-minimal');
      expect(ids).toContain('living-plant-cozy');
      expect(ids).toContain('office-desk');
    });
  });

  describe('getRoomBackground', () => {
    it('should return the correct background for a valid ID', () => {
      const bg = getRoomBackground('living-sofa-white');
      expect(bg).toBeDefined();
      expect(bg!.id).toBe('living-sofa-white');
      expect(bg!.name).toBe('White Wall with Sofa');
      expect(bg!.nameHe).toBe('קיר לבן עם ספה');
    });

    it('should return each background by its ID', () => {
      ROOM_BACKGROUNDS.forEach((expected) => {
        const result = getRoomBackground(expected.id);
        expect(result).toBeDefined();
        expect(result).toEqual(expected);
      });
    });

    it('should return undefined for a non-existent ID', () => {
      expect(getRoomBackground('non-existent')).toBeUndefined();
    });

    it('should return undefined for an empty string', () => {
      expect(getRoomBackground('')).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      expect(getRoomBackground('Living-Sofa-White')).toBeUndefined();
      expect(getRoomBackground('LIVING-SOFA-WHITE')).toBeUndefined();
    });
  });

  describe('getDefaultRoomBackground', () => {
    it('should return the first background', () => {
      const defaultBg = getDefaultRoomBackground();
      expect(defaultBg).toEqual(ROOM_BACKGROUNDS[0]);
    });

    it('should return living-sofa-white as default', () => {
      const defaultBg = getDefaultRoomBackground();
      expect(defaultBg.id).toBe('living-sofa-white');
    });

    it('should return a valid RoomBackground object', () => {
      const defaultBg = getDefaultRoomBackground();
      expect(defaultBg.id).toBeTruthy();
      expect(defaultBg.name).toBeTruthy();
      expect(defaultBg.nameHe).toBeTruthy();
      expect(defaultBg.url).toBeTruthy();
      expect(typeof defaultBg.artworkTop).toBe('number');
      expect(typeof defaultBg.artworkLeft).toBe('number');
      expect(typeof defaultBg.artworkScale).toBe('number');
      expect(typeof defaultBg.showShadow).toBe('boolean');
    });

    it('should always return the same background', () => {
      const first = getDefaultRoomBackground();
      const second = getDefaultRoomBackground();
      expect(first).toEqual(second);
    });
  });
});
