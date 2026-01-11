'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import AlphabetActivity from './AlphabetActivity';
import MatchingActivity from './MatchingActivity';
import SyllableActivity from './SyllableActivity';
import WritingActivity from './WritingActivity';
import SpeakingActivity from './SpeakingActivity';
import SingingActivity from './SingingActivity';
import DictationActivity from './DictationActivity';
import Confetti from '@/components/effects/Confetti';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import type { Activity, Kid, Equipment, Locale } from '@/types';

interface ActivityClientProps {
  activity: Activity & { equipment?: Equipment };
  kid: Kid;
  locale: Locale;
  backUrl: string;
  title: string;
  instructions: string | null;
  subjectColor: string;
  translations: {
    back: string;
    complete: string;
    tryAgain: string;
    correct: string;
    incorrect: string;
    xpEarned: string;
    reward: string;
    stars: string;
    startActivity: string;
    loading: string;
  };
}

export default function ActivityClient({
  activity,
  kid,
  locale,
  backUrl,
  title,
  instructions,
  subjectColor,
  translations,
}: ActivityClientProps) {
  const router = useRouter();
  const { play: playSound } = useSoundEffects();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStart = () => {
    playSound('click');
    setGameState('playing');
  };

  const handleComplete = async (finalScore: number) => {
    setIsSubmitting(true);
    setScore(finalScore);

    // Calculate stars based on score
    let earnedStars = 1;
    if (finalScore >= 80) earnedStars = 3;
    else if (finalScore >= 60) earnedStars = 2;
    setStars(earnedStars);

    const supabase = createClient();

    // Update progress
    await supabase
      .from('kid_progress')
      .update({
        status: 'completed',
        score: finalScore,
        stars: earnedStars,
        attempts: 1, // Increment in real implementation
        completed_at: new Date().toISOString(),
      })
      .eq('kid_id', kid.id)
      .eq('activity_id', activity.id);

    // Award XP to kid - first fetch current XP to ensure accuracy
    const { data: currentKid } = await supabase
      .from('kids')
      .select('total_xp')
      .eq('id', kid.id)
      .single();

    const currentXP = currentKid?.total_xp ?? kid.total_xp;
    const newXP = currentXP + activity.xp_reward;

    // Level formula: XP thresholds are 0, 100, 300, 600, 1000... (triangular numbers * 100)
    // Inverse: level = floor((1 + sqrt(1 + 8 * XP / 100)) / 2)
    const newLevel = Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * newXP / 100)) / 2));

    const { error: updateError } = await supabase
      .from('kids')
      .update({
        total_xp: newXP,
        level: newLevel,
      })
      .eq('id', kid.id);

    if (updateError) {
      console.error('[ActivityClient] Failed to update kid XP/level:', updateError);
    }

    // Award equipment if first completion and equipment exists
    if (activity.equipment) {
      await supabase
        .from('kid_inventory')
        .upsert({
          kid_id: kid.id,
          equipment_id: activity.equipment.id,
          obtained_at: new Date().toISOString(),
        }, {
          onConflict: 'kid_id,equipment_id',
        });
    }

    // Check if theme is now complete and award pet if applicable
    try {
      // Get all activities in this theme
      const { data: themeActivities } = await supabase
        .from('activities')
        .select('id')
        .eq('theme_id', activity.theme_id);

      if (themeActivities && themeActivities.length > 0) {
        // Get kid's progress for all activities in this theme
        const { data: progress } = await supabase
          .from('kid_progress')
          .select('activity_id, status')
          .eq('kid_id', kid.id)
          .in('activity_id', themeActivities.map(a => a.id));

        // Check if all activities are completed
        const completedCount = progress?.filter(p => p.status === 'completed').length ?? 0;
        const allCompleted = completedCount >= themeActivities.length;

        if (allCompleted) {
          // Get theme's pet reward
          const { data: theme } = await supabase
            .from('themes')
            .select('pet_reward')
            .eq('id', activity.theme_id)
            .single();

          if (theme?.pet_reward) {
            // Award pet to kid
            await supabase
              .from('kid_pets')
              .upsert({
                kid_id: kid.id,
                pet_id: theme.pet_reward,
                obtained_at: new Date().toISOString(),
                obtained_from_theme: activity.theme_id,
              }, {
                onConflict: 'kid_id,pet_id',
              });

            console.log('[ActivityClient] Pet awarded:', theme.pet_reward);
          }
        }
      }
    } catch (petError) {
      console.error('[ActivityClient] Error checking pet reward:', petError);
    }

    setIsSubmitting(false);
    setGameState('complete');
    setShowConfetti(true);
    playSound('complete');

    // Award equipment sound if applicable
    if (activity.equipment) {
      setTimeout(() => playSound('levelUp'), 500);
    }
  };

  const handleRetry = () => {
    playSound('click');
    setScore(0);
    setStars(0);
    setGameState('playing');
  };

  const handleGoBack = () => {
    router.push(backUrl);
    router.refresh();
  };

  // Render activity component based on type
  const renderActivity = () => {
    const activityProps = {
      content: activity.content,
      kidName: kid.name,
      avatarUrl: kid.generated_avatar_url,
      locale,
      onComplete: handleComplete,
    };

    switch (activity.type) {
      case 'alphabet':
        return <AlphabetActivity {...activityProps} />;
      case 'matching':
        return <MatchingActivity {...activityProps} />;
      case 'syllable':
        return <SyllableActivity {...activityProps} />;
      case 'writing':
        return <WritingActivity {...activityProps} />;
      case 'speaking':
        return <SpeakingActivity {...activityProps} />;
      case 'singing':
        return <SingingActivity {...activityProps} />;
      case 'dictation':
        return <DictationActivity {...activityProps} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Activity type not implemented yet: {activity.type}</p>
            <button onClick={() => handleComplete(100)} className="minecraft-button mt-4">
              Complete (Debug)
            </button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Loading Overlay */}
      <LoadingOverlay
        isLoading={isSubmitting}
        avatarUrl={kid.generated_avatar_url}
        locale={locale}
        message={translations.loading}
      />

      {/* Confetti Effect */}
      <Confetti isActive={showConfetti} />

      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={backUrl} className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
          <span className="text-white font-bold text-xl drop-shadow-lg minecraft-font">MYLearnt</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Avatar + Character Link */}
          <div className="flex items-center gap-2">
            {kid.generated_avatar_url && (
              <Link href={`/character?kid=${kid.id}`}>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 hover:border-white transition-all">
                  <img
                    src={kid.generated_avatar_url}
                    alt={kid.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            )}
            <Link
              href={`/character?kid=${kid.id}`}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-white text-sm transition-all"
              title={locale === 'ms' ? 'Watak Saya' : locale === 'zh' ? '我的角色' : 'My Character'}
            >
              <span>🧑</span>
              <span className="hidden sm:inline">
                {locale === 'ms' ? 'Watak' : locale === 'zh' ? '角色' : 'Character'}
              </span>
            </Link>
          </div>
          <LanguageSwitcher />
          <Link
            href={backUrl}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            {translations.back}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Intro Screen */}
          {gameState === 'intro' && (
            <div className="minecraft-card text-center">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-lg flex items-center justify-center text-4xl"
                style={{ backgroundColor: subjectColor }}
              >
                {activity.type === 'alphabet' ? '🔤' :
                  activity.type === 'matching' ? '🎯' :
                  activity.type === 'syllable' ? '📖' :
                  activity.type === 'writing' ? '✏️' :
                  activity.type === 'speaking' ? '🎤' :
                  activity.type === 'singing' ? '🎵' :
                  activity.type === 'dictation' ? '👂' : '📚'}
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {title}
              </h1>

              {instructions && (
                <p className="text-gray-600 mb-6">
                  {instructions}
                </p>
              )}

              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#5D8731]">+{activity.xp_reward}</p>
                  <p className="text-sm text-gray-500">XP</p>
                </div>
                {activity.equipment && (
                  <div className="text-center">
                    <p className="text-2xl">🎁</p>
                    <p className="text-sm text-gray-500">{translations.reward}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleStart}
                className="minecraft-button text-lg px-8 py-3"
              >
                {translations.startActivity}
              </button>
            </div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && (
            <div className="minecraft-card">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {title}
              </h2>
              {renderActivity()}
            </div>
          )}

          {/* Complete Screen */}
          {gameState === 'complete' && (
            <div className="minecraft-card text-center animate-bounce-in">
              <div className="text-6xl mb-4 animate-float">🎉</div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {translations.correct}
              </h1>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3].map(s => (
                  <span
                    key={s}
                    className={`text-4xl transition-all duration-300 ${s <= stars ? 'text-yellow-500 animate-pop' : 'text-gray-300'}`}
                    style={{ animationDelay: `${s * 0.2}s` }}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              {/* Score */}
              <p className="text-lg text-gray-600 mb-2">
                Score: {score}%
              </p>

              {/* XP Earned */}
              <div className="bg-[#5D8731]/20 rounded-lg p-4 mb-4">
                <p className="text-2xl font-bold text-[#5D8731]">
                  +{activity.xp_reward} XP
                </p>
                <p className="text-sm text-gray-600">{translations.xpEarned}</p>
              </div>

              {/* Equipment Reward */}
              {activity.equipment && (
                <div className="bg-yellow-100 rounded-lg p-4 mb-6">
                  <p className="text-lg font-bold text-yellow-700 mb-2">
                    🎁 {translations.reward}!
                  </p>
                  <p className="text-gray-700">
                    {activity.equipment.name_ms || activity.equipment.name}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {translations.tryAgain}
                </button>
                <button
                  onClick={handleGoBack}
                  className="minecraft-button px-6 py-2"
                >
                  {translations.complete}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
