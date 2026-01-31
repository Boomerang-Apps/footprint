-- ============================================================================
-- FOOTPRINT DEMO DATA SEED
-- ============================================================================
-- Run this after creating a test user in Supabase Auth
-- Replace 'YOUR_USER_ID' with actual user UUID from auth.users
-- ============================================================================

-- Demo user ID (replace with actual authenticated user ID)
-- You can find this in Supabase Dashboard > Authentication > Users
DO $$
DECLARE
  demo_user_id UUID;
  order1_id UUID;
  order2_id UUID;
  order3_id UUID;
  order4_id UUID;
BEGIN
  -- Get the first user from profiles (or specify a specific user ID)
  SELECT id INTO demo_user_id FROM profiles LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE NOTICE 'No user found. Please create a user first via Supabase Auth.';
    RETURN;
  END IF;

  RAISE NOTICE 'Creating demo orders for user: %', demo_user_id;

  -- ============================================================================
  -- ORDER 1: Delivered order with tracking
  -- ============================================================================
  INSERT INTO orders (
    id, order_number, user_id, status,
    subtotal, shipping_cost, discount_amount, tax_amount, total,
    shipping_address, billing_address,
    is_gift, gift_message,
    tracking_number, carrier,
    created_at, paid_at, shipped_at, delivered_at
  ) VALUES (
    gen_random_uuid(),
    'FP-2026-1001',
    demo_user_id,
    'delivered',
    14900, 2500, 0, 0, 17400,
    '{"name": "ישראל ישראלי", "street": "רוטשילד 123", "city": "תל אביב", "postalCode": "6688123", "phone": "050-1234567"}',
    '{"name": "ישראל ישראלי", "street": "רוטשילד 123", "city": "תל אביב", "postalCode": "6688123"}',
    false, null,
    'RR123456789IL', 'israel_post',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '7 days'
  ) RETURNING id INTO order1_id;

  -- Order 1 items
  INSERT INTO order_items (order_id, original_image_url, original_image_key, transformed_image_url, style, size, paper_type, frame_type, quantity, base_price, paper_addon, frame_addon, item_total)
  VALUES (order1_id, 'https://picsum.photos/seed/fp1/800/600', 'demo/image1.jpg', 'https://picsum.photos/seed/fp1t/800/600', 'pop_art', 'A4', 'matte', 'none', 1, 14900, 0, 0, 14900);

  -- Order 1 shipment
  INSERT INTO shipments (order_id, carrier, carrier_name, tracking_number, tracking_url, status, shipped_at, delivered_at)
  VALUES (order1_id, 'israel_post', 'דואר ישראל', 'RR123456789IL', 'https://israelpost.co.il/itemtrace?itemcode=RR123456789IL', 'delivered', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days');

  -- ============================================================================
  -- ORDER 2: Shipped order (in transit)
  -- ============================================================================
  INSERT INTO orders (
    id, order_number, user_id, status,
    subtotal, shipping_cost, discount_amount, tax_amount, total,
    shipping_address,
    tracking_number, carrier,
    created_at, paid_at, shipped_at
  ) VALUES (
    gen_random_uuid(),
    'FP-2026-1002',
    demo_user_id,
    'shipped',
    31800, 2500, 5000, 0, 29300,
    '{"name": "ישראל ישראלי", "street": "דיזנגוף 50", "apartment": "דירה 4", "city": "תל אביב", "postalCode": "6433222", "phone": "050-1234567"}',
    'RR987654321IL', 'israel_post',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '2 days'
  ) RETURNING id INTO order2_id;

  -- Order 2 items (multiple items)
  INSERT INTO order_items (order_id, original_image_url, original_image_key, transformed_image_url, style, size, paper_type, frame_type, quantity, base_price, paper_addon, frame_addon, item_total)
  VALUES
    (order2_id, 'https://picsum.photos/seed/fp2a/800/600', 'demo/image2a.jpg', 'https://picsum.photos/seed/fp2at/800/600', 'watercolor', 'A4', 'glossy', 'black', 1, 14900, 2000, 6000, 22900),
    (order2_id, 'https://picsum.photos/seed/fp2b/800/600', 'demo/image2b.jpg', 'https://picsum.photos/seed/fp2bt/800/600', 'oil_painting', 'A5', 'matte', 'none', 1, 8900, 0, 0, 8900);

  -- Order 2 shipment
  INSERT INTO shipments (order_id, carrier, carrier_name, tracking_number, tracking_url, status, estimated_delivery_date, shipped_at)
  VALUES (order2_id, 'israel_post', 'דואר ישראל', 'RR987654321IL', 'https://israelpost.co.il/itemtrace?itemcode=RR987654321IL', 'in_transit', NOW() + INTERVAL '3 days', NOW() - INTERVAL '2 days');

  -- ============================================================================
  -- ORDER 3: Processing order (paid, being prepared)
  -- ============================================================================
  INSERT INTO orders (
    id, order_number, user_id, status,
    subtotal, shipping_cost, discount_amount, tax_amount, total,
    shipping_address,
    is_gift, gift_message, gift_wrap, hide_price,
    created_at, paid_at
  ) VALUES (
    gen_random_uuid(),
    'FP-2026-1003',
    demo_user_id,
    'processing',
    37900, 4500, 0, 0, 42400,
    '{"name": "שרה כהן", "street": "הרצל 88", "city": "חיפה", "postalCode": "3303333", "phone": "052-9876543"}',
    true, 'מזל טוב ליום ההולדת! באהבה', true, true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO order3_id;

  -- Order 3 items (large canvas print as gift)
  INSERT INTO order_items (order_id, original_image_url, original_image_key, transformed_image_url, style, size, paper_type, frame_type, quantity, base_price, paper_addon, frame_addon, item_total)
  VALUES (order3_id, 'https://picsum.photos/seed/fp3/800/600', 'demo/image3.jpg', 'https://picsum.photos/seed/fp3t/800/600', 'romantic', 'A2', 'canvas', 'oak', 1, 37900, 4000, 8000, 49900);

  -- ============================================================================
  -- ORDER 4: Pending payment
  -- ============================================================================
  INSERT INTO orders (
    id, order_number, user_id, status,
    subtotal, shipping_cost, discount_amount, tax_amount, total,
    shipping_address,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'FP-2026-1004',
    demo_user_id,
    'pending',
    24900, 2500, 0, 0, 27400,
    '{"name": "ישראל ישראלי", "street": "רוטשילד 123", "city": "תל אביב", "postalCode": "6688123", "phone": "050-1234567"}',
    NOW() - INTERVAL '2 hours'
  ) RETURNING id INTO order4_id;

  -- Order 4 items
  INSERT INTO order_items (order_id, original_image_url, original_image_key, transformed_image_url, style, size, paper_type, frame_type, quantity, base_price, paper_addon, frame_addon, item_total)
  VALUES (order4_id, 'https://picsum.photos/seed/fp4/800/600', 'demo/image4.jpg', null, 'line_art', 'A3', 'matte', 'white', 1, 24900, 0, 6000, 30900);

  RAISE NOTICE 'Demo data created successfully!';
  RAISE NOTICE 'Order 1 (Delivered): %', order1_id;
  RAISE NOTICE 'Order 2 (Shipped): %', order2_id;
  RAISE NOTICE 'Order 3 (Processing): %', order3_id;
  RAISE NOTICE 'Order 4 (Pending): %', order4_id;

END $$;
