'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Maximize2 } from 'lucide-react';
import type { SizeType, FrameType, PaperType, OrientationType } from '@/types';

interface RoomPreviewProps {
  imageUrl: string;
  size: SizeType;
  frameType: FrameType;
  paperType?: PaperType;
  orientation?: OrientationType;
  onFrameChange?: (frame: FrameType) => void;
  hasPassepartout?: boolean;
  onPassepartoutChange?: (value: boolean) => void;
}

// Size dimensions for display
const sizeDimensions: Record<SizeType, string> = {
  A5: '14.8 x 21 cm',
  A4: '21 x 29.7 cm',
  A3: '29.7 x 42 cm',
  A2: '42 x 59.4 cm',
};

// Size scaling - base width in pixels for each size (150% of original)
const sizeScales: Record<SizeType, { width: number; height: number }> = {
  A5: { width: 150, height: 212 },
  A4: { width: 180, height: 255 },
  A3: { width: 218, height: 308 },
  A2: { width: 263, height: 371 },
};

// Frame colors and names
const frameInfo: Record<FrameType, { color: string; name: string; nameHe: string }> = {
  none: { color: 'transparent', name: 'No Frame', nameHe: 'ללא מסגרת' },
  black: { color: '#1a1a1a', name: 'Black', nameHe: 'שחור' },
  white: { color: '#ffffff', name: 'White', nameHe: 'לבן' },
  oak: { color: '#daa520', name: 'Oak', nameHe: 'אלון' },
};

// Paper type names
const paperInfo: Record<PaperType, { name: string; nameHe: string }> = {
  matte: { name: 'Fine Art Matte', nameHe: 'נייר מט' },
  glossy: { name: 'Glossy Photo', nameHe: 'מבריק' },
  canvas: { name: 'Canvas', nameHe: 'קנבס' },
};

// Frame options for quick selection (none first, then colors)
const frameOptions: { id: FrameType; color: string; name: string; gradient?: string }[] = [
  { id: 'none', color: 'transparent', name: 'ללא' },
  { id: 'black', color: '#1a1a1a', name: 'שחור' },
  { id: 'white', color: '#ffffff', name: 'לבן' },
  { id: 'oak', color: '#daa520', name: 'אלון', gradient: 'linear-gradient(135deg, #b8860b, #daa520)' },
];

