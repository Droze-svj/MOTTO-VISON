/**
 * Friendly Error Messages
 * Human-friendly error messages for better UX
 */

export class FriendlyErrorMessages {
  /**
   * Convert technical error to friendly message
   */
  static getFriendlyMessage(error: any, context?: string): string {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorLower = errorMessage.toLowerCase();

    // Network errors
    if (errorLower.includes('network') || errorLower.includes('fetch')) {
      return "Hmm, I'm having trouble connecting right now. Check your internet connection and try again! 📡";
    }

    if (errorLower.includes('timeout')) {
      return "That took a bit too long! Let's try that again. ⏱️";
    }

    if (errorLower.includes('abort')) {
      return "Oops, that request was cancelled. Want to try again? 🔄";
    }

    // API errors
    if (errorLower.includes('401') || errorLower.includes('unauthorized')) {
      return "Looks like you need to log in again. Let's get you back in! 🔐";
    }

    if (errorLower.includes('403') || errorLower.includes('forbidden')) {
      return "Sorry, you don't have permission for that. Need help? 🚫";
    }

    if (errorLower.includes('404') || errorLower.includes('not found')) {
      return "I couldn't find what you're looking for. Maybe try something else? 🔍";
    }

    if (errorLower.includes('429') || errorLower.includes('rate limit')) {
      return "Whoa, slow down there! You're going too fast. Let's take a quick break. ⏸️";
    }

    if (errorLower.includes('500') || errorLower.includes('server error')) {
      return "Something went wrong on my end. Give me a moment to sort things out! 🛠️";
    }

    // Voice errors
    if (context === 'voice' || errorLower.includes('voice') || errorLower.includes('microphone')) {
      return "I couldn't hear you clearly. Make sure your microphone is working and try again! 🎤";
    }

    if (errorLower.includes('permission')) {
      return "I need your permission to do that. Check your settings! 🔐";
    }

    // Translation errors
    if (context === 'translation' || errorLower.includes('translat')) {
      return "I had trouble translating that. Let's try in a different language! 🌍";
    }

    // Cache errors
    if (context === 'cache' || errorLower.includes('cache')) {
      return "I'm having a memory issue. Don't worry, I'll figure it out! 🧠";
    }

    // Storage errors
    if (errorLower.includes('storage') || errorLower.includes('disk')) {
      return "I'm running low on space. Try clearing some data in Settings! 💾";
    }

    // Parse errors
    if (errorLower.includes('parse') || errorLower.includes('json') || errorLower.includes('syntax')) {
      return "I got a bit confused reading that. Let's try again! 🤔";
    }

    // Generic errors by context
    if (context === 'chat') {
      return "I had trouble processing that message. Mind trying again? 💬";
    }

    if (context === 'ai') {
      return "My AI brain had a hiccup! Give me another shot? 🤖";
    }

    if (context === 'context') {
      return "I lost track of our conversation. Could you repeat that? 💭";
    }

    // Default friendly message
    return "Oops! Something unexpected happened. Let's give it another try! 🎯";
  }

  /**
   * Get loading message for different contexts
   */
  static getLoadingMessage(context?: string): string {
    const messages: { [key: string]: string[] } = {
      chat: [
        "MOTTO is thinking... 🤔",
        "Processing your message... ⚡",
        "Getting smart... 🧠",
        "Crafting a response... ✨",
      ],
      voice: [
        "Listening... 🎤",
        "Hearing you... 👂",
        "Processing your voice... 🗣️",
      ],
      translation: [
        "Translating... 🌍",
        "Speaking your language... 🗣️",
        "Converting... 🔄",
      ],
      loading: [
        "Loading... ⏳",
        "Getting ready... 🚀",
        "Almost there... 💫",
      ],
    };

    const contextMessages = messages[context || 'loading'] || messages.loading;
    return contextMessages[Math.floor(Math.random() * contextMessages.length)];
  }

  /**
   * Get success message
   */
  static getSuccessMessage(context?: string): string {
    const messages: { [key: string]: string[] } = {
      chat: ["Got it! ✅", "Done! 🎉", "All set! 💫"],
      save: ["Saved! 💾", "All saved! ✅", "Secured! 🔒"],
      update: ["Updated! ✅", "Changed! 🔄", "All set! 💫"],
      delete: ["Deleted! 🗑️", "Removed! ✅", "Gone! 💨"],
    };

    const contextMessages = messages[context || 'chat'] || ["Success! ✅"];
    return contextMessages[Math.floor(Math.random() * contextMessages.length)];
  }

  /**
   * Get retry message
   */
  static getRetryMessage(attempt: number): string {
    const messages = [
      `Trying again... (Attempt ${attempt}) 🔄`,
      `One more time... (Attempt ${attempt}) 💪`,
      `Not giving up! (Attempt ${attempt}) ⚡`,
      `Let's try that again... (Attempt ${attempt}) 🎯`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get empty state message
   */
  static getEmptyStateMessage(context?: string): string {
    const messages: { [key: string]: string } = {
      chat: "No messages yet. Say hi to MOTTO! 👋",
      history: "No history yet. Start chatting! 💬",
      favorites: "No favorites yet. Mark messages you love! ⭐",
      settings: "Everything looks good! ✅",
    };

    return messages[context || 'chat'] || "Nothing here yet! 📭";
  }
}

export default FriendlyErrorMessages;
