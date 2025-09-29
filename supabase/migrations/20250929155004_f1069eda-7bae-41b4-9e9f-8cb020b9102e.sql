-- Fix RLS policies for system messages and ensure user profiles exist

-- Update RLS policy for room_messages to allow system messages
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.room_messages;

CREATE POLICY "Users can send messages to their rooms" 
ON public.room_messages FOR INSERT 
WITH CHECK (
  (sender_id = auth.uid() AND user_is_room_participant(auth.uid(), room_id))
  OR 
  (sender_id IS NULL AND message_type = 'system')
);

-- Ensure all authenticated users can create profiles for themselves
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile if it doesn't exist for authenticated users
  INSERT INTO public.profiles (id, email, name, display_name, role)
  VALUES (
    auth.uid(),
    COALESCE((auth.jwt() ->> 'email'), 'unknown@example.com'),
    COALESCE((auth.jwt() ->> 'email'), 'Unknown User'),
    COALESCE((auth.jwt() ->> 'email'), 'Unknown User'),
    'teacher'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NULL;
END;
$$;

-- Create trigger to ensure profile exists when user signs in
DROP TRIGGER IF EXISTS ensure_profile_on_auth ON auth.users;
CREATE TRIGGER ensure_profile_on_auth
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_profile();