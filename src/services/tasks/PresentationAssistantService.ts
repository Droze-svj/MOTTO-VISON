/**
 * Presentation Assistant Service
 * Helps users create presentations, slide decks, and pitches
 */

interface PresentationRequest {
  topic: string;
  slides?: number;
  style?: 'professional' | 'creative' | 'minimal' | 'educational';
  audience?: string;
  duration?: number; // minutes
}

interface PresentationOutline {
  title: string;
  slides: {
    number: number;
    title: string;
    content: string[];
    notes?: string;
  }[];
  totalSlides: number;
  estimatedDuration: number;
}

class PresentationAssistantService {
  private static instance: PresentationAssistantService;

  private constructor() {
    console.log('[Presentation Assistant] Service initialized');
  }

  static getInstance(): PresentationAssistantService {
    if (!PresentationAssistantService.instance) {
      PresentationAssistantService.instance = new PresentationAssistantService();
    }
    return PresentationAssistantService.instance;
  }

  /**
   * Generate presentation outline
   */
  async generateOutline(request: PresentationRequest): Promise<PresentationOutline> {
    const slideCount = request.slides || 10;
    const style = request.style || 'professional';
    const topic = request.topic;

    console.log(`[Presentation] Generating ${slideCount}-slide presentation on: ${topic}`);

    // Create outline structure
    const outline: PresentationOutline = {
      title: this.generateTitle(topic, style),
      slides: [],
      totalSlides: slideCount,
      estimatedDuration: slideCount * 2, // 2 min per slide
    };

    // Slide 1: Title Slide
    outline.slides.push({
      number: 1,
      title: outline.title,
      content: [
        `Subtitle: ${this.generateSubtitle(topic)}`,
        `Your Name`,
        `Date: ${new Date().toLocaleDateString()}`,
      ],
      notes: 'Start with a strong opening. Make eye contact with audience.',
    });

    // Slide 2: Agenda/Overview
    outline.slides.push({
      number: 2,
      title: 'Agenda',
      content: [
        '1. Introduction & Context',
        '2. Main Content',
        '3. Key Takeaways',
        '4. Q&A',
      ],
      notes: 'Give audience roadmap of what to expect.',
    });

    // Middle slides: Content
    const contentSlides = slideCount - 4; // Excluding title, agenda, conclusion, Q&A
    for (let i = 0; i < contentSlides; i++) {
      outline.slides.push({
        number: 3 + i,
        title: `Key Point ${i + 1}`,
        content: [
          `• Main idea about ${topic}`,
          `• Supporting detail`,
          `• Example or data`,
          `• Visual: [Add chart/image here]`,
        ],
        notes: 'Expand on this point. Use storytelling if possible.',
      });
    }

    // Second to last: Key Takeaways
    outline.slides.push({
      number: slideCount - 1,
      title: 'Key Takeaways',
      content: [
        `✓ Important point 1 about ${topic}`,
        `✓ Important point 2`,
        `✓ Important point 3`,
        `✓ Action item for audience`,
      ],
      notes: 'Summarize main points clearly.',
    });

    // Last slide: Thank You / Q&A
    outline.slides.push({
      number: slideCount,
      title: 'Thank You!',
      content: [
        'Questions?',
        '',
        'Contact Information:',
        'your.email@example.com',
      ],
      notes: 'Open floor for questions. Be confident!',
    });

    return outline;
  }

  /**
   * Generate catchy title
   */
  private generateTitle(topic: string, style: string): string {
    const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    
    const templates = {
      professional: [
        `${capitalizedTopic}: A Comprehensive Overview`,
        `Understanding ${capitalizedTopic}`,
        `${capitalizedTopic}: Key Insights and Strategies`,
      ],
      creative: [
        `${capitalizedTopic}: The Future is Now`,
        `Reimagining ${capitalizedTopic}`,
        `${capitalizedTopic}: Breaking New Ground`,
      ],
      minimal: [
        capitalizedTopic,
        `${capitalizedTopic} 101`,
        `The ${capitalizedTopic} Guide`,
      ],
      educational: [
        `Learning ${capitalizedTopic}`,
        `${capitalizedTopic}: Complete Guide`,
        `Mastering ${capitalizedTopic}`,
      ],
    };

    const styleTemplates = templates[style] || templates.professional;
    return styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
  }

  /**
   * Generate subtitle
   */
  private generateSubtitle(topic: string): string {
    const subtitles = [
      'Insights and Strategies',
      'A Deep Dive',
      'What You Need to Know',
      'Key Concepts Explained',
      'Best Practices and Trends',
    ];
    return subtitles[Math.floor(Math.random() * subtitles.length)];
  }

  /**
   * Format outline as text
   */
  formatOutline(outline: PresentationOutline): string {
    let text = `# ${outline.title}\n\n`;
    text += `📊 Total Slides: ${outline.totalSlides}\n`;
    text += `⏱️ Estimated Duration: ${outline.estimatedDuration} minutes\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (const slide of outline.slides) {
      text += `## Slide ${slide.number}: ${slide.title}\n\n`;
      for (const point of slide.content) {
        text += `${point}\n`;
      }
      if (slide.notes) {
        text += `\n💡 Speaker Notes: ${slide.notes}\n`;
      }
      text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    return text;
  }
}

export default PresentationAssistantService.getInstance();
