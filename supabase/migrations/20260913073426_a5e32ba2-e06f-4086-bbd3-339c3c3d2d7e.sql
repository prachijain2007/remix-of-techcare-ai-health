
-- 1-to-1 care assignments
CREATE TABLE IF NOT EXISTS public.care_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL UNIQUE,
  doctor_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.care_assignments TO authenticated;
GRANT ALL ON public.care_assignments TO service_role;
ALTER TABLE public.care_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own assignment visible" ON public.care_assignments;
CREATE POLICY "Own assignment visible" ON public.care_assignments
FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid());

-- patient_cases ownership columns
ALTER TABLE public.patient_cases ADD COLUMN IF NOT EXISTS patient_id uuid;
ALTER TABLE public.patient_cases ADD COLUMN IF NOT EXISTS doctor_id uuid;

CREATE OR REPLACE FUNCTION public.fill_case_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE a record;
BEGIN
  IF NEW.created_by IS NULL THEN NEW.created_by := auth.uid(); END IF;
  SELECT * INTO a FROM public.care_assignments
   WHERE patient_id = auth.uid() OR doctor_id = auth.uid() LIMIT 1;
  IF a.id IS NOT NULL THEN
    IF NEW.patient_id IS NULL THEN NEW.patient_id := a.patient_id; END IF;
    IF NEW.doctor_id IS NULL THEN NEW.doctor_id := a.doctor_id; END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fill_case_assignment_trg ON public.patient_cases;
CREATE TRIGGER fill_case_assignment_trg
BEFORE INSERT ON public.patient_cases
FOR EACH ROW EXECUTE FUNCTION public.fill_case_assignment();

-- strict isolation policies
DROP POLICY IF EXISTS "Doctors can view all cases" ON public.patient_cases;
DROP POLICY IF EXISTS "Doctors can update cases for review" ON public.patient_cases;
DROP POLICY IF EXISTS "Doctors can view their own cases" ON public.patient_cases;
DROP POLICY IF EXISTS "Doctors can insert their own cases" ON public.patient_cases;
DROP POLICY IF EXISTS "Doctors can update their own cases" ON public.patient_cases;
DROP POLICY IF EXISTS "Doctors can delete their own cases" ON public.patient_cases;

CREATE POLICY "Assigned parties can view cases" ON public.patient_cases
FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Assigned parties can insert cases" ON public.patient_cases
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND (patient_id = auth.uid() OR doctor_id = auth.uid()));

CREATE POLICY "Assigned parties can update cases" ON public.patient_cases
FOR UPDATE TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid())
WITH CHECK (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Assigned parties can delete cases" ON public.patient_cases
FOR DELETE TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid());

-- profiles: doctors only see their assigned patient
DROP POLICY IF EXISTS "Doctors can view all profiles" ON public.profiles;
CREATE POLICY "Assigned doctor can view patient profile" ON public.profiles
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.care_assignments ca
  WHERE ca.doctor_id = auth.uid() AND ca.patient_id = public.profiles.user_id
));
