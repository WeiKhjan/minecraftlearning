-- =============================================================================
-- MYLearnt Theme Migration: Minecraft to 8-bit Warrior Quest
-- =============================================================================
-- This migration renames Minecraft-specific terminology to original fantasy names
-- Run this script in Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Create Backup Tables (Run this first!)
-- -----------------------------------------------------------------------------

-- Backup equipment table
CREATE TABLE IF NOT EXISTS equipment_backup AS SELECT * FROM equipment;

-- Backup pets table
CREATE TABLE IF NOT EXISTS pets_backup AS SELECT * FROM pets;

-- Backup kid_pets table
CREATE TABLE IF NOT EXISTS kid_pets_backup AS SELECT * FROM kid_pets;

-- Backup kid_equipped table
CREATE TABLE IF NOT EXISTS kid_equipped_backup AS SELECT * FROM kid_equipped;

-- Backup themes table
CREATE TABLE IF NOT EXISTS themes_backup AS SELECT * FROM themes;

-- -----------------------------------------------------------------------------
-- STEP 2: Update Equipment Tier Records
-- -----------------------------------------------------------------------------

-- Drop old constraint first (so we can update the data)
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_tier_check;

-- Update existing equipment records with new tier names
UPDATE equipment SET tier = 'darksteel' WHERE tier = 'netherite';
UPDATE equipment SET tier = 'enchanted_darksteel' WHERE tier = 'enchanted_netherite';
UPDATE equipment SET tier = 'seafoam' WHERE tier = 'prismarine';
UPDATE equipment SET tier = 'crimsonite' WHERE tier = 'redstone';
UPDATE equipment SET tier = 'luminite' WHERE tier = 'glowstone';
UPDATE equipment SET tier = 'voidstone' WHERE tier = 'ender';
UPDATE equipment SET tier = 'darkbone' WHERE tier = 'wither';
UPDATE equipment SET tier = 'dragonscale' WHERE tier = 'dragon';

-- Now add new constraint with renamed tiers (after data is updated)
ALTER TABLE equipment ADD CONSTRAINT equipment_tier_check CHECK (tier IN (
  'wood', 'leather', 'stone', 'chain', 'iron', 'gold', 'diamond', 'darksteel',
  'enchanted_iron', 'enchanted_gold', 'enchanted_diamond', 'enchanted_darksteel', 'seafoam', 'amethyst',
  'blaze', 'frost', 'storm', 'emerald', 'obsidian', 'crimsonite', 'lapis', 'luminite',
  'voidstone', 'dragonscale', 'darkbone', 'phoenix', 'titan', 'shadow', 'radiant', 'ancient', 'celestial', 'void',
  'heroic', 'mythical', 'immortal', 'divine', 'cosmic', 'eternal', 'ascended', 'supreme', 'omega', 'infinity'
));

-- -----------------------------------------------------------------------------
-- STEP 3: Rename Minecraft-Exclusive Pets
-- -----------------------------------------------------------------------------

-- Rename pet IDs and update localized names
-- Note: These updates change the pet id, name, and description to fantasy equivalents

-- Creeper -> Forest Spirit
UPDATE pets SET
  id = 'forest_spirit',
  name = '{"ms":"Roh Hutan","zh":"森林精灵","en":"Forest Spirit"}'::jsonb,
  description = '{"ms":"Roh hijau yang tenang dari hutan","zh":"来自森林的安静绿色精灵","en":"A calm green spirit from the forest"}'::jsonb
WHERE id = 'creeper';

-- Skeleton -> Bone Warrior
UPDATE pets SET
  id = 'bone_warrior',
  name = '{"ms":"Pahlawan Tulang","zh":"骨战士","en":"Bone Warrior"}'::jsonb,
  description = '{"ms":"Pahlawan rangka yang setia","zh":"忠诚的骨骼战士","en":"A loyal skeletal warrior"}'::jsonb
WHERE id = 'skeleton';

-- Zombie -> Moss Knight
UPDATE pets SET
  id = 'moss_knight',
  name = '{"ms":"Kesatria Lumut","zh":"苔藓骑士","en":"Moss Knight"}'::jsonb,
  description = '{"ms":"Kesatria kuno yang diliputi lumut","zh":"被青苔覆盖的古老骑士","en":"An ancient knight covered in moss"}'::jsonb
WHERE id = 'zombie';

-- Slime -> Jelly Blob
UPDATE pets SET
  id = 'jelly_blob',
  name = '{"ms":"Gumpalan Jeli","zh":"果冻怪","en":"Jelly Blob"}'::jsonb,
  description = '{"ms":"Makhluk jeli yang comel dan melantun","zh":"可爱的弹跳果冻生物","en":"A cute bouncy jelly creature"}'::jsonb
WHERE id = 'slime';

-- Iron Golem -> Stone Guardian
UPDATE pets SET
  id = 'stone_guardian',
  name = '{"ms":"Penjaga Batu","zh":"石像守卫","en":"Stone Guardian"}'::jsonb,
  description = '{"ms":"Pelindung batu yang kuat dan setia","zh":"强大忠诚的石头守护者","en":"A strong and loyal stone protector"}'::jsonb
WHERE id = 'iron_golem';

-- Snow Golem -> Frost Sprite
UPDATE pets SET
  id = 'frost_sprite',
  name = '{"ms":"Pari Fros","zh":"霜精灵","en":"Frost Sprite"}'::jsonb,
  description = '{"ms":"Makhluk ais yang ceria dan dingin","zh":"快乐的冰冷生物","en":"A cheerful icy creature"}'::jsonb
WHERE id = 'snow_golem';

