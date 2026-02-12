'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm, type LoginFormData } from '@/components/auth/LoginForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Show error from OAuth callback redirect
  useEffect(() => {
    const callbackError = searchParams?.get('error');
    if (callbackError === 'auth_callback_failed') {
      setError('Social login failed. Please try again.');
    }
  }, [searchParams]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(undefined);
    logger.debug('Login attempt', { email: data.email });

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        logger.error('Login failed', authError);
        setError(authError.message);
        return;
      }

      if (authData.session) {
        logger.info('Login successful, redirecting');
        router.push('/');
        router.refresh();
      } else {
        logger.warn('Login: no session returned');
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      logger.error('Login unexpected error', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(undefined);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setAppleLoading(true);
    setError(undefined);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('Failed to sign in with Apple. Please try again.');
    } finally {
      setAppleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    setError(undefined);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('Failed to sign in with Facebook. Please try again.');
    } finally {
      setFacebookLoading(false);
    }
  };

  const isAnyLoading = isLoading || googleLoading || appleLoading || facebookLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-muted px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SocialLoginButtons
            onGoogleClick={handleGoogleLogin}
            onAppleClick={handleAppleLogin}
            onFacebookClick={handleFacebookLogin}
            googleLoading={googleLoading}
            appleLoading={appleLoading}
            facebookLoading={facebookLoading}
            showFacebook
            disabled={isAnyLoading}
          />

          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
