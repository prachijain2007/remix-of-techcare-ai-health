CREATE POLICY "Users can claim their own patient or doctor role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND role IN ('patient'::app_role, 'doctor'::app_role));

GRANT INSERT ON public.user_roles TO authenticated;