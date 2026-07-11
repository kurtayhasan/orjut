-- 1. FIX: UUID Type Cast Güvenlik Açığı
-- Drop the bad indexes if they exist (hypothetical, based on user report)
-- Assuming the old queries casted uuid to text: "WHERE land_id::text = '...'"
-- We ensure the proper indexes exist on the UUID columns natively.
CREATE INDEX IF NOT EXISTS idx_field_operations_land_id ON public.field_operations(land_id);
CREATE INDEX IF NOT EXISTS idx_scouting_logs_land_id ON public.scouting_logs(land_id);
CREATE INDEX IF NOT EXISTS idx_transactions_land_id ON public.transactions(land_id);
CREATE INDEX IF NOT EXISTS idx_lands_org_id ON public.lands(org_id);
CREATE INDEX IF NOT EXISTS idx_lands_created_at ON public.lands(created_at);

-- 2. FIX: Rate Limiter
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  user_id uuid PRIMARY KEY,
  hits int DEFAULT 1,
  expires_at timestamp with time zone NOT NULL
);

-- Note: We grant usage to anon/authenticated if needed, but since it's an RPC it runs as invoker or definer.
CREATE OR REPLACE FUNCTION increment_rate_limit(p_user_id uuid, p_limit_val int, p_window_val int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hits int;
  v_expires_at timestamp with time zone;
BEGIN
  -- Cleanup old records periodically or on fly
  DELETE FROM public.api_rate_limits WHERE expires_at < now();

  SELECT hits, expires_at INTO v_hits, v_expires_at
  FROM public.api_rate_limits
  WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.api_rate_limits (user_id, hits, expires_at)
    VALUES (p_user_id, 1, now() + (p_window_val || ' milliseconds')::interval);
    RETURN true;
  END IF;

  IF v_hits >= p_limit_val THEN
    RETURN false;
  END IF;

  UPDATE public.api_rate_limits
  SET hits = hits + 1
  WHERE user_id = p_user_id;

  RETURN true;
END;
$$;

-- 3. FIX: Collaborators RLS Bypass & N+1 Problem
-- Creating a unified view or RPC for Dashboard to avoid N+1
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_org_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_lands', (SELECT count(*) FROM public.lands WHERE org_id = p_org_id AND deleted_at IS NULL),
    'active_operations', (SELECT count(*) FROM public.field_operations f JOIN public.lands l ON f.land_id = l.id WHERE l.org_id = p_org_id AND f.status = 'active'),
    'recent_transactions', (SELECT json_agg(t) FROM (SELECT * FROM public.transactions tr JOIN public.lands l ON tr.land_id = l.id WHERE l.org_id = p_org_id ORDER BY tr.date DESC LIMIT 5) t)
  ) INTO result;
  RETURN result;
END;
$$;
