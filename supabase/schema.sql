-- MYLearnt Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- PARENT ACCOUNTS
-- =====================
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'ms' CHECK (preferred_language IN ('ms', 'zh', 'en')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- KIDS PROFILES
-- =====================
CREATE TABLE IF NOT EXISTS kids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  school TEXT,
  grade TEXT NOT NULL CHECK (grade IN ('primary_1', 'primary_2', 'primary_3', 'primary_4', 'primary_5', 'primary_6')),
  preferred_language TEXT DEFAULT 'ms' CHECK (preferred_language IN ('ms', 'zh', 'en')),
  avatar_seed TEXT,
  generated_avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add column if table already exists (for migrations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kids' AND column_name = 'generated_avatar_url') THEN
    ALTER TABLE kids ADD COLUMN generated_avatar_url TEXT;
  END IF;
END $$;

-- =====================
-- SUBJECTS
-- =====================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL CHECK (code IN ('bm', 'bc', 'en', 'math')),
  name_ms TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0
);

-- Insert default subjects
INSERT INTO subjects (code, name_ms, name_zh, name_en, icon, color, order_index) VALUES
  ('bm', 'Bahasa Malaysia', '马来语', 'Bahasa Malaysia', '🇲🇾', '#FFD700', 1),
  ('bc', 'Bahasa Cina', '华语', 'Chinese', '🇨🇳', '#FF4444', 2),
  ('en', 'Bahasa Inggeris', '英语', 'English', 'EN', '#4169E1', 3),
  ('math', 'Matematik', '数学', 'Mathematics', '🔢', '#32CD32', 4)
ON CONFLICT (code) DO NOTHING;

-- =====================
-- THEMES (Units within subjects)
-- =====================
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name_ms TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ms TEXT,
  description_zh TEXT,
  description_en TEXT,
  order_index INTEGER DEFAULT 0,
  required_grade TEXT CHECK (required_grade IN ('primary_1', 'primary_2', 'primary_3', 'primary_4', 'primary_5', 'primary_6'))
);

-- =====================
-- EQUIPMENT (8-bit warrior RPG items)
-- =====================
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ms TEXT,
  name_zh TEXT,
  name_en TEXT,
  slot TEXT NOT NULL CHECK (slot IN ('helmet', 'chestplate', 'leggings', 'boots', 'weapon')),
  tier TEXT NOT NULL CHECK (tier IN ('leather', 'chain', 'iron', 'gold', 'diamond')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  image_url TEXT NOT NULL,
  required_level INTEGER DEFAULT 1
);

