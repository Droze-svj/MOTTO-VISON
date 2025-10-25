/**
 * Realtime Service
 * WebSocket-based real-time communication
 */

import io, {Socket} from 'socket.io-client';

interface TypingStatus {
  userId: string;
  isTyping: boolean;
}

interface RealtimeMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

type EventCallback = (data: any) => void;

export class RealtimeService {
  private static instance: RealtimeService;
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private eventHandlers: Map<string, EventCallback[]> = new Map();
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  private constructor() {}

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // ============================================
  // Connection Management
  // ============================================

  connect(url: string = 'http://localhost:8000', options?: any): void {
    if (this.socket?.connected) {
      console.log('Already connected to WebSocket');
      return;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      timeout: 10000,
      ...options
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', {timestamp: Date.now()});
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', {reason, timestamp: Date.now()});
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}/${this.MAX_RECONNECT_ATTEMPTS}`);
      this.reconnectAttempts = attempt;
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.emit('error', error);
    });

    // Custom events
    this.socket.on('message', (data: RealtimeMessage) => {
      this.emit('message', data);
    });

    this.socket.on('typing', (data: TypingStatus) => {
      this.emit('typing', data);
    });

    this.socket.on('user_joined', (data: {userId: string}) => {
      this.emit('user_joined', data);
    });

    this.socket.on('user_left', (data: {userId: string}) => {
      this.emit('user_left', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  // ============================================
  // Event Emission & Listening
  // ============================================

  on(event: string, callback: EventCallback): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(callback);
    this.eventHandlers.set(event, handlers);
  }

  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.eventHandlers.delete(event);
      return;
    }

    const handlers = this.eventHandlers.get(event) || [];
    const filtered = handlers.filter(h => h !== callback);
    this.eventHandlers.set(event, filtered);
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  // ============================================
  // Message Operations
  // ============================================

  sendMessage(message: string, to?: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot send message: not connected');
      return;
    }

    this.socket.emit('message', {
      content: message,
      to,
      timestamp: Date.now()
    });
  }

  sendTyping(isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit('typing', {
      isTyping,
      timestamp: Date.now()
    });
  }

  // ============================================
  // Room Management
  // ============================================

  joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: not connected');
      return;
    }

    this.socket.emit('join_room', {roomId});
    console.log(`📥 Joined room: ${roomId}`);
  }

  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('leave_room', {roomId});
    console.log(`📤 Left room: ${roomId}`);
  }

  // ============================================
  // Status & Health
  // ============================================

  getStatus(): {
    isConnected: boolean;
    reconnectAttempts: number;
    socketId?: string;
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }

  ping(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      const start = Date.now();
      this.socket.emit('ping', {}, () => {
        const latency = Date.now() - start;
        resolve(latency);
      });

      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Ping timeout')), 5000);
    });
  }
}

export default RealtimeService.getInstance();

