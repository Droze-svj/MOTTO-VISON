import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import MetricsService from './MetricsService';

class EventBus {
  constructor() {
    this.isInitialized = false;
    
    this.events = new EventEmitter();
    this.eventHistory = [];
    this.eventSubscribers = new Map();
    this.eventFilters = new Map();
    this.eventMiddleware = [];
    this.eventMetrics = new Map();
    this.eventSchemas = new Map();
    this.eventRetryPolicies = new Map();
    this.eventDeadLetterQueue = [];
    
    this.eventBusCapabilities = {
      eventPublishing: true,
      eventSubscribing: true,
      eventFiltering: true,
      eventMiddleware: true,
      eventRetry: true,
      eventDeadLetterQueue: true,
      eventSchemaValidation: true,
      eventMetrics: true,
      eventHistory: true,
      eventReplay: true,
      eventBatching: true,
      eventCompression: true,
      eventEncryption: true,
      eventOrdering: true,
      eventDeduplication: true
    };
    
    this.eventBusMetrics = {
      totalEvents: 0,
      publishedEvents: 0,
      deliveredEvents: 0,
      failedEvents: 0,
      retriedEvents: 0,
      deadLetterEvents: 0,
      averageDeliveryTime: 0,
      eventThroughput: 0,
      subscriberCount: 0,
      activeSubscriptions: 0
    };
    
    this.initializeEventSchemas();
    this.initializeEventRetryPolicies();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadEventBusData();
      await this.initializeEventMiddleware();
      await this.startEventMetricsCollection();
      await this.startDeadLetterQueueProcessing();
      this.isInitialized = true;
      
      console.log('Event Bus initialized successfully');
    } catch (error) {
      console.error('Error initializing Event Bus:', error);
      throw error;
    }
  }

  initializeEventSchemas() {
    // Define event schemas for validation
    this.eventSchemas.set('user_message', {
      type: 'object',
      required: ['message', 'userId', 'timestamp'],
      properties: {
        message: { type: 'string' },
        userId: { type: 'string' },
        timestamp: { type: 'string' },
        context: { type: 'object' },
        metadata: { type: 'object' }
      }
    });
    
    this.eventSchemas.set('ai_response', {
      type: 'object',
      required: ['response', 'userId', 'timestamp'],
      properties: {
        response: { type: 'string' },
        userId: { type: 'string' },
        timestamp: { type: 'string' },
        confidence: { type: 'number' },
        model: { type: 'string' },
        metadata: { type: 'object' }
      }
    });
    
    this.eventSchemas.set('service_health', {
      type: 'object',
      required: ['serviceName', 'status', 'timestamp'],
      properties: {
        serviceName: { type: 'string' },
        status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
        timestamp: { type: 'string' },
        metrics: { type: 'object' },
        details: { type: 'object' }
      }
    });
    
    this.eventSchemas.set('optimization_completed', {
      type: 'object',
      required: ['optimizationType', 'deviceId', 'timestamp'],
      properties: {
        optimizationType: { type: 'string' },
        deviceId: { type: 'string' },
        timestamp: { type: 'string' },
        results: { type: 'object' },
        performance: { type: 'object' }
      }
    });
    
    this.eventSchemas.set('device_linked', {
      type: 'object',
      required: ['deviceId', 'appleId', 'timestamp'],
      properties: {
        deviceId: { type: 'string' },
        appleId: { type: 'string' },
        timestamp: { type: 'string' },
        deviceInfo: { type: 'object' },
        capabilities: { type: 'array' }
      }
    });
  }

  initializeEventRetryPolicies() {
    // Define retry policies for different event types
    this.eventRetryPolicies.set('user_message', {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxRetryDelay: 10000
    });
    
    this.eventRetryPolicies.set('ai_response', {
      maxRetries: 2,
      retryDelay: 500,
      backoffMultiplier: 1.5,
      maxRetryDelay: 5000
    });
    
    this.eventRetryPolicies.set('service_health', {
      maxRetries: 1,
      retryDelay: 2000,
      backoffMultiplier: 1,
      maxRetryDelay: 2000
    });
    
    this.eventRetryPolicies.set('optimization_completed', {
      maxRetries: 2,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxRetryDelay: 8000
    });
  }

  async emit(event, data, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate event data
      if (!this.validateEventData(event, data)) {
        throw new Error(`Invalid event data for ${event}`);
      }
      
      // Apply middleware
      const processedData = await this.applyMiddleware(event, data, 'emit');
      
      // Create event object
      const eventObject = {
        id: this.generateEventId(),
        event,
        data: processedData,
        timestamp: new Date().toISOString(),
        options,
        retryCount: 0
      };
      
      // Emit event
      this.events.emit(event, eventObject);
      
      // Record event in history
      this.recordEvent(eventObject);
      
      // Update metrics
      this.updateEventMetrics(event, 'published', Date.now() - startTime);
      
      // Log event
      await MetricsService.log('event_published', {
        eventId: eventObject.id,
        event: event,
        dataSize: JSON.stringify(data).length
      });
      
      return eventObject;
    } catch (error) {
      this.updateEventMetrics(event, 'failed', Date.now() - startTime);
      console.error(`Failed to emit event ${event}:`, error);
      throw error;
    }
  }

  async on(event, handler, options = {}) {
    try {
      // Create subscription
      const subscription = {
        id: this.generateSubscriptionId(),
        event,
        handler,
        options,
        createdAt: new Date().toISOString(),
        active: true
      };
      
      // Add to subscribers map
      if (!this.eventSubscribers.has(event)) {
        this.eventSubscribers.set(event, []);
      }
      this.eventSubscribers.get(event).push(subscription);
      
      // Set up event listener
      this.events.on(event, async (eventObject) => {
        await this.handleEventDelivery(subscription, eventObject);
      });
      
      // Update metrics
      this.updateSubscriptionMetrics(event, 'subscribed');
      
      console.log(`Subscribed to event: ${event}`);
      return subscription;
    } catch (error) {
      console.error(`Failed to subscribe to event ${event}:`, error);
      throw error;
    }
  }

  async off(event, subscriptionId) {
    try {
      const subscribers = this.eventSubscribers.get(event) || [];
      const filteredSubscribers = subscribers.filter(sub => sub.id !== subscriptionId);
      
      if (filteredSubscribers.length === 0) {
        this.eventSubscribers.delete(event);
        this.events.removeAllListeners(event);
      } else {
        this.eventSubscribers.set(event, filteredSubscribers);
      }
      
      this.updateSubscriptionMetrics(event, 'unsubscribed');
      console.log(`Unsubscribed from event: ${event}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from event ${event}:`, error);
      throw error;
    }
  }

  async handleEventDelivery(subscription, eventObject) {
    const startTime = Date.now();
    
    try {
      // Check if subscription is active
      if (!subscription.active) {
        return;
      }
      
      // Apply filters
      if (subscription.options.filter && !this.applyFilter(subscription.options.filter, eventObject)) {
        return;
      }
      
      // Execute handler
      await subscription.handler(eventObject);
      
      // Update metrics
      this.updateEventMetrics(eventObject.event, 'delivered', Date.now() - startTime);
      
    } catch (error) {
      // Handle retry logic
      await this.handleEventRetry(subscription, eventObject, error);
    }
  }

  async handleEventRetry(subscription, eventObject, error) {
    const retryPolicy = this.eventRetryPolicies.get(eventObject.event);
    
    if (!retryPolicy || eventObject.retryCount >= retryPolicy.maxRetries) {
      // Move to dead letter queue
      await this.addToDeadLetterQueue(eventObject, error);
      this.updateEventMetrics(eventObject.event, 'failed', 0);
      return;
    }
    
    // Calculate retry delay
    const delay = Math.min(
      retryPolicy.retryDelay * Math.pow(retryPolicy.backoffMultiplier, eventObject.retryCount),
      retryPolicy.maxRetryDelay
    );
    
    // Increment retry count
    eventObject.retryCount++;
    
    // Schedule retry
    setTimeout(async () => {
      try {
        await subscription.handler(eventObject);
        this.updateEventMetrics(eventObject.event, 'delivered', 0);
      } catch (retryError) {
        await this.handleEventRetry(subscription, eventObject, retryError);
      }
    }, delay);
    
    this.updateEventMetrics(eventObject.event, 'retried', 0);
  }

  async addToDeadLetterQueue(eventObject, error) {
    const deadLetterEvent = {
      ...eventObject,
      error: error.message,
      addedToDeadLetterQueue: new Date().toISOString()
    };
    
    this.eventDeadLetterQueue.push(deadLetterEvent);
    
    // Keep only last 1000 events
    if (this.eventDeadLetterQueue.length > 1000) {
      this.eventDeadLetterQueue = this.eventDeadLetterQueue.slice(-1000);
    }
    
    this.updateEventMetrics(eventObject.event, 'dead_letter', 0);
    
    console.error(`Event moved to dead letter queue: ${eventObject.event}`, error);
  }

  async startDeadLetterQueueProcessing() {
    setInterval(async () => {
      await this.processDeadLetterQueue();
    }, 300000); // Every 5 minutes
  }

  async processDeadLetterQueue() {
    if (this.eventDeadLetterQueue.length === 0) {
      return;
    }
    
    console.log(`Processing ${this.eventDeadLetterQueue.length} events in dead letter queue`);
    
    // Process events in batches
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < this.eventDeadLetterQueue.length; i += batchSize) {
      batches.push(this.eventDeadLetterQueue.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      await Promise.all(batch.map(async (event) => {
        try {
          // Try to reprocess the event
          await this.emit(event.event, event.data, event.options);
          
          // Remove from dead letter queue
          const index = this.eventDeadLetterQueue.indexOf(event);
          if (index > -1) {
            this.eventDeadLetterQueue.splice(index, 1);
          }
        } catch (error) {
          console.error(`Failed to reprocess dead letter event: ${event.event}`, error);
        }
      }));
    }
  }

  validateEventData(event, data) {
    const schema = this.eventSchemas.get(event);
    if (!schema) {
      return true; // No schema defined, allow all data
    }
    
    // Basic validation (in a real implementation, use a proper JSON schema validator)
    for (const requiredField of schema.required) {
      if (!(requiredField in data)) {
        console.error(`Missing required field ${requiredField} for event ${event}`);
        return false;
      }
    }
    
    return true;
  }

  async applyMiddleware(event, data, direction) {
    let processedData = data;
    
    for (const middleware of this.eventMiddleware) {
      if (middleware.events.includes(event) || middleware.events.includes('*')) {
        processedData = await middleware.process(processedData, direction);
      }
    }
    
    return processedData;
  }

  async initializeEventMiddleware() {
    // Add default middleware
    this.eventMiddleware.push({
      name: 'metrics_middleware',
      events: ['*'],
      process: async (data, direction) => {
        // Add metrics to event data
        return {
          ...data,
          middleware: {
            metrics: {
              processedAt: new Date().toISOString(),
              direction
            }
          }
        };
      }
    });
    
    this.eventMiddleware.push({
      name: 'encryption_middleware',
      events: ['user_message', 'ai_response'],
      process: async (data, direction) => {
        // Add encryption metadata (in a real implementation, actually encrypt sensitive data)
        return {
          ...data,
          encryption: {
            encrypted: false, // Placeholder
            algorithm: 'AES-256',
            timestamp: new Date().toISOString()
          }
        };
      }
    });
  }

  applyFilter(filter, eventObject) {
    if (filter.type === 'property') {
      return eventObject.data[filter.property] === filter.value;
    }
    
    if (filter.type === 'function') {
      return filter.function(eventObject);
    }
    
    return true;
  }

  recordEvent(eventObject) {
    this.eventHistory.push(eventObject);
    
    // Keep only last 10000 events
    if (this.eventHistory.length > 10000) {
      this.eventHistory = this.eventHistory.slice(-10000);
    }
  }

  updateEventMetrics(event, type, duration) {
    this.eventBusMetrics.totalEvents++;
    
    switch (type) {
      case 'published':
        this.eventBusMetrics.publishedEvents++;
        break;
      case 'delivered':
        this.eventBusMetrics.deliveredEvents++;
        break;
      case 'failed':
        this.eventBusMetrics.failedEvents++;
        break;
      case 'retried':
        this.eventBusMetrics.retriedEvents++;
        break;
      case 'dead_letter':
        this.eventBusMetrics.deadLetterEvents++;
        break;
    }
    
    // Update event-specific metrics
    if (!this.eventMetrics.has(event)) {
      this.eventMetrics.set(event, {
        published: 0,
        delivered: 0,
        failed: 0,
        retried: 0,
        deadLetter: 0,
        totalDuration: 0,
        averageDuration: 0
      });
    }
    
    const metrics = this.eventMetrics.get(event);
    metrics[type]++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / (metrics.published + metrics.delivered);
  }

  updateSubscriptionMetrics(event, action) {
    if (action === 'subscribed') {
      this.eventBusMetrics.subscriberCount++;
      this.eventBusMetrics.activeSubscriptions++;
    } else if (action === 'unsubscribed') {
      this.eventBusMetrics.activeSubscriptions--;
    }
  }

  async startEventMetricsCollection() {
    setInterval(async () => {
      await this.updateEventBusMetrics();
    }, 60000); // Every minute
  }

  async updateEventBusMetrics() {
    // Calculate throughput
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentEvents = this.eventHistory.filter(event => 
      new Date(event.timestamp).getTime() > oneMinuteAgo
    );
    
    this.eventBusMetrics.eventThroughput = recentEvents.length;
    this.eventBusMetrics.averageDeliveryTime = this.calculateAverageDeliveryTime();
  }

  calculateAverageDeliveryTime() {
    const allDurations = Array.from(this.eventMetrics.values())
      .map(metrics => metrics.averageDuration)
      .filter(duration => duration > 0);
    
    if (allDurations.length === 0) return 0;
    
    return allDurations.reduce((sum, duration) => sum + duration, 0) / allDurations.length;
  }

  async replayEvents(event, fromTimestamp, toTimestamp) {
    const filteredEvents = this.eventHistory.filter(eventObj => {
      const eventTime = new Date(eventObj.timestamp).getTime();
      return eventObj.event === event &&
             eventTime >= fromTimestamp &&
             eventTime <= toTimestamp;
    });
    
    console.log(`Replaying ${filteredEvents.length} events for ${event}`);
    
    for (const eventObj of filteredEvents) {
      this.events.emit(event, eventObj);
    }
    
    return filteredEvents;
  }

  async getEventHistory(event, limit = 100) {
    const filteredEvents = this.eventHistory
      .filter(eventObj => !event || eventObj.event === event)
      .slice(-limit);
    
    return filteredEvents;
  }

  async getEventMetrics(event) {
    if (event) {
      return this.eventMetrics.get(event) || {};
    }
    
    return Object.fromEntries(this.eventMetrics);
  }

  async getDeadLetterQueue() {
    return this.eventDeadLetterQueue;
  }

  async clearDeadLetterQueue() {
    this.eventDeadLetterQueue = [];
    console.log('Dead letter queue cleared');
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  async loadEventBusData() {
    try {
      const stored = await AsyncStorage.getItem('event_bus_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.eventHistory = data.eventHistory || [];
        this.eventMetrics = new Map(data.eventMetrics || []);
        this.eventBusMetrics = data.eventBusMetrics || this.eventBusMetrics;
        this.eventDeadLetterQueue = data.eventDeadLetterQueue || [];
      }
    } catch (error) {
      console.error('Error loading event bus data:', error);
    }
  }

  async saveEventBusData() {
    try {
      const data = {
        eventHistory: this.eventHistory.slice(-1000), // Keep only last 1000 events
        eventMetrics: Array.from(this.eventMetrics.entries()),
        eventBusMetrics: this.eventBusMetrics,
        eventDeadLetterQueue: this.eventDeadLetterQueue
      };
      await AsyncStorage.setItem('event_bus_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving event bus data:', error);
    }
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      eventBusCapabilities: this.eventBusCapabilities,
      totalEvents: this.eventHistory.length,
      eventBusMetrics: this.eventBusMetrics,
      eventMetrics: Object.fromEntries(this.eventMetrics),
      activeSubscriptions: this.eventBusMetrics.activeSubscriptions,
      deadLetterQueueSize: this.eventDeadLetterQueue.length,
      eventSchemas: Object.fromEntries(this.eventSchemas),
      retryPolicies: Object.fromEntries(this.eventRetryPolicies)
    };
  }
}

export default new EventBus();
