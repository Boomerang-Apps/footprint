'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);

    // Validation
    if (!email || !password || !name) {
      setError('נא למלא את כל השדות');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) {
        logger.error('Signup failed', signUpError);
        setError(signUpError.message);
        return;
      }

      logger.info('Signup successful');

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities?.length === 0) {
          setError('אימייל זה כבר רשום. נסו להתחבר.');
          return;
        }

        // Check if email confirmation is pending
        if (data.session === null) {
          setError('בדקו את האימייל שלכם לאימות החשבון.');
          return;
        }

        // Redirect to home on success
        router.push('/');
      }
    } catch (err) {
      logger.error('Registration unexpected error', err);
      setError('אירעה שגיאה. נסו שוב.');
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
      setError('ההתחברות עם Google נכשלה. נסו שוב.');
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
      setError('ההתחברות עם Apple נכשלה. נסו שוב.');
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
          scopes: 'email,public_profile',
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('ההתחברות עם Facebook נכשלה. נסו שוב.');
    } finally {
      setFacebookLoading(false);
    }
  };

  const isAnyLoading = isLoading || googleLoading || appleLoading || facebookLoading;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md overflow-hidden rounded-2xl shadow-soft-lg">
        <div className="h-1 bg-gradient-brand" />
        <CardHeader className="text-center pt-8" dir="rtl">
          <CardTitle className="text-2xl font-bold text-zinc-900">יצירת חשבון</CardTitle>
          <CardDescription className="text-zinc-500">
            הרשמו כדי להתחיל ליצור הדפסים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <SocialLoginButtons
            onGoogleClick={handleGoogleLogin}
            onAppleClick={handleAppleLogin}
            onFacebookClick={handleFacebookLogin}
            googleLoading={googleLoading}
            appleLoading={appleLoading}
            facebookLoading={facebookLoading}
            showFacebook
            disabled={isAnyLoading}
            googleLabel="המשך עם Google"
            facebookLabel="המשך עם Facebook"
            appleLabel="המשך עם Apple"
            dividerText="או"
          />

          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                שם מלא
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="הזינו את השם שלכם"
                autoComplete="name"
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                אימייל
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="הזינו את האימייל שלכם"
                autoComplete="email"
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                סיסמה
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="צרו סיסמה"
                autoComplete="new-password"
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                אימות סיסמה
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="הזינו שוב את הסיסמה"
                autoComplete="new-password"
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isAnyLoading}
              size="lg"
              className="mt-6 h-12 rounded-xl text-base"
            >
              {isLoading ? 'יוצר חשבון...' : 'יצירת חשבון'}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              כבר יש לך חשבון?{' '}
              <Link
                href="/login"
                className="font-medium text-brand-purple hover:underline"
              >
                התחברות
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
