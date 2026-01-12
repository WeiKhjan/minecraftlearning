import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import KidCard from '@/components/kids/KidCard';
import type { Kid, Locale } from '@/types';

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

  // Check if user is admin
  const { data: parent } = await supabase
    .from('parents')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const isAdmin = parent?.is_admin === true;

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
        <Link href={`/${locale}/kids`}>
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin`}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            {locale === 'ms' ? 'Panel Kemajuan' : locale === 'zh' ? '进度面板' : 'Progress'}
          </Link>
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
                <KidCard key={kid.id} kid={kid} locale={locale as Locale} />
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
              href={`/${locale}/kids/new`}
              prefetch={true}
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
