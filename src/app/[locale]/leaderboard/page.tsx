import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Locale } from '@/types';

// Type for leaderboard kid data from RPC function
interface LeaderboardKid {
  id: string;
  name: string;
  avatar_seed: string | null;
  generated_avatar_url: string | null;
  level: number;
  total_xp: number;
  grade: string;
  school: string | null;
}

// Grade display mapping
const gradeLabels: Record<string, { ms: string; zh: string; en: string }> = {
  primary_1: { ms: 'Darjah 1', zh: '一年级', en: 'Primary 1' },
  primary_2: { ms: 'Darjah 2', zh: '二年级', en: 'Primary 2' },
  primary_3: { ms: 'Darjah 3', zh: '三年级', en: 'Primary 3' },
  primary_4: { ms: 'Darjah 4', zh: '四年级', en: 'Primary 4' },
  primary_5: { ms: 'Darjah 5', zh: '五年级', en: 'Primary 5' },
  primary_6: { ms: 'Darjah 6', zh: '六年级', en: 'Primary 6' },
};

// Player titles based on level
function getPlayerTitle(level: number, locale: Locale): { title: string; color: string } {
  const titles: { minLevel: number; title: { ms: string; zh: string; en: string }; color: string }[] = [
    { minLevel: 1, title: { ms: 'Pemula', zh: '新手', en: 'Novice' }, color: '#808080' },
    { minLevel: 3, title: { ms: 'Pelajar', zh: '学徒', en: 'Apprentice' }, color: '#2ecc71' },
    { minLevel: 5, title: { ms: 'Penjelajah', zh: '探索者', en: 'Explorer' }, color: '#3498db' },
    { minLevel: 8, title: { ms: 'Pahlawan', zh: '战士', en: 'Warrior' }, color: '#9b59b6' },
    { minLevel: 12, title: { ms: 'Juara', zh: '冠军', en: 'Champion' }, color: '#e74c3c' },
    { minLevel: 16, title: { ms: 'Legenda', zh: '传奇', en: 'Legend' }, color: '#f39c12' },
    { minLevel: 20, title: { ms: 'Master', zh: '大师', en: 'Master' }, color: '#FFD700' },
  ];

  const playerTitle = [...titles].reverse().find(t => level >= t.minLevel) || titles[0];
  return { title: playerTitle.title[locale], color: playerTitle.color };
}

