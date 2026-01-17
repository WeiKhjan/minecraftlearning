-- Equipment Seed Data: Units 1-10
-- Total: 70 equipment items (7 per unit)
-- Each unit: Helmet, Chestplate, Leggings, Boots, Sword, Pickaxe, Special (Bow/Shield alternating)

-- =====================================================
-- UNIT 1: Wood/Leather Tier (Common)
-- Theme: Basic starter gear made from natural materials
-- =====================================================

INSERT INTO equipment (id, name, name_en, name_ms, name_zh, slot, tier, rarity, image_url, required_level, unit_number, color_primary, color_secondary) VALUES
-- Unit 1 Equipment
('e1010001-0001-0001-0001-000000000001', 'Leather Cap', 'Leather Cap', 'Topi Kulit', '皮革帽', 'helmet', 'leather', 'common', '/equipment/leather_helmet.png', 1, 1, '#8B4513', '#D2691E'),
('e1010001-0001-0001-0001-000000000002', 'Leather Tunic', 'Leather Tunic', 'Baju Kulit', '皮革外套', 'chestplate', 'leather', 'common', '/equipment/leather_chestplate.png', 1, 1, '#8B4513', '#D2691E'),
('e1010001-0001-0001-0001-000000000003', 'Leather Pants', 'Leather Pants', 'Seluar Kulit', '皮革裤', 'leggings', 'leather', 'common', '/equipment/leather_leggings.png', 1, 1, '#8B4513', '#D2691E'),
('e1010001-0001-0001-0001-000000000004', 'Leather Boots', 'Leather Boots', 'Kasut Kulit', '皮革靴', 'boots', 'leather', 'common', '/equipment/leather_boots.png', 1, 1, '#8B4513', '#D2691E'),
('e1010001-0001-0001-0001-000000000005', 'Wood Sword', 'Wood Sword', 'Pedang Kayu', '木剑', 'weapon', 'wood', 'common', '/equipment/wood_sword.png', 1, 1, '#8B4513', '#A0522D'),
('e1010001-0001-0001-0001-000000000006', 'Wood Pickaxe', 'Wood Pickaxe', 'Beliung Kayu', '木镐', 'tool', 'wood', 'common', '/equipment/wood_pickaxe.png', 1, 1, '#8B4513', '#A0522D'),
('e1010001-0001-0001-0001-000000000007', 'Wood Bow', 'Wood Bow', 'Busur Kayu', '木弓', 'ranged', 'wood', 'common', '/equipment/wood_bow.png', 1, 1, '#8B4513', '#A0522D'),

-- =====================================================
-- UNIT 2: Stone Tier (Common)
-- Theme: Sturdy cobblestone gear
-- =====================================================

('e1010001-0001-0001-0002-000000000001', 'Stone Helmet', 'Stone Helmet', 'Topi Batu', '石头盔', 'helmet', 'stone', 'common', '/equipment/stone_helmet.png', 2, 2, '#808080', '#A9A9A9'),
('e1010001-0001-0001-0002-000000000002', 'Stone Chestplate', 'Stone Chestplate', 'Baju Batu', '石胸甲', 'chestplate', 'stone', 'common', '/equipment/stone_chestplate.png', 2, 2, '#808080', '#A9A9A9'),
('e1010001-0001-0001-0002-000000000003', 'Stone Leggings', 'Stone Leggings', 'Seluar Batu', '石护腿', 'leggings', 'stone', 'common', '/equipment/stone_leggings.png', 2, 2, '#808080', '#A9A9A9'),
('e1010001-0001-0001-0002-000000000004', 'Stone Boots', 'Stone Boots', 'Kasut Batu', '石靴', 'boots', 'stone', 'common', '/equipment/stone_boots.png', 2, 2, '#808080', '#A9A9A9'),
('e1010001-0001-0001-0002-000000000005', 'Stone Sword', 'Stone Sword', 'Pedang Batu', '石剑', 'weapon', 'stone', 'common', '/equipment/stone_sword.png', 2, 2, '#808080', '#A9A9A9'),
('e1010001-0001-0001-0002-000000000006', 'Stone Pickaxe', 'Stone Pickaxe', 'Beliung Batu', '石镐', 'tool', 'stone', 'common', '/equipment/stone_pickaxe.png', 2, 2, '#808080', '#A9A9A9'),
('e1010001-0001-0001-0002-000000000007', 'Stone Shield', 'Stone Shield', 'Perisai Batu', '石盾', 'shield', 'stone', 'common', '/equipment/stone_shield.png', 2, 2, '#808080', '#A9A9A9'),

