'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Kid, Equipment, KidInventory, Locale, EquipmentSlot } from '@/types';

// Equipment slot emojis
const slotEmojis: Record<EquipmentSlot, string> = {
  helmet: '🪖',
  chestplate: '🦺',
  leggings: '👖',
  boots: '👢',
  weapon: '⚔️',
};

// Tier colors
const tierColors: Record<string, string> = {
  leather: '#8B4513',
  chain: '#A9A9A9',
  iron: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#5DADE2',
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

  // Get owned equipment IDs
  const ownedEquipmentIds = new Set(inventory.map(inv => inv.equipment_id));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Character Display */}
      <div className="minecraft-card">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          {kid.name}
        </h2>

        {/* Character Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-[#5D8731] rounded-lg flex items-center justify-center">
              <span className="text-6xl">{kid.avatar_seed || '🧒'}</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold">
              Lv.{kid.level}
            </div>
          </div>
        </div>

        {/* Equipment Slots */}
        <div className="grid grid-cols-3 gap-2">
          {/* Top Row - Helmet */}
          <div className="col-start-2">
            <EquipmentSlotButton
              slot="helmet"
              equipment={getEquippedItem('helmet')}
              slotName={slotNames.helmet}
              locale={locale}
              isSelected={selectedSlot === 'helmet'}
              onClick={() => setSelectedSlot(selectedSlot === 'helmet' ? null : 'helmet')}
            />
          </div>

          {/* Middle Row - Weapon, Chestplate, (empty) */}
          <EquipmentSlotButton
            slot="weapon"
            equipment={getEquippedItem('weapon')}
            slotName={slotNames.weapon}
            locale={locale}
            isSelected={selectedSlot === 'weapon'}
            onClick={() => setSelectedSlot(selectedSlot === 'weapon' ? null : 'weapon')}
          />
          <EquipmentSlotButton
            slot="chestplate"
            equipment={getEquippedItem('chestplate')}
            slotName={slotNames.chestplate}
            locale={locale}
            isSelected={selectedSlot === 'chestplate'}
            onClick={() => setSelectedSlot(selectedSlot === 'chestplate' ? null : 'chestplate')}
          />
          <div></div>

          {/* Bottom Row - (empty), Leggings, Boots */}
          <div></div>
          <EquipmentSlotButton
            slot="leggings"
            equipment={getEquippedItem('leggings')}
            slotName={slotNames.leggings}
            locale={locale}
            isSelected={selectedSlot === 'leggings'}
            onClick={() => setSelectedSlot(selectedSlot === 'leggings' ? null : 'leggings')}
          />
          <EquipmentSlotButton
            slot="boots"
            equipment={getEquippedItem('boots')}
            slotName={slotNames.boots}
            locale={locale}
            isSelected={selectedSlot === 'boots'}
            onClick={() => setSelectedSlot(selectedSlot === 'boots' ? null : 'boots')}
          />
        </div>

        {/* Unequip Button */}
        {selectedSlot && getEquippedItem(selectedSlot) && (
          <button
            onClick={() => handleUnequip(selectedSlot)}
            disabled={isUpdating}
            className="mt-4 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
          >
            {translations.unequip} {slotNames[selectedSlot]}
          </button>
        )}
      </div>

      {/* Inventory Panel */}
      <div className="minecraft-card">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('equipped')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'equipped'
                ? 'bg-[#5D8731] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {translations.equipment}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
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
            <h3 className="font-bold text-gray-700">
              {slotNames[selectedSlot]}
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getInventoryForSlot(selectedSlot).length > 0 ? (
                getInventoryForSlot(selectedSlot).map(equipment => (
                  <button
                    key={equipment.id}
                    onClick={() => handleEquip(equipment)}
                    disabled={isUpdating}
                    className="w-full flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#5D8731] transition-all disabled:opacity-50"
                  >
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center text-xl"
                      style={{ backgroundColor: tierColors[equipment.tier] + '40' }}
                    >
                      {slotEmojis[equipment.slot]}
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
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {inventory.length > 0 ? (
              inventory.map(inv => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-xl"
                    style={{ backgroundColor: tierColors[inv.equipment.tier] + '40' }}
                  >
                    {slotEmojis[inv.equipment.slot]}
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
            <h3 className="font-bold text-gray-700 mb-2">
              {locale === 'ms' ? 'Pilih slot untuk menukar' :
                locale === 'zh' ? '选择一个槽位来更换' :
                'Select a slot to change'}
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {allEquipment.slice(0, 10).map(equipment => {
                const owned = ownedEquipmentIds.has(equipment.id);
                const canUse = kid.level >= equipment.required_level;

                return (
                  <div
                    key={equipment.id}
                    className={`aspect-square rounded flex items-center justify-center text-2xl relative ${
                      owned
                        ? 'bg-gray-100'
                        : 'bg-gray-300 opacity-50'
                    }`}
                    title={getEquipmentName(equipment, locale)}
                  >
                    {slotEmojis[equipment.slot]}
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
    </div>
  );
}

// Equipment Slot Button Component
function EquipmentSlotButton({
  slot,
  equipment,
  slotName,
  locale,
  isSelected,
  onClick,
}: {
  slot: EquipmentSlot;
  equipment: Equipment | null;
  slotName: string;
  locale: Locale;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        aspect-square rounded-lg border-4 flex flex-col items-center justify-center transition-all
        ${isSelected
          ? 'border-[#5DADE2] bg-[#5DADE2]/20'
          : equipment
            ? 'border-[#5D8731] bg-[#5D8731]/20'
            : 'border-gray-400 bg-gray-200'
        }
        hover:scale-105
      `}
      title={slotName}
    >
      <span className="text-2xl">
        {equipment ? slotEmojis[slot] : '❓'}
      </span>
      {equipment && (
        <span className="text-xs font-bold truncate w-full text-center px-1" style={{ color: tierColors[equipment.tier] }}>
          {equipment.tier.charAt(0).toUpperCase()}
        </span>
      )}
    </button>
  );
}
