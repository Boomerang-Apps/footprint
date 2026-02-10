import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { MobileBottomNav } from '@/components/layout';

const heebo = Heebo({ 
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
});

export const metadata: Metadata = {
  title: 'פוטפרינט | אמנות AI מהתמונות שלכם',
  description: 'הפכו תמונות לאמנות מודפסת באיכות מוזיאון. בינה מלאכותית הופכת כל תמונה ליצירת אמנות, משלוח מהיר.',
  keywords: ['הדפסת תמונות', 'אמנות AI', 'מתנות מותאמות אישית', 'פורטרט משפחתי', 'פוטפרינט'],
  authors: [{ name: 'פוטפרינט' }],
  openGraph: {
    title: 'פוטפרינט | אמנות AI מהתמונות שלכם',
    description: 'הפכו תמונות לאמנות מודפסת באיכות מוזיאון',
    url: 'https://footprint.co.il',
    siteName: 'פוטפרינט',
    locale: 'he_IL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-screen bg-white text-zinc-900 font-heebo antialiased pb-16 lg:pb-0">
        <Providers>
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
