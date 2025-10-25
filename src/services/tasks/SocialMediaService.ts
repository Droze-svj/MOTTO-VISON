/**
 * Social Media Service
 * Helps create social media posts for various platforms
 */

interface SocialMediaRequest {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'general';
  topic: string;
  tone?: 'professional' | 'casual' | 'humorous' | 'inspirational';
  includeHashtags?: boolean;
}

interface SocialMediaPost {
  content: string;
  hashtags: string[];
  characterCount: number;
  tips: string[];
  platform: string;
}

class SocialMediaService {
  private static instance: SocialMediaService;

  // Character limits for each platform
  private platformLimits = {
    twitter: 280,
    instagram: 2200,
    linkedin: 3000,
    facebook: 63206,
    general: 500,
  };

  private constructor() {
    console.log('[Social Media] Service initialized');
  }

  static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService();
    }
    return SocialMediaService.instance;
  }

  /**
   * Generate social media post
   */
  async generatePost(request: SocialMediaRequest): Promise<SocialMediaPost> {
    const { platform, topic, tone = 'casual', includeHashtags = true } = request;
    const limit = this.platformLimits[platform];

    console.log(`[Social Media] Creating ${platform} post about: ${topic}`);

    const content = this.generateContent(platform, topic, tone, limit);
    const hashtags = includeHashtags ? this.generateHashtags(topic, platform) : [];
    const tips = this.getPlatformTips(platform);

    return {
      content,
      hashtags,
      characterCount: content.length,
      tips,
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    };
  }

  /**
   * Generate content for platform
   */
  private generateContent(
    platform: string,
    topic: string,
    tone: string,
    limit: number
  ): string {
    const toneStyles = {
      professional: {
        opener: `Excited to share insights on ${topic}.`,
        body: `${topic} is transforming how we work. Key takeaways:`,
        closer: 'What are your thoughts?',
      },
      casual: {
        opener: `Let's talk about ${topic}! 🎉`,
        body: `${topic} is pretty cool. Here's why:`,
        closer: 'What do you think?',
      },
      humorous: {
        opener: `${topic}? Let me explain with dad jokes! 😄`,
        body: `So basically ${topic} is like...`,
        closer: 'Am I right? 😂',
      },
      inspirational: {
        opener: `${topic} reminds us that anything is possible. ✨`,
        body: `Every day, ${topic} shows us:`,
        closer: 'Keep pushing forward! 💪',
      },
    };

    const style = toneStyles[tone] || toneStyles.casual;

    let content = `${style.opener}\n\n`;

    if (platform === 'twitter') {
      // Short and punchy for Twitter
      content = `${topic} is changing the game! 🚀 Here's what you need to know. ${style.closer}`;
    } else if (platform === 'linkedin') {
      // Professional and detailed for LinkedIn
      content += `${style.body}\n\n`;
      content += `• Point 1 about ${topic}\n`;
      content += `• Point 2\n`;
      content += `• Point 3\n\n`;
      content += style.closer;
    } else if (platform === 'instagram') {
      // Visual and engaging for Instagram
      content += `${topic} has been on my mind lately. 💭\n\n`;
      content += `Here's what I've learned... [describe in engaging way]\n\n`;
      content += `${style.closer}`;
    } else {
      // General format
      content += `${style.body}\n\n`;
      content += `[Add your main points here]\n\n`;
      content += style.closer;
    }

    // Ensure within limit
    if (content.length > limit - 50) {
      content = content.substring(0, limit - 50) + '...';
    }

    return content;
  }

  /**
   * Generate relevant hashtags
   */
  private generateHashtags(topic: string, platform: string): string[] {
    // Generate topic-related hashtags
    const words = topic.split(' ').filter(w => w.length > 3);
    const topicTags = words.map(w => `#${w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()}`);

    // Platform-specific popular tags
    const platformTags = {
      twitter: ['#Thread', '#MustRead', '#ICYMI'],
      instagram: ['#InstaGood', '#PhotoOfTheDay', '#Inspo'],
      linkedin: ['#ProfessionalDevelopment', '#CareerGrowth', '#Industry'],
      facebook: ['#Community', '#Sharing'],
      general: ['#Trending', '#Interesting'],
    };

    return [...topicTags.slice(0, 3), ...platformTags[platform].slice(0, 2)];
  }

  /**
   * Get platform-specific tips
   */
  private getPlatformTips(platform: string): string[] {
    const tips = {
      twitter: [
        '✓ Keep it under 280 characters',
        '✓ Use 1-2 relevant hashtags',
        '✓ Add engaging question',
        '✓ Post during peak hours (12pm-3pm)',
      ],
      instagram: [
        '✓ First line is crucial (preview)',
        '✓ Use 5-10 hashtags',
        '✓ Include call-to-action',
        '✓ Add emoji for personality',
      ],
      linkedin: [
        '✓ Professional tone',
        '✓ Share insights or lessons',
        '✓ Ask engaging question',
        '✓ Tag relevant people/companies',
      ],
      facebook: [
        '✓ Tell a story',
        '✓ Ask for engagement',
        '✓ Keep it conversational',
        '✓ Add relevant photo/video',
      ],
      general: [
        '✓ Know your audience',
        '✓ Be authentic',
        '✓ Engage with comments',
        '✓ Post consistently',
      ],
    };

    return tips[platform] || tips.general;
  }

  /**
   * Format social media post
   */
  formatPost(post: SocialMediaPost): string {
    let text = `📱 ${post.platform} Post\n\n`;
    text += `${post.content}\n\n`;
    
    if (post.hashtags.length > 0) {
      text += `Hashtags: ${post.hashtags.join(' ')}\n\n`;
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 Character Count: ${post.characterCount}\n\n`;
    text += `📝 Tips:\n${post.tips.join('\n')}\n`;
    
    return text;
  }
}

export default SocialMediaService.getInstance();
