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
  Switch
} from 'react-native';
import IntegrationAutomationService from '../../services/IntegrationAutomationService';
import MetricsService from '../../services/MetricsService';

const AutomationDashboard = ({ onClose }) => {
  const [integrations, setIntegrations] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [automationHistory, setAutomationHistory] = useState([]);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'api',
    config: { url: '', method: 'GET' }
  });
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    type: 'sequential',
    actions: []
  });

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      const [integrationsData, workflowsData, historyData] = await Promise.all([
        IntegrationAutomationService.getHealthStatus(),
        IntegrationAutomationService.getHealthStatus(),
        IntegrationAutomationService.getHealthStatus()
      ]);
      
      // For demonstration, create sample data
      setIntegrations([
        {
          id: '1',
          name: 'OpenRouter API',
          type: 'api',
          status: 'active',
          health: 'healthy',
          lastUsed: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Email Service',
          type: 'email',
          status: 'active',
          health: 'healthy',
          lastUsed: new Date().toISOString()
        }
      ]);
      
      setWorkflows([
        {
          id: '1',
          name: 'Daily Report',
          type: 'scheduled',
          status: 'active',
          executionCount: 15,
          successCount: 14,
          failureCount: 1
        },
        {
          id: '2',
          name: 'Data Sync',
          type: 'event',
          status: 'active',
          executionCount: 8,
          successCount: 8,
          failureCount: 0
        }
      ]);
      
      setAutomationHistory([
        {
          id: '1',
          workflowId: '1',
          success: true,
          timestamp: new Date().toISOString(),
          duration: 2500
        },
        {
          id: '2',
          workflowId: '2',
          success: true,
          timestamp: new Date().toISOString(),
          duration: 1800
        }
      ]);
      
    } catch (error) {
      console.error('Error loading automation data:', error);
      Alert.alert('Error', 'Failed to load automation data');
    }
  };

  const handleCreateIntegration = async () => {
    if (!newIntegration.name || !newIntegration.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const integration = await IntegrationAutomationService.createIntegration(newIntegration);
      setIntegrations(prev => [integration, ...prev]);
      setShowIntegrationModal(false);
      setNewIntegration({ name: '', type: 'api', config: { url: '', method: 'GET' } });
      Alert.alert('Success', 'Integration created successfully');
    } catch (error) {
      console.error('Error creating integration:', error);
      Alert.alert('Error', 'Failed to create integration');
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const workflow = await IntegrationAutomationService.createWorkflow(newWorkflow);
      setWorkflows(prev => [workflow, ...prev]);
      setShowWorkflowModal(false);
      setNewWorkflow({ name: '', type: 'sequential', actions: [] });
      Alert.alert('Success', 'Workflow created successfully');
    } catch (error) {
      console.error('Error creating workflow:', error);
      Alert.alert('Error', 'Failed to create workflow');
    }
  };

  const handleTestIntegration = async (integrationId) => {
    try {
      const result = await IntegrationAutomationService.testIntegration(integrationId);
      Alert.alert('Test Result', result.message);
    } catch (error) {
      console.error('Error testing integration:', error);
      Alert.alert('Error', 'Failed to test integration');
    }
  };

  const handleExecuteWorkflow = async (workflowId) => {
    try {
      const result = await IntegrationAutomationService.executeWorkflow(workflowId);
      Alert.alert('Execution Result', result.success ? 'Workflow executed successfully' : 'Workflow execution failed');
    } catch (error) {
      console.error('Error executing workflow:', error);
      Alert.alert('Error', 'Failed to execute workflow');
    }
  };

  const renderIntegration = ({ item }) => (
    <View style={styles.integrationCard}>
      <View style={styles.integrationHeader}>
        <Text style={styles.integrationName}>{item.name}</Text>
        <View style={styles.integrationStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: item.health === 'healthy' ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.integrationType}>Type: {item.type.toUpperCase()}</Text>
      <Text style={styles.integrationHealth}>Health: {item.health}</Text>
      
      {item.lastUsed && (
        <Text style={styles.integrationLastUsed}>
          Last used: {new Date(item.lastUsed).toLocaleString()}
        </Text>
      )}
      
      <View style={styles.integrationActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTestIntegration(item.id)}
        >
          <Text style={styles.actionButtonText}>Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => {/* Edit integration */}}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWorkflow = ({ item }) => (
    <View style={styles.workflowCard}>
      <View style={styles.workflowHeader}>
        <Text style={styles.workflowName}>{item.name}</Text>
        <View style={styles.workflowStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: item.status === 'active' ? '#4CAF50' : '#FF9800' }
          ]} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.workflowType}>Type: {item.type.toUpperCase()}</Text>
      
      <View style={styles.workflowStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.executionCount}</Text>
          <Text style={styles.statLabel}>Executions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.successCount}</Text>
          <Text style={styles.statLabel}>Success</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.failureCount}</Text>
          <Text style={styles.statLabel}>Failures</Text>
        </View>
      </View>
      
      <View style={styles.workflowActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleExecuteWorkflow(item.id)}
        >
          <Text style={styles.actionButtonText}>Execute</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => {/* Edit workflow */}}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyWorkflow}>Workflow {item.workflowId}</Text>
        <View style={styles.historyStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: item.success ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={styles.statusText}>{item.success ? 'Success' : 'Failed'}</Text>
        </View>
      </View>
      
      <Text style={styles.historyTimestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.historyDuration}>
        Duration: {item.duration}ms
      </Text>
    </View>
  );

  const renderIntegrationModal = () => (
    <Modal
      visible={showIntegrationModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Integration</Text>
          
          <Text style={styles.modalLabel}>Name:</Text>
          <TextInput
            style={styles.modalInput}
            value={newIntegration.name}
            onChangeText={(text) => setNewIntegration(prev => ({ ...prev, name: text }))}
            placeholder="Integration name"
          />
          
          <Text style={styles.modalLabel}>Type:</Text>
          <View style={styles.typeSelector}>
            {['api', 'webhook', 'database', 'email', 'sms'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  newIntegration.type === type && styles.typeButtonSelected
                ]}
                onPress={() => setNewIntegration(prev => ({ ...prev, type }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  newIntegration.type === type && styles.typeButtonTextSelected
                ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {newIntegration.type === 'api' && (
            <>
              <Text style={styles.modalLabel}>URL:</Text>
              <TextInput
                style={styles.modalInput}
                value={newIntegration.config.url}
                onChangeText={(text) => setNewIntegration(prev => ({
                  ...prev,
                  config: { ...prev.config, url: text }
                }))}
                placeholder="https://api.example.com"
              />
              
              <Text style={styles.modalLabel}>Method:</Text>
              <View style={styles.typeSelector}>
                {['GET', 'POST', 'PUT', 'DELETE'].map(method => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.typeButton,
                      newIntegration.config.method === method && styles.typeButtonSelected
                    ]}
                    onPress={() => setNewIntegration(prev => ({
                      ...prev,
                      config: { ...prev.config, method }
                    }))}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newIntegration.config.method === method && styles.typeButtonTextSelected
                    ]}>
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowIntegrationModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleCreateIntegration}
            >
              <Text style={styles.modalButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderWorkflowModal = () => (
    <Modal
      visible={showWorkflowModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Workflow</Text>
          
          <Text style={styles.modalLabel}>Name:</Text>
          <TextInput
            style={styles.modalInput}
            value={newWorkflow.name}
            onChangeText={(text) => setNewWorkflow(prev => ({ ...prev, name: text }))}
            placeholder="Workflow name"
          />
          
          <Text style={styles.modalLabel}>Type:</Text>
          <View style={styles.typeSelector}>
            {['sequential', 'parallel', 'conditional', 'scheduled'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  newWorkflow.type === type && styles.typeButtonSelected
                ]}
                onPress={() => setNewWorkflow(prev => ({ ...prev, type }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  newWorkflow.type === type && styles.typeButtonTextSelected
                ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowWorkflowModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleCreateWorkflow}
            >
              <Text style={styles.modalButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Automation Dashboard</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowIntegrationModal(true)}
          >
            <Text style={styles.actionButtonText}>Create Integration</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowWorkflowModal(true)}
          >
            <Text style={styles.actionButtonText}>Create Workflow</Text>
          </TouchableOpacity>
        </View>

        {/* Integrations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrations ({integrations.length})</Text>
          <FlatList
            data={integrations}
            renderItem={renderIntegration}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        </View>

        {/* Workflows Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workflows ({workflows.length})</Text>
          <FlatList
            data={workflows}
            renderItem={renderWorkflow}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Executions ({automationHistory.length})</Text>
          <FlatList
            data={automationHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            style={styles.historyList}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      {renderIntegrationModal()}
      {renderWorkflowModal()}
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
  content: {
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.45,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonSecondary: {
    backgroundColor: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  horizontalList: {
    marginBottom: 10,
  },
  integrationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  integrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#888',
  },
  integrationType: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  integrationHealth: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  integrationLastUsed: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  integrationActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  workflowCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  workflowStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workflowType: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  workflowStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
  },
  workflowActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyWorkflow: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  historyDuration: {
    fontSize: 12,
    color: '#888',
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  typeButtonTextSelected: {
    color: '#ffffff',
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

export default AutomationDashboard;
