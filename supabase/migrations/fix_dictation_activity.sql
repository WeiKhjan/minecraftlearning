-- Migration: Replace Singing Activity with Dictation Activity
-- This removes the "Nyanyikan Lagu Mari Belajar" singing activity
-- and updates the dictation activity to use its reward (Leather Leggings)

-- Step 1: Delete any existing dictation activities (to avoid duplicates)
DELETE FROM activities
WHERE type = 'dictation'
AND theme_id IN (SELECT id FROM themes WHERE code = 'tema_1');

-- Step 2: Delete the singing activity
DELETE FROM activities
WHERE type = 'singing'
AND theme_id IN (SELECT id FROM themes WHERE code = 'tema_1');

-- Step 3: Insert the new dictation activity with Leather Leggings reward at order_index 6
DO $$
DECLARE
  v_theme_id UUID;
  v_equipment_id UUID;
BEGIN
  -- Get theme 1 ID
  SELECT id INTO v_theme_id FROM themes WHERE code = 'tema_1';

  -- Get Leather Leggings equipment ID
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
    jsonb_build_object(
      'type', 'dictation',
      'data', jsonb_build_object(
        'words', jsonb_build_array(
          jsonb_build_object('word', 'ayam', 'meaning_ms', 'ayam', 'meaning_zh', '鸡', 'meaning_en', 'chicken'),
          jsonb_build_object('word', 'epal', 'meaning_ms', 'epal', 'meaning_zh', '苹果', 'meaning_en', 'apple'),
          jsonb_build_object('word', 'ikan', 'meaning_ms', 'ikan', 'meaning_zh', '鱼', 'meaning_en', 'fish'),
          jsonb_build_object('word', 'oren', 'meaning_ms', 'oren', 'meaning_zh', '橙子', 'meaning_en', 'orange'),
          jsonb_build_object('word', 'ular', 'meaning_ms', 'ular', 'meaning_zh', '蛇', 'meaning_en', 'snake')
        )
      )
    ),
    25,
    v_equipment_id,
    6
  );
END $$;

-- Step 4: Update order_index for activities that were after the singing activity
-- Speaking activity should now be at order_index 7
UPDATE activities
SET order_index = 7
WHERE type = 'speaking'
AND theme_id IN (SELECT id FROM themes WHERE code = 'tema_1')
AND title_ms = 'Pengenalan Watak';

-- Verify the changes
SELECT a.order_index, a.type, a.title_en, e.name as reward
FROM activities a
LEFT JOIN equipment e ON a.equipment_reward_id = e.id
WHERE a.theme_id IN (SELECT id FROM themes WHERE code = 'tema_1')
ORDER BY a.order_index;
