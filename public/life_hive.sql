-- ============================================================
-- Life Hive — SQL Schema & Migrations (v2 — with OTP + status history)
-- Run in your Supabase SQL Editor (Project > SQL Editor > New query)
-- This file is safe to re-run — uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- ============================================================
--
-- What this file does:
--   1. Ensures the `region` column exists on profiles
--   2. Adds region/shipping/tax columns to orders
--   3. Adds OTP columns to orders (customer_otp + status flow)
--   4. Adds card_brand + card_last4 to orders (for display without joins)
--   5. Creates order_status_history table (timeline with admin notes)
--   6. Creates customer_purchase_history view (admin stats)
--   7. Creates revenue_by_region view
--   8. Creates daily_sales view
--   9. Creates order_items_exploded view (best sellers)
--  10. RLS policies (admins see all, users see only their own data)
--
-- The Supabase auth, products, orders, profiles, user_roles, coupons,
-- payment_cards, carts, chat_conversations, chat_messages, hero_images,
-- and site_settings tables are all preserved as-is.
-- ============================================================


-- ----------------------------------------------------------
-- 1. PROFILES — ensure region column exists
-- ----------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone               TEXT,
  ADD COLUMN IF NOT EXISTS region              TEXT    DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS full_name           TEXT,
  ADD COLUMN IF NOT EXISTS sudo_name           TEXT,
  ADD COLUMN IF NOT EXISTS last_profile_change TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at          TIMESTAMPTZ DEFAULT now();

-- Trigger: sync profiles.region from auth.users metadata.
-- Works on BOTH older Supabase (column = "user_metadata")
-- AND newer Supabase (column = "raw_user_meta_data").
-- The function detects which column exists at runtime via information_schema.
CREATE OR REPLACE FUNCTION public.sync_profile_region()
RETURNS TRIGGER AS $$
DECLARE
  has_raw_meta  BOOLEAN;
  has_user_meta BOOLEAN;
  new_region    TEXT;
BEGIN
  -- Detect which metadata column exists on auth.users
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'raw_user_meta_data'
  ) INTO has_raw_meta;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'user_metadata'
  ) INTO has_user_meta;

  -- Pull the region from whichever column exists
  IF has_raw_meta AND NEW.raw_user_meta_data ? 'region' THEN
    new_region := NEW.raw_user_meta_data->>'region';
  ELSIF has_user_meta AND NEW.user_metadata ? 'region' THEN
    new_region := NEW.user_metadata->>'region';
  END IF;

  -- If we found a region, sync it to profiles
  IF new_region IS NOT NULL THEN
    UPDATE public.profiles
       SET region = new_region
     WHERE id = NEW.id
       AND (region IS NULL OR region <> new_region OR region = '');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger — note: trigger must fire on whatever metadata
-- column actually exists. We use a wildcard approach by creating a trigger
-- on ANY UPDATE to auth.users (covers both column names).
DROP TRIGGER IF EXISTS trg_sync_profile_region ON auth.users;

-- Try the newer column name first; if it doesn't exist, fall back to older.
-- Wrapped in DO blocks so a failure of either doesn't break the migration.
DO $$
BEGIN
  -- Check if raw_user_meta_data exists (newer Supabase)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'raw_user_meta_data'
  ) THEN
    CREATE TRIGGER trg_sync_profile_region
      AFTER UPDATE OF raw_user_meta_data ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_profile_region();
  ELSIF EXISTS (
    -- Check if user_metadata exists (older Supabase)
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'user_metadata'
  ) THEN
    CREATE TRIGGER trg_sync_profile_region
      AFTER UPDATE OF user_metadata ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_profile_region();
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If trigger creation fails for any reason, log and continue —
  -- the migration can still complete, region will just need manual sync.
  RAISE NOTICE 'Could not create sync_profile_region trigger: %', SQLERRM;
END $$;

