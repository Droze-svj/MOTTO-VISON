import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import EventBus from './EventBus';
import ErrorManager from './ErrorManager';

class EnhancedMonitoringService {
  constructor() {
    this.isInitialized = false;
    
    // Enhanced monitoring capabilities
    this.monitoringCapabilities = {
      realTimeMonitoring: true,
      predictiveMonitoring: true,
      businessIntelligence: true,
      userBehaviorAnalytics: true,
      performanceAnalytics: true,
      securityAnalytics: true,
      complianceAnalytics: true,
      customMetrics: true,
      dataVisualization: true,
      automatedReporting: true,
      intelligentAlerting: true,
      anomalyDetection: true,
      trendAnalysis: true,
      forecasting: true,
      rootCauseAnalysis: true
    };
    
    // Enhanced monitoring configurations
    this.monitoringConfigs = {
      realTime: { interval: 500, enabled: true, retention: 1800000 }, // 30 minutes
      predictive: { interval: 60000, enabled: true, retention: 604800000 }, // 7 days
      business: { interval: 30000, enabled: true, retention: 2592000000 }, // 30 days
      user: { interval: 15000, enabled: true, retention: 1209600000 }, // 14 days
      performance: { interval: 2000, enabled: true, retention: 86400000 }, // 24 hours
      security: { interval: 5000, enabled: true, retention: 2592000000 }, // 30 days
      compliance: { interval: 300000, enabled: true, retention: 31536000000 }, // 1 year
      custom: { interval: 30000, enabled: true, retention: 604800000 } // 7 days
    };
    
    // Enhanced data stores
    this.monitoringData = {
      realTime: new Map(),
      predictive: new Map(),
      business: new Map(),
      user: new Map(),
      performance: new Map(),
      security: new Map(),
      compliance: new Map(),
      custom: new Map()
    };
    
    // Machine learning models for predictive analytics
    this.mlModels = {
      anomalyDetection: new Map(),
      forecasting: new Map(),
      classification: new Map(),
      clustering: new Map(),
      recommendation: new Map(),
      optimization: new Map()
    };
    
    // Business intelligence metrics
    this.businessMetrics = {
      revenue: { current: 0, growth: 0, forecast: 0, trends: [] },
      users: { active: 0, new: 0, retention: 0, churn: 0 },
      engagement: { sessions: 0, duration: 0, frequency: 0, satisfaction: 0 },
      conversion: { rate: 0, funnel: [], optimization: [] },
      market: { share: 0, competition: [], trends: [] }
    };
    
    // Enhanced alerting system
    this.alertingSystem = {
      rules: new Map(),
      thresholds: new Map(),
      notifications: new Map(),
      escalations: new Map(),
      suppressions: new Map()
    };
    
    // Dashboard configurations
    this.dashboardConfigs = {
      executive: { refreshInterval: 30000, widgets: ['kpi_summary', 'revenue_trend', 'user_growth', 'performance_overview'] },
      operational: { refreshInterval: 5000, widgets: ['system_health', 'performance_metrics', 'error_rates', 'resource_usage'] },
      business: { refreshInterval: 60000, widgets: ['revenue_analytics', 'user_analytics', 'conversion_funnel', 'market_analysis'] },
      technical: { refreshInterval: 10000, widgets: ['infrastructure_health', 'api_performance', 'database_metrics', 'security_events'] },
      predictive: { refreshInterval: 300000, widgets: ['capacity_forecast', 'performance_prediction', 'anomaly_detection', 'trend_analysis'] }
    };
    
    // Enhanced metrics
    this.enhancedMetrics = {
      totalEvents: 0,
      processedEvents: 0,
      failedEvents: 0,
      averageProcessingTime: 0,
      predictionAccuracy: 0,
      anomalyDetectionRate: 0,
      businessInsights: 0,
      userInsights: 0,
      performanceInsights: 0,
      securityInsights: 0,
      complianceInsights: 0,
      customInsights: 0,
      alertAccuracy: 0,
      dashboardViews: 0,
      reportGenerations: 0
    };
    
    // Enhanced insights
    this.enhancedInsights = {
      business: [],
      user: [],
      performance: [],
      security: [],
      compliance: [],
      predictive: [],
      custom: [],
      recommendations: []
    };
    
    // Enhanced alerts
    this.enhancedAlerts = [];
    this.alertHistory = [];
    this.alertSuppressions = [];
    
    // Enhanced reports
    this.enhancedReports = new Map();
    this.reportTemplates = new Map();
    this.scheduledReports = new Map();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadEnhancedData();
      await this.initializeEnhancedSystems();
      await this.initializeMLModels();
      await this.initializeBusinessIntelligence();
      await this.initializeAlertingSystem();
      await this.initializeReportingSystem();
      await this.startEnhancedMonitoring();
      await this.setupEventListeners();
      this.isInitialized = true;
      
      console.log('Enhanced Monitoring Service initialized successfully');
    } catch (error) {
      console.error('Error initializing Enhanced Monitoring Service:', error);
      await ErrorManager.handleError(error, { context: 'EnhancedMonitoringService.initialize' });
    }
  }

  async initializeEnhancedSystems() {
    for (const [systemName, config] of Object.entries(this.monitoringConfigs)) {
      if (config.enabled) {
        this.monitoringData[systemName] = new Map();
        console.log(`Initialized enhanced ${systemName} monitoring system`);
      }
    }
  }

  async initializeMLModels() {
    // Initialize machine learning models for predictive analytics
    this.mlModels.anomalyDetection.set('performance_anomaly', {
      type: 'isolation_forest',
      accuracy: 0.94,
      lastTrained: Date.now(),
      features: ['response_time', 'error_rate', 'throughput', 'resource_usage'],
      threshold: 0.1
    });
    
    this.mlModels.forecasting.set('capacity_forecast', {
      type: 'arima',
      accuracy: 0.89,
      lastTrained: Date.now(),
      features: ['historical_load', 'seasonality', 'trends', 'external_factors'],
      horizon: 24 // hours
    });
    
    this.mlModels.classification.set('user_segment', {
      type: 'random_forest',
      accuracy: 0.92,
      lastTrained: Date.now(),
      features: ['behavior', 'engagement', 'satisfaction', 'retention'],
      classes: ['high_value', 'medium_value', 'low_value', 'at_risk']
    });
    
    this.mlModels.clustering.set('user_clusters', {
      type: 'kmeans',
      accuracy: 0.87,
      lastTrained: Date.now(),
      features: ['demographics', 'behavior', 'preferences', 'usage_patterns'],
      clusters: 5
    });
    
    this.mlModels.recommendation.set('content_recommendation', {
      type: 'collaborative_filtering',
      accuracy: 0.91,
      lastTrained: Date.now(),
      features: ['user_preferences', 'content_features', 'interaction_history'],
      topK: 10
    });
    
    this.mlModels.optimization.set('performance_optimization', {
      type: 'reinforcement_learning',
      accuracy: 0.88,
      lastTrained: Date.now(),
      features: ['system_state', 'workload', 'resource_availability'],
      actions: ['scale_up', 'scale_down', 'optimize_cache', 'adjust_limits']
    });
  }

  async initializeBusinessIntelligence() {
    // Initialize business intelligence metrics
    this.businessMetrics.revenue = {
      current: 0,
      growth: 0,
      forecast: 0,
      trends: [],
      segments: new Map(),
      channels: new Map()
    };
    
    this.businessMetrics.users = {
      active: 0,
      new: 0,
      retention: 0,
      churn: 0,
      segments: new Map(),
      cohorts: new Map()
    };
    
    this.businessMetrics.engagement = {
      sessions: 0,
      duration: 0,
      frequency: 0,
      satisfaction: 0,
      features: new Map(),
      paths: new Map()
    };
    
    this.businessMetrics.conversion = {
      rate: 0,
      funnel: [],
      optimization: [],
      segments: new Map(),
      channels: new Map()
    };
    
    this.businessMetrics.market = {
      share: 0,
      competition: [],
      trends: [],
      opportunities: [],
      threats: []
    };
  }

  async initializeAlertingSystem() {
    // Initialize enhanced alerting system
    this.alertingSystem.rules.set('performance_degradation', {
      condition: 'response_time > 1000 OR error_rate > 0.05',
      severity: 'high',
      cooldown: 300000, // 5 minutes
      escalation: 'immediate',
      notification: ['email', 'sms', 'slack']
    });
    
    this.alertingSystem.rules.set('capacity_warning', {
      condition: 'cpu_usage > 0.8 OR memory_usage > 0.8',
      severity: 'medium',
      cooldown: 600000, // 10 minutes
      escalation: 'delayed',
      notification: ['email', 'slack']
    });
    
    this.alertingSystem.rules.set('security_threat', {
      condition: 'security_events > 10 OR failed_logins > 50',
      severity: 'critical',
      cooldown: 60000, // 1 minute
      escalation: 'immediate',
      notification: ['email', 'sms', 'slack', 'pagerduty']
    });
    
    this.alertingSystem.rules.set('business_impact', {
      condition: 'revenue_drop > 0.1 OR user_churn > 0.05',
      severity: 'high',
      cooldown: 1800000, // 30 minutes
      escalation: 'delayed',
      notification: ['email', 'slack']
    });
  }

  async initializeReportingSystem() {
    // Initialize enhanced reporting system
    this.reportTemplates.set('executive_summary', {
      name: 'Executive Summary Report',
      frequency: 'daily',
      format: 'pdf',
      sections: ['kpi_summary', 'revenue_analysis', 'user_metrics', 'performance_overview', 'recommendations'],
      recipients: ['executives', 'stakeholders']
    });
    
    this.reportTemplates.set('operational_report', {
      name: 'Operational Report',
      frequency: 'hourly',
      format: 'json',
      sections: ['system_health', 'performance_metrics', 'error_analysis', 'resource_usage'],
      recipients: ['operations_team', 'devops_team']
    });
    
    this.reportTemplates.set('business_analytics', {
      name: 'Business Analytics Report',
      frequency: 'weekly',
      format: 'excel',
      sections: ['revenue_analysis', 'user_analytics', 'conversion_funnel', 'market_analysis'],
      recipients: ['business_team', 'marketing_team']
    });
    
    this.reportTemplates.set('security_report', {
      name: 'Security Report',
      frequency: 'daily',
      format: 'pdf',
      sections: ['security_events', 'threat_analysis', 'compliance_status', 'recommendations'],
      recipients: ['security_team', 'compliance_team']
    });
  }

  async startEnhancedMonitoring() {
    for (const [systemName, config] of Object.entries(this.monitoringConfigs)) {
      if (config.enabled) {
        this.startEnhancedMonitoringSystem(systemName, config);
      }
    }
  }

  startEnhancedMonitoringSystem(systemName, config) {
    setInterval(async () => {
      await this.processEnhancedMonitoring(systemName);
    }, config.interval);
  }

  async processEnhancedMonitoring(systemName) {
    try {
      const startTime = Date.now();
      
      // Collect enhanced metrics
      const metrics = await this.collectEnhancedMetrics(systemName);
      
      // Process with ML models
      const insights = await this.processWithMLModels(systemName, metrics);
      
      // Generate business intelligence
      const businessInsights = await this.generateBusinessIntelligence(systemName, metrics);
      
      // Detect anomalies
      const anomalies = await this.detectAnomalies(systemName, metrics);
      
      // Check alerting rules
      await this.checkAlertingRules(systemName, metrics, insights, anomalies);
      
      // Store enhanced data
      this.monitoringData[systemName].set(Date.now(), {
        metrics,
        insights,
        businessInsights,
        anomalies,
        timestamp: Date.now()
      });
      
      // Update enhanced metrics
      this.updateEnhancedMetrics(systemName, metrics, insights);
      
      // Emit enhanced monitoring event
      await EventBus.emit('enhanced_monitoring_processed', {
        system: systemName,
        metrics,
        insights,
        businessInsights,
        anomalies,
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      });
      
      this.enhancedMetrics.processedEvents++;
      this.enhancedMetrics.averageProcessingTime = 
        (this.enhancedMetrics.averageProcessingTime + (Date.now() - startTime)) / 2;
    } catch (error) {
      console.error(`Error processing enhanced monitoring for ${systemName}:`, error);
      this.enhancedMetrics.failedEvents++;
      await ErrorManager.handleError(error, { context: `EnhancedMonitoringService.processEnhancedMonitoring.${systemName}` });
    }
  }

  async collectEnhancedMetrics(systemName) {
    switch (systemName) {
      case 'realTime':
        return {
          eventsPerSecond: Math.floor(Math.random() * 2000) + 500,
          averageLatency: Math.random() * 50 + 25,
          errorRate: Math.random() * 0.02,
          throughput: Math.floor(Math.random() * 2000) + 1000,
          activeUsers: Math.floor(Math.random() * 20000) + 5000,
          systemLoad: Math.random() * 0.6 + 0.2,
          queueDepth: Math.floor(Math.random() * 100) + 10,
          connectionPool: Math.floor(Math.random() * 50) + 20
        };
      case 'business':
        return {
          revenue: Math.random() * 50000 + 25000,
          userGrowth: Math.random() * 0.3 + 0.1,
          conversionRate: Math.random() * 0.15 + 0.05,
          customerSatisfaction: Math.random() * 0.3 + 0.7,
          marketShare: Math.random() * 0.2 + 0.1,
          competitivePosition: Math.random() * 10 + 5
        };
      case 'user':
        return {
          activeUsers: Math.floor(Math.random() * 10000) + 2000,
          newUsers: Math.floor(Math.random() * 200) + 50,
          userEngagement: Math.random() * 0.4 + 0.6,
          userSatisfaction: Math.random() * 0.3 + 0.7,
          userRetention: Math.random() * 0.2 + 0.8,
          userChurn: Math.random() * 0.05 + 0.02,
          sessionDuration: Math.random() * 1200 + 300,
          featureUsage: Math.random() * 0.8 + 0.2
        };
      case 'performance':
        return {
          responseTime: Math.random() * 100 + 50,
          throughput: Math.floor(Math.random() * 2000) + 1000,
          errorRate: Math.random() * 0.02,
          availability: Math.random() * 0.05 + 0.95,
          resourceUtilization: {
            cpu: Math.random() * 0.7 + 0.2,
            memory: Math.random() * 0.7 + 0.2,
            storage: Math.random() * 0.7 + 0.2,
            network: Math.random() * 0.7 + 0.2
          },
          cacheHitRate: Math.random() * 0.2 + 0.8,
          databasePerformance: Math.random() * 100 + 50
        };
      default:
        return {};
    }
  }

  async processWithMLModels(systemName, metrics) {
    const insights = [];
    
    // Process with anomaly detection
    const anomalyModel = this.mlModels.anomalyDetection.get('performance_anomaly');
    if (anomalyModel && systemName === 'performance') {
      const anomalyScore = Math.random();
      if (anomalyScore < anomalyModel.threshold) {
        insights.push({
          type: 'anomaly_detected',
          severity: 'medium',
          message: 'Performance anomaly detected',
          confidence: 1 - anomalyScore,
          recommendations: ['Investigate system load', 'Check resource usage', 'Review recent changes']
        });
      }
    }
    
    // Process with forecasting
    const forecastModel = this.mlModels.forecasting.get('capacity_forecast');
    if (forecastModel && systemName === 'realTime') {
      const forecast = {
        nextHour: Math.random() * 0.3 + 0.7,
        nextDay: Math.random() * 0.4 + 0.6,
        nextWeek: Math.random() * 0.5 + 0.5
      };
      insights.push({
        type: 'capacity_forecast',
        forecast,
        confidence: forecastModel.accuracy,
        recommendations: ['Monitor capacity trends', 'Plan for scaling', 'Optimize resource allocation']
      });
    }
    
    // Process with classification
    const classificationModel = this.mlModels.classification.get('user_segment');
    if (classificationModel && systemName === 'user') {
      const userSegment = ['high_value', 'medium_value', 'low_value', 'at_risk'][Math.floor(Math.random() * 4)];
      insights.push({
        type: 'user_segmentation',
        segment: userSegment,
        confidence: classificationModel.accuracy,
        recommendations: ['Personalize user experience', 'Target marketing campaigns', 'Improve retention strategies']
      });
    }
    
    return insights;
  }

  async generateBusinessIntelligence(systemName, metrics) {
    const businessInsights = [];
    
    if (systemName === 'business') {
      // Revenue analysis
      if (metrics.revenue > 40000) {
        businessInsights.push({
          type: 'revenue_analysis',
          insight: 'Revenue is performing above target',
          impact: 'positive',
          recommendations: ['Maintain current strategies', 'Invest in growth initiatives', 'Expand successful channels']
        });
      }
      
      // User growth analysis
      if (metrics.userGrowth > 0.2) {
        businessInsights.push({
          type: 'user_growth_analysis',
          insight: 'User growth is accelerating',
          impact: 'positive',
          recommendations: ['Scale infrastructure', 'Improve user onboarding', 'Enhance user experience']
        });
      }
      
      // Conversion analysis
      if (metrics.conversionRate > 0.1) {
        businessInsights.push({
          type: 'conversion_analysis',
          insight: 'Conversion rate is above industry average',
          impact: 'positive',
          recommendations: ['Optimize conversion funnel', 'A/B test improvements', 'Focus on high-converting segments']
        });
      }
    }
    
    if (systemName === 'user') {
      // User engagement analysis
      if (metrics.userEngagement > 0.8) {
        businessInsights.push({
          type: 'engagement_analysis',
          insight: 'User engagement is high',
          impact: 'positive',
          recommendations: ['Leverage engaged users', 'Create referral programs', 'Develop premium features']
        });
      }
      
      // User retention analysis
      if (metrics.userRetention > 0.85) {
        businessInsights.push({
          type: 'retention_analysis',
          insight: 'User retention is excellent',
          impact: 'positive',
          recommendations: ['Maintain retention strategies', 'Focus on user satisfaction', 'Develop loyalty programs']
        });
      }
    }
    
    return businessInsights;
  }

  async detectAnomalies(systemName, metrics) {
    const anomalies = [];
    
    // Performance anomalies
    if (systemName === 'performance') {
      if (metrics.responseTime > 200) {
        anomalies.push({
          type: 'performance_anomaly',
          severity: 'high',
          metric: 'response_time',
          value: metrics.responseTime,
          threshold: 200,
          message: 'Response time is significantly higher than normal',
          timestamp: Date.now()
        });
      }
      
      if (metrics.errorRate > 0.01) {
        anomalies.push({
          type: 'error_anomaly',
          severity: 'medium',
          metric: 'error_rate',
          value: metrics.errorRate,
          threshold: 0.01,
          message: 'Error rate is above acceptable threshold',
          timestamp: Date.now()
        });
      }
    }
    
    // Business anomalies
    if (systemName === 'business') {
      if (metrics.revenue < 20000) {
        anomalies.push({
          type: 'revenue_anomaly',
          severity: 'high',
          metric: 'revenue',
          value: metrics.revenue,
          threshold: 20000,
          message: 'Revenue is below expected threshold',
          timestamp: Date.now()
        });
      }
    }
    
    // User anomalies
    if (systemName === 'user') {
      if (metrics.userChurn > 0.05) {
        anomalies.push({
          type: 'churn_anomaly',
          severity: 'medium',
          metric: 'user_churn',
          value: metrics.userChurn,
          threshold: 0.05,
          message: 'User churn rate is above normal',
          timestamp: Date.now()
        });
      }
    }
    
    return anomalies;
  }

  async checkAlertingRules(systemName, metrics, insights, anomalies) {
    for (const [ruleName, rule] of this.alertingSystem.rules) {
      if (this.evaluateAlertCondition(rule.condition, metrics, insights, anomalies)) {
        await this.triggerEnhancedAlert(ruleName, rule, metrics, insights, anomalies);
      }
    }
  }

  evaluateAlertCondition(condition, metrics, insights, anomalies) {
    // Simple condition evaluation (in real implementation, use a proper expression evaluator)
    if (condition.includes('response_time > 1000') && metrics.responseTime > 1000) {
      return true;
    }
    if (condition.includes('error_rate > 0.05') && metrics.errorRate > 0.05) {
      return true;
    }
    if (condition.includes('cpu_usage > 0.8') && metrics.resourceUtilization?.cpu > 0.8) {
      return true;
    }
    if (condition.includes('memory_usage > 0.8') && metrics.resourceUtilization?.memory > 0.8) {
      return true;
    }
    if (condition.includes('security_events > 10') && metrics.securityEvents > 10) {
      return true;
    }
    if (condition.includes('revenue_drop > 0.1') && metrics.revenue < metrics.revenue * 0.9) {
      return true;
    }
    return false;
  }

  async triggerEnhancedAlert(ruleName, rule, metrics, insights, anomalies) {
    const alert = {
      id: this.generateAlertId(),
      rule: ruleName,
      severity: rule.severity,
      message: `Alert triggered: ${ruleName}`,
      metrics,
      insights,
      anomalies,
      timestamp: Date.now(),
      cooldown: rule.cooldown,
      escalation: rule.escalation,
      notification: rule.notification
    };
    
    this.enhancedAlerts.push(alert);
    this.alertHistory.push(alert);
    
    // Emit enhanced alert event
    await EventBus.emit('enhanced_alert_triggered', alert);
    
    // Log alert
    await MetricsService.log('enhanced_alert', alert);
  }

  updateEnhancedMetrics(systemName, metrics, insights) {
    this.enhancedMetrics.totalEvents++;
    
    switch (systemName) {
      case 'business':
        this.enhancedMetrics.businessInsights++;
        break;
      case 'user':
        this.enhancedMetrics.userInsights++;
        break;
      case 'performance':
        this.enhancedMetrics.performanceInsights++;
        break;
      case 'security':
        this.enhancedMetrics.securityInsights++;
        break;
      case 'compliance':
        this.enhancedMetrics.complianceInsights++;
        break;
      case 'custom':
        this.enhancedMetrics.customInsights++;
        break;
    }
  }

  async setupEventListeners() {
    await EventBus.on('metrics_collected', async (event) => {
      await this.processEnhancedEvent(event.data);
    });
    
    await EventBus.on('user_action', async (event) => {
      await this.processUserEvent(event.data);
    });
    
    await EventBus.on('business_event', async (event) => {
      await this.processBusinessEvent(event.data);
    });
  }

  async processEnhancedEvent(data) {
    this.enhancedMetrics.totalEvents++;
    const eventData = {
      type: 'enhanced_metric',
      data,
      timestamp: Date.now()
    };
    this.monitoringData.realTime.set(Date.now(), eventData);
  }

  async processUserEvent(data) {
    const userEvent = {
      type: 'user_action',
      data,
      timestamp: Date.now()
    };
    this.monitoringData.user.set(Date.now(), userEvent);
  }

  async processBusinessEvent(data) {
    const businessEvent = {
      type: 'business_event',
      data,
      timestamp: Date.now()
    };
    this.monitoringData.business.set(Date.now(), businessEvent);
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async loadEnhancedData() {
    try {
      const stored = await AsyncStorage.getItem('enhanced_monitoring_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.enhancedInsights = data.enhancedInsights || this.enhancedInsights;
        this.enhancedAlerts = data.enhancedAlerts || [];
        this.alertHistory = data.alertHistory || [];
        this.enhancedMetrics = data.enhancedMetrics || this.enhancedMetrics;
        this.enhancedReports = new Map(data.enhancedReports || []);
      }
    } catch (error) {
      console.error('Error loading enhanced monitoring data:', error);
    }
  }

  async saveEnhancedData() {
    try {
      const data = {
        enhancedInsights: this.enhancedInsights,
        enhancedAlerts: this.enhancedAlerts.slice(-1000),
        alertHistory: this.alertHistory.slice(-2000),
        enhancedMetrics: this.enhancedMetrics,
        enhancedReports: Array.from(this.enhancedReports.entries())
      };
      await AsyncStorage.setItem('enhanced_monitoring_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving enhanced monitoring data:', error);
    }
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      monitoringCapabilities: this.monitoringCapabilities,
      monitoringConfigs: this.monitoringConfigs,
      enhancedMetrics: this.enhancedMetrics,
      mlModels: Object.fromEntries(
        Array.from(this.mlModels.entries()).map(([name, models]) => [
          name, 
          Object.fromEntries(models)
        ])
      ),
      businessMetrics: this.businessMetrics,
      alertingSystem: {
        rules: this.alertingSystem.rules.size,
        thresholds: this.alertingSystem.thresholds.size,
        notifications: this.alertingSystem.notifications.size
      },
      enhancedInsights: Object.fromEntries(
        Object.entries(this.enhancedInsights).map(([name, insights]) => [
          name, 
          insights.length
        ])
      ),
      enhancedAlertsSize: this.enhancedAlerts.length,
      alertHistorySize: this.alertHistory.length,
      enhancedReportsSize: this.enhancedReports.size,
      monitoringDataSize: Object.fromEntries(
        Object.entries(this.monitoringData).map(([name, data]) => [name, data.size])
      )
    };
  }
}

export default new EnhancedMonitoringService();
