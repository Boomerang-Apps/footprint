/**
 * Email Service - Resend Integration
 *
 * Handles sending transactional emails via Resend API.
 * https://resend.com/docs
 */

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
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
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
const DEFAULT_FROM_EMAIL = 'noreply@footprint.co.il';

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
 * Generates HTML email template for order confirmation.
 */
function generateOrderConfirmationHtml(params: OrderConfirmationParams): string {
  const { customerName, orderNumber, items, subtotal, shipping, total, shippingAddress } = params;

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₪${item.price.toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">Footprint</h1>
    <p style="color: #666; margin: 5px 0;">AI-Powered Photo Printing Studio</p>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 16px 0; color: #1e293b;">Order Confirmed! 🎉</h2>
    <p style="margin: 0;">Hi ${customerName},</p>
    <p>Thank you for your order! We're excited to create your custom art print.</p>
    <p style="font-size: 18px; font-weight: bold; color: #2563eb;">Order #${orderNumber}</p>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; color: #1e293b;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="padding: 12px; text-align: left;">Item</th>
          <th style="padding: 12px; text-align: center;">Qty</th>
          <th style="padding: 12px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 12px; text-align: right;">Subtotal:</td>
          <td style="padding: 12px; text-align: right;">₪${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 12px; text-align: right;">Shipping:</td>
          <td style="padding: 12px; text-align: right;">₪${shipping.toFixed(2)}</td>
        </tr>
        <tr style="font-weight: bold; font-size: 18px;">
          <td colspan="2" style="padding: 12px; text-align: right;">Total:</td>
          <td style="padding: 12px; text-align: right; color: #2563eb;">₪${total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; color: #1e293b;">Shipping Address</h3>
    <p style="margin: 0;">
      ${shippingAddress.street}<br>
      ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
      ${shippingAddress.country}
    </p>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; color: #1e293b;">What's Next?</h3>
    <ol style="margin: 0; padding-left: 20px;">
      <li>We'll start creating your custom art print</li>
      <li>You'll receive a shipping confirmation with tracking</li>
      <li>Your print will arrive within 5-7 business days</li>
    </ol>
  </div>

  <div style="text-align: center; padding: 24px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
    <p>Questions? Reply to this email or contact us at support@footprint.co.il</p>
    <p style="margin: 0;">© ${new Date().getFullYear()} Footprint. All rights reserved.</p>
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
      from: config.fromEmail,
      to: params.to,
      subject: `Order Confirmed! Your Footprint Order ${params.orderNumber}`,
      html: generateOrderConfirmationHtml(params),
    };

    const response = await fetch(RESEND_API_URL, {
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
