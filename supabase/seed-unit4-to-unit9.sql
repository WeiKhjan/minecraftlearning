-- MYLearnt Seed Data: Unit 4 to Unit 9
-- Run this after seed.sql and seed-unit2-unit3.sql
-- TEMA 2: HIDUP HARMONI (Units 4-6)
-- TEMA 3: BADAN SIHAT DAN BERSIH (Units 7-9)

-- =====================
-- SECTION 1: NEW EQUIPMENT ITEMS
-- =====================

-- Leather Tier Variants (for Units 4-8)
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level, image_url) VALUES
-- Unit 4 Equipment Set
('Leather Helmet 2', 'Topi Keledar Kulit 2', '皮革头盔 2', 'Leather Helmet 2', 'helmet', 'leather', 'common', 4, 'images/equipment/leather_helmet_2.png'),
('Leather Chestplate 2', 'Baju Besi Kulit 2', '皮革胸甲 2', 'Leather Chestplate 2', 'chestplate', 'leather', 'common', 4, 'images/equipment/leather_chestplate_2.png'),
('Leather Leggings 2', 'Seluar Kulit 2', '皮革护腿 2', 'Leather Leggings 2', 'leggings', 'leather', 'common', 4, 'images/equipment/leather_leggings_2.png'),
('Leather Boots 2', 'Kasut Kulit 2', '皮革靴子 2', 'Leather Boots 2', 'boots', 'leather', 'common', 4, 'images/equipment/leather_boots_2.png'),
('Wooden Axe', 'Kapak Kayu', '木斧', 'Wooden Axe', 'weapon', 'leather', 'common', 4, 'images/equipment/wooden_axe.png'),
-- Unit 5 Equipment Set
('Leather Cap', 'Topi Kulit', '皮革帽', 'Leather Cap', 'helmet', 'leather', 'common', 5, 'images/equipment/leather_cap.png'),
('Leather Vest', 'Vest Kulit', '皮革背心', 'Leather Vest', 'chestplate', 'leather', 'common', 5, 'images/equipment/leather_vest.png'),
('Leather Pants', 'Seluar Panjang Kulit', '皮革长裤', 'Leather Pants', 'leggings', 'leather', 'common', 5, 'images/equipment/leather_pants.png'),
('Leather Shoes', 'Kasut Kulit Ringan', '皮革轻便鞋', 'Leather Shoes', 'boots', 'leather', 'common', 5, 'images/equipment/leather_shoes.png'),
('Wooden Pickaxe', 'Beliung Kayu', '木镐', 'Wooden Pickaxe', 'weapon', 'leather', 'common', 5, 'images/equipment/wooden_pickaxe.png'),
-- Unit 6 Equipment Set
('Leather Hood', 'Tudung Kulit', '皮革兜帽', 'Leather Hood', 'helmet', 'leather', 'common', 6, 'images/equipment/leather_hood.png'),
('Leather Tunic', 'Tunik Kulit', '皮革束腰外衣', 'Leather Tunic', 'chestplate', 'leather', 'common', 6, 'images/equipment/leather_tunic.png'),
('Leather Trousers', 'Seluar Kulit Panjang', '皮革裤子', 'Leather Trousers', 'leggings', 'leather', 'common', 6, 'images/equipment/leather_trousers.png'),
('Leather Sandals', 'Sandal Kulit', '皮革凉鞋', 'Leather Sandals', 'boots', 'leather', 'common', 6, 'images/equipment/leather_sandals.png'),
('Wooden Shovel', 'Penyodok Kayu', '木铲', 'Wooden Shovel', 'weapon', 'leather', 'common', 6, 'images/equipment/wooden_shovel.png'),
-- Unit 7 Equipment Set
('Leather Bandana', 'Bandana Kulit', '皮革头巾', 'Leather Bandana', 'helmet', 'leather', 'common', 7, 'images/equipment/leather_bandana.png'),
('Leather Jerkin', 'Jerkin Kulit', '皮革紧身上衣', 'Leather Jerkin', 'chestplate', 'leather', 'common', 7, 'images/equipment/leather_jerkin.png'),
('Leather Shorts', 'Seluar Pendek Kulit', '皮革短裤', 'Leather Shorts', 'leggings', 'leather', 'common', 7, 'images/equipment/leather_shorts.png'),
('Leather Slippers', 'Selipar Kulit', '皮革拖鞋', 'Leather Slippers', 'boots', 'leather', 'common', 7, 'images/equipment/leather_slippers.png'),
('Wooden Hoe', 'Cangkul Kayu', '木锄', 'Wooden Hoe', 'weapon', 'leather', 'common', 7, 'images/equipment/wooden_hoe.png'),
-- Unit 8 Equipment Set
('Leather Headband', 'Ikat Kepala Kulit', '皮革头带', 'Leather Headband', 'helmet', 'leather', 'common', 8, 'images/equipment/leather_headband.png'),
('Leather Armor', 'Armor Kulit', '皮革盔甲', 'Leather Armor', 'chestplate', 'leather', 'common', 8, 'images/equipment/leather_armor.png'),
('Leather Kilt', 'Kilt Kulit', '皮革短裙', 'Leather Kilt', 'leggings', 'leather', 'common', 8, 'images/equipment/leather_kilt.png'),
('Leather Moccasins', 'Mokasin Kulit', '皮革软皮鞋', 'Leather Moccasins', 'boots', 'leather', 'common', 8, 'images/equipment/leather_moccasins.png'),
('Wooden Club', 'Belantan Kayu', '木棒', 'Wooden Club', 'weapon', 'leather', 'common', 8, 'images/equipment/wooden_club.png')
ON CONFLICT DO NOTHING;

-- =====================
-- SECTION 2: NEW PET RECORDS
-- =====================
-- Note: Uses existing pets table schema with JSONB for name/description

