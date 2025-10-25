/**
 * Personalization Screen
 * Shows user learning insights and personalization settings
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useUserLearning} from '../hooks/useUserLearning';

const PersonalizationScreen: React.FC = () => {
  const {
    insights,
    loading,
    suggestedTopics,
    resetLearning,
    exportData,
    getSuggestions,
    refresh
  } = useUserLearning();

  const [refreshing, setRefreshing] = useState(false);
  const [predictedQuestions, setPredictedQuestions] = useState<string[]>([]);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = () => {
    const predictions = getSuggestions();
    setPredictedQuestions(predictions);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    loadPredictions();
    setRefreshing(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Learning Data',
      'This will erase all personalization. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetLearning();
            Alert.alert('Success', 'Learning data has been reset');
          }
        }
      ]
    );
  };

  const handleExport = async () => {
    const data = await exportData();
    Alert.alert('Export Data', `Data length: ${data.length} characters`);
    // In production, implement actual export/sharing
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your MOTTO Profile</Text>
        <Text style={styles.subtitle}>
          {insights?.totalInteractions || 0} conversations
        </Text>
      </View>

      {/* Learning Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Learning Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              {width: `${insights?.learningProgress || 0}%`}
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {insights?.learningProgress || 0}% Complete
        </Text>
        {(insights?.learningProgress || 0) < 100 && (
          <Text style={styles.helpText}>
            Keep chatting! I'm learning more about you with each conversation.
          </Text>
        )}
      </View>

      {/* Communication Style */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Communication Style</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {insights?.communicationStyle || 'Learning...'}
          </Text>
        </View>
        <Text style={styles.helpText}>
          I adapt my responses to match your preferred style
        </Text>
      </View>

      {/* Personality Traits */}
      {insights?.personalityTraits && insights.personalityTraits.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Traits</Text>
          <View style={styles.traitsContainer}>
            {insights.personalityTraits.map((trait, index) => (
              <View key={index} style={styles.traitBadge}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Favorite Topics */}
      {suggestedTopics.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Topics You Love</Text>
          <View style={styles.topicsContainer}>
            {suggestedTopics.map((topic, index) => (
              <View key={index} style={styles.topicChip}>
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Predicted Questions */}
      {predictedQuestions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Questions You Might Ask</Text>
          {predictedQuestions.map((question, index) => (
            <View key={index} style={styles.questionItem}>
              <Text style={styles.questionText}>• {question}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recommendations</Text>
          {insights.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>💡 {rec}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
          <Text style={styles.actionButtonText}>Export Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleReset}
        >
          <Text style={[styles.actionButtonText, styles.dangerText]}>
            Reset Learning
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔒 Your data is stored locally and never leaves your device
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 24,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  helpText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  traitText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  topicText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  questionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  questionText: {
    fontSize: 15,
    color: '#333',
  },
  recommendationItem: {
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    marginTop: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  dangerText: {
    color: '#F44336',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});

export default PersonalizationScreen;
