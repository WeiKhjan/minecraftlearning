import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Subject, Theme, Locale, Equipment, Pet, LocalizedText } from '@/types';

// Extended theme type with rewards
interface ThemeWithRewards extends Theme {
  pet?: {
    id: string;
    name: LocalizedText;
    image_url: string | null;
    rarity: string;
  } | null;
}

// Helper to get pet name based on locale
function getPetName(pet: { name: LocalizedText } | null | undefined, locale: Locale): string {
  if (!pet) return '';
  return pet.name[locale] || pet.name.en;
}

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

  // Parallel fetch: kid verification and subject (independent queries)
  // Admin can access any kid, regular users can only access their own
  let kidQuery = supabase.from('kids').select('*').eq('id', kidId);
  if (!isAdmin) {
    kidQuery = kidQuery.eq('parent_id', user.id);
  }

  const [{ data: kid }, { data: subject }] = await Promise.all([
    kidQuery.single(),
    supabase
      .from('subjects')
      .select('*')
      .eq('code', code)
      .single()
  ]);

  if (!kid) {
    redirect(`/${locale}/kids`);
  }

  if (!subject) {
    notFound();
  }

  // Fetch themes for this subject with pet rewards
  const { data: themes } = await supabase
    .from('themes')
    .select('*, pet:pet_reward(id, name, image_url, rarity)')
    .eq('subject_id', subject.id)
    .order('order_index', { ascending: true });

  const themeIds = themes?.map(t => t.id) || [];

  // Parallel fetch: activities with equipment, progress, and pets
  const [{ data: allActivities }, { data: progress }] = await Promise.all([
    supabase
      .from('activities')
      .select('id, theme_id, equipment_reward_id, equipment:equipment_reward_id(id, name, name_ms, name_zh, name_en, image_url, rarity)')
      .in('theme_id', themeIds),
    supabase
      .from('kid_progress')
      .select('activity_id, status')
      .eq('kid_id', kidId)
  ]);

  // Group equipment rewards by theme
  type EquipmentReward = { id: string; name: string; name_ms: string | null; name_zh: string | null; name_en: string | null; image_url: string; rarity: string };
  const themeEquipment = new Map<string, EquipmentReward[]>();
  allActivities?.forEach(activity => {
    // Supabase may return equipment as array or object depending on the relationship
    const equipData = activity.equipment as unknown;
    const equip: EquipmentReward | null = Array.isArray(equipData) ? equipData[0] : equipData as EquipmentReward | null;
    if (equip && equip.id) {
      const current = themeEquipment.get(activity.theme_id) || [];
      // Avoid duplicates
      if (!current.find(e => e.id === equip.id)) {
        current.push(equip);
      }
      themeEquipment.set(activity.theme_id, current);
    }
  });

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
            href={`/${locale}/dashboard?kid=${kidId}`}
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
          <div className="pixel-card mb-6">
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
              themes.map((theme: ThemeWithRewards, index: number) => {
                const prog = themeProgress.get(theme.id) || { completed: 0, total: 0 };
                const progressPercent = prog.total > 0 ? (prog.completed / prog.total) * 100 : 0;
                // Admin bypasses locking
                const isLocked = !isAdmin && index > 0 && (themeProgress.get(themes[index - 1]?.id)?.completed || 0) < (themeProgress.get(themes[index - 1]?.id)?.total || 1);
                const equipment = themeEquipment.get(theme.id) || [];

                return (
                  <Link
                    key={theme.id}
                    href={isLocked ? '#' : `/${locale}/subject/${code}/theme/${theme.id}?kid=${kidId}`}
                    prefetch={!isLocked}
                    className={`pixel-card block transition-all ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:scale-[1.02] cursor-pointer'
                    }`}
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

                        {/* Rewards Section */}
                        {(theme.pet || equipment.length > 0) && (
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500 font-medium">
                              {locale === 'ms' ? 'Ganjaran:' : locale === 'zh' ? '奖励:' : 'Rewards:'}
                            </span>
                            {/* Pet Reward */}
                            {theme.pet && (() => {
                              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://glwxvgxgquwfgwbwqbiz.supabase.co';
                              const petImageUrl = theme.pet.image_url?.startsWith('http')
                                ? theme.pet.image_url
                                : theme.pet.image_url
                                  ? `${supabaseUrl}/storage/v1/object/public/images${theme.pet.image_url}`
                                  : null;
                              return (
                                <div className="bg-purple-100 p-1.5 rounded-lg" title={getPetName(theme.pet, locale as Locale)}>
                                  {petImageUrl ? (
                                    <img src={petImageUrl} alt={getPetName(theme.pet, locale as Locale)} className="w-8 h-8 object-contain" />
                                  ) : (
                                    <span className="text-lg">🐾</span>
                                  )}
                                </div>
                              );
                            })()}
                            {/* Equipment Rewards - Show all */}
                            {equipment.map((equip) => {
                              const equipName = locale === 'ms' ? equip.name_ms || equip.name : locale === 'zh' ? equip.name_zh || equip.name : equip.name_en || equip.name;
                              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://glwxvgxgquwfgwbwqbiz.supabase.co';
                              const imageUrl = equip.image_url?.startsWith('http')
                                ? equip.image_url
                                : `${supabaseUrl}/storage/v1/object/public/images${equip.image_url}`;
                              return (
                                <div
                                  key={equip.id}
                                  className="bg-yellow-100 p-1.5 rounded-lg"
                                  title={equipName}
                                >
                                  <img src={imageUrl} alt={equip.name} className="w-8 h-8 object-contain" />
                                </div>
                              );
                            })}
                          </div>
                        )}
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
              <div className="pixel-card text-center py-8">
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
