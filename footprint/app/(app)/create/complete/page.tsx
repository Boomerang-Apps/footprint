'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Package, Mail, MessageCircle, Home, Sparkles } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import confetti from 'canvas-confetti';

export default function CompletePage() {
  const router = useRouter();
  const { shippingAddress, reset } = useOrderStore();

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#8b5cf6', '#ec4899', '#22d3ee'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleNewOrder = () => {
    reset();
    router.push('/create');
  };

  // Generate a mock order number
  const orderNumber = `FP-${Date.now().toString(36).toUpperCase()}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-pink rounded-xl flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-zinc-900">פוטפרינט</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-3">
          ההזמנה התקבלה בהצלחה!
        </h1>
        <p className="text-zinc-500 text-lg mb-8">
          תודה שבחרת בפוטפרינט. אנחנו מתחילים לעבוד על היצירה שלך.
        </p>

        {/* Order Number */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <div className="text-sm text-zinc-500 mb-1">מספר הזמנה</div>
          <div className="text-2xl font-bold text-zinc-900 font-mono">{orderNumber}</div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8 text-right">
          <h2 className="font-semibold text-zinc-900 mb-4">מה הלאה?</h2>
          <div className="space-y-4">
            {[
              {
                icon: Sparkles,
                title: 'עיבוד AI',
                desc: 'הבינה המלאכותית שלנו יוצרת את האמנות שלך',
                time: 'עכשיו',
                active: true,
              },
              {
                icon: Package,
                title: 'הדפסה ואריזה',
                desc: 'הדפסה איכותית על נייר פיין ארט',
                time: '1-2 ימי עסקים',
                active: false,
              },
              {
                icon: Mail,
                title: 'משלוח',
                desc: shippingAddress ? `נשלח לכתובת: ${shippingAddress.city}` : 'נשלח לכתובת שציינת',
                time: '3-5 ימי עסקים',
                active: false,
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${step.active ? 'bg-brand-purple text-white' : 'bg-zinc-100 text-zinc-400'}
                `}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${step.active ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {step.title}
                    </h3>
                    <span className="text-xs text-zinc-400">{step.time}</span>
                  </div>
                  <p className="text-sm text-zinc-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <Mail className="w-5 h-5" />
            <span className="font-medium">אישור נשלח לאימייל שלך</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-secondary py-3 px-6">
            <Home className="w-5 h-5" />
            <span>לדף הבית</span>
          </Link>
          <button onClick={handleNewOrder} className="btn btn-primary py-3 px-6">
            <Sparkles className="w-5 h-5" />
            <span>הזמנה חדשה</span>
          </button>
        </div>

        {/* WhatsApp Support */}
        <div className="mt-12 pt-8 border-t border-zinc-200">
          <p className="text-sm text-zinc-500 mb-3">שאלות? אנחנו כאן לעזור</p>
          <a
            href="https://wa.me/972501234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp שלחו הודעה ב
          </a>
        </div>
      </div>
    </main>
  );
}
