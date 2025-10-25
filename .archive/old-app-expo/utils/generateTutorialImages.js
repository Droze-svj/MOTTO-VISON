import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import {
  getResponsiveFontSize,
  getResponsivePadding,
  getResponsiveMargin,
  SPACING,
  BORDER_RADIUS,
} from './responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animation configurations
const ANIMATION_CONFIGS = {
  pulse: {
    duration: 2000,
    easing: Easing.inOut(Easing.ease),
  },
  slide: {
    duration: 500,
    easing: Easing.out(Easing.cubic),
  },
  fade: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  },
  scale: {
    duration: 400,
    easing: Easing.out(Easing.back(1.5)),
  },
};

// Theme configurations
const THEMES = {
  light: {
    background: '#FFFFFF',
    primary: '#007AFF',
    secondary: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
  },
  dark: {
    background: '#1C1C1E',
    primary: '#0A84FF',
    secondary: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
  },
  custom: {
    background: '#FFFFFF',
    primary: '#007AFF',
    secondary: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
  },
};

const TutorialImageGenerator = ({ theme = 'light', animationEnabled = true }) => {
  const viewShotRef = React.useRef(null);
  const animations = React.useRef({}).current;
  const currentTheme = THEMES[theme] || THEMES.light;

  // Initialize animations
  React.useEffect(() => {
    if (animationEnabled) {
      animations.pulse = new Animated.Value(1);
      animations.slide = new Animated.Value(0);
      animations.fade = new Animated.Value(0);
      animations.scale = new Animated.Value(0.8);

      // Start animations
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(animations.pulse, {
              ...ANIMATION_CONFIGS.pulse,
              toValue: 1.2,
            }),
            Animated.timing(animations.pulse, {
              ...ANIMATION_CONFIGS.pulse,
              toValue: 1,
            }),
          ])
        ),
        Animated.timing(animations.slide, {
          ...ANIMATION_CONFIGS.slide,
          toValue: 1,
        }),
        Animated.timing(animations.fade, {
          ...ANIMATION_CONFIGS.fade,
          toValue: 1,
        }),
        Animated.timing(animations.scale, {
          ...ANIMATION_CONFIGS.scale,
          toValue: 1,
        }),
      ]).start();
    }
  }, [animationEnabled]);

  const generateImages = async (options = {}) => {
    const {
      format = 'png',
      quality = 1,
      width = SCREEN_WIDTH * 0.8,
      height = SCREEN_WIDTH * 0.8,
      backgroundColor = currentTheme.background,
    } = options;

    const images = [
      {
        name: 'welcome',
        component: (
          <Animated.View
            style={[
              styles.container,
              {
                backgroundColor,
                transform: [
                  { scale: animations.scale },
                  { translateY: animations.slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })},
                ],
                opacity: animations.fade,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: animations.pulse }],
                },
              ]}
            >
              <Ionicons name="mic-outline" size={80} color={currentTheme.primary} />
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    borderColor: currentTheme.primary,
                    transform: [{ scale: animations.pulse }],
                  },
                ]}
              />
            </Animated.View>
            <Animated.Text
              style={[
                styles.title,
                { color: currentTheme.text },
                {
                  opacity: animations.fade,
                  transform: [{ translateY: animations.slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })}],
                },
              ]}
            >
              Welcome to Voice Commands
            </Animated.Text>
            <Animated.Text
              style={[
                styles.subtitle,
                { color: currentTheme.textSecondary },
                {
                  opacity: animations.fade,
                  transform: [{ translateY: animations.slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })}],
                },
              ]}
            >
              Control your app with simple voice commands
            </Animated.Text>
            <Animated.View
              style={[
                styles.waveform,
                {
                  opacity: animations.fade,
                  transform: [{ translateY: animations.slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })}],
                },
              ]}
            >
              {[...Array(7)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveformBar,
                    {
                      height: 20 + i * 10,
                      backgroundColor: currentTheme.primary,
                      opacity: 0.2 + i * 0.15,
                      transform: [{ scale: animations.pulse }],
                    },
                  ]}
                />
              ))}
            </Animated.View>
            <Animated.View
              style={[
                styles.floatingIcons,
                {
                  opacity: animations.fade,
                },
              ]}
            >
              <FloatingIcon
                icon="play"
                delay={0}
                theme={currentTheme}
                animation={animations}
              />
              <FloatingIcon
                icon="home"
                delay={1}
                theme={currentTheme}
                animation={animations}
              />
              <FloatingIcon
                icon="settings"
                delay={2}
                theme={currentTheme}
                animation={animations}
              />
            </Animated.View>
          </Animated.View>
        ),
      },
      {
        name: 'navigation',
        component: (
          <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="navigate-outline" size={80} color="#007AFF" />
            </View>
            <Text style={styles.title}>Navigation Commands</Text>
            <View style={styles.commandList}>
              <CommandItem icon="home-outline" text="Go to Home" />
              <CommandItem icon="person-outline" text="Go to Profile" />
              <CommandItem icon="settings-outline" text="Go to Settings" />
              <CommandItem icon="search-outline" text="Search" />
              <CommandItem icon="notifications-outline" text="Notifications" />
            </View>
            <View style={styles.navigationMap}>
              <View style={styles.mapNode}>
                <Ionicons name="home" size={24} color="#007AFF" />
              </View>
              <View style={styles.mapLine} />
              <View style={styles.mapNode}>
                <Ionicons name="person" size={24} color="#007AFF" />
              </View>
              <View style={styles.mapLine} />
              <View style={styles.mapNode}>
                <Ionicons name="settings" size={24} color="#007AFF" />
              </View>
            </View>
          </View>
        ),
      },
      {
        name: 'media',
        component: (
          <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="play-outline" size={80} color="#007AFF" />
            </View>
            <Text style={styles.title}>Media Controls</Text>
            <View style={styles.mediaPlayer}>
              <View style={styles.albumArt}>
                <Ionicons name="musical-notes" size={40} color="#007AFF" />
              </View>
              <View style={styles.mediaInfo}>
                <Text style={styles.songTitle}>Current Song</Text>
                <Text style={styles.artistName}>Artist Name</Text>
              </View>
            </View>
            <View style={styles.mediaControls}>
              <View style={styles.mediaControl}>
                <Ionicons name="play" size={40} color="#007AFF" />
                <Text style={styles.mediaText}>Play</Text>
              </View>
              <View style={styles.mediaControl}>
                <Ionicons name="pause" size={40} color="#007AFF" />
                <Text style={styles.mediaText}>Pause</Text>
              </View>
              <View style={styles.mediaControl}>
                <Ionicons name="skip-forward" size={40} color="#007AFF" />
                <Text style={styles.mediaText}>Next</Text>
              </View>
              <View style={styles.mediaControl}>
                <Ionicons name="volume-high" size={40} color="#007AFF" />
                <Text style={styles.mediaText}>Volume</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: '60%' }]} />
            </View>
          </View>
        ),
      },
      {
        name: 'collections',
        component: (
          <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="folder-outline" size={80} color="#007AFF" />
            </View>
            <Text style={styles.title}>Collection Management</Text>
            <View style={styles.collectionGrid}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={styles.collectionItem}>
                  <View style={styles.collectionIcon}>
                    <Ionicons name="images-outline" size={30} color="#007AFF" />
                  </View>
                  <Text style={styles.collectionText}>Collection {i + 1}</Text>
                  <Text style={styles.collectionCount}>{Math.floor(Math.random() * 20)} items</Text>
                </View>
              ))}
            </View>
            <View style={styles.collectionActions}>
              <ActionButton icon="add" text="Create" />
              <ActionButton icon="search" text="Search" />
              <ActionButton icon="options" text="More" />
            </View>
          </View>
        ),
      },
      {
        name: 'analytics',
        component: (
          <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart-outline" size={80} color="#007AFF" />
            </View>
            <Text style={styles.title}>Analytics & Insights</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                {[...Array(7)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chartBar,
                      {
                        height: `${30 + Math.random() * 50}%`,
                        backgroundColor: '#007AFF',
                        opacity: 0.7,
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>Mon</Text>
                <Text style={styles.chartLabel}>Tue</Text>
                <Text style={styles.chartLabel}>Wed</Text>
                <Text style={styles.chartLabel}>Thu</Text>
                <Text style={styles.chartLabel}>Fri</Text>
                <Text style={styles.chartLabel}>Sat</Text>
                <Text style={styles.chartLabel}>Sun</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <StatItem icon="play" value="1.2K" label="Plays" />
              <StatItem icon="heart" value="450" label="Likes" />
              <StatItem icon="share" value="120" label="Shares" />
            </View>
          </View>
        ),
      },
      {
        name: 'settings',
        component: (
          <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="settings-outline" size={80} color="#007AFF" />
            </View>
            <Text style={styles.title}>Voice Command Settings</Text>
            <View style={styles.settingsList}>
              <SettingItem icon="mic" text="Voice Recognition" enabled />
              <SettingItem icon="volume-high" text="Voice Feedback" enabled />
              <SettingItem icon="language" text="Language" value="English" />
              <SettingItem icon="time" text="Listening Timeout" value="5s" />
              <SettingItem icon="notifications" text="Notifications" enabled />
            </View>
            <View style={styles.settingsActions}>
              <ActionButton icon="save" text="Save" />
              <ActionButton icon="refresh" text="Reset" />
            </View>
          </View>
        ),
      },
      {
        name: 'ready',
        component: (
          <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle-outline" size={80} color="#007AFF" />
              <View style={styles.successRing} />
            </View>
            <Text style={styles.title}>Ready to Start!</Text>
            <Text style={styles.subtitle}>Try saying "help" for available commands</Text>
            <View style={styles.commandBubble}>
              <Text style={styles.commandText}>"Help"</Text>
            </View>
            <View style={styles.quickTips}>
              <TipItem icon="mic" text="Tap the mic button to start" />
              <TipItem icon="hand-left" text="Swipe for quick commands" />
              <TipItem icon="volume-high" text="Voice feedback enabled" />
            </View>
          </View>
        ),
      },
    ];

    for (const image of images) {
      if (viewShotRef.current) {
        try {
          const uri = await viewShotRef.current.capture({
            format,
            quality,
            width,
            height,
            backgroundColor,
          });
          console.log(`Generated ${image.name}.${format}`);
        } catch (error) {
          console.error(`Error generating ${image.name}.${format}:`, error);
        }
      }
    }
  };

  return (
    <ViewShot
      ref={viewShotRef}
      options={{
        format: 'png',
        quality: 1,
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 0.8,
        backgroundColor: currentTheme.background,
      }}
    >
      {images.map((image) => (
        <View key={image.name} style={styles.imageContainer}>
          {image.component}
        </View>
      ))}
    </ViewShot>
  );
};

