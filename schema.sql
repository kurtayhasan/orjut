-- schema.sql (Extension for Gravity SaaS Boilerplate)

-- Enable PostGIS extension for geometry/geography data types
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Lands Table
-- NOTE: crop_type is now TEXT (not enum) to support dynamic global crop list

CREATE TABLE IF NOT EXISTS public.lands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT,
    geometry GEOMETRY(Polygon, 4326),
    city TEXT,
    district TEXT,
    neighborhood TEXT,
    block_no TEXT,
    parcel_no TEXT,
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

-- 2. Inventory Table
CREATE TYPE inventory_type AS ENUM ('seed', 'fertilizer', 'fuel', 'other');

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 0,
    unit_cost NUMERIC NOT NULL DEFAULT 0,
    type inventory_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions Table
CREATE TYPE transaction_type AS ENUM ('expense', 'income');

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    land_id UUID REFERENCES public.lands(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    category TEXT,
    receipt_url TEXT,
    receipt_thumbnail_url TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI Logs Table
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users(id) in Gravity
    raw_input TEXT NOT NULL,
    processed_json JSONB NOT NULL,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Savings Logs Table
CREATE TABLE IF NOT EXISTS public.savings_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Daily Summaries Table (for Feature 3)
CREATE TABLE IF NOT EXISTS public.daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_spent NUMERIC DEFAULT 0,
    total_savings NUMERIC DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lands_org_id ON public.lands(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_land_id ON public.transactions(land_id);
CREATE INDEX IF NOT EXISTS idx_inventory_org_id ON public.inventory(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON public.ai_logs(user_id);
