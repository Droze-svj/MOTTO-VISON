/**
 * Master AI Service
 * Orchestrates all AI processing with 85+ sources and 100+ personalization dimensions
 */

import DrezyRecognitionService from './DrezyRecognitionService';
import MultilingualService from './MultilingualService';
import AdvancedCollectionService from './AdvancedCollectionService';
import UltraPersonalizationService from './UltraPersonalizationService';
import DeepPersonalizationService from './DeepPersonalizationService';
import ResponseVarietyService from './ResponseVarietyService';
import PerformanceService from './PerformanceService';
import OfflineAIService from './OfflineAIService';
import ContextMemoryService from './ContextMemoryService';
import EnhancedContextService from './EnhancedContextService';
import UserLearningService from './UserLearningService';
import FreeKnowledgeService from './FreeKnowledgeService';
import ExtendedKnowledgeService from './ExtendedKnowledgeService';
import ErrorHandlingService from './ErrorHandlingService';
import TaskUnderstandingService from '../intelligence/TaskUnderstandingService';
import ClarificationService from '../intelligence/ClarificationService';
import FileUnderstandingService from '../intelligence/FileUnderstandingService';
import ProactiveAssistantService from '../intelligence/ProactiveAssistantService';
import ContinuousImprovementService from '../intelligence/ContinuousImprovementService';
import CrossTaskIntegrationService from '../intelligence/CrossTaskIntegrationService';
import CommandExecutionService from '../actions/CommandExecutionService';
import AutomationService from '../actions/AutomationService';
import QuickActionsService from '../actions/QuickActionsService';

interface MasterResponse {
  text: string;
  sources: string[];
  personalizationApplied: string[];
  confidence: number;
  adaptations: {
    cognitive: string[];
    personality: string[];
    motivation: string[];
    expertise: string[];
  };
  learnedFrom: boolean;
  responseTime: number;
  suggestions?: string[];
}

export class MasterAIService {
  private static instance: MasterAIService;
  
  private constructor() {}
  
  static getInstance(): MasterAIService {
    if (!MasterAIService.instance) {
      MasterAIService.instance = new MasterAIService();
    }
    return MasterAIService.instance;
  }

