/**
 * Simulates a PayPlus webhook callback to localhost.
 * Creates a real order in Supabase + triggers both emails.
 *
 * Usage: doppler run -- npx tsx scripts/simulate-webhook.ts
 */

import crypto from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SECRET_KEY = process.env.PAYPLUS_SECRET_KEY;

if (!SECRET_KEY) {
  console.error('PAYPLUS_SECRET_KEY not set. Run with: doppler run -- npx tsx scripts/simulate-webhook.ts');
  process.exit(1);
}

// Realistic order data matching what the checkout would serialize
const orderData = {
  userId: undefined, // guest order
  items: [
    {
      name: 'הדפסת Pop Art - A3',
      quantity: 1,
      price: 249,
      imageUrl: 'https://replicate.delivery/xezq/2sMplCrSqVMrmCNMcoSxXDHqExHVAl6pxPMVfJjGmhveFfwUA/out-0.webp',
      style: 'Pop Art',
      size: 'A3',
      paper: 'Glossy',
      frame: 'Black',
    },
  ],
  subtotal: 348,
  shipping: 0,
  total: 348,
  shippingAddress: {
    street: 'רחוב דיזנגוף 99',
    city: 'תל אביב',
    postalCode: '6433101',
    country: 'ישראל',
  },
  isGift: true,
  giftMessage: 'יום הולדת שמח! מקווה שתאהבי את ההדפס',
};

const payload = {
  transaction_uid: `test-txn-${Date.now()}`,
  page_request_uid: `test-pruid-${Date.now()}`,
  status_code: '000', // success
  amount: orderData.total,
  currency: 'ILS',
  more_info: JSON.stringify(orderData),
  customer_name: 'ישראל ישראלי',
  customer_email: 'orders@footprint.co.il',
  customer_phone: '050-1234567',
  number_of_payments: 1,
  approval_num: 'TEST-APPROVAL-001',
};

const body = JSON.stringify(payload);

// Compute HMAC-SHA256 signature (same as PayPlus)
const hash = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(body)
  .digest('base64');

async function main(): Promise<void> {
  console.log('Simulating PayPlus webhook to', `${BASE_URL}/api/webhooks/payplus`);
  console.log('Transaction ID:', payload.transaction_uid);
  console.log('Customer:', payload.customer_name, `<${payload.customer_email}>`);
  console.log('Total: ₪' + payload.amount);
  console.log('Gift:', orderData.isGift ? `Yes - "${orderData.giftMessage}"` : 'No');
  console.log('');

  const response = await fetch(`${BASE_URL}/api/webhooks/payplus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-agent': 'PayPlus',
      'hash': hash,
    },
    body,
  });

  const data = await response.json();
  console.log('Response status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.orderCreated) {
    console.log('\n✅ Order created successfully!');
    console.log(`   Order ID: ${data.orderId}`);
    console.log(`   Order Number: ${data.orderNumber}`);
    console.log('');
    console.log('📧 Check orders@footprint.co.il for:');
    console.log('   1. Customer confirmation email (אישור הזמנה)');
    console.log('   2. Shop owner notification email (הזמנה חדשה)');
    console.log('');
    console.log(`📋 View order in browser: ${BASE_URL}/account/orders`);
  } else {
    console.log('\n❌ Order NOT created:', data.reason || 'Unknown reason');
  }
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
