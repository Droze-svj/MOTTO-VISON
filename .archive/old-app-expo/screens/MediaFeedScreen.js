import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useAppTheme } from '../providers/ThemeProvider';
import useMediaSearch from '../hooks/useMediaSearch';
import useMediaSharing from '../hooks/useMediaSharing';
import useMediaProcessing from '../hooks/useMediaProcessing';
import { Ionicons } from '@expo/vector-icons';
import {
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
} from '../utils/responsive';
import Toast from 'react-native-toast-message';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Image as ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const ITEM_HEIGHT = ITEM_WIDTH * 0.75;

const SORT_OPTIONS = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Most Liked', value: 'likes' },
  { label: 'Most Viewed', value: 'views' },
  { label: 'Most Commented', value: 'comments' },
];

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Photos', value: 'image' },
  { label: 'Videos', value: 'video' },
  { label: 'Liked', value: 'liked' },
];

const MediaFeedScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recent');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const {
    searchResults,
    recommendations,
    trending,
    isLoading,
    error: searchError,
    hasMore,
    loadMore,
    getRecommendations,
    getTrending,
    searchMedia,
  } = useMediaSearch({
    pageSize: 10,
    enableCache: true,
  });

  const { likeMedia, commentOnMedia, trackView } = useMediaSharing();
  const { createMediaPreview } = useMediaProcessing();

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchQuery('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      await searchMedia(query);
      setSearchQuery(query);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Search failed',
        text2: error.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchMedia]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      if (searchQuery) {
        await searchMedia(searchQuery);
      } else if (activeTab === 'feed') {
        await loadMore();
      } else if (activeTab === 'trending') {
        await getTrending();
      } else {
        await getRecommendations();
      }
    } catch (error) {
      setError(error.message);
      Toast.show({
        type: 'error',
        text1: 'Failed to refresh',
        text2: error.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, loadMore, getTrending, getRecommendations, searchQuery, searchMedia]);

  const handleMediaPress = useCallback(async (item) => {
    try {
      await trackView(item.id);
      navigation.navigate('MediaSharing', { media: item });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to track view',
        text2: error.message,
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  }, [navigation, trackView]);

  const handleLike = useCallback(async (item) => {
    try {
      await likeMedia(item.id);
      Toast.show({
        type: 'success',
        text1: item.liked ? 'Unliked' : 'Liked',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update like',
        text2: error.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  }, [likeMedia]);

  const handleComment = useCallback(async (item) => {
    navigation.navigate('MediaSharing', {
      media: item,
      showComments: true,
    });
  }, [navigation]);

  const handleTabPress = useCallback((tab) => {
    setActiveTab(tab);
    setError(null);
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSelectedSort(sort);
    setShowFilters(false);
    // Implement sorting logic here
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setSelectedFilter(filter);
    setShowFilters(false);
    // Implement filtering logic here
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      padding: getResponsivePadding(theme.spacing.sm),
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    searchInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: getResponsivePadding(theme.spacing.md),
      paddingVertical: getResponsivePadding(theme.spacing.sm),
    },
    searchIcon: {
      marginRight: getResponsiveMargin(theme.spacing.sm),
    },
    searchText: {
      flex: 1,
      fontSize: getResponsiveFontSize(theme.typography.bodyLarge),
      color: theme.colors.onSurface,
    },
    filterButton: {
      position: 'absolute',
      right: getResponsiveMargin(theme.spacing.md),
      top: getResponsiveMargin(theme.spacing.sm),
      padding: getResponsivePadding(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primaryContainer,
    },
    filterModal: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    filterContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: getResponsivePadding(theme.spacing.lg),
    },
    filterSection: {
      marginBottom: getResponsiveMargin(theme.spacing.xl),
    },
    filterTitle: {
      fontSize: getResponsiveFontSize(theme.typography.titleMedium),
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: getResponsiveMargin(theme.spacing.md),
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: getResponsivePadding(theme.spacing.sm),
      paddingHorizontal: getResponsivePadding(theme.spacing.md),
      borderRadius: theme.borderRadius.md,
      marginBottom: getResponsiveMargin(theme.spacing.sm),
    },
    selectedFilterOption: {
      backgroundColor: theme.colors.primaryContainer,
    },
    filterOptionText: {
      fontSize: getResponsiveFontSize(theme.typography.bodyLarge),
      color: theme.colors.onSurface,
      marginLeft: getResponsiveMargin(theme.spacing.sm),
    },
    selectedFilterOptionText: {
      color: theme.colors.primary,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      paddingVertical: getResponsivePadding(theme.spacing.sm),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      elevation: 2,
      ...theme.shadows.sm,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: getResponsivePadding(theme.spacing.sm),
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: getResponsiveFontSize(theme.typography.labelLarge),
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    listContent: {
      padding: getResponsivePadding(theme.spacing.md),
    },
    mediaItem: {
      width: ITEM_WIDTH,
      height: ITEM_HEIGHT,
      marginBottom: getResponsiveMargin(theme.spacing.md),
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    mediaPreview: {
      width: '100%',
      height: '80%',
    },
    videoOverlay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -20 }, { translateY: -20 }],
    },
    mediaInfo: {
      padding: getResponsivePadding(theme.spacing.sm),
    },
    mediaTitle: {
      fontSize: getResponsiveFontSize(theme.typography.titleMedium),
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: getResponsiveMargin(theme.spacing.xs),
    },
    mediaStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: getResponsiveMargin(theme.spacing.md),
      padding: getResponsivePadding(theme.spacing.xs),
      borderRadius: theme.borderRadius.full,
    },
    statText: {
      fontSize: getResponsiveFontSize(theme.typography.bodySmall),
      color: theme.colors.onSurfaceVariant,
      marginLeft: getResponsiveMargin(theme.spacing.xs),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: getResponsivePadding(theme.spacing.xl),
    },
    emptyText: {
      fontSize: getResponsiveFontSize(theme.typography.bodyLarge),
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: getResponsiveMargin(theme.spacing.md),
    },
    loadingContainer: {
      padding: getResponsivePadding(theme.spacing.md),
      alignItems: 'center',
    },
    errorContainer: {
      padding: getResponsivePadding(theme.spacing.lg),
      backgroundColor: theme.colors.errorContainer,
      borderRadius: theme.borderRadius.lg,
      margin: getResponsiveMargin(theme.spacing.md),
    },
    errorText: {
      color: theme.colors.onErrorContainer,
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
      textAlign: 'center',
    },
    retryButton: {
      marginTop: getResponsiveMargin(theme.spacing.md),
      padding: getResponsivePadding(theme.spacing.sm),
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
    },
    retryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: getResponsiveFontSize(theme.typography.labelLarge),
      fontWeight: '600',
    },
  });

  const renderSearchBar = useCallback(() => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInput}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.onSurfaceVariant}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchText}
          placeholder="Search media..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
        {isSearching && (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={styles.searchIcon}
          />
        )}
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
        accessibilityRole="button"
        accessibilityLabel="Show filters"
      >
        <Ionicons
          name="options"
          size={24}
          color={theme.colors.onPrimaryContainer}
        />
      </TouchableOpacity>
    </View>
  ), [searchQuery, isSearching, handleSearch, theme.colors, styles]);

  const renderFilterModal = useCallback(() => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.filterModal}>
        <View style={styles.filterContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedSort === option.value && styles.selectedFilterOption,
                ]}
                onPress={() => handleSortChange(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`Sort by ${option.label}`}
                accessibilityState={{ selected: selectedSort === option.value }}
              >
                <Ionicons
                  name={
                    selectedSort === option.value
                      ? 'checkmark-circle'
                      : 'checkmark-circle-outline'
                  }
                  size={24}
                  color={
                    selectedSort === option.value
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedSort === option.value &&
                      styles.selectedFilterOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Filter By</Text>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedFilter === option.value && styles.selectedFilterOption,
                ]}
                onPress={() => handleFilterChange(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${option.label}`}
                accessibilityState={{ selected: selectedFilter === option.value }}
              >
                <Ionicons
                  name={
                    selectedFilter === option.value
                      ? 'checkmark-circle'
                      : 'checkmark-circle-outline'
                  }
                  size={24}
                  color={
                    selectedFilter === option.value
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilter === option.value &&
                      styles.selectedFilterOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  ), [
    showFilters,
    selectedSort,
    selectedFilter,
    handleSortChange,
    handleFilterChange,
    theme.colors,
    styles,
  ]);

  // 1. Create a memoized MediaItem component for FlatList
  const MediaItem = React.memo(({ item, onPress, onLike, onComment, theme, createMediaPreview, styles }) => {
    const preview = createMediaPreview(item);
    const isVideo = item.type.startsWith('video/');
    return (
      <TouchableOpacity
        style={styles.mediaItem}
        onPress={() => onPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.filename}`}
        accessibilityHint="Double tap to view media details"
      >
        <ExpoImage
          source={{ uri: preview }}
          style={styles.mediaPreview}
          contentFit='cover'
          transition={300}
          cachePolicy='memory-disk'
          accessibilityLabel={`Preview of ${item.filename}`}
        />
        {isVideo && (
          <View style={styles.videoOverlay}>
            <Ionicons name="play-circle" size={40} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.mediaInfo}>
          <Text style={styles.mediaTitle} numberOfLines={1}>
            {item.filename}
          </Text>
          <View style={styles.mediaStats}>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => onLike(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.liked ? 'Unlike' : 'Like'} ${item.filename}`}
              accessibilityState={{ checked: item.liked }}
            >
              <Ionicons
                name={item.liked ? 'heart' : 'heart-outline'}
                size={20}
                color={item.liked ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <Text style={styles.statText}>
                {item.likes || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => onComment(item)}
              accessibilityRole="button"
              accessibilityLabel={`View comments for ${item.filename}`}
            >
              <Ionicons name="chatbubble-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.statText}>
                {item.comments?.length || 0}
              </Text>
            </TouchableOpacity>
            <View style={styles.statButton}>
              <Ionicons name="eye-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.statText}>
                {item.views || 0}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  // 2. Memoize renderMediaItem and use MediaItem
  const renderMediaItem = useCallback(({ item }) => (
    <MediaItem
      item={item}
      onPress={handleMediaPress}
      onLike={handleLike}
      onComment={handleComment}
      theme={theme}
      createMediaPreview={createMediaPreview}
      styles={styles}
    />
  ), [theme, handleMediaPress, handleLike, handleComment, createMediaPreview, styles]);

  // 3. Add getItemLayout, initialNumToRender, windowSize to FlatList
  const getItemLayout = useCallback((data, index) => (
    { length: ITEM_HEIGHT + styles.listContent.padding, offset: (ITEM_HEIGHT + styles.listContent.padding) * index, index }
  ), [styles]);

  const renderTab = useCallback((title, tab) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => handleTabPress(tab)}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === tab }}
      accessibilityLabel={`${title} tab`}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  ), [activeTab, handleTabPress, styles]);

  // Replace renderError with a more user-friendly error banner and retry button
  const renderError = useCallback(() => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || searchError?.message || 'Unable to load media. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRefresh}
        accessibilityRole="button"
        accessibilityLabel="Retry loading content"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  ), [error, searchError, handleRefresh, styles]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={48} color={theme.colors.onSurfaceVariant} />
      <Text style={styles.emptyText}>
        {activeTab === 'feed'
          ? 'No media in your feed'
          : activeTab === 'trending'
            ? 'No trending media'
            : 'No recommendations available'}
      </Text>
    </View>
  ), [activeTab, theme.colors.onSurfaceVariant, styles]);

  // In renderTabContent, show skeletons when isLoading and no data
  const renderTabContent = useCallback(() => {
    const data = activeTab === 'feed'
      ? searchResults
      : activeTab === 'trending'
        ? trending
        : recommendations;

    if (error || searchError) {
      return renderError();
    }

    if (isLoading && (!data || data.length === 0)) {
      // Show skeletons for 8 items
      return <SkeletonLoader rows={8} height={ITEM_HEIGHT} style={{ marginTop: 16 }} />;
    }

    if (!isLoading && (!data || data.length === 0)) {
      return renderEmpty();
    }

    return (
      <FlatList
        data={data}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={hasMore ? loadMore : null}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={
          isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : null
        }
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        windowSize={11}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
      />
    );
  }, [activeTab, searchResults, trending, recommendations, error, searchError, isLoading, refreshing, hasMore, loadMore, handleRefresh, renderMediaItem, renderError, renderEmpty, styles, theme.colors.primary, getItemLayout, initialNumToRender, windowSize, removeClippedSubviews, maxToRenderPerBatch, updateCellsBatchingPeriod]);

  return (
    <View style={styles.container}>
      {renderSearchBar()}
      <View style={styles.tabBar}>
        {renderTab('Feed', 'feed')}
        {renderTab('Trending', 'trending')}
        {renderTab('For You', 'recommendations')}
      </View>
      {renderTabContent()}
      {renderFilterModal()}
    </View>
  );
};

export default MediaFeedScreen; 