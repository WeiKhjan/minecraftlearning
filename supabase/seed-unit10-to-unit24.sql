-- MYLearnt Seed Data: Unit 10 to Unit 24
-- Run this after seed-unit4-to-unit9.sql
-- TEMA 4: KESELAMATAN (Units 10-12)
-- TEMA 5: PERAYAAN (Units 13-14)
-- TEMA 6: SENI (Units 15-16)
-- TEMA 7: NEGARAKU (Units 17-18)
-- TEMA 8: ALAM SEKITAR (Units 19-21)
-- TEMA 9: SENI KREATIF (Units 22-24)

-- =====================
-- UPDATE ACTIVITY TYPE CONSTRAINT
-- Add 'sequencing' to allowed activity types
-- =====================
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check
  CHECK (type IN ('alphabet', 'matching', 'syllable', 'writing', 'speaking', 'singing', 'math', 'dictation', 'sequencing'));

-- =====================
-- TEMA 4: KESELAMATAN (Safety)
-- =====================

-- =====================
-- UNIT 10: BERHATI-HATI SELALU (Always Be Careful)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get BM subject
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  -- Insert Unit 10 Theme
  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_4_unit_10',
    'Berhati-hati Selalu',
    '时刻小心',
    'Always Be Careful',
    'Belajar perkataan tentang keselamatan dan berhati-hati',
    '学习关于安全和小心的单词',
    'Learn words about safety and being careful',
    10,
    'primary_1',
    'turtle'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Ajuk dan Sebut (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0010-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Ajuk dan Sebut',
    '模仿和说',
    'Imitate and Say',
    'Ajuk dan sebut perkataan keselamatan dengan betul',
    '正确模仿和说出安全相关的单词',
    'Imitate and say safety words correctly',
    '{"type": "syllable", "data": {"words": [{"word": "berhati-hati", "syllables": ["ber", "ha", "ti", "ha", "ti"], "meaning_ms": "berhati-hati", "meaning_zh": "小心", "meaning_en": "careful", "image": "/images/vocab/berhati_hati.png"}, {"word": "cermat", "syllables": ["cer", "mat"], "meaning_ms": "cermat", "meaning_zh": "谨慎", "meaning_en": "cautious", "image": "/images/vocab/cermat.png"}, {"word": "bijak", "syllables": ["bi", "jak"], "meaning_ms": "bijak", "meaning_zh": "明智", "meaning_en": "wise", "image": "/images/vocab/bijak.png"}, {"word": "selamat", "syllables": ["se", "la", "mat"], "meaning_ms": "selamat", "meaning_zh": "安全", "meaning_en": "safe", "image": "/images/vocab/selamat.png"}, {"word": "bahaya", "syllables": ["ba", "ha", "ya"], "meaning_ms": "bahaya", "meaning_zh": "危险", "meaning_en": "danger", "image": "/images/vocab/bahaya.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Padankan Gambar (Matching)
  v_equipment_id := 'e1010001-0001-0001-0010-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Padankan Gambar Keselamatan',
    '配对安全图片',
    'Match Safety Pictures',
    'Padankan perkataan dengan gambar yang betul',
    '将单词与正确的图片配对',
    'Match the word with the correct picture',
    '{"type": "matching", "data": {"pairs": [{"word": "topi keledar", "meaning_ms": "topi keledar", "meaning_zh": "头盔", "meaning_en": "helmet", "image": "/images/vocab/topi_keledar.png"}, {"word": "tali pinggang", "meaning_ms": "tali pinggang", "meaning_zh": "安全带", "meaning_en": "seatbelt", "image": "/images/vocab/tali_pinggang.png"}, {"word": "lampu isyarat", "meaning_ms": "lampu isyarat", "meaning_zh": "信号灯", "meaning_en": "traffic light", "image": "/images/vocab/lampu_isyarat.png"}, {"word": "papan tanda", "meaning_ms": "papan tanda", "meaning_zh": "标志牌", "meaning_en": "signboard", "image": "/images/vocab/papan_tanda.png"}, {"word": "pejalan kaki", "meaning_ms": "pejalan kaki", "meaning_zh": "行人", "meaning_en": "pedestrian", "image": "/images/vocab/pejalan_kaki.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Nasihat Kakak (Writing)
  v_equipment_id := 'e1010001-0001-0001-0010-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Nasihat Kakak',
    '姐姐的建议',
    'Sister''s Advice',
    'Tulis nasihat kakak tentang keselamatan',
    '写下姐姐关于安全的建议',
    'Write sister''s advice about safety',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Jangan bermain di jalan.", "meaning_ms": "Jangan bermain di jalan.", "meaning_zh": "不要在路上玩耍。", "meaning_en": "Don''t play on the road."}, {"word": "Pakai topi keledar.", "meaning_ms": "Pakai topi keledar.", "meaning_zh": "戴上头盔。", "meaning_en": "Wear a helmet."}, {"word": "Berhenti dan lihat.", "meaning_ms": "Berhenti dan lihat.", "meaning_zh": "停下来看看。", "meaning_en": "Stop and look."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Ayat Keselamatan (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0010-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Ayat Keselamatan',
    '安全句子',
    'Safety Sentences',
    'Sebut ayat keselamatan dengan betul',
    '正确说出安全句子',
    'Say safety sentences correctly',
    '{"type": "speaking", "data": {"phrases": [{"text": "Saya memakai topi keledar.", "translation_ms": "Saya memakai topi keledar.", "translation_zh": "我戴着头盔。", "translation_en": "I am wearing a helmet.", "voice_guide": "Ayat ini ialah Saya memakai topi keledar. Topi keledar melindungi kepala kita. Sebut dengan saya: Saya memakai topi keledar."}, {"text": "Jalan dengan berhati-hati.", "translation_ms": "Jalan dengan berhati-hati.", "translation_zh": "小心地走路。", "translation_en": "Walk carefully.", "voice_guide": "Ayat ini ialah Jalan dengan berhati-hati. Kita mesti berjalan dengan selamat. Sebut dengan saya: Jalan dengan berhati-hati."}, {"text": "Tunggu lampu hijau.", "translation_ms": "Tunggu lampu hijau.", "translation_zh": "等绿灯。", "translation_en": "Wait for the green light.", "voice_guide": "Ayat ini ialah Tunggu lampu hijau. Lampu hijau bermakna selamat untuk melintas. Sebut dengan saya: Tunggu lampu hijau."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Kata Adjektif Sifatan (Matching)
  v_equipment_id := 'e1010001-0001-0001-0010-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Adjektif Sifatan',
    '描述性形容词',
    'Descriptive Adjectives',
    'Padankan kata adjektif dengan gambar',
    '将形容词与图片配对',
    'Match adjectives with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "cermat", "meaning_ms": "cermat", "meaning_zh": "细心的", "meaning_en": "careful", "image": "/images/vocab/cermat.png"}, {"word": "bijak", "meaning_ms": "bijak", "meaning_zh": "明智的", "meaning_en": "wise", "image": "/images/vocab/bijak.png"}, {"word": "rajin", "meaning_ms": "rajin", "meaning_zh": "勤劳的", "meaning_en": "diligent", "image": "/images/vocab/rajin.png"}, {"word": "sopan", "meaning_ms": "sopan", "meaning_zh": "有礼貌的", "meaning_en": "polite", "image": "/images/vocab/sopan.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 11: SELAMAT SENTIASA (Always Safe)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_4_unit_11',
    'Selamat Sentiasa',
    '永远安全',
    'Always Safe',
    'Belajar tentang keselamatan dalam kenderaan',
    '学习关于车辆安全的知识',
    'Learn about vehicle safety',
    11,
    'primary_1',
    'bee'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Dengar dan Sebut (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0011-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Dengar dan Sebut',
    '听和说',
    'Listen and Say',
    'Dengar dan sebut perkataan kenderaan',
    '听并说出交通工具相关单词',
    'Listen and say vehicle words',
    '{"type": "syllable", "data": {"words": [{"word": "kereta", "syllables": ["ke", "re", "ta"], "meaning_ms": "kereta", "meaning_zh": "汽车", "meaning_en": "car", "image": "/images/vocab/kereta.png"}, {"word": "bas", "syllables": ["bas"], "meaning_ms": "bas", "meaning_zh": "巴士", "meaning_en": "bus", "image": "/images/vocab/bas.png"}, {"word": "motosikal", "syllables": ["mo", "to", "si", "kal"], "meaning_ms": "motosikal", "meaning_zh": "摩托车", "meaning_en": "motorcycle", "image": "/images/vocab/motosikal.png"}, {"word": "lori", "syllables": ["lo", "ri"], "meaning_ms": "lori", "meaning_zh": "卡车", "meaning_en": "truck", "image": "/images/vocab/lori.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Keselamatan Kenderaan (Matching)
  v_equipment_id := 'e1010001-0001-0001-0011-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Keselamatan Kenderaan',
    '车辆安全',
    'Vehicle Safety',
    'Padankan situasi keselamatan dengan gambar',
    '将安全情况与图片配对',
    'Match safety situations with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "pakai tali pinggang", "meaning_ms": "pakai tali pinggang", "meaning_zh": "系安全带", "meaning_en": "wear seatbelt", "image": "/images/vocab/tali_pinggang.png"}, {"word": "duduk di tempat duduk", "meaning_ms": "duduk di tempat duduk", "meaning_zh": "坐在座位上", "meaning_en": "sit in seat", "image": "/images/vocab/tempat_duduk.png"}, {"word": "pegang tangan ibu", "meaning_ms": "pegang tangan ibu", "meaning_zh": "牵着妈妈的手", "meaning_en": "hold mom''s hand", "image": "/images/vocab/pegang_tangan.png"}, {"word": "jangan berdiri", "meaning_ms": "jangan berdiri", "meaning_zh": "不要站立", "meaning_en": "don''t stand", "image": "/images/vocab/jangan_berdiri.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Ayat Keselamatan (Writing)
  v_equipment_id := 'e1010001-0001-0001-0011-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Ayat Keselamatan',
    '写安全句子',
    'Write Safety Sentences',
    'Tulis ayat tentang keselamatan kenderaan',
    '写关于车辆安全的句子',
    'Write sentences about vehicle safety',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Pakai tali pinggang.", "meaning_ms": "Pakai tali pinggang.", "meaning_zh": "系好安全带。", "meaning_en": "Wear seatbelt."}, {"word": "Duduk dengan betul.", "meaning_ms": "Duduk dengan betul.", "meaning_zh": "正确地坐着。", "meaning_en": "Sit properly."}, {"word": "Jangan bermain dalam kereta.", "meaning_ms": "Jangan bermain dalam kereta.", "meaning_zh": "不要在车里玩耍。", "meaning_en": "Don''t play in the car."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Dialog Keselamatan (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0011-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Dialog Keselamatan',
    '安全对话',
    'Safety Dialogue',
    'Sebut dialog tentang keselamatan',
    '说出关于安全的对话',
    'Say dialogue about safety',
    '{"type": "speaking", "data": {"phrases": [{"text": "Ibu, saya sudah pakai tali pinggang.", "translation_ms": "Ibu, saya sudah pakai tali pinggang.", "translation_zh": "妈妈，我已经系好安全带了。", "translation_en": "Mom, I have put on my seatbelt.", "voice_guide": "Sebut dengan saya: Ibu, saya sudah pakai tali pinggang."}, {"text": "Bagus! Kita selamat sekarang.", "translation_ms": "Bagus! Kita selamat sekarang.", "translation_zh": "很好！我们现在安全了。", "translation_en": "Good! We are safe now.", "voice_guide": "Sebut dengan saya: Bagus! Kita selamat sekarang."}, {"text": "Terima kasih kerana mengingatkan.", "translation_ms": "Terima kasih kerana mengingatkan.", "translation_zh": "谢谢你提醒我。", "translation_en": "Thank you for reminding.", "voice_guide": "Sebut dengan saya: Terima kasih kerana mengingatkan."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Ejaan Keselamatan (Dictation)
  v_equipment_id := 'e1010001-0001-0001-0011-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan Keselamatan',
    '安全听写',
    'Safety Dictation',
    'Dengar dan tulis perkataan keselamatan',
    '听并写出安全相关单词',
    'Listen and write safety words',
    '{"type": "dictation", "data": {"words": [{"word": "selamat", "meaning_ms": "selamat", "meaning_zh": "安全", "meaning_en": "safe"}, {"word": "kereta", "meaning_ms": "kereta", "meaning_zh": "汽车", "meaning_en": "car"}, {"word": "bas", "meaning_ms": "bas", "meaning_zh": "巴士", "meaning_en": "bus"}, {"word": "berhati", "meaning_ms": "berhati", "meaning_zh": "小心", "meaning_en": "careful"}]}}'::jsonb,
    20,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 12: JADIKAN TELADAN (Be a Role Model)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_4_unit_12',
    'Jadikan Teladan',
    '做个榜样',
    'Be a Role Model',
    'Belajar tentang menjadi teladan yang baik',
    '学习如何成为好榜样',
    'Learn about being a good role model',
    12,
    'primary_1',
    'panda'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Dengar dan Sebut (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0012-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Dengar dan Sebut',
    '听和说',
    'Listen and Say',
    'Dengar dan sebut perkataan teladan',
    '听并说出榜样相关单词',
    'Listen and say role model words',
    '{"type": "syllable", "data": {"words": [{"word": "teladan", "syllables": ["te", "la", "dan"], "meaning_ms": "teladan", "meaning_zh": "榜样", "meaning_en": "role model", "image": "/images/vocab/teladan.png"}, {"word": "bertanggungjawab", "syllables": ["ber", "tang", "gung", "ja", "wab"], "meaning_ms": "bertanggungjawab", "meaning_zh": "负责任", "meaning_en": "responsible", "image": "/images/vocab/bertanggungjawab.png"}, {"word": "jujur", "syllables": ["ju", "jur"], "meaning_ms": "jujur", "meaning_zh": "诚实", "meaning_en": "honest", "image": "/images/vocab/jujur.png"}, {"word": "rajin", "syllables": ["ra", "jin"], "meaning_ms": "rajin", "meaning_zh": "勤劳", "meaning_en": "diligent", "image": "/images/vocab/rajin.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Keselamatan Taman Permainan (Matching)
  v_equipment_id := 'e1010001-0001-0001-0012-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Keselamatan Taman Permainan',
    '游乐场安全',
    'Playground Safety',
    'Padankan peraturan dengan gambar',
    '将规则与图片配对',
    'Match rules with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "bergilir-gilir", "meaning_ms": "bergilir-gilir", "meaning_zh": "轮流", "meaning_en": "take turns", "image": "/images/vocab/bergilir.png"}, {"word": "tidak menolak", "meaning_ms": "tidak menolak", "meaning_zh": "不推人", "meaning_en": "no pushing", "image": "/images/vocab/tidak_menolak.png"}, {"word": "berbaris", "meaning_ms": "berbaris", "meaning_zh": "排队", "meaning_en": "line up", "image": "/images/vocab/berbaris.png"}, {"word": "berkongsi", "meaning_ms": "berkongsi", "meaning_zh": "分享", "meaning_en": "share", "image": "/images/vocab/berkongsi.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Pesanan Ibu Bapa (Writing)
  v_equipment_id := 'e1010001-0001-0001-0012-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Pesanan Ibu Bapa',
    '父母的话',
    'Parents'' Message',
    'Tulis pesanan ibu bapa',
    '写父母的话',
    'Write parents'' message',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Jadilah anak yang baik.", "meaning_ms": "Jadilah anak yang baik.", "meaning_zh": "做个好孩子。", "meaning_en": "Be a good child."}, {"word": "Hormati guru dan kawan.", "meaning_ms": "Hormati guru dan kawan.", "meaning_zh": "尊敬老师和朋友。", "meaning_en": "Respect teachers and friends."}, {"word": "Sentiasa jujur.", "meaning_ms": "Sentiasa jujur.", "meaning_zh": "永远诚实。", "meaning_en": "Always be honest."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Ayat Tanggungjawab (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0012-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Ayat Tanggungjawab',
    '责任句子',
    'Responsibility Sentences',
    'Sebut ayat tentang tanggungjawab',
    '说出关于责任的句子',
    'Say sentences about responsibility',
    '{"type": "speaking", "data": {"phrases": [{"text": "Saya kemas bilik sendiri.", "translation_ms": "Saya kemas bilik sendiri.", "translation_zh": "我自己整理房间。", "translation_en": "I tidy my own room.", "voice_guide": "Sebut dengan saya: Saya kemas bilik sendiri."}, {"text": "Saya siapkan kerja rumah.", "translation_ms": "Saya siapkan kerja rumah.", "translation_zh": "我完成作业。", "translation_en": "I finish my homework.", "voice_guide": "Sebut dengan saya: Saya siapkan kerja rumah."}, {"text": "Saya membantu ibu di dapur.", "translation_ms": "Saya membantu ibu di dapur.", "translation_zh": "我在厨房帮助妈妈。", "translation_en": "I help mom in the kitchen.", "voice_guide": "Sebut dengan saya: Saya membantu ibu di dapur."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Kata Tanya (Matching)
  v_equipment_id := 'e1010001-0001-0001-0012-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Tanya',
    '疑问词',
    'Question Words',
    'Padankan kata tanya dengan maksud',
    '将疑问词与含义配对',
    'Match question words with meaning',
    '{"type": "matching", "data": {"pairs": [{"word": "berapa", "meaning_ms": "berapa", "meaning_zh": "多少", "meaning_en": "how many", "image": "/images/vocab/berapa.png"}, {"word": "kepada", "meaning_ms": "kepada", "meaning_zh": "给/对", "meaning_en": "to/for", "image": "/images/vocab/kepada.png"}, {"word": "mengapa", "meaning_ms": "mengapa", "meaning_zh": "为什么", "meaning_en": "why", "image": "/images/vocab/mengapa.png"}, {"word": "bila", "meaning_ms": "bila", "meaning_zh": "什么时候", "meaning_en": "when", "image": "/images/vocab/bila.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- TEMA 5: PERAYAAN (Celebrations)
-- =====================

-- =====================
-- UNIT 13: MERIAHNYA PERAYAAN (Festive Celebrations)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_5_unit_13',
    'Meriahnya Perayaan',
    '节日的热闹',
    'Festive Celebrations',
    'Belajar tentang perayaan dan budaya Malaysia',
    '学习马来西亚的节日和文化',
    'Learn about Malaysian festivals and culture',
    13,
    'primary_1',
    'axolotl'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Dengar dan Sebut - Hari Gawai (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0013-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Hari Gawai',
    '丰收节',
    'Gawai Festival',
    'Dengar dan sebut perkataan perayaan Gawai',
    '听并说出丰收节相关单词',
    'Listen and say Gawai festival words',
    '{"type": "syllable", "data": {"words": [{"word": "Hari Gawai", "syllables": ["Ha", "ri", "Ga", "wai"], "meaning_ms": "Hari Gawai", "meaning_zh": "丰收节", "meaning_en": "Gawai Day", "image": "/images/vocab/hari_gawai.png"}, {"word": "tuak", "syllables": ["tu", "ak"], "meaning_ms": "tuak", "meaning_zh": "米酒", "meaning_en": "rice wine", "image": "/images/vocab/tuak.png"}, {"word": "rumah panjang", "syllables": ["ru", "mah", "pan", "jang"], "meaning_ms": "rumah panjang", "meaning_zh": "长屋", "meaning_en": "longhouse", "image": "/images/vocab/rumah_panjang.png"}, {"word": "ngajat", "syllables": ["nga", "jat"], "meaning_ms": "ngajat", "meaning_zh": "传统舞蹈", "meaning_en": "traditional dance", "image": "/images/vocab/ngajat.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Makanan Perayaan (Matching)
  v_equipment_id := 'e1010001-0001-0001-0013-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Makanan Perayaan',
    '节日美食',
    'Festival Food',
    'Padankan makanan perayaan dengan gambar',
    '将节日美食与图片配对',
    'Match festival food with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "ayam pansuh", "meaning_ms": "ayam pansuh", "meaning_zh": "竹筒鸡", "meaning_en": "chicken in bamboo", "image": "/images/vocab/ayam_pansuh.png"}, {"word": "umai", "meaning_ms": "umai", "meaning_zh": "生鱼沙拉", "meaning_en": "raw fish salad", "image": "/images/vocab/umai.png"}, {"word": "lemang", "meaning_ms": "lemang", "meaning_zh": "竹筒糯米饭", "meaning_en": "bamboo rice", "image": "/images/vocab/lemang.png"}, {"word": "rendang", "meaning_ms": "rendang", "meaning_zh": "仁当", "meaning_en": "rendang", "image": "/images/vocab/rendang.png"}, {"word": "ketupat", "meaning_ms": "ketupat", "meaning_zh": "粽子", "meaning_en": "rice cake", "image": "/images/vocab/ketupat.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Tentang Perayaan (Writing)
  v_equipment_id := 'e1010001-0001-0001-0013-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Cerita Perayaan',
    '节日故事',
    'Festival Story',
    'Tulis tentang perayaan',
    '写关于节日的内容',
    'Write about festivals',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Hari Gawai disambut di Sarawak.", "meaning_ms": "Hari Gawai disambut di Sarawak.", "meaning_zh": "丰收节在砂拉越庆祝。", "meaning_en": "Gawai is celebrated in Sarawak."}, {"word": "Orang Iban menari ngajat.", "meaning_ms": "Orang Iban menari ngajat.", "meaning_zh": "伊班族跳传统舞。", "meaning_en": "The Iban people dance ngajat."}, {"word": "Mereka makan ayam pansuh.", "meaning_ms": "Mereka makan ayam pansuh.", "meaning_zh": "他们吃竹筒鸡。", "meaning_en": "They eat chicken in bamboo."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Maklumat Perayaan (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0013-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Maklumat Perayaan',
    '节日信息',
    'Festival Information',
    'Sebut maklumat tentang perayaan',
    '说出关于节日的信息',
    'Say information about festivals',
    '{"type": "speaking", "data": {"phrases": [{"text": "Hari Gawai jatuh pada 1 Jun.", "translation_ms": "Hari Gawai jatuh pada 1 Jun.", "translation_zh": "丰收节在6月1日。", "translation_en": "Gawai falls on June 1st.", "voice_guide": "Sebut dengan saya: Hari Gawai jatuh pada 1 Jun."}, {"text": "Kaum Iban dan Bidayuh menyambut Gawai.", "translation_ms": "Kaum Iban dan Bidayuh menyambut Gawai.", "translation_zh": "伊班族和比达友族庆祝丰收节。", "translation_en": "Iban and Bidayuh celebrate Gawai.", "voice_guide": "Sebut dengan saya: Kaum Iban dan Bidayuh menyambut Gawai."}, {"text": "Mereka memakai pakaian tradisional.", "translation_ms": "Mereka memakai pakaian tradisional.", "translation_zh": "他们穿传统服装。", "translation_en": "They wear traditional clothes.", "voice_guide": "Sebut dengan saya: Mereka memakai pakaian tradisional."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Kata Waktu (Matching)
  v_equipment_id := 'e1010001-0001-0001-0013-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Waktu',
    '时间词',
    'Time Words',
    'Padankan kata waktu dengan maksud',
    '将时间词与含义配对',
    'Match time words with meaning',
    '{"type": "matching", "data": {"pairs": [{"word": "tarikh", "meaning_ms": "tarikh", "meaning_zh": "日期", "meaning_en": "date", "image": "/images/vocab/tarikh.png"}, {"word": "bulan", "meaning_ms": "bulan", "meaning_zh": "月份", "meaning_en": "month", "image": "/images/vocab/bulan.png"}, {"word": "tahun", "meaning_ms": "tahun", "meaning_zh": "年", "meaning_en": "year", "image": "/images/vocab/tahun.png"}, {"word": "hari", "meaning_ms": "hari", "meaning_zh": "日", "meaning_en": "day", "image": "/images/vocab/hari.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 14: PERAYAAN KITA (Our Celebrations)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_5_unit_14',
    'Perayaan Kita',
    '我们的节日',
    'Our Celebrations',
    'Belajar tentang pelbagai perayaan di Malaysia',
    '学习马来西亚的各种节日',
    'Learn about various celebrations in Malaysia',
    14,
    'primary_1',
    'ocelot'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perayaan Malaysia (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0014-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perayaan Malaysia',
    '马来西亚节日',
    'Malaysian Celebrations',
    'Dengar dan sebut nama perayaan',
    '听并说出节日名称',
    'Listen and say celebration names',
    '{"type": "syllable", "data": {"words": [{"word": "Hari Raya", "syllables": ["Ha", "ri", "Ra", "ya"], "meaning_ms": "Hari Raya", "meaning_zh": "开斋节", "meaning_en": "Eid", "image": "/images/vocab/hari_raya.png"}, {"word": "Tahun Baru Cina", "syllables": ["Ta", "hun", "Ba", "ru", "Ci", "na"], "meaning_ms": "Tahun Baru Cina", "meaning_zh": "农历新年", "meaning_en": "Chinese New Year", "image": "/images/vocab/tahun_baru_cina.png"}, {"word": "Deepavali", "syllables": ["De", "e", "pa", "va", "li"], "meaning_ms": "Deepavali", "meaning_zh": "屠妖节", "meaning_en": "Deepavali", "image": "/images/vocab/deepavali.png"}, {"word": "Krismas", "syllables": ["Kris", "mas"], "meaning_ms": "Krismas", "meaning_zh": "圣诞节", "meaning_en": "Christmas", "image": "/images/vocab/krismas.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Barang Perayaan (Matching)
  v_equipment_id := 'e1010001-0001-0001-0014-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Barang Perayaan',
    '节日物品',
    'Festival Items',
    'Padankan barang perayaan dengan gambar',
    '将节日物品与图片配对',
    'Match festival items with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "pelita", "meaning_ms": "pelita", "meaning_zh": "油灯", "meaning_en": "oil lamp", "image": "/images/vocab/pelita.png"}, {"word": "angpau", "meaning_ms": "angpau", "meaning_zh": "红包", "meaning_en": "red packet", "image": "/images/vocab/angpau.png"}, {"word": "kolam", "meaning_ms": "kolam", "meaning_zh": "彩绘", "meaning_en": "rangoli", "image": "/images/vocab/kolam.png"}, {"word": "pokok Krismas", "meaning_ms": "pokok Krismas", "meaning_zh": "圣诞树", "meaning_en": "Christmas tree", "image": "/images/vocab/pokok_krismas.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Ucapan Perayaan (Writing)
  v_equipment_id := 'e1010001-0001-0001-0014-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Ucapan Perayaan',
    '节日祝福',
    'Festival Greetings',
    'Tulis ucapan perayaan',
    '写节日祝福',
    'Write festival greetings',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Selamat Hari Raya!", "meaning_ms": "Selamat Hari Raya!", "meaning_zh": "开斋节快乐！", "meaning_en": "Happy Eid!"}, {"word": "Gong Xi Fa Cai!", "meaning_ms": "Gong Xi Fa Cai!", "meaning_zh": "恭喜发财！", "meaning_en": "Happy Chinese New Year!"}, {"word": "Selamat Deepavali!", "meaning_ms": "Selamat Deepavali!", "meaning_zh": "屠妖节快乐！", "meaning_en": "Happy Deepavali!"}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Pantun Perayaan (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0014-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Pantun Perayaan',
    '节日诗歌',
    'Festival Pantun',
    'Sebut pantun tentang perayaan',
    '朗诵关于节日的诗歌',
    'Recite pantun about festivals',
    '{"type": "speaking", "data": {"phrases": [{"text": "Buah cempedak di luar pagar,", "translation_ms": "Buah cempedak di luar pagar,", "translation_zh": "榴莲果在篱笆外，", "translation_en": "Cempedak fruit outside the fence,", "voice_guide": "Sebut dengan saya: Buah cempedak di luar pagar."}, {"text": "Ambil galah tolong jolokkan.", "translation_ms": "Ambil galah tolong jolokkan.", "translation_zh": "拿竹竿帮忙够下来。", "translation_en": "Take a pole to help knock it down.", "voice_guide": "Sebut dengan saya: Ambil galah tolong jolokkan."}, {"text": "Hari Raya sudah tiba,", "translation_ms": "Hari Raya sudah tiba,", "translation_zh": "开斋节已经到来，", "translation_en": "Hari Raya has arrived,", "voice_guide": "Sebut dengan saya: Hari Raya sudah tiba."}, {"text": "Maaf zahir dan batin dimohonkan.", "translation_ms": "Maaf zahir dan batin dimohonkan.", "translation_zh": "请原谅我的过错。", "translation_en": "Please forgive any wrongdoing.", "voice_guide": "Sebut dengan saya: Maaf zahir dan batin dimohonkan."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Ejaan Perayaan (Dictation)
  v_equipment_id := 'e1010001-0001-0001-0014-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan Perayaan',
    '节日听写',
    'Festival Dictation',
    'Dengar dan tulis perkataan perayaan',
    '听并写出节日相关单词',
    'Listen and write festival words',
    '{"type": "dictation", "data": {"words": [{"word": "raya", "meaning_ms": "raya", "meaning_zh": "节日", "meaning_en": "festival"}, {"word": "cuti", "meaning_ms": "cuti", "meaning_zh": "假期", "meaning_en": "holiday"}, {"word": "meriah", "meaning_ms": "meriah", "meaning_zh": "热闹", "meaning_en": "festive"}, {"word": "gembira", "meaning_ms": "gembira", "meaning_zh": "快乐", "meaning_en": "happy"}]}}'::jsonb,
    20,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- TEMA 6: SENI (Arts)
-- =====================

-- =====================
-- UNIT 15: WAH, CANTIKNYA! (Wow, How Beautiful!)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_6_unit_15',
    'Wah, Cantiknya!',
    '哇，真漂亮！',
    'Wow, How Beautiful!',
    'Belajar tentang seni dan keindahan',
    '学习关于艺术和美的知识',
    'Learn about art and beauty',
    15,
    'primary_1',
    'llama'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perkataan Seni (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0015-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perkataan Seni',
    '艺术词汇',
    'Art Words',
    'Dengar dan sebut perkataan seni',
    '听并说出艺术相关单词',
    'Listen and say art words',
    '{"type": "syllable", "data": {"words": [{"word": "lukisan", "syllables": ["lu", "ki", "san"], "meaning_ms": "lukisan", "meaning_zh": "画", "meaning_en": "painting", "image": "/images/vocab/lukisan.png"}, {"word": "warna", "syllables": ["war", "na"], "meaning_ms": "warna", "meaning_zh": "颜色", "meaning_en": "color", "image": "/images/vocab/warna.png"}, {"word": "corak", "syllables": ["co", "rak"], "meaning_ms": "corak", "meaning_zh": "图案", "meaning_en": "pattern", "image": "/images/vocab/corak.png"}, {"word": "cantik", "syllables": ["can", "tik"], "meaning_ms": "cantik", "meaning_zh": "美丽", "meaning_en": "beautiful", "image": "/images/vocab/cantik.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Alat Seni (Matching)
  v_equipment_id := 'e1010001-0001-0001-0015-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Alat Seni',
    '艺术工具',
    'Art Tools',
    'Padankan alat seni dengan gambar',
    '将艺术工具与图片配对',
    'Match art tools with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "berus", "meaning_ms": "berus", "meaning_zh": "画笔", "meaning_en": "brush", "image": "/images/vocab/berus.png"}, {"word": "cat", "meaning_ms": "cat", "meaning_zh": "颜料", "meaning_en": "paint", "image": "/images/vocab/cat.png"}, {"word": "kanvas", "meaning_ms": "kanvas", "meaning_zh": "画布", "meaning_en": "canvas", "image": "/images/vocab/kanvas.png"}, {"word": "krayon", "meaning_ms": "krayon", "meaning_zh": "蜡笔", "meaning_en": "crayon", "image": "/images/vocab/krayon.png"}, {"word": "palet", "meaning_ms": "palet", "meaning_zh": "调色板", "meaning_en": "palette", "image": "/images/vocab/palet.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Deskripsi Seni (Writing)
  v_equipment_id := 'e1010001-0001-0001-0015-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Deskripsi Lukisan',
    '描述画作',
    'Describe the Painting',
    'Tulis deskripsi lukisan',
    '写画作的描述',
    'Write description of painting',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Lukisan ini cantik.", "meaning_ms": "Lukisan ini cantik.", "meaning_zh": "这幅画很美。", "meaning_en": "This painting is beautiful."}, {"word": "Warnanya terang dan ceria.", "meaning_ms": "Warnanya terang dan ceria.", "meaning_zh": "颜色明亮而欢快。", "meaning_en": "The colors are bright and cheerful."}, {"word": "Saya suka coraknya.", "meaning_ms": "Saya suka coraknya.", "meaning_zh": "我喜欢它的图案。", "meaning_en": "I like its pattern."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Ayat Penghargaan Seni (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0015-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Penghargaan Seni',
    '艺术欣赏',
    'Art Appreciation',
    'Sebut ayat penghargaan seni',
    '说出艺术欣赏的句子',
    'Say art appreciation sentences',
    '{"type": "speaking", "data": {"phrases": [{"text": "Wah, cantiknya lukisan ini!", "translation_ms": "Wah, cantiknya lukisan ini!", "translation_zh": "哇，这幅画真美！", "translation_en": "Wow, this painting is beautiful!", "voice_guide": "Sebut dengan saya: Wah, cantiknya lukisan ini!"}, {"text": "Saya kagum dengan karya ini.", "translation_ms": "Saya kagum dengan karya ini.", "translation_zh": "我很欣赏这件作品。", "translation_en": "I admire this work.", "voice_guide": "Sebut dengan saya: Saya kagum dengan karya ini."}, {"text": "Warna biru ini sangat menarik.", "translation_ms": "Warna biru ini sangat menarik.", "translation_zh": "这蓝色非常吸引人。", "translation_en": "This blue color is very attractive.", "voice_guide": "Sebut dengan saya: Warna biru ini sangat menarik."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Warna (Matching)
  v_equipment_id := 'e1010001-0001-0001-0015-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Warna',
    '颜色',
    'Colors',
    'Padankan nama warna dengan gambar',
    '将颜色名称与图片配对',
    'Match color names with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "merah", "meaning_ms": "merah", "meaning_zh": "红色", "meaning_en": "red", "image": "/images/vocab/merah.png"}, {"word": "biru", "meaning_ms": "biru", "meaning_zh": "蓝色", "meaning_en": "blue", "image": "/images/vocab/biru.png"}, {"word": "kuning", "meaning_ms": "kuning", "meaning_zh": "黄色", "meaning_en": "yellow", "image": "/images/vocab/kuning.png"}, {"word": "hijau", "meaning_ms": "hijau", "meaning_zh": "绿色", "meaning_en": "green", "image": "/images/vocab/hijau.png"}, {"word": "ungu", "meaning_ms": "ungu", "meaning_zh": "紫色", "meaning_en": "purple", "image": "/images/vocab/ungu.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 16: PAMERAN KARTUN MALAYSIA (Malaysian Cartoon Exhibition)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_6_unit_16',
    'Pameran Kartun Malaysia',
    '马来西亚漫画展',
    'Malaysian Cartoon Exhibition',
    'Belajar tentang kartunis dan kartun Malaysia',
    '学习马来西亚漫画家和漫画',
    'Learn about Malaysian cartoonists and cartoons',
    16,
    'primary_1',
    'bone_warrior'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perkataan Kartun (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0016-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perkataan Kartun',
    '漫画词汇',
    'Cartoon Words',
    'Dengar dan sebut perkataan kartun',
    '听并说出漫画相关单词',
    'Listen and say cartoon words',
    '{"type": "syllable", "data": {"words": [{"word": "kartunis", "syllables": ["kar", "tu", "nis"], "meaning_ms": "kartunis", "meaning_zh": "漫画家", "meaning_en": "cartoonist", "image": "/images/vocab/kartunis.png"}, {"word": "kartun", "syllables": ["kar", "tun"], "meaning_ms": "kartun", "meaning_zh": "漫画", "meaning_en": "cartoon", "image": "/images/vocab/kartun.png"}, {"word": "komik", "syllables": ["ko", "mik"], "meaning_ms": "komik", "meaning_zh": "漫画书", "meaning_en": "comic", "image": "/images/vocab/komik.png"}, {"word": "watak", "syllables": ["wa", "tak"], "meaning_ms": "watak", "meaning_zh": "角色", "meaning_en": "character", "image": "/images/vocab/watak.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Karya Terkenal (Matching)
  v_equipment_id := 'e1010001-0001-0001-0016-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Karya Terkenal',
    '著名作品',
    'Famous Works',
    'Padankan karya kartun dengan gambar',
    '将漫画作品与图片配对',
    'Match cartoon works with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "Lat", "meaning_ms": "Lat", "meaning_zh": "拉特", "meaning_en": "Lat", "image": "/images/vocab/lat.png"}, {"word": "Kampung Boy", "meaning_ms": "Kampung Boy", "meaning_zh": "甘榜男孩", "meaning_en": "Kampung Boy", "image": "/images/vocab/kampung_boy.png"}, {"word": "Budak Kampung", "meaning_ms": "Budak Kampung", "meaning_zh": "乡村孩子", "meaning_en": "Village Boy", "image": "/images/vocab/budak_kampung.png"}, {"word": "Upin Ipin", "meaning_ms": "Upin Ipin", "meaning_zh": "双胞胎", "meaning_en": "Upin Ipin", "image": "/images/vocab/upin_ipin.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Tentang Kartunis (Writing)
  v_equipment_id := 'e1010001-0001-0001-0016-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tentang Datuk Lat',
    '关于拉特',
    'About Datuk Lat',
    'Tulis tentang kartunis terkenal',
    '写关于著名漫画家的内容',
    'Write about famous cartoonist',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Datuk Lat ialah kartunis terkenal.", "meaning_ms": "Datuk Lat ialah kartunis terkenal.", "meaning_zh": "拉特是著名的漫画家。", "meaning_en": "Datuk Lat is a famous cartoonist."}, {"word": "Beliau berasal dari Perak.", "meaning_ms": "Beliau berasal dari Perak.", "meaning_zh": "他来自霹雳州。", "meaning_en": "He is from Perak."}, {"word": "Kampung Boy sangat popular.", "meaning_ms": "Kampung Boy sangat popular.", "meaning_zh": "甘榜男孩非常受欢迎。", "meaning_en": "Kampung Boy is very popular."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Maklumat Kartunis (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0016-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Maklumat Kartunis',
    '漫画家信息',
    'Cartoonist Information',
    'Sebut maklumat tentang kartunis',
    '说出关于漫画家的信息',
    'Say information about cartoonists',
    '{"type": "speaking", "data": {"phrases": [{"text": "Datuk Lat dilahirkan di Perak.", "translation_ms": "Datuk Lat dilahirkan di Perak.", "translation_zh": "拉特出生在霹雳州。", "translation_en": "Datuk Lat was born in Perak.", "voice_guide": "Sebut dengan saya: Datuk Lat dilahirkan di Perak."}, {"text": "Beliau melukis kartun Kampung Boy.", "translation_ms": "Beliau melukis kartun Kampung Boy.", "translation_zh": "他创作了甘榜男孩漫画。", "translation_en": "He drew the Kampung Boy cartoon.", "voice_guide": "Sebut dengan saya: Beliau melukis kartun Kampung Boy."}, {"text": "Karya beliau terkenal di luar negara.", "translation_ms": "Karya beliau terkenal di luar negara.", "translation_zh": "他的作品在国外也很有名。", "translation_en": "His work is famous overseas.", "voice_guide": "Sebut dengan saya: Karya beliau terkenal di luar negara."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Kata Lokasi (Matching)
  v_equipment_id := 'e1010001-0001-0001-0016-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Lokasi',
    '地点词',
    'Location Words',
    'Padankan kata lokasi dengan maksud',
    '将地点词与含义配对',
    'Match location words with meaning',
    '{"type": "matching", "data": {"pairs": [{"word": "Perak", "meaning_ms": "Perak", "meaning_zh": "霹雳州", "meaning_en": "Perak", "image": "/images/vocab/perak.png"}, {"word": "luar negara", "meaning_ms": "luar negara", "meaning_zh": "国外", "meaning_en": "overseas", "image": "/images/vocab/luar_negara.png"}, {"word": "kampung", "meaning_ms": "kampung", "meaning_zh": "村庄", "meaning_en": "village", "image": "/images/vocab/kampung.png"}, {"word": "bandar", "meaning_ms": "bandar", "meaning_zh": "城市", "meaning_en": "city", "image": "/images/vocab/bandar.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- TEMA 7: NEGARAKU (My Country)
-- =====================

-- =====================
-- UNIT 17: BENDERA MALAYSIA (Malaysian Flag)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_7_unit_17',
    'Bendera Malaysia',
    '马来西亚国旗',
    'Malaysian Flag',
    'Belajar tentang bendera dan simbol negara',
    '学习国旗和国家标志',
    'Learn about the flag and national symbols',
    17,
    'primary_1',
    'moss_knight'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Jalur Gemilang (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0017-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Jalur Gemilang',
    '辉煌条纹',
    'Stripes of Glory',
    'Dengar dan sebut perkataan bendera',
    '听并说出国旗相关单词',
    'Listen and say flag words',
    '{"type": "syllable", "data": {"words": [{"word": "Jalur Gemilang", "syllables": ["Ja", "lur", "Ge", "mi", "lang"], "meaning_ms": "Jalur Gemilang", "meaning_zh": "辉煌条纹", "meaning_en": "Stripes of Glory", "image": "/images/vocab/jalur_gemilang.png"}, {"word": "bendera", "syllables": ["ben", "de", "ra"], "meaning_ms": "bendera", "meaning_zh": "国旗", "meaning_en": "flag", "image": "/images/vocab/bendera.png"}, {"word": "bintang", "syllables": ["bin", "tang"], "meaning_ms": "bintang", "meaning_zh": "星星", "meaning_en": "star", "image": "/images/vocab/bintang.png"}, {"word": "bulan", "syllables": ["bu", "lan"], "meaning_ms": "bulan", "meaning_zh": "月亮", "meaning_en": "moon", "image": "/images/vocab/bulan_sabit.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Simbol Negara (Matching)
  v_equipment_id := 'e1010001-0001-0001-0017-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Simbol Negara',
    '国家标志',
    'National Symbols',
    'Padankan simbol negara dengan gambar',
    '将国家标志与图片配对',
    'Match national symbols with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "Jalur Gemilang", "meaning_ms": "Jalur Gemilang", "meaning_zh": "国旗", "meaning_en": "national flag", "image": "/images/vocab/jalur_gemilang.png"}, {"word": "jata negara", "meaning_ms": "jata negara", "meaning_zh": "国徽", "meaning_en": "national emblem", "image": "/images/vocab/jata_negara.png"}, {"word": "bunga raya", "meaning_ms": "bunga raya", "meaning_zh": "国花", "meaning_en": "hibiscus", "image": "/images/vocab/bunga_raya.png"}, {"word": "harimau", "meaning_ms": "harimau", "meaning_zh": "老虎", "meaning_en": "tiger", "image": "/images/vocab/harimau.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Tentang Bendera (Writing)
  v_equipment_id := 'e1010001-0001-0001-0017-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tentang Bendera',
    '关于国旗',
    'About the Flag',
    'Tulis tentang Jalur Gemilang',
    '写关于辉煌条纹的内容',
    'Write about Jalur Gemilang',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Bendera Malaysia dipanggil Jalur Gemilang.", "meaning_ms": "Bendera Malaysia dipanggil Jalur Gemilang.", "meaning_zh": "马来西亚国旗叫辉煌条纹。", "meaning_en": "Malaysian flag is called Jalur Gemilang."}, {"word": "Ada 14 jalur merah dan putih.", "meaning_ms": "Ada 14 jalur merah dan putih.", "meaning_zh": "有14条红白条纹。", "meaning_en": "There are 14 red and white stripes."}, {"word": "Bintang mempunyai 14 bucu.", "meaning_ms": "Bintang mempunyai 14 bucu.", "meaning_zh": "星星有14个角。", "meaning_en": "The star has 14 points."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Dialog Bendera (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0017-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Dialog Bendera',
    '国旗对话',
    'Flag Dialogue',
    'Sebut dialog tentang bendera',
    '说出关于国旗的对话',
    'Say dialogue about the flag',
    '{"type": "speaking", "data": {"phrases": [{"text": "Apakah nama bendera kita?", "translation_ms": "Apakah nama bendera kita?", "translation_zh": "我们国旗叫什么名字？", "translation_en": "What is our flag called?", "voice_guide": "Sebut dengan saya: Apakah nama bendera kita?"}, {"text": "Bendera kita dipanggil Jalur Gemilang.", "translation_ms": "Bendera kita dipanggil Jalur Gemilang.", "translation_zh": "我们的国旗叫辉煌条纹。", "translation_en": "Our flag is called Jalur Gemilang.", "voice_guide": "Sebut dengan saya: Bendera kita dipanggil Jalur Gemilang."}, {"text": "Saya sayang negara saya.", "translation_ms": "Saya sayang negara saya.", "translation_zh": "我爱我的国家。", "translation_en": "I love my country.", "voice_guide": "Sebut dengan saya: Saya sayang negara saya."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Kata Tanya Mengapa (Matching)
  v_equipment_id := 'e1010001-0001-0001-0017-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Tanya',
    '疑问词',
    'Question Words',
    'Padankan kata tanya dengan jawapan',
    '将疑问词与答案配对',
    'Match question words with answers',
    '{"type": "matching", "data": {"pairs": [{"word": "Mengapakah", "meaning_ms": "Mengapakah", "meaning_zh": "为什么", "meaning_en": "Why", "image": "/images/vocab/mengapakah.png"}, {"word": "Bagaimanakah", "meaning_ms": "Bagaimanakah", "meaning_zh": "怎么样", "meaning_en": "How", "image": "/images/vocab/bagaimanakah.png"}, {"word": "Apakah", "meaning_ms": "Apakah", "meaning_zh": "什么", "meaning_en": "What", "image": "/images/vocab/apakah.png"}, {"word": "Siapakah", "meaning_ms": "Siapakah", "meaning_zh": "谁", "meaning_en": "Who", "image": "/images/vocab/siapakah.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 18: NEGARAKU ISTIMEWA (My Special Country)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_7_unit_18',
    'Negaraku Istimewa',
    '我特别的国家',
    'My Special Country',
    'Belajar tentang keistimewaan Malaysia',
    '学习马来西亚的特色',
    'Learn about Malaysia''s specialties',
    18,
    'primary_1',
    'forest_spirit'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Tempat Terkenal (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0018-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Tempat Terkenal',
    '著名地点',
    'Famous Places',
    'Dengar dan sebut nama tempat terkenal',
    '听并说出著名地点名称',
    'Listen and say famous place names',
    '{"type": "syllable", "data": {"words": [{"word": "Gunung Kinabalu", "syllables": ["Gu", "nung", "Ki", "na", "ba", "lu"], "meaning_ms": "Gunung Kinabalu", "meaning_zh": "神山", "meaning_en": "Mount Kinabalu", "image": "/images/vocab/gunung_kinabalu.png"}, {"word": "Sabah", "syllables": ["Sa", "bah"], "meaning_ms": "Sabah", "meaning_zh": "沙巴", "meaning_en": "Sabah", "image": "/images/vocab/sabah.png"}, {"word": "Sarawak", "syllables": ["Sa", "ra", "wak"], "meaning_ms": "Sarawak", "meaning_zh": "砂拉越", "meaning_en": "Sarawak", "image": "/images/vocab/sarawak.png"}, {"word": "Pulau Langkawi", "syllables": ["Pu", "lau", "Lang", "ka", "wi"], "meaning_ms": "Pulau Langkawi", "meaning_zh": "兰卡威岛", "meaning_en": "Langkawi Island", "image": "/images/vocab/langkawi.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Tempat dan Ciri (Matching)
  v_equipment_id := 'e1010001-0001-0001-0018-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Tempat dan Ciri',
    '地点和特点',
    'Places and Features',
    'Padankan tempat dengan ciri',
    '将地点与特点配对',
    'Match places with features',
    '{"type": "matching", "data": {"pairs": [{"word": "Gunung Kinabalu", "meaning_ms": "Gunung Kinabalu", "meaning_zh": "神山", "meaning_en": "Mount Kinabalu", "image": "/images/vocab/gunung_kinabalu.png"}, {"word": "Menara Berkembar", "meaning_ms": "Menara Berkembar", "meaning_zh": "双子塔", "meaning_en": "Twin Towers", "image": "/images/vocab/menara_berkembar.png"}, {"word": "Gua Batu", "meaning_ms": "Gua Batu", "meaning_zh": "黑风洞", "meaning_en": "Batu Caves", "image": "/images/vocab/batu_caves.png"}, {"word": "Taman Negara", "meaning_ms": "Taman Negara", "meaning_zh": "国家公园", "meaning_en": "National Park", "image": "/images/vocab/taman_negara.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Tentang Malaysia (Writing)
  v_equipment_id := 'e1010001-0001-0001-0018-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tentang Malaysia',
    '关于马来西亚',
    'About Malaysia',
    'Tulis tentang keistimewaan Malaysia',
    '写关于马来西亚特色的内容',
    'Write about Malaysia''s specialties',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Gunung Kinabalu sangat tinggi.", "meaning_ms": "Gunung Kinabalu sangat tinggi.", "meaning_zh": "神山非常高。", "meaning_en": "Mount Kinabalu is very tall."}, {"word": "Malaysia mempunyai banyak pulau.", "meaning_ms": "Malaysia mempunyai banyak pulau.", "meaning_zh": "马来西亚有很多岛屿。", "meaning_en": "Malaysia has many islands."}, {"word": "Negara kita indah dan aman.", "meaning_ms": "Negara kita indah dan aman.", "meaning_zh": "我们的国家美丽而和平。", "meaning_en": "Our country is beautiful and peaceful."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Maklumat Malaysia (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0018-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Maklumat Malaysia',
    '马来西亚信息',
    'Malaysia Information',
    'Sebut maklumat tentang Malaysia',
    '说出关于马来西亚的信息',
    'Say information about Malaysia',
    '{"type": "speaking", "data": {"phrases": [{"text": "Gunung Kinabalu terletak di Sabah.", "translation_ms": "Gunung Kinabalu terletak di Sabah.", "translation_zh": "神山位于沙巴。", "translation_en": "Mount Kinabalu is located in Sabah.", "voice_guide": "Sebut dengan saya: Gunung Kinabalu terletak di Sabah."}, {"text": "Ia adalah gunung tertinggi di Malaysia.", "translation_ms": "Ia adalah gunung tertinggi di Malaysia.", "translation_zh": "它是马来西亚最高的山。", "translation_en": "It is the tallest mountain in Malaysia.", "voice_guide": "Sebut dengan saya: Ia adalah gunung tertinggi di Malaysia."}, {"text": "Pemandangannya sangat indah.", "translation_ms": "Pemandangannya sangat indah.", "translation_zh": "风景非常美丽。", "translation_en": "The scenery is very beautiful.", "voice_guide": "Sebut dengan saya: Pemandangannya sangat indah."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Kata Adjektif (Matching)
  v_equipment_id := 'e1010001-0001-0001-0018-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Adjektif',
    '形容词',
    'Adjectives',
    'Padankan kata adjektif dengan maksud',
    '将形容词与含义配对',
    'Match adjectives with meaning',
    '{"type": "matching", "data": {"pairs": [{"word": "indah", "meaning_ms": "indah", "meaning_zh": "美丽的", "meaning_en": "beautiful", "image": "/images/vocab/indah.png"}, {"word": "tinggi", "meaning_ms": "tinggi", "meaning_zh": "高的", "meaning_en": "tall", "image": "/images/vocab/tinggi.png"}, {"word": "luas", "meaning_ms": "luas", "meaning_zh": "宽阔的", "meaning_en": "wide", "image": "/images/vocab/luas.png"}, {"word": "aman", "meaning_ms": "aman", "meaning_zh": "和平的", "meaning_en": "peaceful", "image": "/images/vocab/aman.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- TEMA 8: ALAM SEKITAR (Environment)
-- =====================

-- =====================
-- UNIT 19: MESRA PLASTIK (Plastic Friendly)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_8_unit_19',
    'Mesra Plastik',
    '环保塑料',
    'Plastic Friendly',
    'Belajar tentang kitar semula plastik',
    '学习塑料回收',
    'Learn about plastic recycling',
    19,
    'primary_1',
    'spider'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perkataan Kitar Semula (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0019-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perkataan Kitar Semula',
    '回收词汇',
    'Recycling Words',
    'Dengar dan sebut perkataan kitar semula',
    '听并说出回收相关单词',
    'Listen and say recycling words',
    '{"type": "syllable", "data": {"words": [{"word": "kitar semula", "syllables": ["ki", "tar", "se", "mu", "la"], "meaning_ms": "kitar semula", "meaning_zh": "回收", "meaning_en": "recycle", "image": "/images/vocab/kitar_semula.png"}, {"word": "plastik", "syllables": ["plas", "tik"], "meaning_ms": "plastik", "meaning_zh": "塑料", "meaning_en": "plastic", "image": "/images/vocab/plastik.png"}, {"word": "botol", "syllables": ["bo", "tol"], "meaning_ms": "botol", "meaning_zh": "瓶子", "meaning_en": "bottle", "image": "/images/vocab/botol.png"}, {"word": "jimat", "syllables": ["ji", "mat"], "meaning_ms": "jimat", "meaning_zh": "节省", "meaning_en": "save", "image": "/images/vocab/jimat.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Langkah Kitar Semula (Sequencing)
  v_equipment_id := 'e1010001-0001-0001-0019-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'sequencing',
    'Langkah Membuat Pasu',
    '制作花瓶的步骤',
    'Steps to Make a Vase',
    'Susun langkah membuat pasu dari botol plastik',
    '排列用塑料瓶制作花瓶的步骤',
    'Arrange steps to make a vase from plastic bottle',
    '{"type": "sequencing", "data": {"title": "Membuat Pasu dari Botol Plastik", "instruction": {"ms": "Susun langkah mengikut turutan yang betul", "zh": "按正确顺序排列步骤", "en": "Arrange steps in the correct order"}, "steps": [{"order": 1, "text_ms": "Sediakan botol plastik kosong", "text_zh": "准备一个空塑料瓶", "text_en": "Prepare an empty plastic bottle", "image": "/images/vocab/botol_kosong.png"}, {"order": 2, "text_ms": "Potong bahagian atas botol", "text_zh": "剪掉瓶子上部", "text_en": "Cut the top of the bottle", "image": "/images/vocab/potong_botol.png"}, {"order": 3, "text_ms": "Hiaskan botol dengan cat", "text_zh": "用颜料装饰瓶子", "text_en": "Decorate the bottle with paint", "image": "/images/vocab/hias_botol.png"}, {"order": 4, "text_ms": "Masukkan tanah ke dalam botol", "text_zh": "将土放入瓶中", "text_en": "Put soil into the bottle", "image": "/images/vocab/masuk_tanah.png"}, {"order": 5, "text_ms": "Tanam pokok bunga", "text_zh": "种植花卉", "text_en": "Plant the flower", "image": "/images/vocab/tanam_bunga.png"}], "context_image": "/images/activities/pasu_botol.png"}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Arahan (Writing)
  v_equipment_id := 'e1010001-0001-0001-0019-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Tulis Arahan',
    '写指示',
    'Write Instructions',
    'Tulis arahan kitar semula',
    '写回收指示',
    'Write recycling instructions',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Potong botol plastik.", "meaning_ms": "Potong botol plastik.", "meaning_zh": "剪塑料瓶。", "meaning_en": "Cut the plastic bottle."}, {"word": "Masukkan tanah.", "meaning_ms": "Masukkan tanah.", "meaning_zh": "放入土壤。", "meaning_en": "Put in the soil."}, {"word": "Tanam pokok.", "meaning_ms": "Tanam pokok.", "meaning_zh": "种植物。", "meaning_en": "Plant the plant."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Ayat Alam Sekitar (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0019-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Ayat Alam Sekitar',
    '环境句子',
    'Environment Sentences',
    'Sebut ayat tentang alam sekitar',
    '说出关于环境的句子',
    'Say sentences about environment',
    '{"type": "speaking", "data": {"phrases": [{"text": "Saya kitar semula botol plastik.", "translation_ms": "Saya kitar semula botol plastik.", "translation_zh": "我回收塑料瓶。", "translation_en": "I recycle plastic bottles.", "voice_guide": "Sebut dengan saya: Saya kitar semula botol plastik."}, {"text": "Jaga kebersihan alam sekitar.", "translation_ms": "Jaga kebersihan alam sekitar.", "translation_zh": "保护环境清洁。", "translation_en": "Keep the environment clean.", "voice_guide": "Sebut dengan saya: Jaga kebersihan alam sekitar."}, {"text": "Kitar semula menjimatkan sumber.", "translation_ms": "Kitar semula menjimatkan sumber.", "translation_zh": "回收节省资源。", "translation_en": "Recycling saves resources.", "voice_guide": "Sebut dengan saya: Kitar semula menjimatkan sumber."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Kata Kerja Arahan (Matching)
  v_equipment_id := 'e1010001-0001-0001-0019-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kata Kerja Arahan',
    '动词指示',
    'Action Verbs',
    'Padankan kata kerja dengan gambar',
    '将动词与图片配对',
    'Match verbs with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "potong", "meaning_ms": "potong", "meaning_zh": "剪/切", "meaning_en": "cut", "image": "/images/vocab/potong.png"}, {"word": "masukkan", "meaning_ms": "masukkan", "meaning_zh": "放入", "meaning_en": "put in", "image": "/images/vocab/masukkan.png"}, {"word": "buang", "meaning_ms": "buang", "meaning_zh": "丢弃", "meaning_en": "throw away", "image": "/images/vocab/buang.png"}, {"word": "kumpul", "meaning_ms": "kumpul", "meaning_zh": "收集", "meaning_en": "collect", "image": "/images/vocab/kumpul.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 20: HEMAT DAN MUDAH (Save and Simple)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_8_unit_20',
    'Hemat dan Mudah',
    '节约又简单',
    'Save and Simple',
    'Belajar tentang menjimat dan guna semula',
    '学习节约和重复使用',
    'Learn about saving and reusing',
    20,
    'primary_1',
    'jelly_blob'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perkataan Jimat (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0020-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perkataan Jimat',
    '节约词汇',
    'Saving Words',
    'Dengar dan sebut perkataan jimat',
    '听并说出节约相关单词',
    'Listen and say saving words',
    '{"type": "syllable", "data": {"words": [{"word": "jimat", "syllables": ["ji", "mat"], "meaning_ms": "jimat", "meaning_zh": "节约", "meaning_en": "save", "image": "/images/vocab/jimat.png"}, {"word": "guna semula", "syllables": ["gu", "na", "se", "mu", "la"], "meaning_ms": "guna semula", "meaning_zh": "重复使用", "meaning_en": "reuse", "image": "/images/vocab/guna_semula.png"}, {"word": "hemat", "syllables": ["he", "mat"], "meaning_ms": "hemat", "meaning_zh": "节俭", "meaning_en": "thrifty", "image": "/images/vocab/hemat.png"}, {"word": "tenaga", "syllables": ["te", "na", "ga"], "meaning_ms": "tenaga", "meaning_zh": "能源", "meaning_en": "energy", "image": "/images/vocab/tenaga.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Bahan Kitar Semula (Matching)
  v_equipment_id := 'e1010001-0001-0001-0020-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Bahan Kitar Semula',
    '可回收材料',
    'Recyclable Materials',
    'Padankan bahan kitar semula dengan gambar',
    '将可回收材料与图片配对',
    'Match recyclable materials with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "kertas", "meaning_ms": "kertas", "meaning_zh": "纸", "meaning_en": "paper", "image": "/images/vocab/kertas.png"}, {"word": "kaca", "meaning_ms": "kaca", "meaning_zh": "玻璃", "meaning_en": "glass", "image": "/images/vocab/kaca.png"}, {"word": "logam", "meaning_ms": "logam", "meaning_zh": "金属", "meaning_en": "metal", "image": "/images/vocab/logam.png"}, {"word": "plastik", "meaning_ms": "plastik", "meaning_zh": "塑料", "meaning_en": "plastic", "image": "/images/vocab/plastik.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Cara Jimat (Writing)
  v_equipment_id := 'e1010001-0001-0001-0020-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Cara Jimat',
    '节约方法',
    'Ways to Save',
    'Tulis cara menjimat',
    '写节约的方法',
    'Write ways to save',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Tutup lampu bila tidak guna.", "meaning_ms": "Tutup lampu bila tidak guna.", "meaning_zh": "不用时关灯。", "meaning_en": "Turn off lights when not in use."}, {"word": "Tutup paip air.", "meaning_ms": "Tutup paip air.", "meaning_zh": "关水龙头。", "meaning_en": "Turn off the tap."}, {"word": "Guna kertas dua muka.", "meaning_ms": "Guna kertas dua muka.", "meaning_zh": "用纸的两面。", "meaning_en": "Use both sides of paper."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Ayat Jimat (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0020-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Ayat Jimat',
    '节约句子',
    'Saving Sentences',
    'Sebut ayat tentang menjimat',
    '说出关于节约的句子',
    'Say sentences about saving',
    '{"type": "speaking", "data": {"phrases": [{"text": "Saya jimat air setiap hari.", "translation_ms": "Saya jimat air setiap hari.", "translation_zh": "我每天节约用水。", "translation_en": "I save water every day.", "voice_guide": "Sebut dengan saya: Saya jimat air setiap hari."}, {"text": "Tutup lampu bila keluar bilik.", "translation_ms": "Tutup lampu bila keluar bilik.", "translation_zh": "离开房间时关灯。", "translation_en": "Turn off lights when leaving the room.", "voice_guide": "Sebut dengan saya: Tutup lampu bila keluar bilik."}, {"text": "Guna beg yang boleh diguna semula.", "translation_ms": "Guna beg yang boleh diguna semula.", "translation_zh": "使用可重复使用的袋子。", "translation_en": "Use reusable bags.", "voice_guide": "Sebut dengan saya: Guna beg yang boleh diguna semula."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Ejaan Alam Sekitar (Dictation)
  v_equipment_id := 'e1010001-0001-0001-0020-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan Alam Sekitar',
    '环境听写',
    'Environment Dictation',
    'Dengar dan tulis perkataan alam sekitar',
    '听并写出环境相关单词',
    'Listen and write environment words',
    '{"type": "dictation", "data": {"words": [{"word": "jimat", "meaning_ms": "jimat", "meaning_zh": "节约", "meaning_en": "save"}, {"word": "air", "meaning_ms": "air", "meaning_zh": "水", "meaning_en": "water"}, {"word": "kertas", "meaning_ms": "kertas", "meaning_zh": "纸", "meaning_en": "paper"}, {"word": "bersih", "meaning_ms": "bersih", "meaning_zh": "干净", "meaning_en": "clean"}]}}'::jsonb,
    20,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 21: JAGA ALAM KITA (Protect Our Environment)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_8_unit_21',
    'Jaga Alam Kita',
    '保护我们的环境',
    'Protect Our Environment',
    'Belajar tentang menjaga alam sekitar',
    '学习保护环境',
    'Learn about protecting the environment',
    21,
    'primary_1',
    'stone_guardian'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perkataan Alam (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0021-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perkataan Alam',
    '自然词汇',
    'Nature Words',
    'Dengar dan sebut perkataan alam',
    '听并说出自然相关单词',
    'Listen and say nature words',
    '{"type": "syllable", "data": {"words": [{"word": "alam sekitar", "syllables": ["a", "lam", "se", "ki", "tar"], "meaning_ms": "alam sekitar", "meaning_zh": "环境", "meaning_en": "environment", "image": "/images/vocab/alam_sekitar.png"}, {"word": "pencemaran", "syllables": ["pen", "ce", "ma", "ran"], "meaning_ms": "pencemaran", "meaning_zh": "污染", "meaning_en": "pollution", "image": "/images/vocab/pencemaran.png"}, {"word": "sampah", "syllables": ["sam", "pah"], "meaning_ms": "sampah", "meaning_zh": "垃圾", "meaning_en": "rubbish", "image": "/images/vocab/sampah.png"}, {"word": "bersih", "syllables": ["ber", "sih"], "meaning_ms": "bersih", "meaning_zh": "干净", "meaning_en": "clean", "image": "/images/vocab/bersih.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Kategori Sampah (Matching)
  v_equipment_id := 'e1010001-0001-0001-0021-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Kategori Sampah',
    '垃圾分类',
    'Waste Categories',
    'Padankan jenis sampah dengan tong',
    '将垃圾类型与垃圾桶配对',
    'Match waste types with bins',
    '{"type": "matching", "data": {"pairs": [{"word": "tong biru (kertas)", "meaning_ms": "tong biru (kertas)", "meaning_zh": "蓝色桶（纸）", "meaning_en": "blue bin (paper)", "image": "/images/vocab/tong_biru.png"}, {"word": "tong coklat (kaca)", "meaning_ms": "tong coklat (kaca)", "meaning_zh": "棕色桶（玻璃）", "meaning_en": "brown bin (glass)", "image": "/images/vocab/tong_coklat.png"}, {"word": "tong oren (plastik)", "meaning_ms": "tong oren (plastik)", "meaning_zh": "橙色桶（塑料）", "meaning_en": "orange bin (plastic)", "image": "/images/vocab/tong_oren.png"}, {"word": "tong hijau (organik)", "meaning_ms": "tong hijau (organik)", "meaning_zh": "绿色桶（有机）", "meaning_en": "green bin (organic)", "image": "/images/vocab/tong_hijau.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Tulis Mesej Alam (Writing)
  v_equipment_id := 'e1010001-0001-0001-0021-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Mesej Alam Sekitar',
    '环保信息',
    'Environmental Message',
    'Tulis mesej alam sekitar',
    '写环保信息',
    'Write environmental message',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Jangan buang sampah merata-rata.", "meaning_ms": "Jangan buang sampah merata-rata.", "meaning_zh": "不要乱扔垃圾。", "meaning_en": "Don''t litter everywhere."}, {"word": "Asingkan sampah mengikut jenis.", "meaning_ms": "Asingkan sampah mengikut jenis.", "meaning_zh": "按类型分类垃圾。", "meaning_en": "Separate waste by type."}, {"word": "Jaga kebersihan alam kita.", "meaning_ms": "Jaga kebersihan alam kita.", "meaning_zh": "保持我们环境的清洁。", "meaning_en": "Keep our environment clean."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Pesan Jaga Alam (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0021-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Pesan Jaga Alam',
    '环保信息',
    'Conservation Message',
    'Sebut pesan menjaga alam',
    '说出保护环境的信息',
    'Say conservation messages',
    '{"type": "speaking", "data": {"phrases": [{"text": "Mari kita jaga alam sekitar.", "translation_ms": "Mari kita jaga alam sekitar.", "translation_zh": "让我们保护环境。", "translation_en": "Let''s protect the environment.", "voice_guide": "Sebut dengan saya: Mari kita jaga alam sekitar."}, {"text": "Buang sampah ke dalam tong.", "translation_ms": "Buang sampah ke dalam tong.", "translation_zh": "把垃圾扔进垃圾桶。", "translation_en": "Throw rubbish into the bin.", "voice_guide": "Sebut dengan saya: Buang sampah ke dalam tong."}, {"text": "Alam yang bersih membuat kita sihat.", "translation_ms": "Alam yang bersih membuat kita sihat.", "translation_zh": "干净的环境让我们健康。", "translation_en": "A clean environment makes us healthy.", "voice_guide": "Sebut dengan saya: Alam yang bersih membuat kita sihat."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Jenis Bahan (Matching)
  v_equipment_id := 'e1010001-0001-0001-0021-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Jenis Bahan',
    '材料类型',
    'Material Types',
    'Padankan jenis bahan dengan gambar',
    '将材料类型与图片配对',
    'Match material types with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "organik", "meaning_ms": "organik", "meaning_zh": "有机物", "meaning_en": "organic", "image": "/images/vocab/organik.png"}, {"word": "bukan organik", "meaning_ms": "bukan organik", "meaning_zh": "非有机物", "meaning_en": "non-organic", "image": "/images/vocab/bukan_organik.png"}, {"word": "berbahaya", "meaning_ms": "berbahaya", "meaning_zh": "有害物", "meaning_en": "hazardous", "image": "/images/vocab/berbahaya.png"}, {"word": "boleh dikitar semula", "meaning_ms": "boleh dikitar semula", "meaning_zh": "可回收", "meaning_en": "recyclable", "image": "/images/vocab/boleh_kitar.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- TEMA 9: SENI KREATIF (Creative Arts)
-- =====================

-- =====================
-- UNIT 22: KOLAJ CIPTAAN SAYA (My Collage Creation)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_9_unit_22',
    'Kolaj Ciptaan Saya',
    '我的拼贴创作',
    'My Collage Creation',
    'Belajar tentang seni kolaj',
    '学习拼贴艺术',
    'Learn about collage art',
    22,
    'primary_1',
    'frost_sprite'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perkataan Kolaj (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0022-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perkataan Kolaj',
    '拼贴词汇',
    'Collage Words',
    'Dengar dan sebut perkataan kolaj',
    '听并说出拼贴相关单词',
    'Listen and say collage words',
    '{"type": "syllable", "data": {"words": [{"word": "kolaj", "syllables": ["ko", "laj"], "meaning_ms": "kolaj", "meaning_zh": "拼贴画", "meaning_en": "collage", "image": "/images/vocab/kolaj.png"}, {"word": "gam", "syllables": ["gam"], "meaning_ms": "gam", "meaning_zh": "胶水", "meaning_en": "glue", "image": "/images/vocab/gam.png"}, {"word": "gunting", "syllables": ["gun", "ting"], "meaning_ms": "gunting", "meaning_zh": "剪刀", "meaning_en": "scissors", "image": "/images/vocab/gunting.png"}, {"word": "kertas warna", "syllables": ["ker", "tas", "war", "na"], "meaning_ms": "kertas warna", "meaning_zh": "彩纸", "meaning_en": "colored paper", "image": "/images/vocab/kertas_warna.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Bahan Kolaj (Matching)
  v_equipment_id := 'e1010001-0001-0001-0022-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Bahan Kolaj',
    '拼贴材料',
    'Collage Materials',
    'Padankan bahan kolaj dengan gambar',
    '将拼贴材料与图片配对',
    'Match collage materials with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "majalah", "meaning_ms": "majalah", "meaning_zh": "杂志", "meaning_en": "magazine", "image": "/images/vocab/majalah.png"}, {"word": "surat khabar", "meaning_ms": "surat khabar", "meaning_zh": "报纸", "meaning_en": "newspaper", "image": "/images/vocab/surat_khabar.png"}, {"word": "daun kering", "meaning_ms": "daun kering", "meaning_zh": "干叶子", "meaning_en": "dry leaves", "image": "/images/vocab/daun_kering.png"}, {"word": "butang", "meaning_ms": "butang", "meaning_zh": "纽扣", "meaning_en": "buttons", "image": "/images/vocab/butang.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Deskripsi Kolaj (Writing)
  v_equipment_id := 'e1010001-0001-0001-0022-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Deskripsi Kolaj',
    '拼贴描述',
    'Collage Description',
    'Tulis deskripsi kolaj anda',
    '写你的拼贴画描述',
    'Write description of your collage',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Kolaj saya berwarna-warni.", "meaning_ms": "Kolaj saya berwarna-warni.", "meaning_zh": "我的拼贴画色彩缤纷。", "meaning_en": "My collage is colorful."}, {"word": "Saya guna kertas dan daun.", "meaning_ms": "Saya guna kertas dan daun.", "meaning_zh": "我用纸和叶子。", "meaning_en": "I use paper and leaves."}, {"word": "Kolaj ini menunjukkan rumah.", "meaning_ms": "Kolaj ini menunjukkan rumah.", "meaning_zh": "这个拼贴画展示房子。", "meaning_en": "This collage shows a house."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Cerita Kolaj (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0022-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Cerita Kolaj',
    '拼贴故事',
    'Collage Story',
    'Ceritakan tentang kolaj anda',
    '讲述你的拼贴画',
    'Tell about your collage',
    '{"type": "speaking", "data": {"phrases": [{"text": "Ini kolaj ciptaan saya.", "translation_ms": "Ini kolaj ciptaan saya.", "translation_zh": "这是我创作的拼贴画。", "translation_en": "This is my collage creation.", "voice_guide": "Sebut dengan saya: Ini kolaj ciptaan saya."}, {"text": "Saya gunting kertas berwarna.", "translation_ms": "Saya gunting kertas berwarna.", "translation_zh": "我剪彩纸。", "translation_en": "I cut colored paper.", "voice_guide": "Sebut dengan saya: Saya gunting kertas berwarna."}, {"text": "Kemudian saya tampal dengan gam.", "translation_ms": "Kemudian saya tampal dengan gam.", "translation_zh": "然后我用胶水粘贴。", "translation_en": "Then I paste with glue.", "voice_guide": "Sebut dengan saya: Kemudian saya tampal dengan gam."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Warna dan Bentuk (Matching)
  v_equipment_id := 'e1010001-0001-0001-0022-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Warna dan Bentuk',
    '颜色和形状',
    'Colors and Shapes',
    'Padankan warna dan bentuk',
    '配对颜色和形状',
    'Match colors and shapes',
    '{"type": "matching", "data": {"pairs": [{"word": "bulat", "meaning_ms": "bulat", "meaning_zh": "圆形", "meaning_en": "circle", "image": "/images/vocab/bulat.png"}, {"word": "segi empat", "meaning_ms": "segi empat", "meaning_zh": "正方形", "meaning_en": "square", "image": "/images/vocab/segi_empat.png"}, {"word": "segi tiga", "meaning_ms": "segi tiga", "meaning_zh": "三角形", "meaning_en": "triangle", "image": "/images/vocab/segi_tiga.png"}, {"word": "bintang", "meaning_ms": "bintang", "meaning_zh": "星形", "meaning_en": "star", "image": "/images/vocab/bentuk_bintang.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 23: CORAK DAN WARNA (Patterns and Colors)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_9_unit_23',
    'Corak dan Warna',
    '图案和颜色',
    'Patterns and Colors',
    'Belajar tentang corak tradisional',
    '学习传统图案',
    'Learn about traditional patterns',
    23,
    'primary_1',
    'pixie'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perkataan Corak (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0023-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perkataan Corak',
    '图案词汇',
    'Pattern Words',
    'Dengar dan sebut perkataan corak',
    '听并说出图案相关单词',
    'Listen and say pattern words',
    '{"type": "syllable", "data": {"words": [{"word": "corak", "syllables": ["co", "rak"], "meaning_ms": "corak", "meaning_zh": "图案", "meaning_en": "pattern", "image": "/images/vocab/corak.png"}, {"word": "batik", "syllables": ["ba", "tik"], "meaning_ms": "batik", "meaning_zh": "蜡染", "meaning_en": "batik", "image": "/images/vocab/batik.png"}, {"word": "bunga", "syllables": ["bu", "nga"], "meaning_ms": "bunga", "meaning_zh": "花", "meaning_en": "flower", "image": "/images/vocab/bunga.png"}, {"word": "daun", "syllables": ["da", "un"], "meaning_ms": "daun", "meaning_zh": "叶子", "meaning_en": "leaf", "image": "/images/vocab/daun.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Corak Tradisional (Matching)
  v_equipment_id := 'e1010001-0001-0001-0023-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Corak Tradisional',
    '传统图案',
    'Traditional Patterns',
    'Padankan corak tradisional dengan gambar',
    '将传统图案与图片配对',
    'Match traditional patterns with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "corak batik", "meaning_ms": "corak batik", "meaning_zh": "蜡染图案", "meaning_en": "batik pattern", "image": "/images/vocab/corak_batik.png"}, {"word": "corak songket", "meaning_ms": "corak songket", "meaning_zh": "织锦图案", "meaning_en": "songket pattern", "image": "/images/vocab/corak_songket.png"}, {"word": "corak pucuk rebung", "meaning_ms": "corak pucuk rebung", "meaning_zh": "竹笋图案", "meaning_en": "bamboo shoot pattern", "image": "/images/vocab/pucuk_rebung.png"}, {"word": "corak bunga", "meaning_ms": "corak bunga", "meaning_zh": "花朵图案", "meaning_en": "flower pattern", "image": "/images/vocab/corak_bunga.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Deskripsi Corak (Writing)
  v_equipment_id := 'e1010001-0001-0001-0023-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Deskripsi Corak',
    '图案描述',
    'Pattern Description',
    'Tulis deskripsi corak',
    '写图案描述',
    'Write pattern description',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Corak batik ini cantik.", "meaning_ms": "Corak batik ini cantik.", "meaning_zh": "这个蜡染图案很美。", "meaning_en": "This batik pattern is beautiful."}, {"word": "Ada bunga dan daun.", "meaning_ms": "Ada bunga dan daun.", "meaning_zh": "有花和叶子。", "meaning_en": "There are flowers and leaves."}, {"word": "Warnanya merah dan biru.", "meaning_ms": "Warnanya merah dan biru.", "meaning_zh": "颜色是红色和蓝色。", "meaning_en": "The colors are red and blue."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Pantun Corak (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0023-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Pantun Corak',
    '图案诗歌',
    'Pattern Pantun',
    'Sebut pantun tentang corak',
    '朗诵关于图案的诗歌',
    'Recite pantun about patterns',
    '{"type": "speaking", "data": {"phrases": [{"text": "Bunga raya di tepi pagar,", "translation_ms": "Bunga raya di tepi pagar,", "translation_zh": "篱笆边的大红花，", "translation_en": "Hibiscus by the fence,", "voice_guide": "Sebut dengan saya: Bunga raya di tepi pagar."}, {"text": "Merah warnanya sungguh seri.", "translation_ms": "Merah warnanya sungguh seri.", "translation_zh": "红色真是美丽。", "translation_en": "Its red color is so bright.", "voice_guide": "Sebut dengan saya: Merah warnanya sungguh seri."}, {"text": "Corak batik warisan lama,", "translation_ms": "Corak batik warisan lama,", "translation_zh": "蜡染图案是古老遗产，", "translation_en": "Batik patterns are old heritage,", "voice_guide": "Sebut dengan saya: Corak batik warisan lama."}, {"text": "Cantik dipandang setiap hari.", "translation_ms": "Cantik dipandang setiap hari.", "translation_zh": "每天看都很美丽。", "translation_en": "Beautiful to see every day.", "voice_guide": "Sebut dengan saya: Cantik dipandang setiap hari."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Pakaian Tradisional (Matching)
  v_equipment_id := 'e1010001-0001-0001-0023-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Pakaian Tradisional',
    '传统服饰',
    'Traditional Clothing',
    'Padankan pakaian tradisional dengan gambar',
    '将传统服饰与图片配对',
    'Match traditional clothing with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "kebaya", "meaning_ms": "kebaya", "meaning_zh": "可峇雅", "meaning_en": "kebaya", "image": "/images/vocab/kebaya.png"}, {"word": "baju kurung", "meaning_ms": "baju kurung", "meaning_zh": "马来传统服", "meaning_en": "baju kurung", "image": "/images/vocab/baju_kurung.png"}, {"word": "tudung saji", "meaning_ms": "tudung saji", "meaning_zh": "食物罩", "meaning_en": "food cover", "image": "/images/vocab/tudung_saji.png"}, {"word": "kain sarung", "meaning_ms": "kain sarung", "meaning_zh": "纱笼", "meaning_en": "sarong", "image": "/images/vocab/kain_sarung.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- UNIT 24: AYU TUNGGAL - BATIK (Batik Beauty)
-- =====================

DO $$
DECLARE
  v_subject_id UUID;
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE code = 'bm';

  INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, description_ms, description_zh, description_en, order_index, required_grade, pet_reward)
  VALUES (
    v_subject_id,
    'tema_9_unit_24',
    'Ayu Tunggal - Batik',
    '独特之美 - 蜡染',
    'Unique Beauty - Batik',
    'Belajar tentang batik Malaysia',
    '学习马来西亚蜡染',
    'Learn about Malaysian batik',
    24,
    'primary_1',
    'shadow_drake'
  )
  RETURNING id INTO v_theme_id;

  -- Activity 1: Perkataan Batik (Syllable)
  v_equipment_id := 'e1010001-0001-0001-0024-000000000001'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'syllable',
    'Perkataan Batik',
    '蜡染词汇',
    'Batik Words',
    'Dengar dan sebut perkataan batik',
    '听并说出蜡染相关单词',
    'Listen and say batik words',
    '{"type": "syllable", "data": {"words": [{"word": "batik", "syllables": ["ba", "tik"], "meaning_ms": "batik", "meaning_zh": "蜡染", "meaning_en": "batik", "image": "/images/vocab/batik.png"}, {"word": "lilin", "syllables": ["li", "lin"], "meaning_ms": "lilin", "meaning_zh": "蜡", "meaning_en": "wax", "image": "/images/vocab/lilin.png"}, {"word": "canting", "syllables": ["can", "ting"], "meaning_ms": "canting", "meaning_zh": "蜡笔", "meaning_en": "canting pen", "image": "/images/vocab/canting.png"}, {"word": "pewarna", "syllables": ["pe", "war", "na"], "meaning_ms": "pewarna", "meaning_zh": "染料", "meaning_en": "dye", "image": "/images/vocab/pewarna.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    1
  );

  -- Activity 2: Corak Batik (Matching)
  v_equipment_id := 'e1010001-0001-0001-0024-000000000002'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'matching',
    'Corak Batik',
    '蜡染图案',
    'Batik Patterns',
    'Padankan corak batik dengan gambar',
    '将蜡染图案与图片配对',
    'Match batik patterns with pictures',
    '{"type": "matching", "data": {"pairs": [{"word": "bercorak bunga", "meaning_ms": "bercorak bunga", "meaning_zh": "花朵图案", "meaning_en": "flower pattern", "image": "/images/vocab/batik_bunga.png"}, {"word": "bercorak daun", "meaning_ms": "bercorak daun", "meaning_zh": "叶子图案", "meaning_en": "leaf pattern", "image": "/images/vocab/batik_daun.png"}, {"word": "bercorak geometri", "meaning_ms": "bercorak geometri", "meaning_zh": "几何图案", "meaning_en": "geometric pattern", "image": "/images/vocab/batik_geometri.png"}, {"word": "bercorak haiwan", "meaning_ms": "bercorak haiwan", "meaning_zh": "动物图案", "meaning_en": "animal pattern", "image": "/images/vocab/batik_haiwan.png"}]}}'::jsonb,
    15,
    v_equipment_id,
    2
  );

  -- Activity 3: Deskripsi Batik (Writing)
  v_equipment_id := 'e1010001-0001-0001-0024-000000000003'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'writing',
    'Deskripsi Batik',
    '蜡染描述',
    'Batik Description',
    'Tulis deskripsi batik',
    '写蜡染描述',
    'Write batik description',
    '{"type": "writing", "data": {"characters": [], "trace_guides": false, "words": [{"word": "Batik ini bercorak bunga dan daun.", "meaning_ms": "Batik ini bercorak bunga dan daun.", "meaning_zh": "这块蜡染有花和叶子图案。", "meaning_en": "This batik has flower and leaf patterns."}, {"word": "Warnanya merah, biru, dan kuning.", "meaning_ms": "Warnanya merah, biru, dan kuning.", "meaning_zh": "颜色是红色、蓝色和黄色。", "meaning_en": "The colors are red, blue, and yellow."}, {"word": "Batik Malaysia sangat cantik.", "meaning_ms": "Batik Malaysia sangat cantik.", "meaning_zh": "马来西亚蜡染非常美丽。", "meaning_en": "Malaysian batik is very beautiful."}]}}'::jsonb,
    15,
    v_equipment_id,
    3
  );

  -- Activity 4: Penghargaan Batik (Speaking)
  v_equipment_id := 'e1010001-0001-0001-0024-000000000004'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'speaking',
    'Penghargaan Batik',
    '蜡染欣赏',
    'Batik Appreciation',
    'Sebut ayat penghargaan batik',
    '说出欣赏蜡染的句子',
    'Say batik appreciation sentences',
    '{"type": "speaking", "data": {"phrases": [{"text": "Batik Malaysia terkenal di seluruh dunia.", "translation_ms": "Batik Malaysia terkenal di seluruh dunia.", "translation_zh": "马来西亚蜡染闻名世界。", "translation_en": "Malaysian batik is famous worldwide.", "voice_guide": "Sebut dengan saya: Batik Malaysia terkenal di seluruh dunia."}, {"text": "Coraknya unik dan cantik.", "translation_ms": "Coraknya unik dan cantik.", "translation_zh": "图案独特又美丽。", "translation_en": "Its patterns are unique and beautiful.", "voice_guide": "Sebut dengan saya: Coraknya unik dan cantik."}, {"text": "Saya bangga dengan batik negara kita.", "translation_ms": "Saya bangga dengan batik negara kita.", "translation_zh": "我为我们国家的蜡染感到骄傲。", "translation_en": "I am proud of our country''s batik.", "voice_guide": "Sebut dengan saya: Saya bangga dengan batik negara kita."}], "use_kid_name": false}}'::jsonb,
    20,
    v_equipment_id,
    4
  );

  -- Activity 5: Ejaan Batik (Dictation)
  v_equipment_id := 'e1010001-0001-0001-0024-000000000005'::UUID;

  INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en, instructions_ms, instructions_zh, instructions_en, content, xp_reward, equipment_reward_id, order_index)
  VALUES (
    v_theme_id,
    'dictation',
    'Ejaan Batik',
    '蜡染听写',
    'Batik Dictation',
    'Dengar dan tulis perkataan batik',
    '听并写出蜡染相关单词',
    'Listen and write batik words',
    '{"type": "dictation", "data": {"words": [{"word": "batik", "meaning_ms": "batik", "meaning_zh": "蜡染", "meaning_en": "batik"}, {"word": "corak", "meaning_ms": "corak", "meaning_zh": "图案", "meaning_en": "pattern"}, {"word": "bunga", "meaning_ms": "bunga", "meaning_zh": "花", "meaning_en": "flower"}, {"word": "daun", "meaning_ms": "daun", "meaning_zh": "叶子", "meaning_en": "leaf"}, {"word": "cantik", "meaning_ms": "cantik", "meaning_zh": "美丽", "meaning_en": "beautiful"}]}}'::jsonb,
    20,
    v_equipment_id,
    5
  );

END $$;


-- =====================
-- Summary:
-- TEMA 4: KESELAMATAN (Units 10-12)
--   Unit 10: Berhati-hati Selalu - 5 activities + turtle pet
--   Unit 11: Selamat Sentiasa - 5 activities + bee pet
--   Unit 12: Jadikan Teladan - 5 activities + panda pet
-- TEMA 5: PERAYAAN (Units 13-14)
--   Unit 13: Meriahnya Perayaan - 5 activities + axolotl pet
--   Unit 14: Perayaan Kita - 5 activities + ocelot pet
-- TEMA 6: SENI (Units 15-16)
--   Unit 15: Wah, Cantiknya! - 5 activities + llama pet
--   Unit 16: Pameran Kartun Malaysia - 5 activities + bone_warrior pet
-- TEMA 7: NEGARAKU (Units 17-18)
--   Unit 17: Bendera Malaysia - 5 activities + moss_knight pet
--   Unit 18: Negaraku Istimewa - 5 activities + forest_spirit pet
-- TEMA 8: ALAM SEKITAR (Units 19-21)
--   Unit 19: Mesra Plastik - 5 activities + spider pet
--   Unit 20: Hemat dan Mudah - 5 activities + jelly_blob pet
--   Unit 21: Jaga Alam Kita - 5 activities + stone_guardian pet
-- TEMA 9: SENI KREATIF (Units 22-24)
--   Unit 22: Kolaj Ciptaan Saya - 5 activities + frost_sprite pet
--   Unit 23: Corak dan Warna - 5 activities + pixie pet
--   Unit 24: Ayu Tunggal - Batik - 5 activities + shadow_drake pet
-- Total: 75 new activities (15 units x 5 activities)
-- =====================
