-- ============================================================================
-- Add tracking columns to orders table
-- ============================================================================
-- The API expects tracking_number and carrier directly on orders
-- for quick access without joining shipments table
-- ============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;

-- Index for tracking lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Comment explaining the denormalization
COMMENT ON COLUMN orders.tracking_number IS 'Denormalized from shipments for quick API access';
COMMENT ON COLUMN orders.carrier IS 'Denormalized from shipments for quick API access';
