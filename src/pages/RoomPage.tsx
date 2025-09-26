import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Settings,
  Share,
  Crown,
  Copy,
  Mic,
  MicOff,
  Video,
  VideoOff,
  LogOut,
  Plus,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChatSection } from '@/components/ChatSection';
import { ParticipantsList } from '@/components/ParticipantsList';
import { roomService, Room } from '@/services/roomService';
import type { Participant, ChatMessage } from '@/components/ParticipantsList';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  
  // Audio/Video state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  
  // UI state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Real-time hooks
  const { isConnected, broadcastPlaybackSync, updatePresence } = useRealtime({
    roomId: roomId || '',
    userId: user?.id,
    onPlaybackSync: handlePlaybackSync,
    onChatMessage: handleNewMessage,
    onParticipantUpdate: handleParticipantUpdate,
  });

  // Real-time event handlers
  function handlePlaybackSync(data: any) {
    if (room && !isHost) {
      setRoom(prev => prev ? { ...prev, syncData: data } : null);
    }
  }

  function handleNewMessage(message: ChatMessage) {
    setMessages(prev => [...prev, message]);
  }

  function handleParticipantUpdate(update: any) {
    loadParticipants();
  }

  // Computed values
  const isHost = currentParticipant?.role === 'host';
  const isCoHost = currentParticipant?.role === 'co_host';
  const canModerate = isHost || isCoHost;

  // Load room data
  const loadRoomData = useCallback(async () => {
    if (!roomId) return;

    try {
      const { room: roomData, error: roomError } = await roomService.getRoomData(roomId);
      if (roomError) {
        toast({
          title: 'Error',
          description: 'Failed to load room data',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setRoom(roomData || null);
    } catch (error) {
      console.error('Error loading room data:', error);
    }
  }, [roomId, navigate, toast]);

  const loadParticipants = useCallback(async () => {
    if (!roomId) return;

    try {
      const { participants: participantData, error } = await roomService.getParticipants(roomId);
      if (error) {
        console.error('Error loading participants:', error);
        return;
      }

      setParticipants(participantData || []);

      // Find current participant
      if (user) {
        const current = participantData?.find(p => p.user_id === user.id);
        setCurrentParticipant(current || null);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  }, [roomId, user]);

  const loadMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const { messages: messageData, error } = await roomService.getMessages(roomId);
      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(messageData || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [roomId]);

  // Join room
  const handleJoinRoom = async () => {
    if (!roomId || !displayName.trim()) return;

    setIsJoining(true);
    try {
      const { room: joinedRoom, participant, error } = await roomService.joinRoom(
        roomId,
        displayName.trim(),
        roomPassword || undefined
      );

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to join room',
          variant: 'destructive',
        });
        return;
      }

      setRoom(joinedRoom || null);
      setCurrentParticipant(participant || null);
      
      // Load additional data
      await Promise.all([
        loadParticipants(),
        loadMessages(),
      ]);

      toast({
        title: 'Joined room',
        description: `Welcome to ${joinedRoom?.name}!`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join room',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Leave room
  const handleLeaveRoom = async () => {
    if (!roomId) return;

    try {
      await roomService.leaveRoom(roomId);
      navigate('/');
    } catch (error) {
      console.error('Error leaving room:', error);
      navigate('/');
    }
  };

  // Playback sync
  const handlePlaybackStateChange = async (state: any) => {
    if (!roomId || !isHost) return;

    try {
      await roomService.updatePlaybackState(roomId, state.position, !state.paused);
      broadcastPlaybackSync(state);
    } catch (error) {
      console.error('Error updating playback state:', error);
    }
  };

  // Chat
  const handleSendMessage = async (content: string, type: 'text' | 'emoji' = 'text') => {
    if (!roomId) return;

    try {
      await roomService.sendMessage(roomId, content, type);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Participant management
  const handleMuteParticipant = async (participantId: string) => {
    // Implementation would involve updating participant state
    toast({
      title: 'Feature coming soon',
      description: 'Participant muting will be available in the next update',
    });
  };

  const handleKickParticipant = async (participantId: string) => {
    // Implementation would involve removing participant
    toast({
      title: 'Feature coming soon',
      description: 'Participant removal will be available in the next update',
    });
  };

  const handlePromoteParticipant = async (participantId: string) => {
    // Implementation would involve updating participant role
    toast({
      title: 'Feature coming soon',
      description: 'Role management will be available in the next update',
    });
  };

  // Copy invite link
  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Invite link copied',
      description: 'Share this link with friends to invite them to the room',
    });
  };

  // Audio/Video controls
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Update participant state
    updatePresence({ is_muted: !isMuted });
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Update participant state
    updatePresence({ is_video_on: !isVideoOn });
  };

  // Initialize
  useEffect(() => {
    if (authLoading) return;

    const init = async () => {
      await loadRoomData();
      setLoading(false);
    };

    init();
  }, [authLoading, loadRoomData]);

  // Auto-join for authenticated users
  useEffect(() => {
    if (room && user && !currentParticipant && !loading) {
      const autoDisplayName = user.user_metadata?.display_name || 
                              user.email?.split('@')[0] || 
                              'Anonymous';
      setDisplayName(autoDisplayName);
      
      // Auto-join if not private or user is returning
      if (!room.is_private) {
        handleJoinRoom();
      }
    }
  }, [room, user, currentParticipant, loading]);

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  // Room not found
  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Room Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The room you're looking for doesn't exist or has ended.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Join room form
  if (!currentParticipant) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect">
          <CardHeader>
            <CardTitle className="text-center">Join {room.name}</CardTitle>
            {room.description && (
              <p className="text-sm text-muted-foreground text-center">
                {room.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
              />
            </div>

            {room.is_private && (
              <div>
                <Label htmlFor="password">Room Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  placeholder="Enter room password"
                />
              </div>
            )}

            <Button
              onClick={handleJoinRoom}
              disabled={!displayName.trim() || isJoining}
              className="w-full"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main room interface
  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{room.name}</h1>
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              {participants.filter(p => p.is_online).length} watching
            </Badge>
            {!isConnected && (
              <Badge variant="destructive" className="px-3 py-1">
                Reconnecting...
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Audio/Video Controls */}
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button
              variant={isVideoOn ? "default" : "secondary"}
              size="sm"
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>

            {/* Invite Button */}
            <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Friends</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Room Code</Label>
                    <div className="flex space-x-2">
                      <Input value={room.room_code} readOnly />
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          navigator.clipboard.writeText(room.room_code);
                          toast({ title: 'Room code copied!' });
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Invite Link</Label>
                    <div className="flex space-x-2">
                      <Input 
                        value={`${window.location.origin}/room/${roomId}`} 
                        readOnly 
                      />
                      <Button variant="outline" onClick={handleCopyInvite}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleLeaveRoom}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col p-6">
          <VideoPlayer
            roomData={room}
            isHost={isHost}
            currentUser={user}
            onPlaybackSync={handlePlaybackStateChange}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-card/50 border-l border-border flex flex-col">
          {/* Participants */}
          <Card className="border-0 border-b border-border rounded-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Participants ({participants.length})
                </span>
                {canModerate && (
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ParticipantsList
                participants={participants}
                currentUser={user}
                isHost={isHost}
                onMuteParticipant={handleMuteParticipant}
                onKickParticipant={handleKickParticipant}
                onPromoteParticipant={handlePromoteParticipant}
              />
            </CardContent>
          </Card>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <ChatSection
              roomId={roomId || ''}
              messages={messages}
              currentUser={user}
              isHost={isHost}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}