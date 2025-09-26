import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Crown,
  Mic,
  MicOff,
  Video,
  VideoOff,
  UserCheck,
  Volume2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Participant {
  id: string;
  user_id?: string;
  display_name: string;
  role: 'host' | 'co_host' | 'participant';
  is_online: boolean;
  is_muted: boolean;
  is_video_on: boolean;
  is_speaking: boolean;
  joined_at: string;
  last_seen: string;
}

export interface ChatMessage {
  id: string;
  sender_id?: string;
  sender_name: string;
  content: string;
  message_type: 'text' | 'emoji' | 'system';
  is_pinned: boolean;
  created_at: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  currentUser: any;
  isHost: boolean;
  onMuteParticipant?: (participantId: string) => void;
  onKickParticipant?: (participantId: string) => void;
  onPromoteParticipant?: (participantId: string) => void;
}

export function ParticipantsList({
  participants,
  currentUser,
  isHost,
  onMuteParticipant,
  onKickParticipant,
  onPromoteParticipant,
}: ParticipantsListProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown className="w-3 h-3 text-warning" />;
      case 'co_host':
        return <UserCheck className="w-3 h-3 text-accent" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'host':
        return <Badge variant="default" className="text-xs px-1 py-0 bg-warning">Host</Badge>;
      case 'co_host':
        return <Badge variant="secondary" className="text-xs px-1 py-0">Co-Host</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {participants
        .sort((a, b) => {
          // Sort by role: host > co_host > participant
          const roleOrder = { host: 0, co_host: 1, participant: 2 };
          const aOrder = roleOrder[a.role as keyof typeof roleOrder] || 3;
          const bOrder = roleOrder[b.role as keyof typeof roleOrder] || 3;
          
          if (aOrder !== bOrder) return aOrder - bOrder;
          
          // Then by online status
          if (a.is_online !== b.is_online) return b.is_online ? 1 : -1;
          
          // Finally by join time
          return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
        })
        .map((participant) => (
          <div key={participant.id} className="flex items-center space-x-3 group">
            <div className="relative">
              <Avatar 
                className={`w-8 h-8 ${
                  participant.is_speaking ? 'speaking-indicator' : ''
                } ${!participant.is_online ? 'opacity-50' : ''}`}
              >
                <AvatarFallback className="text-xs font-semibold">
                  {participant.display_name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              
              {/* Role indicator */}
              {participant.role !== 'participant' && (
                <div className="absolute -top-1 -right-1">
                  {getRoleIcon(participant.role)}
                </div>
              )}
              
              {/* Online status */}
              <div 
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                  participant.is_online ? 'bg-success' : 'bg-muted-foreground'
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium truncate">
                  {participant.display_name}
                  {participant.user_id === currentUser?.id && ' (You)'}
                </p>
                {getRoleBadge(participant.role)}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                {/* Audio status */}
                <div className="flex items-center space-x-1">
                  {participant.is_muted ? (
                    <MicOff className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Mic className="w-3 h-3 text-success" />
                      {participant.is_speaking && (
                        <div className="flex space-x-0.5">
                          <div className="w-1 h-3 bg-success rounded-full animate-pulse" />
                          <div className="w-1 h-2 bg-success rounded-full animate-pulse delay-75" />
                          <div className="w-1 h-4 bg-success rounded-full animate-pulse delay-150" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Video status */}
                {participant.is_video_on ? (
                  <Video className="w-3 h-3 text-accent" />
                ) : (
                  <VideoOff className="w-3 h-3 text-muted-foreground" />
                )}

                {/* Speaking indicator */}
                {participant.is_speaking && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    <Volume2 className="w-2 h-2 mr-1" />
                    Speaking
                  </Badge>
                )}
              </div>
            </div>

            {/* Host controls */}
            {isHost && participant.user_id !== currentUser?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {participant.role === 'participant' && (
                    <DropdownMenuItem 
                      onClick={() => onPromoteParticipant?.(participant.id)}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Promote to Co-Host
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem 
                    onClick={() => onMuteParticipant?.(participant.id)}
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    {participant.is_muted ? 'Unmute' : 'Mute'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => onKickParticipant?.(participant.id)}
                    className="text-destructive"
                  >
                    Remove from Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
    </div>
  );
}