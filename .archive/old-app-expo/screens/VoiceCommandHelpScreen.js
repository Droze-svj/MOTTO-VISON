import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

const CommandCategory = ({ title, commands, icon }) => {
  const theme = useTheme();

  return (
    <View style={styles.category}>
      <View style={styles.categoryHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
      </View>
      {commands.map((command, index) => (
        <View
          key={index}
          style={[
            styles.commandItem,
            { borderBottomColor: theme.colors.border },
            index === commands.length - 1 && styles.lastCommandItem,
          ]}
        >
          <Text style={[styles.commandText, { color: theme.colors.text }]}>
            {command.command}
          </Text>
          <Text style={[styles.commandDescription, { color: theme.colors.text + '80' }]}>
            {command.description}
          </Text>
        </View>
      ))}
    </View>
  );
};

const VoiceCommandHelpScreen = ({ navigation }) => {
  const theme = useTheme();

  const commandCategories = [
    {
      title: 'Navigation Commands',
      icon: 'navigate',
      commands: [
        {
          command: 'Go to Home',
          description: 'Navigate to the home screen',
        },
        {
          command: 'Go to Profile',
          description: 'Navigate to your profile screen',
        },
        {
          command: 'Go to Settings',
          description: 'Navigate to the settings screen',
        },
        {
          command: 'Go to Analytics',
          description: 'Navigate to the analytics dashboard',
        },
        {
          command: 'Go to Collections',
          description: 'Navigate to your media collections',
        },
      ],
    },
    {
      title: 'Media Control Commands',
      icon: 'play',
      commands: [
        {
          command: 'Play',
          description: 'Start playing the current media',
        },
        {
          command: 'Pause',
          description: 'Pause the current media',
        },
        {
          command: 'Next',
          description: 'Skip to the next media item',
        },
        {
          command: 'Previous',
          description: 'Go back to the previous media item',
        },
        {
          command: 'Search [query]',
          description: 'Search for media with the specified query',
        },
      ],
    },
    {
      title: 'Collection Commands',
      icon: 'albums',
      commands: [
        {
          command: 'Create Collection',
          description: 'Start creating a new collection',
        },
        {
          command: 'Add to Collection',
          description: 'Add current media to a collection',
        },
        {
          command: 'Show Collections',
          description: 'Display all your collections',
        },
      ],
    },
    {
      title: 'Analytics Commands',
      icon: 'analytics',
      commands: [
        {
          command: 'Show Stats',
          description: 'Display media statistics',
        },
        {
          command: 'Show Performance',
          description: 'Display performance metrics',
        },
        {
          command: 'Show Audience',
          description: 'Display audience insights',
        },
      ],
    },
    {
      title: 'Utility Commands',
      icon: 'settings',
      commands: [
        {
          command: 'Help',
          description: 'Show this help screen',
        },
        {
          command: 'Settings',
          description: 'Open voice command settings',
        },
        {
          command: 'Stop Listening',
          description: 'Stop voice recognition',
        },
      ],
    },
  ];

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
          Voice Command Help
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.intro}>
          <Text style={[styles.introText, { color: theme.colors.text }]}>
            Use voice commands to control MOTTO hands-free. Here are all the available commands:
          </Text>
        </View>

        {commandCategories.map((category, index) => (
          <CommandCategory
            key={index}
            title={category.title}
            commands={category.commands}
            icon={category.icon}
          />
        ))}

        <View style={styles.tips}>
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
            Tips for Better Recognition
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.text + '80' }]}>
            • Speak clearly and at a normal pace
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.text + '80' }]}>
            • Use the exact command phrases
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.text + '80' }]}>
            • Ensure you're in a quiet environment
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.text + '80' }]}>
            • Adjust sensitivity in settings if needed
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('VoiceCommandSettings')}
        >
          <Ionicons name="settings" size={24} color="white" />
          <Text style={styles.settingsButtonText}>Voice Command Settings</Text>
        </TouchableOpacity>
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
  intro: {
    padding: 16,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
  },
  category: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commandItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastCommandItem: {
    borderBottomWidth: 0,
  },
  commandText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  commandDescription: {
    fontSize: 14,
  },
  tips: {
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default VoiceCommandHelpScreen; 