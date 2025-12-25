-- ============================================================================
-- FOOTPRINT DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0
-- Created: 2025-12-23
-- Description: Complete database schema for Footprint photo printing platform
-- ============================================================================

-- Enable UUID extension (Supabase uses gen_random_uuid() from pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending',      -- Order created, awaiting payment
  'paid',         -- Payment received
  'processing',   -- Being prepared for printing
  'printing',     -- Currently printing
  'shipped',      -- Shipped to customer
  'delivered',    -- Delivered to customer
  'cancelled',    -- Order cancelled
  'refunded'      -- Order refunded
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'refunded'
);

-- Payment provider enum
CREATE TYPE payment_provider AS ENUM (
  'payplus',
  'stripe',
  'bit',
  'apple_pay',
  'google_pay'
);

-- Shipment status enum
CREATE TYPE shipment_status AS ENUM (
  'pending',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed',
  'returned'
);

-- Style type enum
CREATE TYPE style_type AS ENUM (
  'pop_art',
  'watercolor',
  'line_art',
  'oil_painting',
  'romantic',
  'comic_book',
  'vintage',
  'original'
);

-- Size type enum
CREATE TYPE size_type AS ENUM (
  'A5',
  'A4',
  'A3',
  'A2'
);

-- Paper type enum
CREATE TYPE paper_type AS ENUM (
  'matte',
  'glossy',
  'canvas'
);

-- Frame type enum
CREATE TYPE frame_type AS ENUM (
  'none',
  'black',
  'white',
  'oak'
);

