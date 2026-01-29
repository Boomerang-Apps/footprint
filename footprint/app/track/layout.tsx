/**
 * Order Tracking Layout
 *
 * Layout for order tracking pages with RTL support
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Tracking | Footprint',
  description: 'Track your Footprint orders and delivery status',
};

interface TrackLayoutProps {
  children: React.ReactNode;
}

export default function TrackLayout({ children }: TrackLayoutProps) {
  return (
    <div className="min-h-screen bg-background" dir="auto">
      {/* Simple layout - inherits from root layout */}
      {children}
    </div>
  );
}