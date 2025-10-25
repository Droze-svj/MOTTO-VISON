// Advanced Prompt Engineering Service - Context management and instruction optimization
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsService } from './MetricsService';
import { ErrorManager } from './ErrorManager';

class AdvancedPromptEngineeringService {
  constructor() {
    this.isInitialized = false;
    this.promptCapabilities = {
      contextOptimization: true,
      instructionParsing: true,
      responseTargeting: true,
      promptEnhancement: true,
      contextClarity: true,
      instructionSpecificity: true,
      promptTemplates: true,
      dynamicPrompting: true,
      contextAwareness: true,
      instructionValidation: true
    };
    
    this.promptTemplates = {
      analysis: {
        structure: "Analyze the following {topic} with focus on {aspects}. Provide {format} response including {elements}.",
        examples: [
          "Analyze the following business strategy with focus on market positioning and competitive advantages. Provide detailed response including SWOT analysis and recommendations.",
          "Analyze the following technical document with focus on implementation details and potential issues. Provide structured response including code review and suggestions."
        ]
      },
      explanation: {
        structure: "Explain {concept} in {detail_level} terms, covering {key_points}. Use {examples_type} examples and provide {additional_info}.",
        examples: [
          "Explain machine learning in simple terms, covering algorithms and applications. Use real-world examples and provide practical use cases.",
          "Explain quantum computing in technical terms, covering principles and limitations. Use scientific examples and provide current research status."
        ]
      },
      problemSolving: {
        structure: "Solve this {problem_type}: {problem_description}. Consider {constraints} and provide {solution_format} with {validation_method}.",
        examples: [
          "Solve this optimization problem: maximize efficiency while minimizing costs. Consider resource constraints and provide step-by-step solution with cost-benefit analysis.",
          "Solve this technical issue: application performance degradation. Consider system limitations and provide diagnostic approach with monitoring recommendations."
        ]
      },
      creative: {
        structure: "Create {output_type} about {topic} with {style} approach. Include {elements} and ensure {quality_standards}.",
        examples: [
          "Create a marketing campaign about sustainable technology with innovative approach. Include target audience analysis and ensure brand consistency.",
          "Create a user interface design for mobile app with minimalist approach. Include accessibility features and ensure intuitive navigation."
        ]
      },
      research: {
        structure: "Research {topic} focusing on {research_areas}. Provide {output_format} with {sources_type} and {analysis_depth}.",
        examples: [
          "Research artificial intelligence trends focusing on recent developments and market impact. Provide comprehensive report with academic sources and detailed analysis.",
          "Research user experience design focusing on mobile applications and accessibility. Provide case study with industry examples and practical insights."
        ]
      }
    };
    
    this.contextTypes = {
      user: 'user_context',
      conversation: 'conversation_context',
      domain: 'domain_context',
      temporal: 'temporal_context',
      spatial: 'spatial_context',
      emotional: 'emotional_context',
      technical: 'technical_context',
      business: 'business_context',
      academic: 'academic_context',
      creative: 'creative_context'
    };
    
    this.instructionTypes = {
      explicit: 'explicit_instruction',
      implicit: 'implicit_instruction',
      contextual: 'contextual_instruction',
      conditional: 'conditional_instruction',
      sequential: 'sequential_instruction',
      parallel: 'parallel_instruction',
      recursive: 'recursive_instruction',
      adaptive: 'adaptive_instruction'
    };
    
    this.promptHistory = [];
    this.contextCache = {};
    this.instructionPatterns = {};
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadPromptData();
      await this.initializePromptTemplates();
      await this.buildInstructionPatterns();
      
      this.isInitialized = true;
      console.log('✅ Advanced Prompt Engineering Service initialized');
      
      await MetricsService.logEvent('advanced_prompt_engineering_initialized', {
        promptCapabilities: Object.keys(this.promptCapabilities).filter(k => this.promptCapabilities[k]),
        templateTypes: Object.keys(this.promptTemplates).length,
        contextTypes: Object.keys(this.contextTypes).length
      });
    } catch (error) {
      console.error('❌ Failed to initialize Advanced Prompt Engineering Service:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedPromptEngineeringService.initialize' });
      throw error;
    }
  }

  // Advanced Prompt Engineering
  async enhancePrompt(userInput, context = {}) {
    try {
      const promptId = this.generatePromptId();
      const enhancedPrompt = {
        id: promptId,
        originalInput: userInput,
        context: context,
        timestamp: Date.now(),
        analysis: await this.analyzePrompt(userInput, context),
        enhancement: await this.generateEnhancement(userInput, context),
        instructions: await this.extractInstructions(userInput, context),
        contextOptimization: await this.optimizeContext(context),
        targeting: await this.generateTargeting(userInput, context),
        finalPrompt: null
      };

      // Generate final enhanced prompt
      enhancedPrompt.finalPrompt = await this.constructFinalPrompt(enhancedPrompt);

      // Store prompt history
      this.promptHistory.push(enhancedPrompt);
      await this.savePromptHistory();

      console.log(`✅ Prompt enhanced: ${promptId}`);
      return enhancedPrompt;
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedPromptEngineeringService.enhancePrompt' });
      throw error;
    }
  }

  async analyzePrompt(userInput, context) {
    return {
      complexity: this.assessPromptComplexity(userInput),
      clarity: this.assessPromptClarity(userInput),
      specificity: this.assessPromptSpecificity(userInput),
      contextRelevance: this.assessContextRelevance(userInput, context),
      instructionType: this.identifyInstructionType(userInput),
      domain: this.identifyDomain(userInput),
      intent: this.identifyIntent(userInput),
      missingElements: this.identifyMissingElements(userInput, context),
      ambiguity: this.assessAmbiguity(userInput),
      urgency: this.assessUrgency(userInput, context)
    };
  }

  async generateEnhancement(userInput, context) {
    const enhancement = {
      clarityImprovements: await this.generateClarityImprovements(userInput),
      specificityEnhancements: await this.generateSpecificityEnhancements(userInput),
      contextAdditions: await this.generateContextAdditions(userInput, context),
      instructionRefinements: await this.generateInstructionRefinements(userInput),
      structureOptimization: await this.optimizeStructure(userInput),
      languageEnhancement: await this.enhanceLanguage(userInput),
      examples: await this.generateExamples(userInput, context),
      constraints: await this.identifyConstraints(userInput, context),
      successCriteria: await this.defineSuccessCriteria(userInput, context)
    };

    return enhancement;
  }

  async extractInstructions(userInput, context) {
    const instructions = {
      explicit: this.extractExplicitInstructions(userInput),
      implicit: this.extractImplicitInstructions(userInput),
      contextual: this.extractContextualInstructions(userInput, context),
      conditional: this.extractConditionalInstructions(userInput),
      sequential: this.extractSequentialInstructions(userInput),
      parallel: this.extractParallelInstructions(userInput),
      recursive: this.extractRecursiveInstructions(userInput),
      adaptive: this.extractAdaptiveInstructions(userInput, context)
    };

    return instructions;
  }

  async optimizeContext(context) {
    const optimization = {
      relevance: await this.optimizeContextRelevance(context),
      completeness: await this.ensureContextCompleteness(context),
      clarity: await this.improveContextClarity(context),
      structure: await this.structureContext(context),
      prioritization: await this.prioritizeContextElements(context),
      filtering: await this.filterIrrelevantContext(context),
      enrichment: await this.enrichContext(context),
      validation: await this.validateContext(context)
    };

    return optimization;
  }

  async generateTargeting(userInput, context) {
    const targeting = {
      audience: await this.identifyTargetAudience(userInput, context),
      purpose: await this.identifyPurpose(userInput, context),
      scope: await this.defineScope(userInput, context),
      depth: await this.determineDepth(userInput, context),
      format: await this.determineFormat(userInput, context),
      tone: await this.determineTone(userInput, context),
      perspective: await this.determinePerspective(userInput, context),
      focus: await this.identifyFocus(userInput, context)
    };

    return targeting;
  }

  async constructFinalPrompt(enhancedPrompt) {
    const { originalInput, analysis, enhancement, instructions, contextOptimization, targeting } = enhancedPrompt;
    
    let finalPrompt = originalInput;

    // Add context if missing or insufficient
    if (analysis.contextRelevance < 0.7) {
      finalPrompt = await this.addContext(finalPrompt, contextOptimization);
    }

    // Enhance clarity if needed
    if (analysis.clarity < 0.8) {
      finalPrompt = await this.improveClarity(finalPrompt, enhancement.clarityImprovements);
    }

    // Add specificity if needed
    if (analysis.specificity < 0.7) {
      finalPrompt = await this.addSpecificity(finalPrompt, enhancement.specificityEnhancements);
    }

    // Add instructions if missing
    if (analysis.instructionType === 'implicit' && analysis.complexity > 0.6) {
      finalPrompt = await this.addExplicitInstructions(finalPrompt, instructions);
    }

    // Add examples if helpful
    if (analysis.complexity > 0.5 && enhancement.examples.length > 0) {
      finalPrompt = await this.addExamples(finalPrompt, enhancement.examples);
    }

    // Add constraints if identified
    if (enhancement.constraints.length > 0) {
      finalPrompt = await this.addConstraints(finalPrompt, enhancement.constraints);
    }

    // Add success criteria if complex
    if (analysis.complexity > 0.7 && enhancement.successCriteria.length > 0) {
      finalPrompt = await this.addSuccessCriteria(finalPrompt, enhancement.successCriteria);
    }

    // Optimize structure
    finalPrompt = await this.optimizePromptStructure(finalPrompt, analysis, targeting);

    return finalPrompt;
  }

  // Context Management
  async manageContext(context, userInput) {
    try {
      const contextManagement = {
        current: context,
        analysis: await this.analyzeContext(context, userInput),
        optimization: await this.optimizeContextForPrompt(context, userInput),
        enrichment: await this.enrichContextForPrompt(context, userInput),
        filtering: await this.filterContextForPrompt(context, userInput),
        structuring: await this.structureContextForPrompt(context, userInput),
        validation: await this.validateContextForPrompt(context, userInput)
      };

      return contextManagement;
    } catch (error) {
      console.error('Error managing context:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedPromptEngineeringService.manageContext' });
      throw error;
    }
  }

  async analyzeContext(context, userInput) {
    return {
      completeness: this.assessContextCompleteness(context, userInput),
      relevance: this.assessContextRelevance(context, userInput),
      clarity: this.assessContextClarity(context),
      structure: this.assessContextStructure(context),
      depth: this.assessContextDepth(context),
      accuracy: this.assessContextAccuracy(context),
      timeliness: this.assessContextTimeliness(context),
      consistency: this.assessContextConsistency(context)
    };
  }

  async optimizeContextForPrompt(context, userInput) {
    const optimization = {
      prioritization: await this.prioritizeContextElements(context, userInput),
      filtering: await this.filterRelevantContext(context, userInput),
      structuring: await this.structureContextElements(context, userInput),
      enrichment: await this.enrichContextElements(context, userInput),
      validation: await this.validateContextElements(context, userInput),
      formatting: await this.formatContextForPrompt(context, userInput)
    };

    return optimization;
  }

  // Instruction Parsing and Enhancement
  async parseInstructions(userInput, context = {}) {
    try {
      const instructionParsing = {
        input: userInput,
        context: context,
        timestamp: Date.now(),
        parsed: {
          explicit: this.parseExplicitInstructions(userInput),
          implicit: this.parseImplicitInstructions(userInput),
          contextual: this.parseContextualInstructions(userInput, context),
          conditional: this.parseConditionalInstructions(userInput),
          sequential: this.parseSequentialInstructions(userInput),
          parallel: this.parseParallelInstructions(userInput)
        },
        enhancement: await this.enhanceInstructions(userInput, context),
        validation: await this.validateInstructions(userInput, context),
        optimization: await this.optimizeInstructions(userInput, context)
      };

      return instructionParsing;
    } catch (error) {
      console.error('Error parsing instructions:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedPromptEngineeringService.parseInstructions' });
      throw error;
    }
  }

  async enhanceInstructions(userInput, context) {
    const enhancement = {
      clarity: await this.enhanceInstructionClarity(userInput),
      specificity: await this.enhanceInstructionSpecificity(userInput),
      completeness: await this.enhanceInstructionCompleteness(userInput, context),
      structure: await this.enhanceInstructionStructure(userInput),
      context: await this.enhanceInstructionContext(userInput, context),
      examples: await this.addInstructionExamples(userInput, context),
      constraints: await this.addInstructionConstraints(userInput, context),
      validation: await this.addInstructionValidation(userInput, context)
    };

    return enhancement;
  }

  // Response Targeting
  async targetResponse(userInput, context = {}) {
    try {
      const responseTargeting = {
        input: userInput,
        context: context,
        timestamp: Date.now(),
        targeting: {
          audience: await this.identifyResponseAudience(userInput, context),
          purpose: await this.identifyResponsePurpose(userInput, context),
          scope: await this.defineResponseScope(userInput, context),
          depth: await this.determineResponseDepth(userInput, context),
          format: await this.determineResponseFormat(userInput, context),
          tone: await this.determineResponseTone(userInput, context),
          perspective: await this.determineResponsePerspective(userInput, context),
          focus: await this.identifyResponseFocus(userInput, context)
        },
        optimization: await this.optimizeResponseTargeting(userInput, context),
        validation: await this.validateResponseTargeting(userInput, context)
      };

      return responseTargeting;
    } catch (error) {
      console.error('Error targeting response:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedPromptEngineeringService.targetResponse' });
      throw error;
    }
  }

  // Prompt Templates
  async generatePromptFromTemplate(templateType, parameters, context = {}) {
    try {
      const template = this.promptTemplates[templateType];
      if (!template) {
        throw new Error(`Template type '${templateType}' not found`);
      }

      const generatedPrompt = {
        templateType: templateType,
        parameters: parameters,
        context: context,
        timestamp: Date.now(),
        structure: template.structure,
        generated: await this.fillTemplate(template.structure, parameters),
        examples: template.examples,
        customization: await this.customizeTemplate(template, parameters, context),
        validation: await this.validateGeneratedPrompt(template, parameters, context)
      };

      return generatedPrompt;
    } catch (error) {
      console.error('Error generating prompt from template:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedPromptEngineeringService.generatePromptFromTemplate' });
      throw error;
    }
  }

  async fillTemplate(template, parameters) {
    let filledTemplate = template;
    
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{${key}}`;
      filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value);
    }

    return filledTemplate;
  }

  // Dynamic Prompting
  async generateDynamicPrompt(userInput, context = {}, dynamicFactors = {}) {
    try {
      const dynamicPrompt = {
        input: userInput,
        context: context,
        dynamicFactors: dynamicFactors,
        timestamp: Date.now(),
        analysis: await this.analyzeDynamicFactors(dynamicFactors),
        adaptation: await this.adaptPromptToFactors(userInput, dynamicFactors),
        optimization: await this.optimizeForDynamicContext(userInput, context, dynamicFactors),
        finalPrompt: null
      };

      dynamicPrompt.finalPrompt = await this.constructDynamicPrompt(dynamicPrompt);
      return dynamicPrompt;
    } catch (error) {
      console.error('Error generating dynamic prompt:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedPromptEngineeringService.generateDynamicPrompt' });
      throw error;
    }
  }

  // Utility Methods
  generatePromptId() {
    return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  assessPromptComplexity(userInput) {
    const words = userInput.split(' ').length;
    const sentences = userInput.split(/[.!?]+/).length;
    const complexity = Math.min(1, (words / 100) + (sentences / 10));
    return complexity;
  }

  assessPromptClarity(userInput) {
    const unclearWords = ['thing', 'stuff', 'something', 'somehow', 'maybe', 'perhaps'];
    const unclearCount = unclearWords.filter(word => userInput.toLowerCase().includes(word)).length;
    const words = userInput.split(' ').length;
    return Math.max(0, 1 - (unclearCount / words));
  }

  assessPromptSpecificity(userInput) {
    const specificWords = ['exactly', 'specifically', 'precisely', 'detailed', 'comprehensive'];
    const specificCount = specificWords.filter(word => userInput.toLowerCase().includes(word)).length;
    const words = userInput.split(' ').length;
    return Math.min(1, specificCount / (words / 20));
  }

  identifyInstructionType(userInput) {
    if (userInput.includes('please') || userInput.includes('can you') || userInput.includes('help me')) {
      return 'explicit';
    }
    if (userInput.includes('if') || userInput.includes('when') || userInput.includes('unless')) {
      return 'conditional';
    }
    if (userInput.includes('first') || userInput.includes('then') || userInput.includes('next')) {
      return 'sequential';
    }
    if (userInput.includes('and') || userInput.includes('also') || userInput.includes('additionally')) {
      return 'parallel';
    }
    return 'implicit';
  }

  identifyDomain(userInput) {
    const domains = {
      technical: ['code', 'programming', 'software', 'algorithm', 'system', 'database'],
      business: ['strategy', 'marketing', 'sales', 'finance', 'management', 'analysis'],
      academic: ['research', 'study', 'theory', 'hypothesis', 'experiment', 'analysis'],
      creative: ['design', 'art', 'writing', 'story', 'creative', 'imagination'],
      scientific: ['science', 'research', 'experiment', 'data', 'analysis', 'hypothesis']
    };

    const inputLower = userInput.toLowerCase();
    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        return domain;
      }
    }
    return 'general';
  }

  identifyIntent(userInput) {
    if (userInput.includes('?') || userInput.includes('what') || userInput.includes('how') || userInput.includes('why')) {
      return 'question';
    }
    if (userInput.includes('create') || userInput.includes('make') || userInput.includes('generate')) {
      return 'creation';
    }
    if (userInput.includes('analyze') || userInput.includes('examine') || userInput.includes('review')) {
      return 'analysis';
    }
    if (userInput.includes('explain') || userInput.includes('describe') || userInput.includes('tell me')) {
      return 'explanation';
    }
    if (userInput.includes('solve') || userInput.includes('fix') || userInput.includes('resolve')) {
      return 'problem_solving';
    }
    return 'general';
  }

  // Data Persistence
  async loadPromptData() {
    try {
      const history = await AsyncStorage.getItem('prompt_history');
      if (history) {
        this.promptHistory = JSON.parse(history);
      }

      const cache = await AsyncStorage.getItem('context_cache');
      if (cache) {
        this.contextCache = JSON.parse(cache);
      }

      const patterns = await AsyncStorage.getItem('instruction_patterns');
      if (patterns) {
        this.instructionPatterns = JSON.parse(patterns);
      }
    } catch (error) {
      console.error('Error loading prompt data:', error);
    }
  }

  async savePromptHistory() {
    try {
      await AsyncStorage.setItem('prompt_history', JSON.stringify(this.promptHistory));
    } catch (error) {
      console.error('Error saving prompt history:', error);
    }
  }

  async saveContextCache() {
    try {
      await AsyncStorage.setItem('context_cache', JSON.stringify(this.contextCache));
    } catch (error) {
      console.error('Error saving context cache:', error);
    }
  }

  async saveInstructionPatterns() {
    try {
      await AsyncStorage.setItem('instruction_patterns', JSON.stringify(this.instructionPatterns));
    } catch (error) {
      console.error('Error saving instruction patterns:', error);
    }
  }

  // Status and Health
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      promptCapabilities: Object.keys(this.promptCapabilities).filter(k => this.promptCapabilities[k]),
      promptHistoryCount: this.promptHistory.length,
      contextCacheSize: Object.keys(this.contextCache).length,
      instructionPatternsCount: Object.keys(this.instructionPatterns).length,
      templateTypesCount: Object.keys(this.promptTemplates).length
    };
  }

  // Cleanup
  async destroy() {
    await this.savePromptHistory();
    await this.saveContextCache();
    await this.saveInstructionPatterns();
    this.isInitialized = false;
    console.log('🧹 Advanced Prompt Engineering Service destroyed');
  }
}

export default new AdvancedPromptEngineeringService();
