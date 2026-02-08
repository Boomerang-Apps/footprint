/**
 * GiftMessage Component
 *
 * GF-02: Add Personal Message
 *
 * Message input with 150 char limit and live preview.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { MessageSquare, Gift } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';

export interface GiftMessageProps {
  /** Initial message value (overrides store) */
  initialMessage?: string;
  /** Callback when message changes */
  onChange?: (message: string) => void;
  /** Disable the input */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

const MAX_CHARACTERS = 150;
const WARNING_THRESHOLD = 130;

export default function GiftMessage({
  initialMessage,
  onChange,
  disabled = false,
  className = '',
}: GiftMessageProps): React.ReactElement {
  const { giftMessage, setGiftMessage } = useOrderStore();

  // Use prop value if provided, otherwise use store value
  const [localMessage, setLocalMessage] = useState(
    initialMessage !== undefined ? initialMessage : giftMessage
  );

  // Sync with store on mount if initialMessage provided
  useEffect(() => {
    if (initialMessage !== undefined) {
      setGiftMessage(initialMessage);
    }
  }, [initialMessage, setGiftMessage]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value.slice(0, MAX_CHARACTERS);
      setLocalMessage(newValue);
      setGiftMessage(newValue);
      onChange?.(newValue);
    },
    [setGiftMessage, onChange]
  );

  const characterCount = localMessage.length;
  const isNearLimit = characterCount >= WARNING_THRESHOLD;
  const isAtLimit = characterCount >= MAX_CHARACTERS;

  return (
    <div
      role="group"
      aria-label="הודעה אישית - Personal Message"
      className={`space-y-4 ${className}`}
    >
      {/* Message Input Section */}
      <div className="space-y-2">
        <label
          htmlFor="gift-message"
          className="flex items-center gap-2 text-sm font-medium text-zinc-700"
        >
          <MessageSquare className="w-4 h-4" />
          <span>הודעה אישית (עד 150 תווים)</span>
        </label>

        <textarea
          id="gift-message"
          value={localMessage}
          onChange={handleChange}
          disabled={disabled}
          placeholder="כתבו הודעה אישית למקבל המתנה..."
          maxLength={MAX_CHARACTERS}
          aria-label="הודעה אישית"
          className={`
            w-full min-h-[120px] p-3 rounded-lg border resize-none
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent
            ${disabled ? 'bg-zinc-100 cursor-not-allowed' : 'bg-white'}
            ${isAtLimit ? 'border-red-300' : isNearLimit ? 'border-amber-300' : 'border-zinc-300'}
          `}
        />

        {/* Character Counter */}
        <div
          aria-label={`${characterCount} מתוך ${MAX_CHARACTERS} תווים`}
          className={`
            text-xs text-left transition-colors duration-200
            ${isAtLimit ? 'text-red-600 font-medium' : isNearLimit ? 'text-amber-600 warning' : 'text-zinc-500'}
          `}
        >
          {characterCount}/{MAX_CHARACTERS}
        </div>
      </div>

      {/* Message Preview */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-600">תצוגה מקדימה</p>

        <div
          data-testid="message-preview"
          aria-live="polite"
          className="
            relative p-6 rounded-xl border-2 border-dashed border-zinc-200
            bg-gradient-to-br from-amber-50 to-orange-50
            min-h-[140px] card shadow-sm
          "
        >
          {/* Decorative Gift Icon */}
          <div className="absolute top-3 right-3 text-amber-400">
            <Gift className="w-5 h-5" />
          </div>

          {/* Message Content */}
          <div className="flex items-center justify-center h-full min-h-[80px]">
            <p
              className={`
                text-center leading-relaxed whitespace-pre-wrap
                ${localMessage ? 'text-zinc-800' : 'text-zinc-400 italic'}
              `}
              dir="rtl"
            >
              {localMessage || 'ההודעה תופיע כאן...'}
            </p>
          </div>

          {/* Card Footer */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-center">
            <span className="text-xs text-amber-600/60">כרטיס ברכה</span>
          </div>
        </div>
      </div>
    </div>
  );
}
