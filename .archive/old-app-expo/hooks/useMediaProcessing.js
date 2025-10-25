import { useState, useCallback } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';

const useMediaProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const compressImage = useCallback(async (uri, options = {}) => {
    try {
      setProcessing(true);
      setError(null);

      const {
        quality = 0.7,
        maxWidth = 1920,
        maxHeight = 1080,
        format = 'jpeg',
      } = options;

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        { compress: quality, format: ImageManipulator.SaveFormat[format.toUpperCase()] }
      );

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const generateVideoThumbnail = useCallback(async (uri, options = {}) => {
    try {
      setProcessing(true);
      setError(null);

      const {
        quality = 0.7,
        time = 0,
        position = 'start',
      } = options;

      const result = await VideoThumbnails.getThumbnailAsync(uri, {
        quality,
        time: position === 'start' ? 0 : time,
      });

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const extractMediaMetadata = useCallback(async (uri) => {
    try {
      setProcessing(true);
      setError(null);

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      const metadata = await MediaLibrary.getAssetInfoAsync(asset);

      return {
        filename: uri.split('/').pop(),
        size: fileInfo.size,
        type: asset.mediaType,
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration,
        creationTime: metadata.creationTime,
        modificationTime: metadata.modificationTime,
        location: metadata.location,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const generateMediaHash = useCallback(async (uri) => {
    try {
      setProcessing(true);
      setError(null);

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Simple hash function (you might want to use a more robust one)
      let hash = 0;
      for (let i = 0; i < fileContent.length; i++) {
        const char = fileContent.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      return hash.toString(16);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const optimizeMediaForUpload = useCallback(async (uri, options = {}) => {
    try {
      setProcessing(true);
      setError(null);

      const metadata = await extractMediaMetadata(uri);
      let optimizedUri = uri;

      if (metadata.type === 'photo') {
        const compressed = await compressImage(uri, options);
        optimizedUri = compressed.uri;
      } else if (metadata.type === 'video') {
        // For videos, we might want to implement video compression here
        // This would require additional video processing libraries
      }

      const hash = await generateMediaHash(optimizedUri);
      const optimizedMetadata = await extractMediaMetadata(optimizedUri);

      return {
        uri: optimizedUri,
        metadata: optimizedMetadata,
        hash,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [compressImage, extractMediaMetadata, generateMediaHash]);

  const createMediaPreview = useCallback(async (uri, options = {}) => {
    try {
      setProcessing(true);
      setError(null);

      const metadata = await extractMediaMetadata(uri);
      let previewUri = uri;

      if (metadata.type === 'photo') {
        const compressed = await compressImage(uri, {
          ...options,
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.5,
        });
        previewUri = compressed.uri;
      } else if (metadata.type === 'video') {
        const thumbnail = await generateVideoThumbnail(uri, {
          ...options,
          quality: 0.5,
        });
        previewUri = thumbnail.uri;
      }

      return {
        uri: previewUri,
        type: metadata.type,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [compressImage, extractMediaMetadata, generateVideoThumbnail]);

  return {
    processing,
    error,
    compressImage,
    generateVideoThumbnail,
    extractMediaMetadata,
    generateMediaHash,
    optimizeMediaForUpload,
    createMediaPreview,
  };
};

export default useMediaProcessing; 