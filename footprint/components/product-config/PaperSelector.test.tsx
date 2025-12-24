/**
 * PaperSelector Component Tests
 *
 * PC-02: Choose paper type
 * TDD: Tests written FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaperSelector from './PaperSelector';

// Mock the orderStore
const mockSetPaperType = vi.fn();
vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => ({
    paperType: 'matte',
    setPaperType: mockSetPaperType,
  }),
}));

describe('PaperSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the selector container', () => {
      render(<PaperSelector />);
      expect(screen.getByRole('group', { name: /paper/i })).toBeInTheDocument();
    });

    it('displays all paper options', () => {
      render(<PaperSelector />);

      expect(screen.getByText('מט')).toBeInTheDocument(); // Matte
      expect(screen.getByText('מבריק')).toBeInTheDocument(); // Glossy
      expect(screen.getByText('קנבס')).toBeInTheDocument(); // Canvas
    });

    it('shows descriptions for each paper type', () => {
      render(<PaperSelector />);

      // Check for tooltips/descriptions
      expect(screen.getByText(/משטח חלק/i)).toBeInTheDocument(); // Matte description
      expect(screen.getByText(/ברק גבוה/i)).toBeInTheDocument(); // Glossy description
      expect(screen.getByText(/טקסטורה אמנותית/i)).toBeInTheDocument(); // Canvas description
    });

    it('displays price modifiers', () => {
      render(<PaperSelector />);

      // Matte is base (no modifier shown or +₪0)
      expect(screen.getByText(/\+₪20/)).toBeInTheDocument(); // Glossy
      expect(screen.getByText(/\+₪50/)).toBeInTheDocument(); // Canvas
    });
  });

  describe('Selection', () => {
    it('shows visual indicator for selected paper', () => {
      render(<PaperSelector />);

      // Matte should be selected by default (from mock)
      const matteOption = screen.getByRole('button', { name: /מט/i });
      expect(matteOption).toHaveClass('border-brand-purple');
    });

    it('calls setPaperType when clicking a paper option', async () => {
      const user = userEvent.setup();
      render(<PaperSelector />);

      const glossyOption = screen.getByRole('button', { name: /מבריק/i });
      await user.click(glossyOption);

      expect(mockSetPaperType).toHaveBeenCalledWith('glossy');
    });
  });

  describe('Tooltips', () => {
    it('shows tooltip on hover for paper type', async () => {
      render(<PaperSelector />);

      // Check that descriptions are visible
      const descriptions = screen.getAllByText(/משטח|ברק|טקסטורה/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('paper options are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<PaperSelector />);

      await user.tab();
      expect(document.activeElement?.tagName).toBe('BUTTON');
    });

    it('supports Enter key for selection', async () => {
      const user = userEvent.setup();
      render(<PaperSelector />);

      const canvasOption = screen.getByRole('button', { name: /קנבס/i });
      canvasOption.focus();
      await user.keyboard('{Enter}');

      expect(mockSetPaperType).toHaveBeenCalledWith('canvas');
    });
  });

  describe('Props', () => {
    it('accepts custom className', () => {
      render(<PaperSelector className="custom-class" />);
      const selector = screen.getByRole('group');
      expect(selector).toHaveClass('custom-class');
    });

    it('calls onPaperChange callback when provided', async () => {
      const onPaperChange = vi.fn();
      const user = userEvent.setup();

      render(<PaperSelector onPaperChange={onPaperChange} />);

      const canvasOption = screen.getByRole('button', { name: /קנבס/i });
      await user.click(canvasOption);

      expect(onPaperChange).toHaveBeenCalledWith('canvas');
    });
  });
});
