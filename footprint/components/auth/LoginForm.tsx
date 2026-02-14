'use client';

import { forwardRef, useState, useId, type FormEvent } from 'react';
import Link from 'next/link';
import { cn } from '../ui/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const LoginForm = forwardRef<HTMLFormElement, LoginFormProps>(
  ({ onSubmit, isLoading = false, error, className }, ref) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState({ email: false, password: false });

    const emailId = useId();
    const passwordId = useId();
    const emailErrorId = useId();
    const passwordErrorId = useId();

    const validate = (): boolean => {
      const newErrors: FormErrors = {};

      if (!email.trim()) {
        newErrors.email = 'אימייל הוא שדה חובה';
      } else if (!validateEmail(email)) {
        newErrors.email = 'נא להזין כתובת אימייל תקינה';
      }

      if (!password) {
        newErrors.password = 'סיסמה היא שדה חובה';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setTouched({ email: true, password: true });

      if (validate()) {
        onSubmit({ email, password });
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <form
        ref={ref}
        role="form"
        dir="rtl"
        className={cn('w-full max-w-md space-y-6', className)}
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor={emailId}
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              אימייל
            </label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              disabled={isLoading}
              error={touched.email && !!errors.email}
              errorMessage={touched.email ? errors.email : undefined}
              placeholder="הזינו את האימייל שלכם"
              autoComplete="email"
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={touched.email && errors.email ? emailErrorId : undefined}
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label
              htmlFor={passwordId}
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              סיסמה
            </label>
            <div className="relative">
              <Input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                disabled={isLoading}
                error={touched.password && !!errors.password}
                errorMessage={touched.password ? errors.password : undefined}
                placeholder="הזינו את הסיסמה שלכם"
                autoComplete="current-password"
                aria-invalid={touched.password && !!errors.password}
                aria-describedby={touched.password && errors.password ? passwordErrorId : undefined}
                className="h-12 rounded-xl pl-12"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 rounded"
                aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-start">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-purple hover:underline focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 rounded"
          >
            שכחת סיסמה?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          size="lg"
          className="h-12 rounded-xl text-base"
        >
          {isLoading ? 'מתחבר...' : 'התחברות'}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          אין לך חשבון?{' '}
          <Link
            href="/register"
            className="font-medium text-brand-purple hover:underline focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 rounded"
          >
            הרשמה
          </Link>
        </p>
      </form>
    );
  }
);

LoginForm.displayName = 'LoginForm';

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}
