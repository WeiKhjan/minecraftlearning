'use client';

import { useState, useEffect } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import type { ActivityContent, Locale, MatchingContent } from '@/types';

interface MatchingActivityProps {
  content: ActivityContent;
  kidName: string;
  locale: Locale;
  onComplete: (score: number) => void;
}

interface MatchPair {
  letter: string;
  image: string;
  word_ms: string;
  word_zh: string;
  word_en: string;
}

export default function MatchingActivity({ content, locale, onComplete }: MatchingActivityProps) {
  const data = (content?.data || {}) as MatchingContent;
  const pairs = data.pairs || [];

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [shuffledImages, setShuffledImages] = useState<MatchPair[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; letter?: string; image?: string } | null>(null);

  // Shuffle on mount
  useEffect(() => {
    setShuffledLetters([...pairs.map(p => p.letter)].sort(() => Math.random() - 0.5));
    setShuffledImages([...pairs].sort(() => Math.random() - 0.5));
  }, [pairs]);

  const getWord = (pair: MatchPair): string => {
    switch (locale) {
      case 'ms': return pair.word_ms;
      case 'zh': return pair.word_zh;
      case 'en': return pair.word_en;
      default: return pair.word_en;
    }
  };

  const handleLetterClick = (letter: string) => {
    if (matchedPairs.has(letter)) return;
    setSelectedLetter(letter);
  };

  const handleImageClick = (pair: MatchPair) => {
    if (!selectedLetter || matchedPairs.has(pair.letter)) return;

    if (selectedLetter === pair.letter) {
      // Correct match
      const newMatched = new Set(matchedPairs);
      newMatched.add(pair.letter);
      setMatchedPairs(newMatched);
      setFeedback({ type: 'correct', letter: selectedLetter, image: pair.image });
      setSelectedLetter(null);

      // Check if complete
      if (newMatched.size >= pairs.length) {
        const score = Math.max(0, 100 - (mistakes * 15));
        setTimeout(() => onComplete(score), 500);
      }

      setTimeout(() => setFeedback(null), 500);
    } else {
      // Wrong match
      setMistakes(mistakes + 1);
      setFeedback({ type: 'wrong', letter: selectedLetter, image: pair.image });
      setTimeout(() => {
        setFeedback(null);
        setSelectedLetter(null);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-center text-gray-600">
        {locale === 'ms' ? 'Padankan huruf dengan gambar yang betul' :
          locale === 'zh' ? '将字母与正确的图片配对' :
          'Match the letter with the correct picture'}
      </p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {matchedPairs.size}/{pairs.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(matchedPairs.size / pairs.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Letters Column */}
        <div className="space-y-2">
          <h3 className="text-center font-bold text-gray-700 mb-2">
            {locale === 'ms' ? 'Huruf' : locale === 'zh' ? '字母' : 'Letters'}
          </h3>
          {shuffledLetters.map((letter, index) => {
            const isMatched = matchedPairs.has(letter);
            const isSelected = selectedLetter === letter;
            const isFeedbackItem = feedback?.letter === letter;

            return (
              <button
                key={`letter-${index}`}
                onClick={() => handleLetterClick(letter)}
                disabled={isMatched}
                className={`
                  w-full py-4 rounded-lg font-bold text-2xl transition-all
                  ${isMatched
                    ? 'bg-green-200 text-green-600 cursor-not-allowed'
                    : isSelected
                      ? 'bg-[#5DADE2] text-white ring-4 ring-[#5DADE2]/50'
                      : isFeedbackItem && feedback.type === 'wrong'
                        ? 'bg-red-500 text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-[#5D8731]'
                  }
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Images Column */}
        <div className="space-y-2">
          <h3 className="text-center font-bold text-gray-700 mb-2">
            {locale === 'ms' ? 'Gambar' : locale === 'zh' ? '图片' : 'Pictures'}
          </h3>
          {shuffledImages.map((pair, index) => {
            const isMatched = matchedPairs.has(pair.letter);
            const isFeedbackItem = feedback?.image === pair.image;

            return (
              <button
                key={`image-${index}`}
                onClick={() => handleImageClick(pair)}
                disabled={isMatched || !selectedLetter}
                className={`
                  w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2
                  ${isMatched
                    ? 'bg-green-200 text-green-600 cursor-not-allowed'
                    : isFeedbackItem && feedback.type === 'wrong'
                      ? 'bg-red-500 text-white'
                      : isFeedbackItem && feedback.type === 'correct'
                        ? 'bg-green-500 text-white'
                        : !selectedLetter
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-[#5D8731]'
                  }
                `}
              >
                <span className="text-2xl">
                  {/* Use emoji as placeholder for images */}
                  {pair.letter === 'A' ? '🐔' :
                    pair.letter === 'E' ? '👩' :
                    pair.letter === 'I' ? '🦆' :
                    pair.letter === 'O' ? '🍊' :
                    pair.letter === 'U' ? '🐫' : '📷'}
                </span>
                <span className="font-medium">{getWord(pair)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Letter Hint */}
      {selectedLetter && (
        <div className="flex items-center justify-center gap-3">
          <p className="text-[#5DADE2] font-bold">
            {locale === 'ms' ? `Cari gambar untuk "${selectedLetter}"` :
              locale === 'zh' ? `找到"${selectedLetter}"的图片` :
              `Find the picture for "${selectedLetter}"`}
          </p>
          <VoiceTutorButton
            text={selectedLetter}
            locale={locale}
            size="sm"
            contentType="word"
          />
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
