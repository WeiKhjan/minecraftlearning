'use client';

import { useState, useCallback, useRef } from 'react';
import type { Locale } from '@/types';

type ContentType = 'letter' | 'word' | 'syllable' | 'sentence' | 'instruction' | 'feedback';

interface UseVoiceTutorOptions {
  locale: Locale;
  onError?: (error: string) => void;
}

interface SpeakOptions {
  // Content type for AI tutoring context
  contentType?: ContentType;
  // Additional context (e.g., activity name)
  context?: string;
  // Skip AI generation and just do direct TTS
  directTTS?: boolean;
}

interface UseVoiceTutorReturn {
  // Speak with AI-generated tutoring (2-layer approach)
  speak: (content: string, options?: SpeakOptions) => Promise<void>;
  // Direct TTS without AI generation (for plain text)
  speakDirect: (text: string) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  isSpeaking: boolean;
  error: string | null;
  // The text that was actually spoken (useful for AI-generated content)
  spokenText: string | null;
}

export function useVoiceTutor({ locale, onError }: UseVoiceTutorOptions): UseVoiceTutorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, { url: string; text: string }>>(new Map());

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  // Play audio from base64 data
  const playAudio = useCallback(async (audioData: string, mimeType: string) => {
    const byteCharacters = atob(audioData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType || 'audio/mp3' });
    const audioUrl = URL.createObjectURL(blob);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => {
      setIsSpeaking(false);
      setError('Failed to play audio');
    };

    await audio.play();
    return audioUrl;
  }, []);

  // AI-generated tutoring speech (2-layer: AI text generation -> TTS)
  const speak = useCallback(async (content: string, options?: SpeakOptions) => {
    stop();
    setError(null);

    const { contentType = 'word', context, directTTS = false } = options || {};
    const cacheKey = `tutor:${locale}:${contentType}:${content}:${directTTS}`;

    // Check cache first
    const cached = audioCache.current.get(cacheKey);
    if (cached) {
      setSpokenText(cached.text);
      try {
        const audio = new Audio(cached.url);
        audioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
        return;
      } catch {
        // Cache might be stale, continue to regenerate
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/voice-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType,
          context,
          locale,
          directTTS,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tutoring speech');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSpokenText(data.text || content);
      const audioUrl = await playAudio(data.audio, data.mimeType);

      // Cache the result
      audioCache.current.set(cacheKey, { url: audioUrl, text: data.text || content });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [locale, stop, onError, playAudio]);

  // Direct TTS without AI generation (for plain text that should be read as-is)
  const speakDirect = useCallback(async (text: string) => {
    stop();
    setError(null);

    const cacheKey = `direct:${locale}:${text}`;

    // Check cache first
    const cached = audioCache.current.get(cacheKey);
    if (cached) {
      setSpokenText(cached.text);
      try {
        const audio = new Audio(cached.url);
        audioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
        return;
      } catch {
        // Cache might be stale, continue to regenerate
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSpokenText(text);
      const audioUrl = await playAudio(data.audio, data.mimeType);

      // Cache the result
      audioCache.current.set(cacheKey, { url: audioUrl, text });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [locale, stop, onError, playAudio]);

  return {
    speak,
    speakDirect,
    stop,
    isLoading,
    isSpeaking,
    error,
    spokenText,
  };
}
