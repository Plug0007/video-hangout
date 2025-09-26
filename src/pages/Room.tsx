import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RoomPage from './RoomPage';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Users, 
  Send, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Settings,
  Share,
  Crown
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  avatar: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system';
}

const Room = () => {
  return <RoomPage />;
};
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes mock duration
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock data
  const [participants] = useState<Participant[]>([
    { id: "1", name: "You", isHost: true, isMuted: false, isSpeaking: false, avatar: "YO" },
    { id: "2", name: "Alice", isHost: false, isMuted: false, isSpeaking: true, avatar: "AL" },
    { id: "3", name: "Bob", isHost: false, isMuted: true, isSpeaking: false, avatar: "BO" },
    { id: "4", name: "Charlie", isHost: false, isMuted: false, isSpeaking: false, avatar: "CH" },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "system",
      userName: "System",
      message: "Welcome to the watch party! The video will start soon.",
      timestamp: new Date(Date.now() - 300000),
      type: "system"
    },
    {
      id: "2",
      userId: "2",
      userName: "Alice",
      message: "Hey everyone! Excited to watch this together 🍿",
      timestamp: new Date(Date.now() - 240000),
      type: "message"
    },
    {
      id: "3",
      userId: "3",
      userName: "Bob",
      message: "Same here! This looks like a great movie",
      timestamp: new Date(Date.now() - 180000),
      type: "message"
    }
  ]);

  // Simulate video time updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In real app: emit playback state to server
  };

  const handleSeek = (value: number) => {
    setCurrentTime(value);
    // In real app: emit seek event to server
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: "1",
        userName: "You",
        message: message.trim(),
        timestamp: new Date(),
        type: "message"
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-player-bg">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Room {roomId}</h1>
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              {participants.length} watching
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Invite
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black relative group">
            {/* Mock Video Display */}
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Play className="w-12 h-12 text-primary" />
                </div>
                <p className="text-white/80 text-lg">Ready to start watching</p>
                <p className="text-white/60">Host can add a video source</p>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 video-overlay p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="flex items-center space-x-3 text-white">
                  <span className="text-sm font-mono">{formatTime(currentTime)}</span>
                  <div className="flex-1 bg-white/20 rounded-full h-2 relative">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-mono">{formatTime(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVolume(volume > 0 ? 0 : 100)}
                        className="text-white hover:bg-white/20"
                      >
                        {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>

                  {/* Voice/Video Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isMuted ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant={isVideoMuted ? "secondary" : "default"}
                      size="sm"
                      onClick={() => setIsVideoMuted(!isVideoMuted)}
                    >
                      {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-card border-l border-border flex flex-col">
          {/* Participants */}
          <Card className="border-0 border-b border-border rounded-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className={`w-8 h-8 ${participant.isSpeaking ? 'speaking-indicator' : ''}`}>
                      <AvatarFallback className="text-xs font-semibold">
                        {participant.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isHost && (
                      <Crown className="w-3 h-3 text-warning absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{participant.name}</p>
                    <div className="flex items-center space-x-1">
                      {participant.isMuted && <MicOff className="w-3 h-3 text-muted-foreground" />}
                      {participant.isSpeaking && (
                        <Badge variant="secondary" className="text-xs">Speaking</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold flex items-center">
                💬 Chat
              </h3>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-enter ${msg.type === 'system' ? 'text-center' : ''}`}>
                    {msg.type === 'system' ? (
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 inline-block">
                        {msg.message}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{msg.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-chat-message rounded-lg px-3 py-2 text-sm">
                          {msg.message}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;