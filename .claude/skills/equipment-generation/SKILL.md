---
name: equipment-generation
description: Generate new Minecraft-style equipment items for the MYLearnt gamification system. Use this skill when asked to create new armor pieces, weapons, or accessories for player characters. Handles equipment tiers (leather to diamond), slots (helmet, chestplate, leggings, boots, weapon), rarity levels, and AI image generation. Equipment serves as rewards for completing learning activities.
---

# Equipment Generation Skill

This skill guides you through creating Minecraft-themed equipment items for the MYLearnt reward system.

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

### Step 1: Define Equipment Properties

```sql
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level)
VALUES (
  'emerald_helmet',
  'Topi Keledar Zamrud',
  '翡翠头盔',
  'Emerald Helmet',
  'helmet',
  'diamond',  -- Using diamond tier for emerald (highest)
  'legendary',
  25
);
```

### Step 2: Generate Equipment Image

Use the API endpoint to generate Minecraft-style pixel art:

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

### Step 3: Upload Image to Storage

Images are stored in Supabase at:
```
images/equipment/{equipment_id}.png
```

### Step 4: Update Equipment Record

```sql
UPDATE equipment
SET image_url = 'images/equipment/{equipment_id}.png'
WHERE id = '{equipment_id}';
```

## Custom Equipment Ideas

### Special Event Equipment
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
```

### Subject-Themed Equipment
```javascript
// Math Master Set
{ name: 'calculator_helmet', tier: 'iron', slot: 'helmet' }
{ name: 'protractor_sword', tier: 'iron', slot: 'weapon' }

// Language Arts Set
{ name: 'book_helmet', tier: 'chain', slot: 'helmet' }
{ name: 'quill_sword', tier: 'chain', slot: 'weapon' }
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

Set `equipment_reward_id` when creating activities:

```sql
-- First, create the equipment
INSERT INTO equipment (name, name_ms, name_zh, name_en, slot, tier, rarity, required_level)
VALUES ('bronze_medal', 'Pingat Gangsa', '铜牌', 'Bronze Medal', 'chestplate', 'leather', 'common', 1)
RETURNING id;

-- Then link to activity
UPDATE activities
SET equipment_reward_id = '{returned_id}'
WHERE id = '{activity_id}';
```

## Best Practices

1. **Balanced Progression**: Don't give diamond gear for easy activities
2. **Thematic Consistency**: Match equipment to subject/theme when possible
3. **Visual Variety**: Vary colors and styles within same tier
4. **Localized Names**: Always provide ms, zh, en translations
5. **Level Requirements**: Higher tiers should require higher kid levels

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

## Related Skills

- **course-syllabus**: Link equipment as activity rewards
- **image-generation**: Similar AI image generation patterns