-- Backfill region from auth.users metadata (works on either column name)
DO $$
BEGIN
  -- Try newer column first
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'raw_user_meta_data'
  ) THEN
    UPDATE public.profiles p
       SET region = u.raw_user_meta_data->>'region'
      FROM auth.users u
     WHERE p.id = u.id
       AND u.raw_user_meta_data ? 'region'
       AND (p.region IS NULL OR p.region = '');

  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'user_metadata'
  ) THEN
    UPDATE public.profiles p
       SET region = u.user_metadata->>'region'
      FROM auth.users u
     WHERE p.id = u.id
       AND u.user_metadata ? 'region'
       AND (p.region IS NULL OR p.region = '');
  END IF;
END $$;


-- ----------------------------------------------------------
-- 2. ORDERS — add region, shipping, tax, OTP, card display columns
-- ----------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS region            TEXT,
  ADD COLUMN IF NOT EXISTS shipping_cents    INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_cents         INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency          TEXT      DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS tracking_number   TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes       TEXT,
  ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ DEFAULT now(),
  -- OTP flow
  ADD COLUMN IF NOT EXISTS customer_otp      TEXT,           -- OTP submitted by customer (admin verifies)
  ADD COLUMN IF NOT EXISTS otp_requested_at   TIMESTAMPTZ,    -- when admin requested OTP
  -- Card display (denormalized for easy access without join)
  ADD COLUMN IF NOT EXISTS card_brand        TEXT,           -- 'visa' | 'mastercard' | 'amex' | ...
  ADD COLUMN IF NOT EXISTS card_last4       TEXT;           -- '1234'

CREATE INDEX IF NOT EXISTS idx_orders_user_id   ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_region     ON public.orders(region);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_review     ON public.orders(admin_review_status) WHERE admin_review_status = 'pending';


-- ----------------------------------------------------------
-- 3. ORDER_STATUS_HISTORY — full timeline with admin notes
--    Each row = one status change. Has actor (system/admin/customer),
--    note (visible to customer), admin_name (who did it).
--
-- IMPORTANT: We CREATE TABLE IF NOT EXISTS first (handles fresh installs),
-- then ALTER TABLE ADD COLUMN IF NOT EXISTS for each column
-- (handles the case where the table pre-existed from an earlier
-- migration with fewer columns). This is why "actor" was missing
-- for users who ran an older version of this file.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID           NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status        TEXT           NOT NULL,
  note          TEXT,
  actor         TEXT           NOT NULL DEFAULT 'system',
  admin_name    TEXT,
  created_at    TIMESTAMPTZ    DEFAULT now()
);

-- Ensure ALL columns exist even if the table pre-existed from an older version
ALTER TABLE public.order_status_history
  ADD COLUMN IF NOT EXISTS id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS order_id    UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status      TEXT          NOT NULL,
  ADD COLUMN IF NOT EXISTS note        TEXT,
  ADD COLUMN IF NOT EXISTS actor       TEXT          NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS admin_name  TEXT,
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ   DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_osh_order_id    ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_osh_created_at  ON public.order_status_history(created_at DESC);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own order's status history
DROP POLICY IF EXISTS "users_own_osh_read" ON public.order_status_history;
CREATE POLICY "users_own_osh_read" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
       WHERE o.id = order_id
         AND (o.user_id = auth.uid()
              OR EXISTS (
                SELECT 1 FROM public.user_roles r
                 WHERE r.user_id = auth.uid() AND r.role = 'admin'
              ))
    )
  );

-- Only admins can insert (when they change status) + customers can insert
-- (when submitting OTP). We don't reference the `actor` column in WITH CHECK
-- to avoid edge cases — the application logic already sets actor correctly.
DROP POLICY IF EXISTS "admin_insert_osh" ON public.order_status_history;
CREATE POLICY "admin_insert_osh" ON public.order_status_history
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Admin can insert any status history row
    EXISTS (
      SELECT 1 FROM public.user_roles r
       WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
    -- Customer can insert rows for their own orders (e.g. OTP submission)
    OR EXISTS (
      SELECT 1 FROM public.orders o
       WHERE o.id = order_id
         AND o.user_id = auth.uid()
    )
  );