-- ============================================================================
-- USERS (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'he' CHECK (preferred_language IN ('he', 'en')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ADDRESSES
-- ============================================================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- Recipient name
  street TEXT NOT NULL,
  apartment TEXT,                        -- Apt/Suite/Unit
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'Israel',
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- ============================================================================
-- ORDERS
-- ============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,     -- Human-readable: FP-2024-XXXX
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email TEXT,                      -- For guest checkout
  status order_status DEFAULT 'pending',

  -- Pricing (in ILS agorot / cents)
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'ILS',

  -- Gift options
  is_gift BOOLEAN DEFAULT FALSE,
  gift_message TEXT,
  gift_wrap BOOLEAN DEFAULT FALSE,
  hide_price BOOLEAN DEFAULT FALSE,      -- Hide price from recipient

  -- Addresses (stored as JSONB for flexibility)
  shipping_address JSONB NOT NULL,
  billing_address JSONB,

  -- Discount
  discount_code_id UUID,

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'FP-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1000;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Image URLs (stored in R2)
  original_image_url TEXT NOT NULL,
  original_image_key TEXT NOT NULL,      -- R2 storage key
  transformed_image_url TEXT,
  transformed_image_key TEXT,
  print_ready_url TEXT,
  print_ready_key TEXT,
  thumbnail_url TEXT,

  -- Configuration
  style style_type NOT NULL,
  size size_type NOT NULL,
  paper_type paper_type NOT NULL,
  frame_type frame_type NOT NULL,
  quantity INTEGER DEFAULT 1,

  -- Pricing (in agorot)
  base_price INTEGER NOT NULL,
  paper_addon INTEGER DEFAULT 0,
  frame_addon INTEGER DEFAULT 0,
  item_total INTEGER NOT NULL,

  -- AI transformation
  ai_transformation_id TEXT,             -- Replicate prediction ID
  transformation_status TEXT DEFAULT 'pending',
  transformation_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for order lookups
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Payment details
  provider payment_provider NOT NULL,
  status payment_status DEFAULT 'pending',

  -- Provider references
  external_id TEXT,                      -- PayPlus/Stripe payment ID
  external_transaction_id TEXT,          -- Transaction reference

  -- Amount (in agorot)
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'ILS',

  -- Installments (תשלומים)
  installments INTEGER DEFAULT 1,

  -- Card info (masked)
  card_last_four TEXT,
  card_brand TEXT,                       -- visa, mastercard, etc.

  -- Bit payment
  bit_payment_id TEXT,

  -- Error handling
  error_code TEXT,
  error_message TEXT,

  -- Webhook data
  webhook_payload JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_external_id ON payments(external_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================================
-- SHIPMENTS
-- ============================================================================

CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Carrier info
  carrier TEXT NOT NULL,                 -- e.g., 'israel_post', 'fedex', 'ups'
  carrier_name TEXT,                     -- Display name
  tracking_number TEXT,
  tracking_url TEXT,

  -- Status
  status shipment_status DEFAULT 'pending',

  -- Shipping details
  shipping_method TEXT,                  -- 'standard', 'express'
  estimated_delivery_date DATE,
  actual_delivery_date DATE,

  -- Package info
  weight_grams INTEGER,
  dimensions_cm JSONB,                   -- {length, width, height}

  -- Recipient
  recipient_name TEXT,
  recipient_phone TEXT,
  delivery_address JSONB,

  -- Delivery notes
  delivery_instructions TEXT,
  signature_required BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);

-- ============================================================================
-- DISCOUNT CODES
-- ============================================================================

CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Discount type
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,       -- Percentage (0-100) or fixed amount in agorot

  -- Limits
  min_order_amount INTEGER,              -- Minimum order to apply
  max_discount_amount INTEGER,           -- Cap for percentage discounts
  max_uses INTEGER,                      -- Total uses allowed
  max_uses_per_user INTEGER DEFAULT 1,

  -- Tracking
  times_used INTEGER DEFAULT 0,

  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_discount_codes_code ON discount_codes(code);

-- ============================================================================
-- DISCOUNT CODE USAGE
-- ============================================================================

CREATE TABLE discount_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(discount_code_id, order_id)
);

-- ============================================================================
-- ORDER STATUS HISTORY
-- ============================================================================

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES profiles(id),  -- Admin who changed it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification type
  type TEXT NOT NULL,                    -- 'email', 'whatsapp', 'sms'
  template TEXT NOT NULL,                -- 'order_confirmation', 'shipped', etc.

  -- Recipient
  recipient TEXT NOT NULL,               -- Email or phone

  -- Content
  subject TEXT,
  body TEXT,

  -- Status
  status TEXT DEFAULT 'pending',         -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  -- Provider response
  external_id TEXT,                      -- Resend/Twilio message ID

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_notifications_order_id ON notifications(order_id);

-- ============================================================================
-- PRODUCT PRICING (for dynamic pricing)
-- ============================================================================

CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Size base prices (in agorot)
  size size_type NOT NULL,
  base_price INTEGER NOT NULL,

  -- Paper addons
  paper_matte_addon INTEGER DEFAULT 0,
  paper_glossy_addon INTEGER DEFAULT 2000,   -- +20 ILS
  paper_canvas_addon INTEGER DEFAULT 4000,   -- +40 ILS

  -- Frame addons
  frame_none_addon INTEGER DEFAULT 0,
  frame_black_addon INTEGER DEFAULT 6000,    -- +60 ILS
  frame_white_addon INTEGER DEFAULT 6000,
  frame_oak_addon INTEGER DEFAULT 8000,      -- +80 ILS

  -- Shipping
  shipping_standard INTEGER DEFAULT 2500,    -- 25 ILS
  shipping_express INTEGER DEFAULT 4500,     -- 45 ILS

  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default prices
INSERT INTO product_prices (size, base_price) VALUES
  ('A5', 8900),   -- 89 ILS
  ('A4', 14900),  -- 149 ILS
  ('A3', 24900),  -- 249 ILS
  ('A2', 37900);  -- 379 ILS

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Addresses: Users can CRUD their own addresses
CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  USING (auth.uid() = user_id);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Order items: Users can view items from their orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Payments: Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Shipments: Users can view their own shipments
CREATE POLICY "Users can view own shipments"
  ON shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = shipments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admin policies (for users with is_admin = true)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage all shipments"
  ON shipments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
