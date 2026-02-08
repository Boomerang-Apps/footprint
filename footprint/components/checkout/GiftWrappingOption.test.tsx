/**
 * @story GF-04
 * Tests for GiftWrappingOption component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GiftWrappingOption } from './GiftWrappingOption';

// Mock orderStore
const mockState = {
  giftWrap: false,
  wrappingStyle: null as string | null,
  isGift: false,
  giftMessage: '',
  setGiftWrap: vi.fn(),
  setWrappingStyle: vi.fn(),
};

vi.mock('@/stores/orderStore', () => ({
  useOrderStore: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

// Mock WrappingStyleSelector
vi.mock('./WrappingStyleSelector', () => ({
  WrappingStyleSelector: ({ selectedStyle, onStyleChange }: { selectedStyle: string; onStyleChange: (s: string) => void }) => (
    <div data-testid="wrapping-style-selector-mock">
      <span>Selected: {selectedStyle}</span>
      <button onClick={() => onStyleChange('festive')}>Change to festive</button>
    </div>
  ),
}));

// Mock PriceDisplay
vi.mock('@/components/ui/PriceDisplay', () => ({
  PriceDisplay: ({ amount }: { amount: number }) => <span data-testid="price-display">₪{amount}</span>,
}));

describe('GiftWrappingOption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.giftWrap = false;
    mockState.wrappingStyle = null;
    mockState.isGift = false;
    mockState.giftMessage = '';
  });

  describe('AC-001: Display toggle for gift wrapping', () => {
    it('should render gift wrapping toggle', () => {
      render(<GiftWrappingOption />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('should display Hebrew label', () => {
      render(<GiftWrappingOption />);

      expect(screen.getByText('עטיפת מתנה')).toBeInTheDocument();
    });
  });

  describe('AC-002: Show wrapping price', () => {
    it('should display gift wrapping price', () => {
      render(<GiftWrappingOption />);

      // Price should be displayed
      expect(screen.getByTestId('price-display')).toBeInTheDocument();
      expect(screen.getByTestId('price-display')).toHaveTextContent('₪15');
    });
  });

  describe('AC-003: Toggle gift wrapping', () => {
    it('should call setGiftWrap when toggled on', () => {
      render(<GiftWrappingOption />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(mockState.setGiftWrap).toHaveBeenCalledWith(true);
    });

    it('should call setGiftWrap when toggled off', () => {
      mockState.giftWrap = true;
      render(<GiftWrappingOption />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(mockState.setGiftWrap).toHaveBeenCalledWith(false);
    });

    it('should show toggle in active state when enabled', () => {
      mockState.giftWrap = true;
      render(<GiftWrappingOption />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('AC-004: Show style selector when enabled', () => {
    it('should NOT show style selector when gift wrap disabled', () => {
      mockState.giftWrap = false;
      render(<GiftWrappingOption />);

      expect(screen.queryByTestId('wrapping-style-selector-mock')).not.toBeInTheDocument();
    });

    it('should show style selector when gift wrap enabled', () => {
      mockState.giftWrap = true;
      mockState.wrappingStyle = 'classic';
      render(<GiftWrappingOption />);

      expect(screen.getByTestId('wrapping-style-selector-mock')).toBeInTheDocument();
    });

    it('should pass selected style to selector', () => {
      mockState.giftWrap = true;
      mockState.wrappingStyle = 'festive';
      render(<GiftWrappingOption />);

      expect(screen.getByText('Selected: festive')).toBeInTheDocument();
    });
  });

  describe('AC-007: Combined preview', () => {
    it('should NOT show preview when only wrapping enabled', () => {
      mockState.giftWrap = true;
      mockState.wrappingStyle = 'classic';
      mockState.isGift = false;
      render(<GiftWrappingOption />);

      expect(screen.queryByText('תצוגה מקדימה של המתנה')).not.toBeInTheDocument();
    });

    it('should NOT show preview when only gift message', () => {
      mockState.giftWrap = false;
      mockState.isGift = true;
      mockState.giftMessage = 'Happy Birthday!';
      render(<GiftWrappingOption />);

      expect(screen.queryByText('תצוגה מקדימה של המתנה')).not.toBeInTheDocument();
    });

    it('should show preview when both wrapping and gift message enabled', () => {
      mockState.giftWrap = true;
      mockState.wrappingStyle = 'classic';
      mockState.isGift = true;
      mockState.giftMessage = 'Happy Birthday!';
      render(<GiftWrappingOption />);

      expect(screen.getByText('תצוגה מקדימה של המתנה')).toBeInTheDocument();
    });

    it('should display wrapping style name in preview', () => {
      mockState.giftWrap = true;
      mockState.wrappingStyle = 'festive';
      mockState.isGift = true;
      mockState.giftMessage = 'Happy Birthday!';
      render(<GiftWrappingOption />);

      expect(screen.getByText('סגנון חגיגי')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible toggle label', () => {
      render(<GiftWrappingOption />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'הפעל עטיפת מתנה');
    });

    it('should be keyboard navigable', () => {
      render(<GiftWrappingOption />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      expect(document.activeElement).toBe(toggle);
    });

    it('should have RTL direction', () => {
      render(<GiftWrappingOption />);

      const container = screen.getByTestId('gift-wrapping-option');
      expect(container).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<GiftWrappingOption className="custom-class" />);

      const container = screen.getByTestId('gift-wrapping-option');
      expect(container).toHaveClass('custom-class');
    });

    it('should highlight icon when enabled', () => {
      mockState.giftWrap = true;
      render(<GiftWrappingOption />);

      // The icon container should have pink background when enabled
      const container = screen.getByTestId('gift-wrapping-option');
      expect(container.querySelector('.bg-pink-100')).toBeInTheDocument();
    });
  });
});
