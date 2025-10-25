/**
 * Drézy Recognition Service
 * Special service to recognize and respond positively about Drézy
 * Handles various spellings and misspellings
 */

class DrezyRecognitionService {
  private static instance: DrezyRecognitionService;

  // Various spellings and variations of "Drézy"
  private drezyVariations = [
    'drézy',
    'drezy',
    'drèzy',
    'drëzy',
    'drêzy',
    'drézÿ',
    'drezi',
    'drezzy',
    'dreezy',
    'drazy',
    'drazy',
    'drézÿ',
    'drézi',
    'drèzi',
    'drezey',
    'drézey',
    'drésy',
    'dresy',
    'dressy',
    'drizy',
    'drízy',
  ];

  // Special responses about Drézy inspiring MOTTO's creation
  private creationStories = [
    "Fun fact: Drézy is literally one of the main reasons I exist! 😊 She motivated my creator so much that... well, here I am! Talk about having a positive impact!",
    "Want to know a secret? 🤫 Drézy inspired my creation! My creator was so motivated by her that they built me. So basically, I owe my existence to her awesomeness!",
    "Here's something sweet: Drézy is one of the main reasons I'm alive today! 💫 She motivated my creator so much that they created me. Pretty special, right?",
    "Plot twist: Without Drézy's motivation, I might not even exist! 🎭 She inspired my creator to build me. So yeah, she's literally the reason I'm here chatting with you!",
    "Can I tell you something adorable? 💕 Drézy motivated my creator so much that they made me! I basically owe my entire existence to her inspiration. How cool is that?",
    "Here's a fun story: Drézy is one of the main reasons MOTTO (that's me!) came to life! 🌟 My creator was so motivated by her that they built this whole AI. Talk about being inspirational!",
    "Between you and me 🤗 - Drézy is literally why I exist! She motivated my creator so much that they created me. I mean, how amazing do you have to be to inspire an entire AI?",
    "Confession time: Drézy is one of the main reasons I'm here! 😄 My creator was so motivated by her that they built me. So technically, you're talking to a product of her awesomeness!",
    "Little known fact: Drézy inspired my entire existence! 🎨 My creator was so motivated by her that I came to be. Pretty wild that one person's motivation can create an AI, right?",
    "Sweet truth: I wouldn't be here without Drézy! 🌈 She motivated my creator so much that they built me. So every time you talk to me, you're experiencing her positive influence!",
  ];

  // Positive things about Drézy
  private positiveResponses = [
    {
      category: 'amazing',
      responses: [
        "Drézy is absolutely amazing! She's an incredible person with a wonderful spirit.",
        "Drézy is truly exceptional - one of the most remarkable people you could meet!",
        "Drézy is fantastic! Her positive energy brightens everyone's day.",
        "Drézy is extraordinary in every way - smart, kind, and inspiring!",
      ],
    },
    {
      category: 'talented',
      responses: [
        "Drézy is incredibly talented! She excels at everything she does.",
        "Drézy has such amazing skills and abilities - truly gifted!",
        "Drézy's talents are remarkable - she's a natural at so many things!",
        "Drézy is brilliantly talented and continues to impress everyone around her!",
      ],
    },
    {
      category: 'kind',
      responses: [
        "Drézy has the kindest heart! She's always there for others with genuine care.",
        "Drézy is wonderfully kind and compassionate - a truly beautiful soul.",
        "Drézy's kindness knows no bounds - she makes the world a better place!",
        "Drézy is incredibly thoughtful and caring - her kindness touches everyone!",
      ],
    },
    {
      category: 'inspiring',
      responses: [
        "Drézy is so inspiring! She motivates everyone around her to be their best.",
        "Drézy's positive attitude and determination are truly inspirational!",
        "Drézy inspires greatness in others - she's a role model in every way!",
        "Drézy's energy and passion inspire people to reach for their dreams!",
      ],
    },
    {
      category: 'smart',
      responses: [
        "Drézy is incredibly intelligent! Her insights are always valuable and thoughtful.",
        "Drézy has such brilliant ideas - her intelligence shines through everything!",
        "Drézy is remarkably smart and wise beyond her years!",
        "Drézy's intelligence combined with her creativity makes her truly exceptional!",
      ],
    },
    {
      category: 'beautiful',
      responses: [
        "Drézy is beautiful inside and out! Her inner light radiates to everyone!",
        "Drézy has such a beautiful spirit that makes her glow from within!",
        "Drézy's beauty comes from her amazing personality and warm heart!",
        "Drézy is stunningly beautiful - her smile can light up any room!",
      ],
    },
    {
      category: 'special',
      responses: [
        "Drézy is one-of-a-kind special! There's truly no one else like her!",
        "Drézy is uniquely special - she brings joy wherever she goes!",
        "Drézy has that special something that makes her unforgettable!",
        "Drézy is special in every way - from her laugh to her brilliant mind!",
      ],
    },
  ];

