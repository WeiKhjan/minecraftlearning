'use client';

import { useState } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import DrawingCanvas from './DrawingCanvas';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import type { ActivityContent, Locale, WritingContent } from '@/types';

interface WritingActivityProps {
  content: ActivityContent;
  kidName: string;
  avatarUrl?: string | null;
  locale: Locale;
  onComplete: (score: number) => void;
}

export default function WritingActivity({ content, avatarUrl, locale, onComplete }: WritingActivityProps) {
  const data = (content?.data || {}) as WritingContent;
  const characters = data.characters || [];
  const words = data.words || [];
  const items = characters.length > 0 ? characters : words.map(w => w.word);
  const isLetterMode = characters.length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentItem = items[currentIndex];
  const currentWord = words.length > 0 ? words[currentIndex] : null;

  const handleRecognized = (isCorrect: boolean, recognizedText: string) => {
    setIsAnalyzing(false);

    if (isCorrect) {
      // Correct
      setFeedback('correct');
      const newCompleted = new Set(completedItems);
      newCompleted.add(currentIndex);
      setCompletedItems(newCompleted);

      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 < items.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // All done
          const score = Math.max(0, 100 - (mistakes * 10));
          onComplete(score);
        }
      }, 1000);
    } else {
      // Wrong
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

  // Analyzing message
  const analyzingMessage = {
    ms: 'Menganalisis tulisan anda...',
    zh: '正在分析您的书写...',
    en: 'Analyzing your writing...',
  };

  return (
    <div className="space-y-1.5">
      {/* Loading Overlay during analysis */}
      <LoadingOverlay
        isLoading={isAnalyzing}
        avatarUrl={avatarUrl}
        locale={locale}
        message={analyzingMessage[locale]}
      />

      {/* Progress - inline with instruction */}
      <div className="flex justify-center items-center gap-3">
        <span className="text-xs text-gray-500">
          {isLetterMode
            ? (locale === 'ms' ? 'Tulis huruf' : locale === 'zh' ? '写字母' : 'Write letter')
            : (locale === 'ms' ? 'Tulis perkataan' : locale === 'zh' ? '写单词' : 'Write word')}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-1.5 bg-gray-200 rounded-full">
            <div
              className="h-1.5 bg-[#5D8731] rounded-full transition-all"
              style={{ width: `${(completedItems.size / items.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{completedItems.size}/{items.length}</span>
        </div>
      </div>

      {/* Current Item Display - more compact */}
      <div className={`text-center py-2 rounded-lg transition-all ${
        feedback === 'correct' ? 'bg-green-500' :
        feedback === 'wrong' ? 'bg-red-500' :
        'bg-[#5D8731]'
      } text-white`}>
        <div className="flex items-center justify-center gap-2">
          <p className={`font-bold ${isLetterMode ? 'text-3xl' : 'text-2xl'}`}>{currentItem}</p>
          <VoiceTutorButton
            text={currentItem}
            locale={locale}
            size="sm"
            contentType={isLetterMode ? 'letter' : 'word'}
          />
          {currentWord && (
            <span className="text-xs opacity-80">({getWordMeaning()})</span>
          )}
        </div>

        {/* Feedback message */}
        {feedback === 'correct' && (
          <p className="text-sm font-bold animate-bounce">
            {locale === 'ms' ? 'Betul!' : locale === 'zh' ? '正确！' : 'Correct!'}
          </p>
        )}
        {feedback === 'wrong' && (
          <p className="text-sm font-bold">
            {locale === 'ms' ? 'Cuba lagi!' : locale === 'zh' ? '再试！' : 'Try again!'}
          </p>
        )}
      </div>

      {/* Drawing Canvas */}
      <DrawingCanvas
        expectedLetter={currentItem}
        locale={locale}
        onRecognized={handleRecognized}
        disabled={feedback !== null}
        contentType={isLetterMode ? 'letter' : 'word'}
        onAnalyzingChange={setIsAnalyzing}
        compact={true}
      />

      {/* Completed Items */}
      {completedItems.size > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from(completedItems).map(idx => (
            <span
              key={idx}
              className="bg-green-500 text-white px-2 py-0.5 rounded text-sm font-bold"
            >
              {items[idx]} ✓
            </span>
          ))}
        </div>
      )}

      {/* Mistakes Counter */}
      {mistakes > 0 && (
        <p className="text-center text-xs text-red-500">
          {locale === 'ms' ? 'Kesilapan: ' : locale === 'zh' ? '错误：' : 'Mistakes: '}{mistakes}
        </p>
      )}
    </div>
  );
}
