/**
 * Monitoring Service
 * Consolidates: MetricsService, AnalyticsService, PerformanceService,
 * and 20+ monitoring services
 */

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceMetrics {
  apiLatency: number[];
  renderTime: number[];
  memoryUsage: number[];
  errorRate: number;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private metrics: Map<string, Metric[]>;
  private performance: PerformanceMetrics;
  private errorLog: Array<{error: Error; timestamp: number}>;

  private constructor() {
    this.metrics = new Map();
    this.performance = {
      apiLatency: [],
      renderTime: [],
      memoryUsage: [],
      errorRate: 0
    };
    this.errorLog = [];
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // ============================================
  // Metrics Collection
  // ============================================

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };

    const existing = this.metrics.get(name) || [];
    existing.push(metric);
    
    // Keep last 1000 data points
    if (existing.length > 1000) {
      existing.shift();
    }
    
    this.metrics.set(name, existing);
  }

  getMetrics(name: string, since?: number): Metric[] {
    const metrics = this.metrics.get(name) || [];
    if (since) {
      return metrics.filter(m => m.timestamp >= since);
    }
    return metrics;
  }

  // ============================================
  // Performance Tracking
  // ============================================

  trackAPICall(duration: number): void {
    this.performance.apiLatency.push(duration);
    if (this.performance.apiLatency.length > 100) {
      this.performance.apiLatency.shift();
    }
    this.recordMetric('api_latency', duration);
  }

  trackRender(duration: number): void {
    this.performance.renderTime.push(duration);
    if (this.performance.renderTime.length > 100) {
      this.performance.renderTime.shift();
    }
    this.recordMetric('render_time', duration);
  }

  trackMemory(usage: number): void {
    this.performance.memoryUsage.push(usage);
    if (this.performance.memoryUsage.length > 100) {
      this.performance.memoryUsage.shift();
    }
    this.recordMetric('memory_usage', usage);
  }

  // ============================================
  // Error Tracking
  // ============================================

  logError(error: Error, context?: Record<string, any>): void {
    this.errorLog.push({
      error,
      timestamp: Date.now()
    });

    // Keep last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // Update error rate
    const recentErrors = this.errorLog.filter(
      e => e.timestamp > Date.now() - 60000 // Last minute
    );
    this.performance.errorRate = recentErrors.length / 60;

    console.error('Error logged:', error.message, context);
  }

  getErrors(since?: number): Array<{error: Error; timestamp: number}> {
    if (since) {
      return this.errorLog.filter(e => e.timestamp >= since);
    }
    return this.errorLog;
  }

  // ============================================
  // Analytics
  // ============================================

  trackEvent(event: string, properties?: Record<string, any>): void {
    this.recordMetric(`event_${event}`, 1, properties);
    console.log('Event tracked:', event, properties);
  }

  trackUserAction(action: string, duration?: number): void {
    this.recordMetric(`action_${action}`, duration || 1);
  }

  // ============================================
  // Health Checks
  // ============================================

  getHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: PerformanceMetrics;
    errorCount: number;
  } {
    const avgLatency = this.average(this.performance.apiLatency);
    const avgMemory = this.average(this.performance.memoryUsage);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (avgLatency > 2000 || avgMemory > 100 || this.performance.errorRate > 5) {
      status = 'degraded';
    }
    
    if (avgLatency > 5000 || avgMemory > 200 || this.performance.errorRate > 10) {
      status = 'unhealthy';
    }

    return {
      status,
      metrics: this.performance,
      errorCount: this.errorLog.length
    };
  }

  // ============================================
  // Reporting
  // ============================================

  generateReport(): {
    summary: any;
    performance: PerformanceMetrics;
    topMetrics: Array<{name: string; avg: number}>;
  } {
    const topMetrics: Array<{name: string; avg: number}> = [];
    
    this.metrics.forEach((metrics, name) => {
      const values = metrics.map(m => m.value);
      const avg = this.average(values);
      topMetrics.push({name, avg});
    });

    topMetrics.sort((a, b) => b.avg - a.avg);

    return {
      summary: {
        totalMetrics: this.metrics.size,
        totalErrors: this.errorLog.length,
        avgApiLatency: this.average(this.performance.apiLatency),
        avgRenderTime: this.average(this.performance.renderTime)
      },
      performance: this.performance,
      topMetrics: topMetrics.slice(0, 10)
    };
  }

  // ============================================
  // Utilities
  // ============================================

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.errorLog = [];
    this.performance = {
      apiLatency: [],
      renderTime: [],
      memoryUsage: [],
      errorRate: 0
    };
  }
}

export default MonitoringService.getInstance();