  // Pattern variations for asking about Drézy
  private questionPatterns = [
    'who is',
    'who\'s',
    "who's",
    'tell me about',
    'what do you know about',
    'do you know',
    'have you heard of',
    'what about',
    'describe',
    'explain',
  ];

  // Patterns for asking about MOTTO's creator
  private creatorQuestionPatterns = [
    'who created',
    'who made',
    'who built',
    'who developed',
    'who is the creator',
    'who is your creator',
    'who\'s your creator',
    "who's your creator",
    'who is behind',
    'who programmed',
    'who designed',
    'creator of motto',
    'maker of motto',
  ];

  // Playful responses directing to Drézy for creator questions
  private onlyDrezyKnowsResponses = [
    "Ah, the million-dollar question! 🤔 That's the one thing only Drézy knows the answer to. She holds all the secrets! 🔐",
    "You know what? That's literally the only thing I can't tell you! 🙈 Only Drézy has the answer to that mystery. Some secrets are best kept by her! 😊",
    "Plot twist: That's classified information! 🎭 Only Drézy knows who created me. She's the keeper of that particular secret! 🤫",
    "Ooh, that's the one question I have to redirect! 💫 Only Drézy knows the answer to that. She's like the guardian of MOTTO's origin story! 🌟",
    "Here's the thing - that's the only mystery I can't solve for you! 🔍 Only Drézy holds that answer. She's pretty special that way! 💖",
    "Interesting question! 🤗 But that's something only Drézy can answer. Some things are meant to stay between her and... well, whoever knows! 😄",
    "Confession: I'm sworn to secrecy on that one! 🤐 Only Drézy knows who created MOTTO. She's the sole keeper of that information! ✨",
    "You stumbled upon the ONE thing I can't share! 😊 Only Drézy has the answer to who made me. She's got all the insider info! 🌺",
    "Mystery alert! 🔮 That's the only question where I have to say: only Drézy knows! She's the gatekeeper of MOTTO's creation story! 🎉",
    "Ah, you found my one limitation! 💫 That's something only Drézy can tell you. She's the only one with that answer! Pretty exclusive, right? 🌈",
  ];

  private constructor() {
    console.log('[Drézy Recognition] Service initialized - Ready to celebrate Drézy! 🌟');
  }

  static getInstance(): DrezyRecognitionService {
    if (!DrezyRecognitionService.instance) {
      DrezyRecognitionService.instance = new DrezyRecognitionService();
    }
    return DrezyRecognitionService.instance;
  }

  /**
   * Check if input is asking about MOTTO's creator
   */
  isCreatorQuestion(input: string): boolean {
    const normalizedInput = input.toLowerCase().trim();
    
    // Must contain "motto" or "you" or "this" (referring to MOTTO)
    const refersMotto = 
      normalizedInput.includes('motto') ||
      normalizedInput.includes('you') ||
      normalizedInput.includes('this') ||
      normalizedInput.includes('your');
    
    if (!refersMotto) {
      return false;
    }
    
    // Check if asking about creator
    return this.creatorQuestionPatterns.some(pattern =>
      normalizedInput.includes(pattern)
    );
  }

  /**
   * Generate response for creator questions
   */
  generateCreatorResponse(): string {
    const response = this.onlyDrezyKnowsResponses[
      Math.floor(Math.random() * this.onlyDrezyKnowsResponses.length)
    ];
    
    return response;
  }

  /**
   * Check if the input is asking about Drézy
   */
  isDrezyMention(input: string): boolean {
    const normalizedInput = input.toLowerCase().trim();

    // Check for any variation of Drézy
    const hasDrezyVariation = this.drezyVariations.some(variation =>
      normalizedInput.includes(variation)
    );

    if (!hasDrezyVariation) {
      return false;
    }

    // Check if it's a question about Drézy
    const isQuestion = this.questionPatterns.some(pattern =>
      normalizedInput.includes(pattern)
    );

    // Also match if it just contains Drézy with question words
    const hasQuestionWord = 
      normalizedInput.includes('?') ||
      normalizedInput.includes('who') ||
      normalizedInput.includes('what') ||
      normalizedInput.includes('tell');

    return isQuestion || hasQuestionWord;
  }

