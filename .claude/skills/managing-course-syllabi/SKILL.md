---
name: managing-course-syllabi
description: Manages and generates course syllabus content for the MYLearnt educational platform. Creates new subjects, themes (units), and activities for the learning curriculum. Supports activity types including alphabet, matching, syllable, writing, speaking, math, and dictation. Handles all grades (primary_1 through primary_6) and all 3 languages (ms, zh, en). Subject content language remains fixed based on subject type (BM=Malay, BC=Chinese, EN=English) regardless of UI language selection.
---

# Managing Course Syllabi

Creates and manages educational content for the MYLearnt Minecraft-themed learning platform.

## Quick Start

### Most Common Task: Add a New Activity to Existing Theme

```sql
-- 1. Get the theme ID
SELECT id FROM themes WHERE code = 'unit_2' AND subject_id = (SELECT id FROM subjects WHERE code = 'bm');

-- 2. Insert the activity
INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en,
  instructions_ms, instructions_zh, instructions_en, content, xp_reward, order_index)
VALUES (
  '{theme_id}',
  'matching',
  'Padankan Suku Kata',
  '配对音节',
  'Match Syllables',
  'Padankan suku kata dengan gambar yang betul',
  '将音节与正确的图片配对',
  'Match the syllable with the correct picture',
  '{"type": "matching", "data": {"pairs": [...]}}',
  10,
  (SELECT COALESCE(MAX(order_index), 0) + 1 FROM activities WHERE theme_id = '{theme_id}')
);
```

### Quick Reference: Activity Types
| Type | XP | Best For |
|------|----|----------|
| `alphabet` | 10 | Letter/character recognition |
| `matching` | 10 | Vocabulary association |
| `syllable` | 15 | Pronunciation practice |
| `writing` | 15 | Handwriting/tracing |
| `speaking` | 20 | Phrase repetition |
| `math` | 20 | Arithmetic exercises |
| `dictation` | 20 | Listen and spell |

---

## Degrees of Freedom

| Area | Freedom Level | Guidelines |
|------|---------------|------------|
| **New Activity Ideas** | 🟢 High | Suggests creative new activities within existing types. Can propose new vocabulary themes, math problem sets, or speaking scenarios. |
| **Vocabulary Selection** | 🟢 High | Chooses appropriate words for grade level. Can select culturally relevant terms and age-appropriate content. |
| **Activity Sequencing** | 🟡 Medium | Follows progressive difficulty (simple → complex). Can reorder within guidelines. |
| **XP Rewards** | 🟡 Medium | Stays within 10-25 range based on difficulty. Can adjust based on activity complexity. |
| **Content Structure** | 🔴 Low | Must follow exact JSON schemas in `references/content-formats.json`. |
| **Database Schema** | 🔴 Low | Does not modify table structures without explicit approval. |

---

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
Matches items (letters/syllables to images/words).
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
Provides pronunciation practice with speech recognition.
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
Enables handwriting/tracing practice.
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
Facilitates phrase repetition with AI feedback.
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
Presents mathematics exercises.
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
Tests listening and writing skills.
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

1. **Identifies the subject** by code: `bm`, `bc`, `en`, or `math`
2. **Gets subject UUID** from database
3. **Determines order_index** (next available number)
4. **Creates theme record**:
   ```sql
   INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en,
     description_ms, description_zh, description_en, order_index, required_grade)
   VALUES (...);
   ```

### Creating Activities for a Theme

1. **Gets theme UUID**
2. **Plans activity sequence** (order_index starts at 1)
3. **For each activity**:
   - Chooses appropriate type based on learning goal
   - Creates content JSON following the format above
   - Sets XP reward (default 10, harder activities 15-25)
   - Optionally links equipment_reward_id

4. **Inserts activities**:
   ```sql
   INSERT INTO activities (theme_id, type, title_ms, title_zh, title_en,
     instructions_ms, instructions_zh, instructions_en, content,
     xp_reward, order_index)
   VALUES (...);
   ```

## Best Practices

1. **Progressive Difficulty**: Starts with simpler activities (alphabet, matching) before complex ones (speaking, dictation)

2. **Consistent Naming**:
   - Theme codes: `theme_1`, `unit_2`, `chapter_3`
   - Keeps order_index sequential within parent

3. **XP Rewards**:
   - Basic (alphabet, matching): 10 XP
   - Intermediate (syllable, writing): 15 XP
   - Advanced (speaking, dictation, math): 20 XP

4. **Images**: Uses relative paths `images/vocab/{word}.png` - generates images using `generating-images` skill

5. **Audio**: Leaves `audio_url` as null initially - generates using `generating-voice-tutorials` skill

6. **Grade Appropriateness**:
   - primary_1-2: Focus on alphabet, matching, simple syllables
   - primary_3-4: Add writing, speaking, basic math
   - primary_5-6: Include dictation, complex math

---

## CRITICAL: Matching Activity Rules

### Do NOT Reveal Answers in Image Column

When displaying matching activities, the image/picture column should ONLY show the image - **NEVER show the word text next to the image** as this reveals the answer.

```
✅ CORRECT: Image column shows only the image icon
❌ WRONG:   Image column shows image + word text (reveals the answer!)
```

**Example of WRONG implementation:**
```jsx
// BAD - This reveals the answer!
<button>
  <img src={pair.image} alt={pair.word} />
  <span>{pair.word}</span>  {/* ← WRONG: Reveals the answer */}
</button>
```

**Example of CORRECT implementation:**
```jsx
// GOOD - Only show the image
<button>
  <img src={pair.image} alt="" />  {/* Empty alt to not reveal answer */}
</button>
```

The matching activity component (`src/components/activities/MatchingActivity.tsx`) handles this correctly - do NOT modify it to show word text alongside images.

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

When creating new content, may need to update:
- `supabase/schema.sql` - If adding new tables or fields
- `src/types/index.ts` - If adding new activity types
- Activity components in `src/components/activities/` - If new type needs UI

## Related Skills

- **generating-images**: Generates vocabulary images for activities
- **generating-voice-tutorials**: Generates audio files for speaking/syllable activities
- **generating-equipment**: Creates equipment rewards for activities
