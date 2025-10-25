import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Switch
} from 'react-native';
import ComplianceManagementService from '../../services/ComplianceManagementService';
import MetricsService from '../../services/MetricsService';

const { width, height } = Dimensions.get('window');

const ComplianceDashboard = ({ onClose }) => {
  const [complianceData, setComplianceData] = useState({
    complianceStatus: {},
    complianceMetrics: {},
    complianceViolations: [],
    dataSubjectRequests: [],
    auditTrails: [],
    consentRecords: new Map()
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ dataSubject: '', requestType: 'access', description: '' });
  const [newConsent, setNewConsent] = useState({ dataSubject: '', purpose: '', consentGiven: true });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadComplianceData();
    const interval = setInterval(loadComplianceData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      setIsLoading(true);
      const healthStatus = await ComplianceManagementService.getHealthStatus();
      setComplianceData(healthStatus);
    } catch (error) {
      console.error('Error loading compliance data:', error);
      Alert.alert('Error', 'Failed to load compliance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataSubjectRequest = async () => {
    if (!newRequest.dataSubject.trim() || !newRequest.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const request = await ComplianceManagementService.handleDataSubjectRequest(newRequest);
      setShowRequestModal(false);
      setNewRequest({ dataSubject: '', requestType: 'access', description: '' });
      loadComplianceData();
      Alert.alert('Success', `Data subject request submitted. Request ID: ${request.id}`);
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Failed to submit data subject request');
    }
  };

  const handleConsentManagement = async () => {
    if (!newConsent.dataSubject.trim() || !newConsent.purpose.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const consent = await ComplianceManagementService.manageConsent(newConsent);
      setShowConsentModal(false);
      setNewConsent({ dataSubject: '', purpose: '', consentGiven: true });
      loadComplianceData();
      Alert.alert('Success', `Consent managed. Consent ID: ${consent.id}`);
    } catch (error) {
      console.error('Error managing consent:', error);
      Alert.alert('Error', 'Failed to manage consent');
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Compliance Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Status</Text>
        <View style={styles.complianceGrid}>
          {Object.entries(complianceData.complianceStatus || {}).map(([framework, status]) => (
            <View key={framework} style={styles.complianceCard}>
              <Text style={styles.complianceFramework}>{framework.toUpperCase()}</Text>
              <Text style={[
                styles.complianceStatus,
                { color: getStatusColor(status.overallScore) }
              ]}>
                {status.status?.toUpperCase() || 'UNKNOWN'}
              </Text>
              <Text style={styles.complianceScore}>
                Score: {Math.round(status.overallScore * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Compliance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {complianceData.complianceMetrics?.compliantFrameworks || 0}
            </Text>
            <Text style={styles.metricLabel}>Compliant</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {complianceData.complianceMetrics?.nonCompliantFrameworks || 0}
            </Text>
            <Text style={styles.metricLabel}>Non-Compliant</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {complianceData.complianceMetrics?.openViolations || 0}
            </Text>
            <Text style={styles.metricLabel}>Open Violations</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {complianceData.complianceMetrics?.pendingRequests || 0}
            </Text>
            <Text style={styles.metricLabel}>Pending Requests</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowRequestModal(true)}
          >
            <Text style={styles.actionButtonText}>Data Subject Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowConsentModal(true)}
          >
            <Text style={styles.actionButtonText}>Manage Consent</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderFrameworksTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Frameworks</Text>
        <View style={styles.frameworksList}>
          {Object.entries(ComplianceManagementService.complianceFrameworks).map(([id, framework]) => (
            <View key={id} style={styles.frameworkCard}>
              <Text style={styles.frameworkName}>{framework.name}</Text>
              <Text style={styles.frameworkDescription}>{framework.description}</Text>
              <View style={styles.requirementsList}>
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                {framework.requirements.map((requirement, index) => (
                  <Text key={index} style={styles.requirement}>
                    • {requirement.replace(/_/g, ' ')}
                  </Text>
                ))}
              </View>
              <View style={styles.penaltyInfo}>
                <Text style={styles.penaltyText}>
                  Max Penalty: {framework.penalties.currency} {framework.penalties.maxFine.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderRequestsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Subject Requests ({complianceData.dataSubjectRequests?.length || 0})</Text>
        <View style={styles.requestsList}>
          {(complianceData.dataSubjectRequests || []).slice(0, 10).map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <Text style={styles.requestType}>{request.requestType.toUpperCase()}</Text>
              <Text style={styles.requestSubject}>Subject: {request.dataSubject}</Text>
              <Text style={styles.requestDescription}>{request.description}</Text>
              <Text style={[
                styles.requestStatus,
                { color: getRequestStatusColor(request.status) }
              ]}>
                Status: {request.status.toUpperCase()}
              </Text>
              <Text style={styles.requestDate}>
                Submitted: {new Date(request.submittedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderAuditTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audit Trails ({complianceData.auditTrailsCount || 0})</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Complete audit trail of all compliance-related activities and events.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audit Reports ({complianceData.auditReportsCount || 0})</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Generated audit reports for compliance monitoring and reporting.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consent Records ({complianceData.consentRecordsCount || 0})</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Records of user consent for data processing activities.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderRequestModal = () => (
    <Modal
      visible={showRequestModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Data Subject Request</Text>
          
          <Text style={styles.modalLabel}>Data Subject:</Text>
          <TextInput
            style={styles.modalInput}
            value={newRequest.dataSubject}
            onChangeText={(text) => setNewRequest(prev => ({ ...prev, dataSubject: text }))}
            placeholder="Enter data subject identifier"
          />
          
          <Text style={styles.modalLabel}>Request Type:</Text>
          <View style={styles.typeButtons}>
            {['access', 'erasure', 'portability', 'rectification', 'restriction'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  newRequest.requestType === type && styles.typeButtonActive
                ]}
                onPress={() => setNewRequest(prev => ({ ...prev, requestType: type }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  newRequest.requestType === type && styles.typeButtonTextActive
                ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.modalLabel}>Description:</Text>
          <TextInput
            style={[styles.modalInput, styles.textArea]}
            value={newRequest.description}
            onChangeText={(text) => setNewRequest(prev => ({ ...prev, description: text }))}
            placeholder="Describe your request"
            multiline
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowRequestModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleDataSubjectRequest}
            >
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderConsentModal = () => (
    <Modal
      visible={showConsentModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Manage Consent</Text>
          
          <Text style={styles.modalLabel}>Data Subject:</Text>
          <TextInput
            style={styles.modalInput}
            value={newConsent.dataSubject}
            onChangeText={(text) => setNewConsent(prev => ({ ...prev, dataSubject: text }))}
            placeholder="Enter data subject identifier"
          />
          
          <Text style={styles.modalLabel}>Purpose:</Text>
          <TextInput
            style={styles.modalInput}
            value={newConsent.purpose}
            onChangeText={(text) => setNewConsent(prev => ({ ...prev, purpose: text }))}
            placeholder="Enter data processing purpose"
          />
          
          <Text style={styles.modalLabel}>Consent Given:</Text>
          <View style={styles.consentToggle}>
            <Switch
              value={newConsent.consentGiven}
              onValueChange={(value) => setNewConsent(prev => ({ ...prev, consentGiven: value }))}
              trackColor={{ false: '#333', true: '#4CAF50' }}
              thumbColor={newConsent.consentGiven ? '#ffffff' : '#888'}
            />
            <Text style={styles.consentToggleText}>
              {newConsent.consentGiven ? 'Consent Given' : 'Consent Withdrawn'}
            </Text>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowConsentModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleConsentManagement}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const getStatusColor = (score) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'pending': return '#2196F3';
      default: return '#888';
    }
  };

  const tabs = [
    { id: 'overview', title: 'Overview' },
    { id: 'frameworks', title: 'Frameworks' },
    { id: 'requests', title: 'Requests' },
    { id: 'audit', title: 'Audit' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Compliance Dashboard</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && styles.tabActive
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.tabTextActive
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'frameworks' && renderFrameworksTab()}
      {selectedTab === 'requests' && renderRequestsTab()}
      {selectedTab === 'audit' && renderAuditTab()}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Modals */}
      {renderRequestModal()}
      {renderConsentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  complianceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: (width - 48) / 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  complianceFramework: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  complianceStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  complianceScore: {
    fontSize: 12,
    color: '#888',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: (width - 48) / 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.45,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  frameworksList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  frameworkCard: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  frameworkName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  frameworkDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  requirementsList: {
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  penaltyInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 8,
  },
  penaltyText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  requestsList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  requestCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  requestType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  requestSubject: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  requestDescription: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 8,
  },
  requestStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 10,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 10,
    color: '#888',
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  consentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consentToggleText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.4,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#333',
  },
  modalButtonConfirm: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ComplianceDashboard;
