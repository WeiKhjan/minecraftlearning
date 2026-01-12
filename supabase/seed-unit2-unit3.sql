-- MYLearnt Seed Data: Unit 2 & Unit 3
-- Run this after seed.sql and after generating vocabulary images

-- Note: Replace {SUPABASE_URL} with your actual Supabase URL
-- Images are stored at: {SUPABASE_URL}/storage/v1/object/public/images/vocab/{word}.png

-- =====================
-- UNIT 2: MARI SAYANG (Tema 1)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
  v_supabase_url TEXT := current_setting('app.supabase_url', true);
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 2 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_1_unit_2',
    'Mari Sayang',
    '来爱吧',
    'Let''s Love',
    'Belajar suku kata dan perkataan tentang keluarga',
    '学习关于家庭的音节和单词',
    'Learn syllables and words about family',
    2,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Mari Ajuk dan Sebut (BA:6)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Chain Helmet' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Mari Ajuk dan Sebut',
    '来模仿和说',
    'Let''s Imitate and Say',
    'Ajuk dan sebut perkataan dengan betul',
    '正确模仿和说出单词',
    'Imitate and say the words correctly',
    '{
      "type": "syllable",
      "data": {
        "words": [
          {"word": "baju", "syllables": ["ba", "ju"], "meaning_ms": "baju", "meaning_zh": "衣服", "meaning_en": "clothes", "image": "/images/vocab/baju.png"},
          {"word": "roti", "syllables": ["ro", "ti"], "meaning_ms": "roti", "meaning_zh": "面包", "meaning_en": "bread", "image": "/images/vocab/roti.png"},
          {"word": "biru", "syllables": ["bi", "ru"], "meaning_ms": "biru", "meaning_zh": "蓝色", "meaning_en": "blue", "image": "/images/vocab/biru.png"},
          {"word": "susu", "syllables": ["su", "su"], "meaning_ms": "susu", "meaning_zh": "牛奶", "meaning_en": "milk", "image": "/images/vocab/susu.png"},
          {"word": "teko", "syllables": ["te", "ko"], "meaning_ms": "teko", "meaning_zh": "茶壶", "meaning_en": "teapot", "image": "/images/vocab/teko.png"}
        ]
      }
    }'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Baca Suku Kata (BA:7)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Chain Boots' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Baca Suku Kata',
    '阅读音节',
    'Read Syllables',
    'Padankan suku kata dengan gambar yang betul',
    '将音节与正确的图片配对',
    'Match the syllables with the correct picture',
    '{
      "type": "matching",
      "data": {
        "pairs": [
          {"syllable": "la", "word": "labu", "meaning_ms": "labu", "meaning_zh": "南瓜", "meaning_en": "pumpkin", "image": "/images/vocab/labu.png"},
          {"syllable": "ti", "word": "tidur", "meaning_ms": "tidur", "meaning_zh": "睡觉", "meaning_en": "sleep", "image": "/images/vocab/tidur.png"},
          {"syllable": "ba", "word": "bayi", "meaning_ms": "bayi", "meaning_zh": "婴儿", "meaning_en": "baby", "image": "/images/vocab/bayi.png"},
          {"syllable": "le", "word": "lebah", "meaning_ms": "lebah", "meaning_zh": "蜜蜂", "meaning_en": "bee", "image": "/images/vocab/lebah.png"},
          {"syllable": "tu", "word": "tulis", "meaning_ms": "tulis", "meaning_zh": "写", "meaning_en": "write", "image": "/images/vocab/tulis.png"},
          {"syllable": "be", "word": "betik", "meaning_ms": "betik", "meaning_zh": "木瓜", "meaning_en": "papaya", "image": "/images/vocab/betik.png"},
          {"syllable": "lo", "word": "lobak", "meaning_ms": "lobak", "meaning_zh": "萝卜", "meaning_en": "carrot", "image": "/images/vocab/lobak.png"},
          {"syllable": "na", "word": "nasi", "meaning_ms": "nasi", "meaning_zh": "米饭", "meaning_en": "rice", "image": "/images/vocab/nasi.png"},
          {"syllable": "cu", "word": "cucu", "meaning_ms": "cucu", "meaning_zh": "孙子", "meaning_en": "grandchild", "image": "/images/vocab/cucu.png"},
          {"syllable": "ne", "word": "nenek", "meaning_ms": "nenek", "meaning_zh": "奶奶", "meaning_en": "grandmother", "image": "/images/vocab/nenek.png"},
          {"syllable": "ce", "word": "cawan", "meaning_ms": "cawan", "meaning_zh": "杯子", "meaning_en": "cup", "image": "/images/vocab/cawan.png"}
        ]
      }
    }'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Baca Perkataan - Ibu Beli Apa? (BA:8)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Chain Chestplate' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Baca Perkataan - Ibu Beli Apa?',
    '读单词 - 妈妈买了什么？',
    'Read Words - What Did Mother Buy?',
    'Baca perkataan dengan menyebut suku kata',
    '通过说出音节来朗读单词',
    'Read the words by saying the syllables',
    '{
      "type": "syllable",
      "data": {
        "words": [
          {"word": "lidi", "syllables": ["li", "di"], "meaning_ms": "lidi", "meaning_zh": "竹签", "meaning_en": "stick", "image": "/images/vocab/lidi.png"},
          {"word": "ceri", "syllables": ["ce", "ri"], "meaning_ms": "ceri", "meaning_zh": "樱桃", "meaning_en": "cherry", "image": "/images/vocab/ceri.png"},
          {"word": "buku", "syllables": ["bu", "ku"], "meaning_ms": "buku", "meaning_zh": "书", "meaning_en": "book", "image": "/images/vocab/buku.png"},
          {"word": "topi", "syllables": ["to", "pi"], "meaning_ms": "topi", "meaning_zh": "帽子", "meaning_en": "hat", "image": "/images/vocab/topi.png"},
          {"word": "baju", "syllables": ["ba", "ju"], "meaning_ms": "baju", "meaning_zh": "衣服", "meaning_en": "clothes", "image": "/images/vocab/baju.png"}
        ]
      }
    }'::jsonb,
    20,
    v_equipment_id,
    3
  );

  -- Activity 4: Tulis Suku Kata - Makan Bersama-sama (BA:9)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Chain Leggings' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Suku Kata - Makan Bersama-sama',
    '写音节 - 一起吃',
    'Write Syllables - Eating Together',
    'Tulis perkataan makanan dan minuman',
    '写出食物和饮料的单词',
    'Write the food and drink words',
    '{
      "type": "writing",
      "data": {
        "characters": [],
        "trace_guides": false,
        "words": [
          {"word": "nasi", "meaning_ms": "nasi", "meaning_zh": "米饭", "meaning_en": "rice", "image": "/images/vocab/nasi.png"},
          {"word": "mi sup", "meaning_ms": "mi sup", "meaning_zh": "汤面", "meaning_en": "noodle soup", "image": "/images/vocab/mi_sup.png"},
          {"word": "bubur", "meaning_ms": "bubur", "meaning_zh": "粥", "meaning_en": "porridge", "image": "/images/vocab/bubur.png"},
          {"word": "susu", "meaning_ms": "susu", "meaning_zh": "牛奶", "meaning_en": "milk", "image": "/images/vocab/susu.png"},
          {"word": "teh", "meaning_ms": "teh", "meaning_zh": "茶", "meaning_en": "tea", "image": "/images/vocab/teh.png"},
          {"word": "kopi", "meaning_ms": "kopi", "meaning_zh": "咖啡", "meaning_en": "coffee", "image": "/images/vocab/kopi.png"}
        ]
      }
    }'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Ejaan - Makan Bersama-sama (Dictation for BA:9)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Stone Sword' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan - Makan Bersama-sama',
    '听写 - 一起吃',
    'Dictation - Eating Together',
    'Dengar perkataan dan tulis dengan betul',
    '听单词并正确写出来',
    'Listen to the word and write it correctly',
    '{
      "type": "dictation",
      "data": {
        "words": [
          {"word": "nasi", "meaning_ms": "nasi", "meaning_zh": "米饭", "meaning_en": "rice"},
          {"word": "susu", "meaning_ms": "susu", "meaning_zh": "牛奶", "meaning_en": "milk"},
          {"word": "bubur", "meaning_ms": "bubur", "meaning_zh": "粥", "meaning_en": "porridge"},
          {"word": "teh", "meaning_ms": "teh", "meaning_zh": "茶", "meaning_en": "tea"},
          {"word": "kopi", "meaning_ms": "kopi", "meaning_zh": "咖啡", "meaning_en": "coffee"}
        ]
      }
    }'::jsonb,
    20,
    v_equipment_id,
    5
  );

  -- Activity 6: Mari Bercerita - Terima Kasih, Ayah (BA:10)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Iron Sword' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Mari Bercerita - Terima Kasih, Ayah',
    '来讲故事 - 谢谢爸爸',
    'Let''s Tell Story - Thank You, Father',
    'Sebut ayat dengan betul',
    '正确说出句子',
    'Say the sentences correctly',
    '{
      "type": "speaking",
      "data": {
        "phrases": [
          {
            "text": "Selamat pagi, kawan-kawan.",
            "translation_ms": "Selamat pagi, kawan-kawan.",
            "translation_zh": "早安，朋友们。",
            "translation_en": "Good morning, friends.",
            "voice_guide": "Ayat ini ialah Selamat pagi, kawan-kawan. Kita guna untuk memberi salam pada waktu pagi kepada rakan-rakan. Sebut dengan saya: Selamat pagi, kawan-kawan."
          },
          {
            "text": "Nama saya {name}.",
            "translation_ms": "Nama saya {name}.",
            "translation_zh": "我的名字是 {name}。",
            "translation_en": "My name is {name}.",
            "voice_guide": "Ayat ini ialah Nama saya. Kita guna untuk memperkenalkan diri kita kepada orang lain. Sebut dengan saya: Nama saya..."
          },
          {
            "text": "Terima kasih, ayah.",
            "translation_ms": "Terima kasih, ayah.",
            "translation_zh": "谢谢爸爸。",
            "translation_en": "Thank you, father.",
            "voice_guide": "Ayat ini ialah Terima kasih, ayah. Kita guna untuk mengucapkan terima kasih kepada ayah. Sebut dengan saya: Terima kasih, ayah."
          }
        ],
        "use_kid_name": true
      }
    }'::jsonb,
    25,
    v_equipment_id,
    6
  );

