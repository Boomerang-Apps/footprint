'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Check, Sparkles, CreditCard, MapPin, User, Phone, Mail, Building, Loader2 } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import toast from 'react-hot-toast';

// Generate a unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `FP-${timestamp}-${random}`.toUpperCase();
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    originalImage,
    selectedStyle,
    size,
    paperType,
    frameType,
    isGift,
    giftMessage,
    shippingAddress,
    setShippingAddress,
    setStep,
  } = useOrderStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
  });

  // Redirect if no image
  useEffect(() => {
    if (!originalImage) {
      router.push('/create');
    }
  }, [originalImage, router]);

  // Check for payment error on return from PayPlus
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'payment_failed') {
      toast.error('התשלום נכשל. אנא נסו שוב.');
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate total amount in agorot (ILS cents)
  const calculateTotalInAgorot = useCallback(() => {
    const sizes: Record<string, number> = { A5: 89, A4: 129, A3: 179, A2: 249 };
    const paperMods: Record<string, number> = { matte: 0, glossy: 20, canvas: 50 };
    const framePrices: Record<string, number> = { none: 0, black: 79, white: 79, oak: 99 };

    const basePrice = sizes[size] || 129;
    const paperMod = paperMods[paperType] || 0;
    const framePrice = framePrices[frameType] || 0;
    const subtotal = basePrice + paperMod + framePrice;
    const shipping = subtotal >= 299 ? 0 : 29;
    const total = subtotal + shipping;

    return total * 100; // Convert to agorot
  }, [size, paperType, frameType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.street || !formData.city) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    setIsProcessing(true);

    // Save address to store before payment
    setShippingAddress({
      name: formData.fullName,
      phone: formData.phone,
      street: formData.street,
      city: formData.city,
      postalCode: formData.zipCode,
      country: 'ישראל',
    });

    try {
      // Call PayPlus API to create payment link
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: generateOrderId(),
          amount: calculateTotalInAgorot(),
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה ביצירת התשלום');
      }

      // Redirect to PayPlus payment page
      window.location.href = data.paymentUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאה ביצירת התשלום';
      toast.error(message);
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setStep('customize');
    router.push('/create/customize');
  };

  if (!originalImage) {
    return null;
  }

  // Calculate price (simplified)
  const sizes: Record<string, number> = { A5: 89, A4: 129, A3: 179, A2: 249 };
  const paperMods: Record<string, number> = { matte: 0, glossy: 20, canvas: 50 };
  const framePrices: Record<string, number> = { none: 0, black: 79, white: 79, oak: 99 };

  const basePrice = sizes[size] || 129;
  const paperMod = paperMods[paperType] || 0;
  const framePrice = framePrices[frameType] || 0;
  const subtotal = basePrice + paperMod + framePrice;
  const shipping = subtotal >= 299 ? 0 : 29;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>חזרה</span>
          </button>

          <div className="flex items-center gap-2 text-zinc-900">
            <CreditCard className="w-5 h-5 text-brand-purple" />
            <span className="font-semibold">תשלום</span>
          </div>

          <div className="w-20" />
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {['העלאה', 'סגנון', 'התאמה', 'תשלום'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${i <= 3 ? 'bg-brand-purple text-white' : 'bg-zinc-100 text-zinc-500'}
                `}>
                  {i < 3 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm ${i <= 3 ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {step}
                </span>
                {i < 3 && <div className="w-8 h-px bg-brand-purple" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
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

          {/* Checkout Form */}
          <div className="order-1 lg:order-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-purple" />
                  פרטי התקשרות
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">שם מלא *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="input"
                      placeholder="ישראל ישראלי"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">אימייל *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="input"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">טלפון *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="input"
                        placeholder="050-1234567"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-purple" />
                  כתובת למשלוח
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">רחוב ומספר *</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className="input"
                      placeholder="רחוב הרצל 1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">עיר *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="input"
                        placeholder="תל אביב"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">מיקוד</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="input"
                        placeholder="1234567"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Note */}
              <section className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 text-sm">תשלום מאובטח</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      התשלום יבוצע דרך PayPlus - פלטפורמת תשלומים מאובטחת בישראל.
                      אנו מקבלים כרטיסי אשראי ישראליים ובינלאומיים.
                    </p>
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary w-full py-4 text-base disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>מעבד תשלום...</span>
                  </>
                ) : (
                  <>
                    <span>לתשלום ₪{total}</span>
                    <CreditCard className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-zinc-500 text-center">
                בלחיצה על כפתור התשלום אתם מאשרים את <a href="#" className="underline">התקנון</a> ו<a href="#" className="underline">מדיניות הפרטיות</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
