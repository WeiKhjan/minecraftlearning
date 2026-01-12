---
name: generating-voice-tutorials
description: Generates voice-guided tutorials and TTS audio content for the MYLearnt learning platform. Creates pre-generated audio clips for activities, AI tutor voice guidance, and text-to-speech for educational content. Supports Malay (ms), Chinese (zh), and English (en) languages. Uses Gemini 2.5 Flash TTS API with rate limiting (7 RPM).
---

# Generating Voice Tutorials

Creates voice-guided content and pre-generated audio files for the MYLearnt educational platform.

## Quick Start

### Most Common Task: Generate Audio Batch via Vercel API

```bash
# Check registry stats
curl https://minecraftlearning.vercel.app/api/generate-audio-batch

# Generate batch (uses Vercel credentials)
curl -X POST https://minecraftlearning.vercel.app/api/generate-audio-batch \
  -H "Content-Type: application/json" \
  -d '{"category":"syllable_pronunciation","locale":"ms","startIndex":0,"count":5}'

# Dry run (test without generating)
curl -X POST https://minecraftlearning.vercel.app/api/generate-audio-batch \
  -H "Content-Type: application/json" \
  -d '{"category":"all","locale":"all","startIndex":0,"count":5,"dryRun":true}'
```

### Quick Reference: Audio Categories
| Category | Count (per locale) | Use For |
|----------|-------------------|---------|
| `syllable_pronunciation` | 90 | Just the syllable sound ("ba") |
| `syllable_guide` | 90 | Educational explanation + practice |
| `vocabulary` | 79 | Word pronunciation |
| `phrase` | 36 | Speaking activity sentences |
| `dictation` | 17 | Dictation word audio |
| `matching` | 5 | Matching activity sounds |

**Total**: ~951 files across all 3 locales

---

## Degrees of Freedom

| Area | Freedom Level | Guidelines |
|------|---------------|------------|
| **Tutoring Script Writing** | 🟢 High | Creates engaging, child-friendly explanations. Can add enthusiasm, vary phrasing, include cultural context. |
| **Voice Selection** | 🟢 High | Chooses appropriate voices for different content. Can suggest voice changes for variety. |
| **Example Words/Phrases** | 🟢 High | Selects culturally relevant examples when generating tutoring content. |
| **Audio Organization** | 🟡 Medium | Follows storage structure but can suggest improvements. |
| **Language Selection** | 🟡 Medium | Matches audio to subject language (not UI). Can suggest appropriate locale. |
| **API Structure** | 🔴 Low | Uses existing endpoints without modification. |
| **Storage Paths** | 🔴 Low | Follows established path conventions. |

---

## Pre-Generated Audio System

### Storage Structure

```
Supabase Storage: audio/
├── syllable/
│   ├── ms/
│   │   ├── guide/           # Educational explanations (90 files)
│   │   │   ├── a.wav
│   │   │   ├── ba.wav
│   │   │   └── ...
│   │   └── pronunciation/   # Just syllable sounds (90 files)
│   │       ├── a.wav
│   │       ├── ba.wav
│   │       └── ...
│   ├── zh/
│   │   ├── guide/
│   │   └── pronunciation/
│   └── en/
│       ├── guide/
│       └── pronunciation/
├── vocabulary/
│   ├── ms/word/             # Word pronunciations (~79 files)
│   │   ├── ayam.wav
│   │   ├── baju.wav
│   │   └── ...
│   ├── zh/word/
│   └── en/word/
├── phrase/
│   ├── ms/sentence/         # Speaking phrases (~36 files)
│   ├── zh/sentence/
│   └── en/sentence/
├── dictation/
│   ├── ms/word/             # Dictation words (~17 files)
│   ├── zh/word/
│   └── en/word/
└── matching/
    ├── ms/syllable/         # Matching sounds (~5 files)
    ├── zh/syllable/
    └── en/syllable/
```

### Full URL Format

**Supabase Storage Base URL:**
```
https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/
```

**Full URL Patterns:**
| Type | Full URL Pattern |
|------|-----------------|
| Syllable Guide | `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/audio/syllable/{locale}/guide/{syllable}.wav` |
| Syllable Pronunciation | `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/audio/syllable/{locale}/pronunciation/{syllable}.wav` |
| Vocabulary | `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/audio/vocabulary/{locale}/word/{word}.wav` |
| Phrase | `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/audio/phrase/{locale}/sentence/{phrase_slug}.wav` |
| Dictation | `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/audio/dictation/{locale}/word/{word}.wav` |
| Matching | `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/audio/matching/{locale}/syllable/{syllable}.wav` |

**Database Storage:**
Store relative paths in database. The app constructs full URLs:
```sql
-- Store relative path
audio_url = '/audio/syllable/ms/pronunciation/ba.wav'
-- App constructs: {SUPABASE_URL}/storage/v1/object/public/audio/syllable/ms/pronunciation/ba.wav
```