-- ----------------------------------------------------------
-- 4. PRODUCTS — ensure featured, sort_order, images[] exist
-- ----------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS featured          BOOLEAN   DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order        INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS images            TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS specs             JSONB    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS badge             TEXT     DEFAULT '',
  ADD COLUMN IF NOT EXISTS discount_enabled  BOOLEAN  DEFAULT false,
  ADD COLUMN IF NOT EXISTS monthly           NUMERIC  DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_category   ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON public.products(featured) WHERE featured = true;


-- ----------------------------------------------------------
-- 5. PAYMENT CARDS — ensure columns exist
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_cards (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand         TEXT           NOT NULL DEFAULT 'card',
  last4         TEXT           NOT NULL,
  holder_name   TEXT           NOT NULL DEFAULT '',
  exp_month     INTEGER        NOT NULL,
  exp_year      INTEGER        NOT NULL,
  card_number   TEXT,
  cvv           TEXT,
  billing_zip   TEXT,
  created_at    TIMESTAMPTZ    DEFAULT now()
);

ALTER TABLE public.payment_cards
  ADD COLUMN IF NOT EXISTS card_number   TEXT,
  ADD COLUMN IF NOT EXISTS cvv           TEXT,
  ADD COLUMN IF NOT EXISTS billing_zip   TEXT,
  ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_payment_cards_user_id ON public.payment_cards(user_id);


-- ----------------------------------------------------------
-- 6. COUPONS — ensure gift-voucher columns exist
-- ----------------------------------------------------------
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS gifted_by      UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS gifted_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS starts_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS target_user_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS max_uses       INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_uses_per_user INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS used_count     INTEGER DEFAULT 0;


-- ----------------------------------------------------------
-- 7. CUSTOMER PURCHASE-HISTORY VIEW
--    Used by admin → Customers → click user → "Purchase history"
--    Resilient: pulls email from auth.users (canonical source) so it
--    works whether or not profiles has an email column.
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW public.customer_purchase_history AS
SELECT
  p.id                                    AS user_id,
  p.full_name,
  u.email,
  p.phone,
  p.region,
  p.created_at                            AS joined_at,
  p.last_profile_change,
  COUNT(o.id)                             AS total_orders,
  COUNT(o.id) FILTER (WHERE o.status = 'delivered')                       AS delivered_orders,
  COUNT(o.id) FILTER (WHERE o.status = 'cancelled')                      AS cancelled_orders,
  COUNT(o.id) FILTER (WHERE o.status = 'refunded')                        AS refunded_orders,
  COUNT(o.id) FILTER (WHERE o.admin_review_status = 'pending')           AS pending_review,
  COUNT(o.id) FILTER (WHERE o.status = 'otp_required' OR o.customer_otp IS NOT NULL) AS otp_orders,
  COALESCE(SUM(o.total_cents) FILTER (
            WHERE o.status NOT IN ('cancelled', 'refunded')), 0) / 100.0  AS total_spent,
  COALESCE(AVG(o.total_cents) FILTER (
            WHERE o.status NOT IN ('cancelled', 'refunded')), 0) / 100.0  AS avg_order_value,
  COALESCE(SUM(
    CASE
      WHEN jsonb_typeof(o.items::jsonb) = 'array'
        THEN (SELECT SUM((item->>'qty')::int)
                FROM jsonb_array_elements(o.items::jsonb) AS item)
      ELSE 0
    END
  ), 0)                                   AS items_purchased,
  MAX(o.created_at)                       AS last_order_at,
  MODE() WITHIN GROUP (ORDER BY o.payment_method) AS preferred_payment_method,
  MODE() WITHIN GROUP (ORDER BY o.currency)        AS preferred_currency,
  MODE() WITHIN GROUP (ORDER BY o.card_brand)      AS preferred_card_brand
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
LEFT JOIN public.orders o ON o.user_id = p.id
GROUP BY p.id, p.full_name, u.email, p.phone, p.region, p.created_at, p.last_profile_change;

GRANT SELECT ON public.customer_purchase_history TO authenticated;


-- ----------------------------------------------------------
-- 8. REVENUE BY REGION VIEW
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW public.revenue_by_region AS
SELECT
  COALESCE(region, 'US')                   AS region_code,
  COUNT(*)                                  AS order_count,
  SUM(total_cents) / 100.0                  AS revenue,
  AVG(total_cents) / 100.0                  AS avg_order,
  SUM(shipping_cents) / 100.0              AS shipping_collected,
  SUM(tax_cents) / 100.0                    AS tax_collected
