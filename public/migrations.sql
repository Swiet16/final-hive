-- ============================================================
-- WheelDeelz — SQL Migrations
-- Run these in your Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- 1. PAYMENT CARDS — Ensure all columns exist for full card storage
-- ----------------------------------------------------------------
-- The payment_cards table stores full card details (visible to admin only)
-- Users only see masked version (•••• •••• •••• last4 / CVV: •••)

ALTER TABLE public.payment_cards
  ADD COLUMN IF NOT EXISTS card_number   TEXT,          -- Full card number (admin-only view)
  ADD COLUMN IF NOT EXISTS cvv           TEXT,          -- CVV / security code (admin-only view)
  ADD COLUMN IF NOT EXISTS billing_zip   TEXT,          -- Optional billing zip
  ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ    DEFAULT now();

-- Ensure these standard columns exist
ALTER TABLE public.payment_cards
  ADD COLUMN IF NOT EXISTS id            UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS user_id       UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS brand         TEXT           NOT NULL DEFAULT 'card',
  ADD COLUMN IF NOT EXISTS last4         TEXT           NOT NULL,
  ADD COLUMN IF NOT EXISTS holder_name   TEXT           NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS exp_month     INTEGER        NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS exp_year      INTEGER        NOT NULL DEFAULT 2025;

-- Create table from scratch if it doesn't exist yet
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

-- RLS: Users can manage only their own cards
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_cards"     ON public.payment_cards;
DROP POLICY IF EXISTS "admin_all_cards"     ON public.payment_cards;

-- Users: read/insert/delete only their own cards (no card_number/cvv in select)
CREATE POLICY "users_own_cards" ON public.payment_cards
  FOR ALL USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_payment_cards_user_id ON public.payment_cards(user_id);


-- 2. COUPONS — Ensure gift-voucher columns exist
-- -----------------------------------------------

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS gifted_by     UUID           REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS gifted_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS starts_at     TIMESTAMPTZ;

-- The target_user_ids column should be a text[] or jsonb array
-- If it's missing, add it:
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS target_user_ids TEXT[] DEFAULT '{}';


-- 3. PROFILES — Ensure phone and region columns exist
-- ----------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone              TEXT,
  ADD COLUMN IF NOT EXISTS region             TEXT    DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS sudo_name          TEXT,
  ADD COLUMN IF NOT EXISTS last_profile_change TIMESTAMPTZ DEFAULT now();


-- ============================================================
-- VERIFY: Check that all key tables exist and have the right shape
-- ===========================================================

-- Run these selects to verify (should return 0 rows, not errors):
-- SELECT * FROM public.payment_cards LIMIT 1;
-- SELECT * FROM public.coupons LIMIT 1;
-- SELECT * FROM public.profiles LIMIT 1;
