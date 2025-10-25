/**
 * Brainstorm Service
 * Helps generate ideas, solutions, and creative thinking
 */

interface BrainstormRequest {
  topic: string;
  type?: 'ideas' | 'solutions' | 'names' | 'features' | 'general';
  count?: number;
}

interface BrainstormResult {
  topic: string;
  ideas: {
    title: string;
    description: string;
    pros?: string[];
    cons?: string[];
  }[];
  techniques: string[];
}

class BrainstormService {
  private static instance: BrainstormService;

  private constructor() {
    console.log('[Brainstorm] Service initialized');
  }

  static getInstance(): BrainstormService {
    if (!BrainstormService.instance) {
      BrainstormService.instance = new BrainstormService();
    }
    return BrainstormService.instance;
  }

  /**
   * Generate brainstorm ideas
   */
  async brainstorm(request: BrainstormRequest): Promise<BrainstormResult> {
    const { topic, type = 'ideas', count = 5 } = request;

    console.log(`[Brainstorm] Generating ${count} ${type} for: ${topic}`);

    const ideas: BrainstormResult['ideas'] = [];

    for (let i = 0; i < count; i++) {
      ideas.push({
        title: `Idea ${i + 1}: [Creative approach to ${topic}]`,
        description: `This idea involves [description]. It could work by [explanation].`,
        pros: [
          '✓ Advantage 1',
          '✓ Advantage 2',
        ],
        cons: [
          '✗ Challenge 1',
          '✗ Challenge 2',
        ],
      });
    }

    return {
      topic,
      ideas,
      techniques: this.getBrainstormTechniques(),
    };
  }

  /**
   * Get brainstorming techniques
   */
  private getBrainstormTechniques(): string[] {
    return [
      '🧠 Mind Mapping - Create visual connections',
      '💡 SCAMPER - Substitute, Combine, Adapt, Modify, Put to use, Eliminate, Reverse',
      '🎯 5 Whys - Ask "why" repeatedly to find root causes',
      '🔀 Random Word - Combine random words with your topic',
      '👥 Role Playing - Think from different perspectives',
      '⚡ Rapid Ideation - Set timer, generate many ideas quickly',
    ];
  }

  /**
   * Format brainstorm results
   */
  formatResults(result: BrainstormResult): string {
    let text = `💡 Brainstorm: ${result.topic}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (let i = 0; i < result.ideas.length; i++) {
      const idea = result.ideas[i];
      text += `## ${idea.title}\n\n`;
      text += `${idea.description}\n\n`;
      
      if (idea.pros) {
        text += `**Pros:**\n${idea.pros.join('\n')}\n\n`;
      }
      if (idea.cons) {
        text += `**Cons:**\n${idea.cons.join('\n')}\n\n`;
      }
      
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    text += `🎯 Brainstorming Techniques:\n${result.techniques.join('\n')}\n`;

    return text;
  }
}

export default BrainstormService.getInstance();
