import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';
import AdvancedSecurityService from './AdvancedSecurityService';

class ComplianceManagementService {
  constructor() {
    this.isInitialized = false;
    
    // Compliance capabilities
    this.complianceCapabilities = {
      gdpr: true,
      ccpa: true,
      sox: true,
      hipaa: true,
      pci_dss: true,
      iso27001: true,
      auditTrails: true,
      dataGovernance: true,
      privacyControls: true,
      consentManagement: true
    };
    
    // Compliance frameworks
    this.complianceFrameworks = {
      gdpr: {
        name: 'General Data Protection Regulation',
        description: 'EU data protection and privacy regulation',
        requirements: [
          'data_protection_by_design',
          'privacy_by_design',
          'consent_management',
          'data_portability',
          'right_to_be_forgotten',
          'data_breach_notification',
          'privacy_impact_assessment',
          'data_processing_records'
        ],
        penalties: {
          maxFine: 20000000, // 20M EUR or 4% of annual turnover
          currency: 'EUR'
        }
      },
      ccpa: {
        name: 'California Consumer Privacy Act',
        description: 'California state privacy law',
        requirements: [
          'data_transparency',
          'opt_out_rights',
          'data_deletion',
          'data_portability',
          'non_discrimination',
          'privacy_notice',
          'data_categories_disclosure'
        ],
        penalties: {
          maxFine: 7500, // $7,500 per violation
          currency: 'USD'
        }
      },
      sox: {
        name: 'Sarbanes-Oxley Act',
        description: 'Financial reporting and corporate governance',
        requirements: [
          'financial_reporting_accuracy',
          'internal_controls',
          'audit_trail',
          'data_integrity',
          'access_controls',
          'change_management',
          'risk_assessment'
        ],
        penalties: {
          maxFine: 5000000, // $5M and 20 years imprisonment
          currency: 'USD'
        }
      },
      hipaa: {
        name: 'Health Insurance Portability and Accountability Act',
        description: 'Healthcare data protection',
        requirements: [
          'health_data_protection',
          'access_controls',
          'audit_logs',
          'data_encryption',
          'breach_notification',
          'business_associate_agreements',
          'minimum_necessary_standard'
        ],
        penalties: {
          maxFine: 1600000, // $1.6M per violation
          currency: 'USD'
        }
      },
      pci_dss: {
        name: 'Payment Card Industry Data Security Standard',
        description: 'Credit card data protection',
        requirements: [
          'secure_network',
          'cardholder_data_protection',
          'vulnerability_management',
          'access_control',
          'network_monitoring',
          'security_policy'
        ],
        penalties: {
          maxFine: 500000, // $500K per violation
          currency: 'USD'
        }
      }
    };
    
    // Compliance status
    this.complianceStatus = new Map();
    this.complianceViolations = [];
    this.complianceAudits = [];
    this.complianceReports = [];
    
    // Data governance
    this.dataClassification = new Map();
    this.dataRetentionPolicies = new Map();
    this.dataProcessingRecords = [];
    this.dataSubjectRequests = [];
    
    // Privacy controls
    this.privacySettings = new Map();
    this.consentRecords = new Map();
    this.privacyImpactAssessments = [];
    
    // Audit trails
    this.auditTrails = [];
    this.auditLogs = [];
    this.auditReports = [];
    
    // Compliance monitoring
    this.complianceMetrics = new Map();
    this.complianceAlerts = [];
    this.complianceThresholds = {
      violationRate: 0.01, // 1%
      auditFrequency: 30, // 30 days
      dataRetentionPeriod: 365, // 365 days
      consentExpiry: 90 // 90 days
    };
    
    // Compliance automation
    this.automatedChecks = new Map();
    this.complianceWorkflows = new Map();
    this.reminderSystem = new Map();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      await AdvancedSecurityService.initialize();
      await this.loadComplianceData();
      await this.initializeComplianceFrameworks();
      await this.initializeDataGovernance();
      await this.initializePrivacyControls();
      await this.startComplianceMonitoring();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing ComplianceManagementService:', error);
    }
  }

  // Compliance Framework Management
  async initializeComplianceFrameworks() {
    // Initialize compliance status for each framework
    for (const [frameworkId, framework] of Object.entries(this.complianceFrameworks)) {
      const status = await this.assessCompliance(frameworkId);
      this.complianceStatus.set(frameworkId, status);
    }
  }

  async assessCompliance(frameworkId) {
    const framework = this.complianceFrameworks[frameworkId];
    if (!framework) {
      throw new Error(`Compliance framework not found: ${frameworkId}`);
    }
    
    const assessment = {
      frameworkId: frameworkId,
      frameworkName: framework.name,
      assessmentDate: new Date().toISOString(),
      overallScore: 0,
      requirements: [],
      violations: [],
      recommendations: [],
      status: 'unknown'
    };
    
    // Assess each requirement
    for (const requirement of framework.requirements) {
      const requirementAssessment = await this.assessRequirement(frameworkId, requirement);
      assessment.requirements.push(requirementAssessment);
    }
    
    // Calculate overall score
    const totalScore = assessment.requirements.reduce((sum, req) => sum + req.score, 0);
    assessment.overallScore = totalScore / assessment.requirements.length;
    
    // Determine status
    if (assessment.overallScore >= 0.9) {
      assessment.status = 'compliant';
    } else if (assessment.overallScore >= 0.7) {
      assessment.status = 'mostly_compliant';
    } else if (assessment.overallScore >= 0.5) {
      assessment.status = 'partially_compliant';
    } else {
      assessment.status = 'non_compliant';
    }
    
    // Generate recommendations
    assessment.recommendations = await this.generateRecommendations(frameworkId, assessment);
    
    return assessment;
  }

  async assessRequirement(frameworkId, requirement) {
    // Simulate requirement assessment
    // In production, implement actual compliance checks
    
    const score = Math.random() * 100; // 0-100 score
    const status = score >= 80 ? 'compliant' : score >= 60 ? 'partial' : 'non_compliant';
    
    return {
      requirement: requirement,
      score: score,
      status: status,
      evidence: this.generateEvidence(requirement),
      lastChecked: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
  }

  generateEvidence(requirement) {
    // Generate evidence for compliance requirement
    const evidenceTypes = {
      'data_protection_by_design': ['encryption_enabled', 'access_controls', 'audit_logs'],
      'consent_management': ['consent_records', 'opt_in_mechanisms', 'withdrawal_process'],
      'data_portability': ['export_functionality', 'data_formats', 'api_access'],
      'right_to_be_forgotten': ['deletion_procedures', 'data_removal', 'backup_cleanup'],
      'audit_trail': ['log_retention', 'access_logs', 'change_tracking']
    };
    
    return evidenceTypes[requirement] || ['documentation', 'implementation', 'testing'];
  }

  async generateRecommendations(frameworkId, assessment) {
    const recommendations = [];
    
    // Generate recommendations based on assessment results
    for (const requirement of assessment.requirements) {
      if (requirement.score < 80) {
        recommendations.push({
          requirement: requirement.requirement,
          priority: requirement.score < 60 ? 'high' : 'medium',
          action: `Improve ${requirement.requirement} implementation`,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
    
    return recommendations;
  }

  // Data Governance
  async initializeDataGovernance() {
    // Initialize data classification levels
    this.dataClassification.set('public', {
      name: 'Public',
      description: 'Publicly available information',
      protectionLevel: 'low',
      retentionPeriod: 2555, // 7 years
      encryptionRequired: false
    });
    
    this.dataClassification.set('internal', {
      name: 'Internal',
      description: 'Internal business information',
      protectionLevel: 'medium',
      retentionPeriod: 1095, // 3 years
      encryptionRequired: true
    });
    
    this.dataClassification.set('confidential', {
      name: 'Confidential',
      description: 'Confidential business information',
      protectionLevel: 'high',
      retentionPeriod: 2555, // 7 years
      encryptionRequired: true
    });
    
    this.dataClassification.set('restricted', {
      name: 'Restricted',
      description: 'Highly sensitive information',
      protectionLevel: 'critical',
      retentionPeriod: 2555, // 7 years
      encryptionRequired: true
    });
    
    // Initialize data retention policies
    this.dataRetentionPolicies.set('user_data', {
      category: 'Personal Data',
      retentionPeriod: 1095, // 3 years
      legalBasis: 'consent',
      deletionProcedure: 'secure_deletion'
    });
    
    this.dataRetentionPolicies.set('financial_data', {
      category: 'Financial Records',
      retentionPeriod: 2555, // 7 years
      legalBasis: 'legal_obligation',
      deletionProcedure: 'archival'
    });
    
    this.dataRetentionPolicies.set('health_data', {
      category: 'Health Information',
      retentionPeriod: 2555, // 7 years
      legalBasis: 'legal_obligation',
      deletionProcedure: 'secure_deletion'
    });
  }

  async classifyData(data, context = {}) {
    const classification = {
      id: this.generateClassificationId(),
      data: data,
      context: context,
      classification: 'internal', // Default classification
      confidence: 0.8,
      classifiedAt: new Date().toISOString(),
      classifiedBy: 'system'
    };
    
    // Apply classification rules
    if (this.containsPersonalData(data)) {
      classification.classification = 'confidential';
      classification.confidence = 0.9;
    }
    
    if (this.containsFinancialData(data)) {
      classification.classification = 'restricted';
      classification.confidence = 0.95;
    }
    
    if (this.containsHealthData(data)) {
      classification.classification = 'restricted';
      classification.confidence = 0.95;
    }
    
    // Store classification
    this.dataClassification.set(classification.id, classification);
    
    await MetricsService.log('data_classified', {
      classificationId: classification.id,
      classification: classification.classification,
      confidence: classification.confidence
    });
    
    return classification;
  }

  containsPersonalData(data) {
    const personalDataFields = ['email', 'phone', 'address', 'ssn', 'name', 'date_of_birth'];
    const dataString = JSON.stringify(data).toLowerCase();
    return personalDataFields.some(field => dataString.includes(field));
  }

  containsFinancialData(data) {
    const financialDataFields = ['credit_card', 'bank_account', 'routing_number', 'financial'];
    const dataString = JSON.stringify(data).toLowerCase();
    return financialDataFields.some(field => dataString.includes(field));
  }

  containsHealthData(data) {
    const healthDataFields = ['medical', 'health', 'diagnosis', 'treatment', 'medication'];
    const dataString = JSON.stringify(data).toLowerCase();
    return healthDataFields.some(field => dataString.includes(field));
  }

  async recordDataProcessing(processing) {
    const record = {
      id: this.generateProcessingId(),
      purpose: processing.purpose,
      legalBasis: processing.legalBasis,
      dataCategories: processing.dataCategories,
      dataSubjects: processing.dataSubjects,
      recipients: processing.recipients,
      retentionPeriod: processing.retentionPeriod,
      securityMeasures: processing.securityMeasures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.dataProcessingRecords.push(record);
    
    await MetricsService.log('data_processing_recorded', {
      processingId: record.id,
      purpose: record.purpose,
      legalBasis: record.legalBasis
    });
    
    return record;
  }

  // Privacy Controls
  async initializePrivacyControls() {
    // Initialize privacy settings
    this.privacySettings.set('data_collection', {
      enabled: true,
      consentRequired: true,
      optOutAvailable: true,
      dataMinimization: true
    });
    
    this.privacySettings.set('data_sharing', {
      enabled: false,
      consentRequired: true,
      thirdPartySharing: false,
      anonymizationRequired: true
    });
    
    this.privacySettings.set('data_retention', {
      enabled: true,
      automaticDeletion: true,
      retentionPeriod: 1095, // 3 years
      extensionAllowed: false
    });
  }

  async manageConsent(consent) {
    const consentRecord = {
      id: this.generateConsentId(),
      dataSubject: consent.dataSubject,
      purpose: consent.purpose,
      dataCategories: consent.dataCategories,
      consentGiven: consent.consentGiven,
      consentDate: new Date().toISOString(),
      consentMethod: consent.consentMethod,
      withdrawalDate: null,
      status: 'active'
    };
    
    this.consentRecords.set(consentRecord.id, consentRecord);
    
    await MetricsService.log('consent_managed', {
      consentId: consentRecord.id,
      dataSubject: consentRecord.dataSubject,
      consentGiven: consentRecord.consentGiven
    });
    
    return consentRecord;
  }

  async withdrawConsent(consentId) {
    const consent = this.consentRecords.get(consentId);
    if (!consent) {
      throw new Error(`Consent record not found: ${consentId}`);
    }
    
    consent.status = 'withdrawn';
    consent.withdrawalDate = new Date().toISOString();
    
    this.consentRecords.set(consentId, consent);
    
    await MetricsService.log('consent_withdrawn', {
      consentId: consentId,
      dataSubject: consent.dataSubject
    });
    
    return consent;
  }

  async handleDataSubjectRequest(request) {
    const requestRecord = {
      id: this.generateRequestId(),
      dataSubject: request.dataSubject,
      requestType: request.requestType, // access, rectification, erasure, portability, restriction
      description: request.description,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      processedAt: null,
      response: null
    };
    
    this.dataSubjectRequests.push(requestRecord);
    
    // Process request based on type
    switch (request.requestType) {
      case 'access':
        await this.processAccessRequest(requestRecord);
        break;
      case 'erasure':
        await this.processErasureRequest(requestRecord);
        break;
      case 'portability':
        await this.processPortabilityRequest(requestRecord);
        break;
      case 'rectification':
        await this.processRectificationRequest(requestRecord);
        break;
      case 'restriction':
        await this.processRestrictionRequest(requestRecord);
        break;
    }
    
    await MetricsService.log('data_subject_request', {
      requestId: requestRecord.id,
      requestType: requestRecord.requestType,
      dataSubject: requestRecord.dataSubject
    });
    
    return requestRecord;
  }

  async processAccessRequest(request) {
    // Simulate data access request processing
    request.status = 'processing';
    request.response = {
      dataProvided: true,
      dataCategories: ['personal_data', 'usage_data'],
      dataFormat: 'JSON',
      providedAt: new Date().toISOString()
    };
    request.processedAt = new Date().toISOString();
    request.status = 'completed';
  }

  async processErasureRequest(request) {
    // Simulate data erasure request processing
    request.status = 'processing';
    request.response = {
      dataDeleted: true,
      deletionDate: new Date().toISOString(),
      backupDeleted: true,
      thirdPartyNotified: true
    };
    request.processedAt = new Date().toISOString();
    request.status = 'completed';
  }

  async processPortabilityRequest(request) {
    // Simulate data portability request processing
    request.status = 'processing';
    request.response = {
      dataExported: true,
      exportFormat: 'JSON',
      exportDate: new Date().toISOString(),
      downloadLink: 'https://example.com/export/' + request.id
    };
    request.processedAt = new Date().toISOString();
    request.status = 'completed';
  }

  async processRectificationRequest(request) {
    // Simulate data rectification request processing
    request.status = 'processing';
    request.response = {
      dataUpdated: true,
      updateDate: new Date().toISOString(),
      changesApplied: true
    };
    request.processedAt = new Date().toISOString();
    request.status = 'completed';
  }

  async processRestrictionRequest(request) {
    // Simulate data restriction request processing
    request.status = 'processing';
    request.response = {
      restrictionApplied: true,
      restrictionDate: new Date().toISOString(),
      processingLimited: true
    };
    request.processedAt = new Date().toISOString();
    request.status = 'completed';
  }

  // Audit Trails
  async createAuditTrail(event) {
    const auditTrail = {
      id: this.generateAuditId(),
      event: event.event,
      actor: event.actor,
      action: event.action,
      resource: event.resource,
      timestamp: new Date().toISOString(),
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      outcome: event.outcome,
      details: event.details
    };
    
    this.auditTrails.push(auditTrail);
    
    // Maintain audit trail size
    if (this.auditTrails.length > 100000) {
      this.auditTrails = this.auditTrails.slice(-100000);
    }
    
    await MetricsService.log('audit_trail_created', {
      auditId: auditTrail.id,
      event: auditTrail.event,
      actor: auditTrail.actor
    });
    
    return auditTrail;
  }

  async generateAuditReport(frameworkId, startDate, endDate) {
    const report = {
      id: this.generateReportId(),
      frameworkId: frameworkId,
      startDate: startDate,
      endDate: endDate,
      generatedAt: new Date().toISOString(),
      summary: {},
      findings: [],
      recommendations: []
    };
    
    // Filter audit trails by date range
    const relevantTrails = this.auditTrails.filter(trail => {
      const trailDate = new Date(trail.timestamp);
      return trailDate >= startDate && trailDate <= endDate;
    });
    
    // Generate summary
    report.summary = {
      totalEvents: relevantTrails.length,
      uniqueActors: new Set(relevantTrails.map(t => t.actor)).size,
      eventTypes: this.groupByEventType(relevantTrails),
      complianceScore: await this.calculateComplianceScore(frameworkId, relevantTrails)
    };
    
    // Generate findings
    report.findings = await this.generateFindings(frameworkId, relevantTrails);
    
    // Generate recommendations
    report.recommendations = await this.generateAuditRecommendations(frameworkId, report.findings);
    
    this.auditReports.push(report);
    
    await MetricsService.log('audit_report_generated', {
      reportId: report.id,
      frameworkId: frameworkId,
      eventCount: report.summary.totalEvents
    });
    
    return report;
  }

  groupByEventType(trails) {
    const groups = {};
    trails.forEach(trail => {
      groups[trail.event] = (groups[trail.event] || 0) + 1;
    });
    return groups;
  }

  async calculateComplianceScore(frameworkId, trails) {
    // Simulate compliance score calculation
    const framework = this.complianceFrameworks[frameworkId];
    if (!framework) return 0;
    
    // Calculate score based on audit trails and framework requirements
    const baseScore = Math.random() * 100;
    const complianceAdjustment = trails.length > 1000 ? 10 : 0; // Bonus for high activity
    
    return Math.min(100, baseScore + complianceAdjustment);
  }

  async generateFindings(frameworkId, trails) {
    const findings = [];
    
    // Generate findings based on audit trails
    const eventTypes = this.groupByEventType(trails);
    
    for (const [eventType, count] of Object.entries(eventTypes)) {
      if (count > 1000) {
        findings.push({
          type: 'high_activity',
          severity: 'medium',
          description: `High activity detected for ${eventType}: ${count} events`,
          recommendation: 'Review activity patterns and implement additional monitoring'
        });
      }
    }
    
    return findings;
  }

  async generateAuditRecommendations(frameworkId, findings) {
    const recommendations = [];
    
    for (const finding of findings) {
      if (finding.severity === 'high') {
        recommendations.push({
          priority: 'high',
          action: `Address ${finding.type} finding`,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });
      }
    }
    
    return recommendations;
  }

  // Compliance Monitoring
  async startComplianceMonitoring() {
    setInterval(async () => {
      await this.performComplianceChecks();
      await this.updateComplianceMetrics();
      await this.checkComplianceThresholds();
    }, 86400000); // Every 24 hours
  }

  async performComplianceChecks() {
    // Perform automated compliance checks
    for (const [frameworkId, framework] of Object.entries(this.complianceFrameworks)) {
      await this.performFrameworkCheck(frameworkId);
    }
  }

  async performFrameworkCheck(frameworkId) {
    const currentStatus = this.complianceStatus.get(frameworkId);
    if (!currentStatus) return;
    
    // Check if assessment is due
    const lastAssessment = new Date(currentStatus.assessmentDate);
    const daysSinceAssessment = (Date.now() - lastAssessment.getTime()) / (24 * 60 * 60 * 1000);
    
    if (daysSinceAssessment > this.complianceThresholds.auditFrequency) {
      // Perform new assessment
      const newAssessment = await this.assessCompliance(frameworkId);
      this.complianceStatus.set(frameworkId, newAssessment);
      
      // Check for violations
      if (newAssessment.overallScore < 0.8) {
        await this.createComplianceViolation(frameworkId, newAssessment);
      }
    }
  }

  async createComplianceViolation(frameworkId, assessment) {
    const violation = {
      id: this.generateViolationId(),
      frameworkId: frameworkId,
      severity: assessment.overallScore < 0.5 ? 'critical' : 'high',
      description: `Compliance violation detected for ${frameworkId}`,
      score: assessment.overallScore,
      requirements: assessment.requirements.filter(req => req.score < 80),
      detectedAt: new Date().toISOString(),
      status: 'open',
      remediation: null
    };
    
    this.complianceViolations.push(violation);
    
    await MetricsService.log('compliance_violation', {
      violationId: violation.id,
      frameworkId: frameworkId,
      severity: violation.severity,
      score: violation.score
    });
    
    return violation;
  }

  async updateComplianceMetrics() {
    // Update compliance metrics
    const metrics = {
      totalFrameworks: Object.keys(this.complianceFrameworks).length,
      compliantFrameworks: 0,
      nonCompliantFrameworks: 0,
      totalViolations: this.complianceViolations.length,
      openViolations: this.complianceViolations.filter(v => v.status === 'open').length,
      dataSubjectRequests: this.dataSubjectRequests.length,
      pendingRequests: this.dataSubjectRequests.filter(r => r.status === 'pending').length
    };
    
    // Count compliant frameworks
    for (const [frameworkId, status] of this.complianceStatus.entries()) {
      if (status.overallScore >= 0.8) {
        metrics.compliantFrameworks++;
      } else {
        metrics.nonCompliantFrameworks++;
      }
    }
    
    this.complianceMetrics.set('current', metrics);
  }

  async checkComplianceThresholds() {
    const metrics = this.complianceMetrics.get('current');
    if (!metrics) return;
    
    // Check violation rate
    const violationRate = metrics.openViolations / metrics.totalFrameworks;
    if (violationRate > this.complianceThresholds.violationRate) {
      await this.createComplianceAlert('high_violation_rate', {
        rate: violationRate,
        threshold: this.complianceThresholds.violationRate
      });
    }
    
    // Check pending requests
    if (metrics.pendingRequests > 10) {
      await this.createComplianceAlert('high_pending_requests', {
        count: metrics.pendingRequests
      });
    }
  }

  async createComplianceAlert(type, data) {
    const alert = {
      id: this.generateAlertId(),
      type: type,
      data: data,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    
    this.complianceAlerts.push(alert);
    
    await MetricsService.log('compliance_alert', {
      type,
      data
    });
  }

  // Utility Methods
  generateClassificationId() {
    return `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateProcessingId() {
    return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateConsentId() {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateReportId() {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateViolationId() {
    return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  async loadComplianceData() {
    try {
      const stored = await AsyncStorage.getItem('compliance_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.complianceStatus = new Map(data.complianceStatus || []);
        this.complianceViolations = data.complianceViolations || [];
        this.complianceAudits = data.complianceAudits || [];
        this.complianceReports = data.complianceReports || [];
        this.dataProcessingRecords = data.dataProcessingRecords || [];
        this.dataSubjectRequests = data.dataSubjectRequests || [];
        this.auditTrails = data.auditTrails || [];
        this.auditReports = data.auditReports || [];
        this.consentRecords = new Map(data.consentRecords || []);
        this.complianceAlerts = data.complianceAlerts || [];
      }
    } catch (error) {
      console.error('Error loading compliance data:', error);
    }
  }

  async saveComplianceData() {
    try {
      const data = {
        complianceStatus: Array.from(this.complianceStatus.entries()),
        complianceViolations: this.complianceViolations,
        complianceAudits: this.complianceAudits,
        complianceReports: this.complianceReports,
        dataProcessingRecords: this.dataProcessingRecords,
        dataSubjectRequests: this.dataSubjectRequests,
        auditTrails: this.auditTrails,
        auditReports: this.auditReports,
        consentRecords: Array.from(this.consentRecords.entries()),
        complianceAlerts: this.complianceAlerts
      };
      await AsyncStorage.setItem('compliance_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving compliance data:', error);
    }
  }

  // Health Check
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      complianceCapabilities: this.complianceCapabilities,
      complianceFrameworks: Object.keys(this.complianceFrameworks),
      complianceStatus: Object.fromEntries(this.complianceStatus),
      complianceMetrics: Object.fromEntries(this.complianceMetrics),
      totalViolations: this.complianceViolations.length,
      openViolations: this.complianceViolations.filter(v => v.status === 'open').length,
      dataSubjectRequests: this.dataSubjectRequests.length,
      pendingRequests: this.dataSubjectRequests.filter(r => r.status === 'pending').length,
      auditTrailsCount: this.auditTrails.length,
      consentRecordsCount: this.consentRecords.size,
      complianceAlertsCount: this.complianceAlerts.length
    };
  }
}

export default new ComplianceManagementService();
