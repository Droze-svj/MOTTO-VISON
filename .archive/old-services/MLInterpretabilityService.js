import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { getDeviceInfo } from './platformService';
import { logSecurityEvent } from '../utils/logger';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

class MLInterpretabilityService {
  constructor() {
    this.advancedMetrics = {
      // Classification Metrics
      balancedAccuracy: true,
      matthewsCorrelation: true,
      cohenKappa: true,
      logLoss: true,
      brierScore: true,
      
      // Regression Metrics
      meanAbsoluteError: true,
      meanSquaredError: true,
      rootMeanSquaredError: true,
      r2Score: true,
      explainedVariance: true,
      
      // Ranking Metrics
      meanAveragePrecision: true,
      normalizedDiscountedCumulativeGain: true,
      meanReciprocalRank: true,
      
      // Clustering Metrics
      silhouetteScore: true,
      calinskiHarabaszScore: true,
      daviesBouldinScore: true,
      
      // Time Series Metrics
      meanAbsolutePercentageError: true,
      meanDirectionalAccuracy: true,
      theilUStatistic: true
    };

    this.interpretabilityMethods = {
      // Feature Importance
      permutationImportance: true,
      shapleyValues: true,
      limeExplanations: true,
      
      // Model Behavior
      partialDependencePlots: true,
      individualConditionalExpectation: true,
      accumulatedLocalEffects: true,
      
      // Decision Path
      decisionTreeVisualization: true,
      activationMaps: true,
      attentionVisualization: true,
      
      // Global Insights
      featureInteractions: true,
      modelSurrogates: true,
      counterfactualExplanations: true
    };
  }

  // Advanced Evaluation Metrics
  async computeBalancedAccuracy(model, data) {
    const predictions = await model.predict(data.xs);
    const balancedAccuracy = tf.metrics.balancedAccuracy(data.ys, predictions);
    return balancedAccuracy.dataSync()[0];
  }

  async computeMatthewsCorrelation(model, data) {
    const predictions = await model.predict(data.xs);
    const matthewsCorrelation = tf.metrics.matthewsCorrelation(data.ys, predictions);
    return matthewsCorrelation.dataSync()[0];
  }

  async computeCohenKappa(model, data) {
    const predictions = await model.predict(data.xs);
    const cohenKappa = tf.metrics.cohenKappa(data.ys, predictions);
    return cohenKappa.dataSync()[0];
  }

  async computeLogLoss(model, data) {
    const predictions = await model.predict(data.xs);
    const logLoss = tf.metrics.logLoss(data.ys, predictions);
    return logLoss.dataSync()[0];
  }

  async computeBrierScore(model, data) {
    const predictions = await model.predict(data.xs);
    const brierScore = tf.metrics.brierScore(data.ys, predictions);
    return brierScore.dataSync()[0];
  }

  async computeMeanAbsoluteError(model, data) {
    const predictions = await model.predict(data.xs);
    const mae = tf.metrics.meanAbsoluteError(data.ys, predictions);
    return mae.dataSync()[0];
  }

  async computeMeanSquaredError(model, data) {
    const predictions = await model.predict(data.xs);
    const mse = tf.metrics.meanSquaredError(data.ys, predictions);
    return mse.dataSync()[0];
  }

  async computeRootMeanSquaredError(model, data) {
    const predictions = await model.predict(data.xs);
    const rmse = tf.metrics.rootMeanSquaredError(data.ys, predictions);
    return rmse.dataSync()[0];
  }

  async computeR2Score(model, data) {
    const predictions = await model.predict(data.xs);
    const r2 = tf.metrics.r2Score(data.ys, predictions);
    return r2.dataSync()[0];
  }

  async computeExplainedVariance(model, data) {
    const predictions = await model.predict(data.xs);
    const explainedVariance = tf.metrics.explainedVariance(data.ys, predictions);
    return explainedVariance.dataSync()[0];
  }

  // Model Interpretability Methods
  async computePermutationImportance(model, data, featureNames) {
    try {
      const importanceScores = {};
      
      for (const feature of featureNames) {
        // Shuffle feature values
        const shuffledData = this.shuffleFeature(data, feature);
        
        // Compute performance with shuffled feature
        const originalScore = await this.computeModelScore(model, data);
        const shuffledScore = await this.computeModelScore(model, shuffledData);
        
        // Importance is the difference in performance
        importanceScores[feature] = originalScore - shuffledScore;
      }
      
      return importanceScores;
    } catch (error) {
      await logSecurityEvent('permutation_importance_computation_failed', error);
      throw error;
    }
  }

