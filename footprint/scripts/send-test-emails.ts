/**
 * One-off script to send test emails (customer confirmation + shop owner notification)
 * to orders@footprint.co.il for visual verification.
 *
 * Usage: npx tsx scripts/send-test-emails.ts
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || 'noreply@updates.footprint.co.il';
const TO = 'orders@footprint.co.il';

if (!API_KEY) {
  console.error('RESEND_API_KEY is not set');
  process.exit(1);
}

// ─── Shared test data ────────────────────────────────────────────────

const testOrder = {
  orderNumber: 'FP-20260208-TEST01',
  customerName: 'ישראל ישראלי',
  customerEmail: TO,
  customerPhone: '050-1234567',
  userId: 'user-test-uuid',
  items: [
    {
      name: 'הדפס פופ ארט - A3',
      quantity: 1,
      price: 249,
      imageUrl: 'https://replicate.delivery/xezq/2sMplCrSqVMrmCNMcoSxXDHqExHVAl6pxPMVfJjGmhveFfwUA/out-0.webp',
      style: 'Pop Art',
      size: 'A3',
      paper: 'Glossy',
      frame: 'Black',
    },
    {
      name: 'הדפס צבעי מים - A4',
      quantity: 2,
      price: 179,
      imageUrl: 'https://replicate.delivery/xezq/2sMplCrSqVMrmCNMcoSxXDHqExHVAl6pxPMVfJjGmhveFfwUA/out-0.webp',
      style: 'Watercolor',
      size: 'A4',
      paper: 'Matte',
      frame: 'ללא',
    },
  ],
  subtotal: 607,
  shipping: 35,
  total: 642,
  shippingAddress: {
    street: 'רחוב דיזנגוף 99',
    city: 'תל אביב',
    postalCode: '6433101',
    country: 'ישראל',
  },
  isGift: true,
  giftMessage: 'יום הולדת שמח! 🎂 מקווה שתאהבי את ההדפסים',
  createdAt: new Date().toISOString(),
  paymentProvider: 'payplus',
};

// ─── Helpers ─────────────────────────────────────────────────────────

function formatDateHebrew(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPaymentProvider(provider?: string): string {
  if (!provider) return 'לא צוין';
  const providers: Record<string, string> = { payplus: 'PayPlus', stripe: 'Stripe' };
  return providers[provider] || provider;
}

// ─── Customer confirmation HTML ──────────────────────────────────────

function buildCustomerHtml(): string {
  const {
    customerName, orderNumber, items, subtotal, shipping, total,
    shippingAddress, isGift, giftMessage, createdAt,
  } = testOrder;

  const timestampHtml = createdAt
    ? `<p style="margin: 4px 0 0; color: #737373; font-size: 14px;">${formatDateHebrew(createdAt)}</p>`
    : '';

  const itemsHtml = items.map(item => {
    const specs = [
      item.style ? `סגנון: ${item.style}` : '',
      item.size ? `גודל: ${item.size}` : '',
      item.paper ? `נייר: ${item.paper}` : '',
      item.frame ? `מסגרת: ${item.frame}` : '',
    ].filter(Boolean).join(' | ');

    return `
    <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
      ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="max-width: 100%; max-height: 300px; border-radius: 8px; display: block; margin-bottom: 8px;" />` : ''}
      <p style="margin: 8px 0 4px; font-weight: bold; font-size: 15px; color: #1a1a1a;">${item.name}</p>
      ${specs ? `<p style="margin: 0 0 4px; color: #737373; font-size: 13px;">${specs}</p>` : ''}
      <p style="margin: 0; color: #525252; font-size: 14px;">כמות: ${item.quantity} | מחיר: ₪${item.price.toFixed(2)}</p>
    </div>`;
  }).join('');

  const giftHtml = isGift ? `
    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f59e0b;">
      <h3 style="margin: 0 0 8px 0; color: #92400e;">🎁 הזמנת מתנה</h3>
      ${giftMessage ? `<p style="margin: 0; color: #78350f;">"${giftMessage}"</p>` : '<p style="margin: 0; color: #78350f;">ללא הודעה</p>'}
    </div>` : '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>אישור הזמנה - ${orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; background: #fafafa;">
  <div style="text-align: center; margin-bottom: 24px; padding: 28px 24px 20px; background: #1a1a1a; border-radius: 12px;">
    <img src="https://www.footprint.co.il/footprint-logo-white-v2.svg" alt="Footprint" width="72" height="72" style="display: block; margin: 0 auto 12px;" />
    <p style="color: #a3a3a3; margin: 0 0 16px; font-size: 14px;">תודה על ההזמנה!</p>
    <div style="height: 3px; background: linear-gradient(to left, #8b5cf6, #ec4899); border-radius: 2px; width: 80px; margin: 0 auto;"></div>
  </div>
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <p style="margin: 0 0 8px; font-size: 16px;">שלום ${customerName},</p>
    <p style="margin: 0; color: #525252;">ההזמנה שלך התקבלה בהצלחה! אנחנו כבר מתחילים להכין את היצירה שלך.</p>
  </div>
  <div style="background: #f5f3ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #c4b5fd;">
    <h2 style="margin: 0; color: #5b21b6; font-size: 20px;">הזמנה #${orderNumber}</h2>
    ${timestampHtml}
  </div>
  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">🖼️ הפריטים שלך</h3>
    ${itemsHtml}
  </div>
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">💰 סיכום מחירים</h3>
    <table style="width: 100%;">
      <tr><td style="padding: 6px 0; color: #737373;">סכום ביניים:</td><td style="padding: 6px 0; text-align: left; color: #525252;">₪${subtotal.toFixed(2)}</td></tr>
      <tr><td style="padding: 6px 0; color: #737373;">משלוח:</td><td style="padding: 6px 0; text-align: left; color: #525252;">₪${shipping.toFixed(2)}</td></tr>
      <tr style="border-top: 2px solid #e5e5e5;"><td style="padding: 10px 0 6px; font-weight: bold; font-size: 18px;">סה"כ:</td><td style="padding: 10px 0 6px; text-align: left; font-weight: bold; font-size: 18px; color: #8b5cf6;">₪${total.toFixed(2)}</td></tr>
    </table>
  </div>
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">📦 כתובת למשלוח</h3>
    <p style="margin: 0; color: #525252;">${shippingAddress.street}<br>${shippingAddress.city}, ${shippingAddress.postalCode}<br>${shippingAddress.country}</p>
  </div>
  ${giftHtml}
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">מה הלאה?</h3>
    <table style="width: 100%;">
      <tr><td style="padding: 8px 0; color: #525252;">1. אנחנו מתחילים ליצור את ההדפס המותאם אישית שלך</td></tr>
      <tr><td style="padding: 8px 0; color: #525252;">2. תקבל/י אישור משלוח עם מספר מעקב</td></tr>
      <tr><td style="padding: 8px 0; color: #525252;">3. ההדפס יגיע תוך 5-7 ימי עסקים</td></tr>
    </table>
  </div>
  <div style="text-align: center; padding: 20px 0 0;">
    <div style="height: 2px; background: linear-gradient(to left, #8b5cf6, #ec4899); border-radius: 1px; margin-bottom: 16px;"></div>
    <p style="margin: 0 0 8px; color: #737373; font-size: 13px;">שאלות? השב/י למייל זה או צור/צרי קשר ב-support@footprint.co.il</p>
    <p style="margin: 0; color: #a3a3a3; font-size: 13px;">&copy; ${new Date().getFullYear()} Footprint | www.footprint.co.il</p>
  </div>
</body>
</html>`;
}

// ─── Shop owner notification HTML ────────────────────────────────────

function buildOwnerHtml(): string {
  const {
    orderNumber, customerName, customerEmail, customerPhone,
    userId, items, subtotal, shipping, total, shippingAddress,
    paymentProvider, isGift, giftMessage, createdAt,
  } = testOrder;

  const accountBadge = userId
    ? '<span style="display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">לקוח רשום</span>'
    : '<span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">אורח</span>';

  const phoneRow = customerPhone
    ? `<tr><td style="padding: 4px 0; color: #737373; width: 80px;">טלפון:</td><td style="padding: 4px 0;">${customerPhone}</td></tr>`
    : '';

  const timestampHtml = createdAt
    ? `<p style="margin: 4px 0 0; color: #737373; font-size: 14px;">${formatDateHebrew(createdAt)}</p>`
    : '';

  const firstImageUrl = items.find(i => i.imageUrl)?.imageUrl;

  const itemsHtml = items.map(item => {
    const specs = [
      item.style ? `סגנון: ${item.style}` : '',
      item.size ? `גודל: ${item.size}` : '',
      item.paper ? `נייר: ${item.paper}` : '',
      item.frame ? `מסגרת: ${item.frame}` : '',
    ].filter(Boolean).join(' | ');
    const downloadLink = item.imageUrl
      ? `<a href="${item.imageUrl}" target="_blank" style="display: inline-block; margin-top: 8px; color: #8b5cf6; font-size: 13px; text-decoration: none;">📥 הורד תמונה</a>`
      : '';
    return `
    <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
      ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="max-width: 100%; max-height: 300px; border-radius: 8px; display: block; margin-bottom: 8px;" />` : ''}
      ${downloadLink}
      <p style="margin: 8px 0 4px; font-weight: bold; font-size: 15px; color: #1a1a1a;">${item.name}</p>
      ${specs ? `<p style="margin: 0 0 4px; color: #737373; font-size: 13px;">${specs}</p>` : ''}
      <p style="margin: 0; color: #525252; font-size: 14px;">כמות: ${item.quantity} | מחיר: ₪${item.price.toFixed(2)}</p>
    </div>`;
  }).join('');

  const giftHtml = isGift ? `
    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f59e0b;">
      <h3 style="margin: 0 0 8px 0; color: #92400e;">🎁 הזמנת מתנה</h3>
      ${giftMessage ? `<p style="margin: 0; color: #78350f;">"${giftMessage}"</p>` : '<p style="margin: 0; color: #78350f;">ללא הודעה</p>'}
    </div>` : '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>הזמנה חדשה - ${orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; background: #fafafa;">
  <div style="text-align: center; margin-bottom: 24px; padding: 28px 24px 20px; background: #1a1a1a; border-radius: 12px;">
    <img src="https://www.footprint.co.il/footprint-logo-white-v2.svg" alt="Footprint" width="72" height="72" style="display: block; margin: 0 auto 12px;" />
    <p style="color: #a3a3a3; margin: 0 0 16px; font-size: 14px;">הזמנה חדשה התקבלה!</p>
    <div style="height: 3px; background: linear-gradient(to left, #8b5cf6, #ec4899); border-radius: 2px; width: 80px; margin: 0 auto;"></div>
  </div>
  <div style="background: #f5f3ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #c4b5fd;">
    <h2 style="margin: 0; color: #5b21b6; font-size: 20px;">הזמנה #${orderNumber}</h2>
    ${timestampHtml}
  </div>
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">👤 פרטי לקוח</h3>
    <table style="width: 100%;" cellpadding="0" cellspacing="0">
      <tr>
        ${firstImageUrl ? `<td style="width: 120px; vertical-align: top; padding-left: 16px;"><img src="${firstImageUrl}" alt="תצוגה מקדימה" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; display: block;" /></td>` : ''}
        <td style="vertical-align: top;">
          <table style="width: 100%;">
            <tr><td style="padding: 4px 0; color: #737373; width: 80px;">שם:</td><td style="padding: 4px 0; font-weight: bold;">${customerName}</td></tr>
            <tr><td style="padding: 4px 0; color: #737373;">אימייל:</td><td style="padding: 4px 0;">${customerEmail}</td></tr>
            ${phoneRow}
            <tr><td style="padding: 4px 0; color: #737373;">חשבון:</td><td style="padding: 4px 0;">${accountBadge}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">🖼️ פריטים</h3>
    ${itemsHtml}
  </div>
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">💰 סיכום מחירים</h3>
    <table style="width: 100%;">
      <tr><td style="padding: 6px 0; color: #737373;">סכום ביניים:</td><td style="padding: 6px 0; text-align: left; color: #525252;">₪${subtotal.toFixed(2)}</td></tr>
      <tr><td style="padding: 6px 0; color: #737373;">משלוח:</td><td style="padding: 6px 0; text-align: left; color: #525252;">₪${shipping.toFixed(2)}</td></tr>
      <tr style="border-top: 2px solid #e5e5e5;"><td style="padding: 10px 0 6px; font-weight: bold; font-size: 18px;">סה"כ:</td><td style="padding: 10px 0 6px; text-align: left; font-weight: bold; font-size: 18px; color: #8b5cf6;">₪${total.toFixed(2)}</td></tr>
      <tr><td style="padding: 4px 0; color: #737373;">תשלום:</td><td style="padding: 4px 0; text-align: left; color: #525252;">${formatPaymentProvider(paymentProvider)}</td></tr>
    </table>
  </div>
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">📦 כתובת למשלוח</h3>
    <p style="margin: 0; color: #525252;">${shippingAddress.street}<br>${shippingAddress.city}, ${shippingAddress.postalCode}<br>${shippingAddress.country}</p>
  </div>
  ${giftHtml}
  <div style="text-align: center; padding: 20px 0 0;">
    <div style="height: 2px; background: linear-gradient(to left, #8b5cf6, #ec4899); border-radius: 1px; margin-bottom: 16px;"></div>
    <p style="margin: 0; color: #a3a3a3; font-size: 13px;">&copy; ${new Date().getFullYear()} Footprint | www.footprint.co.il</p>
  </div>
</body>
</html>`;
}

// ─── Send ────────────────────────────────────────────────────────────

async function sendEmail(subject: string, html: string, fromName: string): Promise<void> {
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      from: `${fromName} <${FROM}>`,
      to: TO,
      subject,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend API error ${res.status}: ${JSON.stringify(data)}`);
  }
  console.log(`  -> sent, id: ${(data as { id: string }).id}`);
}

async function main(): Promise<void> {
  console.log('Sending test emails to', TO, '...\n');

  console.log('1. Customer confirmation email');
  await sendEmail(
    `אישור הזמנה - Footprint #${testOrder.orderNumber}`,
    buildCustomerHtml(),
    'Footprint',
  );

  console.log('2. Shop owner notification email');
  await sendEmail(
    `הזמנה חדשה! ${testOrder.orderNumber} - ${testOrder.customerName}`,
    buildOwnerHtml(),
    'Footprint',
  );

  console.log('\nDone! Check orders@footprint.co.il inbox.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
