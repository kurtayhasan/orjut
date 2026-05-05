-- ROLES & ENGINEER ACCESS MIGRATION

-- 1. Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'farmer';

-- 2. Create engineer_clients link table
CREATE TABLE IF NOT EXISTS public.engineer_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(engineer_id, farmer_id)
);

-- 3. ENABLE RLS
ALTER TABLE public.engineer_clients ENABLE ROW LEVEL SECURITY;

-- 4. RLS FOR ENGINEER_CLIENTS
CREATE POLICY "Engineers can see their own client links"
    ON public.engineer_clients FOR SELECT
    USING (auth.uid() = engineer_id OR auth.uid() = farmer_id);

CREATE POLICY "Engineers can insert client requests"
    ON public.engineer_clients FOR INSERT
    WITH CHECK (auth.uid() = engineer_id);

CREATE POLICY "Farmers can update status"
    ON public.engineer_clients FOR UPDATE
    USING (auth.uid() = farmer_id);

-- 5. UPDATE GLOBAL RLS FOR MULTI-TENANCY (Engineer Access)
-- We need to allow access if auth.uid() = org_id OR if auth.uid() is an approved engineer for that org_id

-- Example update for LANDS (Repeat for transactions, operations, etc.)
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.lands;
CREATE POLICY "Access for owner or approved engineer" ON public.lands
FOR ALL USING (
    org_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.engineer_clients 
        WHERE engineer_id = auth.uid() 
        AND farmer_id = lands.org_id 
        AND status = 'approved'
    )
) WITH CHECK (
    org_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.engineer_clients 
        WHERE engineer_id = auth.uid() 
        AND farmer_id = lands.org_id 
        AND status = 'approved'
    )
);

-- Repeat for TRANSACTIONS
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.transactions;
CREATE POLICY "Access for owner or approved engineer" ON public.transactions
FOR ALL USING (
    org_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.engineer_clients 
        WHERE engineer_id = auth.uid() 
        AND farmer_id = transactions.org_id 
        AND status = 'approved'
    )
);

-- Repeat for INVENTORY
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.inventory;
CREATE POLICY "Access for owner or approved engineer" ON public.inventory
FOR ALL USING (
    org_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.engineer_clients 
        WHERE engineer_id = auth.uid() 
        AND farmer_id = inventory.org_id 
        AND status = 'approved'
    )
);

-- Repeat for FIELD OPERATIONS
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.field_operations;
CREATE POLICY "Access for owner or approved engineer" ON public.field_operations
FOR ALL USING (
    org_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.engineer_clients 
        WHERE engineer_id = auth.uid() 
        AND farmer_id = field_operations.org_id 
        AND status = 'approved'
    )
);

-- Repeat for SCOUTING LOGS
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.scouting_logs;
CREATE POLICY "Access for owner or approved engineer" ON public.scouting_logs
FOR ALL USING (
    org_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.engineer_clients 
        WHERE engineer_id = auth.uid() 
        AND farmer_id = scouting_logs.org_id 
        AND status = 'approved'
    )
);

-- Repeat for SEASONS
DROP POLICY IF EXISTS "Enable ALL for users based on org_id" ON public.seasons;
CREATE POLICY "Access for owner or approved engineer" ON public.seasons
FOR ALL USING (
    org_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.engineer_clients 
        WHERE engineer_id = auth.uid() 
        AND farmer_id = seasons.org_id 
        AND status = 'approved'
    )
);

-- 6. SUPER ADMIN ACCESS
-- Admins can see EVERYTHING
CREATE POLICY "Admins see all profiles" ON public.profiles FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Note: In production, you would add admin policies to all tables.
