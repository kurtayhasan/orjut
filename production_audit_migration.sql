-- ============================================================
-- ORJUT PRODUCTION AUDIT MIGRATION
-- QA Audit: 2026-05-17 — 360° Architecture Review
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART A: PROFILES — Add missing columns
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'farmer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free';

-- Constrain payment_status to valid values
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_payment_status_check
    CHECK (payment_status IN ('free', 'pending_approval', 'approved'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Constrain role to valid values
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('farmer', 'engineer', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PART B: LANDS — Add missing columns
-- ============================================================
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS environment_type TEXT DEFAULT 'acik_tarla';
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS is_irrigated BOOLEAN DEFAULT false;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS soil_type TEXT;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS size_sqm NUMERIC;
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS boundaries JSONB;

-- ============================================================
-- PART C: SEASONS — Add missing columns
-- ============================================================
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS end_date DATE;

-- ============================================================
-- PART D: TRANSACTIONS — Add missing columns
-- ============================================================
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS quantity NUMERIC;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================
-- PART E: INVENTORY — Add missing columns
-- ============================================================
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'kg';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS last_purchase_date DATE;
-- Add 'pesticide' to inventory_type enum if not exists
DO $$ BEGIN
  ALTER TYPE inventory_type ADD VALUE IF NOT EXISTS 'pesticide';
EXCEPTION WHEN others THEN NULL;
END $$;

-- ============================================================
-- PART F: FIELD OPERATIONS — Full table with CASCADE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.field_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL,
    method TEXT,
    amount NUMERIC DEFAULT 0,
    unit TEXT,
    notes TEXT,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART G: IRRIGATION LOGS — Full table with CASCADE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'saat',
    method TEXT,
    notes TEXT,
    duration_minutes INTEGER,
    water_amount_m3 NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART H: SCOUTING LOGS — Full table with Phase 3 columns
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scouting_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    health_status TEXT DEFAULT 'saglikli',
    growth_stage TEXT DEFAULT 'cimlenme',
    health_score INTEGER DEFAULT 5,
    image_url TEXT,
    -- Phase 3: Prescription Loop
    prescription_action TEXT,
    prescription_notes TEXT,
    prescription_text TEXT,
    is_prescription_applied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing scouting_logs if table exists
ALTER TABLE public.scouting_logs ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'saglikli';
ALTER TABLE public.scouting_logs ADD COLUMN IF NOT EXISTS growth_stage TEXT DEFAULT 'cimlenme';
ALTER TABLE public.scouting_logs ADD COLUMN IF NOT EXISTS prescription_action TEXT;
ALTER TABLE public.scouting_logs ADD COLUMN IF NOT EXISTS prescription_notes TEXT;
ALTER TABLE public.scouting_logs ADD COLUMN IF NOT EXISTS prescription_text TEXT;
ALTER TABLE public.scouting_logs ADD COLUMN IF NOT EXISTS is_prescription_applied BOOLEAN DEFAULT false;

-- ============================================================
-- PART I: ENGINEER CLIENTS — Role-based relationship table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.engineer_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(engineer_id, farmer_id)
);

DO $$ BEGIN
  ALTER TABLE public.engineer_clients
    ADD CONSTRAINT engineer_clients_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PART J: AI INSIGHTS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_insights_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES public.lands(id) ON DELETE CASCADE,
    weather_snapshot JSONB,
    ai_recommendation TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART K: PUSH SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================
-- PART L: PERFORMANCE INDEXES (new tables)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_field_ops_org_id ON public.field_operations(org_id);
CREATE INDEX IF NOT EXISTS idx_field_ops_land_id ON public.field_operations(land_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_org_id ON public.irrigation_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_scouting_org_id ON public.scouting_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_scouting_land_id ON public.scouting_logs(land_id);
CREATE INDEX IF NOT EXISTS idx_eng_clients_engineer ON public.engineer_clients(engineer_id);
CREATE INDEX IF NOT EXISTS idx_eng_clients_farmer ON public.engineer_clients(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_land ON public.ai_insights_history(land_id);

-- ============================================================
-- PART M: RLS FOR NEW TABLES
-- ============================================================
ALTER TABLE public.field_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies cleanly
DROP POLICY IF EXISTS "ops_all" ON public.field_operations;
DROP POLICY IF EXISTS "irr_all" ON public.irrigation_logs;
DROP POLICY IF EXISTS "scout_all" ON public.scouting_logs;
DROP POLICY IF EXISTS "eng_clients_all" ON public.engineer_clients;
DROP POLICY IF EXISTS "ai_history_all" ON public.ai_insights_history;
DROP POLICY IF EXISTS "push_subs_all" ON public.push_subscriptions;

CREATE POLICY "ops_all" ON public.field_operations FOR ALL USING (true);
CREATE POLICY "irr_all" ON public.irrigation_logs FOR ALL USING (true);
CREATE POLICY "scout_all" ON public.scouting_logs FOR ALL USING (true);
CREATE POLICY "eng_clients_all" ON public.engineer_clients FOR ALL USING (true);
CREATE POLICY "ai_history_all" ON public.ai_insights_history FOR ALL USING (true);
CREATE POLICY "push_subs_all" ON public.push_subscriptions FOR ALL USING (true);

-- ============================================================
-- PART N: NDVI SNAPSHOTS (Analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ndvi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    mean FLOAT,
    min FLOAT,
    max FLOAT,
    image_url TEXT
);
ALTER TABLE public.ndvi_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ndvi_all" ON public.ndvi_snapshots;
CREATE POLICY "ndvi_all" ON public.ndvi_snapshots FOR ALL USING (true);

-- ============================================================
-- PART O: RLS RECURSION FIX (Sonsuz Döngü Yaması)
-- ============================================================
-- Supabase roles_migration dosyasındaki "Admins see all profiles" politikası,
-- profiles tablosunu sorgularken profiles tablosu üzerinde tetiklendiği için
-- veritabanında sonsuz döngüye (infinite recursion) yol açıp girişi/kaydı kitliyordu.
-- Bu hatalı politikayı kaldırarak girişi tamamen açıyoruz.
DROP POLICY IF EXISTS "Admins see all profiles" ON public.profiles;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'Orjut 360° Production Audit Migration Complete ✅' AS status;
