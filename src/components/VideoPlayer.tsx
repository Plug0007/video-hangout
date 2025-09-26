import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Upload,
} from 'lucide-react';
import { usePlaybackSync } from '@/hooks/usePlaybackSync';

interface VideoPlayerProps {
  roomData: any;
  isHost: boolean;
  currentUser: any;
  onPlaybackSync: (state: any) => void;
  onVideoSourceChange?: (url: string, title: string) => void;
}

export function VideoPlayer({
  roomData,
  isHost,
  currentUser,
  onPlaybackSync,
  onVideoSourceChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    formatTime,
    applySyncCorrection,
  } = usePlaybackSync({
    videoRef,
    isHost,
    onStateChange: onPlaybackSync,
  });

  // Apply sync corrections from other participants
  useEffect(() => {
    if (roomData?.syncData && !isHost) {
      applySyncCorrection(roomData.syncData);
    }
  }, [roomData?.syncData, applySyncCorrection, isHost]);

  // Handle video source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !roomData?.current_video_url) return;

    if (video.src !== roomData.current_video_url) {
      video.src = roomData.current_video_url;
      video.load();
    }
  }, [roomData?.current_video_url]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isHost) return;

    // Create object URL for local playback
    const videoUrl = URL.createObjectURL(file);
    onVideoSourceChange?.(videoUrl, file.name);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newPosition = (clickX / rect.width) * duration;
    handleSeek(newPosition);
  };

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden group aspect-video"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => {
          const video = videoRef.current;
          if (video && roomData?.current_position) {
            video.currentTime = roomData.current_position;
          }
        }}
      />

      {/* Video Placeholder */}
      {!roomData?.current_video_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Play className="w-12 h-12 text-primary" />
            </div>
            <div>
              <p className="text-white/80 text-lg mb-2">Ready to start watching</p>
              {isHost ? (
                <div className="space-y-2">
                  <p className="text-white/60">Upload a video or paste a URL</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <p className="text-white/60">Waiting for host to add video source</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Host Info Overlay */}
      {roomData?.host && (
        <div className="absolute top-4 left-4 glass-effect px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {roomData.host.display_name?.[0] || 'H'}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <p className="text-white font-medium">{roomData.host.display_name}</p>
              <Badge variant="secondary" className="text-xs px-1 py-0">
                Host
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Video Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 video-overlay p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="flex items-center space-x-3 text-white">
            <span className="text-sm font-mono min-w-[3rem]">
              {formatTime(position)}
            </span>
            <div 
              className="flex-1 bg-white/20 rounded-full h-2 relative cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${duration ? (position / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-mono min-w-[3rem]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20"
                disabled={!roomData?.current_video_url || (!isHost && !roomData?.is_playing)}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVolumeChange(volume > 0 ? 0 : 100)}
                  className="text-white hover:bg-white/20"
                >
                  {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 accent-primary"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}