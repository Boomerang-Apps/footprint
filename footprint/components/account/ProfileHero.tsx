'use client';

import { useState, useRef, useCallback } from 'react';
import { User, Camera } from 'lucide-react';

export interface ProfileHeroProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
  onAvatarChange?: (file: File) => void;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

/**
 * ProfileHero - Gradient hero header with avatar, name, email, and member date
 * Pink→purple gradient background matching brand design
 */
export function ProfileHero({
  name,
  email,
  avatarUrl,
  memberSince,
  onAvatarChange,
  className = '',
}: ProfileHeroProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formattedDate = (() => {
    try {
      const date = new Date(memberSince);
      return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return '';
    }
  })();

  const handleEditPhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) return;
      if (file.size > MAX_FILE_SIZE) return;

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onAvatarChange?.(file);
    },
    [onAvatarChange]
  );

  const displayUrl = previewUrl || avatarUrl;

  return (
    <div
      data-testid="profile-hero"
      className={`relative bg-gradient-to-l from-brand-purple to-brand-pink ${className}`}
    >
      <div className="flex flex-col items-center px-4 pt-8 pb-12">
        {/* Edit Photo Button */}
        <button
          data-testid="edit-photo-button"
          onClick={handleEditPhoto}
          className="absolute top-4 start-4 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors flex items-center gap-1.5"
          aria-label="ערוך תמונה"
        >
          <Camera className="w-3.5 h-3.5" aria-hidden="true" />
          <span>ערוך תמונה</span>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="avatar-file-input"
          aria-label="בחר תמונת פרופיל"
        />

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-white/40 mb-3">
          {displayUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- Using img for blob URLs (preview) which next/image doesn't support */
            <img
              src={displayUrl}
              alt={`תמונת הפרופיל של ${name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              data-testid="avatar-placeholder"
              className="w-full h-full flex items-center justify-center bg-white/20"
            >
              <User className="w-12 h-12 text-white/70" />
            </div>
          )}
        </div>

        {/* Name */}
        <h1
          data-testid="profile-name"
          className="text-xl font-bold text-white mb-1"
        >
          {name}
        </h1>

        {/* Email */}
        <p
          data-testid="profile-email"
          className="text-sm text-white/80 mb-1"
        >
          {email}
        </p>

        {/* Member Since */}
        {formattedDate && (
          <p
            data-testid="member-since"
            className="text-xs text-white/60"
          >
            חבר מאז {formattedDate}
          </p>
        )}
      </div>
    </div>
  );
}

ProfileHero.displayName = 'ProfileHero';
