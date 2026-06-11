REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;
CREATE POLICY "no self role insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "no self role update" ON public.user_roles FOR UPDATE TO authenticated USING (false);
CREATE POLICY "no self role delete" ON public.user_roles FOR DELETE TO authenticated USING (false);
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;