  async computeShapleyValues(model, data, backgroundData) {
    try {
      const shapleyValues = {};
      
      // Compute SHAP values for each feature
      for (const feature of Object.keys(data.features)) {
        const shapValue = await this.computeFeatureShapleyValue(
          model,
          data,
          backgroundData,
          feature
        );
        shapleyValues[feature] = shapValue;
      }
      
      return shapleyValues;
    } catch (error) {
      await logSecurityEvent('shapley_values_computation_failed', error);
      throw error;
    }
  }

  async generateLIMEExplanations(model, data, instance) {
    try {
      // Generate local explanations using LIME
      const explanation = await this.computeLIMEExplanation(
        model,
        data,
        instance
      );
      
      return {
        features: explanation.features,
        weights: explanation.weights,
        prediction: explanation.prediction
      };
    } catch (error) {
      await logSecurityEvent('lime_explanation_generation_failed', error);
      throw error;
    }
  }

  async generatePartialDependencePlots(model, data, features) {
    try {
      const plots = {};
      
      for (const feature of features) {
        const plot = await this.computePartialDependence(
          model,
          data,
          feature
        );
        plots[feature] = plot;
      }
      
      return plots;
    } catch (error) {
      await logSecurityEvent('partial_dependence_plot_generation_failed', error);
      throw error;
    }
  }

  async generateIndividualConditionalExpectation(model, data, instance, features) {
    try {
      const icePlots = {};
      
      for (const feature of features) {
        const plot = await this.computeIndividualConditionalExpectation(
          model,
          data,
          instance,
          feature
        );
        icePlots[feature] = plot;
      }
      
      return icePlots;
    } catch (error) {
      await logSecurityEvent('ice_plot_generation_failed', error);
      throw error;
    }
  }

  async generateAccumulatedLocalEffects(model, data, features) {
    try {
      const alePlots = {};
      
      for (const feature of features) {
        const plot = await this.computeAccumulatedLocalEffects(
          model,
          data,
          feature
        );
        alePlots[feature] = plot;
      }
      
      return alePlots;
    } catch (error) {
      await logSecurityEvent('ale_plot_generation_failed', error);
      throw error;
    }
  }

  async visualizeDecisionTree(model) {
    try {
      const treeStructure = await this.extractDecisionTreeStructure(model);
      return this.generateTreeVisualization(treeStructure);
    } catch (error) {
      await logSecurityEvent('decision_tree_visualization_failed', error);
      throw error;
    }
  }

  async generateActivationMaps(model, data) {
    try {
      const activationMaps = await this.computeActivationMaps(model, data);
      return this.visualizeActivationMaps(activationMaps);
    } catch (error) {
      await logSecurityEvent('activation_map_generation_failed', error);
      throw error;
    }
  }

  async visualizeAttention(model, data) {
    try {
      const attentionWeights = await this.computeAttentionWeights(model, data);
      return this.generateAttentionVisualization(attentionWeights);
    } catch (error) {
      await logSecurityEvent('attention_visualization_failed', error);
      throw error;
    }
  }

  async analyzeFeatureInteractions(model, data) {
    try {
      const interactions = await this.computeFeatureInteractions(model, data);
      return this.visualizeFeatureInteractions(interactions);
    } catch (error) {
      await logSecurityEvent('feature_interaction_analysis_failed', error);
      throw error;
    }
  }

  async generateModelSurrogates(model, data) {
    try {
      const surrogateModel = await this.trainSurrogateModel(model, data);
      return this.analyzeSurrogateModel(surrogateModel);
    } catch (error) {
      await logSecurityEvent('model_surrogate_generation_failed', error);
      throw error;
    }
  }

  async generateCounterfactualExplanations(model, data, instance) {
    try {
      const counterfactuals = await this.computeCounterfactuals(
        model,
        data,
        instance
      );
      return this.analyzeCounterfactuals(counterfactuals);
    } catch (error) {
      await logSecurityEvent('counterfactual_explanation_generation_failed', error);
      throw error;
    }
  }

  // Utility Methods
  async computeModelScore(model, data) {
    const predictions = await model.predict(data.xs);
    return tf.metrics.categoricalAccuracy(data.ys, predictions).dataSync()[0];
  }

  shuffleFeature(data, feature) {
    const shuffledData = { ...data };
    const featureValues = [...data.features[feature]];
    this.shuffleArray(featureValues);
    shuffledData.features[feature] = featureValues;
    return shuffledData;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export default new MLInterpretabilityService(); 