INSERT INTO pets (id, name, mob_type, rarity, description, image_url) VALUES
-- Unit 4: Baby Cow
('baby_cow', '{"ms": "Anak Lembu", "zh": "小牛", "en": "Baby Cow"}', 'passive', 'common', '{"ms": "Seekor anak lembu yang comel dan suka makan rumput", "zh": "一只可爱的小牛，喜欢吃草", "en": "A cute baby cow that loves eating grass"}', 'images/pets/baby_cow.png'),
-- Unit 5: Baby Rabbit
('baby_rabbit', '{"ms": "Anak Arnab", "zh": "小兔子", "en": "Baby Rabbit"}', 'passive', 'common', '{"ms": "Seekor anak arnab yang lincah dan suka melompat", "zh": "一只活泼的小兔子，喜欢跳跃", "en": "An agile baby rabbit that loves hopping"}', 'images/pets/baby_rabbit.png'),
-- Unit 6: Wolf Pup
('wolf_pup', '{"ms": "Anak Serigala", "zh": "小狼", "en": "Wolf Pup"}', 'neutral', 'rare', '{"ms": "Seekor anak serigala yang setia dan berani", "zh": "一只忠诚勇敢的小狼", "en": "A loyal and brave wolf pup"}', 'images/pets/wolf_pup.png'),
-- Unit 7: Kitten
('kitten', '{"ms": "Anak Kucing", "zh": "小猫", "en": "Kitten"}', 'passive', 'rare', '{"ms": "Seekor anak kucing yang manja dan suka bermain", "zh": "一只可爱的小猫，喜欢玩耍", "en": "A cuddly kitten that loves to play"}', 'images/pets/kitten.png'),
-- Unit 8: Fox Kit
('fox_kit', '{"ms": "Anak Musang", "zh": "小狐狸", "en": "Fox Kit"}', 'passive', 'rare', '{"ms": "Seekor anak musang yang bijak dan pantas", "zh": "一只聪明敏捷的小狐狸", "en": "A clever and quick fox kit"}', 'images/pets/fox_kit.png'),
-- Unit 9: Parrot Chick
('parrot_chick', '{"ms": "Anak Burung Kakak Tua", "zh": "小鹦鹉", "en": "Parrot Chick"}', 'passive', 'rare', '{"ms": "Seekor anak burung kakak tua yang pandai meniru bunyi", "zh": "一只会模仿声音的小鹦鹉", "en": "A parrot chick that can mimic sounds"}', 'images/pets/parrot_chick.png')
ON CONFLICT (id) DO NOTHING;


-- =====================
-- TEMA 2: HIDUP HARMONI
-- =====================

