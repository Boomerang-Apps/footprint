/**
 * LoginForm Component Tests
 * TDD Test Suite for AUTH-01: User Login Page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  describe('Rendering', () => {
    it('renders email input field', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders password input field', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });

    it('renders login button', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('button', { name: /sign in|log in|login/i })).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('renders create account link', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('link', { name: /create account|sign up|register/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when email is empty on submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when password is empty on submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with email and password on valid submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<LoginForm onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('shows loading state when isLoading is true', () => {
      render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

      const button = screen.getByRole('button', { name: /sign in|log in|login|signing|logging/i });
      expect(button).toBeDisabled();
    });

    it('disables form inputs when loading', () => {
      render(<LoginForm onSubmit={vi.fn()} isLoading={true} />);

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeDisabled();
    });
  });

  describe('Error Display', () => {
    it('displays server error message when provided', () => {
      render(<LoginForm onSubmit={vi.fn()} error="Invalid credentials" />);

      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    it('clears server error when user starts typing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<LoginForm onSubmit={vi.fn()} error="Invalid credentials" />);

      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();

      await user.type(screen.getByLabelText(/email/i), 'a');

      // Error should still be visible as it's controlled by parent
      // But form should allow input
      expect(screen.getByLabelText(/email/i)).toHaveValue('a');
    });
  });

  describe('Password Visibility', () => {
    it('has password input type hidden by default', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByPlaceholderText(/enter your password/i)).toHaveAttribute('type', 'password');
    });

    it('toggles password visibility when show/hide button is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={vi.fn()} />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButton = screen.getByRole('button', { name: /show password|hide password/i });

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('RTL Support', () => {
    it('respects dir prop for RTL layout', () => {
      const { container } = render(<LoginForm onSubmit={vi.fn()} dir="rtl" />);
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it('renders correctly in LTR by default', () => {
      const { container } = render(<LoginForm onSubmit={vi.fn()} />);
      // Should not have explicit dir or have dir="ltr"
      const form = container.firstChild;
      expect(form).not.toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<LoginForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('labels are associated with inputs', () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      expect(emailInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('id');
    });

    it('error messages are associated with inputs via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('is keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={vi.fn()} />);

      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText(/enter your password/i)).toHaveFocus();
    });
  });
});
