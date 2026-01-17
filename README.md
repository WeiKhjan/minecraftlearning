# MYLearnt

A gamified learning platform for Malaysian primary school kids (Primary 1-6) with 8-bit Warrior Quest pixel art RPG theming.

## Features

- **Multi-Subject Learning**: Bahasa Malaysia, Bahasa Cina, English, Mathematics
- **Gamification**: 8-bit pixel art RPG character with equipment rewards and leveling
- **AI-Powered Assessment**: Gemini 3 Flash for intelligent feedback
- **Voice Tutor**: Gemini 2.5 Flash TTS with Malaysian accent
- **Multi-Language UI**: Bahasa Malaysia, Simplified Chinese, English
- **Multiple Kids**: One parent account can manage multiple children
- **Admin Dashboard**: Monitor all students progress

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth via Supabase Auth
- **AI**: Google Gemini 3 Flash + Gemini 2.5 Flash TTS
- **Hosting**: Vercel
- **i18n**: next-intl

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google AI Studio API key

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Run database schema in Supabase SQL Editor
5. Run `npm run dev`

## Environment Variables

See `.env.example` for required variables.

## Database Setup

1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Run `supabase/seed.sql` for initial content
3. Enable Google OAuth in Supabase Authentication

## Making a User Admin

```sql
UPDATE parents SET is_admin = true WHERE email = 'admin@example.com';
```

## Creating New Lessons

This guide explains how to add new learning content (Units/Activities) to the app.

### Content Structure

```
Subject (BM/BC/EN/Math)
└── Grade (1-6)
    └── Tema (Theme, e.g., "Tema 1: Sayangi Keluarga")
        └── Unit (e.g., "Unit 2: Mari Sayang")
            └── Activity (e.g., "BA:6 Mari Ajuk dan Sebut")
```

### Activity Types

| Type | Code | Description | Content Structure |
|------|------|-------------|-------------------|
| Alphabet | `alphabet` | Letter/character recognition | `{ letters: [...], images: [...] }` |
| Syllable | `syllable` | Syllable reading practice | `{ pairs: [{ word, syllables, image_url }] }` |
| Matching | `matching` | Match words to images | `{ pairs: [{ word, image_url }] }` |
| Writing | `writing` | Tracing/writing practice | `{ words: [{ word, image_url }] }` |
| Dictation | `dictation` | Listen and spell | `{ words: [{ word, image_url }] }` |
| Speaking | `speaking` | Pronunciation practice | `{ sentences: [{ text, translation }] }` |

### Equipment Reward Tiers

Plan equipment rewards based on progression through Temas:

| Tier | Equipment | Suggested Usage |
|------|-----------|-----------------|
| Leather | Helmet, Chestplate, Leggings, Boots, Wooden Sword | Tutorial/Tema 0 |
| Chain | Helmet, Chestplate, Leggings, Boots, Stone Sword | Tema 1 Unit 1-2 early activities |
| Iron | Helmet, Chestplate, Leggings, Boots, Iron Sword | Tema 1 Unit 2-3 mid activities |
| Gold | Helmet, Chestplate, Leggings, Boots, Gold Sword | Tema 1 Unit 3 late activities |
| Diamond | Helmet, Chestplate, Leggings, Boots, Diamond Sword | Tema 2+ |

### Equipment Images

Equipment images are AI-generated 8-bit pixel art style using Gemini 2.5 Flash. All 25 equipment pieces (5 tiers × 5 pieces) have been pre-generated and stored in Supabase.

**Storage location**: `{SUPABASE_URL}/storage/v1/object/public/images/equipment/{equipment_id}.png`

