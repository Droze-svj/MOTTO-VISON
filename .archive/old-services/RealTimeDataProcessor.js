import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';
import RateLimitingService from './RateLimitingService';
import ContentModerationService from './ContentModerationService';

class RealTimeDataProcessor {
  constructor() {
    this.isInitialized = false;
    
    // Real-time processing capabilities
    this.processingCapabilities = {
      streamProcessing: true,
      eventDrivenProcessing: true,
      batchProcessing: true,
      realTimeAnalytics: true,
      dataTransformation: true,
      dataValidation: true,
      dataEnrichment: true,
      dataAggregation: true
    };
    
    // Data stream types
    this.streamTypes = {
      user_events: {
        name: 'User Events',
        description: 'User interactions and behavior events',
        processingMode: 'real_time',
        batchSize: 100,
        flushInterval: 5000 // 5 seconds
      },
      system_metrics: {
        name: 'System Metrics',
        description: 'System performance and health metrics',
        processingMode: 'real_time',
        batchSize: 50,
        flushInterval: 10000 // 10 seconds
      },
      ai_responses: {
        name: 'AI Responses',
        description: 'AI model responses and interactions',
        processingMode: 'real_time',
        batchSize: 200,
        flushInterval: 3000 // 3 seconds
      },
      content_updates: {
        name: 'Content Updates',
        description: 'Content creation and modification events',
        processingMode: 'near_real_time',
        batchSize: 500,
        flushInterval: 15000 // 15 seconds
      },
      security_events: {
        name: 'Security Events',
        description: 'Security-related events and alerts',
        processingMode: 'real_time',
        batchSize: 10,
        flushInterval: 1000 // 1 second
      }
    };
    
    // Processing pipelines
    this.processingPipelines = new Map();
    this.dataStreams = new Map();
    this.eventHandlers = new Map();
    this.dataTransformers = new Map();
    this.dataValidators = new Map();
    
    // Real-time processing state
    this.processingQueues = new Map();
    this.processingWorkers = new Map();
    this.processingMetrics = new Map();
    
    // Data storage
    this.dataBuffer = new Map();
    this.processedData = new Map();
    this.dataHistory = [];
    
    // Event system
    this.eventBus = new Map();
    this.eventSubscribers = new Map();
    this.eventHistory = [];
    
    // Processing configuration
    this.processingConfig = {
      maxConcurrentStreams: 10,
      maxBufferSize: 10000,
      processingTimeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      enableCompression: true,
      enableEncryption: true
    };
    
    // Performance monitoring
    this.performanceMetrics = {
      totalProcessed: 0,
      processingRate: 0, // items per second
      averageLatency: 0,
      errorRate: 0,
      throughput: 0,
      memoryUsage: 0
    };
    
    // Processing timers
    this.processingTimers = new Map();
    this.cleanupTimer = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      await RateLimitingService.initialize();
      await ContentModerationService.initialize();
      await this.loadProcessingData();
      await this.initializeProcessingPipelines();
      await this.startProcessingWorkers();
      await this.startCleanupProcess();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing RealTimeDataProcessor:', error);
    }
  }

  // Stream Management
  async createDataStream(streamType, config = {}) {
    await this.initialize();
    
    const streamId = this.generateStreamId();
    const streamConfig = this.streamTypes[streamType] || this.streamTypes.user_events;
    
    const stream = {
      id: streamId,
      type: streamType,
      name: streamConfig.name,
      description: streamConfig.description,
      processingMode: streamConfig.processingMode,
      batchSize: config.batchSize || streamConfig.batchSize,
      flushInterval: config.flushInterval || streamConfig.flushInterval,
      status: 'active',
      createdAt: new Date().toISOString(),
      config: config,
      metrics: {
        totalItems: 0,
        processedItems: 0,
        failedItems: 0,
        averageLatency: 0,
        lastProcessed: null
      }
    };
    
    this.dataStreams.set(streamId, stream);
    this.processingQueues.set(streamId, []);
    this.dataBuffer.set(streamId, []);
    this.processedData.set(streamId, []);
    
    // Initialize processing pipeline
    await this.initializeStreamPipeline(streamId, stream);
    
    await MetricsService.log('data_stream_created', {
      streamId,
      type: streamType,
      config: stream.config
    });
    
    return stream;
  }

  async initializeStreamPipeline(streamId, stream) {
    const pipeline = {
      id: streamId,
      stream: stream,
      stages: [],
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    // Add default processing stages
    pipeline.stages.push({
      name: 'validation',
      processor: this.validateData.bind(this),
      config: {}
    });
    
    pipeline.stages.push({
      name: 'transformation',
      processor: this.transformData.bind(this),
      config: {}
    });
    
    pipeline.stages.push({
      name: 'enrichment',
      processor: this.enrichData.bind(this),
      config: {}
    });
    
    pipeline.stages.push({
      name: 'storage',
      processor: this.storeData.bind(this),
      config: {}
    });
    
    this.processingPipelines.set(streamId, pipeline);
  }

  // Data Processing
  async processData(streamId, data, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      // Rate limiting check
      const rateLimitResult = await RateLimitingService.checkRateLimit(
        `stream_${streamId}`, 
        'analytics', 
        options
      );
      if (!rateLimitResult.allowed) {
        throw new Error(`Rate limit exceeded for stream ${streamId}`);
      }
      
      // Content moderation check (if applicable)
      if (data.content) {
        const moderationResult = await ContentModerationService.moderateContent(
          data.content, 
          'text', 
          options
        );
        if (moderationResult.action === 'block') {
          throw new Error('Content blocked due to policy violations');
        }
      }
      
      // Add to processing queue
      const processingItem = {
        id: this.generateProcessingId(),
        streamId: streamId,
        data: data,
        options: options,
        timestamp: new Date().toISOString(),
        status: 'queued',
        retryCount: 0
      };
      
      const queue = this.processingQueues.get(streamId) || [];
      queue.push(processingItem);
      this.processingQueues.set(streamId, queue);
      
      // Update stream metrics
      const stream = this.dataStreams.get(streamId);
      if (stream) {
        stream.metrics.totalItems += 1;
      }
      
      // Process immediately if in real-time mode
      if (stream && stream.processingMode === 'real_time') {
        await this.processStreamItem(processingItem);
      }
      
      await MetricsService.log('data_processed', {
        streamId,
        processingId: processingItem.id,
        duration: Date.now() - startTime
      });
      
      return processingItem;
      
    } catch (error) {
      await MetricsService.log('data_processing_error', {
        streamId,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  async processStreamItem(item) {
    const stream = this.dataStreams.get(item.streamId);
    if (!stream) return;
    
    const pipeline = this.processingPipelines.get(item.streamId);
    if (!pipeline) return;
    
    try {
      item.status = 'processing';
      item.startedAt = new Date().toISOString();
      
      let processedData = item.data;
      
      // Process through pipeline stages
      for (const stage of pipeline.stages) {
        processedData = await stage.processor(processedData, stage.config, item);
      }
      
      // Mark as completed
      item.status = 'completed';
      item.completedAt = new Date().toISOString();
      item.result = processedData;
      
      // Update stream metrics
      stream.metrics.processedItems += 1;
      stream.metrics.lastProcessed = new Date().toISOString();
      
      // Calculate latency
      const latency = Date.now() - new Date(item.timestamp).getTime();
      stream.metrics.averageLatency = 
        (stream.metrics.averageLatency * (stream.metrics.processedItems - 1) + latency) / 
        stream.metrics.processedItems;
      
      // Store processed data
      const processedDataList = this.processedData.get(item.streamId) || [];
      processedDataList.push(item);
      this.processedData.set(item.streamId, processedDataList);
      
      // Emit completion event
      await this.emitEvent('data_processed', {
        streamId: item.streamId,
        processingId: item.id,
        result: processedData
      });
      
    } catch (error) {
      item.status = 'failed';
      item.completedAt = new Date().toISOString();
      item.error = error.message;
      
      // Update stream metrics
      stream.metrics.failedItems += 1;
      
      // Retry if possible
      if (item.retryCount < this.processingConfig.retryAttempts) {
        item.retryCount += 1;
        item.status = 'queued';
        setTimeout(() => this.processStreamItem(item), this.processingConfig.retryDelay);
      }
      
      // Emit error event
      await this.emitEvent('data_processing_error', {
        streamId: item.streamId,
        processingId: item.id,
        error: error.message
      });
    }
  }

  // Processing Stages
  async validateData(data, config, item) {
    // Basic data validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }
    
    // Required fields validation
    if (config.requiredFields) {
      for (const field of config.requiredFields) {
        if (!(field in data)) {
          throw new Error(`Required field missing: ${field}`);
        }
      }
    }
    
    // Data type validation
    if (config.fieldTypes) {
      for (const [field, type] of Object.entries(config.fieldTypes)) {
        if (data[field] && typeof data[field] !== type) {
          throw new Error(`Invalid type for field ${field}: expected ${type}`);
        }
      }
    }
    
    return data;
  }

  async transformData(data, config, item) {
    // Apply data transformations
    let transformedData = { ...data };
    
    // Field mapping
    if (config.fieldMapping) {
      for (const [sourceField, targetField] of Object.entries(config.fieldMapping)) {
        if (sourceField in transformedData) {
          transformedData[targetField] = transformedData[sourceField];
          if (sourceField !== targetField) {
            delete transformedData[sourceField];
          }
        }
      }
    }
    
    // Data type conversions
    if (config.typeConversions) {
      for (const [field, type] of Object.entries(config.typeConversions)) {
        if (field in transformedData) {
          switch (type) {
            case 'string':
              transformedData[field] = String(transformedData[field]);
              break;
            case 'number':
              transformedData[field] = Number(transformedData[field]);
              break;
            case 'boolean':
              transformedData[field] = Boolean(transformedData[field]);
              break;
            case 'date':
              transformedData[field] = new Date(transformedData[field]);
              break;
          }
        }
      }
    }
    
    // Data filtering
    if (config.filters) {
      for (const filter of config.filters) {
        if (filter.field && filter.condition) {
          const value = transformedData[filter.field];
          if (!this.evaluateCondition(value, filter.condition)) {
            throw new Error(`Data filtered out by condition: ${filter.field}`);
          }
        }
      }
    }
    
    return transformedData;
  }

  async enrichData(data, config, item) {
    // Add metadata
    const enrichedData = {
      ...data,
      _metadata: {
        processedAt: new Date().toISOString(),
        streamId: item.streamId,
        processingId: item.id,
        version: '1.0'
      }
    };
    
    // Add computed fields
    if (config.computedFields) {
      for (const [field, expression] of Object.entries(config.computedFields)) {
        enrichedData[field] = this.evaluateExpression(expression, data);
      }
    }
    
    // Add external data
    if (config.externalData) {
      for (const [field, source] of Object.entries(config.externalData)) {
        try {
          enrichedData[field] = await this.fetchExternalData(source, data);
        } catch (error) {
          console.warn(`Failed to fetch external data for ${field}:`, error);
        }
      }
    }
    
    return enrichedData;
  }

  async storeData(data, config, item) {
    // Store processed data
    const storageKey = `processed_data_${item.streamId}_${item.id}`;
    
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      
      // Add to data history
      this.dataHistory.push({
        id: item.id,
        streamId: item.streamId,
        data: data,
        timestamp: new Date().toISOString()
      });
      
      // Maintain history size
      if (this.dataHistory.length > 10000) {
        this.dataHistory = this.dataHistory.slice(-10000);
      }
      
    } catch (error) {
      console.error('Error storing processed data:', error);
      throw error;
    }
    
    return data;
  }

  // Event System
  async emitEvent(eventType, data) {
    const event = {
      id: this.generateEventId(),
      type: eventType,
      data: data,
      timestamp: new Date().toISOString()
    };
    
    // Add to event history
    this.eventHistory.push(event);
    
    // Notify subscribers
    const subscribers = this.eventSubscribers.get(eventType) || [];
    for (const subscriber of subscribers) {
      try {
        await subscriber.handler(event);
      } catch (error) {
        console.error('Error in event subscriber:', error);
      }
    }
    
    await MetricsService.log('event_emitted', {
      eventType,
      eventId: event.id
    });
  }

  async subscribeToEvent(eventType, handler, options = {}) {
    const subscriber = {
      id: this.generateSubscriberId(),
      eventType: eventType,
      handler: handler,
      options: options,
      createdAt: new Date().toISOString()
    };
    
    if (!this.eventSubscribers.has(eventType)) {
      this.eventSubscribers.set(eventType, []);
    }
    this.eventSubscribers.get(eventType).push(subscriber);
    
    return subscriber;
  }

  async unsubscribeFromEvent(eventType, subscriberId) {
    const subscribers = this.eventSubscribers.get(eventType) || [];
    const filteredSubscribers = subscribers.filter(sub => sub.id !== subscriberId);
    this.eventSubscribers.set(eventType, filteredSubscribers);
  }

  // Batch Processing
  async processBatch(streamId, batchData, options = {}) {
    const batchId = this.generateBatchId();
    const batch = {
      id: batchId,
      streamId: streamId,
      data: batchData,
      options: options,
      status: 'processing',
      createdAt: new Date().toISOString(),
      results: []
    };
    
    try {
      // Process each item in the batch
      for (const item of batchData) {
        const result = await this.processData(streamId, item, options);
        batch.results.push(result);
      }
      
      batch.status = 'completed';
      batch.completedAt = new Date().toISOString();
      
      await MetricsService.log('batch_processed', {
        batchId,
        streamId,
        itemCount: batchData.length
      });
      
      return batch;
      
    } catch (error) {
      batch.status = 'failed';
      batch.error = error.message;
      batch.completedAt = new Date().toISOString();
      
      await MetricsService.log('batch_processing_error', {
        batchId,
        streamId,
        error: error.message
      });
      
      throw error;
    }
  }

  // Utility Methods
  evaluateCondition(value, condition) {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      case 'regex':
        return new RegExp(condition.value).test(String(value));
      default:
        return true;
    }
  }

  evaluateExpression(expression, data) {
    // Simple expression evaluation
    // In production, use a proper expression evaluator
    try {
      return eval(expression.replace(/\{(\w+)\}/g, (match, field) => {
        return data[field] || 0;
      }));
    } catch (error) {
      return null;
    }
  }

  async fetchExternalData(source, data) {
    // Simulate external data fetching
    // In production, implement actual API calls
    return { source: source, timestamp: new Date().toISOString() };
  }

  // Processing Workers
  async startProcessingWorkers() {
    // Start workers for each stream
    for (const [streamId, stream] of this.dataStreams.entries()) {
      await this.startStreamWorker(streamId, stream);
    }
  }

  async startStreamWorker(streamId, stream) {
    const worker = {
      id: this.generateWorkerId(),
      streamId: streamId,
      status: 'running',
      lastProcessed: null,
      processedCount: 0
    };
    
    this.processingWorkers.set(streamId, worker);
    
    // Start processing loop
    const processLoop = async () => {
      while (worker.status === 'running') {
        try {
          await this.processStreamQueue(streamId);
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms interval
        } catch (error) {
          console.error(`Error in stream worker ${streamId}:`, error);
        }
      }
    };
    
    processLoop();
  }

  async processStreamQueue(streamId) {
    const queue = this.processingQueues.get(streamId) || [];
    const stream = this.dataStreams.get(streamId);
    
    if (!stream || queue.length === 0) return;
    
    // Process items based on stream configuration
    if (stream.processingMode === 'batch') {
      await this.processBatchQueue(streamId, stream);
    } else {
      // Process individual items
      const item = queue.shift();
      if (item) {
        await this.processStreamItem(item);
      }
    }
  }

  async processBatchQueue(streamId, stream) {
    const queue = this.processingQueues.get(streamId) || [];
    
    if (queue.length >= stream.batchSize) {
      const batch = queue.splice(0, stream.batchSize);
      await this.processBatch(streamId, batch.map(item => item.data));
    }
  }

  // Cleanup and Maintenance
  async startCleanupProcess() {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanupOldData();
      await this.updatePerformanceMetrics();
    }, 300000); // Every 5 minutes
  }

  async cleanupOldData() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    // Clean up old processed data
    for (const [streamId, dataList] of this.processedData.entries()) {
      const filteredData = dataList.filter(item => 
        new Date(item.timestamp) > cutoffTime
      );
      this.processedData.set(streamId, filteredData);
    }
    
    // Clean up old event history
    this.eventHistory = this.eventHistory.filter(event => 
      new Date(event.timestamp) > cutoffTime
    );
    
    // Clean up old data history
    this.dataHistory = this.dataHistory.filter(item => 
      new Date(item.timestamp) > cutoffTime
    );
  }

  async updatePerformanceMetrics() {
    // Calculate processing rate
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentProcessed = this.dataHistory.filter(item => 
      new Date(item.timestamp).getTime() > oneMinuteAgo
    ).length;
    
    this.performanceMetrics.processingRate = recentProcessed;
    this.performanceMetrics.totalProcessed = this.dataHistory.length;
    
    // Calculate average latency
    const latencies = this.dataHistory
      .filter(item => item.processingTime)
      .map(item => item.processingTime);
    
    if (latencies.length > 0) {
      this.performanceMetrics.averageLatency = 
        latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;
    }
    
    // Calculate error rate
    const totalItems = this.performanceMetrics.totalProcessed;
    const failedItems = this.dataHistory.filter(item => item.error).length;
    this.performanceMetrics.errorRate = totalItems > 0 ? failedItems / totalItems : 0;
  }

  // Utility Methods
  generateStreamId() {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateProcessingId() {
    return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSubscriberId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateBatchId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateWorkerId() {
    return `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  async loadProcessingData() {
    try {
      const stored = await AsyncStorage.getItem('realtime_processing_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.dataStreams = new Map(data.dataStreams || []);
        this.processingPipelines = new Map(data.processingPipelines || []);
        this.eventSubscribers = new Map(data.eventSubscribers || []);
        this.dataHistory = data.dataHistory || [];
        this.eventHistory = data.eventHistory || [];
      }
    } catch (error) {
      console.error('Error loading processing data:', error);
    }
  }

  async saveProcessingData() {
    try {
      const data = {
        dataStreams: Array.from(this.dataStreams.entries()),
        processingPipelines: Array.from(this.processingPipelines.entries()),
        eventSubscribers: Array.from(this.eventSubscribers.entries()),
        dataHistory: this.dataHistory,
        eventHistory: this.eventHistory
      };
      await AsyncStorage.setItem('realtime_processing_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving processing data:', error);
    }
  }

  // Health Check
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      processingCapabilities: this.processingCapabilities,
      streamTypes: Object.keys(this.streamTypes),
      activeStreams: this.dataStreams.size,
      processingPipelines: this.processingPipelines.size,
      processingWorkers: this.processingWorkers.size,
      performanceMetrics: this.performanceMetrics,
      processingConfig: this.processingConfig,
      dataHistorySize: this.dataHistory.length,
      eventHistorySize: this.eventHistory.length
    };
  }
}

export default new RealTimeDataProcessor();
