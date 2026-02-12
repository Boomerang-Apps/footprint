'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Star, Shield, Award, ArrowLeft, Play, Upload, Palette, Package, Heart, Users, Brush, Camera, Pen, Gift, Phone, Mail, Instagram, Facebook, MessageCircle, Truck } from 'lucide-react';
import { Header } from '@/components/layout';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-16 lg:py-24 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Hero Images */}
            <div className="order-1 lg:order-1 relative h-80 lg:h-[520px]">
              {/* Decorative blurs */}
              <div className="absolute w-36 h-36 top-0 left-1/4 bg-brand-pink rounded-full blur-[60px] opacity-20" />
              <div className="absolute w-28 h-28 bottom-1/4 right-1/4 bg-brand-purple rounded-full blur-[60px] opacity-20" />

              {/* AI Badge */}
              <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5 bg-zinc-900 px-3.5 py-2 rounded-full text-xs font-semibold text-white">
                <Sparkles className="w-3.5 h-3.5" />
                מונע בינה מלאכותית
              </div>

              {/* Main frame */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-3 w-56 lg:w-[300px] h-72 lg:h-[380px] bg-white border border-zinc-200 rounded-2xl shadow-soft-lg flex items-center justify-center z-10">
                <div className="w-[72px] lg:w-[88px] h-[72px] lg:h-[88px] rounded-2xl bg-gradient-to-br from-brand-purple/15 to-brand-pink/15 flex items-center justify-center text-brand-purple">
                  <Sparkles className="w-8 lg:w-10 h-8 lg:h-10" />
                </div>
              </div>

              {/* Small frames */}
              <div className="absolute top-[5%] right-[5%] lg:right-0 rotate-6 w-[120px] lg:w-[160px] h-[120px] lg:h-[160px] bg-white border border-zinc-200 rounded-2xl shadow-soft-lg flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 flex items-center justify-center text-blue-500">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="absolute bottom-[10%] left-0 -rotate-6 w-[100px] lg:w-[140px] h-[100px] lg:h-[140px] bg-white border border-zinc-200 rounded-2xl shadow-soft-lg flex items-center justify-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/15 to-yellow-500/15 flex items-center justify-center text-orange-500">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-2 lg:order-2">
              <h1 className="text-4xl lg:text-[52px] font-bold leading-[1.15] mb-5 text-zinc-900">
                המתנה שלא שוכחים!
                <br />
                <span className="gradient-text">אמנות AI מהתמונות שלכם</span>
              </h1>

              <p className="text-[17px] text-zinc-600 mb-8 max-w-lg leading-relaxed">
                צרו מתנות מרגשות שמספרות את הסיפור שלכם. בינה מלאכותית הופכת כל תמונה ליצירת אמנות, מודפסת באיכות מוזיאון.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/create" className="btn btn-primary text-base py-4 px-7">
                  <span>לרכישת מתנה</span>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <button className="btn btn-secondary text-base py-4 px-7">
                  <Play className="w-5 h-5" />
                  <span>צפו בדוגמאות</span>
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-10 pt-8 border-t border-zinc-200">
                <div>
                  <div className="text-2xl font-bold text-zinc-900">500+</div>
                  <div className="text-[13px] text-zinc-500 mt-0.5">לקוחות</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-900">4.9</div>
                  <div className="text-[13px] text-zinc-500 mt-0.5">דירוג</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-900">24h</div>
                  <div className="text-[13px] text-zinc-500 mt-0.5">משלוח</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-12 px-5 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Sparkles, title: 'יצירה אישית', desc: 'כל יצירה נעשית במיוחד עבורכם' },
            { icon: Shield, title: 'שביעות רצון', desc: 'לא מרוצים? נתקן או נחזיר כסף' },
            { icon: Truck, title: 'משלוח מהיר', desc: 'עד 5 ימי עסקים לכל הארץ' },
            { icon: Award, title: 'איכות מוזיאון', desc: 'הדפסה על נייר פיין ארט' },
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white border border-zinc-200 rounded-xl flex items-center justify-center flex-shrink-0 text-brand-purple shadow-soft-sm">
                <feature.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-zinc-900 mb-1">{feature.title}</div>
                <div className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-[32px] font-bold text-zinc-900 mb-3">המוצרים שלנו</h2>
            <p className="text-zinc-500 text-base max-w-md mx-auto leading-relaxed">
              מתנות מרגשות לכל אירוע. יום הולדת, יום נישואין, או סתם להגיד תודה.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'ai-art',
                icon: Sparkles,
                color: '#8b5cf6',
                colorBg: 'rgba(139,92,246,0.12)',
                subtitle: 'AI Art Print',
                title: 'אמנות AI מתמונה',
                desc: 'הבינה המלאכותית שלנו הופכת את התמונה שלכם ליצירת אמנות בסגנון ייחודי.',
                price: 89,
                badge: null,
              },
              {
                id: 'family',
                icon: Users,
                color: '#ec4899',
                colorBg: 'rgba(236,72,153,0.12)',
                subtitle: 'Family Portrait',
                title: 'פורטרט משפחתי',
                desc: 'הפכו תמונה משפחתית ליצירת אמנות מרהיבה. מושלם כמתנה.',
                price: 149,
                badge: 'הכי פופולרי',
              },
              {
                id: 'pet',
                icon: Heart,
                color: '#f59e0b',
                colorBg: 'rgba(245,158,11,0.12)',
                subtitle: 'Pet Portrait',
                title: 'פורטרט חיית מחמד',
                desc: 'הנציחו את חיית המחמד האהובה בסגנון אמנותי ייחודי.',
                price: 119,
                badge: null,
              },
            ].map((product) => (
              <div key={product.id} className="card overflow-hidden relative group hover:-translate-y-1">
                {product.badge && (
                  <div className="absolute top-4 right-4 bg-brand-purple text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
                    {product.badge}
                  </div>
                )}
                <div className="h-[180px] lg:h-[200px] bg-zinc-50 flex items-center justify-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: product.colorBg, color: product.color }}
                  >
                    <product.icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-1.5">{product.subtitle}</div>
                  <h3 className="text-[22px] font-bold text-zinc-900 mb-2.5">{product.title}</h3>
                  <p className="text-sm text-zinc-600 mb-5 leading-relaxed">{product.desc}</p>
                  <div className="flex items-center justify-between pt-5 border-t border-zinc-200">
                    <div>
                      <div className="text-xs text-zinc-500">החל מ-</div>
                      <span className="text-[28px] font-bold text-zinc-900">₪{product.price}</span>
                    </div>
                    <Link
                      href="/create"
                      className="px-6 py-3 rounded-full text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      style={{ backgroundColor: product.color }}
                    >
                      לרכישה
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-5 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-[32px] font-bold text-zinc-900 mb-3">סגנונות אמנות</h2>
            <p className="text-zinc-500 text-base">בחרו את הסגנון שמתאים לכם</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Heart, label: 'רומנטי', color: '#ec4899', colorBg: 'rgba(236,72,153,0.1)' },
              { icon: Brush, label: 'אמנותי', color: '#8b5cf6', colorBg: 'rgba(139,92,246,0.1)' },
              { icon: Camera, label: 'משפחתי', color: '#3b82f6', colorBg: 'rgba(59,130,246,0.1)' },
              { icon: Pen, label: 'מינימליסטי', color: '#f59e0b', colorBg: 'rgba(245,158,11,0.1)' },
            ].map((style, i) => (
              <Link
                key={i}
                href="/create"
                className="aspect-square bg-white border border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition hover:border-brand-purple hover:shadow-soft-md hover:scale-[1.02]"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: style.colorBg, color: style.color }}
                >
                  <style.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-zinc-600">{style.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-[32px] font-bold text-zinc-900 mb-3">איך זה עובד?</h2>
            <p className="text-zinc-500 text-base">שלושה צעדים פשוטים ליצירת אמנות</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Upload, number: '01', title: 'העלו תמונה', desc: 'בחרו תמונה מהגלריה שלכם' },
              { icon: Palette, number: '02', title: 'בחרו סגנון', desc: 'AI הופך את התמונה לאמנות' },
              { icon: Package, number: '03', title: 'קבלו הדפסה', desc: 'משלוח מהיר עד הבית' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="w-20 h-20 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center text-brand-purple">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-brand-purple to-brand-pink rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 max-w-[260px] mx-auto leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-5 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex gap-0.5 justify-center mb-3 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-sm text-zinc-500">מעל 500 ביקורות חיוביות בגוגל</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'מיכל כ.', location: 'תל אביב', text: '"הזמנתי מתנה לבעלי ליום ההולדת. האיכות מדהימה והוא התרגש עד דמעות!"', initial: 'מ' },
              { name: 'יוסי ל.', location: 'חיפה', text: '"הפכתי תמונה מהחתונה שלנו לאמנות. התוצאה מעבר לכל ציפייה."', initial: 'י' },
              { name: 'נועה ש.', location: 'ירושלים', text: '"עשיתי פורטרט לכלב שלנו. יצא כל כך יפה שהזמנתי עוד שניים!"', initial: 'נ' },
            ].map((review, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-7 transition hover:shadow-soft-md">
                <div className="flex gap-0.5 mb-4 text-yellow-400">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-[15px] text-zinc-600 leading-relaxed mb-5">{review.text}</p>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-pink rounded-full flex items-center justify-center text-base font-semibold text-white">
                    {review.initial}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-zinc-900">{review.name}</div>
                    <div className="text-[13px] text-zinc-500">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-5">
        <div className="max-w-xl mx-auto">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/10 to-brand-pink/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-brand-purple">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-[22px] font-bold text-zinc-900 mb-2.5">קבלו הנחות ועדכונים</h3>
            <p className="text-zinc-500 text-[15px] mb-6 leading-relaxed">הירשמו לניוזלטר וקבלו 10% הנחה על ההזמנה הראשונה</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="הזינו אימייל"
                className="input flex-1"
              />
              <button className="btn btn-primary whitespace-nowrap">הרשמה</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-5 text-center bg-gradient-to-b from-white to-zinc-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl lg:text-[44px] font-bold mb-4 text-zinc-900 leading-tight">
            מוכנים להפוך זיכרון
            <br />
            <span className="gradient-text">ליצירת אמנות?</span>
          </h2>
          <p className="text-zinc-500 text-[17px] mb-8 leading-relaxed">
            העלו תמונה וראו את הקסם - בחינם
          </p>
          <Link
            href="/create"
            className="btn btn-primary text-lg py-5 px-10 shadow-brand-lg"
          >
            <span>התחילו עכשיו</span>
            <Sparkles className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-zinc-50 border-t border-zinc-200 py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10 text-center lg:text-right">
            {/* Brand */}
            <div className="flex flex-col items-center lg:items-start">
              <Image
                src="/footprint-logo-black-v2.svg"
                alt="פוטפרינט"
                width={120}
                height={73}
                className="h-[73px] w-auto mb-4"
              />
              <div className="text-[29px] font-bold text-zinc-900 mb-3">פוטפרינט</div>
              <p className="text-sm text-zinc-500 mb-5 leading-relaxed max-w-[280px]">מסגרו את הסיפורים שלכם</p>
              <div className="flex gap-2.5">
                <a href="#" className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500 hover:border-brand-purple hover:text-brand-purple transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500 hover:border-brand-purple hover:text-brand-purple transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500 hover:border-brand-purple hover:text-brand-purple transition">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500 hover:border-brand-purple hover:text-brand-purple transition">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-[15px] font-semibold text-zinc-900 mb-5">מוצרים</h4>
              <ul className="space-y-3">
                {['אמנות AI', 'פורטרט משפחתי', 'פורטרט חיות'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-[15px] font-semibold text-zinc-900 mb-5">מידע</h4>
              <ul className="space-y-3">
                {['אודות', 'שאלות נפוצות', 'משלוחים'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[15px] font-semibold text-zinc-900 mb-5">צור קשר</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 justify-center lg:justify-start text-sm text-zinc-500">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </li>
                <li className="flex items-center gap-2 justify-center lg:justify-start text-sm text-zinc-500">
                  <Mail className="w-4 h-4" />
                  hello@footprint.co.il
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-200 flex flex-col items-center gap-4 text-[13px] text-zinc-500">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <span>© 2025 פוטפרינט. כל הזכויות שמורות.</span>
              <div className="flex gap-6">
                <Link href="/terms" className="hover:text-zinc-900 transition">תקנון</Link>
                <Link href="/privacy" className="hover:text-zinc-900 transition">פרטיות</Link>
              </div>
            </div>
            <span className="text-zinc-400">Footprint is a product by Boomerang-Application LTD</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/972501234567"
        className="fixed bottom-24 lg:bottom-6 left-6 w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/40 z-50 hover:scale-110 transition"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </main>
  );
}
