/**
 * Favorites Page Tests
 *
 * TDD Test Suite for FAV-01: Favorites Page
 * Tests the favorites gallery page with Hebrew RTL layout
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoritesPage from './page';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useOrderStore } from '@/stores/orderStore';
import type { FavoriteItem } from '@/stores/favoritesStore';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock zustand stores
vi.mock('@/stores/favoritesStore');
vi.mock('@/stores/orderStore');

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFavorite1: FavoriteItem = {
  id: 'fav-1',
  imageUrl: 'https://example.com/transformed1.jpg',
  originalImageUrl: 'https://example.com/original1.jpg',
  style: 'watercolor',
  styleName: 'צבעי מים',
  createdAt: new Date('2026-02-03').getTime(),
};

const mockFavorite2: FavoriteItem = {
  id: 'fav-2',
  imageUrl: 'https://example.com/transformed2.jpg',
  originalImageUrl: 'https://example.com/original2.jpg',
  style: 'pop_art',
  styleName: 'פופ ארט',
  createdAt: new Date('2026-02-10').getTime(),
};

describe('FavoritesPage', () => {
  const mockRemoveFavorite = vi.fn();
  const mockSetOriginalImage = vi.fn();
  const mockSetTransformedImage = vi.fn();
  const mockSetSelectedStyle = vi.fn();

  function setupMocks(favorites: FavoriteItem[] = []) {
    (useFavoritesStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      favorites,
      removeFavorite: mockRemoveFavorite,
    });
    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setOriginalImage: mockSetOriginalImage,
      setTransformedImage: mockSetTransformedImage,
      setSelectedStyle: mockSetSelectedStyle,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Header (AC-001)', () => {
    it('renders page header with Hebrew title', () => {
      setupMocks();
      render(<FavoritesPage />);
      expect(screen.getByText('היצירות שלי')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      setupMocks();
      render(<FavoritesPage />);
      expect(screen.getByText('יצירות ה-AI השמורות שלך')).toBeInTheDocument();
    });

    it('has RTL direction on container', () => {
      setupMocks();
      const { container } = render(<FavoritesPage />);
      const main = container.querySelector('main');
      expect(main?.getAttribute('dir')).toBe('rtl');
    });
  });

  describe('Empty State (AC-002)', () => {
    it('shows empty state when no favorites', () => {
      setupMocks([]);
      render(<FavoritesPage />);
      expect(screen.getByText('עדיין לא שמרת יצירות')).toBeInTheDocument();
    });

    it('shows encouraging subtitle text in empty state', () => {
      setupMocks([]);
      render(<FavoritesPage />);
      expect(screen.getByText(/צרו יצירות AI ושמרו אותן/)).toBeInTheDocument();
    });

    it('shows CTA button linking to /create', () => {
      setupMocks([]);
      render(<FavoritesPage />);
      const ctaButton = screen.getByRole('link', { name: /התחילו ליצור/ });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton.getAttribute('href')).toBe('/create');
    });
  });

  describe('Favorites Grid (AC-003, AC-004)', () => {
    it('renders grid of favorite cards when favorites exist', () => {
      setupMocks([mockFavorite1, mockFavorite2]);
      render(<FavoritesPage />);
      // Both images should appear
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(2);
    });

    it('does not show empty state when favorites exist', () => {
      setupMocks([mockFavorite1]);
      render(<FavoritesPage />);
      expect(screen.queryByText('עדיין לא שמרת יצירות')).not.toBeInTheDocument();
    });
  });

  describe('Card Content (AC-006, AC-007)', () => {
    it('displays Hebrew style name on each card', () => {
      setupMocks([mockFavorite1]);
      render(<FavoritesPage />);
      expect(screen.getByText('צבעי מים')).toBeInTheDocument();
    });

    it('displays formatted creation date on each card', () => {
      setupMocks([mockFavorite1]);
      render(<FavoritesPage />);
      // Should show Hebrew date — the exact format depends on locale
      // Feb 3, 2026 in Hebrew
      expect(screen.getByText(/פברואר/)).toBeInTheDocument();
    });
  });

  describe('Heart Remove (AC-005)', () => {
    it('removes favorite when heart icon clicked', () => {
      setupMocks([mockFavorite1]);
      render(<FavoritesPage />);
      const heartButton = screen.getByRole('button', { name: /הסר ממועדפים/ });
      fireEvent.click(heartButton);
      expect(mockRemoveFavorite).toHaveBeenCalledWith('fav-1');
    });
  });

  describe('Use This Flow (AC-008)', () => {
    it('updates orderStore and navigates when Use This clicked', () => {
      setupMocks([mockFavorite1]);
      render(<FavoritesPage />);
      const useButton = screen.getByRole('button', { name: /השתמש ביצירה/ });
      fireEvent.click(useButton);

      expect(mockSetOriginalImage).toHaveBeenCalledWith(mockFavorite1.originalImageUrl);
      expect(mockSetTransformedImage).toHaveBeenCalledWith(mockFavorite1.imageUrl);
      expect(mockSetSelectedStyle).toHaveBeenCalledWith(mockFavorite1.style);
      expect(mockPush).toHaveBeenCalledWith('/create/style');
    });
  });
});
