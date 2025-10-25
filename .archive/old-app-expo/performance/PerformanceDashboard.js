import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import AdvancedPerformanceOptimizationService from '../../services/AdvancedPerformanceOptimizationService';
import AdvancedResilienceService from '../../services/AdvancedResilienceService';
import AdvancedMonitoringService from '../../services/AdvancedMonitoringService';
import AdvancedAnalyticsEngine from '../../services/AdvancedAnalyticsEngine';

const { width } = Dimensions.get('window');

const PerformanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [performanceData, setPerformanceData] = useState({});
  const [resilienceData, setResilienceData] = useState({});
  const [monitoringData, setMonitoringData] = useState({});
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [performance, resilience, monitoring, analytics] = await Promise.all([
        AdvancedPerformanceOptimizationService.getHealthStatus(),
        AdvancedResilienceService.getHealthStatus(),
        AdvancedMonitoringService.getHealthStatus(),
        AdvancedAnalyticsEngine.getHealthStatus()
      ]);

      setPerformanceData(performance);
      setResilienceData(resilience);
      setMonitoringData(monitoring);
      setAnalyticsData(analytics);
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
        <Text style={styles.sectionTitle}>System Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {performanceData.performanceMetrics?.cacheHitRate?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.metricLabel}>Cache Hit Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {performanceData.performanceMetrics?.averageResponseTime?.toFixed(0) || '0'}ms
            </Text>
            <Text style={styles.metricLabel}>Avg Response Time</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {performanceData.performanceMetrics?.throughput?.toFixed(0) || '0'}
            </Text>
            <Text style={styles.metricLabel}>Throughput</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {performanceData.performanceMetrics?.errorRate?.toFixed(3) || '0.000'}
            </Text>
            <Text style={styles.metricLabel}>Error Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Resilience</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {resilienceData.resilienceMetrics?.systemAvailability?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.metricLabel}>System Availability</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {resilienceData.resilienceMetrics?.circuitBreakerTrips || '0'}
            </Text>
            <Text style={styles.metricLabel}>Circuit Breaker Trips</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {resilienceData.resilienceMetrics?.fallbackActivations || '0'}
            </Text>
            <Text style={styles.metricLabel}>Fallback Activations</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {resilienceData.resilienceMetrics?.averageRecoveryTime?.toFixed(0) || '0'}ms
            </Text>
            <Text style={styles.metricLabel}>Avg Recovery Time</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resource Utilization</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: ['Memory', 'CPU', 'Storage', 'Network'],
              datasets: [{
                data: [
                  performanceData.resourceManager?.memory?.current * 100 || 0,
                  performanceData.resourceManager?.cpu?.current * 100 || 0,
                  performanceData.resourceManager?.storage?.current * 100 || 0,
                  performanceData.resourceManager?.network?.current * 100 || 0
                ]
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#2d2d2d',
              decimalPlaces: 1,
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
    </ScrollView>
  );

  const renderMetricsTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Trends</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
              datasets: [{
                data: [250, 280, 300, 270, 290, 260],
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
        <Text style={styles.sectionTitle}>Cache Performance</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={[
              { name: 'Memory Cache', population: 45, color: '#0096ff', legendFontColor: '#ffffff' },
              { name: 'Disk Cache', population: 30, color: '#00ff96', legendFontColor: '#ffffff' },
              { name: 'Distributed Cache', population: 15, color: '#ff9600', legendFontColor: '#ffffff' },
              { name: 'CDN Cache', population: 10, color: '#ff0096', legendFontColor: '#ffffff' }
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
        <Text style={styles.sectionTitle}>Service Health</Text>
        <View style={styles.serviceHealthGrid}>
          {Object.entries(monitoringData.serviceHealth || {}).map(([service, health]) => (
            <View key={service} style={styles.serviceCard}>
              <Text style={styles.serviceName}>{service}</Text>
              <View style={[
                styles.healthIndicator,
                { backgroundColor: health.status === 'healthy' ? '#00ff96' : '#ff0096' }
              ]} />
              <Text style={styles.healthStatus}>{health.status}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderCacheTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cache Layers</Text>
        {Object.entries(performanceData.cacheLayers || {}).map(([layer, size]) => (
          <View key={layer} style={styles.cacheLayerCard}>
            <Text style={styles.cacheLayerName}>{layer}</Text>
            <Text style={styles.cacheLayerSize}>{size} entries</Text>
            <View style={styles.cacheLayerBar}>
              <View style={[styles.cacheLayerFill, { width: `${Math.min(size / 1000 * 100, 100)}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cache Configuration</Text>
        {Object.entries(performanceData.cacheConfigs || {}).map(([layer, config]) => (
          <View key={layer} style={styles.configCard}>
            <Text style={styles.configName}>{layer}</Text>
            <Text style={styles.configValue}>TTL: {config.ttl / 1000}s</Text>
            <Text style={styles.configValue}>Max Size: {config.maxSize}</Text>
            <Text style={styles.configValue}>Strategy: {config.strategy}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderOptimizationTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Strategy</Text>
        <View style={styles.strategyCard}>
          <Text style={styles.strategyName}>{performanceData.currentStrategy || 'balanced'}</Text>
          <Text style={styles.strategyDescription}>
            {performanceData.currentStrategy === 'aggressive' && 'Maximum performance with higher resource usage'}
            {performanceData.currentStrategy === 'balanced' && 'Balanced performance and resource usage'}
            {performanceData.currentStrategy === 'conservative' && 'Conservative performance with lower resource usage'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optimization Strategies</Text>
        {Object.entries(performanceData.optimizationStrategies || {}).map(([strategy, config]) => (
          <TouchableOpacity key={strategy} style={styles.strategyOption}>
            <Text style={styles.strategyOptionName}>{strategy}</Text>
            <Text style={styles.strategyOptionConfig}>
              Cache: {config.cacheSize}x, Compression: {config.compressionLevel}, Resources: {config.resourceLimit * 100}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Alerts</Text>
        {performanceData.performanceAlerts?.slice(-5).map((alert, index) => (
          <View key={index} style={styles.alertCard}>
            <Text style={styles.alertType}>{alert.type}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Text style={styles.alertTime}>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'metrics':
        return renderMetricsTab();
      case 'cache':
        return renderCacheTab();
      case 'optimization':
        return renderOptimizationTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Dashboard</Text>
        <Text style={styles.subtitle}>Real-time system performance monitoring</Text>
      </View>

      <View style={styles.tabBar}>
        {['overview', 'metrics', 'cache', 'optimization'].map((tab) => (
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
  serviceHealthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  healthStatus: {
    fontSize: 12,
    color: '#888888',
  },
  cacheLayerCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cacheLayerName: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  cacheLayerSize: {
    fontSize: 14,
    color: '#0096ff',
    marginBottom: 8,
  },
  cacheLayerBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  cacheLayerFill: {
    height: '100%',
    backgroundColor: '#0096ff',
  },
  configCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  configName: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  configValue: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  strategyCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  strategyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0096ff',
    marginBottom: 8,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#888888',
  },
  strategyOption: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  strategyOptionName: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  strategyOptionConfig: {
    fontSize: 14,
    color: '#888888',
  },
  alertCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  alertType: {
    fontSize: 16,
    color: '#ff9600',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#888888',
  },
});

export default PerformanceDashboard;