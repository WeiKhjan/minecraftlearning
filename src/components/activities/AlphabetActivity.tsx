'use client';

import { useState, useEffect } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import DrawingCanvas from './DrawingCanvas';
import type { ActivityContent, Locale } from '@/types';

interface AlphabetActivityProps {
  content: ActivityContent;
  kidName: string;
  locale: Locale;
  onComplete: (score: number) => void;
}

type InputMode = 'tap' | 'draw';

export default function AlphabetActivity({ content, locale, onComplete }: AlphabetActivityProps) {
  const data = content.data as { letters: string[]; instruction: { ms: string; zh: string; en: string } };
  const letters = data.letters;

  const [inputMode, setInputMode] = useState<InputMode>('tap');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; letter: string } | null>(null);
  const [drawFeedback, setDrawFeedback] = useState<{ type: 'correct' | 'wrong'; message: string } | null>(null);

  // Shuffle letters on mount
  useEffect(() => {
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);
  }, [letters]);

  const instruction = data.instruction[locale] || data.instruction.en;

  // Handle tap mode letter click
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
          const firstIndex = shuffledLetters.findIndex(sl => sl.toLowerCase() === letter.toLowerCase());
          return i !== firstIndex;
        }
        return true;
      }));

      // Check if complete
      if (currentIndex + 1 >= letters.length) {
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

  // Handle draw mode recognition result
  const handleDrawRecognized = (isCorrect: boolean, recognizedLetter: string) => {
    if (isCorrect) {
      const expectedLetter = letters[currentIndex];
      setSelectedLetters([...selectedLetters, expectedLetter]);
      setDrawFeedback({
        type: 'correct',
        message: locale === 'ms' ? 'Betul! Huruf yang bagus!' :
          locale === 'zh' ? '正确！写得很好！' :
          'Correct! Great letter!'
      });

      // Remove from shuffled (if in tap mode grid)
      setShuffledLetters(prev => prev.filter((l, i) => {
        if (l.toLowerCase() === expectedLetter.toLowerCase()) {
          const firstIndex = prev.findIndex(sl => sl.toLowerCase() === expectedLetter.toLowerCase());
          return i !== firstIndex;
        }
        return true;
      }));

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Check if complete
      if (nextIndex >= letters.length) {
        const score = Math.max(0, 100 - (mistakes * 10));
        setTimeout(() => onComplete(score), 1000);
      }

      setTimeout(() => setDrawFeedback(null), 1000);
    } else {
      setMistakes(mistakes + 1);
      setDrawFeedback({
        type: 'wrong',
        message: locale === 'ms' ? `Anda menulis "${recognizedLetter}". Cuba tulis "${letters[currentIndex].toUpperCase()}" lagi.` :
          locale === 'zh' ? `你写的是"${recognizedLetter}"。请再写"${letters[currentIndex].toUpperCase()}"。` :
          `You wrote "${recognizedLetter}". Try writing "${letters[currentIndex].toUpperCase()}" again.`
      });
      setTimeout(() => setDrawFeedback(null), 2000);
    }
  };

  // Mode labels
  const modeLabels = {
    tap: { ms: 'Tekan', zh: '点击', en: 'Tap' },
    draw: { ms: 'Tulis', zh: '书写', en: 'Write' },
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setInputMode('tap')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              inputMode === 'tap'
                ? 'bg-[#5D8731] text-white shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👆 {modeLabels.tap[locale]}
          </button>
          <button
            onClick={() => setInputMode('draw')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              inputMode === 'draw'
                ? 'bg-[#5D8731] text-white shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ✏️ {modeLabels.draw[locale]}
          </button>
        </div>
      </div>

      {/* Instruction */}
      <p className="text-center text-gray-600">
        {inputMode === 'tap' ? instruction : (
          locale === 'ms' ? 'Tulis huruf yang ditunjukkan' :
          locale === 'zh' ? '写出显示的字母' :
          'Write the letter shown'
        )}
      </p>

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
              className="w-10 h-10 bg-[#5D8731] text-white rounded flex items-center justify-center font-bold text-lg animate-pop"
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
            {inputMode === 'tap' ? (
              locale === 'ms' ? 'Cari huruf: ' : locale === 'zh' ? '找到字母：' : 'Find letter: '
            ) : (
              locale === 'ms' ? 'Tulis huruf: ' : locale === 'zh' ? '写字母：' : 'Write letter: '
            )}
            <span className="text-2xl">{letters[currentIndex].toUpperCase()}</span>
          </p>
          <VoiceTutorButton
            text={letters[currentIndex]}
            locale={locale}
            size="sm"
            contentType="letter"
          />
        </div>
      )}

      {/* Draw Feedback */}
      {drawFeedback && (
        <div className={`text-center p-3 rounded-lg font-bold animate-bounce-in ${
          drawFeedback.type === 'correct'
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {drawFeedback.type === 'correct' ? '✅' : '✏️'} {drawFeedback.message}
        </div>
      )}

      {/* Input Area */}
      {inputMode === 'draw' ? (
        /* Drawing Canvas */
        <DrawingCanvas
          expectedLetter={letters[currentIndex] || 'A'}
          locale={locale}
          onRecognized={handleDrawRecognized}
          disabled={currentIndex >= letters.length}
        />
      ) : (
        /* Tap Mode - Letter Grid */
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
          {shuffledLetters.map((letter, index) => {
            const isSelected = selectedLetters.map(l => l.toLowerCase()).includes(letter.toLowerCase());
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
                      ? 'bg-red-500 text-white animate-shake'
                      : isFeedback && feedback.type === 'correct'
                        ? 'bg-green-500 text-white animate-pop'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-[#5D8731]'
                  }
                `}
              >
                {letter.toUpperCase()}
              </button>
            );
          })}
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
