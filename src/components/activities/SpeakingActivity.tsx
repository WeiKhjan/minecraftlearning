'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import AudioVisualizer from '@/components/ui/AudioVisualizer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { ActivityContent, Locale, SpeakingContent } from '@/types';

interface SpeakingActivityProps {
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

export default function SpeakingActivity({ content, kidName, avatarUrl, locale, onComplete }: SpeakingActivityProps) {
  const data = (content?.data || {}) as SpeakingContent;
  const phrases = data.phrases || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedPhrases, setCompletedPhrases] = useState<Set<number>>(new Set());
  const [activityState, setActivityState] = useState<ActivityState>('ready');
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Ref to track latest transcript (avoids stale closure)
  const latestTranscriptRef = useRef<string>('');

  const currentPhrase = phrases[currentIndex];

  // Replace {name} placeholder with kid's name
  const getText = (text: string) => text.replace('{name}', kidName);

  // Speech recognition hook
  const {
    isListening,
    isSupported: isSpeechSupported,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    locale: 'ms', // Use Malay for speech recognition
    onResult: (spokenText) => {
      latestTranscriptRef.current = spokenText;
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

  // Auto-stop listening after 5 seconds (longer for phrases)
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
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [isListening, transcript, stopListening]);

  const getTranslation = () => {
    if (!currentPhrase) return '';
    switch (locale) {
      case 'ms': return currentPhrase.translation_ms;
      case 'zh': return currentPhrase.translation_zh;
      case 'en': return currentPhrase.translation_en;
      default: return currentPhrase.translation_en;
    }
  };

  // Analyze pronunciation with AI
  const handleAnalyzePronunciation = useCallback(async (spokenText: string) => {
    if (!spokenText) return;

    setActivityState('analyzing');

    try {
      const expectedText = getText(currentPhrase?.text || '');
      const response = await fetch('/api/pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expected: expectedText,
          spoken: spokenText,
          locale,
          contentType: 'sentence',
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
  }, [currentPhrase, locale, attempts, kidName]);

  // Start listening
  const handleStartListening = useCallback(() => {
    resetTranscript();
    latestTranscriptRef.current = '';
    setFeedback(null);
    setActivityState('listening');
    startListening();
  }, [resetTranscript, startListening]);

  // Move to next phrase
  const handleMoveToNext = useCallback(() => {
    const newCompleted = new Set(completedPhrases);
    newCompleted.add(currentIndex);
    setCompletedPhrases(newCompleted);

    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setActivityState('ready');
      setFeedback(null);
      setAttempts(0);
    } else {
      // All phrases completed
      setActivityState('completed');
      const finalScore = Math.round(totalScore / phrases.length);
      setTimeout(() => onComplete(Math.max(finalScore, 60)), 1000);
    }
  }, [completedPhrases, currentIndex, phrases.length, totalScore, onComplete]);

  const handleSkip = () => {
    if (currentIndex + 1 < phrases.length) {
      setCurrentIndex(currentIndex + 1);
      setActivityState('ready');
      setFeedback(null);
      setAttempts(0);
    } else {
      // Calculate score based on completed phrases
      const score = phrases.length > 0 ? Math.round((completedPhrases.size / phrases.length) * 100) : 0;
      onComplete(score);
    }
  };

  // Get localized text from feedback
  const getLocalizedText = (texts: { ms: string; zh: string; en: string }) => texts[locale];

  // Localized messages
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
        {locale === 'ms' ? 'Tekan butang dan sebut frasa dengan kuat' :
          locale === 'zh' ? '点击按钮并大声说出短语' :
          'Press the button and say the phrase aloud'}
      </p>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {completedPhrases.size}/{phrases.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(completedPhrases.size / phrases.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Phrase Display */}
      {currentIndex < phrases.length && activityState !== 'completed' && (
        <div className={`text-white text-center py-8 rounded-lg relative transition-all ${
          activityState === 'correct' ? 'bg-green-500' :
          activityState === 'feedback' ? 'bg-orange-500' :
          'bg-[#5D8731]'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-2">
            <p className="text-3xl font-bold">
              &quot;{getText(currentPhrase?.text || '')}&quot;
            </p>
            <VoiceTutorButton
              text={currentPhrase?.voice_guide || getText(currentPhrase?.text || '')}
              locale={locale}
              size="md"
              contentType="sentence"
              directTTS={!!currentPhrase?.voice_guide}
              audioUrl={currentPhrase?.audio_url}
            />
          </div>
          <p className="text-sm opacity-80 mb-4">
            ({getText(getTranslation())})
          </p>

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
                  {locale === 'ms' ? 'Sebut Sekarang' :
                    locale === 'zh' ? '现在说' :
                    'Speak Now'}
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

              {/* Audio Visualizer */}
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
              <p className="text-xl font-bold">{getLocalizedText(feedback.feedback)}</p>
            </div>
          )}

          {activityState === 'feedback' && feedback && (
            <div className="space-y-4">
              <p className="text-lg">{getLocalizedText(feedback.feedback)}</p>
              {feedback.correction && (
                <div className="bg-white/20 rounded-lg p-4 mx-4">
                  <p className="text-sm opacity-80 mb-2">
                    {locale === 'ms' ? 'Dengar dan cuba lagi:' :
                      locale === 'zh' ? '听一听，再试一次:' :
                      'Listen and try again:'}
                  </p>
                  <p className="text-xl font-bold">{getLocalizedText(feedback.correction)}</p>
                </div>
              )}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleStartListening}
                  className="bg-white text-orange-500 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
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

      {/* Skip Button */}
      {activityState !== 'completed' && (
        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 underline text-sm"
          >
            {locale === 'ms' ? 'Langkau' : locale === 'zh' ? '跳过' : 'Skip'}
          </button>
        </div>
      )}

      {/* Completed Phrases */}
      {completedPhrases.size > 0 && activityState !== 'completed' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 text-center">
            {locale === 'ms' ? 'Selesai:' : locale === 'zh' ? '已完成：' : 'Completed:'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from(completedPhrases).map(idx => (
              <span
                key={idx}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                ✓ {getText(phrases[idx].text).substring(0, 20)}...
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {activityState === 'completed' && (
        <div className="text-center space-y-4 animate-bounce-in">
          <p className="text-6xl">🎉</p>
          <p className="text-green-600 font-bold text-xl">
            {locale === 'ms' ? 'Tahniah! Anda telah menyebut semua frasa!' :
              locale === 'zh' ? '恭喜！你已经说完所有短语！' :
              'Congratulations! You have said all phrases!'}
          </p>
        </div>
      )}
    </div>
  );
}
