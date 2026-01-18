import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Activity, Theme, Subject, Equipment, Pet, Locale, ProgressStatus } from '@/types';

// Activity type icons
const activityIcons: Record<string, string> = {
  alphabet: '🔤',
  matching: '🎯',
  syllable: '📖',
  writing: '✏️',
  speaking: '🎤',
  singing: '🎵',
  math: '🔢',
};

function getActivityTitle(activity: Activity, locale: Locale): string {
  switch (locale) {
    case 'ms': return activity.title_ms;
    case 'zh': return activity.title_zh;
    case 'en': return activity.title_en;
    default: return activity.title_en;
  }
}

function getThemeName(theme: Theme, locale: Locale): string {
  switch (locale) {
    case 'ms': return theme.name_ms;
    case 'zh': return theme.name_zh;
    case 'en': return theme.name_en;
    default: return theme.name_en;
  }
}

function getSubjectName(subject: Subject, locale: Locale): string {
  switch (locale) {
    case 'ms': return subject.name_ms;
    case 'zh': return subject.name_zh;
    case 'en': return subject.name_en;
    default: return subject.name_en;
  }
}

function getEquipmentName(equipment: Equipment | null, locale: Locale): string {
  if (!equipment) return '';
  switch (locale) {
    case 'ms': return equipment.name_ms || equipment.name;
    case 'zh': return equipment.name_zh || equipment.name;
    case 'en': return equipment.name_en || equipment.name;
    default: return equipment.name;
  }
}

