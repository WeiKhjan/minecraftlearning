import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Subject, Theme, Activity, KidProgress, Locale, ActivityType } from '@/types';

const activityTypeIcons: Record<ActivityType, string> = {
  alphabet: '🔤',
  matching: '🔗',
  syllable: '📖',
  writing: '✍️',
  speaking: '🎤',
  singing: '🎵',
  math: '🔢',
  dictation: '👂',
  sequencing: '📋',
};

export default async function KidProgressPage({
  params,
}: {
  params: Promise<{ locale: string; kidId: string }>;
}) {
  const { locale, kidId } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Fetch kid and verify ownership
  const { data: kid } = await supabase
    .from('kids')
    .select('*')
    .eq('id', kidId)
    .eq('parent_id', user.id)
    .single();

  if (!kid) {
    redirect(`/${locale}/admin`);
  }

  // Fetch all subjects with themes and activities
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('order_index');

  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .order('order_index');

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .order('order_index');

  // Fetch kid's progress
  const { data: progress } = await supabase
    .from('kid_progress')
    .select('*')
    .eq('kid_id', kidId);

  // Create progress map
  const progressMap = new Map<string, KidProgress>();
  progress?.forEach(p => progressMap.set(p.activity_id, p));

  // Calculate stats per subject
  interface SubjectStats {
    subject: Subject;
    themes: {
      theme: Theme;
      activities: (Activity & { progress?: KidProgress })[];
      completedCount: number;
    }[];
    totalActivities: number;
    completedActivities: number;
    totalScore: number;
    averageScore: number;
  }

  const subjectStats: SubjectStats[] = (subjects || []).map(subject => {
    const subjectThemes = (themes || []).filter(t => t.subject_id === subject.id);
    const themeData = subjectThemes.map(theme => {
      const themeActivities = (activities || [])
        .filter(a => a.theme_id === theme.id)
        .map(a => ({
          ...a,
          progress: progressMap.get(a.id),
        }));
      const completedCount = themeActivities.filter(a => a.progress?.status === 'completed').length;
      return { theme, activities: themeActivities, completedCount };
    });

    const totalActivities = themeData.reduce((sum, t) => sum + t.activities.length, 0);
    const completedActivities = themeData.reduce((sum, t) => sum + t.completedCount, 0);
    const scores = themeData
      .flatMap(t => t.activities)
      .filter(a => a.progress?.score != null)
      .map(a => a.progress!.score!);
    const totalScore = scores.reduce((sum, s) => sum + s, 0);
    const averageScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;

    return {
      subject,
      themes: themeData,
      totalActivities,
      completedActivities,
      totalScore,
      averageScore,
    };
  });

  const getLocalizedName = (obj: { name_ms: string; name_zh: string; name_en: string }) => {
    switch (locale) {
      case 'ms': return obj.name_ms;
      case 'zh': return obj.name_zh;
      case 'en': return obj.name_en;
      default: return obj.name_en;
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (locale) {
      case 'ms': return activity.title_ms;
      case 'zh': return activity.title_zh;
      case 'en': return activity.title_en;
      default: return activity.title_en;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ms' ? 'ms-MY' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStars = (score: number | null) => {
    if (score === null) return '';
    if (score >= 90) return '⭐⭐⭐';
    if (score >= 70) return '⭐⭐';
    if (score >= 50) return '⭐';
    return '';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={`/${locale}/kids`}>
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/admin`}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            {t('common.back')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Kid Header */}
          <div className="pixel-card mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-[#5D8731] rounded-lg flex items-center justify-center">
                  <span className="text-4xl">{kid.avatar_seed || '🧒'}</span>
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold">
                  Lv.{kid.level}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{kid.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>XP: <strong className="text-yellow-600">{kid.total_xp}</strong></span>
                  <span>|</span>
                  <span>
                    {locale === 'ms' ? 'Sekolah: ' : locale === 'zh' ? '学校：' : 'School: '}
                    {kid.school || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Progress Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="pixel-card text-center">
              <p className="text-3xl font-bold text-[#5D8731]">
                {subjectStats.reduce((sum, s) => sum + s.completedActivities, 0)}
              </p>
              <p className="text-sm text-gray-600">
                {locale === 'ms' ? 'Aktiviti Selesai' : locale === 'zh' ? '已完成活动' : 'Completed'}
              </p>
            </div>
            <div className="pixel-card text-center">
              <p className="text-3xl font-bold text-[#5DADE2]">
                {subjectStats.reduce((sum, s) => sum + s.totalActivities, 0)}
              </p>
              <p className="text-sm text-gray-600">
                {locale === 'ms' ? 'Jumlah Aktiviti' : locale === 'zh' ? '总活动数' : 'Total Activities'}
              </p>
            </div>
            <div className="pixel-card text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {(() => {
                  const allScores = subjectStats.flatMap(s =>
                    s.themes.flatMap(t =>
                      t.activities
                        .filter(a => a.progress?.score != null)
                        .map(a => a.progress!.score!)
                    )
                  );
                  return allScores.length > 0
                    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
                    : 0;
                })()}%
              </p>
              <p className="text-sm text-gray-600">
                {locale === 'ms' ? 'Skor Purata' : locale === 'zh' ? '平均分数' : 'Avg Score'}
              </p>
            </div>
            <div className="pixel-card text-center">
              <p className="text-3xl font-bold text-purple-500">
                {(() => {
                  const total = subjectStats.reduce((sum, s) => sum + s.totalActivities, 0);
                  const completed = subjectStats.reduce((sum, s) => sum + s.completedActivities, 0);
                  return total > 0 ? Math.round((completed / total) * 100) : 0;
                })()}%
              </p>
              <p className="text-sm text-gray-600">
                {locale === 'ms' ? 'Kemajuan' : locale === 'zh' ? '进度' : 'Progress'}
              </p>
            </div>
          </div>

          {/* Subject Progress Details */}
          {subjectStats.map(({ subject, themes, totalActivities, completedActivities, averageScore }) => (
            <div key={subject.id} className="pixel-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{subject.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: subject.color || '#333' }}>
                      {getLocalizedName(subject)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {completedActivities}/{totalActivities} {locale === 'ms' ? 'aktiviti' : locale === 'zh' ? '活动' : 'activities'}
                      {averageScore > 0 && ` • ${locale === 'ms' ? 'Purata' : locale === 'zh' ? '平均' : 'Avg'}: ${averageScore}%`}
                    </p>
                  </div>
                </div>
                <div className="w-24 h-3 bg-gray-200 rounded-full">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0}%`,
                      backgroundColor: subject.color || '#5D8731',
                    }}
                  />
                </div>
              </div>

              {/* Themes */}
              {themes.map(({ theme, activities: themeActivities, completedCount }) => (
                <div key={theme.id} className="mb-4 pl-4 border-l-4" style={{ borderColor: subject.color || '#5D8731' }}>
                  <h3 className="font-bold text-gray-700 mb-2">
                    {getLocalizedName(theme)}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({completedCount}/{themeActivities.length})
                    </span>
                  </h3>

                  <div className="space-y-2">
                    {themeActivities.map(activity => {
                      const prog = activity.progress;
                      const isCompleted = prog?.status === 'completed';
                      const isInProgress = prog?.status === 'in_progress';

                      return (
                        <div
                          key={activity.id}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isCompleted
                              ? 'bg-green-50 border border-green-200'
                              : isInProgress
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span className="text-xl">
                            {activityTypeIcons[activity.type as ActivityType]}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {getActivityTitle(activity)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.type} • {activity.xp_reward} XP
                            </p>
                          </div>
                          {isCompleted && (
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {prog.score}% {getStars(prog.score)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(prog.completed_at)}
                              </p>
                            </div>
                          )}
                          {isInProgress && (
                            <span className="text-sm text-blue-600 font-medium">
                              {locale === 'ms' ? 'Sedang berjalan' : locale === 'zh' ? '进行中' : 'In Progress'}
                            </span>
                          )}
                          {!isCompleted && !isInProgress && (
                            <span className="text-sm text-gray-400">
                              {locale === 'ms' ? 'Belum mula' : locale === 'zh' ? '未开始' : 'Not started'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
