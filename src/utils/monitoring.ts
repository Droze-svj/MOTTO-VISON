/**
 * Monitoring and Error Tracking Utilities
 * Integrates with error tracking services (Sentry, etc.)
 */

interface ErrorContext {
  userId?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  [key: string]: any;
}

class MonitoringService {
  private initialized = false;
  private errorQueue: Array<{ error: Error; context: ErrorContext }> = [];

  /**
   * Initialize monitoring service
   */
  init(options?: { dsn?: string; environment?: string }) {
    if (this.initialized) return;

    // In production, initialize Sentry or other service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Example: Sentry.init({ dsn: options?.dsn, environment: options?.environment });
      console.log('[Monitoring] Initialized in production mode');
    } else {
      console.log('[Monitoring] Running in development mode');
    }

    this.initialized = true;
    this.flushErrorQueue();
  }

  /**
   * Capture and report errors
   */
  captureError(error: Error, context?: Partial<ErrorContext>) {
    const errorContext: ErrorContext = {
      userId: this.getUserId(),
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...context,
    };

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Monitoring] Error captured:', error, errorContext);
    }

    // Send to error tracking service
    if (this.initialized) {
      this.sendError(error, errorContext);
    } else {
      // Queue errors until initialized
      this.errorQueue.push({ error, context: errorContext });
    }
  }

  /**
   * Capture exception with message
   */
  captureException(message: string, error?: Error, context?: Partial<ErrorContext>) {
    const exception = error || new Error(message);
    this.captureError(exception, { ...context, message });
  }

  /**
   * Capture user actions/events
   */
  captureEvent(eventName: string, properties?: Record<string, any>) {
    const event = {
      name: eventName,
      properties,
      userId: this.getUserId(),
      timestamp: Date.now(),
    };

    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Monitoring] Event:', event);
    }

    // Send to analytics service
    this.sendEvent(event);
  }

  /**
   * Set user context
   */
  setUser(userId: string, userProperties?: Record<string, any>) {
    // Set user context for error tracking
    if (this.initialized) {
      // Sentry.setUser({ id: userId, ...userProperties });
      console.log('[Monitoring] User set:', userId);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    const breadcrumb = {
      message,
      category,
      data,
      timestamp: Date.now(),
    };

    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Monitoring] Breadcrumb:', breadcrumb);
    }

    // Add to breadcrumb trail
    // Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Performance monitoring
   */
  capturePerformance(name: string, duration: number, metadata?: Record<string, any>) {
    const performance = {
      name,
      duration,
      metadata,
      timestamp: Date.now(),
    };

    // Log slow operations
    if (duration > 1000) {
      console.warn('[Monitoring] Slow operation:', performance);
    }

    // Send to performance monitoring
    this.sendPerformance(performance);
  }

  /**
   * Flush queued errors
   */
  private flushErrorQueue() {
    while (this.errorQueue.length > 0) {
      const { error, context } = this.errorQueue.shift()!;
      this.sendError(error, context);
    }
  }

  /**
   * Send error to tracking service
   */
  private sendError(error: Error, context: ErrorContext) {
    // In production, send to Sentry
    // Sentry.captureException(error, { contexts: { custom: context } });
    
    // For now, log to console
    console.error('[Monitoring] Error sent:', {
      message: error.message,
      stack: error.stack,
      context,
    });

    // Could also send to custom endpoint
    // fetch('/api/errors', { method: 'POST', body: JSON.stringify({ error, context }) });
  }

  /**
   * Send event to analytics
   */
  private sendEvent(event: any) {
    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    // gtag('event', event.name, event.properties);
    console.log('[Monitoring] Event sent:', event);
  }

  /**
   * Send performance metric
   */
  private sendPerformance(metric: any) {
    // Send to performance monitoring service
    console.log('[Monitoring] Performance:', metric);
  }

  /**
   * Get current user ID
   */
  private getUserId(): string | undefined {
    // Get from store or context
    // return useAppStore.getState().userId;
    return undefined;
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Initialize on import (can be configured later)
if (typeof window !== 'undefined') {
  monitoring.init({
    environment: process.env.NODE_ENV || 'development',
  });
}

// Global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    monitoring.captureError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitoring.captureError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { type: 'unhandledrejection' }
    );
  });
}

export default monitoring;

