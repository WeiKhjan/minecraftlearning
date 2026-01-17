'use client';

import { useState, useEffect, useRef } from 'react';
import type { ActivityContent, Locale, SingingContent } from '@/types';

interface SingingActivityProps {
  content: ActivityContent;
  kidName: string;
  locale: Locale;
  onComplete: (score: number) => void;
}

export default function SingingActivity({ content, locale, onComplete }: SingingActivityProps) {
  const data = (content?.data || {}) as SingingContent;
  const { title = '', lyrics = [], melody_reference, youtube_id } = data;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [sungLines, setSungLines] = useState<Set<number>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-advance through lyrics when playing
  useEffect(() => {
    if (isPlaying && currentLineIndex < lyrics.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
      }, 3000); // 3 seconds per line
    } else if (isPlaying && currentLineIndex >= lyrics.length - 1) {
      // Song finished
      setTimeout(() => {
        setIsPlaying(false);
        // If they sung along with most lines, give good score
        const score = sungLines.size >= lyrics.length * 0.5 ? 100 : Math.round((sungLines.size / lyrics.length) * 100);
        onComplete(score);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentLineIndex, lyrics.length, sungLines.size, onComplete]);

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineIndex >= 0 && lyricsContainerRef.current) {
      const lineElement = lyricsContainerRef.current.children[currentLineIndex] as HTMLElement;
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentLineIndex(0);
    setSungLines(new Set());
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentLineIndex(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleLineClick = (index: number) => {
    if (isPlaying) {
      const newSung = new Set(sungLines);
      newSung.add(index);
      setSungLines(newSung);
    }
  };

  return (
    <div className="space-y-4">
      {/* Song Title */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-1">🎵 {title}</h3>
        {melody_reference && (
          <p className="text-sm text-gray-500">
            {locale === 'ms' ? 'Melodi: ' : locale === 'zh' ? '旋律：' : 'Melody: '}
            {melody_reference}
          </p>
        )}
      </div>

      {/* YouTube Video Embed */}
      {youtube_id && (
        <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtube_id}?rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Instruction */}
      <p className="text-center text-gray-600 text-sm">
        {locale === 'ms' ? 'Nyanyi bersama dan tekan setiap baris semasa menyanyinya' :
          locale === 'zh' ? '跟着唱，并在唱每一行时点击它' :
          'Sing along and tap each line as you sing it'}
      </p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {sungLines.size}/{lyrics.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(sungLines.size / lyrics.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Play/Stop Button */}
      <div className="flex justify-center">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="pixel-button text-lg px-8 py-3 flex items-center gap-2"
          >
            ▶️ {locale === 'ms' ? 'Mula Menyanyi' : locale === 'zh' ? '开始唱歌' : 'Start Singing'}
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
          >
            ⏹️ {locale === 'ms' ? 'Berhenti' : locale === 'zh' ? '停止' : 'Stop'}
          </button>
        )}
      </div>

      {/* Lyrics Display */}
      <div className="bg-gray-100 rounded-lg p-4 max-h-60 overflow-y-auto">
        <div ref={lyricsContainerRef} className="space-y-2">
          {lyrics.map((lyric, index) => {
            const isCurrent = index === currentLineIndex;
            const isSung = sungLines.has(index);
            const isPast = index < currentLineIndex;

            return (
              <button
                key={index}
                onClick={() => handleLineClick(index)}
                disabled={!isPlaying}
                className={`
                  w-full text-left px-4 py-2 rounded-lg transition-all
                  ${isCurrent
                    ? 'bg-[#5DADE2] text-white text-lg font-bold scale-105 shadow-lg'
                    : isSung
                      ? 'bg-green-500 text-white'
                      : isPast
                        ? 'bg-gray-300 text-gray-600'
                        : isPlaying
                          ? 'bg-white hover:bg-gray-50 text-gray-800'
                          : 'bg-white text-gray-600'
                  }
                `}
              >
                {isSung && '✓ '}
                {lyric.line}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Line Highlight */}
      {isPlaying && currentLineIndex >= 0 && currentLineIndex < lyrics.length && (
        <div className="text-center bg-[#5DADE2]/10 rounded-lg p-3">
          <p className="text-sm text-gray-500 mb-1">
            {locale === 'ms' ? 'Nyanyikan sekarang:' : locale === 'zh' ? '现在唱：' : 'Sing now:'}
          </p>
          <p className="text-xl font-bold text-[#5DADE2]">
            {lyrics[currentLineIndex].line}
          </p>
        </div>
      )}
    </div>
  );
}
