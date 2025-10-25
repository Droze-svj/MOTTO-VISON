/**
 * PersonalizationProfileScreen
 * Shows user's learning profile and personalization data
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useUserLearning } from '../hooks/useUserLearning';
import ContextMemoryService from '../services/core/ContextMemoryService';

interface PersonalizationProfileScreenProps {
  userId: string;
  onBack?: () => void;
}

export const PersonalizationProfileScreen: React.FC<PersonalizationProfileScreenProps> = ({
  userId,
  onBack
}) => {
  const {
    insights,
    loading,
    suggestedTopics,
    recordFeedback,
    resetLearning,
    exportData,
    getSuggestions,
    refresh
  } = useUserLearning();

  const contextStats = ContextMemoryService.getStats(userId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (insights === null && !loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ Unable to load profile</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noDataText}>
          Start chatting with MOTTO to build your profile! 💬
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Your Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Learning Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${insights.learningProgress}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {insights.learningProgress.toFixed(1)}% Complete
            </Text>
          </View>
          <Text style={styles.cardHint}>
            MOTTO has learned about your preferences!
          </Text>
        </View>

        {/* Communication Style */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 Communication</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Style:</Text>
            <Text style={styles.statValue}>{insights.communicationStyle}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Interactions:</Text>
            <Text style={styles.statValue}>{insights.totalInteractions}</Text>
          </View>
        </View>

        {/* Top Interests */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⭐ Top Interests</Text>
          {insights.favoriteTopics.length > 0 ? (
            insights.favoriteTopics.map((topic, index) => (
              <View key={index} style={styles.interestItem}>
                <Text style={styles.interestNumber}>{index + 1}</Text>
                <Text style={styles.interestText}>{topic}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>
              Chat more to discover your interests!
            </Text>
          )}
        </View>

        {/* Personality Traits */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎨 Personality</Text>
          {insights.personalityTraits.map((trait, index) => (
            <View key={index} style={styles.traitRow}>
              <Text style={styles.traitLabel}>
                {trait}
              </Text>
              <View style={styles.traitBarContainer}>
                <View 
                  style={[
                    styles.traitBar,
                    { width: '70%' }
                  ]}
                />
              </View>
              <Text style={styles.traitScore}>
                7.0
              </Text>
            </View>
          ))}
        </View>

        {/* Conversation Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Conversation Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Messages:</Text>
            <Text style={styles.statValue}>{contextStats.totalMessages}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Your Messages:</Text>
            <Text style={styles.statValue}>{contextStats.userMessages}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>MOTTO's Messages:</Text>
            <Text style={styles.statValue}>{contextStats.assistantMessages}</Text>
          </View>
          {contextStats.topics.length > 0 && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Topics:</Text>
              <Text style={styles.statValue}>
                {contextStats.topics.join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Activity</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Interactions:</Text>
            <Text style={styles.statValue}>
              {insights.totalInteractions || 0}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Topics:</Text>
            <Text style={styles.statValue}>
              {insights.favoriteTopics.length}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Keep chatting to improve personalization!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  cardHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  interestNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  interestText: {
    fontSize: 16,
    color: '#1F2937',
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  traitLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 100,
  },
  traitBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  traitBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  traitScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    width: 30,
    textAlign: 'right',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default PersonalizationProfileScreen;
