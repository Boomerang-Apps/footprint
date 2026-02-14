'use client';

/**
 * CheckoutAuthFlow
 *
 * Handles authentication flow during checkout.
 * Shows options for guest checkout, social login (Google, Facebook, Instagram),
 * or email/password login.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-004, AC-005
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Loader2, User, LogIn } from 'lucide-react';
import { GuestCheckoutForm } from '@/components/auth/GuestCheckoutForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { LoginForm, type LoginFormData } from '@/components/auth/LoginForm';
import { useOrderStore } from '@/stores/orderStore';
import { createClient } from '@/lib/supabase/client';

export type AuthFlowView = 'choice' | 'guest' | 'login';

interface CheckoutAuthFlowProps {
  /** Called when user completes authentication or guest flow */
  onAuthComplete: () => void;
  /** Called when user is already authenticated */
  onSkip?: () => void;
  /** Initial view to show */
  initialView?: AuthFlowView;
}

export function CheckoutAuthFlow({
  onAuthComplete,
  onSkip,
  initialView = 'choice',
}: CheckoutAuthFlowProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AuthFlowView>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [socialLoading, setSocialLoading] = useState<{
    google: boolean;
    facebook: boolean;
    instagram: boolean;
  }>({ google: false, facebook: false, instagram: false });

  const { setIsGuest, setGuestInfo } = useOrderStore();

  // Handle guest checkout submission
  const handleGuestSubmit = useCallback(
    (email: string) => {
      setIsGuest(true);
      setGuestInfo({ email });
      onAuthComplete();
    },
    [setIsGuest, setGuestInfo, onAuthComplete]
  );

  // Handle login button click - show login form
  const handleLoginClick = useCallback(() => {
    setCurrentView('login');
    setError(undefined);
  }, []);

  // Handle back to choice
  const handleBackToChoice = useCallback(() => {
    setCurrentView('choice');
    setError(undefined);
  }, []);

  // Handle email/password login
  const handleEmailLogin = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      setError(undefined);

      try {
        const supabase = createClient();
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

        if (authError) {
          setError(authError.message);
          return;
        }

        if (authData.session) {
          onAuthComplete();
          router.refresh();
        } else {
          setError('התחברות נכשלה. נסו שוב.');
        }
      } catch {
        setError('שגיאה בהתחברות. נסו שוב.');
      } finally {
        setIsLoading(false);
      }
    },
    [onAuthComplete, router]
  );

  // Handle social login
  const handleSocialLogin = useCallback(
    async (provider: 'google' | 'facebook' | 'instagram') => {
      setSocialLoading((prev) => ({ ...prev, [provider]: true }));
      setError(undefined);

      try {
        const supabase = createClient();
        // Instagram uses Facebook OAuth
        const oauthProvider = provider === 'instagram' ? 'facebook' : provider;

        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: oauthProvider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/create/checkout`,
            scopes: provider === 'instagram' ? 'instagram_basic' : undefined,
          },
        });

        if (authError) {
          setError(authError.message);
        }
      } catch {
        setError(`שגיאה בהתחברות עם ${provider}. נסו שוב.`);
      } finally {
        setSocialLoading((prev) => ({ ...prev, [provider]: false }));
      }
    },
    []
  );

  const isAnySocialLoading =
    socialLoading.google || socialLoading.facebook || socialLoading.instagram;

  // Choice view - Show guest vs login options
  if (currentView === 'choice') {
    return (
      <div dir="rtl" className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            איך תרצו להמשיך?
          </h2>
          <p className="text-sm text-zinc-500">
            בחרו להמשיך כאורח או להתחבר לחשבון
          </p>
        </div>

        <div className="space-y-4">
          {/* Guest Checkout Button */}
          <button
            type="button"
            onClick={() => setCurrentView('guest')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-zinc-200 rounded-xl text-zinc-900 font-medium hover:border-violet-300 hover:bg-violet-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-violet-600" />
            <span>המשך כאורח</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-zinc-500">או</span>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="button"
            onClick={handleLoginClick}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-violet-600 rounded-xl text-white font-medium hover:bg-violet-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span>התחברות לחשבון</span>
          </button>

          <p className="text-xs text-zinc-400 text-center mt-4">
            משתמשים רשומים יכולים לעקוב אחרי הזמנות ולשמור כתובות
          </p>
        </div>
      </div>
    );
  }

  // Guest checkout view
  if (currentView === 'guest') {
    return (
      <div dir="rtl" className="w-full max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={handleBackToChoice}
            className="p-2 -mr-2 text-zinc-500 hover:text-zinc-700 transition-colors"
            aria-label="חזרה"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-zinc-900">המשך כאורח</h2>
        </div>

        <GuestCheckoutForm
          onGuestSubmit={handleGuestSubmit}
          onLoginClick={handleLoginClick}
          showEmailForm={true}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Login view - Show social login + email form
  return (
    <div dir="rtl" className="w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={handleBackToChoice}
          className="p-2 -mr-2 text-zinc-500 hover:text-zinc-700 transition-colors"
          aria-label="חזרה"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-zinc-900">התחברות</h2>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Social Login Buttons */}
      <SocialLoginButtons
        onGoogleClick={() => handleSocialLogin('google')}
        onFacebookClick={() => handleSocialLogin('facebook')}
        onInstagramClick={() => handleSocialLogin('instagram')}
        googleLoading={socialLoading.google}
        facebookLoading={socialLoading.facebook}
        instagramLoading={socialLoading.instagram}
        showGoogle={true}
        showFacebook={true}
        showInstagram={true}
        showApple={false}
        disabled={isLoading || isAnySocialLoading}
        googleLabel="המשך עם Google"
        facebookLabel="המשך עם Facebook"
        instagramLabel="המשך עם Instagram"
        dividerText="או התחברו עם אימייל"
        dir="rtl"
      />

      {/* Email/Password Login Form */}
      <div className="mt-4">
        <LoginForm
          onSubmit={handleEmailLogin}
          isLoading={isLoading}
          error={undefined}
        />
      </div>

      {/* Guest checkout link */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setCurrentView('guest')}
          className="text-sm text-violet-600 hover:text-violet-700 hover:underline"
          disabled={isLoading || isAnySocialLoading}
        >
          המשך כאורח ללא התחברות
        </button>
      </div>
    </div>
  );
}
