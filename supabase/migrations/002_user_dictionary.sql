-- =============================================
-- Migration 002: personal dictionary entries
-- Run in Supabase SQL Editor
-- =============================================

-- Add user_id column (null = shared/admin entry, non-null = personal user entry)
ALTER TABLE public.dictionary_entries
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Rebuild RLS policies
DROP POLICY IF EXISTS "dict_select"  ON public.dictionary_entries;
DROP POLICY IF EXISTS "dict_insert"  ON public.dictionary_entries;
DROP POLICY IF EXISTS "dict_update"  ON public.dictionary_entries;
DROP POLICY IF EXISTS "dict_delete"  ON public.dictionary_entries;

-- SELECT: shared entries (user_id null) + own personal entries
CREATE POLICY "dict_select" ON public.dictionary_entries
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- INSERT: admins add shared entries (user_id null); users add personal entries (user_id = self)
CREATE POLICY "dict_insert_admin" ON public.dictionary_entries
  FOR INSERT WITH CHECK (public.is_admin() AND user_id IS NULL);

CREATE POLICY "dict_insert_user" ON public.dictionary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: users update own entries; admins update any entry
CREATE POLICY "dict_update_own" ON public.dictionary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "dict_update_admin" ON public.dictionary_entries
  FOR UPDATE USING (public.is_admin());

-- DELETE: users delete own entries; admins delete any entry
CREATE POLICY "dict_delete_own" ON public.dictionary_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "dict_delete_admin" ON public.dictionary_entries
  FOR DELETE USING (public.is_admin());
