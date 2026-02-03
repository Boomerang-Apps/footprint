/**
 * GuestOrderLookup Tests
 *
 * Tests for guest order lookup by order number + email.
 * Allows guests to check order status without an account.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-009
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestOrderLookup } from './GuestOrderLookup';

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GuestOrderLookup', () => {
  const defaultProps = {
    onOrderFound: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Rendering', () => {
    it('should display order lookup form with Hebrew text', () => {
      render(<GuestOrderLookup {...defaultProps} />);

      expect(screen.getByText(/בדוק סטטוס הזמנה/i)).toBeInTheDocument();
    });

    it('should display order number input field', () => {
      render(<GuestOrderLookup {...defaultProps} />);

      expect(screen.getByLabelText(/מספר הזמנה/i)).toBeInTheDocument();
    });

    it('should display email input field', () => {
      render(<GuestOrderLookup {...defaultProps} />);

      expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument();
    });

    it('should display search button', () => {
      render(<GuestOrderLookup {...defaultProps} />);

      expect(screen.getByRole('button', { name: /חפש/i })).toBeInTheDocument();
    });

    it('should render with RTL direction', () => {
      const { container } = render(<GuestOrderLookup {...defaultProps} />);

      const formContainer = container.firstChild as HTMLElement;
      expect(formContainer).toHaveAttribute('dir', 'rtl');
    });

    it('should show placeholder text for order number', () => {
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      expect(orderInput).toHaveAttribute('placeholder', 'FP-2026-XXXX');
    });

    it('should show placeholder text for email', () => {
      render(<GuestOrderLookup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/אימייל/i);
      expect(emailInput).toHaveAttribute('placeholder', 'your@email.com');
    });
  });

  describe('Validation', () => {
    it('should show error when order number is empty', async () => {
      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'test@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/נא להזין מספר הזמנה/i)).toBeInTheDocument();
      });
    });

    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/נא להזין כתובת אימייל/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'invalid-email');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/כתובת אימייל לא תקינה/i)).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/נא להזין מספר הזמנה/i)).toBeInTheDocument();
      });

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP');

      await waitFor(() => {
        expect(screen.queryByText(/נא להזין מספר הזמנה/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Order Lookup (AC-009)', () => {
    const mockOrderResponse = {
      orderNumber: 'FP-2026-1234',
      status: 'processing',
      items: [{ name: 'פורטרט פופ ארט', quantity: 1, price: 199 }],
      total: 228,
      createdAt: '2026-02-03T10:00:00Z',
      estimatedDelivery: '2026-02-10',
    };

    it('should call API with order number and email on valid submission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrderResponse),
      });

      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'guest@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/orders/lookup',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: 'FP-2026-1234',
              email: 'guest@example.com',
            }),
          })
        );
      });
    });

    it('should call onOrderFound with order data on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrderResponse),
      });

      const onOrderFound = vi.fn();
      const user = userEvent.setup();
      render(<GuestOrderLookup onOrderFound={onOrderFound} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'guest@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(onOrderFound).toHaveBeenCalledWith(mockOrderResponse);
      });
    });

    it('should show error when order not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Order not found' }),
      });

      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-9999');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'wrong@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/לא נמצאה הזמנה עם הפרטים הללו/i)).toBeInTheDocument();
      });
    });

    it('should show error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'guest@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/שגיאה בחיפוש ההזמנה/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during search', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ orderNumber: 'FP-2026-1234' }),
          }), 500);
        })
      );

      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'guest@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/מחפש/i)).toBeInTheDocument();
      });
    });

    it('should disable inputs during search', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ orderNumber: 'FP-2026-1234' }),
          }), 500);
        })
      );

      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'guest@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(orderInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
      });
    });
  });

  describe('Order Display', () => {
    it('should display order details after successful lookup', async () => {
      const mockOrderResponse = {
        orderNumber: 'FP-2026-1234',
        status: 'processing',
        items: [{ name: 'פורטרט פופ ארט', quantity: 1, price: 199 }],
        total: 228,
        createdAt: '2026-02-03T10:00:00Z',
        estimatedDelivery: '2026-02-10',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrderResponse),
      });

      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'guest@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('order-result')).toBeInTheDocument();
      });

      expect(screen.getByText('FP-2026-1234')).toBeInTheDocument();
      expect(screen.getByText(/₪228/)).toBeInTheDocument();
    });

    it('should show order status badge', async () => {
      const mockOrderResponse = {
        orderNumber: 'FP-2026-1234',
        status: 'processing',
        items: [],
        total: 228,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrderResponse),
      });

      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'guest@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('order-status')).toBeInTheDocument();
      });
    });

    it('should allow searching for another order', async () => {
      const mockOrderResponse = {
        orderNumber: 'FP-2026-1234',
        status: 'processing',
        items: [],
        total: 228,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrderResponse),
      });

      const user = userEvent.setup();
      render(<GuestOrderLookup {...defaultProps} />);

      const orderInput = screen.getByLabelText(/מספר הזמנה/i);
      await user.type(orderInput, 'FP-2026-1234');

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'guest@example.com');

      const searchButton = screen.getByRole('button', { name: /חפש/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('order-result')).toBeInTheDocument();
      });

      const newSearchButton = screen.getByRole('button', { name: /חפש הזמנה אחרת/i });
      await user.click(newSearchButton);

      await waitFor(() => {
        expect(screen.queryByTestId('order-result')).not.toBeInTheDocument();
        expect(screen.getByLabelText(/מספר הזמנה/i)).toBeInTheDocument();
      });
    });
  });

  describe('Prefilled Email (AC-010)', () => {
    it('should accept initialEmail prop', () => {
      render(<GuestOrderLookup {...defaultProps} initialEmail="saved@example.com" />);

      const emailInput = screen.getByLabelText(/אימייל/i) as HTMLInputElement;
      expect(emailInput.value).toBe('saved@example.com');
    });
  });
});
