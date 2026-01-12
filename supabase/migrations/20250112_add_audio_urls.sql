-- =====================================================
-- Audio URLs Migration for Pre-Generated TTS Audio
-- =====================================================
-- RUN THIS AFTER ALL AUDIO FILES ARE GENERATED
--
-- Storage URL Pattern:
-- https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/audio/{path}
--
-- Database stores relative paths: /audio/syllable/ms/pronunciation/ba.wav
-- App constructs full URL using NEXT_PUBLIC_SUPABASE_URL
-- =====================================================

-- Helper function to build audio URL path
CREATE OR REPLACE FUNCTION build_audio_path(audio_type TEXT, locale TEXT, subtype TEXT, filename TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN '/audio/' || audio_type || '/' || locale || '/' || subtype || '/' || LOWER(REPLACE(REPLACE(filename, ' ', '_'), '.', '')) || '.wav';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. UPDATE SYLLABLE ACTIVITIES
-- =====================================================

-- Add audio_urls array for syllable pronunciations
UPDATE activities
SET content = jsonb_set(
  content,
  '{data,audio_urls}',
  (
    SELECT COALESCE(jsonb_agg(
      build_audio_path('syllable', 'ms', 'pronunciation', s.value::text)
    ), '[]'::jsonb)
    FROM jsonb_array_elements_text(content->'data'->'syllables') AS s(value)
  )
)
WHERE type = 'syllable'
  AND content->'data'->'syllables' IS NOT NULL
  AND jsonb_array_length(COALESCE(content->'data'->'syllables', '[]'::jsonb)) > 0;

-- Add guide_urls array for syllable guides
UPDATE activities
SET content = jsonb_set(
  content,
  '{data,guide_urls}',
  (
    SELECT COALESCE(jsonb_agg(
      build_audio_path('syllable', 'ms', 'guide', s.value::text)
    ), '[]'::jsonb)
    FROM jsonb_array_elements_text(content->'data'->'syllables') AS s(value)
  )
)
WHERE type = 'syllable'
  AND content->'data'->'syllables' IS NOT NULL
  AND jsonb_array_length(COALESCE(content->'data'->'syllables', '[]'::jsonb)) > 0;

-- Update word audio URLs in syllable activities
UPDATE activities
SET content = jsonb_set(
  content,
  '{data,words}',
  (
    SELECT COALESCE(jsonb_agg(
      word || jsonb_build_object(
        'audio_url', build_audio_path('vocabulary', 'ms', 'word', word->>'word')
      )
    ), '[]'::jsonb)
    FROM jsonb_array_elements(content->'data'->'words') AS word
  )
)
WHERE type = 'syllable'
  AND content->'data'->'words' IS NOT NULL
  AND jsonb_array_length(COALESCE(content->'data'->'words', '[]'::jsonb)) > 0;

-- =====================================================
-- 2. UPDATE SPEAKING ACTIVITIES
-- =====================================================

UPDATE activities
SET content = jsonb_set(
  content,
  '{data,phrases}',
  (
    SELECT COALESCE(jsonb_agg(
      phrase || jsonb_build_object(
        'audio_url', build_audio_path('phrase', 'ms', 'sentence',
          SUBSTRING(phrase->>'text' FROM 1 FOR 50))
      )
    ), '[]'::jsonb)
    FROM jsonb_array_elements(content->'data'->'phrases') AS phrase
  )
)
WHERE type = 'speaking'
  AND content->'data'->'phrases' IS NOT NULL
  AND jsonb_array_length(COALESCE(content->'data'->'phrases', '[]'::jsonb)) > 0;

-- =====================================================
-- 3. UPDATE DICTATION ACTIVITIES
-- =====================================================

UPDATE activities
SET content = jsonb_set(
  content,
  '{data,words}',
  (
    SELECT COALESCE(jsonb_agg(
      word || jsonb_build_object(
        'audio_url', build_audio_path('dictation', 'ms', 'word', word->>'word')
      )
    ), '[]'::jsonb)
    FROM jsonb_array_elements(content->'data'->'words') AS word
  )
)
WHERE type = 'dictation'
  AND content->'data'->'words' IS NOT NULL
  AND jsonb_array_length(COALESCE(content->'data'->'words', '[]'::jsonb)) > 0;

-- =====================================================
-- 4. UPDATE MATCHING ACTIVITIES
-- =====================================================

UPDATE activities
SET content = jsonb_set(
  content,
  '{data,pairs}',
  (
    SELECT COALESCE(jsonb_agg(
      pair || jsonb_build_object(
        'audio_url', build_audio_path(
          'matching',
          'ms',
          'syllable',
          COALESCE(pair->>'syllable', pair->>'letter', pair->>'word', 'unknown')
        )
      )
    ), '[]'::jsonb)
    FROM jsonb_array_elements(content->'data'->'pairs') AS pair
  )
)
WHERE type = 'matching'
  AND content->'data'->'pairs' IS NOT NULL
  AND jsonb_array_length(COALESCE(content->'data'->'pairs', '[]'::jsonb)) > 0;

-- =====================================================
-- VERIFICATION QUERIES (uncomment to run)
-- =====================================================

-- Check syllable activities
SELECT id, title_ms, type,
       jsonb_array_length(COALESCE(content->'data'->'audio_urls', '[]'::jsonb)) as audio_count,
       content->'data'->'audio_urls'->0 as first_audio
FROM activities
WHERE type = 'syllable'
LIMIT 5;

-- Check speaking activities
SELECT id, title_ms, type,
       content->'data'->'phrases'->0->>'audio_url' as first_phrase_audio
FROM activities
WHERE type = 'speaking'
LIMIT 5;

-- Check dictation activities
SELECT id, title_ms, type,
       content->'data'->'words'->0->>'audio_url' as first_word_audio
FROM activities
WHERE type = 'dictation'
LIMIT 5;

-- Check matching activities
SELECT id, title_ms, type,
       content->'data'->'pairs'->0->>'audio_url' as first_pair_audio
FROM activities
WHERE type = 'matching'
LIMIT 5;

-- Summary count
SELECT type,
       COUNT(*) as total,
       COUNT(CASE
         WHEN type = 'syllable' AND content->'data'->'audio_urls' IS NOT NULL THEN 1
         WHEN type = 'speaking' AND content->'data'->'phrases'->0->>'audio_url' IS NOT NULL THEN 1
         WHEN type = 'dictation' AND content->'data'->'words'->0->>'audio_url' IS NOT NULL THEN 1
         WHEN type = 'matching' AND content->'data'->'pairs'->0->>'audio_url' IS NOT NULL THEN 1
       END) as with_audio
FROM activities
WHERE type IN ('syllable', 'speaking', 'dictation', 'matching')
GROUP BY type
ORDER BY type;

-- Clean up (optional - keep function for future use)
-- DROP FUNCTION IF EXISTS build_audio_path(TEXT, TEXT, TEXT, TEXT);
