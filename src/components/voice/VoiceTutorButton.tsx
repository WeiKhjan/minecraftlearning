'use client';

import { useVoiceTutor } from '@/hooks/useVoiceTutor';
import type { Locale } from '@/types';

interface VoiceTutorButtonProps {
  text: string;
  locale: Locale;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export default function VoiceTutorButton({
  text,
  locale,
  size = 'md',
  className = '',
  showText = false,
}: VoiceTutorButtonProps) {
  const { speak, stop, isLoading, isSpeaking } = useVoiceTutor({ locale });

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

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
          : isSpeaking
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-[#5DADE2] hover:bg-[#4A9ACF]'
        }
        text-white shadow-md hover:shadow-lg
        disabled:opacity-50
        ${className}
      `}
      title={isSpeaking ? 'Stop' : 'Listen'}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : isSpeaking ? (
        <span>⏹️</span>
      ) : (
        <span>🔊</span>
      )}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isLoading
            ? (locale === 'ms' ? 'Memuatkan...' : locale === 'zh' ? '加载中...' : 'Loading...')
            : isSpeaking
              ? (locale === 'ms' ? 'Berhenti' : locale === 'zh' ? '停止' : 'Stop')
              : (locale === 'ms' ? 'Dengar' : locale === 'zh' ? '听' : 'Listen')
          }
        </span>
      )}
    </button>
  );
}
