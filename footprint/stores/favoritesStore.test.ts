import { describe, it, expect, beforeEach } from 'vitest';
import { useFavoritesStore } from './favoritesStore';
import type { FavoriteItem } from './favoritesStore';

const mockFavorite = {
  imageUrl: 'https://example.com/transformed.jpg',
  originalImageUrl: 'https://example.com/original.jpg',
  style: 'watercolor' as const,
  styleName: 'צבעי מים',
};

const mockFavorite2 = {
  imageUrl: 'https://example.com/transformed2.jpg',
  originalImageUrl: 'https://example.com/original2.jpg',
  style: 'oil_painting' as const,
  styleName: 'ציור שמן',
};

describe('favoritesStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useFavoritesStore.getState().clearAll();
  });

  describe('Core Operations', () => {
    it('should initialize with empty favorites array', () => {
      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toEqual([]);
    });

    it('should add a favorite with generated id and timestamp', () => {
      const before = Date.now();
      useFavoritesStore.getState().addFavorite(mockFavorite);
      const after = Date.now();

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);

      const added = favorites[0];
      expect(added.id).toBeDefined();
      expect(added.id).toMatch(/^fav-/);
      expect(added.imageUrl).toBe(mockFavorite.imageUrl);
      expect(added.originalImageUrl).toBe(mockFavorite.originalImageUrl);
      expect(added.style).toBe(mockFavorite.style);
      expect(added.styleName).toBe(mockFavorite.styleName);
      expect(added.createdAt).toBeGreaterThanOrEqual(before);
      expect(added.createdAt).toBeLessThanOrEqual(after);
    });

    it('should remove a favorite by id', () => {
      useFavoritesStore.getState().addFavorite(mockFavorite);
      const { favorites } = useFavoritesStore.getState();
      const id = favorites[0].id;

      useFavoritesStore.getState().removeFavorite(id);

      expect(useFavoritesStore.getState().favorites).toHaveLength(0);
    });

    it('should return true from isFavorite for saved imageUrl', () => {
      useFavoritesStore.getState().addFavorite(mockFavorite);

      expect(useFavoritesStore.getState().isFavorite(mockFavorite.imageUrl)).toBe(true);
    });

    it('should return false from isFavorite for unsaved imageUrl', () => {
      expect(useFavoritesStore.getState().isFavorite('https://nonexistent.jpg')).toBe(false);
    });

    it('should not add duplicate favorites (same imageUrl)', () => {
      useFavoritesStore.getState().addFavorite(mockFavorite);
      useFavoritesStore.getState().addFavorite(mockFavorite);

      expect(useFavoritesStore.getState().favorites).toHaveLength(1);
    });

    it('should clear all favorites', () => {
      useFavoritesStore.getState().addFavorite(mockFavorite);
      useFavoritesStore.getState().addFavorite(mockFavorite2);
      expect(useFavoritesStore.getState().favorites).toHaveLength(2);

      useFavoritesStore.getState().clearAll();
      expect(useFavoritesStore.getState().favorites).toHaveLength(0);
    });
  });

  describe('Multiple favorites', () => {
    it('should support adding multiple different favorites', () => {
      useFavoritesStore.getState().addFavorite(mockFavorite);
      useFavoritesStore.getState().addFavorite(mockFavorite2);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(2);
      expect(favorites[0].style).toBe('watercolor');
      expect(favorites[1].style).toBe('oil_painting');
    });

    it('should only remove the targeted favorite', () => {
      useFavoritesStore.getState().addFavorite(mockFavorite);
      useFavoritesStore.getState().addFavorite(mockFavorite2);

      const firstId = useFavoritesStore.getState().favorites[0].id;
      useFavoritesStore.getState().removeFavorite(firstId);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);
      expect(favorites[0].style).toBe('oil_painting');
    });
  });

  describe('Persistence', () => {
    it('should use footprint-favorites as localStorage key', () => {
      useFavoritesStore.getState().addFavorite(mockFavorite);

      const stored = localStorage.getItem('footprint-favorites');
      expect(stored).toBeDefined();
      expect(stored).not.toBeNull();
    });
  });
});
