-- Fix Unit 9 Equipment Duplicates
-- Unit 9 was reusing Unit 2's Chain equipment. This creates unique Chain variants.
-- Run this after the existing seed files.

-- =====================
-- SECTION 1: CREATE NEW UNIQUE CHAIN EQUIPMENT FOR UNIT 9
-- =====================

INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level, image_url) VALUES
-- Unit 9 Equipment Set (Chain tier variants)
('Chain Cap', 'Topi Rantai Ringan', '锁链帽', 'Chain Cap', 'helmet', 'chain', 'common', 9, '/equipment/chain_cap.png'),
('Chain Vest', 'Vest Rantai', '锁链背心', 'Chain Vest', 'chestplate', 'chain', 'common', 9, '/equipment/chain_vest.png'),
('Chain Pants', 'Seluar Rantai Panjang', '锁链长裤', 'Chain Pants', 'leggings', 'chain', 'common', 9, '/equipment/chain_pants.png'),
('Chain Shoes', 'Kasut Rantai Ringan', '锁链轻便鞋', 'Chain Shoes', 'boots', 'chain', 'common', 9, '/equipment/chain_shoes.png'),
('Stone Axe', 'Kapak Batu', '石斧', 'Stone Axe', 'weapon', 'chain', 'common', 9, '/equipment/stone_axe.png')
ON CONFLICT DO NOTHING;

-- =====================
-- SECTION 2: UPDATE UNIT 9 ACTIVITIES TO USE NEW EQUIPMENT
-- =====================

-- Get the theme ID for Unit 9
DO $$
DECLARE
  v_theme_id UUID;
  v_new_equipment_id UUID;
BEGIN
  -- Get Unit 9 theme
  SELECT id INTO v_theme_id FROM themes WHERE code = 'tema_3_unit_9';

  IF v_theme_id IS NOT NULL THEN
    -- Update Activity 1: Dengar dan Respons (was Chain Helmet -> Chain Cap)
    SELECT id INTO v_new_equipment_id FROM equipment WHERE name = 'Chain Cap' LIMIT 1;
    UPDATE activities
    SET equipment_reward_id = v_new_equipment_id
    WHERE theme_id = v_theme_id AND order_index = 1;

    -- Update Activity 2: Mari Baca Cerita (was Chain Chestplate -> Chain Vest)
    SELECT id INTO v_new_equipment_id FROM equipment WHERE name = 'Chain Vest' LIMIT 1;
    UPDATE activities
    SET equipment_reward_id = v_new_equipment_id
    WHERE theme_id = v_theme_id AND order_index = 2;

    -- Update Activity 3: Kebersihan Diri (was Chain Leggings -> Chain Pants)
    SELECT id INTO v_new_equipment_id FROM equipment WHERE name = 'Chain Pants' LIMIT 1;
    UPDATE activities
    SET equipment_reward_id = v_new_equipment_id
    WHERE theme_id = v_theme_id AND order_index = 3;

    -- Update Activity 4: Cergas dan Bersih (was Chain Boots -> Chain Shoes)
    SELECT id INTO v_new_equipment_id FROM equipment WHERE name = 'Chain Shoes' LIMIT 1;
    UPDATE activities
    SET equipment_reward_id = v_new_equipment_id
    WHERE theme_id = v_theme_id AND order_index = 4;

    -- Update Activity 5: Kata Berimbuhan Awalan (was Stone Sword -> Stone Axe)
    SELECT id INTO v_new_equipment_id FROM equipment WHERE name = 'Stone Axe' LIMIT 1;
    UPDATE activities
    SET equipment_reward_id = v_new_equipment_id
    WHERE theme_id = v_theme_id AND order_index = 5;

    RAISE NOTICE 'Unit 9 equipment updated successfully';
  ELSE
    RAISE NOTICE 'Unit 9 theme not found - please run seed-unit4-to-unit9.sql first';
  END IF;
END $$;

-- =====================
-- SECTION 3: ALSO FIX UNIT 2's DUPLICATE (Stone Sword used in Unit 1)
-- =====================

-- Create a unique weapon for Unit 2 Activity 5
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level, image_url) VALUES
('Stone Dagger', 'Keris Batu', '石匕首', 'Stone Dagger', 'weapon', 'chain', 'common', 2, '/equipment/stone_dagger.png')
ON CONFLICT DO NOTHING;

-- Update Unit 2 Activity 5 to use Stone Dagger instead of Stone Sword
DO $$
DECLARE
  v_theme_id UUID;
  v_new_equipment_id UUID;
BEGIN
  -- Get Unit 2 theme
  SELECT id INTO v_theme_id FROM themes WHERE code = 'tema_1_unit_2';

  IF v_theme_id IS NOT NULL THEN
    SELECT id INTO v_new_equipment_id FROM equipment WHERE name = 'Stone Dagger' LIMIT 1;
    UPDATE activities
    SET equipment_reward_id = v_new_equipment_id
    WHERE theme_id = v_theme_id AND order_index = 5;

    RAISE NOTICE 'Unit 2 Activity 5 equipment updated to Stone Dagger';
  END IF;
END $$;

-- =====================
-- SECTION 4: FIX UNIT 3's DUPLICATE (Iron Helmet used in Unit 1)
-- =====================

-- Create a unique helmet for Unit 3 Activity 1
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level, image_url) VALUES
('Iron Cap', 'Topi Besi Ringan', '铁帽', 'Iron Cap', 'helmet', 'iron', 'rare', 3, '/equipment/iron_cap.png')
ON CONFLICT DO NOTHING;

-- Update Unit 3 Activity 1 to use Iron Cap instead of Iron Helmet
DO $$
DECLARE
  v_theme_id UUID;
  v_new_equipment_id UUID;
BEGIN
  -- Get Unit 3 theme
  SELECT id INTO v_theme_id FROM themes WHERE code = 'tema_1_unit_3';

  IF v_theme_id IS NOT NULL THEN
    SELECT id INTO v_new_equipment_id FROM equipment WHERE name = 'Iron Cap' LIMIT 1;
    UPDATE activities
    SET equipment_reward_id = v_new_equipment_id
    WHERE theme_id = v_theme_id AND order_index = 1;

    RAISE NOTICE 'Unit 3 Activity 1 equipment updated to Iron Cap';
  END IF;
END $$;

-- =====================
-- SUMMARY
-- =====================
-- Fixed duplicates:
-- 1. Unit 9: Chain Helmet -> Chain Cap
-- 2. Unit 9: Chain Chestplate -> Chain Vest
-- 3. Unit 9: Chain Leggings -> Chain Pants
-- 4. Unit 9: Chain Boots -> Chain Shoes
-- 5. Unit 9: Stone Sword -> Stone Axe
-- 6. Unit 2: Stone Sword -> Stone Dagger
-- 7. Unit 3: Iron Helmet -> Iron Cap
--
-- New equipment images needed (7 total):
-- - chain_cap.png
-- - chain_vest.png
-- - chain_pants.png
-- - chain_shoes.png
-- - stone_axe.png
-- - stone_dagger.png
-- - iron_cap.png