const FloatingIcon = ({ icon, delay, theme, animation }) => (
  <Animated.View
    style={[
      styles.floatingIcon,
      {
        backgroundColor: theme.background,
        transform: [
          { scale: animation.pulse },
          { translateY: animation.slide.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          })},
        ],
        opacity: animation.fade,
      },
    ]}
  >
    <Ionicons name={icon} size={24} color={theme.primary} />
  </Animated.View>
);

const CommandItem = ({ icon, text }) => (
  <View style={styles.commandItem}>
    <Ionicons name={icon} size={24} color="#007AFF" />
    <Text style={styles.commandText}>{text}</Text>
  </View>
);

const ActionButton = ({ icon, text }) => (
  <View style={styles.actionButton}>
    <Ionicons name={icon} size={24} color="#007AFF" />
    <Text style={styles.actionText}>{text}</Text>
  </View>
);

const SettingItem = ({ icon, text, enabled, value }) => (
  <View style={styles.settingItem}>
    <View style={styles.settingIcon}>
      <Ionicons name={icon} size={24} color="#007AFF" />
    </View>
    <Text style={styles.settingText}>{text}</Text>
    {enabled !== undefined ? (
      <View style={[styles.toggle, enabled && styles.toggleEnabled]} />
    ) : (
      <Text style={styles.settingValue}>{value}</Text>
    )}
  </View>
);

