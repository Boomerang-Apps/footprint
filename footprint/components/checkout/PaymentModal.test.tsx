import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentModal } from './PaymentModal';

describe('PaymentModal', () => {
  const defaultProps = {
    paymentUrl: 'https://payments.payplus.co.il/test-page',
    onSuccess: vi.fn(),
    onFailure: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal with iframe pointing to paymentUrl', () => {
      render(<PaymentModal {...defaultProps} />);

      const iframe = screen.getByTitle('PayPlus תשלום מאובטח');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', defaultProps.paymentUrl);
    });

    it('should render security badge text', () => {
      render(<PaymentModal {...defaultProps} />);

      expect(
        screen.getByText('תשלום מאובטח באמצעות PayPlus')
      ).toBeInTheDocument();
    });

    it('should have dialog role and RTL direction', () => {
      render(<PaymentModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner initially', () => {
      render(<PaymentModal {...defaultProps} />);

      expect(screen.getByText('טוען טופס תשלום...')).toBeInTheDocument();
    });

    it('should hide loading spinner after iframe loads', () => {
      render(<PaymentModal {...defaultProps} />);

      const iframe = screen.getByTitle('PayPlus תשלום מאובטח');
      fireEvent.load(iframe);

      expect(
        screen.queryByText('טוען טופס תשלום...')
      ).not.toBeInTheDocument();
    });
  });

  describe('postMessage handling', () => {
    it('should call onSuccess when receiving success message', () => {
      render(<PaymentModal {...defaultProps} />);

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'PAYPLUS_PAYMENT_RESULT',
              success: true,
              pageRequestUid: 'test-uid-123',
            },
            origin: window.location.origin,
          })
        );
      });

      expect(defaultProps.onSuccess).toHaveBeenCalledWith('test-uid-123', '', '');
    });

    it('should call onFailure when receiving failure message', () => {
      render(<PaymentModal {...defaultProps} />);

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'PAYPLUS_PAYMENT_RESULT',
              success: false,
              pageRequestUid: '',
            },
            origin: window.location.origin,
          })
        );
      });

      expect(defaultProps.onFailure).toHaveBeenCalledWith(
        'התשלום נכשל. אנא נסו שוב.'
      );
    });

    it('should ignore messages from wrong origin', () => {
      render(<PaymentModal {...defaultProps} />);

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'PAYPLUS_PAYMENT_RESULT',
              success: true,
              pageRequestUid: 'test-uid-123',
            },
            origin: 'https://evil-site.com',
          })
        );
      });

      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
      expect(defaultProps.onFailure).not.toHaveBeenCalled();
    });

    it('should ignore messages with wrong type', () => {
      render(<PaymentModal {...defaultProps} />);

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'SOME_OTHER_MESSAGE',
              success: true,
            },
            origin: window.location.origin,
          })
        );
      });

      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
      expect(defaultProps.onFailure).not.toHaveBeenCalled();
    });
  });

  describe('Close behavior', () => {
    it('should show confirmation dialog when close button clicked', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<PaymentModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('סגור');
      fireEvent.click(closeButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'האם אתם בטוחים שברצונכם לבטל את התשלום?'
      );
    });

    it('should call onClose when confirmation accepted', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<PaymentModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('סגור');
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should NOT call onClose when confirmation rejected', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<PaymentModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('סגור');
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should close on ESC key with confirmation', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<PaymentModal {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(window.confirm).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove message listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<PaymentModal {...defaultProps} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });
  });
});
