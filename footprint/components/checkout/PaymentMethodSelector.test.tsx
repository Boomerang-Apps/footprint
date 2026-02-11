import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentMethodSelector } from './PaymentMethodSelector';

describe('PaymentMethodSelector', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render section heading', () => {
      render(<PaymentMethodSelector selected="creditCard" onSelect={onSelect} />);

      expect(screen.getByText('אמצעי תשלום')).toBeInTheDocument();
    });

    it('should render all 3 payment method buttons', () => {
      render(<PaymentMethodSelector selected="creditCard" onSelect={onSelect} />);

      expect(screen.getByText('Apple Pay')).toBeInTheDocument();
      expect(screen.getByText('Google Pay')).toBeInTheDocument();
      expect(screen.getByText('כרטיס אשראי')).toBeInTheDocument();
    });

    it('should render 3 clickable buttons', () => {
      render(<PaymentMethodSelector selected="creditCard" onSelect={onSelect} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Selection', () => {
    it('should highlight creditCard when selected', () => {
      render(<PaymentMethodSelector selected="creditCard" onSelect={onSelect} />);

      const creditCardButton = screen.getByText('כרטיס אשראי').closest('button');
      expect(creditCardButton).toHaveClass('border-violet-500');
    });

    it('should highlight applePay when selected', () => {
      render(<PaymentMethodSelector selected="applePay" onSelect={onSelect} />);

      const applePayButton = screen.getByText('Apple Pay').closest('button');
      expect(applePayButton).toHaveClass('border-violet-500');
    });

    it('should not highlight unselected methods', () => {
      render(<PaymentMethodSelector selected="creditCard" onSelect={onSelect} />);

      const applePayButton = screen.getByText('Apple Pay').closest('button');
      expect(applePayButton).not.toHaveClass('border-violet-500');
      expect(applePayButton).toHaveClass('border-zinc-200');
    });
  });

  describe('Interaction', () => {
    it('should call onSelect with applePay when clicked', () => {
      render(<PaymentMethodSelector selected="creditCard" onSelect={onSelect} />);

      fireEvent.click(screen.getByText('Apple Pay'));
      expect(onSelect).toHaveBeenCalledWith('applePay');
    });

    it('should call onSelect with googlePay when clicked', () => {
      render(<PaymentMethodSelector selected="creditCard" onSelect={onSelect} />);

      fireEvent.click(screen.getByText('Google Pay'));
      expect(onSelect).toHaveBeenCalledWith('googlePay');
    });

    it('should call onSelect with creditCard when clicked', () => {
      render(<PaymentMethodSelector selected="applePay" onSelect={onSelect} />);

      fireEvent.click(screen.getByText('כרטיס אשראי'));
      expect(onSelect).toHaveBeenCalledWith('creditCard');
    });
  });

  describe('Radio indicator', () => {
    it('should show filled radio dot for selected method', () => {
      const { container } = render(<PaymentMethodSelector selected="creditCard" onSelect={onSelect} />);

      // The selected method has a filled dot (bg-violet-500 inner circle)
      const filledDots = container.querySelectorAll('.bg-violet-500.rounded-full.w-2\\.5');
      expect(filledDots).toHaveLength(1);
    });
  });
});