END $$;


-- =====================
-- UNIT 3: BALIK KE KAMPUNG (Tema 1)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 3 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_1_unit_3',
    'Balik Ke Kampung',
    '回乡下',
    'Going Back to Village',
    'Belajar perkataan tentang kampung dan keluarga',
    '学习关于乡村和家庭的单词',
    'Learn words about village and family',
    3,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Ajuk dan Sebut - Singgah di Gerai (BA:12)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Iron Helmet' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Ajuk dan Sebut - Singgah di Gerai',
    '模仿和说 - 在摊位停留',
    'Imitate and Say - Stop at the Stall',
    'Ajuk dan sebut perkataan yang mengandungi diftong',
    '模仿和说出含有双元音的单词',
    'Imitate and say words with diphthongs',
    '{
      "type": "syllable",
      "data": {
        "words": [
          {"word": "pau", "syllables": ["pau"], "meaning_ms": "pau", "meaning_zh": "包子", "meaning_en": "steamed bun", "image": "/images/vocab/pau.png"},
          {"word": "cakoi", "syllables": ["ca", "koi"], "meaning_ms": "cakoi", "meaning_zh": "油条", "meaning_en": "fried dough", "image": "/images/vocab/cakoi.png"},
          {"word": "hijau", "syllables": ["hi", "jau"], "meaning_ms": "hijau", "meaning_zh": "绿色", "meaning_en": "green", "image": "/images/vocab/hijau.png"},
          {"word": "limau", "syllables": ["li", "mau"], "meaning_ms": "limau", "meaning_zh": "青柠", "meaning_en": "lime", "image": "/images/vocab/limau.png"},
          {"word": "gerai", "syllables": ["ge", "rai"], "meaning_ms": "gerai", "meaning_zh": "摊位", "meaning_en": "stall", "image": "/images/vocab/gerai.png"}
        ]
      }
    }'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Baca Perkataan - Balik ke Kampung (BA:13)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Iron Boots' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Baca Perkataan - Balik ke Kampung',
    '读单词 - 回乡下',
    'Read Words - Going Back to Village',
    'Padankan perkataan dengan gambar yang betul',
    '将单词与正确的图片配对',
    'Match the word with the correct picture',
    '{
      "type": "matching",
      "data": {
        "pairs": [
          {"word": "matahari", "meaning_ms": "matahari", "meaning_zh": "太阳", "meaning_en": "sun", "image": "/images/vocab/matahari.png"},
          {"word": "padi", "meaning_ms": "padi", "meaning_zh": "稻田", "meaning_en": "rice paddy", "image": "/images/vocab/padi.png"},
          {"word": "awan", "meaning_ms": "awan", "meaning_zh": "云", "meaning_en": "cloud", "image": "/images/vocab/awan.png"},
          {"word": "itik", "meaning_ms": "itik", "meaning_zh": "鸭子", "meaning_en": "duck", "image": "/images/vocab/itik.png"},
          {"word": "lembu", "meaning_ms": "lembu", "meaning_zh": "牛", "meaning_en": "cow", "image": "/images/vocab/lembu.png"},
          {"word": "ayam", "meaning_ms": "ayam", "meaning_zh": "鸡", "meaning_en": "chicken", "image": "/images/vocab/ayam.png"}
        ]
      }
    }'::jsonb,
    20,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Suku Kata - Memancing Ikan (BA:14)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Iron Chestplate' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Suku Kata - Memancing Ikan',
    '写音节 - 钓鱼',
    'Write Syllables - Fishing',
    'Tulis suku kata untuk melengkapkan perkataan',
    '写出音节来完成单词',
    'Write the syllables to complete the words',
    '{
      "type": "writing",
      "data": {
        "characters": [],
        "trace_guides": false,
        "words": [
          {"word": "joran", "syllables": ["jo", "ran"], "meaning_ms": "joran", "meaning_zh": "钓鱼竿", "meaning_en": "fishing rod", "image": "/images/vocab/joran.png"},
          {"word": "ikan", "syllables": ["i", "kan"], "meaning_ms": "ikan", "meaning_zh": "鱼", "meaning_en": "fish", "image": "/images/vocab/ikan.png"},
          {"word": "bakul", "syllables": ["ba", "kul"], "meaning_ms": "bakul", "meaning_zh": "篮子", "meaning_en": "basket", "image": "/images/vocab/bakul.png"},
          {"word": "kasut", "syllables": ["ka", "sut"], "meaning_ms": "kasut", "meaning_zh": "鞋子", "meaning_en": "shoes", "image": "/images/vocab/kasut.png"},
          {"word": "kolam", "syllables": ["ko", "lam"], "meaning_ms": "kolam", "meaning_zh": "池塘", "meaning_en": "pond", "image": "/images/vocab/kolam.png"},
          {"word": "rumput", "syllables": ["rum", "put"], "meaning_ms": "rumput", "meaning_zh": "草", "meaning_en": "grass", "image": "/images/vocab/rumput.png"}
        ]
      }
    }'::jsonb,
    20,
    v_equipment_id,
    3
  );

  -- Activity 4: Ejaan Suku Kata - Memancing Ikan (Dictation for BA:14)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Iron Leggings' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan Suku Kata - Memancing Ikan',
    '听写音节 - 钓鱼',
    'Syllable Dictation - Fishing',
    'Dengar perkataan dan tulis dengan betul',
    '听单词并正确写出来',
    'Listen to the word and write it correctly',
    '{
      "type": "dictation",
      "data": {
        "words": [
          {"word": "joran", "meaning_ms": "joran", "meaning_zh": "钓鱼竿", "meaning_en": "fishing rod"},
          {"word": "ikan", "meaning_ms": "ikan", "meaning_zh": "鱼", "meaning_en": "fish"},
          {"word": "bakul", "meaning_ms": "bakul", "meaning_zh": "篮子", "meaning_en": "basket"},
          {"word": "kasut", "meaning_ms": "kasut", "meaning_zh": "鞋子", "meaning_en": "shoes"},
          {"word": "kolam", "meaning_ms": "kolam", "meaning_zh": "池塘", "meaning_en": "pond"}
        ]
      }
    }'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Tulis Perkataan - Sayang akan Datuk dan Nenek (BA:15)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Gold Sword' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Perkataan - Sayang akan Datuk dan Nenek',
    '写单词 - 爱爷爷奶奶',
    'Write Words - Love Grandparents',
    'Tulis perkataan dengan betul',
    '正确写出单词',
    'Write the words correctly',
    '{
      "type": "writing",
      "data": {
        "characters": [],
        "trace_guides": false,
        "words": [
          {"word": "gambar", "meaning_ms": "gambar", "meaning_zh": "图片", "meaning_en": "picture", "image": "/images/vocab/gambar.png"},
          {"word": "rak", "meaning_ms": "rak", "meaning_zh": "架子", "meaning_en": "shelf", "image": "/images/vocab/rak.png"},
          {"word": "datuk", "meaning_ms": "datuk", "meaning_zh": "爷爷", "meaning_en": "grandfather", "image": "/images/vocab/datuk.png"},
          {"word": "nenek", "meaning_ms": "nenek", "meaning_zh": "奶奶", "meaning_en": "grandmother", "image": "/images/vocab/nenek.png"},
          {"word": "rambut", "meaning_ms": "rambut", "meaning_zh": "头发", "meaning_en": "hair", "image": "/images/vocab/rambut.png"},
          {"word": "cawan", "meaning_ms": "cawan", "meaning_zh": "杯子", "meaning_en": "cup", "image": "/images/vocab/cawan.png"}
        ]
      }
    }'::jsonb,
    25,
    v_equipment_id,
    5
  );

  -- Activity 6: Ejaan Perkataan - Datuk dan Nenek (Dictation for BA:15)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Gold Helmet' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan Perkataan - Datuk dan Nenek',
    '听写单词 - 爷爷奶奶',
    'Word Dictation - Grandparents',
    'Dengar perkataan dan tulis dengan betul',
    '听单词并正确写出来',
    'Listen to the word and write it correctly',
    '{
      "type": "dictation",
      "data": {
        "words": [
          {"word": "gambar", "meaning_ms": "gambar", "meaning_zh": "图片", "meaning_en": "picture"},
          {"word": "datuk", "meaning_ms": "datuk", "meaning_zh": "爷爷", "meaning_en": "grandfather"},
          {"word": "nenek", "meaning_ms": "nenek", "meaning_zh": "奶奶", "meaning_en": "grandmother"},
          {"word": "rambut", "meaning_ms": "rambut", "meaning_zh": "头发", "meaning_en": "hair"},
          {"word": "cawan", "meaning_ms": "cawan", "meaning_zh": "杯子", "meaning_en": "cup"}
        ]
      }
    }'::jsonb,
    25,
    v_equipment_id,
    6
  );

  -- Activity 7: Kata Nama Khas - Bersama-sama Datuk dan Nenek (BA:17)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Gold Boots' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Kata Nama Khas - Bersama-sama Datuk dan Nenek',
    '专有名词 - 和爷爷奶奶在一起',
    'Proper Nouns - Together with Grandparents',
    'Sebut kata nama khas dengan betul',
    '正确说出专有名词',
    'Say the proper nouns correctly',
    '{
      "type": "speaking",
      "data": {
        "phrases": [
          {
            "text": "Ini Kampung Murni.",
            "translation_ms": "Ini Kampung Murni.",
            "translation_zh": "这是甘榜慕尼。",
            "translation_en": "This is Kampung Murni.",
            "voice_guide": "Ayat ini ialah Ini Kampung Murni. Kampung Murni adalah kata nama khas untuk tempat. Sebut dengan saya: Ini Kampung Murni."
          },
          {
            "text": "Ini Puan Chan.",
            "translation_ms": "Ini Puan Chan.",
            "translation_zh": "这是陈夫人。",
            "translation_en": "This is Mrs. Chan.",
            "voice_guide": "Ayat ini ialah Ini Puan Chan. Puan Chan adalah kata nama khas untuk orang. Sebut dengan saya: Ini Puan Chan."
          },
          {
            "text": "Ini Encik Tan.",
            "translation_ms": "Ini Encik Tan.",
            "translation_zh": "这是陈先生。",
            "translation_en": "This is Mr. Tan.",
            "voice_guide": "Ayat ini ialah Ini Encik Tan. Encik Tan adalah kata nama khas untuk orang. Sebut dengan saya: Ini Encik Tan."
          },
          {
            "text": "Ini kereta Proton Waja.",
            "translation_ms": "Ini kereta Proton Waja.",
            "translation_zh": "这是宝腾Waja汽车。",
            "translation_en": "This is a Proton Waja car.",
            "voice_guide": "Ayat ini ialah Ini kereta Proton Waja. Proton Waja adalah kata nama khas untuk kereta. Sebut dengan saya: Ini kereta Proton Waja."
          },
          {
            "text": "Saya sayang datuk dan nenek.",
            "translation_ms": "Saya sayang datuk dan nenek.",
            "translation_zh": "我爱爷爷和奶奶。",
            "translation_en": "I love grandfather and grandmother.",
            "voice_guide": "Ayat ini ialah Saya sayang datuk dan nenek. Kita guna untuk menyatakan kasih sayang kepada datuk dan nenek. Sebut dengan saya: Saya sayang datuk dan nenek."
          }
        ],
        "use_kid_name": false
      }
    }'::jsonb,
    30,
    v_equipment_id,
    7
  );

END $$;

-- =====================
-- Summary:
-- Unit 2: Mari Sayang - 6 activities (Chain + Stone + Iron tier)
-- Unit 3: Balik Ke Kampung - 7 activities (Iron + Gold tier)
-- Total: 13 new activities
-- =====================
