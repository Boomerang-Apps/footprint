'use client';

import { forwardRef } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/Button';

export interface SocialLoginButtonsProps {
  onGoogleClick?: () => void;
  onAppleClick?: () => void;
  onFacebookClick?: () => void;
  onInstagramClick?: () => void;
  googleLoading?: boolean;
  appleLoading?: boolean;
  facebookLoading?: boolean;
  instagramLoading?: boolean;
  disabled?: boolean;
  dir?: 'ltr' | 'rtl';
  googleLabel?: string;
  appleLabel?: string;
  facebookLabel?: string;
  instagramLabel?: string;
  showGoogle?: boolean;
  showApple?: boolean;
  showFacebook?: boolean;
  showInstagram?: boolean;
  showDivider?: boolean;
  dividerText?: string;
  className?: string;
}

export const SocialLoginButtons = forwardRef<HTMLDivElement, SocialLoginButtonsProps>(
  (
    {
      onGoogleClick,
      onAppleClick,
      onFacebookClick,
      onInstagramClick,
      googleLoading = false,
      appleLoading = false,
      facebookLoading = false,
      instagramLoading = false,
      disabled = false,
      dir = 'rtl',
      googleLabel = 'המשך עם Google',
      appleLabel = 'המשך עם Apple',
      facebookLabel = 'המשך עם Facebook',
      instagramLabel = 'המשך עם Instagram',
      showGoogle = true,
      showApple = true,
      showFacebook = false,
      showInstagram = false,
      showDivider = true,
      dividerText = 'או',
      className,
    },
    ref
  ) => {
    const isAnyLoading = googleLoading || appleLoading || facebookLoading || instagramLoading;
    const isDisabled = disabled || isAnyLoading;

    return (
      <div
        ref={ref}
        dir={dir}
        className={cn('w-full space-y-4', className)}
      >
        <div className="grid gap-3">
          {showGoogle && onGoogleClick && (
            <Button
              variant="outline"
              fullWidth
              onClick={onGoogleClick}
              disabled={isDisabled}
              loading={googleLoading}
              className="relative h-12 rounded-xl border-zinc-200 bg-white hover:bg-zinc-50"
              aria-label={googleLabel}
            >
              <GoogleIcon className="ml-2 h-5 w-5" />
              {googleLabel}
            </Button>
          )}

          {showFacebook && onFacebookClick && (
            <Button
              variant="secondary"
              fullWidth
              onClick={onFacebookClick}
              disabled={isDisabled}
              loading={facebookLoading}
              className="relative h-12 rounded-xl bg-[#1877F2] text-white hover:bg-[#166fe5]"
              aria-label={facebookLabel}
            >
              <FacebookIcon className="ml-2 h-5 w-5" />
              {facebookLabel}
            </Button>
          )}

          {showInstagram && onInstagramClick && (
            <Button
              variant="secondary"
              fullWidth
              onClick={onInstagramClick}
              disabled={isDisabled}
              loading={instagramLoading}
              className="relative h-12 rounded-xl"
              aria-label={instagramLabel}
            >
              <InstagramIcon className="ml-2 h-5 w-5" />
              {instagramLabel}
            </Button>
          )}

          {showApple && onAppleClick && (
            <Button
              variant="secondary"
              fullWidth
              onClick={onAppleClick}
              disabled={isDisabled}
              loading={appleLoading}
              className="relative h-12 rounded-xl bg-black text-white hover:bg-zinc-800"
              aria-label={appleLabel}
            >
              <AppleIcon className="ml-2 h-5 w-5" />
              {appleLabel}
            </Button>
          )}
        </div>

        {showDivider && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-light-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-text-muted">{dividerText}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SocialLoginButtons.displayName = 'SocialLoginButtons';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="google-icon"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="apple-icon"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="facebook-icon"
      className={className}
      viewBox="0 0 24 24"
      fill="#1877F2"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="instagram-icon"
      className={className}
      viewBox="0 0 24 24"
      fill="url(#instagram-gradient)"
    >
      <defs>
        <radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  );
}
