#!/usr/bin/env node
/**
 * Seed demo order data for Wave 3 testing
 * Run with: node scripts/seed-demo-data.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function seedData() {
  console.log('🌱 Starting demo data seed...\n');

  // 1. Get first user from profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1);

  if (profileError || !profiles?.length) {
    console.error('❌ No users found. Please register a user first at /register');
    console.error('Error:', profileError?.message);
    process.exit(1);
  }

  const userId = profiles[0].id;
  console.log(`✅ Found user: ${profiles[0].email} (${userId})\n`);

  // 2. Check if demo orders already exist
  const { data: existingOrders } = await supabase
    .from('orders')
    .select('order_number')
    .in('order_number', ['FP-2026-1001', 'FP-2026-1002', 'FP-2026-1003', 'FP-2026-1004']);

  if (existingOrders?.length) {
    console.log('⚠️  Demo orders already exist. Skipping to avoid duplicates.');
    console.log('   Existing orders:', existingOrders.map(o => o.order_number).join(', '));
    process.exit(0);
  }

  // 3. Create demo orders
  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  const orders = [
    {
      order_number: 'FP-2026-1001',
      user_id: userId,
      status: 'delivered',
      subtotal: 14900,
      shipping_cost: 2500,
      discount_amount: 0,
      tax_amount: 0,
      total: 17400,
      shipping_address: { name: 'ישראל ישראלי', street: 'רוטשילד 123', city: 'תל אביב', postalCode: '6688123', phone: '050-1234567' },
      billing_address: { name: 'ישראל ישראלי', street: 'רוטשילד 123', city: 'תל אביב', postalCode: '6688123' },
      is_gift: false,
      tracking_number: 'RR123456789IL',
      carrier: 'israel_post',
      created_at: daysAgo(14),
      paid_at: daysAgo(14),
      shipped_at: daysAgo(10),
      delivered_at: daysAgo(7),
    },
    {
      order_number: 'FP-2026-1002',
      user_id: userId,
      status: 'shipped',
      subtotal: 31800,
      shipping_cost: 2500,
      discount_amount: 5000,
      tax_amount: 0,
      total: 29300,
      shipping_address: { name: 'ישראל ישראלי', street: 'דיזנגוף 50', apartment: 'דירה 4', city: 'תל אביב', postalCode: '6433222', phone: '050-1234567' },
      tracking_number: 'RR987654321IL',
      carrier: 'israel_post',
      created_at: daysAgo(5),
      paid_at: daysAgo(5),
      shipped_at: daysAgo(2),
    },
    {
      order_number: 'FP-2026-1003',
      user_id: userId,
      status: 'processing',
      subtotal: 37900,
      shipping_cost: 4500,
      discount_amount: 0,
      tax_amount: 0,
      total: 42400,
      shipping_address: { name: 'שרה כהן', street: 'הרצל 88', city: 'חיפה', postalCode: '3303333', phone: '052-9876543' },
      is_gift: true,
      gift_message: 'מזל טוב ליום ההולדת! באהבה',
      gift_wrap: true,
      hide_price: true,
      created_at: daysAgo(1),
      paid_at: daysAgo(1),
    },
    {
      order_number: 'FP-2026-1004',
      user_id: userId,
      status: 'pending',
      subtotal: 24900,
      shipping_cost: 2500,
      discount_amount: 0,
      tax_amount: 0,
      total: 27400,
      shipping_address: { name: 'ישראל ישראלי', street: 'רוטשילד 123', city: 'תל אביב', postalCode: '6688123', phone: '050-1234567' },
      created_at: hoursAgo(2),
    },
  ];

  console.log('📦 Creating orders...');
  const { data: createdOrders, error: orderError } = await supabase
    .from('orders')
    .insert(orders)
    .select('id, order_number, status');

  if (orderError) {
    console.error('❌ Failed to create orders:', orderError.message);
    process.exit(1);
  }

  console.log('✅ Created orders:');
  createdOrders.forEach(o => console.log(`   - ${o.order_number} (${o.status})`));

  // 4. Create order items
  const orderMap = Object.fromEntries(createdOrders.map(o => [o.order_number, o.id]));

  const orderItems = [
    {
      order_id: orderMap['FP-2026-1001'],
      original_image_url: 'https://picsum.photos/seed/fp1/800/600',
      original_image_key: 'demo/image1.jpg',
      transformed_image_url: 'https://picsum.photos/seed/fp1t/800/600',
      style: 'pop_art',
      size: 'A4',
      paper_type: 'matte',
      frame_type: 'none',
      quantity: 1,
      base_price: 14900,
      paper_addon: 0,
      frame_addon: 0,
      item_total: 14900,
    },
    {
      order_id: orderMap['FP-2026-1002'],
      original_image_url: 'https://picsum.photos/seed/fp2a/800/600',
      original_image_key: 'demo/image2a.jpg',
      transformed_image_url: 'https://picsum.photos/seed/fp2at/800/600',
      style: 'watercolor',
      size: 'A4',
      paper_type: 'glossy',
      frame_type: 'black',
      quantity: 1,
      base_price: 14900,
      paper_addon: 2000,
      frame_addon: 6000,
      item_total: 22900,
    },
    {
      order_id: orderMap['FP-2026-1002'],
      original_image_url: 'https://picsum.photos/seed/fp2b/800/600',
      original_image_key: 'demo/image2b.jpg',
      transformed_image_url: 'https://picsum.photos/seed/fp2bt/800/600',
      style: 'oil_painting',
      size: 'A5',
      paper_type: 'matte',
      frame_type: 'none',
      quantity: 1,
      base_price: 8900,
      paper_addon: 0,
      frame_addon: 0,
      item_total: 8900,
    },
    {
      order_id: orderMap['FP-2026-1003'],
      original_image_url: 'https://picsum.photos/seed/fp3/800/600',
      original_image_key: 'demo/image3.jpg',
      transformed_image_url: 'https://picsum.photos/seed/fp3t/800/600',
      style: 'romantic',
      size: 'A2',
      paper_type: 'canvas',
      frame_type: 'oak',
      quantity: 1,
      base_price: 37900,
      paper_addon: 4000,
      frame_addon: 8000,
      item_total: 49900,
    },
    {
      order_id: orderMap['FP-2026-1004'],
      original_image_url: 'https://picsum.photos/seed/fp4/800/600',
      original_image_key: 'demo/image4.jpg',
      style: 'line_art',
      size: 'A3',
      paper_type: 'matte',
      frame_type: 'white',
      quantity: 1,
      base_price: 24900,
      paper_addon: 0,
      frame_addon: 6000,
      item_total: 30900,
    },
  ];

  console.log('\n🖼️  Creating order items...');
  const { error: itemError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemError) {
    console.error('❌ Failed to create order items:', itemError.message);
    process.exit(1);
  }

  console.log('✅ Created 5 order items');

  console.log('\n🎉 Demo data seeded successfully!\n');
  console.log('View orders at: http://localhost:3000/account/orders');
}

seedData().catch(console.error);
