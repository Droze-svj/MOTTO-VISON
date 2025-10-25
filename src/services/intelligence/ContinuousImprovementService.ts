/**
 * Continuous Improvement Service
 * Makes MOTTO learn and get better over time from user feedback
 */

interface FeedbackRecord {
  userId: string;
  taskType: string;
  userInput: string;
  mottoResponse: string;
  feedback: 'positive' | 'negative' | 'neutral';
  timestamp: number;
  improvementArea?: string;
}

interface ImprovementInsight {
  area: string;
  issue: string;
  suggestion: string;
  frequency: number;
  priority: 'low' | 'medium' | 'high';
}

class ContinuousImprovementService {
  private static instance: ContinuousImprovementService;
  private feedbackHistory: FeedbackRecord[] = [];
  private improvementAreas: Map<string, number> = new Map();

  private constructor() {
    console.log('[Continuous Improvement] Service initialized');
  }

  static getInstance(): ContinuousImprovementService {
    if (!ContinuousImprovementService.instance) {
      ContinuousImprovementService.instance = new ContinuousImprovementService();
    }
    return ContinuousImprovementService.instance;
  }

  /**
   * Record user feedback
   */
  async recordFeedback(
    userId: string,
    taskType: string,
    userInput: string,
    mottoResponse: string,
    feedback: 'positive' | 'negative' | 'neutral'
  ) {
    const record: FeedbackRecord = {
      userId,
      taskType,
      userInput,
      mottoResponse,
      feedback,
      timestamp: Date.now(),
    };

    // Detect improvement area if negative
    if (feedback === 'negative') {
      record.improvementArea = this.detectImprovementArea(userInput, mottoResponse);
      
      // Track for pattern recognition
      const area = record.improvementArea || 'general';
      this.improvementAreas.set(area, (this.improvementAreas.get(area) || 0) + 1);
    }

    this.feedbackHistory.push(record);
    
    // Keep only last 1000 records
    if (this.feedbackHistory.length > 1000) {
      this.feedbackHistory = this.feedbackHistory.slice(-1000);
    }

    console.log(`[Continuous Improvement] Recorded ${feedback} feedback for ${taskType}`);

    // Learn from the feedback
    await this.learnFromFeedback(record);
  }

  /**
   * Detect what area needs improvement
   */
  private detectImprovementArea(userInput: string, mottoResponse: string): string {
    const lower = userInput.toLowerCase();

    if (lower.includes('not what i wanted') || lower.includes('wrong')) return 'accuracy';
    if (lower.includes('too long') || lower.includes('verbose')) return 'brevity';
    if (lower.includes('too short') || lower.includes('more detail')) return 'detail';
    if (lower.includes('confusing') || lower.includes('unclear')) return 'clarity';
    if (lower.includes('not helpful') || lower.includes('useless')) return 'helpfulness';
    if (lower.includes('tone') || lower.includes('rude')) return 'tone';

    return 'general';
  }

  /**
   * Learn from feedback
   */
  private async learnFromFeedback(record: FeedbackRecord) {
    // In a real system, this would update ML models
    // For now, we track patterns and adjust responses

    if (record.feedback === 'positive') {
      console.log(`[Learning] ✅ Positive pattern: ${record.taskType}`);
      // Reinforce this type of response
    } else if (record.feedback === 'negative') {
      console.log(`[Learning] ❌ Needs improvement: ${record.improvementArea}`);
      // Adjust future responses
    }
  }

  /**
   * Get improvement insights
   */
  async getInsights(): Promise<ImprovementInsight[]> {
    const insights: ImprovementInsight[] = [];

    // Analyze feedback patterns
    for (const [area, count] of this.improvementAreas.entries()) {
      if (count > 2) { // If issue occurs multiple times
        insights.push({
          area,
          issue: `Users reporting issues with ${area}`,
          suggestion: this.getSuggestionForArea(area),
          frequency: count,
          priority: count > 5 ? 'high' : count > 3 ? 'medium' : 'low',
        });
      }
    }

    return insights.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get improvement suggestion for area
   */
  private getSuggestionForArea(area: string): string {
    const suggestions: Record<string, string> = {
      accuracy: 'Review task detection logic and improve pattern matching',
      brevity: 'Shorten responses while maintaining key information',
      detail: 'Add more examples and explanations to responses',
      clarity: 'Use simpler language and better structure',
      helpfulness: 'Provide more actionable advice and specific steps',
      tone: 'Adjust communication style to be more empathetic',
      general: 'Review overall response quality',
    };

    return suggestions[area] || suggestions.general;
  }

  /**
   * Calculate success rate
   */
  async getSuccessRate(taskType?: string): Promise<number> {
    let relevantFeedback = this.feedbackHistory;
    
    if (taskType) {
      relevantFeedback = relevantFeedback.filter(f => f.taskType === taskType);
    }

    if (relevantFeedback.length === 0) return 0;

    const positive = relevantFeedback.filter(f => f.feedback === 'positive').length;
    return (positive / relevantFeedback.length) * 100;
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<{
    totalInteractions: number;
    positiveRate: number;
    negativeRate: number;
    topIssues: string[];
    topSuccesses: string[];
  }> {
    const total = this.feedbackHistory.length;
    const positive = this.feedbackHistory.filter(f => f.feedback === 'positive').length;
    const negative = this.feedbackHistory.filter(f => f.feedback === 'negative').length;

    const positiveRate = total > 0 ? (positive / total) * 100 : 0;
    const negativeRate = total > 0 ? (negative / total) * 100 : 0;

    // Get top issues
    const topIssues = Array.from(this.improvementAreas.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area);

    // Get successful task types
    const taskSuccesses = new Map<string, number>();
    this.feedbackHistory
      .filter(f => f.feedback === 'positive')
      .forEach(f => {
        taskSuccesses.set(f.taskType, (taskSuccesses.get(f.taskType) || 0) + 1);
      });

    const topSuccesses = Array.from(taskSuccesses.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([task]) => task);

    return {
      totalInteractions: total,
      positiveRate,
      negativeRate,
      topIssues,
      topSuccesses,
    };
  }
}

export default ContinuousImprovementService.getInstance();
