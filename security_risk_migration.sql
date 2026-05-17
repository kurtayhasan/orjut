-- ============================================================
-- ORJUT — STRICT SECURITY PATCH, RLS LOCKDOWN & ADMIN BYPASS
-- Migration File: security_risk_migration.sql
-- ============================================================

-- 1. Ensure profile_id column exists and is linked properly in target tables
ALTER TABLE public.lands ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.scouting_logs ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Sync existing data (copy org_id to profile_id for backwards compatibility)
UPDATE public.lands SET profile_id = org_id WHERE profile_id IS NULL;
UPDATE public.transactions SET profile_id = org_id WHERE profile_id IS NULL;
UPDATE public.scouting_logs SET profile_id = org_id WHERE profile_id IS NULL;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_clients ENABLE ROW LEVEL SECURITY;

-- 3. Drop all potentially permissive/existing policies for clean slate
DROP POLICY IF EXISTS "Access for owner or approved engineer" ON public.lands;
DROP POLICY IF EXISTS "lands_select" ON public.lands;
DROP POLICY IF EXISTS "lands_insert" ON public.lands;
DROP POLICY IF EXISTS "lands_update" ON public.lands;
DROP POLICY IF EXISTS "lands_delete" ON public.lands;
DROP POLICY IF EXISTS "lands_policy" ON public.lands;

DROP POLICY IF EXISTS "Access for owner or approved engineer" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
DROP POLICY IF EXISTS "transactions_policy" ON public.transactions;

DROP POLICY IF EXISTS "Access for owner or approved engineer" ON public.scouting_logs;
DROP POLICY IF EXISTS "scouting_logs_select" ON public.scouting_logs;
DROP POLICY IF EXISTS "scouting_logs_insert" ON public.scouting_logs;
DROP POLICY IF EXISTS "scouting_logs_update" ON public.scouting_logs;
DROP POLICY IF EXISTS "scouting_logs_delete" ON public.scouting_logs;
DROP POLICY IF EXISTS "scout_all" ON public.scouting_logs;
DROP POLICY IF EXISTS "scouting_logs_policy" ON public.scouting_logs;

DROP POLICY IF EXISTS "Engineers can see their own client links" ON public.engineer_clients;
DROP POLICY IF EXISTS "engineer_clients_select" ON public.engineer_clients;
DROP POLICY IF EXISTS "engineer_clients_insert" ON public.engineer_clients;
DROP POLICY IF EXISTS "engineer_clients_update" ON public.engineer_clients;
DROP POLICY IF EXISTS "engineer_clients_delete" ON public.engineer_clients;
DROP POLICY IF EXISTS "engineer_clients_policy" ON public.engineer_clients;

-- 4. Create locked-down policies with owner-only access and Admin Role Bypass
CREATE POLICY lands_policy ON public.lands
    FOR ALL
    USING (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
    WITH CHECK (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY transactions_policy ON public.transactions
    FOR ALL
    USING (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
    WITH CHECK (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY scouting_logs_policy ON public.scouting_logs
    FOR ALL
    USING (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
    WITH CHECK (profile_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. Create client link read policy for Engineers and Admins only
CREATE POLICY engineer_clients_policy ON public.engineer_clients
    FOR SELECT
    USING (engineer_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

SELECT 'Security Lockdown Patch Applied successfully ✅' AS status;
