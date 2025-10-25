import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import AdvancedReasoningService from './AdvancedReasoningService';
import ErrorRecoveryService from './ErrorRecoveryService';

class PlanningService {
  constructor() {
    this.activePlans = new Map();
    this.planTemplates = new Map();
    this.planHistory = [];
    this.isInitialized = false;
    
    // Planning types
    this.planningTypes = {
      task: 'Simple task execution',
      project: 'Complex project management',
      strategic: 'Long-term strategic planning',
      creative: 'Creative project planning',
      technical: 'Technical implementation planning',
      personal: 'Personal goal planning'
    };
    
    // Plan statuses
    this.planStatuses = {
      draft: 'Plan is being created',
      active: 'Plan is being executed',
      paused: 'Plan execution is paused',
      completed: 'Plan has been completed',
      cancelled: 'Plan has been cancelled',
      failed: 'Plan execution failed'
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await AdvancedReasoningService.initialize();
      await ErrorRecoveryService.initialize();
      await this.loadPlanTemplates();
      await this.loadPlanHistory();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing PlanningService:', error);
    }
  }

  // Create a new plan
  async createPlan(goal, type = 'task', constraints = {}, context = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'plan_creation',
        execute: async () => {
          return await this.generatePlan(goal, type, constraints, context);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { goal, type, constraints, context });
      
      // Store the plan
      const planId = this.generatePlanId();
      const plan = {
        id: planId,
        goal,
        type,
        constraints,
        context,
        status: 'draft',
        createdAt: new Date().toISOString(),
        ...result
      };
      
      this.activePlans.set(planId, plan);
      this.planHistory.push(plan);
      
      await MetricsService.log('plan_created', {
        planId,
        type,
        goalLength: goal.length,
        duration: Date.now() - startTime,
        success: true
      });
      
      return plan;
      
    } catch (error) {
      await MetricsService.log('plan_creation_error', {
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async generatePlan(goal, type, constraints, context) {
    const planningPrompt = this.buildPlanningPrompt(goal, type, constraints, context);
    
    const reasoningResult = await AdvancedReasoningService.advancedPlanning(goal, constraints, context);
    
    // Parse the plan from the reasoning result
    const plan = this.parsePlanFromReasoning(reasoningResult.plan, type);
    
    return {
      plan: plan,
      reasoning: reasoningResult.plan,
      model: reasoningResult.model,
      tokens: reasoningResult.tokens
    };
  }

  buildPlanningPrompt(goal, type, constraints, context) {
    const typeDescription = this.planningTypes[type] || this.planningTypes.task;
    
    return `Create a detailed ${type} plan to achieve: ${goal}

Type: ${typeDescription}
Constraints: ${JSON.stringify(constraints)}
Context: ${JSON.stringify(context)}

The plan should include:
1. Clear objectives and milestones
2. Specific actionable steps
3. Resource requirements
4. Timeline and deadlines
5. Risk assessment
6. Success metrics
7. Dependencies and prerequisites
8. Alternative approaches

Provide a structured, executable plan.`;
  }

  parsePlanFromReasoning(reasoning, type) {
    // Simple parsing - in a real implementation, you'd use more sophisticated parsing
    const steps = [];
    const lines = reasoning.split('\n');
    
    let currentStep = null;
    let stepNumber = 1;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^\d+\./)) {
        if (currentStep) {
          steps.push(currentStep);
        }
        currentStep = {
          id: stepNumber++,
          title: trimmedLine.replace(/^\d+\.\s*/, ''),
          description: '',
          status: 'pending',
          dependencies: [],
          estimatedTime: null,
          resources: []
        };
      } else if (currentStep && trimmedLine) {
        currentStep.description += trimmedLine + ' ';
      }
    }
    
    if (currentStep) {
      steps.push(currentStep);
    }
    
    return {
      steps,
      type,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
  }

  // Execute a plan
  async executePlan(planId, options = {}) {
    await this.initialize();
    
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }
    
    const startTime = Date.now();
    
    try {
      // Update plan status
      plan.status = 'active';
      plan.startedAt = new Date().toISOString();
      
      const operation = {
        service: 'plan_execution',
        execute: async () => {
          return await this.executePlanSteps(plan, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { plan, options });
      
      // Update plan with execution results
      plan.executionResult = result;
      plan.completedAt = new Date().toISOString();
      plan.status = result.success ? 'completed' : 'failed';
      
      await MetricsService.log('plan_executed', {
        planId,
        type: plan.type,
        duration: Date.now() - startTime,
        success: result.success,
        stepsCompleted: result.stepsCompleted || 0
      });
      
      return result;
      
    } catch (error) {
      plan.status = 'failed';
      plan.error = error.message;
      
      await MetricsService.log('plan_execution_error', {
        planId,
        duration: Date.now() - startTime,
        error: error.message
      });
      throw error;
    }
  }

  async executePlanSteps(plan, options) {
    const results = [];
    let stepsCompleted = 0;
    
    for (const step of plan.plan.steps) {
      try {
        // Check if step should be executed
        if (options.skipCompleted && step.status === 'completed') {
          continue;
        }
        
        // Execute step
        const stepResult = await this.executeStep(step, plan, options);
        results.push(stepResult);
        
        // Update step status
        step.status = stepResult.success ? 'completed' : 'failed';
        step.completedAt = new Date().toISOString();
        step.result = stepResult;
        
        stepsCompleted++;
        
        // Check if we should continue
        if (options.stopOnFailure && !stepResult.success) {
          break;
        }
        
        // Add delay between steps if specified
        if (options.stepDelay && stepsCompleted < plan.plan.steps.length) {
          await this.sleep(options.stepDelay);
        }
        
      } catch (error) {
        step.status = 'failed';
        step.error = error.message;
        results.push({
          stepId: step.id,
          success: false,
          error: error.message
        });
        
        if (options.stopOnFailure) {
          break;
        }
      }
    }
    
    const success = results.every(r => r.success);
    
    return {
      success,
      stepsCompleted,
      results,
      planId: plan.id
    };
  }

  async executeStep(step, plan, options) {
    const startTime = Date.now();
    
    try {
      // Simple step execution - in a real implementation, you'd have more sophisticated step handlers
      const stepResult = {
        stepId: step.id,
        success: true,
        result: `Step "${step.title}" executed successfully`,
        duration: Date.now() - startTime
      };
      
      // Log step execution
      await MetricsService.log('plan_step_executed', {
        planId: plan.id,
        stepId: step.id,
        stepTitle: step.title,
        duration: stepResult.duration,
        success: stepResult.success
      });
      
      return stepResult;
      
    } catch (error) {
      return {
        stepId: step.id,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  // Plan management
  async updatePlan(planId, updates) {
    await this.initialize();
    
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }
    
    // Update plan
    Object.assign(plan, updates);
    plan.updatedAt = new Date().toISOString();
    
    await MetricsService.log('plan_updated', {
      planId,
      updates: Object.keys(updates)
    });
    
    return plan;
  }

  async pausePlan(planId) {
    return await this.updatePlan(planId, { status: 'paused' });
  }

  async resumePlan(planId) {
    return await this.updatePlan(planId, { status: 'active' });
  }

  async cancelPlan(planId) {
    return await this.updatePlan(planId, { status: 'cancelled' });
  }

  async getPlan(planId) {
    await this.initialize();
    return this.activePlans.get(planId);
  }

  async getAllPlans() {
    await this.initialize();
    return Array.from(this.activePlans.values());
  }

  async getPlanHistory() {
    await this.initialize();
    return this.planHistory;
  }

  // Plan templates
  async createPlanTemplate(name, template) {
    await this.initialize();
    
    this.planTemplates.set(name, {
      name,
      template,
      createdAt: new Date().toISOString()
    });
    
    await this.persistPlanTemplates();
    
    await MetricsService.log('plan_template_created', {
      templateName: name
    });
  }

  async getPlanTemplate(name) {
    await this.initialize();
    return this.planTemplates.get(name);
  }

  async getAllPlanTemplates() {
    await this.initialize();
    return Array.from(this.planTemplates.values());
  }

  async createPlanFromTemplate(templateName, goal, customizations = {}) {
    await this.initialize();
    
    const template = this.planTemplates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    // Customize template
    const customizedTemplate = { ...template.template };
    Object.assign(customizedTemplate, customizations);
    
    // Create plan from template
    return await this.createPlan(goal, customizedTemplate.type, customizedTemplate.constraints, customizedTemplate.context);
  }

  // Utility methods
  generatePlanId() {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Persistence
  async loadPlanTemplates() {
    try {
      const stored = await AsyncStorage.getItem('plan_templates');
      if (stored) {
        const templates = JSON.parse(stored);
        this.planTemplates = new Map(templates);
      }
    } catch (error) {
      console.error('Error loading plan templates:', error);
    }
  }

  async persistPlanTemplates() {
    try {
      const templates = Array.from(this.planTemplates.entries());
      await AsyncStorage.setItem('plan_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Error persisting plan templates:', error);
    }
  }

  async loadPlanHistory() {
    try {
      const stored = await AsyncStorage.getItem('plan_history');
      if (stored) {
        this.planHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading plan history:', error);
    }
  }

  async persistPlanHistory() {
    try {
      await AsyncStorage.setItem('plan_history', JSON.stringify(this.planHistory));
    } catch (error) {
      console.error('Error persisting plan history:', error);
    }
  }

  // Health check
  async getHealthStatus() {
    return {
      activePlans: this.activePlans.size,
      planTemplates: this.planTemplates.size,
      planHistory: this.planHistory.length,
      planningTypes: this.planningTypes,
      planStatuses: this.planStatuses,
      isInitialized: this.isInitialized
    };
  }
}

export default new PlanningService();
