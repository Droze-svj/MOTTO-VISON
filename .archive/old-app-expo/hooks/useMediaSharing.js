import { useState, useCallback } from 'react';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import useApi from './useApi';

const useMediaSharing = () => {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0,
  });

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: true,
  });

  const shareMedia = useCallback(async (mediaUri, options = {}) => {
    try {
      setSharing(true);
      setError(null);

      const {
        title = 'Check this out!',
        message = 'I wanted to share this with you',
        mimeType = 'image/jpeg',
        saveToGallery = false,
      } = options;

      // Save to gallery if requested
      if (saveToGallery) {
        const asset = await MediaLibrary.createAssetAsync(mediaUri);
        await MediaLibrary.createAlbumAsync('Shared Media', asset, false);
      }

      // Share the media
      const result = await Sharing.shareAsync(mediaUri, {
        mimeType,
        dialogTitle: title,
        UTI: mimeType,
      });

      // Track share analytics
      await request({
        endpoint: '/analytics/share',
        method: 'POST',
        body: {
          mediaUri,
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        },
      });

      setAnalytics(prev => ({
        ...prev,
        shares: prev.shares + 1,
      }));

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSharing(false);
    }
  }, [request]);

  const likeMedia = useCallback(async (mediaId) => {
    try {
      setError(null);

      await request({
        endpoint: `/media/${mediaId}/like`,
        method: 'POST',
      });

      setAnalytics(prev => ({
        ...prev,
        likes: prev.likes + 1,
      }));

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [request]);

  const commentOnMedia = useCallback(async (mediaId, comment) => {
    try {
      setError(null);

      const response = await request({
        endpoint: `/media/${mediaId}/comments`,
        method: 'POST',
        body: { comment },
      });

      setAnalytics(prev => ({
        ...prev,
        comments: prev.comments + 1,
      }));

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [request]);

  const trackView = useCallback(async (mediaId) => {
    try {
      setError(null);

      await request({
        endpoint: `/media/${mediaId}/view`,
        method: 'POST',
      });

      setAnalytics(prev => ({
        ...prev,
        views: prev.views + 1,
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [request]);

  const getMediaAnalytics = useCallback(async (mediaId) => {
    try {
      setError(null);

      const response = await request({
        endpoint: `/media/${mediaId}/analytics`,
        method: 'GET',
      });

      setAnalytics(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [request]);

  const generateShareableLink = useCallback(async (mediaId) => {
    try {
      setError(null);

      const response = await request({
        endpoint: `/media/${mediaId}/share-link`,
        method: 'POST',
      });

      return response.data.link;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [request]);

  const downloadMedia = useCallback(async (mediaUri, options = {}) => {
    try {
      setSharing(true);
      setError(null);

      const {
        filename = 'downloaded-media',
        mimeType = 'image/jpeg',
        saveToGallery = true,
      } = options;

      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.downloadAsync(mediaUri, fileUri);

      if (saveToGallery) {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('Downloads', asset, false);
      }

      return fileUri;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSharing(false);
    }
  }, []);

  const reportMedia = useCallback(async (mediaId, reason) => {
    try {
      setError(null);

      await request({
        endpoint: `/media/${mediaId}/report`,
        method: 'POST',
        body: { reason },
      });

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [request]);

  return {
    sharing,
    error,
    analytics,
    shareMedia,
    likeMedia,
    commentOnMedia,
    trackView,
    getMediaAnalytics,
    generateShareableLink,
    downloadMedia,
    reportMedia,
  };
};

export default useMediaSharing; 