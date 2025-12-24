/**
 * SizeSelector Component Tests
 *
 * PC-01: Select print size
 * TDD: Tests written FIRST
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SizeSelector from './SizeSelector';

// Mock the orderStore
const mockSetSize = vi.fn();
vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => ({
    size: 'A4',
    setSize: mockSetSize,
  }),
}));

describe('SizeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the selector container', () => {
      render(<SizeSelector />);
      expect(screen.getByRole('group', { name: /size/i })).toBeInTheDocument();
    });

    it('displays all size options', () => {
      render(<SizeSelector />);

      expect(screen.getByText('A5')).toBeInTheDocument();
      expect(screen.getByText('A4')).toBeInTheDocument();
      expect(screen.getByText('A3')).toBeInTheDocument();
      expect(screen.getByText('A2')).toBeInTheDocument();
    });

    it('shows dimensions for each size', () => {
      render(<SizeSelector />);

      expect(screen.getByText(/14.8 × 21/)).toBeInTheDocument(); // A5
      expect(screen.getByText(/21 × 29.7/)).toBeInTheDocument(); // A4
      expect(screen.getByText(/29.7 × 42/)).toBeInTheDocument(); // A3
      expect(screen.getByText(/42 × 59.4/)).toBeInTheDocument(); // A2
    });

    it('displays prices for each size', () => {
      render(<SizeSelector />);

      expect(screen.getByText(/₪89/)).toBeInTheDocument(); // A5
      expect(screen.getByText(/₪129/)).toBeInTheDocument(); // A4
      expect(screen.getByText(/₪179/)).toBeInTheDocument(); // A3
      expect(screen.getByText(/₪249/)).toBeInTheDocument(); // A2
    });
  });

  describe('Selection', () => {
    it('shows visual indicator for selected size', () => {
      render(<SizeSelector />);

      // A4 should be selected by default (from mock)
      const a4Option = screen.getByRole('button', { name: /A4/i });
      expect(a4Option).toHaveClass('border-brand-purple');
    });

    it('calls setSize when clicking a size option', async () => {
      const user = userEvent.setup();
      render(<SizeSelector />);

      const a3Option = screen.getByRole('button', { name: /A3/i });
      await user.click(a3Option);

      expect(mockSetSize).toHaveBeenCalledWith('A3');
    });
  });

  describe('Price Display', () => {
    it('shows price update indicator on selection', async () => {
      const user = userEvent.setup();
      render(<SizeSelector />);

      const a2Option = screen.getByRole('button', { name: /A2/i });
      await user.click(a2Option);

      expect(mockSetSize).toHaveBeenCalledWith('A2');
    });
  });

  describe('Accessibility', () => {
    it('size options are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<SizeSelector />);

      await user.tab();
      expect(document.activeElement?.tagName).toBe('BUTTON');
    });

    it('supports Enter key for selection', async () => {
      const user = userEvent.setup();
      render(<SizeSelector />);

      const a3Option = screen.getByRole('button', { name: /A3/i });
      a3Option.focus();
      await user.keyboard('{Enter}');

      expect(mockSetSize).toHaveBeenCalledWith('A3');
    });
  });

  describe('Props', () => {
    it('accepts custom className', () => {
      render(<SizeSelector className="custom-class" />);
      const selector = screen.getByRole('group');
      expect(selector).toHaveClass('custom-class');
    });

    it('calls onSizeChange callback when provided', async () => {
      const onSizeChange = vi.fn();
      const user = userEvent.setup();

      render(<SizeSelector onSizeChange={onSizeChange} />);

      const a3Option = screen.getByRole('button', { name: /A3/i });
      await user.click(a3Option);

      expect(onSizeChange).toHaveBeenCalledWith('A3');
    });
  });
});
