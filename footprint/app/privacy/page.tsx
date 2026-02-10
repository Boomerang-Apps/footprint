import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, List, Clock, Building2, AlertTriangle, CheckCircle, Info, Users, Mail, Phone, MessageCircle, Instagram, Facebook, Lock, Eye, Camera, CreditCard, Monitor, Settings, Check } from 'lucide-react';
import { Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות | פוטפרינט',
  description: 'כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם באתר Footprint. פרטים על עוגיות, אבטחת מידע וזכויות המשתמש.',
  openGraph: {
    title: 'מדיניות פרטיות | פוטפרינט',
    description: 'כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם',
    url: 'https://footprint.co.il/privacy',
    siteName: 'פוטפרינט',
    locale: 'he_IL',
    type: 'website',
  },
};

// Table of contents data
const tocItems = [
  { id: 'intro', num: 1, label: 'מבוא' },
  { id: 'data-collected', num: 2, label: 'מידע שאנו אוספים' },
  { id: 'data-use', num: 3, label: 'שימוש במידע' },
  { id: 'data-sharing', num: 4, label: 'שיתוף מידע' },
  { id: 'cookies', num: 5, label: 'עוגיות (Cookies)' },
  { id: 'images', num: 6, label: 'תמונות ועיבוד AI' },
  { id: 'security', num: 7, label: 'אבטחת מידע' },
  { id: 'rights', num: 8, label: 'זכויות המשתמש' },
  { id: 'retention', num: 9, label: 'שמירת מידע' },
  { id: 'minors', num: 10, label: 'קטינים' },
  { id: 'changes', num: 11, label: 'שינויים במדיניות' },
  { id: 'contact', num: 12, label: 'יצירת קשר' },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Site Header with Logo and Navigation */}
      <Header />

      {/* Page Header - Green theme */}
      <header className="py-[60px] px-4 text-center border-b border-zinc-200 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-[800px] mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500/15 to-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5 text-green-600">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-[32px] lg:text-[40px] font-bold mb-3 text-zinc-900">מדיניות פרטיות</h1>
          <p className="text-zinc-500 text-base">כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם</p>
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
              <List className="w-5 h-5 text-green-600" />
              תוכן עניינים
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 text-sm hover:border-zinc-300 hover:text-zinc-900 hover:bg-white hover:shadow-sm transition"
                >
                  <span className="w-7 h-7 bg-gradient-to-br from-green-500/15 to-emerald-500/15 rounded-lg flex items-center justify-center text-xs font-semibold text-green-600">
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

          {/* Section 1: Introduction */}
          <section id="intro" className="scroll-mt-20">
            <SectionHeader num={1} title="מבוא" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              <strong>בומרנג אפליקציות בע״מ</strong> (להלן: &quot;החברה&quot;, &quot;אנחנו&quot;) מפעילה את אתר <strong>footprint.co.il</strong> (להלן: &quot;האתר&quot; או &quot;Footprint&quot;). אנו מכבדים את פרטיותכם ומחויבים להגן על המידע האישי שלכם.
            </p>

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              מדיניות פרטיות זו מסבירה אילו סוגי מידע אנו אוספים, כיצד אנו משתמשים בו, עם מי אנו עשויים לשתף אותו, וכיצד אנו מגנים עליו. המדיניות חלה על כל השימוש באתר ובשירותים שלנו.
            </p>

            <AlertBox type="success" title="המחויבות שלנו">
              <p>פרטיותכם חשובה לנו. אנו מתחייבים:</p>
              <ul className="list-disc pr-5 mt-2 space-y-1">
                <li>לאסוף רק מידע הכרחי לאספקת השירות</li>
                <li>לא למכור את המידע שלכם לצדדים שלישיים</li>
                <li>למחוק תמונות תוך 30 יום מהשלמת ההזמנה</li>
                <li>להשתמש באבטחה מתקדמת להגנה על המידע</li>
              </ul>
            </AlertBox>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              השימוש באתר מהווה הסכמה למדיניות פרטיות זו. אם אינכם מסכימים לתנאים המפורטים כאן, אנא הימנעו משימוש באתר.
            </p>
          </section>

          {/* Section 2: Data Collected */}
          <section id="data-collected" className="scroll-mt-20">
            <SectionHeader num={2} title="מידע שאנו אוספים" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              אנו אוספים מספר סוגי מידע כדי לספק לכם את השירותים שלנו:
            </p>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">מידע שאתם מספקים לנו</h3>

            <DataCard icon={Users} title="פרטים אישיים">
              <DataItem>שם מלא</DataItem>
              <DataItem>כתובת דואר אלקטרוני</DataItem>
              <DataItem>מספר טלפון</DataItem>
              <DataItem>כתובת למשלוח</DataItem>
            </DataCard>

            <DataCard icon={Camera} title="תמונות">
              <DataItem>תמונות שאתם מעלים לעיבוד והדפסה</DataItem>
              <DataItem>תמונות מעובדות לאחר עיבוד AI</DataItem>
            </DataCard>

            <DataCard icon={CreditCard} title="פרטי תשלום">
              <DataItem>פרטי התשלום מעובדים ישירות על ידי ספק הסליקה המאובטח</DataItem>
              <DataItem>אנחנו לא שומרים פרטי כרטיס אשראי מלאים במערכותינו</DataItem>
            </DataCard>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">מידע שנאסף אוטומטית</h3>

            <DataCard icon={Monitor} title="מידע טכני">
              <DataItem>כתובת IP</DataItem>
              <DataItem>סוג הדפדפן ומערכת ההפעלה</DataItem>
              <DataItem>עמודים שנצפו ומשך השהייה</DataItem>
              <DataItem>מקור ההפניה (Referrer)</DataItem>
              <DataItem>מזהה מכשיר</DataItem>
            </DataCard>
          </section>

          {/* Section 3: Data Use */}
          <section id="data-use" className="scroll-mt-20">
            <SectionHeader num={3} title="שימוש במידע" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              אנו משתמשים במידע שנאסף למטרות הבאות:
            </p>

            <div className="overflow-x-auto my-5 rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">מטרה</th>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">פירוט</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>אספקת השירות</strong></td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עיבוד תמונות, הפקת הדפסים, ביצוע משלוחים</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>תקשורת</strong></td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">אישורי הזמנה, עדכוני סטטוס, מענה לפניות</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>שיפור השירות</strong></td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">ניתוח שימוש באתר, שיפור חווית המשתמש</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>אבטחה</strong></td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">מניעת הונאות, הגנה על המערכות</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>עמידה בחוק</strong></td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">מילוי חובות משפטיות ורגולטוריות</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <AlertBox type="info" title="שיווק ופרסום">
              <p>אנו עשויים לשלוח לכם עדכונים ומבצעים רק אם נתתם הסכמה מפורשת לכך. תוכלו להסיר את עצמכם מרשימת התפוצה בכל עת באמצעות קישור &quot;הסרה&quot; בתחתית כל דיוור.</p>
            </AlertBox>
          </section>

          {/* Section 4: Data Sharing */}
          <section id="data-sharing" className="scroll-mt-20">
            <SectionHeader num={4} title="שיתוף מידע עם צדדים שלישיים" />

            <AlertBox type="success" title="אנחנו לא מוכרים את המידע שלכם">
              <p>אנו מתחייבים שלא למכור, להשכיר או לסחור במידע האישי שלכם לצדדים שלישיים למטרות שיווק.</p>
            </AlertBox>

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              אנו עשויים לשתף מידע עם הגורמים הבאים, אך ורק במידה הנדרשת לאספקת השירות:
            </p>

            <div className="overflow-x-auto my-5 rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">גורם</th>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">מטרה</th>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">מידע משותף</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">ספק סליקה</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עיבוד תשלומים</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">פרטי תשלום (מאובטח PCI-DSS)</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">חברות שילוח</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">משלוח הזמנות</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">שם, כתובת, טלפון</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">ספקי AI</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עיבוד תמונות</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">התמונה בלבד (ללא פרטים מזהים)</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">שירותי ענן</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">אחסון ועיבוד</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">מידע מוצפן</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">רשויות</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עמידה בחוק</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">לפי דרישה חוקית בלבד</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              כל ספקי השירות שלנו מחויבים בהסכמי סודיות ואבטחת מידע.
            </p>
          </section>

          {/* Section 5: Cookies */}
          <section id="cookies" className="scroll-mt-20">
            <SectionHeader num={5} title="עוגיות (Cookies)" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              האתר משתמש בעוגיות - קבצי טקסט קטנים הנשמרים במכשיר שלכם - לצורך שיפור חווית השימוש.
            </p>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">סוגי העוגיות בשימוש</h3>

            <div className="overflow-x-auto my-5 rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">סוג</th>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">מטרה</th>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">משך</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>הכרחיות</strong></td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">תפקוד בסיסי של האתר, עגלת קניות, התחברות</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">סשן / עד שנה</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>ביצועים</strong></td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">ניתוח שימוש באתר (Google Analytics)</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עד שנתיים</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>פונקציונליות</strong></td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">זכירת העדפות (שפה, גודל תצוגה)</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">עד שנה</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <AlertBox type="blue" title="ניהול עוגיות">
              <p>תוכלו לנהל את העדפות העוגיות שלכם דרך הגדרות הדפדפן. שימו לב שחסימת עוגיות מסוימות עלולה לפגוע בתפקוד האתר.</p>
            </AlertBox>
          </section>

          {/* Section 6: Images */}
          <section id="images" className="scroll-mt-20">
            <SectionHeader num={6} title="תמונות ועיבוד AI" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              התמונות שאתם מעלים הן חלק מרכזי בשירות שלנו. להלן הפירוט המלא על האופן שבו אנו מטפלים בהן:
            </p>

            <AlertBox type="success" title="מחיקה אוטומטית">
              <p>כל התמונות (המקוריות והמעובדות) נמחקות אוטומטית מהמערכות שלנו תוך <strong>30 יום</strong> מהשלמת ההזמנה.</p>
            </AlertBox>

            <h3 className="text-[17px] font-semibold text-zinc-900 mt-7 mb-3.5">תהליך העיבוד</h3>
            <ol className="list-decimal pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed mb-5">
              <li>התמונה שלכם מועלית לשרתים מאובטחים שלנו</li>
              <li>התמונה נשלחת לספק ה-AI לעיבוד (ללא פרטים מזהים)</li>
              <li>התמונה המעובדת נשמרת לצורך הדפסה</li>
              <li>לאחר הדפסה ומשלוח - כל התמונות נמחקות</li>
            </ol>

            <AlertBox type="warning" title="חשוב לדעת">
              <ul className="list-disc pr-5 space-y-1">
                <li>אנו לא משתמשים בתמונות שלכם לאימון מודלים של AI</li>
                <li>אנו לא משתפים את התמונות שלכם עם צדדים שלישיים (מלבד לצורך העיבוד)</li>
                <li>התמונות מאוחסנות בצורה מוצפנת</li>
              </ul>
            </AlertBox>
          </section>

          {/* Section 7: Security */}
          <section id="security" className="scroll-mt-20">
            <SectionHeader num={7} title="אבטחת מידע" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              אנו משקיעים משאבים רבים בהגנה על המידע שלכם:
            </p>

            <DataCard icon={Lock} title="אמצעי אבטחה">
              <DataItem><strong>הצפנת SSL/TLS</strong> - כל התקשורת עם האתר מוצפנת</DataItem>
              <DataItem><strong>הצפנת מידע</strong> - נתונים רגישים מוצפנים גם באחסון</DataItem>
              <DataItem><strong>PCI-DSS</strong> - תשלומים מעובדים בתקן האבטחה הגבוה ביותר</DataItem>
              <DataItem><strong>גיבויים</strong> - גיבויים מוצפנים באופן קבוע</DataItem>
              <DataItem><strong>בקרת גישה</strong> - הרשאות מוגבלות לעובדים מורשים בלבד</DataItem>
              <DataItem><strong>ניטור</strong> - מערכות ניטור אבטחה פעילות 24/7</DataItem>
            </DataCard>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              על אף מאמצינו, אין מערכת מחשוב שהיא חסינה לחלוטין. במקרה של אירוע אבטחה משמעותי, נודיע לכם ולרשויות הרלוונטיות בהתאם לחוק.
            </p>
          </section>

          {/* Section 8: Rights */}
          <section id="rights" className="scroll-mt-20">
            <SectionHeader num={8} title="זכויות המשתמש" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              בהתאם לחוק הגנת הפרטיות ותקנות הגנת הפרטיות, עומדות לכם הזכויות הבאות:
            </p>

            <div className="overflow-x-auto my-5 rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">זכות</th>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">הסבר</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>זכות העיון</strong></td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">לקבל מידע על הנתונים שאנו שומרים עליכם</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>זכות התיקון</strong></td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">לבקש תיקון מידע שגוי או לא מדויק</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>זכות המחיקה</strong></td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">לבקש מחיקת המידע שלכם (בכפוף לחובות משפטיות)</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>זכות ההתנגדות</strong></td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">להתנגד לעיבוד מידע לצרכי שיווק</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200"><strong>זכות הניוד</strong></td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">לקבל העתק של המידע בפורמט מובנה</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <AlertBox type="info" title="כיצד לממש את זכויותיכם">
              <p>לכל בקשה הנוגעת לזכויותיכם, אנא פנו אלינו בדוא&quot;ל <a href="mailto:privacy@footprint.co.il" className="text-purple-700 underline">privacy@footprint.co.il</a>. נשיב לפנייתכם תוך 30 יום.</p>
            </AlertBox>
          </section>

          {/* Section 9: Retention */}
          <section id="retention" className="scroll-mt-20">
            <SectionHeader num={9} title="תקופת שמירת מידע" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              אנו שומרים מידע למשך הזמן הנדרש למטרות שלשמן נאסף:
            </p>

            <div className="overflow-x-auto my-5 rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full min-w-[400px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">סוג מידע</th>
                    <th className="bg-gradient-to-l from-green-600 to-emerald-500 text-white font-semibold text-sm text-right px-4 py-3.5">תקופת שמירה</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">תמונות (מקור ומעובדות)</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">30 יום מהשלמת ההזמנה</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">פרטי הזמנה וחשבונית</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">7 שנים (חובה חוקית)</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">פרטי חשבון משתמש</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">כל עוד החשבון פעיל + שנה</td>
                  </tr>
                  <tr>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">תכתובות תמיכה</td>
                    <td className="bg-zinc-50 text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">3 שנים</td>
                  </tr>
                  <tr>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">לוגים טכניים</td>
                    <td className="bg-white text-zinc-600 text-sm px-4 py-3.5 border-t border-zinc-200">90 יום</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              לאחר תום תקופת השמירה, המידע נמחק או מתבצע לו אנונימיזציה.
            </p>
          </section>

          {/* Section 10: Minors */}
          <section id="minors" className="scroll-mt-20">
            <SectionHeader num={10} title="קטינים" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              השירותים שלנו אינם מיועדים לקטינים מתחת לגיל 18. אנו לא אוספים ביודעין מידע אישי מקטינים.
            </p>

            <AlertBox type="danger" title="הורים ואפוטרופוסים">
              <p>אם נודע לכם שקטין מסר לנו מידע אישי, אנא צרו איתנו קשר מיידית ונמחק את המידע.</p>
            </AlertBox>
          </section>

          {/* Section 11: Changes */}
          <section id="changes" className="scroll-mt-20">
            <SectionHeader num={11} title="שינויים במדיניות" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-4">
              אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. במקרה של שינויים מהותיים:
            </p>

            <ul className="list-disc pr-5 space-y-2.5 text-zinc-600 text-[15px] leading-relaxed mb-4">
              <li>נפרסם הודעה בולטת באתר</li>
              <li>נעדכן את תאריך &quot;עדכון אחרון&quot; בראש המסמך</li>
              <li>במקרים משמעותיים - נשלח הודעה במייל ללקוחות רשומים</li>
            </ul>

            <p className="text-zinc-600 text-[15px] leading-relaxed">
              המשך השימוש באתר לאחר פרסום השינויים מהווה הסכמה למדיניות המעודכנת.
            </p>
          </section>

          {/* Section 12: Contact */}
          <section id="contact" className="scroll-mt-20">
            <SectionHeader num={12} title="יצירת קשר" />

            <p className="text-zinc-600 text-[15px] leading-relaxed mb-5">
              לכל שאלה, הערה או בקשה בנושא פרטיות, אנא פנו אלינו:
            </p>

            <InfoCard icon={Mail} title="פרטי התקשרות - פרטיות">
              <InfoRow label="שם החברה:" value="בומרנג אפליקציות בע״מ" />
              <InfoRow label="מותג:" value="פוטפרינט - Footprint" />
              <InfoRow label="כתובת:" value="מעלה הנחל 115, רמות מנשה, מיקוד 19245, ת.ד. 340, ישראל" />
              <InfoRow label='דוא"ל פרטיות:' value={<a href="mailto:privacy@footprint.co.il" className="text-green-600 underline underline-offset-2 decoration-green-600/30 hover:decoration-green-600">privacy@footprint.co.il</a>} />
              <InfoRow label='דוא"ל כללי:' value={<a href="mailto:info@footprint.co.il" className="text-green-600 underline underline-offset-2 decoration-green-600/30 hover:decoration-green-600">info@footprint.co.il</a>} />
              <InfoRow label="טלפון:" value="058-432-3001" dir="ltr" />
            </InfoCard>

            <p className="text-zinc-500 text-sm mt-6">
              אנו מתחייבים להשיב לכל פנייה בנושא פרטיות תוך 30 יום.
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

// Component: Section Header - Green theme
function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-200">
      <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0">
        {num}
      </span>
      <h2 className="text-[22px] font-semibold text-zinc-900">{title}</h2>
    </div>
  );
}

// Component: Alert Box
function AlertBox({ type, title, children }: { type: 'warning' | 'danger' | 'success' | 'info' | 'blue'; title: string; children: React.ReactNode }) {
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
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      titleColor: 'text-blue-700',
      icon: Settings,
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

// Component: Info Card - Green theme
function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 my-5 shadow-sm">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2.5 text-zinc-900">
        <Icon className="w-5 h-5 text-green-600" />
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

// Component: Data Card - Green theme
function DataCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 my-4">
      <h4 className="text-[15px] font-semibold mb-3 flex items-center gap-2 text-zinc-900">
        <Icon className="w-5 h-5 text-green-600" />
        {title}
      </h4>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

// Component: Data Item
function DataItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-zinc-600">
      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
