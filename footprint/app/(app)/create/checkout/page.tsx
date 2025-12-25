'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Check, Gift, Truck, CreditCard, Lock } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import toast from 'react-hot-toast';

// Price data
const SIZE_PRICES: Record<string, number> = { A5: 89, A4: 149, A3: 249, A2: 379 };
const PAPER_PRICES: Record<string, number> = { matte: 0, glossy: 20, canvas: 40 };
const FRAME_PRICES: Record<string, number> = { none: 0, black: 60, white: 60, oak: 80 };

const STYLE_NAMES: Record<string, string> = {
  pop_art: 'פופ ארט',
  watercolor: 'צבעי מים',
  line_art: 'ציור קווי',
  oil_painting: 'ציור שמן',
  romantic: 'רומנטי',
  comic: 'קומיקס',
  vintage: 'וינטג׳',
  original: 'מקורי משופר',
};

const FRAME_NAMES: Record<string, string> = {
  none: 'ללא מסגרת',
  black: 'מסגרת שחורה',
  white: 'מסגרת לבנה',
  oak: 'מסגרת אלון',
};

const SIZE_DIMENSIONS: Record<string, string> = {
  A5: '14.8×21 ס״מ',
  A4: '21×29.7 ס״מ',
  A3: '29.7×42 ס״מ',
  A2: '42×59.4 ס״מ',
};