-- =====================================================
-- UNIT 3: Iron Tier (Rare)
-- Theme: Solid iron forged armor - first metal tier
-- =====================================================

('e1010001-0001-0001-0003-000000000001', 'Iron Helmet', 'Iron Helmet', 'Topi Besi', '铁头盔', 'helmet', 'iron', 'rare', '/equipment/iron_helmet.png', 3, 3, '#D3D3D3', '#A9A9A9'),
('e1010001-0001-0001-0003-000000000002', 'Iron Chestplate', 'Iron Chestplate', 'Baju Besi', '铁胸甲', 'chestplate', 'iron', 'rare', '/equipment/iron_chestplate.png', 3, 3, '#D3D3D3', '#A9A9A9'),
('e1010001-0001-0001-0003-000000000003', 'Iron Leggings', 'Iron Leggings', 'Seluar Besi', '铁护腿', 'leggings', 'iron', 'rare', '/equipment/iron_leggings.png', 3, 3, '#D3D3D3', '#A9A9A9'),
('e1010001-0001-0001-0003-000000000004', 'Iron Boots', 'Iron Boots', 'Kasut Besi', '铁靴', 'boots', 'iron', 'rare', '/equipment/iron_boots.png', 3, 3, '#D3D3D3', '#A9A9A9'),
('e1010001-0001-0001-0003-000000000005', 'Iron Sword', 'Iron Sword', 'Pedang Besi', '铁剑', 'weapon', 'iron', 'rare', '/equipment/iron_sword.png', 3, 3, '#D3D3D3', '#A9A9A9'),
('e1010001-0001-0001-0003-000000000006', 'Iron Pickaxe', 'Iron Pickaxe', 'Beliung Besi', '铁镐', 'tool', 'iron', 'rare', '/equipment/iron_pickaxe.png', 3, 3, '#D3D3D3', '#A9A9A9'),
('e1010001-0001-0001-0003-000000000007', 'Iron Crossbow', 'Iron Crossbow', 'Busur Silang Besi', '铁弩', 'ranged', 'iron', 'rare', '/equipment/iron_crossbow.png', 3, 3, '#D3D3D3', '#A9A9A9'),

-- =====================================================
-- UNIT 4: Gold Tier (Rare)
-- Theme: Royal golden gear fit for royalty
-- =====================================================

('e1010001-0001-0001-0004-000000000001', 'Gold Helmet', 'Gold Helmet', 'Topi Emas', '金头盔', 'helmet', 'gold', 'rare', '/equipment/gold_helmet.png', 4, 4, '#FFD700', '#FFA500'),
('e1010001-0001-0001-0004-000000000002', 'Gold Chestplate', 'Gold Chestplate', 'Baju Emas', '金胸甲', 'chestplate', 'gold', 'rare', '/equipment/gold_chestplate.png', 4, 4, '#FFD700', '#FFA500'),
('e1010001-0001-0001-0004-000000000003', 'Gold Leggings', 'Gold Leggings', 'Seluar Emas', '金护腿', 'leggings', 'gold', 'rare', '/equipment/gold_leggings.png', 4, 4, '#FFD700', '#FFA500'),
('e1010001-0001-0001-0004-000000000004', 'Gold Boots', 'Gold Boots', 'Kasut Emas', '金靴', 'boots', 'gold', 'rare', '/equipment/gold_boots.png', 4, 4, '#FFD700', '#FFA500'),
('e1010001-0001-0001-0004-000000000005', 'Gold Sword', 'Gold Sword', 'Pedang Emas', '金剑', 'weapon', 'gold', 'rare', '/equipment/gold_sword.png', 4, 4, '#FFD700', '#FFA500'),
('e1010001-0001-0001-0004-000000000006', 'Gold Pickaxe', 'Gold Pickaxe', 'Beliung Emas', '金镐', 'tool', 'gold', 'rare', '/equipment/gold_pickaxe.png', 4, 4, '#FFD700', '#FFA500'),
('e1010001-0001-0001-0004-000000000007', 'Gold Shield', 'Gold Shield', 'Perisai Emas', '金盾', 'shield', 'gold', 'rare', '/equipment/gold_shield.png', 4, 4, '#FFD700', '#FFA500'),