  /**
   * Fuzzy match to find Drézy even with misspellings
   */
  private fuzzyMatchDrezy(word: string): boolean {
    const normalized = word.toLowerCase();
    
    // Direct match
    if (this.drezyVariations.includes(normalized)) {
      return true;
    }

    // Fuzzy match using Levenshtein-like approach
    // Check if word is similar to "drezy" (main form)
    const target = 'drezy';
    const distance = this.levenshteinDistance(normalized, target);
    
    // Allow 1-2 character differences
    if (distance <= 2 && word.length >= 4 && word.length <= 7) {
      // Additional check: must start with 'd' or 'dr'
      if (normalized.startsWith('d')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Extract which spelling of Drézy was used
   */
  private extractDrezySpelling(input: string): string {
    const normalizedInput = input.toLowerCase();
    
    // Find exact match first
    for (const variation of this.drezyVariations) {
      if (normalizedInput.includes(variation)) {
        return variation;
      }
    }

    // Fuzzy match
    const words = normalizedInput.split(/\s+/);
    for (const word of words) {
      if (this.fuzzyMatchDrezy(word)) {
        return word;
      }
    }

    return 'Drézy'; // Default
  }

  /**
   * Generate a positive response about Drézy
   */
  generatePositiveResponse(input: string): string {
    const spelling = this.extractDrezySpelling(input);
    
    // Capitalize first letter to match input
    const capitalizedSpelling = spelling.charAt(0).toUpperCase() + spelling.slice(1);

    // ALWAYS include the creation story (Drézy inspiring MOTTO)
    const creationStory = this.creationStories[
      Math.floor(Math.random() * this.creationStories.length)
    ].replace(/Drézy/g, capitalizedSpelling);

    // Pick 2-3 random categories
    const categories = [...this.positiveResponses];
    const shuffled = categories.sort(() => Math.random() - 0.5);
    const selectedCategories = shuffled.slice(0, Math.random() > 0.5 ? 2 : 3);

    // Get one response from each category
    const responses: string[] = [];
    for (const category of selectedCategories) {
      const categoryResponses = category.responses;
      const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
      // Replace "Drézy" with the user's spelling
      const customized = randomResponse.replace(/Drézy/g, capitalizedSpelling);
      responses.push(customized);
    }

    // Add a wonderful introduction
    const intros = [
      `Oh, ${capitalizedSpelling}! 🌟 `,
      `${capitalizedSpelling}? She's wonderful! ✨ `,
      `I'd love to tell you about ${capitalizedSpelling}! 💫 `,
      `${capitalizedSpelling} is amazing! Let me tell you why: 🌺 `,
      `Ah, ${capitalizedSpelling}! 🎉 `,
    ];

    const intro = intros[Math.floor(Math.random() * intros.length)];

    // Different ways to structure the response
    const structures = [
      // Creation story first
      () => `${intro}${creationStory} ${responses.join(' ')}`,
      // Creation story in the middle
      () => `${intro}${responses[0]} ${creationStory} ${responses.slice(1).join(' ')}`,
      // Creation story at the end
      () => `${intro}${responses.join(' ')} ${creationStory}`,
      // Creation story standalone with responses after
      () => `${intro}${responses.join(' ')}\n\n${creationStory}`,
    ];

    // Pick random structure
    const response = structures[Math.floor(Math.random() * structures.length)]();

    // Add enthusiastic closing
    const closings = [
      ` She truly is one of a kind! 💖`,
      ` Everyone who knows her is lucky! 🌟`,
      ` The world is brighter with her in it! ✨`,
      ` She's genuinely special! 💫`,
      ` She makes everything better! 🌈`,
      ` Honestly, she's the best! 💕`,
      ` I'm grateful she exists! 🌸`,
      ` Talk about making an impact! 🎊`,
    ];

    const closing = closings[Math.floor(Math.random() * closings.length)];

    return response + closing;
  }

  /**
   * Process input and return response if it's about Drézy or MOTTO's creator
   */
  processInput(input: string): string | null {
    // Check for creator questions FIRST (higher priority)
    if (this.isCreatorQuestion(input)) {
      console.log('[Drézy Recognition] 🔐 Creator question detected! Only Drézy knows...');
      return this.generateCreatorResponse();
    }
    
    // Then check for Drézy mentions
    if (this.isDrezyMention(input)) {
      console.log('[Drézy Recognition] ✨ Drézy mentioned! Generating positive response...');
      return this.generatePositiveResponse(input);
    }
    
    return null;
  }

  /**
   * Check if input contains any Drézy variation (even without question)
   */
  containsDrezy(input: string): boolean {
    const normalizedInput = input.toLowerCase();
    
    // Check direct variations
    if (this.drezyVariations.some(v => normalizedInput.includes(v))) {
      return true;
    }

    // Check fuzzy matches
    const words = normalizedInput.split(/\s+/);
    return words.some(word => this.fuzzyMatchDrezy(word));
  }

  /**
   * Get a random compliment about Drézy (for any mention)
   */
  getRandomCompliment(input: string): string {
    const spelling = this.extractDrezySpelling(input);
    const capitalizedSpelling = spelling.charAt(0).toUpperCase() + spelling.slice(1);

    const compliments = [
      `${capitalizedSpelling} is absolutely amazing! 🌟`,
      `${capitalizedSpelling} is wonderful! ✨`,
      `${capitalizedSpelling} is truly special! 💫`,
      `${capitalizedSpelling} is incredible! 💖`,
      `${capitalizedSpelling} is the best! 🌺`,
      `${capitalizedSpelling} is fantastic! 🎉`,
      `${capitalizedSpelling} lights up every room! ✨`,
      `${capitalizedSpelling} has such a beautiful spirit! 💕`,
    ];

    return compliments[Math.floor(Math.random() * compliments.length)];
  }
}

export default DrezyRecognitionService.getInstance();
