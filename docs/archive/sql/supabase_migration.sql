-- ============================================================
-- ORJUT / ZiraiAsistan — FINAL PRODUCTION MIGRATION
-- Run this in Supabase SQL Editor to ensure schema integrity.
-- ============================================================

-- 1. PROFILES TABLE ENHANCEMENTS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'farmer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free';

-- 2. FIELD OPERATIONS TABLE
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

-- 3. SCOUTING LOGS TABLE
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

-- 4. IRRIGATION LOGS TABLE (If separate from field_operations)
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

-- 5. ENGINEER CLIENTS TABLE (Relationship for Consultant role)
CREATE TABLE IF NOT EXISTS public.engineer_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(engineer_id, farmer_id)
);

-- 6. AI INSIGHTS HISTORY
CREATE TABLE IF NOT EXISTS public.ai_insights_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    weather_snapshot JSONB,
    ai_recommendation TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PUSH SUBSCRIPTIONS (PWA Support)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_field_ops_land_id ON public.field_operations(land_id);
CREATE INDEX IF NOT EXISTS idx_scouting_land_id ON public.scouting_logs(land_id);
CREATE INDEX IF NOT EXISTS idx_eng_clients_eng_id ON public.engineer_clients(engineer_id);
CREATE INDEX IF NOT EXISTS idx_eng_clients_far_id ON public.engineer_clients(farmer_id);

-- 9. ENABLE RLS FOR NEW TABLES
ALTER TABLE public.field_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 10. PERMISSIVE POLICIES FOR NEW TABLES (MVP AUTH COMPATIBLE)
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('field_operations', 'scouting_logs', 'irrigation_logs', 'engineer_clients', 'ai_insights_history', 'push_subscriptions'))
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY %I_select ON public.%I FOR SELECT USING (true)', r.tablename, r.tablename);
    
    EXECUTE format('DROP POLICY IF EXISTS %I_insert ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY %I_insert ON public.%I FOR INSERT WITH CHECK (true)', r.tablename, r.tablename);
    
    EXECUTE format('DROP POLICY IF EXISTS %I_update ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY %I_update ON public.%I FOR UPDATE USING (true) WITH CHECK (true)', r.tablename, r.tablename);
    
    EXECUTE format('DROP POLICY IF EXISTS %I_delete ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY %I_delete ON public.%I FOR DELETE USING (true)', r.tablename, r.tablename);
  END LOOP;
END $$;

-- 11. RPC: ATOMIC EXPENSE (Updates inventory quantity and inserts transaction)
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

SELECT 'Production Migration Successful ✅' AS status;
