-- Migration script for Unified Operations and Scouting
-- Run this in your Supabase SQL Editor

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('gubre', 'ilac', 'tohum', 'diger')),
    quantity DECIMAL NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create field_operations table
CREATE TABLE IF NOT EXISTS field_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    land_id UUID REFERENCES lands(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
    type VARCHAR(50) CHECK (type IN ('su', 'gubre', 'ilac')),
    date DATE NOT NULL,
    amount DECIMAL NOT NULL,
    unit VARCHAR(20) NOT NULL,
    method VARCHAR(100) NOT NULL,
    period_days INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scouting_logs table
CREATE TABLE IF NOT EXISTS scouting_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    land_id UUID REFERENCES lands(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    growth_stage VARCHAR(50) CHECK (growth_stage IN ('cimlenme', 'ciceklenme', 'meyve_tutumu', 'hasat')),
    health_status VARCHAR(50) CHECK (health_status IN ('saglikli', 'hastalik', 'zararli')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update lands table with new fields
ALTER TABLE lands ADD COLUMN IF NOT EXISTS environment_type VARCHAR(50) DEFAULT 'acik_tarla';
ALTER TABLE lands ADD COLUMN IF NOT EXISTS size_sqm DECIMAL;

-- Enable RLS (Assuming existing patterns)
ALTER TABLE field_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouting_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies (Update these based on your specific auth logic)
-- CREATE POLICY "Users can see their own operations" ON field_operations FOR SELECT USING (auth.uid() = org_id);
-- ... repeat for other operations
-- İşlemler (Masraf) tablosuna Miktar ve Birim kolonlarını ekleyelim
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS quantity NUMERIC;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS unit TEXT;

-- Envanter tablosunda Birim kolonu yoksa onu da garantiye alalım
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS unit TEXT;
