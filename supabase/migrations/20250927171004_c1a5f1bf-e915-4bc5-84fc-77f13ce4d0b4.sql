-- Enable RLS on remaining table and fix final function
ALTER TABLE public.field_detection_patterns ENABLE ROW LEVEL SECURITY;

-- Add basic policies for field_detection_patterns
CREATE POLICY "Allow public read access to field detection patterns" 
ON public.field_detection_patterns 
FOR SELECT 
USING (true);

-- Fix the remaining function without search path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.sim_users 
    WHERE id::text = auth.uid()::text AND role = 'admin'
  );
END;
$function$;