---
name: generating-equipment
description: Generates Minecraft-style equipment items for the MYLearnt gamification system. Creates new armor pieces, weapons, and accessories for player characters. Handles equipment tiers (leather to diamond), slots (helmet, chestplate, leggings, boots, weapon), rarity levels, and AI image generation. Equipment serves as rewards for completing learning activities.
---

# Generating Equipment

Creates Minecraft-themed equipment items for the MYLearnt reward system.

## Quick Start

### Most Common Task: Add a New Equipment Item

```sql
-- 1. Insert the equipment record
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level)
VALUES (
  'ruby_helmet',
  'Topi Keledar Delima',
  '红宝石头盔',
  'Ruby Helmet',
  'helmet',
  'gold',
  'epic',
  15
) RETURNING id;

-- 2. Generate image via API (or manually upload)
-- POST /api/generate-equipment with the equipment details

-- 3. Update with image URL
UPDATE equipment SET image_url = 'images/equipment/ruby_helmet.png' WHERE name = 'ruby_helmet';
```

### Quick Reference: Tier → Rarity → Level
| Tier | Rarity | Level Range | Color |
|------|--------|-------------|-------|
| leather | common | 1-5 | Brown |
| chain | common | 6-10 | Gray |
| iron | rare | 11-15 | Silver |
| gold | epic | 16-20 | Gold |
| diamond | legendary | 21+ | Cyan |

---

## Degrees of Freedom

| Area | Freedom Level | Guidelines |
|------|---------------|------------|
| **New Equipment Concepts** | 🟢 High | Creates themed equipment sets (holidays, subjects, achievements). Can propose creative new items like "Graduation Cap" or "Math Crown". |
| **Visual Styling** | 🟢 High | Designs unique appearances within Minecraft pixel art style. Can vary colors, add thematic elements. |
| **Naming Creativity** | 🟢 High | Invents creative names in all 3 languages. Should be kid-friendly and thematic. |
| **Tier Assignment** | 🟡 Medium | Follows tier progression guidelines. Can adjust based on context. |
| **Rarity Mapping** | 🟡 Medium | Generally follows tier→rarity mapping. Can elevate for special items. |
| **Database Schema** | 🔴 Low | Does not modify table structures. Uses existing fields only. |
| **Slot Types** | 🔴 Low | Limited to: helmet, chestplate, leggings, boots, weapon. |

---

## Equipment System Overview

Equipment motivates learners by providing visual character upgrades as rewards for completing activities.

### Slot Types
- `helmet` - Head armor
- `chestplate` - Body armor
- `leggings` - Leg armor
- `boots` - Foot armor
- `weapon` - Held weapon (sword, axe, etc.)

### Tier Progression
| Tier | Color/Material | Required Level | Rarity |
|------|---------------|----------------|--------|
| leather | Brown leather | 1-5 | common |
| chain | Gray chainmail | 6-10 | common |
| iron | Silver metal | 11-15 | rare |
| gold | Golden | 16-20 | epic |
| diamond | Cyan crystal | 21+ | legendary |

### Rarity System
- `common` - Basic items, no special effects
- `rare` - Slight glow, better stats
- `epic` - Purple aura, magical appearance
- `legendary` - Golden glow with sparkles

## Database Schema

### equipment table
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- Internal identifier (e.g., 'iron_helmet')
  name_ms TEXT NOT NULL,           -- Malay display name
  name_zh TEXT NOT NULL,           -- Chinese display name
  name_en TEXT NOT NULL,           -- English display name
  slot TEXT NOT NULL,              -- helmet|chestplate|leggings|boots|weapon
  tier TEXT NOT NULL,              -- leather|chain|iron|gold|diamond
  rarity TEXT DEFAULT 'common',    -- common|rare|epic|legendary
  image_url TEXT,                  -- Supabase storage URL
  required_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Related Tables
- `kid_inventory` - Equipment owned by kids
- `kid_equipped` - Currently equipped items per slot
- `activities.equipment_reward_id` - Links activity completion to equipment reward

## Standard Equipment Set

The base game includes 25 items (5 tiers × 5 slots):

```
leather_helmet, leather_chestplate, leather_leggings, leather_boots, wooden_sword
chain_helmet, chain_chestplate, chain_leggings, chain_boots, stone_sword
iron_helmet, iron_chestplate, iron_leggings, iron_boots, iron_sword
gold_helmet, gold_chestplate, gold_leggings, gold_boots, gold_sword
diamond_helmet, diamond_chestplate, diamond_leggings, diamond_boots, diamond_sword
```

## Creating New Equipment

### Step 1: Defines Equipment Properties

```sql
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level)
VALUES (
  'emerald_helmet',
  'Topi Keledar Zamrud',
  '翡翠头盔',
  'Emerald Helmet',
  'helmet',
  'diamond',
  'legendary',
  25
);
```

### Step 2: Generates Equipment Image

Uses the API endpoint to generate Minecraft-style pixel art:

**Endpoint**: `POST /api/generate-equipment`

The API uses this prompt structure for Gemini AI:
```
Generate a Minecraft-style pixel art equipment icon.
Subject: {tier} {material} {slot_description}
Style: {slot_specific_style}
Style Requirements:
- Authentic Minecraft 8-bit/16-bit pixel art style
- Clean blocky pixels, no anti-aliasing
- {tier_color} color palette
- Item shown as inventory icon (like in Minecraft inventory)
- Transparent or solid dark background
- Single item centered, filling 80% of frame
- NO text, NO labels
```

### Step 3: Uploads Image to Storage