-- Insert default equipment
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, image_url, required_level) VALUES
  -- Helmets
  ('Leather Helmet', 'Topi Kulit', '皮革头盔', 'Leather Helmet', 'helmet', 'leather', 'common', '/equipment/leather_helmet.png', 1),
  ('Chain Helmet', 'Topi Rantai', '锁链头盔', 'Chain Helmet', 'helmet', 'chain', 'common', '/equipment/chain_helmet.png', 3),
  ('Iron Helmet', 'Topi Besi', '铁头盔', 'Iron Helmet', 'helmet', 'iron', 'rare', '/equipment/iron_helmet.png', 5),
  ('Gold Helmet', 'Topi Emas', '金头盔', 'Gold Helmet', 'helmet', 'gold', 'epic', '/equipment/gold_helmet.png', 8),
  ('Diamond Helmet', 'Topi Berlian', '钻石头盔', 'Diamond Helmet', 'helmet', 'diamond', 'legendary', '/equipment/diamond_helmet.png', 10),
  -- Chestplates
  ('Leather Chestplate', 'Baju Kulit', '皮革胸甲', 'Leather Chestplate', 'chestplate', 'leather', 'common', '/equipment/leather_chestplate.png', 1),
  ('Chain Chestplate', 'Baju Rantai', '锁链胸甲', 'Chain Chestplate', 'chestplate', 'chain', 'common', '/equipment/chain_chestplate.png', 3),
  ('Iron Chestplate', 'Baju Besi', '铁胸甲', 'Iron Chestplate', 'chestplate', 'iron', 'rare', '/equipment/iron_chestplate.png', 5),
  ('Gold Chestplate', 'Baju Emas', '金胸甲', 'Gold Chestplate', 'chestplate', 'gold', 'epic', '/equipment/gold_chestplate.png', 8),
  ('Diamond Chestplate', 'Baju Berlian', '钻石胸甲', 'Diamond Chestplate', 'chestplate', 'diamond', 'legendary', '/equipment/diamond_chestplate.png', 10),
  -- Leggings
  ('Leather Leggings', 'Seluar Kulit', '皮革护腿', 'Leather Leggings', 'leggings', 'leather', 'common', '/equipment/leather_leggings.png', 1),
  ('Chain Leggings', 'Seluar Rantai', '锁链护腿', 'Chain Leggings', 'leggings', 'chain', 'common', '/equipment/chain_leggings.png', 3),
  ('Iron Leggings', 'Seluar Besi', '铁护腿', 'Iron Leggings', 'leggings', 'iron', 'rare', '/equipment/iron_leggings.png', 5),
  ('Gold Leggings', 'Seluar Emas', '金护腿', 'Gold Leggings', 'leggings', 'gold', 'epic', '/equipment/gold_leggings.png', 8),
  ('Diamond Leggings', 'Seluar Berlian', '钻石护腿', 'Diamond Leggings', 'leggings', 'diamond', 'legendary', '/equipment/diamond_leggings.png', 10),
  -- Boots
  ('Leather Boots', 'Kasut Kulit', '皮革靴子', 'Leather Boots', 'boots', 'leather', 'common', '/equipment/leather_boots.png', 1),
  ('Chain Boots', 'Kasut Rantai', '锁链靴子', 'Chain Boots', 'boots', 'chain', 'common', '/equipment/chain_boots.png', 3),
  ('Iron Boots', 'Kasut Besi', '铁靴子', 'Iron Boots', 'boots', 'iron', 'rare', '/equipment/iron_boots.png', 5),
  ('Gold Boots', 'Kasut Emas', '金靴子', 'Gold Boots', 'boots', 'gold', 'epic', '/equipment/gold_boots.png', 8),
  ('Diamond Boots', 'Kasut Berlian', '钻石靴子', 'Diamond Boots', 'boots', 'diamond', 'legendary', '/equipment/diamond_boots.png', 10),
  -- Weapons
  ('Wooden Sword', 'Pedang Kayu', '木剑', 'Wooden Sword', 'weapon', 'leather', 'common', '/equipment/wooden_sword.png', 1),
  ('Stone Sword', 'Pedang Batu', '石剑', 'Stone Sword', 'weapon', 'chain', 'common', '/equipment/stone_sword.png', 2),
  ('Iron Sword', 'Pedang Besi', '铁剑', 'Iron Sword', 'weapon', 'iron', 'rare', '/equipment/iron_sword.png', 4),
  ('Gold Sword', 'Pedang Emas', '金剑', 'Gold Sword', 'weapon', 'gold', 'epic', '/equipment/gold_sword.png', 7),
  ('Diamond Sword', 'Pedang Berlian', '钻石剑', 'Diamond Sword', 'weapon', 'diamond', 'legendary', '/equipment/diamond_sword.png', 10)
ON CONFLICT DO NOTHING;

-- =====================
-- ACTIVITIES
-- =====================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('alphabet', 'matching', 'syllable', 'writing', 'speaking', 'singing', 'math', 'dictation')),
  title_ms TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  instructions_ms TEXT,
  instructions_zh TEXT,
  instructions_en TEXT,
  content JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  equipment_reward_id UUID REFERENCES equipment(id),
  order_index INTEGER DEFAULT 0
);

-- =====================
-- KID INVENTORY
-- =====================
CREATE TABLE IF NOT EXISTS kid_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) NOT NULL,
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kid_id, equipment_id)
);

-- =====================
-- KID EQUIPPED ITEMS
-- =====================
CREATE TABLE IF NOT EXISTS kid_equipped (
  kid_id UUID PRIMARY KEY REFERENCES kids(id) ON DELETE CASCADE,
  helmet_id UUID REFERENCES equipment(id),
  chestplate_id UUID REFERENCES equipment(id),
  leggings_id UUID REFERENCES equipment(id),
  boots_id UUID REFERENCES equipment(id),
  weapon_id UUID REFERENCES equipment(id)
);

-- =====================
-- KID PROGRESS
-- =====================
CREATE TABLE IF NOT EXISTS kid_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  score INTEGER,
  stars INTEGER CHECK (stars >= 1 AND stars <= 3),
  attempts INTEGER DEFAULT 0,
  ai_feedback JSONB,
  completed_at TIMESTAMPTZ,
  UNIQUE(kid_id, activity_id)
);

-- =====================
-- KID SUBJECT PROGRESS (Aggregated)
-- =====================
CREATE TABLE IF NOT EXISTS kid_subject_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  total_activities INTEGER DEFAULT 0,
  completed_activities INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  UNIQUE(kid_id, subject_id)
);

