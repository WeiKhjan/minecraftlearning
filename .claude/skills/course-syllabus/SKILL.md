---
name: course-syllabus
description: Generate new course syllabus content for the MYLearnt educational platform. Use this skill when asked to create new subjects, themes (units), or activities for the learning curriculum. Supports activity types: alphabet, matching, syllable, writing, speaking, math, dictation (NOT singing). Handles all grades (primary_1 through primary_6) and all 3 languages (ms, zh, en). IMPORTANT: Subject content language is fixed based on subject type (BM=Malay, BC=Chinese, EN=English) regardless of UI language.
---

# Course Syllabus Generation Skill

This skill guides you through creating educational content for the MYLearnt Minecraft-themed learning platform.

## Content Hierarchy

```
Subject (bm, bc, en, math)
  └── Theme (Unit/Chapter)
        └── Activity (Learning task)
```

## Language Rules

**CRITICAL**: Subject content language is FIXED based on subject code:
- `bm` (Bahasa Malaysia): Content in Malay, translations in zh/en
- `bc` (Bahasa Cina): Content in Chinese, translations in ms/en
- `en` (English): Content in English, translations in ms/zh
- `math` (Mathematics): Numbers/symbols universal, instructions in all 3 languages

UI language (locale) only affects labels/buttons, NOT the learning content.

## Database Tables

### subjects
```sql
- id: UUID (auto-generated)
- code: text (unique) -- 'bm', 'bc', 'en', 'math'
- name_ms, name_zh, name_en: text -- Display names
- icon: text -- Emoji icon
- color: text -- Hex color code
- order_index: integer
```

### themes
```sql
- id: UUID (auto-generated)
- subject_id: UUID (FK to subjects)
- code: text -- e.g., 'theme_1', 'unit_2'
- name_ms, name_zh, name_en: text
- description_ms, description_zh, description_en: text
- order_index: integer
- required_grade: text -- 'primary_1' to 'primary_6'
```

### activities
```sql
- id: UUID (auto-generated)
- theme_id: UUID (FK to themes)
- type: text -- Activity type (see below)
- title_ms, title_zh, title_en: text
- instructions_ms, instructions_zh, instructions_en: text
- content: jsonb -- Activity-specific data
- xp_reward: integer (default 10)
- equipment_reward_id: UUID (optional FK to equipment)
- order_index: integer
```

## Activity Types & Content Formats

See `references/content-formats.json` for complete JSON schemas.

### 1. alphabet
For learning letters/characters.
```json
{
  "type": "alphabet",
  "data": {
    "letters": ["A", "B", "C"],
    "instruction": {
      "ms": "Tekan huruf untuk mendengar bunyi",
      "zh": "点击字母听发音",
      "en": "Tap a letter to hear its sound"
    }
  }
}
```

### 2. matching
Match items (letters/syllables to images/words).
```json
{
  "type": "matching",
  "data": {
    "pairs": [
      {
        "letter": "A",
        "syllable": null,
        "word": "ayam",
        "image": "images/vocab/ayam.png",
        "meaning_ms": "ayam",
        "meaning_zh": "鸡",
        "meaning_en": "chicken"
      }
    ]
  }
}
```

### 3. syllable
Pronunciation practice with speech recognition.
```json
{
  "type": "syllable",
  "data": {
    "syllables": ["ba", "bi", "bu"],
    "audio_urls": [],
    "words": [
      {
        "word": "baju",
        "syllables": ["ba", "ju"],
        "meaning_ms": "pakaian",
        "meaning_zh": "衣服",
        "meaning_en": "clothes",
        "image": "images/vocab/baju.png",
        "audio_url": null
      }
    ]
  }
}
```

### 4. writing
Handwriting/tracing practice.
```json
{
  "type": "writing",
  "data": {
    "characters": ["一", "二", "三"],
    "trace_guides": true,
    "words": [
      {
        "word": "一",
        "stroke_order": ["horizontal"],
        "meaning_ms": "satu",
        "meaning_zh": "一",
        "meaning_en": "one"
      }
    ]
  }
}
```

### 5. speaking
Phrase repetition with AI feedback.
```json
{
  "type": "speaking",
  "data": {
    "phrases": [
      {
        "text": "Selamat pagi",
        "translation_ms": "Selamat pagi",
        "translation_zh": "早上好",
        "translation_en": "Good morning",
        "audio_url": null
      }
    ],
    "use_kid_name": false
  }
}
```

