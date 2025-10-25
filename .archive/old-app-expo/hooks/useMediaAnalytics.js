import { useState, useCallback, useEffect } from 'react';
import useApi from './useApi';
import useOfflineStorage from './useOfflineStorage';

const useMediaAnalytics = (options = {}) => {
  const {
    mediaId,
    enableRealTime = true,
    updateInterval = 60000, // 1 minute
  } = options;

  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: false,
  });

  const {
    isOnline,
    createOffline,
    updateOffline,
    getAllOfflineData,
  } = useOfflineStorage({
    entityName: 'media_analytics',
    syncEndpoint: '/analytics',
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isOnline) {
        const offlineData = getAllOfflineData();
        const mediaAnalytics = offlineData.find(data => data.mediaId === mediaId);
        if (mediaAnalytics) {
          setAnalytics(mediaAnalytics.data);
        }
        return;
      }

      const response = await request({
        endpoint: `/analytics/${mediaId}`,
        method: 'GET',
      });

      setAnalytics(response.data);
      await createOffline({
        mediaId,
        data: response.data,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mediaId, isOnline, request, createOffline, getAllOfflineData]);

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await request({
        endpoint: `/analytics/${mediaId}/insights`,
        method: 'GET',
      });

      setInsights(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mediaId, request]);

  const trackEngagement = useCallback(async (type, data = {}) => {
    try {
      if (!isOnline) {
        await createOffline({
          mediaId,
          type: 'engagement',
          data: { type, ...data },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await request({
        endpoint: `/analytics/${mediaId}/engagement`,
        method: 'POST',
        data: { type, ...data },
      });

      // Update local analytics state
      setAnalytics(prev => ({
        ...prev,
        engagements: {
          ...prev.engagements,
          [type]: (prev.engagements[type] || 0) + 1,
        },
      }));
    } catch (err) {
      console.error('Error tracking engagement:', err);
    }
  }, [mediaId, isOnline, request, createOffline]);

  const getPerformanceMetrics = useCallback(() => {
    if (!analytics) return null;

    const {
      views = 0,
      likes = 0,
      shares = 0,
      comments = 0,
      downloads = 0,
    } = analytics;

    const engagementRate = views > 0
      ? ((likes + shares + comments) / views) * 100
      : 0;

    const retentionRate = views > 0
      ? (analytics.retention?.average || 0) * 100
      : 0;

    const conversionRate = views > 0
      ? (downloads / views) * 100
      : 0;

    return {
      engagementRate: engagementRate.toFixed(2),
      retentionRate: retentionRate.toFixed(2),
      conversionRate: conversionRate.toFixed(2),
      totalEngagements: likes + shares + comments,
      averageViewDuration: analytics.retention?.average || 0,
    };
  }, [analytics]);

  const getAudienceInsights = useCallback(() => {
    if (!analytics?.audience) return null;

    const {
      demographics,
      locations,
      devices,
      platforms,
    } = analytics.audience;

    return {
      topLocations: locations?.slice(0, 5) || [],
      topDevices: devices?.slice(0, 5) || [],
      topPlatforms: platforms?.slice(0, 5) || [],
      ageDistribution: demographics?.age || {},
      genderDistribution: demographics?.gender || {},
    };
  }, [analytics]);

  const getContentInsights = useCallback(() => {
    if (!analytics?.content) return null;

    const {
      peakHours,
      peakDays,
      tags,
      categories,
    } = analytics.content;

    return {
      bestPostingHours: peakHours?.slice(0, 5) || [],
      bestPostingDays: peakDays?.slice(0, 5) || [],
      popularTags: tags?.slice(0, 10) || [],
      categoryPerformance: categories || {},
    };
  }, [analytics]);

  useEffect(() => {
    if (mediaId) {
      fetchAnalytics();
      fetchInsights();
    }
  }, [mediaId, fetchAnalytics, fetchInsights]);

  useEffect(() => {
    let interval;
    if (enableRealTime && mediaId) {
      interval = setInterval(() => {
        fetchAnalytics();
      }, updateInterval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [enableRealTime, mediaId, updateInterval, fetchAnalytics]);

  return {
    analytics,
    insights,
    isLoading,
    error,
    trackEngagement,
    getPerformanceMetrics,
    getAudienceInsights,
    getContentInsights,
    refreshAnalytics: fetchAnalytics,
    refreshInsights: fetchInsights,
  };
};

export default useMediaAnalytics; 