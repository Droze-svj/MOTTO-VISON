import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useStorage } from '../hooks/useStorage';
import { useNotifications } from '../hooks/useNotifications';
import { useAnimation } from '../hooks/useAnimation';
import { useGesture } from '../hooks/useGesture';
import { useEnhancedVoiceCommand } from '../hooks/useEnhancedVoiceCommand';
import { runVoiceCommandTests } from '../utils/voiceCommandTest';
import BackgroundListeningService from '../services/BackgroundListeningService';
import DocumentUploader from '../components/document/DocumentUploader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import AIEnhancementService from '../services/AIEnhancementService';
import { Ionicons } from '@expo/vector-icons';
import { registerCommandHandler, clearCommandHandlers, CommandProcessor as _CP, COMMANDS } from '../utils/commandProcessor';
import PreviewVariants from '../components/common/PreviewVariants';
import ActionPlan from '../components/common/ActionPlan';
import PlanControls from '../components/common/PlanControls';
import { executePlan } from '../services/TaskOrchestrator';
import PlanEditor from '../components/common/PlanEditor';

const { width, height } = Dimensions.get('window');

const MessageItem = React.memo(({ item, getSentimentColor, onVariantPress, onSave, onKnowledgePress }) => {
  const isUser = item.sender === 'user';
  const showAnalysis = item.analysis && !isUser;

  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
        <View style={styles.messageActionsRow}>
          <TouchableOpacity onPress={() => onSave && onSave(item)}>
            <Text style={styles.saveLink}>Save</Text>
          </TouchableOpacity>
        </View>
        {showAnalysis && (
          <View style={styles.analysisContainer}>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Intent:</Text>
              <Text style={styles.analysisValue}>{item.analysis.intent}</Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Sentiment:</Text>
              <Text style={[styles.analysisValue, { color: getSentimentColor(item.analysis.sentiment) }]}>
                {item.analysis.sentiment}
              </Text>
            </View>
            {item.analysis.urgency === 'high' && (
              <View style={styles.urgencyBadge}>
                <Text style={styles.urgencyText}>High Priority</Text>
              </View>
            )}
          </View>
        )}
        {!isUser && item.variants && item.variants.length > 0 && (
          <PreviewVariants variants={item.variants} onVariantPress={onVariantPress} />
        )}
        {!isUser && item.analysis && item.analysis.complexity === 'high' && item.plan && item.plan.length > 0 && (
          <ActionPlan steps={item.plan} />
        )}
        {!isUser && Array.isArray(item.knowledge) && item.knowledge.length > 0 && (
          <View style={styles.kbContainer}>
            <Text style={styles.kbTitle}>Related knowledge</Text>
            {item.knowledge.slice(0, 3).map((k) => (
              <TouchableOpacity key={k.id} onPress={() => onKnowledgePress && onKnowledgePress(k)}>
                <Text style={styles.kbItemTitle}>• {k.title || 'Untitled'}</Text>
                {!!k.content && <Text style={styles.kbItemSnippet} numberOfLines={2}>{k.content}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
});

const EnhancedChatScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { getItem, setItem } = useStorage();
  const { scheduleNotification } = useNotifications();
  const flatListRef = useRef(null);
  
  // Enhanced voice command hook
  const {
    isListening,
    isProcessing,
    transcript,
    confidence,
    error: voiceError,
    lastCommand,
    commandHistory,
    startListening,
    stopListening,
    updateSettings,
    getCommandStats
  } = useEnhancedVoiceCommand({
    contextAwareness: true,
    naturalLanguageProcessing: true,
    ambientNoiseAdaptation: true
  });

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [showVoiceControls, setShowVoiceControls] = useState(false);
  const [isRunningPlan, setIsRunningPlan] = useState(false);
  const [lastPlanResults, setLastPlanResults] = useState(null);
  const [editingPlanMessageId, setEditingPlanMessageId] = useState(null);
  const [editingPlanDraft, setEditingPlanDraft] = useState([]);
  
  // Background listening state
  const [isBackgroundListening, setIsBackgroundListening] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [backgroundListeningEnabled, setBackgroundListeningEnabled] = useState(true);
  
  // Document upload state
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);

  const { animation: typingAnimation } = useAnimation(0);
  const { panResponder: messagePanResponder, animatedStyle: messageAnimatedStyle } = useGesture({
    onSwipeLeft: () => handleMessageAction('delete'),
    onSwipeRight: () => handleMessageAction('reply'),
  });

  // Animation for voice button
  const voiceButtonScale = useRef(new Animated.Value(1)).current;
  const voiceButtonOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadMessages();
    loadAIInsights();
    const interval = setInterval(simulateTyping, 5000);
    return () => clearInterval(interval);
  }, []);

  // Register command handlers for voice commands
  useEffect(() => {
    registerCommandHandler('navigate', async (params) => {
      try {
        if (params?.screen) {
          navigation.navigate(params.screen);
          return { success: true, message: `Navigated to ${params.screen}` };
        }
        return { success: false, message: 'No screen provided' };
      } catch (e) {
        return { success: false, message: e?.message || 'Navigation failed' };
      }
    });

    registerCommandHandler('settings', async () => {
      try {
        navigation.navigate('VoiceCommandSettings');
        return { success: true, message: 'Opened settings' };
      } catch (e) {
        return { success: false, message: e?.message || 'Failed to open settings' };
      }
    });

    registerCommandHandler('mediaControl', async (params) => {
      const cmd = params?.command || 'unknown';
      return { success: true, message: `Media ${cmd} executed` };
    });

    registerCommandHandler('collection', async (params) => {
      const cmd = params?.command || 'unknown';
      return { success: true, message: `Collection ${cmd} executed` };
    });

    registerCommandHandler('analytics', async (params) => {
      const cmd = params?.command || 'show';
      return { success: true, message: `Analytics ${cmd} executed` };
    });

    registerCommandHandler('help', async () => {
      return { success: true, message: 'Help command received' };
    });

    return () => {
      clearCommandHandlers();
    };
  }, [navigation]);

  // Initialize background listening
  useEffect(() => {
    const initializeBackgroundListening = async () => {
      try {
        await BackgroundListeningService.initialize();
        
        // Set up callbacks
        BackgroundListeningService.onWakeWordDetected((transcript) => {
          console.log('🎯 Wake word detected:', transcript);
          setWakeWordDetected(true);
          
          // Start active voice command listening
          startListening();
          
          // Show feedback
          setTimeout(() => {
            setWakeWordDetected(false);
          }, 2000);
        });

        BackgroundListeningService.onListeningStarted(() => {
          setIsBackgroundListening(true);
        });

        BackgroundListeningService.onListeningStopped(() => {
          setIsBackgroundListening(false);
        });

        BackgroundListeningService.onError((error) => {
          console.error('Background listening error:', error);
          setError(`Background listening error: ${error.message}`);
        });

        // Start background listening if enabled
        if (backgroundListeningEnabled) {
          await BackgroundListeningService.startBackgroundListening();
        }
      } catch (error) {
        console.error('Failed to initialize background listening:', error);
        setError('Failed to initialize background listening');
      }
    };

    initializeBackgroundListening();

    return () => {
      BackgroundListeningService.destroy();
    };
  }, [backgroundListeningEnabled]);

  const MAX_MESSAGES = 300;

  // Handle voice transcript updates
  useEffect(() => {
    if (transcript && !isListening) {
      setNewMessage(transcript);
      handleSendMessage(transcript);
    }
  }, [transcript, isListening]);

  // Animate voice button when listening
  useEffect(() => {
    if (isListening) {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(voiceButtonScale, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(voiceButtonScale, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(voiceButtonOpacity, {
              toValue: 0.5,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(voiceButtonOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      voiceButtonScale.setValue(1);
      voiceButtonOpacity.setValue(1);
    }
  }, [isListening]);

  const loadMessages = async () => {
    try {
      const savedMessages = await getItem('enhanced_messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setMessages(Array.isArray(parsed) ? parsed.slice(-MAX_MESSAGES) : []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages. Please check your connection.');
    }
  };

  const saveMessages = async (updatedMessages) => {
    try {
      const limited = updatedMessages.slice(-MAX_MESSAGES);
      await setItem('enhanced_messages', JSON.stringify(limited));
      setMessages(limited);
    } catch (error) {
      console.error('Error saving messages:', error);
      setError('Failed to save messages. Please try again.');
    }
  };

  const loadAIInsights = async () => {
    try {
      const insights = await AIEnhancementService.getConversationInsights();
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || newMessage.trim();
    if (!text) return;

    // If user typed a known command, execute instantly and skip AI
    try {
      const cp = new _CP();
      const direct = cp.processCommand(text);
      if (direct) {
        await cp.executeCommand(Object.keys(COMMANDS).find(k => COMMANDS[k] === direct) || '', direct.params);
        setNewMessage('');
        return;
      }
    } catch (e) {}

    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent',
      confidence: confidence || 1.0,
    };

    const updatedMessages = [...messages, userMessage];
    await saveMessages(updatedMessages);
    setNewMessage('');

    // Show typing indicator
    setIsTyping(true);
    typingAnimation.setValue(0);
    typingAnimation.start();

    try {
      // Use Human-Like AI for enhanced responses
      const humanLikeResponse = await AIEnhancementService.generateHumanLikeResponse(text, {
        messageHistory: messages.slice(-5),
        userContext: {
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        }
      });

      // Assess and refine response quality
      const qualityAssessment = await AIEnhancementService.assessResponseQuality(humanLikeResponse.response, {
        userIntent: text,
        keywords: text.split(' '),
        userPreferences: userPreferences
      });

      // Refine response if quality is low
      let finalResponse = humanLikeResponse.response;
      if (qualityAssessment.overallScore < 0.7) {
        const refinement = await AIEnhancementService.refineResponse(humanLikeResponse.response, {
          userIntent: text,
          keywords: text.split(' '),
          userPreferences: userPreferences
        });
        finalResponse = refinement.refinedResponse;
      }

      // Personalize response
      const personalizedResponse = await AIEnhancementService.personalizeResponse(finalResponse, 'user_1', {
        userPreferences: userPreferences,
        context: { messageHistory: messages.slice(-5) }
      });

      // Provide context-aware assistance based on documents
      let contextAwareResponse = personalizedResponse;
      try {
        const contextAssistance = await AIEnhancementService.provideContextAwareAssistance(text, {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences
        });
        
        if (contextAssistance.relevantDocuments.length > 0) {
          contextAwareResponse = await this.enhanceResponseWithDocumentContext(
            personalizedResponse, 
            contextAssistance
          );
        }
      } catch (error) {
        console.log('Context-aware assistance failed, using regular response');
      }

      // Perform advanced reasoning for complex queries
      let advancedResponse = contextAwareResponse;
      try {
        if (this.isComplexQuery(text)) {
          const reasoningResult = await AIEnhancementService.performComplexReasoning(text, {
            messageHistory: messages.slice(-5),
            userPreferences: userPreferences,
            context: contextAwareResponse
          });
          
          if (reasoningResult.confidence > 0.7) {
            advancedResponse = await this.enhanceResponseWithReasoning(
              contextAwareResponse,
              reasoningResult
            );
          }
        }
      } catch (error) {
        console.log('Advanced reasoning failed, using regular response');
      }

      // Generate predictive insights for user behavior
      try {
        const predictiveInsights = await AIEnhancementService.generatePredictiveInsights({
          query: text,
          userHistory: messages.slice(-10),
          preferences: userPreferences
        }, {
          userId: 'user_1',
          timestamp: Date.now()
        });
        
        if (predictiveInsights.confidence > 0.6) {
          advancedResponse = await this.enhanceResponseWithPredictions(
            advancedResponse,
            predictiveInsights
          );
        }
      } catch (error) {
        console.log('Predictive insights failed, using regular response');
      }

      // Enhance prompt with advanced prompt engineering
      let enhancedPrompt = text;
      try {
        const promptEnhancement = await AIEnhancementService.enhancePrompt(text, {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (promptEnhancement.analysis.clarity > 0.8) {
          enhancedPrompt = promptEnhancement.finalPrompt;
          advancedResponse = await this.enhanceResponseWithPromptEngineering(
            advancedResponse,
            promptEnhancement
          );
        }
      } catch (error) {
        console.log('Prompt enhancement failed, using regular response');
      }

      // Optimize context for better responses
      try {
        const contextOptimization = await AIEnhancementService.optimizeContext({
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          currentQuery: text,
          response: advancedResponse
        }, text, 'comprehensive');
        
        if (contextOptimization.analysis.analysis.relevance > 0.7) {
          advancedResponse = await this.enhanceResponseWithContextOptimization(
            advancedResponse,
            contextOptimization
          );
        }
      } catch (error) {
        console.log('Context optimization failed, using regular response');
      }

      // Find relevant examples for the user's input
      let relevantExamples = [];
      try {
        const exampleSearch = await AIEnhancementService.findRelevantExamples(text, {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (exampleSearch.relevantExamples.length > 0) {
          relevantExamples = exampleSearch.relevantExamples.slice(0, 3);
          advancedResponse = await this.enhanceResponseWithRelevantExamples(
            advancedResponse,
            relevantExamples
          );
        }
      } catch (error) {
        console.log('Example search failed, using regular response');
      }

      // Generate search suggestions for better queries
      let searchSuggestions = [];
      try {
        const suggestions = await AIEnhancementService.generateSearchSuggestions(text, {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences
        });
        
        if (suggestions.suggestions.length > 0) {
          searchSuggestions = suggestions.suggestions.slice(0, 3);
          advancedResponse = await this.enhanceResponseWithSearchSuggestions(
            advancedResponse,
            searchSuggestions
          );
        }
      } catch (error) {
        console.log('Search suggestions failed, using regular response');
      }

      // Process follow-up questions and build conversation continuity
      let followUpProcessing = null;
      try {
        followUpProcessing = await AIEnhancementService.processFollowUpQuestion(text, messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (followUpProcessing.analysis.followUpType) {
          advancedResponse = await this.enhanceResponseWithFollowUpProcessing(
            advancedResponse,
            followUpProcessing
          );
        }
      } catch (error) {
        console.log('Follow-up processing failed, using regular response');
      }

      // Build conversation context and memory
      let conversationContext = null;
      try {
        conversationContext = await AIEnhancementService.buildConversationContext(messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          currentQuery: text
        });
        
        if (conversationContext.memoryExtraction) {
          advancedResponse = await this.enhanceResponseWithConversationContext(
            advancedResponse,
            conversationContext
          );
        }
      } catch (error) {
        console.log('Conversation context building failed, using regular response');
      }

      // Enable topic exploration for deeper understanding
      let topicExploration = null;
      try {
        topicExploration = await AIEnhancementService.enableTopicExploration(text, messages.slice(-10), 'medium');
        
        if (topicExploration.explorationPath.explorationSteps.length > 0) {
          advancedResponse = await this.enhanceResponseWithTopicExploration(
            advancedResponse,
            topicExploration
          );
        }
      } catch (error) {
        console.log('Topic exploration failed, using regular response');
      }

      // Analyze conversation intelligence for enhanced understanding
      let conversationIntelligence = null;
      try {
        conversationIntelligence = await AIEnhancementService.analyzeConversationIntelligence(text, messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (conversationIntelligence.contextualIntelligence) {
          advancedResponse = await this.enhanceResponseWithConversationIntelligence(
            advancedResponse,
            conversationIntelligence
          );
        }
      } catch (error) {
        console.log('Conversation intelligence analysis failed, using regular response');
      }

      // Monitor and optimize conversation performance
      let performanceOptimization = null;
      try {
        performanceOptimization = await AIEnhancementService.monitorConversationPerformance(text, messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (performanceOptimization.responseTime) {
          advancedResponse = await this.enhanceResponseWithPerformanceOptimization(
            advancedResponse,
            performanceOptimization
          );
        }
      } catch (error) {
        console.log('Performance optimization failed, using regular response');
      }

      // Enable advanced conversation features
      let advancedFeatures = null;
      try {
        advancedFeatures = await AIEnhancementService.enableAdvancedConversationFeatures(text, messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (advancedFeatures.intelligentRouting) {
          advancedResponse = await this.enhanceResponseWithAdvancedFeatures(
            advancedResponse,
            advancedFeatures
          );
        }
      } catch (error) {
        console.log('Advanced conversation features failed, using regular response');
      }

      // Analyze domain knowledge for enhanced understanding
      let domainKnowledge = null;
      try {
        domainKnowledge = await AIEnhancementService.analyzeDomainKnowledge(text, messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (domainKnowledge.domainIdentification) {
          advancedResponse = await this.enhanceResponseWithDomainKnowledge(
            advancedResponse,
            domainKnowledge
          );
        }
      } catch (error) {
        console.log('Domain knowledge analysis failed, using regular response');
      }

      // Generate reference guide for comprehensive assistance
      let referenceGuide = null;
      try {
        referenceGuide = await AIEnhancementService.generateReferenceGuide(text, messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (referenceGuide.domainGuide) {
          advancedResponse = await this.enhanceResponseWithReferenceGuide(
            advancedResponse,
            referenceGuide
          );
        }
      } catch (error) {
        console.log('Reference guide generation failed, using regular response');
      }

      // Analyze persona needs for personality adaptation
      let personaNeeds = null;
      try {
        personaNeeds = await AIEnhancementService.analyzePersonaNeeds(text, messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (personaNeeds.personaIdentification) {
          advancedResponse = await this.enhanceResponseWithPersonaNeeds(
            advancedResponse,
            personaNeeds
          );
        }
      } catch (error) {
        console.log('Persona needs analysis failed, using regular response');
      }

      // Adapt persona for personalized responses
      let personaAdaptation = null;
      try {
        personaAdaptation = await AIEnhancementService.adaptPersona(text, messages.slice(-10), {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (personaAdaptation.personaSelection) {
          advancedResponse = await this.enhanceResponseWithPersonaAdaptation(
            advancedResponse,
            personaAdaptation
          );
        }
      } catch (error) {
        console.log('Persona adaptation failed, using regular response');
      }

      // Conduct web research for comprehensive answers
      let webResearch = null;
      try {
        webResearch = await AIEnhancementService.conductWebResearch(text, {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (webResearch.summary) {
          advancedResponse = await this.enhanceResponseWithWebResearch(
            advancedResponse,
            webResearch
          );
        }
      } catch (error) {
        console.log('Web research failed, using regular response');
      }

      // Answer question intelligently
      let questionAnswer = null;
      try {
        questionAnswer = await AIEnhancementService.answerQuestion(text, {
          messageHistory: messages.slice(-5),
          userPreferences: userPreferences,
          context: advancedResponse
        });
        
        if (questionAnswer.answer) {
          advancedResponse = await this.enhanceResponseWithQuestionAnswer(
            advancedResponse,
            questionAnswer
          );
        }
      } catch (error) {
        console.log('Question answering failed, using regular response');
      }

      // Check if this is a task request and execute it
      let taskResult = null;
      if (humanLikeResponse.response.includes('task') || text.toLowerCase().includes('help me') || text.toLowerCase().includes('do this')) {
        try {
          taskResult = await AIEnhancementService.executeAdvancedTask(text, {
            priority: 'normal',
            context: { conversationHistory: messages }
          });
        } catch (taskError) {
          console.log('Task execution failed, continuing with regular response');
        }
      }

      // Add AI response to messages
      const botMessage = {
        id: Date.now() + 1,
        text: advancedResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        status: 'sent',
        confidence: humanLikeResponse.confidence,
        emotionalTone: humanLikeResponse.emotionalTone,
        suggestions: humanLikeResponse.suggestions,
        insights: humanLikeResponse.proactiveInsights,
        taskResult: taskResult,
        isHumanLike: true,
        qualityScore: qualityAssessment.overallScore,
        qualityFactors: qualityAssessment.qualityScores,
        isRefined: qualityAssessment.overallScore < 0.7,
        isPersonalized: true,
        isContextAware: contextAwareResponse !== personalizedResponse,
        isAdvancedReasoning: advancedResponse !== contextAwareResponse,
        isPredictive: advancedResponse !== contextAwareResponse,
        isPromptEnhanced: enhancedPrompt !== text,
        isContextOptimized: advancedResponse !== contextAwareResponse,
        hasRelevantExamples: relevantExamples.length > 0,
        hasSearchSuggestions: searchSuggestions.length > 0,
        hasFollowUpProcessing: followUpProcessing !== null,
        hasConversationContext: conversationContext !== null,
        hasTopicExploration: topicExploration !== null,
        hasConversationIntelligence: conversationIntelligence !== null,
        hasPerformanceOptimization: performanceOptimization !== null,
        hasAdvancedFeatures: advancedFeatures !== null,
        hasDomainKnowledge: domainKnowledge !== null,
        hasReferenceGuide: referenceGuide !== null,
        hasPersonaNeeds: personaNeeds !== null,
        hasPersonaAdaptation: personaAdaptation !== null,
        hasWebResearch: webResearch !== null,
        hasQuestionAnswer: questionAnswer !== null
      };

      const finalMessages = [...updatedMessages, botMessage];
      await saveMessages(finalMessages);
      setSuggestions(humanLikeResponse.suggestions);

      // Show task result if available
      if (taskResult && taskResult.success) {
        const taskMessage = {
          id: Date.now() + 2,
          text: `✅ Task completed successfully! ${taskResult.summary}`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          status: 'sent',
          isTaskResult: true,
          taskDetails: taskResult
        };
        const finalMessagesWithTask = [...finalMessages, taskMessage];
        await saveMessages(finalMessagesWithTask);
      }

      // Schedule notification for important messages
      if (humanLikeResponse.emotionalTone === 'urgent') {
        await scheduleNotification({
          title: 'Important Message',
          body: humanLikeResponse.response.substring(0, 100) + '...',
          data: { messageId: botMessage.id },
        });
      }

      // Update AI insights
      await loadAIInsights();

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble processing that right now. Could you try again?",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        status: 'error',
      };
      const finalMessages = [...updatedMessages, errorMessage];
      await saveMessages(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceCommand = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const handleTestVoiceCommands = async () => {
    console.log('🧪 Testing voice commands...');
    const results = await runVoiceCommandTests();
    
    if (results.permissions && results.availability && results.initialization) {
      alert('✅ Voice commands are ready! Try saying "Hey MOTTO" or tap the microphone button.');
    } else {
      alert('❌ Voice commands need setup. Check console for details.');
    }
  };

  const handleToggleBackgroundListening = async () => {
    try {
      if (backgroundListeningEnabled) {
        await BackgroundListeningService.stopBackgroundListening();
        setBackgroundListeningEnabled(false);
      } else {
        await BackgroundListeningService.startBackgroundListening();
        setBackgroundListeningEnabled(true);
      }
    } catch (error) {
      console.error('Error toggling background listening:', error);
      setError('Failed to toggle background listening');
    }
  };

  const enhanceResponseWithDocumentContext = async (response, contextAssistance) => {
    try {
      let enhancedResponse = response;
      
      // Add document insights if available
      if (contextAssistance.insights && contextAssistance.insights.keyThemes) {
        const keyThemes = contextAssistance.insights.keyThemes.slice(0, 3);
        if (keyThemes.length > 0) {
          enhancedResponse += `\n\n📚 Based on your documents, I found these related themes: ${keyThemes.join(', ')}.`;
        }
      }
      
      // Add relevant document references
      if (contextAssistance.relevantDocuments.length > 0) {
        const topDocuments = contextAssistance.relevantDocuments.slice(0, 2);
        const documentNames = topDocuments.map(doc => doc.document.title).join(', ');
        enhancedResponse += `\n\n📄 This relates to your documents: ${documentNames}.`;
      }
      
      // Add recommendations if available
      if (contextAssistance.recommendations && contextAssistance.recommendations.length > 0) {
        const topRecommendations = contextAssistance.recommendations.slice(0, 2);
        enhancedResponse += `\n\n💡 Recommendations: ${topRecommendations.join(' ')}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with document context:', error);
      return response; // Return original response if enhancement fails
    }
  };

  const isComplexQuery = (query) => {
    const complexIndicators = [
      'why', 'how', 'what if', 'explain', 'analyze', 'compare', 'contrast',
      'relationship', 'cause', 'effect', 'because', 'therefore', 'however',
      'complex', 'complicated', 'detailed', 'comprehensive', 'thorough'
    ];
    
    const queryLower = query.toLowerCase();
    return complexIndicators.some(indicator => queryLower.includes(indicator)) || query.length > 100;
  };

  const enhanceResponseWithReasoning = async (response, reasoningResult) => {
    try {
      let enhancedResponse = response;
      
      // Add reasoning insights
      if (reasoningResult.conclusions && reasoningResult.conclusions.ranked) {
        const topConclusion = reasoningResult.conclusions.ranked[0];
        if (topConclusion && topConclusion.confidence > 0.7) {
          enhancedResponse += `\n\n🧠 Advanced reasoning suggests: ${topConclusion.content}`;
        }
      }
      
      // Add reasoning confidence
      if (reasoningResult.confidence > 0.8) {
        enhancedResponse += `\n\n✨ High confidence reasoning (${Math.round(reasoningResult.confidence * 100)}%)`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with reasoning:', error);
      return response;
    }
  };

  const enhanceResponseWithPredictions = async (response, predictiveInsights) => {
    try {
      let enhancedResponse = response;
      
      // Add predictive insights
      if (predictiveInsights.predictions && predictiveInsights.predictions.userBehavior) {
        const behaviorPred = predictiveInsights.predictions.userBehavior;
        if (behaviorPred.nextActions && behaviorPred.nextActions.length > 0) {
          enhancedResponse += `\n\n🔮 Based on your patterns, you might want to: ${behaviorPred.nextActions.slice(0, 2).join(', ')}`;
        }
      }
      
      // Add engagement predictions
      if (predictiveInsights.predictions && predictiveInsights.predictions.engagement) {
        const engagementPred = predictiveInsights.predictions.engagement;
        if (engagementPred.sessionDuration > 300) {
          enhancedResponse += `\n\n⏱️ You might find this topic engaging for ${Math.round(engagementPred.sessionDuration / 60)} minutes`;
        }
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with predictions:', error);
      return response;
    }
  };

  const enhanceResponseWithPromptEngineering = async (response, promptEnhancement) => {
    try {
      let enhancedResponse = response;
      
      // Add prompt engineering insights
      if (promptEnhancement.analysis && promptEnhancement.analysis.clarity > 0.8) {
        enhancedResponse += `\n\n✨ Enhanced with advanced prompt engineering (${Math.round(promptEnhancement.analysis.clarity * 100)}% clarity)`;
      }
      
      // Add instruction insights
      if (promptEnhancement.instructions && Object.keys(promptEnhancement.instructions).length > 0) {
        const instructionTypes = Object.keys(promptEnhancement.instructions).filter(key => 
          promptEnhancement.instructions[key] && promptEnhancement.instructions[key].length > 0
        );
        if (instructionTypes.length > 0) {
          enhancedResponse += `\n\n📋 Instructions parsed: ${instructionTypes.join(', ')}`;
        }
      }
      
      // Add targeting insights
      if (promptEnhancement.targeting && promptEnhancement.targeting.audience) {
        enhancedResponse += `\n\n🎯 Targeted for: ${promptEnhancement.targeting.audience}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with prompt engineering:', error);
      return response;
    }
  };

  const enhanceResponseWithContextOptimization = async (response, contextOptimization) => {
    try {
      let enhancedResponse = response;
      
      // Add context optimization insights
      if (contextOptimization.analysis && contextOptimization.analysis.analysis) {
        const analysis = contextOptimization.analysis.analysis;
        if (analysis.relevance > 0.8) {
          enhancedResponse += `\n\n🎯 Context optimized for relevance (${Math.round(analysis.relevance * 100)}%)`;
        }
        if (analysis.completeness > 0.8) {
          enhancedResponse += `\n\n📊 Context completeness: ${Math.round(analysis.completeness * 100)}%`;
        }
        if (analysis.clarity > 0.8) {
          enhancedResponse += `\n\n💡 Context clarity: ${Math.round(analysis.clarity * 100)}%`;
        }
      }
      
      // Add optimization improvements
      if (contextOptimization.improvements && contextOptimization.improvements.length > 0) {
        const topImprovements = contextOptimization.improvements.slice(0, 2);
        enhancedResponse += `\n\n⚡ Optimizations: ${topImprovements.join(', ')}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with context optimization:', error);
      return response;
    }
  };

  const enhanceResponseWithRelevantExamples = async (response, relevantExamples) => {
    try {
      let enhancedResponse = response;
      
      // Add relevant examples
      if (relevantExamples.length > 0) {
        enhancedResponse += `\n\n📚 Relevant Examples:`;
        
        for (let i = 0; i < Math.min(2, relevantExamples.length); i++) {
          const example = relevantExamples[i];
          enhancedResponse += `\n\n${i + 1}. **${example.query}**`;
          enhancedResponse += `\n   Category: ${example.category} | Difficulty: ${example.difficulty}`;
          enhancedResponse += `\n   Relevance: ${Math.round(example.relevanceScore * 100)}%`;
          
          if (example.examples && example.examples.length > 0) {
            enhancedResponse += `\n   Examples: ${example.examples.slice(0, 2).join(', ')}`;
          }
        }
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with relevant examples:', error);
      return response;
    }
  };

  const enhanceResponseWithSearchSuggestions = async (response, searchSuggestions) => {
    try {
      let enhancedResponse = response;
      
      // Add search suggestions
      if (searchSuggestions.length > 0) {
        enhancedResponse += `\n\n🔍 Search Suggestions:`;
        
        for (let i = 0; i < Math.min(3, searchSuggestions.length); i++) {
          const suggestion = searchSuggestions[i];
          enhancedResponse += `\n\n${i + 1}. **${suggestion.query}**`;
          enhancedResponse += `\n   Type: ${suggestion.type}`;
          
          if (suggestion.originalWord && suggestion.replacement) {
            enhancedResponse += `\n   Variation: "${suggestion.originalWord}" → "${suggestion.replacement}"`;
          }
          
          if (suggestion.domain) {
            enhancedResponse += `\n   Domain: ${suggestion.domain}`;
          }
        }
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with search suggestions:', error);
      return response;
    }
  };

  const enhanceResponseWithFollowUpProcessing = async (response, followUpProcessing) => {
    try {
      let enhancedResponse = response;
      
      // Add follow-up processing insights
      if (followUpProcessing.analysis) {
        const analysis = followUpProcessing.analysis;
        enhancedResponse += `\n\n🔄 Follow-up Processing:`;
        enhancedResponse += `\n   Type: ${analysis.followUpType}`;
        enhancedResponse += `\n   Topic Relevance: ${Math.round(analysis.topicRelevance * 100)}%`;
        enhancedResponse += `\n   Depth Level: ${analysis.depthLevel}`;
        
        if (analysis.contextDependencies.length > 0) {
          enhancedResponse += `\n   Context Dependencies: ${analysis.contextDependencies.join(', ')}`;
        }
        
        if (analysis.explorationDirection) {
          enhancedResponse += `\n   Exploration Direction: ${analysis.explorationDirection}`;
        }
      }
      
      // Add context resolution insights
      if (followUpProcessing.contextResolution) {
        const resolution = followUpProcessing.contextResolution;
        if (resolution.resolvedReferences.length > 0) {
          enhancedResponse += `\n\n🔗 Context Resolution:`;
          for (const ref of resolution.resolvedReferences.slice(0, 2)) {
            enhancedResponse += `\n   "${ref.original}" → "${ref.resolved}" (${ref.type})`;
          }
        }
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with follow-up processing:', error);
      return response;
    }
  };

  const enhanceResponseWithConversationContext = async (response, conversationContext) => {
    try {
      let enhancedResponse = response;
      
      // Add conversation context insights
      if (conversationContext.memoryExtraction) {
        const extraction = conversationContext.memoryExtraction;
        enhancedResponse += `\n\n🧠 Conversation Context:`;
        
        if (extraction.topics.length > 0) {
          enhancedResponse += `\n   Topics: ${extraction.topics.slice(0, 3).join(', ')}`;
        }
        
        if (extraction.entities.length > 0) {
          enhancedResponse += `\n   Entities: ${extraction.entities.slice(0, 3).join(', ')}`;
        }
        
        if (extraction.keyPoints.length > 0) {
          enhancedResponse += `\n   Key Points: ${extraction.keyPoints.length} identified`;
        }
        
        if (extraction.relationships.length > 0) {
          enhancedResponse += `\n   Relationships: ${extraction.relationships.length} identified`;
        }
      }
      
      // Add memory organization insights
      if (conversationContext.memoryOrganization) {
        const organization = conversationContext.memoryOrganization;
        enhancedResponse += `\n\n📚 Memory Organization:`;
        
        if (organization.shortTermOrganization) {
          enhancedResponse += `\n   Short-term: ${organization.shortTermOrganization.length} items`;
        }
        
        if (organization.longTermOrganization) {
          enhancedResponse += `\n   Long-term: ${organization.longTermOrganization.length} items`;
        }
        
        if (organization.episodicOrganization) {
          enhancedResponse += `\n   Episodic: ${organization.episodicOrganization.length} events`;
        }
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with conversation context:', error);
      return response;
    }
  };

  const enhanceResponseWithTopicExploration = async (response, topicExploration) => {
    try {
      let enhancedResponse = response;
      
      // Add topic exploration insights
      if (topicExploration.explorationPath) {
        const path = topicExploration.explorationPath;
        enhancedResponse += `\n\n🔍 Topic Exploration:`;
        enhancedResponse += `\n   Current Level: ${path.currentLevel}`;
        enhancedResponse += `\n   Target Level: ${path.targetLevel}`;
        enhancedResponse += `\n   Exploration Steps: ${path.explorationSteps.length}`;
        
        if (path.deepeningAreas.length > 0) {
          enhancedResponse += `\n   Deepening Areas: ${path.deepeningAreas.slice(0, 2).join(', ')}`;
        }
        
        if (path.breadthAreas.length > 0) {
          enhancedResponse += `\n   Breadth Areas: ${path.breadthAreas.slice(0, 2).join(', ')}`;
        }
      }
      
      // Add deepening opportunities
      if (topicExploration.deepeningOpportunities.length > 0) {
        enhancedResponse += `\n\n📈 Deepening Opportunities:`;
        for (let i = 0; i < Math.min(2, topicExploration.deepeningOpportunities.length); i++) {
          const opportunity = topicExploration.deepeningOpportunities[i];
          enhancedResponse += `\n   ${i + 1}. ${opportunity.description} (${opportunity.depth} level)`;
        }
      }
      
      // Add related topics
      if (topicExploration.relatedTopics.length > 0) {
        enhancedResponse += `\n\n🔗 Related Topics:`;
        for (let i = 0; i < Math.min(3, topicExploration.relatedTopics.length); i++) {
          const topic = topicExploration.relatedTopics[i];
          enhancedResponse += `\n   ${i + 1}. ${topic.name || topic}`;
        }
      }
      
      // Add exploration suggestions
      if (topicExploration.explorationSuggestions.length > 0) {
        enhancedResponse += `\n\n💡 Exploration Suggestions:`;
        for (let i = 0; i < Math.min(2, topicExploration.explorationSuggestions.length); i++) {
          const suggestion = topicExploration.explorationSuggestions[i];
          enhancedResponse += `\n   ${i + 1}. ${suggestion}`;
        }
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with topic exploration:', error);
      return response;
    }
  };

  const enhanceResponseWithConversationIntelligence = async (response, conversationIntelligence) => {
    try {
      let enhancedResponse = response;
      
      // Add contextual intelligence insights
      if (conversationIntelligence.contextualIntelligence) {
        const contextual = conversationIntelligence.contextualIntelligence;
        enhancedResponse += `\n\n🧠 Contextual Intelligence:`;
        enhancedResponse += `\n   Context Relevance: ${Math.round(contextual.contextRelevance * 100)}%`;
        enhancedResponse += `\n   Context Completeness: ${Math.round(contextual.contextCompleteness * 100)}%`;
        enhancedResponse += `\n   Context Coherence: ${Math.round(contextual.contextCoherence * 100)}%`;
        
        if (contextual.contextGaps.length > 0) {
          enhancedResponse += `\n   Context Gaps: ${contextual.contextGaps.slice(0, 2).join(', ')}`;
        }
      }
      
      // Add emotional intelligence insights
      if (conversationIntelligence.emotionalIntelligence) {
        const emotional = conversationIntelligence.emotionalIntelligence;
        enhancedResponse += `\n\n😊 Emotional Intelligence:`;
        enhancedResponse += `\n   Emotion Detection: ${emotional.emotionDetection ? 'Active' : 'Inactive'}`;
        enhancedResponse += `\n   Emotional Context: ${emotional.emotionalContext ? 'Analyzed' : 'Not analyzed'}`;
        enhancedResponse += `\n   Emotional Progression: ${emotional.emotionalProgression ? 'Tracked' : 'Not tracked'}`;
      }
      
      // Add social intelligence insights
      if (conversationIntelligence.socialIntelligence) {
        const social = conversationIntelligence.socialIntelligence;
        enhancedResponse += `\n\n👥 Social Intelligence:`;
        enhancedResponse += `\n   Social Context: ${social.socialContext ? 'Analyzed' : 'Not analyzed'}`;
        enhancedResponse += `\n   Social Dynamics: ${social.socialDynamics ? 'Tracked' : 'Not tracked'}`;
        enhancedResponse += `\n   Social Cues: ${social.socialCues ? 'Identified' : 'Not identified'}`;
      }
      
      // Add cognitive intelligence insights
      if (conversationIntelligence.cognitiveIntelligence) {
        const cognitive = conversationIntelligence.cognitiveIntelligence;
        enhancedResponse += `\n\n🧩 Cognitive Intelligence:`;
        enhancedResponse += `\n   Cognitive Load: ${Math.round(cognitive.cognitiveLoad * 100)}%`;
        enhancedResponse += `\n   Cognitive Complexity: ${Math.round(cognitive.cognitiveComplexity * 100)}%`;
        enhancedResponse += `\n   Cognitive Patterns: ${cognitive.cognitivePatterns ? 'Identified' : 'Not identified'}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with conversation intelligence:', error);
      return response;
    }
  };

  const enhanceResponseWithPerformanceOptimization = async (response, performanceOptimization) => {
    try {
      let enhancedResponse = response;
      
      // Add performance optimization insights
      enhancedResponse += `\n\n⚡ Performance Optimization:`;
      enhancedResponse += `\n   Response Time: ${performanceOptimization.responseTime}ms`;
      enhancedResponse += `\n   Memory Usage: ${Math.round(performanceOptimization.memoryUsage * 100)}%`;
      enhancedResponse += `\n   Cache Performance: ${Math.round(performanceOptimization.cachePerformance * 100)}%`;
      enhancedResponse += `\n   Context Retrieval: ${performanceOptimization.contextRetrievalTime}ms`;
      enhancedResponse += `\n   Prediction Accuracy: ${Math.round(performanceOptimization.predictionAccuracy * 100)}%`;
      enhancedResponse += `\n   Optimization Efficiency: ${Math.round(performanceOptimization.optimizationEfficiency * 100)}%`;
      enhancedResponse += `\n   Conversation Flow: ${Math.round(performanceOptimization.conversationFlow * 100)}%`;
      enhancedResponse += `\n   User Satisfaction: ${Math.round(performanceOptimization.userSatisfaction * 100)}%`;
      enhancedResponse += `\n   System Load: ${Math.round(performanceOptimization.systemLoad * 100)}%`;
      enhancedResponse += `\n   Error Rate: ${Math.round(performanceOptimization.errorRate * 100)}%`;
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with performance optimization:', error);
      return response;
    }
  };

  const enhanceResponseWithAdvancedFeatures = async (response, advancedFeatures) => {
    try {
      let enhancedResponse = response;
      
      // Add intelligent routing insights
      if (advancedFeatures.intelligentRouting) {
        const routing = advancedFeatures.intelligentRouting;
        enhancedResponse += `\n\n🎯 Intelligent Routing:`;
        enhancedResponse += `\n   Route Analysis: ${routing.routeAnalysis ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Route Optimization: ${routing.routeOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Route Validation: ${routing.routeValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Route Prediction: ${routing.routePrediction ? 'Active' : 'Inactive'}`;
      }
      
      // Add adaptive responses insights
      if (advancedFeatures.adaptiveResponses) {
        const adaptation = advancedFeatures.adaptiveResponses;
        enhancedResponse += `\n\n🔄 Adaptive Responses:`;
        enhancedResponse += `\n   Adaptation Analysis: ${adaptation.adaptationAnalysis ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Adaptation Optimization: ${adaptation.adaptationOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Adaptation Validation: ${adaptation.adaptationValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Adaptation Prediction: ${adaptation.adaptationPrediction ? 'Active' : 'Inactive'}`;
      }
      
      // Add predictive context insights
      if (advancedFeatures.predictiveContext) {
        const prediction = advancedFeatures.predictiveContext;
        enhancedResponse += `\n\n🔮 Predictive Context:`;
        enhancedResponse += `\n   Prediction Analysis: ${prediction.predictionAnalysis ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Prediction Optimization: ${prediction.predictionOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Prediction Validation: ${prediction.predictionValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Prediction Accuracy: ${Math.round(prediction.predictionAccuracy * 100)}%`;
      }
      
      // Add conversation analytics insights
      if (advancedFeatures.conversationAnalytics) {
        const analytics = advancedFeatures.conversationAnalytics;
        enhancedResponse += `\n\n📊 Conversation Analytics:`;
        enhancedResponse += `\n   Analytics Analysis: ${analytics.analyticsAnalysis ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Analytics Optimization: ${analytics.analyticsOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Analytics Validation: ${analytics.analyticsValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Analytics Prediction: ${analytics.analyticsPrediction ? 'Active' : 'Inactive'}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with advanced features:', error);
      return response;
    }
  };

  const enhanceResponseWithDomainKnowledge = async (response, domainKnowledge) => {
    try {
      let enhancedResponse = response;
      
      // Add domain identification insights
      if (domainKnowledge.domainIdentification) {
        const domain = domainKnowledge.domainIdentification;
        enhancedResponse += `\n\n🏢 Domain Knowledge:`;
        enhancedResponse += `\n   Primary Domain: ${domain.primaryDomain}`;
        enhancedResponse += `\n   Domain Confidence: ${Math.round(domain.domainConfidence * 100)}%`;
        enhancedResponse += `\n   Domain Specificity: ${Math.round(domain.domainSpecificity * 100)}%`;
        enhancedResponse += `\n   Domain Complexity: ${Math.round(domain.domainComplexity * 100)}%`;
        enhancedResponse += `\n   Domain Relevance: ${Math.round(domain.domainRelevance * 100)}%`;
        
        if (domain.secondaryDomains.length > 0) {
          enhancedResponse += `\n   Secondary Domains: ${domain.secondaryDomains.slice(0, 3).join(', ')}`;
        }
      }
      
      // Add structure analysis insights
      if (domainKnowledge.structureAnalysis) {
        const structure = domainKnowledge.structureAnalysis;
        enhancedResponse += `\n\n🏗️ Structure Analysis:`;
        enhancedResponse += `\n   Structure Type: ${structure.structureType}`;
        enhancedResponse += `\n   Structure Depth: ${Math.round(structure.structureDepth * 100)}%`;
        enhancedResponse += `\n   Structure Breadth: ${Math.round(structure.structureBreadth * 100)}%`;
        enhancedResponse += `\n   Structure Complexity: ${Math.round(structure.structureComplexity * 100)}%`;
        enhancedResponse += `\n   Structure Coherence: ${Math.round(structure.structureCoherence * 100)}%`;
      }
      
      // Add terminology analysis insights
      if (domainKnowledge.terminologyAnalysis) {
        const terminology = domainKnowledge.terminologyAnalysis;
        enhancedResponse += `\n\n📚 Terminology Analysis:`;
        enhancedResponse += `\n   Terminology Extraction: ${terminology.terminologyExtraction ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Terminology Classification: ${terminology.terminologyClassification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Terminology Relationships: ${terminology.terminologyRelationships ? 'Mapped' : 'Not mapped'}`;
        enhancedResponse += `\n   Terminology Context: ${terminology.terminologyContext ? 'Analyzed' : 'Not analyzed'}`;
      }
      
      // Add relationship analysis insights
      if (domainKnowledge.relationshipAnalysis) {
        const relationships = domainKnowledge.relationshipAnalysis;
        enhancedResponse += `\n\n🔗 Relationship Analysis:`;
        enhancedResponse += `\n   Relationship Identification: ${relationships.relationshipIdentification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Relationship Types: ${relationships.relationshipTypes ? 'Classified' : 'Not classified'}`;
        enhancedResponse += `\n   Relationship Strength: ${Math.round(relationships.relationshipStrength * 100)}%`;
        enhancedResponse += `\n   Relationship Context: ${relationships.relationshipContext ? 'Analyzed' : 'Not analyzed'}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with domain knowledge:', error);
      return response;
    }
  };

  const enhanceResponseWithReferenceGuide = async (response, referenceGuide) => {
    try {
      let enhancedResponse = response;
      
      // Add domain guide insights
      if (referenceGuide.domainGuide) {
        const domainGuide = referenceGuide.domainGuide;
        enhancedResponse += `\n\n📖 Reference Guide:`;
        enhancedResponse += `\n   Domain Overview: ${domainGuide.domainOverview ? 'Generated' : 'Not generated'}`;
        enhancedResponse += `\n   Domain Structure: ${domainGuide.domainStructure ? 'Mapped' : 'Not mapped'}`;
        enhancedResponse += `\n   Domain Terminology: ${domainGuide.domainTerminology ? 'Defined' : 'Not defined'}`;
        enhancedResponse += `\n   Domain Relationships: ${domainGuide.domainRelationships ? 'Identified' : 'Not identified'}`;
        enhancedResponse += `\n   Domain Context: ${domainGuide.domainContext ? 'Analyzed' : 'Not analyzed'}`;
        enhancedResponse += `\n   Domain Validation: ${domainGuide.domainValidation ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Domain Best Practices: ${domainGuide.domainBestPractices ? 'Identified' : 'Not identified'}`;
        enhancedResponse += `\n   Domain Troubleshooting: ${domainGuide.domainTroubleshooting ? 'Available' : 'Not available'}`;
        enhancedResponse += `\n   Domain Examples: ${domainGuide.domainExamples ? 'Provided' : 'Not provided'}`;
      }
      
      // Add structure guide insights
      if (referenceGuide.structureGuide) {
        const structureGuide = referenceGuide.structureGuide;
        enhancedResponse += `\n\n🏗️ Structure Guide:`;
        enhancedResponse += `\n   Structure Overview: ${structureGuide.structureOverview ? 'Generated' : 'Not generated'}`;
        enhancedResponse += `\n   Structure Types: ${structureGuide.structureTypes ? 'Defined' : 'Not defined'}`;
        enhancedResponse += `\n   Structure Mapping: ${structureGuide.structureMapping ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Structure Validation: ${structureGuide.structureValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Structure Optimization: ${structureGuide.structureOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Structure Best Practices: ${structureGuide.structureBestPractices ? 'Identified' : 'Not identified'}`;
        enhancedResponse += `\n   Structure Troubleshooting: ${structureGuide.structureTroubleshooting ? 'Available' : 'Not available'}`;
        enhancedResponse += `\n   Structure Examples: ${structureGuide.structureExamples ? 'Provided' : 'Not provided'}`;
      }
      
      // Add terminology guide insights
      if (referenceGuide.terminologyGuide) {
        const terminologyGuide = referenceGuide.terminologyGuide;
        enhancedResponse += `\n\n📚 Terminology Guide:`;
        enhancedResponse += `\n   Terminology Overview: ${terminologyGuide.terminologyOverview ? 'Generated' : 'Not generated'}`;
        enhancedResponse += `\n   Terminology Dictionary: ${terminologyGuide.terminologyDictionary ? 'Created' : 'Not created'}`;
        enhancedResponse += `\n   Terminology Relationships: ${terminologyGuide.terminologyRelationships ? 'Mapped' : 'Not mapped'}`;
        enhancedResponse += `\n   Terminology Context: ${terminologyGuide.terminologyContext ? 'Analyzed' : 'Not analyzed'}`;
        enhancedResponse += `\n   Terminology Validation: ${terminologyGuide.terminologyValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Terminology Best Practices: ${terminologyGuide.terminologyBestPractices ? 'Identified' : 'Not identified'}`;
        enhancedResponse += `\n   Terminology Troubleshooting: ${terminologyGuide.terminologyTroubleshooting ? 'Available' : 'Not available'}`;
        enhancedResponse += `\n   Terminology Examples: ${terminologyGuide.terminologyExamples ? 'Provided' : 'Not provided'}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with reference guide:', error);
      return response;
    }
  };

  const enhanceResponseWithPersonaNeeds = async (response, personaNeeds) => {
    try {
      let enhancedResponse = response;
      
      // Add persona identification insights
      if (personaNeeds.personaIdentification) {
        const persona = personaNeeds.personaIdentification;
        enhancedResponse += `\n\n👤 Persona Analysis:`;
        enhancedResponse += `\n   Primary Persona: ${persona.primaryPersona}`;
        enhancedResponse += `\n   Persona Confidence: ${Math.round(persona.personaConfidence * 100)}%`;
        enhancedResponse += `\n   Persona Specificity: ${Math.round(persona.personaSpecificity * 100)}%`;
        enhancedResponse += `\n   Persona Complexity: ${Math.round(persona.personaComplexity * 100)}%`;
        enhancedResponse += `\n   Persona Relevance: ${Math.round(persona.personaRelevance * 100)}%`;
        
        if (persona.secondaryPersonas.length > 0) {
          enhancedResponse += `\n   Secondary Personas: ${persona.secondaryPersonas.slice(0, 3).join(', ')}`;
        }
      }
      
      // Add personality analysis insights
      if (personaNeeds.personalityAnalysis) {
        const personality = personaNeeds.personalityAnalysis;
        enhancedResponse += `\n\n🧠 Personality Analysis:`;
        enhancedResponse += `\n   Personality Traits: ${personality.personalityTraits ? 'Extracted' : 'Not extracted'}`;
        enhancedResponse += `\n   Personality Classification: ${personality.personalityClassification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Personality Consistency: ${Math.round(personality.personalityConsistency * 100)}%`;
        enhancedResponse += `\n   Personality Adaptation: ${personality.personalityAdaptation ? 'Assessed' : 'Not assessed'}`;
      }
      
      // Add tone analysis insights
      if (personaNeeds.toneAnalysis) {
        const tone = personaNeeds.toneAnalysis;
        enhancedResponse += `\n\n🎵 Tone Analysis:`;
        enhancedResponse += `\n   Tone Identification: ${tone.toneIdentification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Tone Classification: ${tone.toneClassification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Tone Consistency: ${Math.round(tone.toneConsistency * 100)}%`;
        enhancedResponse += `\n   Tone Adaptation: ${tone.toneAdaptation ? 'Assessed' : 'Not assessed'}`;
      }
      
      // Add style analysis insights
      if (personaNeeds.styleAnalysis) {
        const style = personaNeeds.styleAnalysis;
        enhancedResponse += `\n\n🎨 Style Analysis:`;
        enhancedResponse += `\n   Style Identification: ${style.styleIdentification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Style Classification: ${style.styleClassification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Style Consistency: ${Math.round(style.styleConsistency * 100)}%`;
        enhancedResponse += `\n   Style Adaptation: ${style.styleAdaptation ? 'Assessed' : 'Not assessed'}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with persona needs:', error);
      return response;
    }
  };

  const enhanceResponseWithPersonaAdaptation = async (response, personaAdaptation) => {
    try {
      let enhancedResponse = response;
      
      // Add persona selection insights
      if (personaAdaptation.personaSelection) {
        const selection = personaAdaptation.personaSelection;
        enhancedResponse += `\n\n🎭 Persona Adaptation:`;
        enhancedResponse += `\n   Selected Persona: ${selection.primaryPersona}`;
        enhancedResponse += `\n   Persona Confidence: ${Math.round(selection.personaConfidence * 100)}%`;
        enhancedResponse += `\n   Persona Rationale: ${selection.personaRationale}`;
        enhancedResponse += `\n   Persona Adaptation: ${selection.personaAdaptation ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Persona Validation: ${selection.personaValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Persona Optimization: ${selection.personaOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Persona Enhancement: ${selection.personaEnhancement ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Persona Prediction: ${selection.personaPrediction ? 'Active' : 'Inactive'}`;
      }
      
      // Add personality adaptation insights
      if (personaAdaptation.personalityAdaptation) {
        const personality = personaAdaptation.personalityAdaptation;
        enhancedResponse += `\n\n🧠 Personality Adaptation:`;
        enhancedResponse += `\n   Personality Traits: ${personality.personalityTraits ? 'Extracted' : 'Not extracted'}`;
        enhancedResponse += `\n   Personality Adjustment: ${personality.personalityAdjustment ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Personality Consistency: ${Math.round(personality.personalityConsistency * 100)}%`;
        enhancedResponse += `\n   Personality Validation: ${personality.personalityValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Personality Optimization: ${personality.personalityOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Personality Enhancement: ${personality.personalityEnhancement ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Personality Prediction: ${personality.personalityPrediction ? 'Active' : 'Inactive'}`;
        enhancedResponse += `\n   Personality Metrics: ${personality.personalityMetrics ? 'Calculated' : 'Not calculated'}`;
      }
      
      // Add tone adaptation insights
      if (personaAdaptation.toneAdaptation) {
        const tone = personaAdaptation.toneAdaptation;
        enhancedResponse += `\n\n🎵 Tone Adaptation:`;
        enhancedResponse += `\n   Tone Identification: ${tone.toneIdentification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Tone Adjustment: ${tone.toneAdjustment ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Tone Consistency: ${Math.round(tone.toneConsistency * 100)}%`;
        enhancedResponse += `\n   Tone Validation: ${tone.toneValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Tone Optimization: ${tone.toneOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Tone Enhancement: ${tone.toneEnhancement ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Tone Prediction: ${tone.tonePrediction ? 'Active' : 'Inactive'}`;
        enhancedResponse += `\n   Tone Metrics: ${tone.toneMetrics ? 'Calculated' : 'Not calculated'}`;
      }
      
      // Add style adaptation insights
      if (personaAdaptation.styleAdaptation) {
        const style = personaAdaptation.styleAdaptation;
        enhancedResponse += `\n\n🎨 Style Adaptation:`;
        enhancedResponse += `\n   Style Identification: ${style.styleIdentification ? 'Completed' : 'Not completed'}`;
        enhancedResponse += `\n   Style Adjustment: ${style.styleAdjustment ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Style Consistency: ${Math.round(style.styleConsistency * 100)}%`;
        enhancedResponse += `\n   Style Validation: ${style.styleValidation ? 'Passed' : 'Failed'}`;
        enhancedResponse += `\n   Style Optimization: ${style.styleOptimization ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Style Enhancement: ${style.styleEnhancement ? 'Applied' : 'Not applied'}`;
        enhancedResponse += `\n   Style Prediction: ${style.stylePrediction ? 'Active' : 'Inactive'}`;
        enhancedResponse += `\n   Style Metrics: ${style.styleMetrics ? 'Calculated' : 'Not calculated'}`;
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with persona adaptation:', error);
      return response;
    }
  };

  const enhanceResponseWithWebResearch = async (response, webResearch) => {
    try {
      let enhancedResponse = response;
      
      // Add web research summary
      if (webResearch.summary) {
        enhancedResponse += `\n\n🔍 Web Research Summary:`;
        enhancedResponse += `\n   ${webResearch.summary}`;
      }
      
      // Add key findings
      if (webResearch.keyFindings && webResearch.keyFindings.length > 0) {
        enhancedResponse += `\n\n📊 Key Findings:`;
        webResearch.keyFindings.slice(0, 3).forEach((finding, index) => {
          enhancedResponse += `\n   ${index + 1}. ${finding.finding}`;
          enhancedResponse += `\n      Source: ${finding.source} (${Math.round(finding.credibility * 100)}% credibility)`;
        });
      }
      
      // Add research statistics
      if (webResearch.statistics) {
        const stats = webResearch.statistics;
        enhancedResponse += `\n\n📈 Research Statistics:`;
        enhancedResponse += `\n   Total Sources: ${stats.totalSources}`;
        enhancedResponse += `\n   Credible Sources: ${stats.credibleSources}`;
        enhancedResponse += `\n   Average Credibility: ${Math.round(stats.averageCredibility * 100)}%`;
        enhancedResponse += `\n   Average Freshness: ${Math.round(stats.averageFreshness * 100)}%`;
        enhancedResponse += `\n   Research Depth: ${stats.researchDepth}`;
        enhancedResponse += `\n   Time to Complete: ${stats.timeToComplete}ms`;
      }
      
      // Add fact check results
      if (webResearch.factCheck) {
        const factCheck = webResearch.factCheck;
        enhancedResponse += `\n\n✅ Fact Check:`;
        enhancedResponse += `\n   Consistency: ${Math.round(factCheck.consistency * 100)}%`;
        enhancedResponse += `\n   Verification: ${Math.round(factCheck.verification * 100)}%`;
        enhancedResponse += `\n   Confidence: ${Math.round(factCheck.confidence * 100)}%`;
        if (factCheck.contradictions && factCheck.contradictions.length > 0) {
          enhancedResponse += `\n   Contradictions: ${factCheck.contradictions.length} found`;
        }
      }
      
      // Add trends
      if (webResearch.trends && webResearch.trends.length > 0) {
        enhancedResponse += `\n\n📈 Trends:`;
        webResearch.trends.slice(0, 2).forEach(trend => {
          enhancedResponse += `\n   • ${trend}`;
        });
      }
      
      // Add sources
      if (webResearch.sources && webResearch.sources.length > 0) {
        enhancedResponse += `\n\n📚 Sources:`;
        webResearch.sources.slice(0, 3).forEach((source, index) => {
          enhancedResponse += `\n   ${index + 1}. ${source.title} (${source.domain})`;
          enhancedResponse += `\n      Credibility: ${Math.round(source.credibility * 100)}%`;
        });
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with web research:', error);
      return response;
    }
  };

  const enhanceResponseWithQuestionAnswer = async (response, questionAnswer) => {
    try {
      let enhancedResponse = response;
      
      // Add question classification
      if (questionAnswer.questionClassification) {
        const classification = questionAnswer.questionClassification;
        enhancedResponse += `\n\n❓ Question Analysis:`;
        enhancedResponse += `\n   Question Type: ${classification.questionType}`;
        enhancedResponse += `\n   Domain: ${classification.domain}`;
        enhancedResponse += `\n   Complexity: ${Math.round(classification.complexity * 100)}%`;
        enhancedResponse += `\n   Time Sensitivity: ${classification.timeSensitivity ? 'Yes' : 'No'}`;
        enhancedResponse += `\n   Answer Format: ${classification.answerFormat}`;
      }
      
      // Add answer strategy
      if (questionAnswer.answerStrategy) {
        const strategy = questionAnswer.answerStrategy;
        enhancedResponse += `\n\n🎯 Answer Strategy:`;
        enhancedResponse += `\n   Answer Type: ${strategy.answerType}`;
        enhancedResponse += `\n   Format: ${strategy.format}`;
        enhancedResponse += `\n   Requires Research: ${strategy.requiresResearch ? 'Yes' : 'No'}`;
        enhancedResponse += `\n   Research Depth: ${strategy.researchDepth}`;
        enhancedResponse += `\n   Answer Length: ${strategy.answerLength}`;
        enhancedResponse += `\n   Include Examples: ${strategy.includeExamples ? 'Yes' : 'No'}`;
        enhancedResponse += `\n   Include Statistics: ${strategy.includeStatistics ? 'Yes' : 'No'}`;
        enhancedResponse += `\n   Include Sources: ${strategy.includeSources ? 'Yes' : 'No'}`;
      }
      
      // Add answer details
      if (questionAnswer.answer) {
        const answer = questionAnswer.answer;
        enhancedResponse += `\n\n💡 Answer Details:`;
        enhancedResponse += `\n   Confidence: ${Math.round(answer.confidence * 100)}%`;
        enhancedResponse += `\n   Answer Type: ${answer.type}`;
        enhancedResponse += `\n   Format: ${answer.format}`;
        enhancedResponse += `\n   Sources Used: ${answer.sources ? answer.sources.length : 0}`;
        enhancedResponse += `\n   Examples: ${answer.examples ? answer.examples.length : 0}`;
        enhancedResponse += `\n   Statistics: ${answer.statistics ? answer.statistics.length : 0}`;
        
        if (answer.metadata) {
          enhancedResponse += `\n   Research Used: ${answer.metadata.researchUsed ? 'Yes' : 'No'}`;
          enhancedResponse += `\n   Sources Count: ${answer.metadata.sourcesCount}`;
        }
      }
      
      // Add validation results
      if (questionAnswer.validation) {
        const validation = questionAnswer.validation;
        enhancedResponse += `\n\n✅ Answer Validation:`;
        enhancedResponse += `\n   Completeness: ${Math.round(validation.completeness * 100)}%`;
        enhancedResponse += `\n   Accuracy: ${Math.round(validation.accuracy * 100)}%`;
        enhancedResponse += `\n   Relevance: ${Math.round(validation.relevance * 100)}%`;
        enhancedResponse += `\n   Clarity: ${Math.round(validation.clarity * 100)}%`;
        enhancedResponse += `\n   Consistency: ${Math.round(validation.consistency * 100)}%`;
        enhancedResponse += `\n   Overall: ${Math.round(validation.overall * 100)}%`;
        
        if (validation.sources) {
          enhancedResponse += `\n   Sources Valid: ${validation.sources.valid ? 'Yes' : 'No'}`;
          enhancedResponse += `\n   Sources Score: ${Math.round(validation.sources.score * 100)}%`;
        }
      }
      
      // Add follow-up questions
      if (questionAnswer.followUpQuestions && questionAnswer.followUpQuestions.length > 0) {
        enhancedResponse += `\n\n🔄 Follow-up Questions:`;
        questionAnswer.followUpQuestions.slice(0, 3).forEach((question, index) => {
          enhancedResponse += `\n   ${index + 1}. ${question}`;
        });
      }
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error enhancing response with question answer:', error);
      return response;
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setNewMessage(suggestion);
    handleSendMessage(suggestion);
  };

  // Suggest nearby commands when user types
  const handleChangeText = (text) => {
    setNewMessage(text);
    try {
      const cp = new _CP();
      if (text && text.length >= 3) {
        const suggestions = cp.getNearMissSuggestions(text, 3);
        if (suggestions && suggestions.length) {
          setSuggestions(suggestions);
        }
      }
    } catch (e) {}
  };

  const handleMessageAction = (action) => {
    if (!selectedMessage) return;

    switch (action) {
      case 'delete':
        Alert.alert(
          'Delete Message',
          'Are you sure you want to delete this message?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteMessage(selectedMessage.id),
            },
          ]
        );
        break;
      case 'reply':
        setNewMessage(`Replying to: ${selectedMessage.text}`);
        break;
      default:
        break;
    }
    setSelectedMessage(null);
  };

  const deleteMessage = async (messageId) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    await saveMessages(updatedMessages);
  };

  const simulateTyping = () => {
    if (Math.random() > 0.7 && messages.length > 0) {
      setIsTyping(true);
      typingAnimation.setValue(0);
      typingAnimation.start();
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleVariantPress = (variantText) => {
    setNewMessage(variantText);
  };

  const persistTaskHistory = async (plan, result, sourceItem) => {
    try {
      const raw = await getItem('motto_task_history');
      const history = raw ? JSON.parse(raw) : [];
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        success: !!result?.success,
        results: result?.results || [],
        plan,
        messageText: sourceItem?.text || '',
      };
      history.push(entry);
      // keep last 100 entries
      const limited = history.slice(-100);
      await setItem('motto_task_history', JSON.stringify(limited));
    } catch (e) {
      console.error('Failed to persist task history:', e);
    }
  };

  const confirmRunPlan = async (plan) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Run plan?',
        'This may perform changes like creating notes or reminders.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Run', style: 'default', onPress: () => resolve(true) },
        ]
      );
    });
  };

  const handleRunPlan = async (item) => {
    if (!item?.plan || item.plan.length === 0) return;
    const ok = await confirmRunPlan(item.plan);
    if (!ok) return;
    setIsRunningPlan(true);
    try {
      const ctx = { navigation, scheduleNotification };
      const result = await executePlan(item.plan, ctx);
      setLastPlanResults(result);
      await persistTaskHistory(item.plan, result, item);
      Alert.alert(result.success ? 'Plan completed' : 'Plan finished with issues');
      if (!result.success) {
        // Append a self-correction note from the bot
        const correction = {
          id: Date.now() + 2,
          text: 'Some steps failed. I can refine the plan or simulate first. Try “refine the plan” or “simulate plan”.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          status: 'sent',
          analysis: item.analysis,
        };
        const finalMessages = [...messages, correction];
        await saveMessages(finalMessages);
      }
    } catch (e) {
      Alert.alert('Plan failed', e?.message || 'Unknown error');
    } finally {
      setIsRunningPlan(false);
    }
  };

  const handleSimulatePlan = async (item) => {
    if (!item?.plan || item.plan.length === 0) return;
    const preview = item.plan.map((s, i) => `${i + 1}. ${s.label || s.action}`).join('\n');
    Alert.alert('Simulation', preview);
  };

  const openPlanEditor = (item) => {
    setEditingPlanMessageId(item.id);
    setEditingPlanDraft(item.plan || []);
  };

  const saveEditedPlan = async () => {
    try {
      const msgId = editingPlanMessageId;
      const updated = messages.map(m => {
        if (m.id === msgId) {
          return { ...m, plan: editingPlanDraft };
        }
        return m;
      });
      await saveMessages(updated);
      setEditingPlanMessageId(null);
      setEditingPlanDraft([]);
    } catch (e) {
      Alert.alert('Failed to save plan edits');
    }
  };

  const handleSaveToKnowledge = async (item) => {
    try {
      const title = (item.text || '').slice(0, 60);
      const tags = item?.analysis?.intent ? [item.analysis.intent] : [];
      await KnowledgeBaseService.addItem({ title, content: item.text || '', tags });
      Alert.alert('Saved to Knowledge');
    } catch (e) {
      Alert.alert('Save failed');
    }
  };

  const handleKnowledgePress = (k) => {
    setNewMessage(k.content || k.title || '');
  };

  const renderMessage = React.useCallback(({ item }) => (
    <>
      <MessageItem item={item} getSentimentColor={getSentimentColor} onVariantPress={handleVariantPress} onSave={handleSaveToKnowledge} onKnowledgePress={handleKnowledgePress} />
      {! (item.sender === 'user') && item.plan && item.plan.length > 0 && (
        <>
          <PlanControls onRun={() => handleRunPlan(item)} onSimulate={() => handleSimulatePlan(item)} disabled={isRunningPlan} />
          <View style={{ marginTop: 6 }}>
            <TouchableOpacity onPress={() => openPlanEditor(item)}>
              <Text style={{ color: colors.LIGHT_TEXT }}>Edit plan</Text>
            </TouchableOpacity>
          </View>
          {editingPlanMessageId === item.id && (
            <>
              <PlanEditor plan={editingPlanDraft} onChange={setEditingPlanDraft} onClose={() => setEditingPlanMessageId(null)} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveEditedPlan}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingPlanMessageId(null)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </>
  ), [getSentimentColor, isRunningPlan]);

  const getSentimentColor = React.useCallback((sentiment) => {
    switch (sentiment) {
      case 'positive': return colors.success;
      case 'negative': return colors.error;
      default: return colors.text;
    }
  }, []);

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Suggestions:</Text>
        <View style={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderVoiceControls = () => {
    if (!showVoiceControls) return null;

    return (
      <View style={styles.voiceControlsContainer}>
        <View style={styles.voiceStats}>
          <Text style={styles.voiceStatsText}>
            Confidence: {(confidence * 100).toFixed(1)}%
          </Text>
          <Text style={styles.voiceStatsText}>
            Commands: {commandHistory.length}
          </Text>
        </View>
        
        {/* Background Listening Status */}
        <View style={styles.backgroundListeningStatus}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Background Listening:</Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isBackgroundListening ? colors.success : colors.error }
            ]}>
              <Text style={styles.statusText}>
                {isBackgroundListening ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>
          
          {wakeWordDetected && (
            <View style={styles.wakeWordDetected}>
              <Text style={styles.wakeWordText}>🎯 Wake word detected!</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.backgroundToggleButton,
              { backgroundColor: backgroundListeningEnabled ? colors.success : colors.error }
            ]}
            onPress={handleToggleBackgroundListening}
          >
            <Text style={styles.backgroundToggleText}>
              {backgroundListeningEnabled ? 'Disable' : 'Enable'} Background Listening
            </Text>
          </TouchableOpacity>
        </View>
        
        {lastCommand && (
          <View style={styles.lastCommandContainer}>
            <Text style={styles.lastCommandLabel}>Last Command:</Text>
            <Text style={styles.lastCommandText}>{lastCommand.command}</Text>
            <Text style={styles.lastCommandScore}>
              Score: {(lastCommand.score * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAIInsights = () => {
    if (!aiInsights) return null;

    return (
      <Card style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>AI Insights</Text>
        <View style={styles.insightsContent}>
          <Text style={styles.insightText}>
            Total Interactions: {aiInsights.totalInteractions}
          </Text>
          <Text style={styles.insightText}>
            Most Common Intent: {Object.keys(aiInsights.commonIntents || {})[0] || 'N/A'}
          </Text>
          <Text style={styles.insightText}>
            Recent Sentiment: {aiInsights.sentimentTrend?.recent?.[aiInsights.sentimentTrend.recent.length - 1] || 'N/A'}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.lightBackground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with voice controls toggle */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
                        <TouchableOpacity
                          style={styles.voiceToggleButton}
                          onPress={() => setShowVoiceControls(!showVoiceControls)}
                        >
                          <Ionicons 
                            name="mic" 
                            size={24} 
                            color={showVoiceControls ? colors.primary : colors.text} 
                          />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.documentButton}
                          onPress={() => setShowDocumentUploader(true)}
                        >
                          <Ionicons 
                            name="document-text" 
                            size={24} 
                            color={colors.text} 
                          />
                        </TouchableOpacity>
          
          {/* Background Listening Indicator */}
          {isBackgroundListening && (
            <View style={styles.backgroundListeningIndicator}>
              <View style={styles.listeningDot} />
              <Text style={styles.listeningText}>Listening</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Enhanced Chat
        </Text>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('VoiceCommandSettings')}
        >
          <Ionicons name="settings" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Voice controls */}
      {renderVoiceControls()}

      {/* AI Insights */}
      {renderAIInsights()}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
      />

      {/* Suggestions */}
      {renderSuggestions()}

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>MOTTO is typing...</Text>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: isDark ? colors.darkCard : colors.lightCard,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={newMessage}
          onChangeText={handleChangeText}
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
        />
        
        <Animated.View
          style={[
            styles.voiceButton,
            {
              transform: [{ scale: voiceButtonScale }],
              opacity: voiceButtonOpacity,
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.voiceButtonInner,
              {
                backgroundColor: isListening ? colors.error : colors.primary,
              }
            ]}
            onPress={handleVoiceCommand}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons 
                name={isListening ? "stop" : "mic"} 
                size={24} 
                color="white" 
              />
            )}
          </TouchableOpacity>
        </Animated.View>
        
        {/* Test Voice Commands Button */}
        <TouchableOpacity
          style={styles.testVoiceButton}
          onPress={handleTestVoiceCommands}
        >
          <Text style={styles.testVoiceButtonText}>Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={() => handleSendMessage()}
          disabled={!newMessage.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Error display */}
      {(error || voiceError) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || voiceError}</Text>
        </View>
      )}
      
      {/* Document Uploader Modal */}
      {showDocumentUploader && (
        <Modal
          visible={showDocumentUploader}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <DocumentUploader
            onDocumentUploaded={(document) => {
              console.log('Document uploaded:', document.title);
              setShowDocumentUploader(false);
            }}
            onClose={() => setShowDocumentUploader(false)}
          />
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.OCEAN_BLUE,
    backgroundColor: colors.BLACK,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  voiceToggleButton: {
    padding: 8,
  },
  documentButton: {
    padding: 8,
    marginLeft: 8,
  },
  settingsButton: {
    padding: 8,
  },
  voiceControlsContainer: {
    padding: 16,
    backgroundColor: colors.lightCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  voiceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  voiceStatsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  lastCommandContainer: {
    backgroundColor: colors.primary + '20',
    padding: 8,
    borderRadius: 8,
  },
  lastCommandLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  lastCommandText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  lastCommandScore: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  insightsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.BLACK,
    borderWidth: 1,
    borderColor: colors.OCEAN_BLUE,
    borderRadius: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.LIGHT_TEXT,
    marginBottom: 8,
  },
  insightsContent: {
    gap: 4,
  },
  insightText: {
    fontSize: 14,
    color: colors.LIGHT_TEXT,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    backgroundColor: colors.BLACK,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.OCEAN_BLUE,
    borderWidth: 1,
    borderColor: colors.DARKER_BLUE,
  },
  botBubble: {
    backgroundColor: colors.DARKER_BLUE,
    borderWidth: 1,
    borderColor: colors.OCEAN_BLUE,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: colors.LIGHT_TEXT,
  },
  analysisContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.BLACK,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.OCEAN_BLUE,
  },
  messageActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  saveLink: {
    color: colors.LIGHT_TEXT,
    textDecorationLine: 'underline',
  },
  kbContainer: {
    marginTop: 8,
    backgroundColor: colors.BLACK,
    borderWidth: 1,
    borderColor: colors.OCEAN_BLUE,
    borderRadius: 10,
    padding: 8,
  },
  kbTitle: {
    color: colors.LIGHT_TEXT,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  kbItemTitle: { color: colors.LIGHT_TEXT },
  kbItemSnippet: { color: colors.LIGHT_TEXT, opacity: 0.8 },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  analysisLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  analysisValue: {
    fontSize: 12,
    color: colors.LIGHT_TEXT,
  },
  urgencyBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  urgencyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  suggestionsContainer: {
    padding: 16,
    backgroundColor: colors.BLACK,
    borderTopWidth: 1,
    borderTopColor: colors.OCEAN_BLUE,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.LIGHT_TEXT,
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: colors.OCEAN_BLUE + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.OCEAN_BLUE,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.LIGHT_TEXT,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  voiceButton: {
    marginBottom: 8,
  },
  voiceButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testVoiceButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  testVoiceButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  backgroundListeningStatus: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  wakeWordDetected: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  wakeWordText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  backgroundToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  backgroundToggleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backgroundListeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  listeningText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  humanLikeIndicator: {
    backgroundColor: colors.primary,
    padding: 6,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  humanLikeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emotionalToneText: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
  taskResultContainer: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  taskResultTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  taskResultText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  recommendationsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  recommendationsTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendationText: {
    color: 'white',
    fontSize: 11,
    marginBottom: 2,
  },
  insightsContainer: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  insightsTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  insightText: {
    color: 'white',
    fontSize: 11,
    marginBottom: 2,
  },
  qualityIndicator: {
    backgroundColor: colors.secondary,
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityScore: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  qualityLabel: {
    color: 'white',
    fontSize: 10,
    marginRight: 4,
  },
  refinementIndicator: {
    backgroundColor: colors.warning,
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  refinementText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  personalizationIndicator: {
    backgroundColor: colors.success,
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  personalizationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: colors.OCEAN_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderColor: colors.DARKER_BLUE,
    borderWidth: 1,
  },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderColor: colors.OCEAN_BLUE,
    borderWidth: 1,
  },
  cancelBtnText: { color: colors.LIGHT_TEXT, fontWeight: '600' },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
});

export default EnhancedChatScreen;
