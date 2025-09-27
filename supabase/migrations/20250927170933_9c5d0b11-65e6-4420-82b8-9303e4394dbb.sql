-- Fix the remaining RLS and function issues

-- Enable RLS on field_detection_patterns table
ALTER TABLE public.field_detection_patterns ENABLE ROW LEVEL SECURITY;

-- Create a basic policy for field_detection_patterns (adjust as needed for your use case)
CREATE POLICY "Allow public read access to field_detection_patterns" 
ON public.field_detection_patterns 
FOR SELECT 
USING (true);

-- Fix the remaining function that doesn't have SET search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.sim_users 
    WHERE id::text = auth.uid()::text AND role = 'admin'
  );
END;
$function$;