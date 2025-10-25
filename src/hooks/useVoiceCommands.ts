/**
 * Advanced Voice Commands Hook
 * Phase 5: Voice command system with natural language processing
 */

import {useState, useCallback, useEffect} from 'react';
import VoiceService from '../services/core/VoiceService';
import CoreAIService from '../services/core/CoreAIService';

interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: number;
}

export function useVoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async () => {
    try {
      setIsListening(true);
      setError(null);
      
      await VoiceService.startListening(async (text) => {
        const command: VoiceCommand = {
          command: text,
          confidence: 0.9,
          timestamp: Date.now()
        };
        
        setLastCommand(command);
        
        // Analyze intent
        const analysis = await CoreAIService.analyzeText(text);
        
        // Execute command based on intent
        await executeCommand(text, analysis.intent);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice recognition failed');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    await VoiceService.stopListening();
    setIsListening(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    await VoiceService.speak(text);
  }, []);

  const executeCommand = async (command: string, intent: string) => {
    // Command execution logic
    console.log(`Executing command: ${command} with intent: ${intent}`);
    
    // Add your custom command handlers here
    if (intent === 'navigation') {
      // Handle navigation commands
    } else if (intent === 'query') {
      // Handle query commands
    }
  };

  return {
    isListening,
    lastCommand,
    error,
    startListening,
    stopListening,
    speak
  };
}

