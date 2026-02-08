/**
 * SizeSelector Component
 *
 * PC-01: Select print size
 *
 * Displays size options (A5, A4, A3, A2) with dimensions and prices.
 */

'use client';

import { useCallback } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import type { SizeType, Size } from '@/types';

export interface SizeSelectorProps {
  onSizeChange?: (size: SizeType) => void;
  className?: string;
}

// Size definitions
const SIZES: Size[] = [
  {
    id: 'A5',
    name: 'A5',
    dimensions: '14.8 × 21 ס״מ',
    dimensionsCm: { width: 14.8, height: 21 },
    price: 89,
  },
  {
    id: 'A4',
    name: 'A4',
    dimensions: '21 × 29.7 ס״מ',
    dimensionsCm: { width: 21, height: 29.7 },
    price: 129,
    popular: true,
  },
  {
    id: 'A3',
    name: 'A3',
    dimensions: '29.7 × 42 ס״מ',
    dimensionsCm: { width: 29.7, height: 42 },
    price: 179,
  },
  {
    id: 'A2',
    name: 'A2',
    dimensions: '42 × 59.4 ס״מ',
    dimensionsCm: { width: 42, height: 59.4 },
    price: 249,
  },
];

export default function SizeSelector({
  onSizeChange,
  className = '',
}: SizeSelectorProps): React.ReactElement {
  const { size, setSize } = useOrderStore();

  const handleSizeClick = useCallback(
    (sizeId: SizeType) => {
      setSize(sizeId);
      onSizeChange?.(sizeId);
    },
    [setSize, onSizeChange]
  );

  return (
    <div
      role="group"
      aria-label="Size Selector - בחירת גודל"
      className={`space-y-3 ${className}`}
    >
      {SIZES.map((sizeOption) => (
        <button
          key={sizeOption.id}
          type="button"
          onClick={() => handleSizeClick(sizeOption.id)}
          aria-label={`${sizeOption.name} - ${sizeOption.dimensions}`}
          className={`
            w-full p-4 rounded-xl border-2 transition-all duration-200
            flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
            ${
              size === sizeOption.id
                ? 'border-brand-purple bg-brand-purple/5'
                : 'border-zinc-200 hover:border-zinc-400'
            }
          `}
        >
          <div className="flex items-center gap-4">
            {/* Size visualization */}
            <div
              className={`
                flex items-end justify-center
                ${size === sizeOption.id ? 'text-brand-purple' : 'text-zinc-400'}
              `}
              style={{
                width: 40,
                height: 40,
              }}
            >
              <div
                className={`
                  border-2 rounded-sm
                  ${size === sizeOption.id ? 'border-brand-purple bg-brand-purple/10' : 'border-zinc-300'}
                `}
                style={{
                  width: `${(sizeOption.dimensionsCm.width / 60) * 40}px`,
                  height: `${(sizeOption.dimensionsCm.height / 60) * 40}px`,
                }}
              />
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900">{sizeOption.name}</span>
                {sizeOption.popular && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-brand-purple text-white rounded-full">
                    פופולרי
                  </span>
                )}
              </div>
              <span className="text-sm text-zinc-500">{sizeOption.dimensions}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">₪{sizeOption.price}</span>
            {size === sizeOption.id && (
              <div className="w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// Export sizes for use in other components
export { SIZES };
