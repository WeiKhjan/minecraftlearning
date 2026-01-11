'use client';

import { useState, useCallback, useRef } from 'react';
import type { Locale } from '@/types';

interface UseVoiceTutorOptions {
  locale: Locale;
  onError?: (error: string) => void;
}

interface UseVoiceTutorReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export function useVoiceTutor({ locale, onError }: UseVoiceTutorOptions): UseVoiceTutorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    // Stop any current playback
    stop();
    setError(null);

    const cacheKey = `${locale}:${text}`;

    // Check cache first
    let audioUrl = audioCache.current.get(cacheKey);

    if (!audioUrl) {
      setIsLoading(true);

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, locale }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate speech');
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Convert base64 to blob URL
        const byteCharacters = atob(data.audio);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.mimeType || 'audio/mp3' });
        audioUrl = URL.createObjectURL(blob);

        // Cache the audio URL
        audioCache.current.set(cacheKey, audioUrl);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    }

    // Play the audio
    try {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        setError('Failed to play audio');
      };

      await audio.play();
    } catch (err) {
      setIsSpeaking(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to play audio';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [locale, stop, onError]);

  return {
    speak,
    stop,
    isLoading,
    isSpeaking,
    error,
  };
}
