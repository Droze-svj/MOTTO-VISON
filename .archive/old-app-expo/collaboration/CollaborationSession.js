import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Dimensions,
  ScrollView
} from 'react-native';
import RealTimeCollaborationService from '../../services/RealTimeCollaborationService';
import MetricsService from '../../services/MetricsService';

const { width, height } = Dimensions.get('window');

const CollaborationSession = ({ sessionId, onClose }) => {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    initializeSession();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeSession = async () => {
    try {
      await RealTimeCollaborationService.connect();
      const sessionData = await RealTimeCollaborationService.getSession(sessionId);
      setSession(sessionData);
      setIsConnected(true);
      
      await MetricsService.log('collaboration_session_opened', {
        sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error initializing session:', error);
      Alert.alert('Error', 'Failed to connect to collaboration session');
    }
  };

  const setupEventListeners = () => {
    RealTimeCollaborationService.on('connected', () => {
      setIsConnected(true);
    });

    RealTimeCollaborationService.on('disconnected', () => {
      setIsConnected(false);
    });

    RealTimeCollaborationService.on('participant_joined', ({ participant }) => {
      setParticipants(prev => [...prev, participant]);
    });

    RealTimeCollaborationService.on('participant_left', ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
    });

    RealTimeCollaborationService.on('chat_message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    RealTimeCollaborationService.on('typing_indicator', ({ userId, isTyping }) => {
      if (isTyping) {
        setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
      } else {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }
    });

    RealTimeCollaborationService.on('document_updated', (document) => {
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id ? document : doc
      ));
    });
  };

  const cleanup = async () => {
    if (sessionId) {
      await RealTimeCollaborationService.leaveSession(sessionId, 'current_user');
    }
    await RealTimeCollaborationService.disconnect();
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await RealTimeCollaborationService.sendChatMessage(sessionId, {
        content: newMessage,
        type: 'text'
      }, 'current_user');
      
      setNewMessage('');
      setIsTyping(false);
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    
    if (!isTyping) {
      setIsTyping(true);
      RealTimeCollaborationService.sendTypingIndicator(sessionId, true, 'current_user');
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      RealTimeCollaborationService.sendTypingIndicator(sessionId, false, 'current_user');
    }, 1000);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.userId === 'current_user' ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={styles.messageUser}>{item.userId}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderParticipant = ({ item }) => (
    <View style={styles.participantItem}>
      <View style={styles.participantAvatar}>
        <Text style={styles.participantInitial}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.participantName}>{item.name}</Text>
    </View>
  );

  const renderDocument = ({ item }) => (
    <TouchableOpacity style={styles.documentItem}>
      <Text style={styles.documentName}>{item.name}</Text>
      <Text style={styles.documentType}>{item.type}</Text>
      <Text style={styles.documentVersion}>v{item.version}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sessionName}>{session?.name || 'Collaboration Session'}</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Participants Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Participants ({participants.length})</Text>
          <FlatList
            data={participants}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.id}
            style={styles.participantsList}
          />
          
          <Text style={styles.sidebarTitle}>Documents ({documents.length})</Text>
          <FlatList
            data={documents}
            renderItem={renderDocument}
            keyExtractor={(item) => item.id}
            style={styles.documentsList}
          />
        </View>

        {/* Chat Area */}
        <View style={styles.chatArea}>
          {/* Messages */}
          <FlatList
            ref={messagesEndRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            onContentSizeChange={scrollToBottom}
          />
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </Text>
            </View>
          )}
          
          {/* Message Input */}
          <View style={styles.messageInput}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={handleTyping}
              placeholder="Type a message..."
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#888',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#1a1a1a',
    borderRightWidth: 1,
    borderRightColor: '#333',
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  participantsList: {
    flex: 1,
    marginBottom: 20,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  participantInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  participantName: {
    fontSize: 12,
    color: '#ffffff',
  },
  documentsList: {
    flex: 1,
  },
  documentItem: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  documentType: {
    fontSize: 10,
    color: '#888',
  },
  documentVersion: {
    fontSize: 10,
    color: '#4CAF50',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageUser: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  typingIndicator: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  typingText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  messageInput: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 8,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CollaborationSession;