export default async function ThemePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; code: string; themeId: string }>;
  searchParams: Promise<{ kid?: string }>;
}) {
  const { locale, code, themeId } = await params;
  const { kid: kidId } = await searchParams;
  const t = await getTranslations();
  const supabase = await createClient();

  // Redirect if no kid selected (check early)
  if (!kidId) {
    redirect(`/${locale}/kids`);
  }

  // Check authentication - middleware validates session, but we need user.id
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Check if user is admin
  const { data: parent } = await supabase
    .from('parents')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const isAdmin = parent?.is_admin === true;

  // Admin can access any kid, regular users can only access their own
  let kidQuery = supabase.from('kids').select('*').eq('id', kidId);
  if (!isAdmin) {
    kidQuery = kidQuery.eq('parent_id', user.id);
  }

  // Parallel fetch: kid, subject, theme with pet, and activities (all independent)
  const [
    { data: kid },
    { data: subject },
    { data: theme },
    { data: activities }
  ] = await Promise.all([
    kidQuery.single(),
    supabase
      .from('subjects')
      .select('*')
      .eq('code', code)
      .single(),
    supabase
      .from('themes')
      .select('*, pet:pet_reward(*)')
      .eq('id', themeId)
      .single(),
    supabase
      .from('activities')
      .select('*, equipment:equipment_reward_id(*)')
      .eq('theme_id', themeId)
      .order('order_index', { ascending: true })
  ]);

  if (!kid) {
    redirect(`/${locale}/kids`);
  }

  if (!subject) {
    notFound();
  }

  if (!theme) {
    notFound();
  }

  // Fetch kid's progress for these activities
  const { data: progressData } = await supabase
    .from('kid_progress')
    .select('*')
    .eq('kid_id', kidId)
    .in('activity_id', activities?.map(a => a.id) || []);

  // Create progress map
  const progressMap = new Map(
    progressData?.map(p => [p.activity_id, p]) || []
  );

  // Determine activity status - all activities within a chapter are available
  const getActivityStatus = (index: number): ProgressStatus => {
    const activityId = activities?.[index]?.id;
    const progress = progressMap.get(activityId);

    if (progress?.status === 'completed') return 'completed';
    if (progress?.status === 'in_progress') return 'in_progress';

    // All activities within the same chapter are available (no sequential lock)
    return 'available';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={`/${locale}/dashboard?kid=${kidId}`} className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
          <span className="text-white font-bold text-xl drop-shadow-lg pixel-font">MYLearnt</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Avatar + Character Link */}
          <div className="flex items-center gap-2">
            {kid.generated_avatar_url && (
              <Link href={`/${locale}/character?kid=${kidId}`}>
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
              href={`/${locale}/character?kid=${kidId}`}
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
            href={`/${locale}/subject/${code}?kid=${kidId}`}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            {t('common.back')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-white/80 text-sm mb-4">
            <Link href={`/${locale}/dashboard?kid=${kidId}`} className="hover:text-white">
              {t('dashboard.title')}
            </Link>
            {' > '}
            <Link href={`/${locale}/subject/${code}?kid=${kidId}`} className="hover:text-white">
              {getSubjectName(subject, locale as Locale)}
            </Link>
            {' > '}
            <span className="text-white">{getThemeName(theme, locale as Locale)}</span>
          </div>

          {/* Theme Header */}
          <div className="pixel-card mb-6">
            <div className="flex items-center gap-4">
              {(theme as Theme & { pet?: Pet }).pet?.image_url ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <img
                    src={(theme as Theme & { pet?: Pet }).pet!.image_url!.startsWith('/')
                      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images${(theme as Theme & { pet?: Pet }).pet!.image_url}`
                      : (theme as Theme & { pet?: Pet }).pet!.image_url!}
                    alt={(theme as Theme & { pet?: Pet }).pet!.name}
                    className="w-14 h-14 object-contain pixelated"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl"
                  style={{ backgroundColor: subject.color || '#5D8731' }}
                >
                  {subject.icon}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {getThemeName(theme, locale as Locale)}
                </h1>
                <p className="text-gray-600">
                  {activities?.length || 0} {t('subjects.progress', { completed: progressData?.filter(p => p.status === 'completed').length || 0, total: activities?.length || 0 })}
                </p>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity: Activity & { equipment?: Equipment }, index: number) => {
                const status = getActivityStatus(index);
                const progress = progressMap.get(activity.id);
                const isLocked = status === 'locked';
                const isCompleted = status === 'completed';

                return (
                  <Link
                    key={activity.id}
                    href={isLocked ? '#' : `/${locale}/activity/${activity.id}?kid=${kidId}`}
                    prefetch={!isLocked}
                    className={`pixel-card block transition-all ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:scale-[1.02] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Activity Icon / Equipment Image */}
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden ${
                        isCompleted
                          ? 'bg-[#5D8731]'
                          : isLocked
                            ? 'bg-gray-400'
                            : 'bg-[#5DADE2]'
                      }`}>
                        {isLocked ? (
                          <span className="text-2xl text-gray-600">🔒</span>
                        ) : isCompleted ? (
                          <span className="text-2xl text-white">✓</span>
                        ) : activity.equipment?.image_url ? (
                          <img
                            src={activity.equipment.image_url.startsWith('/')
                              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images${activity.equipment.image_url}`
                              : activity.equipment.image_url}
                            alt={getEquipmentName(activity.equipment, locale as Locale)}
                            className="w-12 h-12 object-contain pixelated"
                          />
                        ) : (
                          <span className="text-2xl text-white">{activityIcons[activity.type] || '📚'}</span>
                        )}
                      </div>

                      {/* Activity Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {getActivityTitle(activity, locale as Locale)}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">
                            +{activity.xp_reward} XP
                          </span>
                          {activity.equipment && (
                            <span className="text-sm text-yellow-600">
                              🎁 {getEquipmentName(activity.equipment, locale as Locale)}
                            </span>
                          )}
                        </div>

                        {/* Stars for completed */}
                        {isCompleted && progress?.stars && (
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3].map(star => (
                              <span key={star} className={star <= (progress.stars || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Status/Arrow */}
                      <div className="text-gray-400 text-2xl">
                        {isCompleted ? '✓' : isLocked ? '' : '→'}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="pixel-card text-center py-8">
                <p className="text-gray-600">
                  {locale === 'ms' ? 'Tiada aktiviti lagi' : locale === 'zh' ? '暂无活动' : 'No activities yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
