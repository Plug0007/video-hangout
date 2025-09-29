import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Maximize, Upload, Link, Users, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlaybackSync } from "@/hooks/usePlaybackSync";
import { roomService } from "@/services/roomService";

interface VideoPlayerProps {
  roomData: any;
  isHost: boolean;
  currentUser: any;
  onPlaybackSync: (data: any) => void;
  onVideoSourceChange?: (url: string, title?: string) => void;
}

const VideoPlayer = ({ roomData, isHost, currentUser, onPlaybackSync, onVideoSourceChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const { toast } = useToast();

  const {
    position,
    duration,
    isPlaying,
    volume,
    handlePlay,
    handlePause,
    handleSeek,
    handleTimeUpdate,
    handleVolumeChange,
    applySyncCorrection,
    formatTime,
  } = usePlaybackSync({
    videoRef,
    isHost,
    onStateChange: onPlaybackSync,
  });

  // Apply sync data from room
  useEffect(() => {
    if (!isHost && roomData && videoRef.current) {
      const syncData = {
        position: roomData.current_position || 0,
        isPlaying: roomData.is_playing || false,
        paused: !roomData.is_playing,
        timestamp: Date.now(),
        hostId: roomData.host_id,
      };
      applySyncCorrection(syncData);
    }
  }, [roomData?.current_position, roomData?.is_playing, roomData?.last_sync_at, isHost, applySyncCorrection]);

  // Update video source when room data changes
  useEffect(() => {
    if (roomData?.current_video_url && videoRef.current && videoRef.current.src !== roomData.current_video_url) {
      videoRef.current.src = roomData.current_video_url;
      videoRef.current.load();
    }
  }, [roomData?.current_video_url]);

  const validateVideoUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('.mov');
    } catch {
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    setIsValidUrl(validateVideoUrl(url));
  };

  const handleLoadVideo = async () => {
    if (!isValidUrl || !videoUrl) {
      toast({ title: "Invalid URL", description: "Please enter a valid video URL", variant: "destructive" });
      return;
    }

    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
      
      // Extract title from URL
      const title = videoUrl.split('/').pop()?.split('.')[0] || 'Video';
      
      // Update room state if host
      if (isHost && roomData?.room_code) {
        await roomService.updatePlaybackState(roomData.room_code, 0, false, videoUrl, title);
        if (onVideoSourceChange) {
          onVideoSourceChange(videoUrl, title);
        }
      }
      
      toast({ title: "Video loaded", description: "Video has been loaded successfully" });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      const objectUrl = URL.createObjectURL(file);
      videoRef.current.src = objectUrl;
      videoRef.current.load();
      
      if (isHost && onVideoSourceChange) {
        onVideoSourceChange(objectUrl, file.name);
      }
      
      toast({ title: "File uploaded", description: "Video file has been loaded successfully" });
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    handleSeek(newTime);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={() => {
          // This will be handled by the usePlaybackSync hook internally
        }}
        onPlay={handlePlay}
        onPause={handlePause}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        poster="/placeholder.svg"
      />

      {/* Video Load Interface (when no video) */}
      {!roomData?.current_video_url && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 to-card/80">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Load Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isHost ? (
                <>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter video URL (mp4, webm, ogg)"
                        value={videoUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleLoadVideo} 
                        disabled={!isValidUrl}
                        size="sm"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Load
                      </Button>
                    </div>
                    {videoUrl && !isValidUrl && (
                      <p className="text-sm text-destructive">Please enter a valid video URL</p>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">or</p>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">Waiting for host to load a video...</p>
                  <Badge variant="secondary">
                    <Users className="w-4 h-4 mr-1" />
                    Participant
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Host Info */}
      {roomData?.current_video_title && (
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/60 rounded-lg p-3 backdrop-blur-sm">
            <h3 className="text-white font-medium">{roomData.current_video_title}</h3>
            <p className="text-white/80 text-sm">
              Host: {isHost ? 'You' : 'Room Host'}
            </p>
          </div>
        </div>
      )}

      {/* Video Controls */}
      {roomData?.current_video_url && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Progress Bar */}
          <div
            className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${duration ? (position / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-white hover:text-white/80"
                disabled={!isHost}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !videoRef.current.muted;
                    }
                  }}
                  className="text-white hover:text-white/80"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    if (videoRef.current) {
                      videoRef.current.volume = parseFloat(e.target.value);
                    }
                  }}
                  className="w-20"
                />
              </div>

              <span className="text-sm font-mono">
                {formatTime(position)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isHost && (
                <Badge variant="secondary" className="text-xs">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Synced
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-white hover:text-white/80"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;