'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Kid, Equipment, KidInventory, Locale, EquipmentSlot, EquipmentTier } from '@/types';

// Equipment image base URL
const EQUIPMENT_IMAGE_BASE = 'https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/equipment';

// Get equipment image URL based on tier and slot
function getEquipmentImageUrl(tier: EquipmentTier, slot: EquipmentSlot): string {
  // Map slot to actual equipment piece name
  const slotToName: Record<EquipmentSlot, string> = {
    helmet: 'helmet',
    chestplate: 'chestplate',
    leggings: 'leggings',
    boots: 'boots',
    weapon: 'sword',
  };

  // Map tier to sword prefix
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
  return `${EQUIPMENT_IMAGE_BASE}/${tier}_${slotToName[slot]}.png`;
}

// Fallback emojis for when no equipment is equipped
const slotEmojis: Record<EquipmentSlot, string> = {
  helmet: '🪖',
  chestplate: '🦺',
  leggings: '👖',
  boots: '👢',
  weapon: '⚔️',
};

// Tier colors for equipment
const tierColors: Record<EquipmentTier, string> = {
  leather: '#8B4513',
  chain: '#A9A9A9',
  iron: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#5DADE2',
};

// Tier gradient colors for body parts
const tierGradients: Record<EquipmentTier, { main: string; highlight: string; shadow: string }> = {
  leather: { main: '#8B4513', highlight: '#A0522D', shadow: '#5D3A1A' },
  chain: { main: '#A9A9A9', highlight: '#C0C0C0', shadow: '#808080' },
  iron: { main: '#C0C0C0', highlight: '#E0E0E0', shadow: '#909090' },
  gold: { main: '#FFD700', highlight: '#FFE44D', shadow: '#C4A600' },
  diamond: { main: '#5DADE2', highlight: '#85C1E9', shadow: '#3498DB' },
};

// Rarity colors
const rarityColors: Record<string, string> = {
  common: '#808080',
  rare: '#3498db',
  epic: '#9b59b6',
  legendary: '#f39c12',
};

interface CharacterClientProps {
  kid: Kid;
  equipped: {
    kid_id: string;
    helmet?: Equipment | null;
    chestplate?: Equipment | null;
    leggings?: Equipment | null;
    boots?: Equipment | null;
    weapon?: Equipment | null;
  } | null;
  inventory: (KidInventory & { equipment: Equipment })[];
  allEquipment: Equipment[];
  locale: Locale;
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
    noEquipment: string;
    levelRequired: string;
  };
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

