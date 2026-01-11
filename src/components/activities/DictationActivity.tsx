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
  const data = content.data as DictationContent;
  const words = data.words || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const { speakDirect, stop, isLoading: isSpeaking } = useVoiceTutor({ locale });

  const currentWord = words[currentIndex];

  const handlePlayAudio = useCallback(() => {
    if (currentWord) {
      speakDirect(currentWord.word);
      setHasPlayed(true);
    }
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

  return (
    <div className="space-y-6">
      <LoadingOverlay
        isLoading={isAnalyzing || isSpeaking}
        avatarUrl={avatarUrl}
        locale={locale}
        message={isAnalyzing ? analyzingMessage[locale] : speakingMessage[locale]}
      />

      {/* Instruction */}
      <p className="text-center text-gray-600">
        {instructionText[locale]}
      </p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {completedItems.size}/{words.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(completedItems.size / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Audio Play Section */}
      <div className={`text-center py-8 rounded-lg transition-all ${
        feedback === 'correct' ? 'bg-green-500' :
        feedback === 'wrong' ? 'bg-red-500' :
        'bg-[#5D8731]'
      } text-white`}>
        {feedback === null && (
          <>
            <button
              onClick={handlePlayAudio}
              disabled={isSpeaking}
              className={`
                w-24 h-24 rounded-full flex items-center justify-center mx-auto
                transition-all duration-200
                ${isSpeaking
                  ? 'bg-white/30 animate-pulse'
                  : 'bg-white/20 hover:bg-white/30 hover:scale-110'
                }
              `}
            >
              <span className="text-5xl">{isSpeaking ? '🔊' : '🔈'}</span>
            </button>
            <p className="mt-4 text-lg font-bold">
              {hasPlayed ? playAgainText[locale] : playButtonText[locale]}
            </p>
            {hasPlayed && (
              <p className="text-sm opacity-80 mt-1">
                ({getWordMeaning()})
              </p>
            )}
          </>
        )}

        {feedback === 'correct' && (
          <div className="py-4">
            <p className="text-4xl mb-2">{currentWord.word}</p>
            <p className="text-lg font-bold animate-bounce">
              {locale === 'ms' ? 'Betul! Bagus!' : locale === 'zh' ? '正确！很好！' : 'Correct! Great!'}
            </p>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className="py-4">
            <p className="text-lg font-bold">
              {locale === 'ms' ? 'Cuba lagi!' : locale === 'zh' ? '再试一次！' : 'Try again!'}
            </p>
            <button
              onClick={handlePlayAudio}
              className="mt-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
            >
              🔊 {playAgainText[locale]}
            </button>
          </div>
        )}
      </div>

      {/* Drawing Canvas */}
      <DrawingCanvas
        expectedLetter={currentWord?.word || ''}
        locale={locale}
        onRecognized={handleRecognized}
        disabled={feedback !== null || !hasPlayed}
        contentType="word"
        onAnalyzingChange={setIsAnalyzing}
      />

      {/* Hint - show after playing */}
      {!hasPlayed && (
        <p className="text-center text-sm text-gray-500">
          {locale === 'ms' ? 'Tekan butang untuk mendengar perkataan' :
            locale === 'zh' ? '点击按钮听单词' :
            'Tap the button to hear the word'}
        </p>
      )}

      {/* Completed Items */}
      {completedItems.size > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from(completedItems).map(idx => (
            <span
              key={idx}
              className="bg-green-500 text-white px-3 py-1 rounded font-bold"
            >
              {words[idx]?.word} ✓
            </span>
          ))}
        </div>
      )}

      {/* Mistakes Counter */}
      {mistakes > 0 && (
        <p className="text-center text-sm text-red-500">
          {locale === 'ms' ? 'Kesilapan: ' : locale === 'zh' ? '错误：' : 'Mistakes: '}{mistakes}
        </p>
      )}
    </div>
  );
}
