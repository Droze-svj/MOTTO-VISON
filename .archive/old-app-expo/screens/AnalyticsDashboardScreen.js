import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useMediaAnalytics from '../hooks/useMediaAnalytics';
import { LineChart, PieChart } from 'react-native-chart-kit';
import SkeletonLoader from '../components/common/SkeletonLoader';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 220;

const AnalyticsDashboardScreen = ({ route }) => {
  const { mediaId } = route.params;
  const { colors } = useTheme();
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'

  const {
    analytics,
    insights,
    isLoading,
    error,
    getPerformanceMetrics,
    getAudienceInsights,
    getContentInsights,
    refreshAnalytics,
  } = useMediaAnalytics({
    mediaId,
    enableRealTime: true,
  });

  const performanceMetrics = getPerformanceMetrics();
  const audienceInsights = getAudienceInsights();
  const contentInsights = getContentInsights();

  const handleRefresh = useCallback(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  const renderMetricCard = (title, value, icon, color) => (
    <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.metricTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={[styles.timeRangeContainer, { backgroundColor: colors.card }]}>
      {['day', 'week', 'month', 'year'].map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            timeRange === range && { backgroundColor: colors.primary },
          ]}
          onPress={() => setTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeText,
              { color: timeRange === range ? '#fff' : colors.text },
            ]}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEngagementChart = () => {
    if (!analytics?.engagement?.history) return null;

    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: analytics.engagement.history.map((item) => item.value),
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Engagement Over Time
        </Text>
        <LineChart
          data={data}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.text,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderAudienceChart = () => {
    if (!audienceInsights?.ageDistribution) return null;

    const data = Object.entries(audienceInsights.ageDistribution).map(
      ([label, value], index) => ({
        name: label,
        population: value,
        color: `hsl(${index * 45}, 70%, 50%)`,
        legendFontColor: colors.text,
        legendFontSize: 12,
      })
    );

    return (
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Age Distribution
        </Text>
        <PieChart
          data={data}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          chartConfig={{
            color: (opacity = 1) => colors.text,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load analytics. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRefresh}
        accessibilityRole="button"
        accessibilityLabel="Retry loading analytics"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SkeletonLoader rows={3} height={60} style={{ marginBottom: 24 }} />
        <SkeletonLoader rows={2} height={220} style={{ marginBottom: 24 }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderError()}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {renderTimeRangeSelector()}

      <View style={styles.metricsContainer}>
        {performanceMetrics && (
          <>
            {renderMetricCard(
              'Engagement Rate',
              `${performanceMetrics.engagementRate}%`,
              'trending-up',
              colors.primary
            )}
            {renderMetricCard(
              'Retention Rate',
              `${performanceMetrics.retentionRate}%`,
              'time',
              colors.success
            )}
            {renderMetricCard(
              'Conversion Rate',
              `${performanceMetrics.conversionRate}%`,
              'download',
              colors.warning
            )}
            {renderMetricCard(
              'Total Engagements',
              performanceMetrics.totalEngagements,
              'heart',
              colors.error
            )}
          </>
        )}
      </View>

      {renderEngagementChart()}
      {renderAudienceChart()}

      {contentInsights && (
        <View style={[styles.insightsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Content Insights
          </Text>
          <View style={styles.insightItem}>
            <Text style={[styles.insightLabel, { color: colors.text }]}>
              Best Posting Hours:
            </Text>
            <Text style={[styles.insightValue, { color: colors.text }]}>
              {contentInsights.bestPostingHours.join(', ')}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={[styles.insightLabel, { color: colors.text }]}>
              Best Posting Days:
            </Text>
            <Text style={[styles.insightValue, { color: colors.text }]}>
              {contentInsights.bestPostingDays.join(', ')}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 5,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  insightItem: {
    marginBottom: 10,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  insightValue: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default AnalyticsDashboardScreen; 