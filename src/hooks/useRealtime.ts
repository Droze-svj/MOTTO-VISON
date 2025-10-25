/**
 * Realtime Hook
 * Easy access to WebSocket real-time features
 */

import {useState, useEffect, useCallback, useRef} from 'react';
import RealtimeService from '../services/core/RealtimeService';

interface UseRealtimeOptions {
  url?: string;
  autoConnect?: boolean;
  userId?: string;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    url = 'http://localhost:8000',
    autoConnect = true,
    userId
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoConnect) {
      // Connect to WebSocket
      RealtimeService.connect(url);

      // Set up event listeners
      RealtimeService.on('connected', () => {
        setIsConnected(true);
        
        // Authenticate if userId provided
        if (userId) {
          // Socket will emit authenticate event
        }
      });

      RealtimeService.on('disconnected', () => {
        setIsConnected(false);
      });

      RealtimeService.on('typing', (data: {userId: string; isTyping: boolean}) => {
        setIsTyping(data.isTyping);
        
        // Auto-clear typing after 3 seconds
        if (data.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      });

      // Cleanup on unmount
      return () => {
        RealtimeService.disconnect();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [autoConnect, url, userId]);

  const sendMessage = useCallback((message: string, to?: string) => {
    RealtimeService.sendMessage(message, to);
  }, []);

  const sendTyping = useCallback((typing: boolean) => {
    RealtimeService.sendTyping(typing);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    RealtimeService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    RealtimeService.leaveRoom(roomId);
  }, []);

  const measureLatency = useCallback(async () => {
    try {
      const lat = await RealtimeService.ping();
      setLatency(lat);
      return lat;
    } catch (error) {
      console.error('Latency measurement failed:', error);
      return null;
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    RealtimeService.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    RealtimeService.off(event, callback);
  }, []);

  return {
    isConnected,
    isTyping,
    latency,
    sendMessage,
    sendTyping,
    joinRoom,
    leaveRoom,
    measureLatency,
    on,
    off,
    status: RealtimeService.getStatus()
  };
}

