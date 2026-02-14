/**
 * Email Service - Resend Integration
 *
 * Handles sending transactional emails via Resend API.
 * https://resend.com/docs
 */

import { fetchWithTimeout, TIMEOUT_DEFAULTS } from '@/lib/utils/fetch-with-timeout';

// ============================================================================
// Types
// ============================================================================

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number; // in ILS
}

export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderConfirmationParams {
  to: string;
  customerName: string;
  orderNumber: string;
  items: NewOrderNotificationItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  customerPhone?: string;
  isGift?: boolean;
  giftMessage?: string;
  createdAt?: string;
}

export interface StatusUpdateParams {
  to: string;
  customerName: string;
  orderId: string;
  newStatus: string;
  note?: string;
}

export interface TrackingNotificationParams {
  to: string;
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string | null;
}

export interface NewOrderNotificationItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  style?: string;
  size?: string;
  paper?: string;
  frame?: string;
  hasPassepartout?: boolean;
}

export interface NewOrderNotificationParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  userId?: string;
  items: NewOrderNotificationItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentProvider?: string;
  isGift: boolean;
  giftMessage?: string;
  createdAt?: string;
}

export interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM_EMAIL = 'noreply@updates.footprint.co.il';

// Hebrew translation maps for item specs
const STYLE_NAMES_HE: Record<string, string> = {
  pop_art: 'פופ ארט',
  watercolor: 'צבעי מים',
  line_art: 'ציור קווי',
  line_art_watercolor: 'קו+מים',
  original: 'מקורי',
};

const PAPER_NAMES_HE: Record<string, string> = {
  matte: 'נייר פיין ארט מט',
  glossy: 'נייר צילום מבריק',
  canvas: 'קנבס',
};

const FRAME_NAMES_HE: Record<string, string> = {
  none: 'ללא מסגרת',
  black: 'שחורה',
  white: 'לבנה',
  oak: 'אלון',
};

function translateSpec(value: string | undefined, map: Record<string, string>): string {
  if (!value) return '';
  const lower = value.toLowerCase().replace(/\s+/g, '_');
  return map[lower] || map[value] || value;
}

// Frame border colors for visual preview in emails
const FRAME_BORDER_COLORS: Record<string, string> = {
  none: '',
  black: '#1a1a1a',
  white: '#ffffff',
  oak: '#b8860b',
};

function getFrameImageStyle(frame: string | undefined): string {
  if (!frame || frame === 'none') {
    return 'max-width: 100%; max-height: 300px; border-radius: 8px; display: block; margin: 0 auto 8px;';
  }
  const color = FRAME_BORDER_COLORS[frame.toLowerCase()] || '';
  if (!color) {
    return 'max-width: 100%; max-height: 300px; border-radius: 8px; display: block; margin: 0 auto 8px;';
  }
  // White frame needs an outer shadow to be visible on white/light backgrounds
  const shadow = frame.toLowerCase() === 'white' ? 'box-shadow: 0 0 0 1px #e5e5e5;' : '';
  return `max-width: 100%; max-height: 300px; display: block; margin: 0 auto 8px; border: 8px solid ${color}; ${shadow}`;
}

/**
 * Generates the complete image HTML for an email item, including
 * passepartout (white mat border) when applicable.
 */
function getFrameImageHtml(item: NewOrderNotificationItem): string {
  if (!item.imageUrl) return '';
  const frame = item.frame;
  const hasFrame = frame && frame !== 'none';
  const color = hasFrame ? (FRAME_BORDER_COLORS[frame.toLowerCase()] || '') : '';

  if (item.hasPassepartout && hasFrame && color) {
    // Passepartout + frame: outer frame border → white padding → image
    const shadow = frame.toLowerCase() === 'white' ? 'box-shadow: 0 0 0 1px #e5e5e5;' : '';
    return `<div style="text-align: center;"><div style="display: inline-block; border: 8px solid ${color}; background: white; padding: 12px; ${shadow}"><img src="${item.imageUrl}" alt="${item.name}" style="max-width: 100%; max-height: 276px; display: block;" /></div></div>`;
  }

  // Default: use inline style (no passepartout)
  const imgStyle = getFrameImageStyle(frame);
  return `<div style="text-align: center;"><img src="${item.imageUrl}" alt="${item.name}" style="${imgStyle}" /></div>`;
}

