import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Kid, Subject, Locale } from '@/types';

interface KidWithProgress extends Kid {
  totalActivities: number;
  completedActivities: number;
  lastActiveAt: string | null;
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  // Check authentication and admin status
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Get parent data to check admin status
  const { data: parent } = await supabase
    .from('parents')
    .select('*')
    .eq('id', user.id)
    .single();

  // For now, allow all parents to access admin (for their own kids)
  // In production, check is_admin for full access

  // Fetch all kids for this parent
  const { data: kids } = await supabase
    .from('kids')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch all subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('order_index');

  // Fetch progress data for all kids
  const kidIds = kids?.map(k => k.id) || [];
  const { data: progress } = kidIds.length > 0
    ? await supabase
        .from('kid_progress')
        .select('*')
        .in('kid_id', kidIds)
    : { data: [] };

  // Fetch all activities count
  const { count: totalActivitiesCount } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true });

  // Calculate progress for each kid
  const kidsWithProgress: KidWithProgress[] = (kids || []).map(kid => {
    const kidProgress = progress?.filter(p => p.kid_id === kid.id) || [];
    const completedActivities = kidProgress.filter(p => p.status === 'completed').length;
    const lastActivity = kidProgress
      .filter(p => p.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];

    return {
      ...kid,
      totalActivities: totalActivitiesCount || 0,
      completedActivities,
      lastActiveAt: lastActivity?.completed_at || null,
    };
  });

  const getSubjectName = (subject: Subject) => {
    switch (locale) {
      case 'ms': return subject.name_ms;
      case 'zh': return subject.name_zh;
      case 'en': return subject.name_en;
      default: return subject.name_en;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ms' ? 'ms-MY' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const gradeLabels: Record<string, string> = {
    primary_1: locale === 'ms' ? 'Darjah 1' : locale === 'zh' ? '一年级' : 'Grade 1',
    primary_2: locale === 'ms' ? 'Darjah 2' : locale === 'zh' ? '二年级' : 'Grade 2',
    primary_3: locale === 'ms' ? 'Darjah 3' : locale === 'zh' ? '三年级' : 'Grade 3',
    primary_4: locale === 'ms' ? 'Darjah 4' : locale === 'zh' ? '四年级' : 'Grade 4',
    primary_5: locale === 'ms' ? 'Darjah 5' : locale === 'zh' ? '五年级' : 'Grade 5',
    primary_6: locale === 'ms' ? 'Darjah 6' : locale === 'zh' ? '六年级' : 'Grade 6',
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
            href={`/${locale}/kids`}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            {t('common.back')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-6 text-center">
            {locale === 'ms' ? 'Panel Kemajuan' : locale === 'zh' ? '进度面板' : 'Progress Dashboard'}
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="minecraft-card text-center">
              <p className="text-3xl font-bold text-[#5D8731]">{kidsWithProgress.length}</p>
              <p className="text-sm text-gray-600">
                {locale === 'ms' ? 'Jumlah Anak' : locale === 'zh' ? '孩子总数' : 'Total Kids'}
              </p>
            </div>
            <div className="minecraft-card text-center">
              <p className="text-3xl font-bold text-[#5DADE2]">
                {kidsWithProgress.reduce((sum, k) => sum + k.completedActivities, 0)}
              </p>
              <p className="text-sm text-gray-600">
                {locale === 'ms' ? 'Aktiviti Selesai' : locale === 'zh' ? '已完成活动' : 'Completed Activities'}
              </p>
            </div>
            <div className="minecraft-card text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {kidsWithProgress.reduce((sum, k) => sum + k.total_xp, 0)}
              </p>
              <p className="text-sm text-gray-600">
                {locale === 'ms' ? 'Jumlah XP' : locale === 'zh' ? '总经验值' : 'Total XP'}
              </p>
            </div>
            <div className="minecraft-card text-center">
              <p className="text-3xl font-bold text-purple-500">{subjects?.length || 0}</p>
              <p className="text-sm text-gray-600">
                {locale === 'ms' ? 'Subjek' : locale === 'zh' ? '科目' : 'Subjects'}
              </p>
            </div>
          </div>

          {/* Kids Progress Table */}
          <div className="minecraft-card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {locale === 'ms' ? 'Kemajuan Anak' : locale === 'zh' ? '孩子进度' : 'Kids Progress'}
            </h2>

            {kidsWithProgress.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {locale === 'ms' ? 'Tiada profil anak lagi' : locale === 'zh' ? '还没有孩子档案' : 'No kid profiles yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2">
                        {locale === 'ms' ? 'Nama' : locale === 'zh' ? '名字' : 'Name'}
                      </th>
                      <th className="text-center py-3 px-2">
                        {locale === 'ms' ? 'Darjah' : locale === 'zh' ? '年级' : 'Grade'}
                      </th>
                      <th className="text-center py-3 px-2">
                        {locale === 'ms' ? 'Tahap' : locale === 'zh' ? '等级' : 'Level'}
                      </th>
                      <th className="text-center py-3 px-2">XP</th>
                      <th className="text-center py-3 px-2">
                        {locale === 'ms' ? 'Kemajuan' : locale === 'zh' ? '进度' : 'Progress'}
                      </th>
                      <th className="text-center py-3 px-2">
                        {locale === 'ms' ? 'Aktiviti Terakhir' : locale === 'zh' ? '最后活动' : 'Last Active'}
                      </th>
                      <th className="text-center py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {kidsWithProgress.map(kid => {
                      const progressPercent = kid.totalActivities > 0
                        ? Math.round((kid.completedActivities / kid.totalActivities) * 100)
                        : 0;

                      return (
                        <tr key={kid.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{kid.avatar_seed || '🧒'}</span>
                              <span className="font-medium">{kid.name}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2 text-sm">
                            {gradeLabels[kid.grade] || kid.grade}
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-bold">
                              {kid.level}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2 font-bold text-yellow-600">
                            {kid.total_xp}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-[#5D8731] rounded-full transition-all"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-10">
                                {progressPercent}%
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-gray-500">
                            {formatDate(kid.lastActiveAt)}
                          </td>
                          <td className="text-center py-3 px-2">
                            <Link
                              href={`/${locale}/admin/kid/${kid.id}`}
                              className="text-[#5DADE2] hover:text-[#4A9ACF] font-medium text-sm"
                            >
                              {locale === 'ms' ? 'Lihat' : locale === 'zh' ? '查看' : 'View'}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subjects Overview */}
          <div className="minecraft-card mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {locale === 'ms' ? 'Subjek Tersedia' : locale === 'zh' ? '可用科目' : 'Available Subjects'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects?.map(subject => (
                <div
                  key={subject.id}
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: (subject.color || '#5D8731') + '20' }}
                >
                  <span className="text-3xl block mb-2">{subject.icon}</span>
                  <p className="font-bold" style={{ color: subject.color || '#5D8731' }}>
                    {getSubjectName(subject)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
