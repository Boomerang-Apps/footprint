'use client';

/**
 * OrderDetailView
 *
 * Displays complete order information including items, shipping details,
 * payment summary, and delivery timeline.
 *
 * @story UA-02
 * @acceptance-criteria AC-001 through AC-015
 */

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Package,
  MapPin,
  CreditCard,
  Gift,
  Download,
  MessageCircle,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  Loader2,
  Home,
  Truck,
} from 'lucide-react';
import { useOrder } from '@/hooks/useOrderHistory';
import { useOrderStore } from '@/stores/orderStore';
import { OrderTimeline } from './OrderTimeline';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { cn, formatOrderDate } from '@/lib/utils';
import type { Order, OrderItem } from '@/types';

interface OrderDetailViewProps {
  orderId: string;
}

// Style translations to Hebrew
const styleTranslations: Record<string, string> = {
  avatar_cartoon: 'אווטר קריקטורה',
  watercolor: 'צבעי מים',
  oil_painting: 'ציור שמן',
  line_art: 'ציור קווי',
  line_art_watercolor: 'קווי + צבעי מים',
  original: 'מקורי משופר',
  pop_art: 'פופ ארט',
  comic: 'קומיקס',
  romantic: 'רומנטי',
  vintage: 'וינטאג׳',
};

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
  const orderNum = orderId.replace(/[^0-9]/g, '').padStart(3, '0');
  return `FP-2024-${orderNum}`;
};

