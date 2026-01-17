'use client';

import { useState, useCallback } from 'react';
import { useVoiceTutor } from '@/hooks/useVoiceTutor';
import DrawingCanvas from './DrawingCanvas';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import type { ActivityContent, Locale, DictationContent } from '@/types';

interface DictationActivityProps {
  content: ActivityContent;
  kidName: string;
  avatarUrl?: string | null;
  locale: Locale;
  onComplete: (score: number) => void;
}

export default function DictationActivity({ content, avatarUrl, locale, onComplete }: DictationActivityProps) {
  const data = (content?.data || {}) as DictationContent;
  const words = data.words || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlayingPregen, setIsPlayingPregen] = useState(false);

  const { speakDirect, stop, isLoading: isSpeaking, error: ttsError } = useVoiceTutor({ locale });

  const currentWord = words[currentIndex];

  const handlePlayAudio = useCallback(() => {
    if (!currentWord) return;

    // Use pre-generated audio if available
    if (currentWord.audio_url) {
      const audio = new Audio(currentWord.audio_url);
      setIsPlayingPregen(true);
      audio.onended = () => setIsPlayingPregen(false);
      audio.onerror = () => {
        setIsPlayingPregen(false);
        // Fallback to TTS
        speakDirect(currentWord.word);
      };
      audio.play();
      setHasPlayed(true);
      return;
    }

    // Fallback to TTS API
    speakDirect(currentWord.word);
    setHasPlayed(true);
  }, [currentWord, speakDirect]);

  const handleRecognized = (isCorrect: boolean, recognizedText: string) => {
    setIsAnalyzing(false);

    if (isCorrect) {
      setFeedback('correct');
      const newCompleted = new Set(completedItems);
      newCompleted.add(currentIndex);
      setCompletedItems(newCompleted);

      setTimeout(() => {
        setFeedback(null);
        setHasPlayed(false);
        if (currentIndex + 1 < words.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          const score = Math.max(0, 100 - (mistakes * 10));
          onComplete(score);
        }
      }, 1500);
    } else {
      setMistakes(mistakes + 1);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const getWordMeaning = () => {
    if (!currentWord) return null;
    switch (locale) {
      case 'ms': return currentWord.meaning_ms;
      case 'zh': return currentWord.meaning_zh;
      case 'en': return currentWord.meaning_en;
      default: return currentWord.meaning_en;
    }
  };

  const analyzingMessage = {
    ms: 'Menganalisis tulisan anda...',
    zh: '正在分析您的书写...',
    en: 'Analyzing your writing...',
  };

  const speakingMessage = {
    ms: 'Memainkan audio...',
    zh: '正在播放音频...',
    en: 'Playing audio...',
  };

  const instructionText = {
    ms: 'Dengar perkataan dan tulis',
    zh: '听单词并写出来',
    en: 'Listen to the word and write it',
  };

  const playButtonText = {
    ms: 'Dengar Perkataan',
    zh: '听单词',
    en: 'Listen to Word',
  };

  const playAgainText = {
    ms: 'Dengar Lagi',
    zh: '再听一次',
    en: 'Listen Again',
  };

  const audioErrorText = {
    ms: 'Tidak dapat memainkan audio. Cuba lagi.',
    zh: '无法播放音频。请重试。',
    en: 'Unable to play audio. Please try again.',
  };

  const isPlayingAudio = isSpeaking || isPlayingPregen;

  return (
    <div className="space-y-2">
      <LoadingOverlay
        isLoading={isAnalyzing || isPlayingAudio}
        avatarUrl={avatarUrl}
        locale={locale}
        message={isAnalyzing ? analyzingMessage[locale] : speakingMessage[locale]}
      />

      {/* Instruction + Progress in one row */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {instructionText[locale]}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {completedItems.size}/{words.length}
          </span>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full">
            <div
              className="h-1.5 bg-[#5D8731] rounded-full transition-all"
              style={{ width: `${(completedItems.size / words.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Audio Play Section - Compact */}
      <div className={`text-center py-3 rounded-lg transition-all ${
        feedback === 'correct' ? 'bg-green-500' :
        feedback === 'wrong' ? 'bg-red-500' :
        'bg-[#5D8731]'
      } text-white`}>
        {feedback === null && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center
                transition-all duration-200
                ${isPlayingAudio
                  ? 'bg-white/30 animate-pulse'
                  : 'bg-white/20 hover:bg-white/30 hover:scale-110'
                }
              `}
            >
              <span className="text-3xl">{isPlayingAudio ? '🔊' : '🔈'}</span>
            </button>
            <p className="text-base font-bold">
              {hasPlayed ? playAgainText[locale] : playButtonText[locale]}
            </p>
          </div>
        )}

        {feedback === 'correct' && (
          <div className="py-2">
            <p className="text-2xl mb-1">{currentWord.word}</p>
            <p className="text-base font-bold animate-bounce">
              {locale === 'ms' ? 'Betul! Bagus!' : locale === 'zh' ? '正确！很好！' : 'Correct! Great!'}
            </p>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className="py-2">
            <p className="text-base font-bold">
              {locale === 'ms' ? 'Cuba lagi!' : locale === 'zh' ? '再试一次！' : 'Try again!'}
            </p>
            <button
              onClick={handlePlayAudio}
              className="mt-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm"
            >
              🔊 {playAgainText[locale]}
            </button>
          </div>
        )}
      </div>

      {/* TTS Error Message */}
      {ttsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-center text-sm">
          {audioErrorText[locale]}
        </div>
      )}

      {/* Drawing Canvas - no watermark for dictation (child should only hear, not see) */}
      <DrawingCanvas
        expectedLetter={currentWord?.word || ''}
        locale={locale}
        onRecognized={handleRecognized}
        disabled={feedback !== null || !hasPlayed}
        contentType="word"
        onAnalyzingChange={setIsAnalyzing}
        showWatermark={false}
        compact
      />

      {/* Hint - show after playing */}
      {!hasPlayed && (
        <p className="text-center text-xs text-gray-500">
          {locale === 'ms' ? 'Tekan butang untuk mendengar perkataan' :
            locale === 'zh' ? '点击按钮听单词' :
            'Tap the button to hear the word'}
        </p>
      )}

      {/* Completed Items + Mistakes in one row */}
      {(completedItems.size > 0 || mistakes > 0) && (
        <div className="flex justify-between items-center text-xs">
          <div className="flex flex-wrap gap-1">
            {Array.from(completedItems).map(idx => (
              <span
                key={idx}
                className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold"
              >
                {words[idx]?.word} ✓
              </span>
            ))}
          </div>
          {mistakes > 0 && (
            <span className="text-red-500">
              {locale === 'ms' ? 'Salah: ' : locale === 'zh' ? '错误：' : 'Wrong: '}{mistakes}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
