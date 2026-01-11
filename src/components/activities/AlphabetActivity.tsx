'use client';

import { useState, useEffect } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import type { ActivityContent, Locale } from '@/types';

interface AlphabetActivityProps {
  content: ActivityContent;
  kidName: string;
  locale: Locale;
  onComplete: (score: number) => void;
}

export default function AlphabetActivity({ content, locale, onComplete }: AlphabetActivityProps) {
  const data = content.data as { letters: string[]; instruction: { ms: string; zh: string; en: string } };
  const letters = data.letters;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; letter: string } | null>(null);

  // Shuffle letters on mount
  useEffect(() => {
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);
  }, [letters]);

  const instruction = data.instruction[locale] || data.instruction.en;

  const handleLetterClick = (letter: string) => {
    const expectedLetter = letters[currentIndex];

    if (letter.toLowerCase() === expectedLetter.toLowerCase()) {
      // Correct
      setSelectedLetters([...selectedLetters, letter]);
      setFeedback({ type: 'correct', letter });
      setCurrentIndex(currentIndex + 1);

      // Remove from shuffled
      setShuffledLetters(shuffledLetters.filter((l, i) => {
        if (l.toLowerCase() === letter.toLowerCase()) {
          // Only remove first occurrence
          const firstIndex = shuffledLetters.findIndex(sl => sl.toLowerCase() === letter.toLowerCase());
          return i !== firstIndex;
        }
        return true;
      }));

      // Check if complete
      if (currentIndex + 1 >= letters.length) {
        // Calculate score based on mistakes
        const score = Math.max(0, 100 - (mistakes * 10));
        setTimeout(() => onComplete(score), 500);
      }

      setTimeout(() => setFeedback(null), 300);
    } else {
      // Wrong
      setMistakes(mistakes + 1);
      setFeedback({ type: 'wrong', letter });
      setTimeout(() => setFeedback(null), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-center text-gray-600">{instruction}</p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {currentIndex}/{letters.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(currentIndex / letters.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Selected Letters */}
      <div className="bg-gray-100 rounded-lg p-4 min-h-[60px]">
        <div className="flex flex-wrap justify-center gap-2">
          {selectedLetters.map((letter, index) => (
            <span
              key={index}
              className="w-10 h-10 bg-[#5D8731] text-white rounded flex items-center justify-center font-bold text-lg"
            >
              {letter.toUpperCase()}
            </span>
          ))}
          {currentIndex < letters.length && (
            <span className="w-10 h-10 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-400 text-lg">
              ?
            </span>
          )}
        </div>
      </div>

      {/* Next Expected Letter Hint */}
      {currentIndex < letters.length && (
        <div className="flex items-center justify-center gap-3">
          <p className="text-lg font-bold text-[#5D8731]">
            {locale === 'ms' ? 'Cari huruf: ' : locale === 'zh' ? '找到字母：' : 'Find letter: '}
            <span className="text-2xl">{letters[currentIndex].toUpperCase()}</span>
          </p>
          <VoiceTutorButton
            text={letters[currentIndex]}
            locale={locale}
            size="sm"
          />
        </div>
      )}

      {/* Letter Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
        {shuffledLetters.map((letter, index) => {
          const isSelected = selectedLetters.includes(letter);
          const isFeedback = feedback?.letter.toLowerCase() === letter.toLowerCase();

          return (
            <button
              key={`${letter}-${index}`}
              onClick={() => !isSelected && handleLetterClick(letter)}
              disabled={isSelected}
              className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded font-bold text-lg transition-all
                ${isSelected
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                  : isFeedback && feedback.type === 'wrong'
                    ? 'bg-red-500 text-white animate-pulse'
                    : isFeedback && feedback.type === 'correct'
                      ? 'bg-green-500 text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-[#5D8731]'
                }
              `}
            >
              {letter.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Mistakes Counter */}
      {mistakes > 0 && (
        <p className="text-center text-sm text-red-500">
          {locale === 'ms' ? 'Kesilapan: ' : locale === 'zh' ? '错误：' : 'Mistakes: '}{mistakes}
        </p>
      )}
    </div>
  );
}
