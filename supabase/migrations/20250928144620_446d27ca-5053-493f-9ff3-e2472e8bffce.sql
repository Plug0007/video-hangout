-- Add display_name column to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing profiles to have display_name from name field
UPDATE public.profiles SET display_name = name WHERE display_name IS NULL;

-- Set display_name as NOT NULL after updating
ALTER TABLE public.profiles ALTER COLUMN display_name SET NOT NULL;