**Equipment IDs**:
| Tier | Helmet | Chestplate | Leggings | Boots | Sword |
|------|--------|------------|----------|-------|-------|
| Leather | `leather_helmet` | `leather_chestplate` | `leather_leggings` | `leather_boots` | `wooden_sword` |
| Chain | `chain_helmet` | `chain_chestplate` | `chain_leggings` | `chain_boots` | `stone_sword` |
| Iron | `iron_helmet` | `iron_chestplate` | `iron_leggings` | `iron_boots` | `iron_sword` |
| Gold | `gold_helmet` | `gold_chestplate` | `gold_leggings` | `gold_boots` | `gold_sword` |
| Diamond | `diamond_helmet` | `diamond_chestplate` | `diamond_leggings` | `diamond_boots` | `diamond_sword` |

**Regenerating Equipment Images** (if needed):

Use the equipment generation API at `src/app/api/generate-equipment/route.ts`:

```bash
# Check equipment list
curl https://your-app.vercel.app/api/generate-equipment

# Generate in batches of 5
curl -X POST https://your-app.vercel.app/api/generate-equipment \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 0, "count": 5}'

# Continue with next batches (0-4, 5-9, 10-14, 15-19, 20-24)
curl -X POST https://your-app.vercel.app/api/generate-equipment \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 5, "count": 5}'
```

**Adding New Equipment Tiers** (e.g., Darksteel):

1. Edit `src/app/api/generate-equipment/route.ts` and add new items to `EQUIPMENT_LIST`
2. Run the generation API for the new items
3. Update `src/types/index.ts` to add the new tier to `EquipmentTier` type
4. Update components (`CharacterClient.tsx`, `dashboard/page.tsx`) to handle the new tier colors

### Pet System

Pets are fantasy creature companions that kids can collect and display next to their avatar. Pets are awarded when a kid completes ALL activities in a theme.

Pet images are AI-generated 8-bit pixel art style using Gemini 2.5 Flash. All 25 pets (5 rarities × 5 pets) have been pre-generated and stored in Supabase.

**Pet Rarity Tiers**:
| Rarity | Examples | When to Award |
|--------|----------|---------------|
| Common | Chicken, Cow, Pig, Sheep, Rabbit | Early themes |
| Uncommon | Cat, Wolf, Fox, Parrot, Turtle | Mid themes |
| Rare | Bee, Panda, Axolotl, Ocelot, Llama | Later themes |
| Epic | Skeleton, Zombie, Creeper, Spider, Slime | Advanced themes |
| Legendary | Iron Golem, Snow Golem, Allay, Ender Dragon, Wither | Final/special themes |

**Storage location**: `{SUPABASE_URL}/storage/v1/object/public/images/pets/{pet_id}.png`

**Pet IDs by Rarity**:
| Rarity | Pet 1 | Pet 2 | Pet 3 | Pet 4 | Pet 5 |
|--------|-------|-------|-------|-------|-------|
| Common | `chicken` | `cow` | `pig` | `sheep` | `rabbit` |
| Uncommon | `cat` | `wolf` | `fox` | `parrot` | `turtle` |
| Rare | `bee` | `panda` | `axolotl` | `ocelot` | `llama` |
| Epic | `skeleton` | `zombie` | `creeper` | `spider` | `slime` |
| Legendary | `iron_golem` | `snow_golem` | `allay` | `ender_dragon` | `wither` |

**Regenerating Pet Images** (if needed):

Use the pet generation API at `src/app/api/generate-pets/route.ts`:

```bash
# Check pet list
curl https://your-app.vercel.app/api/generate-pets

# Generate in batches of 5
curl -X POST https://your-app.vercel.app/api/generate-pets \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 0, "count": 5}'

# Continue with next batches (0-4, 5-9, 10-14, 15-19, 20-24)
curl -X POST https://your-app.vercel.app/api/generate-pets \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 5, "count": 5}'
```

**Assigning Pet Rewards to Themes**:

In your seed SQL, add a `pet_reward` to themes:

```sql
UPDATE themes
SET pet_reward = 'wolf'
WHERE id = 'your-theme-uuid';
```

Or when creating a new theme:

