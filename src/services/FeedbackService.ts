/**
 * Feedback Service
 * Handles beta feedback submission and collection
 */

import { API_CONFIG, buildApiUrl, API_ENDPOINTS } from '../config/api';

export interface FeedbackData {
  name?: string;
  email?: string;
  rating: number;
  message: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
    deviceModel?: string;
  };
  attachments?: string[]; // Base64 encoded screenshots
}

export interface FeedbackResponse {
  success: boolean;
  feedbackId?: string;
  message: string;
}

class FeedbackService {
  private feedbackEndpoint = '/api/feedback';

  /**
   * Submit feedback from user
   */
  async submitFeedback(data: FeedbackData): Promise<FeedbackResponse> {
    try {
      const response = await fetch(buildApiUrl(this.feedbackEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...API_CONFIG.headers,
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Feedback submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        feedbackId: result.id,
        message: 'Feedback submitted successfully!',
      };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit feedback',
      };
    }
  }

  /**
   * Get device information automatically
   */
  getDeviceInfo(): FeedbackData['deviceInfo'] {
    const { Platform, NativeModules } = require('react-native');
    
    return {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      appVersion: require('../../../package.json').version || '1.0.0',
      deviceModel: NativeModules?.PlatformConstants?.model || 'Unknown',
    };
  }

  /**
   * Quick feedback submission
   */
  async submitQuickFeedback(
    message: string,
    rating: number,
    category: FeedbackData['category'] = 'other'
  ): Promise<FeedbackResponse> {
    const deviceInfo = this.getDeviceInfo();
    
    return this.submitFeedback({
      message,
      rating,
      category,
      deviceInfo,
    });
  }

  /**
   * Submit bug report
   */
  async submitBugReport(
    description: string,
    stepsToReproduce?: string,
    screenshots?: string[]
  ): Promise<FeedbackResponse> {
    const deviceInfo = this.getDeviceInfo();
    
    return this.submitFeedback({
      message: `Bug Report:\n\nDescription: ${description}\n\nSteps to Reproduce:\n${stepsToReproduce || 'N/A'}`,
      rating: 0, // Bugs don't have ratings
      category: 'bug',
      deviceInfo,
      attachments: screenshots,
    });
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;

