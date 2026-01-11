'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  locale?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface SpeechRecognitionResult {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: {
    isFinal: boolean;
    [index: number]: {
      transcript: string;
      confidence: number;
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

// Language code mapping
const localeToLang: Record<string, string> = {
  ms: 'ms-MY', // Malay (Malaysia)
  zh: 'zh-CN', // Chinese (Simplified)
  en: 'en-US', // English (US)
};

export function useSpeechRecognition({
  locale = 'ms',
  continuous = false,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}): SpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const interimTranscriptRef = useRef<string>('');
  const hasCalledResultRef = useRef<boolean>(false);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = localeToLang[locale] || 'ms-MY';
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [locale, continuous]);

  const startListening = useCallback(() => {
    // Check browser support
    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognitionAPI) {
      const msg = 'Speech recognition not supported in this browser';
      console.error(msg);
      setError(msg);
      onError?.(msg);
      return;
    }

    setError(null);
    setTranscript('');
    interimTranscriptRef.current = '';
    hasCalledResultRef.current = false;

    // Abort any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

    // Create a fresh instance each time for reliability
    try {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = localeToLang[locale] || 'ms-MY';

      recognitionRef.current.onstart = () => {
        console.log('[SpeechRecognition] Started listening');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        // Store interim results for fallback
        if (interimTranscript) {
          interimTranscriptRef.current = interimTranscript.trim().toLowerCase();
          console.log('[SpeechRecognition] Interim:', interimTranscriptRef.current);
          setTranscript(interimTranscriptRef.current);
        }

        if (finalTranscript) {
          const finalText = finalTranscript.trim().toLowerCase();
          console.log('[SpeechRecognition] Final result:', finalText);
          setTranscript(finalText);
          hasCalledResultRef.current = true;
          onResult?.(finalText);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('[SpeechRecognition] Error:', event.error);
        let errorMessage: string;

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Check your internet connection.';
            break;
          case 'aborted':
            // Don't show error for user-initiated abort
            setIsListening(false);
            return;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        setError(errorMessage);
        setIsListening(false);
        onError?.(errorMessage);
      };

      recognitionRef.current.onend = () => {
        console.log('[SpeechRecognition] Ended');
        setIsListening(false);

        // If we have interim results but no final result was called, use interim
        if (!hasCalledResultRef.current && interimTranscriptRef.current) {
          console.log('[SpeechRecognition] Using interim result as final:', interimTranscriptRef.current);
          onResult?.(interimTranscriptRef.current);
        }
      };

      recognitionRef.current.start();
      console.log('[SpeechRecognition] Start called, lang:', localeToLang[locale]);
    } catch (err) {
      console.error('[SpeechRecognition] Start error:', err);
      const errorMessage = err instanceof Error
        ? `Failed to start: ${err.message}`
        : 'Failed to start speech recognition';
      setError(errorMessage);
      setIsListening(false);
      onError?.(errorMessage);
    }
  }, [locale, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
