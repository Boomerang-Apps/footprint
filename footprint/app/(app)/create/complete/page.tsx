'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Sparkles,
  Check,
  Package,
  Truck,
  Clock,
  Home,
  Plus,
  Copy,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface OrderConfirmation {
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  whatsappUrl: string;
}

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

const PAPER_NAMES: Record<string, string> = {
  matte: 'Fine Art Matte',
  glossy: 'Glossy Photo',
  canvas: 'Canvas',
};

const FRAME_NAMES: Record<string, string> = {
  none: 'ללא מסגרת',
  black: 'מסגרת שחורה',
  white: 'מסגרת לבנה',
  oak: 'מסגרת אלון',
};

interface TimelineStep {
  label: string;
  status: 'completed' | 'active' | 'pending';
  icon: typeof Check;
}

function formatOrderId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FP-${year}-${random}`;
}

function getEstimatedDelivery(): string {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() + 5);
  const end = new Date(today);
  end.setDate(end.getDate() + 7);

  const formatDate = (d: Date) => {
    return `${d.getDate()} ב${getHebrewMonth(d.getMonth())}`;
  };

  return `${formatDate(start)}-${end.getDate()}`;
}

function getHebrewMonth(month: number): string {
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
  ];
  return months[month];
}

function CompletePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const isSandbox = searchParams?.get('sandbox') === 'true';
  const emailFromParams = searchParams?.get('email');

  const {
    originalImage,
    transformedImage,
    selectedStyle,
    size,
    paperType,
    frameType,
    shippingAddress,
    isGift,
    pricing,
    reset,
  } = useOrderStore();

  // API state
  const [orderData, setOrderData] = useState<OrderConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(!!orderId && !isSandbox);
  const [error, setError] = useState<string | null>(null);

  // Fetch order from API if orderId provided (skip in sandbox mode)
  useEffect(() => {
    if (!orderId || isSandbox) {
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/orders/${orderId}/confirm`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order');
        }

        setOrderData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch order';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isSandbox]);

  // Use API data or fallback to generated/store data
  const orderNumber = orderData?.orderNumber || formatOrderId();
  const orderTotal = orderData?.total || pricing?.total || 209;
  const whatsappUrlFromApi = orderData?.whatsappUrl;
  const estimatedDelivery = getEstimatedDelivery();

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#7c3aed', '#ec4899', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const timelineSteps: TimelineStep[] = [
    { label: 'התקבלה', status: 'completed', icon: Check },
    { label: 'בהכנה', status: 'active', icon: Sparkles },
    { label: 'נשלחה', status: 'pending', icon: Truck },
    { label: 'הגיעה', status: 'pending', icon: Check },
  ];

  const handleHome = () => {
    router.push('/');
  };

  const handleNewOrder = () => {
    reset();
    router.push('/create');
  };

  const handleCopyLink = async () => {
    try {
      const orderUrl = `${window.location.origin}/order/${orderNumber}`;
      await navigator.clipboard.writeText(orderUrl);
      toast.success('הקישור הועתק!');
    } catch {
      toast.error('לא ניתן להעתיק');
    }
  };

  const handleWhatsAppShare = () => {
    if (whatsappUrlFromApi) {
      window.open(whatsappUrlFromApi, '_blank');
    } else {
      const text = `הזמנתי יצירה מדהימה מ-Footprint! 🎨 מספר הזמנה: ${orderNumber}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleFacebookShare = () => {
    const url = `${window.location.origin}/order/${orderNumber}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const styleName = STYLE_NAMES[selectedStyle || 'pop_art'] || 'פופ ארט';
  const paperName = PAPER_NAMES[paperType || 'matte'] || 'Fine Art Matte';
  const frameName = FRAME_NAMES[frameType || 'none'] || 'ללא מסגרת';
  const displayImage = transformedImage || originalImage || '';
  const customerEmail = emailFromParams || 'your@email.com';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div data-testid="loading-skeleton" className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
          <p className="text-zinc-500">טוען פרטי הזמנה...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-md text-center">
          <div
            data-testid="error-message"
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mb-2">לא ניתן לטעון את ההזמנה</h1>
          <p className="text-zinc-500 mb-6">{error}</p>
          <button
            onClick={handleHome}
            className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-700 py-3 px-6 rounded-xl font-semibold mx-auto"
          >
            <Home className="w-5 h-5" />
            לדף הבית
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header role="banner" className="bg-white border-b border-zinc-200 py-3.5 px-4">
        <div className="max-w-[600px] mx-auto flex items-center justify-center">
          <Image
            src="/footprint-logo-black-v2.svg"
            alt="Footprint"
            width={140}
            height={32}
            priority
          />
        </div>
      </header>

      {/* Main Content */}
      <main role="main" dir="rtl" className="max-w-[550px] mx-auto px-4 py-6 pb-32">
        {/* Success Hero */}
        <div className="bg-white border border-zinc-200 rounded-[20px] p-8 text-center mb-4">
          {/* Sandbox Badge */}
          {isSandbox && (
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <span>🧪</span>
              <span>מצב סנדבוקס - לא בוצע חיוב</span>
            </div>
          )}

          <div
            data-testid="success-icon"
            className="w-[72px] h-[72px] bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-[scaleIn_0.5s_ease]"
          >
            <Check className="w-9 h-9 text-emerald-500" />
          </div>
          <h1 className="text-[22px] font-bold text-zinc-900 mb-1.5">
            ההזמנה בוצעה בהצלחה! 🎉
          </h1>
          <p className="text-sm text-zinc-500 mb-2">
            אישור נשלח למייל {customerEmail}
          </p>

          {/* Gift notification */}
          {isGift && (
            <p className="text-sm text-violet-600 mb-4">
              🎁 נעדכן אותך כשהמתנה תישלח!
            </p>
          )}

          <div
            data-testid="order-number"
            className="inline-flex items-center gap-1.5 bg-zinc-50 px-[18px] py-2.5 rounded-full text-sm text-zinc-600"
          >
            <span>מספר הזמנה:</span>
            <strong className="text-violet-600 font-bold tracking-wide">{orderNumber}</strong>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden mb-4">
          <div
            data-testid="order-card-header"
            className="px-4 py-3.5 border-b border-zinc-100 flex items-center gap-2"
          >
            <Package className="w-[18px] h-[18px] text-violet-600" />
            <span className="text-sm font-semibold">פרטי ההזמנה</span>
          </div>
          <div className="p-4 flex gap-3.5">
            <div
              data-testid="order-thumb"
              className="w-16 h-16 rounded-[10px] overflow-hidden flex-shrink-0 bg-zinc-100"
            >
              {displayImage && (
                <Image
                  src={displayImage}
                  alt="התמונה"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-zinc-900 mb-1">
                פורטרט בסגנון {styleName}
              </div>
              <div data-testid="order-specs" className="text-xs text-zinc-500 leading-relaxed">
                {size} • {paperName} • {frameName}
              </div>
              <div data-testid="order-price" className="text-base font-bold text-zinc-900 mt-1.5">
                ₪{orderTotal}
              </div>
            </div>
          </div>
          <div
            data-testid="delivery-section"
            className="px-4 py-3.5 border-t border-zinc-100 flex items-center gap-3"
          >
            <div
              data-testid="delivery-icon"
              className="w-10 h-10 bg-violet-100/50 rounded-[10px] flex items-center justify-center flex-shrink-0"
            >
              <Truck className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-zinc-900 mb-0.5">משלוח עד הבית</div>
              <div className="text-xs text-zinc-500">הגעה משוערת: {estimatedDelivery}</div>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div data-testid="timeline-card" className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-[18px] h-[18px] text-violet-600" />
            <span className="text-sm font-semibold">סטטוס ההזמנה</span>
          </div>
          <div className="relative flex justify-between">
            {/* Progress line */}
            <div className="absolute top-3.5 right-10 left-10 h-0.5 bg-zinc-200" />
            {timelineSteps.map((step, index) => (
              <div
                key={index}
                data-testid={`timeline-step-${index}`}
                data-status={step.status}
                className="flex flex-col items-center gap-2 relative z-10"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-emerald-500'
                      : step.status === 'active'
                        ? 'bg-violet-600 animate-pulse'
                        : 'bg-zinc-200'
                  }`}
                >
                  <step.icon
                    className={`w-3.5 h-3.5 ${
                      step.status === 'pending' ? 'text-zinc-400' : 'text-white'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] text-center max-w-[60px] ${
                    step.status !== 'pending' ? 'text-zinc-700 font-medium' : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Share Card */}
        <div
          data-testid="share-card"
          className="bg-gradient-to-br from-violet-600/5 to-pink-500/5 border border-violet-600/15 rounded-2xl p-5 text-center mb-4"
        >
          <div className="text-sm font-semibold text-zinc-900 mb-1.5">שתפו את הרגע!</div>
          <div className="text-xs text-zinc-500 mb-3.5">ספרו לחברים על היצירה המדהימה שלכם</div>
          <div className="flex justify-center gap-2.5">
            <button
              data-testid="share-whatsapp"
              onClick={handleWhatsAppShare}
              className="w-11 h-11 rounded-xl bg-[#25d366] flex items-center justify-center text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
            <button
              data-testid="share-facebook"
              onClick={handleFacebookShare}
              className="w-11 h-11 rounded-xl bg-[#1877f2] flex items-center justify-center text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button
              data-testid="share-copy"
              onClick={handleCopyLink}
              className="w-11 h-11 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-600"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <div
        data-testid="bottom-cta"
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-[550px] mx-auto flex gap-3">
          <button
            onClick={handleHome}
            className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-100 text-zinc-700 py-3.5 px-4 rounded-xl font-semibold text-sm"
          >
            <Home className="w-[18px] h-[18px]" />
            לדף הבית
          </button>
          <button
            onClick={handleNewOrder}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white py-3.5 px-4 rounded-xl font-semibold text-sm shadow-md"
          >
            <Plus className="w-[18px] h-[18px]" />
            הזמנה נוספת
          </button>
        </div>
      </div>
    </div>
  );
}

function CompletePageFallback() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
        <p className="text-zinc-500">טוען...</p>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<CompletePageFallback />}>
      <CompletePageContent />
    </Suspense>
  );
}
