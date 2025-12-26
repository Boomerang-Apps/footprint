'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import type { SizeType, FrameType } from '@/types';

interface RoomPreviewProps {
  imageUrl: string;
  size: SizeType;
  frameType: FrameType;
}

// Size dimensions for display
const sizeDimensions: Record<SizeType, string> = {
  A5: '14.8 x 21 cm',
  A4: '21 x 29.7 cm',
  A3: '29.7 x 42 cm',
  A2: '42 x 59.4 cm',
};

// Size scaling - percentage of wall width for each size
const sizeScales: Record<SizeType, { width: number; height: number }> = {
  A5: { width: 48, height: 68 },
  A4: { width: 64, height: 90 },
  A3: { width: 80, height: 113 },
  A2: { width: 96, height: 136 },
};

// Frame colors
const frameColors: Record<FrameType, string> = {
  none: 'transparent',
  black: '#1a1a1a',
  white: '#ffffff',
  oak: '#daa520',
};

export default function RoomPreview({ imageUrl, size, frameType }: RoomPreviewProps) {
  const [viewMode, setViewMode] = useState<'room' | 'simple'>('room');

  const toggleView = () => {
    setViewMode(prev => (prev === 'room' ? 'simple' : 'room'));
  };

  const scale = sizeScales[size];
  const frameColor = frameColors[frameType];
  const hasFrame = frameType !== 'none';

  return (
    <div
      data-testid="room-preview"
      data-view={viewMode}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200"
    >
      {/* Wall Background */}
      <div
        data-testid="wall-background"
        className="absolute inset-0 bg-gradient-to-b from-[#f5f0e8] to-[#e8e3db]"
        style={{
          backgroundImage: viewMode === 'room'
            ? 'repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(0,0,0,0.02) 100px, rgba(0,0,0,0.02) 101px)'
            : undefined,
        }}
      >
        {/* Art Frame - Positioned on wall */}
        <div
          data-testid="art-frame"
          data-size={size}
          data-frame={frameType}
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-out shadow-2xl"
          style={{
            top: viewMode === 'room' ? '15%' : '50%',
            transform: viewMode === 'room'
              ? 'translateX(-50%)'
              : 'translate(-50%, -50%)',
            width: `${scale.width}px`,
            height: `${scale.height}px`,
            padding: hasFrame ? '4px' : '0',
            backgroundColor: hasFrame ? frameColor : 'transparent',
            border: frameType === 'white' ? '1px solid #e4e4e7' : undefined,
            background: frameType === 'oak'
              ? 'linear-gradient(135deg, #b8860b, #daa520)'
              : frameColor,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Art Image */}
          <div className="relative w-full h-full bg-zinc-200 overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Art preview תצוגה מקדימה"
                fill
                className="object-cover"
                sizes="200px"
              />
            ) : (
              <div className="w-full h-full bg-zinc-300 flex items-center justify-center">
                <span className="text-zinc-400 text-xs">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* Size Dimensions Label */}
        <div
          data-testid="size-dimensions"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs text-zinc-600 font-medium shadow-sm"
          style={{
            bottom: viewMode === 'room' ? '60px' : '16px',
          }}
        >
          {size} ({sizeDimensions[size]})
        </div>
      </div>

      {/* Room Context Elements - Only in room view */}
      {viewMode === 'room' && (
        <div data-testid="room-context" className="absolute bottom-0 left-0 right-0">
          {/* Sofa/Furniture Silhouette */}
          <div className="relative w-full h-24">
            {/* Side Table */}
            <div className="absolute bottom-0 left-[10%] w-12 h-16 bg-gradient-to-b from-[#8b7355] to-[#6b5344] rounded-t-sm">
              {/* Lamp */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="w-6 h-6 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full opacity-90" />
                <div className="w-1 h-4 bg-[#8b7355] mx-auto" />
              </div>
            </div>

            {/* Sofa */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55%] h-14">
              {/* Sofa back */}
              <div className="absolute bottom-6 left-0 right-0 h-8 bg-gradient-to-b from-[#6b7280] to-[#4b5563] rounded-t-lg" />
              {/* Sofa seat */}
              <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-b from-[#9ca3af] to-[#6b7280] rounded-t-md" />
              {/* Pillows */}
              <div className="absolute bottom-7 left-4 w-8 h-5 bg-[#f97316]/60 rounded-md rotate-[-5deg]" />
              <div className="absolute bottom-7 right-4 w-8 h-5 bg-[#3b82f6]/50 rounded-md rotate-[5deg]" />
            </div>

            {/* Plant */}
            <div className="absolute bottom-0 right-[12%]">
              {/* Pot */}
              <div className="w-8 h-8 bg-gradient-to-b from-[#c4a35a] to-[#a68938] rounded-b-lg" />
              {/* Leaves */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <div className="w-3 h-10 bg-gradient-to-t from-[#22c55e] to-[#4ade80] rounded-full rotate-[-15deg] absolute left-0" />
                <div className="w-3 h-12 bg-gradient-to-t from-[#16a34a] to-[#22c55e] rounded-full absolute left-1" />
                <div className="w-3 h-10 bg-gradient-to-t from-[#22c55e] to-[#4ade80] rounded-full rotate-[15deg] absolute left-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floor Element */}
      <div
        data-testid="floor-element"
        className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-[#d4c5b0] to-[#c4b5a0]"
        style={{
          display: viewMode === 'room' ? 'block' : 'none',
        }}
      />

      {/* View Toggle Button */}
      <button
        onClick={toggleView}
        aria-label={viewMode === 'room' ? 'Switch to simple view' : 'Switch to room view'}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-zinc-600 shadow-sm hover:bg-white transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>{viewMode === 'room' ? 'תצוגה פשוטה' : 'תצוגה בחדר'}</span>
      </button>
    </div>
  );
}
