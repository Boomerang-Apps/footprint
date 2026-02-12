import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OrderSummary } from './OrderSummary';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; fill?: boolean; className?: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

import { vi } from 'vitest';

const defaultProps = {
  originalImage: '/test-image.jpg',
  size: 'A4',
  paperType: 'matte',
  frameType: 'none',
  isGift: false,
  giftWrap: false,
  basePrice: 129,
  paperMod: 0,
  framePrice: 0,
  wrappingPrice: 0,
  shipping: 29,
  total: 158,
};

describe('OrderSummary', () => {
  describe('Product preview', () => {
    it('should render order summary heading', () => {
      render(<OrderSummary {...defaultProps} />);

      expect(screen.getByText('סיכום הזמנה')).toBeInTheDocument();
    });

    it('should display product image', () => {
      render(<OrderSummary {...defaultProps} />);

      const img = screen.getByAltText('Product');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/test-image.jpg');
    });

    it('should display size', () => {
      render(<OrderSummary {...defaultProps} />);

      expect(screen.getByText('גודל: A4')).toBeInTheDocument();
    });

    it('should display paper type in Hebrew for matte', () => {
      render(<OrderSummary {...defaultProps} paperType="matte" />);

      expect(screen.getByText('נייר: מט')).toBeInTheDocument();
    });

    it('should display paper type in Hebrew for glossy', () => {
      render(<OrderSummary {...defaultProps} paperType="glossy" />);

      expect(screen.getByText('נייר: מבריק')).toBeInTheDocument();
    });

    it('should display paper type in Hebrew for canvas', () => {
      render(<OrderSummary {...defaultProps} paperType="canvas" />);

      expect(screen.getByText('נייר: קנבס')).toBeInTheDocument();
    });

    it('should not show frame when frameType is none', () => {
      render(<OrderSummary {...defaultProps} frameType="none" />);

      expect(screen.queryByText(/מסגרת/)).not.toBeInTheDocument();
    });

    it('should display frame type in Hebrew for black', () => {
      render(<OrderSummary {...defaultProps} frameType="black" />);

      expect(screen.getByText('מסגרת: שחור')).toBeInTheDocument();
    });

    it('should show gift badge when isGift is true', () => {
      render(<OrderSummary {...defaultProps} isGift={true} />);

      expect(screen.getByText('מתנה')).toBeInTheDocument();
    });

    it('should show gift wrap badge when giftWrap is true', () => {
      render(<OrderSummary {...defaultProps} giftWrap={true} />);

      expect(screen.getByText('עטיפת מתנה')).toBeInTheDocument();
    });
  });

  describe('Price breakdown', () => {
    it('should display base price', () => {
      render(<OrderSummary {...defaultProps} />);

      expect(screen.getByText('₪129')).toBeInTheDocument();
    });

    it('should not show paper mod line when paperMod is 0', () => {
      render(<OrderSummary {...defaultProps} paperMod={0} />);

      expect(screen.queryByText('תוספת נייר')).not.toBeInTheDocument();
    });

    it('should show paper mod line when paperMod > 0', () => {
      render(<OrderSummary {...defaultProps} paperMod={20} />);

      expect(screen.getByText('תוספת נייר')).toBeInTheDocument();
      expect(screen.getByText('₪20')).toBeInTheDocument();
    });

    it('should not show frame line when framePrice is 0', () => {
      render(<OrderSummary {...defaultProps} framePrice={0} />);

      // "מסגרת" only appears in price breakdown, not in preview when none
      expect(screen.queryByText('מסגרת')).not.toBeInTheDocument();
    });

    it('should show frame price when framePrice > 0', () => {
      render(<OrderSummary {...defaultProps} framePrice={79} />);

      expect(screen.getByText('מסגרת')).toBeInTheDocument();
    });

    it('should show free shipping when shipping is 0', () => {
      render(<OrderSummary {...defaultProps} shipping={0} />);

      expect(screen.getByText('חינם!')).toBeInTheDocument();
    });

    it('should show shipping cost when shipping > 0', () => {
      render(<OrderSummary {...defaultProps} shipping={29} />);

      expect(screen.getByText('₪29')).toBeInTheDocument();
    });

    it('should display total', () => {
      render(<OrderSummary {...defaultProps} total={158} />);

      expect(screen.getByText('₪158')).toBeInTheDocument();
      expect(screen.getByText('סה״כ לתשלום')).toBeInTheDocument();
    });
  });

  describe('Trust badges', () => {
    it('should display secure payment badge', () => {
      render(<OrderSummary {...defaultProps} />);

      expect(screen.getByText('תשלום מאובטח')).toBeInTheDocument();
    });

    it('should display money-back badge', () => {
      render(<OrderSummary {...defaultProps} />);

      expect(screen.getByText('החזר כספי')).toBeInTheDocument();
    });
  });
});
