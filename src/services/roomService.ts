import { supabase } from '@/integrations/supabase/client';

export interface Room {
  id: string;
  room_code: string;
  name: string;
  description?: string;
  is_private: boolean;
  password_hash?: string;
  max_participants: number;
  status: 'active' | 'paused' | 'ended';
  current_video_url?: string;
  current_video_title?: string;
  current_position: number;
  is_playing: boolean;
  last_sync_at: string;
  host_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface Participant {
  id: string;
  room_id: string;
  user_id?: string;
  display_name: string;
  role: 'host' | 'co_host' | 'participant';
  is_online: boolean;
  is_muted: boolean;
  is_video_on: boolean;
  is_speaking: boolean;
  last_seen: string;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id?: string;
  sender_name: string;
  content: string;
  message_type: 'text' | 'emoji' | 'system';
  emoji_reaction?: string;
  is_pinned: boolean;
  created_at: string;
}

class RoomService {
  async createRoom(
    name: string,
    description?: string,
    isPrivate: boolean = false,
    password?: string
  ): Promise<{ room?: Room; error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('Authentication required') };
      }

      // Generate unique room code
      const roomCode = this.generateRoomCode();
      
      const roomData: any = {
        room_code: roomCode,
        name,
        description,
        is_private: isPrivate,
        host_id: user.id,
        created_by: user.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      if (password) {
        // In production, use proper password hashing
        roomData.password_hash = btoa(password);
      }

      const { data: room, error: roomError } = await supabase
        .from('watch_rooms')
        .insert(roomData)
        .select()
        .single();

      if (roomError) return { error: roomError };

      // Add creator as host participant
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Host',
          role: 'host',
        });

      if (participantError) return { error: participantError };

      return { room };
    } catch (error) {
      return { error };
    }
  }

  async joinRoom(
    roomCode: string,
    displayName: string,
    password?: string
  ): Promise<{ room?: Room; participant?: Participant; error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('watch_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (roomError || !room) {
        return { error: new Error('Room not found or inactive') };
      }

      // Check password for private rooms
      if (room.is_private && room.password_hash) {
        if (!password || btoa(password) !== room.password_hash) {
          return { error: new Error('Invalid password') };
        }
      }

      // Check if room is full
      const { count } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('is_online', true);

      if (count && count >= room.max_participants) {
        return { error: new Error('Room is full') };
      }

      // Add participant or update if already exists
      const participantData = {
        room_id: room.id,
        user_id: user?.id,
        display_name: displayName,
        role: 'participant' as const,
        is_online: true,
        last_seen: new Date().toISOString(),
      };

      const { data: participant, error: participantError } = await supabase
        .from('room_participants')
        .upsert(participantData, {
          onConflict: 'room_id,user_id',
        })
        .select()
        .single();

      if (participantError) return { error: participantError };

      // Send system message
      await this.sendSystemMessage(room.id, `${displayName} joined the room`);

      return { room, participant };
    } catch (error) {
      return { error };
    }
  }

  async leaveRoom(roomId: string): Promise<{ error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('Authentication required') };

      // Get participant info before leaving
      const { data: participant } = await supabase
        .from('room_participants')
        .select('display_name')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      // Update participant as offline
      const { error } = await supabase
        .from('room_participants')
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) return { error };

      // Send system message
      if (participant) {
        await this.sendSystemMessage(roomId, `${participant.display_name} left the room`);
      }

      return {};
    } catch (error) {
      return { error };
    }
  }

  async updatePlaybackState(
    roomId: string,
    position: number,
    isPlaying: boolean
  ): Promise<{ error?: any }> {
    try {
      const { error } = await supabase
        .from('watch_rooms')
        .update({
          current_position: position,
          is_playing: isPlaying,
        })
        .eq('id', roomId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async sendMessage(
    roomId: string,
    content: string,
    messageType: 'text' | 'emoji' = 'text'
  ): Promise<{ error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('Authentication required') };

      // Get sender name
      const { data: participant } = await supabase
        .from('room_participants')
        .select('display_name')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('room_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          sender_name: participant?.display_name || 'Anonymous',
          content,
          message_type: messageType,
        });

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async sendSystemMessage(roomId: string, content: string): Promise<{ error?: any }> {
    try {
      const { error } = await supabase
        .from('room_messages')
        .insert({
          room_id: roomId,
          sender_name: 'System',
          content,
          message_type: 'system',
        });

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async getRoomData(roomId: string): Promise<{ room?: Room; error?: any }> {
    try {
      const { data: room, error } = await supabase
        .from('watch_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      return { room, error };
    } catch (error) {
      return { error };
    }
  }

  async getParticipants(roomId: string): Promise<{ participants?: Participant[]; error?: any }> {
    try {
      const { data: participants, error } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at');

      return { participants, error };
    } catch (error) {
      return { error };
    }
  }

  async getMessages(roomId: string): Promise<{ messages?: ChatMessage[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at');

      if (error) return { error };

      // Type-safe mapping to ensure message_type is correctly typed
      const messages: ChatMessage[] = data?.map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'emoji' | 'system'
      })) || [];

      return { messages };
    } catch (error) {
      return { error };
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const roomService = new RoomService();