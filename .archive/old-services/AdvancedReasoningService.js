import { OPENROUTER_BASE_URL, OPENROUTER_API_KEY, OPENROUTER_APP_NAME } from '../constants/config';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';

class AdvancedReasoningService {
  constructor() {
    this.reasoningModels = {
      chainOfThought: 'deepseek/deepseek-reasoner',
      stepByStep: 'anthropic/claude-3.5-sonnet',
      analytical: 'openai/gpt-4o',
      creative: 'anthropic/claude-3-haiku',
      logical: 'meta-llama/llama-3.1-8b-instruct'
    };
    
    this.reasoningTypes = {
      deductive: 'Deductive reasoning from general principles to specific conclusions',
      inductive: 'Inductive reasoning from specific observations to general principles',
      abductive: 'Abductive reasoning to find the best explanation',
      causal: 'Causal reasoning to understand cause-effect relationships',
      analogical: 'Analogical reasoning using similarities and patterns',
      creative: 'Creative reasoning for novel solutions and ideas'
    };
    
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing AdvancedReasoningService:', error);
    }
  }

  // Chain-of-Thought Reasoning
  async chainOfThoughtReasoning(problem, context = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'chain_of_thought_reasoning',
        execute: async () => {
          return await this.performChainOfThoughtReasoning(problem, context);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { problem, context });
      
      await MetricsService.log('chain_of_thought_reasoning', {
        duration: Date.now() - startTime,
        success: true,
        problemLength: problem.length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('chain_of_thought_reasoning_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async performChainOfThoughtReasoning(problem, context) {
    const model = this.reasoningModels.chainOfThought;
    
    const prompt = `You are an expert problem solver. Use chain-of-thought reasoning to solve this problem step by step.

Problem: ${problem}

Context: ${JSON.stringify(context)}

Please follow this reasoning process:
1. Understand the problem clearly
2. Break it down into smaller components
3. Identify what information you have and what you need
4. Apply logical reasoning step by step
5. Consider alternative approaches
6. Reach a conclusion
7. Verify your reasoning

Think step by step and show your reasoning process clearly.`;
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_APP_NAME,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Chain-of-thought reasoning failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      reasoning: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      reasoningType: 'chain_of_thought'
    };
  }

  // Multi-Step Problem Solving
  async multiStepProblemSolving(problem, steps = [], context = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'multi_step_problem_solving',
        execute: async () => {
          return await this.performMultiStepProblemSolving(problem, steps, context);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { problem, steps, context });
      
      await MetricsService.log('multi_step_problem_solving', {
        duration: Date.now() - startTime,
        success: true,
        problemLength: problem.length,
        stepCount: steps.length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('multi_step_problem_solving_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async performMultiStepProblemSolving(problem, steps, context) {
    const model = this.reasoningModels.stepByStep;
    
    const prompt = `You are an expert problem solver. Solve this problem using a systematic multi-step approach.

Problem: ${problem}

Context: ${JSON.stringify(context)}

Steps to follow: ${steps.length > 0 ? steps.join(', ') : 'Define your own logical steps'}

Please:
1. Analyze the problem thoroughly
2. Break it down into logical steps
3. Execute each step systematically
4. Show your work and reasoning for each step
5. Verify your solution
6. Consider edge cases and alternatives

Provide a clear, step-by-step solution with detailed reasoning.`;
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_APP_NAME,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`Multi-step problem solving failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      solution: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      reasoningType: 'multi_step'
    };
  }

  // Advanced Planning
  async advancedPlanning(goal, constraints = {}, context = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'advanced_planning',
        execute: async () => {
          return await this.performAdvancedPlanning(goal, constraints, context);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { goal, constraints, context });
      
      await MetricsService.log('advanced_planning', {
        duration: Date.now() - startTime,
        success: true,
        goalLength: goal.length,
        constraintCount: Object.keys(constraints).length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('advanced_planning_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async performAdvancedPlanning(goal, constraints, context) {
    const model = this.reasoningModels.analytical;
    
    const prompt = `You are an expert strategic planner. Create a comprehensive plan to achieve the given goal.

Goal: ${goal}

Constraints: ${JSON.stringify(constraints)}

Context: ${JSON.stringify(context)}

Please create a detailed plan that includes:
1. Goal analysis and breakdown
2. Resource requirements
3. Timeline and milestones
4. Risk assessment and mitigation
5. Success metrics
6. Alternative approaches
7. Implementation steps
8. Monitoring and evaluation

Provide a structured, actionable plan with clear steps and reasoning.`;
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_APP_NAME,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      throw new Error(`Advanced planning failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      plan: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      reasoningType: 'advanced_planning'
    };
  }

  // Creative Reasoning
  async creativeReasoning(problem, constraints = {}, context = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'creative_reasoning',
        execute: async () => {
          return await this.performCreativeReasoning(problem, constraints, context);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { problem, constraints, context });
      
      await MetricsService.log('creative_reasoning', {
        duration: Date.now() - startTime,
        success: true,
        problemLength: problem.length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('creative_reasoning_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async performCreativeReasoning(problem, constraints, context) {
    const model = this.reasoningModels.creative;
    
    const prompt = `You are a creative problem solver. Use innovative and creative thinking to solve this problem.

Problem: ${problem}

Constraints: ${JSON.stringify(constraints)}

Context: ${JSON.stringify(context)}

Please:
1. Think outside the box and consider unconventional approaches
2. Use analogies and metaphors to explore the problem
3. Consider multiple perspectives and viewpoints
4. Generate creative and innovative solutions
5. Explore the problem from different angles
6. Consider what-if scenarios
7. Combine ideas in novel ways

Provide creative, innovative solutions with detailed reasoning.`;
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_APP_NAME,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`Creative reasoning failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      creativeSolution: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      reasoningType: 'creative'
    };
  }

  // Logical Reasoning
  async logicalReasoning(problem, reasoningType = 'deductive', context = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'logical_reasoning',
        execute: async () => {
          return await this.performLogicalReasoning(problem, reasoningType, context);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { problem, reasoningType, context });
      
      await MetricsService.log('logical_reasoning', {
        duration: Date.now() - startTime,
        success: true,
        reasoningType: reasoningType,
        problemLength: problem.length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('logical_reasoning_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async performLogicalReasoning(problem, reasoningType, context) {
    const model = this.reasoningModels.logical;
    
    const reasoningDescription = this.reasoningTypes[reasoningType] || this.reasoningTypes.deductive;
    
    const prompt = `You are an expert in logical reasoning. Solve this problem using ${reasoningType} reasoning.

Problem: ${problem}

Reasoning Type: ${reasoningDescription}

Context: ${JSON.stringify(context)}

Please:
1. Apply ${reasoningType} reasoning principles
2. Show your logical steps clearly
3. Validate your reasoning
4. Consider logical fallacies
5. Provide a sound conclusion

Use rigorous logical reasoning to solve this problem.`;
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_APP_NAME,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Logical reasoning failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      logicalSolution: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      reasoningType: reasoningType
    };
  }

  // Complex Problem Analysis
  async analyzeComplexProblem(problem, analysisType = 'comprehensive', context = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'complex_problem_analysis',
        execute: async () => {
          return await this.performComplexProblemAnalysis(problem, analysisType, context);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { problem, analysisType, context });
      
      await MetricsService.log('complex_problem_analysis', {
        duration: Date.now() - startTime,
        success: true,
        analysisType: analysisType,
        problemLength: problem.length
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('complex_problem_analysis_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async performComplexProblemAnalysis(problem, analysisType, context) {
    const model = this.reasoningModels.analytical;
    
    const prompt = `You are an expert in complex problem analysis. Perform a ${analysisType} analysis of this problem.

Problem: ${problem}

Analysis Type: ${analysisType}

Context: ${JSON.stringify(context)}

Please provide a ${analysisType} analysis that includes:
1. Problem decomposition and structure
2. Key variables and relationships
3. Assumptions and constraints
4. Multiple solution approaches
5. Risk and uncertainty analysis
6. Implementation considerations
7. Evaluation criteria
8. Recommendations

Provide a thorough, analytical breakdown of this complex problem.`;
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_APP_NAME,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Complex problem analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      analysis: data.choices[0].message.content,
      model: model,
      tokens: data.usage?.total_tokens || 0,
      analysisType: analysisType
    };
  }

  // Utility Methods
  getReasoningTypes() {
    return this.reasoningTypes;
  }

  getReasoningModels() {
    return this.reasoningModels;
  }

  async getHealthStatus() {
    return {
      reasoningTypes: this.reasoningTypes,
      reasoningModels: this.reasoningModels,
      isInitialized: this.isInitialized
    };
  }
}

export default new AdvancedReasoningService();