> **CRITICAL: audio_url Format**
>
> The app prepends `{SUPABASE_URL}/storage/v1/object/public` to the `audio_url` value.
>
> ```
> ✅ CORRECT: '/audio/syllable/ms/pronunciation/ba.wav'
> ❌ WRONG:   'audio/syllable/...' (missing leading slash)
> ❌ WRONG:   'https://...' (full URL - redundant)
> ```

---

## API Configuration

### Gemini Models Used
- **Gemini 2.5 Flash Preview TTS** - Audio generation
- **Endpoint**: `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent`

### Environment Variables
```
GEMINI_API_KEY=your_api_key
NEXT_PUBLIC_SUPABASE_URL=https://glwxvgxgquwfgwbwqbiz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

**Note**: Credentials are stored in Vercel. Use the Vercel-deployed API for generation.

### Rate Limiting
```typescript
const RATE_CONFIG = {
  requestsPerMinute: 7,        // API limit
  delayBetweenRequests: 9000,  // 9 seconds between items
  maxRetries: 3,
  retryDelay: 15000,           // 15 seconds on rate limit
};
```

**Estimated Generation Time**: ~2-3 hours for all 951 files

---

## Batch Generation API

### Endpoint
**File**: `src/app/api/generate-audio-batch/route.ts`

### GET - Registry Stats
```bash
curl https://minecraftlearning.vercel.app/api/generate-audio-batch
```

Response:
```json
{
  "status": "ready",
  "registry": {
    "total": 951,
    "byType": {
      "syllable_guide": 270,
      "syllable_pronunciation": 270,
      "vocabulary": 237,
      "phrase": 108,
      "dictation": 51,
      "matching": 15
    },
    "byLocale": { "ms": 317, "zh": 317, "en": 317 }
  }
}
```

### POST - Generate Audio Batch
```bash
curl -X POST https://minecraftlearning.vercel.app/api/generate-audio-batch \
  -H "Content-Type: application/json" \
  -d '{
    "category": "syllable_pronunciation",
    "locale": "ms",
    "startIndex": 0,
    "count": 5,
    "dryRun": false
  }'
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | `"all"` | Category to generate |
| `locale` | string | `"all"` | Locale (ms/zh/en) |
| `startIndex` | number | `0` | Starting index in registry |
| `count` | number | `5` | Number of items to generate |
| `dryRun` | boolean | `false` | Test without generating |

**Response:**
```json
{
  "success": true,
  "category": "syllable_pronunciation",
  "locale": "ms",
  "processed": 5,
  "successCount": 5,
  "errorCount": 0,
  "total": 90,
  "nextIndex": 5,
  "estimatedTimeRemaining": "128 minutes",
  "results": [
    {
      "id": "syllable_pronunciation_ms_ba",
      "success": true,
      "url": "https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/audio/syllable/ms/pronunciation/ba.wav",
      "relativePath": "/syllable/ms/pronunciation/ba.wav"
    }
  ]
}
```

---

## Audio Registry

**File**: `src/lib/audio/registry.ts`

Contains all audio items to pre-generate:

```typescript
// Syllables (35 base)
const BASE_SYLLABLES = [
  'a', 'e', 'i', 'o', 'u',           // Vowels
  'ba', 'ca', 'ga', 'ka', 'ma', 'sa', // + A
  'be', 'ce', 'ge', 'ke', 'me', 'se', // + E
  // ... etc
];

// Additional syllables from activities
const ADDITIONAL_SYLLABLES = [
  'bu', 'da', 'di', 'ja', 'ju', 'la', 'lu',
  'na', 'ni', 'nu', 'pa', 'pi', 'ra', 'ri',
  'ru', 'su', 'ta', 'ti', 'tu', 'wa', 'ya', 'yu'
];

// Vocabulary words (~79)
const VOCABULARY_WORDS = [
  { word: 'ayam', ms: 'ayam', zh: '鸡', en: 'chicken' },
  { word: 'baju', ms: 'baju', zh: '衣服', en: 'clothes' },
  // ... etc
];
```

### Builder Functions
```typescript
buildSyllableGuideRegistry()        // Educational explanations
buildSyllablePronunciationRegistry() // Just syllable sounds
buildVocabularyRegistry()           // Word pronunciations
buildPhraseRegistry()               // Speaking sentences
buildDictationRegistry()            // Dictation words
buildMatchingRegistry()             // Matching sounds
buildFullRegistry()                 // All items combined
getRegistryStats()                  // Summary statistics
```

---

## Admin UI

**File**: `src/app/[locale]/admin/audio-generation/page.tsx`
**URL**: `https://minecraftlearning.vercel.app/en/admin/audio-generation`

Features:
- Category and locale selection
- Batch size control (1-20)
- Start index selection
- Dry-run toggle
- Progress display with stats
- Real-time log output
- Error tracking

---

## Voice Configuration

