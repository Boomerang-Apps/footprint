import { Gift, Heart, Cake, Baby, GraduationCap, Home, PartyPopper, HandHeart, Sparkle } from 'lucide-react';
import type { GiftOccasion } from '@/stores/orderStore';

const GIFT_OCCASIONS: { id: NonNullable<GiftOccasion>; label: string; icon: React.ElementType }[] = [
  { id: 'birthday', label: 'יום הולדת', icon: Cake },
  { id: 'love', label: 'אהבה', icon: Heart },
  { id: 'wedding', label: 'חתונה', icon: PartyPopper },
  { id: 'newBaby', label: 'תינוק חדש', icon: Baby },
  { id: 'barMitzvah', label: 'בר/בת מצווה', icon: Sparkle },
  { id: 'housewarming', label: 'חנוכת בית', icon: Home },
  { id: 'graduation', label: 'סיום לימודים', icon: GraduationCap },
  { id: 'thankYou', label: 'תודה', icon: HandHeart },
  { id: 'justBecause', label: 'סתם ככה', icon: Gift },
];

interface GiftOptionsSectionProps {
  isGift: boolean;
  onToggleGift: (value: boolean) => void;
  giftOccasion: GiftOccasion;
  onSetOccasion: (value: GiftOccasion) => void;
  giftMessage: string;
  onSetMessage: (value: string) => void;
  hideGiftPrice: boolean;
  onSetHidePrice: (value: boolean) => void;
}

export function GiftOptionsSection({
  isGift,
  onToggleGift,
  giftOccasion,
  onSetOccasion,
  giftMessage,
  onSetMessage,
  hideGiftPrice,
  onSetHidePrice,
}: GiftOptionsSectionProps) {
  return (
    <section className="border border-zinc-200 rounded-xl overflow-hidden">
      {/* Gift Toggle Header */}
      <button
        type="button"
        onClick={() => onToggleGift(!isGift)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${
          isGift ? 'bg-pink-50' : 'bg-white hover:bg-zinc-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isGift ? 'bg-pink-100' : 'bg-zinc-100'
          }`}>
            <Gift className={`w-5 h-5 ${isGift ? 'text-pink-600' : 'text-zinc-500'}`} />
          </div>
          <div className="text-right">
            <h2 className="font-semibold text-zinc-900">זוהי מתנה?</h2>
            <p className="text-sm text-zinc-500">הוסף הודעה אישית ובחר סוג אירוע</p>
          </div>
        </div>
        <div className={`w-12 h-7 rounded-full transition-colors relative ${
          isGift ? 'bg-pink-500' : 'bg-zinc-300'
        }`}>
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            isGift ? 'right-1' : 'left-1'
          }`} />
        </div>
      </button>

      {/* Gift Options Panel */}
      {isGift && (
        <div className="p-4 border-t border-zinc-200 bg-white space-y-4">
          {/* Occasion Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">סוג האירוע</label>
            <div className="grid grid-cols-3 gap-2">
              {GIFT_OCCASIONS.map((occasion) => {
                const Icon = occasion.icon;
                const isSelected = giftOccasion === occasion.id;
                return (
                  <button
                    key={occasion.id}
                    type="button"
                    onClick={() => onSetOccasion(isSelected ? null : occasion.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-pink-600' : 'text-zinc-500'}`} />
                    <span className="text-xs font-medium">{occasion.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">הודעה אישית</label>
            <textarea
              value={giftMessage}
              onChange={(e) => onSetMessage(e.target.value.slice(0, 150))}
              placeholder="כתבו הודעה אישית למקבל המתנה..."
              className="input min-h-[80px] resize-none"
              maxLength={150}
            />
            <div className="text-xs text-zinc-400 text-left mt-1">{giftMessage.length}/150</div>
          </div>

          {/* Hide Price Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hideGiftPrice}
              onChange={(e) => onSetHidePrice(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-zinc-700">הסתר מחיר מהנמען</span>
          </label>
        </div>
      )}
    </section>
  );
}
