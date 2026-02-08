'use client';

import { use } from 'react';
import { OrderDetailView } from '@/components/account/OrderDetailView';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
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
  const { id } = use(params);
  return <OrderDetailView orderId={id} />;
}