### Language-Voice Mapping
| Locale | Voice | Best For |
|--------|-------|----------|
| ms (Malay) | Kore | Clear pronunciation |
| zh (Chinese) | Puck | Mandarin tones |
| en (English) | Kore | Clear English |

### Voice Guide Templates

**Malay (ms):**
```
Vowel: "Ini huruf vokal A. Bunyi ah. Cuba sebut bersama saya: a, a, a."
Syllable: "Suku kata BA. Gabungkan bunyi buh dan ah menjadi ba. Cuba sebut bersama saya: ba, ba, ba."
```

**Chinese (zh):**
```
Vowel: "这是元音 A。跟我一起说：a，a，a。"
Syllable: "音节 BA。将辅音 B 和元音 A 结合成 ba。跟我一起说：ba，ba，ba。"
```

**English (en):**
```
Vowel: "This is the vowel A. Say it with me: a, a, a."
Syllable: "Syllable BA. Combine the consonant B with vowel A to make ba. Say it with me: ba, ba, ba."
```

---

## SQL Migration

**File**: `supabase/migrations/20250112_add_audio_urls.sql`

After generating all audio, run this migration to update activity content:

```sql
-- Updates syllable activities with audio URLs
UPDATE activities
SET content = jsonb_set(
  content,
  '{data,audio_urls}',
  (SELECT jsonb_agg(build_audio_url('syllable', 'ms', 'pronunciation', s.value::text))
   FROM jsonb_array_elements_text(content->'data'->'syllables') AS s)
)
WHERE type = 'syllable';

-- Updates speaking activities
UPDATE activities
SET content = jsonb_set(
  content,
  '{data,phrases}',
  (SELECT jsonb_agg(phrase || jsonb_build_object('audio_url', ...))
   FROM jsonb_array_elements(content->'data'->'phrases') AS phrase)
)
WHERE type = 'speaking';
```

---

## Client-Side Usage

### VoiceTutorButton Component
```tsx
// Component automatically tries pre-generated audio first
// Falls back to TTS API if file doesn't exist
<VoiceTutorButton
  text="ba"
  locale="ms"
  size="md"
  contentType="syllable"  // Used to construct audio URL
/>

// Or with explicit audioUrl override
<VoiceTutorButton
  text="ba"
  locale="ms"
  size="md"
  contentType="syllable"
  audioUrl="/audio/syllable/ms/pronunciation/ba.wav"
/>
```

### Audio Priority (Automatic Fallback)
1. **Pre-generated audio** - Auto-constructed URL based on contentType + text + locale
2. **TTS API fallback** - Automatically used if pre-generated file doesn't exist (404)

### URL Builder Utility
**File**: `src/lib/audio/url-builder.ts`

```typescript
import { getAudioUrl, getSyllablePronunciationUrl, getVocabularyUrl } from '@/lib/audio/url-builder';

// Generic builder
getAudioUrl('ba', 'syllable', 'ms')  // -> .../audio/syllable/ms/pronunciation/ba.wav

// Specific builders
getSyllablePronunciationUrl('ba', 'ms')
getSyllableGuideUrl('ba', 'ms')
getVocabularyUrl('ayam', 'ms')
getPhraseUrl('Ini adalah...', 'ms')
```

---

## Generation Workflow

### Step 1: Check Registry Stats
```bash
curl https://minecraftlearning.vercel.app/api/generate-audio-batch
```

### Step 2: Generate by Category (Parallel)
Run multiple curl commands for different categories:
```bash
# Parallel generation
curl -X POST .../api/generate-audio-batch -d '{"category":"syllable_pronunciation","locale":"ms","startIndex":0,"count":10}' &
curl -X POST .../api/generate-audio-batch -d '{"category":"syllable_guide","locale":"ms","startIndex":0,"count":10}' &
curl -X POST .../api/generate-audio-batch -d '{"category":"vocabulary","locale":"ms","startIndex":0,"count":10}' &
wait
```

### Step 3: Continue Until Complete
Use `nextIndex` from response to continue:
```bash
# First batch
{"nextIndex": 10} # Use this for next call

# Next batch
curl ... -d '{"startIndex":10,"count":10}'
```

### Step 4: Run SQL Migration
After all audio generated, run:
```bash
psql -f supabase/migrations/20250112_add_audio_urls.sql
```

---

## Troubleshooting

### Generation Fails
- Check Gemini API key in Vercel environment
- Verify rate limits not exceeded (7 RPM)
- Check Supabase storage bucket exists (`audio`)

### No Audio in Response
- Some short texts (single vowels) may fail
- Retry failed items individually
- Check API logs in Vercel dashboard

### Storage Upload Fails
- Verify Supabase service role key
- Check bucket is public
- Ensure file paths are valid

### Wrong Language Voice
- Ensure `locale` parameter matches content
- Subject content uses subject language, not UI locale

---

## Related Skills

- **managing-course-syllabi**: Creates activities that need voice content
- **generating-images**: Generates visual aids to accompany audio
