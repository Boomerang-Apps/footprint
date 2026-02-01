-- Fix infinite recursion in profiles RLS policy
-- The issue is that admin check queries profiles table, causing recursion

-- Create a security definer function to check admin status
-- This function runs with elevated privileges and doesn't trigger RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Drop the problematic admin policy on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate it using the security definer function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id OR is_admin()
  );

-- Also fix other admin policies to use the function for consistency
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage all shipments" ON shipments;
CREATE POLICY "Admins can manage all shipments"
  ON shipments FOR ALL
  USING (is_admin());
