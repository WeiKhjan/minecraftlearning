'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Kid, Equipment, KidInventory, Locale, EquipmentSlot, EquipmentTier, Pet, KidPet, PetRarity } from '@/types';
import { TIER_COLORS } from '@/types';

// Image base URLs
const PET_IMAGE_BASE = 'https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/pets';

// Equipment image base URL
const EQUIPMENT_IMAGE_BASE = 'https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/equipment';

// Get equipment image URL based on tier and slot
function getEquipmentImageUrl(tier: EquipmentTier, slot: EquipmentSlot): string {
  // Images are stored as {tier}_{slot}.png
  return `${EQUIPMENT_IMAGE_BASE}/${tier}_${slot}.png`;
}

// Get tier color from TIER_COLORS
function getTierColor(tier: EquipmentTier): string {
  return TIER_COLORS[tier]?.primary || '#808080';
}

// Get tier background color (lighter version)
function getTierBgColor(tier: EquipmentTier): string {
  return TIER_COLORS[tier]?.secondary || '#D0D0D0';
}

// Rarity colors
const rarityColors: Record<string, string> = {
  common: '#808080',
  rare: '#3498db',
  epic: '#9b59b6',
  legendary: '#f39c12',
};

// Pet rarity colors (including uncommon)
const petRarityColors: Record<PetRarity, string> = {
  common: '#808080',
  uncommon: '#2ecc71',
  rare: '#3498db',
  epic: '#9b59b6',
  legendary: '#f39c12',
};

// Pet rarity background colors
const petRarityBgColors: Record<PetRarity, string> = {
  common: '#E0E0E0',
  uncommon: '#D5F5E3',
  rare: '#D6EAF8',
  epic: '#E8DAEF',
  legendary: '#FEF5E7',
};

// Get pet image URL
function getPetImageUrl(petId: string): string {
  return `${PET_IMAGE_BASE}/${petId}.png`;
}

interface CharacterClientProps {
  kid: Kid;
  equipped: {
    kid_id: string;
    helmet?: Equipment | null;
    chestplate?: Equipment | null;
    leggings?: Equipment | null;
    boots?: Equipment | null;
    weapon?: Equipment | null;
    tool?: Equipment | null;
    ranged?: Equipment | null;
    shield?: Equipment | null;
    pet?: Pet | null;
  } | null;
  inventory: (KidInventory & { equipment: Equipment })[];
  ownedPets: (KidPet & { pet: Pet })[];
  allEquipment: Equipment[];
  locale: Locale;
  stats: {
    completedActivities: number;
    totalActivities: number;
    totalStars: number;
    avgScore: number;
  };
  translations: {
    equipment: string;
    inventory: string;
    equip: string;
    unequip: string;
    helmet: string;
    chestplate: string;
    leggings: string;
    boots: string;
    weapon: string;
    pet: string;
    noEquipment: string;
    noPets: string;
    levelRequired: string;
  };
}

// XP thresholds for each level (cumulative)
const XP_THRESHOLDS = [0, 100, 250, 500, 850, 1300, 1900, 2700, 3700, 5000, 6500, 8500, 11000, 14000, 18000, 23000, 29000, 36000, 44000, 55000, 70000];

// Get XP needed for next level
function getXPForNextLevel(level: number): number {
  return XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
}

// Get XP needed for current level
function getXPForCurrentLevel(level: number): number {
  return XP_THRESHOLDS[Math.max(0, level - 1)] || 0;
}

// Calculate XP progress percentage within current level
function getXPProgress(totalXP: number, level: number): number {
  const currentLevelXP = getXPForCurrentLevel(level);
  const nextLevelXP = getXPForNextLevel(level);
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  return Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));
}

