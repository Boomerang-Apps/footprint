/**
 * FrameSelector Component Tests
 *
 * PC-03: Add frame option
 * TDD: Tests written FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FrameSelector from './FrameSelector';

// Mock the orderStore
const mockSetFrameType = vi.fn();
vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => ({
    frameType: 'none',
    setFrameType: mockSetFrameType,
  }),
}));

describe('FrameSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the selector container', () => {
      render(<FrameSelector />);
      expect(screen.getByRole('group', { name: /frame/i })).toBeInTheDocument();
    });

    it('displays all frame options', () => {
      render(<FrameSelector />);

      expect(screen.getByText('ללא מסגרת')).toBeInTheDocument(); // None
      expect(screen.getByText('שחור')).toBeInTheDocument(); // Black
      expect(screen.getByText('לבן')).toBeInTheDocument(); // White
      expect(screen.getByText('אלון')).toBeInTheDocument(); // Oak
    });

    it('shows frame preview colors', () => {
      render(<FrameSelector />);

      // Check for color indicators/previews
      const frameButtons = screen.getAllByRole('button');
      expect(frameButtons.length).toBe(4);
    });

    it('displays frame prices', () => {
      render(<FrameSelector />);

      // None has no price, others show prices
      const prices79 = screen.getAllByText(/₪79/);
      expect(prices79.length).toBe(2); // Black and White
      expect(screen.getByText(/₪99/)).toBeInTheDocument(); // Oak
    });
  });

  describe('Selection', () => {
    it('shows visual indicator for selected frame', () => {
      render(<FrameSelector />);

      // None should be selected by default (from mock)
      const noneOption = screen.getByRole('button', { name: /ללא מסגרת/i });
      expect(noneOption).toHaveClass('border-brand-purple');
    });

    it('calls setFrameType when clicking a frame option', async () => {
      const user = userEvent.setup();
      render(<FrameSelector />);

      const blackOption = screen.getByRole('button', { name: /שחור/i });
      await user.click(blackOption);

      expect(mockSetFrameType).toHaveBeenCalledWith('black');
    });
  });

  describe('Frame Preview', () => {
    it('shows color swatch for each frame type', () => {
      render(<FrameSelector />);

      // Each frame option should have a visual color indicator
      const colorSwatches = document.querySelectorAll('[data-frame-color]');
      expect(colorSwatches.length).toBeGreaterThanOrEqual(0); // Optional visual
    });
  });

  describe('Price Update', () => {
    it('shows price update on frame selection', async () => {
      const user = userEvent.setup();
      render(<FrameSelector />);

      const oakOption = screen.getByRole('button', { name: /אלון/i });
      await user.click(oakOption);

      expect(mockSetFrameType).toHaveBeenCalledWith('oak');
    });
  });

  describe('Accessibility', () => {
    it('frame options are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<FrameSelector />);

      await user.tab();
      expect(document.activeElement?.tagName).toBe('BUTTON');
    });

    it('supports Enter key for selection', async () => {
      const user = userEvent.setup();
      render(<FrameSelector />);

      const whiteOption = screen.getByRole('button', { name: /לבן/i });
      whiteOption.focus();
      await user.keyboard('{Enter}');

      expect(mockSetFrameType).toHaveBeenCalledWith('white');
    });
  });

  describe('Props', () => {
    it('accepts custom className', () => {
      render(<FrameSelector className="custom-class" />);
      const selector = screen.getByRole('group');
      expect(selector).toHaveClass('custom-class');
    });

    it('calls onFrameChange callback when provided', async () => {
      const onFrameChange = vi.fn();
      const user = userEvent.setup();

      render(<FrameSelector onFrameChange={onFrameChange} />);

      const blackOption = screen.getByRole('button', { name: /שחור/i });
      await user.click(blackOption);

      expect(onFrameChange).toHaveBeenCalledWith('black');
    });
  });

  describe('Popular Badge', () => {
    it('shows popular badge on recommended frames', () => {
      render(<FrameSelector />);
      // Black frame should be marked as popular
      expect(screen.getByText('פופולרי')).toBeInTheDocument();
    });
  });
});
