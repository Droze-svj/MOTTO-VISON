/**
 * Performance Monitoring Dashboard
 * Displays real-time performance metrics, system health, and analytics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import PerformanceService from '../services/core/PerformanceService';
import MonitoringService from '../services/core/MonitoringService';

interface PerformanceMetrics {
  averageResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  services: Array<{
    name: string;
    status: 'online' | 'offline' | 'degraded';
    responseTime: number;
  }>;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('1h');

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Get performance metrics
      const perfMetrics = await PerformanceService.getMetrics();
      
      // Get system health
      const systemHealth = await MonitoringService.getServiceHealth();
      
      // Transform to dashboard format
      const dashboardMetrics: PerformanceMetrics = {
        averageResponseTime: perfMetrics.averageResponseTime || 0,
        requestsPerMinute: perfMetrics.requestsPerMinute || 0,
        errorRate: perfMetrics.errorRate || 0,
        cacheHitRate: perfMetrics.cacheHitRate || 0,
        memoryUsage: perfMetrics.memoryUsage || 0,
        cpuUsage: perfMetrics.cpuUsage || 0,
        activeUsers: perfMetrics.activeUsers || 0,
      };
      
      setMetrics(dashboardMetrics);
      setHealth(systemHealth as SystemHealth);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return '#10B981'; // green
      case 'degraded':
        return '#F59E0B'; // amber
      case 'critical':
      case 'offline':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const formatMetric = (value: number, unit: string = '') => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M${unit}`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K${unit}`;
    return `${value.toFixed(2)}${unit}`;
  };

  if (loading && !metrics) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Performance Dashboard</Text>
        <Text style={styles.subtitle}>Real-time system metrics</Text>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {(['1h', '24h', '7d'] as const).map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe && styles.timeframeButtonActive,
            ]}
            onPress={() => setSelectedTimeframe(timeframe)}
          >
            <Text
              style={[
                styles.timeframeText,
                selectedTimeframe === timeframe && styles.timeframeTextActive,
              ]}
            >
              {timeframe === '1h' ? '1 Hour' : timeframe === '24h' ? '24 Hours' : '7 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* System Health Status */}
      {health && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>System Health</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(health.status) },
              ]}
            >
              <Text style={styles.statusText}>{health.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.servicesList}>
            {health.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(service.status) },
                    ]}
                  />
                  <Text style={styles.serviceStatusText}>{service.status}</Text>
                  <Text style={styles.serviceResponseTime}>
                    {service.responseTime}ms
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <>
          {/* Response Time */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Response Time</Text>
            <Text style={styles.metricValue}>
              {formatMetric(metrics.averageResponseTime, 'ms')}
            </Text>
            <View style={styles.metricBar}>
              <View
                style={[
                  styles.metricBarFill,
                  {
                    width: `${Math.min((metrics.averageResponseTime / 1000) * 100, 100)}%`,
                    backgroundColor:
                      metrics.averageResponseTime < 500
                        ? '#10B981'
                        : metrics.averageResponseTime < 1000
                        ? '#F59E0B'
                        : '#EF4444',
                  },
                ]}
              />
            </View>
          </View>

          {/* Throughput */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Throughput</Text>
            <Text style={styles.metricValue}>
              {formatMetric(metrics.requestsPerMinute, '/min')}
            </Text>
            <Text style={styles.metricLabel}>Requests per minute</Text>
          </View>

          {/* Error Rate */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Error Rate</Text>
            <Text style={styles.metricValue}>
              {metrics.errorRate.toFixed(2)}%
            </Text>
            <View style={styles.metricBar}>
              <View
                style={[
                  styles.metricBarFill,
                  {
                    width: `${Math.min(metrics.errorRate * 10, 100)}%`,
                    backgroundColor:
                      metrics.errorRate < 1
                        ? '#10B981'
                        : metrics.errorRate < 5
                        ? '#F59E0B'
                        : '#EF4444',
                  },
                ]}
              />
            </View>
          </View>

          {/* Cache Performance */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cache Performance</Text>
            <Text style={styles.metricValue}>
              {metrics.cacheHitRate.toFixed(1)}%
            </Text>
            <Text style={styles.metricLabel}>Cache hit rate</Text>
          </View>

          {/* Resource Usage */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resource Usage</Text>
            <View style={styles.resourceContainer}>
              <View style={styles.resourceItem}>
                <Text style={styles.resourceLabel}>Memory</Text>
                <Text style={styles.resourceValue}>
                  {metrics.memoryUsage.toFixed(1)}%
                </Text>
                <View style={styles.metricBar}>
                  <View
                    style={[
                      styles.metricBarFill,
                      {
                        width: `${metrics.memoryUsage}%`,
                        backgroundColor:
                          metrics.memoryUsage < 70
                            ? '#10B981'
                            : metrics.memoryUsage < 90
                            ? '#F59E0B'
                            : '#EF4444',
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.resourceItem}>
                <Text style={styles.resourceLabel}>CPU</Text>
                <Text style={styles.resourceValue}>
                  {metrics.cpuUsage.toFixed(1)}%
                </Text>
                <View style={styles.metricBar}>
                  <View
                    style={[
                      styles.metricBarFill,
                      {
                        width: `${metrics.cpuUsage}%`,
                        backgroundColor:
                          metrics.cpuUsage < 70
                            ? '#10B981'
                            : metrics.cpuUsage < 90
                            ? '#F59E0B'
                            : '#EF4444',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Active Users */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Active Users</Text>
            <Text style={styles.metricValue}>
              {formatMetric(metrics.activeUsers)}
            </Text>
            <Text style={styles.metricLabel}>Currently active</Text>
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  timeframeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeframeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  serviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceStatusText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  serviceResponseTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  metricBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  resourceContainer: {
    gap: 16,
    marginTop: 16,
  },
  resourceItem: {
    marginTop: 8,
  },
  resourceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  resourceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default PerformanceDashboard;