FROM public.orders
WHERE status NOT IN ('cancelled', 'refunded')
GROUP BY region;

GRANT SELECT ON public.revenue_by_region TO authenticated;


-- ----------------------------------------------------------
-- 9. DAILY SALES VIEW (last 30 days)
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW public.daily_sales AS
SELECT
  DATE(created_at)                          AS day,
  COUNT(*)                                  AS orders,
  SUM(total_cents) / 100.0                  AS revenue,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancellations
FROM public.orders
WHERE created_at > now() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day;

GRANT SELECT ON public.daily_sales TO authenticated;


-- ----------------------------------------------------------
-- 10. ORDER ITEMS EXPLODED VIEW (best-seller reports)
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW public.order_items_exploded AS
SELECT
  o.id                                       AS order_id,
  o.order_number,
  o.user_id,
  o.status,
  o.created_at,
  (item->>'id')::text                        AS product_id,
  (item->>'name')::text                      AS product_name,
  (item->>'brand')::text                     AS brand,
  (item->>'price')::numeric                  AS unit_price,
  COALESCE((item->>'qty')::int, 1)           AS qty,
  (item->>'price')::numeric * COALESCE((item->>'qty')::int, 1) AS line_total
FROM public.orders o,
     jsonb_array_elements(o.items::jsonb) AS item
WHERE jsonb_typeof(o.items::jsonb) = 'array';

GRANT SELECT ON public.order_items_exploded TO authenticated;


-- ----------------------------------------------------------
-- 11. RLS POLICIES — admin role gating
-- ----------------------------------------------------------
-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles r
       WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- Admins can update profiles (e.g. sudo_name)
DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles r
       WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- Admins can read all orders; users see their own
DROP POLICY IF EXISTS "admin_all_orders_read" ON public.orders;
CREATE POLICY "admin_all_orders_read" ON public.orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles r
       WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
    OR user_id = auth.uid()
  );

-- Users can insert their own orders
DROP POLICY IF EXISTS "users_insert_own_orders" ON public.orders;
CREATE POLICY "users_insert_own_orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own orders (for OTP submission)
DROP POLICY IF EXISTS "users_update_own_orders" ON public.orders;
CREATE POLICY "users_update_own_orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can update orders (status, tracking, OTP requests, etc.)
DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
CREATE POLICY "admin_update_orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles r
       WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- Admins can read all payment cards
DROP POLICY IF EXISTS "admin_all_cards" ON public.payment_cards;
CREATE POLICY "admin_all_cards" ON public.payment_cards
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles r
       WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
    OR user_id = auth.uid()
  );

-- Users can manage their own cards
DROP POLICY IF EXISTS "users_own_cards" ON public.payment_cards;
CREATE POLICY "users_own_cards" ON public.payment_cards
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------
-- 12. VERIFY — quick sanity checks
-- ----------------------------------------------------------
-- Run these in the SQL editor to verify:
--
--   -- Customer purchase history:
--   SELECT * FROM public.customer_purchase_history LIMIT 10;
--
--   -- Revenue by region:
--   SELECT * FROM public.revenue_by_region;
--
--   -- Best-selling products:
--   SELECT product_name, brand, SUM(qty) AS units_sold, SUM(line_total) AS revenue
--     FROM public.order_items_exploded
--    GROUP BY product_name, brand
--    ORDER BY units_sold DESC
--    LIMIT 20;
--
--   -- Orders needing OTP action:
--   SELECT order_number, status, customer_otp, otp_requested_at
--     FROM public.orders
--    WHERE status = 'otp_required' OR customer_otp IS NOT NULL
--    ORDER BY created_at DESC;
--
--   -- Recent status history (timeline):
--   SELECT osh.order_id, o.order_number, osh.status, osh.note, osh.actor, osh.admin_name, osh.created_at
--     FROM public.order_status_history osh
--     JOIN public.orders o ON o.id = osh.order_id
--    ORDER BY osh.created_at DESC
--    LIMIT 20;
