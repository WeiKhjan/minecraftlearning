-- MineCraft Learning Seed Data
-- Run this after schema.sql to populate initial content

-- =====================
-- TEMA 1: SAYANGI KELUARGA (Bahasa Malaysia)
-- =====================

-- First, get the BM subject ID
DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Theme 1
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade)
  VALUES (
    v_subject_id,
    'tema_1',
    'Sayangi Keluarga',
    '爱护家庭',
    'Love Your Family',
    'Belajar tentang keluarga dan huruf abjad',
    '学习关于家庭和字母',
    'Learn about family and the alphabet',
    1,
    'primary_1'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Mari Ajuk dan Sebut Nama Abjad (a-z)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Wooden Sword' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'alphabet',
    'Mari Ajuk dan Sebut Nama Abjad',
    '学习字母名称',
    'Learn Alphabet Names',
    'Tekan huruf mengikut turutan dari a hingga z',
    '按顺序点击从a到z的字母',
    'Tap the letters in order from a to z',
    '{
      "type": "alphabet",
      "data": {
        "letters": ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
        "instruction": {
          "ms": "Tekan huruf mengikut turutan",
          "zh": "按顺序点击字母",
          "en": "Tap letters in order"
        }
      }
    }'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Mari Sebut Bunyi Abjad
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Helmet' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Mari Ajuk dan Sebut Bunyi Abjad',
    '学习字母发音',
    'Learn Alphabet Sounds',
    'Padankan huruf dengan gambar yang betul',
    '将字母与正确的图片配对',
    'Match the letter with the correct picture',
    '{
      "type": "matching",
      "data": {
        "pairs": [
          {"letter": "A", "image": "/images/ayam.png", "word_ms": "Ayam", "word_zh": "鸡", "word_en": "Chicken"},
          {"letter": "E", "image": "/images/emak.png", "word_ms": "Emak", "word_zh": "妈妈", "word_en": "Mother"},
          {"letter": "I", "image": "/images/itik.png", "word_ms": "Itik", "word_zh": "鸭子", "word_en": "Duck"},
          {"letter": "O", "image": "/images/oren.png", "word_ms": "Oren", "word_zh": "橙子", "word_en": "Orange"},
          {"letter": "U", "image": "/images/unta.png", "word_ms": "Unta", "word_zh": "骆驼", "word_en": "Camel"}
        ]
      }
    }'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Baca Suku Kata
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Boots' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Baca Suku Kata',
    '阅读音节',
    'Read Syllables',
    'Baca suku kata dengan kuat',
    '大声朗读音节',
    'Read the syllables aloud',
    '{
      "type": "syllable",
      "data": {
        "syllables": [
          "a", "ba", "ca", "ga", "ka", "ma", "sa",
          "e", "be", "ce", "ge", "ke", "me", "se",
          "i", "bi", "ci", "gi", "ki", "mi", "si",
          "o", "bo", "co", "go", "ko", "mo", "so",
          "u", "bu", "cu", "gu", "ku", "mu", "su"
        ]
      }
    }'::jsonb,
    20,
    v_equipment_id,
    3
  );

  -- Activity 4: Tulis Huruf (Vowels)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Chestplate' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Huruf',
    '书写字母',
    'Write Letters',
    'Tulis huruf vokal a, e, i, o, u',
    '书写元音字母 a, e, i, o, u',
    'Write the vowels a, e, i, o, u',
    '{
      "type": "writing",
      "data": {
        "characters": ["a", "e", "i", "o", "u"],
        "trace_guides": true
      }
    }'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Tulis Perkataan
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Stone Sword' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Perkataan',
    '书写单词',
    'Write Words',
    'Tulis perkataan: ibu, meja, buku',
    '书写单词：ibu, meja, buku',
    'Write the words: ibu, meja, buku',
    '{
      "type": "writing",
      "data": {
        "characters": [],
        "trace_guides": false,
        "words": [
          {"word": "ibu", "meaning_ms": "Ibu", "meaning_zh": "妈妈", "meaning_en": "Mother"},
          {"word": "meja", "meaning_ms": "Meja", "meaning_zh": "桌子", "meaning_en": "Table"},
          {"word": "buku", "meaning_ms": "Buku", "meaning_zh": "书", "meaning_en": "Book"}
        ]
      }
    }'::jsonb,
    25,
    v_equipment_id,
    5
  );

  -- Activity 6: Ejaan Perkataan (Dictation)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Leather Leggings' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan Perkataan',
    '听写单词',
    'Word Dictation',
    'Dengar perkataan dan tulis dengan betul',
    '听单词并正确写出来',
    'Listen to the word and write it correctly',
    '{
      "type": "dictation",
      "data": {
        "words": [
          {"word": "ayam", "meaning_ms": "ayam", "meaning_zh": "鸡", "meaning_en": "chicken"},
          {"word": "epal", "meaning_ms": "epal", "meaning_zh": "苹果", "meaning_en": "apple"},
          {"word": "ikan", "meaning_ms": "ikan", "meaning_zh": "鱼", "meaning_en": "fish"},
          {"word": "oren", "meaning_ms": "oren", "meaning_zh": "橙子", "meaning_en": "orange"},
          {"word": "ular", "meaning_ms": "ular", "meaning_zh": "蛇", "meaning_en": "snake"}
        ]
      }
    }'::jsonb,
    25,
    v_equipment_id,
    6
  );

  -- Activity 7: Pengenalan Watak (Speaking)
  SELECT id INTO v_equipment_id FROM equipment WHERE name = 'Iron Helmet' LIMIT 1;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Pengenalan Watak',
    '自我介绍',
    'Character Introduction',
    'Perkenalkan diri anda: "Saya [Nama]"',
    '介绍自己："Saya [名字]"',
    'Introduce yourself: "Saya [Name]"',
    '{
      "type": "speaking",
      "data": {
        "phrases": [
          {
            "text": "Saya {name}",
            "translation_ms": "Saya {name}",
            "translation_zh": "我是 {name}",
            "translation_en": "I am {name}"
          },
          {
            "text": "Hai, kawan-kawan!",
            "translation_ms": "Hai, kawan-kawan!",
            "translation_zh": "嗨，朋友们！",
            "translation_en": "Hi, friends!"
          }
        ],
        "use_kid_name": true
      }
    }'::jsonb,
    30,
    v_equipment_id,
    7
  );

END $$;

-- =====================
-- SAMPLE ADMIN USER (Update with actual email)
-- =====================
-- To make a user admin, run:
-- UPDATE parents SET is_admin = true WHERE email = 'your-admin-email@gmail.com';
