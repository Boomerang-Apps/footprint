import Link from 'next/link';
import { Sparkles, Star, Zap, Truck, Shield, Award, ArrowLeft, Play } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Announcement Bar */}
      <div className="bg-dark-card border-b border-dark-border py-2.5 px-4 text-center text-sm text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-purple" />
          פריט שני ב-50% הנחה
        </span>
        <span className="mx-3 text-zinc-700">|</span>
        <span className="inline-flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-purple" />
          משלוח חינם מעל ₪299
        </span>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-dark-card rounded-lg flex items-center justify-center text-brand-purple">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold">Footprint</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#products" className="text-sm text-zinc-400 hover:text-white transition">מוצרים</Link>
            <Link href="#gallery" className="text-sm text-zinc-400 hover:text-white transition">גלריה</Link>
            <Link href="#how" className="text-sm text-zinc-400 hover:text-white transition">איך זה עובד</Link>
            <Link href="#contact" className="text-sm text-zinc-400 hover:text-white transition">צור קשר</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/create" 
              className="hidden md:flex btn btn-primary"
            >
              התחילו
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              {/* Rating Badge */}
              <div className="inline-flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-1.5 rounded-full mb-6">
                <div className="flex gap-0.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-zinc-500">30,000+ לקוחות מרוצים</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                המתנה שלא שוכחים!
                <br />
                <span className="gradient-text">אמנות AI מותאמת אישית</span>
              </h1>

              <p className="text-lg text-zinc-500 mb-8 max-w-lg">
                צרו מתנות מרגשות שמספרות את הסיפור שלכם. בינה מלאכותית הופכת כל תמונה ליצירת אמנות, מודפסת באיכות מוזיאון.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/create" className="btn btn-primary text-base py-4 px-8">
                  <span>לרכישת מתנה</span>
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <button className="btn btn-secondary text-base py-4 px-8">
                  <Play className="w-5 h-5" />
                  <span>צפו בדוגמאות</span>
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6 border-t border-dark-border">
                <div>
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-xs text-zinc-600">לקוחות</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-xs text-zinc-600">דירוג</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24h</div>
                  <div className="text-xs text-zinc-600">משלוח</div>
                </div>
              </div>
            </div>

            {/* Hero Images */}
            <div className="order-1 lg:order-2 relative h-80 md:h-[450px]">
              {/* Decorative blurs */}
              <div className="absolute w-32 h-32 top-0 left-1/4 bg-gradient-to-br from-brand-pink to-brand-purple rounded-full blur-3xl opacity-40" />
              <div className="absolute w-24 h-24 bottom-1/4 right-1/4 bg-gradient-to-br from-brand-cyan to-blue-500 rounded-full blur-3xl opacity-40" />
              
              {/* AI Badge */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur px-3 py-1.5 rounded-full text-xs text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                AI Powered
              </div>

              {/* Main frame */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-3 w-56 md:w-72 h-72 md:h-96 card flex items-center justify-center z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center text-brand-purple">
                  <Sparkles className="w-10 h-10" />
                </div>
              </div>

              {/* Small frames */}
              <div className="absolute top-10 right-10 rotate-6 w-32 h-32 card flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-blue-500/20 flex items-center justify-center text-brand-cyan">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-16 left-4 -rotate-6 w-28 h-28 card flex items-center justify-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-orange/20 to-yellow-500/20 flex items-center justify-center text-brand-orange">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 px-4 bg-dark-card/50 border-y border-dark-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: 'יצירה אישית', desc: 'כל יצירה נעשית במיוחד עבורך' },
            { icon: Shield, title: 'שביעות רצון', desc: 'לא מרוצים? נתקן או נחזיר כסף' },
            { icon: Truck, title: 'משלוח מהיר', desc: 'עד 5 ימי עסקים לכל הארץ' },
            { icon: Award, title: 'איכות מוזיאון', desc: 'הדפסה על נייר פיין ארט' },
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-dark-border rounded-lg flex items-center justify-center flex-shrink-0 text-brand-purple">
                <feature.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{feature.title}</div>
                <div className="text-xs text-zinc-600">{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center border-t border-dark-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            מוכנים להפוך זיכרון
            <br />
            <span className="gradient-text">ליצירת אמנות?</span>
          </h2>
          <p className="text-zinc-500 mb-8">
            העלו תמונה וראו את הקסם - בחינם
          </p>
          <Link 
            href="/create" 
            className="btn btn-primary text-lg py-5 px-10 shadow-lg shadow-brand-purple/25"
          >
            <span>התחילו עכשיו</span>
            <Sparkles className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-dark-border py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-dark-card rounded-lg flex items-center justify-center text-brand-purple">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold">Footprint</span>
          </div>
          <p className="text-sm text-zinc-600 mb-6">
            מתנות אמנותיות מותאמות אישית שלכם
          </p>
          <div className="text-xs text-zinc-700">
            © 2024 Footprint. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </main>
  );
}
