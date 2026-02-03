import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, List, Clock, Building2, AlertTriangle, CheckCircle, Info, Users, Mail, Phone, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'תקנון האתר | פוטפרינט',
  description: 'תנאי שימוש באתר Footprint והזמנת שירותי הדפסה. מדיניות ביטולים, משלוחים, זכויות יוצרים ועוד.',
  openGraph: {
    title: 'תקנון האתר | פוטפרינט',
    description: 'תנאי שימוש באתר Footprint והזמנת שירותי הדפסה',
    url: 'https://footprint.co.il/terms',
    siteName: 'פוטפרינט',
    locale: 'he_IL',
    type: 'website',
  },
};

// Table of contents data
const tocItems = [
  { id: 'general', num: 1, label: 'כללי' },
  { id: 'definitions', num: 2, label: 'הגדרות' },
  { id: 'eligibility', num: 3, label: 'כשירות שימוש' },
  { id: 'services', num: 4, label: 'השירותים' },
  { id: 'ordering', num: 5, label: 'הזמנות ותשלום' },
  { id: 'cancellation', num: 6, label: 'ביטול עסקה' },
  { id: 'shipping', num: 7, label: 'משלוחים' },
  { id: 'copyright', num: 8, label: 'זכויות יוצרים' },
  { id: 'liability', num: 9, label: 'הגבלת אחריות' },
  { id: 'privacy', num: 10, label: 'פרטיות' },
  { id: 'ip', num: 11, label: 'קניין רוחני' },
  { id: 'jurisdiction', num: 12, label: 'דין וסמכות' },
  { id: 'contact', num: 13, label: 'יצירת קשר' },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Site Header with Logo and Navigation */}
      <Header />

      {/* Page Header */}
      <header className="py-[60px] px-4 text-center border-b border-zinc-200 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-[800px] mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/15 to-brand-pink/15 rounded-2xl flex items-center justify-center mx-auto mb-5 text-brand-purple">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-[32px] lg:text-[40px] font-bold mb-3 text-zinc-900">תקנון האתר</h1>
          <p className="text-zinc-500 text-base">תנאי שימוש באתר Footprint והזמנת שירותי הדפסה</p>
          <div className="mt-5 inline-flex items-center gap-1.5 bg-white border border-zinc-200 px-5 py-2.5 rounded-xl text-[13px] text-zinc-500 shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            עדכון אחרון: פברואר 2025
          </div>
        </div>
      </header>

      {/* Table of Contents */}
      <section className="py-10 px-4 border-b border-zinc-200 bg-zinc-50">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2.5 text-zinc-900">
              <List className="w-5 h-5 text-brand-purple" />
              תוכן עניינים
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 text-sm hover:border-zinc-300 hover:text-zinc-900 hover:bg-white hover:shadow-sm transition"
                >
                  <span className="w-7 h-7 bg-gradient-to-br from-brand-purple/15 to-brand-pink/15 rounded-lg flex items-center justify-center text-xs font-semibold text-brand-purple">
                    {item.num}
                  </span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="py-10 px-4">
        <div className="max-w-[800px] mx-auto space-y-10">

          {/* Section 1: General */}
          <section id="general" className="scroll-mt-20">
            <SectionHeader num={1} title="כללי" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              ברוכים הבאים לאתר <strong>footprint.co.il</strong> (להלן: &quot;האתר&quot;), המופעל על ידי <strong>בומרנג אפליקציות בע״מ</strong> (להלן: &quot;החברה&quot;, &quot;אנחנו&quot;, או &quot;Footprint&quot;).
            </p>

            <InfoCard icon={Building2} title="פרטי החברה">
              <InfoRow label="שם החברה:" value="בומרנג אפליקציות בע״מ" />
              <InfoRow label="מותג:" value="פוטפרינט - Footprint" />
              <InfoRow label="כתובת:" value="מעלה הנחל 115, רמות מנשה, מיקוד 19245, ת.ד. 340, ישראל" />
              <InfoRow label="טלפון:" value="058-432-3001" dir="ltr" />
              <InfoRow label='דוא"ל:' value={<a href="mailto:info@footprint.co.il" className="text-brand-purple underline underline-offset-2 decoration-brand-purple/30 hover:decoration-brand-purple">info@footprint.co.il</a>} />
            </InfoCard>

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              תקנון זה מהווה הסכם מחייב בינך (&quot;המשתמש&quot;, &quot;הלקוח&quot;, &quot;אתה&quot;) לבין החברה. השימוש באתר, לרבות גלישה, רכישה או כל פעולה אחרת, מהווה הסכמה מלאה לתנאי תקנון זה.
            </p>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              אנו שומרים לעצמנו את הזכות לעדכן תקנון זה מעת לעת. שינויים מהותיים יפורסמו באתר, והמשך השימוש לאחר פרסום השינויים מהווה הסכמה לתנאים המעודכנים.
            </p>
          </section>

          {/* Section 2: Definitions */}
          <section id="definitions" className="scroll-mt-20">
            <SectionHeader num={2} title="הגדרות" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              למונחים הבאים תהיה המשמעות המצוינת לצידם:
            </p>

            <ul className="list-disc pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed">
              <li><strong>&quot;האתר&quot;</strong> - אתר האינטרנט footprint.co.il על כל עמודיו ושירותיו</li>
              <li><strong>&quot;החברה&quot;</strong> - בומרנג אפליקציות בע״מ, המפעילה את אתר Footprint</li>
              <li><strong>&quot;המשתמש&quot;</strong> - כל אדם או גורם העושה שימוש באתר</li>
              <li><strong>&quot;השירותים&quot;</strong> - שירותי עיבוד תמונות באמצעות AI והדפסתן על נייר אמנות</li>
              <li><strong>&quot;הזמנה&quot;</strong> - רכישת מוצר או שירות באמצעות האתר</li>
              <li><strong>&quot;מוצר מותאם אישית&quot;</strong> - הדפס שהוכן על בסיס תמונה שהועלתה על ידי הלקוח</li>
              <li><strong>&quot;עיבוד AI&quot;</strong> - שינוי או עיצוב התמונה באמצעות בינה מלאכותית</li>
            </ul>
          </section>

          {/* Section 3: Eligibility */}
          <section id="eligibility" className="scroll-mt-20">
            <SectionHeader num={3} title="כשירות שימוש" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              השימוש באתר וביצוע רכישות מותר אך ורק למי שעומד בתנאים הבאים:
            </p>

            <ul className="list-disc pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed mb-4">
              <li>גיל 18 ומעלה</li>
              <li>בעל כשרות משפטית לבצע פעולות משפטיות מחייבות</li>
              <li>בעל כרטיס אשראי תקף הרשום על שמו או אמצעי תשלום מאושר אחר</li>
              <li>מספק פרטים נכונים ומדויקים בעת ההרשמה וההזמנה</li>
            </ul>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              גופים משפטיים (חברות, עמותות וכו&apos;) רשאים לבצע הזמנות באמצעות נציג מורשה.
            </p>
          </section>

          {/* Section 4: Services */}
          <section id="services" className="scroll-mt-20">
            <SectionHeader num={4} title="השירותים" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              Footprint מציעה שירותי הדפסת תמונות אמנותיות הכוללים:
            </p>

            <ul className="list-disc pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed mb-5">
              <li>עיבוד תמונות באמצעות טכנולוגיית AI ליצירת אפקטים אמנותיים</li>
              <li>הדפסה על נייר Fine Art באיכות מוזיאלית</li>
              <li>מגוון גדלים ופורמטים להתאמה אישית</li>
              <li>משלוח עד הבית או נקודת איסוף</li>
            </ul>

            <AlertBox type="warning" title="שימו לב">
              <p>כל מוצרי Footprint הם מוצרים מותאמים אישית שמיוצרים עבורכם לפי הזמנה. לאחר תחילת הייצור, לא ניתן לבטל את ההזמנה בהתאם לחוק הגנת הצרכן.</p>
            </AlertBox>
          </section>

          {/* Section 5: Ordering */}
          <section id="ordering" className="scroll-mt-20">
            <SectionHeader num={5} title="הזמנות ותשלום" />

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">תהליך ההזמנה</h3>
            <ol className="list-decimal pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed">
              <li>העלאת תמונה מהמכשיר או הגלריה</li>
              <li>בחירת סגנון עיבוד AI</li>
              <li>בחירת גודל ופורמט ההדפסה</li>
              <li>אישור התוצאה ומעבר לתשלום</li>
              <li>מילוי פרטי משלוח ותשלום</li>
              <li>קבלת אישור הזמנה במייל</li>
            </ol>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">אמצעי תשלום</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">אנו מקבלים את אמצעי התשלום הבאים:</p>
            <ul className="list-disc pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed mb-5">
              <li>כרטיסי אשראי ישראליים (ויזה, מאסטרקארד, אמריקן אקספרס, דיינרס)</li>
              <li>כרטיסי אשראי בינלאומיים</li>
              <li>תשלום ב-Bit</li>
              <li>PayPal</li>
            </ul>

            <AlertBox type="success" title="אבטחת תשלומים">
              <p>כל התשלומים מעובדים דרך ספק סליקה מאובטח בתקן PCI-DSS. איננו שומרים פרטי כרטיס אשראי במערכותינו.</p>
            </AlertBox>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">מחירים</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              המחירים באתר כוללים מע&quot;מ כחוק. מחירי המשלוח מוצגים בנפרד ונוספים לסכום ההזמנה בעת התשלום.
            </p>
            <p className="text-zinc-600 text-[15px] leading-relaxed">
              אנו שומרים לעצמנו את הזכות לעדכן מחירים מעת לעת. מחיר ההזמנה הקובע הוא המחיר שהוצג בעת ביצוע ההזמנה.
            </p>
          </section>

          {/* Section 6: Cancellation - CRITICAL */}
          <section id="cancellation" className="scroll-mt-20">
            <SectionHeader num={6} title="ביטול עסקה והחזרות" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-5">
              מדיניות הביטול שלנו נקבעה בהתאם להוראות <strong>חוק הגנת הצרכן, התשמ&quot;א-1981</strong> ותקנותיו.
            </p>

            <AlertBox type="success" title="חלון ביטול של 30 דקות">
              <p>ניתן לבטל הזמנה <strong>תוך 30 דקות ממועד ביצועה</strong>, כל עוד לא החל הייצור. במקרה כזה, יינתן החזר מלא של סכום העסקה.</p>
              <p className="mt-2">לביטול בחלון זה, ניתן לפנות אלינו בטלפון 058-432-3001 או במייל <a href="mailto:cancel@footprint.co.il" className="text-green-700 underline">cancel@footprint.co.il</a></p>
            </AlertBox>

            <AlertBox type="danger" title="מוצר מותאם אישית - פטור מביטול">
              <p><strong>בהתאם לסעיף 14ג(ד)(4) לחוק הגנת הצרכן</strong>, מוצרים שיוצרו במיוחד עבור הלקוח (כגון הדפסים מותאמים אישית) <strong>אינם ניתנים לביטול</strong> לאחר שהחל תהליך הייצור.</p>
              <p className="mt-2">מאחר שכל הדפס של Footprint נוצר באופן אישי על בסיס התמונה שהעליתם, לא ניתן לבטל הזמנה לאחר תחילת ההפקה.</p>
            </AlertBox>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">מוצר פגום או שגוי</h3>

            <AlertBox type="info" title="התחייבות לשביעות רצון">
              <p>אם קיבלתם מוצר פגום, שבור, או שונה ממה שהוזמן - נשמח לתקן את המצב!</p>
              <ul className="list-disc pr-5 mt-2 space-y-1">
                <li>יש לפנות אלינו תוך 14 יום מקבלת המוצר</li>
                <li>יש לצרף תמונות של הפגם או הבעיה</li>
                <li>נבחן את הפנייה ונציע פתרון: החלפה, הדפסה מחדש, או החזר כספי</li>
              </ul>
            </AlertBox>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">אוכלוסיות מוגנות</h3>

            <AlertBox type="info" title="זכויות מיוחדות">
              <p>בהתאם לחוק, לאוכלוסיות הבאות עומדות זכויות ביטול מורחבות (עד 4 חודשים מיום ביצוע העסקה) במקרה שהעסקה נעשתה בשיחה עם נציג:</p>
              <ul className="list-disc pr-5 mt-2 space-y-1">
                <li>אזרחים ותיקים (גיל 65+)</li>
                <li>עולים חדשים (עד 5 שנים בארץ)</li>
                <li>אנשים עם מוגבלות</li>
              </ul>
              <p className="mt-2">יש לציין את השתייכותכם לאוכלוסייה המוגנת בעת הפנייה.</p>
            </AlertBox>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">דרכי פנייה לביטול</h3>

            <div className="overflow-x-auto my-5 rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">אמצעי</th>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">פרטי התקשרות</th>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">זמן מענה</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">טלפון</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200" dir="ltr">058-432-3001</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">מיידי בשעות פעילות</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">דוא״ל</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><a href="mailto:cancel@footprint.co.il" className="text-brand-purple">cancel@footprint.co.il</a></td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עד 24 שעות</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">WhatsApp</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200" dir="ltr">058-432-3002</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עד 4 שעות</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">טופס באתר</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עמוד &quot;צור קשר&quot;</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עד 24 שעות</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">סיכום מדיניות הביטול</h3>

            <div className="overflow-x-auto my-5 rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">מצב</th>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">זכאות לביטול</th>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">החזר</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">תוך 30 דקות, לפני תחילת ייצור</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">כן</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">מלא</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">לאחר תחילת הייצור</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">לא</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">-</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">מוצר פגום</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">כן (14 יום)</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">החלפה/החזר</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">אוכלוסייה מוגנת*</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">כן (4 חודשים)</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">מלא</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[13px] text-zinc-500 mt-2">* בכפוף לתנאי החוק ולכך שהעסקה נעשתה בשיחה עם נציג</p>
          </section>

          {/* Section 7: Shipping */}
          <section id="shipping" className="scroll-mt-20">
            <SectionHeader num={7} title="משלוחים" />

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">זמני הפקה ומשלוח</h3>

            <div className="overflow-x-auto my-5 rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">שירות</th>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">זמן הפקה</th>
                    <th className="bg-gradient-to-l from-brand-purple to-purple-500 text-white font-semibold text-sm text-right px-4 py-3.5">זמן משלוח</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">משלוח רגיל</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">1-2 ימי עסקים</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">3-5 ימי עסקים</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">משלוח מהיר</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">1 יום עסקים</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">1-2 ימי עסקים</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">נקודת איסוף</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">1-2 ימי עסקים</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">2-4 ימי עסקים</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <AlertBox type="warning" title="הערה לגבי זמני אספקה">
              <p>הזמנים המצוינים הם הערכה בלבד. בתקופות עומס (חגים, אירועים מיוחדים) ייתכנו עיכובים. במקרה של עיכוב משמעותי, נעדכן אתכם בהקדם.</p>
            </AlertBox>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">אזורי משלוח</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              אנו משלחים לכל רחבי ישראל. משלוחים לאזורים מרוחקים עשויים להיות כרוכים בתוספת תשלום ו/או זמן אספקה ארוך יותר.
            </p>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">אחריות על המשלוח</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed">
              מרגע מסירת החבילה לחברת השליחויות, האחריות על המשלוח עוברת אליהם. עם זאת, אם נפגעה החבילה בדרך או לא הגיעה, נסייע לכם מול חברת השילוח.
            </p>
          </section>

          {/* Section 8: Copyright */}
          <section id="copyright" className="scroll-mt-20">
            <SectionHeader num={8} title="זכויות יוצרים ותוכן" />

            <AlertBox type="danger" title="הצהרת הלקוח">
              <p>בהעלאת תמונה לאתר, הלקוח מצהיר ומתחייב כי:</p>
              <ul className="list-disc pr-5 mt-2 space-y-1">
                <li>הוא בעל זכויות היוצרים בתמונה, או שיש לו אישור מפורש מבעל הזכויות</li>
                <li>התמונה אינה פוגעת בזכויות של צדדים שלישיים</li>
                <li>הוא רשאי לעשות שימוש מסחרי בתמונה</li>
              </ul>
            </AlertBox>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">שיפוי</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              הלקוח מתחייב לשפות את החברה בגין כל תביעה, דרישה או נזק שייגרמו עקב הפרת זכויות יוצרים או זכויות צדדים שלישיים בקשר עם תוכן שהועלה על ידו.
            </p>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">תוכן אסור</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">חל איסור מוחלט על העלאת תמונות הכוללות:</p>
            <ul className="list-disc pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed mb-4">
              <li>תוכן פורנוגרפי או מיני</li>
              <li>תוכן אלים או מפחיד</li>
              <li>תוכן גזעני, מסית או פוגעני</li>
              <li>תוכן המפר זכויות קניין רוחני</li>
              <li>תוכן בלתי חוקי מכל סוג</li>
            </ul>
            <p className="text-zinc-600 text-[15px] leading-relaxed">
              אנו שומרים לעצמנו את הזכות לסרב להדפיס כל תוכן שאיננו עומד בקריטריונים אלו, ולבטל הזמנות כאלה ללא החזר.
            </p>
          </section>

          {/* Section 9: Liability */}
          <section id="liability" className="scroll-mt-20">
            <SectionHeader num={9} title="הגבלת אחריות" />

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">הבדלי צבעים</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              ייתכנו הבדלים קלים בין הצבעים המוצגים על המסך לבין התוצאה המודפסת. הבדלים אלו נובעים מהבדלי כיול מסכים ומאפייני הדפסה, ואינם מהווים עילה לביטול או החזר.
            </p>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">איכות תמונה</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              איכות ההדפסה תלויה באיכות התמונה המקורית שהועלתה. אין באפשרותנו לשפר תמונות באיכות נמוכה מעבר לגבולות הטכנולוגיה. מומלץ להעלות תמונות ברזולוציה גבוהה ככל האפשר.
            </p>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">עיבוד AI</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              עיבוד ה-AI הוא תהליך אוטומטי שתוצאותיו עשויות להשתנות. אנו מציגים תצוגה מקדימה של התוצאה לפני התשלום, ואישור ההזמנה מהווה הסכמה לתוצאה המוצגת.
            </p>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">הגבלת אחריות כללית</h3>
            <p className="text-zinc-600 text-[15px] leading-relaxed">
              אחריות החברה מוגבלת לסכום ששולם עבור ההזמנה הספציפית. בשום מקרה לא נהיה אחראים לנזקים עקיפים, תוצאתיים, או אובדן רווחים.
            </p>
          </section>

          {/* Section 10: Privacy */}
          <section id="privacy" className="scroll-mt-20">
            <SectionHeader num={10} title="פרטיות" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              פרטיות המשתמשים חשובה לנו מאוד. המידע המלא על איסוף, שמירה ושימוש במידע מפורט ב<Link href="/privacy" className="text-brand-purple font-medium">מדיניות הפרטיות</Link> שלנו, המהווה חלק בלתי נפרד מתקנון זה.
            </p>

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">בקצרה:</p>
            <ul className="list-disc pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed">
              <li>אנו אוספים מידע הנדרש לביצוע ההזמנות והשירות</li>
              <li>התמונות שמועלות נמחקות ממערכותינו תוך 30 יום מהשלמת ההזמנה</li>
              <li>איננו מוכרים או משתפים מידע אישי עם צדדים שלישיים למטרות שיווק</li>
              <li>אנו משתמשים באבטחה מתקדמת להגנה על המידע</li>
            </ul>
          </section>

          {/* Section 11: IP */}
          <section id="ip" className="scroll-mt-20">
            <SectionHeader num={11} title="קניין רוחני" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              כל הזכויות באתר, לרבות עיצוב, לוגו, קוד, תוכן, גרפיקה, ואלגוריתמי ה-AI, שייכות לחברה או לגורמים שהעניקו לה רישיון.
            </p>

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              אין להעתיק, להפיץ, לשכפל, או לעשות שימוש מסחרי בכל חלק מהאתר ללא אישור מפורש בכתב מהחברה.
            </p>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              השם &quot;Footprint&quot; והלוגו הם סימני מסחר רשומים של בומרנג אפליקציות בע״מ.
            </p>
          </section>

          {/* Section 12: Jurisdiction */}
          <section id="jurisdiction" className="scroll-mt-20">
            <SectionHeader num={12} title="דין חל וסמכות שיפוט" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              על תקנון זה ועל כל הנובע ממנו יחולו אך ורק דיני מדינת ישראל.
            </p>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              סמכות השיפוט הבלעדית לדון בכל מחלוקת הנובעת מתקנון זה או מהשימוש באתר תהיה לבתי המשפט המוסמכים במחוז חיפה.
            </p>
          </section>

          {/* Section 13: Contact */}
          <section id="contact" className="scroll-mt-20">
            <SectionHeader num={13} title="יצירת קשר" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-5">
              לכל שאלה, בקשה, או תלונה, ניתן לפנות אלינו באמצעים הבאים:
            </p>

            <InfoCard icon={Mail} title="פרטי התקשרות">
              <InfoRow label="שם החברה:" value="בומרנג אפליקציות בע״מ" />
              <InfoRow label="מותג:" value="פוטפרינט - Footprint" />
              <InfoRow label="כתובת:" value="מעלה הנחל 115, רמות מנשה, מיקוד 19245, ת.ד. 340, ישראל" />
              <InfoRow label="טלפון:" value="058-432-3001" dir="ltr" />
              <InfoRow label="WhatsApp:" value="058-432-3002" dir="ltr" />
              <InfoRow label='דוא"ל כללי:' value={<a href="mailto:info@footprint.co.il" className="text-brand-purple underline underline-offset-2 decoration-brand-purple/30 hover:decoration-brand-purple">info@footprint.co.il</a>} />
              <InfoRow label='דוא"ל ביטולים:' value={<a href="mailto:cancel@footprint.co.il" className="text-brand-purple underline underline-offset-2 decoration-brand-purple/30 hover:decoration-brand-purple">cancel@footprint.co.il</a>} />
              <InfoRow label="שעות פעילות:" value="א'-ה': 09:00-18:00 | ו': 09:00-13:00" />
            </InfoCard>

            <p className="text-zinc-500 text-sm mt-6">
              אנו מתחייבים להשיב לכל פנייה תוך 2 ימי עסקים.
            </p>
          </section>

        </div>
      </div>

      {/* Footer - Matching main site style */}
      <footer className="bg-zinc-50 border-t border-zinc-200 py-16 px-5 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10 text-center lg:text-right">
            {/* Brand */}
            <div className="flex flex-col items-center lg:items-start">
              <img
                src="/footprint-logo-black-v2.svg"
                alt="פוטפרינט"
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
                <a href="https://wa.me/9720584323002" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500 hover:border-brand-purple hover:text-brand-purple transition">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-[15px] font-semibold text-zinc-900 mb-5">מוצרים</h4>
              <ul className="space-y-3">
                <li><Link href="/create" className="text-sm text-zinc-500 hover:text-zinc-900 transition">אמנות AI</Link></li>
                <li><Link href="/create" className="text-sm text-zinc-500 hover:text-zinc-900 transition">פורטרט משפחתי</Link></li>
                <li><Link href="/create" className="text-sm text-zinc-500 hover:text-zinc-900 transition">פורטרט חיות</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-[15px] font-semibold text-zinc-900 mb-5">מידע</h4>
              <ul className="space-y-3">
                <li><Link href="/#how" className="text-sm text-zinc-500 hover:text-zinc-900 transition">אודות</Link></li>
                <li><Link href="/#how" className="text-sm text-zinc-500 hover:text-zinc-900 transition">שאלות נפוצות</Link></li>
                <li><Link href="/track" className="text-sm text-zinc-500 hover:text-zinc-900 transition">משלוחים</Link></li>
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

          <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-center gap-6 text-[13px] text-zinc-500">
            <span>© 2025 פוטפרינט. כל הזכויות שמורות.</span>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-zinc-900 transition">תקנון</Link>
              <Link href="/privacy" className="hover:text-zinc-900 transition">פרטיות</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/9720584323002"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/40 z-50 hover:scale-110 transition"
        aria-label="WhatsApp"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </main>
  );
}