// Player titles based on level
function getPlayerTitle(level: number, locale: Locale): { title: string; color: string } {
  const titles: { minLevel: number; title: { ms: string; zh: string; en: string }; color: string }[] = [
    { minLevel: 1, title: { ms: 'Pengembaraan Baharu', zh: '新手冒险者', en: 'Novice Adventurer' }, color: '#808080' },
    { minLevel: 3, title: { ms: 'Pelajar Rajin', zh: '勤奋学徒', en: 'Eager Apprentice' }, color: '#2ecc71' },
    { minLevel: 5, title: { ms: 'Penjelajah Berani', zh: '勇敢探索者', en: 'Brave Explorer' }, color: '#3498db' },
    { minLevel: 8, title: { ms: 'Pahlawan Bijak', zh: '智慧战士', en: 'Wise Warrior' }, color: '#9b59b6' },
    { minLevel: 12, title: { ms: 'Pendekar Mahir', zh: '技艺大师', en: 'Skilled Champion' }, color: '#e74c3c' },
    { minLevel: 16, title: { ms: 'Legenda Muda', zh: '青年传奇', en: 'Rising Legend' }, color: '#f39c12' },
    { minLevel: 20, title: { ms: 'Master Legenda', zh: '传奇大师', en: 'Legendary Master' }, color: '#FFD700' },
  ];

  const playerTitle = [...titles].reverse().find(t => level >= t.minLevel) || titles[0];
  return { title: playerTitle.title[locale], color: playerTitle.color };
}

function getEquipmentName(equipment: Equipment | null | undefined, locale: Locale): string {
  if (!equipment) return '';
  switch (locale) {
    case 'ms': return equipment.name_ms || equipment.name;
    case 'zh': return equipment.name_zh || equipment.name;
    case 'en': return equipment.name_en || equipment.name;
    default: return equipment.name;
  }
}

function getPetName(pet: Pet | null | undefined, locale: Locale): string {
  if (!pet) return '';
  return pet.name[locale] || pet.name.en;
}

