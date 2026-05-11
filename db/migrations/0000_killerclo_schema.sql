-- =============================================================================
-- KILLERCLO — Initial Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SEQUENCES
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS member_number_seq
  START WITH 1988
  INCREMENT BY 1
  MINVALUE 1988
  NO MAXVALUE
  CACHE 1;

CREATE SEQUENCE IF NOT EXISTS order_number_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  NO MAXVALUE
  CACHE 1;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-assign member_number from sequence on profile insert
CREATE OR REPLACE FUNCTION assign_member_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_number IS NULL THEN
    NEW.member_number = nextval('member_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate order number in format KLR-YYYY-NNNN
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part  TEXT;
BEGIN
  year_part = TO_CHAR(NOW() AT TIME ZONE 'Europe/Madrid', 'YYYY');
  seq_part  = LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  RETURN 'KLR-' || year_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

-- Atomically decrement stock, raises exception if insufficient
CREATE OR REPLACE FUNCTION decrement_stock(
  p_variant_id UUID,
  p_quantity    INT
)
RETURNS VOID AS $$
DECLARE
  current_stock INT;
BEGIN
  SELECT stock INTO current_stock
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Variant % not found', p_variant_id;
  END IF;

  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for variant %. Available: %, requested: %',
      p_variant_id, current_stock, p_quantity;
  END IF;

  UPDATE product_variants
  SET stock = stock - p_quantity
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql;

-- Restore stock (used on refund webhook)
CREATE OR REPLACE FUNCTION restore_stock(
  p_variant_id UUID,
  p_quantity    INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET stock = stock + p_quantity
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLES (dependency order)
-- =============================================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,
  name            TEXT        NOT NULL,
  tagline         TEXT,
  cover_image_url TEXT,
  position        INT         NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drops (campaign releases)
CREATE TABLE IF NOT EXISTS drops (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,
  name            TEXT        NOT NULL,
  description     TEXT,
  cover_image_url TEXT,
  release_at      TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN     NOT NULL DEFAULT FALSE,
  position        INT         NOT NULL DEFAULT 0
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT        UNIQUE NOT NULL,
  name               TEXT        NOT NULL,
  description        TEXT,
  base_price_cents   INT         NOT NULL CHECK (base_price_cents > 0),
  currency           TEXT        NOT NULL DEFAULT 'EUR',
  category_id        UUID        REFERENCES categories(id),
  drop_id            UUID        REFERENCES drops(id),
  is_active          BOOLEAN     NOT NULL DEFAULT TRUE,
  is_featured        BOOLEAN     NOT NULL DEFAULT FALSE,
  is_best_seller     BOOLEAN     NOT NULL DEFAULT FALSE,
  is_members_only    BOOLEAN     NOT NULL DEFAULT FALSE,
  model_info         TEXT,
  composition        TEXT,
  care_instructions  TEXT,
  seo_title          TEXT,
  seo_description    TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product variants (size/color/stock)
CREATE TABLE IF NOT EXISTS product_variants (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           UUID    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size                 TEXT    NOT NULL,
  color                TEXT,
  sku                  TEXT    UNIQUE NOT NULL,
  stock                INT     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price_override_cents INT     CHECK (price_override_cents > 0),
  position             INT     NOT NULL DEFAULT 0
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT    NOT NULL,
  alt        TEXT,
  position   INT     NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id                 UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT        UNIQUE NOT NULL,
  full_name          TEXT,
  phone              TEXT,
  member_number      INT         UNIQUE,
  member_tier        TEXT        NOT NULL DEFAULT 'rookie'
                                 CHECK (member_tier IN ('rookie', 'killer', 'legend')),
  whatsapp_consent   BOOLEAN     NOT NULL DEFAULT FALSE,
  marketing_consent  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shipping/billing addresses
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name   TEXT,
  line1       TEXT    NOT NULL,
  line2       TEXT,
  city        TEXT    NOT NULL,
  state       TEXT,
  postal_code TEXT    NOT NULL,
  country     TEXT    NOT NULL DEFAULT 'ES',
  phone       TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number              TEXT        UNIQUE NOT NULL,
  user_id                   UUID        REFERENCES profiles(id),
  email                     TEXT        NOT NULL,
  status                    TEXT        NOT NULL DEFAULT 'pending'
                                        CHECK (status IN ('pending','paid','processing','shipped','delivered','refunded','cancelled')),
  subtotal_cents            INT         NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents            INT         NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents                 INT         NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents               INT         NOT NULL CHECK (total_cents >= 0),
  currency                  TEXT        NOT NULL DEFAULT 'EUR',
  stripe_session_id         TEXT,
  stripe_payment_intent_id  TEXT,
  shipping_address          JSONB,
  billing_address           JSONB,
  tracking_number           TEXT,
  tracking_carrier          TEXT        CHECK (tracking_carrier IN ('correos','seur','mrw','gls','dhl')),
  tracking_url              TEXT,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at                   TIMESTAMPTZ,
  shipped_at                TIMESTAMPTZ
);

-- Order line items (snapshot at purchase time)
CREATE TABLE IF NOT EXISTS order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id       UUID REFERENCES product_variants(id),
  product_name     TEXT NOT NULL,
  variant_label    TEXT NOT NULL,
  unit_price_cents INT  NOT NULL CHECK (unit_price_cents > 0),
  quantity         INT  NOT NULL CHECK (quantity > 0),
  total_cents      INT  NOT NULL CHECK (total_cents > 0)
);

-- Newsletter / Killer Club subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  source        TEXT,
  member_number INT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members mystery box
CREATE TABLE IF NOT EXISTS members_boxes (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT    NOT NULL,
  price_cents     INT     NOT NULL CHECK (price_cents > 0),
  description     TEXT,
  contents_config JSONB,
  stock           INT     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  cover_image_url TEXT
);

-- Lookbook / squad posts with shoppable hotspots
CREATE TABLE IF NOT EXISTS lookbook_posts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT,
  image_url  TEXT        NOT NULL,
  hotspots   JSONB       NOT NULL DEFAULT '[]'::JSONB,
  position   INT         NOT NULL DEFAULT 0,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lightweight analytics events
CREATE TABLE IF NOT EXISTS events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT        NOT NULL
             CHECK (type IN ('page_view','add_to_cart','begin_checkout','purchase','remove_from_cart')),
  session_id TEXT,
  user_id    UUID        REFERENCES profiles(id),
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER profiles_assign_member_number
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_member_number();

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS categories_position_idx      ON categories (position);
CREATE INDEX IF NOT EXISTS categories_is_active_idx     ON categories (is_active);

CREATE INDEX IF NOT EXISTS drops_release_at_idx         ON drops (release_at);
CREATE INDEX IF NOT EXISTS drops_is_active_idx          ON drops (is_active);

CREATE INDEX IF NOT EXISTS products_category_id_idx     ON products (category_id);
CREATE INDEX IF NOT EXISTS products_drop_id_idx         ON products (drop_id);
CREATE INDEX IF NOT EXISTS products_is_active_idx       ON products (is_active);
CREATE INDEX IF NOT EXISTS products_is_featured_idx     ON products (is_featured);
CREATE INDEX IF NOT EXISTS products_is_best_seller_idx  ON products (is_best_seller);
CREATE INDEX IF NOT EXISTS products_created_at_idx      ON products (created_at DESC);

CREATE INDEX IF NOT EXISTS variants_product_id_idx      ON product_variants (product_id);

CREATE INDEX IF NOT EXISTS images_product_id_idx        ON product_images (product_id);
CREATE INDEX IF NOT EXISTS images_is_primary_idx        ON product_images (is_primary);

CREATE INDEX IF NOT EXISTS profiles_member_number_idx   ON profiles (member_number);
CREATE INDEX IF NOT EXISTS profiles_member_tier_idx     ON profiles (member_tier);

CREATE INDEX IF NOT EXISTS addresses_user_id_idx        ON addresses (user_id);

CREATE INDEX IF NOT EXISTS orders_user_id_idx           ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx            ON orders (status);
CREATE INDEX IF NOT EXISTS orders_stripe_session_idx    ON orders (stripe_session_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx        ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_paid_at_idx           ON orders (paid_at DESC);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx     ON order_items (order_id);

CREATE INDEX IF NOT EXISTS newsletter_is_active_idx     ON newsletter_subscribers (is_active);

CREATE INDEX IF NOT EXISTS lookbook_position_idx        ON lookbook_posts (position);
CREATE INDEX IF NOT EXISTS lookbook_is_active_idx       ON lookbook_posts (is_active);

CREATE INDEX IF NOT EXISTS events_type_idx              ON events (type);
CREATE INDEX IF NOT EXISTS events_created_at_idx        ON events (created_at DESC);
CREATE INDEX IF NOT EXISTS events_session_id_idx        ON events (session_id);
CREATE INDEX IF NOT EXISTS events_user_id_idx           ON events (user_id);

-- =============================================================================
-- STORAGE BUCKETS (run separately or via Supabase dashboard)
-- =============================================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('products', 'products', true),
--        ('lookbook', 'lookbook', true),
--        ('members-boxes', 'members-boxes', true)
-- ON CONFLICT DO NOTHING;
