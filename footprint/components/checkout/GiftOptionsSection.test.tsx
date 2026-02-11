import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GiftOptionsSection } from './GiftOptionsSection';

const defaultProps = {
  isGift: false,
  onToggleGift: vi.fn(),
  giftOccasion: null as import('@/stores/orderStore').GiftOccasion,
  onSetOccasion: vi.fn(),
  giftMessage: '',
  onSetMessage: vi.fn(),
  hideGiftPrice: false,
  onSetHidePrice: vi.fn(),
};

describe('GiftOptionsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Gift toggle', () => {
    it('should render gift toggle button', () => {
      render(<GiftOptionsSection {...defaultProps} />);

      expect(screen.getByText('זוהי מתנה?')).toBeInTheDocument();
    });

    it('should call onToggleGift with true when toggled on', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={false} />);

      fireEvent.click(screen.getByText('זוהי מתנה?'));
      expect(defaultProps.onToggleGift).toHaveBeenCalledWith(true);
    });

    it('should call onToggleGift with false when toggled off', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} />);

      fireEvent.click(screen.getByText('זוהי מתנה?'));
      expect(defaultProps.onToggleGift).toHaveBeenCalledWith(false);
    });
  });

  describe('Gift options panel (when isGift=true)', () => {
    it('should not show options panel when isGift is false', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={false} />);

      expect(screen.queryByText('סוג האירוע')).not.toBeInTheDocument();
    });

    it('should show options panel when isGift is true', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} />);

      expect(screen.getByText('סוג האירוע')).toBeInTheDocument();
    });

    it('should render all 9 occasion options', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} />);

      expect(screen.getByText('יום הולדת')).toBeInTheDocument();
      expect(screen.getByText('אהבה')).toBeInTheDocument();
      expect(screen.getByText('חתונה')).toBeInTheDocument();
      expect(screen.getByText('תינוק חדש')).toBeInTheDocument();
      expect(screen.getByText('בר/בת מצווה')).toBeInTheDocument();
      expect(screen.getByText('חנוכת בית')).toBeInTheDocument();
      expect(screen.getByText('סיום לימודים')).toBeInTheDocument();
      expect(screen.getByText('תודה')).toBeInTheDocument();
      expect(screen.getByText('סתם ככה')).toBeInTheDocument();
    });
  });

  describe('Occasion selection', () => {
    it('should call onSetOccasion with occasion id when clicked', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} />);

      fireEvent.click(screen.getByText('יום הולדת'));
      expect(defaultProps.onSetOccasion).toHaveBeenCalledWith('birthday');
    });

    it('should call onSetOccasion with null when deselecting active occasion', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} giftOccasion="birthday" />);

      fireEvent.click(screen.getByText('יום הולדת'));
      expect(defaultProps.onSetOccasion).toHaveBeenCalledWith(null);
    });
  });

  describe('Personal message', () => {
    it('should render message textarea when isGift is true', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} />);

      expect(screen.getByText('הודעה אישית')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('כתבו הודעה אישית למקבל המתנה...')).toBeInTheDocument();
    });

    it('should display character count', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} giftMessage="שלום" />);

      expect(screen.getByText('4/150')).toBeInTheDocument();
    });

    it('should call onSetMessage when typing', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} />);

      const textarea = screen.getByPlaceholderText('כתבו הודעה אישית למקבל המתנה...');
      fireEvent.change(textarea, { target: { value: 'שלום עולם' } });
      expect(defaultProps.onSetMessage).toHaveBeenCalled();
    });
  });

  describe('Hide price checkbox', () => {
    it('should render hide price checkbox when isGift is true', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} />);

      expect(screen.getByText('הסתר מחיר מהנמען')).toBeInTheDocument();
    });

    it('should call onSetHidePrice when checkbox toggled', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(defaultProps.onSetHidePrice).toHaveBeenCalledWith(true);
    });

    it('should reflect hideGiftPrice state', () => {
      render(<GiftOptionsSection {...defaultProps} isGift={true} hideGiftPrice={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });
});
