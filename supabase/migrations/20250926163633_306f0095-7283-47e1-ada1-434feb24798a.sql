-- Fix security warnings - add SET search_path to functions

-- Update functions with proper security definer and search_path
CREATE OR REPLACE FUNCTION update_room_sync()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_sync_at = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete expired rooms
  DELETE FROM public.watch_rooms 
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  -- Delete expired invites
  DELETE FROM public.room_invites 
  WHERE expires_at < now();
  
  -- Delete inactive rooms (no participants for 24 hours)
  DELETE FROM public.watch_rooms 
  WHERE id NOT IN (
    SELECT DISTINCT room_id 
    FROM public.room_participants 
    WHERE last_seen > now() - INTERVAL '24 hours'
  ) AND created_at < now() - INTERVAL '24 hours';
END;
$$;