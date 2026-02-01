'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Truck,
  MapPin,
  ExternalLink,
  Loader2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Download,
  XCircle
} from 'lucide-react'
import { OrderTimeline } from '@/components/ui/OrderTimeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Types based on the API response structure
interface OrderDetailItem {
  id: string
  originalImageUrl: string
  transformedImageUrl: string | null
  style: string
  size: string
  paperType: string
  frameType: string
  quantity: number
  basePrice: number
  paperAddon: number
  frameAddon: number
  itemTotal: number
}

interface OrderDetailResponse {
  id: string
  orderNumber: string
  status: 'pending' | 'paid' | 'processing' | 'printing' | 'shipped' | 'delivered' | 'cancelled'
  statusLabel: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  taxAmount: number
  total: number
  isGift: boolean
  giftMessage: string | null
  giftWrap: boolean
  shippingAddress: {
    name?: string
    fullName?: string
    phone?: string
    email?: string
    street?: string
    apartment?: string
    city?: string
    postalCode?: string
    country?: string
  } | null
  trackingNumber: string | null
  trackingUrl: string | null
  carrier: string | null
  items: OrderDetailItem[]
  createdAt: string
  updatedAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  estimatedDeliveryDate?: string
}

export function OrderTrackingContent() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id as string

  const [order, setOrder] = useState<OrderDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError('מספר הזמנה לא נמצא')
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('הזמנה לא נמצאה או שאין לך הרשאה לצפות בה')
          } else if (response.status === 401) {
            setError('נדרש להתחבר כדי לצפות בפרטי ההזמנה')
          } else {
            setError('שגיאה בטעינת פרטי ההזמנה')
          }
          setLoading(false)
          return
        }

        const orderData: OrderDetailResponse = await response.json()
        setOrder(orderData)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('שגיאת רשת. נסה שנית מאוחר יותר')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const refetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/orders/${orderId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('הזמנה לא נמצאה או שאין לך הרשאה לצפות בה')
        } else if (response.status === 401) {
          setError('נדרש להתחבר כדי לצפות בפרטי ההזמנה')
        } else {
          setError('שגיאה בטעינת פרטי ההזמנה')
        }
        setLoading(false)
        return
      }

      const orderData: OrderDetailResponse = await response.json()
      setOrder(orderData)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('שגיאת רשת. נסה שנית מאוחר יותר')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'paid':
        return 'info'
      case 'processing':
      case 'printing':
        return 'brand'
      case 'shipped':
        return 'info'
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price == null) return '₪0.00'
    return `₪${price.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50" dir="rtl">
        <div className="max-w-[550px] mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/account/orders"
              className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
            >
              <ChevronRight className="h-4 w-4" />
              חזרה להזמנות
            </Link>
            <Link href="/" className="flex-shrink-0">
              <img
              src="/footprint-logo-black-v2.svg"
              alt="פוטפרינט"
              className="h-12 w-auto"
            />
            </Link>
          </div>

          {/* Loading content */}
          <div className="space-y-6">
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-900 mx-auto mb-4" />
              <p className="text-sm text-zinc-500">טוען פרטי הזמנה...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-50" dir="rtl">
        <div className="max-w-[550px] mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/account/orders"
              className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
            >
              <ChevronRight className="h-4 w-4" />
              חזרה להזמנות
            </Link>
            <Link href="/" className="flex-shrink-0">
              <img
              src="/footprint-logo-black-v2.svg"
              alt="פוטפרינט"
              className="h-12 w-auto"
            />
            </Link>
          </div>

          {/* Error content */}
          <Card className="bg-white border-zinc-200">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-zinc-900 mb-2">
                שגיאה בטעינת ההזמנה
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                {error || 'הזמנה לא נמצאה'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={refetchOrderDetails}>
                  נסה שנית
                </Button>
                <Button asChild>
                  <Link href="/account/orders">חזרה להזמנות</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-zinc-50" dir="rtl">
      <div className="max-w-[550px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/account/orders"
            className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            חזרה להזמנות
          </Link>
          <Link href="/" className="flex-shrink-0">
            <img
              src="/footprint-logo-black-v2.svg"
              alt="פוטפרינט"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">
            מעקב הזמנה #{order.orderNumber}
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {order.statusLabel}
            </Badge>
            <span className="text-xs text-zinc-500">
              נוצרה ב-{formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Order Timeline */}
        <Card className="bg-white border-zinc-200 mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-900">
              סטטוס ההזמנה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline
              currentStatus={order.status}
              locale="he"
              layout="horizontal"
            />
          </CardContent>
        </Card>

        {/* Tracking Information */}
        {order.trackingNumber && (
          <Card className="bg-white border-zinc-200 mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                מידע משלוח
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">מספר מעקב:</span>
                <span className="text-sm font-medium text-zinc-900">
                  {order.trackingNumber}
                </span>
              </div>
              {order.carrier && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">חברת שילוח:</span>
                  <span className="text-sm font-medium text-zinc-900">
                    {order.carrier}
                  </span>
                </div>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`מעקב משלוח באתר ${order.carrier || 'חברת השילוח'}`}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>עקוב אחר המשלוח</span>
                </a>
              )}
              {order.estimatedDeliveryDate && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      משלוח צפוי: {formatDate(order.estimatedDeliveryDate)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card className="bg-white border-zinc-200 mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-900">
              פריטי ההזמנה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-zinc-100 last:border-b-0 last:pb-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-100">
                    <Image
                      src={item.transformedImageUrl || item.originalImageUrl}
                      alt={`פריט ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          הדפסה אישית
                        </p>
                        <div className="text-xs text-zinc-500 space-y-0.5">
                          <div>סגנון: {item.style}</div>
                          <div>גודל: {item.size}</div>
                          <div>נייר: {item.paperType}</div>
                          {item.frameType !== 'no_frame' && (
                            <div>מסגרת: {item.frameType}</div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-zinc-900">
                        {formatPrice(item.itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="bg-white border-zinc-200 mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-900">
              סיכום ההזמנה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">סכום ביניים:</span>
                <span className="text-zinc-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">משלוח:</span>
                <span className="text-zinc-900">{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">הנחה:</span>
                  <span className="text-emerald-500">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">מע&quot;מ:</span>
                  <span className="text-zinc-900">{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-zinc-900">סה&quot;כ:</span>
                  <span className="text-lg font-bold text-zinc-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <Card className="bg-white border-zinc-200 mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                כתובת משלוח
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="font-medium text-zinc-900">
                  {order.shippingAddress.name || order.shippingAddress.fullName || ''}
                </div>
                <div className="text-zinc-500">
                  {order.shippingAddress.street}
                  {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                </div>
                <div className="text-zinc-500">
                  {order.shippingAddress.city}{order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                </div>
                {order.shippingAddress.country && (
                  <div className="text-zinc-500">{order.shippingAddress.country}</div>
                )}
                {order.shippingAddress.phone && (
                  <div className="text-zinc-500">{order.shippingAddress.phone}</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gift Information */}
        {order.isGift && (
          <Card className="bg-white border-zinc-200 mb-6">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-zinc-900">
                פרטי מתנה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.giftWrap && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-zinc-900" />
                    <span className="text-zinc-900">הזמנה כוללת אריזת מתנה</span>
                  </div>
                )}
                {order.giftMessage && (
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">הודעת מתנה:</div>
                    <div className="text-sm text-zinc-900 bg-zinc-50 rounded-lg p-3">
                      {order.giftMessage}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mt-6">
          {/* Download Image Button - show if order has any images */}
          {order.items.length > 0 && (
            <Button
              onClick={() => {
                // Download the transformed image if available, otherwise original
                const item = order.items[0]
                const imageUrl = item?.transformedImageUrl || item?.originalImageUrl
                if (imageUrl) {
                  window.open(imageUrl, '_blank')
                }
              }}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-xl"
            >
              <Download className="h-5 w-5 ml-2" />
              הורד תמונה
            </Button>
          )}

          {/* Cancel Order Button - only show for pending/processing orders */}
          {['pending', 'paid', 'processing'].includes(order.status) && (
            <Button
              onClick={() => {
                if (confirm('האם אתה בטוח שברצונך לבטל את ההזמנה?')) {
                  // TODO: Implement cancel order API
                  alert('פונקציונליות ביטול הזמנה תתווסף בקרוב')
                }
              }}
              variant="outline"
              className="w-full border-zinc-300 text-zinc-900 hover:bg-zinc-100 py-3 rounded-xl"
            >
              <XCircle className="h-5 w-5 ml-2" />
              בטל הזמנה
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}