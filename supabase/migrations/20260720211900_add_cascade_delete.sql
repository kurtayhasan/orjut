-- Enable cascade delete for land dependencies to maintain consistency
-- We assume the tables `transactions`, `field_operations`, `scouting_logs`, `irrigation_logs` 
-- all have a `land_id` column referencing `lands(id)`.

-- For transactions
ALTER TABLE "public"."transactions"
DROP CONSTRAINT IF EXISTS transactions_land_id_fkey,
ADD CONSTRAINT transactions_land_id_fkey
FOREIGN KEY ("land_id")
REFERENCES "public"."lands"("id")
ON DELETE CASCADE;

-- For field_operations
ALTER TABLE "public"."field_operations"
DROP CONSTRAINT IF EXISTS field_operations_land_id_fkey,
ADD CONSTRAINT field_operations_land_id_fkey
FOREIGN KEY ("land_id")
REFERENCES "public"."lands"("id")
ON DELETE CASCADE;

-- For scouting_logs
ALTER TABLE "public"."scouting_logs"
DROP CONSTRAINT IF EXISTS scouting_logs_land_id_fkey,
ADD CONSTRAINT scouting_logs_land_id_fkey
FOREIGN KEY ("land_id")
REFERENCES "public"."lands"("id")
ON DELETE CASCADE;

-- For irrigation_logs
ALTER TABLE "public"."irrigation_logs"
DROP CONSTRAINT IF EXISTS irrigation_logs_land_id_fkey,
ADD CONSTRAINT irrigation_logs_land_id_fkey
FOREIGN KEY ("land_id")
REFERENCES "public"."lands"("id")
ON DELETE CASCADE;

-- Also add indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_transactions_land_id ON public.transactions (land_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions (org_id);
CREATE INDEX IF NOT EXISTS idx_lands_org_id ON public.lands (org_id);
CREATE INDEX IF NOT EXISTS idx_field_ops_land_id ON public.field_operations (land_id);
CREATE INDEX IF NOT EXISTS idx_scouting_logs_land_id ON public.scouting_logs (land_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_land_id ON public.irrigation_logs (land_id);
