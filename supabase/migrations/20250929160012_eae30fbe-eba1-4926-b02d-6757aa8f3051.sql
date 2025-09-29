-- Fix the handle_new_user trigger function to properly populate all required profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    display_name, 
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email, 'User'),
    'teacher'
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();