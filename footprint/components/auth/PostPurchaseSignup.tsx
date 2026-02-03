'use client';

/**
 * PostPurchaseSignup
 *
 * Prompts guest users to create an account after completing checkout.
 * Links the order to the new account if they sign up.
 *
 * @story AUTH-02
 * @acceptance-criteria AC-007, AC-008
 */

import { useState, useCallback, useEffect } from 'react';
import { UserPlus, Check, X, Loader2, Eye, EyeOff, Package, MapPin, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  trackSignupPromptShown,
  trackSignupPromptDismissed,
  trackGuestConversion,
} from '@/lib/analytics/guest-checkout';

interface PostPurchaseSignupProps {
  /** Guest email from checkout */
  email: string;
  /** Order ID to link to account */
  orderId: string;
  /** Called when signup completes successfully */
  onSignupComplete: () => void;
  /** Called when user dismisses the prompt */
  onDismiss: () => void;
}

const MIN_PASSWORD_LENGTH = 8;

export function PostPurchaseSignup({
  email,
  orderId,
  onSignupComplete,
  onDismiss,
}: PostPurchaseSignupProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Track prompt shown on mount (AC-011)
  useEffect(() => {
    trackSignupPromptShown({ orderId, email });
  }, [orderId, email]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים`);
      return false;
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              linked_order_id: orderId,
              source: 'post_purchase_signup',
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.user) {
          // Track conversion (AC-011)
          trackGuestConversion({
            conversionType: 'guest_to_account',
            email,
            orderId,
            userId: data.user.id,
          });

          setIsSuccess(true);
          setTimeout(() => {
            onSignupComplete();
          }, 2000);
        }
      } catch {
        setError('שגיאה ביצירת החשבון. נסו שוב.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, confirmPassword, orderId, onSignupComplete]
  );

  // Success state
  if (isSuccess) {
    return (
      <div dir="rtl" className="w-full max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          החשבון נוצר בהצלחה!
        </h3>
        <p className="text-sm text-green-700">
          שלחנו אליך אימייל לאימות החשבון.
          <br />
          ההזמנה שלך מקושרת לחשבון החדש.
        </p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-3 bg-violet-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-7 h-7 text-violet-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-1">
          צור חשבון לעקוב אחרי ההזמנה
        </h3>
        <p className="text-sm text-zinc-500">
          הוסף סיסמה והפעל את החשבון שלך
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
        <p className="text-sm font-medium text-violet-900 mb-3">יתרונות החשבון:</p>
        <ul className="space-y-2 text-sm text-violet-700">
          <li className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>עקוב אחרי ההזמנה בזמן אמת</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>שמור כתובות למשלוחים עתידיים</span>
          </li>
          <li className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span>קבל הנחות ומבצעים בלעדיים</span>
          </li>
        </ul>
      </div>

      {/* Email Display */}
      <div className="mb-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
        <p className="text-xs text-zinc-500 mb-1">האימייל שלך</p>
        <p className="text-sm font-medium text-zinc-900">{email}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
            סיסמה
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              className="w-full px-4 py-3 pl-12 rounded-xl border border-zinc-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors disabled:opacity-50"
              placeholder="לפחות 8 תווים"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 mb-1.5">
            אימות סיסמה
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirm-password"
            value={confirmPassword}
            onChange={handleConfirmChange}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors disabled:opacity-50"
            placeholder="הזן שוב את הסיסמה"
            autoComplete="new-password"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" data-testid="loading-spinner" />
              <span>יוצר חשבון...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>צור חשבון</span>
            </>
          )}
        </button>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => {
            trackSignupPromptDismissed({ orderId, email });
            onDismiss();
          }}
          disabled={isLoading}
          className="w-full py-3 text-zinc-500 font-medium hover:text-zinc-700 transition-colors disabled:opacity-50"
        >
          אולי אחר כך
        </button>
      </form>
    </div>
  );
}
