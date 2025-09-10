import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface VoiceCommand {
  command: string;
  action: string;
  parameters?: any;
}

interface UseVoiceRecognitionOptions {
  onCommand?: (command: VoiceCommand) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const {
    onCommand,
    onError,
    continuous = true,
    language = 'en-US',
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined';

  const {
    transcript: currentTranscript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = isBrowser ? useSpeechRecognition() : {
    transcript: '',
    interimTranscript: '',
    finalTranscript: '',
    resetTranscript: () => {},
    browserSupportsSpeechRecognition: false,
  };

  // Check if browser supports speech recognition
  useEffect(() => {
    setIsSupported(browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  // Update transcript when it changes
  useEffect(() => {
    setTranscript(currentTranscript);
  }, [currentTranscript]);

  // Process final transcript for commands
  useEffect(() => {
    if (finalTranscript) {
      processCommand(finalTranscript);
    }
  }, [finalTranscript]);

  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Voice commands mapping
    const commands: { [key: string]: VoiceCommand } = {
      'add product': {
        command: 'add product',
        action: 'add_product',
      },
      'add two bottles of water': {
        command: 'add two bottles of water',
        action: 'add_product',
        parameters: { product: 'water', quantity: 2 },
      },
      'add three apples': {
        command: 'add three apples',
        action: 'add_product',
        parameters: { product: 'apples', quantity: 3 },
      },
      'generate invoice': {
        command: 'generate invoice',
        action: 'generate_invoice',
      },
      'create invoice': {
        command: 'create invoice',
        action: 'generate_invoice',
      },
      'clear cart': {
        command: 'clear cart',
        action: 'clear_cart',
      },
      'remove item': {
        command: 'remove item',
        action: 'remove_item',
      },
      'calculate total': {
        command: 'calculate total',
        action: 'calculate_total',
      },
      'apply discount': {
        command: 'apply discount',
        action: 'apply_discount',
      },
      'save invoice': {
        command: 'save invoice',
        action: 'save_invoice',
      },
      'print invoice': {
        command: 'print invoice',
        action: 'print_invoice',
      },
    };

    // Find matching command
    const matchedCommand = Object.values(commands).find(cmd => 
      lowerText.includes(cmd.command.toLowerCase())
    );

    if (matchedCommand) {
      onCommand?.(matchedCommand);
    } else {
      // Try to extract product and quantity from natural language
      const addProductMatch = lowerText.match(/add (\d+)?\s*(.+)/);
      if (addProductMatch) {
        const quantity = addProductMatch[1] ? parseInt(addProductMatch[1]) : 1;
        const product = addProductMatch[2].trim();
        
        onCommand?.({
          command: text,
          action: 'add_product',
          parameters: { product, quantity },
        });
      }
    }
  }, [onCommand]);

  const startListening = useCallback(() => {
    if (!isBrowser || !isSupported) {
      onError?.('Speech recognition is not supported in this browser');
      return;
    }

    try {
      SpeechRecognition.startListening({
        continuous,
        language,
      });
      setIsListening(true);
    } catch (error) {
      onError?.('Failed to start voice recognition');
      console.error('Voice recognition error:', error);
    }
  }, [isBrowser, isSupported, continuous, language, onError]);

  const stopListening = useCallback(() => {
    if (!isBrowser) return;
    
    try {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }, [isBrowser]);

  const reset = useCallback(() => {
    resetTranscript();
    setTranscript('');
  }, [resetTranscript]);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}

