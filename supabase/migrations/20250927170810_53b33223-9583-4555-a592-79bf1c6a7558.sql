-- Fix infinite recursion in room_participants RLS policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON public.room_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.room_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON public.room_participants;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.user_is_room_participant(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.room_participants
    WHERE user_id = _user_id AND room_id = _room_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_room_ids(_user_id uuid)
RETURNS TABLE(room_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rp.room_id
  FROM public.room_participants rp
  WHERE rp.user_id = _user_id
$$;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Users can view participants in their rooms" 
ON public.room_participants 
FOR SELECT 
USING (
  room_id IN (SELECT public.get_user_room_ids(auth.uid()))
);

CREATE POLICY "Users can join rooms" 
ON public.room_participants 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" 
ON public.room_participants 
FOR UPDATE 
USING (user_id = auth.uid());

-- Also fix the watch_rooms policies that have similar issues
DROP POLICY IF EXISTS "Users can view rooms they participate in" ON public.watch_rooms;
DROP POLICY IF EXISTS "Hosts can update their rooms" ON public.watch_rooms;

CREATE POLICY "Users can view rooms they participate in" 
ON public.watch_rooms 
FOR SELECT 
USING (
  id IN (SELECT public.get_user_room_ids(auth.uid())) 
  OR created_by = auth.uid()
);

CREATE POLICY "Hosts can update their rooms" 
ON public.watch_rooms 
FOR UPDATE 
USING (
  host_id = auth.uid() 
  OR public.user_is_room_participant(auth.uid(), id)
);

-- Fix room_invites policies
DROP POLICY IF EXISTS "Hosts can create invites" ON public.room_invites;
DROP POLICY IF EXISTS "Users can view invites for their rooms" ON public.room_invites;

CREATE OR REPLACE FUNCTION public.user_can_manage_room(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.room_participants rp
    WHERE rp.user_id = _user_id 
    AND rp.room_id = _room_id 
    AND rp.role IN ('host', 'co_host')
  )
$$;

CREATE POLICY "Hosts can create invites" 
ON public.room_invites 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid() 
  AND public.user_can_manage_room(auth.uid(), room_id)
);

CREATE POLICY "Users can view invites for their rooms" 
ON public.room_invites 
FOR SELECT 
USING (
  public.user_can_manage_room(auth.uid(), room_id) 
  OR created_by = auth.uid()
);

-- Fix room_messages policies  
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.room_messages;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.room_messages;

CREATE POLICY "Users can send messages to their rooms" 
ON public.room_messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() 
  AND public.user_is_room_participant(auth.uid(), room_id)
);

CREATE POLICY "Users can view messages in their rooms" 
ON public.room_messages 
FOR SELECT 
USING (
  room_id IN (SELECT public.get_user_room_ids(auth.uid()))
);