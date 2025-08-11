-- Retry migration with safe policy creation
-- 1) Create integration_types dictionary table
CREATE TABLE IF NOT EXISTS public.integration_types (
  type text PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Seed existing distinct types from integrations (if any) to avoid FK failures
INSERT INTO public.integration_types (type, name)
SELECT DISTINCT type, initcap(type)
FROM public.integrations
ON CONFLICT (type) DO NOTHING;

-- 3) Ensure Kanboard type exists
INSERT INTO public.integration_types (type, name, description)
VALUES ('kanboard', 'Kanboard', 'Kanboard self-hosted project management')
ON CONFLICT (type) DO NOTHING;

-- 4) Enable RLS and allow public SELECT only
ALTER TABLE public.integration_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view integration types" ON public.integration_types;
CREATE POLICY "Anyone can view integration types"
ON public.integration_types
FOR SELECT
USING (true);

-- 5) Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_integration_types_updated_at'
  ) THEN
    CREATE TRIGGER update_integration_types_updated_at
    BEFORE UPDATE ON public.integration_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 6) Add FK from integrations.type to integration_types.type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'integrations_type_fkey'
  ) THEN
    ALTER TABLE public.integrations
    ADD CONSTRAINT integrations_type_fkey
    FOREIGN KEY (type) REFERENCES public.integration_types(type)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
  END IF;
END $$;