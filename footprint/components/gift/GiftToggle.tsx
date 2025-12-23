/**
 * GiftToggle Component
 *
 * GF-01: Mark Order as Gift
 *
 * Prominent gift toggle with wrap option and price notice.
 */

'use client';

import { useCallback } from 'react';
import { Gift, Package } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';

export interface GiftToggleProps {
  /** Override store value for controlled usage */
  isGiftEnabled?: boolean;
  /** Override store value for controlled usage */
  isGiftWrapEnabled?: boolean;
  /** Callback when gift toggle changes */
  onGiftChange?: (isGift: boolean) => void;
  /** Callback when gift wrap changes */
  onGiftWrapChange?: (giftWrap: boolean) => void;
  className?: string;
}

const GIFT_WRAP_PRICE = 15;

export default function GiftToggle({
  isGiftEnabled,
  isGiftWrapEnabled,
  onGiftChange,
  onGiftWrapChange,
  className = '',
}: GiftToggleProps): JSX.Element {
  const { isGift, giftWrap, setIsGift, setGiftWrap } = useOrderStore();

  // Use prop values if provided, otherwise use store values
  const giftActive = isGiftEnabled !== undefined ? isGiftEnabled : isGift;
  const wrapActive = isGiftWrapEnabled !== undefined ? isGiftWrapEnabled : giftWrap;

  const handleGiftToggle = useCallback(() => {
    const newValue = !giftActive;
    setIsGift(newValue);
    onGiftChange?.(newValue);

    // Reset gift wrap when turning off gift
    if (!newValue) {
      setGiftWrap(false);
      onGiftWrapChange?.(false);
    }
  }, [giftActive, setIsGift, setGiftWrap, onGiftChange, onGiftWrapChange]);

  const handleGiftWrapToggle = useCallback(() => {
    const newValue = !wrapActive;
    setGiftWrap(newValue);
    onGiftWrapChange?.(newValue);
  }, [wrapActive, setGiftWrap, onGiftWrapChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleGiftToggle();
      }
    },
    [handleGiftToggle]
  );

  const handleWrapKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleGiftWrapToggle();
      }
    },
    [handleGiftWrapToggle]
  );

  return (
    <div
      role="group"
      aria-label="Gift Options - אפשרויות מתנה"
      className={`space-y-4 ${className}`}
    >
      {/* Main Gift Toggle */}
      <div
        className={`
          p-4 rounded-xl border-2 transition-all duration-200
          ${giftActive
            ? 'border-brand-purple bg-brand-purple/5'
            : 'border-zinc-200 hover:border-zinc-300'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${giftActive ? 'bg-brand-purple text-white' : 'bg-zinc-100 text-zinc-500'}
              `}
            >
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="font-medium text-zinc-900">שליחה כמתנה</span>
              <p className="text-sm text-zinc-500">המחיר לא יופיע על תעודת המשלוח</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={giftActive}
            aria-label="שליחה כמתנה"
            onClick={handleGiftToggle}
            onKeyDown={handleKeyDown}
            className={`
              relative w-12 h-7 rounded-full transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
              ${giftActive ? 'bg-brand-purple' : 'bg-zinc-300'}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm
                transition-transform duration-200
                ${giftActive ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Gift Wrap Option - Only visible when gift is active */}
      {giftActive && (
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="font-medium text-zinc-900">אריזת מתנה</span>
                <p className="text-sm text-zinc-500">אריזה מיוחדת עם סרט</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-700">+₪{GIFT_WRAP_PRICE}</span>
              <input
                type="checkbox"
                role="checkbox"
                checked={wrapActive}
                onChange={handleGiftWrapToggle}
                onKeyDown={handleWrapKeyDown}
                aria-label="אריזת מתנה"
                className="
                  w-5 h-5 rounded border-zinc-300 text-brand-purple
                  focus:ring-brand-purple focus:ring-offset-0
                "
              />
            </div>
          </label>
        </div>
      )}

      {/* Price Notice - Only visible when gift is active */}
      {giftActive && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
          <svg
            className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-green-800">
            <strong>מחיר לא יופיע</strong> על תעודת המשלוח או על האריזה
          </p>
        </div>
      )}
    </div>
  );
}
