import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Mic, Video, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { roomService } from "@/services/roomService";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateRoom = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to create a room.", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { room, error } = await roomService.createRoom("New Watch Party");
    setCreating(false);
    if (error || !room) {
      toast({ title: "Failed to create room", description: error?.message || "Please try again.", variant: "destructive" });
      return;
    }
    navigate(`/room/${room.room_code}`);
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.toUpperCase()}`);
    }
  };

  const features = [
    {
      icon: Play,
      title: "Synchronized Playback",
      description: "Watch videos together with perfect sync across all devices"
    },
    {
      icon: Users,
      title: "Real-time Chat",
      description: "Chat with friends while watching with emoji reactions"
    },
    {
      icon: Mic,
      title: "Voice & Video",
      description: "Optional voice and video chat with push-to-talk"
    },
    {
      icon: Shield,
      title: "Private Rooms",
      description: "Create password-protected rooms with host controls"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Real-time Synchronization
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent leading-tight">
                Watch Together
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Host synchronized watch parties with friends. Stream videos, chat in real-time, and share the experience no matter where you are.
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Create Room Card */}
            <Card className="glass-effect border-primary/20 hover:border-primary/40 transition-all duration-300 group">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  Create Room
                </CardTitle>
                <CardDescription>
                  Start a new watch party and invite friends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleCreateRoom}
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={creating}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {creating ? 'Creating…' : 'Create New Room'}
                </Button>
              </CardContent>
            </Card>

            {/* Join Room Card */}
            <Card className="glass-effect border-accent/20 hover:border-accent/40 transition-all duration-300 group">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl group-hover:text-accent transition-colors">
                  Join Room
                </CardTitle>
                <CardDescription>
                  Enter a room code to join a party
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter room code..."
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="text-center text-lg font-mono tracking-wider"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <Button 
                  onClick={handleJoinRoom}
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                  disabled={!roomCode.trim()}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold">Why Choose WatchParty?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience seamless video synchronization with powerful social features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-effect text-center hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;