// Minecraft-style slot component
function EquipmentSlotBox({
  item,
  slot,
  slotName,
  isSelected,
  onClick,
  locale,
}: {
  item: Equipment | null;
  slot: EquipmentSlot;
  slotName: string;
  isSelected: boolean;
  onClick: () => void;
  locale: Locale;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-14 h-14 sm:w-16 sm:h-16
        bg-[#8B8B8B] rounded-sm
        border-[3px] transition-all duration-150
        hover:scale-105 hover:brightness-110
        ${isSelected
          ? 'border-[#5DADE2] ring-2 ring-[#5DADE2] ring-offset-1'
          : 'border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#555555] border-b-[#555555]'
        }
      `}
      style={{
        boxShadow: 'inset -2px -2px 0 #373737, inset 2px 2px 0 #C6C6C6',
        backgroundColor: item ? getTierBgColor(item.tier) : '#8B8B8B',
      }}
      title={item ? getEquipmentName(item, locale) : slotName}
    >
      {/* Inner darker area */}
      <div className="absolute inset-1 bg-[#373737]/30 rounded-sm flex items-center justify-center">
        {item ? (
          <Image
            src={getEquipmentImageUrl(item.tier, slot)}
            alt={getEquipmentName(item, locale)}
            width={40}
            height={40}
            className="object-contain drop-shadow-lg"
          />
        ) : (
          <div className="text-[#555555]/50 text-[10px] font-bold text-center leading-tight">
            {slotName}
          </div>
        )}
      </div>

      {/* Tier indicator */}
      {item && (
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white shadow-md"
          style={{ backgroundColor: getTierColor(item.tier) }}
        >
          {item.tier.charAt(0).toUpperCase()}
        </div>
      )}
    </button>
  );
}

export default function CharacterClient({
  kid,
  equipped,
  inventory,
  ownedPets,
  allEquipment,
  locale,
  stats,
  translations,
}: CharacterClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'equipped' | 'inventory' | 'pets'>('equipped');
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [isPetSlotSelected, setIsPetSlotSelected] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(kid.generated_avatar_url);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const slots: EquipmentSlot[] = ['helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool', 'ranged', 'shield'];
  const slotNames: Partial<Record<EquipmentSlot, string>> = {
    helmet: translations.helmet,
    chestplate: translations.chestplate,
    leggings: translations.leggings,
    boots: translations.boots,
    weapon: translations.weapon,
    tool: 'Tool',
    ranged: 'Ranged',
    shield: 'Shield',
  };

  const getEquippedItem = (slot: EquipmentSlot): Equipment | null => {
    if (!equipped) return null;
    return equipped[slot] as Equipment | null;
  };

  const getInventoryForSlot = (slot: EquipmentSlot): Equipment[] => {
    return inventory
      .filter(inv => inv.equipment?.slot === slot)
      .map(inv => inv.equipment);
  };

  const handleEquip = async (equipment: Equipment) => {
    setIsUpdating(true);
    const supabase = createClient();

    try {
      // First, check if kid_equipped row exists
      const { data: existingRow } = await supabase
        .from('kid_equipped')
        .select('kid_id')
        .eq('kid_id', kid.id)
        .maybeSingle();

      if (existingRow) {
        // Update existing row
        const { error } = await supabase
          .from('kid_equipped')
          .update({ [`${equipment.slot}_id`]: equipment.id })
          .eq('kid_id', kid.id);

        if (error) console.error('[CharacterClient] Equip update error:', error);
      } else {
        // Insert new row
        const { error } = await supabase
          .from('kid_equipped')
          .insert({ kid_id: kid.id, [`${equipment.slot}_id`]: equipment.id });

        if (error) console.error('[CharacterClient] Equip insert error:', error);
      }
    } catch (err) {
      console.error('[CharacterClient] Equip error:', err);
    }

    router.refresh();
    setIsUpdating(false);
    setSelectedSlot(null);
  };

  const handleUnequip = async (slot: EquipmentSlot) => {
    setIsUpdating(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('kid_equipped')
        .update({ [`${slot}_id`]: null })
        .eq('kid_id', kid.id);

      if (error) console.error('[CharacterClient] Unequip error:', error);
    } catch (err) {
      console.error('[CharacterClient] Unequip error:', err);
    }

    router.refresh();
    setIsUpdating(false);
  };

  const handleEquipPet = async (petId: string) => {
    setIsUpdating(true);
    const supabase = createClient();

    try {
      // First, check if kid_equipped row exists
      const { data: existingRow } = await supabase
        .from('kid_equipped')
        .select('kid_id')
        .eq('kid_id', kid.id)
        .maybeSingle();

      if (existingRow) {
        // Update existing row
        const { error } = await supabase
          .from('kid_equipped')
          .update({ pet_id: petId })
          .eq('kid_id', kid.id);

        if (error) console.error('[CharacterClient] Equip pet update error:', error);
      } else {
        // Insert new row
        const { error } = await supabase
          .from('kid_equipped')
          .insert({ kid_id: kid.id, pet_id: petId });

        if (error) console.error('[CharacterClient] Equip pet insert error:', error);
      }
    } catch (err) {
      console.error('[CharacterClient] Equip pet error:', err);
    }

    router.refresh();
    setIsUpdating(false);
    setIsPetSlotSelected(false);
  };

  const handleUnequipPet = async () => {
    setIsUpdating(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('kid_equipped')
        .update({ pet_id: null })
        .eq('kid_id', kid.id);

      if (error) console.error('[CharacterClient] Unequip pet error:', error);
    } catch (err) {
      console.error('[CharacterClient] Unequip pet error:', err);
    }

    router.refresh();
    setIsUpdating(false);
  };

  const getEquippedPet = (): Pet | null => {
    return equipped?.pet as Pet | null;
  };

  // Generate AI avatar
  const handleGenerateAvatar = async () => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const equipmentData = {
        helmet: equipped?.helmet ? { name: equipped.helmet.name, tier: equipped.helmet.tier } : null,
        chestplate: equipped?.chestplate ? { name: equipped.chestplate.name, tier: equipped.chestplate.tier } : null,
        leggings: equipped?.leggings ? { name: equipped.leggings.name, tier: equipped.leggings.tier } : null,
        boots: equipped?.boots ? { name: equipped.boots.name, tier: equipped.boots.tier } : null,
        weapon: equipped?.weapon ? { name: equipped.weapon.name, tier: equipped.weapon.tier } : null,
      };

      // Include equipped pet in avatar generation
      const equippedPet = getEquippedPet();
      const petData = equippedPet ? {
        name: getPetName(equippedPet, locale),
        mobType: equippedPet.mob_type,
        rarity: equippedPet.rarity,
      } : null;

      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kidId: kid.id,
          avatarFace: kid.avatar_seed || 'happy smiling child',
          equipment: equipmentData,
          pet: petData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate avatar');
      }

      if (result.avatarUrl) {
        setGeneratedAvatar(result.avatarUrl);
      } else if (result.imageData) {
        setGeneratedAvatar(result.imageData);
      }

      router.refresh();
    } catch (error) {
      console.error('Avatar generation error:', error);
      setGenerateError(
        locale === 'ms' ? 'Gagal menjana avatar. Sila cuba lagi.' :
        locale === 'zh' ? '生成头像失败。请重试。' :
        'Failed to generate avatar. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Get owned equipment IDs
  const ownedEquipmentIds = new Set(inventory.map(inv => inv.equipment_id));

  // Localized labels
  const generateLabel = locale === 'ms' ? 'Jana Avatar AI' :
    locale === 'zh' ? '生成AI头像' : 'Generate AI Avatar';
  const regenerateLabel = locale === 'ms' ? 'Jana Semula' :
    locale === 'zh' ? '重新生成' : 'Regenerate';
  const generatingLabel = locale === 'ms' ? 'Menjana...' :
    locale === 'zh' ? '生成中...' : 'Generating...';
  const aiAvatarTitle = locale === 'ms' ? 'Avatar AI' :
    locale === 'zh' ? 'AI头像' : 'AI Avatar';
  const clickToEquipLabel = locale === 'ms' ? 'Klik slot untuk melengkapkan' :
    locale === 'zh' ? '点击插槽装备' : 'Click slot to equip';

  return (
    <div className="space-y-3">
      {/* ===== TOP SECTION: Player Header Bar ===== */}
      <div className="minecraft-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left: Name + Level + Title */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <div className="flex items-center gap-1 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 px-3 py-1.5 rounded-lg shadow-lg border-2 border-yellow-600">
                <span className="text-yellow-100 text-[10px] font-medium">LV</span>
                <span className="text-white font-black text-lg drop-shadow-md">{kid.level}</span>
              </div>
              <div className="absolute -top-1 -right-1 text-yellow-300 text-[10px] animate-pulse">✦</div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 minecraft-font">{kid.name}</h2>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                style={{
                  color: getPlayerTitle(kid.level, locale).color,
                  backgroundColor: `${getPlayerTitle(kid.level, locale).color}20`,
                  border: `1px solid ${getPlayerTitle(kid.level, locale).color}40`,
                }}
              >
                {getPlayerTitle(kid.level, locale).title}
              </span>
            </div>
          </div>

          {/* Center: XP Progress Bar */}
          <div className="flex-1 lg:max-w-md">
            <div className="bg-gray-800 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400 font-medium">
                  {locale === 'ms' ? 'Pengalaman' : locale === 'zh' ? '经验值' : 'XP'}
                </span>
                <span className="text-yellow-400 font-bold">
                  {kid.total_xp.toLocaleString()} / {getXPForNextLevel(kid.level).toLocaleString()}
                </span>
              </div>
              <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getXPProgress(kid.total_xp, kid.level)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white drop-shadow-md">
                    {Math.round(getXPProgress(kid.total_xp, kid.level))}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] text-gray-500">
                <span>Lv.{kid.level}</span>
                <span>{getXPForNextLevel(kid.level) - kid.total_xp} XP {locale === 'ms' ? 'lagi' : locale === 'zh' ? '还需' : 'to go'}</span>
                <span>Lv.{kid.level + 1}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="flex gap-2 lg:gap-3">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg px-3 py-2 text-center border border-blue-500/20 min-w-[60px]">
              <div className="text-base font-black text-blue-500">{stats.completedActivities}</div>
              <div className="text-[9px] text-gray-500 font-medium">
                {locale === 'ms' ? 'Selesai' : locale === 'zh' ? '完成' : 'Done'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 rounded-lg px-3 py-2 text-center border border-yellow-500/20 min-w-[60px]">
              <div className="text-base font-black text-yellow-500 flex items-center justify-center gap-0.5">
                {stats.totalStars}<span className="text-xs">⭐</span>
              </div>
              <div className="text-[9px] text-gray-500 font-medium">
                {locale === 'ms' ? 'Bintang' : locale === 'zh' ? '星星' : 'Stars'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-lg px-3 py-2 text-center border border-green-500/20 min-w-[60px]">
              <div className="text-base font-black text-green-500">{stats.avgScore}%</div>
              <div className="text-[9px] text-gray-500 font-medium">
                {locale === 'ms' ? 'Purata' : locale === 'zh' ? '平均' : 'Avg'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT: 3 Equal Columns ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Column 1: Character Display */}
        <div className="minecraft-card p-4">
          <div className="flex flex-col items-center gap-3">
            {/* Avatar + Pet Row */}
            <div className="flex items-end gap-3">
              {/* Avatar Frame */}
              <div className="relative">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-4"
                  style={{
                    borderColor: '#555555',
                    boxShadow: 'inset -3px -3px 0 #373737, inset 3px 3px 0 #C6C6C6, 0 4px 12px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(135deg, #6B8E23 0%, #556B2F 100%)',
                  }}
                >
                  {generatedAvatar ? (
                    <Image
                      src={generatedAvatar}
                      alt={`${kid.name}'s Avatar`}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                      unoptimized={generatedAvatar.startsWith('data:')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">{kid.avatar_seed || '😊'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pet Slot */}
              <button
                onClick={() => { setIsPetSlotSelected(!isPetSlotSelected); setSelectedSlot(null); }}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 bg-[#8B8B8B] rounded-lg border-[3px] transition-all duration-150 hover:scale-105 hover:brightness-110
                  ${isPetSlotSelected ? 'border-[#F39C12] ring-2 ring-[#F39C12] ring-offset-1' : 'border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#555555] border-b-[#555555]'}`}
                style={{
                  boxShadow: 'inset -2px -2px 0 #373737, inset 2px 2px 0 #C6C6C6',
                  backgroundColor: getEquippedPet() ? petRarityBgColors[getEquippedPet()!.rarity] : '#8B8B8B',
                }}
                title={getEquippedPet() ? getPetName(getEquippedPet(), locale) : translations.pet}
              >
                <div className="absolute inset-1 bg-[#373737]/30 rounded flex items-center justify-center">
                  {getEquippedPet() ? (
                    <Image src={getPetImageUrl(getEquippedPet()!.id)} alt={getPetName(getEquippedPet(), locale)} width={40} height={40} className="object-contain drop-shadow-lg" />
                  ) : (
                    <div className="text-[#555555]/50 text-[9px] font-bold text-center">{translations.pet}</div>
                  )}
                </div>
                {getEquippedPet() && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white border border-white shadow-md"
                    style={{ backgroundColor: petRarityColors[getEquippedPet()!.rarity] }}>
                    {getEquippedPet()!.rarity.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </div>

            {/* Equipment Slots - Compact Horizontal Layout */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {slots.map(slot => (
                <EquipmentSlotBox
                  key={slot}
                  item={getEquippedItem(slot)}
                  slot={slot}
                  slotName={slotNames[slot] || slot}
                  isSelected={selectedSlot === slot}
                  onClick={() => { setSelectedSlot(selectedSlot === slot ? null : slot); setIsPetSlotSelected(false); }}
                  locale={locale}
                />
              ))}
            </div>

            <p className="text-[10px] text-gray-500 text-center">{clickToEquipLabel}</p>

            {/* Unequip Buttons */}
            {selectedSlot && getEquippedItem(selectedSlot) && (
              <button onClick={() => handleUnequip(selectedSlot)} disabled={isUpdating}
                className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 font-bold text-sm transition-all shadow-md">
                {translations.unequip} {slotNames[selectedSlot] || selectedSlot}
              </button>
            )}
            {isPetSlotSelected && getEquippedPet() && (
              <button onClick={handleUnequipPet} disabled={isUpdating}
                className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 font-bold text-sm transition-all shadow-md">
                {translations.unequip} {translations.pet}
              </button>
            )}
          </div>
        </div>

        {/* Column 2: AI Avatar Generator */}
        <div className="minecraft-card p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>✨</span> {aiAvatarTitle}
          </h3>

          <div className="flex flex-col items-center gap-3">
            {/* AI Avatar Display */}
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-4"
              style={{
                borderColor: '#5D8731',
                boxShadow: 'inset -2px -2px 0 #373737, inset 2px 2px 0 #8BC34A',
              }}
            >
              {generatedAvatar ? (
                <Image src={generatedAvatar} alt={`${kid.name}'s AI Avatar`} width={128} height={128}
                  className="w-full h-full object-cover" unoptimized={generatedAvatar.startsWith('data:')} />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">🎨</span>
                </div>
              )}
            </div>

            {/* Current Equipment Summary */}
            <div className="flex flex-wrap justify-center gap-1">
              {slots.map(slot => {
                const item = getEquippedItem(slot);
                return item ? (
                  <div key={slot} className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ backgroundColor: getTierBgColor(item.tier) }} title={slotNames[slot] || slot}>
                    <Image src={getEquipmentImageUrl(item.tier, slot)} alt={slotNames[slot] || slot} width={20} height={20} className="object-contain" />
                  </div>
                ) : (
                  <div key={slot} className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center" title={slotNames[slot] || slot}>
                    <span className="text-gray-400 text-[10px]">-</span>
                  </div>
                );
              })}
            </div>

            {generateError && (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg w-full text-center">{generateError}</div>
            )}

            <button onClick={handleGenerateAvatar} disabled={isGenerating}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md">
              {isGenerating ? (
                <><span className="animate-spin">⏳</span>{generatingLabel}</>
              ) : (
                <><span>✨</span>{generatedAvatar ? regenerateLabel : generateLabel}</>
              )}
            </button>
          </div>
        </div>

        {/* Column 3: Inventory & Equipment */}
        <div className="minecraft-card p-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button onClick={() => setActiveTab('equipped')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'equipped' ? 'bg-[#5D8731] text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              {translations.equipment}
            </button>
            <button onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-[#5D8731] text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              {translations.inventory}
            </button>
            <button onClick={() => setActiveTab('pets')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'pets' ? 'bg-[#F39C12] text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              {translations.pet}
            </button>
          </div>

          {/* Equipment Selection (when slot selected) */}
          {selectedSlot && activeTab === 'equipped' && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5DADE2]"></span>
                {slotNames[selectedSlot]}
              </h3>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {getInventoryForSlot(selectedSlot).length > 0 ? (
                  getInventoryForSlot(selectedSlot).map(equipment => (
                    <button key={equipment.id} onClick={() => handleEquip(equipment)} disabled={isUpdating}
                      className="w-full flex items-center gap-2 p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-[#5D8731] transition-all disabled:opacity-50 text-left">
                      <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: getTierBgColor(equipment.tier) }}>
                        <Image src={getEquipmentImageUrl(equipment.tier, equipment.slot)} alt={getEquipmentName(equipment, locale)} width={32} height={32} className="object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: rarityColors[equipment.rarity] }}>{getEquipmentName(equipment, locale)}</p>
                        <p className="text-[10px] text-gray-500">{equipment.tier}</p>
                      </div>
                      <span className="text-[#5D8731] font-bold text-xs bg-[#5D8731]/10 px-2 py-1 rounded">{translations.equip}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg text-sm">{translations.noEquipment}</p>
                )}
              </div>
            </div>
          )}

          {/* Full Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {inventory.length > 0 ? (
                inventory.map(inv => (
                  <div key={inv.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: tierBgColors[inv.equipment.tier] }}>
                      <Image src={getEquipmentImageUrl(inv.equipment.tier, inv.equipment.slot)} alt={getEquipmentName(inv.equipment, locale)} width={32} height={32} className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: rarityColors[inv.equipment.rarity] }}>{getEquipmentName(inv.equipment, locale)}</p>
                      <p className="text-[10px] text-gray-500">{slotNames[inv.equipment.slot as EquipmentSlot]} • {inv.equipment.tier}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg text-sm">{translations.noEquipment}</p>
              )}
            </div>
          )}

          {/* Equipment Collection Preview */}
          {activeTab === 'equipped' && !selectedSlot && !isPetSlotSelected && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-700 text-sm">
                {locale === 'ms' ? 'Koleksi Peralatan' : locale === 'zh' ? '装备收藏' : 'Equipment Collection'}
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {allEquipment.slice(0, 10).map(equipment => {
                  const owned = ownedEquipmentIds.has(equipment.id);
                  const canUse = kid.level >= equipment.required_level;
                  return (
                    <div key={equipment.id}
                      className={`aspect-square rounded flex items-center justify-center relative border-2 transition-all ${owned ? 'border-[#5D8731] bg-gray-50' : 'border-gray-300 bg-gray-200 opacity-60'}`}
                      title={getEquipmentName(equipment, locale)}>
                      <Image src={getEquipmentImageUrl(equipment.tier, equipment.slot)} alt={getEquipmentName(equipment, locale)} width={28} height={28} className="object-contain" />
                      {!canUse && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                          <span className="text-[9px] text-white font-bold">Lv.{equipment.required_level}</span>
                        </div>
                      )}
                      {owned && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#5D8731] rounded-full flex items-center justify-center">
                          <span className="text-white text-[8px]">✓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pet Selection */}
          {isPetSlotSelected && activeTab === 'equipped' && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F39C12]"></span>
                {translations.pet}
              </h3>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {ownedPets.length > 0 ? (
                  ownedPets.map(kidPet => (
                    <button key={kidPet.id} onClick={() => handleEquipPet(kidPet.pet_id)} disabled={isUpdating}
                      className="w-full flex items-center gap-2 p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-[#F39C12] transition-all disabled:opacity-50 text-left">
                      <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: petRarityBgColors[kidPet.pet.rarity] }}>
                        <Image src={getPetImageUrl(kidPet.pet.id)} alt={getPetName(kidPet.pet, locale)} width={32} height={32} className="object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: petRarityColors[kidPet.pet.rarity] }}>{getPetName(kidPet.pet, locale)}</p>
                        <p className="text-[10px] text-gray-500">{kidPet.pet.rarity}</p>
                      </div>
                      <span className="text-[#F39C12] font-bold text-xs bg-[#F39C12]/10 px-2 py-1 rounded">{translations.equip}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg text-sm">{translations.noPets}</p>
                )}
              </div>
            </div>
          )}

          {/* Pets Tab Content */}
          {activeTab === 'pets' && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {ownedPets.length > 0 ? (
                ownedPets.map(kidPet => (
                  <div key={kidPet.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: petRarityBgColors[kidPet.pet.rarity] }}>
                      <Image src={getPetImageUrl(kidPet.pet.id)} alt={getPetName(kidPet.pet, locale)} width={32} height={32} className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: petRarityColors[kidPet.pet.rarity] }}>{getPetName(kidPet.pet, locale)}</p>
                      <p className="text-[10px] text-gray-500">{kidPet.pet.rarity} • {kidPet.pet.mob_type}</p>
                    </div>
                    {getEquippedPet()?.id === kidPet.pet.id && (
                      <span className="text-[#F39C12] font-bold text-xs bg-[#F39C12]/10 px-2 py-1 rounded">✓</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg text-sm">{translations.noPets}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
