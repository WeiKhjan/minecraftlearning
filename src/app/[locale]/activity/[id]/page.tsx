import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Activity, Kid, Theme, Subject, Equipment, Locale } from '@/types';
import ActivityClient from '@/components/activities/ActivityClient';

function getActivityTitle(activity: Activity, locale: Locale): string {
  switch (locale) {
    case 'ms': return activity.title_ms;
    case 'zh': return activity.title_zh;
    case 'en': return activity.title_en;
    default: return activity.title_en;
  }
}

function getActivityInstructions(activity: Activity, locale: Locale): string | null {
  switch (locale) {
    case 'ms': return activity.instructions_ms;
    case 'zh': return activity.instructions_zh;
    case 'en': return activity.instructions_en;
    default: return activity.instructions_en;
  }
}

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ kid?: string }>;
}) {
  const { locale, id } = await params;
  const { kid: kidId } = await searchParams;
  const t = await getTranslations();
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Redirect if no kid selected
  if (!kidId) {
    redirect(`/${locale}/kids`);
  }

  // Verify kid ownership and get kid data
  const { data: kid } = await supabase
    .from('kids')
    .select('*')
    .eq('id', kidId)
    .eq('parent_id', user.id)
    .single();

  if (!kid) {
    redirect(`/${locale}/kids`);
  }

  // Fetch the activity with theme and equipment
  const { data: activity } = await supabase
    .from('activities')
    .select('*, theme:theme_id(*, subject:subject_id(*)), equipment:equipment_reward_id(*)')
    .eq('id', id)
    .single();

  if (!activity) {
    notFound();
  }

  // Fetch or create kid's progress for this activity
  let { data: progress } = await supabase
    .from('kid_progress')
    .select('*')
    .eq('kid_id', kidId)
    .eq('activity_id', id)
    .single();

  if (!progress) {
    // Create initial progress record
    const { data: newProgress } = await supabase
      .from('kid_progress')
      .insert({
        kid_id: kidId,
        activity_id: id,
        status: 'in_progress',
        attempts: 0,
      })
      .select()
      .single();
    progress = newProgress;
  } else if (progress.status === 'available' || progress.status === 'locked') {
    // Update to in_progress
    await supabase
      .from('kid_progress')
      .update({ status: 'in_progress' })
      .eq('id', progress.id);
  }

  const theme = activity.theme as Theme & { subject: Subject };
  const subject = theme?.subject;

  // Get back URL
  const backUrl = `/subject/${subject?.code}/theme/${theme?.id}?kid=${kidId}`;

  return (
    <ActivityClient
      activity={activity}
      kid={kid}
      locale={locale as Locale}
      backUrl={backUrl}
      title={getActivityTitle(activity, locale as Locale)}
      instructions={getActivityInstructions(activity, locale as Locale)}
      subjectColor={subject?.color || '#5D8731'}
      translations={{
        back: t('common.back'),
        complete: t('activity.completeActivity'),
        tryAgain: t('activity.tryAgain'),
        correct: t('activity.correct'),
        incorrect: t('activity.incorrect'),
        xpEarned: t('activity.xpEarned'),
        reward: t('activity.reward'),
        stars: t('activity.stars'),
        startActivity: t('activity.startActivity'),
        loading: t('common.loading'),
      }}
    />
  );
}
