import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Kid, Subject, Locale, EquipmentSlot, EquipmentTier } from '@/types';

// Equipment image base URL
const EQUIPMENT_IMAGE_BASE = 'https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/equipment';

// Get equipment image URL based on tier and slot
function getEquipmentImageUrl(tier: EquipmentTier, slot: EquipmentSlot): string {
  const tierToSwordPrefix: Record<EquipmentTier, string> = {
    leather: 'wooden',
    chain: 'stone',
    iron: 'iron',
    gold: 'gold',
    diamond: 'diamond',
  };

  if (slot === 'weapon') {
    return `${EQUIPMENT_IMAGE_BASE}/${tierToSwordPrefix[tier]}_sword.png`;
  }
  return `${EQUIPMENT_IMAGE_BASE}/${tier}_${slot}.png`;
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

// Get subject name based on locale
function getSubjectName(subject: Subject, locale: Locale): string {
  switch (locale) {
    case 'ms':
      return subject.name_ms;
    case 'zh':
      return subject.name_zh;
    case 'en':
      return subject.name_en;
    default:
      return subject.name_en;
  }
}

export default async function DashboardPage({
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

  // Redirect if no kid selected
  if (!kidId) {
    redirect(`/${locale}/kids`);
  }

  // Fetch the selected kid (verify ownership)
  const { data: kid, error: kidError } = await supabase
    .from('kids')
    .select('*')
    .eq('id', kidId)
    .eq('parent_id', user.id)
    .single();

  if (kidError || !kid) {
    redirect(`/${locale}/kids`);
  }

  // Fetch kid's equipped items
  const { data: equippedRaw } = await supabase
    .from('kid_equipped')
    .select(`
      helmet:helmet_id(id, tier, slot),
      chestplate:chestplate_id(id, tier, slot),
      leggings:leggings_id(id, tier, slot),
      boots:boots_id(id, tier, slot),
      weapon:weapon_id(id, tier, slot)
    `)
    .eq('kid_id', kidId)
    .single();

  // Helper to extract equipment from Supabase response (handles both object and array formats)
  const getEquipment = (item: unknown): { id: string; tier: EquipmentTier; slot: string } | null => {
    if (!item) return null;
    if (Array.isArray(item)) return item[0] || null;
    return item as { id: string; tier: EquipmentTier; slot: string };
  };

  const equipped = equippedRaw ? {
    helmet: getEquipment(equippedRaw.helmet),
    chestplate: getEquipment(equippedRaw.chestplate),
    leggings: getEquipment(equippedRaw.leggings),
    boots: getEquipment(equippedRaw.boots),
    weapon: getEquipment(equippedRaw.weapon),
  } : null;

  // Calculate correct level based on XP and fix if mismatched
  // Level formula: XP thresholds are 0, 100, 300, 600, 1000... (triangular numbers * 100)
  // Inverse: level = floor((1 + sqrt(1 + 8 * XP / 100)) / 2)
  const calculateLevel = (xp: number) => Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * xp / 100)) / 2));
  const correctLevel = calculateLevel(kid.total_xp);

  // Auto-fix level if it's incorrect
  if (kid.level !== correctLevel) {
    await supabase
      .from('kids')
      .update({ level: correctLevel })
      .eq('id', kid.id);
    kid.level = correctLevel; // Update local object too
  }

  // Fetch subjects with their themes and activity counts
  const { data: subjects } = await supabase
    .from('subjects')
    .select(`
      *,
      themes (
        id,
        activities (id)
      )
    `)
    .order('order_index', { ascending: true });

  // Fetch kid's completed activities with their theme and subject info
  const { data: kidProgress } = await supabase
    .from('kid_progress')
    .select(`
      activity_id,
      status,
      activities (
        theme_id,
        themes (
          subject_id
        )
      )
    `)
    .eq('kid_id', kidId)
    .eq('status', 'completed');

  // Calculate total activities per subject
  const activityCountsPerSubject = new Map<string, { total: number; completed: number }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subjects?.forEach((subject: any) => {
    const totalActivities = subject.themes?.reduce((sum: number, theme: { activities?: { id: string }[] }) =>
      sum + (theme.activities?.length || 0), 0) || 0;
    activityCountsPerSubject.set(subject.id, { total: totalActivities, completed: 0 });
  });

  // Count completed activities per subject
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kidProgress?.forEach((progress: any) => {
    // Supabase returns singular object for belongs-to relations
    const subjectId = progress.activities?.themes?.subject_id;
    if (subjectId) {
      const counts = activityCountsPerSubject.get(subjectId);
      if (counts) {
        counts.completed += 1;
      }
    }
  });

  // Calculate XP needed for next level
  // Level thresholds: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 300 XP, Level 4 = 600 XP, etc.
  // Formula: XP to reach level N = sum of (100 * i) for i from 1 to N-1 = 100 * (N-1) * N / 2
  const getXPForLevel = (level: number) => level <= 1 ? 0 : 100 * (level - 1) * level / 2;
  const currentLevelXP = getXPForLevel(kid.level);
  const nextLevelXP = getXPForLevel(kid.level + 1);
  const xpForCurrentLevel = Math.max(0, kid.total_xp - currentLevelXP);
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const levelProgress = xpNeededForLevel > 0 ? Math.min((xpForCurrentLevel / xpNeededForLevel) * 100, 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={`/${locale}/kids`} className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
          <span className="text-white font-bold text-xl drop-shadow-lg minecraft-font">MYLearnt</span>
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
            href={`/${locale}/kids`}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            {t('auth.selectKid')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Kid Profile Card */}
          <div className="minecraft-card mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-[#5D8731] rounded-lg flex items-center justify-center overflow-hidden">
                {kid.generated_avatar_url ? (
                  <img
                    src={kid.generated_avatar_url}
                    alt={kid.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{kid.avatar_seed || '🧒'}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">
                  {t('dashboard.greeting', { name: kid.name })}
                </h1>
                <p className="text-gray-600">
                  {gradeLabels[kid.grade]?.[locale as Locale] || kid.grade}
                  {kid.school && ` • ${kid.school}`}
                </p>
              </div>

              {/* Level & XP */}
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-yellow-500 text-xl">⭐</span>
                  <span className="text-xl font-bold text-gray-800">
                    {t('dashboard.level')} {kid.level}
                  </span>
                </div>
                <div className="mt-1 w-32">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5D8731] h-2 rounded-full transition-all"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('dashboard.xpProgress', {
                      current: xpForCurrentLevel,
                      total: xpNeededForLevel,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <h2 className="text-xl font-bold text-white drop-shadow-lg mb-4">
            {t('dashboard.progress')}
          </h2>

          {/* Subjects Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {subjects?.map((subject: any) => {
              const counts = activityCountsPerSubject.get(subject.id);
              const completedCount = counts?.completed || 0;
              const totalCount = counts?.total || 0;
              const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <Link
                  key={subject.id}
                  href={`/${locale}/subject/${subject.code}?kid=${kidId}`}
                  className="minecraft-card hover:scale-105 transition-transform cursor-pointer"
                >
                  {/* Icon */}
                  <div
                    className="w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center text-4xl"
                    style={{ backgroundColor: subject.color || '#5D8731' }}
                  >
                    {subject.icon}
                  </div>

                  {/* Subject Name */}
                  <h3 className="font-bold text-gray-800 text-center mb-2">
                    {getSubjectName(subject, locale as Locale)}
                  </h3>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-[#5D8731] h-2 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {t('subjects.progress', {
                      completed: completedCount,
                      total: totalCount,
                    })}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Character Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white drop-shadow-lg mb-4">
              {t('dashboard.myCharacter')}
            </h2>

            <div className="minecraft-card">
              <div className="flex items-center justify-center gap-8">
                {/* Character placeholder */}
                <div className="text-center">
                  <div className="w-32 h-32 bg-[#5D8731] rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                    {kid.generated_avatar_url ? (
                      <img
                        src={kid.generated_avatar_url}
                        alt={kid.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">{kid.avatar_seed || '🧒'}</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{kid.name}</p>
                </div>

                {/* Equipment slots preview */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                      equipped?.helmet ? 'bg-gray-100 border-[#5D8731]' : 'bg-gray-300 border-gray-400'
                    }`}
                    title={t('character.helmet')}
                  >
                    {equipped?.helmet ? (
                      <Image
                        src={getEquipmentImageUrl(equipped.helmet.tier, 'helmet')}
                        alt="Helmet"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xl text-gray-400">🪖</span>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                      equipped?.weapon ? 'bg-gray-100 border-[#5D8731]' : 'bg-gray-300 border-gray-400'
                    }`}
                    title={t('character.weapon')}
                  >
                    {equipped?.weapon ? (
                      <Image
                        src={getEquipmentImageUrl(equipped.weapon.tier, 'weapon')}
                        alt="Weapon"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xl text-gray-400">⚔️</span>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                      equipped?.chestplate ? 'bg-gray-100 border-[#5D8731]' : 'bg-gray-300 border-gray-400'
                    }`}
                    title={t('character.chestplate')}
                  >
                    {equipped?.chestplate ? (
                      <Image
                        src={getEquipmentImageUrl(equipped.chestplate.tier, 'chestplate')}
                        alt="Chestplate"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xl text-gray-400">🦺</span>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                      equipped?.boots ? 'bg-gray-100 border-[#5D8731]' : 'bg-gray-300 border-gray-400'
                    }`}
                    title={t('character.boots')}
                  >
                    {equipped?.boots ? (
                      <Image
                        src={getEquipmentImageUrl(equipped.boots.tier, 'boots')}
                        alt="Boots"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xl text-gray-400">👢</span>
                    )}
                  </div>
                </div>

                {/* View character button */}
                <Link
                  href={`/${locale}/character?kid=${kidId}`}
                  className="minecraft-button"
                >
                  {t('dashboard.viewAll')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