-- =====================================================
-- UNIT 5: Diamond Tier (Epic)
-- Theme: Precious diamond-encrusted gear
-- =====================================================

('e1010001-0001-0001-0005-000000000001', 'Diamond Helmet', 'Diamond Helmet', 'Topi Berlian', '钻石头盔', 'helmet', 'diamond', 'epic', '/equipment/diamond_helmet.png', 5, 5, '#00CED1', '#40E0D0'),
('e1010001-0001-0001-0005-000000000002', 'Diamond Chestplate', 'Diamond Chestplate', 'Baju Berlian', '钻石胸甲', 'chestplate', 'diamond', 'epic', '/equipment/diamond_chestplate.png', 5, 5, '#00CED1', '#40E0D0'),
('e1010001-0001-0001-0005-000000000003', 'Diamond Leggings', 'Diamond Leggings', 'Seluar Berlian', '钻石护腿', 'leggings', 'diamond', 'epic', '/equipment/diamond_leggings.png', 5, 5, '#00CED1', '#40E0D0'),
('e1010001-0001-0001-0005-000000000004', 'Diamond Boots', 'Diamond Boots', 'Kasut Berlian', '钻石靴', 'boots', 'diamond', 'epic', '/equipment/diamond_boots.png', 5, 5, '#00CED1', '#40E0D0'),
('e1010001-0001-0001-0005-000000000005', 'Diamond Sword', 'Diamond Sword', 'Pedang Berlian', '钻石剑', 'weapon', 'diamond', 'epic', '/equipment/diamond_sword.png', 5, 5, '#00CED1', '#40E0D0'),
('e1010001-0001-0001-0005-000000000006', 'Diamond Pickaxe', 'Diamond Pickaxe', 'Beliung Berlian', '钻石镐', 'tool', 'diamond', 'epic', '/equipment/diamond_pickaxe.png', 5, 5, '#00CED1', '#40E0D0'),
('e1010001-0001-0001-0005-000000000007', 'Diamond Bow', 'Diamond Bow', 'Busur Berlian', '钻石弓', 'ranged', 'diamond', 'epic', '/equipment/diamond_bow.png', 5, 5, '#00CED1', '#40E0D0'),

-- =====================================================
-- UNIT 6: Darksteel Tier (Epic)
-- Theme: Dark metal forged in ancient forges
-- =====================================================

('e1010001-0001-0001-0006-000000000001', 'Darksteel Helmet', 'Darksteel Helmet', 'Topi Keluli Gelap', '暗钢头盔', 'helmet', 'darksteel', 'epic', '/equipment/darksteel_helmet.png', 6, 6, '#4A4A4A', '#8B0000'),
('e1010001-0001-0001-0006-000000000002', 'Darksteel Chestplate', 'Darksteel Chestplate', 'Baju Keluli Gelap', '暗钢胸甲', 'chestplate', 'darksteel', 'epic', '/equipment/darksteel_chestplate.png', 6, 6, '#4A4A4A', '#8B0000'),
('e1010001-0001-0001-0006-000000000003', 'Darksteel Leggings', 'Darksteel Leggings', 'Seluar Keluli Gelap', '暗钢护腿', 'leggings', 'darksteel', 'epic', '/equipment/darksteel_leggings.png', 6, 6, '#4A4A4A', '#8B0000'),
('e1010001-0001-0001-0006-000000000004', 'Darksteel Boots', 'Darksteel Boots', 'Kasut Keluli Gelap', '暗钢靴', 'boots', 'darksteel', 'epic', '/equipment/darksteel_boots.png', 6, 6, '#4A4A4A', '#8B0000'),
('e1010001-0001-0001-0006-000000000005', 'Darksteel Sword', 'Darksteel Sword', 'Pedang Keluli Gelap', '暗钢剑', 'weapon', 'darksteel', 'epic', '/equipment/darksteel_sword.png', 6, 6, '#4A4A4A', '#8B0000'),
('e1010001-0001-0001-0006-000000000006', 'Darksteel Pickaxe', 'Darksteel Pickaxe', 'Beliung Keluli Gelap', '暗钢镐', 'tool', 'darksteel', 'epic', '/equipment/darksteel_pickaxe.png', 6, 6, '#4A4A4A', '#8B0000'),
('e1010001-0001-0001-0006-000000000007', 'Darksteel Shield', 'Darksteel Shield', 'Perisai Keluli Gelap', '暗钢盾', 'shield', 'darksteel', 'epic', '/equipment/darksteel_shield.png', 6, 6, '#4A4A4A', '#8B0000'),