-- Allay -> Pixie
UPDATE pets SET
  id = 'pixie',
  name = '{"ms":"Pari Kecil","zh":"小精灵","en":"Pixie"}'::jsonb,
  description = '{"ms":"Pari kecil yang suka membantu","zh":"喜欢帮助人的小精灵","en":"A helpful little fairy"}'::jsonb
WHERE id = 'allay';

-- Ender Dragon -> Shadow Drake
UPDATE pets SET
  id = 'shadow_drake',
  name = '{"ms":"Naga Bayang","zh":"暗影龙","en":"Shadow Drake"}'::jsonb,
  description = '{"ms":"Naga berkuasa dari alam bayang","zh":"来自暗影领域的强大龙","en":"A powerful dragon from the shadow realm"}'::jsonb
WHERE id = 'ender_dragon';

-- Wither -> Doom Wraith
UPDATE pets SET
  id = 'doom_wraith',
  name = '{"ms":"Hantu Azab","zh":"末日幽灵","en":"Doom Wraith"}'::jsonb,
  description = '{"ms":"Roh gelap yang menakutkan tetapi setia","zh":"可怕但忠诚的黑暗灵魂","en":"A fearsome but loyal dark spirit"}'::jsonb
WHERE id = 'wither';

-- -----------------------------------------------------------------------------
-- STEP 4: Update Foreign Key References
-- -----------------------------------------------------------------------------

-- Update kid_pets references
UPDATE kid_pets SET pet_id = 'forest_spirit' WHERE pet_id = 'creeper';
UPDATE kid_pets SET pet_id = 'bone_warrior' WHERE pet_id = 'skeleton';
UPDATE kid_pets SET pet_id = 'moss_knight' WHERE pet_id = 'zombie';
UPDATE kid_pets SET pet_id = 'jelly_blob' WHERE pet_id = 'slime';
UPDATE kid_pets SET pet_id = 'stone_guardian' WHERE pet_id = 'iron_golem';
UPDATE kid_pets SET pet_id = 'frost_sprite' WHERE pet_id = 'snow_golem';
UPDATE kid_pets SET pet_id = 'pixie' WHERE pet_id = 'allay';
UPDATE kid_pets SET pet_id = 'shadow_drake' WHERE pet_id = 'ender_dragon';
UPDATE kid_pets SET pet_id = 'doom_wraith' WHERE pet_id = 'wither';

-- Update kid_equipped references
UPDATE kid_equipped SET pet_id = 'forest_spirit' WHERE pet_id = 'creeper';
UPDATE kid_equipped SET pet_id = 'bone_warrior' WHERE pet_id = 'skeleton';
UPDATE kid_equipped SET pet_id = 'moss_knight' WHERE pet_id = 'zombie';
UPDATE kid_equipped SET pet_id = 'jelly_blob' WHERE pet_id = 'slime';
UPDATE kid_equipped SET pet_id = 'stone_guardian' WHERE pet_id = 'iron_golem';
UPDATE kid_equipped SET pet_id = 'frost_sprite' WHERE pet_id = 'snow_golem';
UPDATE kid_equipped SET pet_id = 'pixie' WHERE pet_id = 'allay';
UPDATE kid_equipped SET pet_id = 'shadow_drake' WHERE pet_id = 'ender_dragon';
UPDATE kid_equipped SET pet_id = 'doom_wraith' WHERE pet_id = 'wither';

-- Update themes pet_reward references
UPDATE themes SET pet_reward = 'forest_spirit' WHERE pet_reward = 'creeper';
UPDATE themes SET pet_reward = 'bone_warrior' WHERE pet_reward = 'skeleton';
UPDATE themes SET pet_reward = 'moss_knight' WHERE pet_reward = 'zombie';
UPDATE themes SET pet_reward = 'jelly_blob' WHERE pet_reward = 'slime';
UPDATE themes SET pet_reward = 'stone_guardian' WHERE pet_reward = 'iron_golem';
UPDATE themes SET pet_reward = 'frost_sprite' WHERE pet_reward = 'snow_golem';
UPDATE themes SET pet_reward = 'pixie' WHERE pet_reward = 'allay';
UPDATE themes SET pet_reward = 'shadow_drake' WHERE pet_reward = 'ender_dragon';
UPDATE themes SET pet_reward = 'doom_wraith' WHERE pet_reward = 'wither';

-- -----------------------------------------------------------------------------
-- STEP 5: Verification Queries (Run these to verify migration)
-- -----------------------------------------------------------------------------

-- Check equipment tiers
-- SELECT DISTINCT tier FROM equipment ORDER BY tier;

-- Check pet IDs and names
-- SELECT id, name FROM pets ORDER BY id;

-- Check for any orphaned references in kid_pets
-- SELECT * FROM kid_pets WHERE pet_id NOT IN (SELECT id FROM pets);

-- Check for any orphaned references in kid_equipped
-- SELECT * FROM kid_equipped WHERE pet_id IS NOT NULL AND pet_id NOT IN (SELECT id FROM pets);

-- -----------------------------------------------------------------------------
-- ROLLBACK SCRIPT (Only run if you need to revert changes!)
-- -----------------------------------------------------------------------------
--
-- DROP TABLE equipment;
-- ALTER TABLE equipment_backup RENAME TO equipment;
--
-- DROP TABLE pets;
-- ALTER TABLE pets_backup RENAME TO pets;
--
-- DROP TABLE kid_pets;
-- ALTER TABLE kid_pets_backup RENAME TO kid_pets;
--
-- DROP TABLE kid_equipped;
-- ALTER TABLE kid_equipped_backup RENAME TO kid_equipped;
--
-- DROP TABLE themes;
-- ALTER TABLE themes_backup RENAME TO themes;
