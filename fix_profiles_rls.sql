-- ============================================================
-- FIX: Profiles RLS — Add missing INSERT policy + fix existing users
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. Add INSERT policy for profiles (missing from original schema)
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id::text);

-- 2. Fix existing auth users who don't have a profile row yet
INSERT INTO public.profiles (id, phone, first_name, last_name, role, is_premium, created_at, updated_at)
SELECT 
  au.id,
  au.phone,
  COALESCE(au.raw_user_meta_data->>'first_name', SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', ''), ' ', 1), 'Yeni') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', ''), ' ', 2), 'Kullanıcı') as last_name,
  'farmer' as role,
  false as is_premium,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
