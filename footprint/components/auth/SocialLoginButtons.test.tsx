/**
 * SocialLoginButtons Component Tests
 * TDD Test Suite for AUTH-01: User Login Page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialLoginButtons } from './SocialLoginButtons';

describe('SocialLoginButtons', () => {
  describe('Rendering', () => {
    it('renders Google login button', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });

    it('renders Apple login button', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument();
    });

    it('renders Google icon', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByTestId('google-icon')).toBeInTheDocument();
    });

    it('renders Apple icon', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByTestId('apple-icon')).toBeInTheDocument();
    });

    it('renders divider with "or" text', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByText(/or/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onGoogleClick when Google button is clicked', async () => {
      const user = userEvent.setup();
      const onGoogleClick = vi.fn();

      render(<SocialLoginButtons onGoogleClick={onGoogleClick} onAppleClick={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /google/i }));

      expect(onGoogleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onAppleClick when Apple button is clicked', async () => {
      const user = userEvent.setup();
      const onAppleClick = vi.fn();

      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={onAppleClick} />);

      await user.click(screen.getByRole('button', { name: /apple/i }));

      expect(onAppleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    it('shows loading state for Google button when googleLoading is true', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onAppleClick={vi.fn()}
          googleLoading={true}
        />
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton).toBeDisabled();
    });

    it('shows loading state for Apple button when appleLoading is true', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onAppleClick={vi.fn()}
          appleLoading={true}
        />
      );

      const appleButton = screen.getByRole('button', { name: /apple/i });
      expect(appleButton).toBeDisabled();
    });

    it('disables all buttons when any is loading', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onAppleClick={vi.fn()}
          googleLoading={true}
        />
      );

      expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /apple/i })).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onAppleClick={vi.fn()}
          disabled={true}
        />
      );

      expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /apple/i })).toBeDisabled();
    });

    it('does not call handlers when disabled', async () => {
      const user = userEvent.setup();
      const onGoogleClick = vi.fn();
      const onAppleClick = vi.fn();

      render(
        <SocialLoginButtons
          onGoogleClick={onGoogleClick}
          onAppleClick={onAppleClick}
          disabled={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /google/i }));
      await user.click(screen.getByRole('button', { name: /apple/i }));

      expect(onGoogleClick).not.toHaveBeenCalled();
      expect(onAppleClick).not.toHaveBeenCalled();
    });
  });

  describe('RTL Support', () => {
    it('respects dir prop for RTL layout', () => {
      const { container } = render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onAppleClick={vi.fn()}
          dir="rtl"
        />
      );
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('buttons have descriptive accessible names', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);

      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with apple/i })).toBeInTheDocument();
    });

    it('Google button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onGoogleClick = vi.fn();

      render(<SocialLoginButtons onGoogleClick={onGoogleClick} onAppleClick={vi.fn()} />);

      const googleButton = screen.getByRole('button', { name: /google/i });
      googleButton.focus();

      await user.keyboard('{Enter}');
      expect(onGoogleClick).toHaveBeenCalledTimes(1);
    });

    it('Apple button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onAppleClick = vi.fn();

      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={onAppleClick} />);

      const appleButton = screen.getByRole('button', { name: /apple/i });
      appleButton.focus();

      await user.keyboard('{Enter}');
      expect(onAppleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Labels', () => {
    it('supports custom button labels', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onAppleClick={vi.fn()}
          googleLabel="Sign in with Google"
          appleLabel="Sign in with Apple"
        />
      );

      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in with apple/i })).toBeInTheDocument();
    });

    it('supports Hebrew labels', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onAppleClick={vi.fn()}
          googleLabel="המשך עם Google"
          appleLabel="המשך עם Apple"
          dir="rtl"
        />
      );

      expect(screen.getByRole('button', { name: /המשך עם google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /המשך עם apple/i })).toBeInTheDocument();
    });
  });
});
