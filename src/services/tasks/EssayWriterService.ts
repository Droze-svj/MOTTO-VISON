/**
 * Essay Writer Service
 * Helps users write essays, papers, and articles
 */

interface EssayRequest {
  topic: string;
  type?: 'argumentative' | 'narrative' | 'expository' | 'persuasive' | 'research';
  length?: 'short' | 'medium' | 'long'; // paragraphs
  tone?: 'formal' | 'casual' | 'academic';
}

interface EssayOutline {
  title: string;
  introduction: {
    hook: string;
    background: string;
    thesis: string;
  };
  bodyParagraphs: {
    number: number;
    topic: string;
    points: string[];
  }[];
  conclusion: {
    summary: string;
    finalThought: string;
  };
  wordCount: number;
}

class EssayWriterService {
  private static instance: EssayWriterService;

  private constructor() {
    console.log('[Essay Writer] Service initialized');
  }

  static getInstance(): EssayWriterService {
    if (!EssayWriterService.instance) {
      EssayWriterService.instance = new EssayWriterService();
    }
    return EssayWriterService.instance;
  }

  /**
   * Generate essay outline
   */
  async generateOutline(request: EssayRequest): Promise<EssayOutline> {
    const { topic, type = 'expository', length = 'medium', tone = 'academic' } = request;
    
    console.log(`[Essay Writer] Generating ${type} essay on: ${topic}`);

    const paragraphCount = length === 'short' ? 3 : length === 'long' ? 5 : 4;

    const outline: EssayOutline = {
      title: this.generateTitle(topic, type),
      introduction: {
        hook: this.generateHook(topic, type),
        background: `Background information about ${topic} that provides context for the reader.`,
        thesis: this.generateThesis(topic, type),
      },
      bodyParagraphs: [],
      conclusion: {
        summary: `In summary, ${topic} is significant because...`,
        finalThought: this.generateFinalThought(topic, type),
      },
      wordCount: paragraphCount * 150, // Estimate
    };

    // Generate body paragraphs
    for (let i = 0; i < paragraphCount; i++) {
      outline.bodyParagraphs.push({
        number: i + 1,
        topic: `Main Point ${i + 1} about ${topic}`,
        points: [
          `• Topic sentence introducing the main idea`,
          `• Evidence or example supporting the point`,
          `• Analysis explaining the significance`,
          `• Transition to next paragraph`,
        ],
      });
    }

    return outline;
  }

  /**
   * Generate essay title
   */
  private generateTitle(topic: string, type: string): string {
    const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    
    const templates = {
      argumentative: `The Case for ${capitalizedTopic}`,
      narrative: `My Experience with ${capitalizedTopic}`,
      expository: `Understanding ${capitalizedTopic}`,
      persuasive: `Why ${capitalizedTopic} Matters`,
      research: `${capitalizedTopic}: A Comprehensive Analysis`,
    };

    return templates[type] || `${capitalizedTopic}: An Essay`;
  }

  /**
   * Generate hook
   */
  private generateHook(topic: string, type: string): string {
    const hooks = {
      argumentative: `Imagine a world where ${topic} is fully realized. What would that look like?`,
      narrative: `It was the moment when ${topic} changed everything for me.`,
      expository: `Have you ever wondered about ${topic}? Let's explore.`,
      persuasive: `${topic} is more important than you might think. Here's why.`,
      research: `Recent studies on ${topic} have revealed fascinating insights.`,
    };

    return hooks[type] || `${topic} is a subject worth exploring.`;
  }

  /**
   * Generate thesis statement
   */
  private generateThesis(topic: string, type: string): string {
    return `This essay will explore ${topic}, examining its key aspects and significance.`;
  }

  /**
   * Generate final thought
   */
  private generateFinalThought(topic: string, type: string): string {
    const thoughts = {
      argumentative: `Therefore, ${topic} deserves our attention and action.`,
      narrative: `Through this experience with ${topic}, I gained valuable insights.`,
      expository: `Understanding ${topic} helps us better comprehend the world around us.`,
      persuasive: `Now is the time to act on ${topic}. The future depends on it.`,
      research: `Further research on ${topic} could yield even more significant discoveries.`,
    };

    return thoughts[type] || `${topic} remains an important area for continued exploration.`;
  }

  /**
   * Format outline as text
   */
  formatOutline(outline: EssayOutline): string {
    let text = `# ${outline.title}\n\n`;
    text += `📝 Estimated Word Count: ${outline.wordCount} words\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Introduction
    text += `## Introduction\n\n`;
    text += `**Hook:** ${outline.introduction.hook}\n\n`;
    text += `**Background:** ${outline.introduction.background}\n\n`;
    text += `**Thesis Statement:** ${outline.introduction.thesis}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Body paragraphs
    for (const para of outline.bodyParagraphs) {
      text += `## Body Paragraph ${para.number}\n\n`;
      text += `**Topic:** ${para.topic}\n\n`;
      for (const point of para.points) {
        text += `${point}\n`;
      }
      text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    // Conclusion
    text += `## Conclusion\n\n`;
    text += `**Summary:** ${outline.conclusion.summary}\n\n`;
    text += `**Final Thought:** ${outline.conclusion.finalThought}\n\n`;

    return text;
  }
}

export default EssayWriterService.getInstance();
