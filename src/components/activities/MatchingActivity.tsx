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

// Normalized pair structure for internal use
interface NormalizedPair {
  key: string; // letter or syllable - used for matching
  image?: string;
  word: string; // The word to display
}

export default function MatchingActivity({ content, locale, onComplete }: MatchingActivityProps) {
  const data = (content?.data || {}) as MatchingContent;
  const rawPairs = data.pairs || [];

  // Normalize pairs to handle both formats
  const pairs: NormalizedPair[] = rawPairs.map(p => {
    const key = p.letter || p.syllable || p.word || '';
    const word = getLocalizedWord(p, locale);
    return { key, image: p.image, word };
  });

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [shuffledKeys, setShuffledKeys] = useState<string[]>([]);
  const [shuffledImages, setShuffledImages] = useState<NormalizedPair[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; key?: string; image?: string } | null>(null);

  // Shuffle on mount
  useEffect(() => {
    if (pairs.length > 0) {
      setShuffledKeys([...pairs.map(p => p.key)].sort(() => Math.random() - 0.5));
      setShuffledImages([...pairs].sort(() => Math.random() - 0.5));
    }
  }, [rawPairs.length]);

  function getLocalizedWord(pair: MatchingContent['pairs'][0], loc: Locale): string {
    // Try new format first (meaning_*)
    if (pair.meaning_ms || pair.meaning_zh || pair.meaning_en) {
      switch (loc) {
        case 'ms': return pair.meaning_ms || pair.word || '';
        case 'zh': return pair.meaning_zh || pair.word || '';
        case 'en': return pair.meaning_en || pair.word || '';
        default: return pair.meaning_en || pair.word || '';
      }
    }
    // Fall back to old format (word_*)
    switch (loc) {
      case 'ms': return pair.word_ms || '';
      case 'zh': return pair.word_zh || '';
      case 'en': return pair.word_en || '';
      default: return pair.word_en || '';
    }
  }

  const handleKeyClick = (key: string) => {
    if (matchedPairs.has(key)) return;
    setSelectedKey(key);
  };

  const handleImageClick = (pair: NormalizedPair) => {
    if (!selectedKey || matchedPairs.has(pair.key)) return;

    if (selectedKey === pair.key) {
      // Correct match
      const newMatched = new Set(matchedPairs);
      newMatched.add(pair.key);
      setMatchedPairs(newMatched);
      setFeedback({ type: 'correct', key: selectedKey, image: pair.image });
      setSelectedKey(null);

      // Check if complete
      if (newMatched.size >= pairs.length) {
        const score = Math.max(0, 100 - (mistakes * 15));
        setTimeout(() => onComplete(score), 500);
      }

      setTimeout(() => setFeedback(null), 500);
    } else {
      // Wrong match
      setMistakes(mistakes + 1);
      setFeedback({ type: 'wrong', key: selectedKey, image: pair.image });
      setTimeout(() => {
        setFeedback(null);
        setSelectedKey(null);
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
        {/* Keys Column (Letters/Syllables) */}
        <div className="space-y-2">
          <h3 className="text-center font-bold text-gray-700 mb-2">
            {locale === 'ms' ? 'Suku Kata' : locale === 'zh' ? '音节' : 'Syllables'}
          </h3>
          {shuffledKeys.map((key, index) => {
            const isMatched = matchedPairs.has(key);
            const isSelected = selectedKey === key;
            const isFeedbackItem = feedback?.key === key;

            return (
              <button
                key={`key-${index}`}
                onClick={() => handleKeyClick(key)}
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
                {key}
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
            const isMatched = matchedPairs.has(pair.key);
            const isFeedbackItem = feedback?.image === pair.image;

            return (
              <button
                key={`image-${index}`}
                onClick={() => handleImageClick(pair)}
                disabled={isMatched || !selectedKey}
                className={`
                  w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2
                  ${isMatched
                    ? 'bg-green-200 text-green-600 cursor-not-allowed'
                    : isFeedbackItem && feedback.type === 'wrong'
                      ? 'bg-red-500 text-white'
                      : isFeedbackItem && feedback.type === 'correct'
                        ? 'bg-green-500 text-white'
                        : !selectedKey
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-[#5D8731]'
                  }
                `}
              >
                {pair.image ? (
                  <img src={pair.image} alt={pair.word} className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-2xl">📷</span>
                )}
                <span className="font-medium">{pair.word}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Key Hint */}
      {selectedKey && (
        <div className="flex items-center justify-center gap-3">
          <p className="text-[#5DADE2] font-bold">
            {locale === 'ms' ? `Cari gambar untuk "${selectedKey}"` :
              locale === 'zh' ? `找到"${selectedKey}"的图片` :
              `Find the picture for "${selectedKey}"`}
          </p>
          <VoiceTutorButton
            text={selectedKey}
            locale={locale}
            size="sm"
            contentType="syllable"
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
