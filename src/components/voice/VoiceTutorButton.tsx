'use client';

import { useState } from 'react';
import { useVoiceTutor } from '@/hooks/useVoiceTutor';
import { getAudioUrl } from '@/lib/audio/url-builder';
import type { Locale } from '@/types';

type ContentType = 'letter' | 'word' | 'syllable' | 'sentence' | 'instruction' | 'feedback';

interface VoiceTutorButtonProps {
  // The content to speak about (for AI tutoring) or text to speak directly
  text: string;
  locale: Locale;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  // Content type for AI tutoring context
  contentType?: ContentType;
  // Additional context for AI (e.g., activity name)
  context?: string;
  // If true, skip AI generation and just do direct TTS
  directTTS?: boolean;
  // Pre-generated audio URL - if provided, use this instead of TTS API
  audioUrl?: string;
}

export default function VoiceTutorButton({
  text,
  locale,
  size = 'md',
  className = '',
  showText = false,
  contentType = 'word',
  context,
  directTTS = false,
  audioUrl,
}: VoiceTutorButtonProps) {
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isPlayingPregen, setIsPlayingPregen] = useState(false);
  const [pregenAudio, setPregenAudio] = useState<HTMLAudioElement | null>(null);
  const { speak, speakDirect, stop, isLoading, isSpeaking, error } = useVoiceTutor({
    locale,
    onError: (err) => {
      // If TTS is not configured, hide the button
      if (err.includes('not configured') || err.includes('unavailable')) {
        setIsUnavailable(true);
      }
    }
  });

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const handleClick = () => {
    // Stop any playing audio
    if (isSpeaking) {
      stop();
      return;
    }
    if (isPlayingPregen && pregenAudio) {
      pregenAudio.pause();
      pregenAudio.currentTime = 0;
      setIsPlayingPregen(false);
      return;
    }

    // Try to use pre-generated audio
    // If audioUrl provided, use it; otherwise auto-construct based on contentType
    const pregenAudioUrl = audioUrl || (() => {
      // Map contentType to audio URL builder type
      const typeMap: Record<ContentType, 'syllable' | 'word' | 'phrase' | 'syllable_guide'> = {
        letter: 'syllable',
        syllable: 'syllable',
        word: 'word',
        sentence: 'phrase',
        instruction: 'syllable_guide',
        feedback: 'syllable_guide',
      };
      const audioType = typeMap[contentType] || 'syllable';
      return getAudioUrl(text, audioType, locale);
    })();

    // Try pre-generated audio first
    const audio = new Audio(pregenAudioUrl);
    setPregenAudio(audio);
    setIsPlayingPregen(true);
    audio.onended = () => {
      setIsPlayingPregen(false);
      setPregenAudio(null);
    };
    audio.onerror = () => {
      // Fallback to TTS if pre-generated audio fails (file doesn't exist)
      console.log(`[VoiceTutor] Pre-generated audio not found: ${pregenAudioUrl}, falling back to TTS`);
      setIsPlayingPregen(false);
      setPregenAudio(null);
      if (directTTS) {
        speakDirect(text);
      } else {
        speak(text, { contentType, context });
      }
    };
    audio.play().catch(() => {
      // Handle play() rejection (e.g., user hasn't interacted with page)
      setIsPlayingPregen(false);
      setPregenAudio(null);
      if (directTTS) {
        speakDirect(text);
      } else {
        speak(text, { contentType, context });
      }
    });
  };

  // Don't render if TTS is unavailable
  if (isUnavailable) {
    return null;
  }

  const isPlaying = isSpeaking || isPlayingPregen;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center
        transition-all duration-200
        ${isLoading
          ? 'bg-gray-300 cursor-wait'
          : isPlaying
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : error
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#5DADE2] hover:bg-[#4A9ACF]'
        }
        text-white shadow-md hover:shadow-lg
        disabled:opacity-50
        ${className}
      `}
      title={error ? 'Voice unavailable' : isPlaying ? 'Stop' : 'Listen'}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : isPlaying ? (
        <span>⏹️</span>
      ) : error ? (
        <span className="opacity-50">🔇</span>
      ) : (
        <span>🔊</span>
      )}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isLoading
            ? (locale === 'ms' ? 'Memuatkan...' : locale === 'zh' ? '加载中...' : 'Loading...')
            : isPlaying
              ? (locale === 'ms' ? 'Berhenti' : locale === 'zh' ? '停止' : 'Stop')
              : (locale === 'ms' ? 'Dengar' : locale === 'zh' ? '听' : 'Listen')
          }
        </span>
      )}
    </button>
  );
}
