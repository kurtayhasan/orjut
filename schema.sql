-- ============================================================
-- ORJUT / ZiraiAsistan — PRODUCTION SCHEMA & RLS SECURED
-- Version: 2.1 | Date: 2026-06-28
-- ============================================================

-- ============================================================
-- PART 0: EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- PART 1: PROFILES TABLE (Linked with Supabase Auth auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'farmer' CONSTRAINT chk_profile_role CHECK (role IN ('farmer', 'engineer', 'admin')),
    is_premium BOOLEAN DEFAULT false,
    payment_status TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 2: LANDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT,
    geometry GEOMETRY(Polygon, 4326),
    city TEXT,
    district TEXT,
    neighborhood TEXT,
    block_no TEXT,
    parcel_no TEXT,
    size NUMERIC,
    size_decare NUMERIC,
    soil_type TEXT,
    crop_type TEXT,
    planting_date DATE,
    expected_yield NUMERIC,
    expected_price NUMERIC,
    expected_yield_per_decare NUMERIC,
    expected_sell_price_unit NUMERIC,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 3: TRANSACTIONS TABLE
-- ============================================================
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('expense', 'income');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID REFERENCES public.lands(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    category TEXT,
    receipt_url TEXT,
    receipt_thumbnail_url TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity NUMERIC,
    unit TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 4: SEASONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year INTEGER,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 5: INVENTORY TABLE
-- ============================================================
DO $$ BEGIN
    CREATE TYPE inventory_type AS ENUM ('seed', 'fertilizer', 'fuel', 'pesticide', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 0,
    unit_cost NUMERIC NOT NULL DEFAULT 0,
    type inventory_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 6: SAVINGS LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.savings_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 7: AI LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    raw_input TEXT NOT NULL,
    processed_json JSONB NOT NULL,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 8: DAILY SUMMARIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_spent NUMERIC DEFAULT 0,
    total_savings NUMERIC DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================================
-- PART 9: MARKET PRICES TABLE (Public read)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    source TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 10: COLLABORATORS TABLE (Land sharing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer', -- 'owner', 'editor', 'viewer'
    invite_token TEXT UNIQUE,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(land_id, user_id)
);

-- ============================================================
-- PART 11: FIELD OPERATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.field_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'sulama', 'gubreleme', 'ilaclama', 'hasat', 'diger'
    amount NUMERIC,
    unit TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 12: SCOUTING LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scouting_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    health_status TEXT, -- 'saglikli', 'hastalik', 'zararli'
    growth_stage TEXT,
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_prescription_applied BOOLEAN DEFAULT false,
    prescription_text TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 13: IRRIGATION LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    amount NUMERIC,
    unit TEXT DEFAULT 'm3',
    duration_minutes INTEGER,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 14: ENGINEER CLIENTS TABLE (Relationship for Consultant role)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.engineer_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(engineer_id, farmer_id)
);

-- ============================================================
-- PART 15: AI INSIGHTS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_insights_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    weather_snapshot JSONB,
    ai_recommendation TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 16: PUSH SUBSCRIPTIONS (PWA Support)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 17: NDVI SNAPSHOTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ndvi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    mean FLOAT,
    min FLOAT,
    max FLOAT,
    cloud_cover FLOAT,
    tile_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- PART 18: PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lands_org_id ON public.lands(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_land_id ON public.transactions(land_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_inventory_org_id ON public.inventory(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON public.ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_seasons_org_id ON public.seasons(org_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_land_id ON public.collaborators(land_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON public.collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON public.savings_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_field_ops_land_id ON public.field_operations(land_id);
CREATE INDEX IF NOT EXISTS idx_scouting_land_id ON public.scouting_logs(land_id);
CREATE INDEX IF NOT EXISTS idx_eng_clients_eng_id ON public.engineer_clients(engineer_id);
CREATE INDEX IF NOT EXISTS idx_eng_clients_far_id ON public.engineer_clients(farmer_id);

-- ============================================================
-- PART 19: ROW LEVEL SECURITY (RLS) LOCKDOWN WITH TYPE CASTS
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndvi_snapshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 1. PROFILES: Read/update only own profile.
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text);

-- 2. LANDS: Isolation by org_id (auth.uid() must match org_id)
CREATE POLICY "lands_all" ON public.lands FOR ALL USING (org_id::text = auth.uid()::text) WITH CHECK (org_id::text = auth.uid()::text);

-- 3. TRANSACTIONS: Isolation by org_id
CREATE POLICY "transactions_all" ON public.transactions FOR ALL USING (org_id::text = auth.uid()::text) WITH CHECK (org_id::text = auth.uid()::text);

-- 4. SEASONS: Isolation by org_id
CREATE POLICY "seasons_all" ON public.seasons FOR ALL USING (org_id::text = auth.uid()::text) WITH CHECK (org_id::text = auth.uid()::text);

-- 5. INVENTORY: Isolation by org_id
CREATE POLICY "inventory_all" ON public.inventory FOR ALL USING (org_id::text = auth.uid()::text) WITH CHECK (org_id::text = auth.uid()::text);

-- 6. SAVINGS LOGS: Isolation by user_id
CREATE POLICY "savings_all" ON public.savings_logs FOR ALL USING (user_id::text = auth.uid()::text) WITH CHECK (user_id::text = auth.uid()::text);

-- 7. AI LOGS: Isolation by user_id
CREATE POLICY "ai_logs_all" ON public.ai_logs FOR ALL USING (user_id::text = auth.uid()::text) WITH CHECK (user_id::text = auth.uid()::text);

-- 8. DAILY SUMMARIES: Isolation by user_id
CREATE POLICY "summaries_all" ON public.daily_summaries FOR ALL USING (user_id::text = auth.uid()::text) WITH CHECK (user_id::text = auth.uid()::text);

-- 9. MARKET PRICES: Readable by everyone, modifications restricted to service_role/admin
CREATE POLICY "market_select" ON public.market_prices FOR SELECT USING (true);

-- 10. COLLABORATORS: Access if user is collaborator or owns the land
CREATE POLICY "collaborators_all" ON public.collaborators FOR ALL USING (
    user_id::text = auth.uid()::text OR 
    land_id IN (SELECT id FROM public.lands WHERE org_id::text = auth.uid()::text)
);

-- 11. FIELD OPERATIONS: Isolation by org_id
CREATE POLICY "field_ops_all" ON public.field_operations FOR ALL USING (org_id::text = auth.uid()::text) WITH CHECK (org_id::text = auth.uid()::text);

-- 12. SCOUTING LOGS: Isolation by org_id
CREATE POLICY "scouting_all" ON public.scouting_logs FOR ALL USING (org_id::text = auth.uid()::text) WITH CHECK (org_id::text = auth.uid()::text);

-- 13. IRRIGATION LOGS: Isolation by org_id
CREATE POLICY "irrigation_all" ON public.irrigation_logs FOR ALL USING (org_id::text = auth.uid()::text) WITH CHECK (org_id::text = auth.uid()::text);

-- 14. ENGINEER CLIENTS: Access if user is the engineer or the farmer
CREATE POLICY "engineer_clients_all" ON public.engineer_clients FOR ALL USING (
    engineer_id::text = auth.uid()::text OR farmer_id::text = auth.uid()::text
);

-- 15. AI INSIGHTS HISTORY: Access via Land relationship owned by the user
CREATE POLICY "ai_insights_history_all" ON public.ai_insights_history FOR ALL USING (
    land_id IN (SELECT id FROM public.lands WHERE org_id::text = auth.uid()::text)
);

-- 16. PUSH SUBSCRIPTIONS: Isolation by user_id
CREATE POLICY "push_subscriptions_all" ON public.push_subscriptions FOR ALL USING (user_id::text = auth.uid()::text) WITH CHECK (user_id::text = auth.uid()::text);

-- 17. NDVI SNAPSHOTS: Access via Land relationship owned by the user
CREATE POLICY "ndvi_snapshots_all" ON public.ndvi_snapshots FOR ALL USING (
    land_id IN (SELECT id FROM public.lands WHERE org_id::text = auth.uid()::text)
);

-- ============================================================
-- PART 20: AUTH.USERS TRIGGER FOR PROFILE SYNCHRONIZATION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', SPLIT_PART(new.raw_user_meta_data->>'full_name', ' ', 1), 'Yeni');
    v_last_name := COALESCE(new.raw_user_meta_data->>'last_name', SPLIT_PART(new.raw_user_meta_data->>'full_name', ' ', 2), 'Kullanıcı');

    INSERT INTO public.profiles (id, phone, first_name, last_name, is_premium, role)
    VALUES (
        new.id,
        new.phone,
        v_first_name,
        v_last_name,
        false,
        'farmer'
    )
    ON CONFLICT (id) DO UPDATE 
    SET phone = EXCLUDED.phone,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 21: RPC - ATOMIC EXPENSE (Updates inventory & inserts transaction)
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_expense_atomic(
    p_tx_data JSONB,
    p_inventory_id UUID,
    p_quantity NUMERIC
) RETURNS JSONB AS $$
DECLARE
    v_tx_id UUID;
BEGIN
    -- 1. Insert Transaction
    INSERT INTO public.transactions (
        org_id, land_id, type, amount, description, category, date, quantity, unit
    ) VALUES (
        (p_tx_data->>'org_id')::UUID,
        (p_tx_data->>'land_id')::UUID,
        (p_tx_data->>'type')::transaction_type,
        (p_tx_data->>'amount')::NUMERIC,
        p_tx_data->>'description',
        p_tx_data->>'category',
        (p_tx_data->>'date')::DATE,
        (p_tx_data->>'quantity')::NUMERIC,
        p_tx_data->>'unit'
    ) RETURNING id INTO v_tx_id;

    -- 2. Update Inventory
    UPDATE public.inventory
    SET quantity = quantity - p_quantity
    WHERE id = p_inventory_id;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
