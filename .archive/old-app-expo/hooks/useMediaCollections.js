import { useState, useCallback, useEffect } from 'react';
import useApi from './useApi';
import useOfflineStorage from './useOfflineStorage';
import useMediaAnalytics from './useMediaAnalytics';

const useMediaCollections = (options = {}) => {
  const {
    initialCollections = [],
    enableAnalytics = true,
    enableOffline = true,
  } = options;

  const [collections, setCollections] = useState(initialCollections);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: true,
  });

  const {
    isOnline,
    createOffline,
    updateOffline,
    getAllOfflineData,
  } = useOfflineStorage({
    entityName: 'collections',
    syncEndpoint: '/collections',
  });

  const { trackEngagement } = useMediaAnalytics({
    enableRealTime: true,
  });

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isOnline && enableOffline) {
        const offlineData = getAllOfflineData();
        setCollections(offlineData);
        return offlineData;
      }

      const response = await request({
        endpoint: '/collections',
        method: 'GET',
      });

      setCollections(response.data);

      if (enableOffline) {
        await createOffline({
          data: response.data,
          timestamp: new Date().toISOString(),
        });
      }

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, enableOffline, request, createOffline, getAllOfflineData]);

  const createCollection = useCallback(
    async (collectionData) => {
      try {
        if (!isOnline && enableOffline) {
          const offlineCollection = {
            ...collectionData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            items: [],
          };
          await createOffline({
            type: 'create',
            data: offlineCollection,
            timestamp: new Date().toISOString(),
          });
          setCollections((prev) => [...prev, offlineCollection]);
          return offlineCollection;
        }

        const response = await request({
          endpoint: '/collections',
          method: 'POST',
          data: collectionData,
        });

        setCollections((prev) => [...prev, response.data]);

        if (enableAnalytics) {
          await trackEngagement({
            type: 'collection_created',
            collectionId: response.data.id,
          });
        }

        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [isOnline, enableOffline, enableAnalytics, request, createOffline, trackEngagement]
  );

  const updateCollection = useCallback(
    async (collectionId, updates) => {
      try {
        if (!isOnline && enableOffline) {
          await createOffline({
            type: 'update',
            collectionId,
            data: updates,
            timestamp: new Date().toISOString(),
          });
          setCollections((prev) =>
            prev.map((c) =>
              c.id === collectionId ? { ...c, ...updates } : c
            )
          );
          return;
        }

        const response = await request({
          endpoint: `/collections/${collectionId}`,
          method: 'PUT',
          data: updates,
        });

        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? response.data : c
          )
        );

        if (enableAnalytics) {
          await trackEngagement({
            type: 'collection_updated',
            collectionId,
          });
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [isOnline, enableOffline, enableAnalytics, request, createOffline, trackEngagement]
  );

  const deleteCollection = useCallback(
    async (collectionId) => {
      try {
        if (!isOnline && enableOffline) {
          await createOffline({
            type: 'delete',
            collectionId,
            timestamp: new Date().toISOString(),
          });
          setCollections((prev) =>
            prev.filter((c) => c.id !== collectionId)
          );
          return;
        }

        await request({
          endpoint: `/collections/${collectionId}`,
          method: 'DELETE',
        });

        setCollections((prev) =>
          prev.filter((c) => c.id !== collectionId)
        );

        if (enableAnalytics) {
          await trackEngagement({
            type: 'collection_deleted',
            collectionId,
          });
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [isOnline, enableOffline, enableAnalytics, request, createOffline, trackEngagement]
  );

  const addToCollection = useCallback(
    async (collectionId, mediaId) => {
      try {
        if (!isOnline && enableOffline) {
          await createOffline({
            type: 'add_media',
            collectionId,
            mediaId,
            timestamp: new Date().toISOString(),
          });
          setCollections((prev) =>
            prev.map((c) =>
              c.id === collectionId
                ? {
                    ...c,
                    items: [...c.items, { id: mediaId }],
                  }
                : c
            )
          );
          return;
        }

        const response = await request({
          endpoint: `/collections/${collectionId}/items`,
          method: 'POST',
          data: { mediaId },
        });

        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? response.data : c
          )
        );

        if (enableAnalytics) {
          await trackEngagement({
            type: 'media_added_to_collection',
            collectionId,
            mediaId,
          });
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [isOnline, enableOffline, enableAnalytics, request, createOffline, trackEngagement]
  );

  const removeFromCollection = useCallback(
    async (collectionId, mediaId) => {
      try {
        if (!isOnline && enableOffline) {
          await createOffline({
            type: 'remove_media',
            collectionId,
            mediaId,
            timestamp: new Date().toISOString(),
          });
          setCollections((prev) =>
            prev.map((c) =>
              c.id === collectionId
                ? {
                    ...c,
                    items: c.items.filter((i) => i.id !== mediaId),
                  }
                : c
            )
          );
          return;
        }

        const response = await request({
          endpoint: `/collections/${collectionId}/items/${mediaId}`,
          method: 'DELETE',
        });

        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? response.data : c
          )
        );

        if (enableAnalytics) {
          await trackEngagement({
            type: 'media_removed_from_collection',
            collectionId,
            mediaId,
          });
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [isOnline, enableOffline, enableAnalytics, request, createOffline, trackEngagement]
  );

  const reorderCollection = useCallback(
    async (collectionId, newOrder) => {
      try {
        if (!isOnline && enableOffline) {
          await createOffline({
            type: 'reorder',
            collectionId,
            data: newOrder,
            timestamp: new Date().toISOString(),
          });
          setCollections((prev) =>
            prev.map((c) =>
              c.id === collectionId
                ? {
                    ...c,
                    items: newOrder,
                  }
                : c
            )
          );
          return;
        }

        const response = await request({
          endpoint: `/collections/${collectionId}/reorder`,
          method: 'PUT',
          data: { items: newOrder },
        });

        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? response.data : c
          )
        );

        if (enableAnalytics) {
          await trackEngagement({
            type: 'collection_reordered',
            collectionId,
          });
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [isOnline, enableOffline, enableAnalytics, request, createOffline, trackEngagement]
  );

  const shareCollection = useCallback(
    async (collectionId) => {
      try {
        const response = await request({
          endpoint: `/collections/${collectionId}/share`,
          method: 'POST',
        });

        if (enableAnalytics) {
          await trackEngagement({
            type: 'collection_shared',
            collectionId,
          });
        }

        return response.data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [enableAnalytics, request, trackEngagement]
  );

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    selectedCollection,
    setSelectedCollection,
    isLoading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    reorderCollection,
    shareCollection,
    refreshCollections: fetchCollections,
  };
};

export default useMediaCollections; 