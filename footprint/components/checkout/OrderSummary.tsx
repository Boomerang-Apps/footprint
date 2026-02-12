import Image from 'next/image';
import { Check } from 'lucide-react';

interface OrderSummaryProps {
  originalImage: string;
  size: string;
  paperType: string;
  frameType: string;
  isGift: boolean;
  giftWrap: boolean;
  basePrice: number;
  paperMod: number;
  framePrice: number;
  wrappingPrice: number;
  shipping: number;
  total: number;
}

export function OrderSummary({
  originalImage,
  size,
  paperType,
  frameType,
  isGift,
  giftWrap,
  basePrice,
  paperMod,
  framePrice,
  wrappingPrice,
  shipping,
  total,
}: OrderSummaryProps) {
  return (
    <div className="order-2 lg:order-1">
      <div className="sticky top-32">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">סיכום הזמנה</h2>

        {/* Product Preview */}
        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 mb-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white border border-zinc-200">
              <Image
                src={originalImage}
                alt="Product"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900">הדפסת אמנות AI</h3>
              <div className="text-sm text-zinc-500 space-y-0.5 mt-1">
                <div>גודל: {size}</div>
                <div>נייר: {paperType === 'matte' ? 'מט' : paperType === 'glossy' ? 'מבריק' : 'קנבס'}</div>
                {frameType !== 'none' && <div>מסגרת: {frameType === 'black' ? 'שחור' : frameType === 'white' ? 'לבן' : 'אלון'}</div>}
                {isGift && <div className="text-brand-purple">מתנה</div>}
                {giftWrap && <div className="text-pink-600">עטיפת מתנה</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">הדפסה {size}</span>
              <span className="text-zinc-900">₪{basePrice}</span>
            </div>
            {paperMod > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">תוספת נייר</span>
                <span className="text-zinc-900">₪{paperMod}</span>
              </div>
            )}
            {framePrice > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">מסגרת</span>
                <span className="text-zinc-900">₪{framePrice}</span>
              </div>
            )}
            {wrappingPrice > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">עטיפת מתנה</span>
                <span className="text-zinc-900">₪{wrappingPrice}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">משלוח</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-zinc-900'}>
                {shipping === 0 ? 'חינם!' : `₪${shipping}`}
              </span>
            </div>
            <div className="pt-3 border-t border-zinc-200 flex justify-between font-semibold text-base">
              <span className="text-zinc-900">סה״כ לתשלום</span>
              <span className="text-brand-purple text-xl">₪{total}</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-500" />
            תשלום מאובטח
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-500" />
            החזר כספי
          </span>
        </div>
      </div>
    </div>
  );
}
