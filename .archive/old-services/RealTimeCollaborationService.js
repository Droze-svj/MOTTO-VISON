import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';

class RealTimeCollaborationService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    
    // Collaboration features
    this.activeSessions = new Map();
    this.participants = new Map();
    this.sharedDocuments = new Map();
    this.collaborationHistory = [];
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Configuration
    this.config = {
      wsUrl: 'wss://api.openrouter.ai/ws', // Placeholder - would be your WebSocket server
      heartbeatInterval: 30000, // 30 seconds
      heartbeatTimeout: 10000, // 10 seconds
      maxParticipants: 10,
      sessionTimeout: 3600000, // 1 hour
      messageBufferSize: 1000
    };
    
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      await this.loadCollaborationHistory();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing RealTimeCollaborationService:', error);
    }
  }

  // WebSocket Connection Management
  async connect() {
    await this.initialize();
    
    if (this.isConnected) return;
    
    try {
      this.ws = new WebSocket(this.config.wsUrl);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
        
        MetricsService.log('websocket_connected', {
          timestamp: new Date().toISOString()
        });
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected', event);
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
        
        MetricsService.log('websocket_disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      };
      
      this.ws.onerror = (error) => {
        this.emit('error', error);
        MetricsService.log('websocket_error', {
          error: error.message || 'Unknown WebSocket error'
        });
      };
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      MetricsService.log('websocket_connection_failed', {
        error: error.message
      });
      throw error;
    }
  }

  async disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.stopHeartbeat();
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendHeartbeat();
      }
    }, this.config.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  sendHeartbeat() {
    if (this.isConnected) {
      this.send({
        type: 'heartbeat',
        timestamp: Date.now()
      });
      
      // Set timeout for heartbeat response
      this.heartbeatTimeout = setTimeout(() => {
        if (this.isConnected) {
          this.ws.close(1000, 'Heartbeat timeout');
        }
      }, this.config.heartbeatTimeout);
    }
  }

  // Message Handling
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'heartbeat_ack':
          if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
          }
          break;
          
        case 'session_update':
          this.handleSessionUpdate(message.data);
          break;
          
        case 'participant_join':
          this.handleParticipantJoin(message.data);
          break;
          
        case 'participant_leave':
          this.handleParticipantLeave(message.data);
          break;
          
        case 'document_update':
          this.handleDocumentUpdate(message.data);
          break;
          
        case 'chat_message':
          this.handleChatMessage(message.data);
          break;
          
        case 'cursor_update':
          this.handleCursorUpdate(message.data);
          break;
          
        case 'typing_indicator':
          this.handleTypingIndicator(message.data);
          break;
          
        default:
          this.emit('message', message);
      }
      
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      MetricsService.log('websocket_message_error', {
        error: error.message,
        data: data
      });
    }
  }

  send(message) {
    if (this.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        MetricsService.log('websocket_send_error', {
          error: error.message,
          message: message
        });
        return false;
      }
    }
    return false;
  }

  // Session Management
  async createSession(sessionData) {
    await this.initialize();
    
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      name: sessionData.name || 'Collaboration Session',
      type: sessionData.type || 'general',
      createdBy: sessionData.userId,
      createdAt: new Date().toISOString(),
      participants: new Set(),
      documents: new Map(),
      settings: {
        maxParticipants: this.config.maxParticipants,
        allowAnonymous: false,
        requireApproval: false,
        ...sessionData.settings
      }
    };
    
    this.activeSessions.set(sessionId, session);
    
    // Send session creation to server
    this.send({
      type: 'create_session',
      data: session
    });
    
    await MetricsService.log('collaboration_session_created', {
      sessionId,
      type: session.type,
      createdBy: session.createdBy
    });
    
    return session;
  }

  async joinSession(sessionId, userData) {
    await this.initialize();
    
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    if (session.participants.size >= session.settings.maxParticipants) {
      throw new Error('Session is full');
    }
    
    const participant = {
      id: userData.id,
      name: userData.name,
      avatar: userData.avatar,
      joinedAt: new Date().toISOString(),
      permissions: userData.permissions || ['read', 'write']
    };
    
    session.participants.add(participant.id);
    this.participants.set(participant.id, participant);
    
    // Send join request to server
    this.send({
      type: 'join_session',
      data: {
        sessionId,
        participant
      }
    });
    
    await MetricsService.log('collaboration_session_joined', {
      sessionId,
      participantId: participant.id
    });
    
    return participant;
  }

  async leaveSession(sessionId, userId) {
    await this.initialize();
    
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.participants.delete(userId);
      this.participants.delete(userId);
      
      // Send leave notification to server
      this.send({
        type: 'leave_session',
        data: {
          sessionId,
          userId
        }
      });
      
      await MetricsService.log('collaboration_session_left', {
        sessionId,
        userId
      });
    }
  }

  // Document Collaboration
  async shareDocument(sessionId, documentData) {
    await this.initialize();
    
    const document = {
      id: documentData.id,
      name: documentData.name,
      type: documentData.type,
      content: documentData.content,
      sharedBy: documentData.userId,
      sharedAt: new Date().toISOString(),
      version: 1,
      collaborators: new Set([documentData.userId])
    };
    
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.documents.set(document.id, document);
      this.sharedDocuments.set(document.id, document);
      
      // Send document share to server
      this.send({
        type: 'share_document',
        data: {
          sessionId,
          document
        }
      });
      
      await MetricsService.log('document_shared', {
        sessionId,
        documentId: document.id,
        sharedBy: document.sharedBy
      });
    }
    
    return document;
  }

  async updateDocument(documentId, updates, userId) {
    await this.initialize();
    
    const document = this.sharedDocuments.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    // Check permissions
    if (!document.collaborators.has(userId)) {
      throw new Error('No permission to update document');
    }
    
    // Apply updates
    Object.assign(document, updates);
    document.version++;
    document.lastModified = new Date().toISOString();
    document.lastModifiedBy = userId;
    
    // Send update to server
    this.send({
      type: 'update_document',
      data: {
        documentId,
        updates,
        userId,
        version: document.version
      }
    });
    
    await MetricsService.log('document_updated', {
      documentId,
      userId,
      version: document.version
    });
    
    return document;
  }

  // Real-time Chat
  async sendChatMessage(sessionId, message, userId) {
    await this.initialize();
    
    const chatMessage = {
      id: this.generateMessageId(),
      sessionId,
      userId,
      content: message.content,
      type: message.type || 'text',
      timestamp: new Date().toISOString(),
      replyTo: message.replyTo || null
    };
    
    // Send to server
    this.send({
      type: 'chat_message',
      data: chatMessage
    });
    
    await MetricsService.log('chat_message_sent', {
      sessionId,
      messageId: chatMessage.id,
      userId
    });
    
    return chatMessage;
  }

  // Cursor and Selection Tracking
  async updateCursor(sessionId, cursorData, userId) {
    await this.initialize();
    
    const cursor = {
      sessionId,
      userId,
      position: cursorData.position,
      selection: cursorData.selection,
      timestamp: Date.now()
    };
    
    this.send({
      type: 'cursor_update',
      data: cursor
    });
  }

  // Typing Indicators
  async sendTypingIndicator(sessionId, isTyping, userId) {
    await this.initialize();
    
    this.send({
      type: 'typing_indicator',
      data: {
        sessionId,
        userId,
        isTyping,
        timestamp: Date.now()
      }
    });
  }

  // Event Handling
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Message Handlers
  handleSessionUpdate(data) {
    const session = this.activeSessions.get(data.sessionId);
    if (session) {
      Object.assign(session, data.updates);
      this.emit('session_updated', session);
    }
  }

  handleParticipantJoin(data) {
    const session = this.activeSessions.get(data.sessionId);
    if (session) {
      session.participants.add(data.participant.id);
      this.participants.set(data.participant.id, data.participant);
      this.emit('participant_joined', { session, participant: data.participant });
    }
  }

  handleParticipantLeave(data) {
    const session = this.activeSessions.get(data.sessionId);
    if (session) {
      session.participants.delete(data.userId);
      this.participants.delete(data.userId);
      this.emit('participant_left', { session, userId: data.userId });
    }
  }

  handleDocumentUpdate(data) {
    const document = this.sharedDocuments.get(data.documentId);
    if (document) {
      Object.assign(document, data.updates);
      document.version = data.version;
      this.emit('document_updated', document);
    }
  }

  handleChatMessage(data) {
    this.emit('chat_message', data);
  }

  handleCursorUpdate(data) {
    this.emit('cursor_update', data);
  }

  handleTypingIndicator(data) {
    this.emit('typing_indicator', data);
  }

  // Utility Methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  async loadCollaborationHistory() {
    try {
      const stored = await AsyncStorage.getItem('collaboration_history');
      if (stored) {
        this.collaborationHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading collaboration history:', error);
    }
  }

  async saveCollaborationHistory() {
    try {
      await AsyncStorage.setItem('collaboration_history', JSON.stringify(this.collaborationHistory));
    } catch (error) {
      console.error('Error saving collaboration history:', error);
    }
  }

  // Health Check
  async getHealthStatus() {
    return {
      isConnected: this.isConnected,
      activeSessions: this.activeSessions.size,
      participants: this.participants.size,
      sharedDocuments: this.sharedDocuments.size,
      collaborationHistory: this.collaborationHistory.length,
      reconnectAttempts: this.reconnectAttempts,
      isInitialized: this.isInitialized
    };
  }
}

export default new RealTimeCollaborationService();
