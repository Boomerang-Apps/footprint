'use client';

/**
 * WrappingStyleSelector
 *
 * Displays visual selector for gift wrapping styles.
 * Shows 3 options: classic, festive, minimalist with preview images.
 *
 * @story GF-04
 * @acceptance-criteria AC-003, AC-004
 */

import { Check } from 'lucide-react';
import type { WrappingStyle } from '@/types/order';
import { cn } from '@/lib/utils';

interface WrappingStyleSelectorProps {
  /** Currently selected wrapping style */
  selectedStyle: WrappingStyle;
  /** Callback when style changes */
  onStyleChange: (style: WrappingStyle) => void;
  /** Additional CSS classes */
  className?: string;
}

interface StyleOption {
  id: WrappingStyle;
  name: string;
  description: string;
  colors: string[];
  pattern: 'solid' | 'stripes' | 'dots';
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'classic',
    name: 'קלאסי',
    description: 'אלגנטי ומעודן',
    colors: ['bg-amber-100', 'bg-amber-200', 'bg-amber-300'],
    pattern: 'solid',
  },
  {
    id: 'festive',
    name: 'חגיגי',
    description: 'צבעוני ושמח',
    colors: ['bg-pink-200', 'bg-purple-200', 'bg-blue-200'],
    pattern: 'stripes',
  },
  {
    id: 'minimalist',
    name: 'מינימליסטי',
    description: 'פשוט ונקי',
    colors: ['bg-gray-100', 'bg-white', 'bg-gray-50'],
    pattern: 'dots',
  },
];

function StylePreview({ option }: { option: StyleOption }) {
  return (
    <div className="w-full h-16 rounded-lg overflow-hidden relative">
      {option.pattern === 'solid' && (
        <div
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300'
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-amber-400/30 border-2 border-amber-400" />
          </div>
        </div>
      )}
      {option.pattern === 'stripes' && (
        <div className="absolute inset-0 flex">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1',
                i % 3 === 0 && 'bg-pink-200',
                i % 3 === 1 && 'bg-purple-200',
                i % 3 === 2 && 'bg-blue-200'
              )}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
              <span className="text-xs">🎁</span>
            </div>
          </div>
        </div>
      )}
      {option.pattern === 'dots' && (
        <div className="absolute inset-0 bg-gray-50">
          <div className="absolute inset-0 grid grid-cols-6 gap-1 p-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gray-200"
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-1 bg-gray-300 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}

export function WrappingStyleSelector({
  selectedStyle,
  onStyleChange,
  className,
}: WrappingStyleSelectorProps): React.ReactElement {
  return (
    <div
      dir="rtl"
      className={cn('p-4 sm:p-5', className)}
      data-testid="wrapping-style-selector"
    >
      <h4 className="text-xs font-medium text-gray-700 mb-3">
        בחר סגנון עטיפה
      </h4>
      <div className="grid grid-cols-3 gap-3">
        {STYLE_OPTIONS.map((option) => {
          const isSelected = selectedStyle === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onStyleChange(option.id)}
              className={cn(
                'relative rounded-xl p-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                isSelected
                  ? 'bg-purple-50 ring-2 ring-purple-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              )}
              aria-pressed={isSelected}
              aria-label={`בחר עטיפה ${option.name}`}
              data-testid={`style-option-${option.id}`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center z-10">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Preview */}
              <StylePreview option={option} />

              {/* Label */}
              <div className="mt-2 text-center">
                <span
                  className={cn(
                    'text-xs font-medium block',
                    isSelected ? 'text-purple-900' : 'text-gray-700'
                  )}
                >
                  {option.name}
                </span>
                <span className="text-[10px] text-gray-500">
                  {option.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

WrappingStyleSelector.displayName = 'WrappingStyleSelector';
