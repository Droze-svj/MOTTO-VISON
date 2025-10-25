import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const useFileUpload = ({
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/*', 'application/pdf'],
  onProgress,
  onSuccess,
  onError,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
    } catch (error) {
      setError(error.message);
      onError?.(error);
    }
  }, [onError]);

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        return result;
      }
    } catch (error) {
      setError(error.message);
      onError?.(error);
    }
  }, [allowedTypes, onError]);

  const uploadFile = useCallback(async (file, url) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Check file size
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (fileInfo.size > maxFileSize) {
        throw new Error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
      }

      // Create upload task
      const uploadTask = FileSystem.createUploadTask(
        url,
        file.uri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          parameters: {
            filename: file.name || 'file',
            contentType: file.mimeType || 'application/octet-stream',
          },
        },
        (uploadProgress) => {
          const progress = uploadProgress.totalBytesSent / uploadProgress.totalBytesExpectedToSend;
          setProgress(progress);
          onProgress?.(progress);
        }
      );

      // Start upload
      const response = await uploadTask.uploadAsync();
      const result = JSON.parse(response.body);

      setUploading(false);
      onSuccess?.(result);
      return result;
    } catch (error) {
      setUploading(false);
      setError(error.message);
      onError?.(error);
      throw error;
    }
  }, [maxFileSize, onProgress, onSuccess, onError]);

  const cancelUpload = useCallback(() => {
    // Implement cancel logic if needed
    setUploading(false);
    setProgress(0);
  }, []);

  const validateFile = useCallback((file) => {
    if (!file) {
      throw new Error('No file selected');
    }

    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
    }

    const fileType = file.mimeType || file.type;
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return fileType.startsWith(category);
      }
      return type === fileType;
    });

    if (!isAllowed) {
      throw new Error('File type not allowed');
    }

    return true;
  }, [maxFileSize, allowedTypes]);

  return {
    uploading,
    progress,
    error,
    pickImage,
    pickDocument,
    uploadFile,
    cancelUpload,
    validateFile,
  };
};

export default useFileUpload; 