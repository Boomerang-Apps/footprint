'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Check, Sparkles, MapPin, User, Phone, Mail, Building, Loader2, Gift, Heart, Cake, Baby, GraduationCap, Home, PartyPopper, HandHeart, Sparkle, CreditCard } from 'lucide-react';
import type { GiftOccasion } from '@/stores/orderStore';
import { useOrderStore } from '@/stores/orderStore';
import { CheckoutAuthFlow } from '@/components/checkout/CheckoutAuthFlow';
import { GiftWrappingOption } from '@/components/checkout/GiftWrappingOption';
import { PaymentModal } from '@/components/checkout/PaymentModal';
import { GIFT_WRAPPING_PRICE } from '@/types/order';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

// Generate a unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `FP-${timestamp}-${random}`.toUpperCase();
}

// Gift occasion options
const GIFT_OCCASIONS: { id: GiftOccasion; label: string; icon: React.ElementType }[] = [
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

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    originalImage,
    selectedStyle,
    size,
    paperType,
    frameType,
    isGift,
    setIsGift,
    giftOccasion,
    setGiftOccasion,
    giftMessage,
    setGiftMessage,
    hideGiftPrice,
    setHideGiftPrice,
    giftWrap,
    wrappingStyle,
    transformedImage,
    scheduledDeliveryDate,
    shippingAddress,
    setShippingAddress,
    setStep,
    setOrderId,
    _hasHydrated,
    isGuest,
    guestInfo,
    hasPassepartout,
  } = useOrderStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [sandboxOrderContext, setSandboxOrderContext] = useState<{ orderId: string; email: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'applePay' | 'googlePay' | 'creditCard'>('creditCard');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        // If not authenticated and not guest, show auth flow
        if (!session && !isGuest) {
          setShowAuthFlow(true);
        }
      } catch {
        setIsAuthenticated(false);
        if (!isGuest) {
          setShowAuthFlow(true);
        }
      }
    };

    if (_hasHydrated) {
      checkAuth();
    }
  }, [_hasHydrated, isGuest]);

  // Pre-fill email from guest info
  useEffect(() => {
    if (guestInfo?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: guestInfo.email }));
    }
  }, [guestInfo, formData.email]);

  // Handle auth flow completion
  const handleAuthComplete = useCallback(() => {
    setShowAuthFlow(false);
    // Re-check auth status
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  // Redirect if no image (only after hydration)
  useEffect(() => {
    if (_hasHydrated && !originalImage) {
      router.push('/create');
    }
  }, [_hasHydrated, originalImage, router]);

  // Check for payment error on return from PayPlus
  useEffect(() => {
    const error = searchParams?.get('error');
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
    const wrappingCost = giftWrap ? GIFT_WRAPPING_PRICE : 0;
    const subtotal = basePrice + paperMod + framePrice + wrappingCost;
    const shipping = subtotal >= 299 ? 0 : 29;
    const total = subtotal + shipping;

    return total * 100; // Convert to agorot
  }, [size, paperType, frameType, giftWrap]);

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

    // Sandbox mode - create order via real API (DB + emails), skip payment modal
    const isSandbox = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
    if (isSandbox) {
      try {
        const paperLabel = paperType === 'matte' ? 'Matte' : paperType === 'glossy' ? 'Glossy' : 'Canvas';
        const frameLabel = frameType === 'none' ? 'ללא' : frameType === 'black' ? 'Black' : frameType === 'white' ? 'White' : 'Oak';
        const styleName = selectedStyle || 'Custom';

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: generateOrderId(),
            amount: calculateTotalInAgorot(),
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            items: [{
              name: `הדפסת ${styleName} - ${size}`,
              quantity: 1,
              price: total,
              imageUrl: transformedImage || originalImage || '',
              style: styleName,
              size,
              paper: paperLabel,
              frame: frameLabel,
            }],
            subtotal,
            shipping,
            total,
            shippingAddress: {
              street: formData.street,
              city: formData.city,
              postalCode: formData.zipCode || '',
              country: 'ישראל',
            },
            isGift,
            giftMessage: giftMessage || undefined,
            hasPassepartout,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'שגיאה ביצירת ההזמנה');

        // Skip PaymentModal — redirect directly to complete page
        const orderId = data.orderId || '';
        const orderNumber = data.orderNumber || '';
        setOrderId(orderId);
        router.push(`/create/complete?orderId=${orderId}&orderNumber=${orderNumber}&sandbox=true&email=${encodeURIComponent(formData.email)}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'שגיאה ביצירת ההזמנה';
        toast.error(message);
        setIsProcessing(false);
      }
      return;
    }

    try {
      // Build item data for order
      const paperLabel = paperType === 'matte' ? 'Matte' : paperType === 'glossy' ? 'Glossy' : 'Canvas';
      const frameLabel = frameType === 'none' ? 'ללא' : frameType === 'black' ? 'Black' : frameType === 'white' ? 'White' : 'Oak';
      const styleName = selectedStyle || 'Custom';

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
          items: [{
            name: `הדפסת ${styleName} - ${size}`,
            quantity: 1,
            price: total,
            imageUrl: transformedImage || originalImage || '',
            style: styleName,
            size,
            paper: paperLabel,
            frame: frameLabel,
          }],
          subtotal,
          shipping,
          total,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            postalCode: formData.zipCode || '',
            country: 'ישראל',
          },
          isGift,
          giftMessage: giftMessage || undefined,
          hasPassepartout,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה ביצירת התשלום');
      }

      // Show PayPlus payment in embedded modal
      setPaymentUrl(data.paymentUrl);
      setShowPaymentModal(true);
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

  const handlePaymentSuccess = useCallback((pageRequestUid: string, orderId?: string, orderNumber?: string) => {
    setShowPaymentModal(false);
    if (sandboxOrderContext) {
      router.push(`/create/complete?orderId=${sandboxOrderContext.orderId}&sandbox=true&email=${encodeURIComponent(sandboxOrderContext.email)}`);
    } else {
      const params = new URLSearchParams({ page_request_uid: pageRequestUid });
      if (orderId) params.set('orderId', orderId);
      if (orderNumber) params.set('orderNumber', orderNumber);
      router.push(`/create/complete?${params.toString()}`);
    }
  }, [router, sandboxOrderContext]);

  const handlePaymentFailure = useCallback((error: string) => {
    setShowPaymentModal(false);
    setPaymentUrl(null);
    setIsProcessing(false);
    toast.error(error);
  }, []);

  const handlePaymentClose = useCallback(() => {
    setShowPaymentModal(false);
    setPaymentUrl(null);
    setIsProcessing(false);
  }, []);

  // Show loading state while hydrating or if no image
  if (!_hasHydrated || !originalImage) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-sm text-zinc-500">טוען...</p>
        </div>
      </main>
    );
  }

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-sm text-zinc-500">בודק התחברות...</p>
        </div>
      </main>
    );
  }

  // Show auth flow if not authenticated and not guest
  if (showAuthFlow) {
    return (
      <main className="min-h-screen bg-white" dir="rtl">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center text-zinc-600 rounded-xl"
              aria-label="חזרה"
            >
              <ArrowRight className="w-6 h-6" />
            </button>

            <h1 className="text-[17px] font-semibold text-zinc-900">התחברות</h1>

            <div className="w-10" />
          </div>
        </header>

        {/* Auth Flow Content */}
        <div className="max-w-lg mx-auto px-4 py-12">
          <CheckoutAuthFlow
            onAuthComplete={handleAuthComplete}
          />
        </div>
      </main>
    );
  }

  // Calculate price (simplified)
  const sizes: Record<string, number> = { A5: 89, A4: 129, A3: 179, A2: 249 };
  const paperMods: Record<string, number> = { matte: 0, glossy: 20, canvas: 50 };
  const framePrices: Record<string, number> = { none: 0, black: 79, white: 79, oak: 99 };

  const basePrice = sizes[size] || 129;
  const paperMod = paperMods[paperType] || 0;
  const framePrice = framePrices[frameType] || 0;
  const wrappingPrice = giftWrap ? GIFT_WRAPPING_PRICE : 0;
  const subtotal = basePrice + paperMod + framePrice + wrappingPrice;
  const shipping = subtotal >= 299 ? 0 : 29;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-white pb-40">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
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

      {/* Progress Steps */}
      <div className="border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-1">
            {[
              { key: 'upload', label: 'העלאה' },
              { key: 'style', label: 'סגנון' },
              { key: 'tweak', label: 'עריכה' },
              { key: 'customize', label: 'התאמה' },
              { key: 'payment', label: 'תשלום' },
            ].map((step, i) => {
              const isCompleted = i < 4; // Steps 0-3 are completed
              const isActive = i === 4; // Step 4 (payment) is active
              return (
                <div key={step.key} className="flex items-center gap-1" data-step={step.key} data-completed={isCompleted ? 'true' : undefined} data-active={isActive ? 'true' : undefined}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isCompleted ? 'bg-violet-600 text-white' : isActive ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-500'}
                  `}>
                    {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:inline ${isCompleted || isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    {step.label}
                  </span>
                  {i < 4 && (
                    <div className={`w-6 h-px mx-1 ${isCompleted ? 'bg-violet-600' : 'bg-zinc-300'}`} />
                  )}
                </div>
              );
            })}
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

          {/* Checkout Form */}
          <div className="order-1 lg:order-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
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

              {/* Gift Options */}
              <section className="border border-zinc-200 rounded-xl overflow-hidden">
                {/* Gift Toggle Header */}
                <button
                  type="button"
                  onClick={() => setIsGift(!isGift)}
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
                              onClick={() => setGiftOccasion(isSelected ? null : occasion.id)}
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
                        onChange={(e) => setGiftMessage(e.target.value.slice(0, 150))}
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
                        onChange={(e) => setHideGiftPrice(e.target.checked)}
                        className="w-5 h-5 rounded border-zinc-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-sm text-zinc-700">הסתר מחיר מהנמען</span>
                    </label>
                  </div>
                )}
              </section>

              {/* Gift Wrapping Option */}
              <GiftWrappingOption />

              {/* Payment Method */}
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-purple" />
                  אמצעי תשלום
                </h2>
                <div className="space-y-2.5">
                  {([
                    { id: 'applePay' as const, label: 'Apple Pay', icon: (
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C4.24 16.7 4.89 10.55 8.8 10.31c1.28.07 2.15.72 2.92.76.93-.19 1.82-.86 2.82-.78 1.19.1 2.09.58 2.68 1.49-2.44 1.46-1.86 4.67.38 5.57-.46 1.17-.67 1.7-1.55 2.93ZM12.05 10.23c-.15-2.38 1.79-4.38 4.04-4.53.32 2.64-2.38 4.62-4.04 4.53Z" />
                      </svg>
                    ) },
                    { id: 'googlePay' as const, label: 'Google Pay', icon: (
                      <svg className="w-7 h-7" viewBox="-6 -6 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" fill="black" />
                      </svg>
                    ) },
                    { id: 'creditCard' as const, label: 'כרטיס אשראי', icon: <CreditCard className="w-6 h-6 text-zinc-500" /> },
                  ]).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-right transition-all ${
                        paymentMethod === method.id
                          ? 'border-violet-500 bg-violet-500/5'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === method.id ? 'border-violet-500' : 'border-zinc-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-zinc-900">{method.label}</div>
                      </div>
                      {method.icon}
                    </button>
                  ))}
                </div>
              </section>

              <p className="text-xs text-zinc-500 text-center">
                בלחיצה על כפתור התשלום אתם מאשרים את <a href="/terms" className="underline">התקנון</a> ו<a href="/privacy" className="underline">מדיניות הפרטיות</a>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto">
          {/* Price summary */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-600">סה״כ</span>
            <span className="text-2xl font-bold text-zinc-900">
              ₪{total} {shipping > 0 && <span className="text-sm font-normal text-zinc-500">+ ₪{shipping} משלוח</span>}
              {shipping === 0 && <span className="text-sm font-normal text-green-600">משלוח חינם!</span>}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:shadow-xl hover:shadow-violet-500/25 active:scale-[0.98] disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>מעבד תשלום...</span>
              </>
            ) : (
              <span>לתשלום ₪{total}</span>
            )}
          </button>
        </div>
      </div>

      {/* PayPlus Payment Modal */}
      {showPaymentModal && paymentUrl && (
        <PaymentModal
          paymentUrl={paymentUrl}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={handlePaymentClose}
        />
      )}
    </main>
  );
}

function CheckoutPageFallback() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
        <p className="text-zinc-500">טוען...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageFallback />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
