import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Footprint Cockpit',
  description: 'Development progress and agent coordination dashboard',
};

export default function CockpitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
