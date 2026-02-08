/**
 * FrameSelector Component
 *
 * PC-03: Add frame option
 *
 * Displays frame options (None, Black, White, Oak) with color previews and prices.
 */

'use client';

import { useCallback } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import type { FrameType, Frame } from '@/types';

export interface FrameSelectorProps {
  onFrameChange?: (frame: FrameType) => void;
  className?: string;
}

// Frame definitions
const FRAMES: Frame[] = [
  {
    id: 'none',
    name: 'None',
    nameHe: 'ללא מסגרת',
    color: 'transparent',
    price: 0,
  },
  {
    id: 'black',
    name: 'Black',
    nameHe: 'שחור',
    color: '#1a1a1a',
    price: 79,
    popular: true,
  },
  {
    id: 'white',
    name: 'White',
    nameHe: 'לבן',
    color: '#ffffff',
    price: 79,
  },
  {
    id: 'oak',
    name: 'Oak',
    nameHe: 'אלון',
    color: '#c4a77d',
    price: 99,
  },
];

export default function FrameSelector({
  onFrameChange,
  className = '',
}: FrameSelectorProps): React.ReactElement {
  const { frameType, setFrameType } = useOrderStore();

  const handleFrameClick = useCallback(
    (frameId: FrameType) => {
      setFrameType(frameId);
      onFrameChange?.(frameId);
    },
    [setFrameType, onFrameChange]
  );

  return (
    <div
      role="group"
      aria-label="Frame Selector - בחירת מסגרת"
      className={`grid grid-cols-2 gap-3 ${className}`}
    >
      {FRAMES.map((frame) => (
        <button
          key={frame.id}
          type="button"
          onClick={() => handleFrameClick(frame.id)}
          aria-label={frame.nameHe}
          className={`
            p-4 rounded-xl border-2 transition-all duration-200
            flex flex-col items-center gap-3
            focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
            ${
              frameType === frame.id
                ? 'border-brand-purple bg-brand-purple/5'
                : 'border-zinc-200 hover:border-zinc-400'
            }
          `}
        >
          {/* Frame preview */}
          <div className="relative">
            <div
              data-frame-color={frame.id}
              className={`
                w-16 h-20 rounded-sm flex items-center justify-center
                ${frame.id === 'none' ? 'border-2 border-dashed border-zinc-300 bg-zinc-50' : ''}
              `}
              style={
                frame.id !== 'none'
                  ? {
                      border: `4px solid ${frame.color}`,
                      backgroundColor: '#f5f5f5',
                      boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.05)',
                    }
                  : undefined
              }
            >
              {frame.id === 'none' && (
                <svg
                  className="w-6 h-6 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>

            {/* Popular badge */}
            {frame.popular && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-medium bg-brand-purple text-white rounded-full">
                פופולרי
              </span>
            )}

            {/* Selected checkmark */}
            {frameType === frame.id && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
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

          {/* Frame name and price */}
          <div className="text-center">
            <span className="font-medium text-zinc-900 text-sm">{frame.nameHe}</span>
            <div className="text-sm text-zinc-500">
              {frame.price > 0 ? `₪${frame.price}` : 'חינם'}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// Export frames for use in other components
export { FRAMES };
