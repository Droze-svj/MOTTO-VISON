import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { Video } from 'expo-av';
import useMediaProcessing from '../hooks/useMediaProcessing';
import useMediaAnalytics from '../hooks/useMediaAnalytics';
import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MediaEditorScreen = ({ route, navigation }) => {
  const { mediaUri, mediaType } = route.params;
  const theme = useTheme();
  const videoRef = useRef(null);

  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedMediaUri, setEditedMediaUri] = useState(mediaUri);

  const {
    applyFilter,
    adjustBrightness,
    adjustContrast,
    adjustSaturation,
    saveMedia,
    compressMedia,
  } = useMediaProcessing();

  const { trackEngagement } = useMediaAnalytics({
    enableRealTime: true,
  });

  const filters = [
    { id: 'normal', name: 'Normal', icon: 'image-outline' },
    { id: 'vintage', name: 'Vintage', icon: 'camera-outline' },
    { id: 'bw', name: 'B&W', icon: 'contrast-outline' },
    { id: 'sepia', name: 'Sepia', icon: 'color-palette-outline' },
    { id: 'vivid', name: 'Vivid', icon: 'color-filter-outline' },
  ];

  const handleFilterSelect = useCallback(async (filterId) => {
    try {
      setIsProcessing(true);
      setSelectedFilter(filterId);
      const result = await applyFilter(editedMediaUri, filterId);
      setEditedMediaUri(result);
      await trackEngagement({
        type: 'filter_applied',
        filterId,
        mediaType,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to apply filter');
    } finally {
      setIsProcessing(false);
    }
  }, [editedMediaUri, mediaType, applyFilter, trackEngagement]);

  const handleAdjustment = useCallback(async (type, value) => {
    try {
      setIsProcessing(true);
      let result;
      switch (type) {
        case 'brightness':
          setBrightness(value);
          result = await adjustBrightness(editedMediaUri, value);
          break;
        case 'contrast':
          setContrast(value);
          result = await adjustContrast(editedMediaUri, value);
          break;
        case 'saturation':
          setSaturation(value);
          result = await adjustSaturation(editedMediaUri, value);
          break;
      }
      setEditedMediaUri(result);
      await trackEngagement({
        type: 'adjustment_applied',
        adjustmentType: type,
        value,
        mediaType,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to apply adjustment');
    } finally {
      setIsProcessing(false);
    }
  }, [editedMediaUri, mediaType, adjustBrightness, adjustContrast, adjustSaturation, trackEngagement]);

  const handleSave = useCallback(async () => {
    try {
      setIsProcessing(true);
      const compressedUri = await compressMedia(editedMediaUri);
      const savedUri = await saveMedia(compressedUri);
      await trackEngagement({
        type: 'media_saved',
        mediaType,
        filter: selectedFilter,
        adjustments: {
          brightness,
          contrast,
          saturation,
        },
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save media');
    } finally {
      setIsProcessing(false);
    }
  }, [editedMediaUri, mediaType, selectedFilter, brightness, contrast, saturation, navigation, compressMedia, saveMedia, trackEngagement]);

  const handlePlayPause = useCallback(() => {
    if (mediaType === 'video') {
      if (isPlaying) {
        videoRef.current?.pauseAsync();
      } else {
        videoRef.current?.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  }, [mediaType, isPlaying]);

  const renderMediaPreview = () => {
    if (mediaType === 'image') {
      return (
        <ExpoImage
          source={{ uri: editedMediaUri }}
          style={styles.mediaPreview}
          contentFit='cover'
          transition={300}
          cachePolicy='memory-disk'
        />
      );
    }

    return (
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: editedMediaUri }}
          style={styles.mediaPreview}
          resizeMode="contain"
          isLooping
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && !status.isPlaying) {
              setIsPlaying(false);
            }
          }}
        />
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={32}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAdjustmentSlider = (type, value, min, max, step, icon) => (
    <View style={styles.adjustmentContainer}>
      <View style={styles.adjustmentHeader}>
        <Ionicons
          name={icon}
          size={24}
          color={theme.colors.text}
        />
        <Text style={[styles.adjustmentLabel, { color: theme.colors.text }]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={(newValue) => handleAdjustment(type, newValue)}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.primary}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Edit {mediaType === 'image' ? 'Photo' : 'Video'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={isProcessing}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previewContainer}>
        {renderMediaPreview()}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </View>

      <ScrollView style={styles.controlsContainer}>
        <View style={styles.filtersContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Filters
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && {
                    backgroundColor: theme.colors.primary + '20',
                  },
                ]}
                onPress={() => handleFilterSelect(filter.id)}
              >
                <Ionicons
                  name={filter.icon}
                  size={24}
                  color={
                    selectedFilter === filter.id
                      ? theme.colors.primary
                      : theme.colors.text
                  }
                />
                <Text
                  style={[
                    styles.filterName,
                    {
                      color:
                        selectedFilter === filter.id
                          ? theme.colors.primary
                          : theme.colors.text,
                    },
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.adjustmentsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Adjustments
          </Text>
          {renderAdjustmentSlider(
            'brightness',
            brightness,
            -1,
            1,
            0.1,
            'sunny-outline'
          )}
          {renderAdjustmentSlider(
            'contrast',
            contrast,
            0.5,
            1.5,
            0.1,
            'contrast-outline'
          )}
          {renderAdjustmentSlider(
            'saturation',
            saturation,
            0,
            2,
            0.1,
            'color-palette-outline'
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#000000',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flex: 1,
  },
  filtersContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterButton: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 8,
  },
  filterName: {
    marginTop: 4,
    fontSize: 12,
  },
  adjustmentsContainer: {
    padding: 16,
  },
  adjustmentContainer: {
    marginBottom: 16,
  },
  adjustmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adjustmentLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default MediaEditorScreen; 