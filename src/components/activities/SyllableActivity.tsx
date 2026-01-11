'use client';

import { useState } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import type { ActivityContent, Locale, SyllableContent } from '@/types';

interface SyllableActivityProps {
  content: ActivityContent;
  kidName: string;
  locale: Locale;
  onComplete: (score: number) => void;
}

export default function SyllableActivity({ content, locale, onComplete }: SyllableActivityProps) {
  const data = content.data as SyllableContent;
  const syllables = data.syllables;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [readSyllables, setReadSyllables] = useState<Set<number>>(new Set());

  const handleSyllableClick = (index: number) => {
    // Mark as read
    const newRead = new Set(readSyllables);
    newRead.add(index);
    setReadSyllables(newRead);

    // Move to next
    if (currentIndex === index) {
      setCurrentIndex(currentIndex + 1);
    }

    // Check if all read
    if (newRead.size >= syllables.length) {
      setTimeout(() => onComplete(100), 500);
    }
  };

  // Group syllables by vowel
  const vowelGroups: Record<string, string[]> = {};
  syllables.forEach(s => {
    const vowel = s.charAt(s.length - 1) || s;
    if (!vowelGroups[vowel]) vowelGroups[vowel] = [];
    vowelGroups[vowel].push(s);
  });

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-center text-gray-600">
        {locale === 'ms' ? 'Tekan dan baca setiap suku kata dengan kuat' :
          locale === 'zh' ? '点击并大声朗读每个音节' :
          'Tap and read each syllable aloud'}
      </p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {readSyllables.size}/{syllables.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(readSyllables.size / syllables.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Syllable Display */}
      {currentIndex < syllables.length && (
        <div className="bg-[#5D8731] text-white text-center py-8 rounded-lg relative">
          <div className="flex items-center justify-center gap-4">
            <p className="text-6xl font-bold">{syllables[currentIndex]}</p>
            <VoiceTutorButton
              text={syllables[currentIndex]}
              locale={locale}
              size="md"
            />
          </div>
          <p className="text-sm opacity-80 mt-2">
            {locale === 'ms' ? 'Sebut dengan kuat!' :
              locale === 'zh' ? '大声说！' :
              'Say it loud!'}
          </p>
        </div>
      )}

      {/* Syllable Grid */}
      <div className="grid grid-cols-7 gap-2">
        {syllables.map((syllable, index) => {
          const isRead = readSyllables.has(index);
          const isCurrent = index === currentIndex;

          return (
            <button
              key={index}
              onClick={() => handleSyllableClick(index)}
              className={`
                py-3 px-2 rounded font-bold text-lg transition-all
                ${isRead
                  ? 'bg-green-500 text-white'
                  : isCurrent
                    ? 'bg-[#5DADE2] text-white ring-4 ring-[#5DADE2]/50 animate-pulse'
                    : 'bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300'
                }
              `}
            >
              {syllable}
            </button>
          );
        })}
      </div>

      {/* Completion Message */}
      {readSyllables.size >= syllables.length && (
        <div className="text-center text-green-600 font-bold text-xl">
          {locale === 'ms' ? 'Bagus! Anda telah membaca semua suku kata!' :
            locale === 'zh' ? '太棒了！你已经读完所有音节！' :
            'Great! You have read all syllables!'}
        </div>
      )}
    </div>
  );
}
