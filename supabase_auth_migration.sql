-- SUPABASE AUTH MIGRATION: PSEUDO-AUTH TO TRUE OAUTH + RLS LOCKDOWN
-- PHASE 1: SCHEMA ADJUSTMENTS FOR OAUTH & PREMIUM

-- Profiles adjustment: phone is no longer required for Google OAuth
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;

-- Add is_premium column if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Ensure ndvi_snapshots table exists with proper cascade delete
CREATE TABLE IF NOT EXISTS public.ndvi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    mean FLOAT,
    min FLOAT,
    max FLOAT,
    cloud_cover FLOAT,
    tile_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- PHASE 2: AUTH.USERS TRIGGER (SYNC TO PROFILES)
-- This function will automatically create a public profile when a user signs up via Google/Email

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, is_premium)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Yeni Kullanıcı'),
    '',
    new.raw_user_meta_data->>'avatar_url',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PHASE 3: TOTAL RLS OVERHAUL (TRUE SECURITY)
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndvi_snapshots ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES: Users can only see and edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- 2. LANDS: Lockdown by org_id
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.lands;
CREATE POLICY "Enable ALL for users based on org_id" ON public.lands
FOR ALL USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());

-- 3. TRANSACTIONS: Lockdown by org_id
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.transactions;
CREATE POLICY "Enable ALL for users based on org_id" ON public.transactions
FOR ALL USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());

-- 4. INVENTORY: Lockdown by org_id
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.inventory;
CREATE POLICY "Enable ALL for users based on org_id" ON public.inventory
FOR ALL USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());

-- 5. FIELD OPERATIONS: Lockdown by org_id
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.field_operations;
CREATE POLICY "Enable ALL for users based on org_id" ON public.field_operations
FOR ALL USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());

-- 6. SCOUTING LOGS: Lockdown by org_id
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.scouting_logs;
CREATE POLICY "Enable ALL for users based on org_id" ON public.scouting_logs
FOR ALL USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());

-- 7. SEASONS: Lockdown by org_id
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.seasons;
CREATE POLICY "Enable ALL for users based on org_id" ON public.seasons
FOR ALL USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());

-- 8. NDVI SNAPSHOTS: Access via Land relationship
DROP POLICY IF EXISTS "Users can view NDVI of their lands" ON public.ndvi_snapshots;
CREATE POLICY "Users can view NDVI of their lands" ON public.ndvi_snapshots
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.lands 
        WHERE lands.id = ndvi_snapshots.land_id 
        AND lands.org_id = auth.uid()
    )
);

-- PHASE 4: STORAGE SECURITY
-- Lockdown the 'receipts' bucket
-- Note: Run these in the 'storage' schema if your UI allows, otherwise this RLS applies to storage.objects

DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
CREATE POLICY "Authenticated users can upload receipts" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Users can view own receipts" ON storage.objects;
CREATE POLICY "Users can view own receipts" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'receipts');