export default function RoomPreview({
  imageUrl,
  size,
  frameType,
  paperType = 'matte',
  orientation = 'portrait',
  onFrameChange,
  hasPassepartout = false,
  onPassepartoutChange,
}: RoomPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Local passepartout state if not controlled externally
  const [localPassepartout, setLocalPassepartout] = useState(hasPassepartout);

  const showPassepartout = onPassepartoutChange ? hasPassepartout : localPassepartout;
  const togglePassepartout = () => {
    if (onPassepartoutChange) {
      onPassepartoutChange(!hasPassepartout);
    } else {
      setLocalPassepartout(!localPassepartout);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseScale = sizeScales[size];
  const scale = orientation === 'landscape'
    ? { width: baseScale.height, height: baseScale.width }
    : baseScale;
  const frame = frameInfo[frameType];
  const paper = paperInfo[paperType];
  const hasFrame = frameType !== 'none';

  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  // Frame width proportional to paper size
  const frameWidthBySize: Record<SizeType, { normal: number; large: number }> = {
    A5: { normal: 4, large: 8 },
    A4: { normal: 5, large: 10 },
    A3: { normal: 6, large: 12 },
    A2: { normal: 7, large: 14 },
  };

  // Mat/passepartout width proportional to paper size (~10% of image)
  const matWidthBySize: Record<SizeType, { normal: number; large: number }> = {
    A5: { normal: 10, large: 20 },
    A4: { normal: 12, large: 24 },
    A3: { normal: 14, large: 28 },
    A2: { normal: 16, large: 32 },
  };

  // Artwork with frame component
  // Based on research: Mat/passepartout should be WHITE, providing "gallery museum-like charm"
  // No mat = image fills frame edge-to-edge (full bleed)
  // With mat = white border between frame and image with thin bevel line
  const ArtworkFrame = ({ isLarge = false }: { isLarge?: boolean }) => {
    // For fullscreen, scale up proportionally maintaining the aspect ratio
    const largeScale = 2.5;
    const artWidth = isLarge ? `${scale.width * largeScale}px` : `${scale.width}px`;
    const artHeight = isLarge ? `${scale.height * largeScale}px` : `${scale.height}px`;

    // Frame width proportional to size
    const frameWidth = hasFrame
      ? (isLarge ? frameWidthBySize[size].large : frameWidthBySize[size].normal)
      : 0;

    // Mat width proportional to size
    const matWidth = showPassepartout
      ? (isLarge ? matWidthBySize[size].large : matWidthBySize[size].normal)
      : 0;

    return (
      <div
        data-testid="art-frame"
        data-size={size}
        data-frame={frameType}
        data-passepartout={showPassepartout ? 'true' : 'false'}
        className="relative transition-all duration-300"
        style={{
          width: artWidth,
          height: artHeight,
          maxWidth: isLarge ? '85vw' : undefined,
          maxHeight: isLarge ? '65vh' : undefined,
          padding: `${frameWidth}px`,
          backgroundColor: hasFrame ? frame.color : 'transparent',
          border: frameType === 'white' ? '1px solid #d4d4d4' : undefined,
          background:
            frameType === 'oak'
              ? 'linear-gradient(135deg, #b8860b, #daa520)'
              : hasFrame
              ? frame.color
              : 'transparent',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        {/* Mat/Passepartout layer - white with thin bevel line */}
        <div
          className="relative w-full h-full transition-all duration-300"
          style={{
            padding: `${matWidth}px`,
            backgroundColor: showPassepartout ? '#ffffff' : 'transparent',
          }}
        >
          {/* Image container with thin border when passepartout is on */}
          <div
            className="relative w-full h-full overflow-hidden bg-white"
            style={{
              // Thin line to show passepartout edge (bevel cut effect)
              border: showPassepartout ? '1px solid #e5e5e5' : 'none',
            }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Your artwork"
                fill
                className="object-cover"
                sizes={isLarge ? '80vw' : '200px'}
                priority
              />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center">
                <span className="text-zinc-300 text-xs">No image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div data-testid="room-preview" data-view="simple" className="relative h-full flex flex-col">
        {/* Wall background with centered artwork */}
        <div
          className="relative flex-1 min-h-[300px] rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-zinc-100"
        >
          {/* Fullscreen Button */}
          <button
            onClick={openFullscreen}
            aria-label="View fullscreen"
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-black/10 hover:bg-black/20 backdrop-blur-sm rounded-lg text-zinc-600 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Artwork */}
          <ArtworkFrame />

          {/* Frame Color Selector - Below artwork */}
          <div className="flex items-center gap-3 mt-6 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl">
            {frameOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFrameChange?.(opt.id)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  frameType === opt.id
                    ? 'border-violet-500 scale-110 ring-2 ring-violet-500/30'
                    : 'border-zinc-300 hover:border-zinc-400'
                } ${opt.id === 'none' ? 'border-dashed border-zinc-400' : ''}`}
                style={
                  opt.gradient
                    ? { background: opt.gradient }
                    : { backgroundColor: opt.id === 'none' ? '#f5f5f5' : opt.id === 'black' ? '#1a1a1a' : '#ffffff' }
                }
                aria-label={opt.name}
                title={opt.name}
              />
            ))}

            {/* Divider */}
            <div className="w-px h-8 bg-zinc-300 mx-1" />

            {/* Passepartout Toggle */}
            <button
              onClick={togglePassepartout}
              className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                showPassepartout
                  ? 'border-violet-500 bg-violet-50 scale-110 ring-2 ring-violet-500/30'
                  : 'border-zinc-300 bg-white hover:border-zinc-400'
              }`}
              aria-label={showPassepartout ? 'הסר פספרטו' : 'הוסף פספרטו'}
              title={showPassepartout ? 'הסר פספרטו' : 'הוסף פספרטו'}
            >
              {/* Custom passepartout icon - frame with inner mat */}
              <div className={`w-6 h-6 border-2 rounded-sm flex items-center justify-center ${
                showPassepartout ? 'border-violet-600' : 'border-zinc-400'
              }`}>
                <div className={`w-3 h-3 rounded-sm ${
                  showPassepartout ? 'bg-violet-600' : 'bg-zinc-400'
                }`} />
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Fullscreen Modal */}
      {mounted && isFullscreen && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-zinc-100"
          style={{ zIndex: 9999 }}
          onClick={closeFullscreen}
        >
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full text-zinc-700 transition-colors"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Details at Top in Fullscreen */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-center shadow-lg">
              <div className="text-lg font-semibold text-zinc-900">{size} • {sizeDimensions[size]}</div>
              <div className="text-sm text-zinc-600">{paper.nameHe} • {frame.nameHe}{showPassepartout ? ' • פספרטו' : ''}</div>
            </div>
          </div>

          {/* Large Artwork */}
          <div onClick={(e) => e.stopPropagation()}>
            <ArtworkFrame isLarge />
          </div>

          {/* Frame & Passepartout Selector at Bottom */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            {/* Frame Color Selector */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
              {frameOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFrameChange?.(opt.id);
                  }}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    frameType === opt.id
                      ? 'border-violet-500 scale-110 ring-2 ring-violet-500/30'
                      : 'border-zinc-300 hover:border-zinc-400'
                  } ${opt.id === 'none' ? 'border-dashed border-zinc-400' : ''}`}
                  style={
                    opt.gradient
                      ? { background: opt.gradient }
                      : { backgroundColor: opt.id === 'none' ? '#f5f5f5' : opt.id === 'black' ? '#1a1a1a' : '#ffffff' }
                  }
                  aria-label={opt.name}
                  title={opt.name}
                />
              ))}

              {/* Divider */}
              <div className="w-px h-10 bg-zinc-300 mx-1" />

              {/* Passepartout Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePassepartout();
                }}
                className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
                  showPassepartout
                    ? 'border-violet-500 bg-violet-50 scale-110 ring-2 ring-violet-500/30'
                    : 'border-zinc-300 bg-white hover:border-zinc-400'
                }`}
                aria-label={showPassepartout ? 'הסר פספרטו' : 'הוסף פספרטו'}
                title={showPassepartout ? 'הסר פספרטו' : 'הוסף פספרטו'}
              >
                {/* Custom passepartout icon - frame with inner mat */}
                <div className={`w-7 h-7 border-2 rounded-sm flex items-center justify-center ${
                  showPassepartout ? 'border-violet-600' : 'border-zinc-400'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-sm ${
                    showPassepartout ? 'bg-violet-600' : 'bg-zinc-400'
                  }`} />
                </div>
              </button>
            </div>

            {/* Label */}
            <div className="text-sm text-zinc-500 font-medium">
              {showPassepartout ? 'עם פספרטו' : 'ללא פספרטו'}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
