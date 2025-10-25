import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useApi } from './useApi';

const SYNC_QUEUE_KEY = 'sync_queue';
const OFFLINE_DATA_PREFIX = 'offline_data_';

const useOfflineStorage = ({
  entityName,
  syncEndpoint,
  transformData = (data) => data,
  onSyncComplete,
  onSyncError,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState([]);
  const [offlineData, setOfflineData] = useState({});

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: false,
  });

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        syncData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load sync queue and offline data on mount
  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    try {
      const [queueData, storedData] = await Promise.all([
        AsyncStorage.getItem(SYNC_QUEUE_KEY),
        AsyncStorage.getItem(`${OFFLINE_DATA_PREFIX}${entityName}`),
      ]);

      if (queueData) {
        setSyncQueue(JSON.parse(queueData));
      }

      if (storedData) {
        setOfflineData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = async (data) => {
    try {
      const key = `${OFFLINE_DATA_PREFIX}${entityName}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
      setOfflineData(data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const addToSyncQueue = async (action, data) => {
    try {
      const queueItem = {
        id: Date.now().toString(),
        action,
        data,
        timestamp: new Date().toISOString(),
      };

      const newQueue = [...syncQueue, queueItem];
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
      setSyncQueue(newQueue);

      // If online, trigger sync
      if (isOnline) {
        syncData();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  };

  const syncData = async () => {
    if (isSyncing || syncQueue.length === 0) return;

    setIsSyncing(true);
    const queueCopy = [...syncQueue];

    try {
      for (const item of queueCopy) {
        const { action, data } = item;

        switch (action) {
          case 'CREATE':
            await request({
              endpoint: syncEndpoint,
              method: 'POST',
              body: transformData(data),
            });
            break;

          case 'UPDATE':
            await request({
              endpoint: `${syncEndpoint}/${data.id}`,
              method: 'PUT',
              body: transformData(data),
            });
            break;

          case 'DELETE':
            await request({
              endpoint: `${syncEndpoint}/${data.id}`,
              method: 'DELETE',
            });
            break;

          default:
            console.warn('Unknown sync action:', action);
        }

        // Remove processed item from queue
        const updatedQueue = queueCopy.filter(qi => qi.id !== item.id);
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
        setSyncQueue(updatedQueue);
      }

      onSyncComplete?.();
    } catch (error) {
      console.error('Sync error:', error);
      onSyncError?.(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const createOffline = async (data) => {
    const newData = {
      ...offlineData,
      [data.id]: { ...data, isOffline: true },
    };
    await saveOfflineData(newData);
    await addToSyncQueue('CREATE', data);
  };

  const updateOffline = async (data) => {
    const newData = {
      ...offlineData,
      [data.id]: { ...data, isOffline: true },
    };
    await saveOfflineData(newData);
    await addToSyncQueue('UPDATE', data);
  };

  const deleteOffline = async (id) => {
    const newData = { ...offlineData };
    delete newData[id];
    await saveOfflineData(newData);
    await addToSyncQueue('DELETE', { id });
  };

  const getOfflineData = useCallback((id) => {
    return offlineData[id];
  }, [offlineData]);

  const getAllOfflineData = useCallback(() => {
    return Object.values(offlineData);
  }, [offlineData]);

  return {
    isOnline,
    isSyncing,
    syncQueue,
    offlineData,
    createOffline,
    updateOffline,
    deleteOffline,
    getOfflineData,
    getAllOfflineData,
    syncData,
  };
};

export default useOfflineStorage; 