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

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Redirect if no kid selected
  if (!kidId) {
    redirect(`/${locale}/kids`);
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

  // Fetch kid's equipped items
  const { data: equipped } = await supabase
    .from('kid_equipped')
    .select('*, helmet:helmet_id(*), chestplate:chestplate_id(*), leggings:leggings_id(*), boots:boots_id(*), weapon:weapon_id(*)')
    .eq('kid_id', kidId)
    .single();

  // Fetch kid's inventory with equipment details
  const { data: inventory } = await supabase
    .from('kid_inventory')
    .select('*, equipment:equipment_id(*)')
    .eq('kid_id', kidId);

  // Fetch all equipment for reference
  const { data: allEquipment } = await supabase
    .from('equipment')
    .select('*')
    .order('required_level', { ascending: true });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href={`/${locale}/dashboard?kid=${kidId}`} className="text-2xl font-bold text-white drop-shadow-lg">
          MineCraft Learning
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
            allEquipment={allEquipment || []}
            locale={locale as Locale}
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
              noEquipment: t('character.noEquipment'),
              levelRequired: locale === 'ms' ? 'Tahap diperlukan' : locale === 'zh' ? '所需等级' : 'Level required',
            }}
          />
        </div>
      </div>
    </main>
  );
}
