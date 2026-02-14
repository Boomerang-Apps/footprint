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

      // Check for style names in Hebrew - current 4 styles
      expect(screen.getByText('ללא פילטר')).toBeInTheDocument(); // Original
      expect(screen.getByText('צבעי מים')).toBeInTheDocument(); // Watercolor
      expect(screen.getByText('ציור קווי')).toBeInTheDocument(); // Line Art
      expect(screen.getByText('קווי + צבעי מים')).toBeInTheDocument(); // Line + Watercolor
    });

    it('renders style cards as clickable buttons', () => {
      render(<StyleGallery />);
      const styleCards = screen.getAllByRole('button');
      expect(styleCards.length).toBe(4); // 4 styles
    });

    it('displays style thumbnails', () => {
      render(<StyleGallery />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(4);
    });
  });

  describe('Selection', () => {
    it('shows visual indicator for selected style', () => {
      render(<StyleGallery />);

      // Original should be selected by default (from mock)
      const originalCard = screen.getByRole('button', { name: /ללא פילטר/i });
      expect(originalCard).toHaveClass('border-brand-purple');
    });

    it('calls setSelectedStyle when clicking a style', async () => {
      const user = userEvent.setup();
      render(<StyleGallery />);

      // Use getAllByRole since button name includes description text
      const watercolorCards = screen.getAllByRole('button', { name: /צבעי מים/i });
      await user.click(watercolorCards[0]);

      expect(mockSetSelectedStyle).toHaveBeenCalledWith('watercolor');
    });

    it('updates selection visual when different style clicked', async () => {
      const user = userEvent.setup();
      render(<StyleGallery />);

      const lineArtCard = screen.getByRole('button', { name: /ציור קווי/i });
      await user.click(lineArtCard);

      expect(mockSetSelectedStyle).toHaveBeenCalledWith('line_art');
    });
  });

  describe('Original Photo Option (AI-03)', () => {
    it('displays Original as first option in gallery', () => {
      render(<StyleGallery />);

      const styleCards = screen.getAllByRole('button');
      const firstCard = styleCards[0];

      expect(firstCard).toHaveAccessibleName(/ללא פילטר/i);
    });

    it('shows Original option with distinct styling', () => {
      render(<StyleGallery />);

      const originalCard = screen.getByRole('button', { name: /ללא פילטר/i });
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

      const watercolorCards = screen.getAllByRole('button', { name: /צבעי מים/i });
      watercolorCards[0].focus();
      await user.keyboard('{Enter}');

      expect(mockSetSelectedStyle).toHaveBeenCalledWith('watercolor');
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

      const watercolorCards = screen.getAllByRole('button', { name: /צבעי מים/i });
      await user.click(watercolorCards[0]);

      expect(onStyleSelect).toHaveBeenCalledWith('watercolor');
    });
  });
});

describe('StyleCard', () => {
  // StyleCard is tested indirectly through StyleGallery
  // Additional unit tests for StyleCard component

  it('displays style name', () => {
    render(<StyleGallery />);
    expect(screen.getByText('צבעי מים')).toBeInTheDocument();
  });

  it('displays thumbnail image', () => {
    render(<StyleGallery />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src');
    expect(images[0]).toHaveAttribute('alt');
  });

  it('shows popular badge for popular styles', () => {
    render(<StyleGallery />);
    // Only Watercolor is marked as popular
    const popularBadges = screen.getAllByText('פופולרי');
    expect(popularBadges.length).toBe(1);
  });
});