// Component: Section Header
function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-200">
      <span className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-pink rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0">
        {num}
      </span>
      <h2 className="text-[22px] font-semibold text-zinc-900">{title}</h2>
    </div>
  );
}

// Component: Alert Box
function AlertBox({ type, title, children }: { type: 'warning' | 'danger' | 'success' | 'info'; title: string; children: React.ReactNode }) {
  const styles = {
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      titleColor: 'text-amber-700',
      icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      titleColor: 'text-red-600',
      icon: AlertTriangle,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      titleColor: 'text-green-700',
      icon: CheckCircle,
    },
    info: {
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      titleColor: 'text-purple-700',
      icon: Info,
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-5 my-5`}>
      <h4 className={`${style.titleColor} text-[15px] font-semibold mb-2.5 flex items-center gap-2`}>
        <Icon className="w-4 h-4" />
        {title}
      </h4>
      <div className="text-zinc-600 text-sm leading-relaxed [&>p]:mb-2 [&>ul]:mt-2 [&>ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}

// Component: Info Card
function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 my-5 shadow-sm">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2.5 text-zinc-900">
        <Icon className="w-5 h-5 text-brand-purple" />
        {title}
      </h3>
      <div className="divide-y divide-zinc-200">
        {children}
      </div>
    </div>
  );
}

// Component: Info Row
function InfoRow({ label, value, dir }: { label: string; value: React.ReactNode; dir?: 'ltr' | 'rtl' }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="text-zinc-500 text-sm min-w-[100px]">{label}</span>
      <span className="text-zinc-900 text-sm" dir={dir}>{value}</span>
    </div>
  );
}
