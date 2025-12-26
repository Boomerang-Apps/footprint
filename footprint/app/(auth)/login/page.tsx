'use client';

import { useState } from 'react';
import { LoginForm, type LoginFormData } from '@/components/auth/LoginForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // TODO: Implement actual login logic via Backend-1 auth store
      console.log('Login attempt:', data.email);
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect would happen here on success
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(undefined);

    try {
      // TODO: Implement Google OAuth via Backend-1
      console.log('Google login initiated');
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
      // TODO: Implement Apple OAuth via Backend-1
      console.log('Apple login initiated');
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
