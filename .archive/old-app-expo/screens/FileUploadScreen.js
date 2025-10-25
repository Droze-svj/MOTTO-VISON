import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import useFileUpload from '../hooks/useFileUpload';
import useApi from '../hooks/useApi';
import { colors } from '../constants/colors';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FileUploadScreen = () => {
  const { theme, isDark } = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const {
    uploading,
    progress,
    error,
    pickImage,
    pickDocument,
    uploadFile,
    cancelUpload,
  } = useFileUpload({
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*', 'application/pdf', 'application/msword'],
    onProgress: (progress) => {
      console.log(`Upload progress: ${Math.round(progress * 100)}%`);
    },
    onSuccess: (result) => {
      setUploadedFiles(prev => [...prev, result]);
      Alert.alert('Success', 'File uploaded successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: true,
  });

  const handleUpload = async (file) => {
    try {
      const uploadUrl = 'https://your-api.com/upload';
      const result = await uploadFile(file, uploadUrl);
      
      // Save file metadata to backend
      await request({
        endpoint: '/files',
        method: 'POST',
        body: {
          filename: file.name,
          size: file.size,
          type: file.type,
          url: result.url,
        },
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) {
      setSelectedFile(image);
      handleUpload(image);
    }
  };

  const handlePickDocument = async () => {
    const document = await pickDocument();
    if (document) {
      setSelectedFile(document);
      handleUpload(document);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    return (
      <View style={styles.previewContainer}>
        <Text style={[styles.previewTitle, { color: theme.text }]}>
          File Preview
        </Text>
        {selectedFile.type?.startsWith('image/') ? (
          <ExpoImage
            source={{ uri: selectedFile.uri }}
            style={styles.imagePreview}
            contentFit='cover'
            transition={300}
            cachePolicy='memory-disk'
          />
        ) : (
          <View style={[styles.documentPreview, { backgroundColor: theme.card }]}>
            <Text style={[styles.documentIcon, { color: theme.text }]}>📄</Text>
            <Text style={[styles.documentName, { color: theme.text }]}>
              {selectedFile.name}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderUploadProgress = () => {
    if (!uploading) return null;

    return (
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: theme.text }]}>
          Uploading... {Math.round(progress * 100)}%
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.error }]}
          onPress={cancelUpload}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderUploadedFiles = () => {
    if (uploadedFiles.length === 0) return null;

    return (
      <View style={styles.uploadedFilesContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Uploaded Files
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {uploadedFiles.map((file, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.fileItem, { backgroundColor: theme.card }]}
              onPress={() => setSelectedFile(file)}
            >
              {file.type?.startsWith('image/') ? (
                <ExpoImage
                  source={{ uri: file.uri }}
                  style={styles.fileThumbnail}
                  contentFit='cover'
                  transition={300}
                  cachePolicy='memory-disk'
                />
              ) : (
                <View style={styles.fileIconContainer}>
                  <Text style={[styles.fileIcon, { color: theme.text }]}>📄</Text>
                </View>
              )}
              <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
                {file.filename}
              </Text>
              <Text style={[styles.fileSize, { color: theme.textSecondary }]}>
                {(file.size / 1024).toFixed(2)} KB
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title, { color: theme.text }]}>File Upload</Text>

        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.dropZone, animatedStyle]}>
            <Text style={[styles.dropZoneText, { color: theme.text }]}>
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </Text>
          </Animated.View>
        </PanGestureHandler>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.primary }]}
            onPress={handlePickImage}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.secondary }]}
            onPress={handlePickDocument}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>Upload Document</Text>
          </TouchableOpacity>
        </View>

        {renderFilePreview()}
        {renderUploadProgress()}
        {renderUploadedFiles()}

        {error && (
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dropZone: {
    height: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropZoneText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  uploadButton: {
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    marginVertical: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  documentPreview: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  documentIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  documentName: {
    fontSize: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.gray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  uploadedFilesContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  fileItem: {
    width: 120,
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  fileThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginBottom: 5,
  },
  fileIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  fileIcon: {
    fontSize: 32,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 5,
  },
  errorText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default FileUploadScreen; 