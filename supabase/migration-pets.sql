-- Migration: Add Pet System
-- Pets are fantasy creature companions rewarded when completing a unit

-- Create pets table (catalog of all available pets)
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,  -- e.g., 'wolf', 'cat', 'bone_warrior', 'forest_spirit'
  name JSONB NOT NULL,  -- {"ms": "Serigala", "zh": "狼", "en": "Wolf"}
  mob_type TEXT NOT NULL,  -- 'passive', 'neutral', 'hostile', 'utility'
  rarity TEXT NOT NULL DEFAULT 'common',  -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
  description JSONB,  -- {"ms": "...", "zh": "...", "en": "..."}
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create kid_pets table (pets owned by each kid)
CREATE TABLE IF NOT EXISTS kid_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  obtained_from_theme UUID REFERENCES themes(id),  -- Which theme rewarded this pet
  UNIQUE(kid_id, pet_id)  -- Each kid can only have one of each pet type
);

-- Add pet_id to kid_equipped table (equipped pet)
ALTER TABLE kid_equipped
ADD COLUMN IF NOT EXISTS pet_id TEXT REFERENCES pets(id) ON DELETE SET NULL;

-- Add pet_reward to themes table (each theme rewards a specific pet when all activities completed)
ALTER TABLE themes
ADD COLUMN IF NOT EXISTS pet_reward TEXT REFERENCES pets(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kid_pets_kid_id ON kid_pets(kid_id);
CREATE INDEX IF NOT EXISTS idx_kid_pets_pet_id ON kid_pets(pet_id);

-- Enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_pets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pets (everyone can read)
CREATE POLICY "Anyone can view pets" ON pets
  FOR SELECT USING (true);

-- RLS Policies for kid_pets
CREATE POLICY "Parents can view their kids pets" ON kid_pets
  FOR SELECT USING (
    kid_id IN (
      SELECT id FROM kids WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert their kids pets" ON kid_pets
  FOR INSERT WITH CHECK (
    kid_id IN (
      SELECT id FROM kids WHERE parent_id = auth.uid()
    )
  );

-- Insert initial pet catalog (fantasy creature companions)
INSERT INTO pets (id, name, mob_type, rarity, description) VALUES
-- Passive Mobs (Common)
('chicken', '{"ms": "Ayam", "zh": "鸡", "en": "Chicken"}', 'passive', 'common', '{"ms": "Ayam yang comel", "zh": "可爱的小鸡", "en": "A cute chicken"}'),
('cow', '{"ms": "Lembu", "zh": "牛", "en": "Cow"}', 'passive', 'common', '{"ms": "Lembu yang jinak", "zh": "温顺的牛", "en": "A gentle cow"}'),
('pig', '{"ms": "Babi", "zh": "猪", "en": "Pig"}', 'passive', 'common', '{"ms": "Babi yang gembira", "zh": "快乐的猪", "en": "A happy pig"}'),
('sheep', '{"ms": "Kambing Biri-biri", "zh": "绵羊", "en": "Sheep"}', 'passive', 'common', '{"ms": "Kambing berbulu lembut", "zh": "毛茸茸的绵羊", "en": "A fluffy sheep"}'),
('rabbit', '{"ms": "Arnab", "zh": "兔子", "en": "Rabbit"}', 'passive', 'common', '{"ms": "Arnab yang lincah", "zh": "活泼的兔子", "en": "A hopping rabbit"}'),

-- Passive Mobs (Uncommon)
('cat', '{"ms": "Kucing", "zh": "猫", "en": "Cat"}', 'passive', 'uncommon', '{"ms": "Kucing yang manja", "zh": "可爱的猫咪", "en": "A cute cat"}'),
('wolf', '{"ms": "Serigala", "zh": "狼", "en": "Wolf"}', 'neutral', 'uncommon', '{"ms": "Serigala yang setia", "zh": "忠诚的狼", "en": "A loyal wolf"}'),
('fox', '{"ms": "Musang", "zh": "狐狸", "en": "Fox"}', 'passive', 'uncommon', '{"ms": "Musang yang cerdik", "zh": "聪明的狐狸", "en": "A clever fox"}'),
('parrot', '{"ms": "Burung Nuri", "zh": "鹦鹉", "en": "Parrot"}', 'passive', 'uncommon', '{"ms": "Burung nuri berwarna-warni", "zh": "五彩缤纷的鹦鹉", "en": "A colorful parrot"}'),
('turtle', '{"ms": "Penyu", "zh": "海龟", "en": "Turtle"}', 'passive', 'uncommon', '{"ms": "Penyu yang perlahan", "zh": "慢吞吞的海龟", "en": "A slow turtle"}'),

-- Neutral/Hostile Mobs (Rare)
('bee', '{"ms": "Lebah", "zh": "蜜蜂", "en": "Bee"}', 'neutral', 'rare', '{"ms": "Lebah yang rajin", "zh": "勤劳的蜜蜂", "en": "A busy bee"}'),
('panda', '{"ms": "Panda", "zh": "熊猫", "en": "Panda"}', 'passive', 'rare', '{"ms": "Panda yang comel", "zh": "可爱的熊猫", "en": "A cute panda"}'),
('axolotl', '{"ms": "Axolotl", "zh": "美西螈", "en": "Axolotl"}', 'passive', 'rare', '{"ms": "Axolotl yang unik", "zh": "独特的美西螈", "en": "A unique axolotl"}'),
('ocelot', '{"ms": "Kucing Hutan", "zh": "豹猫", "en": "Ocelot"}', 'passive', 'rare', '{"ms": "Kucing hutan yang liar", "zh": "野生豹猫", "en": "A wild ocelot"}'),
('llama', '{"ms": "Llama", "zh": "羊驼", "en": "Llama"}', 'neutral', 'rare', '{"ms": "Llama yang pelik", "zh": "奇特的羊驼", "en": "A quirky llama"}'),

-- Fantasy Creatures (Epic)
('bone_warrior', '{"ms": "Pahlawan Tulang", "zh": "骨战士", "en": "Bone Warrior"}', 'neutral', 'epic', '{"ms": "Pahlawan rangka yang setia", "zh": "忠诚的骨骼战士", "en": "A loyal skeletal warrior"}'),
('moss_knight', '{"ms": "Kesatria Lumut", "zh": "苔藓骑士", "en": "Moss Knight"}', 'neutral', 'epic', '{"ms": "Kesatria kuno yang diliputi lumut", "zh": "被青苔覆盖的古老骑士", "en": "An ancient knight covered in moss"}'),
('forest_spirit', '{"ms": "Roh Hutan", "zh": "森林精灵", "en": "Forest Spirit"}', 'neutral', 'epic', '{"ms": "Roh hijau yang tenang dari hutan", "zh": "来自森林的安静绿色精灵", "en": "A calm green spirit from the forest"}'),
('spider', '{"ms": "Labah-labah", "zh": "蜘蛛", "en": "Spider"}', 'hostile', 'epic', '{"ms": "Labah-labah besar", "zh": "大蜘蛛", "en": "A big spider"}'),
('jelly_blob', '{"ms": "Gumpalan Jeli", "zh": "果冻怪", "en": "Jelly Blob"}', 'neutral', 'epic', '{"ms": "Makhluk jeli yang comel dan melantun", "zh": "可爱的弹跳果冻生物", "en": "A cute bouncy jelly creature"}'),

-- Legendary Creatures
('stone_guardian', '{"ms": "Penjaga Batu", "zh": "石像守卫", "en": "Stone Guardian"}', 'utility', 'legendary', '{"ms": "Pelindung batu yang kuat dan setia", "zh": "强大忠诚的石头守护者", "en": "A strong and loyal stone protector"}'),
('frost_sprite', '{"ms": "Pari Fros", "zh": "霜精灵", "en": "Frost Sprite"}', 'utility', 'legendary', '{"ms": "Makhluk ais yang ceria dan dingin", "zh": "快乐的冰冷生物", "en": "A cheerful icy creature"}'),
('pixie', '{"ms": "Pari Kecil", "zh": "小精灵", "en": "Pixie"}', 'passive', 'legendary', '{"ms": "Pari kecil yang suka membantu", "zh": "喜欢帮助人的小精灵", "en": "A helpful little fairy"}'),
('shadow_drake', '{"ms": "Naga Bayang", "zh": "暗影龙", "en": "Shadow Drake"}', 'neutral', 'legendary', '{"ms": "Naga berkuasa dari alam bayang", "zh": "来自暗影领域的强大龙", "en": "A powerful dragon from the shadow realm"}'),
('doom_wraith', '{"ms": "Hantu Azab", "zh": "末日幽灵", "en": "Doom Wraith"}', 'neutral', 'legendary', '{"ms": "Roh gelap yang menakutkan tetapi setia", "zh": "可怕但忠诚的黑暗灵魂", "en": "A fearsome but loyal dark spirit"}')
ON CONFLICT (id) DO NOTHING;

-- Grant service role full access
GRANT ALL ON pets TO service_role;
GRANT ALL ON kid_pets TO service_role;