```sql
INSERT INTO themes (subject_id, code, name_ms, name_zh, name_en, pet_reward)
VALUES (
  'subject-uuid',
  'tema_2',
  '{"ms": "Tema 2", "zh": "主题2", "en": "Theme 2"}',
  'panda'  -- Pet reward for completing all activities in this theme
);
```

**How Pet Rewards Work**:
1. Kid completes an activity
2. System checks if all activities in the theme are now completed
3. If all completed AND theme has a `pet_reward`, the pet is awarded
4. Pet appears in kid's pet collection and can be equipped

### Voice Audio (TTS) System

Voice audio clips for speaking, syllable, and dictation activities can be pre-generated to save API costs and avoid rate limits. Audio is generated using Gemini 2.5 Flash TTS and stored in Supabase.

**Storage location**: `{SUPABASE_URL}/storage/v1/object/public/audio/{type}/{activity_id}/{index}.mp3`

**Supported Activity Types**:
| Type | Content Field | Audio Storage Path |
|------|---------------|-------------------|
| Speaking | `phrases[].audio_url` | `audio/speaking/{activity_id}/{index}.mp3` |
| Syllable | `audio_urls[]` | `audio/syllable/{activity_id}/{index}.mp3` |
| Dictation | `words[].audio_url` | `audio/dictation/{activity_id}/{index}.mp3` |

**Setup** (one-time):
1. Create an `audio` storage bucket in Supabase Dashboard > Storage
2. Set the bucket to public (for playback access)

**Generating Audio Clips**:

Use the audio generation API at `src/app/api/generate-audio/route.ts`:

```bash
# Check all audio items that need generation
curl https://your-app.vercel.app/api/generate-audio

# Generate in batches of 5
curl -X POST https://your-app.vercel.app/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 0, "count": 5}'

# Continue with next batches
curl -X POST https://your-app.vercel.app/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 5, "count": 5}'
```

**How Pre-generated Audio Works**:
1. The API scans all speaking, syllable, and dictation activities in the database
2. For each text item (phrase, syllable, or word), it generates TTS audio
3. Audio is uploaded to Supabase storage
4. Components automatically use pre-generated audio when available
5. Falls back to live TTS API if pre-generated audio is not available or fails

**Benefits**:
- Reduces API costs (generate once, use many times)
- Avoids TTS rate limits during lessons
- Faster audio playback (no API call needed)
- Works offline once cached by browser

### Step-by-Step: Adding New Lessons

#### Step 1: Analyze Learning Materials

1. Place learning material images in: `Learning Materials/{Subject}/{Tema} {Unit Name}/`
2. Review each page and categorize content:
   - Syllable exercises → `syllable` activity
   - Word-picture matching → `matching` activity
   - Writing/tracing exercises → `writing` + `dictation` activities
   - Sentence reading → `speaking` activity

#### Step 2: Extract Vocabulary Words

Create a list of all vocabulary words with:
- `word`: The Malay/Chinese/English word
- `meaning_en`: English meaning (for image generation prompt)
- `category`: food, animal, object, place, person, action, vehicle, nature, body, clothing

#### Step 3: Update Image Generation API

Edit `src/app/api/generate-vocab-batch/route.ts`:

```typescript
const VOCABULARY_LIST = [
  // Add your new words here
  { word: 'baju', meaning_en: 'shirt/clothes', category: 'clothing' },
  { word: 'roti', meaning_en: 'bread', category: 'food' },
  // ... more words
];
```

#### Step 4: Generate Vocabulary Images

Option A: Use Admin UI
1. Deploy changes to Vercel (push to git)
2. Go to: `https://your-app.vercel.app/en/admin/generate-images`
3. Click "Generate All Remaining"

Option B: Use API directly
```bash
# Check vocabulary list
curl https://your-app.vercel.app/api/generate-vocab-batch

# Generate in batches of 5
curl -X POST https://your-app.vercel.app/api/generate-vocab-batch \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 0, "count": 5}'

# Continue with next batch
curl -X POST https://your-app.vercel.app/api/generate-vocab-batch \
  -H "Content-Type: application/json" \
  -d '{"startIndex": 5, "count": 5}'
```

