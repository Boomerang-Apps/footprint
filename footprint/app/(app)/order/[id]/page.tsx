'use client'

import { Suspense } from 'react'
import { OrderTrackingContent } from './OrderTrackingContent'
import { Loader2 } from 'lucide-react'

// Fallback component for loading state
function OrderTrackingFallback() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-sm text-zinc-500">טוען פרטי הזמנה...</p>
      </div>
    </div>
  )
}

// Main page component
export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<OrderTrackingFallback />}>
      <OrderTrackingContent />
    </Suspense>
  )
}