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
    <div className="space-y-6">
      {/* Loading Overlay during analysis */}
      <LoadingOverlay
        isLoading={isAnalyzing}
        avatarUrl={avatarUrl}
        locale={locale}
        message={analyzingMessage[locale]}
      />

      {/* Instruction */}
      <p className="text-center text-gray-600">
        {isLetterMode
          ? (locale === 'ms' ? 'Tulis huruf yang ditunjukkan' :
              locale === 'zh' ? '写出显示的字母' :
              'Write the letter shown')
          : (locale === 'ms' ? 'Tulis perkataan yang ditunjukkan' :
              locale === 'zh' ? '写出显示的单词' :
              'Write the word shown')
        }
      </p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {completedItems.size}/{items.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(completedItems.size / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Item Display */}
      <div className={`text-center py-6 rounded-lg transition-all ${
        feedback === 'correct' ? 'bg-green-500' :
        feedback === 'wrong' ? 'bg-red-500' :
        'bg-[#5D8731]'
      } text-white`}>
        <div className="flex items-center justify-center gap-4">
          <p className={`font-bold ${isLetterMode ? 'text-6xl' : 'text-4xl'}`}>{currentItem}</p>
          <VoiceTutorButton
            text={currentItem}
            locale={locale}
            size="md"
            contentType={isLetterMode ? 'letter' : 'word'}
          />
        </div>
        {currentWord && (
          <p className="text-sm opacity-80 mt-2">({getWordMeaning()})</p>
        )}

        {/* Feedback message */}
        {feedback === 'correct' && (
          <p className="mt-2 text-lg font-bold animate-bounce">
            {locale === 'ms' ? 'Betul! Bagus!' : locale === 'zh' ? '正确！很好！' : 'Correct! Great!'}
          </p>
        )}
        {feedback === 'wrong' && (
          <p className="mt-2 text-lg font-bold">
            {locale === 'ms' ? 'Cuba lagi!' : locale === 'zh' ? '再试一次！' : 'Try again!'}
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
      />

      {/* Completed Items */}
      {completedItems.size > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from(completedItems).map(idx => (
            <span
              key={idx}
              className="bg-green-500 text-white px-3 py-1 rounded font-bold"
            >
              {items[idx]} ✓
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
