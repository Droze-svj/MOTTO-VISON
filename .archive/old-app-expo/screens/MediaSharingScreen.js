import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Share,
  Modal,
} from 'react-native';
import { useAppTheme } from '../providers/ThemeProvider';
import useMediaSharing from '../hooks/useMediaSharing';
import useMediaProcessing from '../hooks/useMediaProcessing';
import { Ionicons } from '@expo/vector-icons';
import {
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
} from '../utils/responsive';
import Toast from 'react-native-toast-message';
import Video from 'react-native-video';
import { Image as ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');
const MEDIA_WIDTH = width;
const MEDIA_HEIGHT = width * 0.75;

const MediaSharingScreen = ({ route, navigation }) => {
  const { media } = route.params;
  const { theme } = useAppTheme();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('24h');

  const {
    sharing,
    error: sharingError,
    analytics,
    shareMedia,
    likeMedia,
    commentOnMedia,
    trackView,
    getMediaAnalytics,
    generateShareableLink,
    downloadMedia,
    reportMedia,
  } = useMediaSharing();

  const {
    processing,
    createMediaPreview,
  } = useMediaProcessing();

  useEffect(() => {
    loadData();
  }, [media.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await trackView(media.id);
      const analyticsData = await getMediaAnalytics(media.id);
      setIsLiked(analyticsData.isLiked);
      // Load comments here
    } catch (err) {
      setError(err.message);
      Toast.show({
        type: 'error',
        text1: 'Failed to load media data',
        text2: err.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const link = await generateShareableLink(media.id);
      await Share.share({
        title: 'Check out this media!',
        message: `View this ${media.type} I shared: ${link}`,
        url: link,
      });
      Toast.show({
        type: 'success',
        text1: 'Shared successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to share media',
        text2: err.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  const handleLike = async () => {
    try {
      await likeMedia(media.id);
      setIsLiked(!isLiked);
      Toast.show({
        type: 'success',
        text1: isLiked ? 'Unliked' : 'Liked',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update like',
        text2: err.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      const newComment = await commentOnMedia(media.id, comment);
      setComments(prev => [newComment, ...prev]);
      setComment('');
      Toast.show({
        type: 'success',
        text1: 'Comment posted',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to post comment',
        text2: err.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadProgress(0);
      await downloadMedia(media.uri, {
        filename: `media-${media.id}`,
        mimeType: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
        quality: selectedQuality,
        onProgress: (progress) => {
          setDownloadProgress(progress);
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Media downloaded successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to download media',
        text2: err.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setDownloadProgress(0);
    }
  };

  const handleReport = async () => {
    Alert.alert(
      'Report Media',
      'Are you sure you want to report this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportMedia(media.id, 'Inappropriate content');
              Toast.show({
                type: 'success',
                text1: 'Media reported successfully',
                position: 'bottom',
                visibilityTime: 2000,
              });
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Failed to report media',
                text2: err.message,
                position: 'bottom',
                visibilityTime: 3000,
              });
            }
          },
        },
      ]
    );
  };

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const renderMediaPreview = useCallback(() => {
    if (media.type === 'image') {
      return (
        <ExpoImage
          source={{ uri: media.uri }}
          style={styles.mediaPreview}
          contentFit='cover'
          transition={300}
          cachePolicy='memory-disk'
          accessibilityLabel={`Preview of ${media.filename}`}
        />
      );
    }

    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: media.uri }}
          style={styles.mediaPreview}
          resizeMode="contain"
          paused={!isPlaying}
          muted={isMuted}
          repeat
          accessibilityLabel={`Video: ${media.filename}`}
        />
        <View style={styles.videoControls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.controlButton}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMute}
            style={styles.controlButton}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
          >
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [media, isPlaying, isMuted, handlePlayPause, handleMute, theme.colors]);

  const renderAnalytics = useCallback(() => (
    <View style={styles.analyticsContainer}>
      <View style={styles.analyticsItem}>
        <Ionicons name="eye" size={20} color={theme.colors.onSurface} />
        <Text style={[styles.analyticsText, { color: theme.colors.onSurface }]}>
          {analytics.views}
        </Text>
      </View>
      <View style={styles.analyticsItem}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={20}
          color={isLiked ? theme.colors.primary : theme.colors.onSurface}
        />
        <Text style={[styles.analyticsText, { color: theme.colors.onSurface }]}>
          {analytics.likes}
        </Text>
      </View>
      <View style={styles.analyticsItem}>
        <Ionicons name="share-social" size={20} color={theme.colors.onSurface} />
        <Text style={[styles.analyticsText, { color: theme.colors.onSurface }]}>
          {analytics.shares}
        </Text>
      </View>
      <View style={styles.analyticsItem}>
        <Ionicons name="chatbubble" size={20} color={theme.colors.onSurface} />
        <Text style={[styles.analyticsText, { color: theme.colors.onSurface }]}>
          {analytics.comments}
        </Text>
      </View>
    </View>
  ), [analytics, isLiked, theme.colors]);

  const renderComments = useCallback(() => (
    <View style={styles.commentsContainer}>
      <View style={styles.commentInputContainer}>
        <TextInput
          style={[styles.commentInput, { color: theme.colors.onSurface }]}
          placeholder="Add a comment..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={comment}
          onChangeText={setComment}
          multiline
          accessibilityLabel="Comment input"
        />
        <TouchableOpacity
          style={[
            styles.commentButton,
            { backgroundColor: theme.colors.primary },
            !comment.trim() && { opacity: 0.5 },
          ]}
          onPress={handleComment}
          disabled={!comment.trim()}
          accessibilityRole="button"
          accessibilityLabel="Post comment"
          accessibilityState={{ disabled: !comment.trim() }}
        >
          <Ionicons name="send" size={20} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Text style={[styles.commentAuthor, { color: theme.colors.onSurface }]}>
              {item.author}
            </Text>
            <Text style={[styles.commentText, { color: theme.colors.onSurfaceVariant }]}>
              {item.text}
            </Text>
            <Text style={[styles.commentTime, { color: theme.colors.onSurfaceVariant }]}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
        )}
        accessibilityRole="list"
        accessibilityLabel="Comments list"
      />
    </View>
  ), [comment, comments, theme.colors, handleComment]);

  const renderQualityOptions = useCallback(() => (
    <Modal
      visible={showQualityOptions}
      transparent
      animationType="slide"
      onRequestClose={() => setShowQualityOptions(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Select Quality
          </Text>
          {['auto', 'high', 'medium', 'low'].map((quality) => (
            <TouchableOpacity
              key={quality}
              style={[
                styles.qualityOption,
                selectedQuality === quality && { backgroundColor: theme.colors.primaryContainer },
              ]}
              onPress={() => {
                setSelectedQuality(quality);
                setShowQualityOptions(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select ${quality} quality`}
              accessibilityState={{ selected: selectedQuality === quality }}
            >
              <Text
                style={[
                  styles.qualityText,
                  { color: theme.colors.onSurface },
                  selectedQuality === quality && { color: theme.colors.onPrimaryContainer },
                ]}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowQualityOptions(false)}
            accessibilityRole="button"
            accessibilityLabel="Close quality options"
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.onPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ), [showQualityOptions, selectedQuality, theme.colors]);

  const renderEnhancedAnalytics = useCallback(() => (
    <Modal
      visible={showAnalytics}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAnalytics(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Analytics
          </Text>
          <View style={styles.periodSelector}>
            {['24h', '7d', '30d', 'all'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodOption,
                  analyticsPeriod === period && { backgroundColor: theme.colors.primaryContainer },
                ]}
                onPress={() => setAnalyticsPeriod(period)}
                accessibilityRole="button"
                accessibilityLabel={`View ${period} analytics`}
                accessibilityState={{ selected: analyticsPeriod === period }}
              >
                <Text
                  style={[
                    styles.periodText,
                    { color: theme.colors.onSurface },
                    analyticsPeriod === period && { color: theme.colors.onPrimaryContainer },
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.analyticsDetails}>
            <View style={styles.analyticsRow}>
              <Text style={[styles.analyticsLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Views
              </Text>
              <Text style={[styles.analyticsValue, { color: theme.colors.onSurface }]}>
                {analytics.views}
              </Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={[styles.analyticsLabel, { color: theme.colors.onSurfaceVariant }]}>
                Engagement Rate
              </Text>
              <Text style={[styles.analyticsValue, { color: theme.colors.onSurface }]}>
                {((analytics.likes + analytics.comments) / analytics.views * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.analyticsRow}>
              <Text style={[styles.analyticsLabel, { color: theme.colors.onSurfaceVariant }]}>
                Average View Duration
              </Text>
              <Text style={[styles.analyticsValue, { color: theme.colors.onSurface }]}>
                {analytics.avgViewDuration}s
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowAnalytics(false)}
            accessibilityRole="button"
            accessibilityLabel="Close analytics"
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.onPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ), [showAnalytics, analyticsPeriod, analytics, theme.colors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    mediaPreview: {
      width: MEDIA_WIDTH,
      height: MEDIA_HEIGHT,
      backgroundColor: theme.colors.surface,
    },
    videoContainer: {
      position: 'relative',
    },
    videoControls: {
      position: 'absolute',
      bottom: getResponsivePadding(theme.spacing.md),
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: getResponsivePadding(theme.spacing.sm),
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    controlButton: {
      padding: getResponsivePadding(theme.spacing.sm),
      marginHorizontal: getResponsiveMargin(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    analyticsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: getResponsivePadding(theme.spacing.md),
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    analyticsItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    analyticsText: {
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
      marginLeft: getResponsiveMargin(theme.spacing.xs),
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: getResponsivePadding(theme.spacing.md),
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getResponsivePadding(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      color: theme.colors.onPrimary,
      fontSize: getResponsiveFontSize(theme.typography.labelLarge),
      marginLeft: getResponsiveMargin(theme.spacing.xs),
    },
    commentsContainer: {
      flex: 1,
      padding: getResponsivePadding(theme.spacing.md),
    },
    commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsiveMargin(theme.spacing.md),
    },
    commentInput: {
      flex: 1,
      padding: getResponsivePadding(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surfaceVariant,
      fontSize: getResponsiveFontSize(theme.typography.bodyLarge),
      marginRight: getResponsiveMargin(theme.spacing.sm),
    },
    commentButton: {
      padding: getResponsivePadding(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
    },
    commentItem: {
      marginBottom: getResponsiveMargin(theme.spacing.md),
      padding: getResponsivePadding(theme.spacing.sm),
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
    },
    commentAuthor: {
      fontSize: getResponsiveFontSize(theme.typography.titleSmall),
      fontWeight: '600',
      marginBottom: getResponsiveMargin(theme.spacing.xs),
    },
    commentText: {
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
      marginBottom: getResponsiveMargin(theme.spacing.xs),
    },
    commentTime: {
      fontSize: getResponsiveFontSize(theme.typography.bodySmall),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      padding: getResponsivePadding(theme.spacing.lg),
      borderRadius: theme.borderRadius.lg,
    },
    modalTitle: {
      fontSize: getResponsiveFontSize(theme.typography.titleLarge),
      fontWeight: '600',
      marginBottom: getResponsiveMargin(theme.spacing.md),
      textAlign: 'center',
    },
    qualityOption: {
      padding: getResponsivePadding(theme.spacing.md),
      borderRadius: theme.borderRadius.md,
      marginBottom: getResponsiveMargin(theme.spacing.sm),
    },
    qualityText: {
      fontSize: getResponsiveFontSize(theme.typography.bodyLarge),
      textAlign: 'center',
    },
    closeButton: {
      padding: getResponsivePadding(theme.spacing.md),
      borderRadius: theme.borderRadius.full,
      marginTop: getResponsiveMargin(theme.spacing.md),
    },
    closeButtonText: {
      fontSize: getResponsiveFontSize(theme.typography.labelLarge),
      textAlign: 'center',
    },
    periodSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: getResponsiveMargin(theme.spacing.md),
    },
    periodOption: {
      padding: getResponsivePadding(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
    },
    periodText: {
      fontSize: getResponsiveFontSize(theme.typography.labelMedium),
    },
    analyticsDetails: {
      marginTop: getResponsiveMargin(theme.spacing.md),
    },
    analyticsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: getResponsivePadding(theme.spacing.sm),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    analyticsLabel: {
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
    },
    analyticsValue: {
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
      fontWeight: '600',
    },
    downloadProgressContainer: {
      height: 4,
      backgroundColor: theme.colors.surfaceVariant,
      marginHorizontal: getResponsiveMargin(theme.spacing.md),
      marginVertical: getResponsiveMargin(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    downloadProgressBar: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    downloadProgressText: {
      fontSize: getResponsiveFontSize(theme.typography.bodySmall),
      textAlign: 'center',
      marginTop: getResponsiveMargin(theme.spacing.xs),
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: getResponsiveMargin(theme.spacing.md) }]}
          onPress={loadData}
          accessibilityRole="button"
          accessibilityLabel="Retry loading media"
        >
          <Ionicons name="refresh" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.actionButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {renderMediaPreview()}
        {renderAnalytics()}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleLike}
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Unlike media' : 'Like media'}
            accessibilityState={{ checked: isLiked }}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.actionButtonText}>
              {isLiked ? 'Unlike' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleShare}
            disabled={sharing}
            accessibilityRole="button"
            accessibilityLabel="Share media"
            accessibilityState={{ disabled: sharing }}
          >
            <Ionicons name="share-social" size={24} color={theme.colors.onPrimary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowQualityOptions(true)}
            disabled={sharing}
            accessibilityRole="button"
            accessibilityLabel="Select download quality"
            accessibilityState={{ disabled: sharing }}
          >
            <Ionicons name="download" size={24} color={theme.colors.onPrimary} />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowAnalytics(true)}
            accessibilityRole="button"
            accessibilityLabel="View detailed analytics"
          >
            <Ionicons name="analytics" size={24} color={theme.colors.onPrimary} />
            <Text style={styles.actionButtonText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={handleReport}
            accessibilityRole="button"
            accessibilityLabel="Report media"
          >
            <Ionicons name="flag" size={24} color={theme.colors.onError} />
            <Text style={[styles.actionButtonText, { color: theme.colors.onError }]}>
              Report
            </Text>
          </TouchableOpacity>
        </View>

        {downloadProgress > 0 && (
          <View style={styles.downloadProgressContainer}>
            <View style={[styles.downloadProgressBar, { width: `${downloadProgress}%` }]} />
            <Text style={[styles.downloadProgressText, { color: theme.colors.onSurface }]}>
              Downloading... {downloadProgress}%
            </Text>
          </View>
        )}

        {renderComments()}
      </ScrollView>
      {renderQualityOptions()}
      {renderEnhancedAnalytics()}
    </View>
  );
};

export default MediaSharingScreen; 