-- =====================
-- UNIT 4: KENALI JIRAN (Know Your Neighbors)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 4 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_2_unit_4',
    'Kenali Jiran',
    '认识邻居',
    'Know Your Neighbors',
    'Belajar perkataan tentang kejiranan dan komuniti',
    '学习关于邻里和社区的单词',
    'Learn words about neighborhood and community',
    4,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Ajuk dan Sebut (BA:20)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Helmet 2' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Ajuk dan Sebut',
    '模仿和说',
    'Imitate and Say',
    'Ajuk dan sebut perkataan dengan betul',
    '正确模仿和说出单词',
    'Imitate and say the words correctly',
    '{"type": "syllable", "data": {"words": [{"word": "pasu", "syllables": ["pa", "su"], "meaning_ms": "pasu", "meaning_zh": "花瓶", "meaning_en": "vase", "image": "/images/vocab/pasu.png"}, {"word": "bantal", "syllables": ["ban", "tal"], "meaning_ms": "bantal", "meaning_zh": "枕头", "meaning_en": "pillow", "image": "/images/vocab/bantal.png"}, {"word": "jam", "syllables": ["jam"], "meaning_ms": "jam", "meaning_zh": "钟", "meaning_en": "clock", "image": "/images/vocab/jam.png"}, {"word": "jiran", "syllables": ["ji", "ran"], "meaning_ms": "jiran", "meaning_zh": "邻居", "meaning_en": "neighbor", "image": "/images/vocab/jiran.png"}, {"word": "pensel", "syllables": ["pen", "sel"], "meaning_ms": "pensel", "meaning_zh": "铅笔", "meaning_en": "pencil", "image": "/images/vocab/pensel.png"}, {"word": "obor", "syllables": ["o", "bor"], "meaning_ms": "obor", "meaning_zh": "火炬", "meaning_en": "torch", "image": "/images/vocab/obor.png"}, {"word": "ikan", "syllables": ["i", "kan"], "meaning_ms": "ikan", "meaning_zh": "鱼", "meaning_en": "fish", "image": "/images/vocab/ikan.png"}, {"word": "duduk", "syllables": ["du", "duk"], "meaning_ms": "duduk", "meaning_zh": "坐", "meaning_en": "sit", "image": "/images/vocab/duduk.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Mari Baca Perkataan (BA:21)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Chestplate 2' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Mari Baca Perkataan',
    '来读单词',
    'Let''s Read Words',
    'Padankan perkataan dengan gambar yang betul',
    '将单词与正确的图片配对',
    'Match the word with the correct picture',
    '{"type": "matching", "data": {"pairs": [{"word": "butang", "meaning_ms": "butang", "meaning_zh": "纽扣", "meaning_en": "button", "image": "/images/vocab/butang.png"}, {"word": "tudung", "meaning_ms": "tudung", "meaning_zh": "头巾", "meaning_en": "headscarf", "image": "/images/vocab/tudung.png"}, {"word": "dinding", "meaning_ms": "dinding", "meaning_zh": "墙", "meaning_en": "wall", "image": "/images/vocab/dinding.png"}, {"word": "tangga", "meaning_ms": "tangga", "meaning_zh": "楼梯", "meaning_en": "stairs", "image": "/images/vocab/tangga.png"}, {"word": "tong", "meaning_ms": "tong", "meaning_zh": "桶", "meaning_en": "barrel", "image": "/images/vocab/tong.png"}, {"word": "orang", "meaning_ms": "orang", "meaning_zh": "人", "meaning_en": "person", "image": "/images/vocab/orang.png"}, {"word": "kolam", "meaning_ms": "kolam", "meaning_zh": "池塘", "meaning_en": "pond", "image": "/images/vocab/kolam.png"}, {"word": "selipar", "meaning_ms": "selipar", "meaning_zh": "拖鞋", "meaning_en": "slipper", "image": "/images/vocab/selipar.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Frasa (BA:22)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Leggings 2' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Frasa',
    '写短语',
    'Write Phrases',
    'Tulis frasa tentang keluarga jiran',
    '写关于邻居家庭的短语',
    'Write phrases about neighbor''s family',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Encik Ravi bapa Arun", "meaning_ms": "Encik Ravi bapa Arun", "meaning_zh": "拉维先生是阿伦的父亲", "meaning_en": "Mr. Ravi is Arun''s father"}, {"word": "anggota polis", "meaning_ms": "anggota polis", "meaning_zh": "警察", "meaning_en": "police officer"}, {"word": "Puan Jaya ibu Arun", "meaning_ms": "Puan Jaya ibu Arun", "meaning_zh": "贾雅夫人是阿伦的母亲", "meaning_en": "Mrs. Jaya is Arun''s mother"}, {"word": "jururawat", "meaning_ms": "jururawat", "meaning_zh": "护士", "meaning_en": "nurse"}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Mari Berpantun - Hidup Berjiran (BA:23)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Boots 2' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Mari Berpantun - Hidup Berjiran',
    '来念诗 - 邻里生活',
    'Let''s Recite Pantun - Neighborhood Life',
    'Sebut pantun dengan betul',
    '正确朗诵马来诗歌',
    'Recite the pantun correctly',
    '{"type": "speaking", "data": {"phrases": [{"text": "Buah cempedak di luar pagar,", "translation_ms": "Buah cempedak di luar pagar,", "translation_zh": "榴莲果在篱笆外，", "translation_en": "Cempedak fruit outside the fence,", "voice_guide": "Baris pantun pertama. Buah cempedak di luar pagar. Ini pembayang pantun. Sebut dengan saya: Buah cempedak di luar pagar."}, {"text": "Ambil galah tolong jolokkan.", "translation_ms": "Ambil galah tolong jolokkan.", "translation_zh": "拿竹竿帮忙捅下来。", "translation_en": "Take a pole to help knock it down.", "voice_guide": "Baris pantun kedua. Ambil galah tolong jolokkan. Ini masih pembayang. Sebut dengan saya: Ambil galah tolong jolokkan."}, {"text": "Saya budak baru belajar,", "translation_ms": "Saya budak baru belajar,", "translation_zh": "我是刚学习的孩子，", "translation_en": "I am a child just learning,", "voice_guide": "Baris pantun ketiga. Saya budak baru belajar. Ini maksud pantun. Sebut dengan saya: Saya budak baru belajar."}, {"text": "Kalau salah tolong tunjukkan.", "translation_ms": "Kalau salah tolong tunjukkan.", "translation_zh": "如果错了请指正。", "translation_en": "If wrong, please show me.", "voice_guide": "Baris pantun keempat. Kalau salah tolong tunjukkan. Maksud pantun ialah kita harus rendah diri dalam belajar. Sebut dengan saya: Kalau salah tolong tunjukkan."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Ayat Penyata (BA:24)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Wooden Axe' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Ayat Penyata',
    '陈述句',
    'Declarative Sentences',
    'Sebut ayat penyata dengan betul',
    '正确说出陈述句',
    'Say the declarative sentences correctly',
    '{"type": "speaking", "data": {"phrases": [{"text": "Ini ruang bacaan.", "translation_ms": "Ini ruang bacaan.", "translation_zh": "这是阅读角。", "translation_en": "This is the reading corner.", "voice_guide": "Ayat ini ialah Ini ruang bacaan. Ayat penyata memberitahu sesuatu. Sebut dengan saya: Ini ruang bacaan."}, {"text": "Kakak sedang membaca buku.", "translation_ms": "Kakak sedang membaca buku.", "translation_zh": "姐姐正在读书。", "translation_en": "Sister is reading a book.", "voice_guide": "Ayat ini ialah Kakak sedang membaca buku. Ayat ini menyatakan apa yang kakak sedang buat. Sebut dengan saya: Kakak sedang membaca buku."}, {"text": "Abang membantu adik.", "translation_ms": "Abang membantu adik.", "translation_zh": "哥哥帮助弟弟妹妹。", "translation_en": "Brother helps younger sibling.", "voice_guide": "Ayat ini ialah Abang membantu adik. Ini menunjukkan perbuatan baik dalam keluarga. Sebut dengan saya: Abang membantu adik."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 5: KAWAN-KAWAN WEI HAN (Wei Han's Friends)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 5 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_2_unit_5',
    'Kawan-kawan Wei Han',
    '伟汉的朋友们',
    'Wei Han''s Friends',
    'Belajar perkataan tentang kawan dan aktiviti sekolah',
    '学习关于朋友和学校活动的单词',
    'Learn words about friends and school activities',
    5,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Dengar dan Sebut (BA:26)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Cap' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Dengar dan Sebut',
    '听和说',
    'Listen and Say',
    'Dengar dan sebut perkataan dengan betul',
    '听并正确说出单词',
    'Listen and say the words correctly',
    '{"type": "syllable", "data": {"words": [{"word": "jadual", "syllables": ["ja", "du", "al"], "meaning_ms": "jadual", "meaning_zh": "时间表", "meaning_en": "timetable", "image": "/images/vocab/jadual.png"}, {"word": "ketua kelas", "syllables": ["ke", "tu", "a", "ke", "las"], "meaning_ms": "ketua kelas", "meaning_zh": "班长", "meaning_en": "class monitor", "image": "/images/vocab/ketua_kelas.png"}, {"word": "radio", "syllables": ["ra", "di", "o"], "meaning_ms": "radio", "meaning_zh": "收音机", "meaning_en": "radio", "image": "/images/vocab/radio.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Mari Baca Frasa (BA:27)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Vest' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Mari Baca Frasa',
    '来读短语',
    'Let''s Read Phrases',
    'Padankan frasa dengan gambar yang betul',
    '将短语与正确的图片配对',
    'Match the phrase with the correct picture',
    '{"type": "matching", "data": {"pairs": [{"word": "pokok bunga", "meaning_ms": "pokok bunga", "meaning_zh": "花树", "meaning_en": "flower plant", "image": "/images/vocab/pokok_bunga.png"}, {"word": "tong sampah", "meaning_ms": "tong sampah", "meaning_zh": "垃圾桶", "meaning_en": "trash bin", "image": "/images/vocab/tong_sampah.png"}, {"word": "baju ungu", "meaning_ms": "baju ungu", "meaning_zh": "紫色衣服", "meaning_en": "purple shirt", "image": "/images/vocab/baju_ungu.png"}, {"word": "buah pisang", "meaning_ms": "buah pisang", "meaning_zh": "香蕉", "meaning_en": "banana", "image": "/images/vocab/buah_pisang.png"}, {"word": "piring kuih", "meaning_ms": "piring kuih", "meaning_zh": "糕点盘", "meaning_en": "cake plate", "image": "/images/vocab/piring_kuih.png"}, {"word": "bangku kayu", "meaning_ms": "bangku kayu", "meaning_zh": "木凳", "meaning_en": "wooden bench", "image": "/images/vocab/bangku_kayu.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Kelas Muzik (BA:27 continued)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Pants' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kelas Muzik',
    '音乐课',
    'Music Class',
    'Padankan frasa muzik dengan gambar',
    '将音乐短语与图片配对',
    'Match music phrases with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "bilik muzik", "meaning_ms": "bilik muzik", "meaning_zh": "音乐室", "meaning_en": "music room", "image": "/images/vocab/bilik_muzik.png"}, {"word": "main piano", "meaning_ms": "main piano", "meaning_zh": "弹钢琴", "meaning_en": "play piano", "image": "/images/vocab/piano.png"}, {"word": "sedang bernyanyi", "meaning_ms": "sedang bernyanyi", "meaning_zh": "正在唱歌", "meaning_en": "singing", "image": "/images/vocab/bernyanyi.png"}, {"word": "bertepuk tangan", "meaning_ms": "bertepuk tangan", "meaning_zh": "拍手", "meaning_en": "clapping", "image": "/images/vocab/bertepuk_tangan.png"}, {"word": "buku tulis", "meaning_ms": "buku tulis", "meaning_zh": "练习本", "meaning_en": "exercise book", "image": "/images/vocab/buku_tulis.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Tulis Ayat (BA:28-30)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Shoes' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Ayat',
    '写句子',
    'Write Sentences',
    'Tulis ayat tunggal dengan betul',
    '正确写出简单句',
    'Write simple sentences correctly',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Ini lukisan Zali.", "meaning_ms": "Ini lukisan Zali.", "meaning_zh": "这是扎利的画。", "meaning_en": "This is Zali''s drawing."}, {"word": "Lukisan Zali cantik.", "meaning_ms": "Lukisan Zali cantik.", "meaning_zh": "扎利的画很漂亮。", "meaning_en": "Zali''s drawing is beautiful."}, {"word": "Wei Han suka lukisan.", "meaning_ms": "Wei Han suka lukisan.", "meaning_zh": "伟汉喜欢画画。", "meaning_en": "Wei Han likes drawing."}]}}'::jsonb,
    15,
    v_equipment_id,
    4
  );

  -- Activity 5: Mari Berpantun - Saya Suka Berkawan (BA:29)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Wooden Pickaxe' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Mari Berpantun - Saya Suka Berkawan',
    '来念诗 - 我喜欢交朋友',
    'Let''s Recite Pantun - I Like Making Friends',
    'Sebut pantun tentang berkawan dengan betul',
    '正确朗诵关于交友的马来诗歌',
    'Recite the pantun about friendship correctly',
    '{"type": "speaking", "data": {"phrases": [{"text": "Dua tiga kucing berlari,", "translation_ms": "Dua tiga kucing berlari,", "translation_zh": "两三只猫在奔跑，", "translation_en": "Two or three cats are running,", "voice_guide": "Baris pantun pertama. Dua tiga kucing berlari. Ini pembayang pantun tentang kucing. Sebut dengan saya: Dua tiga kucing berlari."}, {"text": "Mana nak sama si kucing belang.", "translation_ms": "Mana nak sama si kucing belang.", "translation_zh": "怎能比得上花斑猫。", "translation_en": "None can match the striped cat.", "voice_guide": "Baris pantun kedua. Mana nak sama si kucing belang. Ini masih pembayang. Sebut dengan saya: Mana nak sama si kucing belang."}, {"text": "Dua tiga saya tak peduli,", "translation_ms": "Dua tiga saya tak peduli,", "translation_zh": "两三件事我不在乎，", "translation_en": "Two or three things I don''t mind,", "voice_guide": "Baris pantun ketiga. Dua tiga saya tak peduli. Ini maksud pantun. Sebut dengan saya: Dua tiga saya tak peduli."}, {"text": "Kawan baik saya seorang.", "translation_ms": "Kawan baik saya seorang.", "translation_zh": "我只有一个好朋友。", "translation_en": "My good friend is just one.", "voice_guide": "Baris pantun keempat. Kawan baik saya seorang. Maksud pantun ialah kita hargai kawan baik kita. Sebut dengan saya: Kawan baik saya seorang."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 6: TAMAN PERMAINAN (Playground)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 6 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_2_unit_6',
    'Taman Permainan',
    '游乐场',
    'Playground',
    'Belajar perkataan tentang taman permainan dan aktiviti luar',
    '学习关于游乐场和户外活动的单词',
    'Learn words about playground and outdoor activities',
    6,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Dengar dan Sebut (BA:31)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Hood' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Dengar dan Sebut',
    '听和说',
    'Listen and Say',
    'Dengar dan sebut perkataan dengan betul',
    '听并正确说出单词',
    'Listen and say the words correctly',
    '{"type": "syllable", "data": {"words": [{"word": "buah limau", "syllables": ["bu", "ah", "li", "mau"], "meaning_ms": "buah limau", "meaning_zh": "青柠", "meaning_en": "lime", "image": "/images/vocab/buah_limau.png"}, {"word": "botol air", "syllables": ["bo", "tol", "a", "ir"], "meaning_ms": "botol air", "meaning_zh": "水瓶", "meaning_en": "water bottle", "image": "/images/vocab/botol_air.png"}, {"word": "rantai basikal", "syllables": ["ran", "tai", "ba", "si", "kal"], "meaning_ms": "rantai basikal", "meaning_zh": "自行车链条", "meaning_en": "bicycle chain", "image": "/images/vocab/rantai_basikal.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Padankan Gambar (BA:31 continued)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Tunic' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Padankan Gambar',
    '配对图片',
    'Match Pictures',
    'Padankan perkataan aktiviti dengan gambar',
    '将活动单词与图片配对',
    'Match activity words with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "memakai", "meaning_ms": "memakai", "meaning_zh": "穿戴", "meaning_en": "wearing", "image": "/images/vocab/memakai.png"}, {"word": "hijau", "meaning_ms": "hijau", "meaning_zh": "绿色", "meaning_en": "green", "image": "/images/vocab/hijau.png"}, {"word": "bermain", "meaning_ms": "bermain", "meaning_zh": "玩耍", "meaning_en": "playing", "image": "/images/vocab/bermain.png"}, {"word": "belon", "meaning_ms": "belon", "meaning_zh": "气球", "meaning_en": "balloon", "image": "/images/vocab/belon.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Perkataan (BA:34)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Trousers' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Perkataan',
    '写单词',
    'Write Words',
    'Tulis perkataan berdasarkan gambar',
    '根据图片写出单词',
    'Write words based on pictures',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "belon", "meaning_ms": "belon", "meaning_zh": "气球", "meaning_en": "balloon", "image": "/images/vocab/belon.png"}, {"word": "buaian", "meaning_ms": "buaian", "meaning_zh": "秋千", "meaning_en": "swing", "image": "/images/vocab/buaian.png"}, {"word": "jongkang-jongkit", "meaning_ms": "jongkang-jongkit", "meaning_zh": "跷跷板", "meaning_en": "seesaw", "image": "/images/vocab/jongkang_jongkit.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Kata Nama Am (BA:35)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Sandals' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Nama Am',
    '普通名词',
    'Common Nouns',
    'Padankan kata nama am dengan gambar',
    '将普通名词与图片配对',
    'Match common nouns with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "layang-layang", "meaning_ms": "layang-layang", "meaning_zh": "风筝", "meaning_en": "kite", "image": "/images/vocab/layang_layang.png"}, {"word": "dewan", "meaning_ms": "dewan", "meaning_zh": "礼堂", "meaning_en": "hall", "image": "/images/vocab/dewan.png"}, {"word": "papan gelongsor", "meaning_ms": "papan gelongsor", "meaning_zh": "滑梯", "meaning_en": "slide", "image": "/images/vocab/papan_gelongsor.png"}, {"word": "pagar", "meaning_ms": "pagar", "meaning_zh": "篱笆", "meaning_en": "fence", "image": "/images/vocab/pagar.png"}, {"word": "penjaja", "meaning_ms": "penjaja", "meaning_zh": "小贩", "meaning_en": "vendor", "image": "/images/vocab/penjaja.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    4
  );

  -- Activity 5: Taman Permainan Kami (BA:32-33)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Wooden Shovel' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Taman Permainan Kami',
    '我们的游乐场',
    'Our Playground',
    'Baca dan sebut ayat tentang taman permainan',
    '朗读关于游乐场的句子',
    'Read and say sentences about the playground',
    '{"type": "speaking", "data": {"phrases": [{"text": "Ini taman permainan.", "translation_ms": "Ini taman permainan.", "translation_zh": "这是游乐场。", "translation_en": "This is a playground.", "voice_guide": "Ayat ini ialah Ini taman permainan. Kita belajar tentang tempat bermain. Sebut dengan saya: Ini taman permainan."}, {"text": "Banyak kanak-kanak bermain.", "translation_ms": "Banyak kanak-kanak bermain.", "translation_zh": "很多小朋友在玩耍。", "translation_en": "Many children are playing.", "voice_guide": "Ayat ini ialah Banyak kanak-kanak bermain. Ini menerangkan aktiviti di taman. Sebut dengan saya: Banyak kanak-kanak bermain."}, {"text": "Ada buaian dan gelongsor.", "translation_ms": "Ada buaian dan gelongsor.", "translation_zh": "有秋千和滑梯。", "translation_en": "There are swings and slides.", "voice_guide": "Ayat ini ialah Ada buaian dan gelongsor. Ini menerangkan alat permainan. Sebut dengan saya: Ada buaian dan gelongsor."}, {"text": "Saya suka bermain di sini.", "translation_ms": "Saya suka bermain di sini.", "translation_zh": "我喜欢在这里玩。", "translation_en": "I like playing here.", "voice_guide": "Ayat ini ialah Saya suka bermain di sini. Kita nyatakan perasaan gembira. Sebut dengan saya: Saya suka bermain di sini."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- TEMA 3: BADAN SIHAT DAN BERSIH
