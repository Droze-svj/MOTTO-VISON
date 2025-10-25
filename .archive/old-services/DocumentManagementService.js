// Document Management Service - Handles document uploads, processing, and management
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsService } from './MetricsService';
import { ErrorManager } from './ErrorManager';
import LocalAIDocumentAnalysisService from './LocalAIDocumentAnalysisService';

class DocumentManagementService {
  constructor() {
    this.isInitialized = false;
    this.documentStorage = {
      documents: [],
      categories: [],
      tags: [],
      metadata: {},
      processingQueue: [],
      processedDocuments: []
    };
    
    this.supportedFormats = {
      text: ['txt', 'md', 'rtf'],
      documents: ['pdf', 'doc', 'docx'],
      web: ['html', 'htm', 'xml'],
      data: ['json', 'csv', 'xlsx'],
      code: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'h'],
      config: ['yaml', 'yml', 'ini', 'conf', 'cfg']
    };
    
    this.processingCapabilities = {
      textExtraction: true,
      metadataExtraction: true,
      contentAnalysis: true,
      structureAnalysis: true,
      languageDetection: true,
      encodingDetection: true,
      formatConversion: true,
      compression: true,
      encryption: true,
      indexing: true
    };
    
    this.storageSettings = {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxDocuments: 1000,
      compressionEnabled: true,
      encryptionEnabled: true,
      backupEnabled: true,
      versioningEnabled: true
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadDocumentStorage();
      await this.initializeProcessingQueue();
      await this.startBackgroundProcessing();
      
      this.isInitialized = true;
      console.log('✅ Document Management Service initialized');
      
      await MetricsService.logEvent('document_management_initialized', {
        documentCount: this.documentStorage.documents.length,
        supportedFormats: Object.keys(this.supportedFormats).length,
        processingCapabilities: Object.keys(this.processingCapabilities).filter(k => this.processingCapabilities[k]).length
      });
    } catch (error) {
      console.error('❌ Failed to initialize Document Management Service:', error);
      await ErrorManager.handleError(error, { context: 'DocumentManagementService.initialize' });
      throw error;
    }
  }

  // Document Upload and Processing
  async uploadDocument(documentData, options = {}) {
    try {
      const document = await this.validateDocument(documentData);
      const processedDocument = await this.processDocument(document, options);
      const storedDocument = await this.storeDocument(processedDocument);
      
      // Add to processing queue for analysis
      await this.addToProcessingQueue(storedDocument);
      
      console.log(`✅ Document uploaded: ${storedDocument.title}`);
      return storedDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      await ErrorManager.handleError(error, { context: 'DocumentManagementService.uploadDocument' });
      throw error;
    }
  }

  async validateDocument(documentData) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Check file size
    if (documentData.size > this.storageSettings.maxFileSize) {
      validation.isValid = false;
      validation.errors.push('File size exceeds maximum limit');
    }
    
    // Check file format
    const fileExtension = this.getFileExtension(documentData.name);
    const supportedFormats = Object.values(this.supportedFormats).flat();
    if (!supportedFormats.includes(fileExtension)) {
      validation.isValid = false;
      validation.errors.push('Unsupported file format');
    }
    
    // Check document count limit
    if (this.documentStorage.documents.length >= this.storageSettings.maxDocuments) {
      validation.isValid = false;
      validation.errors.push('Maximum document limit reached');
    }
    
    // Check for duplicate
    const isDuplicate = this.documentStorage.documents.some(doc => 
      doc.name === documentData.name && doc.size === documentData.size
    );
    if (isDuplicate) {
      validation.warnings.push('Document with same name and size already exists');
    }
    
    if (!validation.isValid) {
      throw new Error(`Document validation failed: ${validation.errors.join(', ')}`);
    }
    
    return {
      ...documentData,
      validation: validation,
      uploadTimestamp: Date.now(),
      status: 'uploaded'
    };
  }

  async processDocument(document, options = {}) {
    const processedDocument = {
      ...document,
      id: this.generateDocumentId(),
      processingTimestamp: Date.now(),
      status: 'processing'
    };
    
    // Extract text content
    if (this.processingCapabilities.textExtraction) {
      processedDocument.content = await this.extractTextContent(document);
    }
    
    // Extract metadata
    if (this.processingCapabilities.metadataExtraction) {
      processedDocument.metadata = await this.extractMetadata(document);
    }
    
    // Detect language
    if (this.processingCapabilities.languageDetection) {
      processedDocument.language = await this.detectLanguage(processedDocument.content);
    }
    
    // Detect encoding
    if (this.processingCapabilities.encodingDetection) {
      processedDocument.encoding = await this.detectEncoding(document);
    }
    
    // Analyze structure
    if (this.processingCapabilities.structureAnalysis) {
      processedDocument.structure = await this.analyzeStructure(processedDocument.content);
    }
    
    // Compress if enabled
    if (this.storageSettings.compressionEnabled) {
      processedDocument.compressedContent = await this.compressContent(processedDocument.content);
    }
    
    // Encrypt if enabled
    if (this.storageSettings.encryptionEnabled) {
      processedDocument.encryptedContent = await this.encryptContent(processedDocument.content);
    }
    
    processedDocument.status = 'processed';
    processedDocument.processingComplete = Date.now();
    
    return processedDocument;
  }

  async storeDocument(document) {
    // Add to document storage
    this.documentStorage.documents.push(document);
    
    // Update categories
    if (document.category && !this.documentStorage.categories.includes(document.category)) {
      this.documentStorage.categories.push(document.category);
    }
    
    // Update tags
    if (document.tags) {
      document.tags.forEach(tag => {
        if (!this.documentStorage.tags.includes(tag)) {
          this.documentStorage.tags.push(tag);
        }
      });
    }
    
    // Update metadata
    this.documentStorage.metadata[document.id] = {
      uploadTime: document.uploadTimestamp,
      processingTime: document.processingTimestamp,
      size: document.size,
      type: document.type,
      language: document.language,
      category: document.category,
      tags: document.tags
    };
    
    await this.saveDocumentStorage();
    
    return document;
  }

  async addToProcessingQueue(document) {
    const queueItem = {
      documentId: document.id,
      document: document,
      priority: this.calculatePriority(document),
      timestamp: Date.now(),
      status: 'queued'
    };
    
    this.documentStorage.processingQueue.push(queueItem);
    await this.saveDocumentStorage();
  }

  // Document Analysis Integration
  async startBackgroundProcessing() {
    setInterval(async () => {
      await this.processQueue();
    }, 30000); // Process every 30 seconds
  }

  async processQueue() {
    if (this.documentStorage.processingQueue.length === 0) return;
    
    const queueItem = this.documentStorage.processingQueue.shift();
    if (!queueItem) return;
    
    try {
      queueItem.status = 'processing';
      
      // Analyze document using Local AI Document Analysis Service
      const analysis = await LocalAIDocumentAnalysisService.analyzeDocument(queueItem.document, {
        deepAnalysis: true,
        extractInsights: true,
        mapRelationships: true,
        generateSummary: true
      });
      
      queueItem.status = 'completed';
      queueItem.analysis = analysis;
      queueItem.completedAt = Date.now();
      
      this.documentStorage.processedDocuments.push(queueItem);
      
      console.log(`✅ Document analysis completed: ${queueItem.document.title}`);
    } catch (error) {
      console.error('Error processing document:', error);
      queueItem.status = 'failed';
      queueItem.error = error.message;
      queueItem.failedAt = Date.now();
    }
    
    await this.saveDocumentStorage();
  }

  // Document Retrieval and Search
  async getDocument(documentId) {
    const document = this.documentStorage.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    return document;
  }

  async getDocumentsByCategory(category) {
    return this.documentStorage.documents.filter(doc => doc.category === category);
  }

  async getDocumentsByTag(tag) {
    return this.documentStorage.documents.filter(doc => doc.tags && doc.tags.includes(tag));
  }

  async getDocumentsByType(type) {
    return this.documentStorage.documents.filter(doc => doc.type === type);
  }

  async searchDocuments(query, options = {}) {
    const results = [];
    
    for (const document of this.documentStorage.documents) {
      const relevanceScore = this.calculateRelevanceScore(query, document);
      if (relevanceScore > (options.threshold || 0.1)) {
        results.push({
          document: document,
          relevanceScore: relevanceScore,
          matchType: 'content'
        });
      }
    }
    
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async getDocumentAnalysis(documentId) {
    const processedDocument = this.documentStorage.processedDocuments.find(
      doc => doc.documentId === documentId
    );
    
    if (!processedDocument || !processedDocument.analysis) {
      throw new Error('Document analysis not found');
    }
    
    return processedDocument.analysis;
  }

  // Document Management
  async updateDocument(documentId, updates) {
    const documentIndex = this.documentStorage.documents.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }
    
    this.documentStorage.documents[documentIndex] = {
      ...this.documentStorage.documents[documentIndex],
      ...updates,
      lastModified: Date.now()
    };
    
    await this.saveDocumentStorage();
    return this.documentStorage.documents[documentIndex];
  }

  async deleteDocument(documentId) {
    const documentIndex = this.documentStorage.documents.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }
    
    const document = this.documentStorage.documents[documentIndex];
    this.documentStorage.documents.splice(documentIndex, 1);
    
    // Remove from processing queue
    this.documentStorage.processingQueue = this.documentStorage.processingQueue.filter(
      item => item.documentId !== documentId
    );
    
    // Remove from processed documents
    this.documentStorage.processedDocuments = this.documentStorage.processedDocuments.filter(
      item => item.documentId !== documentId
    );
    
    // Remove metadata
    delete this.documentStorage.metadata[documentId];
    
    await this.saveDocumentStorage();
    return document;
  }

  async organizeDocuments(organizationRules) {
    for (const rule of organizationRules) {
      const documents = this.documentStorage.documents.filter(rule.filter);
      
      for (const document of documents) {
        if (rule.category) {
          document.category = rule.category;
        }
        if (rule.tags) {
          document.tags = [...(document.tags || []), ...rule.tags];
        }
        if (rule.folder) {
          document.folder = rule.folder;
        }
      }
    }
    
    await this.saveDocumentStorage();
  }

  // Document Statistics and Analytics
  async getDocumentStatistics() {
    const stats = {
      totalDocuments: this.documentStorage.documents.length,
      documentsByType: this.getDocumentsByTypeStats(),
      documentsByCategory: this.getDocumentsByCategoryStats(),
      documentsByLanguage: this.getDocumentsByLanguageStats(),
      documentsBySize: this.getDocumentsBySizeStats(),
      processingStats: this.getProcessingStats(),
      storageStats: this.getStorageStats(),
      recentActivity: this.getRecentActivity()
    };
    
    return stats;
  }

  getDocumentsByTypeStats() {
    const stats = {};
    this.documentStorage.documents.forEach(doc => {
      stats[doc.type] = (stats[doc.type] || 0) + 1;
    });
    return stats;
  }

  getDocumentsByCategoryStats() {
    const stats = {};
    this.documentStorage.documents.forEach(doc => {
      const category = doc.category || 'uncategorized';
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }

  getDocumentsByLanguageStats() {
    const stats = {};
    this.documentStorage.documents.forEach(doc => {
      const language = doc.language || 'unknown';
      stats[language] = (stats[language] || 0) + 1;
    });
    return stats;
  }

  getDocumentsBySizeStats() {
    const stats = {
      small: 0,    // < 1MB
      medium: 0,   // 1MB - 10MB
      large: 0     // > 10MB
    };
    
    this.documentStorage.documents.forEach(doc => {
      if (doc.size < 1024 * 1024) {
        stats.small++;
      } else if (doc.size < 10 * 1024 * 1024) {
        stats.medium++;
      } else {
        stats.large++;
      }
    });
    
    return stats;
  }

  getProcessingStats() {
    return {
      queued: this.documentStorage.processingQueue.length,
      processing: this.documentStorage.processingQueue.filter(item => item.status === 'processing').length,
      completed: this.documentStorage.processedDocuments.filter(item => item.status === 'completed').length,
      failed: this.documentStorage.processedDocuments.filter(item => item.status === 'failed').length
    };
  }

  getStorageStats() {
    const totalSize = this.documentStorage.documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const averageSize = this.documentStorage.documents.length > 0 ? totalSize / this.documentStorage.documents.length : 0;
    
    return {
      totalSize: totalSize,
      averageSize: averageSize,
      maxSize: Math.max(...this.documentStorage.documents.map(doc => doc.size || 0)),
      minSize: Math.min(...this.documentStorage.documents.map(doc => doc.size || 0))
    };
  }

  getRecentActivity() {
    const recentDocuments = this.documentStorage.documents
      .sort((a, b) => b.uploadTimestamp - a.uploadTimestamp)
      .slice(0, 10);
    
    return recentDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      size: doc.size,
      uploadTime: doc.uploadTimestamp,
      status: doc.status
    }));
  }

  // Utility Methods
  generateDocumentId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  calculatePriority(document) {
    let priority = 1; // Default priority
    
    // Higher priority for smaller files
    if (document.size < 1024 * 1024) priority += 2;
    else if (document.size < 10 * 1024 * 1024) priority += 1;
    
    // Higher priority for text documents
    if (this.supportedFormats.text.includes(this.getFileExtension(document.name))) {
      priority += 2;
    }
    
    // Higher priority for recent uploads
    const age = Date.now() - document.uploadTimestamp;
    if (age < 60000) priority += 1; // Less than 1 minute
    
    return priority;
  }

  calculateRelevanceScore(query, document) {
    const queryWords = query.toLowerCase().split(' ');
    const documentText = (document.title + ' ' + (document.content || '')).toLowerCase();
    
    let score = 0;
    queryWords.forEach(word => {
      if (documentText.includes(word)) {
        score += 1;
      }
    });
    
    return score / queryWords.length;
  }

  async extractTextContent(document) {
    // This would integrate with actual text extraction libraries
    // For now, return the content as-is
    return document.content || '';
  }

  async extractMetadata(document) {
    return {
      name: document.name,
      size: document.size,
      type: document.type,
      lastModified: document.lastModified || Date.now(),
      created: document.created || Date.now(),
      author: document.author || 'Unknown',
      title: document.title || document.name,
      description: document.description || '',
      keywords: document.keywords || [],
      language: document.language || 'en'
    };
  }

  async detectLanguage(content) {
    // Simple language detection
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = content.toLowerCase().split(' ');
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    
    return englishCount > words.length * 0.1 ? 'en' : 'unknown';
  }

  async detectEncoding(document) {
    // Default to UTF-8
    return 'utf-8';
  }

  async analyzeStructure(content) {
    return {
      hasHeadings: /^#+\s/.test(content),
      hasLists: /^\s*[-*+]\s/.test(content),
      hasCodeBlocks: /```/.test(content),
      hasLinks: /\[.*?\]\(.*?\)/.test(content),
      hasImages: /!\[.*?\]\(.*?\)/.test(content),
      hasTables: /\|.*\|/.test(content)
    };
  }

  async compressContent(content) {
    // Simple compression simulation
    return content; // In real implementation, use compression library
  }

  async encryptContent(content) {
    // Simple encryption simulation
    return content; // In real implementation, use encryption library
  }

  // Data Persistence
  async loadDocumentStorage() {
    try {
      const data = await AsyncStorage.getItem('document_management_storage');
      if (data) {
        this.documentStorage = { ...this.documentStorage, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading document storage:', error);
    }
  }

  async saveDocumentStorage() {
    try {
      await AsyncStorage.setItem('document_management_storage', JSON.stringify(this.documentStorage));
    } catch (error) {
      console.error('Error saving document storage:', error);
    }
  }

  // Status and Health
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      documentCount: this.documentStorage.documents.length,
      processingQueue: this.documentStorage.processingQueue.length,
      processedDocuments: this.documentStorage.processedDocuments.length,
      supportedFormats: Object.keys(this.supportedFormats),
      processingCapabilities: Object.keys(this.processingCapabilities).filter(k => this.processingCapabilities[k]),
      storageSettings: this.storageSettings
    };
  }

  // Cleanup
  async destroy() {
    await this.saveDocumentStorage();
    this.isInitialized = false;
    console.log('🧹 Document Management Service destroyed');
  }
}

export default new DocumentManagementService();