-- =====================================================
-- UNIT 7: Enchanted Iron Tier (Rare)
-- Theme: Iron infused with magical enchantments
-- =====================================================

('e1010001-0001-0001-0007-000000000001', 'Enchanted Iron Helmet', 'Enchanted Iron Helmet', 'Topi Besi Ajaib', '附魔铁头盔', 'helmet', 'enchanted_iron', 'rare', '/equipment/enchanted_iron_helmet.png', 7, 7, '#D3D3D3', '#9370DB'),
('e1010001-0001-0001-0007-000000000002', 'Enchanted Iron Chestplate', 'Enchanted Iron Chestplate', 'Baju Besi Ajaib', '附魔铁胸甲', 'chestplate', 'enchanted_iron', 'rare', '/equipment/enchanted_iron_chestplate.png', 7, 7, '#D3D3D3', '#9370DB'),
('e1010001-0001-0001-0007-000000000003', 'Enchanted Iron Leggings', 'Enchanted Iron Leggings', 'Seluar Besi Ajaib', '附魔铁护腿', 'leggings', 'enchanted_iron', 'rare', '/equipment/enchanted_iron_leggings.png', 7, 7, '#D3D3D3', '#9370DB'),
('e1010001-0001-0001-0007-000000000004', 'Enchanted Iron Boots', 'Enchanted Iron Boots', 'Kasut Besi Ajaib', '附魔铁靴', 'boots', 'enchanted_iron', 'rare', '/equipment/enchanted_iron_boots.png', 7, 7, '#D3D3D3', '#9370DB'),
('e1010001-0001-0001-0007-000000000005', 'Enchanted Iron Sword', 'Enchanted Iron Sword', 'Pedang Besi Ajaib', '附魔铁剑', 'weapon', 'enchanted_iron', 'rare', '/equipment/enchanted_iron_sword.png', 7, 7, '#D3D3D3', '#9370DB'),
('e1010001-0001-0001-0007-000000000006', 'Enchanted Iron Pickaxe', 'Enchanted Iron Pickaxe', 'Beliung Besi Ajaib', '附魔铁镐', 'tool', 'enchanted_iron', 'rare', '/equipment/enchanted_iron_pickaxe.png', 7, 7, '#D3D3D3', '#9370DB'),
('e1010001-0001-0001-0007-000000000007', 'Enchanted Iron Crossbow', 'Enchanted Iron Crossbow', 'Busur Silang Besi Ajaib', '附魔铁弩', 'ranged', 'enchanted_iron', 'rare', '/equipment/enchanted_iron_crossbow.png', 7, 7, '#D3D3D3', '#9370DB'),

-- =====================================================
-- UNIT 8: Enchanted Gold Tier (Epic)
-- Theme: Golden gear shimmering with magic
-- =====================================================