### 6. math
Mathematics exercises.
```json
{
  "type": "math",
  "data": {
    "problems": [
      {
        "question": "2 + 3 = ?",
        "answer": 5,
        "hint_ms": "Kira dengan jari",
        "hint_zh": "用手指数",
        "hint_en": "Count with fingers"
      }
    ],
    "operation": "addition",
    "difficulty": 1
  }
}
```

### 7. dictation
Listen and write words.
```json
{
  "type": "dictation",
  "data": {
    "words": [
      {
        "word": "rumah",
        "meaning_ms": "tempat tinggal",
        "meaning_zh": "房子",
        "meaning_en": "house",
        "audio_url": null
      }
    ]
  }
}
```

## Step-by-Step Workflow

### Creating a New Theme (Unit)

1. **Identify the subject** by code: `bm`, `bc`, `en`, or `math`
2. **Get subject UUID** from database
3. **Determine order_index** (next available number)
4. **Create theme record**:
   ```sql
   INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en,
     description_ms, description_zh, description_en, order_index, required_grade)
   VALUES (...);
   ```

### Creating Activities for a Theme

1. **Get theme UUID**
2. **Plan activity sequence** (order_index starts at 1)
3. **For each activity**:
   - Choose appropriate type based on learning goal
   - Create content JSON following the format above
   - Set XP reward (default 10, harder activities 15-25)
   - Optionally link equipment_reward_id

4. **Insert activities**:
   ```sql
   INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en,
     instructions_ms, instructions_zh, instructions_en, content,
     xp_reward, order_index)
   VALUES (...);
   ```

## Best Practices

1. **Progressive Difficulty**: Start with simpler activities (alphabet, matching) before complex ones (speaking, dictation)

2. **Consistent Naming**:
   - Theme codes: `theme_1`, `unit_2`, `chapter_3`
   - Keep order_index sequential within parent

3. **XP Rewards**:
   - Basic (alphabet, matching): 10 XP
   - Intermediate (syllable, writing): 15 XP
   - Advanced (speaking, dictation, math): 20 XP

4. **Images**: Use relative paths `images/vocab/{word}.png` - generate images using the image-generation skill

5. **Audio**: Leave `audio_url` as null initially - generate using voice-tutorial skill

6. **Grade Appropriateness**:
   - primary_1-2: Focus on alphabet, matching, simple syllables
   - primary_3-4: Add writing, speaking, basic math
   - primary_5-6: Include dictation, complex math

## Example: Creating BM Unit 3

```sql
-- 1. Get subject ID
SELECT id FROM subjects WHERE code = 'bm';
-- Returns: 123e4567-e89b-12d3-a456-426614174000

-- 2. Create theme
INSERT INTO themes (
  subject_id, code, name_ms, name_zh, name_en,
  description_ms, description_zh, description_en,
  order_index, required_grade
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'unit_3',
  'Unit 3: Keluarga Saya',
  '第三单元：我的家庭',
  'Unit 3: My Family',
  'Belajar tentang ahli keluarga',
  '学习家庭成员',
  'Learn about family members',
  3,
  'primary_1'
);

-- 3. Create activities (get theme_id first)
INSERT INTO activities (
  theme_id, type, title_ms, title_zh, title_en,
  instructions_ms, instructions_zh, instructions_en,
  content, xp_reward, order_index
) VALUES (
  '{theme_id}',
  'matching',
  'Padankan Ahli Keluarga',
  '配对家庭成员',
  'Match Family Members',
  'Padankan gambar dengan perkataan yang betul',
  '将图片与正确的词语配对',
  'Match the picture with the correct word',
  '{"type": "matching", "data": {"pairs": [...]}}',
  10,
  1
);
```

## Files to Update

When creating new content, you may need to update:
- `supabase/schema.sql` - If adding new tables or fields
- `src/types/index.ts` - If adding new activity types
- Activity components in `src/components/activities/` - If new type needs UI

## Related Skills

- **image-generation**: Generate vocabulary images for activities
- **voice-tutorial**: Generate audio files for speaking/syllable activities
- **equipment-generation**: Create equipment rewards for activities
