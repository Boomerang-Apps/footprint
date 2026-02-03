'use client';

/**
 * GuestCheckoutForm
 *
 * Allows customers to complete purchases without creating an account.
 * Shows "Continue as Guest" option and collects email for order updates.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-001, AC-002, AC-003, AC-010, AC-012
 */

import { useState, useEffect } from 'react';
import { Mail, ArrowRight, Loader2, User } from 'lucide-react';
import { isValidGuestEmail } from '@/lib/auth/guest';
import {
  trackGuestCheckoutStarted,
  trackGuestEmailSubmitted,
} from '@/lib/analytics/guest-checkout';

const GUEST_EMAIL_KEY = 'footprint-guest-email';

interface GuestCheckoutFormProps {
  /** Called when guest submits valid email */
  onGuestSubmit: (email: string) => void;
  /** Called when user clicks login button */
  onLoginClick: () => void;
  /** Whether to show email form directly (skip initial choice) */
  showEmailForm?: boolean;
  /** Loading state for submit button */
  isLoading?: boolean;
}

export function GuestCheckoutForm({
  onGuestSubmit,
  onLoginClick,
  showEmailForm: initialShowForm = false,
  isLoading = false,
}: GuestCheckoutFormProps) {
  const [showEmailForm, setShowEmailForm] = useState(initialShowForm);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load saved email from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(GUEST_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  // Update showEmailForm when prop changes
  useEffect(() => {
    setShowEmailForm(initialShowForm);
  }, [initialShowForm]);

  const handleGuestClick = () => {
    trackGuestCheckoutStarted({ source: 'checkout_form' });
    setShowEmailForm(true);
  };

  const handleBackClick = () => {
    setShowEmailForm(false);
    setError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    // Validate email
    if (!trimmedEmail) {
      setError('נא להזין אימייל');
      return;
    }

    if (!isValidGuestEmail(trimmedEmail)) {
      setError('אימייל לא תקין');
      return;
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_EMAIL_KEY, trimmedEmail);
    }

    // Track email submission (AC-011)
    trackGuestEmailSubmitted({ email: trimmedEmail });

    // Submit
    onGuestSubmit(trimmedEmail);
  };

  return (
    <div dir="rtl" className="w-full max-w-md mx-auto">
      {!showEmailForm ? (
        // Initial choice: Guest or Login
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              איך תרצו להמשיך?
            </h2>
            <p className="text-sm text-zinc-500">
              בחרו להמשיך כאורח או להתחבר לחשבון קיים
            </p>
          </div>

          {/* Guest Checkout Button */}
          <button
            type="button"
            onClick={handleGuestClick}
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
            onClick={onLoginClick}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-violet-600 rounded-xl text-white font-medium hover:bg-violet-700 transition-colors"
          >
            <User className="w-5 h-5" />
            <span>התחברות</span>
          </button>

          <p className="text-xs text-zinc-400 text-center mt-4">
            משתמשים רשומים יכולים לעקוב אחרי הזמנות ולשמור כתובות
          </p>
        </div>
      ) : (
        // Email Form - noValidate to use our custom validation
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={handleBackClick}
              className="p-2 -mr-2 text-zinc-500 hover:text-zinc-700 transition-colors"
              aria-label="חזרה"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-zinc-900">
              המשך כאורח
            </h2>
          </div>

          <p className="text-sm text-zinc-500 mb-4">
            הזינו את האימייל שלכם כדי לקבל עדכונים על ההזמנה
          </p>

          {/* Email Input */}
          <div>
            <label
              htmlFor="guest-email"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
            >
              אימייל
            </label>
            <input
              type="email"
              id="guest-email"
              value={email}
              onChange={handleEmailChange}
              placeholder="email@example.com"
              className={`w-full px-4 py-3 rounded-xl border ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-zinc-200 focus:border-violet-500 focus:ring-violet-500'
              } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-colors`}
              dir="ltr"
              autoComplete="email"
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-violet-600 rounded-xl text-white font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" data-testid="loading-spinner" />
                <span>מעבד...</span>
              </>
            ) : (
              <span>המשך</span>
            )}
          </button>

          <p className="text-xs text-zinc-400 text-center">
            נשלח אליכם אישור הזמנה וקישור למעקב
          </p>
        </form>
      )}
    </div>
  );
}