('e1010001-0001-0001-0008-000000000001', 'Enchanted Gold Helmet', 'Enchanted Gold Helmet', 'Topi Emas Ajaib', '附魔金头盔', 'helmet', 'enchanted_gold', 'epic', '/equipment/enchanted_gold_helmet.png', 8, 8, '#FFD700', '#9370DB'),
('e1010001-0001-0001-0008-000000000002', 'Enchanted Gold Chestplate', 'Enchanted Gold Chestplate', 'Baju Emas Ajaib', '附魔金胸甲', 'chestplate', 'enchanted_gold', 'epic', '/equipment/enchanted_gold_chestplate.png', 8, 8, '#FFD700', '#9370DB'),
('e1010001-0001-0001-0008-000000000003', 'Enchanted Gold Leggings', 'Enchanted Gold Leggings', 'Seluar Emas Ajaib', '附魔金护腿', 'leggings', 'enchanted_gold', 'epic', '/equipment/enchanted_gold_leggings.png', 8, 8, '#FFD700', '#9370DB'),
('e1010001-0001-0001-0008-000000000004', 'Enchanted Gold Boots', 'Enchanted Gold Boots', 'Kasut Emas Ajaib', '附魔金靴', 'boots', 'enchanted_gold', 'epic', '/equipment/enchanted_gold_boots.png', 8, 8, '#FFD700', '#9370DB'),
('e1010001-0001-0001-0008-000000000005', 'Enchanted Gold Sword', 'Enchanted Gold Sword', 'Pedang Emas Ajaib', '附魔金剑', 'weapon', 'enchanted_gold', 'epic', '/equipment/enchanted_gold_sword.png', 8, 8, '#FFD700', '#9370DB'),
('e1010001-0001-0001-0008-000000000006', 'Enchanted Gold Pickaxe', 'Enchanted Gold Pickaxe', 'Beliung Emas Ajaib', '附魔金镐', 'tool', 'enchanted_gold', 'epic', '/equipment/enchanted_gold_pickaxe.png', 8, 8, '#FFD700', '#9370DB'),
('e1010001-0001-0001-0008-000000000007', 'Enchanted Gold Shield', 'Enchanted Gold Shield', 'Perisai Emas Ajaib', '附魔金盾', 'shield', 'enchanted_gold', 'epic', '/equipment/enchanted_gold_shield.png', 8, 8, '#FFD700', '#9370DB'),

-- =====================================================
-- UNIT 9: Enchanted Diamond Tier (Epic)
-- Theme: Sparkling diamonds with powerful enchantments
-- =====================================================

('e1010001-0001-0001-0009-000000000001', 'Enchanted Diamond Helmet', 'Enchanted Diamond Helmet', 'Topi Berlian Ajaib', '附魔钻石头盔', 'helmet', 'enchanted_diamond', 'epic', '/equipment/enchanted_diamond_helmet.png', 9, 9, '#00CED1', '#9370DB'),
('e1010001-0001-0001-0009-000000000002', 'Enchanted Diamond Chestplate', 'Enchanted Diamond Chestplate', 'Baju Berlian Ajaib', '附魔钻石胸甲', 'chestplate', 'enchanted_diamond', 'epic', '/equipment/enchanted_diamond_chestplate.png', 9, 9, '#00CED1', '#9370DB'),
('e1010001-0001-0001-0009-000000000003', 'Enchanted Diamond Leggings', 'Enchanted Diamond Leggings', 'Seluar Berlian Ajaib', '附魔钻石护腿', 'leggings', 'enchanted_diamond', 'epic', '/equipment/enchanted_diamond_leggings.png', 9, 9, '#00CED1', '#9370DB'),
('e1010001-0001-0001-0009-000000000004', 'Enchanted Diamond Boots', 'Enchanted Diamond Boots', 'Kasut Berlian Ajaib', '附魔钻石靴', 'boots', 'enchanted_diamond', 'epic', '/equipment/enchanted_diamond_boots.png', 9, 9, '#00CED1', '#9370DB'),
('e1010001-0001-0001-0009-000000000005', 'Enchanted Diamond Sword', 'Enchanted Diamond Sword', 'Pedang Berlian Ajaib', '附魔钻石剑', 'weapon', 'enchanted_diamond', 'epic', '/equipment/enchanted_diamond_sword.png', 9, 9, '#00CED1', '#9370DB'),
('e1010001-0001-0001-0009-000000000006', 'Enchanted Diamond Pickaxe', 'Enchanted Diamond Pickaxe', 'Beliung Berlian Ajaib', '附魔钻石镐', 'tool', 'enchanted_diamond', 'epic', '/equipment/enchanted_diamond_pickaxe.png', 9, 9, '#00CED1', '#9370DB'),
('e1010001-0001-0001-0009-000000000007', 'Enchanted Diamond Bow', 'Enchanted Diamond Bow', 'Busur Berlian Ajaib', '附魔钻石弓', 'ranged', 'enchanted_diamond', 'epic', '/equipment/enchanted_diamond_bow.png', 9, 9, '#00CED1', '#9370DB'),

