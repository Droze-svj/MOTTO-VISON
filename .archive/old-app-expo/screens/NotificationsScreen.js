import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';
import SkeletonLoader from '../components/common/SkeletonLoader';

const NotificationCategory = ({ title, description, icon, enabled, onToggle }) => {
  const theme = useTheme();

  return (
    <View style={[styles.categoryContainer, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.categoryHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.categoryDescription, { color: theme.colors.text + '80' }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
      />
    </View>
  );
};

const NotificationsScreen = ({ navigation }) => {
  const theme = useTheme();
  const {
    permissions,
    settings,
    loading,
    error,
    requestPermissions,
    updateSettings,
  } = useNotifications();

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggle = async (key) => {
    try {
      const newSettings = {
        ...localSettings,
        [key]: !localSettings[key],
      };
      setLocalSettings(newSettings);
      await updateSettings(newSettings);
    } catch (err) {
      Alert.alert('Error', 'Failed to update notification settings');
      setLocalSettings(settings); // Revert on error
    }
  };

  const handleRequestPermissions = async () => {
    try {
      await requestPermissions();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText} accessibilityRole="alert">
        {error || 'Unable to load notifications. Please check your connection.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRequestPermissions}
        accessibilityRole="button"
        accessibilityLabel="Retry loading notifications"
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !settings) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return renderError();
  }

  if (!permissions || permissions !== 'granted') {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="notifications-off" size={64} color={theme.colors.text + '40'} />
        <Text style={[styles.permissionText, { color: theme.colors.text }]}>
          Enable notifications to stay updated with your media activity
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleRequestPermissions}
        >
          <Text style={styles.permissionButtonText}>Enable Notifications</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && (!settings || settings.length === 0)) {
    return (
      <View style={styles.container}>
        <SkeletonLoader rows={8} height={40} style={{ marginBottom: 12 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Push Notifications
          </Text>
          <NotificationCategory
            title="Messages"
            description="Get notified when you receive new messages"
            icon="chatbubble-outline"
            enabled={localSettings.messages}
            onToggle={() => handleToggle('messages')}
          />
          <NotificationCategory
            title="Media Updates"
            description="Stay updated with your media performance"
            icon="images-outline"
            enabled={localSettings.mediaUpdates}
            onToggle={() => handleToggle('mediaUpdates')}
          />
          <NotificationCategory
            title="Security Alerts"
            description="Get notified about security-related events"
            icon="shield-outline"
            enabled={localSettings.securityAlerts}
            onToggle={() => handleToggle('securityAlerts')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Social Interactions
          </Text>
          <NotificationCategory
            title="Mentions"
            description="Get notified when someone mentions you"
            icon="at-outline"
            enabled={localSettings.mentions}
            onToggle={() => handleToggle('mentions')}
          />
          <NotificationCategory
            title="Comments"
            description="Get notified about new comments on your media"
            icon="chatbubble-ellipses-outline"
            enabled={localSettings.comments}
            onToggle={() => handleToggle('comments')}
          />
          <NotificationCategory
            title="Likes"
            description="Get notified when someone likes your media"
            icon="heart-outline"
            enabled={localSettings.likes}
            onToggle={() => handleToggle('likes')}
          />
          <NotificationCategory
            title="Follows"
            description="Get notified when someone follows you"
            icon="person-add-outline"
            enabled={localSettings.follows}
            onToggle={() => handleToggle('follows')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Other
          </Text>
          <NotificationCategory
            title="Marketing"
            description="Receive updates about new features and promotions"
            icon="megaphone-outline"
            enabled={localSettings.marketing}
            onToggle={() => handleToggle('marketing')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
  },
});

export default NotificationsScreen; 