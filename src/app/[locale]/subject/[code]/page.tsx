import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Subject, Theme, Locale } from '@/types';

// Get theme name based on locale
function getThemeName(theme: Theme, locale: Locale): string {
  switch (locale) {
    case 'ms': return theme.name_ms;
    case 'zh': return theme.name_zh;
    case 'en': return theme.name_en;
    default: return theme.name_en;
  }
}

function getThemeDescription(theme: Theme, locale: Locale): string | null {
  switch (locale) {
    case 'ms': return theme.description_ms;
    case 'zh': return theme.description_zh;
    case 'en': return theme.description_en;
    default: return theme.description_en;
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

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; code: string }>;
  searchParams: Promise<{ kid?: string }>;
}) {
  const { locale, code } = await params;
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

  // Verify kid ownership
  const { data: kid } = await supabase
    .from('kids')
    .select('*')
    .eq('id', kidId)
    .eq('parent_id', user.id)
    .single();

  if (!kid) {
    redirect(`/${locale}/kids`);
  }

  // Fetch the subject
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('code', code)
    .single();

  if (!subject) {
    notFound();
  }

  // Fetch themes for this subject
  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('subject_id', subject.id)
    .order('order_index', { ascending: true });

  // Fetch activities count per theme
  const { data: activities } = await supabase
    .from('activities')
    .select('theme_id')
    .in('theme_id', themes?.map(t => t.id) || []);

  // Count activities per theme
  const activityCounts = new Map<string, number>();
  activities?.forEach(a => {
    activityCounts.set(a.theme_id, (activityCounts.get(a.theme_id) || 0) + 1);
  });

  // Fetch kid's progress for activities in these themes
  const { data: progress } = await supabase
    .from('kid_progress')
    .select('activity_id, status')
    .eq('kid_id', kidId);

  // Get activity IDs per theme for progress calculation
  const { data: allActivities } = await supabase
    .from('activities')
    .select('id, theme_id')
    .in('theme_id', themes?.map(t => t.id) || []);

  // Calculate completed activities per theme
  const themeProgress = new Map<string, { completed: number; total: number }>();
  allActivities?.forEach(activity => {
    const current = themeProgress.get(activity.theme_id) || { completed: 0, total: 0 };
    current.total++;
    const progressItem = progress?.find(p => p.activity_id === activity.id);
    if (progressItem?.status === 'completed') {
      current.completed++;
    }
    themeProgress.set(activity.theme_id, current);
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={`/dashboard?kid=${kidId}`} className="text-2xl font-bold text-white drop-shadow-lg">
          MineCraft Learning
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href={`/dashboard?kid=${kidId}`}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            {t('common.back')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Subject Header */}
          <div className="minecraft-card mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl"
                style={{ backgroundColor: subject.color || '#5D8731' }}
              >
                {subject.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {getSubjectName(subject, locale as Locale)}
                </h1>
                <p className="text-gray-600">
                  {themes?.length || 0} {locale === 'ms' ? 'Tema' : locale === 'zh' ? '个主题' : 'Themes'}
                </p>
              </div>
            </div>
          </div>

          {/* Themes List */}
          <div className="space-y-4">
            {themes && themes.length > 0 ? (
              themes.map((theme: Theme, index: number) => {
                const prog = themeProgress.get(theme.id) || { completed: 0, total: 0 };
                const progressPercent = prog.total > 0 ? (prog.completed / prog.total) * 100 : 0;
                const isLocked = index > 0 && (themeProgress.get(themes[index - 1]?.id)?.completed || 0) < (themeProgress.get(themes[index - 1]?.id)?.total || 1);

                return (
                  <Link
                    key={theme.id}
                    href={isLocked ? '#' : `/subject/${code}/theme/${theme.id}?kid=${kidId}`}
                    className={`minecraft-card block transition-all ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:scale-[1.02] cursor-pointer'
                    }`}
                    onClick={(e) => isLocked && e.preventDefault()}
                  >
                    <div className="flex items-center gap-4">
                      {/* Theme Number */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                        isLocked ? 'bg-gray-400 text-gray-600' : 'bg-[#5D8731] text-white'
                      }`}>
                        {isLocked ? '🔒' : index + 1}
                      </div>

                      {/* Theme Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {getThemeName(theme, locale as Locale)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getThemeDescription(theme, locale as Locale)}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#5D8731] h-2 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {prog.completed}/{prog.total}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      {!isLocked && (
                        <div className="text-gray-400 text-2xl">
                          →
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="minecraft-card text-center py-8">
                <p className="text-gray-600">
                  {locale === 'ms' ? 'Tiada tema lagi' : locale === 'zh' ? '暂无主题' : 'No themes yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