-- =====================

-- =====================
-- UNIT 7: SIHAT DAN GEMBIRA (Healthy and Happy)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 7 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_3_unit_7',
    'Sihat dan Gembira',
    '健康又快乐',
    'Healthy and Happy',
    'Belajar perkataan tentang kesihatan dan senaman',
    '学习关于健康和运动的单词',
    'Learn words about health and exercise',
    7,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Dengar dan Tutur (BA:38)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Bandana' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Dengar dan Tutur',
    '听和说',
    'Listen and Speak',
    'Dengar dan tutur perbualan telefon tentang senaman pagi',
    '听并说出关于晨练的电话对话',
    'Listen and speak phone conversation about morning exercise',
    '{"type": "speaking", "data": {"phrases": [{"text": "Selamat pagi, Ali.", "translation_ms": "Selamat pagi, Ali.", "translation_zh": "早安，阿里。", "translation_en": "Good morning, Ali.", "voice_guide": "Ayat ini ialah Selamat pagi, Ali. Kita memberi salam pada waktu pagi. Sebut dengan saya: Selamat pagi, Ali."}, {"text": "Apa khabar?", "translation_ms": "Apa khabar?", "translation_zh": "你好吗？", "translation_en": "How are you?", "voice_guide": "Ayat ini ialah Apa khabar. Kita bertanya tentang keadaan seseorang. Sebut dengan saya: Apa khabar."}, {"text": "Saya sihat. Terima kasih.", "translation_ms": "Saya sihat. Terima kasih.", "translation_zh": "我很好。谢谢。", "translation_en": "I am healthy. Thank you.", "voice_guide": "Ayat ini ialah Saya sihat, Terima kasih. Kita menjawab dengan sopan. Sebut dengan saya: Saya sihat, Terima kasih."}, {"text": "Jom bersenam sama-sama!", "translation_ms": "Jom bersenam sama-sama!", "translation_zh": "一起来锻炼吧！", "translation_en": "Let''s exercise together!", "voice_guide": "Ayat ini ialah Jom bersenam sama-sama. Kita mengajak kawan bersenam. Sebut dengan saya: Jom bersenam sama-sama."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    1
  );

  -- Activity 2: Mari Baca (BA:39)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Jerkin' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Mari Baca dan Fahami',
    '来读和理解',
    'Let''s Read and Understand',
    'Baca perkataan tentang kesihatan',
    '阅读关于健康的单词',
    'Read words about health',
    '{"type": "syllable", "data": {"words": [{"word": "stoking", "syllables": ["sto", "king"], "meaning_ms": "stoking", "meaning_zh": "袜子", "meaning_en": "socks", "image": "/images/vocab/stoking.png"}, {"word": "kasut sukan", "syllables": ["ka", "sut", "su", "kan"], "meaning_ms": "kasut sukan", "meaning_zh": "运动鞋", "meaning_en": "sports shoes", "image": "/images/vocab/kasut_sukan.png"}, {"word": "bersenam", "syllables": ["ber", "se", "nam"], "meaning_ms": "bersenam", "meaning_zh": "运动", "meaning_en": "exercise", "image": "/images/vocab/bersenam.png"}, {"word": "berjoging", "syllables": ["ber", "jo", "ging"], "meaning_ms": "berjoging", "meaning_zh": "慢跑", "meaning_en": "jogging", "image": "/images/vocab/berjoging.png"}, {"word": "segar", "syllables": ["se", "gar"], "meaning_ms": "segar", "meaning_zh": "新鲜/精神", "meaning_en": "fresh", "image": "/images/vocab/segar.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Bina dan Tulis (BA:40)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Shorts' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Bina dan Tulis',
    '组词和写',
    'Build and Write',
    'Tulis frasa tentang aktiviti senaman',
    '写关于运动活动的短语',
    'Write phrases about exercise activities',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "sedang berkumpul", "meaning_ms": "sedang berkumpul", "meaning_zh": "正在集合", "meaning_en": "gathering"}, {"word": "membuat latihan", "meaning_ms": "membuat latihan", "meaning_zh": "做练习", "meaning_en": "doing practice"}, {"word": "sedang bersorak", "meaning_ms": "sedang bersorak", "meaning_zh": "正在欢呼", "meaning_en": "cheering"}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Cipta Pantun (BA:41)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Slippers' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Cipta Pantun - Sihat dan Riang',
    '创作诗歌 - 健康快乐',
    'Create Pantun - Healthy and Cheerful',
    'Lengkapkan dan sebut pantun',
    '完成并朗诵马来诗歌',
    'Complete and recite the pantun',
    '{"type": "speaking", "data": {"phrases": [{"text": "Masuk guni lompat-lompat,", "translation_ms": "Masuk guni lompat-lompat,", "translation_zh": "跳进麻袋蹦蹦跳，", "translation_en": "Jump into the sack hopping,", "voice_guide": "Baris pantun pertama. Masuk guni lompat-lompat. Ini tentang permainan tradisional. Sebut dengan saya: Masuk guni lompat-lompat."}, {"text": "Main bola di padang hijau.", "translation_ms": "Main bola di padang hijau.", "translation_zh": "在绿色球场踢足球。", "translation_en": "Play ball in the green field.", "voice_guide": "Baris pantun kedua. Main bola di padang hijau. Ini aktiviti sukan. Sebut dengan saya: Main bola di padang hijau."}, {"text": "Badan sihat tubuh cergas,", "translation_ms": "Badan sihat tubuh cergas,", "translation_zh": "身体健康精神好，", "translation_en": "Healthy body, fit body,", "voice_guide": "Baris pantun ketiga. Badan sihat tubuh cergas. Ini maksud pantun tentang kesihatan. Sebut dengan saya: Badan sihat tubuh cergas."}, {"text": "Hati riang sentiasa ceria.", "translation_ms": "Hati riang sentiasa ceria.", "translation_zh": "心情愉快永远开朗。", "translation_en": "Happy heart, always cheerful.", "voice_guide": "Baris pantun keempat. Hati riang sentiasa ceria. Maksudnya kesihatan membawa kegembiraan. Sebut dengan saya: Hati riang sentiasa ceria."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Penjodoh Bilangan (BA:42)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Wooden Hoe' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Penjodoh Bilangan',
    '量词',
    'Classifiers',
    'Padankan penjodoh bilangan dengan benda',
    '将量词与物品配对',
    'Match classifiers with objects',
    '{"type": "matching", "data": {"pairs": [{"word": "sebuah buku", "meaning_ms": "sebuah buku", "meaning_zh": "一本书", "meaning_en": "a book", "image": "/images/vocab/buku.png"}, {"word": "sebatang pensel", "meaning_ms": "sebatang pensel", "meaning_zh": "一支铅笔", "meaning_en": "a pencil", "image": "/images/vocab/pensel.png"}, {"word": "sebiji bola", "meaning_ms": "sebiji bola", "meaning_zh": "一个球", "meaning_en": "a ball", "image": "/images/vocab/bola.png"}, {"word": "sehelai baju", "meaning_ms": "sehelai baju", "meaning_zh": "一件衣服", "meaning_en": "a shirt", "image": "/images/vocab/baju.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 8: SEDAP DAN SIHAT (Delicious and Healthy)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 8 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_3_unit_8',
    'Sedap dan Sihat',
    '美味又健康',
    'Delicious and Healthy',
    'Belajar perkataan tentang makanan sihat',
    '学习关于健康食品的单词',
    'Learn words about healthy food',
    8,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Dengar dan Sampaikan (BA:43-44)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Headband' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Dengar dan Sampaikan - Pentingnya Sarapan',
    '听和传达 - 早餐的重要性',
    'Listen and Convey - Importance of Breakfast',
    'Dengar dan sampaikan kepentingan sarapan',
    '听并传达早餐的重要性',
    'Listen and convey the importance of breakfast',
    '{"type": "speaking", "data": {"phrases": [{"text": "Sarapan penting untuk tenaga.", "translation_ms": "Sarapan penting untuk tenaga.", "translation_zh": "早餐对精力很重要。", "translation_en": "Breakfast is important for energy.", "voice_guide": "Ayat ini ialah Sarapan penting untuk tenaga. Sarapan memberi kita tenaga untuk belajar. Sebut dengan saya: Sarapan penting untuk tenaga."}, {"text": "Makan makanan berkhasiat.", "translation_ms": "Makan makanan berkhasiat.", "translation_zh": "吃有营养的食物。", "translation_en": "Eat nutritious food.", "voice_guide": "Ayat ini ialah Makan makanan berkhasiat. Makanan berkhasiat membuat kita sihat. Sebut dengan saya: Makan makanan berkhasiat."}, {"text": "Minum susu setiap hari.", "translation_ms": "Minum susu setiap hari.", "translation_zh": "每天喝牛奶。", "translation_en": "Drink milk every day.", "voice_guide": "Ayat ini ialah Minum susu setiap hari. Susu baik untuk tulang kita. Sebut dengan saya: Minum susu setiap hari."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    1
  );

  -- Activity 2: Makanan Berkhasiat (BA:44-45)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Armor' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Makanan Berkhasiat',
    '营养食品',
    'Nutritious Food',
    'Padankan makanan berkhasiat dengan gambar',
    '将营养食品与图片配对',
    'Match nutritious food with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "sandwic", "meaning_ms": "sandwic", "meaning_zh": "三明治", "meaning_en": "sandwich", "image": "/images/vocab/sandwic.png"}, {"word": "telur", "meaning_ms": "telur", "meaning_zh": "鸡蛋", "meaning_en": "egg", "image": "/images/vocab/telur.png"}, {"word": "susu", "meaning_ms": "susu", "meaning_zh": "牛奶", "meaning_en": "milk", "image": "/images/vocab/susu.png"}, {"word": "pisang", "meaning_ms": "pisang", "meaning_zh": "香蕉", "meaning_en": "banana", "image": "/images/vocab/pisang.png"}, {"word": "betik", "meaning_ms": "betik", "meaning_zh": "木瓜", "meaning_en": "papaya", "image": "/images/vocab/betik.png"}, {"word": "tembikai", "meaning_ms": "tembikai", "meaning_zh": "西瓜", "meaning_en": "watermelon", "image": "/images/vocab/tembikai.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Menu Sihat (BA:46)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Kilt' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Menu Sihat',
    '健康菜单',
    'Healthy Menu',
    'Tulis menu makanan sihat',
    '写健康食物菜单',
    'Write healthy food menu',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "nasi lemak", "meaning_ms": "nasi lemak", "meaning_zh": "椰浆饭", "meaning_en": "coconut rice", "image": "/images/vocab/nasi_lemak.png"}, {"word": "susu segar", "meaning_ms": "susu segar", "meaning_zh": "新鲜牛奶", "meaning_en": "fresh milk", "image": "/images/vocab/susu_segar.png"}, {"word": "buah jambu", "meaning_ms": "buah jambu", "meaning_zh": "番石榴", "meaning_en": "guava", "image": "/images/vocab/buah_jambu.png"}, {"word": "roti telur", "meaning_ms": "roti telur", "meaning_zh": "鸡蛋面包", "meaning_en": "egg bread", "image": "/images/vocab/roti_telur.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Kata Kerja Transitif (BA:48)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Moccasins' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Kerja Transitif',
    '及物动词',
    'Transitive Verbs',
    'Padankan kata kerja dengan gambar',
    '将动词与图片配对',
    'Match verbs with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "membuka", "meaning_ms": "membuka", "meaning_zh": "打开", "meaning_en": "opening", "image": "/images/vocab/membuka.png"}, {"word": "membeli", "meaning_ms": "membeli", "meaning_zh": "购买", "meaning_en": "buying", "image": "/images/vocab/membeli.png"}, {"word": "minum", "meaning_ms": "minum", "meaning_zh": "喝", "meaning_en": "drinking", "image": "/images/vocab/minum.png"}, {"word": "makan", "meaning_ms": "makan", "meaning_zh": "吃", "meaning_en": "eating", "image": "/images/vocab/makan.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    4
  );

  -- Activity 5: Ejaan Makanan (Dictation)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Wooden Club' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan Makanan',
    '食物听写',
    'Food Dictation',
    'Dengar dan tulis perkataan makanan',
    '听并写出食物单词',
    'Listen and write food words',
    '{"type": "dictation", "data": {"words": [{"word": "susu", "meaning_ms": "susu", "meaning_zh": "牛奶", "meaning_en": "milk"}, {"word": "telur", "meaning_ms": "telur", "meaning_zh": "鸡蛋", "meaning_en": "egg"}, {"word": "pisang", "meaning_ms": "pisang", "meaning_zh": "香蕉", "meaning_en": "banana"}, {"word": "roti", "meaning_ms": "roti", "meaning_zh": "面包", "meaning_en": "bread"}, {"word": "nasi", "meaning_ms": "nasi", "meaning_zh": "米饭", "meaning_en": "rice"}]}}'::jsonb,
    20,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 9: KEBERSIHAN DAN KESIHATAN (Cleanliness and Health)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 9 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_3_unit_9',
    'Kebersihan dan Kesihatan',
    '清洁与健康',
    'Cleanliness and Health',
    'Belajar perkataan tentang kebersihan diri',
    '学习关于个人卫生的单词',
    'Learn words about personal hygiene',
    9,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Dengar dan Respons (BA:49)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Chain Helmet' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Dengar dan Respons',
    '听和回应',
    'Listen and Respond',
    'Dengar dan sebut dialog tentang mencuci tangan',
    '听并说出关于洗手的对话',
    'Listen and say dialogue about washing hands',
    '{"type": "speaking", "data": {"phrases": [{"text": "Cuci tangan sebelum makan.", "translation_ms": "Cuci tangan sebelum makan.", "translation_zh": "饭前洗手。", "translation_en": "Wash hands before eating.", "voice_guide": "Ayat ini ialah Cuci tangan sebelum makan. Ini amalan kebersihan yang penting. Sebut dengan saya: Cuci tangan sebelum makan."}, {"text": "Gunakan sabun untuk membersihkan.", "translation_ms": "Gunakan sabun untuk membersihkan.", "translation_zh": "用肥皂清洁。", "translation_en": "Use soap to clean.", "voice_guide": "Ayat ini ialah Gunakan sabun untuk membersihkan. Sabun membunuh kuman. Sebut dengan saya: Gunakan sabun untuk membersihkan."}, {"text": "Basuh tangan dengan air bersih.", "translation_ms": "Basuh tangan dengan air bersih.", "translation_zh": "用清水冲洗双手。", "translation_en": "Rinse hands with clean water.", "voice_guide": "Ayat ini ialah Basuh tangan dengan air bersih. Air bersih membuang sabun dan kuman. Sebut dengan saya: Basuh tangan dengan air bersih."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    1
  );

  -- Activity 2: Mari Baca Cerita (BA:50)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Chain Chestplate' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Mari Baca Cerita',
    '来读故事',
    'Let''s Read a Story',
    'Baca perkataan tentang kebersihan gigi',
    '阅读关于牙齿清洁的单词',
    'Read words about dental hygiene',
    '{"type": "syllable", "data": {"words": [{"word": "berus gigi", "syllables": ["be", "rus", "gi", "gi"], "meaning_ms": "berus gigi", "meaning_zh": "牙刷", "meaning_en": "toothbrush", "image": "/images/vocab/berus_gigi.png"}, {"word": "ubat gigi", "syllables": ["u", "bat", "gi", "gi"], "meaning_ms": "ubat gigi", "meaning_zh": "牙膏", "meaning_en": "toothpaste", "image": "/images/vocab/ubat_gigi.png"}, {"word": "mencuci", "syllables": ["men", "cu", "ci"], "meaning_ms": "mencuci", "meaning_zh": "洗", "meaning_en": "washing", "image": "/images/vocab/mencuci.png"}, {"word": "menjaga", "syllables": ["men", "ja", "ga"], "meaning_ms": "menjaga", "meaning_zh": "照顾", "meaning_en": "taking care", "image": "/images/vocab/menjaga.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Kebersihan Diri (BA:51)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Chain Leggings' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Kebersihan Diri',
    '个人卫生',
    'Personal Hygiene',
    'Tulis ayat tentang kebersihan diri',
    '写关于个人卫生的句子',
    'Write sentences about personal hygiene',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "menggosok gigi", "meaning_ms": "menggosok gigi", "meaning_zh": "刷牙", "meaning_en": "brushing teeth", "image": "/images/vocab/menggosok_gigi.png"}, {"word": "mencuci muka", "meaning_ms": "mencuci muka", "meaning_zh": "洗脸", "meaning_en": "washing face", "image": "/images/vocab/mencuci_muka.png"}, {"word": "mandi", "meaning_ms": "mandi", "meaning_zh": "洗澡", "meaning_en": "bathing", "image": "/images/vocab/mandi.png"}, {"word": "sabun", "meaning_ms": "sabun", "meaning_zh": "肥皂", "meaning_en": "soap", "image": "/images/vocab/sabun.png"}, {"word": "syampu", "meaning_ms": "syampu", "meaning_zh": "洗发水", "meaning_en": "shampoo", "image": "/images/vocab/syampu.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Cergas dan Bersih (BA:52-53)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Chain Boots' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Cergas dan Bersih',
    '精神焕发又干净',
    'Fit and Clean',
    'Sebut urutan aktiviti kebersihan',
    '说出清洁活动的顺序',
    'Say the sequence of hygiene activities',
    '{"type": "speaking", "data": {"phrases": [{"text": "Saya berjoging pada waktu pagi.", "translation_ms": "Saya berjoging pada waktu pagi.", "translation_zh": "我在早上慢跑。", "translation_en": "I jog in the morning.", "voice_guide": "Ayat ini ialah Saya berjoging pada waktu pagi. Berjoging pada waktu pagi menyihatkan badan. Sebut dengan saya: Saya berjoging pada waktu pagi."}, {"text": "Selepas bersenam, saya berpeluh.", "translation_ms": "Selepas bersenam, saya berpeluh.", "translation_zh": "运动后，我出汗了。", "translation_en": "After exercising, I sweat.", "voice_guide": "Ayat ini ialah Selepas bersenam, saya berpeluh. Berpeluh menunjukkan badan aktif bersenam. Sebut dengan saya: Selepas bersenam, saya berpeluh."}, {"text": "Saya mengelap peluh dengan tuala.", "translation_ms": "Saya mengelap peluh dengan tuala.", "translation_zh": "我用毛巾擦汗。", "translation_en": "I wipe sweat with a towel.", "voice_guide": "Ayat ini ialah Saya mengelap peluh dengan tuala. Ini amalan kebersihan selepas bersenam. Sebut dengan saya: Saya mengelap peluh dengan tuala."}, {"text": "Kemudian saya mandi dan berpakaian bersih.", "translation_ms": "Kemudian saya mandi dan berpakaian bersih.", "translation_zh": "然后我洗澡并穿上干净的衣服。", "translation_en": "Then I bathe and wear clean clothes.", "voice_guide": "Ayat ini ialah Kemudian saya mandi dan berpakaian bersih. Mandi membuang kotoran dan bau. Sebut dengan saya: Kemudian saya mandi dan berpakaian bersih."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Kata Berimbuhan Awalan (BA:54)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Stone Sword' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Berimbuhan Awalan',
    '前缀词',
    'Words with Prefixes',
    'Padankan kata berimbuhan me-, men-, mem- dengan gambar',
    '将带有前缀me-, men-, mem-的词与图片配对',
    'Match words with prefixes me-, men-, mem- with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "merawat", "meaning_ms": "merawat", "meaning_zh": "治疗", "meaning_en": "treating", "image": "/images/vocab/merawat.png"}, {"word": "mencuci", "meaning_ms": "mencuci", "meaning_zh": "洗", "meaning_en": "washing", "image": "/images/vocab/mencuci.png"}, {"word": "membantu", "meaning_ms": "membantu", "meaning_zh": "帮助", "meaning_en": "helping", "image": "/images/vocab/membantu.png"}, {"word": "membasuh", "meaning_ms": "membasuh", "meaning_zh": "冲洗", "meaning_en": "rinsing", "image": "/images/vocab/membasuh.png"}, {"word": "membuka", "meaning_ms": "membuka", "meaning_zh": "打开", "meaning_en": "opening", "image": "/images/vocab/membuka.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- SECTION 3: LINK PET REWARDS TO THEMES
-- =====================

-- Link pets as rewards for completing each unit
UPDATE themes SET pet_reward = 'baby_cow' WHERE code = 'tema_2_unit_4';
UPDATE themes SET pet_reward = 'baby_rabbit' WHERE code = 'tema_2_unit_5';
UPDATE themes SET pet_reward = 'wolf_pup' WHERE code = 'tema_2_unit_6';
UPDATE themes SET pet_reward = 'kitten' WHERE code = 'tema_3_unit_7';
UPDATE themes SET pet_reward = 'fox_kit' WHERE code = 'tema_3_unit_8';
UPDATE themes SET pet_reward = 'parrot_chick' WHERE code = 'tema_3_unit_9';


-- =====================
-- Summary:
-- TEMA 2: HIDUP HARMONI (Units 4-6)
--   Unit 4: Kenali Jiran - 5 activities + Baby Cow pet
--   Unit 5: Kawan-kawan Wei Han - 5 activities + Baby Rabbit pet
--   Unit 6: Taman Permainan - 5 activities + Wolf Pup pet
-- TEMA 3: BADAN SIHAT DAN BERSIH (Units 7-9)
--   Unit 7: Sihat dan Gembira - 5 activities + Kitten pet
--   Unit 8: Sedap dan Sihat - 5 activities + Fox Kit pet
--   Unit 9: Kebersihan dan Kesihatan - 5 activities + Parrot Chick pet
-- Total: 30 new activities, 6 new pets
-- =====================