export default function CharacterClient({
  kid,
  equipped,
  inventory,
  allEquipment,
  locale,
  translations,
}: CharacterClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'equipped' | 'inventory'>('equipped');
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(kid.generated_avatar_url);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const slots: EquipmentSlot[] = ['helmet', 'chestplate', 'leggings', 'boots', 'weapon'];
  const slotNames: Record<EquipmentSlot, string> = {
    helmet: translations.helmet,
    chestplate: translations.chestplate,
    leggings: translations.leggings,
    boots: translations.boots,
    weapon: translations.weapon,
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

    // Upsert equipped item
    const updateData: Record<string, string | null> = {
      kid_id: kid.id,
      [`${equipment.slot}_id`]: equipment.id,
    };

    await supabase
      .from('kid_equipped')
      .upsert(updateData, { onConflict: 'kid_id' });

    router.refresh();
    setIsUpdating(false);
    setSelectedSlot(null);
  };

  const handleUnequip = async (slot: EquipmentSlot) => {
    setIsUpdating(true);
    const supabase = createClient();

    await supabase
      .from('kid_equipped')
      .update({ [`${slot}_id`]: null })
      .eq('kid_id', kid.id);

    router.refresh();
    setIsUpdating(false);
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

      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kidId: kid.id,
          avatarFace: kid.avatar_seed || 'happy smiling child',
          equipment: equipmentData,
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

  // Get equipment for each slot
  const helmetEquipped = getEquippedItem('helmet');
  const chestplateEquipped = getEquippedItem('chestplate');
  const leggingsEquipped = getEquippedItem('leggings');
  const bootsEquipped = getEquippedItem('boots');
  const weaponEquipped = getEquippedItem('weapon');

  // Localized labels
  const generateLabel = locale === 'ms' ? 'Jana Avatar AI' :
    locale === 'zh' ? '生成AI头像' : 'Generate AI Avatar';
  const regenerateLabel = locale === 'ms' ? 'Jana Semula' :
    locale === 'zh' ? '重新生成' : 'Regenerate';
  const generatingLabel = locale === 'ms' ? 'Menjana...' :
    locale === 'zh' ? '生成中...' : 'Generating...';
  const aiAvatarTitle = locale === 'ms' ? 'Avatar AI' :
    locale === 'zh' ? 'AI头像' : 'AI Avatar';

  return (
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:h-[calc(100vh-120px)]">
      {/* Character Display */}
      <div className="minecraft-card lg:col-span-1 lg:overflow-hidden">
          <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">
            {kid.name}
          </h2>

          {/* Full Body Character Avatar */}
          <div className="flex justify-center mb-2 lg:mb-4">
            <div className="relative">
              {/* Level Badge */}
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold z-20">
                Lv.{kid.level}
              </div>

              {/* Character Body Container */}
              <div className="flex flex-col items-center">
                {/* Weapon (left side) */}
                <div className="absolute left-[-40px] top-[70px] z-10">
                  <button
                    onClick={() => setSelectedSlot(selectedSlot === 'weapon' ? null : 'weapon')}
                    className={`w-12 h-24 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
                      selectedSlot === 'weapon' ? 'ring-4 ring-[#5DADE2]' : ''
                    }`}
                    style={{
                      backgroundColor: weaponEquipped
                        ? tierGradients[weaponEquipped.tier].main
                        : '#9CA3AF',
                    }}
                    title={weaponEquipped ? getEquipmentName(weaponEquipped, locale) : translations.weapon}
                  >
                    {weaponEquipped ? (
                      <Image
                        src={getEquipmentImageUrl(weaponEquipped.tier, 'weapon')}
                        alt={getEquipmentName(weaponEquipped, locale)}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-2xl">🔲</span>
                    )}
                  </button>
                </div>

                {/* Head/Helmet */}
                <button
                  onClick={() => setSelectedSlot(selectedSlot === 'helmet' ? null : 'helmet')}
                  className={`w-20 h-20 rounded-lg flex items-center justify-center transition-all hover:scale-105 relative ${
                    selectedSlot === 'helmet' ? 'ring-4 ring-[#5DADE2]' : ''
                  }`}
                  style={{
                    backgroundColor: helmetEquipped
                      ? tierGradients[helmetEquipped.tier].main
                      : '#FBBF24',
                  }}
                  title={helmetEquipped ? getEquipmentName(helmetEquipped, locale) : translations.helmet}
                >
                  {helmetEquipped ? (
                    <>
                      <Image
                        src={getEquipmentImageUrl(helmetEquipped.tier, 'helmet')}
                        alt={getEquipmentName(helmetEquipped, locale)}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                      <div
                        className="absolute bottom-1 w-8 h-4 rounded"
                        style={{ backgroundColor: '#FBBF24' }}
                      >
                        <span className="text-xs">{kid.avatar_seed || '😊'}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-4xl">{kid.avatar_seed || '😊'}</span>
                  )}
                </button>

                {/* Torso/Chestplate */}
                <button
                  onClick={() => setSelectedSlot(selectedSlot === 'chestplate' ? null : 'chestplate')}
                  className={`w-24 h-28 -mt-1 rounded-lg flex items-center justify-center transition-all hover:scale-105 relative ${
                    selectedSlot === 'chestplate' ? 'ring-4 ring-[#5DADE2]' : ''
                  }`}
                  style={{
                    backgroundColor: chestplateEquipped
                      ? tierGradients[chestplateEquipped.tier].main
                      : '#5D8731',
                  }}
                  title={chestplateEquipped ? getEquipmentName(chestplateEquipped, locale) : translations.chestplate}
                >
                  {chestplateEquipped ? (
                    <div className="flex flex-col items-center">
                      <Image
                        src={getEquipmentImageUrl(chestplateEquipped.tier, 'chestplate')}
                        alt={getEquipmentName(chestplateEquipped, locale)}
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                      <span
                        className="text-xs font-bold mt-1 px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: tierGradients[chestplateEquipped.tier].shadow,
                          color: 'white'
                        }}
                      >
                        {chestplateEquipped.tier.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-20 bg-[#4A7229] rounded-md" />
                    </div>
                  )}
                  {/* Arms */}
                  <div
                    className="absolute left-[-12px] top-2 w-3 h-20 rounded-full"
                    style={{
                      backgroundColor: chestplateEquipped
                        ? tierGradients[chestplateEquipped.tier].shadow
                        : '#4A7229',
                    }}
                  />
                  <div
                    className="absolute right-[-12px] top-2 w-3 h-20 rounded-full"
                    style={{
                      backgroundColor: chestplateEquipped
                        ? tierGradients[chestplateEquipped.tier].shadow
                        : '#4A7229',
                    }}
                  />
                </button>

                {/* Legs/Leggings */}
                <button
                  onClick={() => setSelectedSlot(selectedSlot === 'leggings' ? null : 'leggings')}
                  className={`w-20 h-24 -mt-1 rounded-b-lg flex items-center justify-center transition-all hover:scale-105 relative ${
                    selectedSlot === 'leggings' ? 'ring-4 ring-[#5DADE2]' : ''
                  }`}
                  style={{
                    backgroundColor: leggingsEquipped
                      ? tierGradients[leggingsEquipped.tier].main
                      : '#3B82F6',
                  }}
                  title={leggingsEquipped ? getEquipmentName(leggingsEquipped, locale) : translations.leggings}
                >
                  {leggingsEquipped ? (
                    <Image
                      src={getEquipmentImageUrl(leggingsEquipped.tier, 'leggings')}
                      alt={getEquipmentName(leggingsEquipped, locale)}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex gap-1">
                      <div className="w-6 h-20 bg-[#2563EB] rounded-b-md" />
                      <div className="w-6 h-20 bg-[#2563EB] rounded-b-md" />
                    </div>
                  )}
                </button>

                {/* Feet/Boots */}
                <button
                  onClick={() => setSelectedSlot(selectedSlot === 'boots' ? null : 'boots')}
                  className={`w-24 h-10 -mt-1 rounded-b-lg flex items-center justify-center gap-2 transition-all hover:scale-105 ${
                    selectedSlot === 'boots' ? 'ring-4 ring-[#5DADE2]' : ''
                  }`}
                  style={{
                    backgroundColor: bootsEquipped
                      ? tierGradients[bootsEquipped.tier].main
                      : '#78350F',
                  }}
                  title={bootsEquipped ? getEquipmentName(bootsEquipped, locale) : translations.boots}
                >
                  {bootsEquipped ? (
                    <Image
                      src={getEquipmentImageUrl(bootsEquipped.tier, 'boots')}
                      alt={getEquipmentName(bootsEquipped, locale)}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  ) : (
                    <>
                      <div className="w-8 h-6 bg-[#92400E] rounded-md" />
                      <div className="w-8 h-6 bg-[#92400E] rounded-md" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Equipment Slot Legend */}
          <div className="flex flex-wrap justify-center gap-1 lg:gap-2 mt-2 text-xs">
            {slots.map(slot => {
              const item = getEquippedItem(slot);
              return (
                <div
                  key={slot}
                  onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                  className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-all ${
                    selectedSlot === slot
                      ? 'bg-[#5DADE2] text-white'
                      : item
                        ? 'bg-[#5D8731]/20 text-[#5D8731]'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {item ? (
                    <Image
                      src={getEquipmentImageUrl(item.tier, slot)}
                      alt={slotNames[slot]}
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  ) : (
                    <span>{slotEmojis[slot]}</span>
                  )}
                  <span>{slotNames[slot]}</span>
                  {item && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tierColors[item.tier] }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Unequip Button */}
          {selectedSlot && getEquippedItem(selectedSlot) && (
            <button
              onClick={() => handleUnequip(selectedSlot)}
              disabled={isUpdating}
              className="mt-2 w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 text-sm"
            >
              {translations.unequip} {slotNames[selectedSlot]}
            </button>
          )}
      </div>

      {/* Inventory Panel */}
      <div className="minecraft-card lg:col-span-1 lg:overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('equipped')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-sm ${
                activeTab === 'equipped'
                  ? 'bg-[#5D8731] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.equipment}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-sm ${
                activeTab === 'inventory'
                  ? 'bg-[#5D8731] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.inventory}
            </button>
          </div>

          {/* Equipment Selection (when slot selected) */}
          {selectedSlot && activeTab === 'equipped' && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-700 text-sm">
                {slotNames[selectedSlot]}
              </h3>
              <div className="space-y-2 max-h-48 lg:max-h-[calc(100vh-280px)] overflow-y-auto">
                {getInventoryForSlot(selectedSlot).length > 0 ? (
                  getInventoryForSlot(selectedSlot).map(equipment => (
                    <button
                      key={equipment.id}
                      onClick={() => handleEquip(equipment)}
                      disabled={isUpdating}
                      className="w-full flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#5D8731] transition-all disabled:opacity-50"
                    >
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center"
                        style={{ backgroundColor: tierColors[equipment.tier] + '40' }}
                      >
                        <Image
                          src={getEquipmentImageUrl(equipment.tier, equipment.slot)}
                          alt={getEquipmentName(equipment, locale)}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold" style={{ color: rarityColors[equipment.rarity] }}>
                          {getEquipmentName(equipment, locale)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {equipment.tier.charAt(0).toUpperCase() + equipment.tier.slice(1)}
                        </p>
                      </div>
                      <span className="text-[#5D8731] font-bold">
                        {translations.equip}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {translations.noEquipment}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Full Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-2 max-h-48 lg:max-h-[calc(100vh-280px)] overflow-y-auto">
              {inventory.length > 0 ? (
                inventory.map(inv => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: tierColors[inv.equipment.tier] + '40' }}
                    >
                      <Image
                        src={getEquipmentImageUrl(inv.equipment.tier, inv.equipment.slot)}
                        alt={getEquipmentName(inv.equipment, locale)}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: rarityColors[inv.equipment.rarity] }}>
                        {getEquipmentName(inv.equipment, locale)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {slotNames[inv.equipment.slot as EquipmentSlot]} • {inv.equipment.tier}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {translations.noEquipment}
                </p>
              )}
            </div>
          )}

          {/* All Equipment Preview */}
          {activeTab === 'equipped' && !selectedSlot && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-700 mb-2 text-sm">
                {locale === 'ms' ? 'Klik pada badan untuk menukar peralatan' :
                  locale === 'zh' ? '点击身体部位更换装备' :
                  'Click on body parts to change equipment'}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {allEquipment.slice(0, 10).map(equipment => {
                  const owned = ownedEquipmentIds.has(equipment.id);
                  const canUse = kid.level >= equipment.required_level;

                  return (
                    <div
                      key={equipment.id}
                      className={`aspect-square rounded flex items-center justify-center relative ${
                        owned
                          ? 'bg-gray-100'
                          : 'bg-gray-300 opacity-50'
                      }`}
                      title={getEquipmentName(equipment, locale)}
                    >
                      <Image
                        src={getEquipmentImageUrl(equipment.tier, equipment.slot)}
                        alt={getEquipmentName(equipment, locale)}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                      {!canUse && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                          <span className="text-xs text-white">Lv.{equipment.required_level}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* AI Generated Avatar Section */}
      <div className="minecraft-card lg:col-span-1 lg:overflow-hidden">
        <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
          {aiAvatarTitle}
        </h2>

        <div className="flex flex-col items-center gap-3">
          {/* Generated Avatar Display */}
          <div className="w-40 h-40 lg:w-48 lg:h-48 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border-4 border-[#5D8731]">
            {generatedAvatar ? (
              <Image
                src={generatedAvatar}
                alt={`${kid.name}'s AI Avatar`}
                width={192}
                height={192}
                className="w-full h-full object-cover"
                unoptimized={generatedAvatar.startsWith('data:')}
              />
            ) : (
              <div className="text-center text-gray-400 p-2">
                <span className="text-4xl block mb-1">🎨</span>
                <p className="text-xs">
                  {locale === 'ms' ? 'Tiada avatar dijana' :
                    locale === 'zh' ? '尚未生成头像' :
                    'No avatar yet'}
                </p>
              </div>
            )}
          </div>

          {/* Current Equipment Summary */}
          <div className="bg-gray-50 rounded-lg p-2 w-full">
            <p className="text-xs text-gray-500 mb-1">
              {locale === 'ms' ? 'Peralatan:' :
                locale === 'zh' ? '装备：' :
                'Equipment:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {slots.map(slot => {
                const item = getEquippedItem(slot);
                return item ? (
                  <span
                    key={slot}
                    className="px-1.5 py-0.5 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: tierColors[item.tier] + '30',
                    }}
                  >
                    <Image
                      src={getEquipmentImageUrl(item.tier, slot)}
                      alt={slotNames[slot]}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </span>
                ) : null;
              })}
              {!slots.some(slot => getEquippedItem(slot)) && (
                <span className="text-xs text-gray-400">
                  {locale === 'ms' ? 'Tiada' :
                    locale === 'zh' ? '无' :
                    'None'}
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {generateError && (
            <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg w-full">
              {generateError}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateAvatar}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                {generatingLabel}
              </>
            ) : (
              <>
                <span>✨</span>
                {generatedAvatar ? regenerateLabel : generateLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
