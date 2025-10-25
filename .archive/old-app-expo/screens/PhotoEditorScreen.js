import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import useMediaProcessing from '../hooks/useMediaProcessing';
import useFileUpload from '../hooks/useFileUpload';
import { colors } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { Image as ExpoImage } from 'expo-image';

const PhotoEditorScreen = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const { theme } = useTheme();
  const [editedImage, setEditedImage] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 0,
    contrast: 1,
    saturation: 1,
    blur: 0,
  });
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    processing,
    error,
    compressImage,
    optimizeMediaForUpload,
  } = useMediaProcessing();

  const {
    uploading,
    progress,
    uploadFile,
  } = useFileUpload();

  useEffect(() => {
    if (imageUri) {
      setEditedImage(imageUri);
    }
  }, [imageUri]);

  const applyFilter = async (filterType, value) => {
    try {
      setIsProcessing(true);
      const newFilters = { ...filters, [filterType]: value };
      setFilters(newFilters);

      const result = await compressImage(editedImage, {
        quality: 1,
        format: 'jpeg',
        // Add filter effects here using ImageManipulator
        // This is a placeholder for actual filter implementation
      });

      setEditedImage(result.uri);
    } catch (err) {
      Alert.alert('Error', 'Failed to apply filter');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const optimized = await optimizeMediaForUpload(editedImage);
      await uploadFile(optimized.uri, 'https://your-api.com/upload');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFilterControls = () => {
    const filterTypes = [
      { name: 'Brightness', key: 'brightness', min: -1, max: 1, step: 0.1 },
      { name: 'Contrast', key: 'contrast', min: 0, max: 2, step: 0.1 },
      { name: 'Saturation', key: 'saturation', min: 0, max: 2, step: 0.1 },
      { name: 'Blur', key: 'blur', min: 0, max: 10, step: 0.5 },
    ];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterControls}>
        {filterTypes.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && { backgroundColor: theme.primary },
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterButtonText,
              { color: selectedFilter === filter.key ? colors.white : theme.text },
            ]}>
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderSelectedFilterControl = () => {
    if (!selectedFilter) return null;

    const filter = {
      brightness: { min: -1, max: 1, step: 0.1 },
      contrast: { min: 0, max: 2, step: 0.1 },
      saturation: { min: 0, max: 2, step: 0.1 },
      blur: { min: 0, max: 10, step: 0.5 },
    }[selectedFilter];

    return (
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderLabel, { color: theme.text }]}>
          {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={filter.min}
          maximumValue={filter.max}
          step={filter.step}
          value={filters[selectedFilter]}
          onValueChange={(value) => applyFilter(selectedFilter, value)}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.primary}
        />
        <Text style={[styles.sliderValue, { color: theme.text }]}>
          {filters[selectedFilter].toFixed(1)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Edit Photo</Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={processing || uploading}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {editedImage ? (
          <ExpoImage
            source={{ uri: editedImage }}
            style={styles.image}
            contentFit='cover'
            transition={300}
            cachePolicy='memory-disk'
          />
        ) : (
          <ActivityIndicator size="large" color={theme.primary} />
        )}
      </View>

      {renderFilterControls()}
      {renderSelectedFilterControl()}

      {(processing || uploading) && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.progressText, { color: theme.text }]}>
            {uploading ? `Uploading... ${Math.round(progress * 100)}%` : 'Processing...'}
          </Text>
        </View>
      )}

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
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  filterControls: {
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
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sliderContainer: {
    padding: 20,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    textAlign: 'center',
    marginTop: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    margin: 10,
  },
});

export default PhotoEditorScreen; 