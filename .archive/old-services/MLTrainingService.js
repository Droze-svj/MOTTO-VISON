import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { getDeviceInfo } from './platformService';
import { logSecurityEvent } from '../utils/logger';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

class MLTrainingService {
  constructor() {
    this.trainingConfig = {
      batchSize: 32,
      epochs: 100,
      validationSplit: 0.2,
      earlyStoppingPatience: 5,
      learningRate: 0.001
    };

    this.patternRecognitionModels = {
      sequencePatterns: null,
      spatialPatterns: null,
      temporalPatterns: null,
      crossModalPatterns: null,
      anomalyPatterns: null
    };
  }

  async initialize() {
    await this.initializePatternRecognitionModels();
  }

  async initializePatternRecognitionModels() {
    try {
      await tf.ready();

      // Initialize pattern recognition models
      this.patternRecognitionModels.sequencePatterns = await this.createSequencePatternModel();
      this.patternRecognitionModels.spatialPatterns = await this.createSpatialPatternModel();
      this.patternRecognitionModels.temporalPatterns = await this.createTemporalPatternModel();
      this.patternRecognitionModels.crossModalPatterns = await this.createCrossModalPatternModel();
      this.patternRecognitionModels.anomalyPatterns = await this.createAnomalyPatternModel();

      await SecureStore.setItemAsync(
        'pattern_recognition_models_initialized',
        JSON.stringify({ timestamp: Date.now() })
      );
    } catch (error) {
      await logSecurityEvent('pattern_recognition_models_initialization_failed', error);
      throw error;
    }
  }

