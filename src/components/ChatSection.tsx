import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Send,
  Smile,
  Pin,
  MoreHorizontal,
  Heart,
  Laugh,
  ThumbsUp,
  Flame,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage } from '@/components/ParticipantsList';

interface ChatSectionProps {
  roomId: string;
  messages: ChatMessage[];
  currentUser: any;
  isHost: boolean;
  onSendMessage: (content: string, type?: string) => void;
  onPinMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export function ChatSection({
  roomId,
  messages,
  currentUser,
  isHost,
  onSendMessage,
  onPinMessage,
  onDeleteMessage,
}: ChatSectionProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const commonEmojis = ['❤️', '😂', '👍', '🔥', '😍', '😮', '😢', '😡'];
  const quickReactions = [
    { emoji: '❤️', icon: Heart, label: 'Love' },
    { emoji: '😂', icon: Laugh, label: 'Funny' },
    { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    { emoji: '🔥', icon: Flame, label: 'Fire' },
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (newMessage.length > 500) {
      toast({
        title: 'Message too long',
        description: 'Messages must be less than 500 characters.',
        variant: 'destructive',
      });
      return;
    }

    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleEmojiReaction = (emoji: string) => {
    onSendMessage(emoji, 'emoji');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pinnedMessages = messages.filter(msg => msg.is_pinned);

  return (
    <div className="flex flex-col h-full">
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="p-3 border-b border-border bg-card/50">
          <div className="flex items-center space-x-2 mb-2">
            <Pin className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Pinned Messages</span>
          </div>
          <div className="space-y-2">
            {pinnedMessages.slice(-2).map((msg) => (
              <div key={msg.id} className="text-sm p-2 bg-chat-highlight rounded">
                <span className="font-medium">{msg.sender_name}:</span>{' '}
                {msg.message_type === 'emoji' ? (
                  <span className="text-lg">{msg.content}</span>
                ) : (
                  msg.content
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message-enter group ${
                message.message_type === 'system' ? 'text-center' : ''
              }`}
            >
              {message.message_type === 'system' ? (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 inline-block">
                  {message.content}
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {message.sender_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{message.sender_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.created_at)}
                      </span>
                      {message.is_pinned && (
                        <Pin className="w-3 h-3 text-accent" />
                      )}
                    </div>
                    
                    <div className="bg-chat-message rounded-lg px-3 py-2">
                      {message.message_type === 'emoji' ? (
                        <span className="text-2xl">{message.content}</span>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Actions */}
                  {(isHost || (message.sender_id && message.sender_id === currentUser?.id)) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isHost && (
                          <DropdownMenuItem 
                            onClick={() => onPinMessage?.(message.id)}
                          >
                            <Pin className="w-4 h-4 mr-2" />
                            {message.is_pinned ? 'Unpin' : 'Pin'} Message
                          </DropdownMenuItem>
                        )}
                        {(isHost || (message.sender_id && message.sender_id === currentUser?.id)) && (
                          <DropdownMenuItem 
                            onClick={() => onDeleteMessage?.(message.id)}
                            className="text-destructive"
                          >
                            Delete Message
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Reactions */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xs text-muted-foreground">Quick reactions:</span>
          {quickReactions.map((reaction) => (
            <Button
              key={reaction.emoji}
              variant="ghost"
              size="sm"
              onClick={() => handleEmojiReaction(reaction.emoji)}
              className="h-8 w-8 p-0 hover:scale-110 transition-transform"
              title={reaction.label}
            >
              <span className="text-lg">{reaction.emoji}</span>
            </Button>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
              maxLength={500}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <Smile className="w-4 h-4" />
            </Button>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-8 gap-1">
                  {commonEmojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmojiReaction(emoji)}
                      className="h-8 w-8 p-0 text-lg hover:scale-110 transition-transform"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSendMessage} 
            size="sm"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {newMessage.length > 400 && (
          <div className="mt-1 text-xs text-muted-foreground">
            {500 - newMessage.length} characters remaining
          </div>
        )}
      </div>
    </div>
  );
}