/**
 * Gets Resend configuration from environment variables.
 */
export function getResendConfig(): ResendConfig {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  return {
    apiKey,
    fromEmail: process.env.EMAIL_FROM || DEFAULT_FROM_EMAIL,
  };
}

// ============================================================================
// Order Number Generation
// ============================================================================

/**
 * Generates a unique order number.
 * Format: FP-YYYYMMDD-XXXXXX
 * Example: FP-20231223-A1B2C3
 */
export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FP-${date}-${random}`;
}

// ============================================================================
// Email Templates
// ============================================================================

/**
 * Generates branded HTML email template for customer order confirmation.
 * Hebrew RTL, Footprint brand styling matching the shop owner notification.
 */
function generateOrderConfirmationHtml(params: OrderConfirmationParams): string {
  const {
    customerName, orderNumber, items, subtotal, shipping, total,
    shippingAddress, isGift, giftMessage, createdAt,
  } = params;

  const timestampHtml = createdAt
    ? `<p style="margin: 4px 0 0; color: #737373; font-size: 14px;">${formatDateHebrew(createdAt)}</p>`
    : '';

  const itemsHtml = items
    .map(
      (item) => {
        const styleName = translateSpec(item.style, STYLE_NAMES_HE);
        const paperName = translateSpec(item.paper, PAPER_NAMES_HE);
        const frameName = translateSpec(item.frame, FRAME_NAMES_HE);
        const specs = [
          styleName ? `סגנון: ${styleName}` : '',
          item.size ? `גודל: ${item.size}` : '',
          paperName ? `נייר: ${paperName}` : '',
          frameName && item.frame !== 'none' ? `מסגרת: ${frameName}` : '',
          item.hasPassepartout ? 'פספרטו' : '',
        ].filter(Boolean).join(' | ');

        const imageHtml = getFrameImageHtml(item);

        return `
        <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
          ${imageHtml}
          <p style="margin: 8px 0 4px; font-weight: bold; font-size: 15px; color: #1a1a1a; text-align: center;">${styleName && item.size ? `${styleName} - ${item.size}` : item.name}</p>
          ${specs ? `<p style="margin: 0 0 4px; color: #737373; font-size: 13px; text-align: center;">${specs}</p>` : ''}
          <p style="margin: 0; color: #525252; font-size: 14px; text-align: center;">כמות: ${item.quantity} | מחיר: ₪${item.price.toFixed(2)}</p>
        </div>`;
      }
    )
    .join('');

  const giftHtml = isGift
    ? `
    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f59e0b;">
      <h3 style="margin: 0 0 8px 0; color: #92400e;">🎁 הזמנת מתנה</h3>
      ${giftMessage ? `<p style="margin: 0; color: #78350f;">"${giftMessage}"</p>` : '<p style="margin: 0; color: #78350f;">ללא הודעה</p>'}
    </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>אישור הזמנה - ${orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; background: #fafafa;">

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 24px; padding: 28px 24px 20px; background: #1a1a1a; border-radius: 12px;">
    <img src="https://www.footprint.co.il/footprint-logo-white-v2.svg" alt="Footprint" width="72" height="72" style="display: block; margin: 0 auto 12px;" />
    <p style="color: #a3a3a3; margin: 0 0 16px; font-size: 14px;">תודה על ההזמנה!</p>
    <div style="height: 3px; background: linear-gradient(to left, #8b5cf6, #ec4899); border-radius: 2px; width: 80px; margin: 0 auto;"></div>
  </div>

  <!-- Greeting -->
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <p style="margin: 0 0 8px; font-size: 16px;">שלום ${customerName},</p>
    <p style="margin: 0; color: #525252;">ההזמנה שלך התקבלה בהצלחה! אנחנו כבר מתחילים להכין את היצירה שלך.</p>
  </div>

  <!-- Order badge -->
  <div style="background: #f5f3ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #c4b5fd;">
    <h2 style="margin: 0; color: #5b21b6; font-size: 20px;">הזמנה #${orderNumber}</h2>
    ${timestampHtml}
  </div>

  <!-- Items -->
  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">🖼️ הפריטים שלך</h3>
    ${itemsHtml}
  </div>

  <!-- Price breakdown -->
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">💰 סיכום מחירים</h3>
    <table style="width: 100%;">
      <tr>
        <td style="padding: 6px 0; color: #737373;">סכום ביניים:</td>
        <td style="padding: 6px 0; text-align: left; color: #525252;">₪${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #737373;">משלוח:</td>
        <td style="padding: 6px 0; text-align: left; color: #525252;">₪${shipping.toFixed(2)}</td>
      </tr>
      <tr style="border-top: 2px solid #e5e5e5;">
        <td style="padding: 10px 0 6px; font-weight: bold; font-size: 18px;">סה"כ:</td>
        <td style="padding: 10px 0 6px; text-align: left; font-weight: bold; font-size: 18px; color: #8b5cf6;">₪${total.toFixed(2)}</td>
      </tr>
    </table>
  </div>

  <!-- Shipping address -->
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">📦 כתובת למשלוח</h3>
    <p style="margin: 0; color: #525252;">
      ${shippingAddress.street}<br>
      ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
      ${shippingAddress.country}
    </p>
  </div>

  ${giftHtml}

  <!-- Order Progress Stepper -->
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 16px;">📍 מעקב הזמנה</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
      <tr>
        <!-- Step 1: Received (active) -->
        <td width="25%" style="text-align: center; vertical-align: top;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #8b5cf6; margin: 0 auto 6px; line-height: 36px; color: #ffffff; font-size: 16px;">✓</div>
          <p style="margin: 0; font-size: 12px; font-weight: bold; color: #8b5cf6;">התקבלה</p>
        </td>
        <!-- Step 2: Processing -->
        <td width="25%" style="text-align: center; vertical-align: top;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #e9d5ff; margin: 0 auto 6px; line-height: 36px; color: #7c3aed; font-size: 14px;">⚙</div>
          <p style="margin: 0; font-size: 12px; color: #a3a3a3;">בעיבוד</p>
        </td>
        <!-- Step 3: Printing -->
        <td width="25%" style="text-align: center; vertical-align: top;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #f3f4f6; margin: 0 auto 6px; line-height: 36px; color: #a3a3a3; font-size: 14px;">🖨</div>
          <p style="margin: 0; font-size: 12px; color: #a3a3a3;">בהדפסה</p>
        </td>
        <!-- Step 4: Shipped -->
        <td width="25%" style="text-align: center; vertical-align: top;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #f3f4f6; margin: 0 auto 6px; line-height: 36px; color: #a3a3a3; font-size: 14px;">📦</div>
          <p style="margin: 0; font-size: 12px; color: #a3a3a3;">נשלח</p>
        </td>
      </tr>
      <!-- Progress bar row -->
      <tr>
        <td colspan="4" style="padding: 0 40px;">
          <div style="height: 4px; background: #f3f4f6; border-radius: 2px; margin-top: -30px; position: relative;">
            <div style="height: 4px; background: linear-gradient(to left, #e9d5ff, #8b5cf6); border-radius: 2px; width: 15%;"></div>
          </div>
        </td>
      </tr>
    </table>
    <p style="margin: 16px 0 0; color: #737373; font-size: 13px; text-align: center;">נעדכן אותך בכל שלב! צפי להגעה: 5-7 ימי עסקים</p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 20px 0 0;">
    <div style="height: 2px; background: linear-gradient(to left, #8b5cf6, #ec4899); border-radius: 1px; margin-bottom: 16px;"></div>
    <p style="margin: 0 0 8px; color: #737373; font-size: 13px;">שאלות? השב/י למייל זה או צור/צרי קשר ב-support@footprint.co.il</p>
    <p style="margin: 0; color: #a3a3a3; font-size: 13px;">&copy; ${new Date().getFullYear()} Footprint | www.footprint.co.il</p>
  </div>

</body>
</html>
  `.trim();
}

// ============================================================================
// Email Sending
// ============================================================================

/**
 * Sends an order confirmation email via Resend.
 *
 * @param params - Order confirmation parameters
 * @returns Email result with success status and email ID
 */
export async function sendOrderConfirmationEmail(
  params: OrderConfirmationParams
): Promise<EmailResult> {
  try {
    const config = getResendConfig();

    const emailBody = {
      from: `Footprint <${config.fromEmail}>`,
      to: params.to,
      subject: `אישור הזמנה - Footprint #${params.orderNumber}`,
      html: generateOrderConfirmationHtml(params),
    };

    const response = await fetchWithTimeout(RESEND_API_URL, {
      timeout: TIMEOUT_DEFAULTS.API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { message?: string }).message || `HTTP ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      success: true,
      emailId: (data as { id: string }).id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================================================
// WhatsApp Share
// ============================================================================

/**
 * Generates a WhatsApp share URL for an order.
 *
 * @param orderNumber - The order number to share
 * @param message - Optional custom message
 * @param phoneNumber - Optional phone number to send to (format: +972501234567)
 * @returns WhatsApp URL
 */
export function generateWhatsAppShareUrl(
  orderNumber: string,
  message?: string,
  phoneNumber?: string
): string {
  const defaultMessage = `🎨 I just ordered a custom art print from Footprint! Order: ${orderNumber}`;
  const text = encodeURIComponent(message || defaultMessage);

  if (phoneNumber) {
    // Remove + and any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }

  return `https://wa.me/?text=${text}`;
}

// ============================================================================
// Status Update Email
// ============================================================================

/**
 * Status labels in Hebrew for customer notifications
 */
const STATUS_LABELS_HE: Record<string, string> = {
  pending: 'ממתין לתשלום',
  paid: 'שולם',
  processing: 'בטיפול',
  printing: 'בהדפסה',
  shipped: 'נשלח',
  delivered: 'נמסר',
  cancelled: 'בוטל',
};

/**
 * Generates HTML email template for status update.
 */
function generateStatusUpdateHtml(params: StatusUpdateParams): string {
  const { customerName, orderId, newStatus } = params;
  const statusLabel = STATUS_LABELS_HE[newStatus] || newStatus;

  // Status-specific messaging
  let statusMessage = '';
  let nextSteps = '';

  switch (newStatus) {
    case 'processing':
      statusMessage = 'ההזמנה שלך נמצאת כעת בטיפול!';
      nextSteps = 'אנחנו מכינים את העבודה שלך להדפסה. נעדכן אותך כשנתחיל בהדפסה.';
      break;
    case 'printing':
      statusMessage = 'ההזמנה שלך בהדפסה! 🖨️';
      nextSteps = 'היצירה שלך מודפסת כרגע על ידי הצוות המקצועי שלנו.';
      break;
    case 'shipped':
      statusMessage = 'ההזמנה שלך נשלחה! 📦';
      nextSteps = 'החבילה בדרך אליך! צפי להגעה: 5-7 ימי עסקים.';
      break;
    case 'delivered':
      statusMessage = 'ההזמנה שלך נמסרה! 🎉';
      nextSteps = 'תודה שבחרת ב-Footprint! נשמח לראות את היצירה תלויה אצלך.';
      break;
    case 'cancelled':
      statusMessage = 'ההזמנה שלך בוטלה';
      nextSteps = 'אם יש לך שאלות, אנא צור איתנו קשר.';
      break;
    default:
      statusMessage = `הסטטוס עודכן ל: ${statusLabel}`;
      nextSteps = '';
  }

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>עדכון סטטוס הזמנה - ${orderId}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">Footprint</h1>
    <p style="color: #666; margin: 5px 0;">סטודיו להדפסת תמונות AI</p>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 16px 0; color: #1e293b;">${statusMessage}</h2>
    <p style="margin: 0;">שלום ${customerName},</p>
    <p>רצינו לעדכן אותך שסטטוס ההזמנה שלך השתנה.</p>
    <p style="font-size: 18px; font-weight: bold;">
      הזמנה: <span style="color: #2563eb;">${orderId}</span>
    </p>
    <p style="font-size: 18px;">
      סטטוס חדש: <span style="background: #dbeafe; padding: 4px 12px; border-radius: 16px; color: #1d4ed8;">${statusLabel}</span>
    </p>
  </div>

  ${nextSteps ? `
  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; color: #1e293b;">מה הלאה?</h3>
    <p style="margin: 0;">${nextSteps}</p>
  </div>
  ` : ''}

  <div style="text-align: center; padding: 24px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
    <p>שאלות? השב למייל זה או צור קשר ב-support@footprint.co.il</p>
    <p style="margin: 0;">© ${new Date().getFullYear()} Footprint. כל הזכויות שמורות.</p>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Sends a status update email via Resend.
 *
 * @param params - Status update parameters
 * @returns Email result with success status and email ID
 */
export async function sendStatusUpdateEmail(
  params: StatusUpdateParams
): Promise<EmailResult> {
  try {
    const config = getResendConfig();

    const statusLabel = STATUS_LABELS_HE[params.newStatus] || params.newStatus;
    const subject = `עדכון הזמנה ${params.orderId}: ${statusLabel}`;

    const emailBody = {
      from: config.fromEmail,
      to: params.to,
      subject,
      html: generateStatusUpdateHtml(params),
    };

    const response = await fetchWithTimeout(RESEND_API_URL, {
      timeout: TIMEOUT_DEFAULTS.API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { message?: string }).message || `HTTP ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      success: true,
      emailId: (data as { id: string }).id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================================================
// Tracking Notification Email
// ============================================================================

/**
 * Carrier names in Hebrew
 */
const CARRIER_NAMES_HE: Record<string, string> = {
  israel_post: 'דואר ישראל',
  dhl: 'DHL',
  fedex: 'FedEx',
  ups: 'UPS',
  other: 'שליח',
};

/**
 * Generates HTML email template for tracking notification.
 */
function generateTrackingNotificationHtml(params: TrackingNotificationParams): string {
  const { customerName, orderId, trackingNumber, carrier, trackingUrl } = params;
  const carrierName = CARRIER_NAMES_HE[carrier] || carrier;

  const trackingButtonHtml = trackingUrl
    ? `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${trackingUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        עקוב אחר המשלוח
      </a>
    </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ההזמנה שלך נשלחה - ${orderId}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">Footprint</h1>
    <p style="color: #666; margin: 5px 0;">סטודיו להדפסת תמונות AI</p>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 16px 0; color: #1e293b;">ההזמנה שלך בדרך! 📦</h2>
    <p style="margin: 0;">שלום ${customerName},</p>
    <p>חדשות מצוינות! ההזמנה שלך נשלחה והיא בדרך אליך.</p>
    <p style="font-size: 18px; font-weight: bold;">
      הזמנה: <span style="color: #2563eb;">${orderId}</span>
    </p>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; color: #1e293b;">פרטי משלוח</h3>
    <table style="width: 100%;">
      <tr>
        <td style="padding: 8px 0; color: #666;">חברת משלוח:</td>
        <td style="padding: 8px 0; font-weight: bold;">${carrierName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">מספר מעקב:</td>
        <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${trackingNumber}</td>
      </tr>
    </table>
    ${trackingButtonHtml}
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; color: #1e293b;">מה הלאה?</h3>
    <p style="margin: 0;">צפי להגעה: 5-7 ימי עסקים. תוכל לעקוב אחר המשלוח בקישור למעלה.</p>
  </div>

  <div style="text-align: center; padding: 24px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
    <p>שאלות? השב למייל זה או צור קשר ב-support@footprint.co.il</p>
    <p style="margin: 0;">© ${new Date().getFullYear()} Footprint. כל הזכויות שמורות.</p>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Sends a tracking notification email via Resend.
 *
 * @param params - Tracking notification parameters
 * @returns Email result with success status and email ID
 */
export async function sendTrackingNotificationEmail(
  params: TrackingNotificationParams
): Promise<EmailResult> {
  try {
    const config = getResendConfig();

    const subject = `ההזמנה שלך נשלחה! מספר מעקב: ${params.trackingNumber}`;

    const emailBody = {
      from: config.fromEmail,
      to: params.to,
      subject,
      html: generateTrackingNotificationHtml(params),
    };

    const response = await fetchWithTimeout(RESEND_API_URL, {
      timeout: TIMEOUT_DEFAULTS.API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { message?: string }).message || `HTTP ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      success: true,
      emailId: (data as { id: string }).id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================================================
// New Order Notification Email (Internal - to shop owner)
// ============================================================================

const OWNER_EMAIL = 'orders@footprint.co.il';

/**
 * Formats a payment provider name for display.
 */
function formatPaymentProvider(provider?: string): string {
  if (!provider) return 'לא צוין';
  const providers: Record<string, string> = {
    payplus: 'PayPlus',
  };
  return providers[provider] || provider;
}

/**
 * Formats an ISO date string for Hebrew display.
 */
function formatDateHebrew(isoDate?: string): string {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Generates HTML email template for internal new-order notification.
 * Hebrew, RTL, professional layout with phone, account status, download links,
 * and price breakdown.
 */
function generateNewOrderNotificationHtml(params: NewOrderNotificationParams): string {
  const {
    orderNumber, customerName, customerEmail, customerPhone,
    userId, items, subtotal, shipping, total, shippingAddress,
    paymentProvider, isGift, giftMessage, createdAt,
  } = params;

  const accountBadge = userId
    ? '<span style="display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">לקוח רשום</span>'
    : '<span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">אורח</span>';

  const phoneRow = customerPhone
    ? `<tr>
        <td style="padding: 4px 0; color: #737373; width: 80px;">טלפון:</td>
        <td style="padding: 4px 0;">${customerPhone}</td>
      </tr>`
    : '';

  const timestampHtml = createdAt
    ? `<p style="margin: 4px 0 0; color: #737373; font-size: 14px;">${formatDateHebrew(createdAt)}</p>`
    : '';

  // First item image as customer section thumbnail
  const firstImageUrl = items.find(i => i.imageUrl)?.imageUrl;

  const itemsHtml = items
    .map(
      (item) => {
        const styleName = translateSpec(item.style, STYLE_NAMES_HE);
        const paperName = translateSpec(item.paper, PAPER_NAMES_HE);
        const frameName = translateSpec(item.frame, FRAME_NAMES_HE);
        const specs = [
          styleName ? `סגנון: ${styleName}` : '',
          item.size ? `גודל: ${item.size}` : '',
          paperName ? `נייר: ${paperName}` : '',
          frameName && item.frame !== 'none' ? `מסגרת: ${frameName}` : '',
          item.hasPassepartout ? 'פספרטו' : '',
        ].filter(Boolean).join(' | ');

        const downloadLink = item.imageUrl
          ? `<a href="${item.imageUrl}" target="_blank" style="display: inline-block; margin-top: 8px; color: #8b5cf6; font-size: 13px; text-decoration: none;">📥 הורד תמונה</a>`
          : '';

        const imageHtml = getFrameImageHtml(item);

        return `
        <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
          ${imageHtml}
          ${downloadLink}
          <p style="margin: 8px 0 4px; font-weight: bold; font-size: 15px; color: #1a1a1a;">${styleName && item.size ? `${styleName} - ${item.size}` : item.name}</p>
          ${specs ? `<p style="margin: 0 0 4px; color: #737373; font-size: 13px;">${specs}</p>` : ''}
          <p style="margin: 0; color: #525252; font-size: 14px;">כמות: ${item.quantity} | מחיר: ₪${item.price.toFixed(2)}</p>
        </div>`;
      }
    )
    .join('');

  const giftHtml = isGift
    ? `
    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f59e0b;">
      <h3 style="margin: 0 0 8px 0; color: #92400e;">🎁 הזמנת מתנה</h3>
      ${giftMessage ? `<p style="margin: 0; color: #78350f;">"${giftMessage}"</p>` : '<p style="margin: 0; color: #78350f;">ללא הודעה</p>'}
    </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>הזמנה חדשה - ${orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; background: #fafafa;">

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 24px; padding: 28px 24px 20px; background: #1a1a1a; border-radius: 12px;">
    <img src="https://www.footprint.co.il/footprint-logo-white-v2.svg" alt="Footprint" width="72" height="72" style="display: block; margin: 0 auto 12px;" />
    <p style="color: #a3a3a3; margin: 0 0 16px; font-size: 14px;">הזמנה חדשה התקבלה!</p>
    <div style="height: 3px; background: linear-gradient(to left, #8b5cf6, #ec4899); border-radius: 2px; width: 80px; margin: 0 auto;"></div>
  </div>

  <!-- Order badge -->
  <div style="background: #f5f3ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #c4b5fd;">
    <h2 style="margin: 0; color: #5b21b6; font-size: 20px;">הזמנה #${orderNumber}</h2>
    ${timestampHtml}
  </div>

  <!-- Customer details -->
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">👤 פרטי לקוח</h3>
    <table style="width: 100%;" cellpadding="0" cellspacing="0">
      <tr>
        ${firstImageUrl ? `<td style="width: 120px; vertical-align: top; padding-left: 16px;">
          <img src="${firstImageUrl}" alt="תצוגה מקדימה" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; display: block;" />
        </td>` : ''}
        <td style="vertical-align: top;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 4px 0; color: #737373; width: 80px;">שם:</td>
              <td style="padding: 4px 0; font-weight: bold;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #737373;">אימייל:</td>
              <td style="padding: 4px 0;">${customerEmail}</td>
            </tr>
            ${phoneRow}
            <tr>
              <td style="padding: 4px 0; color: #737373;">חשבון:</td>
              <td style="padding: 4px 0;">${accountBadge}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Items -->
  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">🖼️ פריטים</h3>
    ${itemsHtml}
  </div>

  <!-- Price breakdown -->
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">💰 סיכום מחירים</h3>
    <table style="width: 100%;">
      <tr>
        <td style="padding: 6px 0; color: #737373;">סכום ביניים:</td>
        <td style="padding: 6px 0; text-align: left; color: #525252;">₪${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #737373;">משלוח:</td>
        <td style="padding: 6px 0; text-align: left; color: #525252;">₪${shipping.toFixed(2)}</td>
      </tr>
      <tr style="border-top: 2px solid #e5e5e5;">
        <td style="padding: 10px 0 6px; font-weight: bold; font-size: 18px;">סה"כ:</td>
        <td style="padding: 10px 0 6px; text-align: left; font-weight: bold; font-size: 18px; color: #8b5cf6;">₪${total.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #737373;">תשלום:</td>
        <td style="padding: 4px 0; text-align: left; color: #525252;">${formatPaymentProvider(paymentProvider)}</td>
      </tr>
    </table>
  </div>

  <!-- Shipping address -->
  <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e5e5;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px;">📦 כתובת למשלוח</h3>
    <p style="margin: 0; color: #525252;">
      ${shippingAddress.street}<br>
      ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
      ${shippingAddress.country}
    </p>
  </div>

  ${giftHtml}

  <!-- Footer -->
  <div style="text-align: center; padding: 20px 0 0;">
    <div style="height: 2px; background: linear-gradient(to left, #8b5cf6, #ec4899); border-radius: 1px; margin-bottom: 16px;"></div>
    <p style="margin: 0; color: #a3a3a3; font-size: 13px;">&copy; ${new Date().getFullYear()} Footprint | www.footprint.co.il</p>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Sends a new order notification email to the shop owner.
 *
 * @param params - New order notification parameters
 * @returns Email result with success status and email ID
 */
export async function sendNewOrderNotificationEmail(
  params: NewOrderNotificationParams
): Promise<EmailResult> {
  try {
    const config = getResendConfig();

    const subject = `הזמנה חדשה! ${params.orderNumber} - ${params.customerName}`;

    const emailBody = {
      from: config.fromEmail,
      to: OWNER_EMAIL,
      subject,
      html: generateNewOrderNotificationHtml(params),
    };

    const response = await fetchWithTimeout(RESEND_API_URL, {
      timeout: TIMEOUT_DEFAULTS.API,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { message?: string }).message || `HTTP ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      success: true,
      emailId: (data as { id: string }).id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}
