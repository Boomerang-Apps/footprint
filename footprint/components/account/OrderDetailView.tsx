'use client';

/**
 * OrderDetailView
 *
 * Displays complete order information with hero section, progress bar,
 * vertical timeline, product details, and payment summary.
 *
 * @story ORD-01
 * @acceptance-criteria AC-011 through AC-018
 */

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Package,
  MapPin,
  CreditCard,
  MessageCircle,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  Truck,
  Heart,
} from 'lucide-react';
import { useOrder } from '@/hooks/useOrderHistory';
import { useOrderStore } from '@/stores/orderStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { OrderTimeline } from './OrderTimeline';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { cn, formatOrderDate } from '@/lib/utils';
import { getStyleById } from '@/lib/ai/styles-ui';
import type { Order } from '@/types';
import type { StyleType } from '@/types/product';

interface OrderDetailViewProps {
  orderId: string;
}

// Frame translations
const frameTranslations: Record<string, string> = {
  none: 'ללא מסגרת',
  black: 'מסגרת שחורה',
  white: 'מסגרת לבנה',
  oak: 'מסגרת אלון',
};

// Paper translations
const paperTranslations: Record<string, string> = {
  matte: 'נייר מט',
  glossy: 'נייר מבריק',
  canvas: 'קנבס',
  fine_art: 'נייר אמנות',
};

// Format order number
const formatOrderNumber = (orderId: string): string => {
  if (orderId.startsWith('FP-')) return orderId;
  const orderNum = orderId.replace(/[^0-9]/g, '').padStart(6, '0');
  return `#FP-${orderNum}`;
};

// Progress percentage based on status
const getProgressPercentage = (status: Order['status']): number => {
  switch (status) {
    case 'pending': return 0;
    case 'paid': return 10;
    case 'processing': return 25;
    case 'printing': return 50;
    case 'shipped': return 75;
    case 'delivered': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};

// Estimate delivery date: createdAt + 7 business days (skip Fri/Sat for Israel)
function estimateDelivery(createdAt: Date): string {
  const date = new Date(createdAt);
  let businessDays = 0;
  while (businessDays < 7) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    // Skip Friday (5) and Saturday (6) for Israel
    if (day !== 5 && day !== 6) {
      businessDays++;
    }
  }
  return formatOrderDate(date);
}

