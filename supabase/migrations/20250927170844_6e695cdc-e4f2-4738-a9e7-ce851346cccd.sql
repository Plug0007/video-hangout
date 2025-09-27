-- Fix remaining security issues

-- Add missing SET search_path to functions that don't have it
CREATE OR REPLACE FUNCTION public.cleanup_expired_chat_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Delete expired messages
  DELETE FROM public.chat_messages 
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();

  -- Delete expired presence data
  DELETE FROM public.chat_presence 
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Delete expired temporary messages
    DELETE FROM public.messages 
    WHERE is_temporary = true 
    AND expires_at < NOW();
    
    -- Delete seen vanish messages
    DELETE FROM public.vanish_messages 
    WHERE is_seen = true 
    OR (expires_at IS NOT NULL AND expires_at < NOW());
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_role(role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_role public.user_role;
BEGIN
  SELECT p.role INTO user_role
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  RETURN user_role = role;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_event_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  upcoming_event RECORD;
BEGIN
  FOR upcoming_event IN
    SELECT e.id, e.title, e.start_time, e.teacher_id
    FROM public.events e
    WHERE e.status = 'approved'
    AND e.start_time > NOW()
    AND e.start_time < (NOW() + INTERVAL '1 day')
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.related_event_id = e.id
      AND n.title = 'Event Reminder'
    )
  LOOP
    INSERT INTO public.notifications (user_id, title, message, related_event_id)
    VALUES (
      upcoming_event.teacher_id,
      'Event Reminder',
      'May your event "' || upcoming_event.title || '" tomorrow be blessed with great success and meaningful connections. We wish you all the best!',
      upcoming_event.id
    );
  END LOOP;
END;
$function$;

-- Enable RLS on tables that don't have it enabled
-- (The linter mentioned RLS disabled in public, let's check which tables need it)

-- Make sure all user-facing tables have RLS enabled
ALTER TABLE public.watch_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_invites ENABLE ROW LEVEL SECURITY;