type PaymentMethod = 'credit-card' | 'apple-pay' | 'google-pay';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    originalImage,
    selectedStyle,
    size,
    paperType,
    frameType,
    isGift,
    giftMessage,
    setStep,
    setIsGift,
    setGiftMessage,
    setShippingAddress,
  } = useOrderStore();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit-card');
  const [couponCode, setCouponCode] = useState('');
  const [localGiftMessage, setLocalGiftMessage] = useState(giftMessage);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  // Redirect if no image
  useEffect(() => {
    if (!originalImage) {
      router.push('/create');
    }
  }, [originalImage, router]);

  // Sync local gift message with store
  useEffect(() => {
    setLocalGiftMessage(giftMessage);
  }, [giftMessage]);

  const handleBack = () => {
    setStep('customize');
    router.push('/create/customize');
  };

  const handleEdit = () => {
    router.push('/create/customize');
  };

  const handleGiftToggle = () => {
    setIsGift(!isGift);
  };

  const handleGiftMessageChange = (value: string) => {
    if (value.length <= 150) {
      setLocalGiftMessage(value);
      setGiftMessage(value);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      toast.success('קוד קופון הוחל בהצלחה');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save address to store
    setShippingAddress({
      name: formData.fullName,
      phone: formData.phone,
      street: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: 'ישראל',
    });

    toast.success('ההזמנה התקבלה בהצלחה!');
    setStep('complete');
    router.push('/create/complete');
  };

  if (!originalImage) {
    return null;
  }

  // Calculate prices
  const basePrice = SIZE_PRICES[size] || 149;
  const paperPrice = PAPER_PRICES[paperType] || 0;
  const framePrice = FRAME_PRICES[frameType] || 0;
  const subtotal = basePrice + paperPrice + framePrice;
  const shipping = subtotal >= 299 ? 0 : 29;
  const total = subtotal + shipping;

  const styleName = STYLE_NAMES[selectedStyle] || 'מקורי';
  const frameName = FRAME_NAMES[frameType] || '';

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
          <button
            data-testid="header-back-button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-zinc-600 rounded-xl"
            aria-label="חזרה"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <h1 className="text-[17px] font-semibold text-zinc-900">תשלום</h1>

          <div className="w-10" />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-zinc-200 py-4">
        <div className="max-w-[600px] mx-auto px-4">
          <div className="h-1 bg-zinc-200 rounded-full overflow-hidden mb-3">
            <div
              data-testid="progress-fill"
              className="h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full"
              style={{ width: '80%' }}
            />
          </div>
          <div className="flex justify-between">
            {[
              { label: 'העלאה', completed: true, active: false },
              { label: 'סגנון', completed: true, active: false },
              { label: 'התאמה', completed: true, active: false },
              { label: 'תשלום', completed: false, active: true },
            ].map((step, i) => (
              <div
                key={step.label}
                data-step
                data-completed={step.completed}
                data-active={step.active}
                className={`flex items-center gap-1 text-xs ${
                  step.active ? 'text-violet-600 font-semibold' :
                  step.completed ? 'text-emerald-500' : 'text-zinc-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  step.active ? 'bg-violet-600' :
                  step.completed ? 'bg-emerald-500' : 'bg-zinc-300'
                }`} />
                {step.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1000px] mx-auto px-4 py-4 pb-48 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:py-8">
        {/* Form Column */}
        <div className="space-y-4 lg:order-1">
          {/* Order Summary Card - Mobile only */}
          <div
            data-testid="order-summary-card"
            className="bg-white border border-zinc-200 rounded-2xl p-4 lg:hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-zinc-700">סיכום הזמנה</span>
              <button
                onClick={handleEdit}
                className="text-[13px] text-violet-600 font-medium"
              >
                עריכה
              </button>
            </div>
            <div className="flex gap-3">
              <div
                data-testid="order-thumbnail"
                className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100"
              >
                <Image
                  src={originalImage}
                  alt="תצוגה מקדימה"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">פורטרט AI - {styleName}</div>
                <div className="text-xs text-zinc-500 leading-relaxed mt-1">
                  {size} • {SIZE_DIMENSIONS[size]}<br />
                  Fine Art Matte • {frameName}
                </div>
              </div>
            </div>
          </div>

          {/* Gift Toggle Section */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <button
              data-testid="gift-toggle"
              onClick={handleGiftToggle}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-pink-500/[0.08] to-violet-600/[0.08] rounded-xl"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-pink-500" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-zinc-900">זו מתנה?</div>
                  <div className="text-xs text-zinc-500">נוסיף אריזת מתנה והודעה אישית</div>
                </div>
              </div>
              <div
                className={`w-12 h-7 rounded-full relative transition-colors ${
                  isGift ? 'bg-violet-600' : 'bg-zinc-300'
                }`}
              >
                <div
                  className={`absolute w-6 h-6 bg-white rounded-full top-0.5 shadow transition-transform ${
                    isGift ? 'translate-x-0 right-0.5' : 'translate-x-0 left-0.5'
                  }`}
                  style={{ [isGift ? 'right' : 'left']: '2px' }}
                />
              </div>
            </button>

            {isGift && (
              <div className="mt-3">
                <textarea
                  placeholder="כתבו הודעה אישית למקבל המתנה..."
                  maxLength={150}
                  value={localGiftMessage}
                  onChange={(e) => handleGiftMessageChange(e.target.value)}
                  className="w-full h-20 p-3 border border-zinc-200 rounded-xl text-sm resize-none outline-none focus:border-violet-600"
                />
                <div className="text-left text-[11px] text-zinc-400 mt-1">
                  <span data-testid="char-count">{localGiftMessage.length}</span>/150
                </div>
              </div>
            )}
          </div>

          {/* Shipping Form */}
          <form onSubmit={handleSubmit}>
            <div
              data-testid="shipping-section"
              className="bg-white border border-zinc-200 rounded-2xl p-4"
            >
              <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-violet-600" />
                פרטי משלוח
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label htmlFor="fullName" className="block text-[13px] font-medium text-zinc-700 mb-1.5">שם מלא</label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="ישראל ישראלי"
                    className="w-full px-3.5 py-3 border border-zinc-200 rounded-xl text-[15px] outline-none focus:border-violet-600 placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-[13px] font-medium text-zinc-700 mb-1.5">טלפון</label>
                  <input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="050-0000000"
                    className="w-full px-3.5 py-3 border border-zinc-200 rounded-xl text-[15px] outline-none focus:border-violet-600 placeholder:text-zinc-400 text-left"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-[13px] font-medium text-zinc-700 mb-1.5">כתובת</label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="רחוב, מספר בית, דירה"
                    className="w-full px-3.5 py-3 border border-zinc-200 rounded-xl text-[15px] outline-none focus:border-violet-600 placeholder:text-zinc-400"
                  />
                </div>

                <div data-testid="city-postal-row" className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="block text-[13px] font-medium text-zinc-700 mb-1.5">עיר</label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="תל אביב"
                      className="w-full px-3.5 py-3 border border-zinc-200 rounded-xl text-[15px] outline-none focus:border-violet-600 placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-[13px] font-medium text-zinc-700 mb-1.5">מיקוד</label>
                    <input
                      id="postalCode"
                      type="text"
                      dir="ltr"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="0000000"
                      className="w-full px-3.5 py-3 border border-zinc-200 rounded-xl text-[15px] outline-none focus:border-violet-600 placeholder:text-zinc-400 text-left"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div
              data-testid="payment-section"
              className="bg-white border border-zinc-200 rounded-2xl p-4 mt-4"
            >
              <h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-600" />
                אמצעי תשלום
              </h3>

              {/* Payment Methods */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  data-testid="payment-credit-card"
                  data-selected={selectedPayment === 'credit-card'}
                  onClick={() => setSelectedPayment('credit-card')}
                  className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                    selectedPayment === 'credit-card'
                      ? 'border-violet-600 bg-violet-600/[0.04]'
                      : 'border-zinc-200 bg-zinc-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === 'credit-card' ? 'border-violet-600' : 'border-zinc-300'
                  }`}>
                    {selectedPayment === 'credit-card' && (
                      <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />
                    )}
                  </div>
                  <div className="w-9 h-6 bg-white rounded flex items-center justify-center text-xs">💳</div>
                  <span className="text-sm font-medium">כרטיס אשראי</span>
                </button>

                <button
                  type="button"
                  data-testid="payment-apple-pay"
                  data-selected={selectedPayment === 'apple-pay'}
                  onClick={() => setSelectedPayment('apple-pay')}
                  className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                    selectedPayment === 'apple-pay'
                      ? 'border-violet-600 bg-violet-600/[0.04]'
                      : 'border-zinc-200 bg-zinc-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === 'apple-pay' ? 'border-violet-600' : 'border-zinc-300'
                  }`}>
                    {selectedPayment === 'apple-pay' && (
                      <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />
                    )}
                  </div>
                  <div className="w-9 h-6 bg-white rounded flex items-center justify-center text-xs">🍎</div>
                  <span className="text-sm font-medium">Apple Pay</span>
                </button>

                <button
                  type="button"
                  data-testid="payment-google-pay"
                  data-selected={selectedPayment === 'google-pay'}
                  onClick={() => setSelectedPayment('google-pay')}
                  className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                    selectedPayment === 'google-pay'
                      ? 'border-violet-600 bg-violet-600/[0.04]'
                      : 'border-zinc-200 bg-zinc-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === 'google-pay' ? 'border-violet-600' : 'border-zinc-300'
                  }`}>
                    {selectedPayment === 'google-pay' && (
                      <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />
                    )}
                  </div>
                  <div className="w-9 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-zinc-600">G</div>
                  <span className="text-sm font-medium">Google Pay</span>
                </button>
              </div>

              {/* Coupon Code */}
              <div className="mt-4">
                <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">קוד קופון</label>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="הזינו קוד"
                    className="flex-1 px-3.5 py-3 border border-zinc-200 rounded-xl text-[15px] outline-none focus:border-violet-600 placeholder:text-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-3 bg-zinc-100 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-200 active:bg-zinc-200"
                  >
                    החל
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-zinc-200 pt-4 mt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">הדפסה {size}</span>
                    <span className="text-zinc-900 font-medium">₪{basePrice}</span>
                  </div>
                  {paperPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600">תוספת נייר</span>
                      <span className="text-zinc-900 font-medium">₪{paperPrice}</span>
                    </div>
                  )}
                  {framePrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600">{frameName}</span>
                      <span className="text-zinc-900 font-medium">₪{framePrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-600">משלוח</span>
                    <span className={shipping === 0 ? 'text-emerald-500 font-medium' : 'text-zinc-900 font-medium'}>
                      {shipping === 0 ? 'חינם' : `₪${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 mt-3 border-t border-zinc-200">
                    <span className="text-lg font-bold text-zinc-900">סה״כ לתשלום</span>
                    <span data-testid="total-price" className="text-lg font-bold text-zinc-900">₪{total}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block lg:order-2">
          <div
            className="sticky top-24 bg-white border border-zinc-200 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-zinc-700">סיכום הזמנה</span>
              <button
                onClick={handleEdit}
                className="text-[13px] text-violet-600 font-medium"
              >
                עריכה
              </button>
            </div>
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                <Image
                  src={originalImage}
                  alt="תצוגה מקדימה"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">פורטרט AI - {styleName}</div>
                <div className="text-xs text-zinc-500 leading-relaxed mt-1">
                  {size} • {SIZE_DIMENSIONS[size]}<br />
                  Fine Art Matte • {frameName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 mb-3">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>תשלום מאובטח ב-SSL</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white py-4 rounded-[14px] font-semibold text-base shadow-lg disabled:opacity-70"
          >
            {isProcessing ? (
              <span>מעבד תשלום...</span>
            ) : (
              <>
                <span>לתשלום ₪{total}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
