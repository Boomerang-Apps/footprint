/**
 * SocialLoginButtons Component Tests
 * TDD Test Suite for AUTH-03: Hebrew Auth Pages Redesign
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialLoginButtons } from './SocialLoginButtons';

describe('SocialLoginButtons', () => {
  describe('Hebrew Rendering', () => {
    it('renders Hebrew Google button label by default', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByRole('button', { name: /המשך עם Google/i })).toBeInTheDocument();
    });

    it('renders Hebrew Apple button label by default', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByRole('button', { name: /המשך עם Apple/i })).toBeInTheDocument();
    });

    it('renders Hebrew divider text by default', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByText('או')).toBeInTheDocument();
    });

    it('renders Google icon', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByTestId('google-icon')).toBeInTheDocument();
    });

    it('renders Apple icon', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);
      expect(screen.getByTestId('apple-icon')).toBeInTheDocument();
    });
  });

  describe('RTL Layout', () => {
    it('has dir="rtl" by default', () => {
      const { container } = render(
        <SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />
      );
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
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

  describe('Accessibility', () => {
    it('buttons have descriptive accessible names', () => {
      render(<SocialLoginButtons onGoogleClick={vi.fn()} onAppleClick={vi.fn()} />);

      expect(screen.getByRole('button', { name: /המשך עם Google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /המשך עם Apple/i })).toBeInTheDocument();
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
  });

  describe('Facebook and Instagram Providers', () => {
    it('renders Facebook button when showFacebook is true', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onFacebookClick={vi.fn()}
          showFacebook={true}
        />
      );
      expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    });

    it('renders Instagram button when showInstagram is true', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onInstagramClick={vi.fn()}
          showInstagram={true}
        />
      );
      expect(screen.getByRole('button', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
    });

    it('calls onFacebookClick when Facebook button is clicked', async () => {
      const user = userEvent.setup();
      const onFacebookClick = vi.fn();

      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onFacebookClick={onFacebookClick}
          showFacebook={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /facebook/i }));
      expect(onFacebookClick).toHaveBeenCalledTimes(1);
    });

    it('calls onInstagramClick when Instagram button is clicked', async () => {
      const user = userEvent.setup();
      const onInstagramClick = vi.fn();

      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onInstagramClick={onInstagramClick}
          showInstagram={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /instagram/i }));
      expect(onInstagramClick).toHaveBeenCalledTimes(1);
    });

    it('disables Facebook and Instagram buttons when loading', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          onFacebookClick={vi.fn()}
          onInstagramClick={vi.fn()}
          showFacebook={true}
          showInstagram={true}
          facebookLoading={true}
        />
      );

      expect(screen.getByRole('button', { name: /facebook/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /instagram/i })).toBeDisabled();
    });
  });

  describe('Visibility Controls', () => {
    it('hides Google button when showGoogle is false', () => {
      render(
        <SocialLoginButtons
          onAppleClick={vi.fn()}
          showGoogle={false}
        />
      );
      expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument();
    });

    it('hides Apple button when showApple is false', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          showApple={false}
        />
      );
      expect(screen.queryByRole('button', { name: /apple/i })).not.toBeInTheDocument();
    });

    it('hides divider when showDivider is false', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          showDivider={false}
        />
      );
      expect(screen.queryByText('או')).not.toBeInTheDocument();
    });

    it('shows custom divider text', () => {
      render(
        <SocialLoginButtons
          onGoogleClick={vi.fn()}
          dividerText="or"
        />
      );
      expect(screen.getByText('or')).toBeInTheDocument();
    });
  });
});
