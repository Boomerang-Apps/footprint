/**
 * PriceDisplay Component Tests
 * TDD Test Suite for UI-09: Price Display & Timeline Components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceDisplay } from './PriceDisplay';

describe('PriceDisplay', () => {
  describe('Basic Rendering', () => {
    it('renders price with shekel symbol', () => {
      render(<PriceDisplay amount={100} />);
      expect(screen.getByText(/₪/)).toBeInTheDocument();
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(<PriceDisplay amount={50} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders as span element by default', () => {
      const { container } = render(<PriceDisplay amount={100} />);
      expect(container.firstChild?.nodeName).toBe('SPAN');
    });
  });

  describe('Currency Formatting', () => {
    it('formats integer amounts without decimals', () => {
      render(<PriceDisplay amount={150} />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('₪150');
    });

    it('formats decimal amounts with two decimal places', () => {
      render(<PriceDisplay amount={99.5} />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('₪99.50');
    });

    it('rounds to two decimal places', () => {
      render(<PriceDisplay amount={99.999} />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('₪100.00');
    });

    it('formats large amounts with no thousands separator by default', () => {
      render(<PriceDisplay amount={1500} />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('₪1500');
    });

    it('formats large amounts with thousands separator when enabled', () => {
      render(<PriceDisplay amount={1500} showThousandsSeparator />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('₪1,500');
    });

    it('formats decimal amounts with thousands separator', () => {
      render(<PriceDisplay amount={1500.50} showThousandsSeparator />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('₪1,500.50');
    });
  });

  describe('Zero Amount Handling', () => {
    it('shows "חינם" (Free) for zero amount by default', () => {
      render(<PriceDisplay amount={0} />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('חינם');
    });

    it('shows "Free" for zero amount when locale is en', () => {
      render(<PriceDisplay amount={0} locale="en" />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('Free');
    });

    it('shows ₪0 when showZeroAsPrice is true', () => {
      render(<PriceDisplay amount={0} showZeroAsPrice />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('₪0');
    });
  });

  describe('Strikethrough (Original Price)', () => {
    it('renders with strikethrough when strikethrough prop is true', () => {
      render(<PriceDisplay amount={200} strikethrough />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('line-through');
    });

    it('applies muted styling to strikethrough prices', () => {
      render(<PriceDisplay amount={200} strikethrough />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-zinc-500');
    });

    it('does not have strikethrough by default', () => {
      render(<PriceDisplay amount={200} />);
      const price = screen.getByTestId('price-display');
      expect(price).not.toHaveClass('line-through');
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      render(<PriceDisplay amount={100} size="sm" />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-sm');
    });

    it('renders medium size by default', () => {
      render(<PriceDisplay amount={100} />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-base');
    });

    it('renders large size', () => {
      render(<PriceDisplay amount={100} size="lg" />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-xl');
    });

    it('renders extra-large size', () => {
      render(<PriceDisplay amount={100} size="xl" />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-2xl');
    });
  });

  describe('RTL Support', () => {
    it('applies RTL direction when locale is he', () => {
      const { container } = render(<PriceDisplay amount={100} locale="he" />);
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it('applies LTR direction when locale is en', () => {
      const { container } = render(<PriceDisplay amount={100} locale="en" />);
      expect(container.firstChild).toHaveAttribute('dir', 'ltr');
    });

    it('defaults to Hebrew (RTL)', () => {
      const { container } = render(<PriceDisplay amount={100} />);
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Currency Symbol Position', () => {
    it('shows symbol before amount for ILS', () => {
      render(<PriceDisplay amount={100} />);
      const text = screen.getByTestId('price-display').textContent;
      expect(text).toMatch(/^₪/);
    });
  });

  describe('Accessibility', () => {
    it('has aria-label with full price description', () => {
      render(<PriceDisplay amount={150} />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveAttribute('aria-label', '150 Israeli Shekels');
    });

    it('has aria-label for free items', () => {
      render(<PriceDisplay amount={0} />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveAttribute('aria-label', 'Free');
    });

    it('has aria-label indicating original price when strikethrough', () => {
      render(<PriceDisplay amount={200} strikethrough />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveAttribute('aria-label', 'Original price: 200 Israeli Shekels');
    });
  });

  describe('Color Variants', () => {
    it('applies default color', () => {
      render(<PriceDisplay amount={100} />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-white');
    });

    it('applies success color', () => {
      render(<PriceDisplay amount={100} color="success" />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-green-500');
    });

    it('applies muted color', () => {
      render(<PriceDisplay amount={100} color="muted" />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-zinc-400');
    });
  });

  describe('Negative Amounts', () => {
    it('displays negative amounts with minus sign', () => {
      render(<PriceDisplay amount={-50} />);
      expect(screen.getByTestId('price-display')).toHaveTextContent('-₪50');
    });

    it('applies success color for negative amounts (discounts)', () => {
      render(<PriceDisplay amount={-50} />);
      const price = screen.getByTestId('price-display');
      expect(price).toHaveClass('text-green-500');
    });
  });
});
