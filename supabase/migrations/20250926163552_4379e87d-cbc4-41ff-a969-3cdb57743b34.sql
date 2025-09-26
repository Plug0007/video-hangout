-- WatchParty Database Schema

-- Create room status enum
CREATE TYPE room_status AS ENUM ('active', 'paused', 'ended');

-- Create user role enum for rooms
CREATE TYPE room_role AS ENUM ('host', 'co_host', 'participant');

-- Create watch rooms table
CREATE TABLE public.watch_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  password_hash TEXT,
  max_participants INTEGER DEFAULT 50,
  status room_status NOT NULL DEFAULT 'active',
  current_video_url TEXT,
  current_video_title TEXT,
  current_position DECIMAL DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  host_id UUID,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create room participants table
CREATE TABLE public.room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.watch_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role room_role NOT NULL DEFAULT 'participant',
  is_online BOOLEAN DEFAULT true,
  is_muted BOOLEAN DEFAULT false,
  is_video_on BOOLEAN DEFAULT false,
  is_speaking BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create room messages table
CREATE TABLE public.room_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.watch_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'emoji', 'system'
  emoji_reaction TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room invites table
CREATE TABLE public.room_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.watch_rooms(id) ON DELETE CASCADE,
  invite_token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.watch_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for watch_rooms
CREATE POLICY "Users can view rooms they participate in"
ON public.watch_rooms FOR SELECT
USING (
  id IN (
    SELECT room_id FROM public.room_participants 
    WHERE user_id = auth.uid()
  ) OR created_by = auth.uid()
);

CREATE POLICY "Users can create rooms"
ON public.watch_rooms FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Hosts can update their rooms"
ON public.watch_rooms FOR UPDATE
USING (
  host_id = auth.uid() OR 
  id IN (
    SELECT room_id FROM public.room_participants 
    WHERE user_id = auth.uid() AND role IN ('host', 'co_host')
  )
);

-- RLS Policies for room_participants
CREATE POLICY "Users can view participants in their rooms"
ON public.room_participants FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM public.room_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join rooms"
ON public.room_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
ON public.room_participants FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for room_messages
CREATE POLICY "Users can view messages in their rooms"
ON public.room_messages FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM public.room_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their rooms"
ON public.room_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  room_id IN (
    SELECT room_id FROM public.room_participants 
    WHERE user_id = auth.uid()
  )
);

-- RLS Policies for room_invites
CREATE POLICY "Users can view invites for their rooms"
ON public.room_invites FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM public.room_participants 
    WHERE user_id = auth.uid() AND role IN ('host', 'co_host')
  ) OR created_by = auth.uid()
);

CREATE POLICY "Hosts can create invites"
ON public.room_invites FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  room_id IN (
    SELECT room_id FROM public.room_participants 
    WHERE user_id = auth.uid() AND role IN ('host', 'co_host')
  )
);

-- Create indexes for performance
CREATE INDEX idx_watch_rooms_code ON public.watch_rooms(room_code);
CREATE INDEX idx_watch_rooms_status ON public.watch_rooms(status);
CREATE INDEX idx_room_participants_room_user ON public.room_participants(room_id, user_id);
CREATE INDEX idx_room_participants_online ON public.room_participants(room_id, is_online);
CREATE INDEX idx_room_messages_room_created ON public.room_messages(room_id, created_at);
CREATE INDEX idx_room_invites_token ON public.room_invites(invite_token);
CREATE INDEX idx_room_invites_expires ON public.room_invites(expires_at);

-- Create function to update room sync timestamp
CREATE OR REPLACE FUNCTION update_room_sync()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_sync_at = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room sync updates
CREATE TRIGGER update_room_sync_trigger
  BEFORE UPDATE ON public.watch_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_room_sync();

-- Create function to clean up expired rooms and invites
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_invites;