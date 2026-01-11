---
name: generating-images
description: Generates images for the MYLearnt educational platform using AI. Creates vocabulary images, character avatars, pet icons, and equipment visuals. Supports multiple image styles including kawaii vocabulary illustrations, Minecraft pixel art equipment, 3D character avatars, and chibi pet companions. Uses Gemini AI image generation APIs.
---

# Generating Images

Creates various types of images for the MYLearnt platform using AI image generation.

## Quick Start

### Most Common Task: Generate Vocabulary Images

```typescript
// Single image
POST /api/generate-vocab-image
{ "word": "baju", "meaning_en": "shirt", "category": "clothing" }

// Batch generation
POST /api/generate-vocab-batch
{ "startIndex": 0, "count": 5 }
```

### Quick Reference: Image Types
| Type | API Endpoint | Style |
|------|-------------|-------|
| Vocabulary | `/api/generate-vocab-image` | Kawaii/cute illustration |
| Equipment | `/api/generate-equipment` | Minecraft pixel art |
| Avatar | `/api/generate-avatar` | 3D Minecraft character |
| Pet | `/api/generate-pets` | Chibi pixel art |

---

## Degrees of Freedom

| Area | Freedom Level | Guidelines |
|------|---------------|------------|
| **New Vocabulary Words** | 🟢 High | Adds any educational vocabulary with appropriate category. Can suggest words for new themes/units. |
| **Category Selection** | 🟢 High | Chooses or creates new categories that fit the vocabulary. Can propose new category types. |
| **Pet Designs** | 🟢 High | Creates new pet concepts with appropriate rarity. Can suggest seasonal or themed pets. |
| **Avatar Expressions** | 🟢 High | Designs new face expressions using emoji mapping. Can add culturally relevant expressions. |
| **Equipment Themes** | 🟢 High | Creates themed equipment sets (holidays, subjects). See `generating-equipment` skill. |
| **Style Variations** | 🟡 Medium | Maintains established art styles but can adjust colors, details within guidelines. |
| **Prompt Engineering** | 🟡 Medium | Improves prompts for better results while maintaining style consistency. |
| **Storage Paths** | 🔴 Low | Follows established path conventions. |
| **API Structure** | 🔴 Low | Uses existing endpoints without modification. |

---

## Image Types Overview

| Type | Style | Use Case | Storage Path |
|------|-------|----------|--------------|
| Vocabulary | Kawaii/Cute illustration | Learning words | `images/vocab/` |
| Equipment | Minecraft pixel art | Character gear | `images/equipment/` |
| Avatar | 3D Minecraft character | Player profile | `avatars/` |
| Pet | Chibi pixel art | Pet companions | `images/pets/` |

## API Configuration

### Gemini Models Used
- **Gemini 2.0 Flash** - Primary image generation
- **Gemini 2.5 Flash** - Fallback image generation
- **Endpoint**: `generativelanguage.googleapis.com/v1beta/models/`

### Environment Variables
```
GEMINI_API_KEY=your_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 1. Vocabulary Image Generation

### Purpose
Generates educational images for vocabulary words in matching, syllable, and dictation activities.

### API Endpoint
**File**: `src/app/api/generate-vocab-image/route.ts`

```typescript
POST /api/generate-vocab-image
{
  word: "baju",           // Malay word
  meaning_en: "shirt",    // English meaning for AI prompt
  category: "clothing"    // Category for styling
}
```

### Categories and Prompts (🟢 High Freedom to Add New)
| Category | Prompt Style |
|----------|-------------|
| food | "delicious appetizing food item on a clean plate or simple background" |
| animal | "cute friendly animal in a natural setting, child-friendly appearance" |
| object | "clear recognizable everyday object with simple background" |
| place | "colorful illustrated location/building, welcoming atmosphere" |
| person | "friendly cartoon character (not real person), diverse representation" |
| action | "simple illustration showing the action being performed" |
| vehicle | "colorful cartoon vehicle, child-friendly design" |
| nature | "beautiful natural element with vibrant colors" |
| body | "simple educational illustration of body part (appropriate for children)" |
| clothing | "colorful clothing item displayed clearly" |

### Style Requirements
```
- Cute kawaii-inspired illustration style
- Soft rounded edges, cheerful palette
- Cartoon/illustrated style (NOT photorealistic)
- Bright, vibrant colors suitable for young children
- White or soft pastel gradient background
- Subject centered, filling 70% of frame
- NO text, NO labels, NO scary elements
- Professional 2D flat design with subtle shading
```

### Batch Generation
**File**: `src/app/api/generate-vocab-batch/route.ts`

```typescript
POST /api/generate-vocab-batch
{
  startIndex: 0,
  count: 5
}

