import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import CharacterClient from '@/components/character/CharacterClient';
import type { Kid, Equipment, KidEquipped, Locale } from '@/types';

export default async function CharacterPage({
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

  // Redirect if no kid selected (check early)
  if (!kidId) {
    redirect(`/${locale}/kids`);
  }

  // Check authentication - middleware validates session, but we need user.id
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
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

  // Parallel fetch: equipped items, inventory, pets, equipment, and progress stats
  const [
    { data: equippedData, error: equippedError },
    { data: inventory },
    { data: ownedPets },
    { data: allEquipment },
    { data: progressStats },
    { count: totalActivities }
  ] = await Promise.all([
    supabase
      .from('kid_equipped')
      .select('*, helmet:helmet_id(*), chestplate:chestplate_id(*), leggings:leggings_id(*), boots:boots_id(*), weapon:weapon_id(*), tool:tool_id(*), ranged:ranged_id(*), shield:shield_id(*), pet:pet_id(*)')
      .eq('kid_id', kidId)
      .maybeSingle(),
    supabase
      .from('kid_inventory')
      .select('*, equipment:equipment_id(*)')
      .eq('kid_id', kidId),
    supabase
      .from('kid_pets')
      .select('*, pet:pet_id(*)')
      .eq('kid_id', kidId),
    supabase
      .from('equipment')
      .select('*')
      .order('required_level', { ascending: true }),
    supabase
      .from('kid_progress')
      .select('status, score, stars')
      .eq('kid_id', kidId),
    supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
  ]);

  // Calculate progress statistics
  const completedActivities = progressStats?.filter(p => p.status === 'completed').length || 0;
  const totalStars = progressStats?.reduce((sum, p) => sum + (p.stars || 0), 0) || 0;
  const avgScore = progressStats?.length
    ? Math.round(progressStats.filter(p => p.score !== null).reduce((sum, p) => sum + (p.score || 0), 0) / progressStats.filter(p => p.score !== null).length)
    : 0;

  // Create kid_equipped row if it doesn't exist
  let equipped = equippedData;
  if (!equipped && !equippedError) {
    const { data: newEquipped } = await supabase
      .from('kid_equipped')
      .insert({ kid_id: kidId })
      .select('*, helmet:helmet_id(*), chestplate:chestplate_id(*), leggings:leggings_id(*), boots:boots_id(*), weapon:weapon_id(*), tool:tool_id(*), ranged:ranged_id(*), shield:shield_id(*), pet:pet_id(*)')
      .single();
    equipped = newEquipped;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={`/${locale}/dashboard?kid=${kidId}`} className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
          <span className="text-white font-bold text-xl drop-shadow-lg pixel-font">MYLearnt</span>
        </Link>
        <div className="flex items-center gap-4">
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
      <div className="flex-1 px-4 py-2 lg:py-3 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full">
          <h1 className="text-xl lg:text-2xl font-bold text-white drop-shadow-lg mb-2 lg:mb-3 text-center">
            {t('character.title')}
          </h1>

          <CharacterClient
            kid={kid}
            equipped={equipped}
            inventory={inventory || []}
            ownedPets={ownedPets || []}
            allEquipment={allEquipment || []}
            locale={locale as Locale}
            stats={{
              completedActivities,
              totalActivities: totalActivities || 0,
              totalStars,
              avgScore,
            }}
            translations={{
              equipment: t('character.equipment'),
              inventory: t('character.inventory'),
              equip: t('character.equip'),
              unequip: t('character.unequip'),
              helmet: t('character.helmet'),
              chestplate: t('character.chestplate'),
              leggings: t('character.leggings'),
              boots: t('character.boots'),
              weapon: t('character.weapon'),
              pet: locale === 'ms' ? 'Pet' : locale === 'zh' ? '宠物' : 'Pet',
              noEquipment: t('character.noEquipment'),
              noPets: locale === 'ms' ? 'Tiada pet lagi' : locale === 'zh' ? '还没有宠物' : 'No pets yet',
              levelRequired: locale === 'ms' ? 'Tahap diperlukan' : locale === 'zh' ? '所需等级' : 'Level required',
            }}
          />
        </div>
      </div>
    </main>
  );
}