  /**
   * Master AI chat processing - orchestrates all AI services for comprehensive response
   * 
   * Processing pipeline (7 phases):
   * 1. Language Detection: Detects user's language (100+ languages)
   * 2. Context Resolution: Resolves ambiguous input using conversation history
   * 3. Knowledge Collection: Searches 85+ free knowledge sources
   * 4. Response Generation: Creates base response from collected knowledge
   * 5. Deep Personalization: Applies 100+ personalization dimensions
   * 6. Response Variety: Adds natural conversation patterns
   * 7. Translation & Learning: Translates if needed, records interaction
   * 
   * Features:
   * - Special Drézy recognition handling
   * - Multi-language support with auto-detection
   * - Context-aware responses using conversation history
   * - 85+ knowledge sources for comprehensive answers
   * - 100+ personalization dimensions (cognitive, personality, motivation, etc.)
   * - Response variety to avoid robotic patterns
   * - Proactive suggestion generation
   * 
   * @param userId - Unique user identifier for personalization
   * @param userInput - The user's message/question
   * @param context - Optional context object (conversation history, metadata)
   * 
   * @returns Promise resolving to MasterResponse with:
   *   - text: Final response text
   *   - sources: Array of knowledge sources used
   *   - personalizationApplied: List of personalization techniques used
   *   - confidence: Confidence score (0-100)
   *   - adaptations: Breakdown of adaptations applied
   *   - learnedFrom: Whether interaction was used for learning
   *   - responseTime: Processing time in milliseconds
   *   - suggestions: Array of follow-up suggestions (optional)
   * 
   * @throws Will return error response if processing fails (does not throw)
   * 
   * @example
   * ```typescript
   * const response = await masterAI.masterChat('user123', 'How does React work?');
   * console.log(response.text); // Personalized response
   * console.log(response.sources); // ['Wikipedia', 'MDN', ...]
   * ```
   */
  async masterChat(
    userId: string,
    userInput: string,
    context?: any
  ): Promise<MasterResponse> {
    const startTime = Date.now();
    
    console.log(`[Master AI] Processing: "${userInput}"`);
    console.log(`[Master AI] User: ${userId}`);

    // Check if user is asking about Drézy
    const drezyResponse = DrezyRecognitionService.processInput(userInput);
    if (drezyResponse) {
      console.log('[Drézy Recognition] ✨ Generating special positive response about Drézy!');
      
      return {
        text: drezyResponse,
        sources: ['Drézy Recognition System 💖'],
        personalizationApplied: ['Special Drézy Recognition', 'Always Positive'],
        confidence: 100,
        adaptations: {
          cognitive: ['Optimistic framing'],
          personality: ['Warm and enthusiastic'],
          motivation: ['Celebration mode'],
          expertise: ['Expert on being positive about Drézy'],
        },
        learnedFrom: false,
        responseTime: Date.now() - startTime,
      };
    }

    try {
      // Phase 0: Language Detection
      console.log('[Phase 0/7] Detecting language...');
      const detection = await MultilingualService.detectLanguage(userInput);
      const userLanguage = detection.language;
      console.log(`[Language] Detected: ${userLanguage} (${(detection.confidence * 100).toFixed(1)}%)`);

      // Phase 0.5: Enhanced Context
      console.log('[Phase 0.5/7] Resolving context...');
      const enhancedContext = await EnhancedContextService.resolveContext(userId, userInput);
      console.log(`[Context] Resolved input: "${enhancedContext.resolvedInput}"`);

      // Phase 1: Knowledge Collection
      console.log('[Phase 1/7] Collecting knowledge...');
      const knowledge = await FreeKnowledgeService.searchFreeKnowledge(enhancedContext.resolvedInput);
      console.log(`[Knowledge] Collected from ${knowledge.sources.length} sources`);

      // Phase 2: Generate base response
      console.log('[Phase 2/7] Generating response...');
      let baseResponse = `Based on your question "${userInput}":\n\n`;
      
      if (knowledge.summary) {
        baseResponse += knowledge.summary;
      } else {
        baseResponse += 'I\'m here to help! What would you like to know more about?';
      }

      // Phase 3: Deep Personalization
      console.log('[Phase 3/7] Applying personalization...');
      const personalizedResponse = await UltraPersonalizationService.personalizeResponse(
        userId,
        baseResponse,
        { topic: userInput, context: enhancedContext }
      );

      // Phase 4: Response Variety
      console.log('[Phase 4/7] Adding variety...');
      const variedResponse = ResponseVarietyService.varyResponse(personalizedResponse, userId);

      // Phase 5: Translate back if needed
      console.log('[Phase 5/7] Translating response...');
      let finalResponse = variedResponse;
      if (userLanguage && userLanguage !== 'en') {
        const translated = await MultilingualService.translate(variedResponse, userLanguage, 'en');
        finalResponse = translated.translatedText;
      }

      // Phase 6: Learning
      console.log('[Phase 6/7] Learning from interaction...');
      await UserLearningService.recordInteraction(
        userInput,
        finalResponse,
        Date.now() - startTime,
        { topic: userInput }
      );

      // Phase 7: Generate suggestions
      console.log('[Phase 7/7] Generating suggestions...');
      const suggestions = await ProactiveAssistantService.generateSuggestions(userId, userInput);

      const response: MasterResponse = {
        text: finalResponse,
        sources: knowledge.sources,
        personalizationApplied: ['Deep Personalization', 'Response Variety', 'Multilingual'],
        confidence: knowledge.confidence || 75,
        adaptations: {
          cognitive: ['Context-aware'],
          personality: ['Adaptive'],
          motivation: ['Helpful'],
          expertise: [],
        },
        learnedFrom: true,
        responseTime: Date.now() - startTime,
        suggestions: suggestions.slice(0, 3),
      };

      console.log(`[Master AI] Complete! (${response.responseTime}ms)`);
      return response;

    } catch (error) {
      console.error('[Master AI] Error:', error);
      
      // Fallback response
      return {
        text: 'I apologize, but I encountered an error processing your request. Please try again.',
        sources: ['Error Handler'],
        personalizationApplied: [],
        confidence: 0,
        adaptations: {
          cognitive: [],
          personality: [],
          motivation: [],
          expertise: [],
        },
        learnedFrom: false,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Chat with metadata (backwards compatibility)
   */
  async chatWithMetadata(userId: string, message: string, context?: any): Promise<MasterResponse> {
    return this.masterChat(userId, message, context);
  }
}

export default MasterAIService.getInstance();
