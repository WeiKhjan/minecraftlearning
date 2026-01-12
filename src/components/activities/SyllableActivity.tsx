'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import AudioVisualizer from '@/components/ui/AudioVisualizer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceTutor } from '@/hooks/useVoiceTutor';
import { getImageUrl } from '@/lib/utils';
import type { ActivityContent, Locale, SyllableContent } from '@/types';

interface SyllableActivityProps {
  content: ActivityContent;
  kidName: string;
  avatarUrl?: string | null;
  locale: Locale;
  onComplete: (score: number) => void;
}

interface PronunciationFeedback {
  isCorrect: boolean;
  confidence: number;
  feedback: { ms: string; zh: string; en: string };
  correction?: { ms: string; zh: string; en: string };
}

type ActivityState = 'ready' | 'listening' | 'analyzing' | 'feedback' | 'correct' | 'completed';

export default function SyllableActivity({ content, avatarUrl, locale, onComplete }: SyllableActivityProps) {
  const data = (content?.data || {}) as SyllableContent;

  // Support both formats: flat syllables array OR words array with syllables
  const isWordMode = Array.isArray(data.words) && data.words.length > 0;
  const items = isWordMode
    ? data.words!.map(w => w.word)
    : (data.syllables || []);
  const words = isWordMode ? data.words! : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [readSyllables, setReadSyllables] = useState<Set<number>>(new Set());
  const [activityState, setActivityState] = useState<ActivityState>('ready');
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Ref to track latest transcript (avoids stale closure)
  const latestTranscriptRef = useRef<string>('');

  const currentItem = items[currentIndex];
  const currentWord = isWordMode ? words[currentIndex] : null;

  // Voice tutor for playing correct pronunciation
  const { speak: playCorrectSound, isSpeaking: isPlayingSound } = useVoiceTutor({
    locale,
  });

  // Speech recognition for listening to kid
  // Always use Malay ('ms') for speech recognition since suku kata are Malay syllables
  // UI locale is separate - used for feedback text only
  const {
    isListening,
    isSupported: isSpeechSupported,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    locale: 'ms', // Always Malay for suku kata recognition
    onResult: (spokenText) => {
      // Store in ref for stop button access
      latestTranscriptRef.current = spokenText;
      // Automatically analyze when we get a result
      handleAnalyzePronunciation(spokenText);
    },
    onError: (err) => {
      console.error('Speech recognition error:', err);
      setActivityState('ready');
    },
  });

  // Keep ref in sync with transcript
  useEffect(() => {
    latestTranscriptRef.current = transcript;
  }, [transcript]);

  // Auto-stop listening after 3 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isListening) {
      timeout = setTimeout(() => {
        stopListening();
        if (!transcript) {
          setActivityState('ready');
          setFeedback({
            isCorrect: false,
            confidence: 0,
            feedback: {
              ms: 'Tiada suara dikesan. Sila cuba lagi.',
              zh: '没有检测到声音。请再试一次。',
              en: 'No voice detected. Please try again.',
            },
          });
        }
      }, 4000);
    }
    return () => clearTimeout(timeout);
  }, [isListening, transcript, stopListening]);

  // Analyze pronunciation with AI
  const handleAnalyzePronunciation = useCallback(async (spokenText: string) => {
    if (!spokenText) return;

    setActivityState('analyzing');

    try {
      const response = await fetch('/api/pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expected: currentItem,
          spoken: spokenText,
          locale,
          contentType: isWordMode ? 'word' : 'syllable', // Tell AI this is Malay suku kata or word lesson
        }),
      });

      if (!response.ok) {
        throw new Error('Pronunciation analysis failed');
      }

      const result: PronunciationFeedback = await response.json();
      setFeedback(result);
      setAttempts(prev => prev + 1);

      if (result.isCorrect) {
        setActivityState('correct');
        // Add score based on attempts
        const score = attempts === 0 ? 100 : attempts === 1 ? 80 : 60;
        setTotalScore(prev => prev + score);

        // Auto-advance after showing success
        setTimeout(() => {
          handleMoveToNext();
        }, 1500);
      } else {
        setActivityState('feedback');
        // User can click the voice button manually to hear correct pronunciation
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setActivityState('ready');
      setFeedback({
        isCorrect: false,
        confidence: 0,
        feedback: {
          ms: 'Ralat berlaku. Sila cuba lagi.',
          zh: '发生错误。请再试一次。',
          en: 'An error occurred. Please try again.',
        },
      });
    }
  }, [currentItem, locale, attempts, isWordMode]);

  // Start listening
  const handleStartListening = useCallback(() => {
    resetTranscript();
    latestTranscriptRef.current = ''; // Reset ref too
    setFeedback(null);
    setActivityState('listening');
    startListening();
  }, [resetTranscript, startListening]);


  // Move to next item
  const handleMoveToNext = useCallback(() => {
    const newRead = new Set(readSyllables);
    newRead.add(currentIndex);
    setReadSyllables(newRead);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setActivityState('ready');
      setFeedback(null);
      setAttempts(0);
    } else {
      // All items completed
      setActivityState('completed');
      const finalScore = Math.round(totalScore / items.length);
      setTimeout(() => onComplete(Math.max(finalScore, 60)), 1000);
    }
  }, [readSyllables, currentIndex, items.length, totalScore, onComplete]);

  // Click on grid to jump to syllable
  const handleSyllableClick = (index: number) => {
    if (readSyllables.has(index)) return; // Already read
    setCurrentIndex(index);
    setActivityState('ready');
    setFeedback(null);
    setAttempts(0);
  };

  // Get localized text
  const getText = (texts: { ms: string; zh: string; en: string }) => texts[locale];

  // Localized analyzing message
  const analyzingMessage = {
    ms: 'Menganalisis sebutan anda...',
    zh: '正在分析您的发音...',
    en: 'Analyzing your pronunciation...',
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay during analysis */}
      <LoadingOverlay
        isLoading={activityState === 'analyzing'}
        avatarUrl={avatarUrl}
        locale={locale}
        message={analyzingMessage[locale]}
      />

      {/* Instruction */}
      <p className="text-center text-gray-600">
        {isWordMode
          ? (locale === 'ms' ? 'Tekan butang mikrofon dan sebut perkataan dengan kuat' :
              locale === 'zh' ? '按麦克风按钮并大声说出单词' :
              'Press the microphone button and say the word aloud')
          : (locale === 'ms' ? 'Tekan butang mikrofon dan baca suku kata dengan kuat' :
              locale === 'zh' ? '按麦克风按钮并大声朗读音节' :
              'Press the microphone button and read the syllable aloud')}
      </p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {readSyllables.size}/{items.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(readSyllables.size / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Item Display */}
      {currentIndex < items.length && activityState !== 'completed' && (
        <div className={`text-white text-center py-8 rounded-lg relative transition-all ${
          activityState === 'correct' ? 'bg-green-500' :
          activityState === 'feedback' ? 'bg-orange-500' :
          'bg-[#5D8731]'
        }`}>
          {/* Word with Image (word mode) or Syllable (simple mode) */}
          {isWordMode && currentWord?.image && (
            <div className="mb-4">
              <img
                src={getImageUrl(currentWord.image)}
                alt={currentWord.word}
                className="w-32 h-32 mx-auto object-contain rounded-lg bg-white/10"
              />
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mb-4">
            <p className="text-6xl font-bold">{currentItem}</p>
            <VoiceTutorButton
              text={!isWordMode && data.voice_guides?.[currentIndex] ? data.voice_guides[currentIndex] : currentItem}
              locale={locale}
              size="md"
              contentType={isWordMode ? 'word' : 'syllable'}
              directTTS={!isWordMode && !!data.voice_guides?.[currentIndex]}
              audioUrl={isWordMode ? currentWord?.audio_url : data.audio_urls?.[currentIndex]}
            />
          </div>
          {/* Show syllables breakdown in word mode */}
          {isWordMode && currentWord?.syllables && (
            <p className="text-lg opacity-80 mb-2">
              ({currentWord.syllables.join(' - ')})
            </p>
          )}

          {/* State-based content */}
          {activityState === 'ready' && (
            <>
              <p className="text-sm opacity-80 mb-4">
                {locale === 'ms' ? 'Tekan untuk mula bercakap' :
                  locale === 'zh' ? '点击开始说话' :
                  'Tap to start speaking'}
              </p>
              {isSpeechSupported ? (
                <button
                  onClick={handleStartListening}
                  className="bg-white text-[#5D8731] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all flex items-center gap-2 mx-auto"
                >
                  <span className="text-2xl">🎤</span>
                  {locale === 'ms' ? 'Baca Sekarang' :
                    locale === 'zh' ? '现在朗读' :
                    'Read Now'}
                </button>
              ) : (
                <p className="text-sm opacity-80">
                  {locale === 'ms' ? 'Pengecaman suara tidak disokong' :
                    locale === 'zh' ? '不支持语音识别' :
                    'Speech recognition not supported'}
                </p>
              )}
            </>
          )}

          {activityState === 'listening' && (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <p className="text-lg font-bold">
                  {locale === 'ms' ? 'Mendengar...' :
                    locale === 'zh' ? '正在听...' :
                    'Listening...'}
                </p>
              </div>

              {/* Audio Visualizer - Sound Wave Chart */}
              <div className="my-4 px-4">
                <AudioVisualizer
                  isListening={isListening}
                  barCount={24}
                  barColor="#ffffff"
                  height={50}
                />
              </div>

              {transcript && (
                <p className="mt-2 text-sm opacity-80">
                  {locale === 'ms' ? 'Dikesan: ' : locale === 'zh' ? '检测到: ' : 'Detected: '}
                  &quot;{transcript}&quot;
                </p>
              )}
            </>
          )}

          {activityState === 'analyzing' && (
            <div className="flex items-center justify-center gap-2">
              <span className="animate-spin text-2xl">⏳</span>
              <p className="text-lg">
                {locale === 'ms' ? 'Menganalisis...' :
                  locale === 'zh' ? '分析中...' :
                  'Analyzing...'}
              </p>
            </div>
          )}

          {activityState === 'correct' && feedback && (
            <div className="animate-bounce-in">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-xl font-bold">{getText(feedback.feedback)}</p>
            </div>
          )}

          {activityState === 'feedback' && feedback && (
            <div className="space-y-4">
              <p className="text-lg">{getText(feedback.feedback)}</p>
              {feedback.correction && (
                <div className="bg-white/20 rounded-lg p-4 mx-4">
                  <p className="text-sm opacity-80 mb-2">
                    {locale === 'ms' ? 'Dengar dan cuba lagi:' :
                      locale === 'zh' ? '听一听，再试一次:' :
                      'Listen and try again:'}
                  </p>
                  <p className="text-xl font-bold">{getText(feedback.correction)}</p>
                </div>
              )}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleStartListening}
                  disabled={isPlayingSound}
                  className="bg-white text-orange-500 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span>🎤</span>
                  {locale === 'ms' ? 'Cuba Lagi' : locale === 'zh' ? '再试一次' : 'Try Again'}
                </button>
                {attempts >= 2 && (
                  <button
                    onClick={handleMoveToNext}
                    className="bg-orange-700 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-800 transition-all"
                  >
                    {locale === 'ms' ? 'Seterusnya' : locale === 'zh' ? '下一个' : 'Next'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Speech Error */}
      {speechError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
          {speechError}
        </div>
      )}

      {/* Item Grid */}
      <div className={`grid gap-2 ${isWordMode ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-7'}`}>
        {items.map((item, index) => {
          const isRead = readSyllables.has(index);
          const isCurrent = index === currentIndex;
          const wordData = isWordMode ? words[index] : null;

          return (
            <button
              key={index}
              onClick={() => handleSyllableClick(index)}
              disabled={isRead}
              className={`
                py-3 px-2 rounded font-bold transition-all
                ${isWordMode ? 'text-sm' : 'text-lg'}
                ${isRead
                  ? 'bg-green-500 text-white cursor-default'
                  : isCurrent
                    ? 'bg-[#5DADE2] text-white ring-4 ring-[#5DADE2]/50'
                    : 'bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300'
                }
              `}
            >
              {isWordMode && wordData?.image && (
                <img
                  src={getImageUrl(wordData.image)}
                  alt={item}
                  className="w-12 h-12 mx-auto object-contain mb-1"
                />
              )}
              {item}
              {isRead && <span className="ml-1">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Completion Message */}
      {activityState === 'completed' && (
        <div className="text-center space-y-4 animate-bounce-in">
          <p className="text-6xl">🎉</p>
          <p className="text-green-600 font-bold text-xl">
            {isWordMode
              ? (locale === 'ms' ? 'Tahniah! Anda telah membaca semua perkataan!' :
                  locale === 'zh' ? '恭喜！你已经读完所有单词！' :
                  'Congratulations! You have read all words!')
              : (locale === 'ms' ? 'Tahniah! Anda telah membaca semua suku kata!' :
                  locale === 'zh' ? '恭喜！你已经读完所有音节！' :
                  'Congratulations! You have read all syllables!')}
          </p>
        </div>
      )}
    </div>
  );
}