const StatItem = ({ icon, value, label }) => (
  <View style={styles.statItem}>
    <Ionicons name={icon} size={24} color="#007AFF" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const TipItem = ({ icon, text }) => (
  <View style={styles.tipItem}>
    <Ionicons name={icon} size={20} color="#007AFF" />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.8,
    aspectRatio: 1,
    padding: SPACING.large,
    borderRadius: BORDER_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginBottom: SPACING.large,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.large,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#007AFF',
    opacity: 0.3,
  },
  successRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#34C759',
    opacity: 0.3,
  },
  title: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: getResponsiveFontSize(16),
    color: '#666666',
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    marginTop: SPACING.large,
  },
  waveformBar: {
    width: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  floatingIcons: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commandList: {
    width: '100%',
    marginTop: SPACING.medium,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    backgroundColor: '#F5F5F5',
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.small,
  },
  commandText: {
    fontSize: getResponsiveFontSize(16),
    color: '#000000',
    marginLeft: SPACING.small,
  },
  navigationMap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.large,
  },
  mapNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#007AFF',
    marginHorizontal: SPACING.small,
  },
  mediaPlayer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
  },
  mediaInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#000000',
  },
  artistName: {
    fontSize: getResponsiveFontSize(14),
    color: '#666666',
  },
  mediaControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.large,
  },
  mediaControl: {
    alignItems: 'center',
  },
  mediaText: {
    fontSize: getResponsiveFontSize(14),
    color: '#666666',
    marginTop: SPACING.small,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 2,
    marginTop: SPACING.large,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.medium,
  },
  collectionItem: {
    width: '48%',
    aspectRatio: 1.5,
    backgroundColor: '#F5F5F5',
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.medium,
    padding: SPACING.medium,
  },
  collectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.small,
  },
  collectionText: {
    fontSize: getResponsiveFontSize(14),
    color: '#000000',
    marginBottom: SPACING.small,
  },
  collectionCount: {
    fontSize: getResponsiveFontSize(12),
    color: '#666666',
  },
  collectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.medium,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    backgroundColor: '#F5F5F5',
    borderRadius: BORDER_RADIUS.medium,
  },
  actionText: {
    fontSize: getResponsiveFontSize(14),
    color: '#000000',
    marginLeft: SPACING.small,
  },
  chartContainer: {
    width: '100%',
    height: 150,
    marginTop: SPACING.large,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.medium,
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.medium,
    marginTop: SPACING.small,
  },
  chartLabel: {
    fontSize: getResponsiveFontSize(12),
    color: '#666666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.large,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: '600',
    color: '#000000',
    marginTop: SPACING.small,
  },
  statLabel: {
    fontSize: getResponsiveFontSize(12),
    color: '#666666',
    marginTop: SPACING.small,
  },
  settingsList: {
    width: '100%',
    marginTop: SPACING.medium,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    backgroundColor: '#F5F5F5',
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.small,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
  },
  settingText: {
    flex: 1,
    fontSize: getResponsiveFontSize(16),
    color: '#000000',
  },
  settingValue: {
    fontSize: getResponsiveFontSize(14),
    color: '#666666',
  },
  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
    position: 'relative',
  },
  toggleEnabled: {
    backgroundColor: '#007AFF',
  },
  settingsActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.large,
  },
  commandBubble: {
    backgroundColor: '#007AFF20',
    padding: SPACING.medium,
    borderRadius: BORDER_RADIUS.large,
    marginTop: SPACING.large,
  },
  quickTips: {
    width: '100%',
    marginTop: SPACING.large,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  tipText: {
    fontSize: getResponsiveFontSize(14),
    color: '#666666',
    marginLeft: SPACING.small,
  },
});

export default TutorialImageGenerator; 