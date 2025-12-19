import React, { useState, useEffect } from 'react';

// Footprint.co.il - White Space Layout + Dark Sleek Theme
// AI Art Printing Studio

const FootprintSite = () => {
  const [activeProduct, setActiveProduct] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState('');

  const products = [
    {
      id: 'ai-art',
      title: 'אמנות AI מתמונה',
      subtitle: 'AI Art Print',
      desc: 'הבינה המלאכותית שלנו הופכת את התמונה שלכם ליצירת אמנות בסגנון ייחודי. בחרו מבין מגוון סגנונות אמנותיים.',
      price: 89,
      image: '🎨',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'portrait',
      title: 'פורטרט אמנותי',
      subtitle: 'Artistic Portrait',
      desc: 'הפכו פורטרט משפחתי או זוגי ליצירת אמנות מרהיבה. מושלם כמתנה ליום הולדת או יום נישואין.',
      price: 149,
      image: '👨‍👩‍👧',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'pet',
      title: 'פורטרט חיית מחמד',
      subtitle: 'Pet Portrait',
      desc: 'הנציחו את חיית המחמד האהובה שלכם בסגנון אמנותי ייחודי. מתנה מושלמת לאוהבי חיות.',
      price: 119,
      image: '🐕',
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  const testimonials = [
    { name: 'מיכל כהן', text: 'הזמנתי מתנה לבעלי ליום ההולדת. האיכות מדהימה והוא התרגש עד דמעות! ממליצה בחום.', rating: 5, location: 'תל אביב' },
    { name: 'יוסי לוי', text: 'הפכתי תמונה מהחתונה שלנו לאמנות. התוצאה מעבר לכל ציפייה. שירות מעולה!', rating: 5, location: 'חיפה' },
    { name: 'נועה שמיר', text: 'עשיתי פורטרט לכלב שלנו. יצא כל כך יפה שהזמנתי עוד שניים למשפחה. תודה!', rating: 5, location: 'ירושלים' },
    { name: 'דני אברהם', text: 'איכות הדפסה ברמה של גלריה. המסגרת מושלמת. בהחלט אזמין שוב.', rating: 5, location: 'ראשון לציון' },
  ];

  const clientLogos = ['Nike', 'Wix', 'Teva', 'HOT', 'Coca-Cola', 'FOX', 'Cellcom', 'Partner'];

  const features = [
    { icon: '✨', title: 'יצירה אישית', desc: 'כל יצירה נעשית במיוחד עבורכם' },
    { icon: '❤️', title: 'שביעות רצון מובטחת', desc: 'לא מרוצים? נתקן או נחזיר כסף' },
    { icon: '🚀', title: 'משלוח מהיר', desc: 'עד 5 ימי עסקים לכל הארץ' },
    { icon: '🏆', title: 'איכות מוזיאון', desc: 'הדפסה על נייר פיין ארט 100% כותנה' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* Announcement Bar - Scrolling */}
      <div className="bg-gradient-to-l from-[#1a1a2e] to-[#16213e] text-white py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 text-sm">
              <span className="flex items-center gap-2">✨ פריט שני ב-50% הנחה!</span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-2">🚚 משלוח חינם בקנייה מעל ₪299</span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-2">🎨 AI הופך תמונות לאמנות</span>
              <span className="text-white/30">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#0a0a0a]/95 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <span className="text-xl">👣</span>
              </div>
              <div>
                <span className="text-xl font-semibold tracking-wide">Footprint</span>
                <span className="text-[10px] text-white/40 block -mt-1">AI Art Studio</span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#products" className="text-sm text-white/60 hover:text-white transition-colors">המוצרים שלנו</a>
              <a href="#gallery" className="text-sm text-white/60 hover:text-white transition-colors">גלריה</a>
              <a href="#about" className="text-sm text-white/60 hover:text-white transition-colors">איך זה עובד</a>
              <a href="#contact" className="text-sm text-white/60 hover:text-white transition-colors">צור קשר</a>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <span className="text-lg">🔍</span>
              </button>
              <button className="relative w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <span className="text-lg">🛒</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">0</span>
              </button>
              <button className="hidden md:flex bg-white text-black px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
                התחילו עכשיו
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Like White Space */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className="relative order-2 md:order-1">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                {/* Main Image Area */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Simulated Frame */}
                    <div className="w-64 h-80 bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] rounded-2xl border border-white/20 shadow-2xl transform rotate-[-5deg] p-4">
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-7xl">🎨</span>
                      </div>
                    </div>
                    {/* Second Frame */}
                    <div className="absolute -bottom-8 -right-8 w-48 h-60 bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] rounded-2xl border border-white/20 shadow-2xl transform rotate-[8deg] p-3">
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-5xl">👨‍👩‍👧</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-40" />
                <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-40" />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 right-8 bg-white text-black px-4 py-2 rounded-full text-sm font-medium shadow-xl flex items-center gap-2">
                <span className="text-yellow-500">★★★★★</span>
                <span>4.9 (500+ ביקורות)</span>
              </div>
            </div>

            {/* Text Side */}
            <div className="space-y-6 order-1 md:order-2">
              {/* Rating */}
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <div className="flex text-yellow-400 text-sm">★★★★★</div>
                <span className="text-sm text-white/60">30,000+ לקוחות מרוצים</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                המתנה שלא שוכחים!
                <br />
                <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  אמנות AI מהתמונות שלכם
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-white/50 leading-relaxed max-w-lg">
                צרו מתנות מרגשות שמספרות את הסיפור שלכם. הבינה המלאכותית שלנו הופכת כל תמונה ליצירת אמנות ייחודית, מודפסת על נייר פיין ארט באיכות מוזיאון.
              </p>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button className="group bg-gradient-to-l from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2">
                  <span>לרכישת מתנה</span>
                  <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors">
                  צפו בדוגמאות
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar - Like White Space */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-white/10 group-hover:scale-110 group-hover:border-white/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-white/40">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Like White Space */}
      <section id="products" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">המוצרים שלנו</h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              אנחנו יוצרים מוצרים שמתאימים לכל סיבה ומסיבה. רוצים להפתיע ביום הולדת? לפנק את בן או בת הזוג? יש לנו את המתנה המושלמת!
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <div 
                key={i}
                className="group relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-3xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500"
              >
                {/* Product Image */}
                <div className={`aspect-[4/3] bg-gradient-to-br ${product.gradient} opacity-20 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                  <span className="text-8xl relative z-10 group-hover:scale-110 transition-transform duration-500">{product.image}</span>
                </div>

                {/* Product Info */}
                <div className="p-6 relative">
                  <div className="text-xs text-white/40 tracking-wider uppercase mb-2">{product.subtitle}</div>
                  <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                  <p className="text-sm text-white/50 mb-4 leading-relaxed">{product.desc}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">₪{product.price}</span>
                      <span className="text-white/40 text-sm mr-1">החל מ-</span>
                    </div>
                    <button className={`bg-gradient-to-l ${product.gradient} text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300`}>
                      לרכישה
                    </button>
                  </div>
                </div>

                {/* Hover Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section - Dark Background with Images */}
      <section id="gallery" className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e]/50 to-[#0a0a0a]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">מתנה מושלמת לרגעים בלתי נשכחים</h2>
            <p className="text-white/50">כאן הכל אמיתי – הצצה לרגעים שהלקוחות שלנו בחרו להנציח</p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'מרגשת', icon: '💕', gradient: 'from-pink-500 to-rose-500' },
              { label: 'איור אמנותי', icon: '🎨', gradient: 'from-purple-500 to-indigo-500' },
              { label: 'מפת כוכבים', icon: '✨', gradient: 'from-blue-500 to-cyan-500' },
              { label: 'סופר אלי׳ש', icon: '🌟', gradient: 'from-amber-500 to-orange-500' },
            ].map((item, i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-30 group-hover:opacity-50 transition-opacity`} />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-white/30 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram/Community Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-white/40 text-sm tracking-wider">@footprint.israel</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">קהילה שווה כבר אמרנו?</h2>
            <p className="text-white/50">אתם משתפים ואנחנו מסמיקים! הצטרפו לאלפי ישראלים שמצאו את הדרך האישית שלהם לרגש.</p>
          </div>

          {/* Instagram Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40 group-hover:opacity-60 transition-opacity">
                  {['🎨', '👨‍👩‍👧', '🐕', '💑', '🌅', '🎁'][i]}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-2xl">❤️</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Logos - Like White Space */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">הרגעים שלכם - האומנות שלנו!</h2>
            <p className="text-white/40 text-sm">תודה לאלפי לקוחות ועסקים בישראל שריגשו והתרגשו</p>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center opacity-40">
            {clientLogos.map((logo, i) => (
              <div key={i} className="text-center text-sm font-medium text-white/60 hover:text-white/80 transition-colors cursor-pointer">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Like White Space */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-4">
            <div className="flex justify-center text-yellow-400 text-lg mb-2">★★★★★</div>
            <p className="text-white/40 text-sm">קראו מעל 500 ביקורות נוספות בעמוד העסק של גוגל</p>
          </div>

          {/* Testimonials Carousel */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {testimonials.slice(0, 3).map((testimonial, i) => (
              <div 
                key={i}
                className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl p-6 border border-white/10"
              >
                <div className="flex text-yellow-400 text-sm mb-4">★★★★★</div>
                <p className="text-white/70 leading-relaxed mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-xs text-white/40">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-3xl border border-white/10 p-8 md:p-12">
            {/* Image Side */}
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-9xl">🎁</span>
            </div>

            {/* Form Side */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">מראה שעל הקיר, למי יש את הבית הכי שווה בעיר?</h2>
              <p className="text-white/50">תקבלו הנחות, מבצעים והרבה ערך. אנחנו יודעים שאתם לא רוצים לפספס את כל הכיף!</p>
              
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="הזינו אימייל"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                />
                <button className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors whitespace-nowrap">
                  הירשמו
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Quick Version */}
      <section id="about" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">איך זה עובד?</h2>
            <p className="text-white/50">תהליך פשוט בשלושה שלבים</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'העלו תמונה', desc: 'בחרו תמונה מהגלריה שלכם', icon: '📸' },
              { num: '02', title: 'בחרו סגנון', desc: 'AI הופך את התמונה לאמנות', icon: '🎨' },
              { num: '03', title: 'קבלו הדפסה', desc: 'משלוח מהיר עד הבית', icon: '🖼️' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 border border-white/10">
                  {step.icon}
                </div>
                <div className="text-xs text-white/30 mb-2">{step.num}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-white/50">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            מוכנים להפוך זיכרון<br />
            <span className="bg-gradient-to-l from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              ליצירת אמנות?
            </span>
          </h2>
          <p className="text-white/50 mb-8 text-lg">העלו תמונה וראו את הקסם קורה - בחינם, בלי התחייבות</p>
          <button className="bg-gradient-to-l from-purple-500 to-pink-500 text-white px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
            התחילו עכשיו - חינם! 🚀
          </button>
        </div>
      </section>

      {/* Footer - Like White Space */}
      <footer id="contact" className="bg-[#050508] border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="text-xl">👣</span>
                </div>
                <span className="text-xl font-semibold">Footprint</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-4">
                מתנה מושלמת היא אישית ומרגשת ✨<br />
                הרגעים הכי יפים שלכם הופכים ליצירות אמנות!
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">📘</a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">📸</a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">🎵</a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">המוצרים שלנו</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">אמנות AI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">פורטרט אמנותי</a></li>
                <li><a href="#" className="hover:text-white transition-colors">פורטרט חיית מחמד</a></li>
                <li><a href="#" className="hover:text-white transition-colors">מסגור תמונות</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">מידע נוסף</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">אודותינו</a></li>
                <li><a href="#" className="hover:text-white transition-colors">שאלות נפוצות</a></li>
                <li><a href="#" className="hover:text-white transition-colors">משלוחים</a></li>
                <li><a href="#" className="hover:text-white transition-colors">מדיניות החזרות</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">שירות לקוחות</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <span>📱</span>
                  <a href="#" className="hover:text-white transition-colors">WhatsApp</a>
                </li>
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>hello@footprint.co.il</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🕐</span>
                  <span>א׳-ה׳ 10:00-18:00</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">© 2025 Footprint. כל הזכויות שמורות.</p>
            <div className="flex items-center gap-6 text-xs text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors">תקנון</a>
              <a href="#" className="hover:text-white/60 transition-colors">פרטיות</a>
              <a href="#" className="hover:text-white/60 transition-colors">נגישות</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">אמצעי תשלום:</span>
              <span className="text-white/50">💳 Visa Mastercard</span>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a 
        href="https://wa.me/972501234567"
        className="fixed bottom-6 left-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white text-2xl shadow-2xl hover:scale-110 transition-transform z-50"
      >
        💬
      </a>

      {/* Custom Styles for Marquee */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FootprintSite;
