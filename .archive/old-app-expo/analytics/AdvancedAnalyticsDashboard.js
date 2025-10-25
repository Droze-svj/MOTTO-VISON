import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import EnhancedMonitoringService from '../../services/EnhancedMonitoringService';
import PredictiveAnalyticsService from '../../services/PredictiveAnalyticsService';

const { width } = Dimensions.get('window');

const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [monitoringData, setMonitoringData] = useState({});
  const [predictiveData, setPredictiveData] = useState({});
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [monitoring, predictive] = await Promise.all([
        EnhancedMonitoringService.getHealthStatus(),
        PredictiveAnalyticsService.getHealthStatus()
      ]);

      setMonitoringData(monitoring);
      setPredictiveData(predictive);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {monitoringData.enhancedMetrics?.totalEvents?.toLocaleString() || '0'}
            </Text>
            <Text style={styles.metricLabel}>Total Events</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {monitoringData.enhancedMetrics?.processedEvents?.toLocaleString() || '0'}
            </Text>
            <Text style={styles.metricLabel}>Processed Events</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {predictiveData.predictiveMetrics?.predictionAccuracy?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.metricLabel}>Prediction Accuracy</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {monitoringData.enhancedMetrics?.averageProcessingTime?.toFixed(0) || '0'}ms
            </Text>
            <Text style={styles.metricLabel}>Avg Processing Time</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Intelligence</Text>
        <View style={styles.chartContainer}>
          <ProgressChart
            data={{
              labels: ['Revenue', 'Users', 'Engagement', 'Conversion'],
              data: [0.85, 0.72, 0.68, 0.91]
            }}
            width={width - 40}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#2d2d2d',
              color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
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
        <Text style={styles.sectionTitle}>Predictive Insights</Text>
        <View style={styles.insightsGrid}>
          {predictiveData.predictiveInsights?.forecasts?.slice(0, 3).map((forecast, index) => (
            <TouchableOpacity key={index} style={styles.insightCard} onPress={() => {
              setSelectedMetric(forecast);
              setShowModal(true);
            }}>
              <Text style={styles.insightType}>{forecast.type}</Text>
              <Text style={styles.insightValue}>
                {forecast.predictions ? Object.values(forecast.predictions)[0]?.toFixed(2) : 'N/A'}
              </Text>
              <Text style={styles.insightConfidence}>
                Confidence: {(forecast.confidence * 100).toFixed(0)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderPredictiveTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Forecasting Models</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
              datasets: [{
                data: [0.8, 0.82, 0.85, 0.88, 0.9, 0.92],
                color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
                strokeWidth: 2
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#2d2d2d',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#0096ff'
              }
            }}
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anomaly Detection</Text>
        <View style={styles.anomalyGrid}>
          {predictiveData.predictiveInsights?.anomalies?.slice(0, 4).map((anomaly, index) => (
            <View key={index} style={[
              styles.anomalyCard,
              { borderLeftColor: anomaly.severity === 'high' ? '#ff4444' : 
                              anomaly.severity === 'medium' ? '#ffaa00' : '#00ff44' }
            ]}>
              <Text style={styles.anomalyType}>{anomaly.type}</Text>
              <Text style={styles.anomalyMessage}>{anomaly.message}</Text>
              <Text style={styles.anomalyConfidence}>
                Confidence: {(anomaly.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trend Analysis</Text>
        <View style={styles.trendsGrid}>
          {predictiveData.predictiveInsights?.trends?.slice(0, 3).map((trend, index) => (
            <View key={index} style={styles.trendCard}>
              <Text style={styles.trendMetric}>{trend.metric}</Text>
              <Text style={[
                styles.trendDirection,
                { color: trend.trend === 'increasing' ? '#00ff44' : '#ff4444' }
              ]}>
                {trend.trend} ({trend.change > 0 ? '+' : ''}{(trend.change * 100).toFixed(1)}%)
              </Text>
              <Text style={styles.trendMessage}>{trend.message}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderBusinessTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Analytics</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                data: [25000, 28000, 32000, 35000, 38000, 42000]
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#2d2d2d',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#0096ff'
              }
            }}
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Analytics</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={[
              { name: 'Active Users', population: 65, color: '#0096ff', legendFontColor: '#ffffff' },
              { name: 'New Users', population: 20, color: '#00ff96', legendFontColor: '#ffffff' },
              { name: 'Returning Users', population: 15, color: '#ff9600', legendFontColor: '#ffffff' }
            ]}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#2d2d2d',
              color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business KPIs</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>$42,000</Text>
            <Text style={styles.kpiLabel}>Monthly Revenue</Text>
            <Text style={styles.kpiChange}>+12.5%</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>15,420</Text>
            <Text style={styles.kpiLabel}>Active Users</Text>
            <Text style={styles.kpiChange}>+8.3%</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>8.5%</Text>
            <Text style={styles.kpiLabel}>Conversion Rate</Text>
            <Text style={styles.kpiChange}>+2.1%</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>92%</Text>
            <Text style={styles.kpiLabel}>User Satisfaction</Text>
            <Text style={styles.kpiChange}>+1.2%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderMLTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Machine Learning Models</Text>
        {Object.entries(predictiveData.mlModels || {}).map(([category, models]) => (
          <View key={category} style={styles.modelCategory}>
            <Text style={styles.modelCategoryTitle}>{category.replace(/([A-Z])/g, ' $1').toUpperCase()}</Text>
            {Object.entries(models).map(([modelName, model]) => (
              <View key={modelName} style={styles.modelCard}>
                <Text style={styles.modelName}>{modelName}</Text>
                <Text style={styles.modelType}>{model.type}</Text>
                <View style={styles.modelMetrics}>
                  <Text style={styles.modelAccuracy}>
                    Accuracy: {(model.accuracy * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.modelLastTrained}>
                    Last Trained: {new Date(model.lastTrained).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model Performance</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
              datasets: [{
                data: [0.92, 0.89, 0.91, 0.90]
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#2d2d2d',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'predictive':
        return renderPredictiveTab();
      case 'business':
        return renderBusinessTab();
      case 'ml':
        return renderMLTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Real-time insights and predictive analytics</Text>
      </View>

      <View style={styles.tabBar}>
        {['overview', 'predictive', 'business', 'ml'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderTab()}

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Metric Details</Text>
            {selectedMetric && (
              <View>
                <Text style={styles.modalText}>Type: {selectedMetric.type}</Text>
                <Text style={styles.modalText}>Model: {selectedMetric.model}</Text>
                <Text style={styles.modalText}>Accuracy: {(selectedMetric.accuracy * 100).toFixed(1)}%</Text>
                <Text style={styles.modalText}>Confidence: {(selectedMetric.confidence * 100).toFixed(1)}%</Text>
                {selectedMetric.predictions && (
                  <View>
                    <Text style={styles.modalText}>Predictions:</Text>
                    {Object.entries(selectedMetric.predictions).map(([key, value]) => (
                      <Text key={key} style={styles.modalText}>
                        {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0096ff',
  },
  tabText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0096ff',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0096ff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888888',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chart: {
    borderRadius: 16,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  insightType: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0096ff',
    marginBottom: 4,
  },
  insightConfidence: {
    fontSize: 12,
    color: '#888888',
  },
  anomalyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  anomalyCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderLeftWidth: 4,
  },
  anomalyType: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  anomalyMessage: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  anomalyConfidence: {
    fontSize: 12,
    color: '#0096ff',
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  trendMetric: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  trendDirection: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendMessage: {
    fontSize: 12,
    color: '#888888',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0096ff',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  kpiChange: {
    fontSize: 12,
    color: '#00ff44',
  },
  modelCategory: {
    marginBottom: 20,
  },
  modelCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  modelCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modelType: {
    fontSize: 14,
    color: '#0096ff',
    marginBottom: 8,
  },
  modelMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modelAccuracy: {
    fontSize: 12,
    color: '#888888',
  },
  modelLastTrained: {
    fontSize: 12,
    color: '#888888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    width: width - 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  modalCloseButton: {
    backgroundColor: '#0096ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default AdvancedAnalyticsDashboard;