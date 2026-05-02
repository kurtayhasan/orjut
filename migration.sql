-- ============================================
-- MIGRATION: Align Supabase DB with Frontend
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Lands: Rename size_hectares → size_decare (if column exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lands' AND column_name='size_hectares') THEN
    ALTER TABLE public.lands RENAME COLUMN size_hectares TO size_decare;
  END IF;
END $$;

-- 2. Lands: Add missing columns (safe — skips if already exist)
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS size_decare NUMERIC;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS expected_yield_per_decare NUMERIC;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS expected_sell_price_unit NUMERIC;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS planting_date DATE;

-- 3. Lands: Change crop_type from enum to TEXT (if it's enum)
-- Drop the enum constraint and change to TEXT
ALTER TABLE public.lands ALTER COLUMN crop_type TYPE TEXT;

-- 4. Lands: Make 'name' nullable (frontend doesn't always send it)
ALTER TABLE public.lands ALTER COLUMN name DROP NOT NULL;

-- 5. Transactions: Add missing columns
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_thumbnail_url TEXT;

-- 6. Profiles: Ensure password column exists (MVP plain text)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- 7. Seasons table (if not exists)
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    year INTEGER,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Market prices table (if not exists)
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    source TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Done! ✅
SELECT 'Migration completed successfully' AS status;
