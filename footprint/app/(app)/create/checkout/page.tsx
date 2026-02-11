'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, MapPin, User, Loader2 } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import { CheckoutAuthFlow } from '@/components/checkout/CheckoutAuthFlow';
import { CheckoutProgressSteps } from '@/components/checkout/CheckoutProgressSteps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { GiftOptionsSection } from '@/components/checkout/GiftOptionsSection';
import { GiftWrappingOption } from '@/components/checkout/GiftWrappingOption';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { PaymentModal } from '@/components/checkout/PaymentModal';
import { GIFT_WRAPPING_PRICE } from '@/types/order';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

// Generate a unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `FP-${timestamp}-${random}`.toUpperCase();
}

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
    transformedImage,
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
      <CheckoutProgressSteps />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <OrderSummary
            originalImage={originalImage}
            size={size}
            paperType={paperType}
            frameType={frameType}
            isGift={isGift}
            giftWrap={giftWrap}
            basePrice={basePrice}
            paperMod={paperMod}
            framePrice={framePrice}
            wrappingPrice={wrappingPrice}
            shipping={shipping}
            total={total}
          />

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
              <GiftOptionsSection
                isGift={isGift}
                onToggleGift={setIsGift}
                giftOccasion={giftOccasion}
                onSetOccasion={setGiftOccasion}
                giftMessage={giftMessage}
                onSetMessage={setGiftMessage}
                hideGiftPrice={hideGiftPrice}
                onSetHidePrice={setHideGiftPrice}
              />

              {/* Gift Wrapping Option */}
              <GiftWrappingOption />

              {/* Payment Method */}
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />

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
