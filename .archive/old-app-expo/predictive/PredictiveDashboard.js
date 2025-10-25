import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import PredictiveIntelligenceService from '../../services/PredictiveIntelligenceService';
import MetricsService from '../../services/MetricsService';

const PredictiveDashboard = ({ onClose }) => {
  const [predictions, setPredictions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [predictionData, setPredictionData] = useState('');
  const [patternData, setPatternData] = useState('');
  const [selectedPredictionType, setSelectedPredictionType] = useState('trend');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('correlation');

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = async () => {
    try {
      // Load sample data for demonstration
      const sampleData = generateSampleData();
      
      // Generate predictions
      const predictionResult = await PredictiveIntelligenceService.generateForecast(
        sampleData,
        'trend',
        10
      );
      setPredictions([predictionResult]);
      
      // Recognize patterns
      const patternResult = await PredictiveIntelligenceService.recognizePatterns(
        sampleData
      );
      setPatterns(patternResult.patterns);
      
      // Generate recommendations
      const recommendationResult = await PredictiveIntelligenceService.generateRecommendations(
        sampleData
      );
      setRecommendations(recommendationResult.recommendations);
      
    } catch (error) {
      console.error('Error loading predictive data:', error);
      Alert.alert('Error', 'Failed to load predictive data');
    }
  };

  const generateSampleData = () => {
    // Generate sample data for demonstration
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push(Math.random() * 100 + 50 + i * 2);
    }
    return data;
  };

  const handleGeneratePrediction = async () => {
    if (!predictionData.trim()) {
      Alert.alert('Error', 'Please enter data for prediction');
      return;
    }

    try {
      const data = predictionData.split(',').map(Number);
      const result = await PredictiveIntelligenceService.generateForecast(
        data,
        selectedPredictionType,
        10
      );
      
      setPredictions(prev => [result, ...prev]);
      setShowPredictionModal(false);
      setPredictionData('');
      
      Alert.alert('Success', 'Prediction generated successfully');
    } catch (error) {
      console.error('Error generating prediction:', error);
      Alert.alert('Error', 'Failed to generate prediction');
    }
  };

  const handleRecognizePatterns = async () => {
    if (!patternData.trim()) {
      Alert.alert('Error', 'Please enter data for pattern recognition');
      return;
    }

    try {
      const data = patternData.split(',').map(Number);
      const result = await PredictiveIntelligenceService.recognizePatterns(data);
      
      setPatterns(prev => [...result.patterns, ...prev]);
      setShowPatternModal(false);
      setPatternData('');
      
      Alert.alert('Success', `Found ${result.patterns.length} patterns`);
    } catch (error) {
      console.error('Error recognizing patterns:', error);
      Alert.alert('Error', 'Failed to recognize patterns');
    }
  };

  const renderPrediction = ({ item }) => (
    <View style={styles.predictionCard}>
      <View style={styles.predictionHeader}>
        <Text style={styles.predictionTitle}>{item.type.toUpperCase()} Forecast</Text>
        <Text style={styles.predictionConfidence}>
          Confidence: {(item.confidence * 100).toFixed(1)}%
        </Text>
      </View>
      
      <Text style={styles.predictionModel}>Model: {item.model}</Text>
      <Text style={styles.predictionHorizon}>Horizon: {item.horizon} periods</Text>
      
      <View style={styles.predictionValues}>
        <Text style={styles.predictionValuesTitle}>Forecast Values:</Text>
        {item.forecast.values.slice(0, 5).map((value, index) => (
          <Text key={index} style={styles.predictionValue}>
            Period {index + 1}: {value.value?.toFixed(2) || value.predictedAction || value.demand?.toFixed(2) || value.risk?.toFixed(2)}
          </Text>
        ))}
        {item.forecast.values.length > 5 && (
          <Text style={styles.predictionValue}>... and {item.forecast.values.length - 5} more</Text>
        )}
      </View>
      
      <Text style={styles.predictionTimestamp}>
        Generated: {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  const renderPattern = ({ item }) => (
    <View style={styles.patternCard}>
      <View style={styles.patternHeader}>
        <Text style={styles.patternTitle}>{item.type.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.patternConfidence}>
          Confidence: {(item.confidence * 100).toFixed(1)}%
        </Text>
      </View>
      
      <Text style={styles.patternDescription}>{item.description}</Text>
      
      {item.direction && (
        <Text style={styles.patternDirection}>Direction: {item.direction}</Text>
      )}
      
      {item.strength && (
        <Text style={styles.patternStrength}>Strength: {item.strength.toFixed(2)}</Text>
      )}
      
      {item.period && (
        <Text style={styles.patternPeriod}>Period: {item.period}</Text>
      )}
    </View>
  );

  const renderRecommendation = ({ item }) => (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationTitle}>{item.title}</Text>
        <Text style={styles.recommendationConfidence}>
          Confidence: {(item.confidence * 100).toFixed(1)}%
        </Text>
      </View>
      
      <Text style={styles.recommendationDescription}>{item.description}</Text>
      
      <View style={styles.recommendationFooter}>
        <Text style={styles.recommendationType}>Type: {item.type}</Text>
        <Text style={styles.recommendationAction}>Action: {item.action}</Text>
      </View>
    </View>
  );

  const renderPredictionModal = () => (
    <Modal
      visible={showPredictionModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Generate Prediction</Text>
          
          <Text style={styles.modalLabel}>Prediction Type:</Text>
          <View style={styles.typeSelector}>
            {['trend', 'behavior', 'performance', 'demand', 'risk'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedPredictionType === type && styles.typeButtonSelected
                ]}
                onPress={() => setSelectedPredictionType(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  selectedPredictionType === type && styles.typeButtonTextSelected
                ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.modalLabel}>Data (comma-separated numbers):</Text>
          <TextInput
            style={styles.modalInput}
            value={predictionData}
            onChangeText={setPredictionData}
            placeholder="e.g., 10, 15, 20, 25, 30"
            multiline
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowPredictionModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleGeneratePrediction}
            >
              <Text style={styles.modalButtonText}>Generate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPatternModal = () => (
    <Modal
      visible={showPatternModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Recognize Patterns</Text>
          
          <Text style={styles.modalLabel}>Analysis Type:</Text>
          <View style={styles.typeSelector}>
            {['correlation', 'regression', 'clustering', 'anomaly'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedAnalysisType === type && styles.typeButtonSelected
                ]}
                onPress={() => setSelectedAnalysisType(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  selectedAnalysisType === type && styles.typeButtonTextSelected
                ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.modalLabel}>Data (comma-separated numbers):</Text>
          <TextInput
            style={styles.modalInput}
            value={patternData}
            onChangeText={setPatternData}
            placeholder="e.g., 10, 15, 20, 25, 30"
            multiline
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowPatternModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleRecognizePatterns}
            >
              <Text style={styles.modalButtonText}>Analyze</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Predictive Intelligence</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPredictionModal(true)}
          >
            <Text style={styles.actionButtonText}>Generate Prediction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPatternModal(true)}
          >
            <Text style={styles.actionButtonText}>Recognize Patterns</Text>
          </TouchableOpacity>
        </View>

        {/* Predictions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Predictions ({predictions.length})</Text>
          <FlatList
            data={predictions}
            renderItem={renderPrediction}
            keyExtractor={(item, index) => `prediction_${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        </View>

        {/* Patterns Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patterns ({patterns.length})</Text>
          <FlatList
            data={patterns}
            renderItem={renderPattern}
            keyExtractor={(item, index) => `pattern_${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        </View>

        {/* Recommendations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations ({recommendations.length})</Text>
          <FlatList
            data={recommendations}
            renderItem={renderRecommendation}
            keyExtractor={(item, index) => `recommendation_${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      {renderPredictionModal()}
      {renderPatternModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.45,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  horizontalList: {
    marginBottom: 10,
  },
  predictionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  predictionConfidence: {
    fontSize: 12,
    color: '#888',
  },
  predictionModel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  predictionHorizon: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  predictionValues: {
    marginBottom: 8,
  },
  predictionValuesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  predictionTimestamp: {
    fontSize: 10,
    color: '#666',
  },
  patternCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 250,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  patternConfidence: {
    fontSize: 12,
    color: '#888',
  },
  patternDescription: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  patternDirection: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 4,
  },
  patternStrength: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 4,
  },
  patternPeriod: {
    fontSize: 12,
    color: '#9C27B0',
  },
  recommendationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 260,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  recommendationConfidence: {
    fontSize: 12,
    color: '#888',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendationType: {
    fontSize: 12,
    color: '#888',
  },
  recommendationAction: {
    fontSize: 12,
    color: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  typeButtonTextSelected: {
    color: '#ffffff',
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 16,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 0.4,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#333',
  },
  modalButtonConfirm: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PredictiveDashboard;
