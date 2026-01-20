'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Wand2, Palette, Brush } from 'lucide-react';

interface StyleLoaderProps {
  styleName: string;
  className?: string;
  'data-testid'?: string;
}

const LOADING_MESSAGES = [
  'מייצר קסם...',
  'מעבד את הסגנון...',
  'כמעט מוכן...',
  'הופך לאמנות...',
];

const ICONS = [Sparkles, Wand2, Palette, Brush];

export function StyleLoader({ styleName, className = '', 'data-testid': testId = 'style-loader' }: StyleLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);

  // Cycle through messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  // Cycle through icons
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length);
    }, 800);

    return () => clearInterval(iconInterval);
  }, []);

  const CurrentIcon = ICONS[iconIndex];

  return (
    <div
      data-testid={testId}
      className={`absolute inset-0 bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 ${className}`}
    >
      {/* Animated rings container */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-violet-500/20 blur-xl animate-pulse" />

        {/* Gradient ring - outer */}
        <div
          className="absolute inset-2 rounded-full style-loader-ring"
          style={{
            background: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #8b5cf6)',
          }}
        />

        {/* White mask to create ring effect */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white via-purple-50 to-pink-50" />

        {/* Inner pulsing circle */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 animate-pulse" />

        {/* Center icon */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-bounce-gentle">
          <CurrentIcon
            key={iconIndex}
            className="w-8 h-8 text-white style-loader-icon"
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-pink-400 style-loader-particle"
              style={{
                top: '50%',
                left: '50%',
                marginTop: '-4px',
                marginLeft: '-4px',
                transform: `rotate(${i * 60}deg) translateY(-48px)`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Text content */}
      <div className="mt-6 text-center">
        <p
          key={messageIndex}
          className="text-lg font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent style-loader-message"
        >
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <p className="text-sm text-zinc-500 mt-1.5">
          סגנון: <span className="font-semibold text-violet-600">{styleName}</span>
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 style-loader-dot"
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default StyleLoader;
