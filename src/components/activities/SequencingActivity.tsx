'use client';

import { useState, useEffect } from 'react';
import VoiceTutorButton from '@/components/voice/VoiceTutorButton';
import { getImageUrl } from '@/lib/utils';
import type { ActivityContent, Locale, SequencingContent } from '@/types';

interface SequencingActivityProps {
  content: ActivityContent;
  kidName: string;
  locale: Locale;
  onComplete: (score: number) => void;
}

interface Step {
  order: number;
  text_ms: string;
  text_zh: string;
  text_en: string;
  image?: string;
}

function getLocalizedText(step: Step, locale: Locale): string {
  switch (locale) {
    case 'ms': return step.text_ms;
    case 'zh': return step.text_zh;
    case 'en': return step.text_en;
    default: return step.text_en;
  }
}

function getLocalizedInstruction(instruction: { ms: string; zh: string; en: string } | undefined, locale: Locale): string {
  if (!instruction) {
    switch (locale) {
      case 'ms': return 'Susun langkah mengikut turutan yang betul';
      case 'zh': return '按正确顺序排列步骤';
      case 'en': return 'Arrange steps in the correct order';
      default: return 'Arrange steps in the correct order';
    }
  }
  switch (locale) {
    case 'ms': return instruction.ms;
    case 'zh': return instruction.zh;
    case 'en': return instruction.en;
    default: return instruction.en;
  }
}

export default function SequencingActivity({ content, locale, onComplete }: SequencingActivityProps) {
  const data = (content?.data || {}) as SequencingContent;
  const steps = data.steps || [];
  const instruction = data.instruction;
  const contextImage = data.context_image;

  const [shuffledSteps, setShuffledSteps] = useState<Step[]>([]);
  const [userOrder, setUserOrder] = useState<(number | null)[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; index: number } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Shuffle steps on mount
  useEffect(() => {
    if (steps.length > 0) {
      const shuffled = [...steps].sort(() => Math.random() - 0.5);
      setShuffledSteps(shuffled);
      setUserOrder(new Array(steps.length).fill(null));
    }
  }, [steps.length]);

  const handleStepClick = (step: Step, stepIndex: number) => {
    if (completedSteps.has(step.order)) return;

    // Find the next empty slot
    const nextEmptySlot = userOrder.findIndex((val) => val === null);
    if (nextEmptySlot === -1) return;

    // Check if this is the correct step for this position
    const expectedOrder = nextEmptySlot + 1;

    if (step.order === expectedOrder) {
      // Correct!
      const newUserOrder = [...userOrder];
      newUserOrder[nextEmptySlot] = step.order;
      setUserOrder(newUserOrder);

      const newCompleted = new Set(completedSteps);
      newCompleted.add(step.order);
      setCompletedSteps(newCompleted);

      setFeedback({ type: 'correct', index: stepIndex });

      // Check if complete
      if (newCompleted.size >= steps.length) {
        const score = Math.max(0, 100 - (mistakes * 10));
        setTimeout(() => onComplete(score), 500);
      }

      setTimeout(() => setFeedback(null), 500);
    } else {
      // Wrong!
      setMistakes(mistakes + 1);
      setFeedback({ type: 'wrong', index: stepIndex });
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const getOrderLabel = (locale: Locale, order: number): string => {
    switch (locale) {
      case 'ms': return `Langkah ${order}`;
      case 'zh': return `第${order}步`;
      case 'en': return `Step ${order}`;
      default: return `Step ${order}`;
    }
  };

  const getSelectLabel = (locale: Locale): string => {
    const nextSlot = userOrder.findIndex(v => v === null) + 1;
    if (nextSlot === 0 || nextSlot > steps.length) {
      switch (locale) {
        case 'ms': return 'Selesai!';
        case 'zh': return '完成！';
        case 'en': return 'Done!';
        default: return 'Done!';
      }
    }
    switch (locale) {
      case 'ms': return `Pilih langkah ${nextSlot}`;
      case 'zh': return `选择第${nextSlot}步`;
      case 'en': return `Select step ${nextSlot}`;
      default: return `Select step ${nextSlot}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-center text-gray-600">
        {getLocalizedInstruction(instruction, locale)}
      </p>

      {/* Context Image */}
      {contextImage && (
        <div className="flex justify-center">
          <img
            src={getImageUrl(contextImage)}
            alt="Context"
            className="max-h-32 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Progress */}
      <div className="flex justify-center items-center gap-2">
        <span className="text-sm text-gray-500">
          {completedSteps.size}/{steps.length}
        </span>
        <div className="w-48 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-[#5D8731] rounded-full transition-all"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Selection Prompt */}
      <div className="text-center">
        <span className="px-4 py-2 bg-[#5DADE2] text-white rounded-full font-bold">
          {getSelectLabel(locale)}
        </span>
      </div>

      {/* Ordered Steps Display */}
      <div className="space-y-2 mb-4">
        <h3 className="text-center font-bold text-gray-700">
          {locale === 'ms' ? 'Turutan Anda' : locale === 'zh' ? '您的顺序' : 'Your Order'}
        </h3>
        <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
          {userOrder.map((order, idx) => (
            <div
              key={`order-${idx}`}
              className={`
                px-4 py-2 rounded-lg border-2 min-w-[60px] text-center
                ${order !== null
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-gray-100 border-dashed border-gray-300 text-gray-400'}
              `}
            >
              {order !== null ? order : idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Shuffled Steps */}
      <div className="space-y-3">
        <h3 className="text-center font-bold text-gray-700">
          {locale === 'ms' ? 'Pilih langkah seterusnya' : locale === 'zh' ? '选择下一步' : 'Select the next step'}
        </h3>
        {shuffledSteps.map((step, index) => {
          const isCompleted = completedSteps.has(step.order);
          const isFeedbackCorrect = feedback?.type === 'correct' && feedback?.index === index;
          const isFeedbackWrong = feedback?.type === 'wrong' && feedback?.index === index;

          return (
            <button
              key={`step-${index}`}
              onClick={() => handleStepClick(step, index)}
              disabled={isCompleted}
              className={`
                w-full p-4 rounded-lg transition-all text-left flex items-start gap-3
                ${isCompleted
                  ? 'bg-green-200 text-green-600 cursor-not-allowed opacity-60'
                  : isFeedbackCorrect
                    ? 'bg-green-500 text-white'
                    : isFeedbackWrong
                      ? 'bg-red-500 text-white animate-shake'
                      : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-[#5D8731]'
                }
              `}
            >
              {step.image && (
                <img
                  src={getImageUrl(step.image)}
                  alt=""
                  className="w-12 h-12 object-contain rounded flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{getLocalizedText(step, locale)}</p>
              </div>
              {isCompleted && (
                <span className="text-green-600 font-bold">✓ {step.order}</span>
              )}
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
