'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Kid, Equipment, KidInventory, Locale, EquipmentSlot, EquipmentTier, Pet, KidPet, PetRarity } from '@/types';

// Image base URLs
const PET_IMAGE_BASE = 'https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/pets';

// Equipment image base URL
const EQUIPMENT_IMAGE_BASE = 'https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/equipment';

// Get equipment image URL based on tier and slot
function getEquipmentImageUrl(tier: EquipmentTier, slot: EquipmentSlot): string {
  const slotToName: Record<EquipmentSlot, string> = {
    helmet: 'helmet',
    chestplate: 'chestplate',
    leggings: 'leggings',
    boots: 'boots',
    weapon: 'sword',
  };

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

// Tier colors for equipment
const tierColors: Record<EquipmentTier, string> = {
  leather: '#8B4513',
  chain: '#A9A9A9',
  iron: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#5DADE2',
};

// Tier background colors (lighter)
const tierBgColors: Record<EquipmentTier, string> = {
  leather: '#D4A574',
  chain: '#D0D0D0',
  iron: '#E8E8E8',
  gold: '#FFF3B0',
  diamond: '#B8E4F0',
};

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
    pet?: Pet | null;
  } | null;
  inventory: (KidInventory & { equipment: Equipment })[];
  ownedPets: (KidPet & { pet: Pet })[];
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
    pet: string;
    noEquipment: string;
    noPets: string;
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
        backgroundColor: item ? tierBgColors[item.tier] : '#8B8B8B',
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
          style={{ backgroundColor: tierColors[item.tier] }}
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

  const handleEquipPet = async (petId: string) => {
    setIsUpdating(true);
    const supabase = createClient();

    await supabase
      .from('kid_equipped')
      .upsert({ kid_id: kid.id, pet_id: petId }, { onConflict: 'kid_id' });

    router.refresh();
    setIsUpdating(false);
    setIsPetSlotSelected(false);
  };

  const handleUnequipPet = async () => {
    setIsUpdating(true);
    const supabase = createClient();

    await supabase
      .from('kid_equipped')
      .update({ pet_id: null })
      .eq('kid_id', kid.id);

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
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">

      {/* Left Panel - Character & Equipment */}
      <div className="minecraft-card lg:col-span-1 p-4 sm:p-6 h-fit">
        {/* Header with name and level */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 minecraft-font">
            {kid.name}
          </h2>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1.5 rounded-lg shadow-md">
            <span className="text-yellow-900 font-bold">Lv.{kid.level}</span>
          </div>
        </div>

        {/* Main Equipment Layout - RPG Style Grid */}
        <div className="flex flex-col items-center gap-4">

          {/* Character Avatar Display with Pet */}
          <div className="flex items-end gap-3">
            {/* Avatar Frame - Minecraft style */}
            <div className="relative">
              <div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-4"
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
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized={generatedAvatar.startsWith('data:')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl">{kid.avatar_seed || '😊'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pet Slot - Next to avatar */}
            <button
              onClick={() => {
                setIsPetSlotSelected(!isPetSlotSelected);
                setSelectedSlot(null);
              }}
              className={`
                relative w-16 h-16 sm:w-20 sm:h-20
                bg-[#8B8B8B] rounded-lg
                border-[3px] transition-all duration-150
                hover:scale-105 hover:brightness-110
                ${isPetSlotSelected
                  ? 'border-[#F39C12] ring-2 ring-[#F39C12] ring-offset-1'
                  : 'border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#555555] border-b-[#555555]'
                }
              `}
              style={{
                boxShadow: 'inset -2px -2px 0 #373737, inset 2px 2px 0 #C6C6C6',
                backgroundColor: getEquippedPet() ? petRarityBgColors[getEquippedPet()!.rarity] : '#8B8B8B',
              }}
              title={getEquippedPet() ? getPetName(getEquippedPet(), locale) : translations.pet}
            >
              <div className="absolute inset-1 bg-[#373737]/30 rounded flex items-center justify-center">
                {getEquippedPet() ? (
                  <Image
                    src={getPetImageUrl(getEquippedPet()!.id)}
                    alt={getPetName(getEquippedPet(), locale)}
                    width={48}
                    height={48}
                    className="object-contain drop-shadow-lg"
                  />
                ) : (
                  <div className="text-[#555555]/50 text-[10px] font-bold text-center leading-tight">
                    {translations.pet}
                  </div>
                )}
              </div>
              {/* Rarity indicator */}
              {getEquippedPet() && (
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white shadow-md"
                  style={{ backgroundColor: petRarityColors[getEquippedPet()!.rarity] }}
                >
                  {getEquippedPet()!.rarity.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>

          {/* Equipment Slots Grid - Classic RPG Layout */}
          <div className="w-full max-w-xs">
            {/* Top row - Helmet */}
            <div className="flex justify-center mb-2">
              <EquipmentSlotBox
                item={getEquippedItem('helmet')}
                slot="helmet"
                slotName={translations.helmet}
                isSelected={selectedSlot === 'helmet'}
                onClick={() => { setSelectedSlot(selectedSlot === 'helmet' ? null : 'helmet'); setIsPetSlotSelected(false); }}
                locale={locale}
              />
            </div>

            {/* Middle row - Weapon, Chestplate, (empty for symmetry) */}
            <div className="flex justify-center gap-2 mb-2">
              <EquipmentSlotBox
                item={getEquippedItem('weapon')}
                slot="weapon"
                slotName={translations.weapon}
                isSelected={selectedSlot === 'weapon'}
                onClick={() => { setSelectedSlot(selectedSlot === 'weapon' ? null : 'weapon'); setIsPetSlotSelected(false); }}
                locale={locale}
              />
              <EquipmentSlotBox
                item={getEquippedItem('chestplate')}
                slot="chestplate"
                slotName={translations.chestplate}
                isSelected={selectedSlot === 'chestplate'}
                onClick={() => { setSelectedSlot(selectedSlot === 'chestplate' ? null : 'chestplate'); setIsPetSlotSelected(false); }}
                locale={locale}
              />
              {/* Empty slot for visual balance */}
              <div className="w-14 h-14 sm:w-16 sm:h-16" />
            </div>

            {/* Bottom row - Leggings, Boots */}
            <div className="flex justify-center gap-2">
              <EquipmentSlotBox
                item={getEquippedItem('leggings')}
                slot="leggings"
                slotName={translations.leggings}
                isSelected={selectedSlot === 'leggings'}
                onClick={() => { setSelectedSlot(selectedSlot === 'leggings' ? null : 'leggings'); setIsPetSlotSelected(false); }}
                locale={locale}
              />
              <EquipmentSlotBox
                item={getEquippedItem('boots')}
                slot="boots"
                slotName={translations.boots}
                isSelected={selectedSlot === 'boots'}
                onClick={() => { setSelectedSlot(selectedSlot === 'boots' ? null : 'boots'); setIsPetSlotSelected(false); }}
                locale={locale}
              />
            </div>
          </div>

          {/* Instruction text */}
          <p className="text-xs text-gray-500 text-center">
            {clickToEquipLabel}
          </p>

          {/* Unequip Button */}
          {selectedSlot && getEquippedItem(selectedSlot) && (
            <button
              onClick={() => handleUnequip(selectedSlot)}
              disabled={isUpdating}
              className="w-full max-w-xs px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 font-bold transition-all shadow-md"
            >
              {translations.unequip} {slotNames[selectedSlot]}
            </button>
          )}

          {/* Unequip Pet Button */}
          {isPetSlotSelected && getEquippedPet() && (
            <button
              onClick={handleUnequipPet}
              disabled={isUpdating}
              className="w-full max-w-xs px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 font-bold transition-all shadow-md"
            >
              {translations.unequip} {translations.pet}
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - Inventory & AI Avatar */}
      <div className="space-y-4 lg:space-y-4">

        {/* Inventory Panel */}
        <div className="minecraft-card p-4 sm:p-6 lg:max-h-[55%] lg:overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('equipped')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                activeTab === 'equipped'
                  ? 'bg-[#5D8731] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.equipment}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-[#5D8731] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.inventory}
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                activeTab === 'pets'
                  ? 'bg-[#F39C12] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.pet}
            </button>
          </div>

          {/* Equipment Selection (when slot selected) */}
          {selectedSlot && activeTab === 'equipped' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#5DADE2]"></span>
                {slotNames[selectedSlot]}
              </h3>
              <div className="space-y-2 max-h-40 lg:max-h-48 overflow-y-auto pr-2">
                {getInventoryForSlot(selectedSlot).length > 0 ? (
                  getInventoryForSlot(selectedSlot).map(equipment => (
                    <button
                      key={equipment.id}
                      onClick={() => handleEquip(equipment)}
                      disabled={isUpdating}
                      className="w-full flex items-center gap-4 p-3 bg-white hover:bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#5D8731] transition-all disabled:opacity-50 shadow-sm"
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: tierBgColors[equipment.tier] }}
                      >
                        <Image
                          src={getEquipmentImageUrl(equipment.tier, equipment.slot)}
                          alt={getEquipmentName(equipment, locale)}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold" style={{ color: rarityColors[equipment.rarity] }}>
                          {getEquipmentName(equipment, locale)}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tierColors[equipment.tier] }}
                          />
                          {equipment.tier.charAt(0).toUpperCase() + equipment.tier.slice(1)}
                        </p>
                      </div>
                      <span className="text-[#5D8731] font-bold bg-[#5D8731]/10 px-3 py-1 rounded-full text-sm">
                        {translations.equip}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                    {translations.noEquipment}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Full Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-2 max-h-40 lg:max-h-48 overflow-y-auto pr-2">
              {inventory.length > 0 ? (
                inventory.map(inv => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: tierBgColors[inv.equipment.tier] }}
                    >
                      <Image
                        src={getEquipmentImageUrl(inv.equipment.tier, inv.equipment.slot)}
                        alt={getEquipmentName(inv.equipment, locale)}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: rarityColors[inv.equipment.rarity] }}>
                        {getEquipmentName(inv.equipment, locale)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tierColors[inv.equipment.tier] }}
                        />
                        {slotNames[inv.equipment.slot as EquipmentSlot]} • {inv.equipment.tier}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                  {translations.noEquipment}
                </p>
              )}
            </div>
          )}

          {/* All Equipment Preview */}
          {activeTab === 'equipped' && !selectedSlot && !isPetSlotSelected && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-700 text-sm">
                {locale === 'ms' ? 'Koleksi Peralatan' :
                  locale === 'zh' ? '装备收藏' :
                  'Equipment Collection'}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {allEquipment.slice(0, 10).map(equipment => {
                  const owned = ownedEquipmentIds.has(equipment.id);
                  const canUse = kid.level >= equipment.required_level;

                  return (
                    <div
                      key={equipment.id}
                      className={`aspect-square rounded-lg flex items-center justify-center relative border-2 transition-all ${
                        owned
                          ? 'border-[#5D8731] bg-gray-50'
                          : 'border-gray-300 bg-gray-200 opacity-60'
                      }`}
                      title={getEquipmentName(equipment, locale)}
                    >
                      <Image
                        src={getEquipmentImageUrl(equipment.tier, equipment.slot)}
                        alt={getEquipmentName(equipment, locale)}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                      {!canUse && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                          <span className="text-xs text-white font-bold">Lv.{equipment.required_level}</span>
                        </div>
                      )}
                      {owned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5D8731] rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px]">✓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pet Selection (when pet slot selected) */}
          {isPetSlotSelected && activeTab === 'equipped' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F39C12]"></span>
                {translations.pet}
              </h3>
              <div className="space-y-2 max-h-40 lg:max-h-48 overflow-y-auto pr-2">
                {ownedPets.length > 0 ? (
                  ownedPets.map(kidPet => (
                    <button
                      key={kidPet.id}
                      onClick={() => handleEquipPet(kidPet.pet_id)}
                      disabled={isUpdating}
                      className="w-full flex items-center gap-4 p-3 bg-white hover:bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#F39C12] transition-all disabled:opacity-50 shadow-sm"
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: petRarityBgColors[kidPet.pet.rarity] }}
                      >
                        <Image
                          src={getPetImageUrl(kidPet.pet.id)}
                          alt={getPetName(kidPet.pet, locale)}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold" style={{ color: petRarityColors[kidPet.pet.rarity] }}>
                          {getPetName(kidPet.pet, locale)}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: petRarityColors[kidPet.pet.rarity] }}
                          />
                          {kidPet.pet.rarity.charAt(0).toUpperCase() + kidPet.pet.rarity.slice(1)}
                        </p>
                      </div>
                      <span className="text-[#F39C12] font-bold bg-[#F39C12]/10 px-3 py-1 rounded-full text-sm">
                        {translations.equip}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                    {translations.noPets}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pets Tab Content */}
          {activeTab === 'pets' && (
            <div className="space-y-2 max-h-40 lg:max-h-48 overflow-y-auto pr-2">
              {ownedPets.length > 0 ? (
                ownedPets.map(kidPet => (
                  <div
                    key={kidPet.id}
                    className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: petRarityBgColors[kidPet.pet.rarity] }}
                    >
                      <Image
                        src={getPetImageUrl(kidPet.pet.id)}
                        alt={getPetName(kidPet.pet, locale)}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: petRarityColors[kidPet.pet.rarity] }}>
                        {getPetName(kidPet.pet, locale)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: petRarityColors[kidPet.pet.rarity] }}
                        />
                        {kidPet.pet.rarity.charAt(0).toUpperCase() + kidPet.pet.rarity.slice(1)} • {kidPet.pet.mob_type}
                      </p>
                    </div>
                    {getEquippedPet()?.id === kidPet.pet.id && (
                      <span className="text-[#F39C12] font-bold bg-[#F39C12]/10 px-3 py-1 rounded-full text-sm">
                        ✓
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                  {translations.noPets}
                </p>
              )}
            </div>
          )}
        </div>

        {/* AI Generated Avatar Section */}
        <div className="minecraft-card p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">✨</span>
            {aiAvatarTitle}
          </h2>

          <div className="flex items-start gap-4">
            {/* Generated Avatar Display */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 border-4"
              style={{
                borderColor: '#5D8731',
                boxShadow: 'inset -2px -2px 0 #373737, inset 2px 2px 0 #8BC34A',
              }}
            >
              {generatedAvatar ? (
                <Image
                  src={generatedAvatar}
                  alt={`${kid.name}'s AI Avatar`}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  unoptimized={generatedAvatar.startsWith('data:')}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-3xl text-gray-400">🎨</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {/* Current Equipment Summary */}
              <div className="flex flex-wrap gap-1.5">
                {slots.map(slot => {
                  const item = getEquippedItem(slot);
                  return item ? (
                    <div
                      key={slot}
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: tierBgColors[item.tier] }}
                      title={slotNames[slot]}
                    >
                      <Image
                        src={getEquipmentImageUrl(item.tier, slot)}
                        alt={slotNames[slot]}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      key={slot}
                      className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center"
                      title={slotNames[slot]}
                    >
                      <span className="text-gray-400 text-xs">-</span>
                    </div>
                  );
                })}
              </div>

              {/* Error Message */}
              {generateError && (
                <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg">
                  {generateError}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerateAvatar}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
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
      </div>
    </div>
  );
}
