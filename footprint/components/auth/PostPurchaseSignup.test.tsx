/**
 * PostPurchaseSignup Tests
 *
 * Tests for post-purchase account creation prompt.
 * Shown to guest users after completing checkout.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-007, AC-008
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostPurchaseSignup } from './PostPurchaseSignup';

// Use vi.hoisted to ensure mock function is available when vi.mock is hoisted
const { mockSignUp } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

describe('PostPurchaseSignup', () => {
  const defaultProps = {
    email: 'guest@example.com',
    orderId: 'FP-2026-1234',
    onSignupComplete: vi.fn(),
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockReset();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering (AC-007)', () => {
    it('should display account creation prompt with Hebrew text', () => {
      render(<PostPurchaseSignup {...defaultProps} />);

      // Check for the header text (more specific)
      expect(screen.getByText(/צור חשבון לעקוב אחרי ההזמנה/i)).toBeInTheDocument();
    });

    it('should show the guest email as pre-filled', () => {
      render(<PostPurchaseSignup {...defaultProps} />);

      const emailDisplay = screen.getByText('guest@example.com');
      expect(emailDisplay).toBeInTheDocument();
    });

    it('should display password input field', () => {
      render(<PostPurchaseSignup {...defaultProps} />);

      // Use getByLabelText with exact match for the label
      expect(screen.getByLabelText('סיסמה')).toBeInTheDocument();
    });

    it('should display confirm password field', () => {
      render(<PostPurchaseSignup {...defaultProps} />);

      expect(screen.getByLabelText(/אימות סיסמה/i)).toBeInTheDocument();
    });

    it('should display signup button', () => {
      render(<PostPurchaseSignup {...defaultProps} />);

      expect(screen.getByRole('button', { name: /צור חשבון/i })).toBeInTheDocument();
    });

    it('should display dismiss option', () => {
      render(<PostPurchaseSignup {...defaultProps} />);

      expect(screen.getByRole('button', { name: /לא עכשיו|אולי אחר כך/i })).toBeInTheDocument();
    });

    it('should render with RTL direction', () => {
      const { container } = render(<PostPurchaseSignup {...defaultProps} />);

      const formContainer = container.firstChild as HTMLElement;
      expect(formContainer).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Password Validation', () => {
    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, '12345');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, '12345');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/לפחות 8 תווים/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, 'password123');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, 'different123');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/הסיסמאות אינן תואמות/i)).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, '123');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, '123');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/לפחות 8 תווים/i)).toBeInTheDocument();
      });

      // Start typing again
      await user.type(passwordInput, '45678');

      await waitFor(() => {
        expect(screen.queryByText(/לפחות 8 תווים/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Account Creation (AC-008)', () => {
    it('should call signUp with email and password on valid submission', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });

      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, 'securepassword123');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, 'securepassword123');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'guest@example.com',
          password: 'securepassword123',
          options: expect.objectContaining({
            data: expect.objectContaining({
              linked_order_id: 'FP-2026-1234',
            }),
          }),
        });
      });
    });

    it('should call onSignupComplete on successful account creation', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });

      const onSignupComplete = vi.fn();
      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} onSignupComplete={onSignupComplete} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, 'securepassword123');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, 'securepassword123');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      // Wait for success message to appear (which triggers setTimeout for onSignupComplete)
      await waitFor(() => {
        expect(screen.getByText(/החשבון נוצר בהצלחה/i)).toBeInTheDocument();
      });

      // Wait for the setTimeout to trigger onSignupComplete
      await waitFor(() => {
        expect(onSignupComplete).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should show success message after account creation', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });

      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, 'securepassword123');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, 'securepassword123');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/החשבון נוצר בהצלחה/i)).toBeInTheDocument();
      });
    });

    it('should show error message on signup failure', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User already exists' },
      });

      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, 'securepassword123');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, 'securepassword123');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/User already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading text during signup', async () => {
      // Use a delayed mock to ensure we can see the loading state
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({ data: { user: { id: 'test' } }, error: null }), 500);
        })
      );

      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, 'securepassword123');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, 'securepassword123');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      // Check for loading text
      await waitFor(() => {
        expect(screen.getByText(/יוצר חשבון/i)).toBeInTheDocument();
      });
    });

    it('should show spinner icon during signup', async () => {
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({ data: { user: { id: 'test' } }, error: null }), 500);
        })
      );

      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const passwordInput = screen.getByLabelText('סיסמה');
      await user.type(passwordInput, 'securepassword123');

      const confirmInput = screen.getByLabelText(/אימות סיסמה/i);
      await user.type(confirmInput, 'securepassword123');

      const submitButton = screen.getByRole('button', { name: /צור חשבון/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });
  });

  describe('Dismiss Flow', () => {
    it('should call onDismiss when dismiss button clicked', async () => {
      const onDismiss = vi.fn();
      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /לא עכשיו|אולי אחר כך/i });
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });

    it('should not submit when dismiss is clicked', async () => {
      const user = userEvent.setup();
      render(<PostPurchaseSignup {...defaultProps} />);

      const dismissButton = screen.getByRole('button', { name: /לא עכשיו|אולי אחר כך/i });
      await user.click(dismissButton);

      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Benefits Display', () => {
    it('should display benefits of creating an account', () => {
      render(<PostPurchaseSignup {...defaultProps} />);

      // Should show benefits section header
      expect(screen.getByText(/יתרונות החשבון/i)).toBeInTheDocument();
      // Should show at least one benefit item
      expect(screen.getByText(/עקוב אחרי ההזמנה בזמן אמת/i)).toBeInTheDocument();
    });
  });
});