-- =====================
-- VOICE SESSIONS
-- =====================
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  transcript TEXT,
  ai_response TEXT,
  pronunciation_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- HELPER FUNCTIONS (before RLS policies)
-- =====================

-- Security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM parents WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================

-- Enable RLS on all tables
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_equipped ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_subject_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;

-- Parents policies
CREATE POLICY "Users can view own parent profile" ON parents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own parent profile" ON parents
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own parent profile" ON parents
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all parents
CREATE POLICY "Admins can view all parents" ON parents
  FOR SELECT USING (is_admin());

-- Kids policies
CREATE POLICY "Parents can view own kids" ON kids
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own kids" ON kids
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own kids" ON kids
  FOR UPDATE USING (parent_id = auth.uid());

CREATE POLICY "Parents can delete own kids" ON kids
  FOR DELETE USING (parent_id = auth.uid());

-- Admin can view all kids
CREATE POLICY "Admins can view all kids" ON kids
  FOR SELECT USING (is_admin());

-- Subjects, themes, equipment, activities - public read access
CREATE POLICY "Anyone can view subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view themes" ON themes FOR SELECT USING (true);
CREATE POLICY "Anyone can view equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Anyone can view activities" ON activities FOR SELECT USING (true);

-- Kid inventory policies
CREATE POLICY "Parents can view kid inventory" ON kid_inventory
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = kid_inventory.kid_id AND kids.parent_id = auth.uid())
  );

CREATE POLICY "Parents can manage kid inventory" ON kid_inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = kid_inventory.kid_id AND kids.parent_id = auth.uid())
  );

-- Kid equipped policies
CREATE POLICY "Parents can view kid equipped" ON kid_equipped
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = kid_equipped.kid_id AND kids.parent_id = auth.uid())
  );

CREATE POLICY "Parents can manage kid equipped" ON kid_equipped
  FOR ALL USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = kid_equipped.kid_id AND kids.parent_id = auth.uid())
  );

-- Kid progress policies
CREATE POLICY "Parents can view kid progress" ON kid_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = kid_progress.kid_id AND kids.parent_id = auth.uid())
  );

CREATE POLICY "Parents can manage kid progress" ON kid_progress
  FOR ALL USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = kid_progress.kid_id AND kids.parent_id = auth.uid())
  );

-- Admin can view all progress
CREATE POLICY "Admins can view all progress" ON kid_progress
  FOR SELECT USING (is_admin());

-- Kid subject progress policies
CREATE POLICY "Parents can view kid subject progress" ON kid_subject_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = kid_subject_progress.kid_id AND kids.parent_id = auth.uid())
  );

CREATE POLICY "Parents can manage kid subject progress" ON kid_subject_progress
  FOR ALL USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = kid_subject_progress.kid_id AND kids.parent_id = auth.uid())
  );

-- Voice sessions policies
CREATE POLICY "Parents can view voice sessions" ON voice_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = voice_sessions.kid_id AND kids.parent_id = auth.uid())
  );

CREATE POLICY "Parents can manage voice sessions" ON voice_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM kids WHERE kids.id = voice_sessions.kid_id AND kids.parent_id = auth.uid())
  );

-- =====================
-- FUNCTIONS
-- =====================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0))::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Function to update kid's level when XP changes
CREATE OR REPLACE FUNCTION update_kid_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := calculate_level(NEW.total_xp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update level
CREATE TRIGGER kid_level_update
  BEFORE UPDATE OF total_xp ON kids
  FOR EACH ROW
  EXECUTE FUNCTION update_kid_level();

-- =====================
-- INDEXES
-- =====================

CREATE INDEX IF NOT EXISTS idx_kids_parent_id ON kids(parent_id);
CREATE INDEX IF NOT EXISTS idx_themes_subject_id ON themes(subject_id);
CREATE INDEX IF NOT EXISTS idx_activities_theme_id ON activities(theme_id);
CREATE INDEX IF NOT EXISTS idx_kid_progress_kid_id ON kid_progress(kid_id);
CREATE INDEX IF NOT EXISTS idx_kid_progress_activity_id ON kid_progress(activity_id);
CREATE INDEX IF NOT EXISTS idx_kid_subject_progress_kid_id ON kid_subject_progress(kid_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_kid_id ON voice_sessions(kid_id);

-- =====================
-- STORAGE BUCKETS
-- =====================
-- Note: Run this in Supabase Dashboard > Storage > Create Bucket
-- Bucket name: avatars
-- Public: true (for displaying avatars)
--
-- Or use the SQL below (requires admin access):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
--
-- RLS Policy for avatars bucket (run in SQL Editor):
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
-- CREATE POLICY "Allow public reads" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');
