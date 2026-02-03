/**
 * GuestCheckoutForm Tests
 *
 * Tests for the guest checkout form component.
 * Covers: guest option display, email collection, validation, localStorage, RTL support.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-001, AC-002, AC-003, AC-010, AC-012
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestCheckoutForm } from './GuestCheckoutForm';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('GuestCheckoutForm', () => {
  const mockOnGuestSubmit = vi.fn();
  const mockOnLoginClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Guest Checkout Option Display (AC-001)', () => {
    it('should display "המשך כאורח" (Continue as Guest) button', () => {
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      expect(screen.getByRole('button', { name: /המשך כאורח/i })).toBeInTheDocument();
    });

    it('should display login option alongside guest button', () => {
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      expect(screen.getByRole('button', { name: /התחברות/i })).toBeInTheDocument();
    });

    it('should show email form when guest button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      const guestButton = screen.getByRole('button', { name: /המשך כאורח/i });
      await user.click(guestButton);

      expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument();
    });
  });

  describe('Email Collection (AC-002)', () => {
    it('should require email address for guest checkout', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      // Click guest button to show form
      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));

      // Try to submit without email
      const submitButton = screen.getByRole('button', { name: /המשך/i });
      await user.click(submitButton);

      // Should show error or not call onGuestSubmit
      expect(mockOnGuestSubmit).not.toHaveBeenCalled();
    });

    it('should call onGuestSubmit with email when valid email submitted', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /המשך/i });
      await user.click(submitButton);

      expect(mockOnGuestSubmit).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Email Validation (AC-003)', () => {
    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));

      const emailInput = screen.getByRole('textbox');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /המשך/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/אימייל לא תקין/i)).toBeInTheDocument();
      });
      expect(mockOnGuestSubmit).not.toHaveBeenCalled();
    });

    it('should accept valid email addresses', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'user@domain.co.il');

      const submitButton = screen.getByRole('button', { name: /המשך/i });
      await user.click(submitButton);

      expect(mockOnGuestSubmit).toHaveBeenCalledWith('user@domain.co.il');
    });

    it('should trim whitespace from email before validation', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, '  test@example.com  ');

      const submitButton = screen.getByRole('button', { name: /המשך/i });
      await user.click(submitButton);

      expect(mockOnGuestSubmit).toHaveBeenCalledWith('test@example.com');
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));

      const emailInput = screen.getByRole('textbox');
      await user.type(emailInput, 'invalid');

      const submitButton = screen.getByRole('button', { name: /המשך/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/אימייל לא תקין/i)).toBeInTheDocument();
      });

      // Start typing again
      await user.type(emailInput, '@');

      await waitFor(() => {
        expect(screen.queryByText(/אימייל לא תקין/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Remember Guest Email (AC-010)', () => {
    it('should save email to localStorage on submit', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));

      const emailInput = screen.getByLabelText(/אימייל/i);
      await user.type(emailInput, 'saved@example.com');

      const submitButton = screen.getByRole('button', { name: /המשך/i });
      await user.click(submitButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'footprint-guest-email',
        'saved@example.com'
      );
    });

    it('should pre-fill email from localStorage if previously used', () => {
      localStorageMock.getItem.mockReturnValue('returning@example.com');

      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
          showEmailForm={true}
        />
      );

      const emailInput = screen.getByLabelText(/אימייל/i) as HTMLInputElement;
      expect(emailInput.value).toBe('returning@example.com');
    });

    it('should not pre-fill if localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
          showEmailForm={true}
        />
      );

      const emailInput = screen.getByLabelText(/אימייל/i) as HTMLInputElement;
      expect(emailInput.value).toBe('');
    });
  });

  describe('RTL and Hebrew Support (AC-012)', () => {
    it('should render with RTL direction', () => {
      const { container } = render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      const formContainer = container.firstChild as HTMLElement;
      expect(formContainer).toHaveAttribute('dir', 'rtl');
    });

    it('should display all labels in Hebrew', () => {
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
          showEmailForm={true}
        />
      );

      // Check for Hebrew text - use getByLabelText for the label
      expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /המשך/i })).toBeInTheDocument();
    });
  });

  describe('Login Flow', () => {
    it('should call onLoginClick when login button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      const loginButton = screen.getByRole('button', { name: /התחברות/i });
      await user.click(loginButton);

      expect(mockOnLoginClick).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable submit button while loading', () => {
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
          showEmailForm={true}
          isLoading={true}
        />
      );

      // When loading, button text changes to "מעבד..."
      const submitButton = screen.getByRole('button', { name: /מעבד/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading indicator when isLoading is true', () => {
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
          showEmailForm={true}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should show back button when email form is displayed', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));

      expect(screen.getByRole('button', { name: /חזרה/i })).toBeInTheDocument();
    });

    it('should hide email form when back button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GuestCheckoutForm
          onGuestSubmit={mockOnGuestSubmit}
          onLoginClick={mockOnLoginClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /המשך כאורח/i }));
      expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /חזרה/i }));
      expect(screen.queryByLabelText(/אימייל/i)).not.toBeInTheDocument();
    });
  });
});
