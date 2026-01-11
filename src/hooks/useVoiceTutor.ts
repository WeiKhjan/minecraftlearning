'use client';

import { useState, useCallback, useRef } from 'react';
import type { Locale } from '@/types';

type ContentType = 'letter' | 'word' | 'syllable' | 'sentence' | 'instruction' | 'feedback';

// Helper function to convert PCM audio data to WAV format
function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels: number): ArrayBuffer {
  const bytesPerSample = 2; // 16-bit audio
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true); // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Copy PCM data
  const outputArray = new Uint8Array(buffer);
  outputArray.set(pcmData, headerSize);

  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

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
    try {
      console.log('[VoiceTutor] Playing audio, mimeType:', mimeType, 'data length:', audioData?.length);

      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Gemini TTS returns audio/L16 (PCM) format - convert to WAV for browser compatibility
      let blob: Blob;
      if (mimeType === 'audio/L16' || mimeType?.includes('pcm') || mimeType?.includes('L16')) {
        // Convert PCM to WAV
        const wavData = pcmToWav(byteArray, 24000, 1); // 24kHz mono
        blob = new Blob([wavData], { type: 'audio/wav' });
        console.log('[VoiceTutor] Converted PCM to WAV');
      } else {
        blob = new Blob([byteArray], { type: mimeType || 'audio/mp3' });
      }

      const audioUrl = URL.createObjectURL(blob);
      console.log('[VoiceTutor] Audio URL created:', audioUrl);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        console.log('[VoiceTutor] Audio playing');
        setIsSpeaking(true);
      };
      audio.onended = () => {
        console.log('[VoiceTutor] Audio ended');
        setIsSpeaking(false);
      };
      audio.onerror = (e) => {
        console.error('[VoiceTutor] Audio error:', e);
        setIsSpeaking(false);
        setError('Failed to play audio');
      };

      await audio.play();
      return audioUrl;
    } catch (err) {
      console.error('[VoiceTutor] playAudio error:', err);
      throw err;
    }
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
