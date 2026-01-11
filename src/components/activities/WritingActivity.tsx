'use client';

import { useState } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import type { ActivityContent, Locale, WritingContent } from '@/types';

interface WritingActivityProps {
  content: ActivityContent;
  kidName: string;
  locale: Locale;
  onComplete: (score: number) => void;
}

export default function WritingActivity({ content, locale, onComplete }: WritingActivityProps) {
  const data = content.data as WritingContent;
  const characters = data.characters || [];
  const words = data.words || [];
  const items = characters.length > 0 ? characters : words.map(w => w.word);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentItem = items[currentIndex];
  const currentWord = words.length > 0 ? words[currentIndex] : null;

  const handleSubmit = () => {
    const expected = currentItem.toLowerCase().trim();
    const actual = userInput.toLowerCase().trim();

    if (actual === expected) {
      // Correct
      setFeedback('correct');
      const newCompleted = new Set(completedItems);
      newCompleted.add(currentIndex);
      setCompletedItems(newCompleted);

      setTimeout(() => {
        setFeedback(null);
        setUserInput('');
        if (currentIndex + 1 < items.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // All done
          const score = Math.max(0, 100 - (mistakes * 10));
          onComplete(score);
        }
      }, 500);
    } else {
      // Wrong
      setMistakes(mistakes + 1);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 500);
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

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-center text-gray-600">
        {characters.length > 0
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
      <div className={`text-center py-8 rounded-lg transition-all ${
        feedback === 'correct' ? 'bg-green-500' :
        feedback === 'wrong' ? 'bg-red-500' :
        'bg-[#5D8731]'
      } text-white`}>
        <div className="flex items-center justify-center gap-4">
          <p className="text-6xl font-bold">{currentItem}</p>
          <VoiceTutorButton
            text={currentItem}
            locale={locale}
            size="md"
          />
        </div>
        {currentWord && (
          <p className="text-sm opacity-80 mt-2">({getWordMeaning()})</p>
        )}
      </div>

      {/* Writing Input */}
      <div className="space-y-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={locale === 'ms' ? 'Tulis di sini...' :
            locale === 'zh' ? '在这里写...' :
            'Write here...'}
          className={`w-full text-center text-3xl py-4 border-4 rounded-lg transition-all ${
            feedback === 'correct' ? 'border-green-500 bg-green-50' :
            feedback === 'wrong' ? 'border-red-500 bg-red-50' :
            'border-gray-300 focus:border-[#5D8731]'
          }`}
          autoFocus
        />

        <button
          onClick={handleSubmit}
          disabled={!userInput.trim()}
          className="w-full minecraft-button py-3 disabled:opacity-50"
        >
          {locale === 'ms' ? 'Semak' : locale === 'zh' ? '检查' : 'Check'}
        </button>
      </div>

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