// Response
{
  results: [
    { word: "baju", image_url: "images/vocab/baju_123.png", success: true },
    { word: "roti", error: "Rate limited", success: false }
  ],
  nextIndex: 5
}
```

### Adding New Vocabulary (🟢 High Freedom)
```typescript
// In generate-vocab-batch/route.ts, add to VOCABULARY_LIST:
const VOCABULARY_LIST = [
  // Existing words...

  // New Unit words - can freely add appropriate vocabulary
  { word: 'kucing', meaning_en: 'cat', category: 'animal' },
  { word: 'meja', meaning_en: 'table', category: 'object' },
  { word: 'nasi', meaning_en: 'rice', category: 'food' },

  // Can create new categories as needed
  { word: 'guru', meaning_en: 'teacher', category: 'profession' },
  { word: 'gembira', meaning_en: 'happy', category: 'emotion' },
];
```

## 2. Equipment Image Generation

### Purpose
Generates Minecraft-style pixel art icons for character equipment.

### API Endpoint
**File**: `src/app/api/generate-equipment/route.ts`

```typescript
POST /api/generate-equipment
{
  startIndex: 0,
  count: 5
}
```

### Style Requirements
```
- Authentic Minecraft 8-bit/16-bit pixel art style
- Clean blocky pixels, no anti-aliasing
- {tier_color} color palette
- Item shown as inventory icon (like in Minecraft inventory)
- Transparent or solid dark background
- Single item centered, filling 80% of frame
- NO text, NO labels
```

### Tier Color Palettes
| Tier | Colors |
|------|--------|
| leather | Brown, tan, warm earth tones |
| chain | Gray, silver, metallic |
| iron | Silver, steel, metallic shine |
| gold | Gold, yellow, warm glow |
| diamond | Cyan, blue, crystalline shimmer |

### Equipment Prompt Template
```
Generate a Minecraft-style pixel art equipment icon.
Subject: {tier} {material} {slot_description}
Style: {slot_specific_details}
Style Requirements:
- Authentic Minecraft 8-bit/16-bit pixel art style
- Clean blocky pixels, no anti-aliasing
- {tier_color} color palette
- Item shown as inventory icon
- Transparent or solid dark background
- Single item centered, filling 80% of frame
- NO text, NO labels
```

## 3. Avatar Image Generation

### Purpose
Generates full-body Minecraft-style character avatars with equipped gear.

### API Endpoint
**File**: `src/app/api/generate-avatar/route.ts`

```typescript
POST /api/generate-avatar
{
  kidId: "uuid",
  avatarFace: "😊",  // Emoji determines expression
  equipment: {
    helmet: { name: "Iron Helmet", tier: "iron" },
    chestplate: { name: "Iron Chestplate", tier: "iron" },
    leggings: null,
    boots: null,
    weapon: { name: "Iron Sword", tier: "iron" }
  }
}
```

### Face Expressions (🟢 High Freedom to Add New)
| Emoji | Description |
|-------|-------------|
| 😊 | warm friendly smile with rosy cheeks and sparkling happy eyes |
| 😄 | big cheerful grin showing excitement and joy |
| 😎 | cool confident expression with a slight smirk |
| 🤗 | warm welcoming expression with open friendly eyes |
| 😇 | innocent sweet expression with gentle eyes |
| 🥳 | excited celebratory expression full of energy |
| 🤓 | smart studious look with focused attentive eyes |
| 😺 | playful cat-like expression with mischievous charm |
| 🦁 | brave confident lion-like expression showing courage |
| 🌟 | bright starry-eyed expression full of wonder |
| 🎮 | focused gamer expression showing determination |

### Tier Visual Effects
| Tier | Material | Glow Effect | Background |
|------|----------|-------------|------------|
| leather | "warm brown leather with visible stitching" | "subtle warm brown tones" | Village/farm |
| chain | "interlocking silvery metal rings" | "soft metallic gleam" | Forest path |
| iron | "polished steel plates with rivets" | "bright metallic silver gleam" | Castle/fortress |
| gold | "ornate golden metal with royal engravings" | "warm golden aura" | Palace/throne |
| diamond | "crystalline blue diamond with magical shimmer" | "magical cyan/blue particles and ethereal glow" | Magical floating islands |

### Avatar Prompt Structure
```
Create a 3D rendered Minecraft-style character portrait.

CHARACTER:
- Young adventurer child character
- Face: {face_description}
- Skin: Light tan with Minecraft's signature blocky 3D style

EQUIPMENT:
- Head: {helmet_description}
- Body: {chestplate_description}
- Legs: {leggings_description}
- Feet: {boots_description}
- Hand: {weapon_description}

VISUAL EFFECTS:
- Equipment glowing with {glow_effect}
- Overall appearance: {quality_description}

COMPOSITION:
- Full body visible, heroic standing pose
- 3/4 angle view showing character depth
- {background_description}
- Dramatic lighting with rim light for depth
- High quality 3D Minecraft render style
```

## 4. Pet Image Generation

### Purpose
Generates cute Minecraft-style pet companion icons.

### API Endpoint
**File**: `src/app/api/generate-pets/route.ts`

```typescript
POST /api/generate-pets
{
  startIndex: 0,
  count: 5
}
```

### Pet List (25 total, 🟢 High Freedom to Add New)
```typescript
// Passive Mobs (Common)
{ id: 'chicken', rarity: 'common', description: 'A clucking farm bird' }
{ id: 'pig', rarity: 'common', description: 'A pink oinking pig' }
{ id: 'sheep', rarity: 'common', description: 'A fluffy white sheep' }
{ id: 'cow', rarity: 'common', description: 'A spotted farm cow' }
{ id: 'rabbit', rarity: 'common', description: 'A hopping brown rabbit' }