  // Pattern Recognition Model Architectures
  async createSequencePatternModel() {
    const model = tf.sequential();
    
    // Bidirectional LSTM with attention for sequence patterns
    model.add(tf.layers.bidirectional({
      layer: tf.layers.lstm({
        units: 128,
        returnSequences: true
      })
    }));
    
    model.add(tf.layers.attention({
      units: 64
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(this.trainingConfig.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async createSpatialPatternModel() {
    const model = tf.sequential();
    
    // CNN with spatial attention for pattern recognition
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: [3, 3],
      activation: 'relu',
      inputShape: [224, 224, 3]
    }));
    
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
    
    model.add(tf.layers.conv2d({
      filters: 128,
      kernelSize: [3, 3],
      activation: 'relu'
    }));
    
    model.add(tf.layers.spatialAttention({
      units: 64
    }));
    
    model.add(tf.layers.flatten());
    
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    model.add(tf.layers.dense({
      units: 128,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(this.trainingConfig.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async createTemporalPatternModel() {
    const model = tf.sequential();
    
    // Temporal CNN with LSTM for time series patterns
    model.add(tf.layers.conv1d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      inputShape: [100, 32]
    }));
    
    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
    
    model.add(tf.layers.lstm({
      units: 128,
      returnSequences: true
    }));
    
    model.add(tf.layers.temporalAttention({
      units: 64
    }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(this.trainingConfig.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async createCrossModalPatternModel() {
    const model = tf.sequential();
    
    // Multi-modal fusion model for cross-modal patterns
    model.add(tf.layers.multiModalFusion({
      modalities: ['visual', 'audio', 'text'],
      fusionType: 'attention'
    }));
    
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(this.trainingConfig.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async createAnomalyPatternModel() {
    const model = tf.sequential();
    
    // Autoencoder with attention for anomaly detection
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu',
      inputShape: [512]
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu'
    }));
    
    model.add(tf.layers.attention({
      units: 64
    }));
    
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 512,
      activation: 'sigmoid'
    }));

    model.compile({
      optimizer: tf.train.adam(this.trainingConfig.learningRate),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    return model;
  }

  // Model Training Methods
  async trainModel(model, trainingData, validationData, callbacks = {}) {
    try {
      const {
        onEpochEnd,
        onBatchEnd,
        onTrainEnd
      } = callbacks;

      const trainingConfig = {
        ...this.trainingConfig,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            await this.logTrainingProgress(epoch, logs);
            if (onEpochEnd) await onEpochEnd(epoch, logs);
          },
          onBatchEnd: async (batch, logs) => {
            if (onBatchEnd) await onBatchEnd(batch, logs);
          },
          onTrainEnd: async (logs) => {
            await this.saveModelCheckpoint(model);
            if (onTrainEnd) await onTrainEnd(logs);
          }
        }
      };

      const history = await model.fit(
        trainingData.xs,
        trainingData.ys,
        trainingConfig
      );

      return history;
    } catch (error) {
      await logSecurityEvent('model_training_failed', error);
      throw error;
    }
  }

  async fineTuneModel(model, fineTuningData, callbacks = {}) {
    try {
      // Unfreeze layers for fine-tuning
      model.layers.forEach(layer => {
        layer.trainable = true;
      });

      // Recompile model with lower learning rate
      model.compile({
        optimizer: tf.train.adam(this.trainingConfig.learningRate * 0.1),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Fine-tune model
      const history = await this.trainModel(model, fineTuningData, null, callbacks);

      return history;
    } catch (error) {
      await logSecurityEvent('model_fine_tuning_failed', error);
      throw error;
    }
  }

  // Pattern Recognition Methods
  async recognizeSequencePatterns(sequenceData) {
    try {
      const model = this.patternRecognitionModels.sequencePatterns;
      const prediction = await model.predict(sequenceData);
      return prediction;
    } catch (error) {
      await logSecurityEvent('sequence_pattern_recognition_failed', error);
      throw error;
    }
  }

  async recognizeSpatialPatterns(spatialData) {
    try {
      const model = this.patternRecognitionModels.spatialPatterns;
      const prediction = await model.predict(spatialData);
      return prediction;
    } catch (error) {
      await logSecurityEvent('spatial_pattern_recognition_failed', error);
      throw error;
    }
  }

  async recognizeTemporalPatterns(temporalData) {
    try {
      const model = this.patternRecognitionModels.temporalPatterns;
      const prediction = await model.predict(temporalData);
      return prediction;
    } catch (error) {
      await logSecurityEvent('temporal_pattern_recognition_failed', error);
      throw error;
    }
  }

  async recognizeCrossModalPatterns(multiModalData) {
    try {
      const model = this.patternRecognitionModels.crossModalPatterns;
      const prediction = await model.predict(multiModalData);
      return prediction;
    } catch (error) {
      await logSecurityEvent('cross_modal_pattern_recognition_failed', error);
      throw error;
    }
  }

  async detectAnomalies(data) {
    try {
      const model = this.patternRecognitionModels.anomalyPatterns;
      const reconstruction = await model.predict(data);
      const anomalyScore = this.computeAnomalyScore(data, reconstruction);
      return {
        isAnomaly: anomalyScore > this.anomalyThreshold,
        score: anomalyScore
      };
    } catch (error) {
      await logSecurityEvent('anomaly_detection_failed', error);
      throw error;
    }
  }

  // Utility Methods
  async logTrainingProgress(epoch, logs) {
    await logSecurityEvent('training_progress', {
      epoch,
      loss: logs.loss,
      accuracy: logs.acc,
      valLoss: logs.val_loss,
      valAccuracy: logs.val_acc
    });
  }

  async saveModelCheckpoint(model) {
    try {
      const modelJSON = await model.toJSON();
      await SecureStore.setItemAsync(
        'model_checkpoint',
        JSON.stringify({
          model: modelJSON,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      await logSecurityEvent('model_checkpoint_save_failed', error);
      throw error;
    }
  }

  computeAnomalyScore(original, reconstruction) {
    return tf.tidy(() => {
      const diff = tf.sub(original, reconstruction);
      const squaredDiff = tf.square(diff);
      return tf.mean(squaredDiff).dataSync()[0];
    });
  }
}

export default new MLTrainingService(); 