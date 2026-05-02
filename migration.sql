-- ============================================================
-- ORJUT / ZiraiAsistan — QUICK MIGRATION SCRIPT
-- For existing Supabase databases — run in SQL Editor
-- ============================================================

-- 1. Rename legacy column
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lands' AND column_name='size_hectares') THEN
    ALTER TABLE public.lands RENAME COLUMN size_hectares TO size_decare;
  END IF;
END $$;

-- 2. Add missing columns to lands
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS size_decare NUMERIC;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS size NUMERIC;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS expected_yield_per_decare NUMERIC;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS expected_sell_price_unit NUMERIC;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS planting_date DATE;
ALTER TABLE public.lands ALTER COLUMN crop_type TYPE TEXT;
DO $$ BEGIN ALTER TABLE public.lands ALTER COLUMN name DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END $$;

-- 3. Add missing columns to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_thumbnail_url TEXT;

-- 4. Add password to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- 5. Create seasons table
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    year INTEGER,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create market_prices table
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    source TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create collaborators table
CREATE TABLE IF NOT EXISTS public.collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    invite_token TEXT UNIQUE,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(land_id, user_id)
);

-- 8. Create receipts storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Performance indexes
CREATE INDEX IF NOT EXISTS idx_lands_org_id ON public.lands(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_land_id ON public.transactions(land_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_inventory_org_id ON public.inventory(org_id);
CREATE INDEX IF NOT EXISTS idx_seasons_org_id ON public.seasons(org_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_land_id ON public.collaborators(land_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 10. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- 11. Permissive policies (custom auth — no auth.uid())
DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_lands" ON public.lands;
CREATE POLICY "allow_all_lands" ON public.lands FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_transactions" ON public.transactions;
CREATE POLICY "allow_all_transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_seasons" ON public.seasons;
CREATE POLICY "allow_all_seasons" ON public.seasons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_inventory" ON public.inventory;
CREATE POLICY "allow_all_inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_savings" ON public.savings_logs;
CREATE POLICY "allow_all_savings" ON public.savings_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_market" ON public.market_prices;
CREATE POLICY "allow_all_market" ON public.market_prices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_collab" ON public.collaborators;
CREATE POLICY "allow_all_collab" ON public.collaborators FOR ALL USING (true) WITH CHECK (true);

SELECT 'Migration Complete ✅' AS status;
