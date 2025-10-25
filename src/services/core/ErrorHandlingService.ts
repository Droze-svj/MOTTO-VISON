/**
 * Error Handling Service
 * Robust error handling with graceful degradation and fallback strategies
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface ErrorLog {
  id: string;
  timestamp: number;
  service: string;
  operation: string;
  error: any;
  context?: any;
  recovered: boolean;
  recoveryStrategy?: string;
}

interface FallbackStrategy {
  name: string;
  priority: number;
  handler: () => Promise<any>;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorLogs: ErrorLog[] = [];
  private readonly MAX_ERROR_LOGS = 100;

  private constructor() {}

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Safe Execute - Try with fallback strategies
   */
  async safeExecute<T>(
    operation: string,
    primaryFn: () => Promise<T>,
    fallbacks: FallbackStrategy[] = [],
    context?: any
  ): Promise<T | null> {
    const startTime = Date.now();

    // Try primary function
    try {
      const result = await primaryFn();
      console.log(`[Safety] ${operation}: Success (${Date.now() - startTime}ms)`);
      return result;
    } catch (primaryError) {
      console.warn(`[Safety] ${operation}: Primary failed`, primaryError);
      
      // Log error
      this.logError(operation, 'primary', primaryError, context, false);

      // Try fallback strategies in order of priority
      const sortedFallbacks = [...fallbacks].sort((a, b) => a.priority - b.priority);
      
      for (const fallback of sortedFallbacks) {
        try {
          console.log(`[Safety] ${operation}: Trying fallback: ${fallback.name}`);
          const result = await fallback.handler();
          
          // Log successful recovery
          this.logError(operation, fallback.name, primaryError, context, true, fallback.name);
          console.log(`[Safety] ${operation}: Recovered via ${fallback.name}`);
          
          return result;
        } catch (fallbackError) {
          console.warn(`[Safety] ${operation}: Fallback ${fallback.name} failed`, fallbackError);
          continue;
        }
      }

      // All strategies failed
      console.error(`[Safety] ${operation}: All strategies exhausted`);
      this.logError(operation, 'all_failed', primaryError, context, false);
      
      return null;
    }
  }

  /**
   * Safe Fetch - Network requests with retry and timeout
   */
  async safeFetch(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    timeout: number = 5000
  ): Promise<Response | null> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        // Non-200 status
        console.warn(`[SafeFetch] ${url}: Status ${response.status}`);
        
        if (response.status >= 500) {
          // Server error - retry
          attempt++;
          await this.delay(1000 * attempt); // Exponential backoff
          continue;
        }

        // Client error - don't retry
        return null;

      } catch (error: any) {
        attempt++;
        
        if (error.name === 'AbortError') {
          console.warn(`[SafeFetch] ${url}: Timeout after ${timeout}ms`);
        } else {
          console.warn(`[SafeFetch] ${url}: Error`, error);
        }

        if (attempt < maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    console.error(`[SafeFetch] ${url}: Failed after ${maxRetries} attempts`);
    return null;
  }

  /**
   * Safe Translation - Multiple fallback strategies
   */
  async safeTranslation(
    text: string,
    targetLang: string,
    translateFn: (text: string, lang: string) => Promise<string>
  ): Promise<{ text: string; method: string }> {
    return await this.safeExecute(
      'translation',
      async () => {
        const result = await translateFn(text, targetLang);
        return { text: result, method: 'primary' };
      },
      [
        {
          name: 'no-translation',
          priority: 1,
          handler: async () => ({ text, method: 'original' })
        }
      ]
    ) || { text, method: 'fallback' };
  }

  /**
   * Safe Knowledge Collection
   */
  async safeKnowledgeCollection(
    query: string,
    sources: { name: string; fn: () => Promise<any> }[]
  ): Promise<{ source: string; data: any }[]> {
    const results: { source: string; data: any }[] = [];

    // Try all sources in parallel but catch individual failures
    const promises = sources.map(async (source) => {
      try {
        const data = await source.fn();
        return { source: source.name, data, success: true };
      } catch (error) {
        console.warn(`[Safety] Source ${source.name} failed:`, error);
        return { source: source.name, data: null, success: false };
      }
    });

    const settled = await Promise.all(promises);
    
    // Return only successful sources
    settled.forEach(result => {
      if (result.success && result.data) {
        results.push({ source: result.source, data: result.data });
      }
    });

    console.log(`[Safety] Knowledge collection: ${results.length}/${sources.length} sources successful`);
    
    return results;
  }

  /**
   * Circuit Breaker - Prevent cascading failures
   */
  private circuitBreakers: Map<string, {
    failures: number;
    lastFailure: number;
    state: 'closed' | 'open' | 'half-open';
  }> = new Map();

  async withCircuitBreaker<T>(
    serviceName: string,
    fn: () => Promise<T>,
    threshold: number = 5
  ): Promise<T | null> {
    let breaker = this.circuitBreakers.get(serviceName);
    
    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, state: 'closed' };
      this.circuitBreakers.set(serviceName, breaker);
    }

    // Check circuit state
    if (breaker.state === 'open') {
      // Check if enough time has passed to try again
      if (Date.now() - breaker.lastFailure > 60000) { // 1 minute
        breaker.state = 'half-open';
        console.log(`[CircuitBreaker] ${serviceName}: Half-open (trying again)`);
      } else {
        console.warn(`[CircuitBreaker] ${serviceName}: Open (rejecting call)`);
        return null;
      }
    }

    // Try execution
    try {
      const result = await fn();
      
      // Success - reset breaker
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        breaker.failures = 0;
        console.log(`[CircuitBreaker] ${serviceName}: Closed (recovered)`);
      }
      
      return result;
    } catch (error) {
      // Failure - update breaker
      breaker.failures++;
      breaker.lastFailure = Date.now();

      if (breaker.failures >= threshold) {
        breaker.state = 'open';
        console.error(`[CircuitBreaker] ${serviceName}: Open (${breaker.failures} failures)`);
      }

      throw error;
    }
  }

  /**
   * Graceful degradation - Return best available result
   */
  async gracefulDegrade<T>(
    operation: string,
    strategies: { name: string; fn: () => Promise<T> }[],
    minQuality: number = 0.5
  ): Promise<{ result: T | null; quality: number; strategy: string }> {
    for (const strategy of strategies) {
      try {
        const result = await strategy.fn();
        const quality = this.estimateQuality(result);
        
        if (quality >= minQuality) {
          console.log(`[Degradation] ${operation}: Using ${strategy.name} (quality: ${quality})`);
          return { result, quality, strategy: strategy.name };
        }
      } catch (error) {
        console.warn(`[Degradation] ${operation}: ${strategy.name} failed`, error);
        continue;
      }
    }

    console.error(`[Degradation] ${operation}: All strategies below quality threshold`);
    return { result: null, quality: 0, strategy: 'none' };
  }

  /**
   * Estimate result quality (simple heuristic)
   */
  private estimateQuality(result: any): number {
    if (!result) return 0;
    if (typeof result === 'string' && result.length > 50) return 0.8;
    if (typeof result === 'object' && Object.keys(result).length > 0) return 0.9;
    return 0.5;
  }

  /**
   * User-friendly error messages
   */
  getUserFriendlyMessage(error: any, operation: string): string {
    const messages: { [key: string]: string } = {
      'network': "Hmm, I'm having trouble connecting. Please check your internet and try again! 📡",
      'translation': "I couldn't translate that, but I can still help you in English! 🌍",
      'knowledge': "I couldn't fetch the latest data, but I'll use what I know! 📚",
      'storage': "Oops! Storage issue. Your data is safe, just a temporary hiccup! 💾",
      'timeout': "That's taking longer than expected. Let me try a faster approach! ⚡",
      'api_limit': "I've hit a rate limit. Let me use an alternative source! 🔄",
      'default': "Something unexpected happened, but I'm still here to help! Let's try again! 🙏"
    };

    // Detect error type
    const errorStr = error.toString().toLowerCase();
    
    if (errorStr.includes('network') || errorStr.includes('fetch')) return messages.network;
    if (errorStr.includes('translat')) return messages.translation;
    if (errorStr.includes('timeout') || errorStr.includes('abort')) return messages.timeout;
    if (errorStr.includes('429') || errorStr.includes('rate')) return messages.api_limit;
    if (errorStr.includes('storage') || errorStr.includes('quota')) return messages.storage;
    
    return messages.default;
  }

  /**
   * Log error
   */
  private logError(
    service: string,
    operation: string,
    error: any,
    context: any = null,
    recovered: boolean = false,
    recoveryStrategy?: string
  ): void {
    const errorLog: ErrorLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      service,
      operation,
      error: error.toString(),
      context,
      recovered,
      recoveryStrategy,
    };

    this.errorLogs.push(errorLog);
    
    // Keep only last MAX_ERROR_LOGS
    if (this.errorLogs.length > this.MAX_ERROR_LOGS) {
      this.errorLogs.shift();
    }

    // Save to storage for debugging
    this.saveErrorLogs().catch(err => 
      console.error('[ErrorHandling] Failed to save logs:', err)
    );
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    recoveredErrors: number;
    recoveryRate: number;
    topErrors: { service: string; count: number }[];
    recentErrors: ErrorLog[];
  } {
    const totalErrors = this.errorLogs.length;
    const recoveredErrors = this.errorLogs.filter(e => e.recovered).length;
    const recoveryRate = totalErrors > 0 ? recoveredErrors / totalErrors : 0;

    // Count errors by service
    const serviceCounts = new Map<string, number>();
    this.errorLogs.forEach(log => {
      serviceCounts.set(log.service, (serviceCounts.get(log.service) || 0) + 1);
    });

    const topErrors = Array.from(serviceCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([service, count]) => ({ service, count }));

    return {
      totalErrors,
      recoveredErrors,
      recoveryRate: Math.round(recoveryRate * 100) / 100,
      topErrors,
      recentErrors: this.errorLogs.slice(-10),
    };
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T | null> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed`);
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await this.delay(delay);
        }
      }
    }

    console.error(`[Retry] All ${maxRetries} attempts failed`);
    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Safe Promise.all - Don't fail if one promise fails
   */
  async safeAllSettled<T>(
    promises: Promise<T>[]
  ): Promise<{ success: T[]; failures: any[] }> {
    const results = await Promise.allSettled(promises);
    
    const success: T[] = [];
    const failures: any[] = [];

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        failures.push(result.reason);
      }
    });

    console.log(`[SafeAllSettled] ${success.length} succeeded, ${failures.length} failed`);
    
    return { success, failures };
  }

  /**
   * Timeout wrapper
   */
  async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
      ),
    ]);
  }

  /**
   * Error boundary wrapper for components
   */
  wrapComponentError(componentName: string, error: Error, errorInfo: any): void {
    console.error(`[ErrorBoundary] ${componentName}:`, error, errorInfo);
    
    this.logError(
      'UI',
      componentName,
      error,
      errorInfo,
      false
    );
  }

  // Persistence
  private async saveErrorLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem('error_logs', JSON.stringify(this.errorLogs));
    } catch (error) {
      console.error('[ErrorHandling] Save logs error:', error);
    }
  }

  async getRecentErrors(): Promise<ErrorLog[]> {
    return this.errorLogs.slice(-10);
  }

  clearErrorLogs(): void {
    this.errorLogs = [];
    AsyncStorage.removeItem('error_logs').catch(() => {});
  }
}

export default ErrorHandlingService.getInstance();