// Rank styling for top 3
function getRankStyle(rank: number): { bg: string; border: string; text: string; icon: string } {
  switch (rank) {
    case 1:
      return { bg: 'bg-gradient-to-r from-yellow-100 to-yellow-200', border: 'border-yellow-400', text: 'text-yellow-700', icon: '🥇' };
    case 2:
      return { bg: 'bg-gradient-to-r from-gray-100 to-gray-200', border: 'border-gray-400', text: 'text-gray-600', icon: '🥈' };
    case 3:
      return { bg: 'bg-gradient-to-r from-orange-100 to-orange-200', border: 'border-orange-400', text: 'text-orange-700', icon: '🥉' };
    default:
      return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-700', icon: '' };
  }
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kid?: string }>;
}) {
  const { locale } = await params;
  const { kid: kidId } = await searchParams;
  const t = await getTranslations();
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Fetch all kids for the leaderboard using RLS-bypassing function
  const { data: allKids, error: kidsError } = await supabase
    .rpc('get_leaderboard');

  if (kidsError) {
    console.error('Error fetching leaderboard:', kidsError);
  }

  // Fetch progress stats using RLS-bypassing function
  const { data: statsData, error: statsError } = await supabase
    .rpc('get_leaderboard_stats');

  if (statsError) {
    console.error('Error fetching leaderboard stats:', statsError);
  }

  // Build stats map from function results
  const statsMap = new Map<string, { completed: number; stars: number }>();
  statsData?.forEach((s: { kid_id: string; completed_count: number; total_stars: number }) => {
    statsMap.set(s.kid_id, {
      completed: Number(s.completed_count) || 0,
      stars: Number(s.total_stars) || 0,
    });
  });

  // Get total activities count
  const { count: totalActivities } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true });

  // Localized labels
  const pageTitle = locale === 'ms' ? 'Papan Pendahulu' : locale === 'zh' ? '排行榜' : 'Leaderboard';
  const rankLabel = locale === 'ms' ? 'Kedudukan' : locale === 'zh' ? '排名' : 'Rank';
  const playerLabel = locale === 'ms' ? 'Pemain' : locale === 'zh' ? '玩家' : 'Player';
  const schoolLabel = locale === 'ms' ? 'Sekolah' : locale === 'zh' ? '学校' : 'School';
  const gradeLabel = locale === 'ms' ? 'Darjah' : locale === 'zh' ? '年级' : 'Grade';
  const levelLabel = locale === 'ms' ? 'Tahap' : locale === 'zh' ? '等级' : 'Level';
  const xpLabel = 'XP';
  const starsLabel = locale === 'ms' ? 'Bintang' : locale === 'zh' ? '星星' : 'Stars';
  const progressLabel = locale === 'ms' ? 'Kemajuan' : locale === 'zh' ? '进度' : 'Progress';
  const titleLabel = locale === 'ms' ? 'Gelaran' : locale === 'zh' ? '称号' : 'Title';
  const backLabel = locale === 'ms' ? 'Kembali' : locale === 'zh' ? '返回' : 'Back';
  const noSchoolLabel = locale === 'ms' ? '-' : locale === 'zh' ? '-' : '-';

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={kidId ? `/${locale}/dashboard?kid=${kidId}` : `/${locale}/kids`} className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
          <span className="text-white font-bold text-xl drop-shadow-lg minecraft-font">MYLearnt</span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href={kidId ? `/${locale}/dashboard?kid=${kidId}` : `/${locale}/kids`}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            {backLabel}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg minecraft-font flex items-center justify-center gap-3">
              <span className="text-4xl">🏆</span>
              {pageTitle}
            </h1>
            <p className="text-white/80 text-sm mt-2">
              {locale === 'ms' ? `${allKids?.length || 0} pemain berdaftar` :
               locale === 'zh' ? `${allKids?.length || 0} 位玩家` :
               `${allKids?.length || 0} players registered`}
            </p>
          </div>

          {/* Leaderboard Table */}
          <div className="minecraft-card overflow-hidden">
            {/* Table Header */}
            <div className="bg-[#5D8731] text-white px-4 py-3 grid grid-cols-12 gap-2 text-xs font-bold">
              <div className="col-span-1 text-center">{rankLabel}</div>
              <div className="col-span-3">{playerLabel}</div>
              <div className="col-span-2">{schoolLabel}</div>
              <div className="col-span-1 text-center">{gradeLabel}</div>
              <div className="col-span-1 text-center">{levelLabel}</div>
              <div className="col-span-1 text-center">{xpLabel}</div>
              <div className="col-span-1 text-center">{starsLabel}</div>
              <div className="col-span-2">{titleLabel}</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {(allKids as LeaderboardKid[] | null)?.map((kid: LeaderboardKid, index: number) => {
                const rank = index + 1;
                const rankStyle = getRankStyle(rank);
                const stats = statsMap.get(kid.id) || { completed: 0, stars: 0 };
                const title = getPlayerTitle(kid.level, locale as Locale);
                const isCurrentKid = kid.id === kidId;
                const progress = totalActivities ? Math.round((stats.completed / totalActivities) * 100) : 0;

                return (
                  <div
                    key={kid.id}
                    className={`px-4 py-3 grid grid-cols-12 gap-2 items-center text-sm transition-all hover:bg-gray-50 ${
                      rankStyle.bg
                    } ${isCurrentKid ? 'ring-2 ring-[#5DADE2] ring-inset' : ''} border-l-4 ${rankStyle.border}`}
                  >
                    {/* Rank */}
                    <div className={`col-span-1 text-center font-black text-lg ${rankStyle.text}`}>
                      {rankStyle.icon || `#${rank}`}
                    </div>

                    {/* Player (Avatar + Name) */}
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex-shrink-0">
                        {kid.generated_avatar_url ? (
                          <img
                            src={kid.generated_avatar_url}
                            alt={kid.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {kid.avatar_seed || '🧒'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">
                          {kid.name}
                          {isCurrentKid && (
                            <span className="ml-1 text-xs bg-[#5DADE2] text-white px-1.5 py-0.5 rounded-full">
                              {locale === 'ms' ? 'ANDA' : locale === 'zh' ? '你' : 'YOU'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* School */}
                    <div className="col-span-2 text-gray-600 text-xs truncate" title={kid.school || ''}>
                      {kid.school || noSchoolLabel}
                    </div>

                    {/* Grade */}
                    <div className="col-span-1 text-center text-gray-600 text-xs">
                      {gradeLabels[kid.grade]?.[locale as Locale]?.replace('Primary ', 'P').replace('Darjah ', 'D') || kid.grade}
                    </div>

                    {/* Level */}
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center gap-0.5 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold text-xs">
                        <span>⭐</span>
                        {kid.level}
                      </span>
                    </div>

                    {/* XP */}
                    <div className="col-span-1 text-center font-bold text-gray-700 text-xs">
                      {kid.total_xp.toLocaleString()}
                    </div>

                    {/* Stars */}
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center gap-0.5 text-yellow-500 font-bold text-xs">
                        {stats.stars}⭐
                      </span>
                    </div>

                    {/* Title */}
                    <div className="col-span-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full inline-block truncate max-w-full"
                        style={{
                          color: title.color,
                          backgroundColor: `${title.color}20`,
                          border: `1px solid ${title.color}40`,
                        }}
                      >
                        {title.title}
                      </span>
                    </div>
                  </div>
                );
              })}

              {(!allKids || allKids.length === 0) && (
                <div className="px-4 py-8 text-center text-gray-500">
                  {locale === 'ms' ? 'Tiada pemain lagi' : locale === 'zh' ? '还没有玩家' : 'No players yet'}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex justify-center gap-4 text-xs text-white/80">
            <span className="flex items-center gap-1">🥇 {locale === 'ms' ? 'Pertama' : locale === 'zh' ? '第一名' : '1st Place'}</span>
            <span className="flex items-center gap-1">🥈 {locale === 'ms' ? 'Kedua' : locale === 'zh' ? '第二名' : '2nd Place'}</span>
            <span className="flex items-center gap-1">🥉 {locale === 'ms' ? 'Ketiga' : locale === 'zh' ? '第三名' : '3rd Place'}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
