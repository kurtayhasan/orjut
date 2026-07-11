-- SCHEMA FIX: Sync frontend types with database columns
-- Run this in Supabase SQL Editor

-- 1. Seasons Table: Add start_date and end_date
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS end_date DATE;

-- 2. Inventory Table: Rename or Add columns to match frontend
-- item_name -> name (or keep item_name and map in db.ts)
-- We will keep schema as is but add aliases or just map in db.ts to avoid breaking existing data
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'kg';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS last_purchase_date DATE;

-- 3. Field Operations Table: Ensure it exists (I don't see it in schema.sql but it's in db.ts)
CREATE TABLE IF NOT EXISTS public.field_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL,
    method TEXT,
    amount NUMERIC DEFAULT 0,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Irrigation Logs Table: Ensure it exists
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER DEFAULT 0,
    water_amount_m3 NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Scouting Logs Table: Ensure it exists
CREATE TABLE IF NOT EXISTS public.scouting_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    land_id UUID NOT NULL REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    health_score INTEGER DEFAULT 5,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NDVI Snapshots (Missing from schema.sql but needed for analytics)
CREATE TABLE IF NOT EXISTS public.ndvi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES public.lands(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    mean FLOAT,
    min FLOAT,
    max FLOAT,
    image_url TEXT
);

-- 7. Ensure RLS for new tables
ALTER TABLE public.field_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndvi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ops_all" ON public.field_operations FOR ALL USING (true);
CREATE POLICY "irr_all" ON public.irrigation_logs FOR ALL USING (true);
CREATE POLICY "scout_all" ON public.scouting_logs FOR ALL USING (true);
CREATE POLICY "ndvi_all" ON public.ndvi_snapshots FOR ALL USING (true);