// Neutral Mobs (Rare)
{ id: 'wolf', rarity: 'rare', description: 'A loyal gray wolf' }
{ id: 'cat', rarity: 'rare', description: 'A cute tabby cat' }
{ id: 'fox', rarity: 'rare', description: 'A clever orange fox' }
{ id: 'parrot', rarity: 'rare', description: 'A colorful talking parrot' }
{ id: 'bee', rarity: 'rare', description: 'A buzzing striped bee' }

// Special Mobs (Epic)
{ id: 'axolotl', rarity: 'epic', description: 'A pink aquatic axolotl' }
{ id: 'panda', rarity: 'epic', description: 'A playful black and white panda' }
{ id: 'polar_bear', rarity: 'epic', description: 'A majestic white polar bear' }
{ id: 'dolphin', rarity: 'epic', description: 'A friendly jumping dolphin' }
{ id: 'turtle', rarity: 'epic', description: 'A wise green sea turtle' }

// Hostile Mobs Made Cute (Epic/Legendary)
{ id: 'baby_zombie', rarity: 'epic', description: 'A tiny green zombie' }
{ id: 'slime', rarity: 'epic', description: 'A bouncy green slime cube' }
{ id: 'magma_cube', rarity: 'epic', description: 'A fiery orange magma cube' }
{ id: 'blaze', rarity: 'legendary', description: 'A floating fire blaze' }
{ id: 'ghast', rarity: 'legendary', description: 'A floating white ghast' }

// Legendary
{ id: 'iron_golem', rarity: 'legendary', description: 'A protective iron golem' }
{ id: 'snow_golem', rarity: 'legendary', description: 'A friendly snowman golem' }
{ id: 'allay', rarity: 'legendary', description: 'A magical blue allay fairy' }
{ id: 'warden', rarity: 'legendary', description: 'A mysterious dark warden' }
{ id: 'ender_dragon', rarity: 'legendary', description: 'The mighty black ender dragon' }

// Can add seasonal/themed pets:
// { id: 'reindeer', rarity: 'epic', description: 'A festive holiday reindeer' }
// { id: 'dragon_boat', rarity: 'legendary', description: 'A dragon boat spirit' }
```

### Rarity Visual Effects
| Rarity | Effect |
|--------|--------|
| common | "simple clean appearance" |
| rare | "soft magical aura around the pet" |
| epic | "purple mystical aura with subtle particles" |
| legendary | "golden legendary glow with sparkles and magical particles" |

### Pet Prompt Template
```
Generate a Minecraft 8-bit pixel art pet companion icon.

Subject: {pet_description}
Style Requirements:
- Authentic Minecraft 8-bit/16-bit pixel art style
- Cute chibi-like proportions (big head, small body)
- {rarity_effect}
- Friendly expression (even hostile mobs should look cute)
- Clean blocky pixels, no anti-aliasing
- Transparent or gradient dark background
- Single pet centered, filling 70% of frame
- NO text, NO labels
```

## Storage Paths

```
supabase-storage/
├── images/
│   ├── vocab/
│   │   ├── baju_1234567890.png
│   │   ├── roti_1234567891.png
│   │   └── ...
│   ├── equipment/
│   │   ├── leather_helmet.png
│   │   ├── iron_sword.png
│   │   └── ...
│   └── pets/
│       ├── chicken.png
│       ├── wolf.png
│       └── ...
└── avatars/
    ├── {kid_id}_1234567890.png
    └── ...
```

## Admin UI for Image Generation

**File**: `src/app/[locale]/admin/generate-images/page.tsx`

Features:
- Batch size control (1-10)
- Start index selection
- Progress visualization
- Color-coded status (green=done, red=error, yellow=in-progress)
- Generated image preview grid

## Best Practices

1. **Rate Limiting**: Adds 2-3 second delays between API calls
2. **Error Handling**: Implements retries with exponential backoff
3. **Image Validation**: Checks generated images have actual content
4. **Storage Cleanup**: Removes failed/incomplete uploads
5. **Naming Convention**: Uses `{word}_{timestamp}.png` for uniqueness

## Troubleshooting

### Generation Fails
- Checks Gemini API key is valid
- Verifies rate limits not exceeded
- Tries fallback model (2.5 Flash)

### Wrong Style Generated
- Be more specific in prompt
- Adds negative prompts ("NOT photorealistic")
- Specifies exact pixel art requirements

### Storage Upload Fails
- Checks Supabase service role key
- Verifies bucket exists and is public
- Checks file size limits

## Related Skills

- **managing-course-syllabi**: Activities need vocabulary images
- **generating-equipment**: Uses similar pixel art generation
- **generating-voice-tutorials**: Audio pairs with visual content
