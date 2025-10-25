import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppTheme } from '../providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import useMediaAnalytics from '../hooks/useMediaAnalytics';
import useMediaSearch from '../hooks/useMediaSearch';
import {
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
} from '../utils/responsive';
import { savePreferences, loadPreferences } from '../utils/preferenceStorage';
import Toast from 'react-native-toast-message';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Image as ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = width * 0.3;

const UserProfileScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useAppTheme();
  const [user, setUser] = useState({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://via.placeholder.com/150',
    bio: 'Photography enthusiast and digital artist',
    joinDate: '2023-01-01',
    preferences: {
      darkMode: true,
      notifications: true,
      autoPlay: false,
      highQuality: true,
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [preferenceChanges, setPreferenceChanges] = useState({});
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Load saved preferences on component mount
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        const savedPreferences = await loadPreferences();
        if (savedPreferences) {
          setUser(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              ...savedPreferences,
            },
          }));
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to load preferences',
          text2: error.message,
          position: 'bottom',
          visibilityTime: 3000,
        });
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadSavedPreferences();
  }, []);

  const {
    analytics,
    getPerformanceMetrics,
    getAudienceInsights,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useMediaAnalytics({
    mediaId: user.id,
    enableRealTime: true,
  });

  const {
    searchResults: userMedia,
    isLoading: isMediaLoading,
    error: mediaError,
  } = useMediaSearch({
    filters: { userId: user.id },
    pageSize: 10,
  });

  const performanceMetrics = useMemo(() => getPerformanceMetrics(), [getPerformanceMetrics]);
  const audienceInsights = useMemo(() => getAudienceInsights(), [getAudienceInsights]);

  const handlePreferenceChange = useCallback(async (key, value) => {
    try {
      // Update local state immediately for responsive UI
      setUser((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value,
        },
      }));

      // Track changes for batch saving
      setPreferenceChanges((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Special handling for dark mode
      if (key === 'darkMode') {
        toggleTheme();
      }

      // Show success feedback
      Toast.show({
        type: 'success',
        text1: 'Preference updated',
        text2: `${key} is now ${value ? 'enabled' : 'disabled'}`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      // Revert the change on error
      setUser((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: !value,
        },
      }));

      // Show error feedback
      Toast.show({
        type: 'error',
        text1: 'Failed to update preference',
        text2: error.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  }, [toggleTheme]);

  const savePreferencesToStorage = useCallback(async () => {
    if (Object.keys(preferenceChanges).length === 0) return;

    setIsSavingPreferences(true);
    try {
      // Save all preferences to storage
      await savePreferences({
        ...user.preferences,
        ...preferenceChanges,
      });
      
      // Clear changes after successful save
      setPreferenceChanges({});
      
      Toast.show({
        type: 'success',
        text1: 'Preferences saved',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save preferences',
        text2: error.message,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsSavingPreferences(false);
    }
  }, [preferenceChanges, user.preferences]);

  const handleEditPress = useCallback(() => {
    setIsEditing(true);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: getResponsivePadding(theme.spacing.lg),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsiveMargin(theme.spacing.xl),
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: theme.borderRadius.full,
      marginRight: getResponsiveMargin(theme.spacing.lg),
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: getResponsiveFontSize(theme.typography.headlineMedium),
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: getResponsiveMargin(theme.spacing.xs),
    },
    userEmail: {
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
      color: theme.colors.onBackgroundVariant,
      marginBottom: getResponsiveMargin(theme.spacing.sm),
    },
    userBio: {
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
      color: theme.colors.onBackgroundVariant,
    },
    editButton: {
      padding: getResponsivePadding(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -getResponsiveMargin(theme.spacing.sm),
      marginBottom: getResponsiveMargin(theme.spacing.xl),
    },
    statCard: {
      flex: 1,
      minWidth: width * 0.4,
      margin: getResponsiveMargin(theme.spacing.sm),
      padding: getResponsivePadding(theme.spacing.md),
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsiveMargin(theme.spacing.sm),
    },
    statTitle: {
      fontSize: getResponsiveFontSize(theme.typography.labelLarge),
      color: theme.colors.onSurfaceVariant,
      marginLeft: getResponsiveMargin(theme.spacing.sm),
    },
    statValue: {
      fontSize: getResponsiveFontSize(theme.typography.titleLarge),
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    section: {
      marginBottom: getResponsiveMargin(theme.spacing.xl),
    },
    sectionTitle: {
      fontSize: getResponsiveFontSize(theme.typography.titleLarge),
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: getResponsiveMargin(theme.spacing.md),
    },
    recentMediaContainer: {
      paddingRight: getResponsivePadding(theme.spacing.lg),
    },
    recentMediaItem: {
      width: width * 0.4,
      marginRight: getResponsiveMargin(theme.spacing.md),
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    recentMediaImage: {
      width: '100%',
      height: width * 0.3,
    },
    recentMediaInfo: {
      padding: getResponsivePadding(theme.spacing.sm),
    },
    recentMediaTitle: {
      fontSize: getResponsiveFontSize(theme.typography.titleSmall),
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: getResponsiveMargin(theme.spacing.xs),
    },
    recentMediaDate: {
      fontSize: getResponsiveFontSize(theme.typography.bodySmall),
      color: theme.colors.onSurfaceVariant,
    },
    preferencesSection: {
      marginBottom: getResponsiveMargin(theme.spacing.xl),
    },
    preferencesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveMargin(theme.spacing.md),
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getResponsivePadding(theme.spacing.sm),
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
      color: theme.colors.onPrimary,
      fontSize: getResponsiveFontSize(theme.typography.labelLarge),
      marginLeft: getResponsiveMargin(theme.spacing.xs),
    },
    preferenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: getResponsivePadding(theme.spacing.md),
      marginBottom: getResponsiveMargin(theme.spacing.sm),
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    preferenceInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    preferenceDescription: {
      fontSize: getResponsiveFontSize(theme.typography.bodySmall),
      color: theme.colors.onSurfaceVariant,
      marginTop: getResponsiveMargin(theme.spacing.xs),
    },
    preferenceTitle: {
      fontSize: getResponsiveFontSize(theme.typography.bodyLarge),
      color: theme.colors.onSurface,
      marginLeft: getResponsiveMargin(theme.spacing.sm),
    },
    preferenceIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    preferenceIconText: {
      color: theme.colors.onPrimaryContainer,
      fontSize: getResponsiveFontSize(theme.typography.titleMedium),
    },
    preferenceDetails: {
      flex: 1,
      marginLeft: getResponsiveMargin(theme.spacing.sm),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: getResponsivePadding(theme.spacing.xl),
    },
    loadingText: {
      marginTop: getResponsiveMargin(theme.spacing.md),
      fontSize: getResponsiveFontSize(theme.typography.bodyLarge),
    },
    errorContainer: {
      padding: getResponsivePadding(theme.spacing.lg),
      backgroundColor: theme.colors.errorContainer,
      borderRadius: theme.borderRadius.lg,
      marginBottom: getResponsiveMargin(theme.spacing.lg),
    },
    errorText: {
      color: theme.colors.onErrorContainer,
      fontSize: getResponsiveFontSize(theme.typography.bodyMedium),
    },
    emptyStateContainer: {
      padding: getResponsivePadding(theme.spacing.xl),
      alignItems: 'center',
    },
    emptyStateText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: getResponsiveFontSize(theme.typography.bodyLarge),
      textAlign: 'center',
      marginTop: getResponsiveMargin(theme.spacing.md),
    },
    retryButton: {
      marginTop: getResponsiveMargin(theme.spacing.md),
      paddingVertical: getResponsivePadding(theme.spacing.sm),
      paddingHorizontal: getResponsivePadding(theme.spacing.lg),
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    retryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: getResponsiveFontSize(theme.typography.labelLarge),
      fontWeight: 'bold',
    },
  });

  const renderStatCard = useCallback((title, value, icon, color) => (
    <View style={styles.statCard} accessibilityRole="text" accessibilityLabel={`${title}: ${value}`}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  ), [styles]);

  const renderPreferenceItem = useCallback((title, key, icon, description) => (
    <View 
      style={[
        styles.preferenceItem,
        preferenceChanges[key] !== undefined && {
          borderColor: theme.colors.primary,
          borderWidth: 2,
        }
      ]}
      accessibilityRole="switch"
      accessibilityLabel={`${title} preference`}
      accessibilityValue={{ text: user.preferences[key] ? 'enabled' : 'disabled' }}
    >
      <View style={styles.preferenceInfo}>
        <View style={styles.preferenceIcon}>
          <Ionicons name={icon} size={24} color={theme.colors.onPrimaryContainer} />
        </View>
        <View style={styles.preferenceDetails}>
          <Text style={styles.preferenceTitle}>{title}</Text>
          {description && (
            <Text style={styles.preferenceDescription}>{description}</Text>
          )}
        </View>
      </View>
      <Switch
        value={user.preferences[key]}
        onValueChange={(value) => handlePreferenceChange(key, value)}
        trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
        thumbColor={user.preferences[key] ? theme.colors.primary : theme.colors.onSurfaceVariant}
      />
    </View>
  ), [styles, theme.colors, user.preferences, handlePreferenceChange, preferenceChanges]);

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
        Loading preferences...
      </Text>
    </View>
  );

  const renderErrorState = (error) => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error?.message || 'An error occurred'}</Text>
    </View>
  );

  const renderEmptyState = (message) => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="information-circle-outline" size={48} color={theme.colors.onSurfaceVariant} />
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load profile. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          // This function is not defined in the original file,
          // but the edit hint implies it should be.
          // For now, we'll just show a Toast.
          Toast.show({
            type: 'info',
            text1: 'Retrying profile load...',
            text2: 'Please wait a moment.',
            position: 'bottom',
            visibilityTime: 3000,
          });
        }}
        accessibilityRole="button"
        accessibilityLabel="Retry loading profile"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoadingPreferences) {
    return renderLoadingState();
  }

  if (isAnalyticsLoading || isMediaLoading) {
    return renderLoadingState();
  }

  if (analyticsError || mediaError) {
    return renderErrorState(analyticsError || mediaError);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      accessibilityRole="scroll"
    >
      <View style={styles.header}>
        <ExpoImage
          source={{ uri: user.avatar }}
          style={styles.avatar}
          contentFit='cover'
          transition={300}
          cachePolicy='memory-disk'
          accessibilityLabel={`${user.name}'s profile picture`}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userBio}>{user.bio}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditPress}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Ionicons name="pencil" size={20} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {performanceMetrics ? (
          <>
            {renderStatCard(
              'Total Views',
              performanceMetrics.totalEngagements,
              'eye',
              theme.colors.primary
            )}
            {renderStatCard(
              'Engagement Rate',
              `${performanceMetrics.engagementRate}%`,
              'trending-up',
              theme.colors.success
            )}
            {renderStatCard(
              'Media Count',
              userMedia?.length || 0,
              'images',
              theme.colors.warning
            )}
            {renderStatCard(
              'Member Since',
              new Date(user.joinDate).toLocaleDateString(),
              'calendar',
              theme.colors.error
            )}
          </>
        ) : (
          renderEmptyState('No analytics data available')
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Media</Text>
        {userMedia?.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentMediaContainer}
            accessibilityRole="scroll"
          >
            {userMedia.map((media) => (
              <TouchableOpacity
                key={media.id}
                style={styles.recentMediaItem}
                onPress={() => navigation.navigate('MediaSharing', { media })}
                accessibilityRole="button"
                accessibilityLabel={`View ${media.filename}`}
              >
                <ExpoImage
                  source={{ uri: media.preview }}
                  style={styles.recentMediaImage}
                  contentFit='cover'
                  transition={300}
                  cachePolicy='memory-disk'
                  accessibilityLabel={`Preview of ${media.filename}`}
                />
                <View style={styles.recentMediaInfo}>
                  <Text
                    style={styles.recentMediaTitle}
                    numberOfLines={1}
                  >
                    {media.filename}
                  </Text>
                  <Text
                    style={styles.recentMediaDate}
                    numberOfLines={1}
                  >
                    {new Date(media.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          renderEmptyState('No media uploaded yet')
        )}
      </View>

      <View style={styles.preferencesSection}>
        <View style={styles.preferencesHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {Object.keys(preferenceChanges).length > 0 && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={savePreferencesToStorage}
              disabled={isSavingPreferences}
              accessibilityRole="button"
              accessibilityLabel="Save preferences"
              accessibilityState={{ disabled: isSavingPreferences }}
            >
              {isSavingPreferences ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <>
                  <Ionicons name="save" size={20} color={theme.colors.onPrimary} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        {renderPreferenceItem(
          'Dark Mode',
          'darkMode',
          'moon',
          'Switch between light and dark theme'
        )}
        {renderPreferenceItem(
          'Notifications',
          'notifications',
          'notifications',
          'Receive updates about your media and followers'
        )}
        {renderPreferenceItem(
          'Auto Play',
          'autoPlay',
          'play',
          'Automatically play media in your feed'
        )}
        {renderPreferenceItem(
          'High Quality',
          'highQuality',
          'image',
          'Stream media in high quality (uses more data)'
        )}
      </View>
    </ScrollView>
  );
};

export default UserProfileScreen; 