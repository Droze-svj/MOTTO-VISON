import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import UserFeedbackCollectionService from '../services/UserFeedbackCollectionService';
import ABTestingService from '../services/ABTestingService';
import ParameterFineTuningService from '../services/ParameterFineTuningService';

const { width: screenWidth } = Dimensions.get('window');

const FeedbackAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [testingData, setTestingData] = useState(null);
  const [tuningData, setTuningData] = useState(null);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showTuningModal, setShowTuningModal] = useState(false);
  const [newTestConfig, setNewTestConfig] = useState({
    name: '',
    type: 'response_strategy',
    variants: ['variant_a', 'variant_b'],
    duration: 7,
    minSampleSize: 100
  });
  const [tuningConfig, setTuningConfig] = useState({
    category: 'ai_response',
    algorithm: 'genetic_algorithm',
    maxIterations: 100
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [feedback, testing, tuning] = await Promise.all([
        UserFeedbackCollectionService.getHealthStatus(),
        ABTestingService.getHealthStatus(),
        ParameterFineTuningService.getHealthStatus()
      ]);
      
      setFeedbackData(feedback);
      setTestingData(testing);
      setTuningData(tuning);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const createTest = async () => {
    try {
      const testConfig = {
        ...newTestConfig,
        duration: newTestConfig.duration * 24 * 60 * 60 * 1000, // Convert days to milliseconds
        metrics: ['user_satisfaction', 'response_quality', 'engagement']
      };
      
      await ABTestingService.createTest(testConfig);
      setShowCreateTestModal(false);
      setNewTestConfig({
        name: '',
        type: 'response_strategy',
        variants: ['variant_a', 'variant_b'],
        duration: 7,
        minSampleSize: 100
      });
      await loadDashboardData();
      Alert.alert('Success', 'Test created successfully!');
    } catch (error) {
      console.error('Error creating test:', error);
      Alert.alert('Error', 'Failed to create test');
    }
  };

  const startTuning = async () => {
    try {
      await ParameterFineTuningService.tuneParameters(
        tuningConfig.category,
        tuningConfig.algorithm,
        { maxIterations: tuningConfig.maxIterations }
      );
      setShowTuningModal(false);
      await loadDashboardData();
      Alert.alert('Success', 'Parameter tuning started!');
    } catch (error) {
      console.error('Error starting tuning:', error);
      Alert.alert('Error', 'Failed to start parameter tuning');
    }
  };

  const renderFeedbackTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback Overview</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{feedbackData?.feedbackMetrics?.totalFeedback || 0}</Text>
            <Text style={styles.metricLabel}>Total Feedback</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{(feedbackData?.feedbackMetrics?.averageRating || 0).toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Avg Rating</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{(feedbackData?.feedbackMetrics?.satisfactionScore || 0).toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Satisfaction</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{(feedbackData?.feedbackMetrics?.responseRate || 0).toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Response Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback Trends</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                data: [4.2, 4.5, 4.1, 4.8, 4.6, 4.3, 4.7],
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                strokeWidth: 2
              }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#1e1e1e',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#8641f4'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback Categories</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={[
              { name: 'Positive', population: 65, color: '#4CAF50', legendFontColor: '#FFFFFF' },
              { name: 'Neutral', population: 25, color: '#FF9800', legendFontColor: '#FFFFFF' },
              { name: 'Negative', population: 10, color: '#F44336', legendFontColor: '#FFFFFF' }
            ]}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#1e1e1e',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderTestingTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>A/B Testing</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateTestModal(true)}
          >
            <Text style={styles.createButtonText}>Create Test</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{testingData?.testingMetrics?.totalTests || 0}</Text>
            <Text style={styles.metricLabel}>Total Tests</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{testingData?.testingMetrics?.activeTests || 0}</Text>
            <Text style={styles.metricLabel}>Active Tests</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{testingData?.testingMetrics?.successfulTests || 0}</Text>
            <Text style={styles.metricLabel}>Successful</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{(testingData?.testingMetrics?.conversionRate || 0).toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Conversion</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Performance</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'],
              datasets: [{
                data: [85, 92, 78, 88, 95]
              }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#1e1e1e',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Types</Text>
        <View style={styles.testTypesList}>
          {Object.entries(testingData?.testTypes || {}).map(([type, config]) => (
            <View key={type} style={styles.testTypeItem}>
              <Text style={styles.testTypeName}>{config.name}</Text>
              <Text style={styles.testTypeStatus}>Status: {config.status}</Text>
              <Text style={styles.testTypeParticipants}>Participants: {config.participants || 0}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderTuningTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Parameter Tuning</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowTuningModal(true)}
          >
            <Text style={styles.createButtonText}>Start Tuning</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{tuningData?.tuningMetrics?.totalTuningRuns || 0}</Text>
            <Text style={styles.metricLabel}>Total Runs</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{tuningData?.tuningMetrics?.successfulOptimizations || 0}</Text>
            <Text style={styles.metricLabel}>Successful</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{(tuningData?.tuningMetrics?.averageImprovement || 0).toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Avg Improvement</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{(tuningData?.tuningMetrics?.bestPerformance || 0).toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Best Performance</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parameter Categories</Text>
        <View style={styles.parameterCategoriesList}>
          {Object.entries(tuningData?.parameterCategories || {}).map(([category, config]) => (
            <View key={category} style={styles.parameterCategoryItem}>
              <Text style={styles.parameterCategoryName}>{config.name}</Text>
              <Text style={styles.parameterCategoryStatus}>Status: {config.status}</Text>
              <Text style={styles.parameterCategoryPerformance}>
                Performance: {(config.currentPerformance || 0).toFixed(2)}
              </Text>
              <Text style={styles.parameterCategoryBest}>
                Best: {(config.bestPerformance || 0).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tuning Algorithms</Text>
        <View style={styles.algorithmsList}>
          {Object.entries(tuningData?.tuningAlgorithms || {}).map(([algorithm, config]) => (
            <View key={algorithm} style={styles.algorithmItem}>
              <Text style={styles.algorithmName}>{config.name}</Text>
              <Text style={styles.algorithmStatus}>Status: {config.status}</Text>
              <Text style={styles.algorithmSuccessRate}>
                Success Rate: {(config.successRate || 0).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderCreateTestModal = () => (
    <Modal
      visible={showCreateTestModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateTestModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create A/B Test</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Test Name"
            value={newTestConfig.name}
            onChangeText={(text) => setNewTestConfig({...newTestConfig, name: text})}
            placeholderTextColor="#666"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Duration (days)"
            value={newTestConfig.duration.toString()}
            onChangeText={(text) => setNewTestConfig({...newTestConfig, duration: parseInt(text) || 7})}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Min Sample Size"
            value={newTestConfig.minSampleSize.toString()}
            onChangeText={(text) => setNewTestConfig({...newTestConfig, minSampleSize: parseInt(text) || 100})}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCreateTestModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={createTest}
            >
              <Text style={styles.confirmButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTuningModal = () => (
    <Modal
      visible={showTuningModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTuningModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Start Parameter Tuning</Text>
          
          <Text style={styles.inputLabel}>Category:</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => {
                // In real implementation, show category picker
              }}
            >
              <Text style={styles.pickerText}>{tuningConfig.category}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Algorithm:</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => {
                // In real implementation, show algorithm picker
              }}
            >
              <Text style={styles.pickerText}>{tuningConfig.algorithm}</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Max Iterations"
            value={tuningConfig.maxIterations.toString()}
            onChangeText={(text) => setTuningConfig({...tuningConfig, maxIterations: parseInt(text) || 100})}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowTuningModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={startTuning}
            >
              <Text style={styles.confirmButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feedback & Analytics</Text>
        <Text style={styles.subtitle}>Monitor, Test & Optimize</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feedback' && styles.activeTab]}
          onPress={() => setActiveTab('feedback')}
        >
          <Text style={[styles.tabText, activeTab === 'feedback' && styles.activeTabText]}>
            Feedback
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'testing' && styles.activeTab]}
          onPress={() => setActiveTab('testing')}
        >
          <Text style={[styles.tabText, activeTab === 'testing' && styles.activeTabText]}>
            A/B Testing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tuning' && styles.activeTab]}
          onPress={() => setActiveTab('tuning')}
        >
          <Text style={[styles.tabText, activeTab === 'tuning' && styles.activeTabText]}>
            Tuning
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'feedback' && renderFeedbackTab()}
      {activeTab === 'testing' && renderTestingTab()}
      {activeTab === 'tuning' && renderTuningTab()}

      {renderCreateTestModal()}
      {renderTuningModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8641f4',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8641f4',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#8641f4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8641f4',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#888',
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  chart: {
    borderRadius: 16,
  },
  testTypesList: {
    gap: 12,
  },
  testTypeItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  testTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  testTypeStatus: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  testTypeParticipants: {
    fontSize: 14,
    color: '#888',
  },
  parameterCategoriesList: {
    gap: 12,
  },
  parameterCategoryItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  parameterCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  parameterCategoryStatus: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  parameterCategoryPerformance: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 2,
  },
  parameterCategoryBest: {
    fontSize: 14,
    color: '#8641f4',
  },
  algorithmsList: {
    gap: 12,
  },
  algorithmItem: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  algorithmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  algorithmStatus: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  algorithmSuccessRate: {
    fontSize: 14,
    color: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  pickerText: {
    fontSize: 16,
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  confirmButton: {
    backgroundColor: '#8641f4',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default FeedbackAnalyticsDashboard;
