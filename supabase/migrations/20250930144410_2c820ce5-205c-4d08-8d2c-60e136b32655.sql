-- Harden handle_new_user to avoid nulls and duplicates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Safety: if for any reason NEW.id is null, skip to avoid violating NOT NULL
  IF NEW.id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    display_name,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'unknown@example.com'),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', COALESCE(NEW.email, 'User')),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', COALESCE(NEW.email, 'User')),
    'teacher'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    display_name = EXCLUDED.display_name;

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();