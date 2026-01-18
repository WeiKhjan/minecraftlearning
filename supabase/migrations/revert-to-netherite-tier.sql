-- Revert equipment tier from darksteel back to netherite
-- This migration reverses the theme-rename migration that changed netherite -> darksteel

-- =====================================================
-- STEP 1: Drop existing constraint first
-- =====================================================

ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_tier_check;

-- =====================================================
-- STEP 2: Update equipment tiers from darksteel to netherite
-- =====================================================

UPDATE equipment SET tier = 'netherite' WHERE tier = 'darksteel';
UPDATE equipment SET tier = 'enchanted_netherite' WHERE tier = 'enchanted_darksteel';

-- =====================================================
-- STEP 3: Add new constraint with netherite tiers
-- =====================================================

ALTER TABLE equipment ADD CONSTRAINT equipment_tier_check CHECK (tier IN (
  -- Classic Tiers (Units 1-6)
  'wood', 'leather', 'stone', 'chain', 'iron', 'gold', 'diamond', 'netherite',
  -- Enchanted Tiers (Units 7-12)
  'enchanted_iron', 'enchanted_gold', 'enchanted_diamond', 'enchanted_netherite', 'seafoam', 'amethyst',
  -- Elemental Tiers (Units 13-20)
  'blaze', 'frost', 'storm', 'emerald', 'obsidian', 'crimsonite', 'lapis', 'luminite',
  -- Mythic Tiers (Units 21-30)
  'voidstone', 'dragonscale', 'darkbone', 'phoenix', 'titan', 'shadow', 'radiant', 'ancient', 'celestial', 'void',
  -- Ultimate Tiers (Units 31-40)
  'heroic', 'mythical', 'immortal', 'divine', 'cosmic', 'eternal', 'ascended', 'supreme', 'omega', 'infinity'
));
