import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Kid } from '@/types';

// Grade display mapping
const gradeLabels: Record<string, { ms: string; zh: string; en: string }> = {
  primary_1: { ms: 'Darjah 1', zh: '一年级', en: 'Primary 1' },
  primary_2: { ms: 'Darjah 2', zh: '二年级', en: 'Primary 2' },
  primary_3: { ms: 'Darjah 3', zh: '三年级', en: 'Primary 3' },
  primary_4: { ms: 'Darjah 4', zh: '四年级', en: 'Primary 4' },
  primary_5: { ms: 'Darjah 5', zh: '五年级', en: 'Primary 5' },
  primary_6: { ms: 'Darjah 6', zh: '六年级', en: 'Primary 6' },
};

export default async function KidsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Fetch kids for this parent
  const { data: kids, error: kidsError } = await supabase
    .from('kids')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true });

  if (kidsError) {
    console.error('Error fetching kids:', kidsError);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          MineCraft Learning
        </h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <form action={`/${locale}/auth/signout`} method="POST">
            <button
              type="submit"
              className="text-white hover:text-gray-200 text-sm underline"
            >
              {t('auth.signOut')}
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
              {t('kids.selectKid')}
            </h2>
            <p className="text-white/80">
              {t('kids.selectKidDescription')}
            </p>
          </div>

          {/* Kids Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {kids && kids.length > 0 ? (
              kids.map((kid: Kid) => (
                <Link
                  key={kid.id}
                  href={`/dashboard?kid=${kid.id}`}
                  className="minecraft-card hover:scale-105 transition-transform cursor-pointer text-center"
                >
                  {/* Avatar */}
                  <div className="w-20 h-20 mx-auto mb-3 bg-[#5D8731] rounded-lg flex items-center justify-center">
                    <span className="text-4xl">
                      {kid.avatar_seed || '🧒'}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-gray-800 text-lg mb-1">
                    {kid.name}
                  </h3>

                  {/* Grade */}
                  <p className="text-sm text-gray-600">
                    {gradeLabels[kid.grade]?.[locale as 'ms' | 'zh' | 'en'] || kid.grade}
                  </p>

                  {/* Level */}
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium text-gray-700">
                      Level {kid.level}
                    </span>
                  </div>

                  {/* XP Bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5D8731] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((kid.total_xp % 100), 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {kid.total_xp} XP
                  </p>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-6xl mb-4">🧒</div>
                <p className="text-white text-lg">
                  {t('kids.noKids')}
                </p>
              </div>
            )}

            {/* Add New Kid Card */}
            <Link
              href="/kids/new"
              className="minecraft-card hover:scale-105 transition-transform cursor-pointer text-center border-2 border-dashed border-gray-300 bg-white/50"
            >
              <div className="w-20 h-20 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-4xl text-gray-400">➕</span>
              </div>
              <h3 className="font-bold text-gray-600 text-lg">
                {t('kids.addKid')}
              </h3>
            </Link>
          </div>

          {/* Footer info */}
          <div className="text-center text-white/60 text-sm">
            <p>{t('kids.clickToPlay')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
