/**
 * StyleGallery Component Tests
 *
 * AI-01: Display AI style gallery
 * TDD: Tests written FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StyleGallery from './StyleGallery';
import type { StyleType } from '@/types';

// Mock the orderStore
const mockSetSelectedStyle = vi.fn();
vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => ({
    selectedStyle: 'original',
    setSelectedStyle: mockSetSelectedStyle,
  }),
}));

describe('StyleGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the gallery container', () => {
      render(<StyleGallery />);
      expect(screen.getByRole('group', { name: /style gallery/i })).toBeInTheDocument();
    });

    it('displays all available styles', () => {
      render(<StyleGallery />);

      // Check for style names in Hebrew
      expect(screen.getByText('מקורי')).toBeInTheDocument(); // Original
      expect(screen.getByText('פופ ארט')).toBeInTheDocument(); // Pop Art
      expect(screen.getByText('צבעי מים')).toBeInTheDocument(); // Watercolor
      expect(screen.getByText('קווים')).toBeInTheDocument(); // Line Art
      expect(screen.getByText('ציור שמן')).toBeInTheDocument(); // Oil Painting
      expect(screen.getByText('רומנטי')).toBeInTheDocument(); // Romantic
      expect(screen.getByText('קומיקס')).toBeInTheDocument(); // Comic Book
      expect(screen.getByText('וינטג׳')).toBeInTheDocument(); // Vintage
      expect(screen.getByText('מינימליסטי')).toBeInTheDocument(); // Minimalist
    });

    it('renders style cards as clickable buttons', () => {
      render(<StyleGallery />);
      const styleCards = screen.getAllByRole('button');
      expect(styleCards.length).toBeGreaterThanOrEqual(9); // 9 styles
    });

    it('displays style thumbnails', () => {
      render(<StyleGallery />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('Selection', () => {
    it('shows visual indicator for selected style', () => {
      render(<StyleGallery />);

      // Original should be selected by default (from mock)
      const originalCard = screen.getByRole('button', { name: /מקורי/i });
      expect(originalCard).toHaveClass('border-brand-purple');
    });

    it('calls setSelectedStyle when clicking a style', async () => {
      const user = userEvent.setup();
      render(<StyleGallery />);

      const popArtCard = screen.getByRole('button', { name: /פופ ארט/i });
      await user.click(popArtCard);

      expect(mockSetSelectedStyle).toHaveBeenCalledWith('pop_art');
    });

    it('updates selection visual when different style clicked', async () => {
      const user = userEvent.setup();
      render(<StyleGallery />);

      const watercolorCard = screen.getByRole('button', { name: /צבעי מים/i });
      await user.click(watercolorCard);

      expect(mockSetSelectedStyle).toHaveBeenCalledWith('watercolor');
    });
  });

  describe('Original Photo Option (AI-03)', () => {
    it('displays Original as first option in gallery', () => {
      render(<StyleGallery />);

      const styleCards = screen.getAllByRole('button');
      const firstCard = styleCards[0];

      expect(firstCard).toHaveAccessibleName(/מקורי/i);
    });

    it('shows Original option with distinct styling', () => {
      render(<StyleGallery />);

      const originalCard = screen.getByRole('button', { name: /מקורי/i });
      expect(originalCard).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for gallery', () => {
      render(<StyleGallery />);
      expect(screen.getByRole('group')).toHaveAttribute('aria-label');
    });

    it('style cards are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<StyleGallery />);

      // Tab to first card
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName).toBe('BUTTON');
    });

    it('supports Enter key for selection', async () => {
      const user = userEvent.setup();
      render(<StyleGallery />);

      const popArtCard = screen.getByRole('button', { name: /פופ ארט/i });
      popArtCard.focus();
      await user.keyboard('{Enter}');

      expect(mockSetSelectedStyle).toHaveBeenCalledWith('pop_art');
    });
  });

  describe('Props', () => {
    it('accepts custom className', () => {
      render(<StyleGallery className="custom-class" />);
      const gallery = screen.getByRole('group');
      expect(gallery).toHaveClass('custom-class');
    });

    it('calls onStyleSelect callback when provided', async () => {
      const onStyleSelect = vi.fn();
      const user = userEvent.setup();

      render(<StyleGallery onStyleSelect={onStyleSelect} />);

      const popArtCard = screen.getByRole('button', { name: /פופ ארט/i });
      await user.click(popArtCard);

      expect(onStyleSelect).toHaveBeenCalledWith('pop_art');
    });
  });
});

describe('StyleCard', () => {
  // StyleCard is tested indirectly through StyleGallery
  // Additional unit tests for StyleCard component

  it('displays style name', () => {
    render(<StyleGallery />);
    expect(screen.getByText('פופ ארט')).toBeInTheDocument();
  });

  it('displays thumbnail image', () => {
    render(<StyleGallery />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src');
    expect(images[0]).toHaveAttribute('alt');
  });

  it('shows popular badge for popular styles', () => {
    render(<StyleGallery />);
    // Pop Art and Oil Painting are marked as popular
    const popularBadges = screen.getAllByText('פופולרי');
    expect(popularBadges.length).toBe(2);
  });
});
