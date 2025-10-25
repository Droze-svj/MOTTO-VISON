import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import useApi from '../hooks/useApi';
import useFileUpload from '../hooks/useFileUpload';
import useOfflineStorage from '../hooks/useOfflineStorage';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_WIDTH = SCREEN_WIDTH / NUM_COLUMNS;

const MediaGalleryScreen = () => {
  const { theme } = useTheme();
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [mediaType, setMediaType] = useState('all'); // 'all', 'images', 'videos'

  const { request } = useApi({
    baseUrl: 'https://your-api.com',
    enableCache: true,
  });

  const {
    isOnline,
    createOffline,
    updateOffline,
    deleteOffline,
    getAllOfflineData,
  } = useOfflineStorage({
    entityName: 'media',
    syncEndpoint: '/media',
    onSyncComplete: () => {
      loadMedia();
    },
  });

  const {
    uploading,
    progress,
    error,
    pickImage,
    uploadFile,
  } = useFileUpload({
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/*', 'video/*'],
  });

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const response = await request({
        endpoint: '/media',
        method: 'GET',
      });
      setMedia(response.data);
    } catch (error) {
      const offlineMedia = getAllOfflineData();
      setMedia(offlineMedia);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const file = await pickImage();
      if (file) {
        if (!isOnline) {
          await createOffline({
            id: Date.now().toString(),
            filename: file.name,
            size: file.size,
            type: file.type,
            uri: file.uri,
            isOffline: true,
          });
          return;
        }

        const result = await uploadFile(file, 'https://your-api.com/upload');
        
        await request({
          endpoint: '/media',
          method: 'POST',
          body: {
            filename: file.name,
            size: file.size,
            type: file.type,
            url: result.url,
          },
        });

        loadMedia();
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (item) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!isOnline) {
                await deleteOffline(item.id);
                return;
              }

              await request({
                endpoint: `/media/${item.id}`,
                method: 'DELETE',
              });
              loadMedia();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete media');
            }
          },
        },
      ]
    );
  };

  const filteredMedia = media.filter(item => {
    if (mediaType === 'all') return true;
    if (mediaType === 'images') return item.type.startsWith('image/');
    if (mediaType === 'videos') return item.type.startsWith('video/');
    return true;
  });

  // 1. Memoized MediaItem component
  const MediaItem = React.memo(function MediaItem({ item, onPress, styles, colors }) {
    const isImage = item.type.startsWith('image/');
    const isVideo = item.type.startsWith('video/');
    return (
      <TouchableOpacity
        style={styles.mediaItem}
        onPress={onPress}
      >
        {isImage ? (
          <ExpoImage
            source={{ uri: item.url || item.uri }}
            style={styles.mediaThumbnail}
            contentFit='cover'
            transition={300}
            cachePolicy='memory-disk'
          />
        ) : isVideo ? (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: item.url || item.uri }}
              style={styles.mediaThumbnail}
              resizeMode="cover"
              paused
            />
            <View style={styles.videoOverlay}>
              <Icon name="play-circle-filled" size={24} color={colors.white} />
            </View>
          </View>
        ) : null}
        {item.isOffline && (
          <View style={styles.offlineBadge}>
            <Icon name="wifi-off" size={12} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  });

  // 2. Memoize renderMediaItem with useCallback
  const renderMediaItem = React.useCallback(
    ({ item }) => (
      <MediaItem
        item={item}
        onPress={() => {
          setSelectedMedia(item);
          setShowPreview(true);
        }}
        styles={styles}
        colors={colors}
      />
    ),
    [styles, colors, setSelectedMedia, setShowPreview]
  );

  // 3. Add getItemLayout and FlatList performance props
  const getItemLayout = React.useCallback((data, index) => (
    { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }
  ), []);

  const renderPreview = () => {
    if (!selectedMedia) return null;

    const isImage = selectedMedia.type.startsWith('image/');
    const isVideo = selectedMedia.type.startsWith('video/');

    return (
      <Modal
        visible={showPreview}
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={[styles.previewContainer, { backgroundColor: theme.background }]}>
          <View style={styles.previewHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPreview(false)}
            >
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={1}>
              {selectedMedia.filename}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                setShowPreview(false);
                handleDelete(selectedMedia);
              }}
            >
              <Icon name="delete" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
          <View style={styles.previewContent}>
            {isImage ? (
              <ExpoImage
                source={{ uri: selectedMedia.url || selectedMedia.uri }}
                style={styles.previewImage}
                contentFit='contain'
                transition={300}
                cachePolicy='memory-disk'
              />
            ) : isVideo ? (
              <Video
                source={{ uri: selectedMedia.url || selectedMedia.uri }}
                style={styles.previewVideo}
                resizeMode="contain"
                controls
                repeat
              />
            ) : null}
          </View>
        </View>
      </Modal>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load media. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadMedia}
        accessibilityRole="button"
        accessibilityLabel="Retry loading media"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Media Gallery</Text>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: theme.primary }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Icon name="add-a-photo" size={20} color={colors.white} />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            mediaType === 'all' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setMediaType('all')}
        >
          <Text style={[styles.filterText, { color: mediaType === 'all' ? colors.white : theme.text }]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            mediaType === 'images' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setMediaType('images')}
        >
          <Text style={[styles.filterText, { color: mediaType === 'images' ? colors.white : theme.text }]}>
            Images
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            mediaType === 'videos' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setMediaType('videos')}
        >
          <Text style={[styles.filterText, { color: mediaType === 'videos' ? colors.white : theme.text }]}>
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: theme.warning }]}>
          <Icon name="wifi-off" size={20} color={colors.white} />
          <Text style={styles.offlineText}>Working offline</Text>
        </View>
      )}

      {uploading && (
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
        </View>
      )}

      {isLoading ? (
        <SkeletonLoader rows={9} height={ITEM_WIDTH} style={{ marginTop: 16 }} />
      ) : (
        <FlatList
          data={filteredMedia}
          renderItem={renderMediaItem}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No media found
            </Text>
          }
          getItemLayout={getItemLayout}
          initialNumToRender={12}
          windowSize={15}
          removeClippedSubviews={true}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={50}
        />
      )}

      {renderPreview()}

      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: colors.gray,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: colors.white,
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
  },
  offlineText: {
    color: colors.white,
    marginLeft: 5,
    fontSize: 14,
  },
  progressContainer: {
    padding: 10,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 1,
  },
  mediaItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    padding: 1,
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.warning,
    borderRadius: 10,
    padding: 4,
  },
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 10,
  },
  closeButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    margin: 10,
  },
  errorContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderRadius: 8,
  },
  retryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MediaGalleryScreen; 