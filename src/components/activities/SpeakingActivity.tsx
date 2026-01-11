'use client';

import { useState } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import type { ActivityContent, Locale, SpeakingContent } from '@/types';

interface SpeakingActivityProps {
  content: ActivityContent;
  kidName: string;
  avatarUrl?: string | null;
  locale: Locale;
  onComplete: (score: number) => void;
}

export default function SpeakingActivity({ content, kidName, avatarUrl, locale, onComplete }: SpeakingActivityProps) {
  const data = content.data as SpeakingContent;
  const phrases = data.phrases;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completedPhrases, setCompletedPhrases] = useState<Set<number>>(new Set());

  const currentPhrase = phrases[currentIndex];

  const recordingMessage = {
    ms: 'Sedang merakam... Sebut sekarang!',
    zh: '正在录音...现在说！',
    en: 'Recording... Speak now!',
  };

  // Replace {name} placeholder with kid's name
  const getText = (text: string) => text.replace('{name}', kidName);

  const getTranslation = () => {
    if (!currentPhrase) return '';
    switch (locale) {
      case 'ms': return currentPhrase.translation_ms;
      case 'zh': return currentPhrase.translation_zh;
      case 'en': return currentPhrase.translation_en;
      default: return currentPhrase.translation_en;
    }
  };

  const handleRecord = () => {
    setIsRecording(true);

    // Simulate recording for 2 seconds
    // In production, integrate with Web Speech API or Gemini
    setTimeout(() => {
      setIsRecording(false);
      handleComplete();
    }, 2000);
  };

  const handleComplete = () => {
    const newCompleted = new Set(completedPhrases);
    newCompleted.add(currentIndex);
    setCompletedPhrases(newCompleted);

    if (currentIndex + 1 < phrases.length) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 500);
    } else {
      // All phrases completed
      setTimeout(() => onComplete(100), 500);
    }
  };

  const handleSkip = () => {
    if (currentIndex + 1 < phrases.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score based on completed phrases
      const score = Math.round((completedPhrases.size / phrases.length) * 100);
      onComplete(score);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay during recording */}
      <LoadingOverlay
        isLoading={isRecording}
        avatarUrl={avatarUrl}
        locale={locale}
        message={recordingMessage[locale]}
      />

      {/* Instruction */}
      <p className="text-center text-gray-600">
        {locale === 'ms' ? 'Tekan butang dan sebut frasa dengan kuat' :
          locale === 'zh' ? '点击按钮并大声说出短语' :
          'Press the button and say the phrase aloud'}
      </p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {completedPhrases.size}/{phrases.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(completedPhrases.size / phrases.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Phrase Display */}
      <div className="bg-[#5D8731] text-white text-center py-8 rounded-lg">
        <div className="flex items-center justify-center gap-4 mb-2">
          <p className="text-3xl font-bold">
            &quot;{getText(currentPhrase?.text || '')}&quot;
          </p>
          <VoiceTutorButton
            text={getText(currentPhrase?.text || '')}
            locale={locale}
            size="md"
            contentType="sentence"
          />
        </div>
        <p className="text-sm opacity-80">
          ({getText(getTranslation())})
        </p>
      </div>

      {/* Recording Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRecord}
          disabled={isRecording}
          className={`
            w-32 h-32 rounded-full flex items-center justify-center text-5xl transition-all
            ${isRecording
              ? 'bg-red-500 animate-pulse'
              : 'bg-[#5DADE2] hover:bg-[#4A9ACF]'
            }
            text-white shadow-lg
          `}
        >
          {isRecording ? '🔴' : '🎤'}
        </button>
      </div>

      {/* Status */}
      <p className="text-center text-gray-600">
        {isRecording
          ? (locale === 'ms' ? 'Sedang merakam... Sebut sekarang!' :
              locale === 'zh' ? '正在录音...现在说！' :
              'Recording... Speak now!')
          : (locale === 'ms' ? 'Tekan mikrofon untuk mula' :
              locale === 'zh' ? '点击麦克风开始' :
              'Tap microphone to start')
        }
      </p>

      {/* Skip Button */}
      <div className="text-center">
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-700 underline text-sm"
        >
          {locale === 'ms' ? 'Langkau' : locale === 'zh' ? '跳过' : 'Skip'}
        </button>
      </div>

      {/* Completed Phrases */}
      {completedPhrases.size > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 text-center">
            {locale === 'ms' ? 'Selesai:' : locale === 'zh' ? '已完成：' : 'Completed:'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from(completedPhrases).map(idx => (
              <span
                key={idx}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                ✓ {getText(phrases[idx].text).substring(0, 20)}...
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
