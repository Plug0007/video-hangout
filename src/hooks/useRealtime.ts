import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeProps {
  roomId: string;
  userId?: string;
  onPlaybackSync?: (data: any) => void;
  onChatMessage?: (data: any) => void;
  onParticipantUpdate?: (data: any) => void;
}

export function useRealtime({
  roomId,
  userId,
  onPlaybackSync,
  onChatMessage,
  onParticipantUpdate,
}: UseRealtimeProps) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Create room-specific channel
    const roomChannel = supabase.channel(`room-${roomId}`, {
      config: {
        presence: {
          key: userId || 'anonymous',
        },
      },
    });

    // Listen for playback sync events
    roomChannel.on('broadcast', { event: 'playback-sync' }, (payload) => {
      onPlaybackSync?.(payload.payload);
    });

    // Listen for chat messages
    roomChannel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'room_messages',
      filter: `room_id=eq.${roomId}`,
    }, (payload) => {
      onChatMessage?.(payload.new);
    });

    // Listen for participant updates
    roomChannel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'room_participants',
      filter: `room_id=eq.${roomId}`,
    }, (payload) => {
      onParticipantUpdate?.(payload);
    });

    // Listen for presence changes
    roomChannel.on('presence', { event: 'sync' }, () => {
      const presenceState = roomChannel.presenceState();
      // Handle presence updates
    });

    // Subscribe to channel
    roomChannel.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED');
    });

    setChannel(roomChannel);

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId, userId, onPlaybackSync, onChatMessage, onParticipantUpdate]);

  const broadcastPlaybackSync = (data: any) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'playback-sync',
        payload: data,
      });
    }
  };

  const updatePresence = (data: any) => {
    if (channel) {
      channel.track(data);
    }
  };

  return {
    channel,
    isConnected,
    broadcastPlaybackSync,
    updatePresence,
  };
}