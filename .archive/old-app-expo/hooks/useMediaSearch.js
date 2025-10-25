import { useState, useCallback, useEffect } from 'react';
import useApi from './useApi';
import useOfflineStorage from './useOfflineStorage';

const useMediaSearch = (options = {}) => {
  const {
    initialQuery = '',
    filters = {},
    pageSize = 20,
    enableCache = true,
  } = options;

  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache,
  });

  const {
    isOnline,
    createOffline,
    getAllOfflineData,
  } = useOfflineStorage({
    entityName: 'search_results',
    syncEndpoint: '/search',
  });

  const searchMedia = useCallback(async (query, page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isOnline) {
        const offlineResults = getAllOfflineData();
        setSearchResults(offlineResults);
        return;
      }

      const response = await request({
        endpoint: '/search',
        method: 'GET',
        params: {
          q: query,
          page,
          limit: pageSize,
          ...filters,
        },
      });

      const results = response.data.results;
      setSearchResults(page === 1 ? results : [...searchResults, ...results]);
      setHasMore(results.length === pageSize);
      setCurrentPage(page);

      if (enableCache) {
        await createOffline({
          query,
          results,
          timestamp: new Date().toISOString(),
        });
      }

      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, pageSize, filters, enableCache, request, createOffline, getAllOfflineData]);

  const getRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await request({
        endpoint: '/recommendations',
        method: 'GET',
        params: {
          limit: 10,
        },
      });

      setRecommendations(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const getTrending = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await request({
        endpoint: '/trending',
        method: 'GET',
        params: {
          limit: 10,
          period: 'week',
        },
      });

      setTrending(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      searchMedia(initialQuery, currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage, initialQuery, searchMedia]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  const filterResults = useCallback((newFilters) => {
    setSearchResults([]);
    setCurrentPage(1);
    setHasMore(true);
    searchMedia(initialQuery, 1, { ...filters, ...newFilters });
  }, [initialQuery, filters, searchMedia]);

  useEffect(() => {
    if (initialQuery) {
      searchMedia(initialQuery);
    }
  }, [initialQuery, searchMedia]);

  useEffect(() => {
    getRecommendations();
    getTrending();
  }, [getRecommendations, getTrending]);

  return {
    searchResults,
    recommendations,
    trending,
    isLoading,
    error,
    hasMore,
    currentPage,
    searchMedia,
    loadMore,
    clearSearch,
    filterResults,
    getRecommendations,
    getTrending,
  };
};

export default useMediaSearch; 