Images are stored at: `{SUPABASE_URL}/storage/v1/object/public/images/vocab/{word}.png`

#### Step 5: Create Seed SQL

Create a new SQL file in `supabase/` (e.g., `seed-tema2.sql`):

```sql
-- Get theme ID
DO $$
DECLARE
  v_theme_id UUID;
  v_unit_id UUID;
BEGIN
  -- Get or create theme
  SELECT id INTO v_theme_id FROM themes
  WHERE subject = 'bm' AND grade_level = 1 AND theme_order = 1;

  -- Create Unit
  INSERT INTO units (theme_id, name, description, unit_order)
  VALUES (v_theme_id,
    '{"ms": "Unit 4: Nama Unit", "zh": "单元4：...", "en": "Unit 4: ..."}',
    '{"ms": "Deskripsi", "zh": "描述", "en": "Description"}',
    4
  ) RETURNING id INTO v_unit_id;

  -- Create Activities
  INSERT INTO activities (unit_id, name, description, activity_type, content, activity_order, equipment_reward)
  VALUES (
    v_unit_id,
    '{"ms": "BA:XX Nama Aktiviti", "zh": "...", "en": "..."}',
    '{"ms": "Deskripsi", "zh": "...", "en": "..."}',
    'matching',
    '{
      "pairs": [
        {"word": "kata1", "image_url": "https://xxx.supabase.co/storage/v1/object/public/images/vocab/kata1.png"},
        {"word": "kata2", "image_url": "https://xxx.supabase.co/storage/v1/object/public/images/vocab/kata2.png"}
      ]
    }'::jsonb,
    1,
    'diamond_helmet'
  );

END $$;
```

#### Step 6: Run Seed SQL

1. Go to Supabase Dashboard > SQL Editor
2. Paste and run your seed SQL file
3. Verify in the app that new content appears

### Content Examples

#### Syllable Activity Content
```json
{
  "pairs": [
    { "word": "baju", "syllables": ["ba", "ju"], "image_url": "https://..." },
    { "word": "roti", "syllables": ["ro", "ti"], "image_url": "https://..." }
  ]
}
```

#### Matching Activity Content
```json
{
  "pairs": [
    { "word": "kucing", "image_url": "https://..." },
    { "word": "anjing", "image_url": "https://..." }
  ]
}
```

#### Writing/Dictation Activity Content
```json
{
  "words": [
    { "word": "nasi", "image_url": "https://..." },
    { "word": "air", "image_url": "https://..." }
  ]
}
```

#### Speaking Activity Content
```json
{
  "sentences": [
    { "text": "Saya suka makan nasi.", "translation": "I like to eat rice." },
    { "text": "Ini kucing saya.", "translation": "This is my cat." }
  ]
}
```

### Existing Seed Files

| File | Content |
|------|---------|
| `supabase/seed.sql` | Tema 1 Unit 1 (initial content) |
| `supabase/seed-unit2-unit3.sql` | Tema 1 Unit 2 & Unit 3 |

### Tips

1. **Batch size**: Generate images/audio in batches of 5 to avoid API timeouts
2. **Rate limiting**: The API has 2-second delays between generations
3. **Image style**: Vocabulary images are kawaii/cute cartoon style; equipment and pet images are 8-bit warrior RPG pixel art
4. **Multilingual**: Always provide names/descriptions in ms, zh, en
5. **Equipment progression**: Plan rewards to give sense of progression (see Equipment Reward Tiers table)
6. **Writing + Dictation**: For writing activities, also create a dictation activity with same words
7. **Equipment images**: All 25 equipment images are pre-generated. Use equipment IDs from the table above for `equipment_reward` field
8. **Pet images**: All 25 pet images are pre-generated. Use pet IDs from the table above for `pet_reward` field on themes
9. **Voice audio**: After adding new speaking/syllable/dictation activities, run the audio generation API to pre-generate TTS clips

## License

MIT