export function OrderDetailView({ orderId }: OrderDetailViewProps): React.ReactElement {
  const router = useRouter();
  const orderStore = useOrderStore();
  const { isFavorite, addFavorite, removeFavorite, favorites } = useFavoritesStore();

  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);

  const handleBackClick = () => {
    router.push('/account/orders');
  };

  const handleReorder = () => {
    if (!order) return;

    const primaryItem = order.items?.[0];
    if (!primaryItem) return;

    orderStore.reset();
    orderStore.setOriginalImage(primaryItem.originalImageUrl);
    if (primaryItem.transformedImageUrl) {
      orderStore.setTransformedImage(primaryItem.transformedImageUrl);
    }
    orderStore.setSelectedStyle(primaryItem.style);
    orderStore.setSize(primaryItem.size);
    orderStore.setPaperType(primaryItem.paperType);
    orderStore.setFrameType(primaryItem.frameType);

    if (order.isGift) {
      orderStore.setIsGift(true);
      if (order.giftMessage) {
        orderStore.setGiftMessage(order.giftMessage);
      }
    }

    orderStore.setStep('customize');
    router.push('/create/customize');
  };

  const handleTrackShipment = () => {
    if (!order || !order.trackingNumber) return;

    const trackingUrl = order.carrier === 'fedex'
      ? `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`
      : order.carrier === 'dhl'
        ? `https://www.dhl.com/il-en/home/tracking.html?tracking-id=${order.trackingNumber}`
        : `https://israelpost.co.il/itemtrace?itemcode=${order.trackingNumber}`;

    window.open(trackingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleContactSupport = () => {
    router.push(`/support?order=${orderId}`);
  };

  const handleFavoriteToggle = () => {
    if (!order) return;
    const primaryItem = order.items?.[0];
    if (!primaryItem) return;

    const imgUrl = primaryItem.transformedImageUrl || primaryItem.originalImageUrl;
    const styleInfo = getStyleById(primaryItem.style as StyleType);

    if (isFavorite(imgUrl)) {
      const fav = favorites.find((f) => f.imageUrl === imgUrl);
      if (fav) removeFavorite(fav.id);
    } else {
      addFavorite({
        imageUrl: imgUrl,
        originalImageUrl: primaryItem.originalImageUrl,
        style: primaryItem.style as StyleType,
        styleName: styleInfo?.nameHe || primaryItem.style,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-[800px] mx-auto">
            <button
              onClick={handleBackClick}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100"
              aria-label="חזרה"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="w-10 h-10" />
          </div>
        </header>
        <main className="max-w-[800px] mx-auto p-4 space-y-4">
          <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl p-6 h-32 animate-pulse" />
          <div className="bg-white rounded-2xl p-6 h-48 animate-pulse" />
        </main>
      </div>
    );
  }

  // Error state
  if (isError || !order) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-[800px] mx-auto">
            <button
              onClick={handleBackClick}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100"
              aria-label="חזרה"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">פרטי הזמנה</h1>
            <div className="w-10 h-10" />
          </div>
        </header>
        <main className="max-w-[800px] mx-auto p-4">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              הזמנה לא נמצאה
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm">
              {error?.message || 'לא הצלחנו למצוא את ההזמנה המבוקשת. ייתכן שהיא נמחקה או שהקישור שגוי.'}
            </p>
            <div className="flex gap-3">
              <Button onClick={handleBackClick} variant="outline">
                חזרה להזמנות
              </Button>
              <Button onClick={() => refetch()}>
                <RotateCcw className="h-4 w-4 ml-2" />
                נסה שוב
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const primaryItem = order.items?.[0];
  const styleInfo = primaryItem ? getStyleById(primaryItem.style as StyleType) : undefined;
  const imageUrl = primaryItem?.transformedImageUrl || primaryItem?.originalImageUrl;
  const hasTracking = !!order.trackingNumber;
  const progressPercent = getProgressPercentage(order.status);
  const isFav = imageUrl ? isFavorite(imageUrl) : false;

  return (
    <div className="min-h-screen bg-gray-50 pb-8" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-[800px] mx-auto">
          <button
            data-testid="back-button"
            onClick={handleBackClick}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="חזרה"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            פרטי הזמנה
          </h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 space-y-4 pt-4">
        {/* AC-011: Hero Section */}
        <div
          data-testid="order-hero"
          className={cn(
            'relative rounded-2xl overflow-hidden bg-gradient-to-br p-6',
            styleInfo?.gradient || 'from-purple-500 to-pink-500'
          )}
        >
          <div className="flex items-start justify-between">
            {/* Order image */}
            {imageUrl && (
              <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={imageUrl}
                  alt={styleInfo?.nameHe || 'תמונת הזמנה'}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* AC-012: Favorite toggle */}
            <button
              data-testid="favorite-toggle"
              onClick={handleFavoriteToggle}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label={isFav ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            >
              <Heart
                className={cn(
                  'h-5 w-5',
                  isFav ? 'fill-red-500 text-red-500' : 'text-white'
                )}
              />
            </button>
          </div>

          {/* Status badge on hero */}
          <div className="mt-4">
            <OrderStatusBadge status={order.status} size="md" />
          </div>
        </div>

        {/* Order Info Section */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {formatOrderNumber(order.id)}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatOrderDate(order.createdAt)}
                </p>
              </div>
              <PriceDisplay
                amount={order.total}
                size="lg"
                locale="he"
                color="success"
              />
            </div>
          </CardContent>
        </Card>

        {/* AC-013: Progress Bar Card */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-base font-semibold text-gray-900">
              התקדמות ההזמנה
            </h3>
          </CardHeader>
          <CardContent>
            <div data-testid="progress-bar" className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{progressPercent}%</span>
                <span>
                  משלוח משוער: {estimateDelivery(order.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AC-014: Vertical Timeline Card */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              מעקב הזמנה
            </h3>
          </CardHeader>
          <CardContent>
            <OrderTimeline order={order} />
          </CardContent>
        </Card>

        {/* Tracking Number Card */}
        {hasTracking && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Truck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">מספר מעקב</p>
                    <p className="text-sm text-gray-500">{order.trackingNumber}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTrackShipment}
                  className="flex items-center gap-2"
                >
                  עקוב
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AC-015: Product Details Card */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">
              פרטי המוצר
            </h3>
          </CardHeader>
          <CardContent>
            {primaryItem ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">סגנון אמנות</span>
                  <span className="font-medium text-gray-900">
                    {styleInfo?.nameHe || primaryItem.style}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">גודל הדפס</span>
                  <span className="font-medium text-gray-900">
                    {primaryItem.size}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">סוג נייר</span>
                  <span className="font-medium text-gray-900">
                    {paperTranslations[primaryItem.paperType] || primaryItem.paperType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">מסגרת</span>
                  <span className="font-medium text-gray-900">
                    {frameTranslations[primaryItem.frameType] || primaryItem.frameType}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">אין פרטי מוצר זמינים</p>
            )}
          </CardContent>
        </Card>

        {/* AC-016: Price Breakdown Card */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              פירוט מחיר
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">סכום ביניים</span>
                <PriceDisplay amount={order.subtotal || order.total} locale="he" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">משלוח</span>
                <PriceDisplay amount={order.shipping || 0} locale="he" />
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>הנחה</span>
                  <span>-<PriceDisplay amount={order.discount} locale="he" /></span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>סה״כ</span>
                  <PriceDisplay amount={order.total} size="lg" locale="he" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address Card */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              כתובת למשלוח
            </h3>
          </CardHeader>
          <CardContent>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                </p>
                {order.shippingAddress.phone && (
                  <p className="mt-2 text-gray-500">{order.shippingAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">כתובת לא זמינה</p>
            )}
          </CardContent>
        </Card>

        {/* AC-017: Action Buttons - 2 side-by-side */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button
            onClick={handleReorder}
            className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            הזמן שוב
          </Button>
          <Button
            variant="outline"
            onClick={handleContactSupport}
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            צור קשר
          </Button>
        </div>
      </main>
    </div>
  );
}

OrderDetailView.displayName = 'OrderDetailView';
