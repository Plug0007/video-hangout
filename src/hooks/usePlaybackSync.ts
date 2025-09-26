import { useState, useCallback, useRef, useEffect } from 'react';

interface PlaybackState {
  position: number;
  paused: boolean;
  timestamp: number;
  hostId: string;
}

interface UsePlaybackSyncProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isHost: boolean;
  onStateChange: (state: PlaybackState) => void;
}

export function usePlaybackSync({ videoRef, isHost, onStateChange }: UsePlaybackSyncProps) {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const lastSyncRef = useRef<number>(0);
  const correctionTimeoutRef = useRef<NodeJS.Timeout>();

  // Host sync broadcast (every 500ms while playing)
  useEffect(() => {
    if (!isHost || !videoRef.current) return;

    const broadcastSync = () => {
      const video = videoRef.current;
      if (!video) return;

      const currentState: PlaybackState = {
        position: video.currentTime,
        paused: video.paused,
        timestamp: Date.now(),
        hostId: 'current-user', // Replace with actual user ID
      };

      onStateChange(currentState);
      lastSyncRef.current = Date.now();
    };

    if (isPlaying) {
      syncIntervalRef.current = setInterval(broadcastSync, 500);
    } else {
      // Broadcast immediately on pause/play changes
      broadcastSync();
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isHost, isPlaying, onStateChange, videoRef]);

  // Apply sync correction for non-hosts
  const applySyncCorrection = useCallback((authoritativeState: PlaybackState) => {
    const video = videoRef.current;
    if (!video || isHost) return;

    const now = Date.now();
    const timeSinceSync = (now - authoritativeState.timestamp) / 1000;
    const authoritativePosition = authoritativeState.paused 
      ? authoritativeState.position 
      : authoritativeState.position + timeSinceSync;

    const drift = authoritativePosition - video.currentTime;

    // Update play/pause state
    if (authoritativeState.paused && !video.paused) {
      video.pause();
      setIsPlaying(false);
    } else if (!authoritativeState.paused && video.paused) {
      video.play();
      setIsPlaying(true);
    }

    // Apply position correction
    if (Math.abs(drift) >= 0.5) {
      // Hard seek for large drift
      video.currentTime = authoritativePosition;
      setPosition(authoritativePosition);
    } else if (Math.abs(drift) > 0.1 && !authoritativeState.paused) {
      // Smooth correction for small drift
      const correctionRate = drift > 0 ? 1.02 : 0.98;
      video.playbackRate = correctionRate;
      
      // Reset playback rate after correction
      if (correctionTimeoutRef.current) {
        clearTimeout(correctionTimeoutRef.current);
      }
      correctionTimeoutRef.current = setTimeout(() => {
        video.playbackRate = 1.0;
      }, 1000);
    }
  }, [videoRef, isHost]);

  // Video event handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    if (isHost) {
      onStateChange({
        position: videoRef.current?.currentTime || 0,
        paused: false,
        timestamp: Date.now(),
        hostId: 'current-user',
      });
    }
  }, [isHost, onStateChange, videoRef]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (isHost) {
      onStateChange({
        position: videoRef.current?.currentTime || 0,
        paused: true,
        timestamp: Date.now(),
        hostId: 'current-user',
      });
    }
  }, [isHost, onStateChange, videoRef]);

  const handleSeek = useCallback((newPosition: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = newPosition;
    setPosition(newPosition);
    
    if (isHost) {
      // Priority seek event
      onStateChange({
        position: newPosition,
        paused: video.paused,
        timestamp: Date.now(),
        hostId: 'current-user',
      });
    }
  }, [isHost, onStateChange, videoRef]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setPosition(video.currentTime);
    setDuration(video.duration || 0);
  }, [videoRef]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume / 100;
    setVolume(newVolume);
  }, [videoRef]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
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
  };
}