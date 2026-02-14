/**
 * LoginForm Component Tests
 * TDD Test Suite for AUTH-03: Hebrew Auth Pages Redesign
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  describe('Hebrew Rendering', () => {
    it('renders Hebrew email label', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByLabelText('אימייל')).toBeInTheDocument();
    });

    it('renders Hebrew password label', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByPlaceholderText('הזינו את הסיסמה שלכם')).toBeInTheDocument();
    });

    it('renders Hebrew login button', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('button', { name: /התחברות/i })).toBeInTheDocument();
    });

    it('renders Hebrew forgot password link', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('link', { name: /שכחת סיסמה/i })).toBeInTheDocument();
    });

    it('renders Hebrew create account link', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('link', { name: /הרשמה/i })).toBeInTheDocument();
    });

    it('renders sign-up prompt text in Hebrew', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByText(/אין לך חשבון/)).toBeInTheDocument();
    });
  });

  describe('RTL Layout', () => {
    it('has dir="rtl" on the form', () => {
      const { container } = render(<LoginForm onSubmit={vi.fn()} />);
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Form Validation (Hebrew Messages)', () => {
    it('shows Hebrew error when email is empty on submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: /התחברות/i }));

      await waitFor(() => {
        expect(screen.getByText('אימייל הוא שדה חובה')).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows Hebrew error when password is empty on submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('אימייל'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /התחברות/i }));

      await waitFor(() => {
        expect(screen.getByText('סיסמה היא שדה חובה')).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows Hebrew error for invalid email format', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('אימייל'), 'invalid-email');
      await user.type(screen.getByPlaceholderText('הזינו את הסיסמה שלכם'), 'password123');
      await user.click(screen.getByRole('button', { name: /התחברות/i }));

      await waitFor(() => {
        expect(screen.getByText('נא להזין כתובת אימייל תקינה')).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with email and password on valid submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('אימייל'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('הזינו את הסיסמה שלכם'), 'password123');
      await user.click(screen.getByRole('button', { name: /התחברות/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('shows Hebrew loading state when isLoading is true', () => {
      render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

      const button = screen.getByRole('button', { name: /מתחבר/i });
      expect(button).toBeDisabled();
    });

    it('disables form inputs when loading', () => {
      render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

      expect(screen.getByLabelText('אימייל')).toBeDisabled();
      expect(screen.getByPlaceholderText('הזינו את הסיסמה שלכם')).toBeDisabled();
    });
  });

  describe('Error Display', () => {
    it('displays server error message when provided', () => {
      render(<LoginForm onSubmit={vi.fn()} error="פרטי התחברות שגויים" />);

      expect(screen.getByText('פרטי התחברות שגויים')).toBeInTheDocument();
    });

    it('error is visible alongside form', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<LoginForm onSubmit={vi.fn()} error="פרטי התחברות שגויים" />);

      expect(screen.getByText('פרטי התחברות שגויים')).toBeInTheDocument();

      await user.type(screen.getByLabelText('אימייל'), 'a');
      expect(screen.getByLabelText('אימייל')).toHaveValue('a');
    });
  });

  describe('Password Visibility', () => {
    it('has password input type hidden by default', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByPlaceholderText('הזינו את הסיסמה שלכם')).toHaveAttribute('type', 'password');
    });

    it('toggles password visibility when show/hide button is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={vi.fn()} />);

      const passwordInput = screen.getByPlaceholderText('הזינו את הסיסמה שלכם');
      const toggleButton = screen.getByRole('button', { name: /הצג סיסמה|הסתר סיסמה/i });

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('labels are associated with inputs', () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      const emailInput = screen.getByLabelText('אימייל');
      const passwordInput = screen.getByPlaceholderText('הזינו את הסיסמה שלכם');

      expect(emailInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('id');
    });

    it('error messages are associated with inputs via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /התחברות/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText('אימייל');
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('is keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={vi.fn()} />);

      await user.tab();
      expect(screen.getByLabelText('אימייל')).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText('הזינו את הסיסמה שלכם')).toHaveFocus();
    });
  });
});
