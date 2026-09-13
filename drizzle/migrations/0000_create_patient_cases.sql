CREATE TABLE public.patient_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL DEFAULT auth.uid(),
  patient_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  vitals TEXT,
  source TEXT
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_cases TO authenticated;
GRANT ALL ON public.patient_cases TO service_role;

ALTER TABLE public.patient_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own cases"
  ON public.patient_cases FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Doctors can insert their own cases"
  ON public.patient_cases FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Doctors can update their own cases"
  ON public.patient_cases FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "Doctors can delete their own cases"
  ON public.patient_cases FOR DELETE TO authenticated
  USING (created_by = auth.uid());

CREATE INDEX patient_cases_created_by_idx ON public.patient_cases (created_by, created_at DESC);