/**
 * Analytics Dashboard
 * Phase 5: Real-time monitoring and analytics
 */

import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, RefreshControl} from 'react-native';
import MonitoringService from '../services/core/MonitoringService';

const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const report = MonitoringService.generateReport();
      const healthStatus = MonitoringService.getHealth();
      
      setMetrics(report);
      setHealth(healthStatus);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'degraded': return '#FFC107';
      case 'unhealthy': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Health Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>System Health</Text>
        {health && (
          <>
            <View style={[styles.statusBadge, {backgroundColor: getStatusColor(health.status)}]}>
              <Text style={styles.statusText}>{health.status.toUpperCase()}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Error Count:</Text>
              <Text style={styles.metricValue}>{health.errorCount}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Error Rate:</Text>
              <Text style={styles.metricValue}>{health.metrics.errorRate.toFixed(2)}/min</Text>
            </View>
          </>
        )}
      </View>

      {/* Performance Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance</Text>
        {metrics && (
          <>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Avg API Latency:</Text>
              <Text style={styles.metricValue}>
                {metrics.summary.avgApiLatency.toFixed(0)}ms
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Avg Render Time:</Text>
              <Text style={styles.metricValue}>
                {metrics.summary.avgRenderTime.toFixed(0)}ms
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Metrics:</Text>
              <Text style={styles.metricValue}>{metrics.summary.totalMetrics}</Text>
            </View>
          </>
        )}
      </View>

      {/* Top Metrics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Metrics</Text>
        {metrics?.topMetrics.slice(0, 5).map((metric: any, index: number) => (
          <View key={index} style={styles.metricRow}>
            <Text style={styles.metricLabel}>{metric.name}:</Text>
            <Text style={styles.metricValue}>{metric.avg.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metricLabel: {
    fontSize: 16,
    color: '#666',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default AnalyticsDashboard;
