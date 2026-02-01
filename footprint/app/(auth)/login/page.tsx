'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm, type LoginFormData } from '@/components/auth/LoginForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(undefined);
    console.log('Login attempt:', data.email);

    try {
      const supabase = createClient();
      console.log('Supabase client created, calling signInWithPassword...');

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      console.log('Auth response:', { authData, authError });

      if (authError) {
        console.error('Auth error:', authError);
        setError(authError.message);
        return;
      }

      if (authData.session) {
        console.log('Login successful, redirecting...');
        router.push('/');
        router.refresh();
      } else {
        console.log('No session returned');
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
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

  const isAnyLoading = isLoading || googleLoading || appleLoading;

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
            googleLoading={googleLoading}
            appleLoading={appleLoading}
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