-- =====================================================
-- UNIT 10: Enchanted Darksteel Tier (Epic)
-- Theme: Dark metal infused with magical enchantments
-- =====================================================

('e1010001-0001-0001-0010-000000000001', 'Enchanted Darksteel Helmet', 'Enchanted Darksteel Helmet', 'Topi Keluli Gelap Ajaib', '附魔暗钢头盔', 'helmet', 'enchanted_darksteel', 'epic', '/equipment/enchanted_darksteel_helmet.png', 10, 10, '#4A4A4A', '#9370DB'),
('e1010001-0001-0001-0010-000000000002', 'Enchanted Darksteel Chestplate', 'Enchanted Darksteel Chestplate', 'Baju Keluli Gelap Ajaib', '附魔暗钢胸甲', 'chestplate', 'enchanted_darksteel', 'epic', '/equipment/enchanted_darksteel_chestplate.png', 10, 10, '#4A4A4A', '#9370DB'),
('e1010001-0001-0001-0010-000000000003', 'Enchanted Darksteel Leggings', 'Enchanted Darksteel Leggings', 'Seluar Keluli Gelap Ajaib', '附魔暗钢护腿', 'leggings', 'enchanted_darksteel', 'epic', '/equipment/enchanted_darksteel_leggings.png', 10, 10, '#4A4A4A', '#9370DB'),
('e1010001-0001-0001-0010-000000000004', 'Enchanted Darksteel Boots', 'Enchanted Darksteel Boots', 'Kasut Keluli Gelap Ajaib', '附魔暗钢靴', 'boots', 'enchanted_darksteel', 'epic', '/equipment/enchanted_darksteel_boots.png', 10, 10, '#4A4A4A', '#9370DB'),
('e1010001-0001-0001-0010-000000000005', 'Enchanted Darksteel Sword', 'Enchanted Darksteel Sword', 'Pedang Keluli Gelap Ajaib', '附魔暗钢剑', 'weapon', 'enchanted_darksteel', 'epic', '/equipment/enchanted_darksteel_sword.png', 10, 10, '#4A4A4A', '#9370DB'),
('e1010001-0001-0001-0010-000000000006', 'Enchanted Darksteel Pickaxe', 'Enchanted Darksteel Pickaxe', 'Beliung Keluli Gelap Ajaib', '附魔暗钢镐', 'tool', 'enchanted_darksteel', 'epic', '/equipment/enchanted_darksteel_pickaxe.png', 10, 10, '#4A4A4A', '#9370DB'),
('e1010001-0001-0001-0010-000000000007', 'Enchanted Darksteel Shield', 'Enchanted Darksteel Shield', 'Perisai Keluli Gelap Ajaib', '附魔暗钢盾', 'shield', 'enchanted_darksteel', 'epic', '/equipment/enchanted_darksteel_shield.png', 10, 10, '#4A4A4A', '#9370DB')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  name_ms = EXCLUDED.name_ms,
  name_zh = EXCLUDED.name_zh,
  slot = EXCLUDED.slot,
  tier = EXCLUDED.tier,
  rarity = EXCLUDED.rarity,
  image_url = EXCLUDED.image_url,
  required_level = EXCLUDED.required_level,
  unit_number = EXCLUDED.unit_number,
  color_primary = EXCLUDED.color_primary,
  color_secondary = EXCLUDED.color_secondary;

-- =====================================================
-- SEED COMPLETE: Units 1-10 (70 items)
-- =====================================================
