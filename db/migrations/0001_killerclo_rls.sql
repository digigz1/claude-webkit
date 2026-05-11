-- =============================================================================
-- KILLERCLO — Row Level Security Policies
-- Run AFTER 0000_killerclo_schema.sql
-- =============================================================================

-- =============================================================================
-- ADMIN HELPER
-- Uses Supabase auth.jwt() to check app_metadata.role = 'admin'
-- Set via: supabase.auth.admin.updateUserById(uid, { app_metadata: { role: 'admin' } })
-- =============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE members_boxes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookbook_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                 ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CATEGORIES — public read of active, admin full access
-- =============================================================================

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "categories_admin_insert"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "categories_admin_update"
  ON categories FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "categories_admin_delete"
  ON categories FOR DELETE
  USING (is_admin());

-- =============================================================================
-- DROPS — public read of active, admin full access
-- =============================================================================

CREATE POLICY "drops_public_read"
  ON drops FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "drops_admin_insert"
  ON drops FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "drops_admin_update"
  ON drops FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "drops_admin_delete"
  ON drops FOR DELETE
  USING (is_admin());

-- =============================================================================
-- PRODUCTS — public read of active, admin full access
-- =============================================================================

CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "products_admin_insert"
  ON products FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "products_admin_update"
  ON products FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "products_admin_delete"
  ON products FOR DELETE
  USING (is_admin());

-- =============================================================================
-- PRODUCT VARIANTS — public read, admin write
-- =============================================================================

CREATE POLICY "variants_public_read"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_variants.product_id
        AND (p.is_active = TRUE OR is_admin())
    )
  );

CREATE POLICY "variants_admin_insert"
  ON product_variants FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "variants_admin_update"
  ON product_variants FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "variants_admin_delete"
  ON product_variants FOR DELETE
  USING (is_admin());

-- =============================================================================
-- PRODUCT IMAGES — public read, admin write
-- =============================================================================

CREATE POLICY "images_public_read"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
        AND (p.is_active = TRUE OR is_admin())
    )
  );

CREATE POLICY "images_admin_insert"
  ON product_images FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "images_admin_update"
  ON product_images FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "images_admin_delete"
  ON product_images FOR DELETE
  USING (is_admin());

-- =============================================================================
-- PROFILES — own row only, admin full access
-- =============================================================================

CREATE POLICY "profiles_own_select"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_own_insert"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_admin_delete"
  ON profiles FOR DELETE
  USING (is_admin());

-- =============================================================================
-- ADDRESSES — own rows only, admin full access
-- =============================================================================

CREATE POLICY "addresses_own_select"
  ON addresses FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "addresses_own_insert"
  ON addresses FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "addresses_own_update"
  ON addresses FOR UPDATE
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "addresses_own_delete"
  ON addresses FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- =============================================================================
-- ORDERS — own rows read, admin full access
-- Insert only via service_role (Stripe webhook), not direct user
-- =============================================================================

CREATE POLICY "orders_own_select"
  ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "orders_admin_insert"
  ON orders FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "orders_admin_delete"
  ON orders FOR DELETE
  USING (is_admin());

-- =============================================================================
-- ORDER ITEMS — own rows read via order join, admin full access
-- =============================================================================

CREATE POLICY "order_items_own_select"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "order_items_admin_insert"
  ON order_items FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "order_items_admin_update"
  ON order_items FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "order_items_admin_delete"
  ON order_items FOR DELETE
  USING (is_admin());

-- =============================================================================
-- NEWSLETTER SUBSCRIBERS — public insert, admin full access
-- =============================================================================

CREATE POLICY "newsletter_public_insert"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "newsletter_admin_select"
  ON newsletter_subscribers FOR SELECT
  USING (is_admin());

CREATE POLICY "newsletter_admin_update"
  ON newsletter_subscribers FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "newsletter_admin_delete"
  ON newsletter_subscribers FOR DELETE
  USING (is_admin());

-- =============================================================================
-- MEMBERS BOXES — public read of active, admin write
-- =============================================================================

CREATE POLICY "members_boxes_public_read"
  ON members_boxes FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "members_boxes_admin_insert"
  ON members_boxes FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "members_boxes_admin_update"
  ON members_boxes FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "members_boxes_admin_delete"
  ON members_boxes FOR DELETE
  USING (is_admin());

-- =============================================================================
-- LOOKBOOK POSTS — public read of active, admin write
-- =============================================================================

CREATE POLICY "lookbook_public_read"
  ON lookbook_posts FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "lookbook_admin_insert"
  ON lookbook_posts FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "lookbook_admin_update"
  ON lookbook_posts FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "lookbook_admin_delete"
  ON lookbook_posts FOR DELETE
  USING (is_admin());

-- =============================================================================
-- EVENTS — public insert (anonymous tracking), admin read
-- =============================================================================

CREATE POLICY "events_public_insert"
  ON events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "events_own_select"
  ON events FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "events_admin_delete"
  ON events FOR DELETE
  USING (is_admin());

-- =============================================================================
-- STORAGE POLICIES (run if using Supabase Storage)
-- =============================================================================

-- Products bucket: public read, admin write
-- INSERT INTO storage.policies (bucket_id, name, definition)
-- VALUES
--   ('products', 'products_public_read',
--    '{"operation":"SELECT","check":"true"}'::jsonb),
--   ('products', 'products_admin_insert',
--    '{"operation":"INSERT","check":"(select is_admin())"}'::jsonb),
--   ('products', 'products_admin_update',
--    '{"operation":"UPDATE","check":"(select is_admin())"}'::jsonb),
--   ('products', 'products_admin_delete',
--    '{"operation":"DELETE","check":"(select is_admin())"}'::jsonb);

-- =============================================================================
-- GRANT USAGE TO ANON + AUTHENTICATED
-- =============================================================================

GRANT USAGE ON SEQUENCE member_number_seq TO authenticated;
GRANT USAGE ON SEQUENCE order_number_seq TO service_role;
