-- Equipment System Expansion: 40 Unique Tiers
-- Migration to support creative tier progression from Wood to Infinity

-- =====================================================
-- STEP 1: Update Equipment Tier Constraint
-- =====================================================

ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_tier_check;

ALTER TABLE equipment ADD CONSTRAINT equipment_tier_check CHECK (tier IN (
  -- Classic Tiers (Units 1-6)
  'wood', 'leather', 'stone', 'chain', 'iron', 'gold', 'diamond', 'darksteel',
  -- Enchanted Tiers (Units 7-12)
  'enchanted_iron', 'enchanted_gold', 'enchanted_diamond', 'enchanted_darksteel', 'seafoam', 'amethyst',
  -- Elemental Tiers (Units 13-20)
  'blaze', 'frost', 'storm', 'emerald', 'obsidian', 'crimsonite', 'lapis', 'luminite',
  -- Mythic Tiers (Units 21-30)
  'voidstone', 'dragonscale', 'darkbone', 'phoenix', 'titan', 'shadow', 'radiant', 'ancient', 'celestial', 'void',
  -- Ultimate Tiers (Units 31-40)
  'heroic', 'mythical', 'immortal', 'divine', 'cosmic', 'eternal', 'ascended', 'supreme', 'omega', 'infinity'
));

-- =====================================================
-- STEP 2: Update Equipment Slot Constraint
-- =====================================================

ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_slot_check;

ALTER TABLE equipment ADD CONSTRAINT equipment_slot_check CHECK (slot IN (
  'helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool', 'ranged', 'shield'
));

-- =====================================================
-- STEP 3: Add Unit Number Column
-- =====================================================

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS unit_number INTEGER DEFAULT NULL;

-- =====================================================
-- STEP 4: Add Color Theme Column for UI Display
-- =====================================================

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS color_primary TEXT DEFAULT NULL;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS color_secondary TEXT DEFAULT NULL;

-- =====================================================
-- STEP 5: Create Index for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_equipment_tier ON equipment(tier);
CREATE INDEX IF NOT EXISTS idx_equipment_unit_number ON equipment(unit_number);

-- =====================================================
-- STEP 6: Update Kid Equipped Table for New Slots
-- =====================================================

ALTER TABLE kid_equipped ADD COLUMN IF NOT EXISTS tool_id UUID REFERENCES equipment(id);
ALTER TABLE kid_equipped ADD COLUMN IF NOT EXISTS ranged_id UUID REFERENCES equipment(id);
ALTER TABLE kid_equipped ADD COLUMN IF NOT EXISTS shield_id UUID REFERENCES equipment(id);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- New tiers: 40 unique tiers from wood to infinity
-- New slots: tool, ranged, shield
-- New columns: unit_number, color_primary, color_secondary