Images are stored in Supabase at:
```
images/equipment/{equipment_id}.png
```

### Step 4: Updates Equipment Record

```sql
UPDATE equipment
SET image_url = 'images/equipment/{equipment_id}.png'
WHERE id = '{equipment_id}';
```

## Custom Equipment Ideas

### Special Event Equipment (🟢 High Freedom)
```javascript
// Halloween Set
{ name: 'pumpkin_helmet', tier: 'gold', rarity: 'epic', slot: 'helmet' }
{ name: 'skeleton_chestplate', tier: 'iron', rarity: 'rare', slot: 'chestplate' }

// Chinese New Year Set
{ name: 'dragon_helmet', tier: 'diamond', rarity: 'legendary', slot: 'helmet' }
{ name: 'jade_sword', tier: 'diamond', rarity: 'legendary', slot: 'weapon' }

// Back to School Set
{ name: 'graduation_cap', tier: 'leather', rarity: 'common', slot: 'helmet' }
{ name: 'pencil_sword', tier: 'chain', rarity: 'rare', slot: 'weapon' }

// Hari Raya Set
{ name: 'songkok_helmet', tier: 'gold', rarity: 'epic', slot: 'helmet' }
{ name: 'ketupat_chestplate', tier: 'gold', rarity: 'epic', slot: 'chestplate' }
```

### Subject-Themed Equipment (🟢 High Freedom)
```javascript
// Math Master Set
{ name: 'calculator_helmet', tier: 'iron', slot: 'helmet' }
{ name: 'protractor_sword', tier: 'iron', slot: 'weapon' }

// Language Arts Set
{ name: 'book_helmet', tier: 'chain', slot: 'helmet' }
{ name: 'quill_sword', tier: 'chain', slot: 'weapon' }

// Science Set
{ name: 'lab_goggles', tier: 'iron', slot: 'helmet' }
{ name: 'beaker_weapon', tier: 'iron', slot: 'weapon' }
```

## Image Generation Prompt Templates

### Helmet
```
{tier_color} {material} helmet/head armor that covers the head
Style: protective helmet with {tier_specific} details
```

### Chestplate
```
{tier_color} {material} chestplate/body armor
Style: protective torso armor with {tier_specific} plating
```

### Leggings
```
{tier_color} {material} leggings/leg armor
Style: protective leg armor pants with {tier_specific} details
```

### Boots
```
{tier_color} {material} boots/shoes that cover feet
Style: armor boots with {tier_specific} details
```

### Weapon (Sword)
```
{tier_color} {material} sword/blade weapon
Style: Minecraft-style sword with handle and {tier_specific} blade
```

## Tier-Specific Details

| Tier | Material Description | Color Palette | Special Effects |
|------|---------------------|---------------|-----------------|
| leather | "warm brown leather with visible stitching" | Brown, tan | None |
| chain | "interlocking metal rings, chainmail texture" | Gray, silver | None |
| iron | "polished steel plates with rivets" | Silver, metallic | Slight shine |
| gold | "ornate golden metal with engravings" | Gold, yellow | Warm glow |
| diamond | "crystalline blue diamond facets" | Cyan, blue | Magical shimmer |

## Linking Equipment to Activities

Sets `equipment_reward_id` when creating activities:

```sql
-- First, creates the equipment
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level)
VALUES ('bronze_medal', 'Pingat Gangsa', '铜牌', 'Bronze Medal', 'chestplate', 'leather', 'common', 1)
RETURNING id;

-- Then links to activity
UPDATE activities
SET equipment_reward_id = '{returned_id}'
WHERE id = '{activity_id}';
```

## Best Practices

1. **Balanced Progression**: Does not give diamond gear for easy activities
2. **Thematic Consistency**: Matches equipment to subject/theme when possible
3. **Visual Variety**: Varies colors and styles within same tier
4. **Localized Names**: Always provides ms, zh, en translations
5. **Level Requirements**: Higher tiers require higher kid levels

## API Reference

### Generate Equipment Images

**File**: `src/app/api/generate-equipment/route.ts`

```typescript
// Request
POST /api/generate-equipment
{
  startIndex: number,  // Position in equipment list
  count: number        // Batch size (1-5 recommended)
}

// Response
{
  success: boolean,
  generated: number,
  results: [
    { id: string, name: string, image_url: string, success: boolean }
  ]
}
```

## Storage Structure

```
supabase-storage/
└── images/
    └── equipment/
        ├── leather_helmet.png
        ├── leather_chestplate.png
        ├── iron_sword.png
        └── ...
```

### Image URL Format

**Supabase Storage Base URL:**
```
https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images
```

**Full Equipment Image URL Pattern:**
```
https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/equipment/{equipment_name}.png
```

**Examples:**
- Leather Boots: `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/equipment/leather_boots.png`
- Iron Helmet: `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/equipment/iron_helmet.png`
- Diamond Sword: `https://glwxvgxgquwfgwbwqbiz.supabase.co/storage/v1/object/public/images/equipment/diamond_sword.png`

**Database `image_url` Column:**
Store the relative path in the database (the app constructs the full URL):
```sql
-- Store relative path
UPDATE equipment SET image_url = '/equipment/leather_boots.png' WHERE name = 'leather_boots';

-- The app automatically constructs:
-- {SUPABASE_URL}/storage/v1/object/public/images/equipment/leather_boots.png
```

**Environment Variable:**
The Supabase URL is available via `process.env.NEXT_PUBLIC_SUPABASE_URL`

## Related Skills

- **managing-course-syllabi**: Links equipment as activity rewards
- **generating-images**: Uses similar AI image generation patterns
