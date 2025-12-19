import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const heebo = Heebo({ 
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
});

export const metadata: Metadata = {
  title: 'Footprint | אמנות AI מותאמת אישית',
  description: 'הפכו תמונות לאמנות מודפסת באיכות מוזיאון. טרנספורמציית AI מיידית, משלוח מהיר.',
  keywords: ['הדפסת תמונות', 'אמנות AI', 'מתנות מותאמות אישית', 'פורטרט משפחתי'],
  authors: [{ name: 'Footprint' }],
  openGraph: {
    title: 'Footprint | אמנות AI מותאמת אישית',
    description: 'הפכו תמונות לאמנות מודפסת באיכות מוזיאון',
    url: 'https://footprint.co.il',
    siteName: 'Footprint',
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
      <body className="min-h-screen bg-black text-white font-heebo antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
