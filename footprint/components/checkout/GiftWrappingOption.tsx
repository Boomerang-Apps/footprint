'use client';

/**
 * GiftWrappingOption
 *
 * Allows customers to add premium gift wrapping to their orders.
 * Displays toggle, price, and wrapping style selector.
 *
 * @story GF-04
 * @acceptance-criteria AC-001 through AC-010
 */

import { Gift } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import { WrappingStyleSelector } from './WrappingStyleSelector';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { cn } from '@/lib/utils';
import { GIFT_WRAPPING_PRICE } from '@/types/order';

interface GiftWrappingOptionProps {
  /** Additional CSS classes */
  className?: string;
}

export function GiftWrappingOption({
  className,
}: GiftWrappingOptionProps): React.ReactElement {
  const giftWrap = useOrderStore((state) => state.giftWrap);
  const wrappingStyle = useOrderStore((state) => state.wrappingStyle);
  const setGiftWrap = useOrderStore((state) => state.setGiftWrap);
  const setWrappingStyle = useOrderStore((state) => state.setWrappingStyle);
  const isGift = useOrderStore((state) => state.isGift);
  const giftMessage = useOrderStore((state) => state.giftMessage);

  const handleToggle = () => {
    setGiftWrap(!giftWrap);
  };

  return (
    <div
      dir="rtl"
      className={cn('bg-white rounded-2xl border border-gray-200 overflow-hidden', className)}
      data-testid="gift-wrapping-option"
    >
      {/* Header with toggle */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                giftWrap ? 'bg-pink-100' : 'bg-gray-100'
              )}
            >
              <Gift
                className={cn(
                  'h-5 w-5 transition-colors',
                  giftWrap ? 'text-pink-600' : 'text-gray-400'
                )}
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                עטיפת מתנה
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                עטיפה מהודרת לחוויית מתנה מושלמת
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Price badge */}
            <span className="text-sm font-medium text-purple-600">
              +<PriceDisplay amount={GIFT_WRAPPING_PRICE} locale="he" size="sm" />
            </span>

            {/* Toggle switch */}
            <button
              role="switch"
              aria-checked={giftWrap}
              aria-label="הפעל עטיפת מתנה"
              onClick={handleToggle}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                giftWrap ? 'bg-purple-600' : 'bg-gray-200'
              )}
              data-testid="gift-wrap-toggle"
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform',
                  giftWrap ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Wrapping Style Selector - shown when enabled */}
      {giftWrap && (
        <div className="border-t border-gray-100">
          <WrappingStyleSelector
            selectedStyle={wrappingStyle || 'classic'}
            onStyleChange={setWrappingStyle}
          />
        </div>
      )}

      {/* Combined preview when both gift message and wrapping enabled */}
      {giftWrap && isGift && giftMessage && (
        <div className="border-t border-gray-100 p-4 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-pink-600" />
            <span className="text-xs font-medium text-pink-900">
              תצוגה מקדימה של המתנה
            </span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-pink-100 shadow-sm">
            <p className="text-xs text-gray-600 leading-relaxed">
              החבילה שלך תיעטף ב
              <span className="font-medium text-gray-900">
                {wrappingStyle === 'classic' && ' סגנון קלאסי'}
                {wrappingStyle === 'festive' && ' סגנון חגיגי'}
                {wrappingStyle === 'minimalist' && ' סגנון מינימליסטי'}
              </span>
              {' '}עם כרטיס ברכה שיכלול את ההודעה שלך.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

GiftWrappingOption.displayName = 'GiftWrappingOption';
