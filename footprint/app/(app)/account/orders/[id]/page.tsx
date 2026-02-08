'use client';

import { OrderDetailView } from '@/components/account/OrderDetailView';

interface OrderDetailPageProps {
  params: { id: string };
}

/**
 * Order Detail Page
 * Displays complete order information including items, shipping, payment, and timeline
 *
 * @story UA-02
 */
export default function OrderDetailPage({
  params,
}: OrderDetailPageProps): React.ReactElement {
  return <OrderDetailView orderId={params.id} />;
}