export function OrderDetailView({ orderId }: OrderDetailViewProps): React.ReactElement {
  const router = useRouter();
  const orderStore = useOrderStore();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { data: order, isLoading, isError, error, refetch } = useOrder(orderId);

  const handleBackClick = () => {
    router.push('/account/orders');
  };

  const handleHomeClick = () => {
    router.push('/');
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

    // Use Israel Post tracking URL by default, or carrier-specific URL if carrier is known
    const trackingUrl = order.carrier === 'fedex'
      ? `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`
      : order.carrier === 'dhl'
        ? `https://www.dhl.com/il-en/home/tracking.html?tracking-id=${order.trackingNumber}`
        : `https://israelpost.co.il/itemtrace?itemcode=${order.trackingNumber}`;

    window.open(trackingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    // Trigger invoice download via API
    window.open(`/api/orders/${orderId}/invoice`, '_blank');
  };

  const handleContactSupport = () => {
    // Navigate to support with order context
    router.push(`/support?order=${orderId}`);
  };

  const handleImageClick = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
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
          {/* Skeleton loader */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
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

  const hasTracking = !!order.trackingNumber;
  const isPaid = order.paidAt !== null || (order.status !== 'pending' && order.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8" dir="rtl">
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
            {formatOrderNumber(order.id)}
          </h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="max-w-[800px] mx-auto px-4 py-3" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <button onClick={handleHomeClick} className="hover:text-gray-700">
              <Home className="h-4 w-4" />
            </button>
          </li>
          <li>/</li>
          <li>
            <button onClick={handleBackClick} className="hover:text-gray-700">
              הזמנות
            </button>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{formatOrderNumber(order.id)}</li>
        </ol>
      </nav>

      <main className="max-w-[800px] mx-auto px-4 space-y-4">
        {/* Order Header Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {formatOrderNumber(order.id)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatOrderDate(order.createdAt)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} size="md" />
            </div>
          </CardHeader>
        </Card>

        {/* Order Timeline */}
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

        {/* Tracking Info (if shipped) */}
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
                    <p className="text-sm text-gray-500">{order.trackingNumber || 'זמין'}</p>
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

        {/* Order Items */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900">
              פריטים ({order.items?.length || 0})
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items?.map((item, index) => (
              <OrderItemCard
                key={item.id || index}
                item={item}
                onImageClick={handleImageClick}
                hasPassepartout={order.hasPassepartout}
              />
            ))}
          </CardContent>
        </Card>

        {/* Gift Info (if gift order) */}
        {order.isGift && (
          <Card className="border-pink-200 bg-pink-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-pink-900">הזמנת מתנה</p>
                  {order.giftMessage && (
                    <p className="text-sm text-pink-700 mt-1">&quot;{order.giftMessage}&quot;</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping Address */}
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

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              סיכום תשלום
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

        {/* Actions */}
        <div className="space-y-3 pb-4">
          <Button
            onClick={handleReorder}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <RotateCcw className="h-4 w-4 ml-2" />
            הזמן שוב
          </Button>

          <div className="grid grid-cols-2 gap-3">
            {isPaid && (
              <Button
                variant="outline"
                onClick={handleDownloadInvoice}
                className="flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                הורד חשבונית
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleContactSupport}
              className={cn("flex items-center justify-center gap-2", !isPaid && "col-span-2")}
            >
              <MessageCircle className="h-4 w-4" />
              צור קשר
            </Button>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
            onClick={closeLightbox}
            aria-label="סגור"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <Image
            src={lightboxImage}
            alt="תמונה מוגדלת"
            width={800}
            height={800}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 lg:hidden">
        <div className="max-w-[500px] mx-auto flex justify-around">
          <button
            onClick={handleHomeClick}
            className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400 text-xs font-medium"
          >
            <Home className="h-5 w-5" />
            בית
          </button>
          <button
            onClick={handleBackClick}
            className="flex flex-col items-center gap-1 py-2 px-4 text-purple-600 text-xs font-medium"
          >
            <Package className="h-5 w-5" />
            הזמנות
          </button>
        </div>
      </nav>
    </div>
  );
}

// Order Item Card Sub-component
interface OrderItemCardProps {
  item: OrderItem;
  onImageClick: (url: string) => void;
  hasPassepartout?: boolean;
}

// Frame border colors for visual representation
const FRAME_COLORS: Record<string, string> = {
  black: '#1a1a1a',
  white: '#ffffff',
  oak: '#b8860b',
};

function getFrameStyle(frameType: string | undefined): React.CSSProperties {
  const color = FRAME_COLORS[frameType || ''];
  if (!color) return {};
  return {
    border: `4px solid ${color}`,
    ...(frameType === 'white' ? { boxShadow: '0 0 0 1px #e5e5e5' } : {}),
  };
}

function OrderItemCard({ item, onImageClick, hasPassepartout }: OrderItemCardProps): React.ReactElement {
  const imageUrl = item.transformedImageUrl || item.originalImageUrl;
  const hasFrame = item.frameType && item.frameType !== 'none';
  const frameStyle = getFrameStyle(item.frameType);
  const showPassepartout = hasPassepartout && hasFrame;

  return (
    <div className="flex gap-4 p-3 bg-gray-50 rounded-xl">
      <button
        onClick={() => onImageClick(imageUrl)}
        className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
      >
        <div
          className="overflow-hidden bg-gray-100"
          style={{
            borderRadius: hasFrame ? '2px' : '12px',
            ...frameStyle,
            ...(showPassepartout ? { padding: '4px', background: 'white' } : {}),
            width: showPassepartout ? '88px' : '80px',
            height: showPassepartout ? '121px' : '113px',
          }}
        >
          <Image
            src={imageUrl}
            alt={styleTranslations[item.style] || item.style}
            width={80}
            height={113}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900">
          {styleTranslations[item.style] || item.style}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {item.size} • {paperTranslations[item.paperType] || item.paperType}
        </p>
        <p className="text-xs text-gray-500">
          {frameTranslations[item.frameType] || item.frameType}{showPassepartout ? ' • פספרטו' : ''}
        </p>
        <div className="mt-2">
          <PriceDisplay amount={item.price} size="sm" locale="he" />
        </div>
      </div>
    </div>
  );
}

OrderDetailView.displayName = 'OrderDetailView';
